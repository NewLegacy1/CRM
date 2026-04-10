import { z } from "zod";

/** Match homepage Services `leadService` strings for consistent pre-select from CTAs */
export const LEAD_SERVICE_OPTIONS = [
  "AI-Powered Website",
  "AI Lead Automation",
  "Custom CRM & Apps",
  "AI Customer Agents",
  "Data & Insights",
  "Business Automation",
  "Not sure yet",
] as const;

export const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  businessName: z.string().optional(),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  websiteUrl: z.string().optional(),
  servicesInterested: z.array(z.string()),
  message: z.string().optional(),
  preferredContact: z.enum(["email", "phone"]),
  sourcePath: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
