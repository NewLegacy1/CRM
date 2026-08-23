import { NextRequest, NextResponse } from "next/server";

/** Cold calling + demo-site emails are off (D1). Keep the route so the dialer does not 404. */
export async function POST(request: NextRequest) {
  let leadId: unknown;
  try {
    const body = (await request.json()) as { leadId?: unknown; phone?: unknown };
    leadId = body.leadId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.info("[no-answer] Demo-site follow-up email is disabled.", { leadId });
  return NextResponse.json({ ok: true, emailSent: false, disabled: true });
}
