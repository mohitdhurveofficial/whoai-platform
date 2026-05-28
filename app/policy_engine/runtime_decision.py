from fastapi import APIRouter
from pydantic import BaseModel

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
async def evaluate(request: ActionRequest):

    result = evaluate_action(
        action=request.action,
        amount=request.amount,
    )

    response = {
        "trace_id": generate_trace_id(),
        "agent": request.agent,
        "resource": request.resource,
        "action": request.action,
        "amount": request.amount,
        "decision": result["decision"],
        "risk_level": result["risk_level"],
        "reason": result["reason"],
    }

    log_runtime_decision(response)

    return response