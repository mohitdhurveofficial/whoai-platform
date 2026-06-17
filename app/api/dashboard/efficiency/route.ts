import { NextResponse } from "next/server";
import { getServerAuthContext } from "@/lib/server/auth";
import { calculateEfficiency, efficiencyLeaderboard } from "@/lib/efficiency-score";

export async function GET(request: Request) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");

  if (agentId) {
    const metrics = await calculateEfficiency(agentId, auth.organizationId, 7);
    return NextResponse.json(metrics);
  }

  const leaderboard = await efficiencyLeaderboard(auth.organizationId, 7);
  return NextResponse.json(leaderboard);
}
