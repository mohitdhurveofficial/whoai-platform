def evaluate_action(
    agent,
    action,
    amount,
    resource,
    trace_id,
):

    if action == "refund" and amount > 1000:

        return {
            "trace_id": trace_id,
            "agent": agent,
            "resource": resource,
            "action": action,
            "amount": amount,
            "decision": "approval_required",
            "risk_level": "high",
            "reason": "refund exceeds threshold",
        }

    return {
        "trace_id": trace_id,
        "agent": agent,
        "resource": resource,
        "action": action,
        "amount": amount,
        "decision": "approved",
        "risk_level": "low",
        "reason": "within allowed threshold",
    }