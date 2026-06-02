import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const aiWorkers = await prisma.aIWorker.findMany();
    return NextResponse.json(aiWorkers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch AI Workers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Server-side validation
    if (!data.name || !data.role || !data.department || !data.owner || !data.status || !data.workspaceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const aiWorker = await prisma.aIWorker.create({
      data: {
        name: data.name,
        role: data.role,
        department: data.department,
        owner: data.owner,
        description: data.description,
        status: data.status,
        workspaceId: data.workspaceId,
      },
    });

    return NextResponse.json(aiWorker, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create AI Worker' }, { status: 500 });
  }
}