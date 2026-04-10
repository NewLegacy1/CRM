# Agency CRM

Full-stack CRM for agencies: clients, projects, deals, leads, cold calling, ads, funnels, analytics, and AI insights. The **public marketing site** (galaxy landing, case studies, booking) lives in the **same** Next.js app as the CRM.

## Where to run `npm install` and `npm run dev`

Use the **repository root** only — the folder that contains `package.json` and `next.config.ts`:

```bash
npm install
npm run dev
```

- **One app:** Marketing routes and CRM routes are both under `src/app/` (see [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)).
- **Do not** run npm inside a nested `CRM-main/` folder; that path is legacy and not the app root.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Supabase (Auth, PostgreSQL, RLS)
- **Integrations:** n8n webhooks, OpenAI (AI insights)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/publishable key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server-side ops)
- `OPENAI_API_KEY` - For AI insights (Phase 7)
- `N8N_NO_ANSWER_WEBHOOK_URL` - n8n webhook for no-answer SMS (default: `http://localhost:5678/webhook/noansweremail`)
- `N8N_MEETING_BOOKED_WEBHOOK_URL` - n8n webhook for meeting booked (default: `http://localhost:5678/webhook/meetingbooked`)

### 3. Run Supabase migration

In the [Supabase Dashboard](https://supabase.com/dashboard):

1. Go to **SQL Editor**
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the migration

Or, if using Supabase CLI: `supabase db push`

### 4. Set first user as owner

After signing up, run in Supabase SQL Editor:

```sql
update public.profiles set role = 'owner' where id = '<your-user-id>';
```

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Roles

- **Owner** - Full access
- **Closer** - Deals, clients, projects, leads, meetings
- **Media Buyer** - Ads, funnels, sites, clients (read), analytics
- **Cold Caller** - Leads (assigned), calling screen, personal stats, book meetings

## Features

### Phase 1-2: Core CRUD
- ✅ Authentication (login, signup)
- ✅ Clients, Projects, Deals, Leads management
- ✅ Full CRUD with dialogs and tables

### Phase 3: Role-Based Access
- ✅ Owner, Closer, Media Buyer, Cold Caller roles
- ✅ Role-specific dashboards with stats
- ✅ Sidebar navigation filtered by role

### Phase 4: Cold Calling
- ✅ Calling screen with lead selection
- ✅ Mark outcomes: No Answer, Didn't Book, Booked Meeting
- ✅ Meeting booking popup
- ✅ n8n webhooks for SMS (no answer) and notifications (meeting booked)

### Phase 5: Media Buyer Tools
- ✅ Ads with spend, revenue, ROAS calculation
- ✅ Funnels with conversion rates
- ✅ Sites with URLs

### Phase 6: Analytics
- ✅ ROAS (Return on Ad Spend)
- ✅ AOV (Average Order Value)
- ✅ Performance overview

### Phase 7: AI Insights
- ✅ Daily AI-generated insights via OpenAI GPT-4
- ✅ Vercel Cron job (8am daily)
- ✅ Manual trigger via `/api/generate-insights`

### Phase 8: Team & Settings
- ✅ Team management (view users, change roles)
- ✅ Settings page (integrations, cron info)

## Project structure

| Path | Contents |
|------|----------|
| `src/app/(marketing)/` | Public marketing site: home, `/book`, `/case-studies`, `/industries` |
| `src/app/(main)/` | CRM app routes (dashboard, leads, projects, …) — typically behind auth |
| `src/app/login`, `src/app/signup` | Auth entry points |
| `src/app/api/` | API routes (lead capture, webhooks, Calendly, etc.) |
| `src/components/marketing/` | Marketing-only components (hero, shell, CTAs) |
| `src/components/` | Shared UI (tables, dialogs, …) |
| `src/lib/` | Supabase clients, validators, marketing nav helpers |
| `supabase/migrations/` | SQL schema and RLS |
| `docs/PROJECT_STRUCTURE.md` | Detailed layout and notes on the legacy `CRM-main/` folder |
| `vercel.json` | Cron and platform config |

Demo and ops guides at repo root: `DEMO_README.md`, `TROUBLESHOOTING.md`, `VERCEL_SETUP.md`.
