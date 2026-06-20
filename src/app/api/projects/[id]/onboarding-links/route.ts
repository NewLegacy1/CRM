import { NextResponse } from "next/server";
import { fetchProjectOnboardingLinks } from "@/lib/onboarding/project-onboarding";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await fetchProjectOnboardingLinks(supabase, id);
  return NextResponse.json({ links });
}
