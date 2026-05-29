from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from database.session import get_db
from database.models import Decision

from schemas import DecisionResponse

router = APIRouter(
    prefix="/decisions",
    tags=["decisions"],
)


@router.get("", response_model=list[DecisionResponse])
async def list_decisions(
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Decision)
        .order_by(desc(Decision.created_at))
        .limit(limit)
    )

    decisions = result.scalars().all()

    return decisions