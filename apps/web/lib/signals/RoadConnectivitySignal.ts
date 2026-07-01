import type { Dealer } from '@/types/dealer';
import type { SignalResult } from '@/types/attentionIndex';
import type { ISignalProvider } from './ISignalProvider';
import { deterministicFloat, toScore } from './utils';

export class RoadConnectivitySignal implements ISignalProvider {
  readonly id = 'road-connectivity';
  readonly name = 'Road Connectivity';
  readonly weight = 0.15;

  compute(dealer: Dealer): SignalResult {
    const seed = dealer.pincode + (dealer.storeName[0] ?? 'X');
    const t = deterministicFloat(seed, 5);
    const score = toScore(t, 30, 90);

    return {
      id: this.id,
      name: this.name,
      score,
      weight: this.weight,
      explanation: `Road network density estimate for zone ${dealer.pincode.trim().slice(0, 4) || '??'}. Replace with OSM road graph or HERE Routing API for precision.`,
    };
  }
}
