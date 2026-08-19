"""Drop-in replacement for an existing `openai` client.

The WHOAI gateway speaks the OpenAI chat-completions wire format, so code
already using the official SDK can route through WHOAI by changing where the
client points:

    - from openai import OpenAI
    - client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    + from whoai import openai_client
    + client = openai_client()

Everything downstream — `client.chat.completions.create(...)`, streaming,
response objects — is unchanged, because it *is* the official client.

The one wrinkle this module handles: WHOAI authenticates with a short-lived JWT
derived from your agent key, and the OpenAI client treats its api_key as a
constant. `openai_client` exchanges the key once at construction; for a process
that outlives the token, use `whoai.WhoAI` instead, which refreshes.
"""

from __future__ import annotations

from typing import Any, Optional

from ._client import WhoAI

_MISSING_OPENAI = (
    "The `openai` package is required for whoai.openai_client(). "
    "Install it with `pip install openai`, or use `whoai.WhoAI` instead, "
    "which has no such dependency."
)


def openai_client(
    api_key: Optional[str] = None,
    *,
    base_url: Optional[str] = None,
    **openai_kwargs: Any,
) -> Any:
    """Return an `openai.OpenAI` client that routes through WHOAI.

    :param api_key: Your WHOAI **agent** key (`whoai_sk_...`), not a provider
        key. Defaults to ``$WHOAI_API_KEY``. Your OpenAI/Anthropic keys stay in
        WHOAI's encrypted store and are injected server-side — they are never
        needed by, or visible to, this process.
    :param base_url: Override the WHOAI runtime URL. Defaults to
        ``$WHOAI_BASE_URL``.
    :param openai_kwargs: Passed through to ``openai.OpenAI`` untouched
        (``timeout``, ``max_retries``, ``default_headers``, …).

    Note the token is fetched once. It is valid for an hour; a long-lived
    process should either recreate the client periodically or use
    :class:`whoai.WhoAI`, which handles refresh itself.
    """
    try:
        from openai import OpenAI  # type: ignore[import-not-found]
    except ImportError as exc:  # pragma: no cover - depends on the environment
        raise ImportError(_MISSING_OPENAI) from exc

    whoai = WhoAI(api_key=api_key, base_url=base_url)
    try:
        # Fail here, at construction, rather than on the customer's first real
        # request — a bad key should surface at wiring time.
        token = whoai._access_token()
    finally:
        whoai.close()

    return OpenAI(api_key=token, base_url=f"{whoai.base_url}/api/v1", **openai_kwargs)


async def async_openai_client(
    api_key: Optional[str] = None,
    *,
    base_url: Optional[str] = None,
    **openai_kwargs: Any,
) -> Any:
    """`openai.AsyncOpenAI` equivalent of :func:`openai_client`."""
    try:
        from openai import AsyncOpenAI  # type: ignore[import-not-found]
    except ImportError as exc:  # pragma: no cover - depends on the environment
        raise ImportError(_MISSING_OPENAI) from exc

    from ._client import AsyncWhoAI

    whoai = AsyncWhoAI(api_key=api_key, base_url=base_url)
    try:
        token = await whoai._access_token()
    finally:
        await whoai.aclose()

    return AsyncOpenAI(api_key=token, base_url=f"{whoai.base_url}/api/v1", **openai_kwargs)
