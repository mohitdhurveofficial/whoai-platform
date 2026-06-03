# WhoAI — Governance for Autonomous AI Agents

## AI agents are powerful — but risky without oversight

Autonomous AI agents can now issue refunds, modify records, approve actions, and interact with business systems in real time.

But what happens when an AI agent makes a risky or costly decision?

Most teams today have no way to:
- review sensitive AI actions before execution
- enforce approval policies
- create a reliable audit trail
- understand who approved what and why

---

# Meet WhoAI

WhoAI is the safety layer for autonomous AI agents.

It checks risky actions before they happen, routes sensitive requests for human approval, and records every decision for accountability.

Instead of blindly trusting autonomous agents, teams gain:
- policy enforcement
- human oversight
- audit visibility
- controlled execution

---

# One Simple Story

### Scenario:
An AI customer-support agent attempts to issue a $5,000 refund.

### What happens with WhoAI:

1. The AI agent submits the refund request.
2. WhoAI checks the action against company policy.
3. The refund exceeds the allowed threshold.
4. WhoAI blocks automatic execution.
5. An approval request is created for a human manager.
6. The manager reviews and approves the refund.
7. WhoAI records the final decision in the audit log.

**Result:**
The risky action is controlled instead of happening silently.

---

# What WhoAI Provides

## Policy Enforcement
Define what AI agents are allowed to do.

## Human Approval Workflows
Require review for high-risk actions.

## Decision Logging
Create a clear audit trail for accountability and compliance.

## Runtime Protection
Intercept sensitive actions before they execute.

---

# Why It Matters

As AI agents gain more autonomy, companies need safeguards that scale.

WhoAI helps teams:
- prevent costly mistakes
- reduce operational risk
- maintain human oversight
- improve compliance visibility
- safely deploy autonomous systems

---

# Governance in Action

Request → Review → Decision → Record

---

# Try WhoAI

**Live API Docs:**  
https://whoai-api.onrender.com/docs

**Health Endpoint:**  
https://whoai-api.onrender.com/health

**GitHub:**  
https://github.com/mohitdhurveofficial/whoai-api
# WhoAI — Governance Infrastructure for Autonomous AI Agents

## The Missing Control Layer for AI Agents

AI agents can now access business systems, process refunds, update records, approve workflows, execute actions, and make decisions with minimal human involvement.

As organizations deploy increasingly autonomous agents, a critical question emerges:

**Who governs the AI?**

Without proper controls, AI agents can:
- execute high-risk actions without review
- trigger costly financial mistakes
- violate internal policies
- create compliance and audit challenges
- operate without accountability

---

# Introducing WhoAI

WhoAI is a governance and oversight platform for autonomous AI systems.

It sits between AI agents and business-critical actions, ensuring that every decision is evaluated, governed, logged, and approved when necessary.

Think of WhoAI as:

**"Auth0 for AI Governance"**

Just as authentication platforms control who can access systems, WhoAI controls what AI agents are allowed to do.

---

# How It Works

When an AI agent requests an action:

1. Agent submits an action request.
2. WhoAI evaluates the request against policies.
3. Risk level is determined.
4. Approval workflow is triggered if required.
5. Human reviewers can approve or reject.
6. Decision is recorded.
7. Full audit trail is preserved.
8. Approved actions proceed safely.

---

# Example Use Case

### Customer Support Refund Agent

An AI support agent attempts to issue a $5,000 refund.

### Without WhoAI

- Refund executes immediately.
- No review process.
- No accountability.
- Potential financial loss.

### With WhoAI

- Policy detects high-risk refund.
- Automatic execution is blocked.
- Approval request is generated.
- Manager reviews the request.
- Decision is logged permanently.
- Action proceeds only after approval.

Result:

**Human oversight remains in control of critical decisions.**

---

# Core Capabilities

## Policy Engine

Define governance rules for AI behavior.

Examples:
- Refunds above $1,000 require approval
- Database deletion requests are blocked
- Sensitive actions require manager review

## Human Approval Workflows

Route risky actions to authorized reviewers.

## Runtime Decision Enforcement

Intercept actions before execution.

## Audit & Compliance Logging

Track every decision, approval, rejection, and policy evaluation.

## Multi-Agent Governance

Apply policies across multiple AI agents and workflows.

---

# Ideal For

- AI Agents
- Customer Support Automation
- Finance Operations
- Internal Copilots
- Enterprise AI Systems
- Autonomous Workflows
- Regulated Industries

---

# Why Companies Need AI Governance

AI capabilities are advancing rapidly.

Governance, oversight, and accountability must advance alongside them.

WhoAI helps organizations:

- reduce operational risk
- prevent costly mistakes
- maintain human oversight
- improve compliance readiness
- safely scale autonomous systems

---

# Governance Flow

Agent Request
→ Policy Evaluation
→ Risk Assessment
→ Approval Workflow
→ Decision
→ Audit Log
→ Execution

---

# Current Platform Features

- Runtime Policy Evaluation
- Approval Queue Management
- Audit Logging
- JWT Authentication
- Multi-Agent Support Foundation
- REST API
- PostgreSQL Persistence
- Governance Decision Tracking

---

# Vision

Every organization deploying AI agents should have a governance layer between autonomous intelligence and real-world actions.

WhoAI is building that layer.

---

# Explore WhoAI

Live API Docs:
https://whoai-api.onrender.com/docs

Health Endpoint:
https://whoai-api.onrender.com/health

GitHub:
https://github.com/body: JSON.stringify({
  name,
  environment,
  organizationId: orgId,
}),dhurveofficial/whoai-api
# WhoAI — The Governance Layer for AI Agents

Control, approve, audit, and secure AI actions before they happen.

## The Problem
AI agents can spend money, modify data, access systems, and make high-impact decisions. Yet, organizations lack runtime governance to control or approve these actions before they’re executed.

## Why Existing Solutions Are Not Enough
- Models generate decisions
- Agent frameworks orchestrate workflows
- Security tools protect infrastructure
- Nobody governs AI actions at runtime

## What Is WhoAI?
WhoAI is the governance layer that sits between AI agents and real-world actions. It enforces policies, enables human approvals, and records every decision—before actions are executed.

```text
AI Agent
    ↓
   WhoAI
    ↓
Allow
Deny
Approve
Audit
    ↓
Real-World Action
```

## Core Capabilities
- Runtime Policy Enforcement
- Human Approval Workflows
- Audit Logging
- Multi-Agent Governance
- Risk-Based Decisioning
- WhoAI Doctor Monitoring

## Example
An AI agent requests a $5,000 refund. WhoAI detects that approval is required (based on policy), routes the request to a manager, and only executes the refund if approved—logging the entire process.

## Ideal Customers
- AI startups
- AI agencies
- SaaS companies
- Fintech
- Healthcare
- Enterprises
- Internal AI teams

## Why WhoAI Matters
WhoAI delivers trust, compliance, oversight, and safe autonomy—so organizations can scale AI with confidence, meet regulatory requirements, and maintain control over AI-driven decisions.

## Current Platform Status
- Authentication
- Dynamic Policy Engine
- Approval Workflows
- Decision Logging
- REST API
- PostgreSQL
- WhoAI Doctor
- Multi-Agent Support (In Progress)

## Vision
Every AI action should be governed before it is executed.

Live API Docs: https://whoai-api.onrender.com/docs  
GitHub: https://github.com/mohitdhurveofficial/whoai-api