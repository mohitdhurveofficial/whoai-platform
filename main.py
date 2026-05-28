from contextlib import asynccontextmanager
import time

from fastapi import FastAPI, Request

from logger_config import logger
from database.session import init_db

from routers.agents import router as agents_router
from routers.policies import router as policies_router
from routers.authorize import router as authorize_router
from routers.approvals import router as approvals_router
from routers.decisions import router as decisions_router
from routers.metrics import router as metrics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting WhoAI API")

    await init_db()

    yield

    logger.info("Shutting down WhoAI API")


app = FastAPI(
    title="WhoAI",
    description="Runtime governance layer for autonomous AI agents",
    version="0.1.0",
    lifespan=lifespan
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    logger.info(
        f"Request started | method={request.method} | path={request.url.path}"
    )

    response = await call_next(request)

    process_time = round((time.time() - start_time) * 1000, 2)

    logger.info(
        f"Request completed | method={request.method} | "
        f"path={request.url.path} | "
        f"status={response.status_code} | "
        f"duration_ms={process_time}"
    )

    return response


@app.get("/")
async def root():
    return {
        "service": "WhoAI",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {
        "status": "ok"
    }


app.include_router(
    agents_router,
    prefix="/api/v1",
    tags=["Agents"]
)

app.include_router(
    policies_router,
    prefix="/api/v1",
    tags=["Policies"]
)

app.include_router(
    authorize_router,
    prefix="/api/v1",
    tags=["Authorization"]
)

app.include_router(
    approvals_router,
    prefix="/api/v1",
    tags=["Approvals"]
)

app.include_router(
    decisions_router,
    prefix="/api/v1",
    tags=["Decisions"]
)

app.include_router(
    metrics_router,
    prefix="/api/v1",
    tags=["Metrics"]
)