

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Agent, Policy, APIKey
from database.session import get_db

router = APIRouter(
    prefix="/api/v1",
    tags=["doctor"],
)


@router.get("/doctor/report")
async def doctor_report(
    db: AsyncSession = Depends(get_db)
):
    agents_count = (
        await db.execute(select(func.count()).select_from(Agent))
    ).scalar() or 0

    policies_count = (
        await db.execute(select(func.count()).select_from(Policy))
    ).scalar() or 0

    api_keys_count = (
        await db.execute(select(func.count()).select_from(APIKey))
    ).scalar() or 0

    health_score = 100
    security_score = 100

    policy_coverage = 100
    if agents_count > 0:
        policy_coverage = min(
            100,
            int((policies_count / agents_count) * 100)
        )

    risk_score = max(
        0,
        100 - policies_count
    )

    issues = []
    recommendations = []

    if policies_count == 0:
        issues.append("No policies configured")
        recommendations.append(
            "Create governance policies"
        )

    if api_keys_count == 0:
        issues.append("No API keys configured")
        recommendations.append(
            "Create at least one API key"
        )

    return {
        "health_score": health_score,
        "security_score": security_score,
        "policy_coverage": policy_coverage,
        "risk_score": risk_score,
        "agents": agents_count,
        "policies": policies_count,
        "api_keys": api_keys_count,
        "issues": issues,
        "recommendations": recommendations,
    }