/**
 * Minimal TypeScript declaration for rbush v4 (no bundled types).
 * Source: https://github.com/mourner/rbush
 */
declare module 'rbush' {
  export interface BBoxItem {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }

  export type BBoxQuery = { minX: number; minY: number; maxX: number; maxY: number };

  class RBush<T extends BBoxItem> {
    load(items: T[]): this;
    insert(item: T): this;
    remove(item: T, equals?: (a: T, b: T) => boolean): this;
    search(bbox: BBoxQuery): T[];
    collides(bbox: BBoxQuery): boolean;
    all(): T[];
    clear(): this;
    toJSON(): unknown;
    fromJSON(data: unknown): this;
  }

  export default RBush;
}
