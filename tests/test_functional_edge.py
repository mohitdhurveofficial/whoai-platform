import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from runtime.budget.budget_service import check_agent_budget, check_org_budget
from database.models import Agent, Organization
from decimal import Decimal

@pytest.mark.asyncio
async def test_budget_exactly_reached():
    agent = Agent(id="agent_1", organizationId="org_1", dailyBudget=Decimal("100.0"), monthlyBudget=Decimal("1000.0"), currentDailySpend=Decimal("100.0"))
    
    db_mock = MagicMock()
    db_mock.execute = AsyncMock()
    db_mock.commit = AsyncMock()
    
    result = await check_agent_budget(db_mock, agent)
    assert result["allowed"] == False
    assert result["reason"] == "AGENT_DAILY_LIMIT_EXCEEDED"

@pytest.mark.asyncio
async def test_budget_exceeded_by_1_cent():
    agent = Agent(id="agent_2", organizationId="org_1", dailyBudget=Decimal("100.0"), monthlyBudget=Decimal("1000.0"), currentDailySpend=Decimal("100.01"))
    
    db_mock = MagicMock()
    db_mock.execute = AsyncMock()
    db_mock.commit = AsyncMock()
    result = await check_agent_budget(db_mock, agent)
    assert result["allowed"] == False
    assert result["reason"] == "AGENT_DAILY_LIMIT_EXCEEDED"

@pytest.mark.asyncio
async def test_missing_organization_limits():
    # If organization has 0 limits, it should pass
    org = Organization(id="org_missing", dailyBudget=Decimal("0.0"), monthlyBudget=Decimal("0.0"), currentDailySpend=Decimal("10.0"))
    
    db_mock = MagicMock()
    db_mock.execute = AsyncMock()
    db_mock.commit = AsyncMock()
    result = await check_org_budget(db_mock, org)
    assert result["allowed"] == True
