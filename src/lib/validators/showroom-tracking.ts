import { z } from "zod";

/** Payload sent from showroomautocare.ca via sendBeacon/fetch to POST /api/track/showroom */
export const showroomTrackEventSchema = z.object({
  session_id: z.string().min(1).max(128),
  event_type: z.enum(["page_view", "cta_click"]),
  page_path: z.string().max(512).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ShowroomTrackEventInput = z.infer<typeof showroomTrackEventSchema>;

/**
 * Payload sent from DetailOps' booking_sessions writer to POST /api/webhooks/detailops-session.
 * step_reached is nullable — DetailOps sends null on deposit/checkout completion, where
 * `booked: true` is the signal and there's often no specific step to attach.
 */
export const detailopsSessionWebhookSchema = z.object({
  session_id: z.string().min(1).max(128),
  step_reached: z.enum(["contact", "catalog", "details", "datetime"]).nullable(),
  booked: z.boolean(),
  org_slug: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type DetailopsSessionWebhookInput = z.infer<
  typeof detailopsSessionWebhookSchema
>;
