import type { SupabaseClient } from "@supabase/supabase-js";
import { getTaxRegion } from "@/lib/invoices/tax-regions";
import { getStripeClient } from "@/lib/stripe/get-stripe";
import {
  getOrCreateTaxRate,
  stripeTaxAmountCents,
} from "@/lib/stripe/get-or-create-tax-rate";

export type InvoiceLineItemInput = {
  description: string;
  quantity: number;
  unit_amount: number;
  isMonthly?: boolean;
};

export type InvoiceTaxInput = {
  enabled: boolean;
  regionCode?: string | null;
};

export type SendClientInvoiceResult = {
  ok: boolean;
  invoice?: {
    id: string;
    client_id: string;
    status: string;
    currency: string;
    amount_total: number;
    amount_due: number | null;
    due_date: string | null;
    stripe_invoice_id: string | null;
    created_at: string;
  };
  message?: string;
  error?: string;
};

function stripeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Stripe failed to create the invoice";
}

export async function sendClientInvoice(params: {
  supabase: SupabaseClient;
  userId: string;
  clientId: string;
  currency?: string;
  lineItems: InvoiceLineItemInput[];
  memo?: string | null;
  footer?: string | null;
  dueDate?: string | null;
  daysUntilDue?: number;
  tax?: InvoiceTaxInput;
}): Promise<SendClientInvoiceResult> {
  const {
    supabase,
    userId,
    clientId,
    currency = "cad",
    lineItems,
    memo,
    footer,
    dueDate,
    daysUntilDue = 14,
    tax,
  } = params;

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, email")
    .eq("id", clientId)
    .single();

  if (!client) {
    return { ok: false, error: "Client not found" };
  }

  const taxEnabled = Boolean(tax?.enabled);
  const taxRegion = taxEnabled
    ? getTaxRegion(tax?.regionCode ?? "ON")
    : null;

  if (taxEnabled && !taxRegion) {
    return { ok: false, error: "Select a valid tax region" };
  }

  const stripe = getStripeClient();
  if (taxEnabled && !stripe) {
    return {
      ok: false,
      error: "Tax cannot be charged because Stripe is not configured",
    };
  }

  const subtotal = lineItems.reduce(
    (sum, row) => sum + row.quantity * row.unit_amount,
    0
  );

  const oneTimeItems = lineItems.filter((item) => !item.isMonthly);
  const recurringItems = lineItems.filter((item) => item.isMonthly);

  const invoiceRecord = {
    client_id: clientId,
    created_by: userId,
    stripe_invoice_id: null as string | null,
    stripe_customer_id: null as string | null,
    status: stripe ? "pending" : "draft",
    currency: currency.toLowerCase(),
    amount_total: subtotal,
    amount_due: subtotal,
    due_date: dueDate || null,
    line_items: lineItems.map((row) => ({
      description: row.description,
      quantity: row.quantity,
      unit_amount: row.unit_amount,
      amount: row.quantity * row.unit_amount,
    })),
    memo: memo || null,
    footer: footer || null,
  };

  if (stripe) {
    try {
      const taxRateIds = taxRegion
        ? [await getOrCreateTaxRate(stripe, taxRegion)]
        : [];

      const resolvedDueDays = dueDate
        ? Math.ceil(
            (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        : daysUntilDue;

      const stripeCustomer = await stripe.customers.create({
        name: client.name,
        email: client.email ?? undefined,
        ...(taxRegion
          ? {
              address: {
                country: taxRegion.country,
                state: taxRegion.state,
              },
            }
          : {}),
      });
      invoiceRecord.stripe_customer_id = stripeCustomer.id;

      const stripeInvoice = await stripe.invoices.create({
        customer: stripeCustomer.id,
        collection_method: "send_invoice",
        days_until_due: resolvedDueDays,
        ...(memo && { description: memo }),
        ...(footer && { footer }),
        ...(taxRateIds.length > 0 ? { default_tax_rates: taxRateIds } : {}),
        metadata: {
          crm_client_id: clientId,
          ...(taxRegion
            ? {
                crm_tax_region: taxRegion.code,
                crm_tax_percent: String(taxRegion.percent),
              }
            : {}),
        },
      });

      for (const row of oneTimeItems) {
        await stripe.invoiceItems.create({
          customer: stripeCustomer.id,
          invoice: stripeInvoice.id,
          description: row.description,
          quantity: row.quantity,
          unit_amount_decimal: String(Math.round(row.unit_amount * 100)),
          currency: currency.toLowerCase(),
          ...(taxRateIds.length > 0 ? { tax_rates: taxRateIds } : {}),
        });
      }

      for (const row of recurringItems) {
        const price = await stripe.prices.create({
          currency: currency.toLowerCase(),
          unit_amount: Math.round(row.unit_amount * 100),
          recurring: { interval: "month" },
          product_data: { name: row.description },
        });

        const subscription = await stripe.subscriptions.create({
          customer: stripeCustomer.id,
          items: [
            {
              price: price.id,
              quantity: row.quantity,
              ...(taxRateIds.length > 0 ? { tax_rates: taxRateIds } : {}),
            },
          ],
          collection_method: "send_invoice",
          days_until_due: resolvedDueDays,
          ...(taxRateIds.length > 0 ? { default_tax_rates: taxRateIds } : {}),
          metadata: {
            crm_client_id: clientId,
            crm_invoice_id: stripeInvoice.id,
            is_invoice_item: "true",
          },
        });

        await stripe.invoiceItems.create({
          customer: stripeCustomer.id,
          invoice: stripeInvoice.id,
          description: `${row.description} (Monthly recurring)`,
          quantity: row.quantity,
          unit_amount_decimal: String(Math.round(row.unit_amount * 100)),
          currency: currency.toLowerCase(),
          subscription: subscription.id,
          ...(taxRateIds.length > 0 ? { tax_rates: taxRateIds } : {}),
        });
      }

      const finalized = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
      const taxCents = stripeTaxAmountCents(finalized);

      if (taxEnabled && taxCents <= 0) {
        if (finalized.id) {
          await stripe.invoices.voidInvoice(finalized.id);
        }
        return {
          ok: false,
          error:
            "Stripe did not add tax to this invoice, so it was not sent. Check the tax rate in Stripe and try again.",
        };
      }

      await stripe.invoices.sendInvoice(finalized.id);

      invoiceRecord.stripe_invoice_id = finalized.id;
      invoiceRecord.status = "sent";
      invoiceRecord.amount_total = (finalized.total ?? 0) / 100;
      invoiceRecord.amount_due = (finalized.amount_due ?? finalized.total ?? 0) / 100;
    } catch (stripeError) {
      console.error("Stripe error:", stripeError);
      if (taxEnabled) {
        return {
          ok: false,
          error: `Invoice was not sent: ${stripeErrorMessage(stripeError)}`,
        };
      }
      invoiceRecord.status = "draft";
    }
  }

  const { data: inserted, error } = await supabase
    .from("invoices")
    .insert([
      {
        ...invoiceRecord,
        sent_at:
          invoiceRecord.status === "sent" ? new Date().toISOString() : null,
      },
    ])
    .select(
      "id, client_id, status, currency, amount_total, amount_due, due_date, stripe_invoice_id, created_at"
    )
    .single();

  if (error) {
    console.error("Insert invoice error:", error);
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    invoice: inserted,
    message: stripe
      ? taxEnabled
        ? `Invoice sent via Stripe with ${taxRegion?.label} ${taxRegion?.percent}%.`
        : "Invoice sent via Stripe."
      : "Stripe key not set — invoice saved as draft.",
  };
}

export async function ensureClientForOnboarding(params: {
  supabase: SupabaseClient;
  userId: string;
  businessName: string;
  email: string;
  existingClientId?: string | null;
}): Promise<{ clientId: string | null; error?: string }> {
  const { supabase, userId, businessName, email, existingClientId } = params;

  if (existingClientId) {
    const { data } = await supabase
      .from("clients")
      .select("id")
      .eq("id", existingClientId)
      .maybeSingle();
    if (data?.id) {
      return { clientId: data.id };
    }
  }

  const { data: byEmail } = await supabase
    .from("clients")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (byEmail?.id) {
    return { clientId: byEmail.id };
  }

  const { data: created, error } = await supabase
    .from("clients")
    .insert([
      {
        name: businessName,
        email,
        company: businessName,
        created_by: userId,
        notes: "Created from client onboarding submission",
      },
    ])
    .select("id")
    .single();

  if (error) {
    console.error("[onboarding] create client", error);
    return { clientId: null, error: error.message };
  }

  return { clientId: created.id };
}
