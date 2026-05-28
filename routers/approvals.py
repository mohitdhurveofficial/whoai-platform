from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from database.session import get_db

from database.models import (
    Approval,
    ApprovalStatus
)

from schemas import (
    ApprovalResponse,
    ApprovalUpdate
)

from datetime import datetime

router = APIRouter()


@router.get("/approvals", response_model=list[ApprovalResponse])
async def list_approvals(
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Approval).order_by(
            desc(Approval.created_at)
        )
    )

    approvals = result.scalars().all()

    return approvals


@router.post(
    "/approvals/{approval_id}",
    response_model=ApprovalResponse
)
async def update_approval(
    approval_id: int,
    payload: ApprovalUpdate,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Approval).where(
            Approval.id == approval_id
        )
    )

    approval = result.scalar_one_or_none()

    if not approval:
        raise HTTPException(
            status_code=404,
            detail="Approval not found"
        )

    if approval.status != ApprovalStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Already processed"
        )

    if payload.status not in [
        "approved",
        "rejected"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    approval.status = ApprovalStatus(
        payload.status
    )

    approval.approved_by = payload.approved_by

    approval.approved_at = datetime.utcnow()

    await db.commit()

    await db.refresh(approval)

    return approval