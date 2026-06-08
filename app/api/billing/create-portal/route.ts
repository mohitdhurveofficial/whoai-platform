import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getServerAuthContext } from "@/lib/server/auth";

export async function POST(req: Request) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: { stripeCustomerId: true },
    });

    if (!organization?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account yet. Subscribe to a plan first." },
        { status: 404 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: `${appUrl}/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe portal error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Could not open billing portal" }, { status: 500 });
  }
}
