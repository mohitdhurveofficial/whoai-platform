"""Sync and async clients for the WHOAI gateway."""

from __future__ import annotations

import os
import time
from typing import Any, Dict, Iterator, List, Optional

import httpx

from ._errors import (
    WhoAIAuthError,
    WhoAIBudgetError,
    WhoAIConnectionError,
    WhoAIError,
    WhoAIProviderError,
    WhoAIRateLimitError,
)

DEFAULT_BASE_URL = "https://whoai-api.onrender.com"
DEFAULT_TIMEOUT = 120.0
DEFAULT_MAX_RETRIES = 2

#: Refresh this many seconds before the token actually expires, so a request
#: cannot be issued with a token that dies in flight.
TOKEN_REFRESH_SKEW = 60

#: Reasons the gateway returns that mean "a human must act", not "try again".
_BUDGET_REASONS = {
    "DAILY_BUDGET_EXCEEDED",
    "MONTHLY_BUDGET_EXCEEDED",
    "AGENT_DAILY_LIMIT_EXCEEDED",
    "ORG_DAILY_LIMIT_EXCEEDED",
    "PLAN_REQUEST_QUOTA_EXCEEDED",
    "BYOK_KEY_MISSING",
}


class _Token:
    """A cached gateway JWT and the moment it stops being usable."""

    __slots__ = ("value", "expires_at")

    def __init__(self, value: str, expires_in: int) -> None:
        self.value = value
        self.expires_at = time.monotonic() + max(0, expires_in - TOKEN_REFRESH_SKEW)

    @property
    def usable(self) -> bool:
        return time.monotonic() < self.expires_at


def _resolve_api_key(api_key: Optional[str]) -> str:
    key = api_key or os.getenv("WHOAI_API_KEY")
    if not key:
        raise WhoAIAuthError(
            "No agent API key. Pass api_key= or set WHOAI_API_KEY. "
            "Create an agent in the WHOAI dashboard to get one."
        )
    return key


def _resolve_base_url(base_url: Optional[str]) -> str:
    raw = base_url or os.getenv("WHOAI_BASE_URL") or DEFAULT_BASE_URL
    return raw.rstrip("/")


def _decode(response: httpx.Response) -> Dict[str, Any]:
    try:
        data = response.json()
    except ValueError:
        return {"error": (response.text or "")[:500]}
    return data if isinstance(data, dict) else {"data": data}


def _message(body: Dict[str, Any], fallback: str) -> str:
    for key in ("error", "detail", "message"):
        value = body.get(key)
        if isinstance(value, str) and value:
            return value
        if isinstance(value, dict):
            nested = value.get("message")
            if isinstance(nested, str) and nested:
                return nested
    return fallback


def _raise_for_response(response: httpx.Response) -> None:
    """Translate a non-2xx gateway response into the right exception type."""
    body = _decode(response)
    reason = body.get("reason") if isinstance(body.get("reason"), str) else None
    status = response.status_code
    message = _message(body, f"WHOAI gateway returned {status}")
    common = {"status_code": status, "reason": reason, "body": body}

    if status == 429:
        retry_after = body.get("retry_after")
        if not isinstance(retry_after, int):
            header = response.headers.get("retry-after")
            retry_after = int(header) if header and header.isdigit() else 0
        raise WhoAIRateLimitError(message, retry_after=retry_after, **common)

    # 402 is always about money. 403 is overloaded: the gateway uses it both for
    # a paused agent (a budget outcome) and for a genuine identity failure, so
    # the reason code is what separates them.
    if status == 402 or (status == 403 and reason in _BUDGET_REASONS):
        raise WhoAIBudgetError(message, **common)

    if status in (401, 403):
        raise WhoAIAuthError(message, **common)

    if status >= 500:
        raise WhoAIProviderError(message, **common)

    raise WhoAIError(message, **common)


def _retry_delay(response: Optional[httpx.Response], attempt: int) -> float:
    """Honour Retry-After when the server sent one, else exponential backoff."""
    if response is not None:
        header = response.headers.get("retry-after")
        if header and header.isdigit():
            return min(float(header), 30.0)
    return min(0.5 * (2**attempt), 8.0)


def _should_retry(status: int) -> bool:
    # 429 and 5xx clear on their own; a 4xx will not change on a repeat.
    return status == 429 or status >= 500


class _BaseClient:
    def __init__(
        self,
        api_key: Optional[str] = None,
        *,
        base_url: Optional[str] = None,
        provider: str = "openai",
        fallback: Optional[str] = None,
        timeout: float = DEFAULT_TIMEOUT,
        max_retries: int = DEFAULT_MAX_RETRIES,
    ) -> None:
        self._api_key = _resolve_api_key(api_key)
        self.base_url = _resolve_base_url(base_url)
        #: Default provider for requests that do not name one.
        self.provider = provider
        #: Provider to try if the primary one fails. None disables failover.
        self.fallback = fallback
        self.timeout = timeout
        self.max_retries = max_retries
        self._token: Optional[_Token] = None

    @property
    def _token_url(self) -> str:
        return f"{self.base_url}/api/v1/auth/token"

    @property
    def _completions_url(self) -> str:
        return f"{self.base_url}/api/v1/chat/completions"

    def _build_payload(
        self,
        model: str,
        messages: List[Dict[str, Any]],
        provider: Optional[str],
        fallback: Optional[str],
        stream: bool,
        extra: Dict[str, Any],
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "provider": provider or self.provider,
            "stream": stream,
            **extra,
        }
        # Only send `fallback` when there is one: the gateway treats the key's
        # presence as "attempt failover", so a null would be ambiguous.
        chosen_fallback = fallback if fallback is not None else self.fallback
        if chosen_fallback:
            payload["fallback"] = chosen_fallback
        return payload

    def _store_token(self, body: Dict[str, Any]) -> str:
        token = body.get("access_token")
        if not isinstance(token, str) or not token:
            raise WhoAIAuthError("Token endpoint returned no access_token", body=body)
        expires_in = body.get("expires_in")
        self._token = _Token(token, expires_in if isinstance(expires_in, int) else 3600)
        return token


class WhoAI(_BaseClient):
    """Synchronous WHOAI client.

        from whoai import WhoAI

        client = WhoAI(api_key="whoai_sk_...")          # or WHOAI_API_KEY
        response = client.chat_completion(
            model="gpt-4o",
            messages=[{"role": "user", "content": "Summarize Q3 revenue."}],
        )
        print(response["choices"][0]["message"]["content"])

    The agent key is exchanged for a short-lived gateway token automatically and
    the token is refreshed before it expires, so callers never handle JWTs.

    Safe to share across threads for reads; construct one per thread if you are
    worried about two threads racing the very first token exchange (the worst
    outcome is one redundant exchange).
    """

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self._http = httpx.Client(timeout=self.timeout)

    # -- lifecycle ---------------------------------------------------------

    def close(self) -> None:
        self._http.close()

    def __enter__(self) -> "WhoAI":
        return self

    def __exit__(self, *exc_info: Any) -> None:
        self.close()

    # -- auth --------------------------------------------------------------

    def _access_token(self, force_refresh: bool = False) -> str:
        if not force_refresh and self._token is not None and self._token.usable:
            return self._token.value

        try:
            response = self._http.post(self._token_url, json={"api_key": self._api_key})
        except httpx.HTTPError as exc:
            raise WhoAIConnectionError(f"Could not reach WHOAI at {self.base_url}: {exc}") from exc

        if response.status_code >= 400:
            _raise_for_response(response)

        return self._store_token(_decode(response))

    # -- requests ----------------------------------------------------------

    def chat_completion(
        self,
        model: str,
        messages: List[Dict[str, Any]],
        *,
        provider: Optional[str] = None,
        fallback: Optional[str] = None,
        **extra: Any,
    ) -> Dict[str, Any]:
        """Send a chat completion through WHOAI and return the provider's response.

        The response is the upstream provider's own JSON, unmodified — so code
        already reading `choices[0].message.content` keeps working.
        """
        payload = self._build_payload(model, messages, provider, fallback, False, extra)
        return self._send(payload)

    def stream_chat_completion(
        self,
        model: str,
        messages: List[Dict[str, Any]],
        *,
        provider: Optional[str] = None,
        fallback: Optional[str] = None,
        **extra: Any,
    ) -> Iterator[str]:
        """Yield raw server-sent-event lines from a streamed completion.

        Not retried: once bytes have been delivered to the caller, replaying the
        request would duplicate them.
        """
        payload = self._build_payload(model, messages, provider, fallback, True, extra)
        token = self._access_token()
        try:
            with self._http.stream(
                "POST",
                self._completions_url,
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            ) as response:
                if response.status_code >= 400:
                    response.read()
                    _raise_for_response(response)
                for line in response.iter_lines():
                    if line:
                        yield line
        except httpx.HTTPError as exc:
            raise WhoAIConnectionError(f"Could not reach WHOAI at {self.base_url}: {exc}") from exc

    def _send(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        last_response: Optional[httpx.Response] = None

        for attempt in range(self.max_retries + 1):
            token = self._access_token()
            try:
                response = self._http.post(
                    self._completions_url,
                    json=payload,
                    headers={"Authorization": f"Bearer {token}"},
                )
            except httpx.HTTPError as exc:
                if attempt < self.max_retries:
                    time.sleep(_retry_delay(None, attempt))
                    continue
                raise WhoAIConnectionError(
                    f"Could not reach WHOAI at {self.base_url}: {exc}"
                ) from exc

            if response.status_code < 400:
                return _decode(response)

            # A 401 mid-session almost always means the cached token expired
            # early (clock skew, a restarted runtime). Re-exchange once and
            # retry before surfacing an auth failure the caller cannot act on.
            if response.status_code == 401 and attempt < self.max_retries:
                self._access_token(force_refresh=True)
                continue

            if _should_retry(response.status_code) and attempt < self.max_retries:
                last_response = response
                time.sleep(_retry_delay(response, attempt))
                continue

            _raise_for_response(response)

        # Retries exhausted on a retryable status.
        assert last_response is not None
        _raise_for_response(last_response)
        raise WhoAIError("unreachable")  # pragma: no cover


class AsyncWhoAI(_BaseClient):
    """Async twin of :class:`WhoAI`, with the same behaviour and errors.

        async with AsyncWhoAI(api_key="whoai_sk_...") as client:
            response = await client.chat_completion(model="gpt-4o", messages=[...])
    """

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self._http = httpx.AsyncClient(timeout=self.timeout)

    async def aclose(self) -> None:
        await self._http.aclose()

    async def __aenter__(self) -> "AsyncWhoAI":
        return self

    async def __aexit__(self, *exc_info: Any) -> None:
        await self.aclose()

    async def _access_token(self, force_refresh: bool = False) -> str:
        if not force_refresh and self._token is not None and self._token.usable:
            return self._token.value

        try:
            response = await self._http.post(self._token_url, json={"api_key": self._api_key})
        except httpx.HTTPError as exc:
            raise WhoAIConnectionError(f"Could not reach WHOAI at {self.base_url}: {exc}") from exc

        if response.status_code >= 400:
            _raise_for_response(response)

        return self._store_token(_decode(response))

    async def chat_completion(
        self,
        model: str,
        messages: List[Dict[str, Any]],
        *,
        provider: Optional[str] = None,
        fallback: Optional[str] = None,
        **extra: Any,
    ) -> Dict[str, Any]:
        payload = self._build_payload(model, messages, provider, fallback, False, extra)
        return await self._send(payload)

    async def _send(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        import asyncio

        last_response: Optional[httpx.Response] = None

        for attempt in range(self.max_retries + 1):
            token = await self._access_token()
            try:
                response = await self._http.post(
                    self._completions_url,
                    json=payload,
                    headers={"Authorization": f"Bearer {token}"},
                )
            except httpx.HTTPError as exc:
                if attempt < self.max_retries:
                    await asyncio.sleep(_retry_delay(None, attempt))
                    continue
                raise WhoAIConnectionError(
                    f"Could not reach WHOAI at {self.base_url}: {exc}"
                ) from exc

            if response.status_code < 400:
                return _decode(response)

            if response.status_code == 401 and attempt < self.max_retries:
                await self._access_token(force_refresh=True)
                continue

            if _should_retry(response.status_code) and attempt < self.max_retries:
                last_response = response
                await asyncio.sleep(_retry_delay(response, attempt))
                continue

            _raise_for_response(response)

        assert last_response is not None
        _raise_for_response(last_response)
        raise WhoAIError("unreachable")  # pragma: no cover
