import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const evidence = await prisma.evidence.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(evidence);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Evidence' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const evidence = await prisma.evidence.create({
      data: {
        workspaceId: data.workspaceId || "demo-workspace",
        fileName: data.fileName,
        fileType: data.fileType,
        url: data.url,
      }
    });
    await prisma.auditLog.create({
      data: { action: 'EVIDENCE_UPLOADED', resource: evidence.id, workspaceId: evidence.workspaceId }
    });
    return NextResponse.json(evidence, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload Evidence metadata' }, { status: 500 });
  }
}