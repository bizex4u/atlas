// Site Types
export type SiteFormat = 'HRD' | 'UNI' | 'GAN' | 'SHL' | 'BJB' | 'DFS';
export type SiteStatus = 'available' | 'occupied' | 'booked' | 'maintenance';
export type SiteType = 'owned' | 'leased' | 'barter';

export interface Site {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  format: SiteFormat;
  type: SiteType;
  status: SiteStatus;
  dimensions: {
    width: number;
    height: number;
    sqft: number;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
    landmark?: string;
  };
  financial: {
    rent: number;
    electricity: number;
    municipal: number;
    currency: 'INR';
  };
  landlord?: {
    name: string;
    phone: string;
    email?: string;
  };
  visibility: 'excellent' | 'good' | 'moderate' | 'poor';
  trafficType: 'highway' | 'arterial' | 'commercial' | 'residential';
  lighting: 'frontlit' | 'backlit' | 'nolit';
  currentBooking?: {
    clientId: string;
    startDate: string;
    endDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Barter Types
export type BarterStatus = 'active' | 'completed' | 'cancelled';
export type BarterProductType = 'print' | 'radio' | 'digital' | 'tv' | 'event' | 'other';

export interface BarterPartner {
  id: string;
  name: string;
  type: BarterProductType;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  gstin?: string;
  creditLimit?: number;
  createdAt: string;
}

export interface BarterDeal {
  id: string;
  partnerId: string;
  sitesGiven: string[];
  productsReceived: BarterProduct[];
  startDate: string;
  endDate?: string;
  totalValueGiven: number;
  totalValueReceived: number;
  balance: number;
  status: BarterStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BarterProduct {
  id: string;
  type: BarterProductType;
  description: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  deliveryDate?: string;
}

// Accounts Types
export type InvoiceType = 'tax' | 'proforma' | 'credit_note' | 'debit_note';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'upi';

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  pan?: string;
  creditLimit?: number;
  outstanding: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  clientId: string;
  invoiceDate: string;
  dueDate: string;
  sacCode: string;
  placeOfSupply: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  roundOff: number;
  grandTotal: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  siteId?: string;
  siteCode?: string;
  siteName?: string;
  description: string;
  startDate?: string;
  endDate?: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  paidAt: string;
  notes?: string;
  createdAt: string;
}

// Intelligence Types
export interface LocationAnalysis {
  id: string;
  lat: number;
  lng: number;
  address: string;
  pincode: string;
  city: string;
  state: string;
  radius: number;
  demographics: DemographicsData;
  poi: POIData[];
  transport: TransportData;
  competitors: CompetitorData[];
  catchment: CatchmentData;
  traffic: TrafficData;
  scores: LocationScores;
  recommendation: string;
  generatedAt: string;
}

export interface DemographicsData {
  population: number;
  households: number;
  avgHouseholdSize: number;
  sexRatio: number;
  literacyRate: number;
  workingPopulation: number;
  ageDistribution: {
    '0-14': number;
    '15-29': number;
    '30-44': number;
    '45-59': number;
    '60+': number;
  };
  incomeLevel: 'low' | 'lower-middle' | 'middle' | 'upper-middle' | 'high';
}

export interface POIData {
  category: string;
  name: string;
  distance: number;
  type: string;
}

export interface TransportData {
  nearestAirport?: { name: string; distance: number };
  nearestRailway?: { name: string; distance: number };
  nearestMetro?: { name: string; distance: number };
  busStops: number;
  highways: string[];
}

export interface CompetitorData {
  name: string;
  format: SiteFormat;
  distance: number;
  operator?: string;
}

export interface CatchmentData {
  residentialPopulation: number;
  workingPopulation: number;
  floatingPopulation: number;
  vehicleOwnership: number;
  primaryAudience: string;
  secondaryAudience: string;
}

export interface TrafficData {
  avgDailyVehicles: number;
  peakHours: string[];
  vehicleSplit: {
    two_wheeler: number;
    car: number;
    commercial: number;
    three_wheeler: number;
  };
  roadType: string;
}

export interface LocationScores {
  visibility: number;
  traffic: number;
  affluence: number;
  competition: number;
  overall: number;
}

// Dashboard Types
export interface DashboardStats {
  totalSites: number;
  availableSites: number;
  occupiedSites: number;
  bookedSites: number;
  totalRevenue: number;
  outstandingRevenue: number;
  activeBarterDeals: number;
  barterBalance: number;
  clientsCount: number;
  partnersCount: number;
}

// Common Types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CityData {
  name: string;
  state: string;
  district: string;
  population: number;
  lat: number;
  lng: number;
  pincodes: string[];
}

export const FORMAT_LABELS: Record<SiteFormat, string> = {
  HRD: 'Hording',
  UNI: 'Unipole',
  GAN: 'Gantry',
  SHL: 'Shelter',
  BJB: 'Bus Shelter',
  DFS: 'Digital Flex Signage'
};

export const STATUS_LABELS: Record<SiteStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  booked: 'Booked',
  maintenance: 'Under Maintenance'
};

export const STATUS_COLORS: Record<SiteStatus, string> = {
  available: '#22c55e',
  occupied: '#ef4444',
  booked: '#f59e0b',
  maintenance: '#6b7280'
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep', 'Puducherry'
];
