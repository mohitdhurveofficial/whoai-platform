import { NextResponse } from "next/server";
import { getSpendByModel } from "@/lib/analytics/service";
import { getServerAuthContext } from "@/lib/server/auth";

export async function GET() {
  const auth = await getServerAuthContext();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(await getSpendByModel(auth.organizationId));
}
