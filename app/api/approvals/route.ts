import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const approvals = await prisma.approval.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(approvals);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as {
      organizationId?: string;
      decisionId?: string;
      status?: string;
      reviewerId?: string;
    };

    if (!data.organizationId || !data.decisionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const approval = await prisma.approval.create({
      data: {
        organizationId: data.organizationId,
        decisionId: data.decisionId,
        status: data.status || 'PENDING',
        reviewerId: data.reviewerId,
      }
    });

    await prisma.auditLog.create({
      data: { action: 'APPROVAL_CREATED', resource: approval.id, organizationId: approval.organizationId }
    });

    return NextResponse.json(approval, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create approval' }, { status: 500 });
  }
}