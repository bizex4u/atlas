# Atlas — Production Roadmap

Every issue from the audit, grouped for sprint-by-sprint execution. Severity: 🔴 P0 (block production/demo) · 🟠 P1 (important) · 🟡 P2 (future polish) · 🔵 P3 (nice-to-have).

The through-line: **the backend is ~75% done; the user-facing delivery is ~40%.** P0/P1 close that gap and fix trust-breakers. Do not build new backend until P0 is clear.

---

## 🔴 P0 — must fix before any production or external demo

| ID | Item | Why it blocks | Effort |
|---|---|---|---|
| A1 | Consolidate nav to 6 items; kill CRM/map duplication | Product reads as prototype; user can't tell where data lives | M |
| A2 | One source of truth — finish blob→Twenty/Turso migration | Data drift kills CRM trust | L |
| D1 | Apply hero-first homepage (approved mockup) | The core "what do I do today" promise unmet | M |
| C1 | Clear Twenty demo data; show real Bizex4u records | "Notion/Stripe" in CRM reads as fake/not-mine | S |
| R2 | Fix invented pincode data — ground in real data or mark provenance | A media planner won't trust unsourced scores; poisons real pitches | L |
| M2 | Connect Coverage Map to the QC engine | The most defensible asset is invisible | L |
| P-1 | Merge toolchain build fix to main | main can't build/deploy | S |

## 🟠 P1 — important usability, next

| ID | Item | Effort |
|---|---|---|
| A3 | Remove global `capitalize` (mangled URLs) | S |
| A4 | Persist offline/unlock choice (stop re-prompting) | S |
| L1 | Retire/fold Campaigns, Agencies, Warehouse | M |
| C2 | CRM: show opportunity stage + clear deep-link | M |
| M1 | Coverage map layout (dock panels, full canvas) | M |
| AM1 | Merge Area Map + Coverage Map into one layered map | M |
| D2 | Fix greeting time-of-day logic | S |
| R1 | Research jumpstart (clickable example chips) | S |
| Signals | Persist `market_signals` + dedupe across runs | M |
| Promotion | In-pitch "Create in CRM?" prompt + dedupe vs existing Twenty opps | S |
| Auth | Persist session; plan real accounts/RBAC | M |
| P-2 | Untrack `.vercel/output` on main | S |

## 🟡 P2 — polish that noticeably raises quality

| ID | Item | Effort |
|---|---|---|
| A5 | Staged loading / skeletons on AI surfaces | M |
| D3 | Fold right-rail feed into "why picked" | M |
| Primitives | Extract Badge/Chip/Score/Card/Skeleton (kills visual drift) | M |
| Provenance | First-class real-vs-AI-estimated badges everywhere | M |
| X2 | Ground or clearly label Market Intel | M |
| Places | Consolidate 4 Places call sites into one client | M |
| OOH | Browsable cross-report OOH recommendation feed | M |
| Jobs | Wire cron endpoint after multi-city validated | M |
| P-4 | Consistent, dignified error UX (no raw JSON) | S |

## 🔵 P3 — nice-to-have

| ID | Item | Effort |
|---|---|---|
| Keyboard | `g d/r/c`, `p` to pitch, `/` search | S |
| Onboarding | First-run 3-step tour | M |
| Notifications | Follow-up + new-opportunity alerts | M |
| X3 | Rewrite stale Settings copy | S |
| V11–V14 | Icon/mobile/CRM-row visual nits | S |
| P-3 | Error monitoring + tests + key health-checks | M |

---

## Sprint plan (owner-aligned, 5 sprints)

Rule: **no new features until all P0 + P1 are resolved.** Stop adding surface area; make what exists feel connected, trustworthy, effortless.

### Sprint 1 — Trust and identity
Make Atlas feel real, owned, and singular before anything else.
- Replace Twenty demo data (Notion/Stripe/Figma/Anthropic) with **real Bizex4u seed brands**: Zebronics, boAt, Noise, Nureca, Portronics, Liberty, GIVA. (C1)
- Consolidate nav to **Dashboard · Research · Coverage · Campaigns · CRM · Settings**; everything else contextual. Hide that Twenty exists. (A1, A2 surface)
- Fix `text-transform: capitalize` mangling URLs. (V1 — "fix immediately")
- Fix greeting time-of-day logic. (V2)
- Persist offline/unlock choice. (A4)
- Merge toolchain build fix to main; untrack `.vercel/output`. (P-1, P-2)

### Sprint 2 — Dashboard and research UX
The two daily surfaces answer their one question, beautifully.
- Homepage hero = one move (approved mockup): "Today's AI brief · 8 opportunities · highest value ₹2.8Cr · highest confidence 96% · recommended first action → Zepto/Lucknow → Generate pitch". (D1)
- Add a **QC visibility card** to the homepage: "Quick-commerce intelligence · 47 locations · 21 pincodes · 4 platforms · View coverage". Surfaces the hidden engine. (M2 entry)
- Research → cards, not paragraphs (Why now ✓chips, Confidence %, etc). (R1 + readability)
- Surface AI reasoning consistently: Why · Evidence · Confidence · Sources · Updated. (provenance)
- Staged loading ("Checking news → hiring → Google Places → building recommendation"), not a spinner. (A5)
- Opportunity score hierarchy — the top score dominates visually (Linear-style). (D1)

### Sprint 3 — Coverage map and QC engine
The biggest technical asset becomes visible and useful.
- Coverage Map consumes the QC engine (qc_locations + coverage). (M2)
- Merge Area Map + Coverage into one layered map (Places · QC · zones). (AM1, M1)
- Clicking a marker answers "why advertise here?" with reasoning + confidence.

### Sprint 4 — CRM workflow and campaign planning
CRM fades into the background; the loop closes.
- CRM shows real data, opportunity stage, one clean deep-link. (C1, C2)
- In-pitch "Create this opportunity in CRM?" prompt + dedupe vs existing Twenty opps. (Promotion)
- **Feedback loop** — Atlas asks: contacted? meeting booked? proposal sent? won? lost? — writing back to Twenty stage + Atlas provenance. This is the learning loop that improves recommendations over time. (NEW P1)
- Retire/fold Campaigns, Agencies, Warehouse. (L1, A2)

### Sprint 5 — Polish, accessibility, responsiveness, performance
- Extract shared primitives: Badge · Chip · Score · Card · Skeleton (kills radius/color/spacing/shadow drift). (Primitives)
- First-class real-vs-AI-estimated **provenance badges** everywhere. (R2 finish)
- Branded empty states with a clear next action on every screen.
- Single primary scroll area (kill nested scrolling); consistent spacing/radius/shadows.
- Keyboard shortcuts, dignified error UX (no raw JSON), accessibility pass, mobile reconcile.

## New this round (owner additions, folded into the sprints above)
- 🟠 **Feedback loop / learning loop** — contacted/meeting/proposal/won/lost → Twenty stage + Atlas provenance. Was missing entirely; it's what turns Atlas from static recommender into one that improves. (Sprint 4)
- 🟠 **Provenance on every recommendation** — Places / OSM / News / AI-inference source marker. (Sprints 2 + 5)
- 🟡 **Branded empty states** everywhere. (Sprint 5)

## The one decision that unblocks the most
Resolve **nav + source-of-truth + legacy retirement together** (Sprint 1 surface + Sprint 4 depth). Same question — "what is Atlas's real surface now that Twenty owns CRM and the QC engine owns coverage?" — collapses ~6 issues at once.
