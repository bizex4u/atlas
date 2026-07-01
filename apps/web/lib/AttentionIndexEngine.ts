import type { Dealer } from '@/types/dealer';
import type { AttentionIndex, OpportunityRating } from '@/types/attentionIndex';
import type { ISignalProvider } from './signals/ISignalProvider';
import {
  PopulationDensitySignal,
  CommercialDensitySignal,
  RetailClusterSignal,
  TransitAccessibilitySignal,
  RoadConnectivitySignal,
  CompetitionSignal,
} from './signals';

export interface IAttentionIndexEngine {
  compute(dealer: Dealer): AttentionIndex;
  computeAll(dealers: Dealer[]): AttentionIndex[];
}

export class AttentionIndexEngine implements IAttentionIndexEngine {
  private readonly providers: ISignalProvider[];

  constructor(providers?: ISignalProvider[]) {
    this.providers = providers ?? AttentionIndexEngine.defaultProviders();
  }

  static defaultProviders(): ISignalProvider[] {
    return [
      new PopulationDensitySignal(),
      new CommercialDensitySignal(),
      new TransitAccessibilitySignal(),
      new RetailClusterSignal(),
      new RoadConnectivitySignal(),
      new CompetitionSignal(),
    ];
  }

  compute(dealer: Dealer): AttentionIndex {
    const signals = this.providers.map((p) => p.compute(dealer));

    const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
    const rawScore = signals.reduce(
      (sum, s) => sum + (s.score * s.weight) / totalWeight,
      0,
    );
    const score = Math.round(Math.min(100, Math.max(0, rawScore)));
    const rating = this.toRating(score);

    const sorted = [...signals].sort((a, b) => b.weight - a.weight);

    return { score, rating, signals: sorted };
  }

  computeAll(dealers: Dealer[]): AttentionIndex[] {
    return dealers.map((d) => this.compute(d));
  }

  private toRating(score: number): OpportunityRating {
    if (score >= 70) return 'High';
    if (score >= 45) return 'Medium';
    return 'Low';
  }
}

/** Drop-in singleton. Pass custom providers to the constructor to extend. */
export const attentionIndexEngine = new AttentionIndexEngine();
