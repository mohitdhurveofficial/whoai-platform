from fastapi import APIRouter

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)


@router.get("/recent-activity")
async def recent_activity():
    return [
        {
            "type": "refund",
            "agent": "support-agent",
            "decision": "approved"
        },
        {
            "type": "refund",
            "agent": "support-agent",
            "decision": "approval_required"
        }
    ]