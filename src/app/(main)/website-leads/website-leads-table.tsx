"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type WebsiteLeadRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  niche: string | null;
  source: string;
  status: string;
  website: string | null;
  headline_variant?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  inquiry: Record<string, unknown> | null;
};

const STATUSES = [
  "new",
  "called",
  "booked",
  "didnt_book",
  "no_answer",
  "called_no_answer",
] as const;

function inquiryText(inquiry: Record<string, unknown> | null, key: string): string {
  const value = inquiry?.[key];
  return typeof value === "string" && value.trim() ? value : "—";
}

function auditLabel(inquiry: Record<string, unknown> | null): string {
  const audit = inquiry?.audit;
  if (!audit || typeof audit !== "object") return "queued";
  const record = audit as { status?: string; score?: { total?: number } };
  if (typeof record.score?.total === "number") return `${record.score.total}/100`;
  return record.status ?? "queued";
}

export function WebsiteLeadsTable({ initialLeads }: { initialLeads: WebsiteLeadRow[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [sourceFilter, setSourceFilter] = useState<"all" | "booked-jobs" | "marketing">("all");
  const supabase = useMemo(() => createClient(), []);

  const visible = leads.filter((lead) => {
    if (sourceFilter === "all") return true;
    if (sourceFilter === "booked-jobs") return lead.source === "booked-jobs";
    return lead.source !== "booked-jobs";
  });

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("website_leads").update({ status }).eq("id", id);
    if (error) return;
    setLeads((current) =>
      current.map((lead) => (lead.id === id ? { ...lead, status } : lead))
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["booked-jobs", "Booked Jobs"],
            ["marketing", "Main site"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSourceFilter(id)}
            className={
              sourceFilter === id
                ? "rounded-lg bg-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-200 ring-1 ring-violet-400/20"
                : "rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 ring-1 ring-zinc-700"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Trade / city</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Ready</TableHead>
              <TableHead>Hook</TableHead>
              <TableHead>Audit</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-zinc-500">
                  No site leads yet.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="whitespace-nowrap text-xs text-zinc-400">
                    {new Date(lead.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-zinc-100">{lead.name}</TableCell>
                  <TableCell className="text-zinc-200">
                    {inquiryText(lead.inquiry, "business_name")}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-300">
                    {lead.niche || inquiryText(lead.inquiry, "trade")}
                    <div className="text-xs text-zinc-500">
                      {inquiryText(lead.inquiry, "city")}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="text-zinc-200">{lead.phone}</div>
                    <div className="text-xs text-zinc-500">{lead.email}</div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-300">
                    {inquiryText(lead.inquiry, "ready_to_invest")}
                  </TableCell>
                  <TableCell className="max-w-[8rem] truncate text-xs text-zinc-500">
                    {lead.headline_variant ?? inquiryText(lead.inquiry, "headline_variant")}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-300">
                    {auditLabel(lead.inquiry)}
                  </TableCell>
                  <TableCell>
                    <select
                      value={lead.status}
                      onChange={(event) => updateStatus(lead.id, event.target.value)}
                      className="h-8 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </option>
                      ))}
                      {!STATUSES.includes(lead.status as (typeof STATUSES)[number]) ? (
                        <option value={lead.status}>{lead.status}</option>
                      ) : null}
                    </select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
