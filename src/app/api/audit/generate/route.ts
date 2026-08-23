import { NextResponse } from "next/server";
import { generateAuditForLead } from "@/lib/audit/generate";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const leadId =
    typeof body === "object" && body && "leadId" in body
      ? String((body as { leadId?: unknown }).leadId ?? "")
      : "";

  if (!leadId) {
    return NextResponse.json({ error: "leadId is required" }, { status: 400 });
  }

  const result = await generateAuditForLead(leadId);
  return NextResponse.json({ ok: result.status === "ready", result });
}
