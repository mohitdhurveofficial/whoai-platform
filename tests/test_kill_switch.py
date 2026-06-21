from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import httpx
import jwt
import pytest
from fastapi.testclient import TestClient

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


def test_gateway_blocks_paused_agent(monkeypatch):
    token = jwt.encode({"sub": "agent-1", "org": "org-1"}, gateway.GATEWAY_SECRET, algorithm="HS256")
    fake_db = MagicMock()
    fake_db.execute = AsyncMock(side_effect=[
        MagicMock(scalar_one_or_none=MagicMock(return_value=_agent(status="PAUSED", pauseReason=DAILY_BUDGET_EXCEEDED))),
        MagicMock(scalar_one_or_none=MagicMock(return_value=_organization())),
    ])
    fake_db.add = MagicMock()
    fake_db.commit = AsyncMock()

    async def override_db():
        yield fake_db

    async def provider_called(*_args, **_kwargs):
        raise AssertionError("Provider must not be called when kill switch blocks a request")

    app.dependency_overrides[get_db] = override_db
    monkeypatch.setattr(httpx.AsyncClient, "post", provider_called)

    try:
        client = TestClient(app)
        response = client.post(
            "/api/v1/gateway/completions",
            json={"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello"}]},
            headers={"Authorization": f"Bearer {token}"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
    assert response.json() == {
        "error": "Agent paused",
        "reason": DAILY_BUDGET_EXCEEDED,
    }
    assert _added(fake_db, ActivityLog)[-1].action == "REQUEST_BLOCKED"


def test_budget_blocks_agent_request(monkeypatch):
    """When the agent's atomic budget pre-reservation fails, the request is
    blocked with HTTP 402, the provider is never called, and the rejection is
    audit-logged as BUDGET_EXCEEDED. (Budget exhaustion blocks the request; it
    does not flip the agent to PAUSED — that auto-recovers on the next reset.)"""
    token = jwt.encode({"sub": "agent-1", "org": "org-1"}, gateway.GATEWAY_SECRET, algorithm="HS256")
    fake_db = MagicMock()
    fake_db.execute = AsyncMock(side_effect=[
        MagicMock(scalar_one_or_none=MagicMock(return_value=_agent())),
        MagicMock(scalar_one_or_none=MagicMock(return_value=_organization())),
    ])
    fake_db.add = MagicMock()
    fake_db.commit = AsyncMock()

    async def override_db():
        yield fake_db

    async def blocked_agent_reserve(_db, _agent_id, _cost):
        return False

    async def allowed_org_reserve(_db, _org_id, _cost):
        return True

    async def provider_called(*_args, **_kwargs):
        raise AssertionError("Provider must not be called when the budget blocks a request")

    app.dependency_overrides[get_db] = override_db
    monkeypatch.setattr(gateway, "pre_reserve_agent_budget", blocked_agent_reserve)
    monkeypatch.setattr(gateway, "pre_reserve_org_budget", allowed_org_reserve)
    monkeypatch.setattr(httpx.AsyncClient, "post", provider_called)

    try:
        client = TestClient(app)
        response = client.post(
            "/api/v1/gateway/completions",
            json={"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello"}]},
            headers={"Authorization": f"Bearer {token}"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 402
    assert response.json()["error"] == "Budget exceeded"
    assert response.json()["reason"] == "AGENT_DAILY_LIMIT_EXCEEDED"
    assert any(log.action == "BUDGET_EXCEEDED" for log in _added(fake_db, ActivityLog))


def test_gateway_blocks_paused_organization(monkeypatch):
    token = jwt.encode({"sub": "agent-1", "org": "org-1"}, gateway.GATEWAY_SECRET, algorithm="HS256")
    fake_db = MagicMock()
    fake_db.execute = AsyncMock(side_effect=[
        MagicMock(scalar_one_or_none=MagicMock(return_value=_agent())),
        MagicMock(scalar_one_or_none=MagicMock(return_value=_organization(status="PAUSED", pauseReason=MONTHLY_BUDGET_EXCEEDED))),
    ])
    fake_db.add = MagicMock()
    fake_db.commit = AsyncMock()

    async def override_db():
        yield fake_db

    async def provider_called(*_args, **_kwargs):
        raise AssertionError("Provider must not be called when organization is paused")

    app.dependency_overrides[get_db] = override_db
    monkeypatch.setattr(httpx.AsyncClient, "post", provider_called)

    try:
        client = TestClient(app)
        response = client.post(
            "/api/v1/gateway/completions",
            json={"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello"}]},
            headers={"Authorization": f"Bearer {token}"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
    assert response.json() == {
        "error": "Organization paused",
        "reason": MONTHLY_BUDGET_EXCEEDED,
    }
    assert _added(fake_db, ActivityLog)[-1].action == "REQUEST_BLOCKED"


def test_budget_blocks_organization_request(monkeypatch):
    """When the org's atomic budget pre-reservation fails, the agent's earlier
    reservation is rolled back, the request is blocked with HTTP 402, the
    provider is never called, and the rejection is audit-logged as
    BUDGET_EXCEEDED. (Blocks the request; does not flip the org to PAUSED.)"""
    token = jwt.encode({"sub": "agent-1", "org": "org-1"}, gateway.GATEWAY_SECRET, algorithm="HS256")
    fake_db = MagicMock()
    fake_db.execute = AsyncMock(side_effect=[
        MagicMock(scalar_one_or_none=MagicMock(return_value=_agent())),
        MagicMock(scalar_one_or_none=MagicMock(return_value=_organization())),
    ])
    fake_db.add = MagicMock()
    fake_db.commit = AsyncMock()

    async def override_db():
        yield fake_db

    async def allowed_agent_reserve(_db, _agent_id, _cost):
        return True

    async def blocked_org_reserve(_db, _org_id, _cost):
        return False

    async def noop_release(_db, _agent_id, _cost):
        return None

    async def provider_called(*_args, **_kwargs):
        raise AssertionError("Provider must not be called when the budget blocks a request")

    app.dependency_overrides[get_db] = override_db
    monkeypatch.setattr(gateway, "pre_reserve_agent_budget", allowed_agent_reserve)
    monkeypatch.setattr(gateway, "pre_reserve_org_budget", blocked_org_reserve)
    monkeypatch.setattr(gateway, "release_agent_budget", noop_release)
    monkeypatch.setattr(httpx.AsyncClient, "post", provider_called)

    try:
        client = TestClient(app)
        response = client.post(
            "/api/v1/gateway/completions",
            json={"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello"}]},
            headers={"Authorization": f"Bearer {token}"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 402
    assert response.json()["error"] == "Budget exceeded"
    assert response.json()["reason"] == "ORG_DAILY_LIMIT_EXCEEDED"
    assert any(log.action == "BUDGET_EXCEEDED" for log in _added(fake_db, ActivityLog))
