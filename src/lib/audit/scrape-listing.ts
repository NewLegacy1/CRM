const APIFY_BASE = "https://api.apify.com/v2";

type ApifyPlace = {
  title?: string;
  phone?: string;
  website?: string;
  address?: string;
  totalScore?: number;
  url?: string;
  reviewsCount?: number;
  imageUrls?: string[];
  imagesCount?: number;
  categories?: string[];
  categoryName?: string;
  description?: string;
  openingHours?: unknown;
  postsCount?: number;
  location?: { lat?: number; lng?: number };
};

export type ScrapedPlace = {
  name: string;
  rating: number | null;
  reviewsCount: number | null;
  photosCount: number | null;
  categories: string[];
  hasWebsite: boolean;
  hasHours: boolean;
  hasDescription: boolean;
  postsCount: number | null;
  mapsUrl: string | null;
  address: string | null;
  phone: string | null;
};

function toPlace(place: ApifyPlace): ScrapedPlace {
  const categories = Array.isArray(place.categories)
    ? place.categories.filter((item): item is string => typeof item === "string")
    : place.categoryName
      ? [place.categoryName]
      : [];

  return {
    name: place.title ?? "",
    rating: typeof place.totalScore === "number" ? place.totalScore : null,
    reviewsCount: typeof place.reviewsCount === "number" ? place.reviewsCount : null,
    photosCount:
      typeof place.imagesCount === "number"
        ? place.imagesCount
        : Array.isArray(place.imageUrls)
          ? place.imageUrls.length
          : null,
    categories,
    hasWebsite: Boolean(place.website?.trim()),
    hasHours: place.openingHours != null,
    hasDescription: Boolean(place.description?.trim()),
    postsCount: typeof place.postsCount === "number" ? place.postsCount : null,
    mapsUrl: place.url ?? null,
    address: place.address ?? null,
    phone: place.phone ?? null,
  };
}

async function runMapsSearch(search: string, location: string, max: number): Promise<ScrapedPlace[]> {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new Error("APIFY_TOKEN is not configured");
  }

  const runRes = await fetch(
    `${APIFY_BASE}/acts/lukaskrivka~google-maps-with-contact-details/runs?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchStringsArray: [search],
        locationQuery: `${location}, Ontario, Canada`,
        maxCrawledPlacesPerSearch: max,
        language: "en",
        skipClosedPlaces: true,
      }),
    }
  );

  if (!runRes.ok) {
    throw new Error(`Apify start failed: ${await runRes.text()}`);
  }

  const runData = (await runRes.json()) as { data?: { id?: string } };
  const runId = runData.data?.id;
  if (!runId) throw new Error("No Apify run id");

  let status = "RUNNING";
  for (let i = 0; i < 20 && (status === "RUNNING" || status === "READY"); i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const statusRes = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${token}`);
    if (!statusRes.ok) throw new Error("Apify status failed");
    const statusData = (await statusRes.json()) as { data?: { status?: string } };
    status = statusData.data?.status ?? "UNKNOWN";
  }

  if (status !== "SUCCEEDED") {
    throw new Error(`Apify run ended ${status}`);
  }

  const itemsRes = await fetch(
    `${APIFY_BASE}/actor-runs/${runId}/dataset/items?token=${token}&format=json`
  );
  if (!itemsRes.ok) throw new Error("Apify items failed");
  const items = (await itemsRes.json()) as ApifyPlace[];
  return items.map(toPlace).filter((place) => place.name);
}

function namesMatch(a: string, b: string): boolean {
  const left = a.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const right = b.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return left.includes(right) || right.includes(left);
}

export async function scrapeSubjectAndCompetitors(input: {
  businessName: string;
  trade: string;
  city: string;
}): Promise<{ subject: ScrapedPlace | null; competitors: ScrapedPlace[] }> {
  const query = `${input.trade} ${input.city}`;
  const places = await runMapsSearch(query, input.city, 8);
  const subject =
    places.find((place) => namesMatch(place.name, input.businessName)) ?? null;
  const competitors = places
    .filter((place) => !subject || place.name !== subject.name)
    .slice(0, 3);
  return { subject, competitors };
}
