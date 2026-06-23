import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/db/supabaseAdmin";
import { getStripeClient } from "@/lib/stripe/get-stripe";
import { syncStripeSubscription } from "@/lib/stripe/sync-subscription";

export const runtime = "nodejs";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handledEvents = new Set<string>([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "checkout.session.completed",
]);

async function markEventProcessed(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  event: Stripe.Event
) {
  const { error } = await supabase.from("stripe_webhook_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
  });

  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }
}

async function wasEventProcessed(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  eventId: string
) {
  const { data } = await supabase
    .from("stripe_webhook_events")
    .select("stripe_event_id")
    .eq("stripe_event_id", eventId)
    .maybeSingle();

  return !!data;
}

async function handleSubscriptionEvent(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  subscription: Stripe.Subscription
) {
  return syncStripeSubscription(supabase, subscription);
}

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const supabase = getSupabaseAdmin();

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 500 }
    );
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!handledEvents.has(event.type)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  if (await wasEventProcessed(supabase, event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  type HandledStripeEventType =
    | "customer.subscription.created"
    | "customer.subscription.updated"
    | "customer.subscription.deleted"
    | "checkout.session.completed";

  const eventType = event.type as HandledStripeEventType;

  try {
    switch (eventType) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionEvent(supabase, subscription);
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ["items.data.price"],
          });
          await handleSubscriptionEvent(supabase, subscription);
        }
        break;
      }
      default: {
        const _exhaustive: never = eventType;
        return NextResponse.json(
          { error: `Unhandled event type: ${String(_exhaustive)}` },
          { status: 500 }
        );
      }
    }

    await markEventProcessed(supabase, event);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
