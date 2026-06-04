import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    message: "Chat temporarily disabled"
  });
}

export async function GET() {
  return NextResponse.json({
    message: "Chat temporarily disabled"
  });
}