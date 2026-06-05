import { NextResponse } from "next/server";
import { parseUsageFilters } from "@/lib/analytics/filters";
import { getUsageSummary } from "@/lib/analytics/service";
import { getServerAuthContext } from "@/lib/server/auth";

export async function GET(request: Request) {
  const auth = await getServerAuthContext();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { filters, error } = parseUsageFilters(new URL(request.url).searchParams);
  if (error || !filters) {
    return NextResponse.json({ success: false, error }, { status: 400 });
  }

  return NextResponse.json(await getUsageSummary(auth.organizationId, filters));
}
