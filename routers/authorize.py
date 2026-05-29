from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import json

from database.session import get_db

from database.models import (
    Agent,
    AgentStatus,
    Policy,
    Decision,
    Approval,
    ApprovalStatus
)

from schemas import (
    AuthorizeRequest,
    AuthorizeResponse
)

from auth import verify_api_key

router = APIRouter()


@router.post("/authorize", response_model=AuthorizeResponse)
async def authorize(
    payload: AuthorizeRequest,
    db: AsyncSession = Depends(get_db),
    authenticated_agent: Agent = Depends(verify_api_key)
):

    # Verify API key belongs to agent
    if authenticated_agent.id != payload.agent_id:
        raise HTTPException(
            status_code=403,
            detail="API key does not match agent_id"
        )

    # Use authenticated agent
    agent = authenticated_agent

    # Kill switch
    if agent.status == AgentStatus.DISABLED:

        decision_log = Decision(
            agent_id=payload.agent_id,
            action_type=payload.action_type,
            resource_json=json.dumps(payload.resource.dict()),
            context_json=json.dumps(payload.context.dict()),
            decision="deny",
            reason="agent_disabled",
            policy_id=None,
            created_at=datetime.utcnow()
        )

        db.add(decision_log)
        await db.commit()

        return AuthorizeResponse(
            decision="deny",
            reason="agent_disabled",
            policy_id=None
        )

    # Find matching policy
    result = await db.execute(
        select(Policy).where(
            Policy.agent == agent.name,
            Policy.action == payload.action_type
        )
    )

    policy = result.scalars().first()

    # No policy
    if not policy:

        decision_log = Decision(
            agent_id=payload.agent_id,
            action_type=payload.action_type,
            resource_json=json.dumps(payload.resource.dict()),
            context_json=json.dumps(payload.context.dict()),
            decision="deny",
            reason="no_matching_policy",
            policy_id=None,
            created_at=datetime.utcnow()
        )

        db.add(decision_log)
        await db.commit()

        return AuthorizeResponse(
            decision="deny",
            reason="no_matching_policy",
            policy_id=None
        )

    # Dynamic condition evaluation
    condition_matched = False

    if policy.condition:
        if (
            policy.condition == "amount > 1000"
            and payload.resource.amount > 1000
        ):
            condition_matched = True

    if not condition_matched:

        decision_log = Decision(
            agent_id=payload.agent_id,
            action_type=payload.action_type,
            resource_json=json.dumps(payload.resource.dict()),
            context_json=json.dumps(payload.context.dict()),
            decision="allow",
            reason="condition_not_triggered",
            policy_id=policy.id,
            created_at=datetime.utcnow()
        )

        db.add(decision_log)
        await db.commit()

        return AuthorizeResponse(
            decision="allow",
            reason="condition_not_triggered",
            policy_id=policy.id
        )

    # Needs approval
    if policy.effect == "approval_required":

        approval = Approval(
            agent_id=payload.agent_id,
            action_type=payload.action_type,
            resource_json=json.dumps(payload.resource.dict()),
            context_json=json.dumps(payload.context.dict()),
            policy_id=policy.id,
            status=ApprovalStatus.PENDING,
            created_at=datetime.utcnow()
        )

        db.add(approval)

        decision_log = Decision(
            agent_id=payload.agent_id,
            action_type=payload.action_type,
            resource_json=json.dumps(payload.resource.dict()),
            context_json=json.dumps(payload.context.dict()),
            decision="needs_approval",
            reason="approval_required",
            policy_id=policy.id,
            created_at=datetime.utcnow()
        )

        db.add(decision_log)

        await db.commit()

        return AuthorizeResponse(
            decision="needs_approval",
            reason="approval_required",
            policy_id=policy.id
        )

    # Allow
    decision_log = Decision(
        agent_id=payload.agent_id,
        action_type=payload.action_type,
        resource_json=json.dumps(payload.resource.dict()),
        context_json=json.dumps(payload.context.dict()),
        decision="allow",
        reason="allowed_by_policy",
        policy_id=policy.id,
        created_at=datetime.utcnow()
    )

    db.add(decision_log)

    await db.commit()

    return AuthorizeResponse(
        decision="allow",
        reason="allowed_by_policy",
        policy_id=policy.id
    )