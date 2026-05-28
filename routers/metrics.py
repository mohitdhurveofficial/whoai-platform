from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.session import get_db
from database.models import AgentMetric

router = APIRouter()


@router.get("/metrics")
async def list_metrics(
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(AgentMetric)
    )

    metrics = result.scalars().all()

    return [
        {
            "agent_id": m.agent_id,
            "authorize_count": m.authorize_count,
            "updated_at": m.updated_at
        }
        for m in metrics
    ]