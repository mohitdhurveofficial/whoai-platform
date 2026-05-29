import json
from pathlib import Path

from fastapi import APIRouter

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)

LOG_FILE = Path("app/logs/runtime_logs.json")


@router.get("/risk")
async def risk_analytics():

    if not LOG_FILE.exists():
        return {
            "low_risk": 0,
            "medium_risk": 0,
            "high_risk": 0,
            "approval_required": 0,
        }

    try:
        logs = json.loads(
            LOG_FILE.read_text()
        )
    except Exception:
        logs = []

    low_risk = 0
    medium_risk = 0
    high_risk = 0
    approval_required = 0

    for log in logs:

        risk = log.get("risk_level")
        decision = log.get("decision")

        if risk == "low":
            low_risk += 1

        elif risk == "medium":
            medium_risk += 1

        elif risk == "high":
            high_risk += 1

        if decision == "approval_required":
            approval_required += 1

    return {
        "low_risk": low_risk,
        "medium_risk": medium_risk,
        "high_risk": high_risk,
        "approval_required": approval_required,
    }