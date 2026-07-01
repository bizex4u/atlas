import type { Dealer } from '@/types/dealer';
import type { SignalResult } from '@/types/attentionIndex';
import type { ISignalProvider } from './ISignalProvider';
import { deterministicFloat, toScore } from './utils';

export class CommercialDensitySignal implements ISignalProvider {
  readonly id = 'commercial-density';
  readonly name = 'Commercial Density';
  readonly weight = 0.20;

  compute(dealer: Dealer): SignalResult {
    const t = deterministicFloat(dealer.pincode + dealer.city, 2);
    const score = toScore(t, 20, 90);
    const zone = dealer.pincode.trim().slice(0, 2) || '??';

    return {
      id: this.id,
      name: this.name,
      score,
      weight: this.weight,
      explanation: `Estimated commercial activity density for postal zone ${zone}. Replace with OSM POI or Google Places data for real values.`,
    };
  }
}
