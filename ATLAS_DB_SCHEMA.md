# Atlas V2 — Final Database Design Pack (Turso/libSQL)

Status: **final design for approval — SQL migrations begin only after sign-off on this document.**
Supersedes the v1 draft. Incorporates all 17 review directives (versioned reports, signal provenance, normalized Places, enriched pincodes, reasoning/recommendation extraction, audit log, jobs, media inventory split, barter separation, vector reservation).

> **ARCHITECTURE FORK (9 Jul 2026, owner decision): Twenty CRM becomes the system of record for the CRM domain.**
> Domain C tables (`companies`, `agencies`, `contacts`, `opportunities`, `activities`, `tasks`, `notes`) will live as Twenty objects (standard + custom), not Atlas/Turso tables — migrations for Domain C are **on hold**. Atlas keeps and builds: Geo (A), Places (B), Media/OOH (D), Commerce (E), Intelligence (F), System (G), with Atlas→Twenty integration via Twenty's GraphQL/REST API (push promoted opportunities, read companies). Intelligence tables that referenced CRM rows (`research_reports.company_id`, `market_signals.company_id`, `opportunities.origin_report_id` linkage) will reference Twenty record ids as TEXT columns (`twenty_company_id`, etc.) instead of local FKs — exact mapping to be designed after the local Twenty spike proves out. Everything else in this pack stands.

---

## 0. Absolute design principles (directive #1)

1. **AI suggests; humans decide.** No code path may INSERT/UPDATE rows in CRM or Commerce tables from an AI output directly. Promotion is always an explicit user action, executed through a repository method that (a) writes the CRM row with `origin` + `origin_report_id`, (b) stamps `created_by` with the human actor, and (c) writes an `audit_log` row. The repository layer enforces this: intelligence repos have no imports from CRM repos' write paths.
2. **Machine output is immutable.** `research_reports.payload`, `report_zones`, `report_pincode_scores`, `ooh_recommendations`, `report_reasoning`, `market_signals`, `ai_generations` rows are never UPDATEd after insert (exception: `research_reports.status` transitions draft→current→superseded, and `market_signals.verification_status` — both are lifecycle metadata, not content). New analysis = new version rows.
3. **Provenance is never lost.** Every machine-written row traces to its `ai_generations` row (what model, when, cost) and, where applicable, its external source (URL, publisher, scrape time).
4. **`workspace_id` is NOT NULL with no DDL default** (directive #11). The value comes from session context in the repository base — never a literal `'default'` in application code. Current single workspace is seeded as a `settings` row and injected by middleware.
5. **Actor columns everywhere humans write** (directive #8): `created_by TEXT`, `updated_by TEXT` on all CRM/Commerce/Media tables. Today they hold the session label; post-auth they hold user ids without a schema change.

Legend used below: 🔒 = soft delete (`deleted_at`); ➕ = append-only (no UPDATE, no soft delete); every table implicitly has `id TEXT PK (UUIDv7)`, `created_at`, `updated_at` (append-only tables: `created_at` only) unless noted.

---

## 1. Table dictionary

### Domain A — Geo reference

**`cities`**
| col | type / constraint |
|---|---|
| name, state | TEXT NOT NULL · `UNIQUE(name, state)` |
| tier | INTEGER CHECK (tier IN (1,2,3)) |
| lat, lng | REAL |
| population | INTEGER |
Purpose: cities as entities, not strings. Anchor for pincodes, sites, reports, brand-fit scoring by tier.

**`pincodes`** (directive #5 — enriched)
| col | type / constraint |
|---|---|
| pincode | TEXT NOT NULL UNIQUE |
| city_id | TEXT NOT NULL → cities RESTRICT |
| area | TEXT |
| lat, lng | REAL |
| population, households | INTEGER |
| median_income | REAL |
| commercial_score, residential_score, office_score, student_score, footfall_score, quick_commerce_score | REAL (0–100, NULL = not yet computed) |
| source | TEXT CHECK IN ('census2011','osm','google_places','composite','estimated') |
| confidence | REAL (0–1) |
| last_updated | TEXT |
Purpose: ground truth that kills hallucinated pincode intelligence. **Score columns are computed by pipelines from census/OSM/Places data — never written by an LLM** (directive #5). `source='estimated'` is allowed only for bootstrap rows and must carry confidence ≤ 0.3; the refresh jobs replace them. AI reports *reference* pincodes; they do not populate them.

### Domain B — Google Places (directive #4 — normalized, reprocessable)

**`places`** ➕ (updatable: refresh overwrites volatile fields; identity fields stable)
| col | type / constraint |
|---|---|
| place_id | TEXT NOT NULL UNIQUE (Google's id) |
| name | TEXT NOT NULL |
| primary_type | TEXT |
| secondary_types | JSON |
| lat, lng | REAL NOT NULL |
| rating | REAL |
| user_ratings_total | INTEGER |
| price_level | INTEGER |
| opening_status | TEXT |
| pincode_id | TEXT NULL → pincodes SET NULL (resolved by geocode pipeline) |
| raw_json | JSON NOT NULL |
| first_seen_at, last_verified_at | TEXT |
Purpose: one row per real-world place, keyed by Google `place_id`. `raw_json` preserves the full API response so future re-processing (new scoring formulas, new fields) costs zero API calls. Feeds `pincodes.commercial_score` et al. via the refresh job.

**`place_scans`** ➕
| col | type / constraint |
|---|---|
| cell_key | TEXT NOT NULL UNIQUE (lat/lng rounded ~100m + radius + types-hash) |
| lat, lng, radius | REAL/INTEGER NOT NULL |
| place_ids | JSON (place_id array returned) |
| place_count | INTEGER |
| fetched_at, expires_at | TEXT |
Purpose: query-level dedupe — "have we already searched this circle recently?" Prevents paying twice for Hazratganj. Expired scans re-fetch and upsert `places`.

### Domain C — CRM (human-entered; 🔒 all, actor columns all)

**`companies`** 🔒
`name TEXT NOT NULL · kind CHECK IN ('brand','media_partner') · category · website · gstin · hq_city_id → cities SET NULL · notes · created_by/updated_by` · partial `UNIQUE(workspace_id, name, kind) WHERE deleted_at IS NULL`
Purpose: brands (barter targets) and media partners (site owners). The entity intelligence attaches to.

**`agencies`** 🔒 (kept separate — owner decision)
`name TEXT NOT NULL · contact_name · phone · email · gstin · city_id → cities SET NULL · stage CHECK IN ('new','contacted','qualified','won','lost') · source · notes · created_by/updated_by` · partial `UNIQUE(workspace_id, name) WHERE deleted_at IS NULL`
Purpose: ad agencies Bizex4u bills — distinct lifecycle (billing/ageing) from brands.

**`contacts`** 🔒
`company_id NOT NULL → companies RESTRICT · name NOT NULL · role · email · phone · linkedin_url · is_primary INTEGER DEFAULT 0 · created_by/updated_by`
Purpose: durable decision-maker records; pitch-pack "decision makers" land here on promotion instead of being thrown away.

**`opportunities`** 🔒
`company_id NOT NULL → companies RESTRICT · stage CHECK IN ('prospect','briefed','proposal_sent','negotiation','agreement','live','lost') · objective · target_audience · target_cities JSON · budget_total REAL · duration_months INTEGER · next_follow_up TEXT · origin CHECK IN ('daily_briefing','brand_city_report','market_intel','manual') · origin_report_id → research_reports SET NULL · est_value_band TEXT · likelihood TEXT · notes · created_by/updated_by`
Purpose: the pipeline. `origin_report_id` points at the **exact immutable report version** (directive #2) that spawned it — the conversion-proof loop.

**`activities`** ➕
`company_id NULL → companies · agency_id NULL → agencies · opportunity_id NULL → opportunities · contact_id NULL → contacts (all SET NULL) · type CHECK IN ('call','email','linkedin','meeting','whatsapp','stage_change','outreach_sent','note_added','system') · summary TEXT NOT NULL · payload JSON · occurred_at TEXT NOT NULL · actor TEXT`
Purpose: interaction timeline + system events. Enum per directive #8.

**`tasks`** 🔒
`title NOT NULL · due_date · priority CHECK IN ('low','med','high') · done_at TEXT NULL · company_id NULL / agency_id NULL / opportunity_id NULL (SET NULL) · notes · created_by/updated_by`

**`notes`** 🔒
`body NOT NULL · company_id / agency_id / opportunity_id / contact_id (all NULL, SET NULL) · pinned INTEGER DEFAULT 0 · created_by/updated_by`

### Domain D — Media / OOH (🔒 all except line items)

**`media_sites`** 🔒 — the physical structure (directive #13)
`code TEXT UNIQUE · name NOT NULL · city_id NOT NULL → cities RESTRICT · format TEXT · lat, lng REAL · partner_company_id NULL → companies SET NULL · notes · ai_tags JSON · ai_description TEXT · created_by/updated_by`
Purpose: the pole/wall/screen that exists in the world. **No status/rate here** — those belong to inventory periods.

**`media_inventory`** 🔒 — the sellable unit-period (directive #13; absorbs old bookings)
`site_id NOT NULL → media_sites RESTRICT · label TEXT (face/panel, e.g. "Face A") · start_date, end_date TEXT NOT NULL · rate REAL · status CHECK IN ('available','held','booked','blocked') · client_name TEXT · campaign_id NULL → campaigns SET NULL · hold_expiry TEXT · notes · created_by/updated_by`
Purpose: one physical site → many sellable periods/faces. Availability & conflict checks become indexed range queries. Legacy `atlas-bookings` rows migrate here as `held`/`booked` periods.

**`campaigns`** 🔒
`opportunity_id NOT NULL → opportunities RESTRICT · name · status CHECK IN ('draft','proposed','approved','live','completed','cancelled') · start_date, end_date · budget REAL · objective · created_by/updated_by`
Purpose: an executable media plan version under an opportunity. Distinct from the barter deal (directive #14): campaign = media side; barter deal = commercial exchange.

**`campaign_line_items`**
`campaign_id NOT NULL → campaigns CASCADE · media_type TEXT · city_id NULL → cities · site_id NULL → media_sites SET NULL · description · units INTEGER · rate_per_unit REAL · duration_months INTEGER · status CHECK IN ('proposed','approved','on_hold','rejected') · notes`
Purpose: plan rows. Cascade with parent campaign — meaningless without it.

**`media_assets`** 🔒
`kind CHECK IN ('site_photo','rate_card','proposal_pdf','creative','other') · site_id / campaign_id / company_id (NULL, SET NULL) · url TEXT · mime · size_bytes · ai_meta JSON · created_by`
Purpose: gets 20KB base64 photos out of hot JSON rows; landing zone for Drive/Gmail imports.

### Domain E — Commerce & barter (directive #14: five concepts, five tables, never merged)

**`barter_deals`** 🔒
`company_id NOT NULL → companies RESTRICT · opportunity_id NULL → opportunities SET NULL · campaign_id NULL → campaigns SET NULL · status CHECK IN ('active','closed') · start_date, end_date · products_summary TEXT · est_value REAL · notes · created_by/updated_by`
Purpose: the commercial exchange itself — media given vs goods received. Links (not merges) the campaign that delivers media and the stock movements that receive goods.

**`invoices`** 🔒
`number TEXT UNIQUE · type CHECK IN ('sales','purchase') · agency_id NULL → agencies SET NULL · party_name TEXT · gstin · date, due_date · same_state INTEGER · status CHECK IN ('Draft','Sent','Partial','Paid','Overdue') · lines JSON · notes · created_by/updated_by`
Purpose: money documents (GST). Lines stay JSON — a document within the invoice; no cross-invoice line queries planned.

**`invoice_payments`** ➕
`invoice_id NOT NULL → invoices RESTRICT · amount REAL NOT NULL · date TEXT NOT NULL · created_by`
Purpose: ageing/outstanding as SQL aggregates. RESTRICT: an invoice with payments cannot be hard-deleted.

**`warehouse_items`** 🔒
`sku TEXT UNIQUE · name NOT NULL · category · unit_value REAL · created_by/updated_by`

**`stock_movements`** ➕
`item_id NOT NULL → warehouse_items RESTRICT · barter_deal_id NULL → barter_deals SET NULL · qty INTEGER NOT NULL (+in/−out) · note · date TEXT NOT NULL · created_by`
Purpose: goods ledger; `barter_deal_id` ties received stock to the deal that produced it.

### Domain F — AI intelligence (machine-written; immutable; purple in ERD)

**`ai_generations`** ➕
`feature CHECK IN ('daily_briefing','brand_city_intel','pitch_pack','media_plan','area_analysis','signal_scan','chat','vision_parse','reasoning_regen') · provider · model · prompt_tokens, completion_tokens INTEGER · cost_estimate REAL · input_hash TEXT · status CHECK IN ('ok','error','rate_limited') · error_message · latency_ms INTEGER`
Purpose: server-verified cost/error/latency ledger. Every machine artifact FKs here.

**`research_reports`** — immutable + versioned (directive #2)
`kind CHECK IN ('daily_briefing','brand_city','market_intel','media_plan','pitch_pack') · company_id NULL → companies SET NULL · brand_name TEXT · city_id NULL → cities SET NULL · version INTEGER NOT NULL DEFAULT 1 · status CHECK IN ('draft','current','superseded') · confidence REAL · summary TEXT · payload JSON NOT NULL · generation_id NOT NULL → ai_generations RESTRICT · generated_by_model TEXT (denormalized for convenience) · generated_at TEXT`
Constraints: `UNIQUE(workspace_id, kind, company_id, brand_name, city_id, version)`; partial `UNIQUE(workspace_id, kind, company_id, brand_name, city_id) WHERE status='current'` — exactly one current version per subject.
Lifecycle: new run inserts `version = max+1, status='current'` and flips the previous current → `'superseded'` in the same transaction. **`payload` is never updated.** No soft delete — reports are superseded, not deleted.
Purpose: report history ("what did Atlas say about Zepto in May vs today"), stable targets for `opportunities.origin_report_id`, server-side shared briefing cache.

**`report_zones`** ➕ — `report_id NOT NULL → research_reports CASCADE · name · kind · lat, lng REAL · why_people TEXT · confidence REAL`
Purpose: geo-queryable zone rows → the interactive intelligence map. (Media recommendations extracted out — below.)

**`report_pincode_scores`** ➕ — `report_id NOT NULL → research_reports CASCADE · pincode_id NULL → pincodes SET NULL · pincode TEXT · area · lat, lng · score INTEGER · profile TEXT · confidence REAL`
Purpose: AI pincode claims joined to census ground truth. A NULL `pincode_id` on a claimed pincode is itself a hallucination signal.

**`ooh_recommendations`** ➕ (directive #7 — extracted from report JSON)
`report_id NOT NULL → research_reports CASCADE · zone_id NULL → report_zones CASCADE · media_type TEXT NOT NULL · reason TEXT · estimated_reach TEXT · estimated_frequency TEXT · estimated_cpm REAL · confidence REAL`
Purpose: recommendations as first-class queryable rows — "all DOOH recommendations in Lucknow above 70 confidence" across every report ever run. The unit of the Opportunity Engine.

**`report_reasoning`** ➕ (directive #6 — reasoning separated from data)
`report_id NOT NULL → research_reports CASCADE · target_kind CHECK IN ('report','zone','pincode_score','recommendation') · target_id TEXT NULL · reason TEXT NOT NULL · evidence JSON (signal ids, place ids, urls) · confidence REAL · generation_id → ai_generations RESTRICT`
Purpose: the "why" lives apart from the "what," so reasoning can be regenerated (better model, more signals) against the same immutable report data — a new `generation_id`, new reasoning rows, zero report rebuild. `evidence` makes every claim auditable back to signals/places.

**`market_signals`** ➕ (directive #3 — full provenance)
`company_id NULL → companies SET NULL · brand_name TEXT · signal_type CHECK IN ('funding','product_launch','expansion','hiring','campaign','retail','leadership','other') · title NOT NULL · summary · source TEXT (feed name) · source_url TEXT NOT NULL · publisher TEXT · published_at TEXT · scraped_at TEXT NOT NULL · confidence REAL · verification_status CHECK IN ('unverified','verified','disputed','stale') DEFAULT 'unverified' · impact INTEGER · report_id NULL → research_reports SET NULL` · `UNIQUE(source_url, brand_name)`
Purpose: compounding signal asset with unbroken provenance chain: publisher → URL → publish time → scrape time → confidence → human verification status. `verification_status` is the one mutable column (lifecycle metadata).

**`embeddings`** — **reserved, not built** (directive #12)
Planned shape: `entity_kind CHECK IN ('report','signal','company','place') · entity_id TEXT · model TEXT · vector F32_BLOB(dim) · created_at`, using Turso's native vector type + `vector_top_k`. Nothing in the current schema blocks it: all entities have stable UUID pks and text-complete content columns. No migration written until needed.

### Domain G — System

**`settings`** — `key TEXT · workspace_id · value JSON · updated_at · updated_by` · `PRIMARY KEY(workspace_id, key)`

**`audit_log`** ➕ (directive #9)
`table_name TEXT NOT NULL · record_id TEXT NOT NULL · action CHECK IN ('insert','update','delete','restore','promote') · actor TEXT NOT NULL · old_value JSON · new_value JSON · created_at`
Purpose: every important mutation (all CRM/Commerce/Media writes + report supersessions + AI→CRM promotions) writes a row. Written by the **repository base**, not DB triggers — triggers in SQLite can't see the acting user, and repo-level writes keep old/new values as clean JSON. `action='promote'` specifically marks AI-suggestion→CRM-record events (principle #1 made auditable).

**`jobs`** (directive #10)
`job_type CHECK IN ('daily_research','signal_refresh','places_refresh','pincode_scores_refresh','market_intel_refresh','scheduled_report','etl_backfill','cache_sweep') · status CHECK IN ('queued','running','succeeded','failed','cancelled') · payload JSON · scheduled_for TEXT · started_at, completed_at TEXT · error TEXT · retry_count INTEGER DEFAULT 0 · created_at, updated_at`
Purpose: durable job queue. Implementation later (Vercel cron → endpoint claims queued jobs); designed now so the daily briefing becomes genuinely daily instead of on-page-load.

**`schema_migrations`** — `version INTEGER PK · name TEXT · applied_at TEXT`

---

## 2. Relationship map (every FK + cascade rule)

Cascade policy: **CASCADE** only parent→child within one immutable intelligence artifact; **RESTRICT** where children are financial/ledger records or deletion would orphan human work; **SET NULL** for optional cross-domain provenance links so intelligence cleanup never blocks CRM operations (and vice versa).

| Child.column | → Parent | ON DELETE | Note |
|---|---|---|---|
| pincodes.city_id | cities | RESTRICT | can't delete a city with pincodes |
| places.pincode_id | pincodes | SET NULL | geocode link, optional |
| companies.hq_city_id | cities | SET NULL | |
| agencies.city_id | cities | SET NULL | |
| contacts.company_id | companies | RESTRICT | |
| opportunities.company_id | companies | RESTRICT | |
| opportunities.origin_report_id | research_reports | SET NULL | provenance survives as text via audit_log |
| activities.{company,agency,opportunity,contact}_id | respective | SET NULL | timeline outlives entity hard-deletes |
| tasks.{company,agency,opportunity}_id | respective | SET NULL | |
| notes.{company,agency,opportunity,contact}_id | respective | SET NULL | |
| media_sites.city_id | cities | RESTRICT | |
| media_sites.partner_company_id | companies | SET NULL | |
| media_inventory.site_id | media_sites | RESTRICT | periods die with explicit action, not site delete |
| media_inventory.campaign_id | campaigns | SET NULL | |
| campaigns.opportunity_id | opportunities | RESTRICT | |
| campaign_line_items.campaign_id | campaigns | CASCADE | plan rows meaningless without plan |
| campaign_line_items.{city,site}_id | cities / media_sites | SET NULL | |
| media_assets.{site,campaign,company}_id | respective | SET NULL | |
| barter_deals.company_id | companies | RESTRICT | |
| barter_deals.{opportunity,campaign}_id | respective | SET NULL | |
| invoices.agency_id | agencies | SET NULL | party_name text survives |
| invoice_payments.invoice_id | invoices | RESTRICT | money records block deletion |
| stock_movements.item_id | warehouse_items | RESTRICT | ledger integrity |
| stock_movements.barter_deal_id | barter_deals | SET NULL | |
| research_reports.company_id | companies | SET NULL | |
| research_reports.city_id | cities | SET NULL | |
| research_reports.generation_id | ai_generations | RESTRICT | provenance never orphaned |
| report_zones.report_id | research_reports | CASCADE | |
| report_pincode_scores.report_id | research_reports | CASCADE | |
| report_pincode_scores.pincode_id | pincodes | SET NULL | |
| ooh_recommendations.report_id | research_reports | CASCADE | |
| ooh_recommendations.zone_id | report_zones | CASCADE | |
| report_reasoning.report_id | research_reports | CASCADE | |
| report_reasoning.generation_id | ai_generations | RESTRICT | |
| market_signals.company_id | companies | SET NULL | |
| market_signals.report_id | research_reports | SET NULL | |

SQLite note: FK targets resolve lazily (at DML, not DDL), so migration file order isn't constrained by the two cross-domain references (opportunities↔research_reports) — but logical order below keeps dependencies readable anyway.

---

## 3. Index strategy (beyond PKs and the UNIQUEs above)

SQLite does **not** auto-index FK columns — every FK column above gets a plain index, named `idx_<table>_<col>`. Listed here are only the additional composite/partial indexes and their reason:

| Index | Serves |
|---|---|
| `opportunities(workspace_id, stage) WHERE deleted_at IS NULL` | pipeline board columns |
| `opportunities(workspace_id, next_follow_up) WHERE deleted_at IS NULL AND stage NOT IN ('live','lost')` | dashboard "follow-ups due" |
| `tasks(workspace_id, due_date) WHERE done_at IS NULL AND deleted_at IS NULL` | today's commitments |
| `activities(opportunity_id, occurred_at DESC)` | deal timeline |
| `activities(company_id, occurred_at DESC)` | company timeline |
| `research_reports(workspace_id, kind, status)` | resolve "current" per kind fast |
| `research_reports(workspace_id, kind, brand_name, city_id, version DESC)` | version history per subject |
| `market_signals(brand_name, published_at DESC)` | brand signal timeline |
| `market_signals(workspace_id, signal_type, published_at DESC)` | category feeds |
| `market_signals(verification_status) WHERE verification_status='unverified'` | human review queue |
| `report_zones(report_id)` + `report_zones(lat, lng)` | per-report render + map bbox queries |
| `report_pincode_scores(pincode_id)` | "all AI claims about this pincode" |
| `ooh_recommendations(media_type, confidence DESC)` | recommendation engine queries |
| `pincodes(city_id)` + per-score partial indexes deferred until query patterns exist | city rollups |
| `places(pincode_id)` · `places(primary_type)` · `places(lat, lng)` | density scoring, map |
| `place_scans(expires_at)` | cache sweep job |
| `media_inventory(site_id, start_date, end_date)` | availability/conflict range checks |
| `media_inventory(workspace_id, status) WHERE deleted_at IS NULL` | "what's available now" |
| `invoices(agency_id, status) WHERE deleted_at IS NULL` | ageing per agency |
| `invoice_payments(invoice_id)` | outstanding aggregates |
| `stock_movements(item_id, date)` | stock level & velocity |
| `jobs(status, scheduled_for) WHERE status='queued'` | job claim query |
| `audit_log(table_name, record_id, created_at DESC)` | record history lookup |
| `ai_generations(feature, created_at DESC)` | cost/error dashboards |

Geo bbox queries use the plain `(lat, lng)` composite (fine at this scale: thousands of rows). If zone/place volume grows past ~10⁵, upgrade path is an R*Tree virtual table — additive, no schema change.

---

## 4. Query strategy (screen/job → query shape → index)

| Surface | Query shape | Index used |
|---|---|---|
| Dashboard briefing load | `research_reports WHERE kind='daily_briefing' AND status='current'` (1 row) then children by report_id | `(kind,status)` partial-unique |
| Briefing NEW-badge diff | previous = `version = current.version - 1` same subject | version-history composite |
| Pipeline board | `opportunities WHERE workspace_id=? AND deleted_at IS NULL` grouped client-side by stage (7 groups, one query) | `(workspace_id, stage)` |
| Follow-ups due | range scan `next_follow_up <= today` | partial follow-up index |
| Brand Intelligence page | insert new version (txn: supersede old + insert new + children); read = current + children | partial-unique current |
| Intelligence map | `report_zones WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?` + join reports for status='current' + `ooh_recommendations` by zone_id | `(lat,lng)` + FK indexes |
| "Why this zone" click | `report_reasoning WHERE target_kind='zone' AND target_id=?` + `evidence` → signals/places by id | FK index + PK lookups |
| Signal review queue | `market_signals WHERE verification_status='unverified' ORDER BY published_at DESC` | partial unverified index |
| Places lookup before API call | `place_scans WHERE cell_key=? AND expires_at > now` | UNIQUE cell_key |
| Pincode score refresh job | `places WHERE pincode_id=?` aggregates → UPDATE pincodes scores + last_updated + source='composite' | `places(pincode_id)` |
| Agency detail ageing | `SELECT i.*, COALESCE(SUM(p.amount),0) ... GROUP BY i.id` | `(agency_id,status)` + `invoice_payments(invoice_id)` |
| Site availability | overlap check: `media_inventory WHERE site_id=? AND start_date<=? AND end_date>=? AND status IN ('held','booked')` | `(site_id,start_date,end_date)` |
| Job runner tick | `jobs WHERE status='queued' AND scheduled_for<=now LIMIT 1` then claim via `UPDATE ... WHERE id=? AND status='queued'` (optimistic) | partial queued index |
| Record audit trail | `audit_log WHERE table_name=? AND record_id=? ORDER BY created_at DESC` | composite |
| AI cost dashboard | `ai_generations WHERE created_at >= ? GROUP BY feature` | `(feature, created_at)` |

Write-path rule: report generation is **one transaction** — insert `ai_generations` → insert `research_reports(version=n, status='current')` → flip previous to `superseded` → bulk-insert children (zones, scores, recommendations, reasoning) → optionally insert `market_signals` (ignore-on-conflict for dedupe). Either the whole version exists or none of it.

---

## 5. Migration sequence

Files (each transactional, recorded in `schema_migrations`; indexes live in the same file as their tables):

```
001_system.sql         schema_migrations, settings, jobs, audit_log
002_geo.sql            cities, pincodes
003_places.sql         places, place_scans
004_crm.sql            companies, agencies, contacts, opportunities, activities, tasks, notes
005_media.sql          media_sites, media_inventory, campaigns, campaign_line_items, media_assets
006_commerce.sql       barter_deals, invoices, invoice_payments, warehouse_items, stock_movements
007_intelligence.sql   ai_generations, research_reports, report_zones, report_pincode_scores,
                       ooh_recommendations, report_reasoning, market_signals
```

Then, per the approved strategy (module-by-module, blob retained, nothing destructive):

**ETL backfill** (`jobs.job_type='etl_backfill'`, idempotent upserts, per-table source-vs-inserted counts, unmatched-string report for city/partner resolution):
`atlas-crm`→agencies · `atlas-tasks`→tasks · `atlas-brand-deals`→companies+opportunities+campaigns+line_items · `atlas-inventory`→media_sites+media_assets(+partner companies) · `atlas-bookings`→**media_inventory** (held/booked periods) · `atlas-warehouse`→warehouse_items+stock_movements · `atlas-accounts`→invoices+payments · `atlas-barter`→barter_deals · `atlas-settings`→settings · `atlas-credits`→ai_generations (best-effort) · `atlas-ledger`→archive only.

**Cutover order** (each step shippable/revertible by re-adding the blob key to `SYNCED`):
settings → tasks → agencies+invoices → brand deals (companies/opportunities/campaigns) → media (sites/inventory/warehouse/barter) → intelligence tables (new writes only — no legacy read path exists).

**Retire:** interceptor sync removed, blob table renamed `store_archive_v1`, kept forever.

---

## 6. Open judgment calls made (flag if you disagree)

1. **Places normalized into two tables** (`places` + `place_scans`) rather than one richer cache — per-place rows keyed by `place_id` are what enables reprocessing and pincode scoring; scan rows are what prevents duplicate API spend. Directive #4 asked for the former; the latter preserves the original cache purpose.
2. **`site_bookings` dissolved into `media_inventory`** — a booking is an inventory period with status `held`/`booked` (directive #13's model). One table, no duplicate date-range logic.
3. **Audit written by repository base, not SQLite triggers** — triggers can't know the human actor and would audit ETL noise; repo-level writes capture actor + clean old/new JSON. Tradeoff: raw SQL bypassing repos isn't audited (accepted — nothing bypasses repos by design).
4. **`report_zones.media` array removed** — media recommendations now live exclusively in `ooh_recommendations` (directive #7); zones carry geography + audience only. No duplicated truth.
5. **Report supersession is an UPDATE of `status` only** — full immutability of everything else, one-current-version enforced by partial unique index.

Approve this pack → I write `001_system.sql` through `007_intelligence.sql`, the migration runner, and the repository base next. No SQL before your go.
