-- Track a pending cancellation.
--
-- Stripe does not delete a canceled subscription immediately: it flips
-- cancel_at_period_end and keeps serving the plan until currentPeriodEnd. Without
-- this column the billing page reads that state as a healthy renewal and tells
-- the customer their plan "renews" on the very date it is about to end.
--
-- IF NOT EXISTS so re-running against a database that already has the column is a
-- no-op rather than a failed deploy.
ALTER TABLE "Organization"
  ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;
