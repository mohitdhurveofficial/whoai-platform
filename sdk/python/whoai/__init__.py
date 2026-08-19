"""WHOAI — AI cost observability and control.

    from whoai import WhoAI

    client = WhoAI()  # reads WHOAI_API_KEY
    response = client.chat_completion(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Hello"}],
    )

Or, if you already use the official OpenAI SDK, change one line:

    from whoai import openai_client
    client = openai_client()          # then use it exactly as before

WHOAI is strict BYOK: your provider keys live encrypted in your workspace and
are injected server-side, so this package never sees them.
"""

from ._client import AsyncWhoAI, WhoAI
from ._dropin import async_openai_client, openai_client
from ._errors import (
    WhoAIAuthError,
    WhoAIBudgetError,
    WhoAIConnectionError,
    WhoAIError,
    WhoAIProviderError,
    WhoAIRateLimitError,
)

__version__ = "0.1.0"

__all__ = [
    "WhoAI",
    "AsyncWhoAI",
    "openai_client",
    "async_openai_client",
    "WhoAIError",
    "WhoAIConnectionError",
    "WhoAIAuthError",
    "WhoAIRateLimitError",
    "WhoAIBudgetError",
    "WhoAIProviderError",
    "__version__",
]
