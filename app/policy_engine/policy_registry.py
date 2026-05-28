POLICIES = {
    "refund": {
        "threshold": 1000,
        "risk": "high",
        "decision": "approval_required",
        "reason": "refund exceeds threshold"
    },
    "crm_update": {
        "threshold": 0,
        "risk": "low",
        "decision": "approved",
        "reason": "crm update allowed"
    }
}


def evaluate_policy(action: str, amount: float = 0):

    policy = POLICIES.get(action)

    if not policy:
        return {
            "decision": "denied",
            "risk_level": "high",
            "reason": "unknown action"
        }

    if amount > policy["threshold"]:
        return {
            "decision": policy["decision"],
            "risk_level": policy["risk"],
            "reason": policy["reason"]
        }

    return {
        "decision": "approved",
        "risk_level": "low",
        "reason": "within allowed threshold"
    }