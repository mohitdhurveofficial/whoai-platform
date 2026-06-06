import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');

  if (!organizationId) {
    return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
  }

  const violations = await prisma.budgetViolation.findMany({
    where: { organizationId },
    orderBy: { timestamp: 'desc' },
    take: 100,
    include: { agent: true },
  });

  return NextResponse.json(violations);
}
