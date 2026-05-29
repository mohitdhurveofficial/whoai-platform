# WhoAI API

Runtime governance for autonomous AI agents.

## Quick start

```bash
cd whoai-api
source venv/bin/activate
uvicorn main:app --reload

# WhoAI

The Governance Layer for AI Agents.

WhoAI provides runtime governance, authorization, approvals, audit logging, and health monitoring for autonomous AI agents.

## Features

- Agent Authentication
- Dynamic Policy Engine
- Runtime Authorization
- Approval Workflows
- Decision Logging
- Audit Trail
- Multi-Agent Architecture (in progress)
- WhoAI Doctor Health System

## Architecture

```text
AI Agent
    ↓
WhoAI
    ↓
Policy Evaluation
    ↓
Allow / Deny / Approval
    ↓
Execution
```

## WhoAI Doctor

Built-in operational monitoring.

Endpoints:

- GET /api/v1/system/health
- GET /api/v1/system/readiness
- GET /api/v1/system/diagnostics
- POST /api/v1/system/repair

## Quick Start

```bash
cd whoai-api
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

## API Documentation

Swagger:

```text
/docs
```

OpenAPI:

```text
/openapi.json
```

## Roadmap

### Phase 1
- Authentication
- Agent Management

### Phase 2
- Dynamic Policy Engine
- Runtime Governance

### Phase 2.5
- WhoAI Doctor
- Diagnostics
- Repair Framework

### Phase 3
- Multi-Agent Support
- Agent Risk Profiles
- Agent Analytics

### Phase 4
- Enterprise Dashboard
- Security Center
- Approval Management

### Phase 5
- SDKs
- LangGraph Integration
- CrewAI Integration
- OpenAI Agent Integration

## Vision

WhoAI aims to become the governance and trust layer for autonomous AI systems, allowing organizations to safely control, monitor, audit, and approve AI actions before they are executed.