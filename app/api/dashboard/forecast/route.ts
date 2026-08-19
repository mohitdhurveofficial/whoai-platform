import { NextResponse } from "next/server";
import { requireFeature } from "@/lib/server/guard";
import { forecastSpend, detectSpendAnomalies } from "@/lib/predictive-budget";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  // The two modes are sold as different capabilities, so they gate separately:
  // anomaly detection starts at Growth, forecasting rides on advanced analytics.
  // Resolved before the guard so a Starter org asking for anomalies is told it
  // needs Growth, not that its forecast entitlement is missing.
  const guard = await requireFeature(
    type === "anomalies" ? "anomalyDetection" : "advancedAnalytics",
  );
  if (!guard.ok) return guard.response;
  const auth = guard.auth;

  if (type === "anomalies") {
    const anomalies = await detectSpendAnomalies(auth.organizationId, 14);
    return NextResponse.json(anomalies);
  }

  const forecast = await forecastSpend(auth.organizationId, 30);
  return NextResponse.json(forecast);
}
