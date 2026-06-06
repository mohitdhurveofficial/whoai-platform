import { NextResponse } from "next/server";

let monthlyBudget = 1000;

export async function GET() {
  return NextResponse.json({
    budget: monthlyBudget,
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  monthlyBudget = body.budget;

  return NextResponse.json({
    success: true,
    budget: monthlyBudget,
  });
}