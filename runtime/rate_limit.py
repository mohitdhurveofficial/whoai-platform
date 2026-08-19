"""Per-agent request rate limiting for the gateway.

This is a throughput guard, not a billing control. Plan quotas and budgets are
enforced elsewhere (entitlements/quota_service, budget/budget_service) and
answer "may this organization spend more?"; this answers the narrower question
"is one agent hammering us faster than any real workload would?" — the case
where a runaway retry loop burns a customer's provider credit in minutes.

Deliberately in-process, and now that the runtime runs more than one worker
(see render.yaml) the window is per-worker: the effective ceiling is
GATEWAY_RATE_LIMIT_PER_MINUTE multiplied by the worker count. That was a
knowing trade — one worker made the gateway a single point of failure for all
customer traffic, and this is a throughput guard whose exact ceiling is not
load-bearing. Spend limits, which are, live in Postgres and are shared by every
worker. Move this to Redis if the ceiling ever needs to be exact; the comment in
`check_rate_limit` says how.
"""

import os
import time
from collections import deque
from typing import Deque, Dict, NamedTuple, Optional


class RateLimitResult(NamedTuple):
    allowed: bool
    limit: int
    remaining: int
    #: Whole seconds until the oldest request leaves the window.
    retry_after: int


def _int_env(name: str, default: int) -> int:
    """Read a positive int from the environment, falling back on anything unusable."""
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        value = int(raw)
    except ValueError:
        return default
    return value if value > 0 else default


#: Requests per agent per window. Generous by default: the point is to stop a
#: runaway loop, not to shape legitimate bursty traffic.
DEFAULT_LIMIT = 120
WINDOW_SECONDS = 60

#: Bound on how many distinct agents we track, so a flood of forged agent ids
#: cannot grow the map without limit. Idle agents are evicted first.
MAX_TRACKED_AGENTS = 20_000

_windows: Dict[str, Deque[float]] = {}


def _prune(now: float) -> None:
    """Drop agents whose window is entirely in the past, then cap the map size."""
    cutoff = now - WINDOW_SECONDS
    stale = [key for key, hits in _windows.items() if not hits or hits[-1] <= cutoff]
    for key in stale:
        del _windows[key]

    overflow = len(_windows) - MAX_TRACKED_AGENTS
    if overflow > 0:
        # Insertion order is close enough to least-recently-active here, and
        # evicting can only ever be permissive.
        for key in list(_windows.keys())[:overflow]:
            del _windows[key]


def check_rate_limit(
    agent_id: str,
    limit: Optional[int] = None,
    now: Optional[float] = None,
) -> RateLimitResult:
    """Record one request for `agent_id` and report whether it is permitted.

    Sliding window: the request is allowed when fewer than `limit` requests
    landed in the preceding WINDOW_SECONDS. A denied request is *not* recorded,
    so a client held at the limit recovers as soon as its window drains rather
    than extending its own timeout.

    To make this correct across multiple runtime instances, replace the
    `_windows` dict with a Redis sorted set per agent (ZREMRANGEBYSCORE the
    expired entries, ZCARD to count, ZADD to record) — the signature and the
    call site do not change.
    """
    effective_limit = limit if limit is not None else _int_env("GATEWAY_RATE_LIMIT_PER_MINUTE", DEFAULT_LIMIT)
    current = time.monotonic() if now is None else now

    # Housekeeping is cheap and only runs when the map has grown enough to
    # matter, so it stays off the hot path for a typical deployment.
    if len(_windows) > MAX_TRACKED_AGENTS // 2:
        _prune(current)

    hits = _windows.setdefault(agent_id, deque())
    cutoff = current - WINDOW_SECONDS
    while hits and hits[0] <= cutoff:
        hits.popleft()

    if len(hits) >= effective_limit:
        # Seconds until the oldest hit ages out and a slot frees up.
        retry_after = max(1, int(hits[0] + WINDOW_SECONDS - current) + 1)
        return RateLimitResult(False, effective_limit, 0, retry_after)

    hits.append(current)
    return RateLimitResult(True, effective_limit, effective_limit - len(hits), 0)


def reset_rate_limits() -> None:
    """Clear all windows. For tests."""
    _windows.clear()
