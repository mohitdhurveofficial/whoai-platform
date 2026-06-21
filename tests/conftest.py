import os
import sqlite3
import sys
from decimal import Decimal
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

# Production runs on Postgres (asyncpg binds Decimal natively). The real-DB
# integration tests use in-memory aiosqlite, whose DBAPI cannot bind Decimal
# parameters — the gateway's raw budget-reservation SQL passes Decimals through.
# Register an adapter so those bind as floats in the sqlite test path only.
sqlite3.register_adapter(Decimal, float)

# Required secrets must exist before importing the app: the gateway now fails
# closed when GATEWAY_SECRET is unset. Provide test defaults so the suite runs
# without a .env file (e.g. in CI).
os.environ.setdefault("GATEWAY_SECRET", "test-gateway-secret-do-not-use-in-prod")
os.environ.setdefault("ENCRYPTION_KEY", "a" * 64)

import pytest
from httpx import AsyncClient, ASGITransport

from runtime.main import app


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac