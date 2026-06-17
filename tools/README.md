# AI Bill Teardown — your sales weapon

Hand a prospect a number, not a pitch. This tool reads a customer's AI usage
export and produces a savings report you can sell. **No integration required
from them** — they email you a file, you email them a report.

## Run it

```bash
node tools/teardown.mjs <usage-file> --name "Customer Name" --out report.md
```

Example (try it now):

```bash
node tools/teardown.mjs tools/sample-usage.jsonl --name "Acme AI" --out acme-report.md
```

No build step, no tsx — plain Node. Pricing is read from `pricing.json` at the
repo root, so the numbers match the WHOAI platform.

## What it finds

1. **Failed / retried-call waste** — money spent on errored calls.
2. **Duplicate prompts** — identical prompts repeated (cacheable).
3. **Model overkill** — flagship models used for short answers a cheaper sibling
   handles (e.g. `gpt-4o → gpt-4.1-mini`, `claude-3-opus → claude-3-haiku`).

It prints a headline summary to the console and writes a full Markdown report
you can send as-is or paste into a doc.

## Input format

Per-call records as `.jsonl` (recommended), `.json` array, or `.csv`. Fields
(aliases tolerated, case-insensitive):

| Field | Aliases | Needed for |
|---|---|---|
| `model` | `model_name`, `engine` | everything (required) |
| `input_tokens` | `prompt_tokens`, `tokens_in` | accurate cost |
| `output_tokens` | `completion_tokens`, `tokens_out` | accurate cost + overkill |
| `prompt` | `input_text`, `messages` | duplicate detection |
| `status` | `status_code`, `success` | failed-call waste |

Missing token counts are estimated from prompt/response text length. Rows with no
`model` are skipped and counted.

### How a customer gets you this file
- **Their own request logs** (best) — most teams log model + tokens + status.
- **Provider dashboards / exports** — OpenAI & Anthropic usage exports.
- If they can only give aggregates, you still get spend-by-model and overkill.

## The sales motion

1. **Offer (free):** "Send me a sample of your AI usage logs — I'll show you
   exactly where 15–30% of your spend is wasted. 5 minutes of your time, no ask
   if the savings aren't worth it."
2. **Deliver:** run this tool, send the report. The headline number does the
   selling.
3. **Close:** "Want these fixes made permanent so it never comes back — and a
   kill-switch so an agent can't run away overnight? That's the $2k setup, then
   $299/mo to keep it enforced."

The report's final section already bridges from the one-time teardown to the
recurring WHOAI subscription. That's the upsell, built in.
