import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_URL = "http://127.0.0.1:8001/api/v1/ai-workers";

export async function GET() {
  console.log("GET /api/ai-workers called");

  try {
    const response = await fetch(API_URL);

    console.log("Backend status:", response.status);

    const text = await response.text();

    console.log("Backend response:", text);

    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("ROUTE ERROR:", error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create AI Worker" },
      { status: 500 }
    );
  }
}