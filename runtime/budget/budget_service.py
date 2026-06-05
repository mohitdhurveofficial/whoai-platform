import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import ActivityLog, Agent, Alert, Organization, SpendLog


AGENT_DAILY_LIMIT_EXCEEDED = "AGENT_DAILY_LIMIT_EXCEEDED"
AGENT_MONTHLY_LIMIT_EXCEEDED = "AGENT_MONTHLY_LIMIT_EXCEEDED"
ORG_DAILY_LIMIT_EXCEEDED = "ORG_DAILY_LIMIT_EXCEEDED"
ORG_MONTHLY_LIMIT_EXCEEDED = "ORG_MONTHLY_LIMIT_EXCEEDED"

WARNING_THRESHOLD = Decimal("0.75")
CRITICAL_THRESHOLD = Decimal("0.90")
BLOCKED_THRESHOLD = Decimal("1.00")


def _money(value: Any) -> Decimal:
    if value is None:
        return Decimal("0")
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def _period_start(period: str) -> datetime:
    now = datetime.utcnow()
    if period == "month":
        return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


async def _calculate_spend(
    db: AsyncSession,
    *,
    organization_id: str,
    period: str,
    agent_id: Optional[str] = None,
) -> Decimal:
    query = select(func.coalesce(func.sum(SpendLog.cost), 0)).where(
        SpendLog.organizationId == organization_id,
        SpendLog.createdAt >= _period_start(period),
    )

    if agent_id:
        query = query.where(SpendLog.agentId == agent_id)

    result = await db.execute(query)
    return _money(result.scalar())


async def calculate_agent_daily_spend(db: AsyncSession, agent_id: str, organization_id: str) -> Decimal:
    return await _calculate_spend(db, organization_id=organization_id, agent_id=agent_id, period="day")


async def calculate_agent_monthly_spend(db: AsyncSession, agent_id: str, organization_id: str) -> Decimal:
    return await _calculate_spend(db, organization_id=organization_id, agent_id=agent_id, period="month")


async def calculate_org_daily_spend(db: AsyncSession, organization_id: str) -> Decimal:
    return await _calculate_spend(db, organization_id=organization_id, period="day")


async def calculate_org_monthly_spend(db: AsyncSession, organization_id: str) -> Decimal:
    return await _calculate_spend(db, organization_id=organization_id, period="month")


def _decision(
    reason: Optional[str] = None,
    *,
    budget_type: Optional[str] = None,
    current_spend: Optional[Decimal] = None,
    budget_limit: Optional[Decimal] = None,
) -> Dict[str, Any]:
    return {
        "allowed": reason is None,
        "reason": reason,
        "budgetType": budget_type,
        "currentSpend": float(current_spend) if current_spend is not None else None,
        "budgetLimit": float(budget_limit) if budget_limit is not None else None,
    }


def _budget_status(current_spend: Decimal, budget_limit: Decimal) -> str:
    if budget_limit <= 0:
        return "UNLIMITED"

    utilization = current_spend / budget_limit
    if utilization >= BLOCKED_THRESHOLD:
        return "BLOCKED"
    if utilization >= CRITICAL_THRESHOLD:
        return "CRITICAL"
    if utilization >= WARNING_THRESHOLD:
        return "WARNING"
    return "OK"


def build_budget_status(current_spend: Any, budget_limit: Any) -> Dict[str, Any]:
    spend = _money(current_spend)
    limit = _money(budget_limit)
    remaining = max(limit - spend, Decimal("0")) if limit > 0 else Decimal("0")
    utilization = (spend / limit * Decimal("100")) if limit > 0 else Decimal("0")

    return {
        "currentSpend": float(spend),
        "budgetLimit": float(limit),
        "remainingBudget": float(remaining),
        "utilizationPercent": float(utilization),
        "warningPercent": 75,
        "criticalPercent": 90,
        "status": _budget_status(spend, limit),
    }


async def _record_budget_violation(
    db: AsyncSession,
    *,
    organization_id: str,
    agent_id: Optional[str],
    reason: str,
    budget_type: str,
    current_spend: Decimal,
    budget_limit: Decimal,
) -> None:
    metadata = {
        "budgetType": budget_type,
        "currentSpend": float(current_spend),
        "budgetLimit": float(budget_limit),
        "reason": reason,
    }

    db.add(
        Alert(
            id=str(uuid.uuid4()),
            organizationId=organization_id,
            agentId=agent_id,
            type="BUDGET_EXCEEDED",
            severity="HIGH",
            title="Budget limit exceeded",
            message=f"{budget_type} budget limit exceeded.",
            metadata_=metadata,
        )
    )
    db.add(
        ActivityLog(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            organizationId=organization_id,
            agentId=agent_id,
            action="BUDGET_EXCEEDED",
            status="FAILURE",
            metadata_=metadata,
        )
    )


async def check_agent_budget(db: AsyncSession, agent: Agent) -> Dict[str, Optional[str] | bool]:
    daily_limit = _money(agent.dailyBudget)
    monthly_limit = _money(agent.monthlyBudget)

    if daily_limit > 0:
        daily_spend = await calculate_agent_daily_spend(db, agent.id, agent.organizationId)
        if daily_spend >= daily_limit:
            await _record_budget_violation(
                db,
                organization_id=agent.organizationId,
                agent_id=agent.id,
                reason=AGENT_DAILY_LIMIT_EXCEEDED,
                budget_type="AGENT_DAILY",
                current_spend=daily_spend,
                budget_limit=daily_limit,
            )
            return _decision(
                AGENT_DAILY_LIMIT_EXCEEDED,
                budget_type="AGENT_DAILY",
                current_spend=daily_spend,
                budget_limit=daily_limit,
            )

    if monthly_limit > 0:
        monthly_spend = await calculate_agent_monthly_spend(db, agent.id, agent.organizationId)
        if monthly_spend >= monthly_limit:
            await _record_budget_violation(
                db,
                organization_id=agent.organizationId,
                agent_id=agent.id,
                reason=AGENT_MONTHLY_LIMIT_EXCEEDED,
                budget_type="AGENT_MONTHLY",
                current_spend=monthly_spend,
                budget_limit=monthly_limit,
            )
            return _decision(
                AGENT_MONTHLY_LIMIT_EXCEEDED,
                budget_type="AGENT_MONTHLY",
                current_spend=monthly_spend,
                budget_limit=monthly_limit,
            )

    return _decision()


async def check_org_budget(db: AsyncSession, organization: Organization, agent_id: Optional[str] = None) -> Dict[str, Optional[str] | bool]:
    daily_limit = _money(organization.dailyBudget)
    monthly_limit = _money(organization.monthlyBudget)

    if daily_limit > 0:
        daily_spend = await calculate_org_daily_spend(db, organization.id)
        if daily_spend >= daily_limit:
            await _record_budget_violation(
                db,
                organization_id=organization.id,
                agent_id=agent_id,
                reason=ORG_DAILY_LIMIT_EXCEEDED,
                budget_type="ORG_DAILY",
                current_spend=daily_spend,
                budget_limit=daily_limit,
            )
            return _decision(
                ORG_DAILY_LIMIT_EXCEEDED,
                budget_type="ORG_DAILY",
                current_spend=daily_spend,
                budget_limit=daily_limit,
            )

    if monthly_limit > 0:
        monthly_spend = await calculate_org_monthly_spend(db, organization.id)
        if monthly_spend >= monthly_limit:
            await _record_budget_violation(
                db,
                organization_id=organization.id,
                agent_id=agent_id,
                reason=ORG_MONTHLY_LIMIT_EXCEEDED,
                budget_type="ORG_MONTHLY",
                current_spend=monthly_spend,
                budget_limit=monthly_limit,
            )
            return _decision(
                ORG_MONTHLY_LIMIT_EXCEEDED,
                budget_type="ORG_MONTHLY",
                current_spend=monthly_spend,
                budget_limit=monthly_limit,
            )

    return _decision()
