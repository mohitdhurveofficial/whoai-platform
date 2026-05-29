from fastapi import APIRouter

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)


@router.get("/risk")
async def risk_analytics():
    return {
        "message": "risk endpoint version 2"
    }