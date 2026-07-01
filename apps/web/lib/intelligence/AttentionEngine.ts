import type {
  AttentionInput,
  AttentionResult,
  OpportunityTier,
  SignalBreakdown,
  SignalId,
} from './types';
import { PopulationEngine, type IPopulationEngine } from './PopulationEngine';
import { PincodeEngine, type IPincodeEngine } from './PincodeEngine';
import { POIEngine, type IPOIEngine } from './POIEngine';
import { CatchmentEngine, type ICatchmentEngine } from './CatchmentEngine';
import { RoadNetworkEngine, type IRoadNetworkEngine } from './RoadNetworkEngine';
import { CompetitionEngine, type ICompetitionEngine } from './CompetitionEngine';

// ─── Signal Weights ───────────────────────────────────────────────────────────

const SIGNAL_WEIGHTS: Record<SignalId, number> = {
  population:     0.20,
  pincode:        0.10,
  poi:            0.20,
  catchment:      0.15,
  'road-network': 0.15,
  competition:    0.20,
};

// ─── Engine Interfaces ────────────────────────────────────────────────────────

export interface IAttentionEngine {
  compute(input: AttentionInput): Promise<AttentionResult>;
}

export interface AttentionEngineDeps {
  population: IPopulationEngine;
  pincode: IPincodeEngine;
  poi: IPOIEngine;
  catchment: ICatchmentEngine;
  roadNetwork: IRoadNetworkEngine;
  competition: ICompetitionEngine;
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export class AttentionEngine implements IAttentionEngine {
  private readonly deps: AttentionEngineDeps;

  constructor(deps?: Partial<AttentionEngineDeps>) {
    this.deps = {
      population: deps?.population ?? new PopulationEngine(),
      pincode: deps?.pincode ?? new PincodeEngine(),
      poi: deps?.poi ?? new POIEngine(),
      catchment: deps?.catchment ?? new CatchmentEngine(),
      roadNetwork: deps?.roadNetwork ?? new RoadNetworkEngine(),
      competition: deps?.competition ?? new CompetitionEngine(),
    };
  }

  /** Create with all placeholder data sources — ready to run without any config */
  static createDefault(): AttentionEngine {
    return new AttentionEngine();
  }

  async compute(input: AttentionInput): Promise<AttentionResult> {
    // All signals run concurrently — each engine is independent
    const [population, pincode, poi, catchment, roadNetwork, competition] =
      await Promise.all([
        this.deps.population.getScore(input),
        this.deps.pincode.getScore(input),
        this.deps.poi.getScore(input),
        this.deps.catchment.getScore(input),
        this.deps.roadNetwork.getScore(input),
        this.deps.competition.getScore(input),
      ]);

    const signals: SignalBreakdown[] = [
      population,
      pincode,
      poi,
      catchment,
      roadNetwork,
      competition,
    ].map((s) => ({
      ...s,
      // Override weight from the canonical source of truth
      weight: SIGNAL_WEIGHTS[s.id],
    }));

    const compositeScore = this.computeWeightedScore(signals);
    const weightedConfidence = this.computeWeightedConfidence(signals);

    return {
      compositeScore,
      tier: this.toTier(compositeScore),
      weightedConfidence,
      signals: [...signals].sort((a, b) => b.weight - a.weight),
      computedAt: new Date(),
    };
  }

  private computeWeightedScore(signals: SignalBreakdown[]): number {
    const totalWeight = signals.reduce((s, sig) => s + sig.weight, 0);
    if (totalWeight === 0) return 0;
    const raw = signals.reduce(
      (sum, sig) => sum + (sig.score * sig.weight) / totalWeight,
      0,
    );
    return Math.round(Math.min(100, Math.max(0, raw)));
  }

  private computeWeightedConfidence(signals: SignalBreakdown[]): number {
    const totalWeight = signals.reduce((s, sig) => s + sig.weight, 0);
    if (totalWeight === 0) return 0;
    const raw = signals.reduce(
      (sum, sig) => sum + (sig.confidence * sig.weight) / totalWeight,
      0,
    );
    return Math.round(raw * 100) / 100;
  }

  private toTier(score: number): OpportunityTier {
    if (score >= 70) return 'High';
    if (score >= 45) return 'Medium';
    return 'Low';
  }
}

/** Singleton with all placeholder providers — replace deps for production */
export const attentionEngine = AttentionEngine.createDefault();
