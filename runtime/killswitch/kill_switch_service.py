import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from database.models import ActivityLog, Agent, Alert, Organization


ACTIVE = "ACTIVE"
PAUSED = "PAUSED"
QUARANTINED = "QUARANTINED"
TERMINATED = "TERMINATED"

DAILY_BUDGET_EXCEEDED = "DAILY_BUDGET_EXCEEDED"
MONTHLY_BUDGET_EXCEEDED = "MONTHLY_BUDGET_EXCEEDED"
MANUAL_PAUSE = "MANUAL_PAUSE"
MANUAL_RESUME = "MANUAL_RESUME"
MANUAL_TERMINATION = "MANUAL_TERMINATION"

BLOCKED_AGENT_STATES = {PAUSED, QUARANTINED, TERMINATED}
BLOCKED_ORG_STATES = {PAUSED, TERMINATED}


def _metadata(
    reason: str,
    *,
    budget_limit: Optional[Any] = None,
    current_spend: Optional[Any] = None,
    actor_id: Optional[str] = None,
) -> Dict[str, Any]:
    data: Dict[str, Any] = {"reason": reason}
    if budget_limit is not None:
        data["budgetLimit"] = float(budget_limit)
    if current_spend is not None:
        data["currentSpend"] = float(current_spend)
    if actor_id:
        data["actorId"] = actor_id
    return data


def _add_alert(
    db: AsyncSession,
    *,
    organization_id: str,
    agent_id: Optional[str],
    alert_type: str,
    title: str,
    message: str,
    metadata: Dict[str, Any],
) -> None:
    db.add(
        Alert(
            id=str(uuid.uuid4()),
            organizationId=organization_id,
            agentId=agent_id,
            type=alert_type,
            severity="HIGH",
            title=title,
            message=message,
            metadata_=metadata,
        )
    )


def _add_activity(
    db: AsyncSession,
    *,
    organization_id: str,
    agent_id: Optional[str],
    action: str,
    metadata: Dict[str, Any],
) -> None:
    db.add(
        ActivityLog(
            id=str(uuid.uuid4()),
            timestamp=datetime.now(timezone.utc),
            organizationId=organization_id,
            agentId=agent_id,
            action=action,
            status="SUCCESS",
            metadata_=metadata,
        )
    )


async def check_agent_state(db: AsyncSession, agent: Agent) -> Dict[str, Any]:
    if agent.status in BLOCKED_AGENT_STATES:
        reason = agent.pauseReason or agent.status
        metadata = _metadata(reason)
        metadata["agentStatus"] = agent.status
        _add_activity(
            db,
            organization_id=agent.organizationId,
            agent_id=agent.id,
            action="REQUEST_BLOCKED",
            metadata=metadata,
        )
        return {
            "allowed": False,
            "error": "Agent paused" if agent.status == PAUSED else f"Agent {agent.status.lower()}",
            "reason": reason,
        }

    return {"allowed": True, "error": None, "reason": None}


async def check_org_state(db: AsyncSession, organization: Organization, agent_id: Optional[str] = None) -> Dict[str, Any]:
    status = organization.status or ACTIVE
    if status in BLOCKED_ORG_STATES:
        reason = organization.pauseReason or status
        metadata = _metadata(reason)
        metadata["organizationStatus"] = status
        _add_activity(
            db,
            organization_id=organization.id,
            agent_id=agent_id,
            action="REQUEST_BLOCKED",
            metadata=metadata,
        )
        return {
            "allowed": False,
            "error": "Organization paused" if status == PAUSED else f"Organization {status.lower()}",
            "reason": reason,
        }

    return {"allowed": True, "error": None, "reason": None}


async def pause_agent(
    db: AsyncSession,
    agent: Agent,
    *,
    reason: str,
    paused_by: str = "SYSTEM",
    budget_limit: Optional[Any] = None,
    current_spend: Optional[Any] = None,
) -> Agent:
    metadata = _metadata(reason, budget_limit=budget_limit, current_spend=current_spend, actor_id=paused_by)

    if agent.status != TERMINATED:
        agent.status = PAUSED
        agent.pauseReason = reason
        agent.pausedAt = datetime.now(timezone.utc)
        agent.pausedBy = paused_by

    _add_alert(
        db,
        organization_id=agent.organizationId,
        agent_id=agent.id,
        alert_type="AGENT_PAUSED",
        title="Agent paused",
        message=f"Agent paused: {reason}",
        metadata=metadata,
    )
    _add_activity(
        db,
        organization_id=agent.organizationId,
        agent_id=agent.id,
        action="AGENT_PAUSED",
        metadata=metadata,
    )
    return agent


async def resume_agent(
    db: AsyncSession,
    agent: Agent,
    *,
    resumed_by: str = "SYSTEM",
    reason: str = MANUAL_RESUME,
) -> Agent:
    if agent.status == TERMINATED:
        raise ValueError("Terminated agents cannot be resumed")

    agent.status = ACTIVE
    agent.pauseReason = None
    agent.pausedAt = None
    agent.pausedBy = None

    metadata = _metadata(reason, actor_id=resumed_by)
    _add_alert(
        db,
        organization_id=agent.organizationId,
        agent_id=agent.id,
        alert_type="AGENT_RESUMED",
        title="Agent resumed",
        message="Agent resumed.",
        metadata=metadata,
    )
    _add_activity(
        db,
        organization_id=agent.organizationId,
        agent_id=agent.id,
        action="AGENT_RESUMED",
        metadata=metadata,
    )
    return agent


async def terminate_agent(
    db: AsyncSession,
    agent: Agent,
    *,
    terminated_by: str = "SYSTEM",
    reason: str = MANUAL_TERMINATION,
) -> Agent:
    agent.status = TERMINATED
    agent.pauseReason = reason
    agent.pausedAt = datetime.now(timezone.utc)
    agent.pausedBy = terminated_by
    return agent


async def pause_organization(
    db: AsyncSession,
    organization: Organization,
    *,
    reason: str,
    paused_by: str = "SYSTEM",
    budget_limit: Optional[Any] = None,
    current_spend: Optional[Any] = None,
    agent_id: Optional[str] = None,
) -> Organization:
    metadata = _metadata(reason, budget_limit=budget_limit, current_spend=current_spend, actor_id=paused_by)

    organization.status = PAUSED
    organization.pauseReason = reason
    organization.pausedAt = datetime.now(timezone.utc)

    _add_alert(
        db,
        organization_id=organization.id,
        agent_id=agent_id,
        alert_type="ORG_PAUSED",
        title="Organization paused",
        message=f"Organization paused: {reason}",
        metadata=metadata,
    )
    _add_activity(
        db,
        organization_id=organization.id,
        agent_id=agent_id,
        action="ORG_PAUSED",
        metadata=metadata,
    )
    return organization


async def resume_organization(
    db: AsyncSession,
    organization: Organization,
    *,
    resumed_by: str = "SYSTEM",
    reason: str = MANUAL_RESUME,
    agent_id: Optional[str] = None,
) -> Organization:
    organization.status = ACTIVE
    organization.pauseReason = None
    organization.pausedAt = None

    metadata = _metadata(reason, actor_id=resumed_by)
    _add_alert(
        db,
        organization_id=organization.id,
        agent_id=agent_id,
        alert_type="ORG_RESUMED",
        title="Organization resumed",
        message="Organization resumed.",
        metadata=metadata,
    )
    _add_activity(
        db,
        organization_id=organization.id,
        agent_id=agent_id,
        action="ORG_RESUMED",
        metadata=metadata,
    )
    return organization
