import { NextResponse } from "next/server";
import { getAgentAnalytics } from "@/lib/analytics/service";
import { getServerAuthContext } from "@/lib/server/auth";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const auth = await getServerAuthContext();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const analytics = await getAgentAnalytics(auth.organizationId, id);
  if (!analytics) {
    return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json(analytics);
}
