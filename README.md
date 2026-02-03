# Agency CRM

Full-stack CRM for agencies: clients, projects, deals, leads, cold calling, ads, funnels, analytics, and AI insights.

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

## Project Structure

- `src/app/(main)/` - Protected app routes (dashboard, clients, deals, etc.)
- `src/app/login`, `src/app/signup` - Auth pages
- `src/app/api/` - API routes (webhooks, AI insights)
- `src/components/` - Shared UI components
- `src/lib/` - Supabase client, utils, nav config
- `supabase/migrations/` - SQL schema and RLS
- `vercel.json` - Cron configuration
