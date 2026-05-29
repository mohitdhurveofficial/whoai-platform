from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db

from app.policy_engine.policy_evaluator import evaluate_action
from app.policy_engine.trace_generator import generate_trace_id
from app.policy_engine.audit_logger import log_runtime_decision
from middleware.api_key_auth import verify_api_key

router = APIRouter(
    tags=["runtime"],
)


class ActionRequest(BaseModel):
    agent: str
    action: str
    amount: float
    resource: str


@router.post("/evaluate")
async def evaluate(
    request: ActionRequest,
    db: AsyncSession = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):

    trace_id = generate_trace_id()

    result = evaluate_action(
        agent=request.agent,
        action=request.action,
        amount=request.amount,
        resource=request.resource,
        trace_id=trace_id,
    )

    log_runtime_decision(result)

    return result