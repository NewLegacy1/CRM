# Generate Insights Auth Fix Plan

## Goal
The daily Vercel cron calls `/api/generate-insights` with **GET**, but the route only exports **POST**, so the cron fails (405). Also, POST has **no auth**, so anyone can trigger paid OpenAI calls. Fix both.

## Requirements
- Add a **GET** handler for the cron.
- Require `Authorization: Bearer <CRON_SECRET>` on **both GET and POST**.
- If `CRON_SECRET` is not set, return **500** (server misconfiguration) — never allow access.
- Wrong or missing header: return **401**.
- GET and POST share **one** function for the insights logic and **one** helper for the auth check — no duplicated code.
- `vercel.json` needs **no change** (Vercel cron always uses GET).

## Changes
- `src/app/api/generate-insights/route.ts`
  - `requireCronAuth(req)` helper: returns a 500/401 response or `null` when OK.
  - `generateInsights()` function: the current POST body logic, moved as-is.
  - `GET` and `POST`: call `requireCronAuth`, then `generateInsights()`.
- `src/app/api/generate-insights/route.test.ts` (new, **Vitest**)

## Steps
1. Move the current POST logic into `generateInsights()` without changing what it does.
2. Add `requireCronAuth(req)` matching the header style of `src/app/api/cron/sequences/route.ts`, but returning 500 when the secret is unset.
3. Export `GET` and `POST` that both use the helper, then `generateInsights()`.
4. Write Vitest tests (mock Supabase and OpenAI — no real calls):
   - GET and POST without header → 401
   - GET and POST with wrong secret → 401
   - `CRON_SECRET` unset → 500
   - GET and POST with correct secret → 200 and the same JSON shape as today
5. Run `npm test`, `npx tsc --noEmit`, `npm run lint`.

## Notes
- The CRM settings page says admins can trigger insights manually with POST. After this change, a manual trigger needs the cron secret in the header. Update that sentence in `src/app/(main)/settings/page.tsx` to say so.

## Risks
- Changing the POST logic while moving it: move it unchanged, then verify the response shape in tests.

## Out of scope
- `vercel.json`, other cron routes (`calendly/refresh` allowing access when the secret is unset is a separate fix).
