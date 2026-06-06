import os
import time
import uuid
import httpx
import json
import jwt
from typing import Optional, Dict, AsyncGenerator, Any
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.session import get_db
from database.models import Agent, Organization, RequestLog

# Telemetry Subsystem Imports
from runtime.telemetry.cost_calculator import calculate_cost
from runtime.telemetry.token_counter import extract_tokens, estimate_tokens
from runtime.telemetry.spend_logger import log_spend
from runtime.telemetry.activity_logger import log_activity, ActivityAction
from runtime.telemetry.metrics_service import update_daily_metrics
from runtime.budget.budget_service import check_agent_budget, check_org_budget
from runtime.killswitch.kill_switch_service import (
    DAILY_BUDGET_EXCEEDED,
    MONTHLY_BUDGET_EXCEEDED,
    check_agent_state,
    check_org_state,
    pause_agent,
    pause_organization,
)

router = APIRouter(prefix="/gateway")
GATEWAY_SECRET = os.getenv("GATEWAY_SECRET", "dev_secret")


def _pause_reason_from_budget(reason: Optional[str]) -> str:
    if reason and "MONTHLY" in reason:
        return MONTHLY_BUDGET_EXCEEDED
    return DAILY_BUDGET_EXCEEDED

async def verify_agent_identity(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, GATEWAY_SECRET, algorithms=["HS256"])
        if "sub" not in payload or "org" not in payload:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def log_request(
    db: AsyncSession, 
    agent_id: str, 
    org_id: str, 
    provider: str, 
    model: str, 
    payload_size: int, 
    status_code: int, 
    latency_ms: int,
    ip_address: str
):
    req_log = RequestLog(
        id=str(uuid.uuid4()),
        agentId=agent_id,
        organizationId=org_id,
        provider=provider,
        model=model,
        requestPayloadSize=payload_size,
        statusCode=status_code,
        latencyMs=latency_ms,
        ipAddress=ip_address
    )
    db.add(req_log)
    await db.commit()

async def stream_proxy(
    response: httpx.Response, 
    agent_id: str, 
    org_id: str, 
    model: str, 
    provider: str,
    db: AsyncSession,
    request_ip: str,
    payload_size: int,
    start_time: float
) -> AsyncGenerator[str, None]:
    
    full_content = ""
    status_code = response.status_code

    try:
        async for chunk in response.aiter_lines():
            if chunk:
                yield f"{chunk}\n"
                if chunk.startswith("data: "):
                    data_str = chunk[6:]
                    if data_str.strip() != "[DONE]":
                        try:
                            data = json.loads(data_str)
                            if provider == "openai":
                                delta = data["choices"][0].get("delta", {}).get("content", "")
                                if delta:
                                    full_content += delta
                            elif provider == "anthropic":
                                if data.get("type") == "content_block_delta":
                                    delta = data["delta"].get("text", "")
                                    if delta:
                                        full_content += delta
                        except:
                            pass
    finally:
        latency_ms = int((time.time() - start_time) * 1000)
        
        # Log request in RequestLog
        await log_request(db, agent_id, org_id, provider, model, payload_size, status_code, latency_ms, request_ip)

        if status_code == 200:
            # Telemetry Subsystem Integration
            # Estimate tokens for stream
            tokens_in = payload_size // 4
            tokens_out = estimate_tokens(full_content)
            total_tokens = tokens_in + tokens_out
            
            cost = calculate_cost(model, tokens_in, tokens_out)
            
            # Log spend atomically
            await log_spend(db, org_id, agent_id, provider, model, tokens_in, tokens_out, total_tokens, cost)
            
            # Update metrics safely
            await update_daily_metrics(db, org_id, agent_id, total_tokens, cost)
            
            # Log successful completion
            await log_activity(
                db, org_id, ActivityAction.REQUEST_COMPLETED, agent_id, "SUCCESS",
                {"model": model, "provider": provider, "latency_ms": latency_ms, "cost": str(cost)}
            )
        else:
            await log_activity(
                db, org_id, ActivityAction.PROVIDER_ERROR, agent_id, "FAILURE",
                {"model": model, "provider": provider, "status_code": status_code}
            )

@router.post("/openai/chat/completions")
@router.post("/anthropic/messages")
@router.post("/completions")
async def proxy_llm_request(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    start_time = time.time()
    ip_address = request.client.host if request.client else "unknown"
    
    # Authenticate via Header
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        # Fallback to verify via standard flow if missing
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    try:
        identity = await verify_agent_identity(auth_header)
    except HTTPException as e:
        # Cannot log auth failure easily without org_id, unless we extract it first.
        # Minimal activity logging if we fail auth.
        raise e

    agent_id = identity["sub"]
    org_id = identity["org"]
    
    # 1. Telemetry: Request Received
    await log_activity(db, org_id, ActivityAction.REQUEST_RECEIVED, agent_id, "PENDING", {"ip": ip_address})

    raw_body = await request.body()
    payload_size = len(raw_body)
    
    try:
        body = json.loads(raw_body)
    except Exception:
        await log_activity(db, org_id, ActivityAction.REQUEST_FAILED, agent_id, "FAILURE", {"reason": "Invalid JSON body"})
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    model = body.get("model", "gpt-4o")
    stream = body.get("stream", False)
    provider = "anthropic" if "claude" in model.lower() else "openai"
    
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalar_one_or_none()
    
    if not agent or agent.organizationId != org_id:
        await log_activity(db, org_id, ActivityAction.AUTH_FAILED, agent_id, "FAILURE", {"reason": "Agent not found"})
        await db.commit()
        raise HTTPException(status_code=403, detail="Agent not found")

    org_result = await db.execute(select(Organization).where(Organization.id == org_id))
    organization = org_result.scalar_one_or_none()

    if not organization:
        await log_activity(db, org_id, ActivityAction.AUTH_FAILED, agent_id, "FAILURE", {"reason": "Organization not found"})
        await db.commit()
        raise HTTPException(status_code=403, detail="Organization not found")

    agent_state_decision = await check_agent_state(db, agent)
    if not agent_state_decision["allowed"]:
        await db.commit()
        return JSONResponse(
            status_code=403,
            content={
    "error": agent_state_decision["error"],
"reason": agent_state_decision["reason"],
},
        )

    org_state_decision = await check_org_state(db, organization, agent_id=agent_id)
    if not org_state_decision["allowed"]:
        await db.commit()
        return JSONResponse(
            status_code=403,
            content={
                "error": org_state_decision["error"],
                "reason": org_state_decision["reason"],
            },
        )

    agent_budget_decision = await check_agent_budget(db, agent)
    if not agent_budget_decision["allowed"]:
        await pause_agent(
            db,
            agent,
            reason=_pause_reason_from_budget(agent_budget_decision["reason"]),
            paused_by="SYSTEM",
            budget_limit=agent_budget_decision.get("budgetLimit"),
            current_spend=agent_budget_decision.get("currentSpend"),
        )
        await db.commit()
        return JSONResponse(
            status_code=402,
            content={
                "error": "Budget exceeded",
                "reason": agent_budget_decision["reason"],
            },
        )

    org_budget_decision = await check_org_budget(db, organization, agent_id=agent_id)
    if not org_budget_decision["allowed"]:
        await pause_organization(
            db,
            organization,
            reason=_pause_reason_from_budget(org_budget_decision["reason"]),
            paused_by="SYSTEM",
            budget_limit=org_budget_decision.get("budgetLimit"),
            current_spend=org_budget_decision.get("currentSpend"),
            agent_id=agent_id,
        )
        await db.commit()
        return JSONResponse(
            status_code=402,
            content={
                "error": "Budget exceeded",
                "reason": org_budget_decision["reason"],
            },
        )

    if provider == "openai":
        url = "https://api.openai.com/v1/chat/completions"
        api_key = os.getenv("OPENAI_API_KEY")
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    else:
        url = "https://api.anthropic.com/v1/messages"
        api_key = os.getenv("ANTHROPIC_API_KEY")
        headers = {"x-api-key": api_key or "", "anthropic-version": "2023-06-01", "content-type": "application/json"}
        if "max_tokens" not in body:
            body["max_tokens"] = 1024
    
    if not api_key:
        await log_activity(db, org_id, ActivityAction.PROVIDER_ERROR, agent_id, "FAILURE", {"reason": "Missing API key"})
        raise HTTPException(status_code=500, detail=f"Missing API key for provider {provider}")

    client = httpx.AsyncClient()
    
    try:
        if stream:
            req = client.build_request("POST", url, json=body, headers=headers, timeout=60.0)
            response = await client.send(req, stream=True)
            return StreamingResponse(
                stream_proxy(response, agent_id, org_id, model, provider, db, ip_address, payload_size, start_time),
                media_type="text/event-stream"
            )

        # Standard Request
        response = await client.post(url, json=body, headers=headers, timeout=60.0)
        status_code = response.status_code
        latency_ms = int((time.time() - start_time) * 1000)
        
        await log_request(db, agent_id, org_id, provider, model, payload_size, status_code, latency_ms, ip_address)
        
        if status_code != 200:
            await log_activity(db, org_id, ActivityAction.PROVIDER_ERROR, agent_id, "FAILURE", {"status_code": status_code})
            return Response(content=response.text, status_code=status_code)

        res_json = response.json()
        
        # 2. Extract Token Usage
        extracted = extract_tokens(provider, res_json)
        tokens_in = extracted["tokens_in"]
        tokens_out = extracted["tokens_out"]
        
        # Fallback extraction if missing
        if tokens_out == 0 and provider == "openai":
            extracted = extract_tokens(provider, res_json, res_json.get("choices", [{}])[0].get("message", {}).get("content", ""))
            tokens_out = extracted["tokens_out"]
        elif tokens_out == 0 and provider == "anthropic":
            extracted = extract_tokens(provider, res_json, res_json.get("content", [{}])[0].get("text", ""))
            tokens_out = extracted["tokens_out"]
            
        total_tokens = extracted["total_tokens"]
        
        # 3. Calculate Cost
        cost = calculate_cost(model, tokens_in, tokens_out)
        
        # 4. Log Spend
        await log_spend(db, org_id, agent_id, provider, model, tokens_in, tokens_out, total_tokens, cost)
        
        # 5. Usage Metrics Update
        await update_daily_metrics(db, org_id, agent_id, total_tokens, cost)
        
        # 6. Request Completed Activity
        await log_activity(
            db, org_id, ActivityAction.REQUEST_COMPLETED, agent_id, "SUCCESS",
            {"model": model, "provider": provider, "latency_ms": latency_ms, "cost": str(cost)}
        )

        return res_json

    except httpx.RequestError as e:
        latency_ms = int((time.time() - start_time) * 1000)
        await log_request(db, agent_id, org_id, provider, model, payload_size, 502, latency_ms, ip_address)
        await log_activity(db, org_id, ActivityAction.PROVIDER_ERROR, agent_id, "FAILURE", {"reason": str(e)})
        raise HTTPException(status_code=502, detail=f"Provider connection error: {str(e)}")
