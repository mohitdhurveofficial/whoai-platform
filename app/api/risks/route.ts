import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const risks = await prisma.risk.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(risks);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch Risks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("whoai_auth")?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || typeof payload !== "object" || !("userId" in payload)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = (await request.json()) as {
      title?: string;
      description?: string;
      severity?: string;
      score?: number;
      status?: string;
    };

    const organizationId = payload.organizationId as string | undefined;
    const userId = payload.userId as string;

    if (!data.title || !organizationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const risk = await prisma.risk.create({
      data: {
        organizationId: organizationId,
        title: data.title,
        description: data.description,
        severity: data.severity || 'MEDIUM',
        score: data.score || 0.0,
        status: data.status || 'OPEN',
        ownerId: userId,
      },
    });

    await prisma.auditLog.create({
      data: { 
        action: 'RISK_CREATED', 
        resource: risk.id, 
        organizationId: risk.organizationId,
        userId: userId
      }
    });

    return NextResponse.json(risk, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create Risk' }, { status: 500 });
  }
}
