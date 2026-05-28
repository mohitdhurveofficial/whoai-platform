from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict

from app.policy_engine.policy_registry import evaluate_policy
from app.policy_engine.trace_generator import generate_trace_id
from app.policy_engine.audit_logger import log_runtime_decision

router = APIRouter()


class ActionRequest(BaseModel):
    agent: str
    action: str
    amount: Optional[float] = 0
    resource: Optional[str] = None
    metadata: Optional[Dict] = {}


@router.post("/evaluate")
async def evaluate(request: ActionRequest):

    trace_id = generate_trace_id()

    policy_result = evaluate_policy(
        action=request.action,
        amount=request.amount,
    )

    runtime_result = {
        "trace_id": trace_id,
        "agent": request.agent,
        "action": request.action,
        "resource": request.resource,
        "decision": policy_result["decision"],
        "risk_level": policy_result["risk_level"],
        "policy_matched": policy_result["policy_matched"],
        "reason": policy_result["reason"],
    }

    log_runtime_decision(runtime_result)

    return runtime_result