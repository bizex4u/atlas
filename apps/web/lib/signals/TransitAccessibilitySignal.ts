import type { Dealer } from '@/types/dealer';
import type { SignalResult } from '@/types/attentionIndex';
import type { ISignalProvider } from './ISignalProvider';
import { deterministicFloat, toScore } from './utils';

export class TransitAccessibilitySignal implements ISignalProvider {
  readonly id = 'transit-accessibility';
  readonly name = 'Transit Accessibility';
  readonly weight = 0.20;

  compute(dealer: Dealer): SignalResult {
    const firstDigit = dealer.pincode.trim()[0] ?? '5';
    const t = deterministicFloat(dealer.city + firstDigit, 4);
    const score = toScore(t, 20, 85);

    return {
      id: this.id,
      name: this.name,
      score,
      weight: this.weight,
      explanation: `Estimated public transit and metro connectivity for ${dealer.city || 'this location'}. Replace with GTFS feed or transit API for real scores.`,
    };
  }
}
