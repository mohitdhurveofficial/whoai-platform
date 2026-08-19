"""Plan request-quota entitlement: table, reservation, and gateway enforcement.

plans.json is the contract both planes read. These tests pin the numbers the
pricing page sells to the numbers the gateway enforces, so the two can only
drift together.
"""
import json
import os
from decimal import Decimal
from unittest.mock import MagicMock

import httpx
import jwt
import pytest
from fastapi.testclient import TestClient

from conftest import FakeSession
from database.models import ActivityLog, Agent, Organization
from database.session import get_db
from runtime.entitlements.plans import (
    PLANS,
    has_feature,
    monthly_request_quota,
    normalize_tier,
    plan_config,
    retention_days,
)
from runtime.entitlements.quota_service import (
    PLAN_REQUEST_QUOTA_EXCEEDED,
    release_request_quota,
    reserve_request_quota,
)
from runtime.main import app
from runtime.routers import gateway


# ── plans.json table ──────────────────────────────────────────────────────────


def test_plans_load_from_the_shared_file():
    """The Python table is the file, not a copy of it."""
    path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "plans.json")
    with open(path) as f:
        raw = json.load(f)["plans"]

    assert set(PLANS) == {tier.upper() for tier in raw}
    for tier, limits in raw.items():
        assert monthly_request_quota(tier) == limits["monthlyRequests"]
        assert retention_days(tier) == limits["retentionDays"]


def test_unknown_tier_degrades_to_free():
    """A bad tier in the database must fail closed onto the most restrictive
    plan, never open onto unlimited."""
    assert normalize_tier(None) == "FREE"
    assert normalize_tier("") == "FREE"
    assert normalize_tier("bogus") == "FREE"
    assert normalize_tier("starter") == "STARTER"
    assert plan_config("nope") is PLANS["FREE"]


def test_only_enterprise_is_unlimited():
    assert monthly_request_quota("ENTERPRISE") is None
    for tier in ("FREE", "STARTER", "GROWTH", "BUSINESS"):
        assert isinstance(monthly_request_quota(tier), int)


def test_legacy_pro_tier_maps_onto_business():
    """Organizations sold the old PRO plan still have "PRO" in the database.

    Without the alias they would normalize to FREE and be cut off at the free
    quota — a paying customer throttled by a rename.
    """
    assert normalize_tier("PRO") == "BUSINESS"
    assert normalize_tier("pro") == "BUSINESS"
    assert monthly_request_quota("PRO") == monthly_request_quota("BUSINESS")


def test_feature_entitlements_match_what_is_sold():
    """The gateway gates capabilities on these flags; the pricing page sells
    them. Both read this table, so it is the only place they can disagree."""
    assert has_feature("FREE", "budgetEnforcement") is False
    assert has_feature("STARTER", "budgetEnforcement") is True
    assert has_feature("STARTER", "anomalyDetection") is False
    assert has_feature("GROWTH", "anomalyDetection") is True
    assert has_feature("PRO", "anomalyDetection") is True  # via the alias
    assert has_feature(None, "killSwitch") is False

    # Not built. Never advertise them as included on any plan.
    for tier in PLANS:
        assert has_feature(tier, "sso") is False
        assert has_feature(tier, "auditExport") is False


def test_features_are_monotonic_across_plans():
    """No capability may be lost by upgrading — an entitlement table that dips
    would deny a customer something a cheaper plan gave them."""
    order = ["FREE", "STARTER", "GROWTH", "BUSINESS", "ENTERPRISE"]
    for feature in PLANS["FREE"]["features"]:
        enabled = [has_feature(tier, feature) for tier in order]
        assert enabled == sorted(enabled), f"{feature} is not monotonic: {enabled}"


# ── reservation ───────────────────────────────────────────────────────────────


class _CountingDb:
    """Applies the quota SQL's semantics to an in-memory counter."""

    def __init__(self, current: int = 0):
        self.current = current
        self.statements = []

    async def execute(self, statement, params=None):
        sql = " ".join(str(statement).split())
        self.statements.append(sql)
        if "+ 1 <=" in sql:
            if self.current + 1 > params["quota"]:
                return MagicMock(rowcount=0)
            self.current += 1
            return MagicMock(rowcount=1)
        if "CASE" in sql:
            self.current = max(0, self.current - 1)
            return MagicMock(rowcount=1)
        self.current += 1
        return MagicMock(rowcount=1)


@pytest.mark.asyncio
async def test_reserve_allows_up_to_the_quota_then_refuses():
    db = _CountingDb()

    assert [await reserve_request_quota(db, "org-1", 3) for _ in range(3)] == [True] * 3
    assert db.current == 3

    assert await reserve_request_quota(db, "org-1", 3) is False
    # A refused reservation must not consume allowance.
    assert db.current == 3


@pytest.mark.asyncio
async def test_reserve_is_guarded_in_the_where_clause():
    """The limit check has to be part of the UPDATE, not a read-then-write —
    otherwise concurrent requests all read the same pre-increment counter."""
    db = _CountingDb()
    await reserve_request_quota(db, "org-1", 10)

    sql = db.statements[-1]
    assert sql.startswith('UPDATE "Organization"')
    assert '"currentMonthlyRequests" + 1 <= :quota' in sql


@pytest.mark.asyncio
async def test_unlimited_plans_still_count():
    """Enterprise never blocks, but the counter backs the billing UI and
    usage-based true-ups, so it must stay accurate."""
    db = _CountingDb()

    assert await reserve_request_quota(db, "org-1", None) is True
    assert db.current == 1
    assert "<=" not in db.statements[-1]


@pytest.mark.asyncio
async def test_release_hands_back_allowance_and_clamps_at_zero():
    db = _CountingDb()
    await reserve_request_quota(db, "org-1", 5)
    await release_request_quota(db, "org-1")
    assert db.current == 0

    # A double release must not mint allowance that was never consumed.
    await release_request_quota(db, "org-1")
    assert db.current == 0


# ── gateway enforcement ───────────────────────────────────────────────────────


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
        "subscriptionTier": "FREE",
        "dailyBudget": Decimal("50"),
        "monthlyBudget": Decimal("500"),
    }
    data.update(overrides)
    return Organization(**data)


def _post_completion(fake_db, monkeypatch):
    token = jwt.encode({"sub": "agent-1", "org": "org-1"}, gateway.GATEWAY_SECRET, algorithm="HS256")

    async def override_db():
        yield fake_db

    async def provider_called(*_args, **_kwargs):
        raise AssertionError("Provider must not be called once the plan quota is exhausted")

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


def test_gateway_refuses_when_quota_is_exhausted(monkeypatch):
    fake_db = FakeSession(
        agent=_agent(),
        organization=_organization(),
        quota_reserved=False,
    )

    response = _post_completion(fake_db, monkeypatch)

    assert response.status_code == 402
    body = response.json()
    assert body["reason"] == PLAN_REQUEST_QUOTA_EXCEEDED
    assert body["plan"] == "FREE"
    assert body["monthlyRequests"] == PLANS["FREE"]["monthlyRequests"]
    assert body["upgradeUrl"] == "/billing"
    # The refusal is audited, and it is *not* a kill switch: exhausting a plan
    # allowance is a billing event, so the agent stays ACTIVE.
    assert fake_db.added(ActivityLog)[-1].action == "REQUEST_BLOCKED"
    assert fake_db.organization.status == "ACTIVE"
    assert fake_db.agent.status == "ACTIVE"
    fake_db.commit.assert_awaited()


def test_gateway_lets_an_in_quota_request_past_the_gate(monkeypatch):
    """Guards the gate itself, so a quota bug can't silently block everyone.

    With the reservation succeeding, this request must run *past* the quota
    check and stop at the next gate down (BYOK — FakeSession has no credential).
    """
    fake_db = FakeSession(agent=_agent(), organization=_organization())

    response = _post_completion(fake_db, monkeypatch)

    assert response.json()["reason"] == "BYOK_KEY_MISSING"
