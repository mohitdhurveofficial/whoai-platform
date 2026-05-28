def evaluate_action(agent: str, action: str, amount: float):
    REFUND_THRESHOLD = 1000

    if action == "refund" and amount > REFUND_THRESHOLD:
        return {
            "agent": agent,
            "decision": "approval_required",
            "risk_level": "high",
            "reason": "refund exceeds threshold",
        }

    return {
        "agent": agent,
        "decision": "approved",
        "risk_level": "low",
        "reason": "within allowed threshold",
    }