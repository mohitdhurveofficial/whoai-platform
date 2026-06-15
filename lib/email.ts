// lib/email.ts
import { Resend } from "resend";

let client: Resend | null = null;

/**
 * Lazily construct the Resend client.
 *
 * Building it at module load (`new Resend(process.env.RESEND_API_KEY)`) throws
 * "Missing API key" during `next build` page-data collection whenever
 * RESEND_API_KEY is absent — which breaks any build without secrets (CI). Defer
 * construction until the first send so importing this module is always safe.
 */
export function getResend(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    client = new Resend(apiKey);
  }
  return client;
}
