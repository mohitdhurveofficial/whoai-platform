import Stripe from "stripe";

let client: Stripe | null = null;

// Lazy singleton so importing this module never throws at build/test time when
// STRIPE_SECRET_KEY is absent; it only fails when billing is actually used.
export function getStripe(): Stripe {
  if (!client) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    // Pin the API version so the response shapes match what stripe-sync.ts
    // reads (e.g. current_period_end on subscription items in dahlia), instead
    // of silently following the account's default dashboard version.
    client = new Stripe(secretKey, { apiVersion: "2026-05-27.dahlia" });
  }
  return client;
}
