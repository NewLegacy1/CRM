/**
 * Intake forms store rich answers in Supabase `payload` (JSONB).
 *
 * - New submissions use `schemaVersion: 2` (see `INTAKE_PAYLOAD_SCHEMA_VERSION` in validators).
 * - Older rows may omit `schemaVersion` or use different keys; treat those as legacy when building admin UIs.
 * - To align with historical production data, compare keys against samples from
 *   `intake_submissions` / `crm_intake_submissions` in the Supabase dashboard.
 */

export {};
