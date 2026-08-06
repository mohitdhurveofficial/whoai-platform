import os
import time
import uuid
import json
import jwt
import asyncio
import logging
from decimal import Decimal
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
from runtime.telemetry.anomaly_detector import detect_anomalies
from runtime.budget.budget_service import (
    AGENT_DAILY_LIMIT_EXCEEDED, ORG_DAILY_LIMIT_EXCEEDED,
    check_agent_budget, check_org_budget,
    pre_reserve_agent_budget, pre_reserve_org_budget,
    adjust_agent_budget, adjust_org_budget,
    release_agent_budget, release_org_budget,
)
from runtime.killswitch.kill_switch_service import (
    DAILY_BUDGET_EXCEEDED,
    MONTHLY_BUDGET_EXCEEDED,
    check_agent_state,
    check_org_state,
    pause_agent,
    pause_organization,
)
from runtime.entitlements.plans import monthly_request_quota, normalize_tier
from runtime.entitlements.quota_service import (
    PLAN_REQUEST_QUOTA_EXCEEDED,
    release_request_quota,
    reserve_request_quota,
)

from runtime.providers.provider_factory import ProviderFactory
from runtime.encryption import decrypt

router = APIRouter()

logger = logging.getLogger("whoai.gateway")


async def _run_anomaly_detection(org_id: str, agent_id: str) -> None:
    """Detached runaway/anomaly detection. Runs after telemetry is committed so
    it reads freshly persisted daily metrics. Owns its own session and swallows
    every error: detection must never block or break the request path.
    """
    try:
        async with async_session_maker() as adb:
            await detect_anomalies(adb, agent_id, org_id)
    except Exception as e:
        logger.warning(f"Anomaly detection failed for agent {agent_id}: {e}")

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

def _estimate_request_cost(model: str, messages: list, payload_size: int) -> Decimal:
    """
    Conservative pre-request cost estimate for atomic budget reservation.
    Input tokens from payload size; output estimated as 2x input (common case).
    Unknown models estimate $0 — pre-reservation becomes a no-op.
    """
    from runtime.telemetry.pricing import calculate_cost
    est_tokens_in = max(1, payload_size // 4)
    est_tokens_out = est_tokens_in * 2
    return calculate_cost(model, est_tokens_in, est_tokens_out)


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
    start_time: float,
    estimated_cost: Decimal = Decimal("0"),
) -> AsyncGenerator[str, None]:

    tokens_out = 0
    tokens_in = 0
    status_code = 200
    real_usage: Optional[Dict[str, int]] = None

    try:
        async for chunk in stream:
            # OpenAI / Anthropic may include usage in the final chunk
            usage = chunk.get("usage")
            if usage:
                real_usage = usage

            choices = chunk.get("choices", [])
            if choices:
                delta = choices[0].get("delta", {}).get("content", "")
                if delta:
                    # Fallback estimate only if no real usage received yet
                    if not real_usage:
                        tokens_out += max(1, len(delta) // 4)
            yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"
    except BaseException as e:
        status_code = 499 if isinstance(e, asyncio.CancelledError) else 500
        raise
    finally:
        latency_ms = int((time.time() - start_time) * 1000)

        # Prefer real usage from provider's final chunk over estimates.
        if real_usage:
            tokens_in = real_usage.get("prompt_tokens", real_usage.get("input_tokens", 0))
            tokens_out = real_usage.get("completion_tokens", real_usage.get("output_tokens", 0))
        else:
            tokens_in = payload_size // 4

        total_tokens = tokens_in + tokens_out
        cost = calculate_cost(model, tokens_in, tokens_out)

        async def _save_telemetry():
            async with async_session_maker() as telemetry_db:
                # Adjust pre-reserved budget to actual (or release on failure).
                if status_code == 200:
                    await adjust_agent_budget(telemetry_db, agent_id, cost, estimated_cost)
                    await adjust_org_budget(telemetry_db, org_id, cost, estimated_cost)
                else:
                    await release_agent_budget(telemetry_db, agent_id, estimated_cost)
                    await release_org_budget(telemetry_db, org_id, estimated_cost)
                    # A stream that broke or was cancelled shouldn't burn a
                    # request from the customer's monthly plan allowance.
                    await release_request_quota(telemetry_db, org_id)

                await log_request(telemetry_db, agent_id, org_id, provider, model, payload_size, status_code, latency_ms, request_ip)
                await log_spend(telemetry_db, org_id, agent_id, provider, model, tokens_in, tokens_out, total_tokens, cost)
                await update_daily_metrics(telemetry_db, org_id, agent_id, total_tokens, cost)

                action_status = "SUCCESS" if status_code == 200 else ("CANCELLED" if status_code == 499 else "FAILURE")
                await log_activity(
                    telemetry_db, org_id, ActivityAction.REQUEST_COMPLETED, agent_id, action_status,
                    {"model": model, "provider": provider, "latency_ms": latency_ms, "cost": str(cost)}
                )
                await telemetry_db.commit()

            await _run_anomaly_detection(org_id, agent_id)

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

    # ── Plan Request Quota ──
    # Checked before the budget reservation so an over-quota request costs one
    # UPDATE and needs nothing rolled back. 402 (not 429) is deliberate: this is
    # a plan entitlement the customer can lift by upgrading, not a rate limit
    # they should back off and retry against.
    tier = normalize_tier(getattr(organization, "subscriptionTier", None))
    quota = monthly_request_quota(tier)
    if not await reserve_request_quota(db, org_id, quota):
        await log_activity(
            db, org_id, ActivityAction.REQUEST_BLOCKED, agent_id, "FAILURE",
            {"reason": PLAN_REQUEST_QUOTA_EXCEEDED, "plan": tier, "monthlyRequests": quota},
        )
        await db.commit()
        return JSONResponse(
            status_code=402,
            content={
                "error": "Plan request quota exceeded",
                "reason": PLAN_REQUEST_QUOTA_EXCEEDED,
                "plan": tier,
                "monthlyRequests": quota,
                "upgradeUrl": "/billing",
            },
        )

    # ── Atomic Budget Pre-Reservation ──
    # Compute conservative estimate BEFORE execution so concurrent requests
    # can't all read the same pre-increment spend and blow past the cap.
    estimated_cost = _estimate_request_cost(model, messages, payload_size)

    agent_reserved = await pre_reserve_agent_budget(db, agent_id, estimated_cost)
    if not agent_reserved:
        # The reservation UPDATE only reports that *some* limit blocked it, so
        # re-derive which one — that also records the BudgetViolation alert —
        # then trip the kill switch. Pausing matters: without it every
        # subsequent request pays for a full auth + reservation round-trip
        # before being rejected, and the operator gets no signal that an agent
        # has burned through its budget.
        # Hand back the plan request reserved just above — the request never ran.
        await release_request_quota(db, org_id)
        decision = await check_agent_budget(db, agent, estimated_cost)
        reason = decision["reason"] or AGENT_DAILY_LIMIT_EXCEEDED
        await pause_agent(
            db,
            agent,
            reason=_pause_reason_from_budget(reason),
            budget_limit=decision.get("budgetLimit"),
            current_spend=decision.get("currentSpend"),
        )
        await log_activity(db, org_id, ActivityAction.BUDGET_EXCEEDED, agent_id, "FAILURE",
                           {"reason": reason, "estimatedCost": str(estimated_cost)})
        await db.commit()
        return JSONResponse(
            status_code=402,
            content={"error": "Budget exceeded", "reason": reason},
        )

    org_reserved = await pre_reserve_org_budget(db, org_id, estimated_cost)
    if not org_reserved:
        # Roll back the agent reservation and the plan request before rejecting
        await release_agent_budget(db, agent_id, estimated_cost)
        await release_request_quota(db, org_id)
        decision = await check_org_budget(db, organization, agent_id, estimated_cost)
        reason = decision["reason"] or ORG_DAILY_LIMIT_EXCEEDED
        await pause_organization(
            db,
            organization,
            reason=_pause_reason_from_budget(reason),
            budget_limit=decision.get("budgetLimit"),
            current_spend=decision.get("currentSpend"),
            agent_id=agent_id,
        )
        await log_activity(db, org_id, ActivityAction.BUDGET_EXCEEDED, agent_id, "FAILURE",
                           {"reason": reason, "estimatedCost": str(estimated_cost)})
        await db.commit()
        return JSONResponse(
            status_code=402,
            content={"error": "Budget exceeded", "reason": reason},
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
                    format_stream_response(
                        stream_gen, agent_id, org_id, model, current_provider,
                        ip_address, payload_size, start_time, estimated_cost
                    ),
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

                # Adjust pre-reserved budget from estimate to actual.
                await adjust_agent_budget(db, agent_id, cost, estimated_cost)
                await adjust_org_budget(db, org_id, cost, estimated_cost)

                await log_spend(db, org_id, agent_id, current_provider, model, tokens_in, tokens_out, total_tokens, cost)
                await update_daily_metrics(db, org_id, agent_id, total_tokens, cost)
                await log_activity(
                    db, org_id, ActivityAction.REQUEST_COMPLETED, agent_id, "SUCCESS",
                    {"model": model, "provider": current_provider, "latency_ms": latency_ms, "cost": str(cost)}
                )
                await db.commit()

                asyncio.create_task(_run_anomaly_detection(org_id, agent_id))
                return response
        except Exception as e:
            # A failed attempt is NOT terminal: a fallback provider may still
            # succeed, and its success path reconciles the reservation with
            # adjust_*_budget, which assumes the estimate is still held. So the
            # reservation is kept across attempts and released exactly once
            # below, only if every provider fails. Releasing here instead would
            # leave a fallback-served request charged `cost - estimate`.
            last_error = e
            continue

    # No provider had a usable BYOK key, and none was actually called. Fail
    # closed with a clear, actionable error instead of paying with WHOAI's keys.
    # Release the pre-reserved budget and plan request since no LLM call was made.
    if last_error is None and missing_key_providers:
        await release_agent_budget(db, agent_id, estimated_cost)
        await release_org_budget(db, org_id, estimated_cost)
        await release_request_quota(db, org_id)
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

    # Every provider failed — this is the terminal path, so give back everything
    # reserved up front. The commit is required: get_db() only closes the
    # session, so raising without it would roll back the release and the audit
    # trail for a request the customer was never served.
    latency_ms = int((time.time() - start_time) * 1000)
    await release_agent_budget(db, agent_id, estimated_cost)
    await release_org_budget(db, org_id, estimated_cost)
    await release_request_quota(db, org_id)
    await log_request(db, agent_id, org_id, provider_name, model, payload_size, 502, latency_ms, ip_address)
    await log_activity(db, org_id, ActivityAction.PROVIDER_ERROR, agent_id, "FAILURE", {"reason": str(last_error)})
    await db.commit()
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
