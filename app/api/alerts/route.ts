import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerAuthContext } from '@/lib/server/auth';

// The organization is taken from the session, never from the request. This
// endpoint previously read `?organizationId=` and returned that org's alerts
// without authenticating at all, so any caller could enumerate another
// tenant's budget alerts by guessing an id.

export async function GET() {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const alerts = await prisma.alert.findMany({
    where: { organizationId: auth.organizationId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { agent: true },
  });

  return NextResponse.json(alerts);
}

export async function PATCH(request: Request) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { id, resolved } = body as { id?: string; resolved?: boolean };

  if (!id || typeof resolved !== 'boolean') {
    return NextResponse.json(
      { error: 'id and resolved are required' },
      { status: 400 },
    );
  }

  // Scoped by organizationId so an id belonging to another tenant matches no
  // rows rather than mutating their alert.
  const result = await prisma.alert.updateMany({
    where: { id, organizationId: auth.organizationId },
    data: { resolved },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
