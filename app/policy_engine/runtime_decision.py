from fastapi import APIRouter
from pydantic import BaseModel

from app.policy_engine.policy_evaluator import evaluate_action
from app.policy_engine.trace_generator import generate_trace_id
from app.policy_engine.audit_logger import log_runtime_decision
from app.policy_engine.approval_store import create_approval


router = APIRouter()


class ActionRequest(BaseModel):
    agent: str
    action: str
    amount: float
    resource: str


@router.post("/evaluate")
async def evaluate(request: ActionRequest):

    trace_id = generate_trace_id()

    result = evaluate_action(
        agent=request.agent,
        action=request.action,
        amount=request.amount,
        resource=request.resource,
        trace_id=trace_id,
    )

    if result["decision"] == "approval_required":
        create_approval(result)

    log_runtime_decision(result)

    return result