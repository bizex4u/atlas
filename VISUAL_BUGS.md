# Atlas — Visual Bug Log

Every visual inconsistency found in the live walk. Small is fine — nothing skipped. Severity: 🔴 P0 · 🟠 P1 · 🟡 P2 · 🔵 P3.

| # | Sev | Screen | Bug | Fix |
|---|---|---|---|---|
| V1 | 🟠 | CRM, everywhere | `text-transform: capitalize` applied globally → `Https://Notion.Com`, mangled URLs/emails | Remove blanket capitalize; case only labels |
| V2 | 🟠 | Dashboard | Greeting "Good night 🌙" shown in the morning during "overnight briefing" | Fix time-of-day logic (IST) |
| V3 | 🟠 | Coverage Map | Floating panels overlap a small map; text ~10–11px, controls collide | Dock panels, full-canvas map |
| V4 | 🟡 | Dashboard | Two card radii in play — hero `rounded-3xl`, cards `rounded-2xl`, chips `rounded-xl`; inconsistent | Standardize: cards 12px, controls `--radius` |
| V5 | 🟡 | Global | Gradient hero (`gradient-primary`) is the only gradient in an otherwise flat UI — inconsistent with the clean card system | Decide: flat everywhere, or gradient as one deliberate accent |
| V6 | 🟡 | Opportunity cards | Score badge styles vary — filled purple circle (dashboard) vs green pill (mockup) vs gray; no single scale | One score-badge component, one color rule (confidence → color) |
| V7 | 🟡 | Global | Badge/chip inconsistency — likelihood pills, category text, signal chips all differ in padding/radius/color | One Badge + one Chip primitive |
| V8 | 🟡 | Dashboard | Long AI text overflows/truncates mid-word in cards at desktop width (right-clipped sentences) | Proper wrapping + max-width + fade, not hard clip |
| V9 | 🟡 | Loading | Spinner-only loads (no skeleton) cause layout jump when content lands | Skeletons matching final layout |
| V10 | 🟡 | Nav | 12-item sidebar with two ungrouped sections; active state OK but density high | Consolidate + group labels |
| V11 | 🔵 | Icons | Mixed icon metaphors (lucide) — Coverage Map vs Area Map use different map icons for the same concept | One icon per concept |
| V12 | 🔵 | Mobile | Bottom nav (5) diverges from desktop sidebar (12) — different IA per platform | Reconcile the two navs to one model |
| V13 | 🔵 | CRM | Row hover/affordance minimal; external-link icon tiny, low contrast | Larger target, clearer affordance |
| V14 | 🔵 | Dashboard | "refreshes ev…" text clipped in hero subline | Fix container width/wrapping |

Consistency debt summary: **no shared primitives** for Badge, Chip, Score, Card-radius, or Loading-skeleton — each screen re-implements them, which is why radii/colors/padding drift. The highest-leverage visual fix is extracting ~5 primitives and replacing ad-hoc markup.
