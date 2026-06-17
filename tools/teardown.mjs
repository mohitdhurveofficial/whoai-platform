/**
 * WHOAI — AI Bill Teardown
 * ------------------------------------------------------------------
 * Feed it a customer's per-call AI usage export; it produces a savings
 * report you can sell. Zero integration required from the customer —
 * they hand you a file, you hand them a number.
 *
 * Pricing comes from the repo's single source of truth (pricing.json),
 * so the dollar figures match the WHOAI platform exactly.
 *
 *   node tools/teardown.mjs <usage-file> [--out report.md] [--name "Acme"]
 *
 * Supported input formats (per-call records): .jsonl | .json | .csv
 *
 * Recognised fields (aliases tolerated, case-insensitive):
 *   model        model | model_name | engine
 *   input_tokens prompt_tokens | tokens_in | input
 *   output_tokens completion_tokens | tokens_out | output
 *   prompt       input_text | messages | request   (for dup detection)
 *   status       status_code | http_status | success
 *
 * Missing token counts are estimated from prompt/response text (chars/4).
 */

import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------- pricing
function findPricingFile() {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, "pricing.json");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error("Could not locate pricing.json — run from inside the repo.");
}

const PRICING = (() => {
  const raw = JSON.parse(fs.readFileSync(findPricingFile(), "utf8")).models;
  const out = {};
  for (const k of Object.keys(raw)) out[k.toLowerCase()] = raw[k];
  return out;
})();

/** Resolve a model name to its price, with the same fuzzy match the gateway uses. */
function priceFor(model) {
  const m = model.toLowerCase();
  if (PRICING[m]) return PRICING[m];
  for (const key of Object.keys(PRICING)) if (m.includes(key)) return PRICING[key];
  return null;
}

function costOf(model, tin, tout) {
  const p = priceFor(model);
  if (!p) return 0;
  return (tin / 1000) * p.input + (tout / 1000) * p.output;
}

/**
 * Premium -> economical model within the same provider family. A call that asked
 * for a short answer rarely needs the flagship model. Only same-provider swaps
 * are suggested by default so the recommendation is safe to act on.
 */
const DOWNGRADE = {
  "gpt-5": "gpt-4.1-mini",
  "gpt-4o": "gpt-4.1-mini",
  "gpt-4.1": "gpt-4.1-mini",
  "gpt-4-turbo": "gpt-4.1-mini",
  "claude-3-opus-20240229": "claude-3-haiku",
  "claude-3-5-sonnet": "claude-3-haiku",
  "claude-3-5-sonnet-20240620": "claude-3-haiku",
  "gemini-2.5-pro": "gemini-2.5-flash",
  "gemini-1.5-pro": "gemini-1.5-flash",
};

function downgradeTarget(model) {
  const m = model.toLowerCase();
  if (DOWNGRADE[m]) return DOWNGRADE[m];
  for (const key of Object.keys(DOWNGRADE)) if (m.includes(key)) return DOWNGRADE[key];
  return null;
}

// A call is a downgrade candidate when the answer was short — i.e. it did not
// lean on the flagship model's depth. Conservative threshold; labelled "review".
const SHORT_OUTPUT_TOKENS = 800;

// ---------------------------------------------------------------- input
function pick(obj, names) {
  const lower = {};
  for (const k of Object.keys(obj)) lower[k.toLowerCase()] = obj[k];
  for (const n of names) if (lower[n] !== undefined && lower[n] !== "") return lower[n];
  return undefined;
}

const estTokens = (s) => Math.max(1, Math.ceil(s.length / 4));

function normalise(obj) {
  const model = pick(obj, ["model", "model_name", "engine"]);
  if (!model) return null;

  const prompt = pick(obj, ["prompt", "input_text", "messages", "request"]);
  const promptStr = prompt == null ? "" : typeof prompt === "string" ? prompt : JSON.stringify(prompt);
  const response = pick(obj, ["response", "completion", "output_text", "content"]);
  const responseStr = response == null ? "" : typeof response === "string" ? response : JSON.stringify(response);

  let tin = Number(pick(obj, ["input_tokens", "prompt_tokens", "tokens_in", "input"]));
  let tout = Number(pick(obj, ["output_tokens", "completion_tokens", "tokens_out", "output"]));
  if (!Number.isFinite(tin) || tin <= 0) tin = promptStr ? estTokens(promptStr) : 0;
  if (!Number.isFinite(tout) || tout <= 0) tout = responseStr ? estTokens(responseStr) : 0;

  const status = pick(obj, ["status", "status_code", "http_status", "success"]);
  let failed = false;
  if (status !== undefined) {
    const s = String(status).toLowerCase();
    failed = s === "false" || s === "error" || s === "failed" || /^[45]\d\d$/.test(s);
  }

  const promptKey = promptStr ? promptStr.replace(/\s+/g, " ").trim().slice(0, 4000) : null;
  return { model: String(model), tin, tout, promptKey, failed };
}

/** Minimal CSV line splitter that respects double-quoted fields. */
function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

function loadRows(file) {
  const ext = path.extname(file).toLowerCase();
  const text = fs.readFileSync(file, "utf8");
  const raw = [];

  if (ext === ".jsonl" || ext === ".ndjson") {
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (t) try { raw.push(JSON.parse(t)); } catch { /* skip */ }
    }
  } else if (ext === ".json") {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) raw.push(...parsed);
    else if (Array.isArray(parsed.data)) raw.push(...parsed.data);
    else raw.push(parsed);
  } else if (ext === ".csv") {
    const lines = text.split("\n").filter((l) => l.trim());
    const headers = splitCsvLine(lines[0]).map((h) => h.trim());
    for (let i = 1; i < lines.length; i++) {
      const cells = splitCsvLine(lines[i]);
      const obj = {};
      headers.forEach((h, j) => (obj[h] = cells[j]));
      raw.push(obj);
    }
  } else {
    throw new Error(`Unsupported file type "${ext}". Use .jsonl, .json, or .csv`);
  }

  let skipped = 0;
  const rows = [];
  for (const r of raw) {
    const n = normalise(r);
    if (n) rows.push(n);
    else skipped++;
  }
  return { rows, skipped };
}

// ---------------------------------------------------------------- analysis
const usd = (n) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (part, whole) => (whole > 0 ? (part / whole) * 100 : 0);

function analyse(rows) {
  let totalSpend = 0;
  const spendByModel = {};

  let failedSpend = 0;
  let failedCalls = 0;

  const promptSeen = new Map();
  let dupSpend = 0;
  let dupCalls = 0;

  let downgradeSavings = 0;
  let downgradeCalls = 0;
  const downgradeByPair = {};

  for (const r of rows) {
    const cost = costOf(r.model, r.tin, r.tout);
    totalSpend += cost;
    const key = r.model.toLowerCase();
    (spendByModel[key] ??= { spend: 0, calls: 0 });
    spendByModel[key].spend += cost;
    spendByModel[key].calls += 1;

    if (r.failed) { failedSpend += cost; failedCalls += 1; }

    if (r.promptKey) {
      const seen = promptSeen.get(r.promptKey) ?? 0;
      if (seen > 0) { dupSpend += cost; dupCalls += 1; }
      promptSeen.set(r.promptKey, seen + 1);
    }

    if (!r.failed && r.tout <= SHORT_OUTPUT_TOKENS) {
      const target = downgradeTarget(r.model);
      if (target) {
        const cheaper = costOf(target, r.tin, r.tout);
        const saved = cost - cheaper;
        if (saved > 0) {
          downgradeSavings += saved;
          downgradeCalls += 1;
          const pair = `${key} → ${target}`;
          (downgradeByPair[pair] ??= { savings: 0, calls: 0 });
          downgradeByPair[pair].savings += saved;
          downgradeByPair[pair].calls += 1;
        }
      }
    }
  }

  const recoverable = failedSpend + dupSpend + downgradeSavings;

  return {
    totalSpend, calls: rows.length, spendByModel,
    failedSpend, failedCalls, dupSpend, dupCalls,
    downgradeSavings, downgradeCalls, downgradeByPair, recoverable,
  };
}

// ---------------------------------------------------------------- report
function buildReport(a, customer, skipped) {
  const L = [];
  const p = (s = "") => L.push(s);

  p(`# AI Spend Teardown — ${customer}`);
  p();
  p(`> Prepared by WHOAI. Pricing computed from current public model rates.`);
  p();
  p(`## The headline`);
  p();
  p(`Analysed **${a.calls.toLocaleString()} calls** totalling **${usd(a.totalSpend)}**.`);
  p();
  p(`**We identified ${usd(a.recoverable)} of recoverable spend — ${pct(a.recoverable, a.totalSpend).toFixed(0)}% of the total.**`);
  p();
  p(`| Waste category | Recoverable | Share |`);
  p(`|---|--:|--:|`);
  p(`| Wasted on failed / retried calls | ${usd(a.failedSpend)} | ${pct(a.failedSpend, a.totalSpend).toFixed(1)}% |`);
  p(`| Duplicate prompts (cacheable) | ${usd(a.dupSpend)} | ${pct(a.dupSpend, a.totalSpend).toFixed(1)}% |`);
  p(`| Over-powered model on short answers | ${usd(a.downgradeSavings)} | ${pct(a.downgradeSavings, a.totalSpend).toFixed(1)}% |`);
  p(`| **Total recoverable** | **${usd(a.recoverable)}** | **${pct(a.recoverable, a.totalSpend).toFixed(1)}%** |`);
  p();
  p(`Projected annualised saving: **${usd(a.recoverable * 12)}** (if this sample is ~1 month).`);
  p();

  p(`## Where the money goes`);
  p();
  p(`| Model | Calls | Spend | Share |`);
  p(`|---|--:|--:|--:|`);
  const models = Object.entries(a.spendByModel).sort((x, y) => y[1].spend - x[1].spend);
  for (const [m, v] of models) {
    p(`| ${m} | ${v.calls.toLocaleString()} | ${usd(v.spend)} | ${pct(v.spend, a.totalSpend).toFixed(1)}% |`);
  }
  p();

  p(`## Findings & recommendations`);
  p();

  p(`### 1. Failed-call waste — ${usd(a.failedSpend)}`);
  if (a.failedCalls > 0) {
    p(`${a.failedCalls.toLocaleString()} calls returned an error but still cost money (you pay for input tokens on most failures, and retries multiply it).`);
    p(`**Fix:** stop retrying non-retryable (4xx/auth) errors and cap retry counts. WHOAI enforces this at the gateway.`);
  } else {
    p(`No failed calls detected in this sample. 👍`);
  }
  p();

  p(`### 2. Duplicate prompts — ${usd(a.dupSpend)}`);
  if (a.dupCalls > 0) {
    p(`${a.dupCalls.toLocaleString()} calls repeated a prompt already seen — these are fully cacheable.`);
    p(`**Fix:** add a response cache / dedup layer. WHOAI can short-circuit identical requests.`);
  } else {
    p(`No exact duplicate prompts detected (or prompts weren't included in the export).`);
  }
  p();

  p(`### 3. Over-powered model on short answers — ${usd(a.downgradeSavings)}`);
  if (a.downgradeCalls > 0) {
    p(`${a.downgradeCalls.toLocaleString()} calls used a flagship model for a short answer (≤${SHORT_OUTPUT_TOKENS} output tokens) — a cheaper sibling almost certainly handles these. Suggested swaps (review before applying):`);
    p();
    p(`| Swap | Calls | Saving |`);
    p(`|---|--:|--:|`);
    for (const [pair, v] of Object.entries(a.downgradeByPair).sort((x, y) => y[1].savings - x[1].savings)) {
      p(`| ${pair} | ${v.calls.toLocaleString()} | ${usd(v.savings)} |`);
    }
    p();
    p(`**Fix:** route short/simple calls to the cheaper model. WHOAI's policy + routing engine does this automatically.`);
  } else {
    p(`No obvious model-overkill detected. 👍`);
  }
  p();

  p(`## How WHOAI makes these permanent`);
  p();
  p(`This teardown is a one-time snapshot. WHOAI sits between your app and your providers to *enforce* the fixes continuously: hard budget caps, auto-pause on runaway agents, retry guards, caching, and cheapest-model routing — so the waste never comes back, and a looping agent can't burn your budget overnight.`);
  p();
  if (skipped > 0) {
    p(`---`);
    p(`_Note: ${skipped} rows were skipped (missing a model field). Numbers above exclude them._`);
  }
  return L.join("\n");
}

// ---------------------------------------------------------------- main
function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0].startsWith("--")) {
    console.error('Usage: node tools/teardown.mjs <usage-file> [--out report.md] [--name "Customer"]');
    process.exit(1);
  }
  const file = argv[0];
  const outArg = argv.indexOf("--out");
  const nameArg = argv.indexOf("--name");
  const out = outArg > -1 ? argv[outArg + 1] : "teardown-report.md";
  const customer = nameArg > -1 ? argv[nameArg + 1] : "Customer";

  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  const { rows, skipped } = loadRows(file);
  if (rows.length === 0) {
    console.error("No usable rows found. Check the file format and that a 'model' field exists.");
    process.exit(1);
  }

  const a = analyse(rows);
  const report = buildReport(a, customer, skipped);
  fs.writeFileSync(out, report);

  console.log("");
  console.log(`  AI Spend Teardown — ${customer}`);
  console.log(`  ${"-".repeat(40)}`);
  console.log(`  Calls analysed:      ${a.calls.toLocaleString()}`);
  console.log(`  Total spend:         ${usd(a.totalSpend)}`);
  console.log(`  RECOVERABLE:         ${usd(a.recoverable)}  (${pct(a.recoverable, a.totalSpend).toFixed(0)}%)`);
  console.log(`    • failed calls:    ${usd(a.failedSpend)}`);
  console.log(`    • duplicates:      ${usd(a.dupSpend)}`);
  console.log(`    • model overkill:  ${usd(a.downgradeSavings)}`);
  console.log(`  Annualised saving:   ${usd(a.recoverable * 12)}`);
  if (skipped > 0) console.log(`  (skipped ${skipped} malformed rows)`);
  console.log(`  ${"-".repeat(40)}`);
  console.log(`  Report written to:   ${out}`);
  console.log("");
}

main();
