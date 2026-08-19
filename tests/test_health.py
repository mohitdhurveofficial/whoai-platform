"""Liveness and readiness probes.

These endpoints decide whether a load balancer sends traffic to an instance and
whether a supervisor restarts it, so their failure modes matter more than their
happy paths.
"""

import asyncio

from fastapi.testclient import TestClient

import runtime.main as main
from runtime.main import app


def test_liveness_never_touches_the_database(monkeypatch):
    """A supervisor restarts on this probe. If it depended on the database, a
    database outage would restart every instance instead of waiting it out."""

    class ForbiddenEngine:
        def connect(self):
            raise AssertionError("liveness must not open a database connection")

    monkeypatch.setattr(main, "engine", ForbiddenEngine())

    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_readiness_reports_unavailable_when_the_database_is_down(monkeypatch):
    """The gateway reads the agent, its budgets, and the provider key on every
    call, so an instance that cannot reach Postgres must leave rotation rather
    than keep 500ing real traffic."""

    class RefusingEngine:
        def connect(self):
            raise OSError("connection refused")

    monkeypatch.setattr(main, "engine", RefusingEngine())

    with TestClient(app) as client:
        response = client.get("/health/ready")

    assert response.status_code == 503
    body = response.json()
    assert body["status"] == "unavailable"
    assert body["database"] == "unreachable"
    assert "connection refused" in body["detail"]


def test_readiness_fails_rather_than_hanging_on_a_stalled_database(monkeypatch):
    """A probe that hangs teaches the load balancer nothing while requests keep
    arriving, so a stalled connection has to become a fast 503."""

    class StalledConnection:
        async def __aenter__(self):
            await asyncio.sleep(30)

        async def __aexit__(self, *_args):
            return False

    class StalledEngine:
        def connect(self):
            return StalledConnection()

    monkeypatch.setattr(main, "engine", StalledEngine())
    monkeypatch.setattr(main, "READINESS_TIMEOUT_SECONDS", 0.05)

    with TestClient(app) as client:
        response = client.get("/health/ready")

    assert response.status_code == 503
    assert response.json()["database"] == "unreachable"
