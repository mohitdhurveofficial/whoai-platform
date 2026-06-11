import pytest
import uuid
import datetime
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch

from runtime.telemetry.pricing import get_pricing
from runtime.telemetry.token_counter import extract_tokens, estimate_tokens
from runtime.telemetry.cost_calculator import calculate_cost
from runtime.telemetry.spend_logger import log_spend
from runtime.telemetry.activity_logger import log_activity, ActivityAction
from runtime.telemetry.metrics_service import update_daily_metrics

from database.models import Agent, SpendLog, ActivityLog, UsageMetrics

def test_pricing_registry():
    pricing = get_pricing("gpt-4o")
    assert pricing["input"] == 0.005
    assert pricing["output"] == 0.015

    # Test fallback
    fallback = get_pricing("unknown-model")
    assert fallback["input"] == 0.005  # defaults to gpt-4o

    # Test substring match
    sonnet = get_pricing("claude-3-5-sonnet-latest")
    assert sonnet["input"] == 0.003

def test_token_extraction_openai():
    response = {
        "usage": {
            "prompt_tokens": 10,
            "completion_tokens": 20,
            "total_tokens": 30
        }
    }
    extracted = extract_tokens("openai", response)
    assert extracted["tokens_in"] == 10
    assert extracted["tokens_out"] == 20
    assert extracted["total_tokens"] == 30

def test_token_extraction_anthropic():
    response = {
        "usage": {
            "input_tokens": 15,
            "output_tokens": 25
        }
    }
    extracted = extract_tokens("anthropic", response)
    assert extracted["tokens_in"] == 15
    assert extracted["tokens_out"] == 25
    assert extracted["total_tokens"] == 40

def test_token_estimation_fallback():
    text = "This is exactly twenty characters." # 34 chars
    tokens = estimate_tokens(text)
    assert tokens == len(text) // 4
    
    extracted = extract_tokens("openai", {}, text_content=text)
    assert extracted["tokens_out"] == len(text) // 4

def test_cost_calculation():
    # gpt-4o: in=0.005, out=0.015 per 1k
    # 1000 in = $0.005
    # 2000 out = $0.030
    # total = $0.035
    cost = calculate_cost("gpt-4o", 1000, 2000)
    assert isinstance(cost, Decimal)
    assert cost == Decimal("0.03500000")

@pytest.mark.asyncio
async def test_spend_logger():
    db_mock = MagicMock()
    db_mock.execute = AsyncMock()
    db_mock.commit = AsyncMock()
    
    await log_spend(
        db_mock,
        "org-1", "agent-1", "openai", "gpt-4o",
        100, 200, 300, Decimal("0.05")
    )
    
    assert db_mock.add.called
    added_obj = db_mock.add.call_args[0][0]
    assert isinstance(added_obj, SpendLog)
    assert added_obj.cost == Decimal("0.05")
    assert added_obj.tokensIn == 100
    
    assert db_mock.execute.called

@pytest.mark.asyncio
async def test_activity_logger():
    db_mock = MagicMock()
    db_mock.execute = AsyncMock()
    db_mock.commit = AsyncMock()
    
    await log_activity(
        db_mock,
        "org-1", ActivityAction.REQUEST_RECEIVED, "agent-1", "PENDING", {"ip": "127.0.0.1"}
    )
    
    assert db_mock.add.called
    added_obj = db_mock.add.call_args[0][0]
    assert isinstance(added_obj, ActivityLog)
    assert added_obj.action == ActivityAction.REQUEST_RECEIVED
    assert added_obj.metadata_["ip"] == "127.0.0.1"

@pytest.mark.asyncio
async def test_metrics_service_insert():
    db_mock = MagicMock()
    db_mock.execute = AsyncMock()
    db_mock.commit = AsyncMock()
    
    # First update returns 0 rows (doesn't exist)
    mock_result = MagicMock()
    mock_result.rowcount = 0
    db_mock.execute.return_value = mock_result
    
    db_mock.begin_nested = MagicMock()
    nested_ctx = AsyncMock()
    db_mock.begin_nested.return_value = nested_ctx
    
    await update_daily_metrics(db_mock, "org-1", "agent-1", 150, Decimal("0.01"))
    
    assert db_mock.add.called
    added_obj = db_mock.add.call_args[0][0]
    assert isinstance(added_obj, UsageMetrics)
    assert added_obj.totalRequests == 1
    assert added_obj.totalTokens == 150

@pytest.mark.asyncio
async def test_metrics_service_update():
    db_mock = MagicMock()
    db_mock.execute = AsyncMock()
    db_mock.commit = AsyncMock()
    
    # First update returns 1 row (it exists)
    mock_result = MagicMock()
    mock_result.rowcount = 1
    db_mock.execute.return_value = mock_result
    
    await update_daily_metrics(db_mock, "org-1", "agent-1", 200, Decimal("0.10"))
    
    assert not db_mock.add.called
    assert db_mock.execute.called
