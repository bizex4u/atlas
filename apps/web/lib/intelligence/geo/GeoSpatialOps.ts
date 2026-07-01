/**
 * Thin wrappers around @turf/turf.
 * All input/output uses our domain LngLat type; GeoJSON stays internal.
 */
import * as turf from '@turf/turf';
import type { Feature, Polygon, Point } from 'geojson';
import type { LngLat } from '../types';

// ─── Type aliases ─────────────────────────────────────────────────────────────

export type GeoPolygon = Feature<Polygon>;
export type GeoPoint   = Feature<Point>;

// ─── Conversions ──────────────────────────────────────────────────────────────

export function toGeoPoint(lngLat: LngLat): GeoPoint {
  return turf.point([lngLat.lng, lngLat.lat]);
}

export function fromGeoPoint(feature: GeoPoint): LngLat {
  const [lng, lat] = feature.geometry.coordinates;
  return { lng, lat };
}

/** Convert our domain ring (LngLat[]) → turf Polygon Feature */
export function ringToPolygon(ring: LngLat[]): GeoPolygon {
  const coords = ring.map((p) => [p.lng, p.lat] as [number, number]);
  // Ensure ring is closed
  if (
    coords[0][0] !== coords[coords.length - 1][0] ||
    coords[0][1] !== coords[coords.length - 1][1]
  ) {
    coords.push(coords[0]);
  }
  return turf.polygon([coords]);
}

/** Convert turf Polygon exterior ring → domain LngLat[] */
export function polygonToRing(poly: GeoPolygon): LngLat[] {
  return poly.geometry.coordinates[0].map(([lng, lat]: number[]) => ({ lng, lat }));
}

// ─── Core spatial ops ─────────────────────────────────────────────────────────

/**
 * Create a circular polygon around a center point.
 * @param radiusKm  Radius in kilometres
 * @param steps     Number of polygon vertices (higher = smoother, slower)
 */
export function makeCircle(center: LngLat, radiusKm: number, steps = 64): GeoPolygon {
  return turf.circle([center.lng, center.lat], radiusKm, {
    units: 'kilometers',
    steps,
  });
}

/**
 * Compute the intersection of two polygons.
 * Returns null if they do not overlap.
 */
export function intersectPolygons(
  a: GeoPolygon,
  b: GeoPolygon,
): GeoPolygon | null {
  const result = turf.intersect(
    turf.featureCollection([a, b]),
  );
  if (!result || result.geometry.type !== 'Polygon') return null;
  return result as GeoPolygon;
}

/** Area of a polygon in km² */
export function areaKm2(poly: GeoPolygon): number {
  return turf.area(poly) / 1_000_000;
}

/** Geographic centroid of a polygon → domain LngLat */
export function centroid(poly: GeoPolygon): LngLat {
  const c = turf.centroid(poly);
  return fromGeoPoint(c);
}

/** True if a point falls inside (or on the boundary of) a polygon */
export function pointInPolygon(point: LngLat, poly: GeoPolygon): boolean {
  return turf.booleanPointInPolygon(toGeoPoint(point), poly);
}

/**
 * Compute Voronoi tessellation for a set of seed points,
 * clipped to the provided bounding box.
 *
 * @param points  Seed points in domain LngLat
 * @param bbox    [minLng, minLat, maxLng, maxLat]
 * @returns       Array of polygons, one per input point (same order)
 */
export function voronoiPolygons(
  points: LngLat[],
  bbox: [number, number, number, number],
): GeoPolygon[] {
  const fc = turf.featureCollection(points.map((p) => turf.point([p.lng, p.lat])));
  const result = turf.voronoi(fc, { bbox });
  if (!result) return points.map(() => makeCircle({ lng: 0, lat: 0 }, 1));
  return result.features as GeoPolygon[];
}

/**
 * Axis-aligned bounding box of a polygon as [minX, minY, maxX, maxY].
 * (X = lng, Y = lat — matches rbush convention)
 */
export function polygonBbox(poly: GeoPolygon): [number, number, number, number] {
  const [minX, minY, maxX, maxY] = turf.bbox(poly);
  return [minX, minY, maxX, maxY];
}
