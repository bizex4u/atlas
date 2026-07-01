/**
 * India Post pincode lookup via api.postalpincode.in (free, no auth).
 * Used as fallback when a pincode isn't in our local dataset.
 *
 * Response capped at 10s; results cached in-memory for session lifetime.
 */

import type { PincodeRecord, ZoneType } from '../types';

interface PostOffice {
  Name:        string;
  BranchType:  string;
  DeliveryStatus: string;
  Circle:      string;
  District:    string;
  Division:    string;
  Region:      string;
  State:       string;
  Country:     string;
  Pincode:     string;
}

interface PostalApiResponse {
  Message: string;
  Status:  'Success' | 'Error';
  PostOffice: PostOffice[] | null;
}

const cache = new Map<string, PincodeRecord | null>();

function zoneFromBranchType(bt: string): ZoneType {
  if (bt === 'Head Post Office') return 'urban';
  if (bt === 'Sub Post Office')  return 'semi-urban';
  return 'rural';
}

export async function lookupPostalPincode(pincode: string): Promise<PincodeRecord | null> {
  if (cache.has(pincode)) return cache.get(pincode)!;

  try {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), 10000);
    const res  = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`,
      { signal: ctrl.signal },
    ).finally(() => clearTimeout(tid));

    if (!res.ok) { cache.set(pincode, null); return null; }

    const data: PostalApiResponse[] = await res.json();
    const entry = data[0];
    if (entry?.Status !== 'Success' || !entry.PostOffice?.length) {
      cache.set(pincode, null);
      return null;
    }

    // Pick the Head Post Office if present; else first entry
    const po = entry.PostOffice.find(p => p.BranchType === 'Head Post Office')
            ?? entry.PostOffice[0];

    const record: PincodeRecord = {
      pincode,
      locality:        po.Name,
      state:           po.State,
      district:        po.District,
      taluk:           po.Division,
      zoneType:        zoneFromBranchType(po.BranchType),
      centroid:        { lng: 0, lat: 0 },   // no coords from this API
      boundary:        [],
      areaKm2:         0,
      populationDensity: 0,
    };

    cache.set(pincode, record);
    return record;
  } catch {
    cache.set(pincode, null);
    return null;
  }
}
