def evaluate_action(action: str, amount: float):

    if action == "refund" and amount > 1000:
        return {
            "decision": "approval_required",
            "risk_level": "high",
            "reason": "refund exceeds threshold",
        }

    return {
        "decision": "approved",
        "risk_level": "low",
        "reason": "within allowed threshold",
    }