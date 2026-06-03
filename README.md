<div align="center">
  
  # WHOAI Platform

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

  > **WHOAI helps enterprises see, control, and reduce AI spending before runaway agents become runaway costs.**

  We identify wasted spend, runaway agents, duplicate prompts, and optimization opportunities. If we don't find meaningful savings, don't buy. WHOAI is the enterprise API Gateway and operational control plane that tracks every dollar your autonomous agents spend and eliminates shadow AI.

</div>

## Features

- 💸 **Reduce AI Spend 15-30%:** Real-time observability into token spend. Find exactly which team owns the spend.
- 🛑 **Anomaly Detection & Kill Switch:** Get Slack alerts when an agent's spend increases by 400% in 45 minutes. Instantly suspend runaway agents.
- ✋ **Approval Workflows:** Human-in-the-loop (HITL) approval queues allowing executives to review, approve, or reject high-risk AI decisions before execution.
- 🛡️ **Policy Studio:** Dynamic policy engine enforcing granular, risk-based rules (ALLOW, DENY, REQUIRE_APPROVAL) on agent resources and actions.
- 📊 **Executive Dashboard:** Visualize hierarchical agent delegation (Org Charts) and operational telemetry across the digital workforce.
- 📈 **Analytics & Insights:** Real-time data visualization of agent decision volumes, approval rates, compliance metrics, and risk distributions.
- ⚠️ **Risk Management:** Track, score, and mitigate operational risks tied to agent behaviors with severity classification.
- 🔒 **Evidence Vault (Audit Logs):** Immutable, cryptographic ledger of every action, decision, policy change, and transaction executed by AI workers.
- 🔀 **High-Performance AI Gateway:** Scalable ingestion layer that intercepts LLM traffic, enforces policies dynamically, and perfectly meters API usage. Available for VPC self-hosting.
- 🏢 **Enterprise Multi-Tenancy:** Secure data isolation via strict Organization-level constraints and Role-Based Access Control (RBAC).

## Architecture

WHOAI operates on a split-plane architecture: a Next.js Management/Control Plane for human operators, and a FastAPI Runtime/Ingestion Plane for high-throughput AI agent traffic. Both planes share a unified PostgreSQL database via Prisma ORM.

```mermaid
graph TD;
    Client([Enterprise Users]) <--> |HTTPS| NextJS[Next.js 16 Dashboard]
    AIAgents([Autonomous Agents]) <--> |API/SDK| FastAPI[FastAPI Gateway]
    
    subgraph WHOAI Control Plane
        NextJS <--> |Prisma ORM| DB[(Supabase PostgreSQL)]
    end
    
    subgraph WHOAI Runtime Plane
        FastAPI <--> |SQLAlchemy| DB
    end
    
    DB --- Auth[JWT & Supabase Auth]
```

## Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router) | React server components, static generation, and dashboard UI. |
| **Backend (Mgmt)** | Next.js API Routes | Dashboard API endpoints and server actions. |
| **Backend (Gateway)** | FastAPI (Python 3) | High-throughput AI telemetry ingestion and evaluation. |
| **Language** | TypeScript / Python | Strict end-to-end type safety across both stacks. |
| **Database** | PostgreSQL (Supabase) | Scalable relational data storage. |
| **ORM** | Prisma | Schema definitions, migrations, and typed database client. |
| **Styling** | Tailwind CSS v4 | Utility-first responsive design. |
| **Charting** | Recharts | Interactive SVG charts for the Analytics dashboard. |
| **Authentication** | JWT + Supabase SSR | Secure, stateless HTTP-only cookie authentication. |
| **Deployment** | Vercel / Render | Serverless edge deployment. |

## Project Structure

```text
whoai-platform/
├── app/                      # Next.js App Router (Frontend & API)
│   ├── analytics/            # Operational Insights & KPI Dashboard
│   ├── api/                  # Next.js API Routes (Mgmt Plane)
│   ├── approvals/            # Human-in-the-loop Approval Queue
│   ├── evidence-vault/       # Immutable Audit Logs UI
│   ├── executive-dashboard/  # AI Org Chart & Executive Overview
│   ├── risks/                # Risk Management UI
│   └── layout.tsx & page.tsx # Core Landing Page & Layout
├── components/               # Reusable React UI Components
├── database/                 # FastAPI SQLAlchemy Models & Session
├── lib/                      # Next.js Utilities (Prisma Client, Auth, Actions)
├── prisma/                   # Database Schema & Migrations
│   └── schema.prisma         # Single Source of Truth for Data Models
├── routers/                  # FastAPI Route Handlers (Runtime Plane)
├── utils/                    # Supabase SSR Utilities
├── main.py                   # FastAPI Application Entrypoint
├── package.json              # Node.js Dependencies & Scripts
└── requirements.txt          # Python Dependencies
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL database (Supabase recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/whoai-platform.git
   cd whoai-platform
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Set up Python Virtual Environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Connections
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Authentication
NEXTAUTH_SECRET="your_super_secret_jwt_key_here"

# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_SUPABASE_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### Database Setup

Sync the Prisma schema to your PostgreSQL database:

```bash
npx prisma generate
npx prisma db push
```

### Running Locally

The project uses `concurrently` to run both the Next.js frontend and the FastAPI backend simultaneously:

```bash
npm run dev
```

- **Dashboard (Next.js):** `http://localhost:3000`
- **API Gateway (FastAPI):** `http://localhost:8001/docs`

### Building for Production

```bash
npm run build
```

### Deployment

**Vercel (Next.js Frontend & Mgmt API):**
1. Connect your repository to Vercel.
2. Set the Build Command to `prisma generate && next build`.
3. Add all `.env` variables to the Vercel project settings.
4. Deploy.

## API Overview

### Next.js Management API
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/ai-workers/auth/signup` | `POST` | Registers a new Organization and Owner. |
| `/api/ai-workers/auth/login` | `POST` | Authenticates a user and sets a secure JWT cookie. |
| `/api/auth/me` | `GET` | Validates session and retrieves user details. |
| `/api/ai-workers` | `GET`, `POST` | Manages AI Workers within the organization. |
| `/api/approvals` | `GET`, `POST` | Fetches pending workflow approvals and updates statuses. |
| `/api/risks` | `GET`, `POST` | Logs and retrieves operational risks. |

### FastAPI Runtime Gateway
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/v1/gateway` | `POST` | Intercepts LLM calls to enforce policies and track compute spend. |
| `/api/v1/decisions` | `POST` | Ingests atomic decision logs from autonomous agents. |
| `/api/v1/policies` | `GET` | Fetches active guardrails for edge evaluation. |

## Pricing & Business Model

WHOAI is mission-critical infrastructure, not a productivity tool. 

- **Tier 1 ($2,000/month):** Includes Gateway, Cost tracking, Alerts, Dashboards.
- **Tier 2 ($5,000-$10,000/month):** Includes Budget controls, Kill switch, Approval workflows, Compliance.
- **Tier 3 ($25,000+/year VPC):** Includes Self-hosted deployment, Enterprise support, SSO, Audit exports.

## Product Roadmap

* **Month 1:** Gateway, Token tracking, Cost attribution, Spend database.
* **Month 2:** Budget limits, Kill switch, Cost anomaly detection.
* **Month 3:** Slack alerts, Teams alerts, Weekly FinOps reports.
* **Month 4+:** Agent registry, Policies, Approvals.
* **Year 2+:** Identity layer, Trust certificates, Agent commerce.

## Database Schema

Core models powering the WHOAI OS:

- **Organization:** The root multi-tenant entity tying together billing, users, and AI assets.
- **User:** Carbon-based human operators (Admins, Reviewers, Compliance Officers).
- **Agent (AI Worker):** Silicon-based autonomous workers with cryptographic trust certificates and wallet balances.
- **Policy:** Conditional guardrails governing agent behavior (e.g., "Require approval if discount > 25%").
- **Decision:** Atomic records of actions attempted by agents, resulting in ALLOW, DENY, or NEEDS_APPROVAL.
- **Approval:** Human-in-the-loop workflow states tied to specific high-risk Decisions.
- **AITransaction & SpendLog:** Financial telemetry tracking API token usage and agent-to-agent B2B commerce.
- **AuditLog:** Immutable ledger tracking all platform state changes.

## Security & Governance

- **Policy Engine:** Evaluates actions in real-time against organizational guardrails before routing to external LLMs.
- **Audit Trail:** Append-only logging of user logins, agent provisioning, and configuration changes.
- **Evidence Vault:** Stores immutable cryptographic proofs of major B2B agent decisions and contract executions.
- **Multi-Tenant Isolation:** All queries are strictly scoped by `organizationId`, preventing cross-tenant data leakage.

## Roadmap

### Stage 1: The Registry (Current)
- ✅ Core AI Worker Registry & Authentication
- ✅ Human-in-the-loop Approval Workflows
- ✅ Immutable Evidence Vault & Audit Logging
- ✅ Next.js / FastAPI Split-Plane Architecture

### Stage 2: WHOAI Zero-Trust Gateway (The Next Major Release)
- 🔄 FastAPI API Gateway for real-time traffic interception.
- 🔄 Inbound AI firewall blocking agents without a WHOAI `TrustCertificate`.
- 🔄 Real-time token counting, API spend deduction, and `AITransaction` logging.

### Stage 3: The Trust Network (Planned)
- 📅 Cryptographic Trust Certificates issued to verified enterprise AI workers (The SSL of AI).
- 📅 Enterprise zero-trust firewall integrations.

### Stages 4 & 5: Marketplace & Clearinghouse (Vision)
- 🚀 **AI Worker Marketplace:** An app-store for enterprises to safely hire third-party AI agents.
- 🚀 **AI-to-AI Commerce:** Becoming the "SWIFT/Visa network" for AI agents negotiating, escrowing funds, and executing B2B transactions globally.

## Screenshots

> *Replace the paths below with your actual screenshot images once captured.*

| Landing Page | Executive Dashboard |
|:---:|:---:|
| !Landing Page | !Executive Dashboard |
| **Approval Queue** | **Analytics & Insights** |
| !Approval Queue | !Analytics & Insights |

## Contributing

We welcome contributions to WHOAI! Please read our `CONTRIBUTING.md` for details on our code of conduct, and the process for submitting pull requests to us.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

## Author

**Mohit Dhurve**  
Founder, WHOAI