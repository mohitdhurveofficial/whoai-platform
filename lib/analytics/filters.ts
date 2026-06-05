import type { UsageFilters } from "@/lib/analytics/types";

const MAX_RANGE_DAYS = 366;

function readString(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key)?.trim();
  return value ? value.slice(0, 120) : undefined;
}

function parseDate(value: string | undefined, endOfDay = false): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function parseUsageFilters(params: URLSearchParams): {
  filters?: UsageFilters;
  error?: string;
} {
  const fromRaw = readString(params, "from");
  const toRaw = readString(params, "to");
  const from = parseDate(fromRaw);
  const to = parseDate(toRaw, true);

  if (fromRaw && !from) return { error: "Invalid from date. Use YYYY-MM-DD." };
  if (toRaw && !to) return { error: "Invalid to date. Use YYYY-MM-DD." };
  if (from && to && from > to) return { error: "from must be before to." };

  if (from && to) {
    const rangeDays = (to.getTime() - from.getTime()) / 86_400_000;
    if (rangeDays > MAX_RANGE_DAYS) {
      return { error: `Date range cannot exceed ${MAX_RANGE_DAYS} days.` };
    }
  }

  return {
    filters: {
      from,
      to,
      agentId: readString(params, "agentId"),
      model: readString(params, "model"),
      provider: readString(params, "provider"),
    },
  };
}
