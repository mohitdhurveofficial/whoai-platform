import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";

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

export async function PATCH(req: Request) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
