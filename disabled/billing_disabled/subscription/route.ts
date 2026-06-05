import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true },
  });

  if (!user || !user.organization) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  const org = user.organization;

  return NextResponse.json({
    plan: org.plan,
    status: org.subscriptionStatus,
    renewalDate: org.currentPeriodEnd,
    priceId: org.stripePriceId,
    // Metadata for UI
    isStartup: org.plan === 'STARTUP',
    isGrowth: org.plan === 'GROWTH',
    isEnterprise: org.plan === 'ENTERPRISE',
  });
}