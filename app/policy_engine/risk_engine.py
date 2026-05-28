

class RiskEngine:
    def calculate_risk(self, action_data: dict):
        action = action_data.get("action")
        amount = action_data.get("amount", 0)

        # Default risk
        risk = "low"
        score = 10
        reasons = []

        # Refund risk evaluation
        if action == "refund":
            if amount > 5000:
                risk = "high"
                score = 95
                reasons.append("Refund exceeds critical threshold")

            elif amount > 500:
                risk = "medium"
                score = 65
                reasons.append("Refund exceeds medium threshold")

            elif amount > 50:
                risk = "low"
                score = 30
                reasons.append("Refund exceeds standard threshold")

        return {
            "risk": risk,
            "score": score,
            "reasons": reasons,
        }


risk_engine = RiskEngine()