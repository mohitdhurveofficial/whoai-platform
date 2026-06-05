# WHOAI Telemetry Engine Architecture

## Overview

The WHOAI Telemetry Engine is the central nervous system for AI FinOps. Its primary responsibility is tracking every AI request, capturing token counts, calculating costs with high precision, and persisting observability metrics into the database seamlessly. The engine operates asynchronously inside the FastAPI gateway to ensure zero degradation of the critical path (proxying LLM traffic).

## Core Modules

1. **Pricing Registry (`runtime/telemetry/pricing.py`)**: 
   A strict, centralized dictionary mapping models (OpenAI, Anthropic) to input and output cost per 1,000 tokens. This is the absolute single source of truth for platform pricing.

2. **Token Counter (`runtime/telemetry/token_counter.py`)**: 
   Parses raw responses from providers to extract exact token usage metrics. When dealing with streaming requests where `usage` blocks may be omitted or partial, it gracefully falls back to length-based approximation heuristics.

3. **Cost Calculator (`runtime/telemetry/cost_calculator.py`)**: 
   Leverages Python's `decimal` library to compute precise financial operations avoiding floating-point drift. It receives the model name and token dimensions, retrieving pricing logic securely to output a fully bounded `Decimal`.

4. **Spend Logger (`runtime/telemetry/spend_logger.py`)**: 
   Responsible for persisting the immutable `SpendLog` to PostgreSQL. Crucially, it manages the atomic-like increment of an Agent's `currentDailySpend` field ensuring the platform's Kill Switch capability remains accurate without locking.

5. **Activity Logger (`runtime/telemetry/activity_logger.py`)**: 
   The systemic breadcrumb trail. It generates `ActivityLog` records across defined macro-events (`REQUEST_RECEIVED`, `REQUEST_COMPLETED`, `BUDGET_EXCEEDED`, `PROVIDER_ERROR`).

6. **Usage Metrics Aggregator (`runtime/telemetry/metrics_service.py`)**: 
   Enforces rolling Daily Usage arrays (`UsageMetrics`). Acts essentially as an intelligent upsert wrapper consolidating total requests, total tokens, and total cost incrementally per agent per day.

## Example Request Lifecycle

1. **Inbound Request**: Client sends a chat completion to `/v1/gateway/completions`.
2. **Auth & Setup**: Gateway intercepts, validates JWT identity, and extracts `agent_id` / `org_id`.
3. **Telemetry - Received**: `log_activity` is invoked immediately, logging `REQUEST_RECEIVED`.
4. **Proxy Call**: Gateway negotiates with OpenAI/Anthropic.
   - *If error*: Logs `PROVIDER_ERROR` activity and returns HTTP 502.
5. **Telemetry Extraction**: On HTTP 200, `extract_tokens` pulls usage blocks.
6. **Telemetry Calculation**: `calculate_cost` establishes the exact USD price.
7. **Telemetry Persistence**: `log_spend` is called. It executes two operations:
   - Insert `SpendLog`.
   - Update `Agent` -> `currentDailySpend += cost`.
8. **Telemetry Aggregation**: `update_daily_metrics` updates the daily tally.
9. **Telemetry - Completed**: `log_activity` logs `REQUEST_COMPLETED`.
10. **Response**: Original payload streamed or returned to the requesting client.
