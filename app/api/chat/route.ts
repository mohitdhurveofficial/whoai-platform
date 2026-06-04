import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Chat temporarily disabled"
    },
    { status: 501 }
  );
}