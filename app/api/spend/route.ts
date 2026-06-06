import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  // In a real app, extract organizationId from session/auth
  // For now, get it from search params or mock it
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');

  if (!organizationId) {
    return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
  }

  const spendLogs = await prisma.spendLog.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { agent: true },
  });

  return NextResponse.json(spendLogs);
}
