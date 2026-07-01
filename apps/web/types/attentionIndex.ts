export type OpportunityRating = 'Low' | 'Medium' | 'High';

/** Result produced by a single signal provider */
export interface SignalResult {
  /** Unique signal identifier */
  id: string;
  /** Display name */
  name: string;
  /** Normalised score 0–100 */
  score: number;
  /** This signal's fractional weight in the composite (0–1) */
  weight: number;
  /** Human-readable explanation of the score */
  explanation: string;
}

/** Composite Attention Index for a dealer */
export interface AttentionIndex {
  /** Weighted composite score 0–100 */
  score: number;
  /** Bucketed opportunity rating */
  rating: OpportunityRating;
  /** Individual signal breakdowns, ordered by weight descending */
  signals: SignalResult[];
}
