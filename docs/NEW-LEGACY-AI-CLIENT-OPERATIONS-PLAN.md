# New Legacy AI — Client Operations Plan (Complete)

**Version 1.0 · August 22, 2026**

End-to-end plan: analytics delivery, customer journey, email sequences, VSL production, and gap checklist.

**Companion docs:**
- `NEW-LEGACY-AI-EXECUTIVE-PLAN.md` — strategy
- `NEW-LEGACY-AI-FULFILLMENT-PLAYBOOK.md` — delivery SOPs
- `NEW-LEGACY-AI-MASTER-SCALING-PLAYBOOK.md` — sales & ads

---

## Table of contents

1. [Client analytics — what to deliver](#1-client-analytics--what-to-deliver)
2. [Analytics tech stack & APIs](#2-analytics-tech-stack--apis)
3. [Phased dashboard rollout](#3-phased-dashboard-rollout)
4. [Full customer journey map](#4-full-customer-journey-map)
5. [Email sequences (complete)](#5-email-sequences-complete)
6. [VSL framework (Hormozi)](#6-vsl-framework-hormozi)
7. [VSL production guide](#7-vsl-production-guide)
8. [Post-close fulfillment + reporting flow](#8-post-close-fulfillment--reporting-flow)
9. [Gap analysis — what's missing](#9-gap-analysis--whats-missing)
10. [90-day build priority](#10-90-day-build-priority)

---

## 1. Client analytics — what to deliver

### Recommendation: **both** — but phased

| Phase | What client gets | When |
|-------|------------------|------|
| **Now (Launch handoff)** | PDF snapshot + Loom walkthrough | Day 14 |
| **Grow tier** | Monthly email report (PDF) | 1st of each month |
| **Phase 2 (CRM build)** | Simple client portal at `/portal/[token]` | After 5+ Grow clients |

**Do not build a full dashboard before you have Grow MRR.** A monthly PDF report is enough to retain at $497/mo and takes 1h/client with AI. Portal is a Phase 2 differentiator.

### What metrics matter (local SMB owners care about leads, not vanity)

**Google Business Profile (monthly):**

| Metric | Why it matters |
|--------|----------------|
| Profile impressions (Search + Maps) | "Are people seeing us?" |
| Calls from profile | Direct lead signal |
| Website clicks from profile | Traffic to your site |
| Direction requests | Local intent |
| New reviews + average rating | Trust |
| Messages (if enabled) | Lead volume |

**Website (monthly):**

| Metric | Why it matters |
|--------|----------------|
| Total sessions / users | Traffic trend |
| Form submissions | **Primary KPI** |
| Click-to-call events | Phone leads |
| Top traffic source | What's working |
| Mobile vs desktop | UX signal |

**Capture stack (monthly):**

| Metric | Why it matters |
|--------|----------------|
| Form → alert delivery time | System health |
| Missed-call texts sent | Feature working |
| Leads by week (trend) | Momentum story |

### What NOT to show clients

- Raw GA4 admin screens (overwhelming)
- Meta ad metrics (unless you run their ads)
- Keyword rankings you can't control
- Vanity metrics with no "so what" (bounce rate alone)

### Report format (monthly Grow email)

**Subject:** `[Business Name] — January results from New Legacy AI`

1. **Headline number** — "12 profile calls + 8 form leads this month"  
2. **3 bullets** — what improved vs last month  
3. **1 screenshot** — GMB insights or simple chart  
4. **1 recommendation** — "Request 3 reviews from last week's jobs"  
5. **CTA** — reply for changes or book quarterly check-in  

**AI generates 80%** from API data; VA adds one human recommendation.

---

## 2. Analytics tech stack & APIs

### No Google MCP available

There is **no Google Business Profile or GA4 MCP** in your current toolset. Reporting must be built into your CRM via official APIs.

### Google Business Profile — Performance API ✅

**API:** [Business Profile Performance API](https://developers.google.com/my-business/reference/performance/rest/v1/locations/fetchMultiDailyMetricsTimeSeries)

**Endpoint:** `locations.fetchMultiDailyMetricsTimeSeries`

**Metrics available:**
- `BUSINESS_IMPRESSIONS_DESKTOP_SEARCH` / `MOBILE_SEARCH`
- `BUSINESS_IMPRESSIONS_DESKTOP_MAPS` / `MOBILE_MAPS`
- `CALL_CLICKS`
- `WEBSITE_CLICKS`
- `BUSINESS_DIRECTION_REQUESTS`
- `BUSINESS_CONVERSATIONS`

**Auth:** OAuth 2.0 with scope `https://www.googleapis.com/auth/business.manage`

**How you get access:** Client adds New Legacy as **Manager** on their GMB (already in onboarding). You store refresh token per client in CRM.

**Search keywords:** Separate endpoint for monthly keyword impressions (useful for "what people searched to find you").

### Google Analytics 4 — Data API ✅

**API:** [GA4 Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)

**Metrics:** sessions, users, `generate_lead` events, `click_call` custom events, page views, source/medium.

**Auth:** Service account with Viewer access on client's GA4 property, OR OAuth.

**Setup at Launch:** You create GA4 property under your Google account, add to their site, grant client **Viewer** access in handoff doc. Simpler than per-client OAuth early on.

### Website form leads — your own data ✅

Track in CRM via webhook from site form → Supabase `website_leads` or client-specific table. **Most reliable lead count** — don't depend only on GA4.

### Vercel Analytics (optional)

If sites hosted on Vercel: `get_web_analytics` MCP can pull pageviews. Supplementary only — GA4 + form webhooks are primary.

### Apify GMB scrape (audit only)

Your existing `/scraper` is for **prospecting and audits**, not ongoing reporting. Public scrape ≠ authenticated insights. Use Performance API for clients.

---

## 3. Phased dashboard rollout

### Phase 1 — Manual + AI reports (now → Month 3)

| Step | Tool | Owner |
|------|------|-------|
| VA exports GMB insights from Google app (or screenshot) | Google Business app | VA |
| VA exports GA4 PDF or uses Looker Studio template | GA4 | VA |
| AI writes narrative + recommendations | Claude/GPT | Auto |
| PDF emailed via Resend | Supabase edge function | Auto |
| Store PDF in client project folder | CRM | Auto |

**Cost:** $0 extra · **Time:** 45–60 min/client/mo → target 30 min with template

### Phase 2 — CRM client portal (Month 3–6)

**Route:** `newlegacyai.ca/portal/[token]` (magic link, no login password)

**Dashboard widgets:**

```
┌─────────────────────────────────────────────────┐
│  [Business Name] — Last 30 days                   │
├─────────────────┬───────────────────────────────┤
│  GMB Calls      │  Website Form Leads           │
│  ↑ 12 (+3)      │  ↑ 8 (+2)                     │
├─────────────────┼───────────────────────────────┤
│  Profile Views  │  Missed-Call Texts Sent       │
│  ↑ 1,240        │  14                           │
├─────────────────┴───────────────────────────────┤
│  [Simple line chart — leads per week]           │
├─────────────────────────────────────────────────┤
│  Latest monthly report PDF · Download           │
│  Need changes? Email support@newlegacyai.ca     │
└─────────────────────────────────────────────────┘
```

**Build in CRM:**
1. `client_analytics_connections` table (GBP location ID, GA4 property ID, tokens)
2. Cron job (weekly) pulls APIs → `client_analytics_snapshots`
3. Portal page reads snapshots + generates chart
4. OAuth connect flow OR manual token entry by owner during onboarding

**Do not over-build:** 4 KPI cards + 1 chart + PDF archive is enough for $497/mo.

### Phase 3 — Grow upsell hook

Portal access included in **Grow tier only**. Launch clients get handoff snapshot + "upgrade to Grow for monthly dashboard."

---

## 4. Full customer journey map

```
AWARENESS          CONSIDERATION         CLOSE              FULFILL           RETAIN
─────────────────────────────────────────────────────────────────────────────────────
Meta ad /          Form submit           Sales call         14-day Launch     Grow monthly
referral /         → VSL A               (pre-sold via      → onboarding      report +
organic            → 6-day email         VSL B)             → emails          portal
                   → book call           → invoice          → handoff         → upsell
                   → VSL B               → pay              → training        Scale/Referral
```

### Stage-by-stage detail

| Stage | Trigger | Asset | Owner | Success metric |
|-------|---------|-------|-------|----------------|
| **1. Click** | Meta ad / link | `/booked-jobs` LP | Marketing | CTR >1% |
| **2. Opt-in** | Form submit | Thank-you + **VSL A** | Auto | >50% VSL view |
| **3. Nurture** | No book in 24h | 6-day email sequence | Auto | Book rate |
| **4. Book** | Calendly | Confirmation + **VSL B** | Auto | Show rate >70% |
| **5. Pre-call** | 24h / 2h before | Reminder emails | Auto | Watched VSL B |
| **6. Sales call** | Calendly fires | Script: diagnose → offer | Closer/You | Close 25–40% |
| **7. Close** | Verbal yes | Onboarding link + Stripe | You | Paid <24h |
| **8. Onboard** | Payment | `/start/[token]` wizard | Client | Assets <48h |
| **9. Deliver** | Assets received | 14-day fulfillment | VA + You | Launch Day 14 |
| **10. Handoff** | Launch | PDF + training call | You | Client responds to test lead |
| **11. Retain** | Day 30 | Grow pitch + first report | VA | 40%+ Grow attach |
| **12. Expand** | Month 3+ | Referral / Scale pitch | You | LTV ↑ |

---

## 5. Email sequences (complete)

**Tooling:** Resend (edge function exists) + n8n for Calendly/Stripe triggers + CRM webhooks.

### Sequence 0 — Instant (form submit, any LP)

| Timing | Subject | Body |
|--------|---------|------|
| **Instant** | Your Google visibility audit is ready | Link to audit PDF (if scraped) OR "processing in 1h" · **VSL A link** · "Book your call — only 3 slots this week" |

**Trigger:** `website_leads` insert → Resend

---

### Sequence 1 — Post-lead nurture (did NOT book) · 6 days

| Day | Subject | Content | CTA |
|-----|---------|---------|-----|
| 0 | (see Sequence 0) | VSL A | Book call |
| 1 | Did you get a chance to watch this? | VSL A link only | Book |
| 2 | Why Google Maps beats your website for local trades | 1 insight, no pitch | Book |
| 3 | How ShowRoom went from invisible to booked out | Case study link | Book |
| 4 | "I already have a website" — read this | Objection handler | Book |
| 5 | 3 Founding Client spots left this month | Scarcity | Book |
| 6 | Last note from me | Direct ask | Book or unsubscribe |

**Stop condition:** Calendly booked OR unsubscribed OR paid.

---

### Sequence 2 — Pre-close call (booked) · VSL B required

| Timing | Subject | Content |
|--------|---------|---------|
| **Instant** | You're booked — watch this before we meet (8 min) | Calendar link · **VSL B** · FAQ PDF · "Add to calendar" |
| **24h before** | Tomorrow: your strategy call | VSL B reminder · what to prepare (phone, GMB access, 15 min quiet) |
| **2h before** | We're on in 2 hours | Short · Zoom/phone reminder · "Reply if you need to reschedule" |

**Rule:** Closer checks "VSL B watched?" before call (Calendly + video host analytics if possible).

---

### Sequence 3 — Post-close onboarding · 14 days

| Day | Subject | Action |
|-----|---------|--------|
| **0** | Welcome to New Legacy AI — let's get started | Onboarding link `/start/[token]` · timeline graphic |
| **1** | Quick checklist — what we need in 48 hours | Logo, photos, phone, service list, GMB access |
| **2** | Reminder — we're waiting on your assets | Chase if incomplete |
| **3** | Assets received — here's what happens next | Set expectations · Week-1 win promise |
| **7** | You're live on Google 🎉 | Week-1 win · GMB screenshot · site preview link |
| **12** | Almost there — training call invite | Calendly for 30-min handoff |
| **14** | 🚀 You're live — here's everything | Handoff PDF · login sheet · Grow pitch |
| **30** | Your first month — numbers + Grow offer | Snapshot report · "Want this monthly? Grow tier" |

---

### Sequence 4 — Grow client monthly · recurring

| Timing | Subject | Content |
|--------|---------|---------|
| **1st of month** | [Business] — [Month] results | Monthly report PDF · portal link (Phase 2) · 1 recommendation |
| **Mid-month** | (only if issue) | GMB suspension, site down, etc. |

---

### Sequence 5 — Post-handoff referral (Day 45)

| Day | Subject | Content |
|-----|---------|---------|
| 45 | Know another trade owner? | $500 Grow credit · referral link |

---

### Email automation wiring

| Event | Webhook / trigger | Sequence |
|-------|-------------------|----------|
| Form submit | `website_leads` insert | 0 + 1 |
| Calendly booked | Calendly webhook → n8n | 2 |
| Stripe paid | Stripe webhook | 3 (Day 0) |
| Onboarding submitted | `client_onboarding_submissions` | 3 (Day 3) |
| Project milestone | CRM manual or checklist | 3 (Day 7, 14) |
| Cron 1st of month | Supabase cron | 4 |

---

## 6. VSL framework (Hormozi)

Hormozi's VSL structure maps to **Hook → Problem → Mechanism → Proof → Offer → Risk reversal → CTA**.

> "The goal of the VSL is to sell the **next step**, not the full relationship."  
> — Used post-opt-in to sell the **call**, and pre-call to sell the **yes**.

### VSL inventory

| ID | Name | Length | When | Goal |
|----|------|--------|------|------|
| **A** | Why Booked Jobs Launch | 5–8 min | After form submit | Book strategy call |
| **B** | Before We Meet | 3–5 min | After Calendly book | Show up pre-sold |
| **C** | Retargeting cut | 60–90 sec | Meta retargeting | Return to LP |
| **D** | What Happens After You Say Yes | 2–3 min | After payment (optional) | Reduce buyer's remorse |

---

### VSL A — Post-opt-in · "Why local businesses lose jobs on Google"

**Audience:** Cold traffic, trades owner, skeptical, on phone.

| Section | Time | Script beats |
|---------|------|--------------|
| **1. Hook** | 0:00–0:30 | "If you own a [plumbing/HVAC/detail] business and you're still getting most of your jobs from word-of-mouth — this is for you. In the next 6 minutes I'll show you why you're probably losing 3–5 jobs a month to competitors who aren't better than you — they just show up on Google Maps first." |
| **2. Problem** | 0:30–2:00 | Three pains: invisible (not in map pack), untrusted (bad/no reviews), slow (voicemail = lost job). "The homeowner calls three names. You're number three. They never call back." |
| **3. Mechanism** | 2:00–3:30 | "We built the Booked Jobs Launch System: Google profile that ranks, a site that converts in 3 seconds, and automations that text people back when you miss a call. **You still close the job** — we make sure the lead reaches you." |
| **4. Proof** | 3:30–4:30 | ShowRoom: before/after, one stat. DetailOps: "we build booking systems for 500+ detailers." 10 sec each. |
| **5. Offer** | 4:30–5:30 | Stack: GMB + site + text-back + alerts + 14-day launch. Anchor $5k → $2,997. |
| **6. Risk reversal** | 5:30–6:00 | "14-day launch. You own everything. 30-day support." |
| **7. CTA** | 6:00–6:30 | "Book a free 15-minute strategy call. We'll look at your Google listing live. Only a few spots this week." → Calendly |

**3-day rule:** Only show Calendly slots within next **72 hours**.

---

### VSL B — Pre-sales-call · "Before we meet"

**Audience:** Booked, needs to show up and arrive warm.

| Section | Time | Script beats |
|---------|------|--------------|
| **1. Confirm** | 0:00–0:20 | "You're booked for [date]. Watch this 4-minute video so we don't waste your time on the call." |
| **2. Agenda** | 0:20–1:00 | "On the call we'll: (1) pull up your Google listing, (2) show where you're losing leads, (3) if it's a fit, walk through the Launch system. No pressure." |
| **3. Mechanism recap** | 1:00–2:00 | 60-sec version of VSL A mechanism. |
| **4. What to prepare** | 2:00–2:30 | "Have your phone, know your service area, think about how many jobs you want per month." |
| **5. FAQ** | 2:30–3:30 | Timeline (14 days), cost ($2,997), what you need (photos, logo), what we don't do (we don't answer your phones). |
| **6. CTA** | 3:30–4:00 | "Add to calendar. Show up — even if you're not sure yet, you'll leave with a free audit of your Google presence." |

**Sales call becomes:** 10 min diagnose → 5 min offer → close. Not a demo reveal.

---

### VSL C — Retargeting · 60–90 sec

Cut from VSL A: Hook (10s) + one proof stat (15s) + CTA (10s). Use as Meta video ad for LP visitors.

---

### VSL D — Post-payment (optional) · 2 min

"Here's exactly what happens in the next 14 days." Reduces refunds and speeds asset upload.

---

## 7. VSL production guide

### Format recommendation

**Founder on camera** for Hook + Problem (trust). **Screen recording** for Mechanism + Proof (show GMB, ShowRoom site). Hormozi does both — you don't need a studio.

### Set (minimal, professional)

| Element | Spec |
|---------|------|
| **Location** | Clean wall or office, no clutter |
| **Lighting** | Window or ring light in front of face |
| **Camera** | iPhone 14+ or webcam 1080p |
| **Audio** | Lapel mic or AirPods — **audio matters more than video** |
| **Frame** | Chest up, look at lens |
| **Wardrobe** | Solid shirt, no busy patterns |
| **Background** | Optional: blurred trade tools / monitor with GMB |

**Do not:** green screen, over-edited captions, corporate voiceover without a face. Local owners buy from people.

### Recording workflow (1 session = all VSLs)

| Block | Time | Output |
|-------|------|--------|
| Setup + mic check | 15 min | — |
| VSL A full take (2–3 attempts) | 45 min | VSL A |
| VSL B (reuse A sections + new intro/outro) | 20 min | VSL B |
| B-roll: screen record GMB + ShowRoom | 30 min | Proof inserts |
| Edit in CapCut | 2–3 hrs | Final cuts |
| Upload to Mux or unlisted YouTube | 15 min | Embed URLs |

### Hosting

- **Mux** (you already reference for training content) or **unlisted YouTube** embed on thank-you pages
- Track views: Mux analytics or YouTube studio
- Thumbnail: your face + "Free Google Audit" text

---

## 8. Post-close fulfillment + reporting flow

```
PAYMENT
  ↓
Onboarding link sent (email Seq 3, Day 0)
  ↓
Client submits /start/[token] + uploads assets
  ↓
CRM project created · 14-day checklist starts
  ↓
Day 1–5: GMB live (Week-1 win email Day 7)
Day 2–10: Website from template
Day 8–12: Twilio automations + GA4
  ↓
Day 12: QA checklist
Day 13: Training call (30 min)
Day 14: Launch email + handoff PDF
  ↓
Handoff PDF includes:
  · GA4 Viewer access invite
  · GMB manager confirmation
  · "How to read your leads" 1-pager
  · Grow tier pitch
  ↓
Day 30: First snapshot report (manual PDF)
  ↓
Grow sale → monthly Sequence 4 + portal (Phase 2)
```

### Analytics in fulfillment SOP

| Package | Analytics included |
|---------|-------------------|
| Visibility Fix | GMB screenshot at handoff only |
| Booked Jobs Launch | GA4 setup + handoff snapshot PDF |
| Grow | Monthly PDF report (+ portal Phase 2) |
| Scale / custom | Custom dashboard in their app |

---

## 9. Gap analysis — what's missing

### Marketing & sales

| Gap | Priority | Fix |
|-----|----------|-----|
| `/booked-jobs` LP not built | P0 | Build siloed ads page |
| VSL A/B not recorded | P0 | 1 recording session |
| 6-day nurture not wired to Resend | P0 | n8n or Supabase trigger |
| Calendly → VSL B email | P0 | Calendly webhook → n8n |
| Pre-call "VSL watched?" tracking | P1 | Mux/YouTube view token |
| Main site two-path hero | P1 | Copy update |
| Demo-site cold call flow | Remove | Replace with audit funnel |

### Fulfillment & ops

| Gap | Priority | Fix |
|-----|----------|-----|
| 14-day project checklist in CRM | P0 | Tasks auto-created on payment |
| Package presets ($2,997 Launch) | P0 | One-click contract line items |
| Asset chase Day 1/2/3 emails | P0 | Cron on incomplete onboarding |
| GBP OAuth token storage | P1 | `client_analytics_connections` table |
| GA4 service account per client | P1 | Document in onboarding SOP |
| Monthly report template | P1 | Google Doc → PDF automation |
| Client portal `/portal/[token]` | P2 | After 5 Grow clients |

### CRM & data

| Gap | Priority | Fix |
|-----|----------|-----|
| `website_leads` not in CRM UI | P0 | Leads inbox page |
| Email sequence state per lead | P1 | `lead_email_state` table |
| Form → CRM attribution (UTM) | P1 | Already partially there — unify |
| Commission tracking | P2 | Cold caller payouts |

### Analytics APIs

| Gap | Priority | Fix |
|-----|----------|-----|
| GBP Performance API integration | P1 | Edge function + cron |
| GA4 Data API integration | P1 | Edge function + cron |
| Apify audit → PDF auto-send | P1 | Scraper + AI narrative |
| Client-facing dashboard | P2 | Portal route |

### Legal / scope

| Gap | Priority | Fix |
|-----|----------|-----|
| Contract says 2–4 weeks not 14 days | P1 | Update `contract-template.ts` |
| Analytics not in contract scope | P1 | Add "monthly report" to Grow agreement |
| Capture vs respond language | P1 | Agreement + VSL FAQ |

---

## 10. 90-day build priority

### Days 1–30 (sell + deliver)

- [ ] Record VSL A + B (1 session)
- [ ] Build `/booked-jobs` LP with VSL A embed
- [ ] Wire form → Resend Sequence 0 + 1
- [ ] Wire Calendly → Sequence 2 (VSL B)
- [ ] Package preset: Booked Jobs Launch in contracts
- [ ] 14-day checklist template (even if manual Notion first)

### Days 31–60 (automate delivery)

- [ ] Asset chase emails (Day 1/2/3)
- [ ] Stripe paid → Sequence 3 Day 0
- [ ] Monthly report Google Doc template + AI fill
- [ ] `website_leads` in CRM UI
- [ ] Apify audit → auto PDF on form submit

### Days 61–90 (analytics + retention)

- [ ] GBP Performance API pull (manual trigger → then cron)
- [ ] GA4 Data API pull
- [ ] First 3 monthly Grow reports sent
- [ ] Scope client portal MVP if 5+ Grow clients
- [ ] Referral sequence (Day 45)

---

## Document map (updated)

| File | Purpose |
|------|---------|
| `NEW-LEGACY-AI-CLIENT-OPERATIONS-PLAN.md` | **This file — journey, email, VSL, analytics** |
| `NEW-LEGACY-AI-FULFILLMENT-PLAYBOOK.md` | Delivery steps & hours |
| `NEW-LEGACY-AI-EXECUTIVE-PLAN.md` | Strategy |
| `NEW-LEGACY-AI-MASTER-SCALING-PLAYBOOK.md` | Ads, pricing, hiring |

---

**Changelog**

| Date | Change |
|------|--------|
| 2026-08-22 | v1.0 — Analytics strategy, full journey, email/VSL framework, gap analysis |
