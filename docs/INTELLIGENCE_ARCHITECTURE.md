# Atlas — Spatial Intelligence Architecture

## Overview

The Intelligence layer (`lib/intelligence/`) is a pure TypeScript library with no framework
dependencies. It transforms raw dealer location data into an **Attention Index** — a
weighted, explainable score that quantifies market opportunity at each site.

Every engine is independently swappable: placeholder implementations ship with deterministic
output so the platform works immediately; production implementations connect to real data
sources without changing any business logic or UI code.

---

## Engine Responsibilities

| Engine | File | Responsibility |
|--------|------|---------------|
| **SpatialIndex** | `SpatialIndex.ts` | Haversine distance, bounding-box queries, radius filtering, nearest-neighbour search. Shared utility with no business logic. |
| **PopulationEngine** | `PopulationEngine.ts` | Population density and demographics for a pincode. Drives the baseline "how many people are here" signal. |
| **PincodeEngine** | `PincodeEngine.ts` | Zone classification (metro / urban / semi-urban / rural) and geographic context (state, district) from a 6-digit Indian pincode. |
| **POIEngine** | `POIEngine.ts` | Points of Interest within a radius — malls, markets, transport nodes, hospitals, schools. Drives footfall-magnet proximity scoring. |
| **CatchmentEngine** | `CatchmentEngine.ts` | Estimates total reachable population and commercial density within a configurable radius (default 2 km). |
| **RoadNetworkEngine** | `RoadNetworkEngine.ts` | Road class availability, highway proximity, and multi-modal access score. |
| **CompetitionEngine** | `CompetitionEngine.ts` | Competitor presence within 5 km. Score is **inverted** — low saturation = high opportunity. |
| **AttentionEngine** | `AttentionEngine.ts` | Orchestrator. Runs all six engines concurrently, normalises weights, and produces the final `AttentionResult`. |

---

## Data Flow

```
AttentionInput
  { storeName, city, pincode, lngLat? }
          │
          ▼
  ┌───────────────────────────────────────────────────────────┐
  │                    AttentionEngine                        │
  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │
  │  │ Population │  │  Pincode   │  │        POI         │  │
  │  │  Engine    │  │  Engine    │  │       Engine       │  │
  │  │  w = 0.20  │  │  w = 0.10  │  │      w = 0.20      │  │
  │  └─────┬──────┘  └─────┬──────┘  └────────┬───────────┘  │
  │        │               │                   │              │
  │  ┌─────▼──────┐  ┌─────▼──────┐  ┌────────▼───────────┐  │
  │  │ Catchment  │  │   Road     │  │    Competition     │  │
  │  │  Engine    │  │  Network   │  │      Engine        │  │
  │  │  w = 0.15  │  │  w = 0.15  │  │      w = 0.20      │  │
  │  └─────┬──────┘  └─────┬──────┘  └────────┬───────────┘  │
  │        └───────────────┴───────────────────┘              │
  │                         │                                 │
  │              weighted_sum(signal.score × signal.weight)   │
  │              ───────────────────────────────────────────  │
  │                     Σ(signal.weight)                      │
  └───────────────────────────────────────────────────────────┘
          │
          ▼
  AttentionResult
  { compositeScore, tier, weightedConfidence, signals[], computedAt }
```

Each engine call is independent — all six run concurrently via `Promise.all`.

---

## Engine Dependencies

```
SpatialIndex          ← no dependencies (pure math)
     │
     ├── PopulationEngine  (SpatialIndex for deterministicInt)
     ├── PincodeEngine     (SpatialIndex for deterministicFloat)
     ├── POIEngine         (SpatialIndex: filterInRadius, haversineKm)
     ├── CatchmentEngine   (SpatialIndex for deterministicFloat)
     ├── RoadNetworkEngine (SpatialIndex for deterministicFloat)
     └── CompetitionEngine (SpatialIndex: filterInRadius)

AttentionEngine ← all six engines (by interface, not concrete class)
```

`AttentionEngine` accepts `Partial<AttentionEngineDeps>` — pass only the engines
you want to override; the rest default to placeholder implementations.

---

## Dependency Injection Pattern

Each engine follows the same three-layer pattern:

```typescript
// 1. Data source interface — defines what data the engine needs
interface IPopulationDataSource {
  getByPincode(pincode: string): Promise<PopulationRecord | null>;
}

// 2. Placeholder implementation — deterministic, no I/O required
class PlaceholderPopulationDataSource implements IPopulationDataSource { ... }

// 3. Engine — pure analysis logic, data source injected via constructor
class PopulationEngine implements IPopulationEngine {
  constructor(
    private readonly dataSource: IPopulationDataSource
      = new PlaceholderPopulationDataSource()   // default → works out of the box
  ) {}
}
```

To swap to production data:

```typescript
// Census API implementation
class CensusAPIDataSource implements IPopulationDataSource {
  async getByPincode(pincode: string) {
    return fetchFromCensusAPI(pincode);
  }
}

const engine = new PopulationEngine(new CensusAPIDataSource());
```

The `AttentionEngine` accepts any mix:

```typescript
const engine = new AttentionEngine({
  population: new PopulationEngine(new CensusAPIDataSource()),
  // remaining engines default to placeholders
});
```

---

## Signal Composition

The `AttentionEngine` computes a normalised weighted average:

```
compositeScore = Σ(signal.score × signal.weight) / Σ(signal.weight)
```

Current weights (sum to 1.0):

| Signal | Weight | Rationale |
|--------|--------|-----------|
| Population Density | 0.20 | Baseline demand driver |
| Pincode Zone | 0.10 | Market maturity proxy |
| Points of Interest | 0.20 | Footfall magnet proximity |
| Catchment Area | 0.15 | Immediate reachable population |
| Road Connectivity | 0.15 | Physical accessibility |
| Competition | 0.20 | Market whitespace (inverted) |

Weights are defined in `AttentionEngine.ts` as `SIGNAL_WEIGHTS` and can be
changed without touching individual engine files.

### Confidence

Each `SignalBreakdown` carries a `confidence` (0–1). Placeholder providers emit
`0.25–0.40`; real providers emit `0.85–0.95`. The `AttentionResult` surfaces a
`weightedConfidence` so the UI can show how reliable the current index is and
prompt users to enrich their data.

### Tier Mapping

| Score | Tier |
|-------|------|
| ≥ 70 | High |
| 45–69 | Medium |
| < 45 | Low |

---

## Future Data Sources

| Engine | Placeholder | Real Sources |
|--------|-------------|--------------|
| **PopulationEngine** | Density from pincode prefix | Census of India 2021 API, WorldPop raster tiles |
| **PincodeEngine** | Hardcoded zone map | India Post Pincode Directory API, Bhuvan GIS |
| **POIEngine** | Generated synthetic points | Overpass API (OpenStreetMap), Google Places API, HERE Places |
| **CatchmentEngine** | Area × estimated density | ORS Isochrone API (drive-time polygons), Mapbox Isochrone |
| **RoadNetworkEngine** | Deterministic road class | OSM Road Graph (Valhalla/OSRM), HERE Routing Matrix |
| **CompetitionEngine** | Synthetic competitor positions | Proprietary dealer DB, Google Maps search, Foursquare |

Each replacement requires only a new class implementing the engine's
`IXxxDataSource` interface — zero changes to the engine or `AttentionEngine`.

---

## Relationship to Existing Scoring (`lib/signals/`)

`lib/signals/` (Milestone 5) contains the UI-facing signal pipeline that powers
the current `DealerInfoPanel`. It runs synchronously and is tightly coupled to
the `Dealer` type.

`lib/intelligence/` (Milestone 6) is the **replacement architecture**:

- Fully async (supports network I/O)
- Engine-level DI (data sources injectable per engine)
- `confidence` per signal (lets the UI communicate data quality)
- `SpatialIndex` for real geospatial queries
- No UI coupling — pure functions and classes

Migration path: when a production data source for any signal is ready, wire it
into the corresponding `XxxEngine` and update `AtlasShell` to call
`attentionEngine.compute()` instead of `attentionIndexEngine.compute()`.

---

## Testing Strategy

All engines are unit-testable without mocking a browser, a map, or Next.js:

```typescript
// Example: test PopulationEngine with a controlled data source
class FixedPopulationDataSource implements IPopulationDataSource {
  async getByPincode(_: string): Promise<PopulationRecord> {
    return { pincode: '400001', densityPerKm2: 30000, ... };
  }
}

const engine = new PopulationEngine(new FixedPopulationDataSource());
const signal = await engine.getScore({ pincode: '400001', city: 'Mumbai', storeName: 'Test' });
assert(signal.score > 70); // dense area should score high
```

`SpatialIndex` functions (`haversineKm`, `filterInRadius`, etc.) are pure
functions — import and test directly.

`AttentionEngine` accepts `Partial<AttentionEngineDeps>`, so individual engines
can be mocked independently in integration tests.
