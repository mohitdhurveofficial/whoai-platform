import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@/utils/supabase/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const risks = await prisma.risk.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(risks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Risks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const organizationId = user.user_metadata?.organizationId;
    const userId = user.id;

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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create Risk' }, { status: 500 });
  }
}
