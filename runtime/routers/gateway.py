import os
import time
import uuid
import httpx
import json
import jwt
from typing import Optional, Dict, AsyncGenerator, Any
from decimal import Decimal
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, text
from database.session import get_db
from database.models import Agent, SpendLog, RequestLog, UsageMetrics

router = APIRouter(prefix="/gateway")
GATEWAY_SECRET = os.getenv("GATEWAY_SECRET", "dev_secret")

# Cost per 1k tokens
MODEL_PRICING: Dict[str, Dict[str, float]] = {
    "gpt-4o": {"input": 0.005, "output": 0.015},
    "gpt-4.1": {"input": 0.005, "output": 0.015},
    "gpt-4-turbo": {"input": 0.01, "output": 0.03},
    "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
    "claude-3-5-sonnet-20240620": {"input": 0.003, "output": 0.015},
    "claude-3-opus-20240229": {"input": 0.015, "output": 0.075},
    "claude-3-haiku-20240307": {"input": 0.00025, "output": 0.00125},
}

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

def calculate_cost(model: str, tokens_in: int, tokens_out: int) -> Decimal:
    pricing = MODEL_PRICING.get(model, MODEL_PRICING["gpt-4o"]) # fallback
    cost_in = (tokens_in / 1000) * pricing["input"]
    cost_out = (tokens_out / 1000) * pricing["output"]
    return Decimal(str(cost_in + cost_out))

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

async def log_spend(
    db: AsyncSession,
    agent_id: str,
    org_id: str,
    provider: str,
    model: str,
    tokens_in: int,
    tokens_out: int,
    cost: Decimal
):
    spend_log = SpendLog(
        id=str(uuid.uuid4()),
        agentId=agent_id,
        organizationId=org_id,
        model=model,
        provider=provider,
        tokensIn=tokens_in,
        tokensOut=tokens_out,
        cost=cost
    )
    db.add(spend_log)
    
    # Update Daily Spend
    await db.execute(
        update(Agent).where(Agent.id == agent_id).values(
            currentDailySpend=Agent.currentDailySpend + cost
        )
    )

    # Usage Metrics tracking
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(UsageMetrics).where(
            UsageMetrics.agentId == agent_id,
            UsageMetrics.date == today
        )
    )
    metric = result.scalar_one_or_none()
    if metric:
        metric.totalRequests += 1
        metric.totalTokens += (tokens_in + tokens_out)
        metric.totalCost += cost
    else:
        metric = UsageMetrics(
            id=str(uuid.uuid4()),
            agentId=agent_id,
            organizationId=org_id,
            date=today,
            totalRequests=1,
            totalTokens=(tokens_in + tokens_out),
            totalCost=cost
        )
        db.add(metric)

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
        
        # Log request
        await log_request(db, agent_id, org_id, provider, model, payload_size, status_code, latency_ms, request_ip)

        if status_code == 200:
            tokens_in = payload_size // 4 # Basic estimation for input tokens in stream mode
            tokens_out = len(full_content) // 4 # Basic estimation
            cost = calculate_cost(model, tokens_in, tokens_out)
            await log_spend(db, agent_id, org_id, provider, model, tokens_in, tokens_out, cost)

@router.post("/openai/chat/completions")
@router.post("/anthropic/messages")
@router.post("/completions")
async def proxy_llm_request(
    request: Request,
    identity: dict = Depends(verify_agent_identity),
    db: AsyncSession = Depends(get_db)
):
    start_time = time.time()
    ip_address = request.client.host if request.client else "unknown"
    
    raw_body = await request.body()
    payload_size = len(raw_body)
    
    try:
        body = json.loads(raw_body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    model = body.get("model", "gpt-4o")
    stream = body.get("stream", False)
    
    # Determine Provider
    provider = "anthropic" if "claude" in model.lower() else "openai"
    
    # Validate Agent & Budget
    agent_id = identity["sub"]
    org_id = identity["org"]
    
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalar_one_or_none()
    
    if not agent or agent.status != "ACTIVE":
        raise HTTPException(status_code=403, detail="Agent Inactive or Quarantined")

    if agent.dailyBudget > 0 and agent.currentDailySpend >= agent.dailyBudget:
        raise HTTPException(status_code=402, detail="Daily Budget Exceeded")

    # Routing
    if provider == "openai":
        url = "https://api.openai.com/v1/chat/completions"
        api_key = os.getenv("OPENAI_API_KEY")
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    else:
        url = "https://api.anthropic.com/v1/messages"
        api_key = os.getenv("ANTHROPIC_API_KEY")
        headers = {
            "x-api-key": api_key or "",
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        
        if "max_tokens" not in body:
            body["max_tokens"] = 1024 # Anthropic requires max_tokens
        
        # Anthropic messages format mapping if needed
        # We assume standard Anthropic format passed by client or proxy if using unified wrapper
    
    if not api_key:
        raise HTTPException(status_code=500, detail=f"Missing API key for provider {provider}")

    client = httpx.AsyncClient()
    
    try:
        if stream:
            # Handle Streaming Request
            req = client.build_request("POST", url, json=body, headers=headers, timeout=60.0)
            response = await client.send(req, stream=True)
            return StreamingResponse(
                stream_proxy(response, agent_id, org_id, model, provider, db, ip_address, payload_size, start_time),
                media_type="text/event-stream"
            )

        # Handle Standard Request
        response = await client.post(url, json=body, headers=headers, timeout=60.0)
        status_code = response.status_code
        latency_ms = int((time.time() - start_time) * 1000)
        
        # 1. Log the Request
        await log_request(db, agent_id, org_id, provider, model, payload_size, status_code, latency_ms, ip_address)
        
        if status_code != 200:
            # Attempt to parse provider error
            return Response(content=response.text, status_code=status_code)

        res_json = response.json()
        
        # 2. Extract Token Usage
        tokens_in = 0
        tokens_out = 0
        if provider == "openai":
            usage = res_json.get("usage", {})
            tokens_in = usage.get("prompt_tokens", 0)
            tokens_out = usage.get("completion_tokens", 0)
        elif provider == "anthropic":
            usage = res_json.get("usage", {})
            tokens_in = usage.get("input_tokens", 0)
            tokens_out = usage.get("output_tokens", 0)
            
        cost = calculate_cost(model, tokens_in, tokens_out)
        
        # 3. Log Spend and Metrics
        await log_spend(db, agent_id, org_id, provider, model, tokens_in, tokens_out, cost)

        return res_json

    except httpx.RequestError as e:
        latency_ms = int((time.time() - start_time) * 1000)
        await log_request(db, agent_id, org_id, provider, model, payload_size, 502, latency_ms, ip_address)
        raise HTTPException(status_code=502, detail=f"Provider connection error: {str(e)}")
