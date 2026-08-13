import { NextResponse } from "next/server";
import { lookupInvite } from "@/lib/team/invites";

/**
 * Resolve an invitation token so the accept page can show who invited you and
 * pre-fill the address the invite is bound to.
 *
 * Deliberately unauthenticated — the recipient has no account yet. The token
 * itself is the credential: 32 random bytes, looked up by hash, and every
 * failure mode returns one identical message so the endpoint cannot be used to
 * enumerate which tokens were ever valid.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";

  const result = await lookupInvite(token);
  if (!result.ok) {
    return NextResponse.json({ valid: false, error: result.error }, { status: 404 });
  }

  // organizationId is withheld: the invitee has no use for it before joining,
  // and echoing internal IDs to an unauthenticated caller is gratuitous.
  return NextResponse.json({
    valid: true,
    email: result.invite.email,
    role: result.invite.role,
    organizationName: result.invite.organizationName,
  });
}
