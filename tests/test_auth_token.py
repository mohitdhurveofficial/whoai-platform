import hashlib
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import jwt
from fastapi.testclient import TestClient

from database.models import Agent
from database.session import get_db
from runtime.main import app
from runtime.routers.auth import TOKEN_TTL_SECONDS
from runtime.routers.gateway import GATEWAY_SECRET


RAW_KEY = "whoai_sk_testkey0123456789"
KEY_HASH = hashlib.sha256(RAW_KEY.encode("utf-8")).hexdigest()


def _agent(**overrides):
    data = {
        "id": "agent-1",
        "name": "Support Agent",
        "organizationId": "org-1",
        "clientId": "client-1",
        "clientSecret": "secret",
        "apiKey": KEY_HASH,
        "status": "ACTIVE",
        "dailyBudget": Decimal("10"),
        "monthlyBudget": Decimal("100"),
    }
    data.update(overrides)
    return Agent(**data)


def _override_db(agent):
    fake_db = MagicMock()
    fake_db.execute = AsyncMock(
        return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=agent))
    )

    async def override_db():
        yield fake_db

    return override_db


def test_token_missing_key():
    client = TestClient(app)
    response = client.post("/api/v1/auth/token", json={})
    assert response.status_code == 401
    assert "Missing API key" in response.json()["detail"]


def test_token_invalid_key():
    app.dependency_overrides[get_db] = _override_db(None)
    try:
        client = TestClient(app)
        response = client.post("/api/v1/auth/token", json={"api_key": "whoai_sk_wrong"})
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 401
    assert "Invalid API key" in response.json()["detail"]


def test_token_suspended_agent_rejected():
    app.dependency_overrides[get_db] = _override_db(_agent(status="PAUSED"))
    try:
        client = TestClient(app)
        response = client.post("/api/v1/auth/token", json={"api_key": RAW_KEY})
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 403


def test_token_success_is_valid_gateway_jwt():
    app.dependency_overrides[get_db] = _override_db(_agent())
    try:
        client = TestClient(app)
        response = client.post("/api/v1/auth/token", json={"api_key": RAW_KEY})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == TOKEN_TTL_SECONDS

    # The issued token must be a valid gateway JWT bound to the agent's own org,
    # so the data-plane preserves multi-tenant isolation.
    payload = jwt.decode(data["access_token"], GATEWAY_SECRET, algorithms=["HS256"])
    assert payload["sub"] == "agent-1"
    assert payload["org"] == "org-1"
