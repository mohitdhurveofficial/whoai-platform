from fastapi import APIRouter

router = APIRouter(
    prefix="/governance",
    tags=["governance"]
)

@router.get("")
async def governance_status():
    return {
        "status": "active"
    }