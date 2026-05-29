from fastapi import APIRouter, Depends
from sqlalchemy import func, select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import (
    Agent,
    Policy,
    APIKey,
    Approval,
    ApprovalStatus,
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

    approvals_pending = (
        await db.execute(
            select(func.count())
            .select_from(Approval)
            .where(
                Approval.status == ApprovalStatus.PENDING
            )
        )
    ).scalar() or 0

    approvals_approved = (
        await db.execute(
            select(func.count())
            .select_from(Approval)
            .where(
                Approval.status == ApprovalStatus.APPROVED
            )
        )
    ).scalar() or 0

    approvals_rejected = (
        await db.execute(
            select(func.count())
            .select_from(Approval)
            .where(
                Approval.status == ApprovalStatus.REJECTED
            )
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
        "approvals_pending": approvals_pending,
        "approvals_approved": approvals_approved,
        "approvals_rejected": approvals_rejected,
        "decisions": decisions,
        "health_score": health_score,
        "security_score": security_score,
        "policy_coverage": policy_coverage,
        "risk_score": risk_score,
    }


@router.get("/dashboard/recent-activity")
async def recent_activity(
    db: AsyncSession = Depends(get_db)
):
    recent_decisions = (
        await db.execute(
            select(Decision)
            .order_by(desc(Decision.created_at))
            .limit(10)
        )
    ).scalars().all()

    recent_approvals = (
        await db.execute(
            select(Approval)
            .order_by(desc(Approval.created_at))
            .limit(10)
        )
    ).scalars().all()

    recent_agents = (
        await db.execute(
            select(Agent)
            .order_by(desc(Agent.created_at))
            .limit(10)
        )
    ).scalars().all()

    return {
        "recent_decisions": [
            {
                "id": d.id,
                "decision": d.decision,
                "reason": d.reason,
                "created_at": d.created_at,
            }
            for d in recent_decisions
        ],
        "recent_approvals": [
            {
                "id": a.id,
                "status": str(a.status),
                "created_at": a.created_at,
            }
            for a in recent_approvals
        ],
        "recent_agents": [
            {
                "id": a.id,
                "name": a.name,
                "status": str(a.status),
                "created_at": a.created_at,
            }
            for a in recent_agents
        ],
    }