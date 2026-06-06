import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      agent: "Research Agent",
      cost: 420,
    },
    {
      agent: "Sales Agent",
      cost: 180,
    },
    {
      agent: "Support Agent",
      cost: 90,
    },
  ]);
}