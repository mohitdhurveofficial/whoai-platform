

from sqlalchemy import select, text, func
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Agent, Approval, Decision, Policy


async def database_check(db: AsyncSession) -> dict:
    try:
        await db.execute(text("SELECT 1"))
        return {"database": True}
    except Exception as e:
        return {"database": False, "error": str(e)}


async def policy_check(db: AsyncSession) -> dict:
    try:
        result = await db.execute(select(func.count()).select_from(Policy))
        count = result.scalar() or 0

        return {
            "policies": True,
            "policy_count": count,
        }
    except Exception as e:
        return {"policies": False, "error": str(e)}


async def agent_check(db: AsyncSession) -> dict:
    try:
        result = await db.execute(select(func.count()).select_from(Agent))
        count = result.scalar() or 0

        return {
            "agents": True,
            "agent_count": count,
        }
    except Exception as e:
        return {"agents": False, "error": str(e)}


async def approval_check(db: AsyncSession) -> dict:
    try:
        result = await db.execute(select(func.count()).select_from(Approval))
        count = result.scalar() or 0

        return {
            "approvals": True,
            "approval_count": count,
        }
    except Exception as e:
        return {"approvals": False, "error": str(e)}


async def decision_check(db: AsyncSession) -> dict:
    try:
        result = await db.execute(select(func.count()).select_from(Decision))
        count = result.scalar() or 0

        return {
            "decisions": True,
            "decision_count": count,
        }
    except Exception as e:
        return {"decisions": False, "error": str(e)}


async def run_all_checks(db: AsyncSession) -> dict:
    database = await database_check(db)
    policies = await policy_check(db)
    agents = await agent_check(db)
    approvals = await approval_check(db)
    decisions = await decision_check(db)

    healthy = all([
        database.get("database", False),
        policies.get("policies", False),
        agents.get("agents", False),
        approvals.get("approvals", False),
        decisions.get("decisions", False),
    ])

    return {
        "status": "healthy" if healthy else "warning",
        "database": database,
        "policies": policies,
        "agents": agents,
        "approvals": approvals,
        "decisions": decisions,
    }