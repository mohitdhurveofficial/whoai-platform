from fastapi import Security, HTTPException, status, Depends
from fastapi.security import APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.session import get_db
from database.models import Agent

api_key_header = APIKeyHeader(
    name="X-API-Key",
    auto_error=False
)


async def verify_api_key(
    api_key: str = Security(api_key_header),
    db: AsyncSession = Depends(get_db)
):

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key"
        )

    result = await db.execute(
        select(Agent).where(
            Agent.apiKey == api_key
        )
    )

    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )

    return agent