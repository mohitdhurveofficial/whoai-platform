from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import Approval, ApprovalStatus

from app.policy_engine.policy_evaluator import evaluate_action
from app.policy_engine.trace_generator import generate_trace_id
from app.policy_engine.audit_logger import log_runtime_decision

router = APIRouter()


class ActionRequest(BaseModel):
    agent: str
    action: str
    amount: float
    resource: str


@router.post("/evaluate")
async def evaluate(
    request: ActionRequest,
    db: AsyncSession = Depends(get_db)
):

    trace_id = generate_trace_id()

    result = evaluate_action(
        agent=request.agent,
        action=request.action,
        amount=request.amount,
        resource=request.resource,
        trace_id=trace_id,
    )

    if result["decision"] == "approval_required":

        approval = Approval(
            agent_id=1,
            action_type=request.action,
            resource_json=request.resource,
            context_json=str({
                "amount": request.amount,
                "agent": request.agent
            }),
            policy_id=1,
            status=ApprovalStatus.PENDING
        )

        db.add(approval)

        await db.commit()

        await db.refresh(approval)

    log_runtime_decision(result)

    return result