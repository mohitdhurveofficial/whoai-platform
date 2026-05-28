from fastapi import APIRouter

from app.policy_engine.approval_store import approvals


router = APIRouter()


@router.get("/approvals")
async def list_approvals():

    return {
        "count": len(approvals),
        "approvals": approvals,
    }


@router.post("/approvals/{trace_id}/approve")
async def approve(trace_id: str):

    for item in approvals:

        if item["trace_id"] == trace_id:

            item["status"] = "approved"

            return {
                "message": "approval granted",
                "trace_id": trace_id,
            }

    return {
        "error": "approval not found"
    }


@router.post("/approvals/{trace_id}/deny")
async def deny(trace_id: str):

    for item in approvals:

        if item["trace_id"] == trace_id:

            item["status"] = "denied"

            return {
                "message": "approval denied",
                "trace_id": trace_id,
            }

    return {
        "error": "approval not found"
    }