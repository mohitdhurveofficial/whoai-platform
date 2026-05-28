from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

from app.policy_engine.approval_store import approvals


router = APIRouter()


class ReviewRequest(BaseModel):
    reviewer: str
    reason: str | None = None


@router.get("/approvals")
async def list_approvals():

    return {
        "count": len(approvals),
        "approvals": approvals,
    }


@router.post("/approvals/{trace_id}/approve")
async def approve(trace_id: str, review: ReviewRequest):

    for item in approvals:

        if item["trace_id"] == trace_id:

            item["status"] = "approved"
            item["reviewer"] = review.reviewer
            item["review_reason"] = review.reason
            item["updated_at"] = datetime.utcnow().isoformat()

            return {
                "message": "approval granted",
                "trace_id": trace_id,
                "reviewer": review.reviewer,
                "status": "approved",
            }

    return {
        "error": "approval not found"
    }


@router.post("/approvals/{trace_id}/deny")
async def deny(trace_id: str, review: ReviewRequest):

    for item in approvals:

        if item["trace_id"] == trace_id:

            item["status"] = "denied"
            item["reviewer"] = review.reviewer
            item["review_reason"] = review.reason
            item["updated_at"] = datetime.utcnow().isoformat()

            return {
                "message": "approval denied",
                "trace_id": trace_id,
                "reviewer": review.reviewer,
                "status": "denied",
            }

    return {
        "error": "approval not found"
    }