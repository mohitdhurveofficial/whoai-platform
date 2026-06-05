import pytest
import httpx
import jwt
from unittest.mock import AsyncMock

from fastapi.testclient import TestClient
from runtime.main import app
from runtime.routers.gateway import GATEWAY_SECRET

client = TestClient(app)

# Generate a mock token for testing
def generate_mock_token(agent_id, org_id, secret=GATEWAY_SECRET):
    payload = {"sub": agent_id, "org": org_id}
    return jwt.encode(payload, secret, algorithm="HS256")

@pytest.fixture
def mock_token():
    return generate_mock_token("agent-123", "org-456")

def test_missing_auth_header():
    response = client.post("/api/v1/gateway/completions", json={"model": "gpt-4o"})
    assert response.status_code == 401
    assert "Missing or invalid Authorization header" in response.json()["detail"]

def test_invalid_jwt_token():
    response = client.post(
        "/api/v1/gateway/completions", 
        json={"model": "gpt-4o"},
        headers={"Authorization": "Bearer invalid_token_123"}
    )
    assert response.status_code == 401
    assert "Invalid token" in response.json()["detail"]

def test_invalid_json_body(mock_token):
    response = client.post(
        "/api/v1/gateway/completions", 
        data="invalid json",
        headers={"Authorization": f"Bearer {mock_token}"}
    )
    assert response.status_code == 400
    assert "Invalid JSON body" in response.json()["detail"]

# The following tests would require mocking the database and external API
# to fully test the success flow without hitting actual endpoints.
