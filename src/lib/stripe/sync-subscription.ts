import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import {
  getAppSlugForStripeProduct,
  subscriptionMatchesTrackedApp,
} from "@/lib/stripe/apps";
import { getStripeClient } from "@/lib/stripe/get-stripe";

export interface SyncSubscriptionResult {
  synced: boolean;
  appSlug: string | null;
  stripeSubscriptionId: string;
}

function getPrimaryItem(subscription: Stripe.Subscription) {
  return subscription.items.data[0] ?? null;
}

function resolveAppSlug(subscription: Stripe.Subscription): string | null {
  const fromMetadata = subscriptionMatchesTrackedApp(subscription.metadata);
  if (fromMetadata) return fromMetadata;

  for (const item of subscription.items.data) {
    const productId =
      typeof item.price.product === "string"
        ? item.price.product
        : item.price.product?.id;
    const appSlug = getAppSlugForStripeProduct(productId);
    if (appSlug) return appSlug;
  }

  return null;
}

async function resolveCustomerDetails(
  subscription: Stripe.Subscription
): Promise<{ email: string | null; name: string | null }> {
  const customerRef = subscription.customer;
  if (typeof customerRef !== "string") {
    if (customerRef.deleted) {
      return { email: null, name: null };
    }
    return {
      email: customerRef.email ?? null,
      name: customerRef.name ?? null,
    };
  }

  const stripe = getStripeClient();
  if (!stripe) return { email: null, name: null };

  try {
    const customer = await stripe.customers.retrieve(customerRef);
    if (customer.deleted) return { email: null, name: null };
    return {
      email: customer.email ?? null,
      name: customer.name ?? null,
    };
  } catch {
    return { email: null, name: null };
  }
}

export async function syncStripeSubscription(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
): Promise<SyncSubscriptionResult> {
  const appSlug = resolveAppSlug(subscription);
  const stripeSubscriptionId = subscription.id;

  if (!appSlug) {
    return { synced: false, appSlug: null, stripeSubscriptionId };
  }

  const item = getPrimaryItem(subscription);
  const productId =
    item && typeof item.price.product === "string"
      ? item.price.product
      : item && typeof item.price.product === "object"
        ? item.price.product.id
        : null;

  let planName: string | null = null;
  if (productId) {
    const stripe = getStripeClient();
    if (stripe) {
      try {
        const product = await stripe.products.retrieve(productId);
        planName = product.name;
      } catch {
        planName = null;
      }
    }
  }

  const customer = await resolveCustomerDetails(subscription);
  const firstItem = subscription.items.data[0];
  const periodStart = firstItem?.current_period_start ?? subscription.start_date;
  const periodEnd = firstItem?.current_period_end ?? null;

  const row = {
    app_slug: appSlug,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_customer_id:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    customer_email: customer.email,
    customer_name: customer.name,
    status: subscription.status,
    plan_name: planName,
    stripe_product_id: productId,
    stripe_price_id: item?.price.id ?? null,
    amount_cents: item?.price.unit_amount ?? null,
    currency: subscription.currency ?? "cad",
    billing_interval: item?.price.recurring?.interval ?? null,
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

  if (error) {
    throw new Error(error.message);
  }

  return { synced: true, appSlug, stripeSubscriptionId };
}

export async function backfillAppSubscriptions(
  supabase: SupabaseClient,
  appSlug: string
): Promise<{ synced: number; skipped: number }> {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  let synced = 0;
  let skipped = 0;
  let startingAfter: string | undefined;

  for (;;) {
    const page = await stripe.subscriptions.list({
      limit: 100,
      starting_after: startingAfter,
      status: "all",
      expand: ["data.items.data.price"],
    });

    for (const subscription of page.data) {
      const result = await syncStripeSubscription(supabase, subscription);
      if (result.synced && result.appSlug === appSlug) {
        synced += 1;
      } else {
        skipped += 1;
      }
    }

    if (!page.has_more || page.data.length === 0) break;
    startingAfter = page.data[page.data.length - 1]?.id;
  }

  return { synced, skipped };
}
