/**
 * One-off: sync DetailOps subscriptions from Stripe into Supabase.
 * Usage: node scripts/backfill-detailops.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const DETAILOPS_PRODUCTS = new Set([
  "prod_U3zgHA1XvSVodu",
  "prod_U3zjAQI36qyOZY",
]);

function resolveAppSlug(subscription) {
  if (subscription.metadata?.app === "detailops") return "detailops";
  for (const item of subscription.items?.data ?? []) {
    const productId =
      typeof item.price?.product === "string"
        ? item.price.product
        : item.price?.product?.id;
    if (productId && DETAILOPS_PRODUCTS.has(productId)) return "detailops";
  }
  return null;
}

async function syncSubscription(stripe, supabase, subscription) {
  const appSlug = resolveAppSlug(subscription);
  if (!appSlug) return { synced: false, appSlug: null };

  const item = subscription.items?.data?.[0] ?? null;
  const productId =
    item && typeof item.price?.product === "string"
      ? item.price.product
      : item?.price?.product?.id ?? null;

  let planName = null;
  if (productId) {
    try {
      const product = await stripe.products.retrieve(productId);
      planName = product.name;
    } catch {
      planName = null;
    }
  }

  let email = null;
  let name = null;
  const customerRef = subscription.customer;
  if (typeof customerRef === "string") {
    try {
      const customer = await stripe.customers.retrieve(customerRef);
      if (!customer.deleted) {
        email = customer.email ?? null;
        name = customer.name ?? null;
      }
    } catch {
      /* ignore */
    }
  } else if (customerRef && !customerRef.deleted) {
    email = customerRef.email ?? null;
    name = customerRef.name ?? null;
  }

  const periodStart = item?.current_period_start ?? subscription.start_date;
  const periodEnd = item?.current_period_end ?? null;

  const row = {
    app_slug: appSlug,
    stripe_subscription_id: subscription.id,
    stripe_customer_id:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    customer_email: email,
    customer_name: name,
    status: subscription.status,
    plan_name: planName,
    stripe_product_id: productId,
    stripe_price_id: item?.price?.id ?? null,
    amount_cents: item?.price?.unit_amount ?? null,
    currency: subscription.currency ?? "cad",
    billing_interval: item?.price?.recurring?.interval ?? null,
    current_period_start: periodStart
      ? new Date(periodStart * 1000).toISOString()
      : null,
    current_period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    stripe_created_at: new Date(subscription.created * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("stripe_subscriptions")
    .upsert(row, { onConflict: "stripe_subscription_id" });
  if (error) throw new Error(error.message);
  return { synced: true, appSlug };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!url || !serviceKey || !stripeKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or STRIPE_SECRET_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const stripe = new Stripe(stripeKey, { apiVersion: "2026-01-28.clover" });

  let synced = 0;
  let skipped = 0;
  let startingAfter;

  for (;;) {
    const page = await stripe.subscriptions.list({
      limit: 100,
      starting_after: startingAfter,
      status: "all",
      expand: ["data.items.data.price"],
    });

    for (const subscription of page.data) {
      const result = await syncSubscription(stripe, supabase, subscription);
      if (result.synced && result.appSlug === "detailops") synced += 1;
      else skipped += 1;
    }

    if (!page.has_more || page.data.length === 0) break;
    startingAfter = page.data[page.data.length - 1]?.id;
  }

  console.log(JSON.stringify({ synced, skipped, app: "detailops" }));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
