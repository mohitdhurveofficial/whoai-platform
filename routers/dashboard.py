from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import (
    Agent,
    Policy,
    APIKey,
    Approval,
    Decision,
)
from database.session import get_db

router = APIRouter(
    prefix="/api/v1",
    tags=["dashboard"],
)


@router.get("/dashboard/overview")
async def dashboard_overview(
    db: AsyncSession = Depends(get_db)
):
    agents = (
        await db.execute(
            select(func.count()).select_from(Agent)
        )
    ).scalar() or 0

    policies = (
        await db.execute(
            select(func.count()).select_from(Policy)
        )
    ).scalar() or 0

    api_keys = (
        await db.execute(
            select(func.count()).select_from(APIKey)
        )
    ).scalar() or 0

    approvals = (
        await db.execute(
            select(func.count()).select_from(Approval)
        )
    ).scalar() or 0

    decisions = (
        await db.execute(
            select(func.count()).select_from(Decision)
        )
    ).scalar() or 0

    health_score = 100
    security_score = 100

    policy_coverage = (
        int((policies / agents) * 100)
        if agents > 0
        else 100
    )

    if policy_coverage > 100:
        policy_coverage = 100

    risk_score = max(
        0,
        100 - policies
    )

    return {
        "agents": agents,
        "policies": policies,
        "api_keys": api_keys,
        "approvals": approvals,
        "decisions": decisions,
        "health_score": health_score,
        "security_score": security_score,
        "policy_coverage": policy_coverage,
        "risk_score": risk_score,
    }