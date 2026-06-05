import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/analytics/service";
import { getServerAuthContext } from "@/lib/server/auth";

export async function GET() {
  const auth = await getServerAuthContext();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const summary = await getDashboardSummary(auth.organizationId);
  return NextResponse.json(summary);
}
