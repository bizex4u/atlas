# Atlas V1 — Product Spec (North Star)

Atlas is the AI operating system for **BIZEX4U**, an Indian OOH media-barter agency
that trades advertising inventory for brands' product inventory.

## Core workflow

Every feature must strengthen this loop, or it is out of scope:

```
Research → Recommend → Pitch → CRM → Learn
```

| Stage | Job |
|-------|-----|
| **Research** | Collect evidence about a market, location, brand, or site before anyone opines. |
| **Recommend** | Rank options with confidence, sources, freshness, and missing-data gaps. |
| **Pitch** | Turn a recommendation into a barter-aware offer the team can send. |
| **CRM** | Track accounts, deals, and follow-ups (inventory + barter + receivables). |
| **Learn** | Feed outcomes back so the next Research pass is sharper. |

## Evidence-first rule

Every AI recommendation **must** expose:

1. **confidence** — 0–1 reliability of the claim given available evidence
2. **sources** — concrete evidence items (id + origin + summary)
3. **freshness** — when the underlying evidence was collected (ISO timestamps)
4. **missingData** — what would raise confidence if supplied

No black-box scores. No “trust me” recommendations.

## Stack (this repo)

- Next.js App Router + React + Zustand (localStorage persist)
- Tailwind + MapLibre
- Groq `llama-3.3-70b-versatile` via raw `fetch` in API routes
- Spatial / market analysis in `lib/intelligence/`
- Evidence-first research in `lib/research/`

## Freeze list

- No new DB tables unless absolutely necessary
- No new infra, external services, or AI models
- Do not redesign the existing product workflow
- Do not introduce the Vercel AI SDK or other AI frameworks
- Server return types must be JSON-serializable (concrete types only)

## Deploy

- Vercel builds from `main`
- Feature work lands via PRs; do not push speculative infra
