import { NextResponse } from "next/server";
import { getServerAuthContext } from "@/lib/server/auth";
import { forecastSpend, detectSpendAnomalies } from "@/lib/predictive-budget";

export async function GET(request: Request) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "anomalies") {
    const anomalies = await detectSpendAnomalies(auth.organizationId, 14);
    return NextResponse.json(anomalies);
  }

  const forecast = await forecastSpend(auth.organizationId, 30);
  return NextResponse.json(forecast);
}
