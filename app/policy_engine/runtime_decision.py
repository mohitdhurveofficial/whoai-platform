from fastapi import APIRouter
from pydantic import BaseModel

from app.policy_engine.policy_evaluator import evaluate_action


router = APIRouter()


class ActionRequest(BaseModel):
    action: str
    amount: float


@router.post("/evaluate")
async def runtime_evaluate(request: ActionRequest):
    result = evaluate_action(request.dict())
    return result