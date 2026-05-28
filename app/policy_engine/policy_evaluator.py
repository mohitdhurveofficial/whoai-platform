from app.policy_engine.policy_models import HIGH_REFUND_POLICY


def evaluate_action(action_data: dict):
    action = action_data.get("action")
    amount = action_data.get("amount", 0)

    # Match refund policy
    if (
        action == HIGH_REFUND_POLICY.action
        and amount > HIGH_REFUND_POLICY.amount_gt
    ):
        return {
            "decision": "approval_required",
            "risk": HIGH_REFUND_POLICY.risk_level,
            "matched_policy": HIGH_REFUND_POLICY.name,
            "approver_role": HIGH_REFUND_POLICY.approver_role,
        }

    return {
        "decision": "approved",
        "risk": "low",
        "matched_policy": None,
        "approver_role": None,
    }