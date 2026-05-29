import json
from pathlib import Path

from fastapi import APIRouter


router = APIRouter(
    tags=["logs"],
)

LOG_FILE = Path("app/logs/runtime_logs.json")


@router.get("/logs")
async def get_runtime_logs():

    if not LOG_FILE.exists():
        return {
            "count": 0,
            "logs": []
        }

    try:
        logs = json.loads(
            LOG_FILE.read_text()
        )
    except Exception:
        logs = []

    return {
        "count": len(logs),
        "logs": list(reversed(logs))
    }