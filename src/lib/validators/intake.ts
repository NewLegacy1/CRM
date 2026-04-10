import { z } from "zod";

/**
 * Intake payload schema version — bump when field set changes.
 * Historical rows in Supabase may use older shapes; new submissions use v2.
 */
export const INTAKE_PAYLOAD_SCHEMA_VERSION = 2 as const;

/** Website build — comprehensive fields stored in intake_submissions.payload */
export const siteIntakePayloadSchema = z.object({
  schemaVersion: z.literal(INTAKE_PAYLOAD_SCHEMA_VERSION),
  targetAudience: z.string().optional(),
  industryNiche: z.string().optional(),
  valueProposition: z.string().optional(),
  projectSummary: z.string().min(1, "Describe what you want to build"),
  pagesAndSections: z.string().optional(),
  featuresIntegrations: z.string().optional(),
  competitorsInspiration: z.string().optional(),
  brandGuidelines: z.string().optional(),
  assetStatus: z.string().optional(),
  contentPlan: z.string().optional(),
  currentWebsite: z.string().optional(),
  hostingDomain: z.string().optional(),
  technicalIntegrations: z.string().optional(),
  seoNeeds: z.string().optional(),
  timeline: z.string().optional(),
  budgetRange: z.string().optional(),
  stakeholders: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export const siteIntakeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  businessName: z.string().min(1, "Business name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(1, "Phone is required"),
  timezone: z.string().min(1, "Time zone is required"),
  payload: siteIntakePayloadSchema,
});

export type SiteIntakeInput = z.infer<typeof siteIntakeSchema>;

/** CRM & automations — comprehensive fields in crm_intake_submissions.payload */
export const crmIntakePayloadSchema = z.object({
  schemaVersion: z.literal(INTAKE_PAYLOAD_SCHEMA_VERSION),
  teamSize: z.string().optional(),
  rolesInvolved: z.string().optional(),
  locations: z.string().optional(),
  currentTools: z.string().optional(),
  dataSources: z.string().optional(),
  pipelineDescription: z.string().optional(),
  leadSources: z.string().optional(),
  painPoints: z.string().optional(),
  automationGoals: z.string().min(1, "Describe outcomes you want from CRM & automation"),
  integrationsWanted: z.string().optional(),
  complianceConsiderations: z.string().optional(),
  reportingNeeds: z.string().optional(),
  timeline: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export const crmIntakeSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  primaryContactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(1, "Phone is required"),
  payload: crmIntakePayloadSchema,
});

export type CrmIntakeInput = z.infer<typeof crmIntakeSchema>;
