import { z } from "zod";

export const LEAD_SERVICE_OPTIONS = [
  "Custom website",
  "CRM & automations",
  "Growth / ops",
  "Custom app",
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
