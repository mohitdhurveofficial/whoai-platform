import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database.models import Agent, SpendLog, RequestLog, Alert, UsageMetrics, ActivityLog

async def detect_anomalies(db: AsyncSession, agent_id: str, org_id: str):
    """
    Run anomaly detection for Spend, Tokens, and Requests.
    Triggered after metrics update.
    """
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_start = today_start - timedelta(days=1)
    
    # 1. Fetch Today's Metrics
    today_metrics_result = await db.execute(
        select(UsageMetrics).where(
            UsageMetrics.agentId == agent_id,
            UsageMetrics.date >= today_start
        )
    )
    today_metrics = today_metrics_result.scalar_one_or_none()
    if not today_metrics:
        return
        
    current_spend = float(today_metrics.totalCost)
    current_tokens = today_metrics.totalTokens
    current_requests = today_metrics.totalRequests

    # 2. Fetch Average Metrics (last 7 days, excluding today) for baseline
    seven_days_ago = today_start - timedelta(days=7)
    hist_metrics_result = await db.execute(
        select(
            func.avg(UsageMetrics.totalCost),
            func.avg(UsageMetrics.totalTokens),
            func.avg(UsageMetrics.totalRequests)
        ).where(
            UsageMetrics.agentId == agent_id,
            UsageMetrics.date >= seven_days_ago,
            UsageMetrics.date < today_start
        )
    )
    hist_row = hist_metrics_result.one_or_none()
    
    avg_spend = float(hist_row[0] or 0)
    avg_tokens = float(hist_row[1] or 0)
    avg_requests = float(hist_row[2] or 0)

    # Use yesterday's if average is 0 to avoid division by zero, or a small baseline
    baseline_spend = max(avg_spend, 1.0) # Assume at least $1/day to avoid noise
    baseline_tokens = max(avg_tokens, 1000) # Assume at least 1k tokens/day
    baseline_requests = max(avg_requests, 10) # Assume at least 10 reqs/day

    # 3. Evaluate Anomalies
    anomalies_detected = []
    
    # Spend Spike: > 2x average
    if current_spend > 2 * baseline_spend:
        anomalies_detected.append({
            "type": "SPEND_SPIKE",
            "title": "Spend Spike Detected",
            "message": f"Current spend (${current_spend:.2f}) exceeds 2x the normal average (${baseline_spend:.2f}/day).",
            "severity": "HIGH",
            "metadata": {"currentSpend": current_spend, "averageSpend": baseline_spend}
        })
        
    # Token Spike: > 3x average
    if current_tokens > 3 * baseline_tokens:
        anomalies_detected.append({
            "type": "TOKEN_SPIKE",
            "title": "Token Spike Detected",
            "message": f"Current token usage ({current_tokens}) exceeds 3x the normal average ({baseline_tokens}/day).",
            "severity": "HIGH",
            "metadata": {"currentTokens": current_tokens, "averageTokens": baseline_tokens}
        })
        
    # Request Spike: > 3x average
    if current_requests > 3 * baseline_requests:
        anomalies_detected.append({
            "type": "REQUEST_SPIKE",
            "title": "Request Spike Detected",
            "message": f"Current request volume ({current_requests}) exceeds 3x the normal average ({baseline_requests}/day).",
            "severity": "HIGH",
            "metadata": {"currentRequests": current_requests, "averageRequests": baseline_requests}
        })

    # 4. Fire Alerts
    for anomaly in anomalies_detected:
        # Check if we already fired this exact alert today
        existing_alert = await db.execute(
            select(Alert.id).where(
                Alert.agentId == agent_id,
                Alert.type == anomaly["type"],
                Alert.createdAt >= today_start
            )
        )
        if existing_alert.scalar_one_or_none():
            continue # Already alerted today
            
        alert = Alert(
            id=str(uuid.uuid4()),
            organizationId=org_id,
            agentId=agent_id,
            type=anomaly["type"],
            severity=anomaly["severity"],
            title=anomaly["title"],
            message=anomaly["message"],
            metadata_=anomaly["metadata"],
            createdAt=datetime.utcnow()
        )
        db.add(alert)
        
        activity = ActivityLog(
            id=str(uuid.uuid4()),
            organizationId=org_id,
            agentId=agent_id,
            action="ANOMALY_DETECTED",
            status="SUCCESS",
            metadata_=anomaly["metadata"],
            timestamp=datetime.utcnow()
        )
        db.add(activity)
        
    if anomalies_detected:
        await db.commit()
