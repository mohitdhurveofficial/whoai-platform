-- BYOK: store a non-sensitive last-4 of the key for masked display, and the
-- timestamp of the most recent connection test. Both nullable so existing
-- ProviderCredential rows (and existing organizations) are unaffected.
ALTER TABLE "ProviderCredential" ADD COLUMN "keyLast4" TEXT;
ALTER TABLE "ProviderCredential" ADD COLUMN "lastTestedAt" TIMESTAMP(3);
