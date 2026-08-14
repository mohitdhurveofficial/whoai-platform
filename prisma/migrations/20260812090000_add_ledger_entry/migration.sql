-- Append-only enforcement ledger (LEDGER-6) and Alert.notifiedAt.
--
-- These models were added to schema.prisma without a matching migration, so the
-- generated Prisma client referenced a LedgerEntry table that did not exist in
-- any database created from the migration history. Recovered here via
-- `prisma migrate diff --from-migrations --to-schema-datamodel`.
--
-- Dated ahead of the team-invites migration so the history stays in the order
-- the schema changes were actually written.

-- CreateEnum
CREATE TYPE "LedgerVerdict" AS ENUM ('ALLOWED', 'CAPPED', 'BLOCKED', 'REROUTED');

-- AlterTable
-- IF NOT EXISTS because production already has this column: it reached the
-- database outside the migration history (a `db push`), so a plain ADD COLUMN
-- aborts the whole migration and the LedgerEntry table below never gets created.
ALTER TABLE "Alert" ADD COLUMN IF NOT EXISTS "notifiedAt" TIMESTAMP(6);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sequence" BIGINT NOT NULL,
    "prevHash" TEXT NOT NULL,
    "recordHash" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "signingKeyId" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "agentId" TEXT,
    "actorAuthorizer" TEXT,
    "policyId" TEXT NOT NULL,
    "verdict" "LedgerVerdict" NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "estimatedCost" TEXT NOT NULL,
    "cost" TEXT,
    "recordTimestamp" TEXT NOT NULL,
    "enforcedBeforeCall" BOOLEAN NOT NULL,
    "enforcementProof" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_recordHash_key" ON "LedgerEntry"("recordHash");

-- CreateIndex
CREATE INDEX "LedgerEntry_organizationId_createdAt_idx" ON "LedgerEntry"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_organizationId_sequence_key" ON "LedgerEntry"("organizationId", "sequence");

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
