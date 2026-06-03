import logging
import httpx
import uuid
from datetime import datetime, timedelta
from sqlalchemy import select, func
from database.session import async_session_maker
from database.models import Agent, SpendLog, Risk, AlertChannel

logger = logging.getLogger(__name__)

async def dispatch_webhook(channel_type: str, url: str, payload: dict):
    """Dispatches formatted payloads to Slack or Microsoft Teams."""
    async with httpx.AsyncClient() as client:
        try:
            await client.post(url, json=payload, timeout=5.0)
        except Exception as e:
            logger.error(f"Failed to dispatch {channel_type} alert: {e}")

def format_slack_payload(agent_name: str, spike_pct: float, current_spend: float, prev_spend: float) -> dict:
    return {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "🚨 WHOAI FinOps Anomaly Detected", "emoji": True}
            },
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"*Agent:* {agent_name}\n*Severity:* CRITICAL\n*Trigger:* Spend spiked *{spike_pct:.0f}%* in the last 60 minutes."}
            },
            {
                "type": "context",
                "elements": [{"type": "mrkdwn", "text": f"Current Hour: ${current_spend:.2f} | Previous Average: ${prev_spend:.2f}"}]
            }
        ]
    }

async def evaluate_spend_anomalies(agent_id: str, organization_id: str):
    """
    Evaluates near real-time Z-Score velocity spikes. 
    Runs as a detached background task.
    """
    async with async_session_maker() as db:
        try:
            now = datetime.utcnow()
            one_hour_ago = now - timedelta(hours=1)
            two_hours_ago = now - timedelta(hours=2)
            
            # 1. Calculate Current Hour Spend
            q_current = select(func.sum(SpendLog.costUsd)).where(
                SpendLog.agentId == agent_id, SpendLog.createdAt >= one_hour_ago
            )
            res_current = await db.execute(q_current)
            current_spend = res_current.scalar() or 0.0

            # Noise Reduction: Do not alert if absolute spend is trivial (e.g., under $2.00)
            if current_spend < 2.00:
                return

            # 2. Calculate Previous Hour Spend Baseline
            q_prev = select(func.sum(SpendLog.costUsd)).where(
                SpendLog.agentId == agent_id, 
                SpendLog.createdAt >= two_hours_ago, 
                SpendLog.createdAt < one_hour_ago
            )
            res_prev = await db.execute(q_prev)
            prev_spend = res_prev.scalar() or 0.01  # avoid division by zero

            # 3. Rate of Change Calculation
            growth_ratio = current_spend / prev_spend
            
            # Alert Threshold: > 300% growth
            if growth_ratio > 3.0:
                agent = await db.get(Agent, agent_id)
                spike_pct = (growth_ratio - 1) * 100
                
                # Register Anomaly in the WHOAI Dashboard (Risk Table)
                risk = Risk(
                    id=f"cuid_{uuid.uuid4().hex[:16]}",
                    organizationId=organization_id,
                    title="Runaway Agent Spend Spike",
                    description=f"Spend for {agent.name} spiked {spike_pct:.0f}%. Current hour: ${current_spend:.2f}.",
                    severity="CRITICAL",
                    score=95.0,
                    status="OPEN"
                )
                db.add(risk)
                
                # Dispatch External Alerts
                channels = await db.execute(select(AlertChannel).where(AlertChannel.organizationId == organization_id, AlertChannel.isActive == True))
                for channel in channels.scalars():
                    if channel.type == "SLACK":
                        await dispatch_webhook("SLACK", channel.webhookUrl, format_slack_payload(agent.name, spike_pct, current_spend, prev_spend))
                
                await db.commit()
        except Exception as e:
            logger.error(f"Anomaly evaluation failed: {e}")