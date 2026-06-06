import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    spend: [
      { day: "Mon", cost: 12 },
      { day: "Tue", cost: 18 },
      { day: "Wed", cost: 32 },
      { day: "Thu", cost: 58 },
      { day: "Fri", cost: 96 },
    ],
    alerts: [
      {
        type: "ANOMALY",
        severity: "HIGH",
        message: "Research Agent spend spike detected",
      },
    ],
  });
}