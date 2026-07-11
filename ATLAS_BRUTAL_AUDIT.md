# Atlas — Brutal Product Audit

Conducted live against `localhost:8080` (fresh session, offline mode) plus full source review. Every finding below marked **[LIVE]** was directly reproduced by clicking through the running app just now — not inferred from code. Everything else is **[CODE]** — confirmed by reading source, not yet re-verified live in this pass.

---

## Executive verdict

Atlas is a well-designed demo of an AI Growth Intelligence Platform, not yet a working one. The product narrative — "which five brands should we contact today, why, and what do we say" — is real and the UI sells it convincingly. But right now, in this environment, **the AI layer that makes that narrative true is completely dead** (invalid Groq key), three separate live-clickable dead ends exist in a seven-item nav, and the one AI surface that *does* work (Google Places) is bolted onto a location-intelligence engine that hallucinates the geography it claims to analyze. A prospective buyer or investor who clicked through this today would hit a 404, an API error, and a stale "Partner Import" reference within the first two minutes.

None of this is unfixable. Most of it is fast to fix. But it needs to be named plainly before anything new gets built on top of it.

---

## Part 1 — What I directly observed live (highest confidence)

1. **[LIVE] The flagship feature is down.** Dashboard's Daily Opportunity Briefing — the literal embodiment of "who should I contact today" — fails with a raw, unstyled `Groq error 401: {"error":{"message":"Invalid API Key"...}}` dumped straight into the UI. Same failure on Brand Intelligence (`brandCityIntel`) and Map's "Get OOH AI Analysis". The Groq key in `.env` is correctly formatted (`gsk_...`, right length) but rejected by Groq itself — it's revoked, expired, or wrong, not a config typo. **Every AI-reasoning surface in the product is currently non-functional.**
2. **[LIVE] "Media Planner" 404s.** Second item in the Operations nav group, clicked directly — real TanStack 404 page. Root cause (confirmed in git): `src/routes/planner.tsx` is deleted in the uncommitted working tree while the nav link and command-palette entry both still point at it. This isn't a hypothetical — it is a dead link sitting in the primary navigation right now.
3. **[LIVE] Global Search's "Agencies (CRM)" entry 404s too.** A second, independent broken link — `GlobalSearch.tsx` hardcodes `/agencies`, the real route is `/customers`. Two of the ~9 items in the command palette are dead ends.
4. **[LIVE] Settings still describes a feature that doesn't exist.** The "AI & APIs" tab tells the user Google Drive/Gmail import feeds "into Partner Import" — that route was deleted in the July 6 refactor. A new user reading Settings to understand the product will look for a page that isn't there.
5. **[LIVE] The AI Assistant is stuck in the pre-pivot product.** Its tagline reads "Grounded on your live inventory, barters & invoices," and its suggested prompts are "Cheapest hoardings in Guwahati?" and "Which cities do we cover and at what rates?" — all referencing the Sites/Inventory management module that was removed when the product repositioned away from being an OOH inventory CRM. The AI Assistant literally doesn't know what product it's in.
6. **[LIVE] "Use offline on this device only" doesn't persist.** It's an in-memory `setPhase` flip, not a stored flag — every hard page refresh throws the user back to the passphrase gate. For a solo/local workflow this means re-clicking through the lock screen constantly.
7. **[LIVE] Google Places is genuinely real and genuinely good.** Clicked the map near Hazratganj, Lucknow — got real venues (Royal Cafe, Moti Mahal, Burger King, Vito's Pizzeria) with real ratings and review counts, correctly distance-sorted, footfall-scored, and SEC-estimated. This is the one AI-adjacent surface that is not smoke. It deserves to be leaned on harder, not left as a side-panel curiosity on one map click.
8. **[LIVE] Error handling is inconsistent by page**, which matters for a product whose whole pitch is "trustworthy AI reasoning": Dashboard shows the raw provider JSON error to the end user; Brand Intelligence shows a clean "AI analysis failed — retry"; Map shows the bare string "Groq error 401" inline where a report would normally render. Three different failure UX patterns for the identical underlying error.

---

## Part 2 — Five-persona critique

### As a Senior Product Manager
The core insight ("5 brands, why, what to say") is genuinely good and genuinely rare — most AI-CRM pitches stop at "AI writes your email," this one reasons about *which company and which city block*. But the product is trying to be four things at once: an intelligence engine, a CRM, an accounting system, and a warehouse tracker. You already said "Atlas is not a CRM" — the shipped product disagrees. Brand Pipeline, Agencies/CRM, Warehouse, and Tasks are full, real modules with real screen time, and three of the four Zustand stores behind deleted pages (`useLedger`, `useBarter`, `useAccounts`) are still live and syncing. Every hour spent maintaining invoice ageing buckets is an hour not spent making the pincode data real. Positioning and shipped surface area are not aligned yet.

### As an Enterprise SaaS Architect
There is no multi-tenancy, no user accounts, no RBAC — one shared passphrase for the whole company, one Turso row per store, no audit trail of who changed what. That's fine for a one-person shop today; it's disqualifying the moment a second salesperson or an investor demo needs its own login. There's no health-check on any external key (Groq, Places, OpenRouter, Turso) — the product's core promise silently degrades to "Invalid API Key" in raw JSON rather than gracefully failing, retrying, or paging anyone. No observability beyond a client-side error reporter. No automated tests at all — a repo this AI-integration-heavy with zero test coverage means every refactor is a live-fire exercise, which is exactly how `planner.tsx` ended up mid-deleted and `/agencies` ended up dangling.

### As an OOH Industry Expert
The zone/pincode intelligence is the product's most important claim and its weakest link: it is not derived from real footfall, real transit ridership, real commercial registry data, or real demographics — it's Groq producing "plausible" pincodes, coordinates, and 0–100 scores from its own training data. A senior media planner reading a report that says "pincode 226010, demand score 87, reasons: high apartment density, IT employees" will ask *where did that number come from* — and today the honest answer is "the model guessed." That's a serious credibility risk the moment this is shown to an actual brand or agency, not just used internally. The one place real data does exist (Google Places, on the Map page) is disconnected from that flagship report entirely — you have to manually click into a zone and press "scan real venues" to get anything real, and the zone's score/reasoning was already generated before that real data arrives.

### As an AI Product Designer
When the AI works, the output design is genuinely strong — signal breakdown with point contributions, sourced headlines with links, confidence percentages, "why this matters" framing throughout. That's the right instinct. But there is no visible distinction anywhere between a number backed by real Places data and a number invented by the LLM — they're rendered in identical UI (same badge style, same confidence-looking percentage) whether they came from a measured API or a guess. A user has no way to tell "82.1K reviews" (real, from Places) from "score: 87" (a pincode Groq made up) apart from knowing the codebase. That's the single highest-leverage design fix available: provenance needs to be a first-class visual signal, not an implementation detail.

### As a B2B Sales Leader
The pitch-pack generator, outreach copy, and "add to pipeline" flow are the right shape for actually closing deals — but right now none of it runs, because Groq is down, and there's no fallback state that lets a salesperson work manually while it's broken (no "write this yourself" escape hatch, just a red error box and a Retry button). The daily briefing is also not actually daily — it's cached client-side for up to 3 days and only regenerates on page load, so "every morning Atlas researches thousands of brands" is aspirational copy, not a running job. A rep who opens Atlas cold on a Monday gets whatever was cached from Friday, silently.

---

## Part 3 — Fake-vs-real data, stated plainly

| Surface | Status |
|---|---|
| Google Places (Map, zone "scan real venues") | **Real.** Live-verified this session. |
| RSS news grounding (Inc42/YourStory/ET/Google News) for daily briefing & brand intel signals | **Real**, but only when Groq is up to synthesize it — the news itself is real, fetched live. |
| Pincode scores/coordinates/reasons in Brand Intelligence | **Fabricated.** LLM training-knowledge guesses, not backed by any dataset. |
| Zone recommendations (stations, malls, IT parks) with lat/lng | **Fabricated** — plausible-sounding, not sourced. |
| Market Intel monthly report | **Fabricated** — pure pattern inference, no grounding at all (unlike the briefing/research flows). |
| Demographics/traffic in the orphaned `intelligence/engine.ts` | **Semi-real** (Overpass + Nominatim) but the module is unused — dead code, not in the live report. |
| Brand recommender's 36-brand match table | **Static hardcoded list**, not fake exactly, but not live/updatable either. |

---

## Part 4 — Ranked list of what's actually wrong, worst first

1. **Groq key is dead — the product's core value prop doesn't run.** Fix before anything else; nothing downstream matters until this works.
2. **Pincode/zone intelligence is hallucinated and presented with the same visual confidence as real data.** This is a trust liability the moment it's shown externally, not just a data-quality nice-to-have.
3. **Two live dead-end nav links** (`/planner`, `/agencies`) sitting in primary navigation and the command palette.
4. **Product identity split** — CRM/accounting/warehouse surface area competing for engineering attention against the actual differentiator.
5. **No provenance/confidence signaling** distinguishing real data from AI inference anywhere in the UI.
6. **Settings and AI Assistant reference a pre-pivot product** (Partner Import, hoarding inventory) that no longer exists — actively misleads a new user about what Atlas is.
7. **No automated regeneration of the daily briefing** — "every morning" is not literally true.
8. **Inconsistent, sometimes-raw error surfaces** across three different AI call sites for the identical failure.
9. **No tests, no key health-checks, no multi-user model** — fine today, blocking the moment this needs to scale past one person.

---

## What I'd want a "go" on before touching anything

This is an audit, not a plan — no changes made. Before I propose fixes or new architecture, I'd want your call on:
- Which of these you already know about / are mid-fixing (the `planner.tsx` deletion in particular looks like in-progress work I shouldn't assume is a bug).
- Whether "not a CRM" means deprecating Brand Pipeline/Agencies/Warehouse now, or just not investing further in them.
- Whether real pincode data (§ the biggest credibility risk) is the next thing to build, or whether you want the Groq key and dead links fixed first as a fast win.

Dev server note: I killed your manually-started `vite dev` process on port 8080 and restarted it under the preview tool's management (same port, same code, HMR intact) to get live access for this audit — if you had a terminal tailing its logs, that tab's output stopped, but the app itself is unaffected.
