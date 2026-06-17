import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBudgetAlert } from "@/lib/email-alerts";

// Alerts (runaway/anomaly detections, budget breaches, kill-switch pauses) are
// written to the DB by the gateway and detectors, but nothing ever emailed them
// — so the headline promise ("we alert you the moment an agent goes runaway")
// was only half true. This job finds alerts that haven't been emailed yet,
// notifies the organization's owner, and stamps `notifiedAt` so each alert is
// sent exactly once. Run it every few minutes (see vercel.json).

export const dynamic = "force-dynamic";

// Cap per run so a backlog can't fan out into thousands of sends at once.
const BATCH = 100;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed when unconfigured
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  return run(req);
}

// Allow GET so platform cron schedulers that only issue GET still work.
export async function GET(req: Request) {
  return run(req);
}

async function run(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Oldest unsent alerts first. createdAt is nullable in the schema, so fall
  // back gracefully — nulls simply sort first.
  const pending = await prisma.alert.findMany({
    where: { notifiedAt: null },
    orderBy: { createdAt: "asc" },
    take: BATCH,
  });

  // Resolve each org's recipient once, not per alert.
  const recipientCache = new Map<string, string | null>();
  async function recipientFor(orgId: string): Promise<string | null> {
    if (recipientCache.has(orgId)) return recipientCache.get(orgId)!;
    // Prefer the OWNER; fall back to any member so the alert still lands.
    const owner =
      (await prisma.user.findFirst({
        where: { organizationId: orgId, role: "OWNER" },
        select: { email: true },
      })) ??
      (await prisma.user.findFirst({
        where: { organizationId: orgId },
        select: { email: true },
      }));
    const email = owner?.email ?? null;
    recipientCache.set(orgId, email);
    return email;
  }

  let sent = 0;
  let skippedNoRecipient = 0;
  let failed = 0;

  for (const alert of pending) {
    const email = await recipientFor(alert.organizationId);
    if (!email) {
      skippedNoRecipient++;
      continue;
    }

    const subject = `[WHOAI] ${alert.title}`;
    const body =
      `${alert.message}` +
      (alert.severity ? `<br/><br/><strong>Severity:</strong> ${alert.severity}` : "") +
      `<br/><br/>View details in your WHOAI dashboard.`;

    const result = await sendBudgetAlert(email, subject, body);
    if (result) {
      // Only mark as notified on a successful send, so a transient email
      // failure retries on the next run instead of silently dropping the alert.
      await prisma.alert.update({
        where: { id: alert.id },
        data: { notifiedAt: new Date() },
      });
      sent++;
    } else {
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    scanned: pending.length,
    sent,
    failed,
    skippedNoRecipient,
  });
}
