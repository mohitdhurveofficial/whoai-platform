# Providers

WHOAI routes traffic to model providers. Which providers exist is defined in one
file — [`providers.json`](../providers.json) at the repo root — read by both
planes:

| Plane | Reads it via |
| --- | --- |
| FastAPI runtime | [`runtime/providers/provider_factory.py`](../runtime/providers/provider_factory.py) |
| Next.js control plane | [`lib/providers/registry.ts`](../lib/providers/registry.ts) |

Nothing else keeps a list of providers. The BYOK settings page, the key-format
validator, the gateway adapters and the health endpoint all derive from the
registry, which is why adding a vendor is a JSON entry rather than a code change.

## Adding a provider

Add one entry to `providers.json`:

```json
"acme": {
  "label": "Acme AI",
  "api": "openai",
  "baseUrl": "https://api.acme.ai/v1",
  "keyEnv": "ACME_API_KEY",
  "keyPrefixes": [],
  "keyRequired": true,
  "docsUrl": "https://acme.ai/keys"
}
```

That is the whole change for any OpenAI-compatible vendor. It becomes routable
through the gateway, appears in the BYOK settings UI, and is accepted by
`/api/settings/providers`.

Then, so the spend is actually attributed, add its models to
[`pricing.json`](../pricing.json) — see [Cost attribution](#cost-attribution).

### Fields

- **`api`** — the wire protocol, and the only thing that decides which adapter
  serves the provider.
  - `openai` — the shared adapter (`OpenAIProvider` / `OpenAICompatibleAdapter`).
    Almost every vendor speaks this; they differ only by base URL.
  - `anthropic`, `gemini` — genuinely different request/response shapes, served
    by native adapters that own their own endpoints (so their `baseUrl` is null).
- **`baseUrl`** — endpoint for OpenAI-compatible vendors. Both planes append
  `/chat/completions` and `/models` to it.
- **`baseUrlEnv`** *(optional)* — an environment variable that overrides
  `baseUrl`. This is how self-hosted and private endpoints are pointed somewhere
  real without editing the registry.
- **`keyEnv`** — the environment variable holding WHOAI's own platform key for
  this provider. Used for health checks and local testing only; customer traffic
  runs on customer keys.
- **`keyPrefixes`** — documented key prefixes, used as a cheap paste-error check
  before storing a key. **Leave empty when the vendor publishes no stable
  prefix.** An invented rule rejects valid keys, which is worse than not
  checking; the live "Test connection" action is the real verification.
- **`keyRequired`** — false for self-hosted endpoints that authenticate by
  network position. These are excluded from the BYOK settings UI, since an
  operator configures them by environment variable rather than a customer
  pasting a key.

## BYOK

Customer keys are encrypted at rest per organization and decrypted per request.
`ProviderFactory` caches only platform-key singletons — a BYOK instance is always
built fresh and never cached, so a decrypted key cannot be handed to another org.
This is pinned by `tests/test_provider_routing.py::test_byok_instances_are_never_cached`.

Under strict BYOK, a request to a provider the org has no key for is skipped
rather than run on WHOAI's credits.

## Cost attribution

**Routable is not the same as priced.** Cost is computed from
[`pricing.json`](../pricing.json) by
[`runtime/telemetry/pricing.py`](../runtime/telemetry/pricing.py). A model that
is not in that file logs a warning and is recorded at **$0** — deliberately,
because guessing a rate would corrupt the ledger WHOAI's whole value proposition
rests on.

The practical consequence: a newly added provider will route traffic
successfully but report zero spend until its models are priced. Add them to
`pricing.json` in the same change.

## Health

`GET /providers/status` reports only the providers WHOAI holds a platform key
for (`ProviderFactory.configured()`). Providers we deliberately have no
credential for are omitted rather than reported unhealthy.
