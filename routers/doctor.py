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

    readiness_score = 100

    critical_issues = []
    warnings = []
    recommendations = []

    if policies_count == 0:
        critical_issues.append(
            "No governance policies configured"
        )
        recommendations.append(
            "Create governance policies"
        )
        readiness_score -= 30

    if api_keys_count == 0:
        critical_issues.append(
            "No API keys configured"
        )
        recommendations.append(
            "Create at least one API key"
        )
        readiness_score -= 20

    if agents_count > policies_count:
        warnings.append(
            "Policy coverage is lower than agent count"
        )
        readiness_score -= 10

    readiness_score = max(0, readiness_score)

    return {
        "health_score": health_score,
        "security_score": security_score,
        "policy_coverage": policy_coverage,
        "risk_score": risk_score,
        "agents": agents_count,
        "policies": policies_count,
        "api_keys": api_keys_count,
        "readiness_score": readiness_score,
        "critical_issues": critical_issues,
        "warnings": warnings,
        "recommendations": recommendations,
    }