from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Policy
from database.session import get_db


router = APIRouter(
    prefix="/api/v1/policies",
    tags=["policies"]
)


class PolicyCreate(BaseModel):
    agent: str
    action: str
    resource: str
    condition: str
    effect: str
    risk_level: str = "medium"


class PolicyResponse(BaseModel):
    id: int
    agent: str
    action: str
    resource: str
    condition: str
    effect: str
    risk_level: str

    class Config:
        from_attributes = True


@router.post(
    "",
    response_model=PolicyResponse
)
async def create_policy(
    payload: PolicyCreate,
    db: AsyncSession = Depends(get_db)
):

    policy = Policy(
        agent=payload.agent,
        action=payload.action,
        resource=payload.resource,
        condition=payload.condition,
        effect=payload.effect,
        risk_level=payload.risk_level,
        created_at=datetime.utcnow(),
    )

    db.add(policy)

    await db.commit()

    await db.refresh(policy)

    return policy


@router.get(
    "",
    response_model=list[PolicyResponse]
)
async def list_policies(
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Policy)
    )

    policies = result.scalars().all()

    return policies


@router.get(
    "/{policy_id}",
    response_model=PolicyResponse
)
async def get_policy(
    policy_id: int,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Policy).where(
            Policy.id == policy_id
        )
    )

    policy = result.scalar_one_or_none()

    if not policy:

        raise HTTPException(
            status_code=404,
            detail="Policy not found"
        )

    return policy