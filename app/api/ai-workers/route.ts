import { NextResponse } from "next/server";
import { createAIWorker, getAIWorkers } from "@/lib/aiWorkers";

export async function GET() {
  const aiWorkers = await getAIWorkers();
  return NextResponse.json(aiWorkers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, role, department, owner, description } = body;

  if (!name || !role) {
    return NextResponse.json({ error: "Missing required fields: name and role." }, { status: 400 });
  }

  const aiWorker = await createAIWorker({
    name,
    role,
    department,
    owner,
    description,
  });

  return NextResponse.json(aiWorker, { status: 201 });
}
