import type { ZoneType } from '../types';

export interface RawPincodeEntry {
  pincode: string;
  locality: string;
  district: string;
  state: string;
  zone: ZoneType;
  lat: number;
  lng: number;
  /** Approximate population density per km² */
  densityPerKm2: number;
}

/**
 * Real Indian metro + urban pincode centroids.
 * Coordinates from India Post directory / OpenStreetMap.
 * Density figures are approximate (census-derived).
 *
 * Source: India Post Pincode Directory; OSM geocoding.
 * To replace with full polygon boundaries, supply a GeoJSON FeatureCollection
 * to GeoPincodeDataSource and this file becomes the fallback.
 */
export const METRO_PINCODES: RawPincodeEntry[] = [
  // ── Delhi ──────────────────────────────────────────────────────────────────
  { pincode: '110001', locality: 'Connaught Place',    district: 'Central Delhi',    state: 'Delhi', zone: 'metro', lat: 28.6315, lng: 77.2167, densityPerKm2: 29737 },
  { pincode: '110002', locality: 'Darya Ganj',         district: 'Central Delhi',    state: 'Delhi', zone: 'metro', lat: 28.6418, lng: 77.2259, densityPerKm2: 38400 },
  { pincode: '110003', locality: 'Lodi Estate',        district: 'South Delhi',      state: 'Delhi', zone: 'metro', lat: 28.5921, lng: 77.2246, densityPerKm2: 12500 },
  { pincode: '110005', locality: 'Karol Bagh',         district: 'West Delhi',       state: 'Delhi', zone: 'metro', lat: 28.6519, lng: 77.1909, densityPerKm2: 42000 },
  { pincode: '110006', locality: 'Sadar Bazar',        district: 'Central Delhi',    state: 'Delhi', zone: 'metro', lat: 28.6593, lng: 77.2073, densityPerKm2: 44000 },
  { pincode: '110007', locality: 'Subzi Mandi',        district: 'North Delhi',      state: 'Delhi', zone: 'metro', lat: 28.6724, lng: 77.2107, densityPerKm2: 39000 },
  { pincode: '110008', locality: 'Patel Nagar',        district: 'West Delhi',       state: 'Delhi', zone: 'metro', lat: 28.6461, lng: 77.1612, densityPerKm2: 35000 },
  { pincode: '110010', locality: 'Lajpat Nagar',       district: 'South Delhi',      state: 'Delhi', zone: 'metro', lat: 28.5706, lng: 77.2368, densityPerKm2: 27000 },
  { pincode: '110016', locality: 'Hauz Khas',          district: 'South Delhi',      state: 'Delhi', zone: 'metro', lat: 28.5494, lng: 77.2001, densityPerKm2: 14000 },
  { pincode: '110019', locality: 'Kalkaji',            district: 'South Delhi',      state: 'Delhi', zone: 'metro', lat: 28.5359, lng: 77.2588, densityPerKm2: 26000 },
  { pincode: '110025', locality: 'Ashram',             district: 'South Delhi',      state: 'Delhi', zone: 'metro', lat: 28.5718, lng: 77.2622, densityPerKm2: 23000 },
  { pincode: '110032', locality: 'Vivek Vihar',        district: 'East Delhi',       state: 'Delhi', zone: 'metro', lat: 28.6718, lng: 77.3219, densityPerKm2: 32000 },
  { pincode: '110051', locality: 'Shahdara',           district: 'East Delhi',       state: 'Delhi', zone: 'metro', lat: 28.6720, lng: 77.2881, densityPerKm2: 37000 },
  { pincode: '110063', locality: 'Dwarka',             district: 'South West Delhi', state: 'Delhi', zone: 'metro', lat: 28.5921, lng: 77.0460, densityPerKm2: 15000 },
  { pincode: '110085', locality: 'Rohini Sector 8',    district: 'North West Delhi', state: 'Delhi', zone: 'metro', lat: 28.7374, lng: 77.1226, densityPerKm2: 18000 },

  // ── Mumbai ─────────────────────────────────────────────────────────────────
  { pincode: '400001', locality: 'Fort',              district: 'South Mumbai',     state: 'Maharashtra', zone: 'metro', lat: 18.9344, lng: 72.8355, densityPerKm2: 45000 },
  { pincode: '400002', locality: 'Mandvi',            district: 'South Mumbai',     state: 'Maharashtra', zone: 'metro', lat: 18.9587, lng: 72.8307, densityPerKm2: 42000 },
  { pincode: '400005', locality: 'Colaba',            district: 'South Mumbai',     state: 'Maharashtra', zone: 'metro', lat: 18.9067, lng: 72.8147, densityPerKm2: 30000 },
  { pincode: '400007', locality: 'Grant Road',        district: 'South Mumbai',     state: 'Maharashtra', zone: 'metro', lat: 18.9715, lng: 72.8175, densityPerKm2: 48000 },
  { pincode: '400010', locality: 'Byculla',           district: 'South Mumbai',     state: 'Maharashtra', zone: 'metro', lat: 18.9771, lng: 72.8366, densityPerKm2: 50000 },
  { pincode: '400012', locality: 'Lalbaug',           district: 'South Mumbai',     state: 'Maharashtra', zone: 'metro', lat: 19.0082, lng: 72.8388, densityPerKm2: 46000 },
  { pincode: '400013', locality: 'Dadar',             district: 'Mumbai Suburban',  state: 'Maharashtra', zone: 'metro', lat: 19.0187, lng: 72.8428, densityPerKm2: 44000 },
  { pincode: '400016', locality: 'Mahim',             district: 'Mumbai Suburban',  state: 'Maharashtra', zone: 'metro', lat: 19.0415, lng: 72.8400, densityPerKm2: 38000 },
  { pincode: '400018', locality: 'Worli',             district: 'South Mumbai',     state: 'Maharashtra', zone: 'metro', lat: 19.0112, lng: 72.8175, densityPerKm2: 25000 },
  { pincode: '400022', locality: 'Chembur',           district: 'Mumbai Suburban',  state: 'Maharashtra', zone: 'metro', lat: 19.0606, lng: 72.8990, densityPerKm2: 22000 },
  { pincode: '400029', locality: 'Bandra West',       district: 'Mumbai Suburban',  state: 'Maharashtra', zone: 'metro', lat: 19.0544, lng: 72.8183, densityPerKm2: 28000 },
  { pincode: '400040', locality: 'Andheri West',      district: 'Mumbai Suburban',  state: 'Maharashtra', zone: 'metro', lat: 19.1136, lng: 72.8342, densityPerKm2: 32000 },
  { pincode: '400045', locality: 'Ghatkopar East',    district: 'Mumbai Suburban',  state: 'Maharashtra', zone: 'metro', lat: 19.0832, lng: 72.9076, densityPerKm2: 35000 },
  { pincode: '400050', locality: 'Bandra East',       district: 'Mumbai Suburban',  state: 'Maharashtra', zone: 'metro', lat: 19.0665, lng: 72.8410, densityPerKm2: 30000 },
  { pincode: '400063', locality: 'Kandivali East',    district: 'Mumbai Suburban',  state: 'Maharashtra', zone: 'metro', lat: 19.2040, lng: 72.8558, densityPerKm2: 20000 },
  { pincode: '400068', locality: 'Powai',             district: 'Mumbai Suburban',  state: 'Maharashtra', zone: 'metro', lat: 19.1176, lng: 72.9060, densityPerKm2: 14000 },

  // ── Bangalore ──────────────────────────────────────────────────────────────
  { pincode: '560001', locality: 'Shivajinagar',      district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 12.9850, lng: 77.6023, densityPerKm2: 18000 },
  { pincode: '560002', locality: 'Bangalore GPO',     district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 12.9716, lng: 77.5946, densityPerKm2: 25000 },
  { pincode: '560003', locality: 'Basavangudi',       district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 12.9416, lng: 77.5756, densityPerKm2: 21000 },
  { pincode: '560004', locality: 'Malleswaram',       district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 13.0027, lng: 77.5668, densityPerKm2: 22000 },
  { pincode: '560005', locality: 'Rajajinagar',       district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 12.9998, lng: 77.5545, densityPerKm2: 20000 },
  { pincode: '560011', locality: 'Gandhinagar',       district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 12.9740, lng: 77.5790, densityPerKm2: 19000 },
  { pincode: '560016', locality: 'RT Nagar',          district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 13.0273, lng: 77.5966, densityPerKm2: 16000 },
  { pincode: '560038', locality: 'BTM Layout',        district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 12.9165, lng: 77.6101, densityPerKm2: 19000 },
  { pincode: '560040', locality: 'Indiranagar',       district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 12.9784, lng: 77.6408, densityPerKm2: 14000 },
  { pincode: '560041', locality: 'Koramangala',       district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 12.9352, lng: 77.6245, densityPerKm2: 16000 },
  { pincode: '560043', locality: 'Electronic City',   district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 12.8399, lng: 77.6770, densityPerKm2: 8000  },
  { pincode: '560050', locality: 'Whitefield',        district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 12.9698, lng: 77.7499, densityPerKm2: 9000  },
  { pincode: '560051', locality: 'Marathahalli',      district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 12.9591, lng: 77.6974, densityPerKm2: 15000 },
  { pincode: '560076', locality: 'HAL',               district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 12.9585, lng: 77.6612, densityPerKm2: 11000 },
  { pincode: '560095', locality: 'JP Nagar',          district: 'Bangalore Urban',  state: 'Karnataka', zone: 'metro', lat: 12.8901, lng: 77.5844, densityPerKm2: 13000 },

  // ── Hyderabad ──────────────────────────────────────────────────────────────
  { pincode: '500001', locality: 'Abids',             district: 'Hyderabad',        state: 'Telangana', zone: 'metro', lat: 17.3850, lng: 78.4867, densityPerKm2: 28000 },
  { pincode: '500002', locality: 'Secunderabad',      district: 'Hyderabad',        state: 'Telangana', zone: 'metro', lat: 17.4432, lng: 78.4983, densityPerKm2: 26000 },
  { pincode: '500003', locality: 'Koti',              district: 'Hyderabad',        state: 'Telangana', zone: 'metro', lat: 17.3726, lng: 78.4753, densityPerKm2: 32000 },
  { pincode: '500007', locality: 'Himayatnagar',      district: 'Hyderabad',        state: 'Telangana', zone: 'metro', lat: 17.3966, lng: 78.4804, densityPerKm2: 24000 },
  { pincode: '500011', locality: 'Banjara Hills',     district: 'Hyderabad',        state: 'Telangana', zone: 'metro', lat: 17.4156, lng: 78.4347, densityPerKm2: 10000 },
  { pincode: '500012', locality: 'Jubilee Hills',     district: 'Hyderabad',        state: 'Telangana', zone: 'metro', lat: 17.4239, lng: 78.4097, densityPerKm2: 8000  },
  { pincode: '500016', locality: 'Ameerpet',          district: 'Hyderabad',        state: 'Telangana', zone: 'metro', lat: 17.4374, lng: 78.4487, densityPerKm2: 22000 },
  { pincode: '500020', locality: 'Mehdipatnam',       district: 'Hyderabad',        state: 'Telangana', zone: 'metro', lat: 17.3927, lng: 78.4286, densityPerKm2: 25000 },
  { pincode: '500033', locality: 'Dilsukhnagar',      district: 'Hyderabad',        state: 'Telangana', zone: 'metro', lat: 17.3667, lng: 78.5251, densityPerKm2: 28000 },
  { pincode: '500036', locality: 'Uppal',             district: 'Medchal-Malkajgiri', state: 'Telangana', zone: 'metro', lat: 17.4040, lng: 78.5591, densityPerKm2: 18000 },
  { pincode: '500046', locality: 'Gachibowli',        district: 'Hyderabad',        state: 'Telangana', zone: 'metro', lat: 17.4401, lng: 78.3489, densityPerKm2: 7000  },
  { pincode: '500047', locality: 'Manikonda',         district: 'Rangareddy',       state: 'Telangana', zone: 'metro', lat: 17.4040, lng: 78.3827, densityPerKm2: 12000 },
  { pincode: '500050', locality: 'SR Nagar',          district: 'Hyderabad',        state: 'Telangana', zone: 'metro', lat: 17.4388, lng: 78.4408, densityPerKm2: 20000 },
  { pincode: '500021', locality: 'Kukatpally',        district: 'Medchal-Malkajgiri', state: 'Telangana', zone: 'metro', lat: 17.4948, lng: 78.3996, densityPerKm2: 16000 },
  { pincode: '500045', locality: 'Kondapur',          district: 'Medchal-Malkajgiri', state: 'Telangana', zone: 'metro', lat: 17.4690, lng: 78.3731, densityPerKm2: 11000 },

  // ── Chennai ────────────────────────────────────────────────────────────────
  { pincode: '600001', locality: 'Chennai GPO',       district: 'Chennai',          state: 'Tamil Nadu', zone: 'metro', lat: 13.0827, lng: 80.2707, densityPerKm2: 32000 },
  { pincode: '600003', locality: 'Nungambakkam',      district: 'Chennai',          state: 'Tamil Nadu', zone: 'metro', lat: 13.0574, lng: 80.2406, densityPerKm2: 22000 },
  { pincode: '600010', locality: 'Adyar',             district: 'Chennai',          state: 'Tamil Nadu', zone: 'metro', lat: 12.9955, lng: 80.2565, densityPerKm2: 18000 },
  { pincode: '600013', locality: 'Mylapore',          district: 'Chennai',          state: 'Tamil Nadu', zone: 'metro', lat: 13.0368, lng: 80.2676, densityPerKm2: 28000 },
  { pincode: '600016', locality: 'T Nagar',           district: 'Chennai',          state: 'Tamil Nadu', zone: 'metro', lat: 13.0401, lng: 80.2337, densityPerKm2: 35000 },
  { pincode: '600020', locality: 'Vadapalani',        district: 'Chennai',          state: 'Tamil Nadu', zone: 'metro', lat: 13.0524, lng: 80.2120, densityPerKm2: 30000 },
  { pincode: '600024', locality: 'Anna Nagar',        district: 'Chennai',          state: 'Tamil Nadu', zone: 'metro', lat: 13.0850, lng: 80.2101, densityPerKm2: 19000 },
  { pincode: '600040', locality: 'Velachery',         district: 'Chennai',          state: 'Tamil Nadu', zone: 'metro', lat: 12.9791, lng: 80.2199, densityPerKm2: 17000 },
  { pincode: '600041', locality: 'Meenambakkam',      district: 'Chennai',          state: 'Tamil Nadu', zone: 'metro', lat: 12.9856, lng: 80.1629, densityPerKm2: 8000  },
  { pincode: '600044', locality: 'Perambur',          district: 'Chennai',          state: 'Tamil Nadu', zone: 'metro', lat: 13.1143, lng: 80.2454, densityPerKm2: 26000 },
  { pincode: '600057', locality: 'Besant Nagar',      district: 'Chennai',          state: 'Tamil Nadu', zone: 'metro', lat: 12.9998, lng: 80.2747, densityPerKm2: 12000 },
  { pincode: '600060', locality: 'Tambaram',          district: 'Kancheepuram',     state: 'Tamil Nadu', zone: 'urban', lat: 12.9248, lng: 80.1318, densityPerKm2: 9000  },
  { pincode: '600077', locality: 'Thoraipakkam',      district: 'Chennai',          state: 'Tamil Nadu', zone: 'metro', lat: 12.9377, lng: 80.2289, densityPerKm2: 10000 },
  { pincode: '600096', locality: 'Sriperumbudur',     district: 'Kancheepuram',     state: 'Tamil Nadu', zone: 'urban', lat: 12.9666, lng: 79.9437, densityPerKm2: 3500  },
  { pincode: '600099', locality: 'Kelambakkam',       district: 'Kancheepuram',     state: 'Tamil Nadu', zone: 'semi-urban', lat: 12.7940, lng: 80.2204, densityPerKm2: 2000 },

  // ── Kolkata ────────────────────────────────────────────────────────────────
  { pincode: '700001', locality: 'Dalhousie',         district: 'Kolkata',          state: 'West Bengal', zone: 'metro', lat: 22.5726, lng: 88.3639, densityPerKm2: 35000 },
  { pincode: '700004', locality: 'Bhowanipore',       district: 'Kolkata',          state: 'West Bengal', zone: 'metro', lat: 22.5337, lng: 88.3416, densityPerKm2: 40000 },
  { pincode: '700006', locality: 'Ballygunge',        district: 'Kolkata',          state: 'West Bengal', zone: 'metro', lat: 22.5264, lng: 88.3676, densityPerKm2: 32000 },
  { pincode: '700009', locality: 'Park Street',       district: 'Kolkata',          state: 'West Bengal', zone: 'metro', lat: 22.5514, lng: 88.3596, densityPerKm2: 28000 },
  { pincode: '700010', locality: 'Kasba',             district: 'Kolkata',          state: 'West Bengal', zone: 'metro', lat: 22.5108, lng: 88.3900, densityPerKm2: 26000 },
  { pincode: '700013', locality: 'Ekbalpore',         district: 'Kolkata',          state: 'West Bengal', zone: 'metro', lat: 22.5492, lng: 88.3426, densityPerKm2: 42000 },
  { pincode: '700016', locality: 'Lake Town',         district: 'Kolkata',          state: 'West Bengal', zone: 'metro', lat: 22.5903, lng: 88.4003, densityPerKm2: 22000 },
  { pincode: '700019', locality: 'Maniktala',         district: 'Kolkata',          state: 'West Bengal', zone: 'metro', lat: 22.5940, lng: 88.3805, densityPerKm2: 38000 },
  { pincode: '700022', locality: 'Jadavpur',          district: 'Kolkata',          state: 'West Bengal', zone: 'metro', lat: 22.4969, lng: 88.3803, densityPerKm2: 25000 },
  { pincode: '700023', locality: 'Gariahat',          district: 'Kolkata',          state: 'West Bengal', zone: 'metro', lat: 22.5162, lng: 88.3663, densityPerKm2: 28000 },
  { pincode: '700030', locality: 'Behala',            district: 'Kolkata',          state: 'West Bengal', zone: 'metro', lat: 22.4911, lng: 88.3091, densityPerKm2: 22000 },
  { pincode: '700039', locality: 'Baranagar',         district: 'North 24 Parganas', state: 'West Bengal', zone: 'metro', lat: 22.6469, lng: 88.3752, densityPerKm2: 20000 },
  { pincode: '700040', locality: 'Dakshineswar',      district: 'North 24 Parganas', state: 'West Bengal', zone: 'metro', lat: 22.6603, lng: 88.3579, densityPerKm2: 15000 },
  { pincode: '700041', locality: 'Garden Reach',      district: 'Kolkata',          state: 'West Bengal', zone: 'metro', lat: 22.5416, lng: 88.3046, densityPerKm2: 30000 },
  { pincode: '700045', locality: 'Sonarpur',          district: 'South 24 Parganas', state: 'West Bengal', zone: 'urban', lat: 22.4301, lng: 88.4124, densityPerKm2: 6000 },

  // ── Pune (urban) ───────────────────────────────────────────────────────────
  { pincode: '411001', locality: 'Pune Camp',         district: 'Pune',             state: 'Maharashtra', zone: 'urban', lat: 18.5204, lng: 73.8567, densityPerKm2: 16000 },
  { pincode: '411002', locality: 'Deccan Gymkhana',   district: 'Pune',             state: 'Maharashtra', zone: 'urban', lat: 18.5158, lng: 73.8406, densityPerKm2: 18000 },
  { pincode: '411004', locality: 'Shivajinagar',      district: 'Pune',             state: 'Maharashtra', zone: 'urban', lat: 18.5299, lng: 73.8453, densityPerKm2: 14000 },
  { pincode: '411007', locality: 'Parvati',           district: 'Pune',             state: 'Maharashtra', zone: 'urban', lat: 18.4896, lng: 73.8474, densityPerKm2: 12000 },
  { pincode: '411028', locality: 'Kothrud',           district: 'Pune',             state: 'Maharashtra', zone: 'urban', lat: 18.5074, lng: 73.8077, densityPerKm2: 10000 },

  // ── Ahmedabad (urban) ─────────────────────────────────────────────────────
  { pincode: '380001', locality: 'Ahmedabad GPO',     district: 'Ahmedabad',        state: 'Gujarat',     zone: 'urban', lat: 23.0225, lng: 72.5714, densityPerKm2: 22000 },
  { pincode: '380004', locality: 'Maninagar',         district: 'Ahmedabad',        state: 'Gujarat',     zone: 'urban', lat: 22.9918, lng: 72.6037, densityPerKm2: 18000 },
  { pincode: '380007', locality: 'Navrangpura',       district: 'Ahmedabad',        state: 'Gujarat',     zone: 'urban', lat: 23.0433, lng: 72.5585, densityPerKm2: 15000 },
  { pincode: '380015', locality: 'Satellite',         district: 'Ahmedabad',        state: 'Gujarat',     zone: 'urban', lat: 23.0209, lng: 72.5264, densityPerKm2: 12000 },
  { pincode: '380052', locality: 'Bopal',             district: 'Ahmedabad',        state: 'Gujarat',     zone: 'semi-urban', lat: 23.0233, lng: 72.4686, densityPerKm2: 4000 },
];

/** Unique metros in the dataset — used to compute per-metro Voronoi bboxes */
export const METRO_BBOXES: Record<string, [number, number, number, number]> = {
  Delhi:       [76.80, 28.40, 77.55, 29.00],
  Mumbai:      [72.70, 18.85, 73.35, 19.55],
  Bangalore:   [77.40, 12.75, 77.85, 13.25],
  Hyderabad:   [78.28, 17.15, 78.65, 17.60],
  Chennai:     [79.80, 12.65, 80.40, 13.35],
  Kolkata:     [88.20, 22.35, 88.55, 22.75],
  Pune:        [73.75, 18.40, 74.05, 18.65],
  Ahmedabad:   [72.40, 22.90, 72.70, 23.15],
};
