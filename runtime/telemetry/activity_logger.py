"""
Activity Logger for WHOAI Telemetry Engine.
Logs lifecycle events of AI requests.
"""
import uuid
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import ActivityLog

logger = logging.getLogger("whoai.telemetry.activity")

class ActivityAction:
    REQUEST_RECEIVED = "REQUEST_RECEIVED"
    REQUEST_COMPLETED = "REQUEST_COMPLETED"
    REQUEST_FAILED = "REQUEST_FAILED"
    REQUEST_BLOCKED = "REQUEST_BLOCKED"
    BUDGET_EXCEEDED = "BUDGET_EXCEEDED"
    AGENT_PAUSED = "AGENT_PAUSED"
    ORG_PAUSED = "ORG_PAUSED"
    AGENT_RESUMED = "AGENT_RESUMED"
    ORG_RESUMED = "ORG_RESUMED"
    AUTH_FAILED = "AUTH_FAILED"
    PROVIDER_ERROR = "PROVIDER_ERROR"

async def log_activity(
    db: AsyncSession,
    organization_id: str,
    action: str,
    agent_id: Optional[str] = None,
    status: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> None:
    """
    Create ActivityLog records.
    Designed to be robust and not interrupt main request flows.
    """
    try:
        activity_log = ActivityLog(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            organizationId=organization_id,
            agentId=agent_id,
            action=action,
            status=status,
            metadata_=metadata or {}
        )
        db.add(activity_log)
    except Exception as e:
        logger.error(f"Failed to log activity '{action}' for org {organization_id}: {str(e)}", exc_info=True)
