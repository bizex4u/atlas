import type { Dealer } from '@/types/dealer';
import type { SignalResult } from '@/types/attentionIndex';

/**
 * Contract for all signal providers in the Attention Index pipeline.
 * Swap any provider for a real data-backed implementation without
 * changing the engine or downstream components.
 */
export interface ISignalProvider {
  readonly id: string;
  readonly name: string;
  /** Fractional weight in the composite (all providers should sum to 1.0) */
  readonly weight: number;
  compute(dealer: Dealer): SignalResult;
}
