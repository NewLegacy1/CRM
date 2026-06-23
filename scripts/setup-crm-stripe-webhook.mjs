import Stripe from "stripe";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?/);
    if (match) process.env[match[1]] = match[2];
  }
}

loadEnv();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const publicUrl =
  process.env.CRM_PUBLIC_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL;

if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY missing from .env.local");
  process.exit(1);
}

if (!publicUrl) {
  console.error(
    "Set CRM_PUBLIC_URL (e.g. https://newlegacyai.ca) in .env.local before running this script."
  );
  process.exit(1);
}

const webhookUrl = new URL("/api/webhooks/stripe", publicUrl).toString();

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-01-28.clover",
});

const enabledEvents = [
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "checkout.session.completed",
];

const existing = await stripe.webhookEndpoints.list({ limit: 100 });
const duplicate = existing.data.find(
  (endpoint) => endpoint.url === webhookUrl && endpoint.status === "enabled"
);

if (duplicate) {
  console.log(
    JSON.stringify({
      status: "exists",
      id: duplicate.id,
      url: duplicate.url,
      message:
        "Webhook already registered. Copy signing secret from Stripe Dashboard if needed.",
    })
  );
  process.exit(0);
}

const endpoint = await stripe.webhookEndpoints.create({
  url: webhookUrl,
  enabled_events: enabledEvents,
  description: "New Legacy CRM - DetailOps subscription tracking",
});

console.log(
  JSON.stringify({
    status: "created",
    id: endpoint.id,
    url: endpoint.url,
    message:
      "Add STRIPE_WEBHOOK_SECRET to Vercel from the Stripe Dashboard (signing secret shown once at creation).",
  })
);

if (endpoint.secret) {
  console.error(
    "Signing secret (store in Vercel as STRIPE_WEBHOOK_SECRET, do not commit):",
    endpoint.secret
  );
}
