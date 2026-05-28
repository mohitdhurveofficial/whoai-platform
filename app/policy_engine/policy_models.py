class Policy:
    def __init__(
        self,
        name,
        action,
        amount_gt=None,
        approval_required=False,
        approver_role=None,
        risk_level="low",
    ):
        self.name = name
        self.action = action
        self.amount_gt = amount_gt
        self.approval_required = approval_required
        self.approver_role = approver_role
        self.risk_level = risk_level


HIGH_REFUND_POLICY = Policy(
    name="High refund approval",
    action="refund",
    amount_gt=50,
    approval_required=True,
    approver_role="manager",
    risk_level="high",
)