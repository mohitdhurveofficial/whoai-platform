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
    client = new Stripe(secretKey);
  }
  return client;
}
