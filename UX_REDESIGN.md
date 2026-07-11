# Atlas — UX Redesign

Every improvement, organized by the question each page must answer. Rule: if a page answers no clear question, delete it; if it answers several, split it.

## The page → question test

| Page | Question it must answer | Verdict |
|---|---|---|
| Dashboard `/` | What should I do today? | Keep — redesign to lead with one move |
| Research `/research` | Why should this brand advertise, and where? | Keep — ground pincodes, add jumpstart |
| Coverage `/india` | Where should they advertise? | Keep — must consume QC engine, merge with Area Map |
| CRM `/crm` | What happened after we pitched? | Keep — real data, show stage, one deep-link |
| Tasks `/tasks` | What must I not forget today? | Keep — fold into dashboard's "before you pitch" |
| Market Intel `/intel` | Which category to chase this month? | Merge into Research or Dashboard |
| Campaigns `/brands` | (duplicate of CRM opportunities) | Retire / make a Twenty view |
| Agencies `/customers` | (duplicate of CRM companies) | Retire / fold into CRM |
| Area Map `/map` | (duplicate of Coverage) | Merge into Coverage |
| Warehouse `/warehouse` | Answers no current priority question | Park |
| AI Assistant `/ai` | Ask anything about my data | Keep — refresh grounding |
| QC Quality `/qc-quality` | Is the data trustworthy? (ops) | Keep, but out of salesperson nav |
| Settings `/settings` | Configure Atlas | Keep — rewrite stale copy |

Target nav: **Dashboard · Research · Coverage · CRM · Tasks · Settings** (6, down from 12).

## Redesign moves (highest leverage first)

1. **Homepage = one move.** Apply the approved hero-first mockup: "Today's top move" with why-now, signals, est. barter, recommended campaign, and the `Generate pitch → Create in CRM?` chain. Runners-up compact below. Right rail = today's commitments only. The salesperson should know their #1 action in <10s.

2. **Weave CRM creation into the pitch, not a button.** (Underlying flow done + verified.) After `Generate pitch`, Atlas asks "Create this opportunity in CRM?" → one click → Twenty. The salesperson never opens Twenty. CRM fades to background.

3. **Provenance as a first-class visual.** Every number gets a source marker: real (Google Places / census / verified) vs AI-estimated. One badge system. This is the trust differentiator and directly fixes the "pincode is invented" credibility risk.

4. **Progressive disclosure on AI output.** Lead with the recommendation + confidence; tuck the evidence/signal-breakdown behind a "why" expander. Today everything is shown at once (dense); Perplexity-style: answer first, sources on demand.

5. **Staged loading, not spinners.** Show the pipeline working ("Reading 35 headlines → scoring 12 brands → ranking"). Turns a 30s wait into a demonstration of intelligence.

6. **One map, layered.** Merge Area + Coverage into a single map with a layer switcher (Places · QC coverage · zones · competitors). Clicking any marker answers "why advertise here?" with reasoning + confidence.

7. **Onboarding + jumpstart.** First run: a 3-step "here's your morning" tour. Empty states are invitations with one-click examples ("Try Zepto × Lucknow"), never blank forms.

8. **Keyboard-first.** ⌘K exists; add: `g d/r/c` to navigate, `p` to pitch the top move, `/` to search. Linear-grade speed for a daily-use tool.

9. **Consistent primitives.** Extract Badge, Chip, Score, Card, Skeleton. Kills the radius/color/padding drift (see VISUAL_BUGS) and makes every future screen consistent by default.

10. **Error UX with dignity.** Never show raw provider JSON. "Couldn't reach the AI — retry" + a quiet health indicator. A dead key should degrade gracefully, not dump a 401 body.

## The feeling to aim for
Perplexity's answer-first clarity + Linear's speed + Stripe's trustworthy density + Bloomberg's information confidence — minus Bloomberg's clutter. Atlas should feel like an AI employee who already did the work and is handing you the one thing to do next.
