import { NextResponse } from "next/server";
import { getAIWorkerPermissions, grantAIPermission, revokeAIPermission } from "@/lib/aiWorkers";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const permissions = await getAIWorkerPermissions(id);
  return NextResponse.json(permissions);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action, resource, scope, isGranted } = await request.json();

  if (!action || !resource) {
    return NextResponse.json({ error: "Missing action or resource." }, { status: 400 });
  }

  const permission = await grantAIPermission(id, { action, resource, scope, isGranted });
  return NextResponse.json(permission, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action, resource } = await request.json();

  if (!action || !resource) {
    return NextResponse.json({ error: "Missing action or resource." }, { status: 400 });
  }

  await revokeAIPermission(id, action, resource);
  return NextResponse.json({ revoked: true });
}
