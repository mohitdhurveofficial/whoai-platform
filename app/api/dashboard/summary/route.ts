import { NextResponse } from "next/server";
import { getDashboardBundle } from "@/lib/analytics/service";
import { getServerAuthContext } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

/**
 * The dashboard itself no longer calls this — it renders the same numbers from
 * the server. Kept for anything scripting against the API, and reduced from six
 * serial aggregates to the one query the page already runs.
 */
export async function GET() {
  const auth = await getServerAuthContext();

  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { kpis } = await getDashboardBundle(auth.organizationId);
    return NextResponse.json(kpis);
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);

    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
