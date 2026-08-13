"""WHOAI Python SDK.

Exercised through httpx's MockTransport rather than by patching the client's
own methods, so the retry, token-refresh, and error-mapping logic runs against
real request/response objects.
"""

import sys
from pathlib import Path

import httpx
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "sdk" / "python"))

from whoai import (  # noqa: E402
    AsyncWhoAI,
    WhoAI,
    WhoAIAuthError,
    WhoAIBudgetError,
    WhoAIConnectionError,
    WhoAIError,
    WhoAIProviderError,
    WhoAIRateLimitError,
)

BASE = "https://runtime.test"
# The runtime mounts every router under /api/v1, including auth.
TOKEN_PATH = "/api/v1/auth/token"
COMPLETION = {
    "id": "chatcmpl-1",
    "choices": [{"message": {"role": "assistant", "content": "hi"}}],
    "usage": {"prompt_tokens": 5, "completion_tokens": 2, "total_tokens": 7},
}


def build(handler, **kwargs):
    """A WhoAI client whose HTTP layer is the given handler."""
    client = WhoAI(api_key="whoai_sk_test", base_url=BASE, **kwargs)
    client._http = httpx.Client(transport=httpx.MockTransport(handler))
    return client


def token_response():
    return httpx.Response(200, json={"access_token": "jwt-1", "expires_in": 3600})


@pytest.fixture(autouse=True)
def _no_sleep(monkeypatch):
    """Retry backoff is verified by call counts, not by wall-clock waiting."""
    monkeypatch.setattr("whoai._client.time.sleep", lambda _seconds: None)


# --- happy path -------------------------------------------------------------


def test_exchanges_the_key_then_sends_the_completion():
    seen = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        if request.url.path == TOKEN_PATH:
            return token_response()
        return httpx.Response(200, json=COMPLETION)

    client = build(handler)
    result = client.chat_completion(model="gpt-4o", messages=[{"role": "user", "content": "hi"}])

    assert result == COMPLETION
    assert [r.url.path for r in seen] == [TOKEN_PATH, "/api/v1/chat/completions"]
    # The agent key goes only to the token endpoint; the gateway sees the JWT.
    assert seen[1].headers["authorization"] == "Bearer jwt-1"
    assert b"whoai_sk_test" not in seen[1].content


def test_reuses_the_token_across_requests():
    calls = {"token": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == TOKEN_PATH:
            calls["token"] += 1
            return token_response()
        return httpx.Response(200, json=COMPLETION)

    client = build(handler)
    for _ in range(3):
        client.chat_completion(model="gpt-4o", messages=[])

    # Three completions, one exchange — otherwise every call would pay for two
    # round trips.
    assert calls["token"] == 1


def test_refreshes_a_token_that_has_aged_out(monkeypatch):
    calls = {"token": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == TOKEN_PATH:
            calls["token"] += 1
            return httpx.Response(200, json={"access_token": f"jwt-{calls['token']}", "expires_in": 3600})
        return httpx.Response(200, json=COMPLETION)

    clock = {"now": 1000.0}
    monkeypatch.setattr("whoai._client.time.monotonic", lambda: clock["now"])

    client = build(handler)
    client.chat_completion(model="gpt-4o", messages=[])
    assert calls["token"] == 1

    # Past expiry minus the refresh skew.
    clock["now"] += 3600
    client.chat_completion(model="gpt-4o", messages=[])
    assert calls["token"] == 2


def test_sends_provider_and_fallback_only_when_set():
    bodies = []

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == TOKEN_PATH:
            return token_response()
        import json

        bodies.append(json.loads(request.content))
        return httpx.Response(200, json=COMPLETION)

    client = build(handler)
    client.chat_completion(model="gpt-4o", messages=[])
    client.chat_completion(model="claude-3", messages=[], provider="anthropic", fallback="openai")

    assert bodies[0]["provider"] == "openai"
    # Absent, not null: the gateway keys failover off the field's presence.
    assert "fallback" not in bodies[0]
    assert bodies[1]["provider"] == "anthropic"
    assert bodies[1]["fallback"] == "openai"


def test_passes_extra_kwargs_through_to_the_provider():
    bodies = []

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == TOKEN_PATH:
            return token_response()
        import json

        bodies.append(json.loads(request.content))
        return httpx.Response(200, json=COMPLETION)

    client = build(handler)
    client.chat_completion(model="gpt-4o", messages=[], temperature=0.2, max_tokens=64)

    assert bodies[0]["temperature"] == 0.2
    assert bodies[0]["max_tokens"] == 64


# --- error mapping ----------------------------------------------------------


@pytest.mark.parametrize(
    "status,body,expected",
    [
        (401, {"detail": "Invalid API key"}, WhoAIAuthError),
        (403, {"detail": "Agent is PAUSED"}, WhoAIAuthError),
        (402, {"error": "No openai key", "reason": "BYOK_KEY_MISSING"}, WhoAIBudgetError),
        (403, {"error": "Budget exceeded", "reason": "DAILY_BUDGET_EXCEEDED"}, WhoAIBudgetError),
        (402, {"error": "Quota", "reason": "PLAN_REQUEST_QUOTA_EXCEEDED"}, WhoAIBudgetError),
        (400, {"detail": "Invalid JSON body"}, WhoAIError),
    ],
)
def test_maps_each_gateway_failure_to_its_own_exception(status, body, expected):
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == TOKEN_PATH:
            return token_response()
        return httpx.Response(status, json=body)

    # max_retries=0 so a retryable status still lands on the first response.
    client = build(handler, max_retries=0)
    with pytest.raises(expected) as excinfo:
        client.chat_completion(model="gpt-4o", messages=[])

    assert excinfo.value.status_code == status
    assert excinfo.value.reason == body.get("reason")


def test_a_paused_agent_403_is_not_confused_with_a_budget_403():
    """403 is overloaded by the gateway; only the reason code separates them,
    and getting this backwards would tell a customer to raise a budget when
    their key was actually revoked."""

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == TOKEN_PATH:
            return token_response()
        return httpx.Response(403, json={"detail": "Agent not found"})

    client = build(handler, max_retries=0)
    with pytest.raises(WhoAIAuthError):
        client.chat_completion(model="gpt-4o", messages=[])


def test_surfaces_retry_after_on_a_rate_limit():
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == TOKEN_PATH:
            return token_response()
        return httpx.Response(
            429,
            json={"error": "RATE_LIMIT_EXCEEDED", "retry_after": 17},
            headers={"Retry-After": "17"},
        )

    client = build(handler, max_retries=0)
    with pytest.raises(WhoAIRateLimitError) as excinfo:
        client.chat_completion(model="gpt-4o", messages=[])

    assert excinfo.value.retry_after == 17


def test_wraps_transport_failures():
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("no route to host")

    client = build(handler, max_retries=0)
    with pytest.raises(WhoAIConnectionError):
        client.chat_completion(model="gpt-4o", messages=[])


def test_handles_a_non_json_error_body():
    """An HTML 502 from a proxy must not become a JSON decode traceback."""

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == TOKEN_PATH:
            return token_response()
        return httpx.Response(502, text="<html>Bad Gateway</html>")

    client = build(handler, max_retries=0)
    with pytest.raises(WhoAIProviderError) as excinfo:
        client.chat_completion(model="gpt-4o", messages=[])

    assert excinfo.value.status_code == 502


# --- retries ----------------------------------------------------------------


def test_retries_a_transient_failure_then_succeeds():
    attempts = {"n": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == TOKEN_PATH:
            return token_response()
        attempts["n"] += 1
        if attempts["n"] == 1:
            return httpx.Response(503, json={"error": "upstream down"})
        return httpx.Response(200, json=COMPLETION)

    client = build(handler)
    assert client.chat_completion(model="gpt-4o", messages=[]) == COMPLETION
    assert attempts["n"] == 2


def test_does_not_retry_a_client_error():
    attempts = {"n": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == TOKEN_PATH:
            return token_response()
        attempts["n"] += 1
        return httpx.Response(400, json={"detail": "bad model"})

    client = build(handler)
    with pytest.raises(WhoAIError):
        client.chat_completion(model="nope", messages=[])

    # Repeating a 400 only burns the customer's rate limit.
    assert attempts["n"] == 1


def test_a_budget_refusal_is_never_retried():
    attempts = {"n": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == TOKEN_PATH:
            return token_response()
        attempts["n"] += 1
        return httpx.Response(402, json={"error": "Budget exceeded", "reason": "MONTHLY_BUDGET_EXCEEDED"})

    client = build(handler)
    with pytest.raises(WhoAIBudgetError):
        client.chat_completion(model="gpt-4o", messages=[])

    assert attempts["n"] == 1


def test_gives_up_after_max_retries():
    attempts = {"n": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == TOKEN_PATH:
            return token_response()
        attempts["n"] += 1
        return httpx.Response(503, json={"error": "still down"})

    client = build(handler, max_retries=2)
    with pytest.raises(WhoAIProviderError):
        client.chat_completion(model="gpt-4o", messages=[])

    assert attempts["n"] == 3  # the initial attempt plus two retries


def test_re_exchanges_the_token_on_a_mid_session_401():
    """A token can die early if the runtime restarts. Re-exchanging once beats
    surfacing an auth error the caller cannot act on."""
    tokens = {"n": 0}
    completions = {"n": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == TOKEN_PATH:
            tokens["n"] += 1
            return httpx.Response(200, json={"access_token": f"jwt-{tokens['n']}", "expires_in": 3600})
        completions["n"] += 1
        if completions["n"] == 1:
            return httpx.Response(401, json={"detail": "Token expired"})
        return httpx.Response(200, json=COMPLETION)

    client = build(handler)
    assert client.chat_completion(model="gpt-4o", messages=[]) == COMPLETION
    assert tokens["n"] == 2


# --- configuration ----------------------------------------------------------


def test_requires_a_key_from_the_argument_or_the_environment(monkeypatch):
    monkeypatch.delenv("WHOAI_API_KEY", raising=False)
    with pytest.raises(WhoAIAuthError):
        WhoAI()


def test_reads_key_and_base_url_from_the_environment(monkeypatch):
    monkeypatch.setenv("WHOAI_API_KEY", "whoai_sk_env")
    monkeypatch.setenv("WHOAI_BASE_URL", "https://self-hosted.example.com/")

    client = WhoAI()
    assert client._api_key == "whoai_sk_env"
    # Trailing slash trimmed, so URLs never come out with a doubled separator.
    assert client.base_url == "https://self-hosted.example.com"
    assert client._completions_url == "https://self-hosted.example.com/api/v1/chat/completions"


def test_rejects_a_token_response_missing_the_token():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"token_type": "bearer"})

    client = build(handler)
    with pytest.raises(WhoAIAuthError):
        client.chat_completion(model="gpt-4o", messages=[])


def test_closes_via_the_context_manager():
    client = build(lambda request: token_response())
    with client as opened:
        assert opened is client
    assert client._http.is_closed


# --- async ------------------------------------------------------------------


@pytest.mark.asyncio
async def test_async_client_matches_the_sync_one():
    seen = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request.url.path)
        if request.url.path == TOKEN_PATH:
            return token_response()
        return httpx.Response(200, json=COMPLETION)

    client = AsyncWhoAI(api_key="whoai_sk_test", base_url=BASE)
    client._http = httpx.AsyncClient(transport=httpx.MockTransport(handler))

    async with client:
        assert await client.chat_completion(model="gpt-4o", messages=[]) == COMPLETION

    assert seen == [TOKEN_PATH, "/api/v1/chat/completions"]


@pytest.mark.asyncio
async def test_async_client_maps_errors_the_same_way():
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == TOKEN_PATH:
            return token_response()
        return httpx.Response(402, json={"error": "Budget exceeded", "reason": "DAILY_BUDGET_EXCEEDED"})

    client = AsyncWhoAI(api_key="whoai_sk_test", base_url=BASE, max_retries=0)
    client._http = httpx.AsyncClient(transport=httpx.MockTransport(handler))

    async with client:
        with pytest.raises(WhoAIBudgetError):
            await client.chat_completion(model="gpt-4o", messages=[])
