from datetime import datetime
from secrets import token_urlsafe

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import APIKey
from database.session import get_db

router = APIRouter(
    prefix="/api-keys",
    tags=["api-keys"],
)


@router.post("")
async def create_api_key(
    name: str,
    db: AsyncSession = Depends(get_db)
):
    api_key_value = f"whoai_sk_{token_urlsafe(32)}"

    api_key = APIKey(
        name=name,
        api_key=api_key_value,
        is_active=True,
        created_at=datetime.utcnow(),
    )

    db.add(api_key)

    await db.commit()
    await db.refresh(api_key)

    return {
        "id": api_key.id,
        "name": api_key.name,
        "api_key": api_key.api_key,
        "is_active": api_key.is_active,
        "created_at": api_key.created_at,
    }


@router.get("")
async def list_api_keys(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(APIKey)
    )

    api_keys = result.scalars().all()

    return [
        {
            "id": key.id,
            "name": key.name,
            "api_key": key.api_key,
            "is_active": key.is_active,
            "created_at": key.created_at,
        }
        for key in api_keys
    ]


@router.delete("/{key_id}")
async def delete_api_key(
    key_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(APIKey).where(APIKey.id == key_id)
    )

    api_key = result.scalar_one_or_none()

    if not api_key:
        raise HTTPException(
            status_code=404,
            detail="API key not found"
        )

    await db.delete(api_key)
    await db.commit()

    return {
        "status": "deleted"
    }