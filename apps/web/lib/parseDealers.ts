import type { Dealer, ParseResult, RowIssue } from '@/types/dealer';
import { getIndiaPinCentroid } from '@/lib/geocoder/pincode/IndiaPinCentroid';

const REQUIRED_COLUMNS = ['store name', 'address', 'city', 'pincode'] as const;

const COLUMN_ALIASES: Record<string, string[]> = {
  'store name': ['store name', 'storename', 'name', 'dealer name', 'dealername', 'store'],
  address: ['address', 'addr', 'street'],
  city: ['city', 'town'],
  pincode: ['pincode', 'pin code', 'postal code', 'postalcode', 'zip', 'zipcode', 'pin'],
  latitude: ['latitude', 'lat'],
  longitude: ['longitude', 'lng', 'lon', 'long'],
};

function normalizeKey(key: string): string {
  return key.trim().toLowerCase();
}

function buildColumnMap(headers: string[]): Record<string, string> {
  const normalized = headers.map(normalizeKey);
  const map: Record<string, string> = {};
  for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
    const match = aliases.find((alias) => normalized.includes(alias));
    if (match) {
      const originalIndex = normalized.indexOf(match);
      map[canonical] = headers[originalIndex];
    }
  }
  return map;
}

function parseCoord(val: string | number | undefined): number | null {
  if (val === undefined || val === '' || val === null) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function rowsToResult(
  rows: Record<string, unknown>[],
  colMap: Record<string, string>,
): Omit<ParseResult, 'missingColumns'> {
  const dealers: Dealer[] = [];
  const skipped: RowIssue[] = [];

  rows.forEach((row, i) => {
    const rowNum = i + 2; // 1-indexed + header row
    const get = (canonical: string) =>
      String(row[colMap[canonical]] ?? '').trim();

    const storeName = get('store name');
    const address = get('address');
    const city = get('city');
    const pincode = get('pincode');

    const missing = [
      !storeName && 'Store Name',
      !address && 'Address',
      !city && 'City',
      !pincode && 'Pincode',
    ].filter(Boolean) as string[];

    if (missing.length > 0) {
      skipped.push({ row: rowNum, message: `Missing: ${missing.join(', ')}` });
      return;
    }

    const lat = parseCoord(row[colMap['latitude']] as string | number | undefined);
    const lng = parseCoord(row[colMap['longitude']] as string | number | undefined);

    const hasLatCol = Boolean(colMap['latitude']);
    const hasLngCol = Boolean(colMap['longitude']);
    const coordInvalid =
      (hasLatCol && lat === null) || (hasLngCol && lng === null);
    if (coordInvalid) {
      skipped.push({
        row: rowNum,
        message: `Invalid coordinates for "${storeName}"`,
      });
      return;
    }

    const hasExactCoords = lat !== null && lng !== null;
    let resolvedLat: number | null = lat;
    let resolvedLng: number | null = lng;
    let geoResolution: Dealer['geoResolution'] = 'exact';

    if (!hasExactCoords) {
      const centroid = getIndiaPinCentroid(pincode);
      if (centroid) {
        resolvedLat = centroid.lat;
        resolvedLng = centroid.lng;
        geoResolution = 'pin_centroid';
      } else {
        geoResolution = 'failed';
      }
    }

    dealers.push({
      id: `dealer-${rowNum}-${Date.now()}`,
      storeName,
      address,
      city,
      pincode,
      lat: resolvedLat,
      lng: resolvedLng,
      geoResolution,
    });
  });

  return { dealers, skipped, totalRows: rows.length };
}

async function parseCSV(file: File): Promise<ParseResult> {
  const Papa = (await import('papaparse')).default;
  return new Promise((resolve) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        const colMap = buildColumnMap(headers);
        const missingColumns = REQUIRED_COLUMNS.filter((col) => !colMap[col]);
        if (missingColumns.length > 0) {
          resolve({ dealers: [], skipped: [], missingColumns, totalRows: results.data.length });
          return;
        }
        const { dealers, skipped, totalRows } = rowsToResult(results.data, colMap);
        resolve({ dealers, skipped, missingColumns: [], totalRows });
      },
      error: () => {
        resolve({ dealers: [], skipped: [], missingColumns: ['(CSV parse error)'], totalRows: 0 });
      },
    });
  });
}

async function parseXLSX(file: File): Promise<ParseResult> {
  const xlsx = await import('xlsx');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const wb = xlsx.read(bytes, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  if (rows.length === 0) {
    return { dealers: [], skipped: [], missingColumns: [], totalRows: 0 };
  }
  const headers = Object.keys(rows[0]);
  const colMap = buildColumnMap(headers);
  const missingColumns = REQUIRED_COLUMNS.filter((col) => !colMap[col]);
  if (missingColumns.length > 0) {
    return { dealers: [], skipped: [], missingColumns, totalRows: rows.length };
  }
  const { dealers, skipped, totalRows } = rowsToResult(rows, colMap);
  return { dealers, skipped, missingColumns: [], totalRows };
}

export async function parseDealerFile(file: File): Promise<ParseResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return parseCSV(file);
  if (ext === 'xlsx' || ext === 'xls') return parseXLSX(file);
  return {
    dealers: [],
    skipped: [],
    missingColumns: [`Unsupported file type ".${ext}". Use .csv or .xlsx`],
    totalRows: 0,
  };
}
