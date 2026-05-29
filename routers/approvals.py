from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Approval, ApprovalStatus
from database.session import get_db
from schemas import ApprovalResponse, ApprovalUpdate

router = APIRouter(
    tags=["approvals"]
)


@router.get(
    "/approvals",
    response_model=list[ApprovalResponse]
)
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

    if approval is None:
        raise HTTPException(
            status_code=404,
            detail="Approval not found"
        )

    if approval.status != ApprovalStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Approval already processed"
        )

    valid_statuses = [
        ApprovalStatus.APPROVED.value,
        ApprovalStatus.REJECTED.value,
    ]

    if payload.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail="Status must be 'approved' or 'rejected'"
        )

    approval.status = ApprovalStatus(payload.status)
    approval.approved_by = payload.approved_by
    approval.approved_at = datetime.utcnow()

    await db.commit()
    await db.refresh(approval)

    return approval