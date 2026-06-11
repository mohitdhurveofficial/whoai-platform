import os
import time
import uuid
import json
import jwt
import asyncio
from typing import Optional, Dict, AsyncGenerator, Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.session import get_db, async_session_maker
from database.models import Agent, Organization, RequestLog, ProviderCredential

# Telemetry Subsystem Imports
from runtime.telemetry.pricing import calculate_cost
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

from runtime.providers.provider_factory import ProviderFactory
from runtime.encryption import decrypt

router = APIRouter()

# No default: a known fallback secret lets anyone forge agent tokens for any
# tenant. Fail closed so a misconfigured deploy never silently accepts forgeries.
GATEWAY_SECRET = os.getenv("GATEWAY_SECRET")
if not GATEWAY_SECRET:
    raise RuntimeError("GATEWAY_SECRET environment variable is required")


async def get_org_provider_key(db: AsyncSession, org_id: str, provider: str) -> Optional[str]:
    """Return the org's decrypted BYOK key for a provider, or None if the org
    has no usable key for it. Scoped by organizationId so one org can never use
    another org's credential.

    WHOAI is a strict BYOK platform: there is deliberately NO platform-key
    fallback here. A None result means the gateway must fail the request with a
    clear "add your key" error rather than spend WHOAI's own credits.
    """
    result = await db.execute(
        select(ProviderCredential).where(
            ProviderCredential.organizationId == org_id,
            ProviderCredential.provider == provider.lower(),
        )
    )
    credential = result.scalar_one_or_none()
    if not credential or not credential.encryptedApiKey:
        return None
    try:
        return decrypt(credential.encryptedApiKey)
    except Exception:
        # A corrupt/undecryptable credential is treated as "no usable key"; the
        # caller fails closed and prompts the customer to re-enter it.
        return None

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

async def format_stream_response(
    stream: AsyncGenerator[Dict[str, Any], None],
    agent_id: str,
    org_id: str,
    model: str,
    provider: str,
    request_ip: str,
    payload_size: int,
    start_time: float
) -> AsyncGenerator[str, None]:
    
    tokens_out = 0
    status_code = 200
    
    try:
        async for chunk in stream:
            if "choices" in chunk and len(chunk["choices"]) > 0:
                delta = chunk["choices"][0].get("delta", {}).get("content", "")
                if delta:
                    # Very rough approximation for stream tokens
                    tokens_out += max(1, len(delta) // 4)
            yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"
    except BaseException as e:
        status_code = 499 if isinstance(e, asyncio.CancelledError) else 500
        raise
    finally:
        latency_ms = int((time.time() - start_time) * 1000)
        tokens_in = payload_size // 4
        total_tokens = tokens_in + tokens_out
        cost = calculate_cost(model, tokens_in, tokens_out)
        
        async def _save_telemetry():
            # Use a fresh, detached session to ensure telemetry saves even if the
            # request's dependency session was closed upon client disconnection.
            async with async_session_maker() as telemetry_db:
                await log_request(telemetry_db, agent_id, org_id, provider, model, payload_size, status_code, latency_ms, request_ip)
                await log_spend(telemetry_db, org_id, agent_id, provider, model, tokens_in, tokens_out, total_tokens, cost)
                await update_daily_metrics(telemetry_db, org_id, agent_id, total_tokens, cost)
                
                action_status = "SUCCESS" if status_code == 200 else ("CANCELLED" if status_code == 499 else "FAILURE")
                await log_activity(
                    telemetry_db, org_id, ActivityAction.REQUEST_COMPLETED, agent_id, action_status,
                    {"model": model, "provider": provider, "latency_ms": latency_ms, "cost": str(cost)}
                )
                await telemetry_db.commit()

        # Fire and forget to prevent CancelledError from interrupting the save
        asyncio.create_task(_save_telemetry())

async def execute_with_retry(provider_instance, method_name: str, *args, **kwargs):
    max_retries = 3
    base_delay = 1.0
    for attempt in range(max_retries + 1):
        try:
            method = getattr(provider_instance, method_name)
            return await method(*args, **kwargs)
        except Exception as e:
            if attempt == max_retries:
                raise e
            await asyncio.sleep(base_delay * (2 ** attempt))

@router.post("/chat/completions")
@router.post("/gateway/completions")
async def unified_chat_completions(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    start_time = time.time()
    ip_address = request.client.host if request.client else "unknown"
    
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    identity = await verify_agent_identity(auth_header)
    agent_id = identity["sub"]
    org_id = identity["org"]
    
    await log_activity(db, org_id, ActivityAction.REQUEST_RECEIVED, agent_id, "PENDING", {"ip": ip_address})

    raw_body = await request.body()
    payload_size = len(raw_body)
    
    try:
        body = json.loads(raw_body)
    except Exception:
        await log_activity(db, org_id, ActivityAction.REQUEST_FAILED, agent_id, "FAILURE", {"reason": "Invalid JSON body"})
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    provider_name = body.pop("provider", "openai")
    fallback_name = body.pop("fallback", None)
    model = body.pop("model", "gpt-4o")
    stream = body.pop("stream", False)
    messages = body.pop("messages", [])
    
    # Validation
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalar_one_or_none()
    
    if not agent or agent.organizationId != org_id:
        await log_activity(db, org_id, ActivityAction.AUTH_FAILED, agent_id, "FAILURE", {"reason": "Agent not found"})
        raise HTTPException(status_code=403, detail="Agent not found")

    org_result = await db.execute(select(Organization).where(Organization.id == org_id))
    organization = org_result.scalar_one_or_none()
    if not organization:
        await log_activity(db, org_id, ActivityAction.AUTH_FAILED, agent_id, "FAILURE", {"reason": "Organization not found"})
        raise HTTPException(status_code=403, detail="Organization not found")

    # Check Kill Switches
    agent_state_decision = await check_agent_state(db, agent)
    if not agent_state_decision["allowed"]:
        await db.commit()  # persist the REQUEST_BLOCKED audit log
        return JSONResponse(
            status_code=403,
            content={"error": agent_state_decision["error"], "reason": agent_state_decision["reason"]},
        )

    org_state_decision = await check_org_state(db, organization, agent_id=agent_id)
    if not org_state_decision["allowed"]:
        await db.commit()  # persist the REQUEST_BLOCKED audit log
        return JSONResponse(
            status_code=403,
            content={"error": org_state_decision["error"], "reason": org_state_decision["reason"]},
        )

    # Check Budgets
    agent_budget_decision = await check_agent_budget(db, agent)
    if not agent_budget_decision["allowed"]:
        await pause_agent(
            db, agent, reason=_pause_reason_from_budget(agent_budget_decision["reason"]),
            paused_by="SYSTEM", budget_limit=agent_budget_decision.get("budgetLimit"),
            current_spend=agent_budget_decision.get("currentSpend")
        )
        await db.commit()  # persist the auto-pause, alert, and audit log
        return JSONResponse(
            status_code=402,
            content={"error": "Budget exceeded", "reason": agent_budget_decision["reason"]},
        )

    org_budget_decision = await check_org_budget(db, organization, agent_id=agent_id)
    if not org_budget_decision["allowed"]:
        await pause_organization(
            db, organization, reason=_pause_reason_from_budget(org_budget_decision["reason"]),
            paused_by="SYSTEM", budget_limit=org_budget_decision.get("budgetLimit"),
            current_spend=org_budget_decision.get("currentSpend"), agent_id=agent_id
        )
        await db.commit()  # persist the auto-pause, alert, and audit log
        return JSONResponse(
            status_code=402,
            content={"error": "Budget exceeded", "reason": org_budget_decision["reason"]},
        )

    # Routing
    providers_to_try = [provider_name]
    if fallback_name:
        providers_to_try.append(fallback_name)

    last_error = None
    missing_key_providers = []
    for current_provider in providers_to_try:
        # Strict BYOK: the request must run on the org's own provider key. If no
        # usable key is configured for this provider, skip it (a fallback
        # provider may still have one) rather than spending WHOAI's credits.
        byok_key = await get_org_provider_key(db, org_id, current_provider)
        if not byok_key:
            missing_key_providers.append(current_provider)
            continue

        try:
            provider_instance = ProviderFactory.get_provider(current_provider, api_key=byok_key)
            if stream:
                stream_gen = await provider_instance.stream_completion(model, messages, **body)
                return StreamingResponse(
                    format_stream_response(stream_gen, agent_id, org_id, model, current_provider, ip_address, payload_size, start_time),
                    media_type="text/event-stream"
                )
            else:
                response = await execute_with_retry(provider_instance, "chat_completion", model, messages, **body)
                
                latency_ms = int((time.time() - start_time) * 1000)
                await log_request(db, agent_id, org_id, current_provider, model, payload_size, 200, latency_ms, ip_address)
                
                tokens_in = response.get("usage", {}).get("prompt_tokens", 0)
                tokens_out = response.get("usage", {}).get("completion_tokens", 0)
                total_tokens = response.get("usage", {}).get("total_tokens", 0)
                
                cost = calculate_cost(model, tokens_in, tokens_out)
                
                await log_spend(db, org_id, agent_id, current_provider, model, tokens_in, tokens_out, total_tokens, cost)
                await update_daily_metrics(db, org_id, agent_id, total_tokens, cost)
                await log_activity(
                    db, org_id, ActivityAction.REQUEST_COMPLETED, agent_id, "SUCCESS",
                    {"model": model, "provider": current_provider, "latency_ms": latency_ms, "cost": str(cost)}
                )
                # Persist telemetry. Without this commit get_db() closes the
                # session and rolls back the SpendLog, UsageMetrics, completion
                # ActivityLog, and the spend counters — so budgets never see spend.
                await db.commit()

                return response
        except Exception as e:
            last_error = e
            continue

    # No provider had a usable BYOK key, and none was actually called. Fail
    # closed with a clear, actionable error instead of paying with WHOAI's keys.
    if last_error is None and missing_key_providers:
        await log_activity(
            db, org_id, ActivityAction.REQUEST_FAILED, agent_id, "FAILURE",
            {"reason": "BYOK_KEY_MISSING", "providers": missing_key_providers},
        )
        await db.commit()  # persist the audit log
        primary = missing_key_providers[0]
        return JSONResponse(
            status_code=402,
            content={
                "error": f"No {primary} API key configured for your organization",
                "reason": "BYOK_KEY_MISSING",
                "setup": f"Add your {primary} key in Settings → Providers to start routing requests.",
            },
        )

    # If all failed
    latency_ms = int((time.time() - start_time) * 1000)
    await log_request(db, agent_id, org_id, provider_name, model, payload_size, 502, latency_ms, ip_address)
    await log_activity(db, org_id, ActivityAction.PROVIDER_ERROR, agent_id, "FAILURE", {"reason": str(last_error)})
    raise HTTPException(status_code=502, detail=f"Provider connection error: {str(last_error)}")

@router.get("/providers/status")
async def provider_health_checks():
    providers = ["openai", "anthropic", "grok", "deepseek"]
    results = {}
    
    async def check(prov_name):
        try:
            prov = ProviderFactory.get_provider(prov_name)
            status = await prov.health_check()
            results[prov_name] = status
        except Exception:
            results[prov_name] = "unhealthy"

    await asyncio.gather(*(check(p) for p in providers))
    return results
