import asyncio
import os
import time

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from runtime.logger_config import setup_logging
from runtime.observability import report_error
from database.session import engine, init_db
from runtime.routers.gateway import router as gateway_router
from runtime.routers.auth import router as auth_router
from runtime.routers.analytics import router as analytics_router

logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting WhoAI API")

    await init_db()

    yield

    logger.info("Shutting down WhoAI API")


app = FastAPI(
    title="WhoAI",
    description="AI Cost Observability and FinOps for autonomous agents.",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Restrict CORS to known app origins. `*` together with allow_credentials is
# both invalid per the CORS spec and unsafe; configure CORS_ALLOW_ORIGINS as a
# comma-separated list (defaults to local dev origins).
_default_origins = "http://localhost:3000,http://127.0.0.1:3000"
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOW_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth_router,
    prefix="/api/v1"
)

app.include_router(
    gateway_router,
    prefix="/api/v1"
)

app.include_router(
    analytics_router,
    prefix="/api/v1"
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    logger.info(
        "Request started | method=%s | path=%s",
        request.method,
        request.url.path,
    )

    try:
        response = await call_next(request)

        duration_ms = round((time.time() - start_time) * 1000, 2)

        logger.info(
            "Request completed | method=%s | path=%s | status=%s | duration_ms=%s",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )

        return response

    except Exception as error:
        duration_ms = round((time.time() - start_time) * 1000, 2)

        logger.exception(
            "Unhandled error | method=%s | path=%s | duration_ms=%s",
            request.method,
            request.url.path,
            duration_ms,
        )

        # Ship it somewhere a human will actually see. Reporting is awaited so
        # the event is sent before the serverless/worker context unwinds, and
        # report_error swallows its own failures so this cannot mask the
        # original exception.
        await report_error(
            error,
            source=f"http:{request.url.path}",
            request={
                "path": request.url.path,
                "method": request.method,
                "headers": dict(request.headers),
            },
            extra={"duration_ms": duration_ms},
        )

        raise


@app.get("/")
async def root():
    return {
        "service": "WhoAI",
        "status": "running",
        "version": "0.1.0",
        "docs": "/docs",
        "openapi": "/openapi.json",
        "finops_enabled": True,
    }


@app.get("/health")
async def health():
    """Liveness. Deliberately cheap and dependency-free.

    A supervisor restarts the process when this fails, so it must not depend on
    the database: if it did, a database blip would restart every instance at
    once and turn a recoverable outage into a cold-start stampede.
    """
    return {
        "status": "ok",
    }


# A readiness probe that hangs is worse than one that fails — the load balancer
# learns nothing while requests keep arriving.
READINESS_TIMEOUT_SECONDS = 3.0


@app.get("/health/ready")
async def readiness():
    """Readiness. Point your load balancer or uptime check at this one.

    The gateway cannot serve a single request without the database — it reads
    the agent, its budgets, and the encrypted provider key on every call. A
    process that is up but cannot reach Postgres will 500 every request, so it
    must report itself out of rotation rather than keep absorbing traffic.
    """
    async def ping() -> None:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))

    started = time.monotonic()
    try:
        # wait_for rather than asyncio.timeout, which needs Python 3.11+ and
        # would silently narrow where this can be deployed.
        await asyncio.wait_for(ping(), timeout=READINESS_TIMEOUT_SECONDS)
    except Exception as exc:  # noqa: BLE001 — any failure means "not ready"
        logger.error("READINESS_CHECK_FAILED", extra={"error": str(exc)})
        return JSONResponse(
            status_code=503,
            content={
                "status": "unavailable",
                "database": "unreachable",
                "detail": str(exc)[:200],
            },
        )

    return {
        "status": "ok",
        "database": "ok",
        "latency_ms": round((time.monotonic() - started) * 1000, 2),
    }
