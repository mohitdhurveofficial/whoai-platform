import sys
from pathlib import Path

# Add project root to Python path
sys.path.append(str(Path(__file__).resolve().parents[1]))
import asyncio

from sqlalchemy import select

from database.session import AsyncSessionLocal
from database.models import (
    Agent,
    AgentStatus,
    Policy,
    Approval,
    ApprovalStatus,
    AgentMetric,
)

from datetime import datetime
import secrets


async def seed():
    async with AsyncSessionLocal() as db:

        # =========================
        # Create Demo Agent
        # =========================

        result = await db.execute(
            select(Agent).where(Agent.name == "SupportBot-Refunds")
        )

        agent = result.scalar_one_or_none()

        if not agent:
            agent = Agent(
                name="SupportBot-Refunds",
                owner_email="demo@whoai.dev",
                environment="dev",
                agent_token=secrets.token_urlsafe(32),
                status=AgentStatus.ACTIVE,
            )

            db.add(agent)
            await db.commit()
            await db.refresh(agent)

            print("Demo agent created")
        else:
            print("Demo agent already exists")

        # =========================
        # Create Demo Policy
        # =========================

        result = await db.execute(
            select(Policy).where(
                Policy.agent_id == agent.id,
                Policy.action_type == "refund.secure",
            )
        )

        policy = result.scalar_one_or_none()

        if not policy:
            policy = Policy(
                agent_id=agent.id,
                action_type="refund.secure",
                max_amount=5000,
                environment="dev",
                needs_approval=False,
            )

            db.add(policy)
            await db.commit()

            print("Demo policy created")
        else:
            print("Demo policy already exists")

        # =========================
        # Create Metrics Row
        # =========================

        result = await db.execute(
            select(AgentMetric).where(
                AgentMetric.agent_id == agent.id
            )
        )

        metric = result.scalar_one_or_none()

        if not metric:
            metric = AgentMetric(
                agent_id=agent.id,
                authorize_count=0,
                updated_at=datetime.utcnow(),
            )

            db.add(metric)
            await db.commit()

            print("Metrics row created")
        else:
            print("Metrics row already exists")

        # =========================
        # Create Demo Approval
        # =========================

        result = await db.execute(
            select(Approval).where(
                Approval.agent_id == agent.id
            )
        )

        approval = result.scalar_one_or_none()

        if not approval:
            approval = Approval(
                agent_id=agent.id,
                action_type="refund.secure",
                resource_json='{"order_id":"ORD-DEMO-1","amount":3000}',
                context_json='{"environment":"dev"}',
                policy_id=policy.id,
                status=ApprovalStatus.PENDING,
            )

            db.add(approval)
            await db.commit()

            print("Demo approval created")
        else:
            print("Demo approval already exists")

        print("\nSeed complete")
        print(f"Agent ID: {agent.id}")
        print(f"API Key: {agent.agent_token}")


if __name__ == "__main__":
    asyncio.run(seed())