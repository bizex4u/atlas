import type { Dealer } from '@/types/dealer';
import type { SignalResult } from '@/types/attentionIndex';
import type { ISignalProvider } from './ISignalProvider';
import { deterministicFloat, toScore } from './utils';

// Pincodes whose first 3 digits correspond to major Indian metros
const METRO_PREFIXES = new Set([
  '110', '400', '560', '500', '600', // Delhi, Mumbai, Bangalore, Hyderabad, Chennai
  '700', '380', '411', '302', '208', // Kolkata, Ahmedabad, Pune, Jaipur, Kanpur
]);

export class PopulationDensitySignal implements ISignalProvider {
  readonly id = 'population-density';
  readonly name = 'Population Density';
  readonly weight = 0.20;

  compute(dealer: Dealer): SignalResult {
    const base = deterministicFloat(dealer.city + dealer.pincode, 1);
    let score = toScore(base, 25, 80);

    const prefix = dealer.pincode.trim().slice(0, 3);
    if (METRO_PREFIXES.has(prefix)) score = Math.min(100, score + 18);

    return {
      id: this.id,
      name: this.name,
      score,
      weight: this.weight,
      explanation: `Inferred population density for ${dealer.city || 'this zone'}. Metro pincodes receive an uplift. Replace with census API for precision.`,
    };
  }
}
