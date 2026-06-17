import { NextResponse } from "next/server";
import { getServerAuthContext } from "@/lib/server/auth";
import { routeModel } from "@/lib/smart-router";

export async function POST(request: Request) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.prompt || !body?.model) {
    return NextResponse.json({ error: "prompt and model are required" }, { status: 400 });
  }

  const result = routeModel(body.prompt, body.model, {
    allowDowngrade: body.allowDowngrade ?? true,
    allowUpgrade: body.allowUpgrade ?? true,
    minConfidence: body.minConfidence ?? 0.75,
  });

  return NextResponse.json(result);
}
