import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerAuthContext } from '@/lib/server/auth';

export async function GET() {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const spendLogs = await prisma.spendLog.findMany({
    where: { organizationId: auth.organizationId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { agent: true },
  });

  return NextResponse.json(spendLogs);
}
