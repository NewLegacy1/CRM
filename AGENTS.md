# AGENTS.md

## Project map
(Verified from code on branch `fix/lock-down-public-rls`. The user has uncommitted work: do not revert or reformat files you were not asked to touch.)

### 1. Purpose
"Agency CRM" (package `agency-crm`) for the agency New Legacy AI. One Next.js app holds BOTH the public marketing site / lead funnels (`(marketing)`) and the internal authenticated CRM (`(main)`).
Users: internal staff (owner, account_manager, closer, media_buyer, cold_caller, demo, pending) and public visitors/clients (lead forms, intake, onboarding links, booked-jobs funnel).

### 2. Stack
- Next.js 16.1.6 (App Router, `reactCompiler: true`), React 19.2.3, TypeScript 5 (path alias `@/*` -> `src/*`)
- UI: Tailwind CSS 4, Radix UI, shadcn-style `src/components/ui`, framer-motion 11, gsap, three, lucide-react, react-hook-form + zod 4
- DB/Auth: Supabase Postgres + RLS, `@supabase/ssr` 0.8, `@supabase/supabase-js` 2.x. NO ORM: plain supabase-js queries.
- Payments: `stripe` 20. Email: `resend` 6. SMS: Twilio (called via fetch, no SDK in package.json - unclear). AI: OpenAI via fetch.
- Tests: Vitest 4 + jsdom + Testing Library. Lint: ESLint 9 (`eslint-config-next`).

### 3. External services and how to reach them
- Supabase: remote project (no `supabase/config.toml`, so no local stack). Use `supabase` CLI (`supabase db push`, `supabase migration new`) only with user OK. Admin client: `src/lib/db/supabaseAdmin.ts`.
- Stripe: use `stripe` CLI in TEST mode only (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`). Setup script: `scripts/setup-crm-stripe-webhook.mjs`.
- Vercel: project linked (`.vercel/`); deploys from git. Use `vercel` CLI only if asked.
- Resend (email), Twilio (SMS), Calendly (API + webhooks), OpenAI (insights), Apify (lead scraper), Meta Ads/Pixel/CAPI, n8n (webhooks `no-answer`, `meeting-booked`; README mentions `N8N_*` URLs, not in `.env.example`).
- DetailOps / Showroom AutoCare = sister products that post tracking/webhooks into this CRM.

### 4. Folder map
- `src/app/(marketing)/` public site: `/`, `book`, `case-studies`, `industries`, `crm-intake`, `site-intake`, `start/[token]` (client onboarding), `booked-jobs/*` (ad landing funnel, variants a/b/c/d, book, confirmed, compare, unsubscribe, thank-you)
- `src/app/(main)/` authenticated CRM pages (each folder has `page.tsx` + `*-table.tsx`/client components): dashboard (per-role), clients, projects/[id], deals, leads, website-leads, calling, meetings, invoices, onboarding, ads, funnels, sites, analytics, insights, updates, products (detailops, showroom-autocare), scraper, team, settings. Layout: `(main)/layout.tsx`.
- `src/app/login`, `src/app/signup`, `src/app/(auth)/layout.tsx`: auth pages. `src/app/test/page.tsx`: scratch page.
- `src/app/api/**/route.ts`: API routes (see flows). No Pages Router.
- Server actions: only `src/lib/products/actions.ts` (`"use server"`). Everything else is API routes.
- `src/components/`: `ui/` primitives, `marketing/` (+ `booked-jobs/`, `intake/`, `onboarding/`), `onboarding/`, `invoices/`, `sidebar.tsx`, `header.tsx`, `main-layout-client.tsx`
- `src/lib/`: `supabase/{client,server,middleware}.ts`, `db/supabaseAdmin.ts`, `stripe/*`, `email/*` (Resend + drip sequences seq0-2), `sms/*`, `calendly/webhook.ts`, `meta/capi.ts`, `audit/*` (lead audit generate/score/pdf/send), `onboarding/*`, `validators/*` (zod), `nav-config.ts` (role -> nav), `rate-limit.ts`, `cors.ts`, `*-data.ts` (marketing content)
- `src/types/database.ts`: hand-written DB types and `UserRole` (not generated; update by hand with schema changes)
- `src/middleware.ts` -> `lib/supabase/middleware.ts` (`updateSession`)
- `supabase/migrations/NNN_*.sql`: schema (001-045; 017/018 absent). `supabase/functions/resend-email/index.ts`: edge function.
- `tests/setup.ts` (jest-dom only). Tests are colocated `src/**/*.test.ts` (4 files: audit score, email sequences, invoice tax regions, sms ready).
- `scripts/`: one-off Node scripts (`backfill-detailops.mjs`, `migrate-old-supabase.js`, `setup-crm-stripe-webhook.mjs`)
- `docs/`: business plans, VSL scripts, `PROJECT_STRUCTURE.md`. `public/`: static assets. Root `DEMO_*.md`, `TROUBLESHOOTING.md`, `VERCEL_SETUP.md`: setup docs.
- Ignore: `.agents/skills`, `.cursor/agents` (design/QA prompts), `knowledge/` (gitignored private notes), `.next`, `node_modules`, `tsconfig.tsbuildinfo`.

### 5. Key flows (file paths)
- Auth/session: `src/middleware.ts` + `src/lib/supabase/middleware.ts` redirect unauthenticated users on a hard-coded prefix list to `/login?redirectTo=`; logged-in users on /login,/signup go to `/dashboard`. Adding a new CRM route = add its prefix there too.
- Roles: `profiles.role` (see `UserRole`), nav gating in `src/lib/nav-config.ts`; SQL helpers `get_user_role()`, `user_has_role()`. New signups are `pending`; owner promotes via SQL/Team page.
- Public lead capture: `api/lead/route.ts` -> `website_leads` table (env override NEXT_PUBLIC_WEBSITE_LEADS_TABLE); intake: `api/intake/{crm,site}`; onboarding: `api/onboarding/[token]/**`, `api/onboarding/links`.
- Cold-call leads: `leads` table (`api/leads/{bulk,upload-csv}`, `(main)/calling`, `api/scraper/run` via Apify). Webhooks `api/webhooks/{no-answer,meeting-booked}` forward to n8n.
- Audit/booked-jobs funnel: `api/audit/{generate,send,pdf/[token]}`, `src/lib/audit/*`, `api/webhooks/{calendly,twilio/sms}`, `src/lib/email/sequences.ts` (drip, sent by cron).
- Billing: `api/invoices/{stripe,send}`, `src/lib/stripe/*` (`get-stripe.ts`, `send-client-invoice.ts`, `sync-subscription.ts`); webhook `api/webhooks/stripe/route.ts` verifies signature, handles `customer.subscription.created|updated|deleted` and `checkout.session.completed`.
- Product tracking: `api/track/showroom` (CORS allowlist SHOWROOM_SITE_ORIGINS), `api/webhooks/detailops-session` (header `x-detailops-webhook-secret`), `api/products/detailops/backfill`, `src/lib/showroom-funnel.ts`.
- Ads/AI: `api/ads/sync` (Meta), `api/generate-insights` (OpenAI), `api/calendly/{events,create-event,refresh}`. Health: `api/health`.

### 6. Commands (run from repo root; exact scripts in package.json)
- `npm run dev` | `npm run build` | `npm start` | `npm run lint` (eslint) | `npm test` (vitest run) | `npm run test:watch` | `npm run clean` | `npm run fresh` (clean + install + build; do not run unprompted)
- No `typecheck` script: use `npx tsc --noEmit`. No DB script: migrations are applied via `supabase db push` or the Supabase SQL editor.
- Verify a change: `npx tsc --noEmit` -> `npm run lint` -> `npm test`; run `npm run build` for route/config changes only. Single test: `npx vitest run src/lib/email/sequences.test.ts`.

### 7. Env var names (from `.env.example`; never open `.env.local`)
- Supabase: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY; optional table overrides NEXT_PUBLIC_DIALER_LEADS_TABLE, NEXT_PUBLIC_WEBSITE_LEADS_TABLE, NEXT_PUBLIC_LEADS_TABLE
- Stripe: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- Resend: RESEND_API_KEY, RESEND_FROM
- OpenAI: OPENAI_API_KEY
- Twilio: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, TWILIO_SMS_WEBHOOK_URL
- Calendly: CALENDLY_API_TOKEN, CALENDLY_WEBHOOK_SIGNING_KEY
- Meta: META_ADS_ACCESS_TOKEN, META_PIXEL_ID, NEXT_PUBLIC_META_PIXEL_ID, META_CAPI_ACCESS_TOKEN
- Apify: APIFY_TOKEN. DetailOps/Showroom: DETAILOPS_WEBHOOK_SECRET, SHOWROOM_SITE_ORIGINS
- App/cron/alerts: CRM_PUBLIC_URL, CRON_SECRET, AUDIT_AUTO_SEND, FOUNDER_ALERT_EMAIL, FOUNDER_ALERT_PHONE, NEXT_PUBLIC_VSL_A_URL, NEXT_PUBLIC_VSL_B_URL
- Used in code but missing from `.env.example`: NEXT_PUBLIC_SITE_URL (and N8N_* per README; unclear if still read)

### 8. Deployment and gotchas
- Vercel (`vercel.json`, framework nextjs, no regions set). Crons (all UTC): `/api/generate-insights` daily 08:00, `/api/calendly/refresh` daily 08:00, `/api/cron/sequences` hourly at :15. Cron routes check `Authorization: Bearer $CRON_SECRET`.
- `next.config.ts`: rewrite `/book-jobs` -> `/booked-jobs`; remote images limited to detailops.ca, showroomautocare.ca, jaythatdrainguy.ca.
- RLS is critical: migration `045_lockdown_public_rls.sql` (current branch) removes PUBLIC/anon access and anon execute on SECURITY DEFINER helpers. Earlier migrations (e.g. 014 "nuclear_fix") rewrite policies repeatedly, so the LAST migration touching a table wins. Never create policies `TO public`; add new numbered migrations, never edit applied ones.
- Service-role client bypasses RLS: use `getSupabaseAdmin()` only in server routes, never import in client components.
- Stripe/Calendly/Twilio webhooks use `runtime = "nodejs"` and need the raw body; do not parse JSON before signature verification.
- Naming: kebab-case files, `page.tsx` + `*-table.tsx` / `*-client.tsx` pairs; PascalCase for marketing components.
- Windows checkout: git warns about LF/CRLF; do not mass-reformat files.

### 9. Known issues noticed
- `vercel.json` cron calls GET `/api/generate-insights` but that route exports only POST -> daily cron likely returns 405.
- `api/generate-insights` and `api/scraper/run` show no auth check in code (spend OpenAI/Apify credits); confirm before relying on them.
- `lib/supabase/middleware.ts` `setAll` only writes request cookies, not the response, so token refresh may not persist.
- README/docs are stale: they mention n8n-only integrations and a `CRM-main/` folder, and omit Stripe/Resend/Twilio/Calendly.
