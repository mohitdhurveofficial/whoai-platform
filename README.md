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

- 💸 **Per-request cost attribution:** Exact prompt and completion token cost on every call, attributed to the agent that made it.
- 🛑 **Cost anomaly detection:** Alerts when an agent's spend departs from its own baseline. Growth and above.
- 🔌 **Kill switch:** Instantly suspend runaway agents before they burn through your API budget.
- 📊 **Executive dashboard:** Daily and monthly token burn rates, active agents, and top cost offenders.
- 🔀 **AI gateway:** Ingestion layer that intercepts LLM traffic, meters usage, and enforces budgets in the request path.
- 🌐 **Any LLM API:** OpenAI, Anthropic, Gemini, xAI, DeepSeek, Mistral, Groq, Together, Fireworks, OpenRouter, Perplexity, Cerebras, DeepInfra, plus self-hosted and any OpenAI-compatible endpoint. See [`docs/PROVIDERS.md`](docs/PROVIDERS.md).
- 🏢 **Multi-tenancy:** Data isolation via strict organization-level constraints, with role-based access control.

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
| **Deployment** | Vercel | Serverless edge deployment of the control plane. |

## Project Structure

```text
whoai-platform/
├── app/                      # Next.js App Router — control plane
│   ├── (dashboard)/          # Authenticated dashboard routes
│   ├── api/                  # Management-plane API routes
│   └── layout.tsx & page.tsx # Core landing page & layout
├── components/               # All shared React components (@/components)
│   ├── marketing/            # Public-site shell, nav, footer, lead form
│   ├── analytics/            # Dashboard charts & tables
│   └── ui/                   # Primitives and landing-page visuals
├── lib/                      # Next.js utilities (Prisma client, auth, services)
├── prisma/                   # Database schema & migrations
│   └── schema.prisma         # Single source of truth for data models
├── runtime/                  # FastAPI gateway — runtime plane
│   ├── main.py               # FastAPI application entrypoint
│   ├── routers/              # Auth, gateway and analytics routes
│   └── providers/            # BYOK provider adapters (driven by providers.json)
├── database/                 # SQLAlchemy models & session (runtime plane)
├── utils/                    # Supabase SSR utilities
├── sdk/                      # Published client SDKs and examples
├── scripts/                  # Operational & seed scripts
├── tools/                    # AI Bill Teardown sales tool
├── docs/                     # Architecture, billing and deployment docs
├── __tests__/                # Vitest suites (control plane)
├── tests/                    # Pytest suites (runtime plane)
├── package.json              # Node.js dependencies & scripts
└── requirements.txt          # Python dependencies
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
| `/api/agents` | `GET`, `POST` | Manages active AI agents and budget thresholds. |
| `/api/spend` | `GET` | Fetches token burn and cost metrics across the workspace. |
| `/api/alerts` | `GET`, `POST` | Manages spend anomaly alerts and risk thresholds. |

### FastAPI Runtime Gateway
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/v1/gateway` | `POST` | Intercepts LLM calls to track compute spend and enforce budgets. |

## Pricing & Business Model

WHOAI is product-led: self-serve plans that scale with usage, plus a sales-led
Enterprise tier. You always bring your own provider keys (BYOK) — WHOAI never
marks up tokens. Self-serve plans are billed via Stripe subscriptions.

Plan limits and feature entitlements live in [`plans.json`](plans.json), read by
[`lib/subscription.ts`](lib/subscription.ts) (control plane) and
[`runtime/entitlements/plans.py`](runtime/entitlements/plans.py) (gateway).
`lib/subscription.ts` is the single source of truth for the pricing UI and for
entitlement enforcement; the gateway enforces the same numbers server-side, so a
limit cannot be bypassed by calling the API directly.

- **Free ($0/mo):** BYOK, spend & token analytics, dashboards, 1 budget alert, 2 agents · 50k requests/mo, 7-day retention.
- **Starter ($149/mo):** Everything in Free + budget controls & hard limits, instant kill switch, multi-provider routing, 10 agents · 1M requests/mo, 30-day retention.
- **Growth ($499/mo):** Everything in Starter + org RBAC & policy enforcement, cost anomaly detection, provider failover, 50 agents · 5M requests/mo, 90-day retention. *Most popular.*
- **Business ($1,499/mo):** Everything in Growth + advanced governance and priority support, 200 agents · 20M requests/mo, 180-day retention. For teams operating AI at scale.
- **Enterprise (custom, sales-led):** Unlimited agents, custom volume/retention, SLA, and self-hosted/VPC deployment — priced on AI spend under management, typically starting around $25,000/year. VPC / self-hosted engagements start at $30,000/year.

> **Not built yet:** SAML SSO, SCIM and audit-log export are sold as roadmap
> ("coming soon") and are `false` for every tier in `plans.json`. Do not list
> them as shipped features anywhere in the product or marketing site.

> See [`docs/REVENUE_MODEL.md`](docs/REVENUE_MODEL.md) for the sales-led Enterprise motion and revenue projections.

## Product Roadmap

* **Month 1:** Gateway, Token tracking, Cost attribution, Spend database.
* **Month 2:** Budget limits, Kill switch, Cost anomaly detection.
* **Month 3:** Slack alerts, Teams alerts, Weekly FinOps reports.
* **Month 4+:** Advanced budgeting, Custom alerts.

## Database Schema

Core models powering the WHOAI FinOps OS:

- **Organization:** The root multi-tenant entity tying together billing, users, and AI assets.
- **User:** Team members with access to the dashboard.
- **Agent:** Silicon-based autonomous workers actively burning API tokens.
- **SpendLog:** Financial telemetry tracking API token usage, model choices, and associated costs.
- **Alert:** Real-time anomaly detections when an agent breaches budget limits.

## Security & Cost Control

- **Spend Interception:** Perfectly meters API usage in real-time before routing to external LLMs.
- **Budget Enforcement:** Automatically halts agents via a Kill Switch if they breach predefined daily/monthly limits.
- **Multi-Tenant Isolation:** All queries are strictly scoped by `organizationId`, preventing cross-tenant data leakage.

## Roadmap

### Stage 1: The Registry (Current)
- ✅ Core Agent Registry & Spend Tracking
- ✅ Datadog-style Cost Visibility Dashboard
- ✅ Next.js / FastAPI Split-Plane Architecture

### Stage 2: Cost Control & Limits (The Next Major Release)
- 🔄 Real-time token counting, API spend deduction, and detailed `SpendLog` tracking.
- 🔄 Automated Alerts & Kill Switches for runaway agents.


## Screenshots

> *Replace the paths below with your actual screenshot images once captured.*

| Landing Page | Dashboard |
|:---:|:---:|
| !Landing Page | !Dashboard |
| **Agent Registry** | **Analytics & Insights** |
| !Agent Registry | !Analytics & Insights |

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