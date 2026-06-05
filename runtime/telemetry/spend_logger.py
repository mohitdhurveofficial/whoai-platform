"""
Spend Logger for WHOAI Telemetry Engine.
"""
import uuid
import logging
from datetime import datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update

from database.models import SpendLog, Agent, Organization

logger = logging.getLogger("whoai.telemetry.spend")

async def log_spend(
    db: AsyncSession,
    organization_id: str,
    agent_id: str,
    provider: str,
    model: str,
    tokens_in: int,
    tokens_out: int,
    total_tokens: int,
    cost: Decimal
) -> None:
    """
    Create a SpendLog record and update the Agent's daily spend.
    Designed to never block the request flow by failing gracefully.
    """
    try:
        spend_log = SpendLog(
            id=str(uuid.uuid4()),
            createdAt=datetime.utcnow(),
            organizationId=organization_id,
            agentId=agent_id,
            provider=provider,
            model=model,
            tokensIn=tokens_in,
            tokensOut=tokens_out,
            cost=cost
        )
        
        # We can add totalTokens to metadata since it's not a primary DB column in SpendLog
        spend_log.metadata_ = {"totalTokens": total_tokens}
        
        db.add(spend_log)
        
        # Keep denormalized counters fresh for low-latency dashboards.
        await db.execute(
            update(Agent).where(Agent.id == agent_id).values(
                currentDailySpend=Agent.currentDailySpend + cost,
                currentMonthlySpend=Agent.currentMonthlySpend + cost,
            )
        )
        await db.execute(
            update(Organization).where(Organization.id == organization_id).values(
                currentDailySpend=Organization.currentDailySpend + cost,
                currentMonthlySpend=Organization.currentMonthlySpend + cost,
            )
        )
        
    except Exception as e:
        # Never block the request flow
        logger.error(f"Failed to log spend for agent {agent_id}: {str(e)}", exc_info=True)
