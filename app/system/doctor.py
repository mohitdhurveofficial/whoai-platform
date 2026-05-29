

from sqlalchemy.ext.asyncio import AsyncSession

from app.system.checks import run_all_checks


class WhoAIDoctor:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def health(self) -> dict:
        return await run_all_checks(self.db)

    async def readiness(self) -> dict:
        checks = await run_all_checks(self.db)

        production_ready = (
            checks.get("status") == "healthy"
        )

        return {
            "production_ready": production_ready,
            "checks": checks,
        }

    async def diagnostics(self) -> dict:
        checks = await run_all_checks(self.db)

        issues = []

        if not checks["database"].get("database"):
            issues.append("Database unavailable")

        if checks["policies"].get("policy_count", 0) == 0:
            issues.append("No policies configured")

        if checks["agents"].get("agent_count", 0) == 0:
            issues.append("No agents configured")

        score = max(0, 100 - (len(issues) * 20))

        return {
            "score": score,
            "status": checks["status"],
            "issues": issues,
            "recommendations": [
                f"Fix: {issue}" for issue in issues
            ],
        }

    async def repair(self) -> dict:
        return {
            "status": "success",
            "message": "Doctor repair framework initialized",
            "actions": [
                "schema_validation",
                "policy_validation",
                "agent_validation",
            ],
        }