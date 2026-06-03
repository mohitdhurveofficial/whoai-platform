import time

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from logger_config import setup_logging
from database.session import init_db


from routers import (
    ai_workers,
    approvals,
    auth,
    api_keys,
    authorize,
    decisions,
    dashboard,
    doctor,
    metrics,
    policies,
    system,
)


from routers.activity import router as activity_router
from routers.analytics import router as analytics_router


from app.policy_engine.runtime_decision import (
    router as policy_router,
)
from app.api.logs import router as logs_router


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
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        "version": "0.1.0",
        "docs": "/docs",
        "openapi": "/openapi.json",
        "runtime_governance": True,
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
    }

 # Authentication router
app.include_router(auth.router)
app.include_router(api_keys.router, prefix="/api/v1")

# Existing routers
app.include_router(ai_workers.router, prefix="/api/v1")
# app.include_router(gateway.router, prefix="/api/v1")
app.include_router(policies.router, prefix="/api/v1")
app.include_router(authorize.router, prefix="/api/v1")
app.include_router(approvals.router, prefix="/api/v1")
app.include_router(decisions.router, prefix="/api/v1")
app.include_router(metrics.router, prefix="/api/v1")
# Dashboard endpoints
app.include_router(dashboard.router)


app.include_router(
    activity_router,
    prefix="/api/v1"
)

app.include_router(
    analytics_router,
    prefix="/api/v1"
)


# Doctor and system intelligence endpoints
app.include_router(doctor.router)
app.include_router(system.router, prefix="/api/v1")


# Runtime governance and approval workflow routers
app.include_router(policy_router, prefix="/api/v1")
app.include_router(logs_router, prefix="/api/v1")