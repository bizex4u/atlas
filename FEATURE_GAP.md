# Atlas — Feature Gap Analysis

Completeness of every module. % = how much of the intended value is actually delivered to a user (not lines of code). Priority reflects value × how blocked it is.

| Feature | Current % | Missing parts | Priority | Dependencies | Suggested MVP |
|---|---|---|---|---|---|
| Daily Briefing / Dashboard | 75% | Hero-first "top move" layout (approved, not applied); skeletons; greeting bug | P0 | briefing (done) | Apply mockup layout over existing verified flow |
| CRM ↔ Twenty integration | 70% | Shows demo data not Bizex4u; read-only (no actions); "tracked" state is local not from Twenty | P0 | Twenty (up) | Real data + stage visible + clear deep-link |
| Opportunity → Twenty promotion | 90% | Woven into pitch flow ✓, verified live ✓; missing: in-pitch "Create in CRM?" prompt + dedupe against existing Twenty opps | P1 | promoteOpportunity (done) | Add the post-pitch prompt + dedupe |
| Market Intelligence (brand × city) | 65% | Pincode data AI-invented (not real); readability weak; not connected to QC/Places for pincodes | P0 | QC engine, Places | Ground pincodes in real data or mark provenance |
| Coverage Map (`/india`) | 55% | Doesn't consume QC engine; cramped layout; Swiggy-only live data | P1 | QC engine (done) | Render qc_locations + coverage on the map |
| QC Intelligence Engine | 80% (backend) / 0% (surfaced) | Not in nav; no user-facing screen beyond `/qc-quality` (internal); OSM fusion + multi-city pending | P1 | migrations (done) | Surface coverage/opportunity to the map |
| Google Places | 90% | Works (discovery + enrichment); minor: no shared client, quota not visualized | P2 | — | Consolidate into one client |
| OOH Recommendations | 40% | Generated inside reports but not extracted to a browsable, cross-report surface | P2 | report_zones/ooh_recommendations tables designed | Recommendation feed per city |
| Twenty CRM (as SoR) | 60% | Only push + read-cache; no webhooks back; no custom OOH objects; demo data present | P1 | Twenty app/custom objects | Webhook stage-change → Atlas; clear demo data |
| Campaign Planner | 50% | Exists (`mediaPlan`) but disconnected from opportunities/Twenty | P2 | — | Link plan → opportunity |
| Media Planner | 40% | Route deleted earlier / partially restored; unclear status | P2 | — | Decide keep vs delete |
| Signals Engine | 70% | RSS + expansion watch work; not persisted as `market_signals` (designed, not built); no dedupe across runs | P1 | market_signals table | Persist + dedupe signals |
| AI Assistant | 60% | Grounding references retired modules; no memory across sessions | P2 | — | Refresh grounding to Twenty+QC |
| Settings | 55% | Stale integration copy (Partner Import/HF); no key health-check | P2 | — | Rewrite copy + status checks |
| Authentication | 30% | Single shared passphrase; no accounts/RBAC; re-prompts on refresh | P1 | — | Persist choice now; real auth later |
| Notifications | 10% | Bell icon present, no system behind it | P3 | jobs | Follow-up + new-opportunity alerts |
| Jobs / Scheduler | 50% (built) / 0% (running) | Scheduler module built; cron HTTP endpoint not wired; nothing runs | P2 | jobs table (done) | Wire `/api/cron` after multi-city validated |
| Legacy: Campaigns/Agencies/Warehouse | — | Superseded by Twenty; duplicate local stores | P1 (retire) | — | Retire or fold into CRM |

## Dead / duplicate surfaces to resolve
- **Campaigns (`/brands`)** — local brand-deal kanban, now duplicated by Twenty opportunities. Retire or make it a Twenty view.
- **Agencies (`/customers`)** — local CRM, duplicated by Twenty companies. Retire or fold.
- **Warehouse (`/warehouse`)** — barter stock; answers no current top-priority question. Park.
- **Area Map (`/map`) vs Coverage Map (`/india`)** — two maps, merge.
- **`/qc-quality`** — internal DQ dashboard, fine as an ops page but keep out of the salesperson's nav.

## The one-sentence gap
The backend (QC engine, Twenty sync, promotion, intelligence) is ~75% built and largely verified; the **user-facing delivery of it is ~40%** — the value exists in Turso and Twenty but hasn't surfaced into screens a salesperson uses. Close that gap before building more backend.
