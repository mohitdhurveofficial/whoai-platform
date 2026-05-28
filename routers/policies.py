from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import Policy
from schemas import PolicyCreate, PolicyResponse

router = APIRouter()

@router.post("/policies", response_model=PolicyResponse)
async def create_policy(
    payload: PolicyCreate,
    db: AsyncSession = Depends(get_db)
):
    policy = Policy(
        agent_id=payload.agent_id,
        action_type=payload.action_type,
        max_amount=payload.max_amount,
        environment=payload.environment,
        needs_approval=payload.needs_approval
    )

    db.add(policy)

    await db.commit()
    await db.refresh(policy)

    return policy