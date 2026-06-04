from fastapi import APIRouter

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)


@router.get("/health")
async def analytics_health():
    return {
        "status": "ok",
        "service": "analytics"
    }


@router.get("/overview")
async def analytics_overview():
    return {
        "total_requests": 0,
        "total_cost": 0,
        "total_tokens": 0,
        "providers": []
    }