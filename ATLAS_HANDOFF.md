# ATLAS — Engineering Handoff

Read `ATLAS_V1_PRODUCT_SPEC.md` first — it is the product north star. This file is the *state of the world* so you can continue building without re-discovering anything.

---

## 0. CRITICAL: two repos, two stacks — decide canonical FIRST

There are two Atlas codebases. They are **different frameworks and do not mix.**

| Repo | Stack | Status |
|---|---|---|
| **bizex4u/github-import-hub** (private) | **Vite + TanStack Start** | ✅ **LIVE** at `https://github-import-hub-tau.vercel.app` (Vercel deploys its `main`). This is the real, feature-complete product. |
| **bizex4u/atlas** (public) | **Next.js** | A newer, partial rebuild. Also holds branch `import/vite-tanstack-build` = a single-commit copy of the Vite build. |

**The live, ~90%-complete product is the Vite/TanStack build on `github-import-hub`.** The Next.js `atlas` repo is a fresh start with far less in it.

**Recommendation:** consolidate on the **Vite/TanStack build**. It is live, far more complete, and everything below describes it. Do not rebuild it in Next.js — that throws away weeks of working product. If `bizex4u/atlas` must be the canonical repo, migrate the *Vite build* into it (it's already there as `import/vite-tanstack-build`) rather than porting features one-by-one to Next.js.

**Deploy reality:** live `main` on github-import-hub is **7 commits behind** branch `feature/homepage-mvp` (the active dev branch). Merge `feature/homepage-mvp → main` to ship the latest — but that branch also carries an in-progress `src/lib/qc.*` + `src/server/` module with a TypeScript error and a `@vercel/nft` build failure. **Exclude/fix that module before merging or the build breaks.**

---

## 1. Stack & rules (non-negotiable)

- Vite + TanStack Start + TanStack Router. Zustand stores with `localStorage` persist, mirrored to **Turso** (libSQL) via a passphrase-gated sync layer (`src/lib/sync.ts`, `src/components/AuthGate.tsx`).
- All server logic = `createServerFn` + **raw `fetch` to Groq** (`llama-3.3-70b-versatile`). **Do NOT add the Vercel AI SDK** or any new framework.
- **Server-fn return types must be JSON-serializable** — no `unknown`, `ArrayBuffer`, or `Record<string, unknown>`. Use concrete types. (This has bitten us repeatedly.)
- Every AI recommendation must expose **confidence · sources · freshness · missing data.**
- **Freeze list:** no new DB tables unless unavoidable, no new infra, no new external services, no new AI models, no UI redesign of existing workflow.
- Before committing: `git branch --show-current`, `npx tsc --noEmit` clean for touched files. Never commit `.env`, `.vercel/`, or the `src/lib/qc.*` / `src/server/` module.

---

## 2. What's built (Vite build — all working)

**Dashboard (`/`) = daily opportunity briefing** (the homepage IS the AI operating system)
- `dailyBriefing` server fn: pulls real news (Inc42, YourStory, ET BrandEquity, ET Retail, Google News RSS — `fetchTamNews`), filters to BIZEX4U TAM, feeds Groq → scored barter opportunities with signal breakdown, why-now, barter angle, est value, likelihood, "why BIZEX4U", inventory, **source links**. Cached per-day in localStorage, refreshes every 3rd day, rolling 7-day news window.
- Proactive analyst brief line ("I found N opportunities… want me to prepare outreach?"), NEW badges on first-seen brands, research feed rail, opportunity cards with expandable signal scoring, one-click Pitch Pack modal (`pitchPack` fn: exec summary, decision-makers, LinkedIn msg, email, follow-ups, call points, media mix), Add-to-pipeline.

**Brand Intelligence (`/research`)** — brand × city report
- `brandCityIntel` (current) → profile, live signals w/ sources, scored pincodes, interactive MapLibre map with zones + senior-planner OOH reasoning, campaign strategy, pitch, quick-commerce serviceability probe, Add-to-pipeline, **Push-to-CRM**, print. Card-first hero with confidence + sources.

**Research Orchestrator (`src/lib/research/`)** — the NEW evidence-first engine (built, NOT yet wired to UI)
- `types.ts` (Evidence, AnalystResult contract, ResearchReport), `evidence.ts` (deterministic collectors: news/funding/hiring, Google Places per city, Swiggy serviceability, expansion press — NO AI), `orchestrator.ts` (`runResearch` server fn: parallel evidence collection → ONE reasoning call → 8 analysts incl **BIZEX4U Fit**, each citing evidenceIds + listing missingData). Verified via direct test. **Next job: wire this into `/research`.**

**Market Intelligence (`/intel`)** — `marketIntel` fn: seasonal spend, active categories, hot prospects, pipeline gaps for a city.

**India Coverage (`/india`)** — ~100 cities (`src/lib/cities.ts`), live Swiggy serviceability probe (`checkServiceability`), AI city-ranking for a brand (`cityFitRank`), dark-store expansion watcher (`qcommExpansion` — Blinkit/Zepto/Instamart RSS).

**CRM (`/crm`)** — Twenty CRM integration (`src/lib/twenty.functions.ts`): `twentyStatus`, `twentySync` (companies/opps/people → Turso `twenty_records`), `twentyList`, `pushDealToTwenty`, `promoteOpportunity`. Env: `TWENTY_API_URL`, `TWENTY_API_KEY`. Twenty itself is a self-hosted Docker stack (deploy config in `~/Projects/twenty-crm/`, not yet hosted).

**Also:** Brand Pipeline kanban (`/brands`), Agencies CRM (`/customers`), Tasks, Warehouse, Area Map (`/map` — Places area analysis + POI scraper), AI Assistant (`/ai`). Cross-device sync + passphrase gate, PWA (installable), global ⌘K search, toast system, sync-status badge.

---

## 3. What's NOT built / the backlog (priority order)

1. **Design system** — biggest gap. Today every page hand-rolls Tailwind → no visual hierarchy. Build tokens (color/space/radius/shadow/type scales) + primitives (`Button`, `Card`, `Stat`, `Badge`, `ConfidenceBadge`, `SourceChip`, `PageHeader`, `EmptyState`, `Skeleton`) in `src/components/ui/`, then refactor dashboard + research + crm onto them as proof.
2. **Wire `runResearch` orchestrator into `/research`** — render the 8 analysts as report sections (verdict + confidence + findings + expandable detail + which evidence backed it + missingData) + an evidence-trace panel. Keep the map, pincodes, Add-to-pipeline, Push-to-CRM. Use `AnalysisProgress` for loading.
3. **Financial evidence + deterministic calc** — `collectFinancials` (legit free sources only, no scraping), `src/lib/research/calc.ts` (CAGR/YoY/ratios — AI never does arithmetic, only interprets).
4. **CRM hardening** — dedupe on push (don't create duplicate Twenty companies), two-way Atlas↔Twenty stage sync, push contacts/people.
5. **Learning loop (the moat)** — capture Recommended → Contacted → Meeting → Proposal → Won/Lost → Why per recommendation; feed outcomes back into briefing/city scoring; show "boosted because similar deals won". Store in existing Turso store, no new table if avoidable.
6. **Map intelligence layers (P3)** — heat zones, dark-store coverage, competitor markers, residential/corporate density on the maps.
7. **Guided flow (P5)** — make Research → Recommend → Pitch → CRM feel like ONE flow, not page-hopping.
8. **Twenty production deploy** — host at `crm.bizex4u.com` (config ready in `~/Projects/twenty-crm/DEPLOY.md`); set prod `TWENTY_API_URL`/`TWENTY_API_KEY` in Vercel (local key won't work on prod).

**Evaluation gate for every task:** *Does this make Research → Recommend → Pitch → CRM → Learn significantly better?* If no, it's not V1.

---

## 4. Security TODO (do soon)

The git history of `github-import-hub` contained a committed `.env` with live keys (since removed + gitignored; that's why GitHub Push Protection blocked pushing history to the public `atlas` repo). **Rotate:** Groq API key, Turso auth token, Google Places key, HuggingFace token, Twenty API key. The repo is private so exposure is limited, but rotate to be clean.

---

## 5. Env vars (set in Vercel for production)
`GROQ_API_KEY`, `GOOGLE_PLACES_API_KEY`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ATLAS_PASSPHRASE` (workspace unlock), and — once Twenty is hosted — `TWENTY_API_URL`, `TWENTY_API_KEY`.
