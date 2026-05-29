from fastapi import Header, HTTPException, Depends
from sqlalchemy import select, true
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import APIKey
from database.session import get_db


async def verify_api_key(
    x_api_key: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="Missing API key",
        )

    result = await db.execute(
        select(APIKey).where(
            APIKey.api_key == x_api_key,
            APIKey.is_active == true(),
        )
    )

    api_key = result.scalar_one_or_none()

    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key",
        )

    # Return the validated API key record for downstream endpoints.
    return api_key
