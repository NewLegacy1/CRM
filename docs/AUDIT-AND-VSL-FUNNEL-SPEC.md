# Audit + VSL funnel spec (locked)

**Version 1.0 · August 22, 2026**

Decision: **two VSLs only.** Personalized audit in the first email. Generic VSL A in that same email (trust + book the call). Short VSL B only after they book (FAQ / show-up). No third VSL. VSL C is a cut from A for ads later.

Canonical journey:

```
Ad / warm link
  → /booked-jobs form
    → scrape + score + PDF (human 2-min check)
      → Seq 0 email + SMS: audit PDF + VSL A + book CTA
        → (if no book) Seq 1 drip, still pointing at VSL A + Calendly
          → Calendly booked
            → Seq 2: VSL B (3 min FAQ) + 24h / 2h reminders
              → sales call (diagnose 10 / offer 5 / close)
```

---

## Why two VSLs, not one or three

| Asset | Job | Keep? |
|-------|-----|-------|
| **Audit PDF** | “This is *your* listing.” Personal. Builds trust. Cannot be a generic video. | Yes — build it (API-03, P0) |
| **VSL A** (5–7 min) | Sells the **call**. No easter egg — they have not booked yet. | Yes |
| **VSL B** (3–5 min) | After they book. They pick their leak, write 5 facts, then text **READY**. Call skips discovery. | Yes |
| VSL C | 60–90s cut from A for retargeting | Later, after sale #2 |
| Third “trust VSL” | Duplicate of A’s proof block | **No.** Put proof *inside* A and as 2 stills in the audit email |

If after 10 booked calls the show rate is ≥80% without anyone watching B, we can stop sending B. Default: keep it. Killing B before we have no-show data is how a $20/day lead wastes a calendar slot.

---

## Seq 0 email (the one that matters)

**Send when:** PDF is ready (target <15 min). If scrape fails: send VSL A + book only, subject “We couldn’t load your Maps listing — watch this + book.” Never invent scores.

**Subject:** `Your Google visibility audit for [Business Name]`

**SMS (same moment):** `Your Google audit for [Business] is ready. Score [X]/100 + a 6-min video. [link]`

**Email body (order):**

1. One-line score: “[Business] in [City] — visibility score **62/100**.”
2. Button: **Open your audit (PDF)**
3. Two proof stills (not a third video):
   - Jay That Drain Guy — before (thin profile) / after (reviews + booked-jobs language)
   - ShowRoom — before/after Maps or site
   - Caption: “Same gaps we flagged on their audit. Fixed in 14 days. They still close the jobs — we make the lead reach them.”
4. **VSL A embed** — “Watch this 6-minute video before you book (or while you do).”
5. CTA: **Book a 15-minute Maps review** (Calendly, next 72 hours only)
6. One honesty line: “We capture leads and get them to you. We do not answer your phones or quote jobs.”

### Thank-you page = wait room (do this; from N6dYgYah3Ig)

Do **not** make them wait on a spinner with no video. On submit, send them to `/booked-jobs/thank-you` immediately:

1. Line: “We’re pulling your Google listing. The PDF hits your inbox in about 5 minutes.”
2. **VSL A plays now** — “Watch this while it generates.”
3. **Calendly under the video** — they can book before the PDF exists.
4. SMS/email Seq 0 fires when the PDF is ready (same VSL + book again, plus the file).

This is the salty-pretzel flow: pretzel (audit) is cooking; they already eat the video and can book. First email can be lighter on the pitch because the thank-you page already asked.

**Skill file:** audit prompt is a fixed rubric (sections + scoring weights), not a freeform “write an audit.” Same structure every time; only their numbers change. Cost target: cents per report.

**Do not add:** Karpathy-style auto-research on headlines (needs more traffic than $20/day). HighLevel. A third video.

---

## VSL A — generic, sells the call

Not personalized. Trade examples can say “HVAC / plumber / electrician / roofer in Ontario.” Do **not** make this a detailer video.

| Time | Beat |
|------|------|
| 0:00–0:25 | Hook: “If you own a trade business and still get most jobs from word-of-mouth — you’re losing work to whoever shows up on Maps first.” |
| 0:25–1:40 | Problem: invisible / untrusted / voicemail. “They call three names. You’re last. They never call back.” |
| 1:40–3:10 | Mechanism: Booked Jobs Launch — profile + conversion page + missed-call text-back. **You close.** |
| 3:10–4:20 | **Trust / proof:** Jay + ShowRoom, 20–30s each. “Their audit looked like the PDF we just sent you.” |
| 4:20–5:20 | Offer stack in one breath ($2,997 / 14 days). No second price. |
| 5:20–5:50 | Risk: you own everything; 30-day support; we don’t answer phones. |
| 5:50–6:30 | CTA: book the 15-min call this week. We’ll pull their listing live. |

---

## VSL B — only after they book

≤3 minutes. Do not re-pitch Launch.

1. “You’re booked. Watch this so we don’t waste the call.”
2. Agenda: pull listing → show leaks → if fit, walk Launch.
3. FAQ: 14 days · $2,997 · photos/logo · we capture, they close.
4. “Add it to your calendar. Show up even if you’re unsure — you leave with a live look at your Maps listing.”

Seq 2: this email instantly + 24h “watch before tomorrow” + 2h “we’re on.”

---

## Audit automation (build this)

**Ticket:** API-03 (P0 — ships with Seq 0, not after first sale).

1. Form: business name, trade, city, phone, email, GBP yes/no/unsure, “ready to invest $2,500 in 14 days?”
2. Apify scrape of **their** listing + **3 same-category competitors** in that city. Persist fields we currently throw away: review count, photos, categories, hours, description, posts.
3. Rubric 0–100 (see critique notes): reviews, rating, photos, categories, posts, website, hours/area, description, NAP vs site if we have a URL.
4. Model writes PDF from **those numbers only**. Named business, named competitors, 5 gaps, 3 quick wins, CTA. No invented rankings or review counts.
5. CRM queue: founder **2-minute review** on first 10 audits (name, city, competitor names, no fake stats). After 10 clean sends, auto-send + spot-check.
6. Store PDF on the lead. Seq 0 fires. Owner SMS alert in <60s either way.

If scrape returns nothing: no PDF, VSL A still goes.

---

## What we do not build

- Per-company custom VSL
- A third trust video
- Advertising “your audit is ready” before API-03 is live in production
- Audit as free *work* (we do not optimize their GMB for free)
