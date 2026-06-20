import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/supabaseAdmin";
import { getOnboardingLinkByToken } from "@/lib/onboarding/resolve-link";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Uploads are not configured." },
      { status: 503 }
    );
  }

  const { link, error: linkError } = await getOnboardingLinkByToken(admin, token);
  if (!link) {
    return NextResponse.json({ error: linkError }, { status: 404 });
  }

  if (link.status !== "pending") {
    return NextResponse.json(
      { error: "This onboarding link is no longer accepting uploads." },
      { status: 409 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const kind = formData.get("kind");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (kind !== "logo" && kind !== "image") {
    return NextResponse.json({ error: "Invalid upload kind" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only image files are allowed (JPEG, PNG, WebP, GIF, SVG)" },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File must be 10 MB or smaller" },
      { status: 400 }
    );
  }

  const cleanName = file.name.replace(/[^\w.\-]+/g, "-");
  const filePath = `onboarding/${link.id}/${kind}/${Date.now()}-${cleanName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from("intake-uploads")
    .upload(filePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("[api/onboarding/upload]", uploadError);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: publicUrl } = admin.storage
    .from("intake-uploads")
    .getPublicUrl(filePath);

  return NextResponse.json({ url: publicUrl.publicUrl, path: filePath });
}
