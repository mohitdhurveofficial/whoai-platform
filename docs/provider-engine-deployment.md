# Provider Routing Engine Deployment & Configuration

## Environment Variables

To fully support the unified provider routing engine, the following environment variables must be configured in your `.env` and production environments:

```env
# Required for Gateway Authentication
GATEWAY_SECRET="your_secure_gateway_secret"

# Primary Provider APIs
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Optional / New Provider APIs
GEMINI_API_KEY="AIza..."
GROK_API_KEY="xoxb-..." # or XAI_API_KEY
DEEPSEEK_API_KEY="sk-..."

# Optional: Timeouts
PROVIDER_TIMEOUT_SECONDS=30.0
```

## Deployment Instructions

### 1. Dependencies
Ensure that the new dependencies are installed:
```bash
pip install openai anthropic google-genai httpx
```

### 2. Application Startup
The application automatically registers the new routing layer. No changes are required to `main.py`. The gateway is mounted at `/api/v1` and the new endpoint is available at:
`POST /api/v1/chat/completions`

### 3. Using the Endpoint
Clients can now specify `provider`, `fallback`, and `model` directly in the payload:
```json
{
  "provider": "openai",
  "fallback": "anthropic",
  "model": "gpt-4o",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "stream": true
}
```

### 4. Health Checks
To monitor the health of all configured providers, utilize the new health check endpoint:
`GET /api/v1/providers/status`
This allows monitoring tools (like Datadog or UptimeRobot) to check if API keys are valid and endpoints are reachable.

### 5. Cost Engine & Budgets
The unified cost engine automatically calculates token costs per provider (e.g., `gemini-2.5-flash`, `deepseek-chat`). Budgets are enforced *before* the provider call. If a call fails over to a fallback provider, the cost will be calculated against the fallback provider's model pricing.
