from fastapi import APIRouter
from pydantic import BaseModel

from app.policy_engine.policy_evaluator import evaluate_action

router = APIRouter()


class ActionRequest(BaseModel):
    agent: str
    action: str
    amount: float


@router.post("/evaluate")
async def evaluate(request: ActionRequest):
    result = evaluate_action(
        agent=request.agent,
        action=request.action,
        amount=request.amount,
    )

    return result