import os

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base

from runtime.logger_config import setup_logging


load_dotenv()
logger = setup_logging()


DATABASE_URL = os.getenv(
    "ASYNC_DATABASE_URL",
    os.getenv(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./whoai_test.db"
    )
)



engine_kwargs = {
    "echo": False,
    "future": True,
}

if not DATABASE_URL.startswith("sqlite"):
    engine_kwargs["pool_pre_ping"] = True


if DATABASE_URL.startswith(("postgresql", "postgresql+asyncpg")):
    engine = create_async_engine(
        DATABASE_URL,
        connect_args={
            "statement_cache_size": 0
        },
        **engine_kwargs,
    )
else:
    engine = create_async_engine(
        DATABASE_URL,
        **engine_kwargs,
    )


async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)


Base = declarative_base()


async def get_db():
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    # Import models here so SQLAlchemy registers them
    # before create_all runs.
    from database.models import Base as ModelsBase

    logger.info("Initializing database tables")

    async with engine.begin() as conn:
        await conn.run_sync(ModelsBase.metadata.create_all)

    logger.info("Database initialization complete")
