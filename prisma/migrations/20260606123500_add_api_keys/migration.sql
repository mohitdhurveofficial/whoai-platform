/*
  Warnings:

  - The primary key for the `Alert` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `status` column on the `Organization` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_agentId_fkey";

-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_organizationId_fkey";

-- DropIndex
DROP INDEX "Alert_organizationId_createdAt_idx";

-- AlterTable
ALTER TABLE "Agent" ALTER COLUMN "dailyBudget" DROP DEFAULT,
ALTER COLUMN "monthlyBudget" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR,
ALTER COLUMN "organizationId" SET DATA TYPE VARCHAR,
ALTER COLUMN "agentId" SET DATA TYPE VARCHAR,
ALTER COLUMN "type" SET DATA TYPE VARCHAR,
ALTER COLUMN "severity" DROP NOT NULL,
ALTER COLUMN "severity" DROP DEFAULT,
ALTER COLUMN "severity" SET DATA TYPE VARCHAR,
ALTER COLUMN "title" SET DATA TYPE VARCHAR,
ALTER COLUMN "message" SET DATA TYPE VARCHAR,
ALTER COLUMN "metadata" SET DATA TYPE JSON,
ALTER COLUMN "resolved" DROP NOT NULL,
ALTER COLUMN "resolved" DROP DEFAULT,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(6),
ADD CONSTRAINT "Alert_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE "OrganizationStatus";

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetViolation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "agentId" TEXT,
    "violationType" TEXT NOT NULL,
    "currentSpend" DECIMAL(18,4) NOT NULL,
    "budgetLimit" DECIMAL(18,4) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetViolation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiKey_organizationId_idx" ON "ApiKey"("organizationId");

-- CreateIndex
CREATE INDEX "BudgetViolation_organizationId_timestamp_idx" ON "BudgetViolation"("organizationId", "timestamp");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BudgetViolation" ADD CONSTRAINT "BudgetViolation_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetViolation" ADD CONSTRAINT "BudgetViolation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
