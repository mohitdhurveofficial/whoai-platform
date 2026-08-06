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

from unittest.mock import AsyncMock, MagicMock

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


def _scalar_result(value):
    return MagicMock(scalar_one_or_none=MagicMock(return_value=value), scalar=MagicMock(return_value=value))


def _rowcount_result(rowcount: int):
    return MagicMock(rowcount=rowcount)


class FakeSession:
    """Statement-dispatching stand-in for an AsyncSession.

    The gateway's hot path interleaves ORM selects with raw-SQL budget
    statements, and the exact call order shifts whenever enforcement changes.
    Dispatching on the statement — rather than popping a positional
    `side_effect` list — keeps these tests pinned to behaviour instead of to
    call sequence, so an added query doesn't fail every gateway test with an
    unrelated StopAsyncIteration.

    `agent_reserved` / `org_reserved` control whether the atomic budget
    pre-reservation UPDATE matches a row, i.e. whether the request is within
    budget. `quota_reserved` does the same for the plan request quota.
    """

    def __init__(
        self,
        *,
        agent=None,
        organization=None,
        credential=None,
        agent_reserved: bool = True,
        org_reserved: bool = True,
        quota_reserved: bool = True,
    ):
        self.agent = agent
        self.organization = organization
        self.credential = credential
        self.agent_reserved = agent_reserved
        self.org_reserved = org_reserved
        self.quota_reserved = quota_reserved
        self.add = MagicMock()
        self.commit = AsyncMock()
        self.rollback = AsyncMock()
        self.flush = AsyncMock()
        self.close = AsyncMock()

    async def execute(self, statement, params=None):
        sql = " ".join(str(statement).split())

        if sql.startswith("SELECT"):
            if 'FROM "Agent"' in sql:
                return _scalar_result(self.agent)
            if 'FROM "Organization"' in sql:
                return _scalar_result(self.organization)
            if 'FROM "ProviderCredential"' in sql:
                return _scalar_result(self.credential)
            return _scalar_result(None)

        if sql.startswith("UPDATE"):
            # The plan-quota reservation carries its own guard, distinct from
            # the budget one (an allowance ceiling, not a remaining-balance check).
            if '"currentMonthlyRequests" + 1 <=' in sql:
                return _rowcount_result(1 if self.quota_reserved else 0)
            # Only the pre-reservation statements carry the budget guard; plain
            # adjust/release UPDATEs always match their row.
            is_reservation = "<= 0 OR" in sql
            if not is_reservation:
                return _rowcount_result(1)
            if 'UPDATE "Agent"' in sql:
                return _rowcount_result(1 if self.agent_reserved else 0)
            if 'UPDATE "Organization"' in sql:
                return _rowcount_result(1 if self.org_reserved else 0)

        return _rowcount_result(1)

    def added(self, model):
        """Every object of type `model` handed to session.add()."""
        return [call.args[0] for call in self.add.call_args_list if isinstance(call.args[0], model)]