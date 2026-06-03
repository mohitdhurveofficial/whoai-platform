import logging
import uuid
from database.session import async_session_maker
from database.models import Agent, SpendLog, AITransaction
from lib.actions.anomaly_engine import evaluate_spend_anomalies
import asyncio

logger = logging.getLogger(__name__)

async def log_agent_telemetry_async(
    agent_id: str, 
    organization_id: str, 
    model: str, 
    prompt_tokens: int, 
    completion_tokens: int, 
    cost_usd: float
):
    """
    Executes entirely outside the request-response lifecycle to ensure zero latency impact.
    """
    async with async_session_maker() as db:
        try:
            # 1. Deduct wallet balance
            agent = await db.get(Agent, agent_id)
            if agent:
                agent.walletBalance -= cost_usd
            
            # 2. Log API Spend
            spend = SpendLog(id=f"cuid_{uuid.uuid4().hex[:16]}", organizationId=organization_id, agentId=agent_id, model=model, tokensUsed=prompt_tokens + completion_tokens, costUsd=cost_usd, action="LLM_COMPLETION")
            db.add(spend)
            
            # 3. Log Immutable Transaction
            txn = AITransaction(id=f"cuid_{uuid.uuid4().hex[:16]}", organizationId=organization_id, agentId=agent_id, type="API_SPEND", amount=cost_usd, status="COMPLETED")
            db.add(txn)
            
            await db.commit()
            
            # Fire-and-forget anomaly detection evaluation
            asyncio.create_task(evaluate_spend_anomalies(agent_id, organization_id))
        except Exception as e:
            await db.rollback()
            logger.error(f"Critical Telemetry Failure for agent {agent_id}: {str(e)}")