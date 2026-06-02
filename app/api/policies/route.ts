import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "http://127.0.0.1:8001/api/v1/policies/",
      { cache: "no-store" }
    );

    console.log("status:", response.status);

    const text = await response.text();

    console.log("body:", text);

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "content-type": "application/json",
      },
    });
  } catch (error) {
    console.error("POLICIES ROUTE ERROR:", error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}