import { NextResponse } from "next/server";
import { sendBudgetAlert } from "@/lib/email-alerts";

export async function GET() {
  await sendBudgetAlert(
    "mohitdhurveofficial@gmail.com",
    "WHOAI Test Alert",
    "Email alerts are working."
  );

  return NextResponse.json({ success: true });
}