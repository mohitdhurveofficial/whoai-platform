from datetime import datetime
import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    ForeignKey,
    Enum,
)

from database.session import Base


class AgentStatus(str, enum.Enum):
    ACTIVE = "active"
    DISABLED = "disabled"


class ApprovalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    owner_email = Column(String, nullable=False)

    environment = Column(String, nullable=False)

    agent_token = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    status = Column(
        Enum(AgentStatus),
        default=AgentStatus.ACTIVE,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# Dynamic policy model used by the runtime policy engine.
# Policies are matched using agent, action and resource,
# then evaluated using condition/effect.
class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)

    agent = Column(String, nullable=False, index=True)

    action = Column(String, nullable=False, index=True)

    resource = Column(String, nullable=False, index=True)

    condition = Column(String, nullable=False)

    effect = Column(String, nullable=False)

    risk_level = Column(
        String,
        default="medium",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)

    agent_id = Column(
        Integer,
        ForeignKey("agents.id")
    )

    action_type = Column(String, nullable=False)

    resource_json = Column(String, nullable=False)

    context_json = Column(String, nullable=False)

    decision = Column(String, nullable=False)

    reason = Column(String, nullable=False)

    policy_id = Column(Integer, index=True, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)

    agent_id = Column(
        Integer,
        ForeignKey("agents.id"),
        nullable=False
    )

    action_type = Column(String, nullable=False)

    resource_json = Column(String, nullable=False)

    context_json = Column(String, nullable=False)

    policy_id = Column(Integer, index=True, nullable=True)

    status = Column(
        Enum(ApprovalStatus),
        default=ApprovalStatus.PENDING,
        nullable=False
    )

    approved_by = Column(String, nullable=True)

    approved_at = Column(DateTime, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
class AgentMetric(Base):
    __tablename__ = "agent_metrics"

    id = Column(Integer, primary_key=True, index=True)

    agent_id = Column(
        Integer,
        ForeignKey("agents.id"),
        nullable=False
    )

    authorize_count = Column(
        Integer,
        default=0,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )