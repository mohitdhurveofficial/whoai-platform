approvals = []


def create_approval(data):

    approval = {
        "trace_id": data.get("trace_id"),
        "agent": data.get("agent"),
        "resource": data.get("resource"),
        "action": data.get("action"),
        "amount": data.get("amount"),
        "decision": data.get("decision"),
        "risk_level": data.get("risk_level"),
        "reason": data.get("reason"),
        "status": "pending",
    }

    approvals.append(approval)

    return approval


def list_approvals():

    return approvals