import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    agent: "Research Agent",
    budget: 20,
    spend: 26,
    anomaly: true,
    paused: true,
    alerts: [
      "ANOMALY DETECTED",
      "BUDGET EXCEEDED",
      "AGENT PAUSED"
    ]
  });
}