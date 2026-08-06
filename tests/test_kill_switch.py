from decimal import Decimal
from unittest.mock import MagicMock

import httpx
import jwt
import pytest
from fastapi.testclient import TestClient

from conftest import FakeSession
from database.models import ActivityLog, Agent, Alert, Organization
from database.session import get_db
from runtime.killswitch.kill_switch_service import (
    DAILY_BUDGET_EXCEEDED,
    MANUAL_PAUSE,
    MANUAL_RESUME,
    MONTHLY_BUDGET_EXCEEDED,
    check_agent_state,
    pause_agent,
    pause_organization,
    resume_agent,
    resume_organization,
)
from runtime.main import app
from runtime.routers import gateway


def _agent(**overrides):
    data = {
        "id": "agent-1",
        "name": "Support Agent",
        "organizationId": "org-1",
        "clientId": "client-1",
        "clientSecret": "secret",
        "apiKey": "key",
        "status": "ACTIVE",
        "dailyBudget": Decimal("10"),
        "monthlyBudget": Decimal("100"),
    }
    data.update(overrides)
    return Agent(**data)


def _organization(**overrides):
    data = {
        "id": "org-1",
        "name": "WHOAI",
        "slug": "whoai",
        "status": "ACTIVE",
        "dailyBudget": Decimal("50"),
        "monthlyBudget": Decimal("500"),
    }
    data.update(overrides)
    return Organization(**data)


def _added(db, model):
    return [call.args[0] for call in db.add.call_args_list if isinstance(call.args[0], model)]


@pytest.mark.asyncio
async def test_pause_agent():
    db = MagicMock()
    db.add = MagicMock()
    agent = _agent()

    await pause_agent(
        db,
        agent,
        reason=DAILY_BUDGET_EXCEEDED,
        budget_limit=Decimal("10"),
        current_spend=Decimal("15"),
    )

    assert agent.status == "PAUSED"
    assert agent.pauseReason == DAILY_BUDGET_EXCEEDED
    assert agent.pausedAt is not None
    assert _added(db, Alert)[0].type == "AGENT_PAUSED"
    assert _added(db, ActivityLog)[0].action == "AGENT_PAUSED"


@pytest.mark.asyncio
async def test_resume_agent():
    db = MagicMock()
    db.add = MagicMock()
    agent = _agent(status="PAUSED", pauseReason=MANUAL_PAUSE)

    await resume_agent(db, agent, resumed_by="user-1")

    assert agent.status == "ACTIVE"
    assert agent.pauseReason is None
    assert agent.pausedAt is None
    assert _added(db, Alert)[0].type == "AGENT_RESUMED"
    assert _added(db, ActivityLog)[0].action == "AGENT_RESUMED"


@pytest.mark.asyncio
async def test_pause_organization():
    db = MagicMock()
    db.add = MagicMock()
    organization = _organization()

    await pause_organization(
        db,
        organization,
        reason=MONTHLY_BUDGET_EXCEEDED,
        budget_limit=Decimal("500"),
        current_spend=Decimal("650"),
        agent_id="agent-1",
    )

    assert organization.status == "PAUSED"
    assert organization.pauseReason == MONTHLY_BUDGET_EXCEEDED
    assert _added(db, Alert)[0].type == "ORG_PAUSED"
    assert _added(db, ActivityLog)[0].action == "ORG_PAUSED"


@pytest.mark.asyncio
async def test_resume_organization():
    db = MagicMock()
    db.add = MagicMock()
    organization = _organization(status="PAUSED", pauseReason=MANUAL_PAUSE)

    await resume_organization(db, organization, resumed_by="user-1")

    assert organization.status == "ACTIVE"
    assert organization.pauseReason is None
    assert organization.pausedAt is None
    assert _added(db, Alert)[0].type == "ORG_RESUMED"
    assert _added(db, ActivityLog)[0].action == "ORG_RESUMED"


@pytest.mark.asyncio
async def test_activity_logging_for_blocked_agent_state():
    db = MagicMock()
    db.add = MagicMock()
    agent = _agent(status="PAUSED", pauseReason=DAILY_BUDGET_EXCEEDED)

    decision = await check_agent_state(db, agent)

    assert decision == {
        "allowed": False,
        "error": "Agent paused",
        "reason": DAILY_BUDGET_EXCEEDED,
    }
    assert _added(db, ActivityLog)[0].action == "REQUEST_BLOCKED"


def _post_completion(fake_db, monkeypatch, *, refusal: str):
    """Drive one gateway request against `fake_db`, asserting no provider call."""
    token = jwt.encode({"sub": "agent-1", "org": "org-1"}, gateway.GATEWAY_SECRET, algorithm="HS256")

    async def override_db():
        yield fake_db

    async def provider_called(*_args, **_kwargs):
        raise AssertionError(refusal)

    app.dependency_overrides[get_db] = override_db
    monkeypatch.setattr(httpx.AsyncClient, "post", provider_called)

    try:
        return TestClient(app).post(
            "/api/v1/gateway/completions",
            json={"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello"}]},
            headers={"Authorization": f"Bearer {token}"},
        )
    finally:
        app.dependency_overrides.clear()


def test_gateway_blocks_paused_agent(monkeypatch):
    fake_db = FakeSession(
        agent=_agent(status="PAUSED", pauseReason=DAILY_BUDGET_EXCEEDED),
        organization=_organization(),
    )

    response = _post_completion(
        fake_db, monkeypatch,
        refusal="Provider must not be called when kill switch blocks a request",
    )

    assert response.status_code == 403
    assert response.json() == {
        "error": "Agent paused",
        "reason": DAILY_BUDGET_EXCEEDED,
    }
    assert fake_db.added(ActivityLog)[-1].action == "REQUEST_BLOCKED"


def test_budget_triggered_pause(monkeypatch):
    """A request that cannot be reserved against the agent's daily budget must
    trip the kill switch, not merely return 402."""
    agent = _agent(currentDailySpend=Decimal("15"))
    fake_db = FakeSession(agent=agent, organization=_organization(), agent_reserved=False)

    response = _post_completion(
        fake_db, monkeypatch,
        refusal="Provider must not be called when budget auto-pauses an agent",
    )

    assert response.status_code == 402
    assert response.json()["error"] == "Budget exceeded"
    assert agent.status == "PAUSED"
    assert agent.pauseReason == DAILY_BUDGET_EXCEEDED
    assert any(alert.type == "AGENT_PAUSED" for alert in fake_db.added(Alert))
    assert any(log.action == "AGENT_PAUSED" for log in fake_db.added(ActivityLog))


def test_gateway_blocks_paused_organization(monkeypatch):
    fake_db = FakeSession(
        agent=_agent(),
        organization=_organization(status="PAUSED", pauseReason=MONTHLY_BUDGET_EXCEEDED),
    )

    response = _post_completion(
        fake_db, monkeypatch,
        refusal="Provider must not be called when organization is paused",
    )

    assert response.status_code == 403
    assert response.json() == {
        "error": "Organization paused",
        "reason": MONTHLY_BUDGET_EXCEEDED,
    }
    assert fake_db.added(ActivityLog)[-1].action == "REQUEST_BLOCKED"


def test_budget_triggered_organization_pause(monkeypatch):
    """Same for the org-level budget: breaching it pauses the organization."""
    organization = _organization(currentMonthlySpend=Decimal("650"))
    fake_db = FakeSession(agent=_agent(), organization=organization, org_reserved=False)

    response = _post_completion(
        fake_db, monkeypatch,
        refusal="Provider must not be called when budget auto-pauses an organization",
    )

    assert response.status_code == 402
    assert response.json()["error"] == "Budget exceeded"
    assert organization.status == "PAUSED"
    assert organization.pauseReason == MONTHLY_BUDGET_EXCEEDED
    assert any(alert.type == "ORG_PAUSED" for alert in fake_db.added(Alert))
    assert any(log.action == "ORG_PAUSED" for log in fake_db.added(ActivityLog))
