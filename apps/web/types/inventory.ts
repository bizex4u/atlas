export type OOHFormat =
  | 'hoarding'
  | 'unipole'
  | 'gantry'
  | 'led-display'
  | 'bus-shelter'
  | 'transit-media'
  | 'wall-wrap'
  | 'kiosk'
  | 'other';

export type SiteStatus = 'available' | 'occupied' | 'booked' | 'maintenance';

export type Facing = 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';

export interface OOHSite {
  id: string;
  siteCode: string;         // e.g. LKO-HRD-001
  name: string;             // landmark / area name

  // Location
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat: number | null;
  lng: number | null;

  // Format
  format: OOHFormat;
  widthFt: number;
  heightFt: number;
  facing: Facing | null;
  illuminated: boolean;

  // Business
  monthlyRentInr: number;
  status: SiteStatus;
  clientName: string;       // who has it now (if occupied/booked)
  campaignEndDate: string;  // ISO date string
  landlordName: string;
  landlordPhone: string;

  notes: string;

  createdAt: string;        // ISO
  updatedAt: string;        // ISO
}

export const FORMAT_LABELS: Record<OOHFormat, string> = {
  hoarding:       'Hoarding',
  unipole:        'Unipole',
  gantry:         'Gantry',
  'led-display':  'LED Display',
  'bus-shelter':  'Bus Shelter',
  'transit-media':'Transit Media',
  'wall-wrap':    'Wall Wrap',
  kiosk:          'Kiosk',
  other:          'Other',
};

export const STATUS_COLORS: Record<SiteStatus, string> = {
  available:   '#16a34a',
  occupied:    '#dc2626',
  booked:      '#d97706',
  maintenance: '#6b7280',
};

export const STATUS_LABELS: Record<SiteStatus, string> = {
  available:   'Available',
  occupied:    'Occupied',
  booked:      'Booked',
  maintenance: 'Maintenance',
};
