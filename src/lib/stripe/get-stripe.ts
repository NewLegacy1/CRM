import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (!stripeSecretKey) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return stripeClient;
}
