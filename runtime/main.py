import time

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from runtime.logger_config import setup_logging
from database.session import init_db
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        "finops_enabled": True,
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
    }
