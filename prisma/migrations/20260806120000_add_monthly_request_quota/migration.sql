-- Plan request-quota counter. The runtime gateway reserves against this on
-- every accepted request (see runtime/entitlements/quota_service.py) and the
-- reset-budgets cron zeroes it on the 1st alongside the monthly spend window.
--
-- NOT NULL DEFAULT 0 so existing organizations start the month with a clean
-- counter rather than a NULL that the atomic `+ 1 <= :quota` guard would
-- silently evaluate to NULL (and therefore never match, blocking every request).
-- (The retention sweep's delete predicates are already covered: SpendLog,
-- RequestLog and ActivityLog each carry an (organizationId, <date>) index.)
ALTER TABLE "Organization" ADD COLUMN "currentMonthlyRequests" INTEGER NOT NULL DEFAULT 0;
