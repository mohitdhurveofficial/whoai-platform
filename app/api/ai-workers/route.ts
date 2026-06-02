import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    const data = (await request.json()) as {
      name?: string;
      environment?: string;
      organizationId?: string;
    };
    
    // Server-side validation
    if (!data.name || !data.environment || !data.organizationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const aiWorker = await prisma.aIWorker.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        environment: data.environment,
        agentToken: crypto.randomUUID(),
        status: "ACTIVE",
      },
    });

    return NextResponse.json(aiWorker, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create AI Worker' }, { status: 500 });
  }
}