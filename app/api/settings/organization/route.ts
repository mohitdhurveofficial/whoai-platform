import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";
import { requirePermission } from "@/lib/server/guard";
import { sessionCookieOptions } from "@/lib/auth/session";
import { reportError } from "@/lib/observability/report";
import { deleteWorkspace } from "@/lib/workspace/delete";

// Organization profile (name + slug) for the General settings page, which
// previously rendered hardcoded "Acme Corp" placeholders with an inert Save
// button. The organization always comes from the session, never the request.

/** Slugs appear in URLs and are unique across all tenants. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET() {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
    select: { name: true, slug: true },
  });

  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json(organization);
}

/**
 * Permanently delete the workspace.
 *
 * Requires `deleteWorkspace` (OWNER only) and the workspace slug echoed back in
 * the body. The typed confirmation is not decoration: this destroys every
 * agent, provider key, and spend record with no undo, so a mis-click or a
 * forged cross-site request must not be enough to trigger it.
 */
export async function DELETE(req: Request) {
  const guard = await requirePermission("deleteWorkspace");
  if (!guard.ok) return guard.response;
  const auth = guard.auth;

  const body = await req.json().catch(() => ({}));
  const confirmation = typeof body.confirm === "string" ? body.confirm.trim().toLowerCase() : "";

  const organization = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
    select: { slug: true },
  });

  if (!organization) {
    return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
  }

  if (confirmation !== organization.slug.toLowerCase()) {
    return NextResponse.json(
      { error: `Type "${organization.slug}" to confirm deletion.` },
      { status: 400 },
    );
  }

  try {
    const result = await deleteWorkspace(auth.organizationId);

    const response = NextResponse.json({
      success: true,
      // Surfaced so an owner whose subscription could not be cancelled learns
      // it here rather than on their next invoice.
      subscriptionCancelled: result.subscriptionCancelled,
    });
    // The session names an organization that no longer exists; leaving the
    // cookie set would send the browser into a dashboard that 500s.
    response.cookies.set("whoai_auth", "", { ...sessionCookieOptions, maxAge: 0 });
    return response;
  } catch (error) {
    await reportError(error, {
      source: "api:settings/organization:DELETE",
      extra: { organizationId: auth.organizationId },
    });
    return NextResponse.json(
      { error: "Could not delete the workspace. Nothing was removed — please try again." },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const guard = await requirePermission("manageOrganization");
  if (!guard.ok) return guard.response;
  const auth = guard.auth;

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";

  if (!name) {
    return NextResponse.json({ error: "Workspace name is required." }, { status: 400 });
  }
  if (name.length > 100) {
    return NextResponse.json({ error: "Workspace name must be 100 characters or fewer." }, { status: 400 });
  }
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { error: "Slug may contain only lowercase letters, numbers and single hyphens." },
      { status: 400 },
    );
  }
  if (slug.length > 60) {
    return NextResponse.json({ error: "Slug must be 60 characters or fewer." }, { status: 400 });
  }

  try {
    const organization = await prisma.organization.update({
      where: { id: auth.organizationId },
      data: { name, slug },
      select: { name: true, slug: true },
    });

    return NextResponse.json(organization);
  } catch (error) {
    // P2002 = unique constraint. Slug is globally unique, so report the
    // collision rather than a generic 500 the user can't act on.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "That slug is already taken." }, { status: 409 });
    }
    console.error("Organization update error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Could not save changes." }, { status: 500 });
  }
}
