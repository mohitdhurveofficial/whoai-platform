DEFAULT_REFUND_THRESHOLD = 1000


def evaluate_action(
    agent,
    action,
    amount,
    resource,
    trace_id,
):
    """
    Temporary evaluator.

    NOTE:
    This is still using a hardcoded rule.
    Phase 2 is only fully complete after policies are loaded
    from the PostgreSQL policies table instead of using the
    threshold below.
    """

    if (
        action == "refund"
        and amount > DEFAULT_REFUND_THRESHOLD
    ):
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