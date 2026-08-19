import { NextResponse } from "next/server";
import { requireFeature } from "@/lib/server/guard";
import { routeModel } from "@/lib/smart-router";

export async function POST(request: Request) {
  // Routing is a pure function of the prompt and model — no tenant data is read,
  // so the guard is here for entitlement, not for scoping.
  const guard = await requireFeature("multiProviderRouting");
  if (!guard.ok) return guard.response;

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
