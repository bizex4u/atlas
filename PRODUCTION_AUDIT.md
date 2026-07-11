# Atlas — Production Readiness Audit

Brutal, screen-by-screen. Conducted live (desktop 1440 + mobile 380) on `feature/homepage-mvp` + full-session code knowledge. Goal: what stops Atlas from feeling like a world-class AI product.

Severity: 🔴 P0 (block production/demo) · 🟠 P1 (high usability) · 🟡 P2 (noticeable polish) · 🔵 P3 (nice-to-have).

---

## Cross-cutting (affects every screen)

### 🔴 A1 — Navigation is bloated and duplicated · UX/IA
Current: 12 desktop nav items across Dashboard, Research, Market Intelligence, Coverage Map, Campaigns, CRM, AI Assistant, Tasks, Agencies, Area Map, Warehouse, Settings.
Expected: ~6 items, each answering one question.
Why it's a problem: **three CRM-ish destinations** (Campaigns = local brand deals, CRM = Twenty sync, Agencies = old local CRM) and **two maps** (Coverage Map = `/india`, Area Map = `/map`). A user can't tell where a deal "lives."
Business impact: the product reads as an internal prototype, not a decided product. Salesperson hesitates.
Fix: collapse to Dashboard · Research · Coverage · CRM · Tasks · Settings. Retire Campaigns/Agencies/Warehouse into CRM or delete (see FEATURE_GAP). Merge the two maps.
Effort: M (nav + redirects) + the retirement decisions.

### 🔴 A2 — Two systems of record for the same data · Architecture
Current: brand deals + agencies + tasks live in local Zustand blob; CRM + QC live in Turso relational; opportunities now also push to Twenty. The dashboard's "tracked" marker is local while the real record is in Twenty.
Expected: one source of truth per SYSTEM_BOUNDARIES (Twenty owns CRM; Turso owns intelligence).
Why: data drifts; "is this deal in Twenty or just local?" is unanswerable in the UI.
Impact: trust erosion, the exact failure a CRM is supposed to prevent.
Fix: finish the migration — Campaigns/Agencies read from Twenty, not Zustand. Retire the blob store.
Effort: L.

### 🟠 A3 — Global `text-transform: capitalize` mangles data · Visual/Logic
Current: CRM shows `Https://Notion.Com`, `Https://Stripe.Com`. Capitalize is applied to URLs, emails, and proper strings indiscriminately.
Expected: display strings as stored.
Why: makes real data look broken; a URL that reads "Https://" signals low quality instantly.
Impact: undermines the "real data" credibility Atlas sells.
Fix: remove the blanket capitalize; apply case only to labels.
Effort: S.

### 🟠 A4 — Auth gate re-prompts on every refresh · UX
Current: "Use offline" is in-memory; a hard refresh drops back to the passphrase screen.
Expected: choice persists for the session/device.
Why: friction on the single most-repeated action (opening the app).
Impact: daily annoyance; feels unfinished.
Fix: persist the offline/unlock choice (localStorage flag).
Effort: S.

### 🟡 A5 — Long AI waits show only a spinner · UX/AI
Current: daily briefing + brand intel take ~15–30s with a bare spinner or "…" placeholders.
Expected: skeleton + streamed/staged progress ("Reading 35 headlines → scoring → ranking").
Why: 30s of spinner reads as "hung." The work is impressive — show it.
Impact: perceived slowness on the flagship surfaces.
Fix: skeletons + staged status lines (data already implies the stages).
Effort: M.

---

## Dashboard `/`

### 🔴 D1 — Homepage doesn't yet lead with "the one move" · UX
Current: gradient hero + proactive sentence + 4 stats, then an equal-weight list of 8 opportunity cards (rank-1 expanded).
Expected: the approved mockup — a single "Today's top move" hero with why-now + one-click Generate pitch → Create in CRM, then compact runners-up.
Why: the user still has to read a list to find the best action. The 30-second promise isn't met.
Impact: the core value ("what should I do today") is diluted.
Fix: apply the approved hero-first layout (mockup already signed off).
Effort: M. (The CRM-flow underneath is already done + verified.)

### 🟠 D2 — Greeting says "Good night" · Visual/Logic
Current: header reads "Good night, Yash 🌙" during a morning "overnight briefing."
Expected: match the actual IST time of day.
Why: immediately signals the time logic is off; tonal mismatch with "overnight briefing."
Impact: small, but it's the first line the user reads every day.
Fix: verify `getGreeting()` timezone; the briefing label and greeting should agree.
Effort: S.

### 🟡 D3 — Right-rail "research feed" competes with opportunities · IA
Current: a dense scrolling feed of raw signals sits beside the opportunities.
Expected: signals should ladder up into opportunities, not sit as a parallel raw list.
Why: two things asking for attention; the feed is "data" not "action."
Impact: splits focus on the one screen that should be singular.
Fix: demote feed to a collapsed "why Atlas picked these" or fold into the top-move card.
Effort: M.

---

## Research / Brand Intelligence `/research`

### 🟠 R1 — Empty state is a form, not a jumpstart · UX
Current: blank brand/city/objective form + example text.
Expected: one-click example ("Try Zepto × Lucknow"), recent searches, or the day's top brand pre-filled.
Why: cold-start friction; the example is text, not actionable.
Impact: fewer researches run = fewer pitches.
Fix: clickable example chips that populate + run.
Effort: S.

### 🔴 R2 — Pincode/zone intelligence is still AI-invented · AI/Logic
Current (from prior audit, unchanged here): pincode scores/coordinates are LLM-generated, rendered with the same confidence styling as real Google Places data.
Expected: real data (the QC engine + Places now exist) or explicit "AI-estimated" provenance marking.
Why: a media planner will not trust an unsourced "pincode 226010, score 87." This is the single biggest credibility risk when shown externally.
Impact: could poison a real brand pitch.
Fix: wire research pincodes to the QC engine / mark provenance + confidence distinctly.
Effort: L.

---

## CRM `/crm`

### 🔴 C1 — CRM shows Twenty's demo seed data · Product
Current: Companies list = Notion, Stripe, Figma, Airbnb, Anthropic (Twenty's out-of-box demo), not Bizex4u brands.
Expected: Bizex4u's actual brands/agencies (or an empty state inviting the first sync).
Why: a salesperson opening CRM sees irrelevant tech companies — reads as "not real / not mine."
Impact: destroys the "this is your workspace" feeling.
Fix: clear Twenty demo data; seed with real Bizex4u records or a proper empty state.
Effort: S (data) — but decide with the retirement of Campaigns/Agencies.

### 🟡 C2 — CRM is read-only mirror; no actions · UX
Current: lists synced records with an external-link icon; no create/edit/advance-stage.
Expected: at least "open in Twenty" clearly, and stage visible on opportunities.
Why: it's a dead-end viewer; the user must leave to act.
Impact: the "CRM fades into the background" goal isn't served — it's a parking lot.
Fix: surface opportunity stage + a clear deep-link; longer-term, inline actions.
Effort: M.

---

## Coverage Map `/india`

### 🟠 M1 — Panel overlaps a cramped map · Visual/UX
Current: the expansion-watch panel + search float over a small map; text tiny, layout tight.
Expected: clear map with a docked, scrollable side panel.
Why: cramped, hard to read, controls collide.
Impact: the "where should they advertise" question is answered on a screen that feels unfinished.
Fix: dock panels, give the map full canvas, responsive breakpoints.
Effort: M.

### 🔴 M2 — Coverage map doesn't use the QC engine · Product
Current: `/india` uses the live Swiggy probe + expansion RSS; the owned QC dataset (49 Lucknow dark stores, enriched, scored — built this session) is NOT surfaced here. `/qc-quality` isn't even in the nav.
Expected: coverage map consumes the QC engine (M3 milestone).
Why: the most defensible asset Atlas built is invisible to the user.
Impact: months of engine work delivers zero user value until connected.
Fix: render qc_locations + coverage intelligence on the map.
Effort: L.

---

## Area Map `/map`

### 🟡 AM1 — Duplicate of Coverage Map's purpose · IA
Current: a second map (Google Places area intelligence) separate from Coverage Map.
Expected: one map surface with layers (places / coverage / zones).
Why: two maps = user confusion about which to use.
Impact: nav bloat, split mental model.
Fix: merge into one map with a layer switcher.
Effort: M.

---

## Legacy pages — Campaigns `/brands`, Agencies `/customers`, Warehouse `/warehouse`

### 🟠 L1 — Superseded modules still in nav · Product
Current: Campaigns (local brand-deal kanban), Agencies (local CRM), Warehouse (barter stock) — all pre-date Twenty + the boundary decisions.
Expected: retired, merged into CRM, or explicitly kept with a clear reason.
Why: they duplicate Twenty (deals/companies) and add nav weight; Warehouse answers no current question.
Impact: prototype sprawl; unclear product surface.
Fix: decide per FEATURE_GAP — most should retire or fold into CRM.
Effort: M (with the nav consolidation).

---

## AI Assistant `/ai`, Market Intel `/intel`, Tasks `/tasks`, Settings `/settings`

### 🟡 X1 — AI Assistant grounding references retired modules · AI (from prior audit)
Suggested prompts referenced deleted inventory concepts; verify post-pivot grounding is current.
Fix: refresh grounding to Twenty + QC. Effort: S.

### 🟡 X2 — Market Intel is ungrounded AI · AI
`/intel` is pure pattern inference (no news grounding, unlike the briefing). Mark it as such or ground it. Effort: M.

### 🔵 X3 — Settings still describes removed integrations · Content
Stale "Partner Import" / HuggingFace copy. Fix: rewrite to what's wired. Effort: S.

---

## Production hygiene

- 🔴 P-1 — `main` build was broken (nitro-beta `nf3`/`@vercel/nft`); fixed on feature branches, not yet on main. Merge the toolchain fix before any deploy.
- 🟠 P-2 — `.vercel/output` tracked in git on main (untracked on QC branch). Untrack before it churns further.
- 🟡 P-3 — No error monitoring, no automated tests, no key health-checks (a dead Groq key surfaced as raw JSON to users earlier this session).
- 🟡 P-4 — Raw provider errors leak to UI in places (`Groq error 401 {...}`) — inconsistent error UX across pages.
