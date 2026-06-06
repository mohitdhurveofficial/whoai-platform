import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { day: "Mon", cost: 20 },
    { day: "Tue", cost: 45 },
    { day: "Wed", cost: 70 },
    { day: "Thu", cost: 120 },
    { day: "Fri", cost: 220 },
  ]);
}