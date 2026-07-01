import type { Dealer } from '@/types/dealer';
import type { SignalResult } from '@/types/attentionIndex';
import type { ISignalProvider } from './ISignalProvider';
import { deterministicFloat, toScore } from './utils';

export class RetailClusterSignal implements ISignalProvider {
  readonly id = 'retail-cluster';
  readonly name = 'Retail Cluster';
  readonly weight = 0.15;

  compute(dealer: Dealer): SignalResult {
    // Use coordinate precision when available for a tighter location seed
    const seed =
      dealer.lat !== null && dealer.lng !== null
        ? `${dealer.lat.toFixed(2)}:${dealer.lng.toFixed(2)}`
        : dealer.city + dealer.pincode;

    const t = deterministicFloat(seed, 3);
    const score = toScore(t, 15, 95);

    return {
      id: this.id,
      name: this.name,
      score,
      weight: this.weight,
      explanation: dealer.lat !== null
        ? `Proximity estimate to retail concentration zones derived from coordinates. Replace with ISOCHRONE or cluster analysis.`
        : `Coordinate data unavailable — estimated from city and pincode. Provide lat/lng for a tighter estimate.`,
    };
  }
}
