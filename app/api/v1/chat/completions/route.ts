import { NextResponse } from "next/server";
import { corsHeaders, corsPreflight } from "@/lib/gateway/cors";

export function OPTIONS() {
  return corsPreflight();
}

const FASTAPI_GATEWAY =
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  "https://your-render-api-url.com/api/v1/chat/completions";

export async function POST() {
  return NextResponse.json(
    {
      error: "This gateway endpoint has been retired.",
      message:
        "Send all traffic to the WHOAI FastAPI runtime gateway. The Next.js route no longer processes LLM requests.",
      use: FASTAPI_GATEWAY,
      docs: "/docs",
    },
    { status: 410, headers: corsHeaders },
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: corsHeaders },
  );
}
