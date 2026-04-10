# Project layout

## Where to run npm

Run **every** command from the **repository root** — the directory that contains:

- `package.json`
- `next.config.ts`
- `src/`

```bash
cd /path/to/NewLegacyV   # or your clone path
npm install
npm run dev
```

There is only one Node/Next.js app in this repo. The marketing website and the CRM are the **same** application, split by Next.js [route groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups) (folders in parentheses).

## Route groups (same app, different areas)

| Folder | Purpose | Example routes |
|--------|---------|------------------|
| `src/app/(marketing)/` | Public galaxy marketing site | `/`, `/book`, `/case-studies`, `/industries` |
| `src/app/(main)/` | Authenticated CRM (dashboard, leads, etc.) | `/dashboard`, `/leads`, `/projects/...` |
| `src/app/(auth)/` | Auth layouts where used | — |
| `src/app/api/` | API routes (lead capture, webhooks, etc.) | `/api/lead`, … |
| `src/app/login`, `signup` | Auth pages | `/login`, `/signup` |

Marketing UI lives in `src/components/marketing/`. Shared UI in `src/components/ui/`.

## Other top-level folders

| Folder | Role |
|--------|------|
| `public/` | Static assets (served from `/...`) |
| `supabase/` | SQL migrations and edge functions |
| `scripts/` | One-off maintenance scripts |
| `tests/` | Vitest tests |

## Legacy `CRM-main/` (do not use for npm)

If you see a `CRM-main/` directory next to `package.json`, it is a **leftover copy** from an older layout. It does not contain a valid `package.json` at its root and must **not** be used to install dependencies or start the dev server. Use the repo root only.

You can delete `CRM-main/` after confirming you do not need anything inside it.
