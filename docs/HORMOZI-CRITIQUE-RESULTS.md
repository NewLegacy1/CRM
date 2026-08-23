# Hormozi Critique Results — New Legacy AI

**Version 1.1 · August 22, 2026 · Master agent output**

**Founder: approve here → [`docs/FOUNDER-APPROVAL-CARD.md`](FOUNDER-APPROVAL-CARD.md)** (D1–D9 in plain English). This file is the scored critique + rationale.

Scored against `docs/HORMOZI-CRITIQUE-CHECKLIST.md`. Evidence cites the four strategy docs and the live codebase (verified Aug 22).

**Verdict: 8 Pass · 13 Gap · 4 Fail.** The strategy documents are mostly right. The failures are (1) money-model math that doesn't survive real Meta CAC, (2) two acquisition channels still running in parallel on paper *and in code*, (3) choice paralysis on the ads LP, and (4) a brand-identity conflict between docs that would leak into ad creative.

**Cash amendment (v1.1):** Founder has ~$3,000 cash. Rule of 100 at $100/day is **rejected**. D9 replaces it with a $600 discovery cap and reinvest-after-first-sale.

---

## Scorecard

| # | Item | Score | Evidence | Fix | Priority |
|---|------|-------|----------|-----|----------|
| **A. $100M Offers** | | | | | |
| 1 | Dream outcome headline | **Gap** | Planned LP copy sells "booked jobs" correctly (Exec Plan §4). But nothing shipped: live hero still says "AI that handles the busywork" (`HeroSection.tsx`); site metadata says "Custom AI Agents for Business Automation" (`layout.tsx`). | Ship `/booked-jobs` with outcome headline; rewrite main hero to two-path outcome copy. | P0 |
| 2 | Crush time + effort | **Gap** | 14-day promise is explicit everywhere in docs — but the legal contract clients sign says **"2–4 weeks"** (`contract-template.ts`). The offer and the agreement contradict each other. | Update contract to 14 days from payment + completed onboarding, with client-delay pause clause (already in Fulfillment §12). | P1 |
| 3 | Proof stack | **Pass** | ShowRoom, Jay, DetailOps live in `case-studies-data.ts`; VSL A places Proof before Offer (Ops Plan §6). | One cleanup: Scaling Playbook §8 lists "demo-site before/after" as LP proof — demo sites are killed. Remove from proof stack. | P2 |
| 4 | Trim & stack | **Fail** | Exec Plan §4 puts **both** Visibility Fix ($997) and Launch ($2,997) on the ads LP, plus a $297 Sprint in the offer table. Cold-traffic prospect sees three prices → choice paralysis. Hormozi: one default offer; downsells on the call only. | LP shows **one offer**: Booked Jobs Launch $2,997. Visibility Fix becomes a call-only downsell. $297 Sprint is killed as a sold SKU — its content becomes the **free** audit lead magnet. | P0 |
| 5 | Price virtuous cycle | **Gap** | $2,997 PIF with plan at $1,997 + 2×$997 = $3,991 (plan > PIF ✓). But the CRM still defaults contracts to **$1,200 + $500 = $1,700** (`project-contracts-panel.tsx`) — the founder will anchor to legacy pricing under call pressure. | Package preset "Booked Jobs Launch — $2,997" as the one-click default; remove $1,700 defaults. Founding Client: first 5 at $2,997, then raise to $3,497 (improves the failing 30-day math, see #11). | P1 |
| **B. $100M Leads** | | | | | |
| 6 | One channel for 90 days | **Fail** | Scaling Playbook §6 keeps cold outreach "as setter feeding Meta-qualified leads"; Exec Plan §4 lists "Meta ads + cold call" as Track A primary channels; Exec Plan §8 hires a commission cold caller "Now". That is two channels at Stage 3 with a solo founder. | Meta → siloed LP is the **only** Track A channel for 90 days. Cold calling paused. Track B stays warm/referral only (no cold until a $10k+ offer doc + SOP exists). No cold caller hire. | P0 |
| 7 | Rule of 100 | **Gap** | $100/day × 100 days is on paper (Scaling Playbook §7) and **not fundable** (~$3k cash). At $15–20/day you will not exit Meta learning. Hormozi's Rule of 100 is *or* 100 warm touches / 100 min content — those substitutes were missing. | **D9:** $600 discovery cap, $15–20/day, cash floor $2,000. Paid Rule of 100 delayed until sale #3 or $8k cash. This month: 10 warm asks + 3 posts/week. Hooks/LP/Pixel still ship before $1 of spend. | P0 |
| 8 | Lead magnet | **Gap** | "Free GMB Visibility Audit" CTA specified (Scaling Playbook §8) and Apify scraper exists — but auto-audit (scrape → score → PDF → email) is not built; Seq 0 email would say "processing in 1h" with nothing behind it. | Build audit pipeline (API-03). Until it ships, Seq 0 delivers VSL A + booking link only — never promise a PDF that doesn't exist. | P1 |
| 9 | Cold economics | **Fail** | Handoff says demo sites deprecated, but Exec Plan §4 still says "Cold call: demo sites → book," Scaling Playbook §3 uses demo sites as proof, and **the code still runs it**: `/api/webhooks/no-answer` emails "Made you a brand new website," and `website_leads` statuses include `answered_accepted_demo`. Cold outreach at $2.5k AOV is upside-down (Hormozi 2026: cold favors $10k+). | Delete demo-site email flow (CRM-08). Purge demo-site language from all docs. Calling UI is retained only as a future speed-to-lead callback tool, not prospecting. | P0 |
| 10 | MVP organic | **Gap** | No organic posting plan in any doc. Cold traffic *will* check the founder/company profile before paying $3k. | 3 posts/week on one channel (founder LinkedIn or company FB), repurposed from ad hooks and client wins. 30 min/week, founder task. | P2 |
| **C. $100M Money Models** | | | | | |
| 11 | 30-day cash > 2×(CAC+COGS) | **Fail → improved by D9** | At $100/day the math failed (CAC ~$1,500 → 0.62×). At a **$600 discovery cap**, one $2,997 sale = CAC $600 → 2×($600+$500)=$2,200 vs GP $2,497 = **1.13× without Grow, 1.36× with Day-14 Grow pitch**. Low spend *helps* the money model if it produces a sale. Risk is the opposite: $600 spent, zero sale, cash down to ~$2,400. | D9 kill rules ($400 no-call / $600 no-sale). Grow still pitched Day 14. Do not "fix" a miss by raising spend. Full model in `MASTER-EXECUTION-PLAN.md` §C. | P0 |
| 12 | Offer sequence scripted at Day 14 | **Gap** | Docs contradict: Fulfillment §12 Day 14 = "Grow pitch"; Ops Plan Seq 3 pitches Grow at Day 30; Fulfillment §6 says Grow "starts Day 30". No script exists. | Canonical: **pitch at Day-14 training call, billing starts Day 30.** Write the 5-line Grow pitch script into the sales SOP (DOC-01). | P1 |
| 13 | Payment plans — minimum cash | **Pass** | $1,997 down before work starts (Scaling Playbook §3); covers COGS ($500) 4×. | Keep. Plan offered on call only, never on LP. | — |
| **D. VSL / Sales** | | | | | |
| 14 | Funnel order | **Gap** | Magnet → VSL A → qualify → book → VSL B → call is correctly specified (Ops Plan §4). Zero assets exist: no LP, no VSLs recorded, no sequences wired. | Execute per build plan. Funnel design itself needs no change. | P0 |
| 15 | Intentional friction | **Pass** | Qualification form specified: trade, city, GBP status, jobs goal, "$2,500+ in next 14 days?" (Scaling Playbook §8). Correct — filters before Calendly. | Build as specified (LP-02). | — |
| 16 | Speed to lead | **Gap** | Docs target "<5 min" (Exec Plan §9). Standard is <60 sec automated. Nothing is wired either way — a form submit today alerts no one. | Instant automated SMS + email to lead on submit (Seq 0) plus owner alert — <60 sec, no human dependency. Founder callback <30 min business hours. | P0 |
| 17 | Documented sales SOP | **Gap** | Journey says "Script: diagnose → offer" (Ops Plan §4) but no script, objection handling, or plus-plus/minus-minus doc exists. Blocking for any future closer hire. | Founder runs first 3 calls from a skeleton script (DOC-01), records them, then finalizes SOP. No closer hire until SOP + 10 closed calls. | P1 |
| **E. Ep 999 — Service business 2026** | | | | | |
| 18 | Trim delivery before scaling ads | **Pass** | Fixed template sections ("do not custom-scope per client"), VA checklists, 3 Launch/mo capacity cap, asset-gate pause rules (Fulfillment §5, §12). | Encode as CRM checklist (CRM-05) so it's enforced, not aspirational. | — |
| 19 | Avatar quality | **Pass** | "2+ years in business" on LP, established owner-operators, $2,500 readiness question. | Minor: scraper defaults to "restaurants" (`scraper` UI) — retire non-trade defaults so audits stay on-avatar. | P2 |
| **F. Stage 3 Stabilize** | | | | | |
| 20 | Stage fit | **Gap** | Exec Plan §8 hires "Commission cold caller — Now" before any sales SOP exists — exactly the Stage 3 anti-pattern (hire closer before documentation). | Hire order: **VA only** in first 90 days (trigger below). No setter, no closer. Founder sells with SOP-in-progress. | P1 |
| 21 | VA timing | **Pass** | Trigger documented: after 2 Launch/mo; 2 Grow clients ($994 MRR) cover VA cost (Scaling Playbook §5). | Keep. Job post text in `MASTER-EXECUTION-PLAN.md` founder section. | — |
| **G. Anti-patterns (sub-$10k)** | | | | | |
| 22 | Anti-pattern sweep | **Fail** | Three live violations: (1) cold as parallel Track A engine (docs, #6); (2) demo-site flow in production code (#9); (3) Scaling Playbook §1 north star says "*local service businesses in Hamilton/GTA*" while Exec Plan §1 says "*not a trades agency, remote Canada+USA*" — an identity conflict that would produce mixed-avatar creative. No violations found for: lead answering promises (capture language consistent ✓), Meta-to-main-site (explicitly banned ✓). | (1) D1 below; (2) CRM-08; (3) canonical: **company = two-track remote CA/USA; the Hamilton/GTA trades identity exists only inside Track A ad creative and `/booked-jobs`.** Scaling Playbook north star line gets a scope note (DOC-02). | P0 |
| **H. Andromeda / Meta** | | | | | |
| 23 | Creative = targeting | **Pass** | Hooks-per-trade with broad geo + Advantage+ specified; 10–15 conceptually distinct creatives; no interest-stack hacks (Scaling Playbook §7). Clarified: "one avatar" = established local trade owner-operator; trade-specific callouts within that avatar are correct Andromeda practice, not multi-avatar. | Write the 20+ hooks (AD-01). | — |
| 24 | Horizontal scaling | **Pass** | Ontario/GTA first, then new trades/provinces/states on winning hooks (Exec Plan §7). | Gate: don't expand geo until ≥1 hook produces 2+ clients. | — |
| 25 | LP > lead form | **Pass** | Documented with CPL/SQL math (Scaling Playbook §7: lead form ≈ $1,300+/client vs LP ≈ $400–650). LP not built — execution covered by #14. | Build LP-01..05 before launch. | — |

---

## Revised Strategy — decisions resolving all Fail/Gap items

**Approve in [`FOUNDER-APPROVAL-CARD.md`](FOUNDER-APPROVAL-CARD.md), not here.** Compact record:

| # | Decision | Resolves |
|---|----------|----------|
| **D1** | Paid = Meta → `/booked-jobs` only. Cold + demo sites killed. **Warm asks required** (existing relationships). No setter/closer hire. | 6, 9, 20, 22 |
| **D2** | LP sells Launch only — **no price on the page**. $2,997 in VSL A + call. Plan + Fix on-call. After 5 clients: $3,497. | 4, 5, 11 |
| **D3** | Build audit automation with Seq 0. One email: their PDF + generic VSL A + book. VSL B only after book. No third VSL. | 8 |
| **D4** | Min cash before work $1,997. Grow pitched Day 14, billed Day 30. No Respond. | 11, 12, 13 |
| **D5** | Auto SMS+email <60s; founder callback <30 min. Capture, not answering their phones. | 16 |
| **D6** | One avatar: Ontario trade owner. First wave: detailers + one other trade. Trades copy only on ads + LP. | 22, 23, 24 |
| **D7** | VA after 2nd Launch in one month. Nothing else 90 days. | 17, 20, 21 |
| **D8** | Contract 14 days + capture language. CRM default $2,997. Main site two-path. | 1, 2, 5 |
| **D9** | **Cash plan.** Floor $2,000. Max $600 Meta before first sale ($15–20/day). Pause $400 no-call / $600 no-sale. After first paid Launch: $1,000–1,200 back into ads. $100/day only after sale #3 or $8k cash. | 7, 11 |

### Contradiction register (docs vs docs vs code)

| Contradiction | Resolution |
|---------------|------------|
| Demo sites: deprecated (Handoff) vs active (Exec Plan §4, Scaling Playbook §3/§6) vs live in code (`no-answer` webhook) | Killed everywhere. Code: CRM-08. Docs: DOC-02 changelog entries. |
| Channels: "one for 90 days" (Checklist B6) vs "cold as setter in parallel" (Scaling Playbook §6) | D1 — Meta only. |
| Speed to lead: <5 min (Exec Plan §9) vs <60 sec (Checklist 16) | D5 — <60 sec automated. |
| Grow pitch: Day 14 (Fulfillment §12) vs Day 30 (Ops Plan Seq 3) | D4 — pitch Day 14, bill Day 30. |
| Identity: "Hamilton/GTA trades" north star (Scaling Playbook §1) vs two-track remote CA/US (Exec Plan §1) | D6 — trades identity confined to ads + LP. |
| Contract 2–4 weeks (code) vs 14-day promise (all docs) | D8 — contract update CRM-06. |
| Pricing: $1,700 CRM default (code) vs $2,997 canonical | D8 — preset CRM-04. |
| LP offers: one (Checklist A4) vs Launch + Fix both on LP (Exec Plan §4) | D2 — one offer on LP. |
| Rule of 100 $100/day (all docs) vs ~$3k cash (founder, Aug 22) | D9 — discovery cap; paid Rule of 100 delayed. |

---

**Next:** `docs/MASTER-EXECUTION-PLAN.md` — agent architecture, build inventory, 90-day sprint plan, economics model, ad content plan, site change spec, wiring spec, founder checklist.
