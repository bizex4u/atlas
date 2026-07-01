import type { IGeocoder } from './types';
import { NominatimProvider } from './providers/NominatimProvider';

export function createGeocoder(): IGeocoder {
  const provider = process.env.NEXT_PUBLIC_GEOCODER_PROVIDER ?? 'nominatim';

  switch (provider) {
    case 'nominatim':
    default:
      return new NominatimProvider();
  }
}
