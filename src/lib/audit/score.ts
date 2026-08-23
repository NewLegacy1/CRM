import type { AuditScore, ListingSnapshot } from "@/lib/audit/types";

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}

export function scoreListing(listing: ListingSnapshot): AuditScore {
  const reviews = clamp(((listing.reviewsCount ?? 0) / 80) * 20, 20);
  const rating = clamp((((listing.rating ?? 0) - 3.5) / 1.5) * 15, 15);
  const photos = clamp(((listing.photosCount ?? 0) / 40) * 15, 15);
  const categories = clamp((listing.categories.length / 4) * 10, 10);
  const posts = clamp(((listing.postsCount ?? 0) / 8) * 10, 10);
  const website = listing.hasWebsite ? 10 : 0;
  const hours = listing.hasHours ? 10 : 0;
  const description = listing.hasDescription ? 10 : 0;

  const parts = {
    reviews: Math.round(reviews),
    rating: Math.round(rating),
    photos: Math.round(photos),
    categories: Math.round(categories),
    posts: Math.round(posts),
    website,
    hours,
    description,
  };

  return {
    total: Object.values(parts).reduce((sum, part) => sum + part, 0),
    parts,
  };
}

export function listingGaps(listing: ListingSnapshot, score: AuditScore): string[] {
  const gaps: string[] = [];
  if (score.parts.reviews < 12) {
    gaps.push("Not enough reviews to look busy next to the shops they call first.");
  }
  if (score.parts.photos < 8) {
    gaps.push("Too few photos. Empty profiles get skipped.");
  }
  if (score.parts.categories < 6) {
    gaps.push("Categories are thin, so Maps may not show you for the searches that pay.");
  }
  if (!listing.hasWebsite) {
    gaps.push("No website on the listing. They bounce.");
  }
  if (!listing.hasHours) {
    gaps.push("Hours missing. You look closed.");
  }
  if (!listing.hasDescription) {
    gaps.push("No real description. They don’t know what you do.");
  }
  if (score.parts.posts < 4) {
    gaps.push("No recent posts. The listing looks abandoned.");
  }
  return gaps.slice(0, 5);
}
