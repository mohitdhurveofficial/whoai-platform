import { NextResponse } from "next/server";
import { requireFeature } from "@/lib/server/guard";
import { calculateEfficiency, efficiencyLeaderboard } from "@/lib/efficiency-score";

export async function GET(request: Request) {
  const guard = await requireFeature("advancedAnalytics");
  if (!guard.ok) return guard.response;
  const auth = guard.auth;

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");

  if (agentId) {
    const metrics = await calculateEfficiency(agentId, auth.organizationId, 7);
    return NextResponse.json(metrics);
  }

  const leaderboard = await efficiencyLeaderboard(auth.organizationId, 7);
  return NextResponse.json(leaderboard);
}
