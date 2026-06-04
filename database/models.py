from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    DateTime,
    Boolean,
    ForeignKey,
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Organization(Base):
    __tablename__ = "Organization"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    stripeCustomerId = Column(String, unique=True, nullable=True)
    subscriptionTier = Column(String, default="FREE")
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class User(Base):
    __tablename__ = "User"

    id = Column(String, primary_key=True)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), nullable=False)
    email = Column(String, unique=True, nullable=False)
    passwordHash = Column(String, nullable=True)
    role = Column(String, default="VIEWER")
    createdAt = Column(DateTime, default=datetime.utcnow)

class Agent(Base):
    __tablename__ = "Agent"

    id = Column(String, primary_key=True)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    owner = Column(String, nullable=False)
    model = Column(String, nullable=False)
    environment = Column(String, nullable=False)
    agentToken = Column(String, unique=True, nullable=False)
    dailyBudget = Column(Float, nullable=True)
    monthlyBudget = Column(Float, nullable=True)
    status = Column(String, default="ACTIVE")
    createdAt = Column(DateTime, default=datetime.utcnow)

class SpendLog(Base):
    __tablename__ = "SpendLog"

    id = Column(String, primary_key=True)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), nullable=False)
    model = Column(String, nullable=False)
    costUsd = Column(Float, default=0.0)
    createdAt = Column(DateTime, default=datetime.utcnow)
    agentId = Column(String, ForeignKey("Agent.id", ondelete="CASCADE"), nullable=False)
    inputTokens = Column(Integer, default=0)
    outputTokens = Column(Integer, default=0)
    totalTokens = Column(Integer, default=0)

class Alert(Base):
    __tablename__ = "Alert"

    id = Column(String, primary_key=True)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), nullable=False)
    agentId = Column(String, ForeignKey("Agent.id", ondelete="CASCADE"), nullable=True)
    type = Column(String, nullable=False)
    severity = Column(String, default="HIGH")
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    resolved = Column(Boolean, default=False)
    createdAt = Column(DateTime, default=datetime.utcnow)
