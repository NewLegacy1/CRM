# Session Handoff — Master Context (Aug 22, 2026)

**Purpose:** Single entry point for the master agent in the next chat. Read this first, then the linked docs, then explore the codebase.

**Workspace:** `C:\Users\Admin\Downloads\CRM-main\CRM-main`  
**Company:** New Legacy AI · newlegacyai.ca · Remote Canada + USA

---

## 1. What we decided (strategy summary)

### Company positioning
- **Not** a trades-only agency. Remote digital systems company with two tracks:
  - **Track A — Local Growth:** GMB + site + lead **capture** (not answering phones) for trades/home services. $1k–3k launch + $497–997/mo Grow.
  - **Track B — Custom Software:** CRM, booking, internal tools for firms with budget. $5k–50k+ builds.

### Marketing architecture
- **Main site** (`newlegacyai.ca`) — broad, two paths (local vs custom software), SEO, referrals. **No trades-only hero.**
- **Siloed ads LP** (`/booked-jobs` proposed) — trades only, Meta ads only, **not linked from main nav**, optional noindex.
- **Meta $100/day** → trades LP only (Rule of 100). Not main site.
- **Cold call + demo sites** — **DEPRECATED.** Replace with scraper → GMB audit → book. Cold primary only for Track B $10k+.

### Honest promise
- We **capture and route** leads (text-back, alerts, forms). Owner closes.
- **Respond tier** (VA answers) — future only, do not sell yet.

### Fulfillment
- **14-day Launch** from payment + onboarding. Templates, not bespoke sites per prospect.
- **Week-1 win:** GMB live by Day 7.
- **Grow:** monthly PDF report (AI + VA); client portal Phase 2 after 5+ Grow clients.
- **APIs:** GBP Performance API + GA4 Data API (no Google MCP).

### Customer journey (not yet built)
```
Ad → /booked-jobs → Form → VSL A → (6-day nurture) → Calendly → VSL B → Sales call → Pay → /start/[token] → 14-day delivery → Grow
```

### VSLs (not yet recorded)
- **VSL A** (5–8 min): post-opt-in, sell the call. Hormozi: Hook → Problem → Mechanism → Proof → Offer → Guarantee → CTA.
- **VSL B** (3–5 min): post-book, pre-sell before call.
- **VSL C** (60–90 sec): retargeting cut.
- Founder on camera + screen record proof. CapCut, Mux or unlisted YouTube.

---

## 2. Document index (read in order)

| File | Contents |
|------|----------|
| `docs/SESSION-HANDOFF-MASTER-CONTEXT.md` | **This file** |
| `docs/HORMOZI-CRITIQUE-CHECKLIST.md` | 25-point stress test |
| `docs/PROMPT-FOR-MASTER-AGENT.md` | Copy-paste prompt for next chat |
| `docs/NEW-LEGACY-AI-EXECUTIVE-PLAN.md` | Strategy, pricing, 90-day roadmap |
| `docs/NEW-LEGACY-AI-FULFILLMENT-PLAYBOOK.md` | Per-offer delivery steps, hours, COGS, hires |
| `docs/NEW-LEGACY-AI-CLIENT-OPERATIONS-PLAN.md` | Journey, emails, VSL scripts, analytics, gaps |
| `docs/NEW-LEGACY-AI-MASTER-SCALING-PLAYBOOK.md` | Meta ads, hiring, email sequences, sources |

---

## 3. Codebase map (what exists vs missing)

### Marketing site
| Path | Status |
|------|--------|
| `src/app/(marketing)/page.tsx` + `HomePage.tsx` | Exists — needs two-path hero, remove AI-universe copy |
| `src/components/marketing/HeroSection.tsx` | Exists — needs rewrite |
| `src/components/marketing/ServicesScroll.tsx` | Exists — replace 6 AI cards with two paths |
| `src/app/(marketing)/book/page.tsx` | Calendly embed exists |
| `src/app/(marketing)/booked-jobs/` | **NOT BUILT** |
| `src/lib/marketing-nav.ts` | Exists — update nav, no trades LP link |

### CRM / ops
| Path | Status |
|------|--------|
| `src/app/(main)/scraper/` + `api/scraper/run` | Apify GMB scraper ✅ |
| `src/app/(main)/calling/` | Cold call UI ✅ |
| `src/app/(marketing)/start/[token]/` | Client onboarding wizard ✅ |
| `src/lib/onboarding/contract-template.ts` | Agreement — says 2–4 weeks, needs 14-day + capture language |
| `src/app/(main)/projects/[id]/contracts/` | Contract panel — default $1200 web + $500 GMB |
| `supabase/migrations/034_website_leads.sql` | Leads table ✅ — **no CRM UI** |
| `api/webhooks/meeting-booked` | n8n webhook ✅ |
| `supabase/functions/resend-email` | Email edge function ✅ |
| Client portal `/portal/[token]` | **NOT BUILT** |
| 14-day project checklist | **NOT BUILT** |
| Package presets ($2,997 Launch) | **NOT BUILT** |
| GBP/GA4 API integration | **NOT BUILT** |
| Email sequence automation | **NOT BUILT** (sequences documented only) |

### Case studies / proof
- `src/lib/case-studies-data.ts` — ShowRoom, Jay, DetailOps
- `src/app/(main)/products/showroom-autocare/` — funnel analytics dashboard (internal)

### Default pricing in app
- `project-contracts-panel.tsx` — website $1200 + GMB $500 (legacy; plan says $2,497–2,997 Launch)

---

## 4. Gap list (nothing completed from plan yet)

### P0 — Revenue blockers
- [ ] `/booked-jobs` siloed LP
- [ ] VSL A + B recorded
- [ ] Email Seq 0–2 wired (Resend + Calendly webhook)
- [ ] Main site hero two-path rewrite
- [ ] Meta ads live to trades LP
- [ ] `website_leads` in CRM UI
- [ ] Package preset: Booked Jobs Launch
- [ ] Remove/replace demo-site cold call workflow

### P1 — Delivery & retention
- [ ] 14-day project checklist in CRM
- [ ] Asset chase emails Day 1/2/3
- [ ] Stripe paid → onboarding email (Seq 3)
- [ ] Monthly report template
- [ ] Contract template update (14 days, capture language)
- [ ] Scraper → auto audit PDF on form submit

### P2 — Scale
- [ ] GBP + GA4 API + client portal
- [ ] Email sequence state per lead
- [ ] Commission tracking

---

## 5. Offers & pricing (canonical)

| Offer | Price CAD | Timeline |
|-------|-----------|----------|
| Visibility Sprint | $297 | 48–72h |
| Visibility Fix | $997–1,497 | 7–10 days |
| Booked Jobs Launch | $2,497–2,997 | 14 days |
| Grow | $497–997/mo | Ongoing |
| Respond | $800–1,500/mo | Future |
| Discovery (Track B) | $1,500–3,000 | 10–15 days |
| Custom build | $5k–50k+ | 4–16 weeks |
| Retainer | $1k–5k/mo | Ongoing |

---

## 6. Team & hire order

1. Commission setter (optional, Track B only early)
2. PH VA — after 2 Launch/mo ($550–750 USD/mo)
3. Web contractor — per Launch if at capacity ($300–600)
4. Account manager — 6+ Grow clients
5. Contract dev — first $10k+ Scale deal
6. Media buyer — Meta >$1,500/mo spend

---

## 7. Founder-only tasks (not AI-buildable)

- Record VSL A + B on camera
- Close sales calls (until commission closer + SOP)
- Twilio/automation wiring QA on first 3 clients
- GMB verification calls with clients
- 30-min training calls at Launch handoff
- Hire VA on OnlineJobs.ph
- Meta ad account + $100/day budget commitment
- Stripe/products configuration
- Legal review of contract template
- Calendly + n8n webhook configuration in production env

---

## 8. Transcript reference

Full conversation: `C:\Users\Admin\.cursor\projects\c-Users-Admin-Downloads-CRM-main\agent-transcripts\5f2f539e-8648-4556-9259-cfd1716526b5\5f2f539e-8648-4556-9259-cfd1716526b5.jsonl`
