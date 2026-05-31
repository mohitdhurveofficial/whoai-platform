import { NextResponse } from "next/server";
import {
  createAIWorkerIdentity,
  getAIWorkerIdentity,
  updateAIWorkerIdentity,
} from "@/lib/aiWorkers";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const identity = await getAIWorkerIdentity(id);

  if (!identity) {
    return NextResponse.json({ error: "Identity not found." }, { status: 404 });
  }

  return NextResponse.json(identity);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { workerId } = await request.json();

  if (!workerId) {
    return NextResponse.json({ error: "Missing workerId." }, { status: 400 });
  }

  const identity = await createAIWorkerIdentity(id, workerId);
  return NextResponse.json(identity, { status: 201 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { authState, lastActivity } = await request.json();

  const identity = await updateAIWorkerIdentity(id, {
    authState,
    lastActivity: lastActivity ? new Date(lastActivity) : undefined,
  });

  return NextResponse.json(identity);
}
