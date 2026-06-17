# AI Spend Teardown — Acme AI

> Prepared by WHOAI. Pricing computed from current public model rates.

## The headline

Analysed **20 calls** totalling **$0.04**.

**We identified $0.01 of recoverable spend — 31% of the total.**

| Waste category | Recoverable | Share |
|---|--:|--:|
| Wasted on failed / retried calls | $0.00 | 1.1% |
| Duplicate prompts (cacheable) | $0.00 | 7.3% |
| Over-powered model on short answers | $0.01 | 22.5% |
| **Total recoverable** | **$0.01** | **31.0%** |

Projected annualised saving: **$0.14** (if this sample is ~1 month).

## Where the money goes

| Model | Calls | Spend | Share |
|---|--:|--:|--:|
| gpt-4o | 9 | $0.03 | 80.7% |
| claude-3-opus-20240229 | 3 | $0.01 | 16.8% |
| gpt-4-turbo | 2 | $0.00 | 1.4% |
| claude-3-5-sonnet | 2 | $0.00 | 0.7% |
| gemini-2.5-pro | 2 | $0.00 | 0.3% |
| gpt-3.5-turbo | 1 | $0.00 | 0.0% |
| deepseek-chat | 1 | $0.00 | 0.0% |

## Findings & recommendations

### 1. Failed-call waste — $0.00
2 calls returned an error but still cost money (you pay for input tokens on most failures, and retries multiply it).
**Fix:** stop retrying non-retryable (4xx/auth) errors and cap retry counts. WHOAI enforces this at the gateway.

### 2. Duplicate prompts — $0.00
5 calls repeated a prompt already seen — these are fully cacheable.
**Fix:** add a response cache / dedup layer. WHOAI can short-circuit identical requests.

### 3. Over-powered model on short answers — $0.01
15 calls used a flagship model for a short answer (≤800 output tokens) — a cheaper sibling almost certainly handles these. Suggested swaps (review before applying):

| Swap | Calls | Saving |
|---|--:|--:|
| claude-3-opus-20240229 → claude-3-haiku | 3 | $0.01 |
| gpt-4o → gpt-4.1-mini | 6 | $0.00 |
| gpt-4-turbo → gpt-4.1-mini | 2 | $0.00 |
| claude-3-5-sonnet → claude-3-haiku | 2 | $0.00 |
| gemini-2.5-pro → gemini-2.5-flash | 2 | $0.00 |

**Fix:** route short/simple calls to the cheaper model. WHOAI's policy + routing engine does this automatically.

## How WHOAI makes these permanent

This teardown is a one-time snapshot. WHOAI sits between your app and your providers to *enforce* the fixes continuously: hard budget caps, auto-pause on runaway agents, retry guards, caching, and cheapest-model routing — so the waste never comes back, and a looping agent can't burn your budget overnight.
