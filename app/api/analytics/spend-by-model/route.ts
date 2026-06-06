import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { model: "GPT-4o", cost: 320 },
    { model: "Claude", cost: 140 },
    { model: "Gemini", cost: 60 },
  ]);
}