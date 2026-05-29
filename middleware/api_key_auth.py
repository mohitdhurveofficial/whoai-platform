from fastapi import Header, HTTPException, Depends
import logging
from sqlalchemy import select, true
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import APIKey
from database.session import get_db

logger = logging.getLogger(__name__)


async def verify_api_key(
    x_api_key: str = Header(
        None,
        alias="X-API-Key"
    ),
    db: AsyncSession = Depends(get_db),
):
    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="Missing API key",
        )

    logger.warning(f"API KEY RECEIVED: {x_api_key}")

    result = await db.execute(
        select(APIKey).where(
            APIKey.api_key == x_api_key,
            APIKey.is_active == true(),
        )
    )

    logger.warning("API key database lookup executed")
    api_key = result.scalar_one_or_none()

    if not api_key:
        logger.warning("API key lookup failed")
        raise HTTPException(
            status_code=401,
            detail="" \
            "Invalid API key",
        )

    logger.warning("API key validated successfully")
    # Return the validated API key record for downstream endpoints.
    return api_key
