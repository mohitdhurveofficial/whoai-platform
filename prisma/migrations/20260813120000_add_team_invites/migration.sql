-- Team membership: invitations plus an index supporting the member roster.
--
-- User.role already existed and is unchanged; this migration only adds the
-- invitation lifecycle and the index the /api/team/members query needs.

CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED');

CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DEVELOPER',
    -- SHA-256 of the emailed token. The raw token is never stored, so a dump of
    -- this table yields no working join links.
    "tokenHash" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "invitedById" TEXT,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- Acceptance is a single indexed lookup by hash.
CREATE UNIQUE INDEX "Invite_tokenHash_key" ON "Invite"("tokenHash");

-- At most one live invite per address per workspace, so re-inviting replaces
-- rather than accumulating simultaneously-valid links.
CREATE UNIQUE INDEX "Invite_organizationId_email_key" ON "Invite"("organizationId", "email");

CREATE INDEX "Invite_organizationId_status_idx" ON "Invite"("organizationId", "status");

ALTER TABLE "Invite" ADD CONSTRAINT "Invite_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SET NULL rather than CASCADE: removing the inviter must not delete the
-- invitations they sent, which the remaining admins may still want to manage.
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_invitedById_fkey"
    FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- The team roster filters by organizationId on every load.
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");
