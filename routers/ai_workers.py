from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import secrets

from database.session import get_db
from database.models import Agent
from schemas import (
    AgentCreate,
    AgentResponse,
    AgentUpdate
)

router = APIRouter(
    prefix="/ai-workers",
    tags=["ai-workers"],
)


@router.post("", response_model=AgentResponse)
async def create_agent(
    payload: AgentCreate,
    db: AsyncSession = Depends(get_db)
):

    agent = Agent(
        name=payload.name,
        owner_email=payload.owner_email,
        environment=payload.environment,
        agent_token=secrets.token_urlsafe(32),
    )

    db.add(agent)

    await db.commit()

    await db.refresh(agent)

    return agent


@router.get("", response_model=list[AgentResponse])
async def list_agents(
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(select(Agent))

    agents = result.scalars().all()

    return agents


@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent_status(
    agent_id: int,
    payload: AgentUpdate,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Agent).where(Agent.id == agent_id)
    )

    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="AI Worker not found"
        )

    agent.status = payload.status

    await db.commit()

    await db.refresh(agent)

    return agent