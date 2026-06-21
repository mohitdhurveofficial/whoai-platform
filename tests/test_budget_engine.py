from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import httpx
import jwt
import pytest
from fastapi.testclient import TestClient

from database.models import ActivityLog, Agent, Alert, Organization
from database.session import get_db
from runtime.budget.budget_service import (
    AGENT_DAILY_LIMIT_EXCEEDED,
    AGENT_MONTHLY_LIMIT_EXCEEDED,
    ORG_DAILY_LIMIT_EXCEEDED,
    ORG_MONTHLY_LIMIT_EXCEEDED,
    build_budget_status,
    check_agent_budget,
    check_org_budget,
)
from runtime.main import app
from runtime.routers import gateway


def _sum_result(value: Decimal):
    result = MagicMock()
    result.scalar.return_value = value
    return result


def _db_with_spend(*spend_values: Decimal):
    db = MagicMock()
    db.execute = AsyncMock(side_effect=[_sum_result(value) for value in spend_values])
    db.add = MagicMock()
    return db


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
        "dailyBudget": Decimal("50"),
        "monthlyBudget": Decimal("500"),
    }
    data.update(overrides)
    return Organization(**data)


@pytest.mark.asyncio
async def test_agent_daily_limit():
    db = _db_with_spend()
    decision = await check_agent_budget(db, _agent(currentDailySpend=Decimal("10")))

    assert decision["allowed"] is False
    assert decision["reason"] == AGENT_DAILY_LIMIT_EXCEEDED
    added = [call.args[0] for call in db.add.call_args_list]
    assert any(isinstance(item, Alert) for item in added)
    assert any(isinstance(item, ActivityLog) for item in added)


@pytest.mark.asyncio
async def test_agent_monthly_limit():
    db = _db_with_spend()
    decision = await check_agent_budget(db, _agent(currentMonthlySpend=Decimal("100")))

    assert decision["allowed"] is False
    assert decision["reason"] == AGENT_MONTHLY_LIMIT_EXCEEDED


@pytest.mark.asyncio
async def test_org_daily_limit():
    db = _db_with_spend()
    decision = await check_org_budget(db, _organization(currentDailySpend=Decimal("50")), agent_id="agent-1")

    assert decision["allowed"] is False
    assert decision["reason"] == ORG_DAILY_LIMIT_EXCEEDED


@pytest.mark.asyncio
async def test_org_monthly_limit():
    db = _db_with_spend()
    decision = await check_org_budget(db, _organization(currentMonthlySpend=Decimal("500")), agent_id="agent-1")

    assert decision["allowed"] is False
    assert decision["reason"] == ORG_MONTHLY_LIMIT_EXCEEDED


@pytest.mark.asyncio
async def test_alert_creation_and_activity_log_creation():
    db = _db_with_spend()
    await check_agent_budget(db, _agent(currentDailySpend=Decimal("11")))

    added = [call.args[0] for call in db.add.call_args_list]
    alert = next(item for item in added if isinstance(item, Alert))
    activity_log = next(item for item in added if isinstance(item, ActivityLog))

    assert alert.type == "BUDGET_EXCEEDED"
    assert alert.severity == "HIGH"
    assert alert.metadata_["budgetType"] == "AGENT_DAILY"
    assert alert.metadata_["currentSpend"] == 11.0
    assert activity_log.action == "BUDGET_EXCEEDED"
    assert activity_log.metadata_["budgetLimit"] == 10.0


def test_dashboard_calculations():
    status = build_budget_status(Decimal("90"), Decimal("100"))

    assert status["currentSpend"] == 90.0
    assert status["remainingBudget"] == 10.0
    assert status["utilizationPercent"] == 90.0
    assert status["warningPercent"] == 75
    assert status["criticalPercent"] == 90
    assert status["status"] == "CRITICAL"


def test_gateway_blocking(monkeypatch):
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

    # The gateway request path enforces budgets via atomic pre-reservation, not
    # the check_*_budget helpers. Simulate the agent's daily reservation failing.
    async def blocked_agent_reserve(_db, _agent_id, _cost):
        return False

    async def allowed_org_reserve(_db, _org_id, _cost):
        return True

    async def provider_called(*_args, **_kwargs):
        raise AssertionError("Provider must not be called when budget is exceeded")

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
    assert response.json() == {
        "error": "Budget exceeded",
        "reason": AGENT_DAILY_LIMIT_EXCEEDED,
    }
    assert fake_db.commit.called
