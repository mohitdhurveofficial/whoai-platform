# WHOAI Go-To-Market Kit — first 200 prospects

Goal: book teardowns → close $2k setups → convert to $299/mo. This is the list
criteria, sourcing plan, and outreach scripts. Fill the table, work it daily.

---

## 1. Who qualifies (ICP)

A prospect is worth contacting only if **most** of these are true:

- **Runs AI in production** — agents, copilots, RAG, support bots, coding agents.
- **AI bill ≥ ~$3k/mo** — below this, 20% savings won't move them. Bigger is better.
- **Autonomous / multi-step agents** — non-deterministic spend = real runaway risk.
- **Small-to-mid team** (5–200 people) — feels cost pain, can buy without procurement.
- **Reachable decision-maker** — founder, CTO, head of eng/AI, or the person who
  owns the OpenAI bill.

### Disqualify (don't waste outreach)
- Pre-product / no real traffic yet.
- Enterprise with procurement (slow — park for later).
- Already deep on a competitor *and* happy.
- Hobby projects / students.

### Best-fit segments (start here)
1. **AI agencies / dev shops** — run clients' AI on client keys; overruns are
   *their* problem. Highest urgency, fastest yes.
2. **AI-native SaaS startups** — agent products, AI copilots, vertical AI tools.
3. **Teams publicly complaining about AI costs** — warmest signal there is.

---

## 2. Where to find the 200 names

Work each source until the table below has 200 rows. ~30–40 min/day.

| Source | What to search / do |
|---|---|
| **X / Twitter** | Search: `"openai bill"`, `"our token costs"`, `"AI costs killing"`, `"$ per month openai"`. Anyone venting = hot lead. |
| **LinkedIn** | Titles: *Founder, CTO, Head of AI, AI Engineer* at companies tagged *Artificial Intelligence*, 2–200 employees. |
| **YC company directory** | Filter recent batches for AI/agents. Founders are reachable & cost-aware. |
| **Product Hunt** | AI launches from the last 6 months — they have live traffic and bills. |
| **AI agency directories / Clutch** | Search "AI development agency", "LLM consulting". |
| **GitHub** | Repos using `openai`, `langchain`, `anthropic` with real activity → find the company. |
| **Reddit / Discord / Slack** | r/LocalLLaMA, r/OpenAI, AI eng communities — people asking how to cut costs. |
| **Your warm network** | Anyone you know doing anything AI. These close 5× faster — do these FIRST. |

### Tracking table (copy into a sheet)

| # | Company | Contact | Role | Channel | Est. AI spend | Signal | Sent | Replied | Status |
|---|---------|---------|------|---------|---------------|--------|------|---------|--------|
| 1 |         |         |      |         |               |        |      |         |        |

`Status`: NEW → SENT → REPLIED → TEARDOWN → PAID → SUBSCRIBED → DEAD

---

## 3. The daily motion

- **~10 personalised outreaches/day** (quality > volume — reference something real).
- **Follow up twice** on no-reply (most replies come on follow-up 1 & 2).
- **Funnel math:** ~220 outreaches → ~22 replies → ~11 teardowns → ~4 paid.
- Point everyone to the offer page: **/teardown**.

---

## 4. Outreach scripts

> Rule: every message references something specific about *them*. Generic = ignored.

### Cold email — initial
**Subject:** wasting 15–30% on AI? (quick free check)

> Hi {{first}} — saw {{company}} is running {{their AI product / agents}}.
>
> Most teams running agents quietly waste 15–30% of their model spend on failed
> calls, duplicate prompts, and over-powered models for simple tasks.
>
> I'll do a free teardown of your AI usage and show you exactly where the waste is
> — to the dollar. Takes you ~5 min to send a sample of your logs, nothing routes
> through us, and if the savings aren't worth it there's no ask.
>
> Want me to take a look? (details: {{site}}/teardown)
>
> — {{you}}

### LinkedIn DM — initial
> Hi {{first}} — you're running real AI workloads at {{company}}, so this might be
> useful: I do free "AI spend teardowns" and most teams find 15–30% they're
> wasting (failed calls, dupes, over-powered models). 5 min of your time, no
> integration. Want your number?

### Follow-up 1 (3 days, no reply)
> Quick bump, {{first}} — still happy to run a free teardown on a sample of your AI
> logs. Teams are usually surprised how much is recoverable. Worth 5 minutes?

### Follow-up 2 (5 days later — the value drop)
> Last nudge {{first}} — here's the kind of thing it surfaces: "38% of calls used a
> flagship model for one-word answers a model 30× cheaper handles." If {{company}}
> has any of that, it's free money. Want me to check?

### When they say "yes / interested"
> Awesome. Send me a sample of your usage logs — ideally model, token counts, and
> status per call (your request logs, or your OpenAI/Anthropic usage export both
> work). I'll have your teardown back within 48 hours.

### When they ask "what's the catch / cost?"
> No catch on the teardown — it's free and read-only. If you love what we find and
> want it made permanent (cheaper-model routing, retry guards, caching, plus a
> kill-switch so an agent can't run away overnight), that's a $2k setup and then
> $299/mo to keep it enforced. But the teardown itself costs you nothing.

### Objection: "we already track our spend"
> Totally — most teams can *see* the number. The teardown is different: it shows
> the *recoverable* number and the exact fixes. Seeing spend is free everywhere;
> knowing which 25% to cut is the part nobody hands you. Want me to show you?

### Objection: "can I trust you with our data?"
> The teardown is read-only — you send a file, nothing routes through us, and I
> only need model + tokens + status (you can strip prompt text entirely; I'll just
> skip duplicate detection). Zero access to your systems.

---

## 5. Closing the teardown → paid

When you deliver the report:
1. Lead with the headline number ("you're recovering ~$X/mo, ~Y%").
2. Walk the 2–3 biggest line items.
3. Then: *"Want me to make these permanent so it doesn't creep back? That's the
   $2k setup — I implement the routing, retry guards, and caching, wire up budget
   caps and the runaway kill-switch, and verify the savings. Then $299/mo to keep
   it enforced."*
4. Send the Stripe payment link. Done.
