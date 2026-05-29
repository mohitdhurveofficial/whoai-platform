from fastapi import APIRouter

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)


@router.get("/risk")
async def risk_analytics():
    return {
        "low_risk": 0,
        "medium_risk": 0,
        "high_risk": 0,
        "approval_required": 0,
    }