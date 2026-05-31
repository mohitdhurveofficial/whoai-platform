import { NextResponse } from "next/server";
import { deleteAIWorker, getAIWorkerById, updateAIWorker } from "@/lib/aiWorkers";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const aiWorker = await getAIWorkerById(id);

  if (!aiWorker) {
    return NextResponse.json({ error: "AI worker not found." }, { status: 404 });
  }

  return NextResponse.json(aiWorker);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const updates = await request.json();

  try {
    const aiWorker = await updateAIWorker(id, updates);
    return NextResponse.json(aiWorker);
  } catch (error) {
    return NextResponse.json({ error: "Unable to update AI worker." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await deleteAIWorker(id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: "Unable to delete AI worker." }, { status: 400 });
  }
}
