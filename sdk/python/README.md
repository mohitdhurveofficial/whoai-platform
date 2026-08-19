# WHOAI Python SDK

Route your LLM traffic through WHOAI to get per-agent cost telemetry, budgets
that actually stop spend, and automatic provider failover — without changing how
your code calls a model.

```bash
pip install whoai
```

## Two lines to start

```python
from whoai import WhoAI

client = WhoAI()  # reads WHOAI_API_KEY
response = client.chat_completion(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Summarize Q3 revenue."}],
)
print(response["choices"][0]["message"]["content"])
```

`response` is the provider's own JSON, unmodified — existing code that reads
`choices[0]["message"]["content"]` keeps working.

## Already using the OpenAI SDK?

Change where the client points and nothing else:

```diff
- from openai import OpenAI
- client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
+ from whoai import openai_client
+ client = openai_client()

  response = client.chat.completions.create(
      model="gpt-4o",
      messages=[{"role": "user", "content": "Hello"}],
  )
```

`openai_client()` returns a real `openai.OpenAI` instance, so streaming, tool
calls, and response objects all behave exactly as before. Install the extra with
`pip install "whoai[openai]"`.

One caveat: it fetches a gateway token once, valid for an hour. For a
long-running process, prefer `WhoAI` — it refreshes automatically.

## Where your keys live

WHOAI is strict BYOK. Your OpenAI and Anthropic keys stay encrypted in your
workspace and are injected server-side, so this package never sees them and they
never appear in your application's environment. The only credential your code
holds is a WHOAI agent key (`whoai_sk_...`), which spends nothing on its own and
can be revoked from the dashboard.

## Setup

1. Add a provider key at **Settings → Providers** in the dashboard.
2. Create an agent at **Agents**. The `whoai_sk_...` key is shown once.
3. Export it:

```bash
export WHOAI_API_KEY="whoai_sk_..."
```

Self-hosting the runtime? Point the SDK at it with `WHOAI_BASE_URL`, or
`WhoAI(base_url="https://...")`.

## Failover

Name a second provider and WHOAI retries there when the first fails — using your
key for that provider, still metered and still under the same budget:

```python
client = WhoAI(provider="anthropic", fallback="openai")
```

Per-request overrides win over the client default:

```python
client.chat_completion(model="gpt-4o", messages=[...], provider="openai")
```

## Errors worth handling separately

```python
from whoai import WhoAIBudgetError, WhoAIRateLimitError, WhoAIAuthError

try:
    response = client.chat_completion(model="gpt-4o", messages=[...])
except WhoAIBudgetError as exc:
    # Spend cap, plan quota, or a missing provider key. Not retryable —
    # someone has to raise a limit, upgrade, or add a key.
    log.error("blocked on cost: %s (%s)", exc.message, exc.reason)
except WhoAIRateLimitError as exc:
    # Automatic retries were already exhausted.
    time.sleep(exc.retry_after)
except WhoAIAuthError:
    # Revoked key, paused agent, or wrong workspace.
    ...
```

| Exception | When |
| --- | --- |
| `WhoAIAuthError` | Key rejected, agent paused, wrong workspace |
| `WhoAIBudgetError` | Budget, plan quota, or missing BYOK key |
| `WhoAIRateLimitError` | 429 after retries; carries `retry_after` |
| `WhoAIProviderError` | Upstream model provider failed |
| `WhoAIConnectionError` | Runtime unreachable or timed out |
| `WhoAIError` | Base class for all of the above |

Retries are automatic for 429 and 5xx (respecting `Retry-After`) and never
applied to 4xx or budget refusals, which would not change on a repeat.

## Async

```python
from whoai import AsyncWhoAI

async with AsyncWhoAI() as client:
    response = await client.chat_completion(model="gpt-4o", messages=[...])
```

## Streaming

```python
for line in client.stream_chat_completion(model="gpt-4o", messages=[...]):
    print(line)
```

Yields raw server-sent-event lines. Streamed calls are not retried — once bytes
reach the caller, replaying would duplicate them.

## Configuration

| Argument | Environment | Default |
| --- | --- | --- |
| `api_key` | `WHOAI_API_KEY` | required |
| `base_url` | `WHOAI_BASE_URL` | `https://whoai-api.onrender.com` |
| `provider` | — | `"openai"` |
| `fallback` | — | none |
| `timeout` | — | `120.0` seconds |
| `max_retries` | — | `2` |

## License

MIT
