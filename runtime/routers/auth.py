import hashlib
import time
from typing import Optional

import jwt
from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Agent
from database.session import get_db
from runtime.routers.gateway import GATEWAY_SECRET

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

# Short-lived access tokens; agents re-request a token as needed.
TOKEN_TTL_SECONDS = 3600


class TokenRequest(BaseModel):
    api_key: Optional[str] = None


@router.get("/health")
async def auth_health():
    return {
        "status": "ok",
        "service": "auth",
    }


@router.post("/token")
async def issue_agent_token(
    body: Optional[TokenRequest] = None,
    x_api_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """Exchange a raw agent API key for a short-lived gateway access token.

    The agent key (`whoai_sk_...`) is created in the dashboard and shown once.
    We store only its SHA-256 hash, so we look the agent up by hashing the
    presented key. A valid, ACTIVE agent receives a JWT bound to its own
    organization (`org` claim) — preserving multi-tenant isolation at the
    data plane.
    """
    raw_key: Optional[str] = None
    if body and body.api_key:
        raw_key = body.api_key
    elif x_api_key:
        raw_key = x_api_key
    elif authorization and authorization.startswith("Bearer "):
        raw_key = authorization.split(" ", 1)[1]

    if not raw_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key",
        )

    key_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    result = await db.execute(select(Agent).where(Agent.apiKey == key_hash))
    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )

    if agent.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Agent is {agent.status}",
        )

    now = int(time.time())
    token = jwt.encode(
        {
            "sub": agent.id,
            "org": agent.organizationId,
            "iat": now,
            "exp": now + TOKEN_TTL_SECONDS,
        },
        GATEWAY_SECRET,
        algorithm="HS256",
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": TOKEN_TTL_SECONDS,
    }
