# WHOAI Gateway Production Deployment Guide

This guide covers deploying the WHOAI FastAPI AI Gateway for production traffic, optimizing for high concurrency and resilient streaming connections.

## 1. Prerequisites

- Python 3.14+
- PostgreSQL database (Managed by Prisma in the Next.js App)
- `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` mapped in your environment.
- `GATEWAY_SECRET` (Must match the JWT secret signing the tokens from the auth service).
- `DATABASE_URL` and `ASYNC_DATABASE_URL` (For SQLAlchemy async connection).

## 2. Infrastructure Architecture

For high availability, we recommend:
- **Compute:** AWS ECS / Fargate, Google Cloud Run, or Kubernetes.
- **Load Balancing:** Application Load Balancer (ALB) with support for persistent connections (SSE - Server Sent Events).
- **Database Connection Pooling:** PgBouncer or Supabase connection pooling since the Gateway performs multiple queries per chunk cycle in streaming.

## 3. ASGI Server Configuration (Uvicorn / Gunicorn)

Run the FastAPI application via `uvicorn` using `uvloop` for maximum async performance, or scale across multiple CPU cores using `gunicorn` with `uvicorn` workers.

**Single Instance / Container Entrypoint:**
```bash
uvicorn runtime.main:app --host 0.0.0.0 --port 8001 --workers 4 --loop uvloop
```

**Gunicorn Entrypoint (Recommended for bare metal / VMs):**
```bash
gunicorn runtime.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

*Note: Ensure the number of workers aligns with the CPU cores of your environment.*

## 4. Environment Variables

Store these securely (e.g., AWS Parameter Store, GCP Secret Manager):

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
ASYNC_DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db

# Authentication
GATEWAY_SECRET=your_secure_random_string

# Provider Keys
OPENAI_API_KEY=sk-xxxx...
ANTHROPIC_API_KEY=sk-ant-xxxx...
```

## 5. Streaming and Timeouts

Streaming responses rely on long-lived HTTP connections. If deploying behind a load balancer, Nginx, or proxy, ensure you adjust timeout constraints:

**Nginx Configuration:**
```nginx
location /api/v1/gateway/ {
    proxy_pass http://whoai_gateway;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_read_timeout 300s;  # Increased for slow LLM generations
    proxy_buffering off;      # Crucial for immediate SSE chunk delivery
}
```

**AWS ALB Configuration:**
- Set **Idle Timeout** to at least 300 seconds to avoid connection drops during large generations.

## 6. Telemetry and Scaling

- **Logs:** Standard output (stdout) is formatted cleanly via the `logger_config.py`. Centralize logs into Datadog, CloudWatch, or ELK.
- **Auto-Scaling:** Scale based on CPU utilization and active connections (long-lived streams tie up connections rather than pure CPU).
- **Rate Limiting:** Implement rate limiting ahead of the Gateway (e.g., via Cloudflare, AWS WAF, or an Envoy proxy) to prevent abuse before it hits the database.

## 7. Migration Management

The Gateway database models map 1:1 to the Prisma Schema. All migrations should be strictly executed via Prisma from the Next.js root:

```bash
npx prisma migrate deploy
```

Once Prisma pushes changes, restart the FastAPI Gateway instances to load any structural changes.
