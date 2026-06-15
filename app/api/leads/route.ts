import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TYPES = new Set(["DEMO", "CONTACT"]);

// Where new-lead notifications are sent. Falls back to a sensible default so
// the form still works before SALES_EMAIL is configured in the environment.
const SALES_INBOX = process.env.SALES_EMAIL || "founders@whoai.ai";
const FROM_ADDRESS = "WHOAI <onboarding@resend.dev>";

/**
 * Public lead-capture endpoint for the "Book Demo" and Contact forms.
 * Persists the lead (source of truth) and best-effort emails the sales inbox.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const type = String(body.type || "DEMO").toUpperCase();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const monthlySpend = typeof body.monthlySpend === "string" ? body.monthlySpend.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  // Validation
  if (!VALID_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid lead type." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      type: type as "DEMO" | "CONTACT",
      name,
      email,
      company: company || null,
      monthlySpend: monthlySpend || null,
      message: message || null,
    },
  });

  // Best-effort notification — never fail the request if email delivery fails.
  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: [SALES_INBOX],
      replyTo: email,
      subject: `New ${type === "DEMO" ? "demo request" : "contact"} — ${name}${company ? ` (${company})` : ""}`,
      html: `
        <h2>New ${type === "DEMO" ? "demo request" : "contact message"}</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company) || "—"}</p>
        <p><strong>Monthly AI spend:</strong> ${escapeHtml(monthlySpend) || "—"}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message) || "—"}</p>
      `,
    });
  } catch (err) {
    console.error("Lead notification email failed:", err);
  }

  return NextResponse.json({ ok: true, id: lead.id });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
