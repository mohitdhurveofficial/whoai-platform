import time

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request

from logger_config import setup_logging
from database.session import init_db

from routers import (
    agents,
    approvals,
    authorize,
    decisions,
    metrics,
    policies,
)

from app.policy_engine.runtime_decision import (
    router as policy_router,
)


logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting WhoAI API")

    await init_db()

    yield

    logger.info("Shutting down WhoAI API")


app = FastAPI(
    title="WhoAI",
    description="Runtime governance and authorization for autonomous AI agents.",
    version="0.1.0",
    lifespan=lifespan,
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

    except Exception:
        duration_ms = round((time.time() - start_time) * 1000, 2)

        logger.exception(
            "Unhandled error | method=%s | path=%s | duration_ms=%s",
            request.method,
            request.url.path,
            duration_ms,
        )

        raise


@app.get("/")
async def root():
    return {
        "service": "WhoAI",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
    }


# Existing routers
app.include_router(agents.router, prefix="/api/v1")
app.include_router(policies.router, prefix="/api/v1")
app.include_router(authorize.router, prefix="/api/v1")
app.include_router(approvals.router, prefix="/api/v1")
app.include_router(decisions.router, prefix="/api/v1")
app.include_router(metrics.router, prefix="/api/v1")


# Runtime governance engine router
app.include_router(policy_router, prefix="/api/v1")