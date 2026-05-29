from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import AgentMetric

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)


@router.get("/overview")
async def analytics_overview(
    db: AsyncSession = Depends(get_db)
):
    metrics = await db.execute(
        AgentMetric.__table__.select()
    )

    rows = metrics.fetchall()

    total_authorizations = sum(
        row.authorize_count
        for row in rows
    )

    return {
        "total_authorizations": total_authorizations,
        "active_agents": len(rows),
        "avg_authorizations": (
            total_authorizations / len(rows)
            if rows else 0
        )
    }