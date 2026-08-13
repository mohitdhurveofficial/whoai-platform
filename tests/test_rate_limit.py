"""Gateway per-agent rate limiting."""

import pytest

from runtime.rate_limit import (
    WINDOW_SECONDS,
    check_rate_limit,
    reset_rate_limits,
)


@pytest.fixture(autouse=True)
def _clean():
    reset_rate_limits()
    yield
    reset_rate_limits()


def test_allows_exactly_the_limit_then_denies():
    for i in range(3):
        result = check_rate_limit("agent-1", limit=3, now=100.0)
        assert result.allowed, f"request {i + 1} should be allowed"
        assert result.remaining == 2 - i

    denied = check_rate_limit("agent-1", limit=3, now=100.0)
    assert not denied.allowed
    assert denied.remaining == 0
    assert denied.retry_after > 0


def test_agents_are_counted_separately():
    for _ in range(3):
        check_rate_limit("agent-1", limit=3, now=100.0)

    assert not check_rate_limit("agent-1", limit=3, now=100.0).allowed
    # One noisy agent must not throttle its neighbours.
    assert check_rate_limit("agent-2", limit=3, now=100.0).allowed


def test_window_slides_rather_than_resetting_wholesale():
    # Three hits spread across the window.
    for offset in (0.0, 10.0, 20.0):
        assert check_rate_limit("agent-1", limit=3, now=100.0 + offset).allowed

    assert not check_rate_limit("agent-1", limit=3, now=125.0).allowed

    # Once the first hit ages out exactly one slot frees up, not all three.
    just_after = 100.0 + WINDOW_SECONDS + 0.1
    assert check_rate_limit("agent-1", limit=3, now=just_after).allowed
    assert not check_rate_limit("agent-1", limit=3, now=just_after).allowed


def test_denied_requests_are_not_recorded():
    """A client held at the limit must recover on schedule, not extend its own
    timeout by continuing to retry."""
    for _ in range(2):
        check_rate_limit("agent-1", limit=2, now=100.0)

    for _ in range(50):
        assert not check_rate_limit("agent-1", limit=2, now=130.0).allowed

    # The window still drains from the original two hits.
    assert check_rate_limit("agent-1", limit=2, now=100.0 + WINDOW_SECONDS + 0.1).allowed


def test_retry_after_points_past_the_oldest_hit():
    check_rate_limit("agent-1", limit=1, now=100.0)
    denied = check_rate_limit("agent-1", limit=1, now=110.0)

    assert not denied.allowed
    # The oldest hit ages out at t=160; we are at t=110, so ~50s.
    assert 50 <= denied.retry_after <= 51


def test_limit_falls_back_to_the_env_default(monkeypatch):
    monkeypatch.setenv("GATEWAY_RATE_LIMIT_PER_MINUTE", "2")
    assert check_rate_limit("agent-1", now=100.0).allowed
    assert check_rate_limit("agent-1", now=100.0).allowed
    assert not check_rate_limit("agent-1", now=100.0).allowed


@pytest.mark.parametrize("value", ["0", "-5", "not-a-number", ""])
def test_unusable_env_values_fall_back_to_the_default(monkeypatch, value):
    """A typo in the environment must not silently disable or invert the limit."""
    monkeypatch.setenv("GATEWAY_RATE_LIMIT_PER_MINUTE", value)
    result = check_rate_limit("agent-1", now=100.0)
    assert result.allowed
    assert result.limit == 120
