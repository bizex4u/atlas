import type { Dealer } from '@/types/dealer';
import type { SignalResult } from '@/types/attentionIndex';
import type { ISignalProvider } from './ISignalProvider';
import { deterministicFloat, toScore } from './utils';

export class CompetitionSignal implements ISignalProvider {
  readonly id = 'competition';
  readonly name = 'Competition';
  readonly weight = 0.10;

  compute(dealer: Dealer): SignalResult {
    const t = deterministicFloat(dealer.storeName + dealer.pincode, 6);
    // Invert: low competition density = high opportunity score
    const rawCompetition = toScore(t, 10, 80);
    const score = 100 - rawCompetition;

    return {
      id: this.id,
      name: this.name,
      score,
      weight: this.weight,
      explanation: `Inverse competition pressure — higher score means lower market saturation and greater expansion opportunity. Replace with competitor geolocation data for accuracy.`,
    };
  }
}
