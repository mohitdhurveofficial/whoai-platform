from fastapi import APIRouter, Depends, HTTPException, Header, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import time
import httpx
import os
import json
import uuid

from database.session import get_db, async_session_maker
from database.models import Agent, SpendLog
from lib.actions.pricing import calculate_cost

router = APIRouter(
    prefix="/gateway",
    tags=["gateway"],
)

async def log_spend_background(
    agent_id: str, 
    organization_id: str, 
    model: str, 
    prompt_tokens: int, 
    completion_tokens: int, 
    cost_usd: float
):
    """Persists spend data directly to the database."""
    async with async_session_maker() as db:
        try:
            spend = SpendLog(
                id=f"cuid_{uuid.uuid4().hex[:16]}", 
                organizationId=organization_id, 
                agentId=agent_id, 
                model=model, 
                inputTokens=prompt_tokens,
                outputTokens=completion_tokens,
                totalTokens=prompt_tokens + completion_tokens,
                costUsd=cost_usd
            )
            db.add(spend)
            await db.commit()
        except Exception:
            await db.rollback()

@router.post("/{provider}/{path:path}")
async def proxy_llm_request(
    provider: str,
    path: str,
    request: Request,
    background_tasks: BackgroundTasks,
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid AgentToken.")
    
    agent_token = authorization.split(" ")[1]
    result = await db.execute(select(Agent).where(Agent.agentToken == agent_token))
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent does not exist.")
        
    if agent.status == "SUSPENDED":
        raise HTTPException(status_code=403, detail="Agent is suspended.")

    # Note: actual real-time spend limit check would require sum of SpendLogs for the day/month
    # Omitting real-time DB SUM() here for gateway performance, but we can do a basic check if needed later.

    payload = await request.json()
    is_stream = payload.get("stream", False)
    
    if provider == "openai":
        base_url = "https://api.openai.com"
        api_key = os.getenv("OPENAI_API_KEY")
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        if is_stream and "stream_options" not in payload:
            payload["stream_options"] = {"include_usage": True}
    elif provider == "anthropic":
        base_url = "https://api.anthropic.com"
        api_key = os.getenv("ANTHROPIC_API_KEY")
        headers = {
            "x-api-key": api_key,
            "anthropic-version": request.headers.get("anthropic-version", "2023-06-01"),
            "Content-Type": "application/json"
        }
    else:
        raise HTTPException(status_code=400, detail="Unsupported provider. Use 'openai' or 'anthropic'.")

    target_url = f"{base_url}/{path}"
    model_name = payload.get("model", "unknown")
    
    client = httpx.AsyncClient()
    req = client.build_request("POST", target_url, json=payload, headers=headers, timeout=60.0)
    response = await client.send(req, stream=is_stream)

    if response.status_code >= 400:
        await response.aread()
        await client.aclose()
        raise HTTPException(status_code=response.status_code, detail=response.text)

    if is_stream:
        async def stream_generator():
            prompt_tokens = 0
            comp_tokens = 0
            try:
                async for chunk in response.aiter_lines():
                    if not chunk:
                        continue
                    
                    yield f"{chunk}\n\n"
                    
                    if chunk.startswith("data: "):
                        data_str = chunk[6:]
                        if data_str == "[DONE]":
                            continue
                        try:
                            chunk_json = json.loads(data_str)
                            if "usage" in chunk_json and chunk_json["usage"]:
                                usage = chunk_json["usage"]
                                prompt_tokens = usage.get("prompt_tokens", prompt_tokens)
                                comp_tokens = usage.get("completion_tokens", comp_tokens)
                            
                            if chunk_json.get("type") == "message_start":
                                prompt_tokens = chunk_json.get("message", {}).get("usage", {}).get("input_tokens", 0)
                            elif chunk_json.get("type") == "message_delta":
                                comp_tokens += chunk_json.get("usage", {}).get("output_tokens", 0)
                        except json.JSONDecodeError:
                            pass
            finally:
                await client.aclose()
                cost = calculate_cost(model_name, prompt_tokens, comp_tokens)
                background_tasks.add_task(
                    log_spend_background,
                    agent.id, agent.organizationId, model_name, prompt_tokens, comp_tokens, cost
                )

        return StreamingResponse(stream_generator(), media_type=response.headers.get("content-type"))

    else:
        await response.aread()
        llm_data = response.json()
        await client.aclose()

        prompt_tokens, comp_tokens = 0, 0
        if provider == "openai":
            usage = llm_data.get("usage", {})
            prompt_tokens = usage.get("prompt_tokens", 0)
            comp_tokens = usage.get("completion_tokens", 0)
        elif provider == "anthropic":
            usage = llm_data.get("usage", {})
            prompt_tokens = usage.get("input_tokens", 0)
            comp_tokens = usage.get("output_tokens", 0)

        cost = calculate_cost(model_name, prompt_tokens, comp_tokens)
        
        background_tasks.add_task(
            log_spend_background,
            agent.id, agent.organizationId, model_name, prompt_tokens, comp_tokens, cost
        )

        return llm_data