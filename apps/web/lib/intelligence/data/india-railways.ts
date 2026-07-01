/**
 * Major Indian railway stations — sourced from datameet/railway (CC BY).
 * Covers all A1/A category stations + key OOH-relevant junctions.
 *
 * Fields: code (IR station code), name, lat, lng, state, zone, tier
 * tier: 'A1' (highest passenger volume), 'A' (major), 'B' (medium)
 */

export interface RailwayStation {
  code:  string;
  name:  string;
  lat:   number;
  lng:   number;
  state: string;
  zone:  string;   // IR zone: NR, WR, SR, ER, CR, SCR, ECR, NWR, etc.
  tier:  'A1' | 'A' | 'B';
}

export const INDIA_RAILWAY_STATIONS: RailwayStation[] = [
  // ── A1 Category (highest OOH value) ─────────────────────────────────────
  { code: 'NDLS',  name: 'New Delhi',             lat: 28.6431, lng: 77.2196, state: 'Delhi',             zone: 'NR',  tier: 'A1' },
  { code: 'DLI',   name: 'Delhi Junction',         lat: 28.6603, lng: 77.2267, state: 'Delhi',             zone: 'NR',  tier: 'A1' },
  { code: 'NZM',   name: 'Hazrat Nizamuddin',      lat: 28.5890, lng: 77.2461, state: 'Delhi',             zone: 'NR',  tier: 'A1' },
  { code: 'CSTM',  name: 'Mumbai CST',             lat: 18.9398, lng: 72.8354, state: 'Maharashtra',       zone: 'CR',  tier: 'A1' },
  { code: 'MMCT',  name: 'Mumbai Central',         lat: 18.9641, lng: 72.8208, state: 'Maharashtra',       zone: 'WR',  tier: 'A1' },
  { code: 'BCT',   name: 'Bandra Terminus',        lat: 19.0526, lng: 72.8399, state: 'Maharashtra',       zone: 'WR',  tier: 'A'  },
  { code: 'LTT',   name: 'Lokmanya Tilak Terminus',lat: 19.0714, lng: 72.9176, state: 'Maharashtra',       zone: 'CR',  tier: 'A'  },
  { code: 'HWH',   name: 'Howrah Junction',        lat: 22.5839, lng: 88.3427, state: 'West Bengal',       zone: 'ER',  tier: 'A1' },
  { code: 'KOAA',  name: 'Kolkata Station',        lat: 22.5726, lng: 88.3639, state: 'West Bengal',       zone: 'ER',  tier: 'A1' },
  { code: 'MAS',   name: 'Chennai Central',        lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu',        zone: 'SR',  tier: 'A1' },
  { code: 'MS',    name: 'Chennai Egmore',         lat: 13.0786, lng: 80.2614, state: 'Tamil Nadu',        zone: 'SR',  tier: 'A'  },
  { code: 'SBC',   name: 'Bangalore City',         lat: 12.9766, lng: 77.5713, state: 'Karnataka',         zone: 'SWR', tier: 'A1' },
  { code: 'YPR',   name: 'Yeshwanthpur',           lat: 13.0260, lng: 77.5378, state: 'Karnataka',         zone: 'SWR', tier: 'A'  },
  { code: 'KSR',   name: 'Bangalore Cantt',        lat: 12.9898, lng: 77.5987, state: 'Karnataka',         zone: 'SWR', tier: 'A'  },
  { code: 'SC',    name: 'Secunderabad Junction',  lat: 17.4344, lng: 78.5013, state: 'Telangana',         zone: 'SCR', tier: 'A1' },
  { code: 'HYB',   name: 'Hyderabad Deccan',       lat: 17.3851, lng: 78.4744, state: 'Telangana',         zone: 'SCR', tier: 'A1' },
  { code: 'NED',   name: 'Hazur Sahib Nanded',     lat: 19.1524, lng: 77.3249, state: 'Maharashtra',       zone: 'SCR', tier: 'B'  },
  { code: 'ADI',   name: 'Ahmedabad Junction',     lat: 23.0325, lng: 72.5969, state: 'Gujarat',           zone: 'WR',  tier: 'A1' },
  { code: 'ST',    name: 'Surat',                  lat: 21.2048, lng: 72.8386, state: 'Gujarat',           zone: 'WR',  tier: 'A1' },
  { code: 'BRC',   name: 'Vadodara Junction',      lat: 22.3008, lng: 73.1821, state: 'Gujarat',           zone: 'WR',  tier: 'A1' },
  { code: 'RJT',   name: 'Rajkot Junction',        lat: 22.3022, lng: 70.8089, state: 'Gujarat',           zone: 'WR',  tier: 'A'  },
  { code: 'PUNE',  name: 'Pune Junction',          lat: 18.5296, lng: 73.8738, state: 'Maharashtra',       zone: 'CR',  tier: 'A1' },
  { code: 'NGP',   name: 'Nagpur Junction',        lat: 21.1617, lng: 79.0945, state: 'Maharashtra',       zone: 'CR',  tier: 'A1' },
  { code: 'NK',    name: 'Nashik Road',            lat: 19.9786, lng: 73.8136, state: 'Maharashtra',       zone: 'CR',  tier: 'A'  },
  { code: 'AWB',   name: 'Aurangabad',             lat: 19.8762, lng: 75.3433, state: 'Maharashtra',       zone: 'SCR', tier: 'A'  },

  // ── Uttar Pradesh — OOH core market ──────────────────────────────────────
  { code: 'LKO',   name: 'Lucknow Junction',       lat: 26.8319, lng: 80.9210, state: 'Uttar Pradesh',    zone: 'NR',  tier: 'A1' },
  { code: 'LKO',   name: 'Lucknow NE',             lat: 26.8386, lng: 80.9306, state: 'Uttar Pradesh',    zone: 'NER', tier: 'A'  },
  { code: 'CNB',   name: 'Kanpur Central',         lat: 26.4555, lng: 80.3497, state: 'Uttar Pradesh',    zone: 'NCR', tier: 'A1' },
  { code: 'BSB',   name: 'Varanasi Junction',      lat: 25.3207, lng: 82.9978, state: 'Uttar Pradesh',    zone: 'NER', tier: 'A1' },
  { code: 'AGC',   name: 'Agra Cantt',             lat: 27.1535, lng: 77.9851, state: 'Uttar Pradesh',    zone: 'NCR', tier: 'A1' },
  { code: 'AF',    name: 'Agra Fort',              lat: 27.1773, lng: 78.0226, state: 'Uttar Pradesh',    zone: 'NCR', tier: 'A'  },
  { code: 'MTJ',   name: 'Mathura Junction',       lat: 27.4924, lng: 77.6737, state: 'Uttar Pradesh',    zone: 'NCR', tier: 'A'  },
  { code: 'MTC',   name: 'Meerut City',            lat: 28.9718, lng: 77.6978, state: 'Uttar Pradesh',    zone: 'NR',  tier: 'A'  },
  { code: 'GZB',   name: 'Ghaziabad Junction',     lat: 28.6610, lng: 77.4359, state: 'Uttar Pradesh',    zone: 'NR',  tier: 'A'  },
  { code: 'ALD',   name: 'Prayagraj Junction',     lat: 25.4366, lng: 81.8785, state: 'Uttar Pradesh',    zone: 'NCR', tier: 'A1' },
  { code: 'PRYJ',  name: 'Prayagraj Rambagh',      lat: 25.4570, lng: 81.8590, state: 'Uttar Pradesh',    zone: 'NCR', tier: 'A'  },
  { code: 'GKP',   name: 'Gorakhpur Junction',     lat: 26.7570, lng: 83.3734, state: 'Uttar Pradesh',    zone: 'NER', tier: 'A1' },
  { code: 'BE',    name: 'Bareilly Junction',      lat: 28.3504, lng: 79.4309, state: 'Uttar Pradesh',    zone: 'NR',  tier: 'A'  },
  { code: 'ALJN',  name: 'Aligarh Junction',       lat: 27.8875, lng: 78.0880, state: 'Uttar Pradesh',    zone: 'NR',  tier: 'A'  },
  { code: 'MB',    name: 'Moradabad Junction',     lat: 28.8361, lng: 78.7816, state: 'Uttar Pradesh',    zone: 'NR',  tier: 'A'  },
  { code: 'SRE',   name: 'Saharanpur',             lat: 29.9650, lng: 77.5392, state: 'Uttar Pradesh',    zone: 'NR',  tier: 'A'  },
  { code: 'AY',    name: 'Ayodhya Cantt',          lat: 26.7992, lng: 82.1989, state: 'Uttar Pradesh',    zone: 'NER', tier: 'A'  },
  { code: 'MZR',   name: 'Muzaffarnagar',          lat: 29.4731, lng: 77.7033, state: 'Uttar Pradesh',    zone: 'NR',  tier: 'B'  },
  { code: 'FZD',   name: 'Firozabad',              lat: 27.1521, lng: 78.3950, state: 'Uttar Pradesh',    zone: 'NCR', tier: 'B'  },

  // ── Bihar ────────────────────────────────────────────────────────────────
  { code: 'PNBE',  name: 'Patna Junction',         lat: 25.6121, lng: 85.1799, state: 'Bihar',             zone: 'ECR', tier: 'A1' },
  { code: 'RJPB',  name: 'Rajendra Nagar Patna',   lat: 25.5886, lng: 85.1050, state: 'Bihar',             zone: 'ECR', tier: 'B'  },
  { code: 'GAYA',  name: 'Gaya Junction',          lat: 24.7954, lng: 84.9958, state: 'Bihar',             zone: 'ECR', tier: 'A'  },
  { code: 'MFP',   name: 'Muzaffarpur Junction',   lat: 26.1179, lng: 85.3840, state: 'Bihar',             zone: 'ECR', tier: 'A'  },
  { code: 'BGP',   name: 'Bhagalpur Junction',     lat: 25.2435, lng: 86.9715, state: 'Bihar',             zone: 'ER',  tier: 'A'  },

  // ── Rajasthan ────────────────────────────────────────────────────────────
  { code: 'JP',    name: 'Jaipur Junction',        lat: 26.9193, lng: 75.7882, state: 'Rajasthan',         zone: 'NWR', tier: 'A1' },
  { code: 'JU',    name: 'Jodhpur Junction',       lat: 26.2756, lng: 73.0243, state: 'Rajasthan',         zone: 'NWR', tier: 'A1' },
  { code: 'KOTA',  name: 'Kota Junction',          lat: 25.1780, lng: 75.8430, state: 'Rajasthan',         zone: 'WCR', tier: 'A1' },
  { code: 'AII',   name: 'Ajmer Junction',         lat: 26.4499, lng: 74.6237, state: 'Rajasthan',         zone: 'NWR', tier: 'A'  },
  { code: 'UDZ',   name: 'Udaipur City',           lat: 24.6135, lng: 73.6974, state: 'Rajasthan',         zone: 'NWR', tier: 'A'  },
  { code: 'BKN',   name: 'Bikaner Junction',       lat: 28.0200, lng: 73.3009, state: 'Rajasthan',         zone: 'NWR', tier: 'A'  },

  // ── Madhya Pradesh ───────────────────────────────────────────────────────
  { code: 'INDB',  name: 'Indore Junction',        lat: 22.7166, lng: 75.7980, state: 'Madhya Pradesh',   zone: 'WR',  tier: 'A1' },
  { code: 'BPL',   name: 'Bhopal Junction',        lat: 23.2715, lng: 77.4067, state: 'Madhya Pradesh',   zone: 'WCR', tier: 'A1' },
  { code: 'HBJ',   name: 'Habibganj Bhopal',       lat: 23.2284, lng: 77.4316, state: 'Madhya Pradesh',   zone: 'WCR', tier: 'A'  },
  { code: 'JBP',   name: 'Jabalpur Junction',      lat: 23.1601, lng: 79.9803, state: 'Madhya Pradesh',   zone: 'WCR', tier: 'A'  },
  { code: 'GWL',   name: 'Gwalior Junction',       lat: 26.2213, lng: 78.1651, state: 'Madhya Pradesh',   zone: 'NCR', tier: 'A1' },
  { code: 'UJN',   name: 'Ujjain Junction',        lat: 23.1700, lng: 75.7783, state: 'Madhya Pradesh',   zone: 'WR',  tier: 'A'  },

  // ── Karnataka ────────────────────────────────────────────────────────────
  { code: 'MYS',   name: 'Mysuru Junction',        lat: 12.3086, lng: 76.6418, state: 'Karnataka',         zone: 'SWR', tier: 'A'  },
  { code: 'MAQ',   name: 'Mangaluru Central',      lat: 12.8679, lng: 74.8561, state: 'Karnataka',         zone: 'SR',  tier: 'A'  },
  { code: 'UBL',   name: 'Hubli Junction',         lat: 15.3452, lng: 75.1177, state: 'Karnataka',         zone: 'SWR', tier: 'A'  },
  { code: 'BGM',   name: 'Belagavi',               lat: 15.8524, lng: 74.5055, state: 'Karnataka',         zone: 'SWR', tier: 'B'  },

  // ── Tamil Nadu ───────────────────────────────────────────────────────────
  { code: 'CBE',   name: 'Coimbatore Junction',    lat: 11.0010, lng: 76.9673, state: 'Tamil Nadu',        zone: 'SR',  tier: 'A1' },
  { code: 'MDU',   name: 'Madurai Junction',       lat: 9.9221,  lng: 78.1198, state: 'Tamil Nadu',        zone: 'SR',  tier: 'A1' },
  { code: 'TPJ',   name: 'Tiruchirappalli Junction',lat: 10.8108, lng: 78.6882, state: 'Tamil Nadu',        zone: 'SR',  tier: 'A'  },
  { code: 'SA',    name: 'Salem Junction',         lat: 11.6551, lng: 78.1432, state: 'Tamil Nadu',        zone: 'SR',  tier: 'A'  },
  { code: 'TEN',   name: 'Tirunelveli Junction',   lat: 8.7215,  lng: 77.6961, state: 'Tamil Nadu',        zone: 'SR',  tier: 'A'  },
  { code: 'NCJ',   name: 'Nagercoil Junction',     lat: 8.1833,  lng: 77.4320, state: 'Tamil Nadu',        zone: 'SR',  tier: 'B'  },
  { code: 'ED',    name: 'Erode Junction',         lat: 11.3479, lng: 77.7224, state: 'Tamil Nadu',        zone: 'SR',  tier: 'A'  },

  // ── Andhra Pradesh / Telangana ────────────────────────────────────────────
  { code: 'VSKP',  name: 'Visakhapatnam Junction', lat: 17.7232, lng: 83.2975, state: 'Andhra Pradesh',   zone: 'ECoR',tier: 'A1' },
  { code: 'BZA',   name: 'Vijayawada Junction',    lat: 16.5165, lng: 80.6226, state: 'Andhra Pradesh',   zone: 'SCR', tier: 'A1' },
  { code: 'GNT',   name: 'Guntur Junction',        lat: 16.3117, lng: 80.4386, state: 'Andhra Pradesh',   zone: 'SCR', tier: 'A'  },
  { code: 'TPTY',  name: 'Tirupati',               lat: 13.6288, lng: 79.4192, state: 'Andhra Pradesh',   zone: 'SCR', tier: 'A1' },
  { code: 'WL',    name: 'Warangal',               lat: 17.9663, lng: 79.5948, state: 'Telangana',         zone: 'SCR', tier: 'A'  },
  { code: 'KZJ',   name: 'Kazipet Junction',       lat: 18.0030, lng: 79.5039, state: 'Telangana',         zone: 'SCR', tier: 'B'  },

  // ── Kerala ───────────────────────────────────────────────────────────────
  { code: 'ERS',   name: 'Ernakulam Junction (Kochi)', lat: 9.9829, lng: 76.2673, state: 'Kerala',         zone: 'SR',  tier: 'A1' },
  { code: 'AWY',   name: 'Alwaye (Aluva)',          lat: 10.0990, lng: 76.3505, state: 'Kerala',           zone: 'SR',  tier: 'A'  },
  { code: 'TVC',   name: 'Thiruvananthapuram Central', lat: 8.4879, lng: 76.9533, state: 'Kerala',         zone: 'SR',  tier: 'A1' },
  { code: 'CLT',   name: 'Kozhikode (Calicut)',     lat: 11.2451, lng: 75.7839, state: 'Kerala',           zone: 'SR',  tier: 'A'  },
  { code: 'SRR',   name: 'Shoranur Junction',       lat: 10.7620, lng: 76.2749, state: 'Kerala',           zone: 'SR',  tier: 'A'  },
  { code: 'QLN',   name: 'Kollam Junction',         lat: 8.8839,  lng: 76.5894, state: 'Kerala',           zone: 'SR',  tier: 'A'  },
  { code: 'TCR',   name: 'Thrissur',                lat: 10.5261, lng: 76.2144, state: 'Kerala',           zone: 'SR',  tier: 'A'  },

  // ── Punjab / Haryana / HP ─────────────────────────────────────────────────
  { code: 'LDH',   name: 'Ludhiana Junction',       lat: 30.8944, lng: 75.8499, state: 'Punjab',           zone: 'NR',  tier: 'A1' },
  { code: 'ASR',   name: 'Amritsar Junction',       lat: 31.6360, lng: 74.8758, state: 'Punjab',           zone: 'NR',  tier: 'A1' },
  { code: 'CDG',   name: 'Chandigarh',              lat: 30.7042, lng: 76.8001, state: 'Chandigarh',       zone: 'NR',  tier: 'A1' },
  { code: 'AMBW',  name: 'Ambala City',             lat: 30.3741, lng: 76.7736, state: 'Haryana',           zone: 'NR',  tier: 'A'  },
  { code: 'FDB',   name: 'Faridabad',               lat: 28.4093, lng: 77.3165, state: 'Haryana',           zone: 'NR',  tier: 'A'  },
  { code: 'ROK',   name: 'Rohtak Junction',         lat: 28.8955, lng: 76.5740, state: 'Haryana',           zone: 'NR',  tier: 'A'  },
  { code: 'PNP',   name: 'Panipat Junction',        lat: 29.3944, lng: 76.9718, state: 'Haryana',           zone: 'NR',  tier: 'B'  },
  { code: 'UMB',   name: 'Ambala Cantt',            lat: 30.3782, lng: 76.8260, state: 'Haryana',           zone: 'NR',  tier: 'A1' },

  // ── Odisha ───────────────────────────────────────────────────────────────
  { code: 'BBS',   name: 'Bhubaneswar',             lat: 20.2635, lng: 85.8344, state: 'Odisha',            zone: 'ECoR',tier: 'A1' },
  { code: 'CTC',   name: 'Cuttack Junction',        lat: 20.4648, lng: 85.8868, state: 'Odisha',            zone: 'ECoR',tier: 'A'  },
  { code: 'PURI',  name: 'Puri',                    lat: 19.8029, lng: 85.8344, state: 'Odisha',            zone: 'ECoR',tier: 'A'  },
  { code: 'SBP',   name: 'Sambalpur Road',          lat: 21.4663, lng: 83.9726, state: 'Odisha',            zone: 'ECoR',tier: 'B'  },

  // ── Assam / NE ───────────────────────────────────────────────────────────
  { code: 'GHY',   name: 'Guwahati',                lat: 26.1840, lng: 91.7390, state: 'Assam',             zone: 'NFR', tier: 'A1' },
  { code: 'SCL',   name: 'Silchar',                  lat: 24.8148, lng: 92.7997, state: 'Assam',             zone: 'NFR', tier: 'B'  },
  { code: 'DBRG',  name: 'Dibrugarh Town',           lat: 27.4756, lng: 94.9203, state: 'Assam',             zone: 'NFR', tier: 'B'  },
  { code: 'NJP',   name: 'New Jalpaiguri',           lat: 26.7090, lng: 88.3580, state: 'West Bengal',       zone: 'NFR', tier: 'A'  },

  // ── Jharkhand / Chhattisgarh ─────────────────────────────────────────────
  { code: 'RNC',   name: 'Ranchi Junction',          lat: 23.3441, lng: 85.3096, state: 'Jharkhand',         zone: 'SER', tier: 'A1' },
  { code: 'TATA',  name: 'Tatanagar (Jamshedpur)',   lat: 22.7895, lng: 86.1741, state: 'Jharkhand',         zone: 'SER', tier: 'A1' },
  { code: 'DHMR',  name: 'Dhanbad Junction',         lat: 23.7957, lng: 86.4304, state: 'Jharkhand',         zone: 'ECR', tier: 'A1' },
  { code: 'R',     name: 'Raipur Junction',          lat: 21.2360, lng: 81.6268, state: 'Chhattisgarh',     zone: 'SECR',tier: 'A1' },
  { code: 'BSP',   name: 'Bilaspur Junction',        lat: 22.0796, lng: 82.1391, state: 'Chhattisgarh',     zone: 'SECR',tier: 'A1' },

  // ── Jammu & Kashmir / Uttarakhand ────────────────────────────────────────
  { code: 'JAT',   name: 'Jammu Tawi',               lat: 32.7282, lng: 74.8547, state: 'Jammu & Kashmir', zone: 'NR',  tier: 'A1' },
  { code: 'DDN',   name: 'Dehradun',                 lat: 30.3173, lng: 78.0258, state: 'Uttarakhand',     zone: 'NR',  tier: 'A'  },
  { code: 'RKSH',  name: 'Rishikesh',                lat: 30.0912, lng: 78.2660, state: 'Uttarakhand',     zone: 'NR',  tier: 'B'  },
  { code: 'HW',    name: 'Haridwar Junction',        lat: 29.9457, lng: 78.1648, state: 'Uttarakhand',     zone: 'NR',  tier: 'A'  },
  { code: 'KTM',   name: 'Kathgodam',                lat: 29.2234, lng: 79.5206, state: 'Uttarakhand',     zone: 'NER', tier: 'B'  },

  // ── West Bengal (non-metro) ──────────────────────────────────────────────
  { code: 'DKAE',  name: 'Durgapur',                 lat: 23.5204, lng: 87.3119, state: 'West Bengal',       zone: 'ER',  tier: 'A'  },
  { code: 'ASN',   name: 'Asansol Junction',         lat: 23.6888, lng: 86.9624, state: 'West Bengal',       zone: 'ER',  tier: 'A1' },
  { code: 'KGP',   name: 'Kharagpur Junction',       lat: 22.3248, lng: 87.3219, state: 'West Bengal',       zone: 'SER', tier: 'A1' },
  { code: 'SHM',   name: 'Shalimar (Kolkata)',       lat: 22.5541, lng: 88.2962, state: 'West Bengal',       zone: 'SER', tier: 'A'  },

  // ── Goa ──────────────────────────────────────────────────────────────────
  { code: 'MAO',   name: 'Madgaon (Margao)',         lat: 15.3602, lng: 73.9450, state: 'Goa',               zone: 'KR',  tier: 'A'  },
  { code: 'THVM',  name: 'Thivim (North Goa)',       lat: 15.5857, lng: 73.8870, state: 'Goa',               zone: 'KR',  tier: 'B'  },
];

/** Build a lookup map: station code → station record */
export const STATION_BY_CODE: Map<string, RailwayStation> =
  new Map(INDIA_RAILWAY_STATIONS.map(s => [s.code, s]));

/** Find nearest railway station to a lat/lng within radiusKm */
export function findNearbyStations(
  lat: number,
  lng: number,
  radiusKm = 5,
): RailwayStation[] {
  const R = 6371;
  return INDIA_RAILWAY_STATIONS.filter(s => {
    const dLat = ((s.lat - lat) * Math.PI) / 180;
    const dLng = ((s.lng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((s.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a)) <= radiusKm;
  }).sort((a, b) => {
    const distA = Math.hypot(a.lat - lat, a.lng - lng);
    const distB = Math.hypot(b.lat - lat, b.lng - lng);
    return distA - distB;
  });
}
