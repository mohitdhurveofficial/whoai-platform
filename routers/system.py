

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from app.system.doctor import WhoAIDoctor


router = APIRouter(
    prefix="/system",
    tags=["system"]
)


@router.get("/health")
async def health(
    db: AsyncSession = Depends(get_db)
):
    doctor = WhoAIDoctor(db)
    return await doctor.health()


@router.get("/readiness")
async def readiness(
    db: AsyncSession = Depends(get_db)
):
    doctor = WhoAIDoctor(db)
    return await doctor.readiness()


@router.get("/diagnostics")
async def diagnostics(
    db: AsyncSession = Depends(get_db)
):
    doctor = WhoAIDoctor(db)
    return await doctor.diagnostics()


@router.post("/repair")
async def repair(
    db: AsyncSession = Depends(get_db)
):
    doctor = WhoAIDoctor(db)
    return await doctor.repair()