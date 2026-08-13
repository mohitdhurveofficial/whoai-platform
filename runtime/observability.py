"""Error reporting for the FastAPI runtime plane.

Mirrors lib/observability/report.ts on the control-plane side: a structured JSON
line on stdout always, plus a Sentry event when SENTRY_DSN is configured. Posted
over Sentry's documented envelope HTTP endpoint rather than through the sentry-sdk
package, so the two planes share one integration story and one env var, and the
runtime picks up no extra dependency beyond httpx (already required by the
provider SDKs).

report_error never raises. An observability failure must not become an outage.
"""

import json
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Mapping, Optional

import httpx

logger = logging.getLogger("whoai.observability")

# Header and field names that must never leave the process.
REDACTED_KEYS = {
    "authorization",
    "cookie",
    "set-cookie",
    "x-api-key",
    "x-whoai-key",
    "proxy-authorization",
    "api-key",
    "apikey",
    "password",
    "secret",
    "token",
}

REDACTED = "[redacted]"

# A slow Sentry must not hold a gateway request open.
_TIMEOUT_SECONDS = 3.0


def _redact(data: Optional[Mapping[str, Any]]) -> Optional[dict]:
    if not data:
        return None
    return {
        key: (REDACTED if key.lower() in REDACTED_KEYS else value)
        for key, value in data.items()
    }


def _parse_dsn(dsn: str) -> Optional[tuple[str, str]]:
    """Split https://<public_key>@<host>/<project_id> into (endpoint, key).

    Returns None for a malformed DSN so a typo degrades to log-only reporting
    rather than raising on every error.
    """
    try:
        parsed = httpx.URL(dsn)
        project_id = parsed.path.lstrip("/")
        public_key = parsed.username
        if not project_id or not public_key or not parsed.host:
            return None
        # Rebuilt from host/port rather than netloc, which carries the userinfo
        # prefix and would otherwise put the key in the URL twice.
        authority = parsed.host if parsed.port is None else f"{parsed.host}:{parsed.port}"
        return f"{parsed.scheme}://{authority}/api/{project_id}/envelope/", public_key
    except Exception:
        return None


async def _send_to_sentry(
    dsn: str,
    error: BaseException,
    source: str,
    request: Optional[Mapping[str, Any]],
    extra: Optional[Mapping[str, Any]],
) -> None:
    target = _parse_dsn(dsn)
    if not target:
        return
    endpoint, public_key = target

    event_id = uuid.uuid4().hex
    now = datetime.now(timezone.utc).isoformat()

    payload = {
        "event_id": event_id,
        "timestamp": now,
        "platform": "python",
        "level": "error",
        "logger": source,
        "environment": os.getenv("ENVIRONMENT", os.getenv("RENDER_SERVICE_NAME", "development")),
        "release": os.getenv("RENDER_GIT_COMMIT"),
        "exception": {
            "values": [{"type": type(error).__name__, "value": str(error)}]
        },
        "tags": {
            "source": source,
            "route": (request or {}).get("path", "unknown"),
            "method": (request or {}).get("method", "unknown"),
        },
        "extra": {
            **(_redact(extra) or {}),
            "headers": _redact((request or {}).get("headers")),
        },
    }

    envelope = "\n".join(
        [
            json.dumps({"event_id": event_id, "sent_at": now}),
            json.dumps({"type": "event"}),
            json.dumps(payload, default=str),
        ]
    )

    async with httpx.AsyncClient(timeout=_TIMEOUT_SECONDS) as client:
        await client.post(
            f"{endpoint}?sentry_key={public_key}&sentry_version=7",
            content=envelope,
            headers={"Content-Type": "application/x-sentry-envelope"},
        )


async def report_error(
    error: BaseException,
    *,
    source: str = "runtime",
    request: Optional[Mapping[str, Any]] = None,
    extra: Optional[Mapping[str, Any]] = None,
    organization_id: Optional[str] = None,
) -> None:
    """Record a server-side error. Safe to call from any except block."""
    record = {
        "level": "error",
        "service": "runtime",
        "source": source,
        "error": type(error).__name__,
        "message": str(error),
        "path": (request or {}).get("path"),
        "method": (request or {}).get("method"),
        "organizationId": organization_id,
        "extra": _redact(extra),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    # Structured line first, so a Sentry outage still leaves a record.
    try:
        logger.error(json.dumps(record, default=str))
    except Exception:
        logger.error("[report] %s: %s", type(error).__name__, error)

    dsn = os.getenv("SENTRY_DSN")
    if not dsn:
        return

    try:
        await _send_to_sentry(dsn, error, source, request, extra)
    except Exception:
        # Deliberately swallowed — see the module docstring.
        pass
