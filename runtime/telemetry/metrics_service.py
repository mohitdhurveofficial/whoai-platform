"""
Usage Metrics Aggregation Service for WHOAI Telemetry Engine.
"""
import uuid
import logging
from datetime import datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.models import UsageMetrics

logger = logging.getLogger("whoai.telemetry.metrics")

async def update_daily_metrics(
    db: AsyncSession,
    organization_id: str,
    agent_id: str,
    tokens: int,
    cost: Decimal
) -> None:
    """
    Update daily aggregated metrics for total requests, tokens, and cost.
    Ensures safe upsert behavior per agent per day.
    """
    try:
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        result = await db.execute(
            select(UsageMetrics).where(
                UsageMetrics.agentId == agent_id,
                UsageMetrics.date == today
            )
        )
        metric = result.scalar_one_or_none()
        
        if metric:
            metric.totalRequests += 1
            metric.totalTokens += tokens
            metric.totalCost += cost
        else:
            metric = UsageMetrics(
                id=str(uuid.uuid4()),
                agentId=agent_id,
                organizationId=organization_id,
                date=today,
                totalRequests=1,
                totalTokens=tokens,
                totalCost=cost
            )
            db.add(metric)
            
    except Exception as e:
        logger.error(f"Failed to update daily metrics for agent {agent_id}: {str(e)}", exc_info=True)
