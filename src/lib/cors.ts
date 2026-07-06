const DEFAULT_ALLOWED_ORIGINS = [
  "https://showroomautocare.ca",
  "https://www.showroomautocare.ca",
];

function getAllowedOrigins(): string[] {
  const configured = process.env.SHOWROOM_SITE_ORIGINS;
  if (!configured) return DEFAULT_ALLOWED_ORIGINS;
  return configured.split(",").map((origin) => origin.trim()).filter(Boolean);
}

/** Returns CORS headers for the given request's Origin if it's allowlisted, otherwise null. */
export function buildCorsHeaders(request: Request): HeadersInit | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const allowed = getAllowedOrigins();
  if (!allowed.includes(origin)) return null;

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}
