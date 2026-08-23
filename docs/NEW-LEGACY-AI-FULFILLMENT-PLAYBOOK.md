# New Legacy AI — Fulfillment Playbook

**Version 1.0 · August 22, 2026**

Operational SOP for every offer: exact steps, timelines, internal hours, hard costs, hires, and what AI automates.

**Related docs:** `NEW-LEGACY-AI-EXECUTIVE-PLAN.md` (strategy) · `NEW-LEGACY-AI-MASTER-SCALING-PLAYBOOK.md` (sales/marketing)

**CRM touchpoints:** `/start/[token]` onboarding wizard · project contracts · Stripe invoice · `/scraper` for audits

---

## Table of contents

1. [Fulfillment principles](#1-fulfillment-principles)
2. [Team & roles](#2-team--roles)
3. [AI automation map](#3-ai-automation-map)
4. [Track A — Visibility Fix](#4-track-a--visibility-fix)
5. [Track A — Booked Jobs Launch](#5-track-a--booked-jobs-launch)
6. [Track A — Grow (monthly)](#6-track-a--grow-monthly)
7. [Track A — Respond (future)](#7-track-a--respond-future)
8. [Track A — Local Visibility Sprint (lead magnet)](#8-track-a--local-visibility-sprint-lead-magnet)
9. [Track B — Discovery & roadmap](#9-track-b--discovery--roadmap)
10. [Track B — Custom software build](#10-track-b--custom-software-build)
11. [Track B — Software retainer](#11-track-b--software-retainer)
12. [14-day Launch calendar (master)](#12-14-day-launch-calendar-master)
13. [Unit economics summary](#13-unit-economics-summary)
14. [Hiring triggers](#14-hiring-triggers)
15. [Quality gates & client handoff](#15-quality-gates--client-handoff)

---

## 1. Fulfillment principles

| Principle | Rule |
|-----------|------|
| **Week-1 win** | GMB claimed + live before Day 7 on every Launch client |
| **Templates > custom** | One trade-agnostic site template; swap copy, colors, photos |
| **Capture, not close** | Automations notify the **owner** — we do not answer leads unless Respond tier |
| **14-day Launch** | Clock starts at payment + completed onboarding form |
| **Owner bottleneck** | Chase assets at 24h / 48h / 72h; pause timeline if blocked |
| **Document once** | Every step becomes a checklist the VA runs |

**Capacity (solo + VA):** 3 Launch projects/month without burnout. 4th Launch = hire web contractor or delay start date.

---

## 2. Team & roles

### Phase 1 (0–3 Launch/mo) — you + contractors

| Role | Expertise | When | Pay model |
|------|-----------|------|-----------|
| **Owner / technical lead** | Next.js, Supabase, n8n, Twilio, sales | Always | — |
| **PH VA** | GMB, Canva, Google Business, data entry, client chase | After 2 Launch/mo | $550–750 USD/mo FT |
| **Web contractor** | Webflow, Framer, or Next template deploy | Per Launch if you’re at capacity | $300–600/site |
| **Copy (optional)** | Local SEO copy, GMB descriptions | As needed | $50–150/project via AI-first |

### Phase 2 (3–6 Launch/mo + Grow clients)

| Role | Expertise | When | Pay model |
|------|-----------|------|-----------|
| **Account manager** | Client comms, Grow delivery, upsells | 6+ active Grow clients | $50/client/mo or 5% MRR |
| **Automation specialist** | n8n, Zapier, Twilio, Make | 5+ Launch with same stack | $25–40/hr project |

### Track B only

| Role | Expertise | When | Pay model |
|------|-----------|------|-----------|
| **Full-stack developer** | Next.js, Postgres, APIs, auth | Per Scale project | $50–100/hr or fixed SOW |
| **UI/UX designer** | Figma, design systems | Projects >$15k | $40–80/hr |
| **QA** | Manual + Playwright | Before each release | $30–50/hr |

**You do not need all of these on day one.** Hire in this order: **VA → web contractor → account manager → dev contractor**.

---

## 3. AI automation map

What AI handles vs. what stays human:

| Task | AI (automated / AI-assisted) | Human (required) |
|------|------------------------------|------------------|
| GMB business description draft | ✅ Generate from onboarding form | VA edits + client approval |
| Website copy (headlines, services, FAQ) | ✅ Draft from trade + city | Owner/VA QA tone + accuracy |
| GMB posts (Grow) | ✅ 4 drafts/mo from template | VA schedules + adds photo |
| Review response drafts | ✅ Suggest reply | VA posts (or owner approves) |
| Lead audit PDF (scraper funnel) | ✅ Score + narrative from Apify data | Setter sends link |
| Monthly lead report | ✅ Pull GA4/form data → summary | VA adds 2 bullet recommendations |
| Missed-call SMS copy | ✅ Template | Human wires Twilio + tests |
| Onboarding reminder emails | ✅ Sequence from CRM | — |
| Logo / hero image | ⚠️ AI gen if client has none | Prefer client photos |
| GMB verification | ❌ | Owner assists client (postcard/video) |
| DNS / domain | ❌ | Owner or VA with checklist |
| Sales / discovery calls | ❌ | Owner or closer |
| Custom software architecture | ⚠️ AI drafts spec | Owner signs off + builds |
| Code generation (Track B) | ✅ Boilerplate, CRUD, tests | Senior dev reviews all PRs |
| Client phone calls | ❌ (Respond tier: VA) | — |

**Stack for automation:** n8n or Make · Twilio · OpenAI/Claude API · Apify · your CRM webhooks · Stripe

---

## 4. Track A — Visibility Fix

**Price:** $997–1,497 CAD · **Timeline:** 7–10 business days · **Best for:** Has some presence, needs GMB + trust fix

### Client receives

- Google Business Profile claimed, verified (or verification in progress), fully optimized
- 10–15 photos uploaded (client-supplied or stock)
- Primary + secondary categories, services, hours, service areas
- Business description + 3 initial GMB posts
- Review request link + SMS/email template (owner sends or VA sets up one blast)
- Optional: single-page “link-in-bio” site OR GMB-only if they already have a decent site

### Exact steps

| Step | Task | Owner | Hours | Day |
|------|------|-------|-------|-----|
| 0.1 | Payment + onboarding link sent | Owner | 0.1 | 0 |
| 0.2 | Client completes `/start/[token]` form | Client | — | 0–2 |
| 1.1 | Create project in CRM, assign VA | Owner | 0.2 | 0 |
| 1.2 | Asset checklist email (logo, photos, license #, service list) | VA | 0.3 | 0 |
| 2.1 | GMB access: claim or request manager access | VA | 1.0 | 1–2 |
| 2.2 | Verification support (postcard / video / phone) | VA + Client | 0.5–2.0 | 2–5 |
| 3.1 | Categories, hours, service area, attributes | VA | 0.5 | 3 |
| 3.2 | AI draft description → VA edit → publish | VA | 0.5 | 3 |
| 3.3 | Upload photos, logo, cover | VA | 0.5 | 3–4 |
| 4.1 | 3 GMB posts scheduled | VA | 0.5 | 4 |
| 4.2 | Review request link (Google review link + SMS template) | VA | 0.3 | 4 |
| 5.1 | Optional link-in-bio page from template | Contractor/Owner | 2.0 | 5–7 |
| 6.1 | QA checklist + Loom walkthrough (5 min) | VA | 0.5 | 7 |
| 6.2 | Handoff email + upsell path to Launch | VA | 0.2 | 7 |

### Internal totals

| | Low | High |
|--|-----|------|
| **Internal hours** | 6h | 10h |
| **Hard cost** | $0 | $150 (contractor link-in-bio) |
| **Gross margin @ $1,197** | ~88% | ~75% |

---

## 5. Track A — Booked Jobs Launch

**Price:** $2,497–2,997 CAD · **Timeline:** 14 calendar days from payment + onboarding · **Flagship offer**

### Client receives

Everything in **Visibility Fix**, plus:

- Conversion-focused **single-page website** (mobile-first, <2s load)
- Click-to-call, contact form, optional Calendly embed
- **Missed-call text-back** (Twilio): caller gets SMS in ~30 sec
- **Lead alerts**: form submit → SMS + email to owner
- Google Analytics 4 + basic events (call, form)
- 30-day email support window
- 30-min owner training call (how to respond to leads)

### Exact steps

#### Phase 0 — Kickoff (Day 0–1)

| Step | Task | Owner | Hours |
|------|------|-------|-------|
| 0.1 | Stripe paid → CRM project created | Auto/Owner | 0.1 |
| 0.2 | Onboarding link `/start/[token]` | Owner | 0.1 |
| 0.3 | Client signs agreement + uploads assets | Client | — |
| 0.4 | Kickoff SMS/email: timeline + what we need in 48h | VA | 0.2 |
| 0.5 | Domain audit: client owns domain? registrar access? | VA | 0.3 |

**48h asset gate:** logo, 5+ job photos, services list, phone, service area, license/insurance if applicable.  
**If missing:** auto-reminder Day 1, 2, 3 → pause Day 4.

#### Phase 1 — Google presence (Days 1–5)

| Step | Task | Owner | Hours |
|------|------|-------|-------|
| 1.1 | GMB claim + verification started | VA | 1.0 |
| 1.2 | Categories, hours, service area, attributes | VA | 0.5 |
| 1.3 | AI description draft → VA edit → publish | VA | 0.5 |
| 1.4 | Photo upload (min 10) | VA | 0.5 |
| 1.5 | 3 GMB posts live | VA | 0.5 |
| 1.6 | **Week-1 win email to client:** “You’re live on Google” | VA | 0.2 |

*Parallel track if verification slow: proceed with website; GMB goes fully live when Google approves.*

#### Phase 2 — Website (Days 2–10)

| Step | Task | Owner | Hours |
|------|------|-------|-------|
| 2.1 | Clone site template (trade + city variables) | Contractor/Owner | 0.5 |
| 2.2 | AI generate: hero, services, about, FAQ, CTA copy | Owner | 0.5 |
| 2.3 | Apply brand colors, logo, photos | Contractor | 2.0 |
| 2.4 | Sections: hero, services, social proof, reviews widget, contact, footer | Contractor | 2.0 |
| 2.5 | Mobile QA (iOS + Android) | VA | 0.5 |
| 2.6 | PageSpeed pass (images WebP, lazy load) | Owner | 0.5 |
| 2.7 | Client preview link → 1 revision round | VA | 1.0 |
| 2.8 | Domain DNS → Vercel/host · SSL live | Owner | 1.0 |

**Template sections (fixed — do not custom-scope per client):**

1. Hero — headline, sub, CTA call + form  
2. Services — 3–6 cards  
3. Why us — 3 bullets  
4. Reviews — Google embed or manual  
5. Service area — city list  
6. Contact — form + map embed + click-to-call  
7. Footer — NAP, hours, license  

#### Phase 3 — Lead capture stack (Days 8–12)

| Step | Task | Owner | Hours |
|------|------|-------|-------|
| 3.1 | Contact form → webhook → owner email + SMS | Owner | 1.5 |
| 3.2 | Twilio number or use client’s cell for text-back | Owner | 0.5 |
| 3.3 | Missed-call trigger: no answer 20s → SMS to caller | Owner | 2.0 |
| 3.4 | Test: form submit, call, missed call | VA | 0.5 |
| 3.5 | GA4 property + events (generate_lead, click_call) | Owner | 0.5 |
| 3.6 | Review request automation (day 3 post-job SMS template) | VA | 0.5 |

**Missed-call text-back script (template):**  
*"Hi, this is [Business]. Sorry we missed your call — how can we help? Reply here or call [number]."*

#### Phase 4 — Launch & handoff (Days 12–14)

| Step | Task | Owner | Hours |
|------|------|-------|-------|
| 4.1 | Final QA checklist (see §15) | VA | 0.5 |
| 4.2 | 30-min training call: alerts, GMB app, responding <5 min | Owner | 0.5 |
| 4.3 | Handoff doc (PDF): logins, how to edit GMB, support email | VA | 0.5 |
| 4.4 | Launch email + Grow tier offer | VA | 0.2 |
| 4.5 | Mark project complete in CRM | VA | 0.1 |

### Internal totals — Booked Jobs Launch

| Role | Hours |
|------|-------|
| Owner (tech, DNS, automations, training) | 8–10h |
| VA (GMB, chase, QA, comms) | 6–8h |
| Web contractor (template deploy) | 4–6h |
| **Total internal** | **18–24h** |

| Hard cost item | Cost (CAD) |
|----------------|------------|
| Web contractor | $300–600 |
| Twilio (setup + 1st month) | $15–30 |
| Domain (if we buy) | $15–20/yr |
| Hosting (Vercel free tier or $20) | $0–20 |
| Apify (if audit) | $5 |
| **Total COGS** | **$335–675** |

| Price | COGS (mid) | Gross profit | Margin |
|-------|------------|--------------|--------|
| $2,497 | ~$500 | ~$1,997 | ~80% |
| $2,997 | ~$500 | ~$2,497 | ~83% |

---

## 6. Track A — Grow (monthly)

**Price:** $497–997 CAD/mo · **Timeline:** Ongoing · **Starts:** Day 30 post-Launch (or standalone after audit)

### Client receives (monthly)

- 4 Google Business Profile posts (scheduled)
- Review monitoring + drafted responses (owner approves or VA posts per SOP)
- Monthly lead report: form submissions, calls (if tracked), GMB insights
- Quarterly GMB health check (15-min Loom or call)
- Priority support email (24–48h response)

### Exact steps (recurring monthly)

| Week | Task | Owner | Hours/mo |
|------|------|-------|----------|
| 1 | Pull GMB insights + GA4 form events | VA | 0.5 |
| 1 | AI draft 4 GMB posts → VA schedule | VA | 1.5 |
| 2 | Review alert check (Google notifications) | VA | 0.5 |
| 2 | Draft review responses (AI) → post or send to owner | VA | 0.5 |
| 3 | Compile monthly PDF report (template) | VA | 1.0 |
| 4 | Send report + 2 recommendations | VA | 0.5 |
| Ad hoc | Support tickets | VA/Owner | 0.5–2.0 |

**Total:** ~4–6h/client/month

### Economics

| Price | VA cost (~$4/h effective) | Margin |
|-------|---------------------------|--------|
| $497/mo | ~$20–24 labor | ~95% |
| $997/mo | ~$20–24 labor | ~97% |

**1 VA capacity:** ~15–20 Grow clients at 4–6h each = 60–80h/mo (full-time).

---

## 7. Track A — Respond (future)

**Price:** $800–1,500 CAD/mo · **Do not sell until you can deliver**

### Client receives

- First response to form leads within 15 min (business hours)
- Missed-call callback attempt or live text conversation
- Qualification questions (service needed, address, urgency)
- Qualified leads forwarded to owner with summary
- **Not included:** quoting, scheduling on owner calendar (unless Calendly access), closing

### Exact steps (when ready)

| Step | Task | Role | Hours setup |
|------|------|------|-------------|
| 1 | Define scripts + qualification criteria | Owner | 2h |
| 2 | CRM inbox or shared Twilio | Owner | 3h |
| 3 | Hire PH VA trained on scripts | VA lead | 4h training |
| 4 | Business-hours coverage calendar | VA | — |
| 5 | Weekly QA: listen to 5 threads | Owner | 1h/wk |

**Ongoing:** 20–40h/mo VA per client depending on lead volume.

**Hire:** Customer service VA with English fluency, $4–6/hr, dedicated or shared across 3–4 clients.

---

## 8. Track A — Local Visibility Sprint (lead magnet)

**Price:** $297 CAD (or free for referrals) · **Timeline:** 48–72h · **Purpose:** Upsell to Launch

### Client receives

- 1-page automated GMB audit (score + 5 gaps)
- 5 quick wins applied OR documented with Loom
- 15-min review call optional

### Exact steps

| Step | Task | Who | Hours |
|------|------|-----|-------|
| 1 | Scrape GMB via Apify (`/scraper`) | Auto | 0 |
| 2 | AI score: no website, reviews, photos, posts, categories | Auto | 0.1 |
| 3 | Generate PDF audit | Auto | 0.1 |
| 4 | VA applies quick wins (description, 3 photos, 1 post) | VA | 1.5 |
| 5 | Send audit + book Launch call CTA | VA | 0.2 |

**Total:** ~2h · **Margin:** ~90% at $297

---

## 9. Track B — Discovery & roadmap

**Price:** $1,500–3,000 CAD · **Timeline:** 10–15 business days

### Client receives

- 60–90 min discovery workshop (recorded)
- Current-state workflow map (Miro/Figma)
- Pain prioritization matrix
- Recommended architecture (build vs buy)
- Fixed-price SOW for Phase 1 build
- Optional: clickable prototype for 1 core flow

### Exact steps

| Step | Task | Owner | Hours |
|------|------|-------|-------|
| 1 | Pre-call questionnaire (crm-intake) | Client | — |
| 2 | Discovery call: ops, tools, team, budget | Owner | 1.5 |
| 3 | Shadow 1–2 workflows (screen share or Loom from client) | Owner | 1.0 |
| 4 | Document as-is process | Owner | 3.0 |
| 5 | AI draft to-be workflow → owner refine | Owner | 2.0 |
| 6 | Tool evaluation (build custom vs Zapier vs off-shelf) | Owner | 2.0 |
| 7 | Write SOW: scope, milestones, price, timeline | Owner | 3.0 |
| 8 | Present roadmap call (45 min) | Owner | 0.75 |
| 9 | Deliver PDF + Notion portal | Owner | 0.5 |

**Total:** 14–18h · **Effective rate @ $2,500:** ~$140–180/hr

**AI automates:** meeting notes → workflow draft, SOW first draft, competitive tool research summary.

---

## 10. Track B — Custom software build

**Price:** $5,000–50,000+ CAD · **Timeline:** 4–16 weeks by scope

### Example scopes

| Tier | Example | Weeks | Hours | Price range |
|------|---------|-------|-------|-------------|
| **S** | Booking portal + admin dashboard | 4–6 | 80–120 | $5k–12k |
| **M** | CRM module (leads, pipeline, invoicing) | 8–12 | 150–250 | $12k–25k |
| **L** | Multi-module platform (DetailOps-style) | 12–24 | 300–600 | $25k–50k+ |

### Standard phases

#### Phase 0 — Contract (Week 0)

| Step | Task |
|------|------|
| 1 | SOW signed from Discovery |
| 2 | 50% deposit via Stripe |
| 3 | GitHub repo + staging env |
| 4 | Slack/Discord channel |
| 5 | Weekly standup cadence agreed |

#### Phase 1 — Design (Weeks 1–2)

| Step | Task | Owner | Hours |
|------|------|-------|-------|
| 1.1 | User stories + acceptance criteria | Owner | 4h |
| 1.2 | Wireframes (low-fi) | Owner/Designer | 8h |
| 1.3 | Client sign-off wireframes | — | — |
| 1.4 | UI design (high-fi) key screens | Designer | 16–24h |
| 1.5 | DB schema + API contract | Owner | 6h |

**AI:** Generate user stories from discovery notes, boilerplate schema, component stubs.

#### Phase 2 — Build (Weeks 3–10)

| Step | Task | Owner | Hours |
|------|------|-------|-------|
| 2.1 | Auth + roles (Supabase) | Dev | 8h |
| 2.2 | Core data models + CRUD | Dev | 20–40h |
| 2.3 | Business logic + automations | Dev | 20–60h |
| 2.4 | Integrations (Stripe, Twilio, etc.) | Dev | 8–20h |
| 2.5 | Admin UI | Dev | 20–40h |
| 2.6 | Client portal UI | Dev | 20–40h |
| 2.7 | Weekly demo to client | Owner | 1h/wk |

**AI:** CRUD codegen, test scaffolding, API client generation — **all PRs human-reviewed**.

#### Phase 3 — QA & launch (Weeks 11–12)

| Step | Task | Hours |
|------|------|-------|
| 3.1 | Test plan + manual QA | 8h |
| 3.2 | Bug fix sprint | 16h |
| 3.3 | Client UAT (5 business days) | — |
| 3.4 | Production deploy + DNS | 2h |
| 3.5 | Training session (60–90 min) | 1.5h |
| 3.6 | Documentation + handoff video | 4h |
| 3.7 | Final 50% invoice | — |

### Who you need (Track B)

| Scope | Team |
|-------|------|
| $5–12k | Owner solo or owner + 1 contract dev |
| $12–25k | Owner + contract dev 20h/wk |
| $25k+ | Owner + FT contract dev + designer slice |

**Do not staff Track B from the PH GMB VA.** Different skill set.

---

## 11. Track B — Software retainer

**Price:** $1,000–5,000 CAD/mo · **Timeline:** Ongoing post-launch

### Client receives

- Bug fixes (SLA: 48h critical, 5d normal)
- Small feature requests (bucket: 8–20h/mo)
- Dependency + security updates
- Monthly health report (uptime, errors, usage)
- Quarterly roadmap call

### Monthly rhythm

| Task | Hours |
|------|-------|
| Monitor errors (Sentry) | 1h |
| Small tickets | 6–18h |
| Monthly report | 1h |
| Roadmap call | 1h |

**Hire:** Same contract dev, bench 10–20h/mo per client.

---

## 12. 14-day Launch calendar (master)

Use this for every Booked Jobs Launch client:

| Day | Milestone | Owner accountable |
|-----|-----------|-------------------|
| **0** | Paid + onboarding submitted | Owner |
| **1** | Asset chase sent; GMB access requested | VA |
| **2** | GMB optimization started; site template cloned | VA + Contractor |
| **3** | AI copy draft complete | Owner |
| **4** | GMB posts live · **Week-1 win email** | VA |
| **5** | Site first draft preview | Contractor |
| **6** | Client revision notes collected | VA |
| **7** | Site revision complete | Contractor |
| **8** | DNS pointed (or scheduled) | Owner |
| **9** | Form + SMS automations wired | Owner |
| **10** | Missed-call text-back tested | Owner |
| **11** | GA4 live | Owner |
| **12** | Final QA | VA |
| **13** | Training call booked | VA |
| **14** | **LAUNCH** · handoff doc · Grow pitch | Owner + VA |

**Client delay rule:** If assets late >3 days, add same days to end date.

---

## 13. Unit economics summary

| Offer | Price (CAD) | Hours | COGS | Gross margin |
|-------|-------------|-------|------|--------------|
| Visibility Sprint | $297 | 2h | ~$10 | ~97% |
| Visibility Fix | $1,197 | 8h | ~$75 | ~88% |
| Booked Jobs Launch | $2,997 | 22h | ~$500 | ~83% |
| Grow | $497/mo | 5h/mo | ~$20 | ~96% |
| Respond | $1,200/mo | 30h/mo | ~$150 | ~88% |
| Discovery | $2,500 | 16h | $0 | ~100%* |
| Build (S) | $10,000 | 100h | ~$2,000 dev | ~80% |
| Retainer | $2,000/mo | 12h | ~$600 dev | ~70% |

*Discovery is owner time; opportunity cost only.

**Monthly capacity @ 3 Launch + 8 Grow:**

- Revenue: ~$9k Launch + ~$4k Grow = **~$13k/mo**
- Labor: VA $750 + contractors $1,500 = **~$2,250**
- **Gross ~$10.75k before ads/owner draw**

---

## 14. Hiring triggers

| Trigger | Hire | Expertise |
|---------|------|-----------|
| 2 Launch sales in one month | PH VA (FT) | GMB, onboarding, Canva, English |
| You spend >6h/week on template sites | Web contractor | Framer/Webflow/Next templates |
| 6+ Grow clients | Account manager (PT) | Client comms, upsells |
| 4+ Launch/month | Second contractor OR raise prices | — |
| First $10k+ software SOW signed | Contract full-stack dev | Next.js, Supabase, Stripe |
| Respond tier sold | CS VA (trained scripts) | SMS/phone, CRM inbox |
| Meta spend >$1,500/mo | Media buyer (PT) | Meta Ads Manager, CAPI |

---

## 15. Quality gates & client handoff

### Launch QA checklist (VA runs, Owner signs off)

- [ ] GMB: claimed, verified or pending, 10+ photos, description, categories, hours
- [ ] Website: mobile responsive, <3s load, click-to-call works
- [ ] Form submit → owner receives SMS + email within 60 sec
- [ ] Missed-call text-back tested with real call
- [ ] SSL active, correct domain
- [ ] GA4 receiving events
- [ ] Review link works
- [ ] NAP consistent (name, address, phone) across site + GMB
- [ ] Client has GMB app installed, notifications on
- [ ] Handoff PDF delivered

### Handoff PDF contents (template)

1. URLs (website, GMB, analytics)  
2. Login sheet (registrar, hosting, Google, Twilio)  
3. “When a lead comes in” — 3-step owner playbook  
4. How to request changes (support email)  
5. Grow tier benefits + booking link  

### What we explicitly do NOT hand off as “done”

- Paid ads management (separate or future)  
- Answering leads (unless Respond)  
- SEO guarantees or ranking promises  
- Unlimited revision rounds beyond 1 major + minor tweaks  

---

## 16. CRM & tooling integration (build list)

| Fulfillment step | CRM feature today | To build |
|------------------|-------------------|----------|
| Onboarding | `/start/[token]` wizard ✅ | Add GMB-specific fields |
| Contract + invoice | Project contracts panel ✅ | Package presets ($2,997 Launch) |
| 14-day timeline | — | Project task checklist per offer |
| Asset chase | Email manual | Auto Day 1/2/3 reminders |
| GMB audit | `/scraper` ✅ | Auto-score + PDF export |
| Monthly Grow report | — | GA4 + GMB API → template |
| Automation test log | — | “Test passed” checkbox on project |

---

## 17. Client analytics delivery

See **`NEW-LEGACY-AI-CLIENT-OPERATIONS-PLAN.md`** for full journey, email, and VSL detail. Summary:

| Package | What client gets |
|---------|------------------|
| Visibility Fix | GMB screenshot at handoff |
| Booked Jobs Launch | GA4 setup + handoff snapshot PDF |
| Grow | Monthly PDF report (calls, forms, impressions, 1 recommendation) |
| Grow (Phase 2) | `/portal/[token]` dashboard in CRM |

**APIs:** Google Business Profile Performance API (manager access from onboarding) · GA4 Data API · form webhooks in CRM.

**Phase 1 (now):** VA + AI monthly PDF via email. **Phase 2:** CRM portal after 5+ Grow clients.

---

## 18. Document map

| File | Purpose |
|------|---------|
| `NEW-LEGACY-AI-FULFILLMENT-PLAYBOOK.md` | **This file — operations** |
| `NEW-LEGACY-AI-CLIENT-OPERATIONS-PLAN.md` | Journey, email, VSL, analytics |
| `NEW-LEGACY-AI-EXECUTIVE-PLAN.md` | Strategy & positioning |
| `NEW-LEGACY-AI-MASTER-SCALING-PLAYBOOK.md` | Sales, ads, hiring |

---

**Changelog**

| Date | Change |
|------|--------|
| 2026-08-22 | v1.0 — Initial fulfillment SOP for all offers |
