# ATLAS_V1_PRODUCT_SPEC.md
**The product north star for Atlas (BIZEX4U).**
Every feature, PR, and idea is evaluated against this document. If a change does not make the core **Research → Recommend → Pitch → CRM → Learn** loop meaningfully better, it is not V1.

Status of supporting docs: implementation detail lives in `MARKET_INTELLIGENCE_V2.md` (analyst engine), `ATLAS_DB_SCHEMA.md` (data), `PRODUCTION_ROADMAP.md` (sequencing), `UX_REDESIGN.md` (surface). This document sits **above** all of them and wins any conflict of intent.

---

## 1. Mission

> Atlas helps a BIZEX4U salesperson decide **WHO, WHEN, WHERE, WHY, and HOW** to pitch any brand — and act on it in minutes, not days.

Atlas is an **AI operating system for barter-media sales**, not a collection of tools. Success is measured by whether a rep opens Atlas *first*, every morning, on instinct.

---

## 2. The one workflow (everything supports this)

```
Research → Understand → Recommend → Pitch → Track → Learn
```

There are no "pages" in the product model — only **stages of one continuous flow**. A rep should never think "which tab do I open?" Atlas moves them forward and always answers four questions on every surface:

1. **What happened today?**
2. **What should I do next?**
3. **Why does it matter?**
4. **Can I act now?**

---

## 3. The morning experience (the product's first impression)

When Yash opens Atlas, before any click:

```
Good morning, Yash.
Atlas analysed 5,231 brands overnight.

Today's highest-priority opportunity:  ZEPTO

Why now
  • Hiring expansion managers
  • Opening 12 new dark stores
  • Marketing spend increasing
  • Lucknow & Kanpur expansion

Estimated barter opportunity   ₹1.8 Cr
Confidence                     94%   (sources: 3 headlines · geo model)

[ Research Zepto → ]
```

- **One hero opportunity**, not a grid. Below it: the next 4, then the research feed. Everything else is below the fold.
- The CTA opens the **research flow in place** — it does not navigate to a disconnected page.
- Proactive voice, always. Atlas tells; it doesn't wait to be asked.

---

## 4. The research flow = The AI Analyst

Clicking **Research** runs one continuous report. Each section answers exactly **one executive question**. Card-first, scannable, with an expandable "Detailed analysis" under each.

| Section | The question it answers | Must show |
|---|---|---|
| **Executive Summary** | Should I pursue this company? | Verdict + confidence + est. value |
| **Financial Intelligence** | Can they afford advertising? | Funding, revenue signals, spend capacity |
| **Growth Intelligence** | Why now? | Launches, hiring, expansion — dated, sourced |
| **Geography** | Where should they advertise? | Scored pincodes + zones + coverage map |
| **Competition** | What are rivals doing? | Competitor activity, share-of-voice gaps |
| **Media Strategy** | What should BIZEX4U propose? | Media mix, barter value, inventory fit |
| **Outreach** | How do I pitch them? | Ready email + LinkedIn + call points |
| **CRM** | Track it. | One-click push to Twenty |

Rules:
- **No paragraph walls.** Lead with cards, checks, and big numbers. Detail is opt-in.
- **Every recommendation carries: confidence · sources · last-updated.** Verified vs inferred must be visible.
- The flow **ends in action** (Add to pipeline / Push to CRM), never a dead end.

---

## 5. What we build next: the Research Pipeline (specialists, not one mega-prompt)

The analyst is a **sequence of narrow specialists**, each with a tight job. This is the moat — not the model.

```
Company Resolver        → who exactly is this brand
Company Classifier      → listed / private / D2C / category
Collector Layer         → news, hiring, places, serviceability (evidence in)
Evidence Layer          → dedupe, date, source-tag, confidence-score
  ├─ Financial Analyst  → affordability
  ├─ Growth Analyst     → why-now
  ├─ Geographic Analyst → where
  ├─ Retail Analyst     → footprint / dark stores
  ├─ Competition Analyst→ rival motion
  ├─ Media Analyst      → channel fit
  └─ Campaign Analyst   → the barter proposal
Report Composer         → assemble the 8 sections
Pitch Generator         → email + LinkedIn + call points
CRM                     → push company + opportunity
```

Why specialists: each is independently testable, cheaper, explainable, and improvable. A wrong "why-now" is fixed in one analyst, not a 2,000-token prompt. Evidence flows in once; every analyst reads the same sourced facts → consistent, citable output.

**Freeze list (do NOT add for V1):** more DB tables, more infra, more AI models, more map layers, more integrations. There is already enough. V1 is about *sequencing and surfacing* what exists.

---

## 6. The learning loop (what turns recommendations into a moat)

Every recommendation must close the loop:

```
Recommended → Contacted? → Meeting? → Proposal? → Won/Lost? → Why?
```

Outcomes feed back into scoring: brands/signals/categories that convert get weighted up; dead patterns down. Atlas should get sharper every week *from BIZEX4U's own results* — a data advantage no competitor can copy.

---

## 7. Success metrics (V1 is done when a rep can…)

- **Understand a brand in under 5 minutes.**
- **Decide to pursue — confidently** (verdict + confidence + evidence, not a hunch).
- **Generate a meeting-ready pitch** without writing from scratch.
- **Push to CRM in one click** — no duplicate data entry.
- **Never repeat work** — Atlas remembers what was researched, contacted, won.

If a rep opens Atlas first every morning and closes the loop inside it, V1 succeeded.

---

## 8. Non-goals (equally important)

Atlas is **not**:
- a generic CRM (Twenty is the CRM; Atlas is the intelligence + workflow on top)
- a BI dashboard
- a chatbot
- a Google Maps clone
- a document repository

Every feature must reinforce the analyst-that-works-for-you identity. Anything that makes Atlas feel like "software with tabs" is off-strategy.

---

## 9. The evaluation question (tape this to the wall)

Before building anything, answer:

> **Does this make the core Research → Recommend → Pitch → CRM → Learn workflow significantly better?**

- **Yes** → it's V1.
- **No** → it's a future version, or it's noise. Ship it later or not at all.

This discipline is what keeps Atlas from becoming an impressive pile of features and turns it into the product a sales team relies on daily.
