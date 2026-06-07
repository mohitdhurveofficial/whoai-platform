from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Numeric,
    DateTime,
    Boolean,
    ForeignKey,
    JSON,
    Enum,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Organization(Base):
    __tablename__ = "Organization"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    tier = Column(String, default="STARTUP")

    kmsKeyArn = Column(String, nullable=True)
    enforceSso = Column(Boolean, default=False)
    status = Column(String, default="ACTIVE")

    dailyBudget = Column(Numeric(18, 4), default=0)
    monthlyBudget = Column(Numeric(18, 4), default=0)
    currentDailySpend = Column(Numeric(18, 4), default=0)
    currentMonthlySpend = Column(Numeric(18, 4), default=0)
    pauseReason = Column(String, nullable=True)
    pausedAt = Column(DateTime, nullable=True)

    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Agent(Base):
    __tablename__ = "Agent"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), nullable=False)

    clientId = Column(String, unique=True, nullable=False)
    clientSecret = Column(String, nullable=False)
    apiKey = Column(String, unique=True, nullable=False)
    scopes = Column(JSON, default=lambda: ["llm:read", "llm:write"])

    status = Column(String, default="ACTIVE")
    dailyBudget = Column(Numeric(18, 4), default=0)
    monthlyBudget = Column(Numeric(18, 4), default=0)
    currentDailySpend = Column(Numeric(18, 4), default=0)
    currentMonthlySpend = Column(Numeric(18, 4), default=0)
    pauseReason = Column(String, nullable=True)
    pausedAt = Column(DateTime, nullable=True)
    pausedBy = Column(String, nullable=True)

    createdAt = Column(DateTime, default=datetime.utcnow)

class SpendLog(Base):
    __tablename__ = "SpendLog"

    id = Column(String, primary_key=True)
    agentId = Column(String, ForeignKey("Agent.id", ondelete="CASCADE"), nullable=False)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), nullable=False)

    model = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    tokensIn = Column(Integer, default=0)
    tokensOut = Column(Integer, default=0)
    cost = Column(Numeric(18, 8), default=0)

    metadata_ = Column("metadata", JSON, nullable=True)

    createdAt = Column(DateTime, default=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "ActivityLog"

    id = Column(String, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), nullable=False)
    agentId = Column(String, ForeignKey("Agent.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)
    status = Column(String, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)
    
    createdAt = Column(DateTime, default=datetime.utcnow)

class RequestLog(Base):
    __tablename__ = "RequestLog"

    id = Column(String, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    agentId = Column(String, ForeignKey("Agent.id", ondelete="CASCADE"), nullable=False)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), nullable=False)
    
    provider = Column(String, nullable=False)
    model = Column(String, nullable=False)
    requestPayloadSize = Column(Integer, default=0)
    statusCode = Column(Integer, default=200)
    latencyMs = Column(Integer, default=0)
    ipAddress = Column(String, nullable=True)

    createdAt = Column(DateTime, default=datetime.utcnow)

class UsageMetrics(Base):
    __tablename__ = "UsageMetrics"
    
    id = Column(String, primary_key=True)
    agentId = Column(String, ForeignKey("Agent.id", ondelete="CASCADE"), nullable=False)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), nullable=False)
    
    date = Column(DateTime, default=datetime.utcnow)
    totalRequests = Column(Integer, default=0)
    totalTokens = Column(Integer, default=0)
    totalCost = Column(Numeric(18, 4), default=0)

class Alert(Base):
    __tablename__ = "Alert"

    id = Column(String, primary_key=True)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), nullable=False)
    agentId = Column(String, ForeignKey("Agent.id", ondelete="SET NULL"), nullable=True)
    type = Column(String, nullable=False)
    severity = Column(String, default="HIGH")
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    metadata_ = Column("metadata", JSON, nullable=True)
    resolved = Column(Boolean, default=False)
    createdAt = Column(DateTime, default=datetime.utcnow)


class ProviderCredential(Base):
    __tablename__ = "ProviderCredential"

    id = Column(String, primary_key=True)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), nullable=False)
    provider = Column(String, nullable=False)
    # AES-256-GCM ciphertext, format "iv:authTag:ciphertext" (see lib/encryption.ts).
    encryptedApiKey = Column(Text, nullable=False)
    status = Column(String, default="CONNECTED")

    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("organizationId", "provider", name="ProviderCredential_organizationId_provider_key"),
    )
