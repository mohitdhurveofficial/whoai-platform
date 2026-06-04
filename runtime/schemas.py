from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

from database.models import AgentStatus


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class DecisionType(str, Enum):
    ALLOW = "allow"
    DENY = "deny"
    NEEDS_APPROVAL = "needs_approval"


# =========================
# Agent Schemas
# =========================

class AgentCreate(BaseModel):
    name: str
    owner_email: str
    environment: str


class AgentResponse(BaseModel):
    id: int
    name: str
    owner_email: str
    environment: str
    agent_token: str
    status: AgentStatus
    created_at: datetime

    class Config:
        from_attributes = True


class AgentUpdate(BaseModel):
    status: AgentStatus


# =========================
# Policy Schemas
# =========================

class PolicyCreate(BaseModel):
    agent_id: int
    action_type: str
    max_amount: int
    environment: str
    needs_approval: bool = False


class PolicyResponse(BaseModel):
    id: int
    agent_id: int
    action_type: str
    max_amount: int
    environment: str
    needs_approval: bool
    created_at: datetime

    class Config:
        from_attributes = True


# =========================
# Authorize Schemas
# =========================

class ResourcePayload(BaseModel):
    order_id: str
    amount: int
    currency: str


class ContextPayload(BaseModel):
    environment: str
    user_id: str
    channel: str


class AuthorizeRequest(BaseModel):
    agent_id: int
    action_type: str
    resource: ResourcePayload
    context: ContextPayload


class AuthorizeResponse(BaseModel):
    decision: DecisionType
    reason: str
    policy_id: Optional[int] = None


# =========================
# Decision Schemas
# =========================

class DecisionResponse(BaseModel):
    id: int
    agent_id: int
    action_type: str
    resource_json: str
    context_json: str
    decision: str
    reason: str
    policy_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# =========================
# Approval Schemas
# =========================

class ApprovalCreate(BaseModel):
    agent_id: int
    action_type: str
    resource_json: str
    context_json: str
    policy_id: Optional[int] = None


class ApprovalResponse(BaseModel):
    id: int
    agent_id: int
    action_type: str
    resource_json: str
    context_json: str
    policy_id: Optional[int]
    status: ApprovalStatus
    approved_by: Optional[str]
    approved_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class ApprovalUpdate(BaseModel):
    status: str
    approved_by: str