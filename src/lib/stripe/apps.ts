export interface AppProductConfig {
  slug: string;
  name: string;
  description: string;
  tagline: string;
  url: string;
  logoUrl: string;
  stripeProductIds: string[];
}

export const APP_PRODUCTS: AppProductConfig[] = [
  {
    slug: "detailops",
    name: "DetailOps",
    tagline: "SaaS · CRM for auto detailers",
    description:
      "Booking pages, Stripe deposits, SMS reminders, client history, and invoicing — built for detailing shops.",
    url: "https://detailops.ca",
    logoUrl: "https://detailops.ca/detailopslogo.png",
    stripeProductIds: ["prod_U3zgHA1XvSVodu", "prod_U3zjAQI36qyOZY"],
  },
];

const productIdToAppSlug = new Map<string, string>();

for (const app of APP_PRODUCTS) {
  for (const productId of app.stripeProductIds) {
    productIdToAppSlug.set(productId, app.slug);
  }
}

export function getAppSlugForStripeProduct(productId: string | null | undefined) {
  if (!productId) return null;
  return productIdToAppSlug.get(productId) ?? null;
}

export function getAppBySlug(slug: string) {
  return APP_PRODUCTS.find((app) => app.slug === slug) ?? null;
}

export function subscriptionMatchesTrackedApp(metadata: Record<string, string> | null | undefined) {
  if (metadata?.app) {
    const app = getAppBySlug(metadata.app);
    if (app) return app.slug;
  }
  return null;
}
