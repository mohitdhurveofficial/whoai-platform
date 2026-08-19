import { NextResponse } from "next/server";
import { corsHeaders, corsPreflight } from "@/lib/gateway/cors";
import { GATEWAY_COMPLETIONS_URL } from "@/lib/runtime-url";

export function OPTIONS() {
  return corsPreflight();
}


export async function POST() {
  return NextResponse.json(
    {
      error: "This gateway endpoint has been retired.",
      message:
        "Send all traffic to the WHOAI FastAPI runtime gateway. The Next.js route no longer processes LLM requests.",
      use: GATEWAY_COMPLETIONS_URL,
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
