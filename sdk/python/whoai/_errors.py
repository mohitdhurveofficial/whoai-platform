"""Exception hierarchy for the WHOAI SDK.

Every error the gateway can return maps to a distinct class, because the
correct response differs sharply: a 401 means fix your key, a 429 means wait,
and a 402 means someone has to approve more spend. Collapsing them into one
exception forces callers to string-match the message, which is exactly the
brittleness an SDK exists to remove.
"""

from typing import Any, Dict, Optional


class WhoAIError(Exception):
    """Base class. Catch this to catch anything the SDK raises."""

    def __init__(
        self,
        message: str,
        *,
        status_code: Optional[int] = None,
        reason: Optional[str] = None,
        body: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        #: HTTP status the gateway returned, when there was a response at all.
        self.status_code = status_code
        #: The gateway's machine-readable `reason` code, e.g. "BYOK_KEY_MISSING".
        self.reason = reason
        #: The full decoded response body, for anything not surfaced above.
        self.body = body or {}


class WhoAIConnectionError(WhoAIError):
    """The runtime was unreachable, or the request timed out."""


class WhoAIAuthError(WhoAIError):
    """The agent key or the token derived from it was rejected (401/403).

    Usually a revoked key, a paused agent, or a key from a different workspace.
    """


class WhoAIRateLimitError(WhoAIError):
    """Too many requests (429). Clears on its own.

    `retry_after` is the gateway's own estimate in seconds; it is already
    respected by the client's automatic retries, so seeing this exception means
    the retries were exhausted.
    """

    def __init__(self, message: str, *, retry_after: int = 0, **kwargs: Any) -> None:
        super().__init__(message, **kwargs)
        self.retry_after = retry_after


class WhoAIBudgetError(WhoAIError):
    """The request was refused on cost grounds, not technical ones.

    Covers three distinct situations, distinguished by `reason`:
      - DAILY_BUDGET_EXCEEDED / MONTHLY_BUDGET_EXCEEDED — a spend cap was hit.
      - PLAN_REQUEST_QUOTA_EXCEEDED — the plan's monthly request allowance ran out.
      - BYOK_KEY_MISSING — no provider key is configured, so nothing can be spent.

    None of these are retryable; a human has to raise a limit, upgrade, or add
    a key.
    """


class WhoAIProviderError(WhoAIError):
    """The upstream model provider failed after WHOAI's own retries."""
