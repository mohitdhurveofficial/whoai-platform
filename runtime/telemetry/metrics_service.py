"""
Usage Metrics Aggregation Service for WHOAI Telemetry Engine.
"""
import uuid
import logging
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError

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
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        
        result = await db.execute(
            update(UsageMetrics).where(
                UsageMetrics.agentId == agent_id,
                UsageMetrics.date == today
            ).values(
                totalRequests=UsageMetrics.totalRequests + 1,
                totalTokens=UsageMetrics.totalTokens + tokens,
                totalCost=UsageMetrics.totalCost + cost
            ).execution_options(synchronize_session=False)
        )
        
        if result.rowcount == 0:
            try:
                async with db.begin_nested():
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
                    await db.flush()
            except IntegrityError:
                # Another concurrent request inserted the row, update instead
                await db.execute(
                    update(UsageMetrics).where(
                        UsageMetrics.agentId == agent_id,
                        UsageMetrics.date == today
                    ).values(
                        totalRequests=UsageMetrics.totalRequests + 1,
                        totalTokens=UsageMetrics.totalTokens + tokens,
                        totalCost=UsageMetrics.totalCost + cost
                    ).execution_options(synchronize_session=False)
                )
            
    except Exception as e:
        logger.error(f"Failed to update daily metrics for agent {agent_id}: {str(e)}", exc_info=True)
