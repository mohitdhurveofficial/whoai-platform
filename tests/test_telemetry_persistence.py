"""
Real-DB integration test for the gateway telemetry-persistence boundary.

Unlike the other gateway tests, this one uses a genuine SQLAlchemy session
backed by in-memory aiosqlite instead of a MagicMock. That distinction is the
whole point: the missing-commit bug was invisible to mock-backed tests because
`db.commit()` was a no-op that asserted nothing about durability. Here we run a
successful request through the real gateway handler and then open a SEPARATE
session to confirm the rows actually survived the request's session teardown.

If the gateway's success path forgets to commit, `get_db()` closes the session
and rolls back SpendLog / UsageMetrics / the REQUEST_COMPLETED ActivityLog /
the spend counters — and every assertion below fails.
"""
import uuid
from decimal import Decimal

import jwt
import pytest
import pytest_asyncio
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from database.models import (
    ActivityLog,
    Agent,
    Base,
    Organization,
    SpendLog,
    UsageMetrics,
)
from database.session import get_db
from runtime.main import app
from runtime.routers import gateway
from runtime.telemetry.activity_logger import ActivityAction


# A deterministic fake OpenAI/Anthropic response with real usage numbers so the
# gateway computes a non-zero cost it must then persist.
FAKE_USAGE = {"prompt_tokens": 100, "completion_tokens": 200, "total_tokens": 300}


def _token(agent_id: str, org_id: str) -> str:
    return jwt.encode({"sub": agent_id, "org": org_id}, gateway.GATEWAY_SECRET, algorithm="HS256")


@pytest_asyncio.fixture
async def db_factory():
    """A fresh in-memory async SQLite database with the full schema created."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    maker = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    yield maker
    await engine.dispose()


async def _seed(maker, *, daily_budget=Decimal("0"), monthly_budget=Decimal("0")):
    org_id = "org-" + uuid.uuid4().hex
    agent_id = "agent-" + uuid.uuid4().hex
    async with maker() as s:
        s.add(Organization(id=org_id, name="Acme", slug="acme-" + uuid.uuid4().hex, status="ACTIVE"))
        s.add(
            Agent(
                id=agent_id,
                name="Worker",
                organizationId=org_id,
                clientId="client-" + uuid.uuid4().hex,
                clientSecret="secret",
                apiKey="key-" + uuid.uuid4().hex,
                status="ACTIVE",
                dailyBudget=daily_budget,
                monthlyBudget=monthly_budget,
            )
        )
        await s.commit()
    return org_id, agent_id


class _FakeProvider:
    """Stands in for a real OpenAI/Anthropic provider; returns fixed usage."""

    def __init__(self, provider_name):
        self.provider_name = provider_name

    async def chat_completion(self, model, messages, **kwargs):
        return {
            "id": "chatcmpl-fake",
            "choices": [{"message": {"role": "assistant", "content": "hello"}}],
            "model": model,
            "provider": self.provider_name,
            "usage": FAKE_USAGE,
        }


def _override_db(maker):
    async def _dep():
        async with maker() as session:
            try:
                yield session
            finally:
                await session.close()

    return _dep


async def _post_completion(maker, monkeypatch, provider, agent_id, org_id):
    """Drive one successful request through the real gateway handler."""
    from httpx import ASGITransport, AsyncClient

    monkeypatch.setattr(
        gateway.ProviderFactory,
        "get_provider",
        classmethod(lambda cls, name, **kw: _FakeProvider(name)),
    )
    app.dependency_overrides[get_db] = _override_db(maker)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            return await ac.post(
                "/api/v1/chat/completions",
                json={"provider": provider, "model": "gpt-4o", "messages": [{"role": "user", "content": "hi"}]},
                headers={"Authorization": f"Bearer {_token(agent_id, org_id)}"},
            )
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
@pytest.mark.parametrize("provider", ["openai", "anthropic"])
async def test_successful_request_persists_telemetry(db_factory, monkeypatch, provider):
    """A successful OpenAI/Anthropic request must durably write SpendLog,
    UsageMetrics, the REQUEST_COMPLETED ActivityLog, and the spend counters.

    This is the exact regression that the missing db.commit() caused: the
    request succeeds (HTTP 200) but every spend row is silently rolled back.
    """
    org_id, agent_id = await _seed(db_factory)

    resp = await _post_completion(db_factory, monkeypatch, provider, agent_id, org_id)
    assert resp.status_code == 200, resp.text

    # Re-open a brand-new session: only COMMITTED rows are visible here.
    async with db_factory() as verify:
        spend_rows = (await verify.execute(select(SpendLog).where(SpendLog.agentId == agent_id))).scalars().all()
        assert len(spend_rows) == 1, "SpendLog was rolled back — telemetry not persisted"
        assert spend_rows[0].cost > 0

        metrics = (await verify.execute(select(UsageMetrics).where(UsageMetrics.agentId == agent_id))).scalars().all()
        assert len(metrics) == 1, "UsageMetrics was rolled back"
        assert metrics[0].totalRequests == 1
        assert metrics[0].totalTokens == FAKE_USAGE["total_tokens"]

        completed = (
            await verify.execute(
                select(ActivityLog).where(
                    ActivityLog.agentId == agent_id,
                    ActivityLog.action == ActivityAction.REQUEST_COMPLETED,
                )
            )
        ).scalars().all()
        assert len(completed) == 1, "REQUEST_COMPLETED ActivityLog was rolled back"

        agent = (await verify.execute(select(Agent).where(Agent.id == agent_id))).scalar_one()
        assert agent.currentDailySpend > 0, "Agent spend counter was rolled back"


@pytest.mark.asyncio
async def test_persisted_spend_is_visible_to_budget_sum(db_factory, monkeypatch):
    """The budget engine sums SpendLog. Prove that after a successful request
    the persisted spend is actually visible to that sum — i.e. budgets can now
    see real usage (Step 16) rather than always reading $0."""
    org_id, agent_id = await _seed(db_factory)

    resp = await _post_completion(db_factory, monkeypatch, "openai", agent_id, org_id)
    assert resp.status_code == 200, resp.text

    async with db_factory() as verify:
        total = (
            await verify.execute(
                select(func.coalesce(func.sum(SpendLog.cost), 0)).where(SpendLog.organizationId == org_id)
            )
        ).scalar()
        assert Decimal(str(total)) > 0, "Budget sum sees $0 — successful spend never persisted"


@pytest.mark.asyncio
async def test_budget_blocks_after_spend_accumulates(db_factory, monkeypatch):
    """End-to-end proof of Step 17: with a tiny daily budget, the first request
    succeeds and persists spend; the second request is then blocked with HTTP
    402 because the persisted spend now exceeds the limit. This can only pass if
    telemetry from request #1 was actually committed."""
    # gpt-4o: 100 in * 0.005/1k + 200 out * 0.015/1k = 0.0005 + 0.003 = 0.0035
    org_id, agent_id = await _seed(db_factory, daily_budget=Decimal("0.0001"))

    first = await _post_completion(db_factory, monkeypatch, "openai", agent_id, org_id)
    assert first.status_code == 200, first.text

    second = await _post_completion(db_factory, monkeypatch, "openai", agent_id, org_id)
    assert second.status_code == 402, f"Expected budget block, got {second.status_code}: {second.text}"
    assert second.json()["error"] == "Budget exceeded"
