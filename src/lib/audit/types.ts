export type ListingSnapshot = {
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

export type AuditScore = {
  total: number;
  parts: {
    reviews: number;
    rating: number;
    photos: number;
    categories: number;
    posts: number;
    website: number;
    hours: number;
    description: number;
  };
};

export type AuditResult = {
  status: "ready" | "failed";
  score: AuditScore | null;
  subject: ListingSnapshot | null;
  competitors: ListingSnapshot[];
  gaps: string[];
  error?: string;
};
