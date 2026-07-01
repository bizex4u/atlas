/**
 * Comprehensive India T2/T3 city pincode dataset.
 * Covers all major OOH markets outside the 8 indexed metros.
 *
 * Priority coverage: Uttar Pradesh (BIZEX4U core market), Bihar, Rajasthan,
 * MP, Gujarat, Maharashtra, Karnataka, Tamil Nadu, AP/TS, Kerala, Punjab/HR.
 *
 * Coordinates: India Post directory + OpenStreetMap centroids.
 * Density: Census 2011 district data + urban agglomeration estimates.
 */

import type { RawPincodeEntry } from './metro-pincodes';

export const T2_CITY_PINCODES: RawPincodeEntry[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // UTTAR PRADESH — core OOH market
  // ════════════════════════════════════════════════════════════════════════════

  // Lucknow (state capital, T2 stronghold)
  { pincode: '226001', locality: 'Hazratganj',         district: 'Lucknow',      state: 'Uttar Pradesh', zone: 'urban', lat: 26.8505, lng: 80.9490, densityPerKm2: 24000 },
  { pincode: '226003', locality: 'Aliganj',            district: 'Lucknow',      state: 'Uttar Pradesh', zone: 'urban', lat: 26.8786, lng: 80.9520, densityPerKm2: 16000 },
  { pincode: '226004', locality: 'Aminabad',           district: 'Lucknow',      state: 'Uttar Pradesh', zone: 'urban', lat: 26.8559, lng: 80.9354, densityPerKm2: 28000 },
  { pincode: '226005', locality: 'Gomti Nagar',        district: 'Lucknow',      state: 'Uttar Pradesh', zone: 'urban', lat: 26.8559, lng: 80.9953, densityPerKm2: 12000 },
  { pincode: '226006', locality: 'Mahanagar',          district: 'Lucknow',      state: 'Uttar Pradesh', zone: 'urban', lat: 26.8787, lng: 80.9813, densityPerKm2: 18000 },
  { pincode: '226010', locality: 'Indira Nagar',       district: 'Lucknow',      state: 'Uttar Pradesh', zone: 'urban', lat: 26.8797, lng: 81.0070, densityPerKm2: 14000 },
  { pincode: '226012', locality: 'Charbagh',           district: 'Lucknow',      state: 'Uttar Pradesh', zone: 'urban', lat: 26.8429, lng: 80.9216, densityPerKm2: 22000 },
  { pincode: '226016', locality: 'Alambagh',           district: 'Lucknow',      state: 'Uttar Pradesh', zone: 'urban', lat: 26.8115, lng: 80.9108, densityPerKm2: 18000 },
  { pincode: '226020', locality: 'Chinhat',            district: 'Lucknow',      state: 'Uttar Pradesh', zone: 'semi-urban', lat: 26.8764, lng: 81.0613, densityPerKm2: 6000  },
  { pincode: '226022', locality: 'Jankipuram',         district: 'Lucknow',      state: 'Uttar Pradesh', zone: 'urban', lat: 26.9050, lng: 80.9703, densityPerKm2: 10000 },

  // Kanpur (industrial heartland)
  { pincode: '208001', locality: 'Kanpur GPO',         district: 'Kanpur Nagar', state: 'Uttar Pradesh', zone: 'urban', lat: 26.4640, lng: 80.3502, densityPerKm2: 26000 },
  { pincode: '208002', locality: 'Nawabganj',          district: 'Kanpur Nagar', state: 'Uttar Pradesh', zone: 'urban', lat: 26.4695, lng: 80.3367, densityPerKm2: 24000 },
  { pincode: '208003', locality: 'Swaroop Nagar',      district: 'Kanpur Nagar', state: 'Uttar Pradesh', zone: 'urban', lat: 26.4985, lng: 80.3215, densityPerKm2: 18000 },
  { pincode: '208004', locality: 'Kidwai Nagar',       district: 'Kanpur Nagar', state: 'Uttar Pradesh', zone: 'urban', lat: 26.4551, lng: 80.3234, densityPerKm2: 20000 },
  { pincode: '208007', locality: 'Civil Lines',        district: 'Kanpur Nagar', state: 'Uttar Pradesh', zone: 'urban', lat: 26.4680, lng: 80.3592, densityPerKm2: 14000 },
  { pincode: '208010', locality: 'Kalyanpur',          district: 'Kanpur Nagar', state: 'Uttar Pradesh', zone: 'urban', lat: 26.5067, lng: 80.2985, densityPerKm2: 12000 },
  { pincode: '208011', locality: 'Harsh Nagar',        district: 'Kanpur Nagar', state: 'Uttar Pradesh', zone: 'urban', lat: 26.4368, lng: 80.3013, densityPerKm2: 16000 },
  { pincode: '208012', locality: 'Armapur',            district: 'Kanpur Nagar', state: 'Uttar Pradesh', zone: 'urban', lat: 26.4867, lng: 80.3786, densityPerKm2: 10000 },
  { pincode: '208014', locality: 'Shyam Nagar',        district: 'Kanpur Nagar', state: 'Uttar Pradesh', zone: 'urban', lat: 26.5141, lng: 80.3564, densityPerKm2: 11000 },
  { pincode: '208019', locality: 'Govind Nagar',       district: 'Kanpur Nagar', state: 'Uttar Pradesh', zone: 'urban', lat: 26.4429, lng: 80.3750, densityPerKm2: 19000 },
  { pincode: '208027', locality: 'Kakadeo',            district: 'Kanpur Nagar', state: 'Uttar Pradesh', zone: 'urban', lat: 26.4986, lng: 80.3152, densityPerKm2: 14000 },

  // Varanasi (spiritual + commercial)
  { pincode: '221001', locality: 'Varanasi GPO',       district: 'Varanasi',     state: 'Uttar Pradesh', zone: 'urban', lat: 25.3237, lng: 83.0002, densityPerKm2: 30000 },
  { pincode: '221002', locality: 'Lanka',              district: 'Varanasi',     state: 'Uttar Pradesh', zone: 'urban', lat: 25.2712, lng: 82.9890, densityPerKm2: 22000 },
  { pincode: '221003', locality: 'Sigra',              district: 'Varanasi',     state: 'Uttar Pradesh', zone: 'urban', lat: 25.3345, lng: 82.9846, densityPerKm2: 20000 },
  { pincode: '221004', locality: 'Shivpur',            district: 'Varanasi',     state: 'Uttar Pradesh', zone: 'urban', lat: 25.3587, lng: 82.9557, densityPerKm2: 14000 },
  { pincode: '221005', locality: 'Sarnath',            district: 'Varanasi',     state: 'Uttar Pradesh', zone: 'urban', lat: 25.3806, lng: 83.0233, densityPerKm2: 8000  },
  { pincode: '221010', locality: 'Assi',               district: 'Varanasi',     state: 'Uttar Pradesh', zone: 'urban', lat: 25.2806, lng: 82.9998, densityPerKm2: 18000 },

  // Agra (tourism + leather + OOH hotspot)
  { pincode: '282001', locality: 'Agra GPO',           district: 'Agra',         state: 'Uttar Pradesh', zone: 'urban', lat: 27.1767, lng: 78.0081, densityPerKm2: 22000 },
  { pincode: '282002', locality: 'Taj Ganj',           district: 'Agra',         state: 'Uttar Pradesh', zone: 'urban', lat: 27.1707, lng: 78.0416, densityPerKm2: 24000 },
  { pincode: '282003', locality: 'Kamla Nagar',        district: 'Agra',         state: 'Uttar Pradesh', zone: 'urban', lat: 27.1982, lng: 78.0182, densityPerKm2: 18000 },
  { pincode: '282004', locality: 'Shahganj',           district: 'Agra',         state: 'Uttar Pradesh', zone: 'urban', lat: 27.1877, lng: 77.9820, densityPerKm2: 20000 },
  { pincode: '282005', locality: 'Bodla',              district: 'Agra',         state: 'Uttar Pradesh', zone: 'urban', lat: 27.1423, lng: 77.9901, densityPerKm2: 12000 },
  { pincode: '282006', locality: 'Sikandara',          district: 'Agra',         state: 'Uttar Pradesh', zone: 'urban', lat: 27.2187, lng: 77.9674, densityPerKm2: 10000 },
  { pincode: '282010', locality: 'Fatehabad',          district: 'Agra',         state: 'Uttar Pradesh', zone: 'semi-urban', lat: 27.1291, lng: 78.0648, densityPerKm2: 5000  },

  // Meerut (NCR fringe, strong electronics retail)
  { pincode: '250001', locality: 'Meerut GPO',         district: 'Meerut',       state: 'Uttar Pradesh', zone: 'urban', lat: 28.9845, lng: 77.7064, densityPerKm2: 20000 },
  { pincode: '250002', locality: 'Ganga Nagar',        district: 'Meerut',       state: 'Uttar Pradesh', zone: 'urban', lat: 29.0040, lng: 77.6988, densityPerKm2: 16000 },
  { pincode: '250003', locality: 'Shastri Nagar',      district: 'Meerut',       state: 'Uttar Pradesh', zone: 'urban', lat: 28.9969, lng: 77.7120, densityPerKm2: 18000 },
  { pincode: '250004', locality: 'Pallavpuram',        district: 'Meerut',       state: 'Uttar Pradesh', zone: 'urban', lat: 28.9662, lng: 77.6756, densityPerKm2: 10000 },
  { pincode: '250005', locality: 'Hapur Road',         district: 'Meerut',       state: 'Uttar Pradesh', zone: 'semi-urban', lat: 28.9480, lng: 77.7434, densityPerKm2: 6000  },

  // Prayagraj / Allahabad (historical + academic)
  { pincode: '211001', locality: 'Prayagraj GPO',      district: 'Prayagraj',    state: 'Uttar Pradesh', zone: 'urban', lat: 25.4358, lng: 81.8463, densityPerKm2: 22000 },
  { pincode: '211002', locality: 'Civil Lines',        district: 'Prayagraj',    state: 'Uttar Pradesh', zone: 'urban', lat: 25.4494, lng: 81.8404, densityPerKm2: 10000 },
  { pincode: '211003', locality: 'Colonelganj',        district: 'Prayagraj',    state: 'Uttar Pradesh', zone: 'urban', lat: 25.4524, lng: 81.8219, densityPerKm2: 16000 },
  { pincode: '211004', locality: 'Allenganj',          district: 'Prayagraj',    state: 'Uttar Pradesh', zone: 'urban', lat: 25.4297, lng: 81.8598, densityPerKm2: 18000 },
  { pincode: '211006', locality: 'Patthar Ghat',       district: 'Prayagraj',    state: 'Uttar Pradesh', zone: 'urban', lat: 25.4474, lng: 81.8647, densityPerKm2: 20000 },
  { pincode: '211011', locality: 'Naini',              district: 'Prayagraj',    state: 'Uttar Pradesh', zone: 'urban', lat: 25.4008, lng: 81.8740, densityPerKm2: 8000  },
  { pincode: '211020', locality: 'Phaphamau',          district: 'Prayagraj',    state: 'Uttar Pradesh', zone: 'semi-urban', lat: 25.4757, lng: 81.8575, densityPerKm2: 4000  },

  // Ghaziabad (NCR, fast-growing)
  { pincode: '201001', locality: 'Ghaziabad GPO',      district: 'Ghaziabad',    state: 'Uttar Pradesh', zone: 'urban', lat: 28.6692, lng: 77.4538, densityPerKm2: 20000 },
  { pincode: '201002', locality: 'Kavi Nagar',         district: 'Ghaziabad',    state: 'Uttar Pradesh', zone: 'urban', lat: 28.6601, lng: 77.4372, densityPerKm2: 18000 },
  { pincode: '201003', locality: 'Raj Nagar',          district: 'Ghaziabad',    state: 'Uttar Pradesh', zone: 'urban', lat: 28.6890, lng: 77.4310, densityPerKm2: 16000 },
  { pincode: '201005', locality: 'Indirapuram',        district: 'Ghaziabad',    state: 'Uttar Pradesh', zone: 'urban', lat: 28.6465, lng: 77.3596, densityPerKm2: 12000 },
  { pincode: '201010', locality: 'Vaishali',           district: 'Ghaziabad',    state: 'Uttar Pradesh', zone: 'urban', lat: 28.6415, lng: 77.3343, densityPerKm2: 14000 },

  // Noida (NCR tech corridor)
  { pincode: '201301', locality: 'Sector 18 Noida',    district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', zone: 'urban', lat: 28.5675, lng: 77.3260, densityPerKm2: 14000 },
  { pincode: '201303', locality: 'Sector 62',          district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', zone: 'urban', lat: 28.6277, lng: 77.3646, densityPerKm2: 10000 },
  { pincode: '201306', locality: 'Sector 37',          district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', zone: 'urban', lat: 28.5477, lng: 77.3461, densityPerKm2: 8000  },

  // Bareilly
  { pincode: '243001', locality: 'Bareilly GPO',       district: 'Bareilly',     state: 'Uttar Pradesh', zone: 'urban', lat: 28.3670, lng: 79.4304, densityPerKm2: 16000 },
  { pincode: '243005', locality: 'Civil Lines',        district: 'Bareilly',     state: 'Uttar Pradesh', zone: 'urban', lat: 28.3733, lng: 79.4120, densityPerKm2: 10000 },
  { pincode: '243006', locality: 'Pilibhit Bypass',    district: 'Bareilly',     state: 'Uttar Pradesh', zone: 'semi-urban', lat: 28.4017, lng: 79.4512, densityPerKm2: 5000  },

  // Aligarh
  { pincode: '202001', locality: 'Aligarh GPO',        district: 'Aligarh',      state: 'Uttar Pradesh', zone: 'urban', lat: 27.8974, lng: 78.0880, densityPerKm2: 16000 },
  { pincode: '202002', locality: 'Marris Road',        district: 'Aligarh',      state: 'Uttar Pradesh', zone: 'urban', lat: 27.9121, lng: 78.0780, densityPerKm2: 12000 },

  // Moradabad (brass city)
  { pincode: '244001', locality: 'Moradabad GPO',      district: 'Moradabad',    state: 'Uttar Pradesh', zone: 'urban', lat: 28.8386, lng: 78.7733, densityPerKm2: 18000 },
  { pincode: '244002', locality: 'Peepal Mandi',       district: 'Moradabad',    state: 'Uttar Pradesh', zone: 'urban', lat: 28.8441, lng: 78.7591, densityPerKm2: 14000 },

  // Gorakhpur
  { pincode: '273001', locality: 'Gorakhpur GPO',      district: 'Gorakhpur',    state: 'Uttar Pradesh', zone: 'urban', lat: 26.7606, lng: 83.3732, densityPerKm2: 16000 },
  { pincode: '273005', locality: 'Rethibazar',         district: 'Gorakhpur',    state: 'Uttar Pradesh', zone: 'urban', lat: 26.7510, lng: 83.3625, densityPerKm2: 18000 },
  { pincode: '273009', locality: 'Railway Colony',     district: 'Gorakhpur',    state: 'Uttar Pradesh', zone: 'urban', lat: 26.7682, lng: 83.3988, densityPerKm2: 10000 },
  { pincode: '273015', locality: 'Golghar',            district: 'Gorakhpur',    state: 'Uttar Pradesh', zone: 'urban', lat: 26.7661, lng: 83.3680, densityPerKm2: 12000 },

  // Mathura (religious + FMCG)
  { pincode: '281001', locality: 'Mathura GPO',        district: 'Mathura',      state: 'Uttar Pradesh', zone: 'urban', lat: 27.4924, lng: 77.6737, densityPerKm2: 14000 },
  { pincode: '281003', locality: 'Vrindavan Rd',       district: 'Mathura',      state: 'Uttar Pradesh', zone: 'urban', lat: 27.5074, lng: 77.6887, densityPerKm2: 10000 },
  { pincode: '281121', locality: 'Vrindavan',          district: 'Mathura',      state: 'Uttar Pradesh', zone: 'urban', lat: 27.5820, lng: 77.6983, densityPerKm2: 8000  },

  // Muzaffarnagar
  { pincode: '251001', locality: 'Muzaffarnagar GPO',  district: 'Muzaffarnagar', state: 'Uttar Pradesh', zone: 'urban', lat: 29.4731, lng: 77.7033, densityPerKm2: 14000 },
  { pincode: '251002', locality: 'Gandhi Colony',      district: 'Muzaffarnagar', state: 'Uttar Pradesh', zone: 'urban', lat: 29.4654, lng: 77.6934, densityPerKm2: 10000 },

  // Ayodhya (post-Ram Mandir surge)
  { pincode: '224001', locality: 'Ayodhya',            district: 'Ayodhya',      state: 'Uttar Pradesh', zone: 'urban', lat: 26.7992, lng: 82.1989, densityPerKm2: 10000 },
  { pincode: '224123', locality: 'Ram Mandir Area',    district: 'Ayodhya',      state: 'Uttar Pradesh', zone: 'urban', lat: 26.7948, lng: 82.1958, densityPerKm2: 8000  },

  // Saharanpur
  { pincode: '247001', locality: 'Saharanpur GPO',     district: 'Saharanpur',   state: 'Uttar Pradesh', zone: 'urban', lat: 29.9680, lng: 77.5510, densityPerKm2: 14000 },

  // Firozabad (glass city)
  { pincode: '283203', locality: 'Firozabad',          district: 'Firozabad',    state: 'Uttar Pradesh', zone: 'urban', lat: 27.1521, lng: 78.3950, densityPerKm2: 12000 },

  // ════════════════════════════════════════════════════════════════════════════
  // BIHAR
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '800001', locality: 'Patna GPO',          district: 'Patna',        state: 'Bihar', zone: 'urban', lat: 25.6121, lng: 85.1376, densityPerKm2: 20000 },
  { pincode: '800002', locality: 'Kankarbagh',         district: 'Patna',        state: 'Bihar', zone: 'urban', lat: 25.5941, lng: 85.1553, densityPerKm2: 18000 },
  { pincode: '800003', locality: 'Boring Road',        district: 'Patna',        state: 'Bihar', zone: 'urban', lat: 25.6152, lng: 85.0987, densityPerKm2: 14000 },
  { pincode: '800004', locality: 'Rajendra Nagar',     district: 'Patna',        state: 'Bihar', zone: 'urban', lat: 25.5985, lng: 85.0987, densityPerKm2: 12000 },
  { pincode: '800006', locality: 'Dak Bungalow',       district: 'Patna',        state: 'Bihar', zone: 'urban', lat: 25.6029, lng: 85.1231, densityPerKm2: 16000 },
  { pincode: '800007', locality: 'Exhibition Road',    district: 'Patna',        state: 'Bihar', zone: 'urban', lat: 25.6119, lng: 85.1328, densityPerKm2: 14000 },
  { pincode: '800013', locality: 'Phulwari Sharif',    district: 'Patna',        state: 'Bihar', zone: 'semi-urban', lat: 25.5548, lng: 85.0896, densityPerKm2: 5000  },
  { pincode: '800023', locality: 'Patliputra Colony',  district: 'Patna',        state: 'Bihar', zone: 'urban', lat: 25.6353, lng: 85.0728, densityPerKm2: 10000 },
  { pincode: '823001', locality: 'Gaya GPO',           district: 'Gaya',         state: 'Bihar', zone: 'urban', lat: 24.7914, lng: 84.9994, densityPerKm2: 12000 },
  { pincode: '842001', locality: 'Muzaffarpur GPO',    district: 'Muzaffarpur',  state: 'Bihar', zone: 'urban', lat: 26.1197, lng: 85.3910, densityPerKm2: 14000 },
  { pincode: '812001', locality: 'Bhagalpur GPO',      district: 'Bhagalpur',    state: 'Bihar', zone: 'urban', lat: 25.2425, lng: 86.9842, densityPerKm2: 12000 },
  { pincode: '845301', locality: 'Motihari',           district: 'East Champaran', state: 'Bihar', zone: 'semi-urban', lat: 26.6559, lng: 84.9181, densityPerKm2: 5000 },

  // ════════════════════════════════════════════════════════════════════════════
  // RAJASTHAN
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '302001', locality: 'Jaipur GPO',         district: 'Jaipur',       state: 'Rajasthan', zone: 'urban', lat: 26.9124, lng: 75.7873, densityPerKm2: 18000 },
  { pincode: '302003', locality: 'C Scheme',           district: 'Jaipur',       state: 'Rajasthan', zone: 'urban', lat: 26.9048, lng: 75.7958, densityPerKm2: 10000 },
  { pincode: '302004', locality: 'Malviya Nagar',      district: 'Jaipur',       state: 'Rajasthan', zone: 'urban', lat: 26.8589, lng: 75.8149, densityPerKm2: 12000 },
  { pincode: '302006', locality: 'Vaishali Nagar',     district: 'Jaipur',       state: 'Rajasthan', zone: 'urban', lat: 26.9131, lng: 75.7376, densityPerKm2: 10000 },
  { pincode: '302012', locality: 'Sikar Road',         district: 'Jaipur',       state: 'Rajasthan', zone: 'semi-urban', lat: 26.9614, lng: 75.7669, densityPerKm2: 6000  },
  { pincode: '302016', locality: 'Mansarovar',         district: 'Jaipur',       state: 'Rajasthan', zone: 'urban', lat: 26.8692, lng: 75.7651, densityPerKm2: 9000  },
  { pincode: '302019', locality: 'Jagatpura',          district: 'Jaipur',       state: 'Rajasthan', zone: 'semi-urban', lat: 26.8208, lng: 75.8355, densityPerKm2: 5000  },
  { pincode: '342001', locality: 'Jodhpur GPO',        district: 'Jodhpur',      state: 'Rajasthan', zone: 'urban', lat: 26.2389, lng: 73.0243, densityPerKm2: 14000 },
  { pincode: '342003', locality: 'Ratanada',           district: 'Jodhpur',      state: 'Rajasthan', zone: 'urban', lat: 26.2650, lng: 73.0158, densityPerKm2: 10000 },
  { pincode: '342005', locality: 'Pal Road',           district: 'Jodhpur',      state: 'Rajasthan', zone: 'urban', lat: 26.2239, lng: 72.9862, densityPerKm2: 8000  },
  { pincode: '324001', locality: 'Kota GPO',           district: 'Kota',         state: 'Rajasthan', zone: 'urban', lat: 25.2138, lng: 75.8648, densityPerKm2: 16000 },
  { pincode: '324007', locality: 'Talwandi',           district: 'Kota',         state: 'Rajasthan', zone: 'urban', lat: 25.1910, lng: 75.8520, densityPerKm2: 10000 },
  { pincode: '324010', locality: 'Vigyan Nagar',       district: 'Kota',         state: 'Rajasthan', zone: 'urban', lat: 25.2060, lng: 75.8720, densityPerKm2: 8000  },
  { pincode: '305001', locality: 'Ajmer GPO',          district: 'Ajmer',        state: 'Rajasthan', zone: 'urban', lat: 26.4524, lng: 74.6382, densityPerKm2: 16000 },
  { pincode: '305004', locality: 'Vaishali Nagar Ajm', district: 'Ajmer',        state: 'Rajasthan', zone: 'urban', lat: 26.4647, lng: 74.6146, densityPerKm2: 8000  },
  { pincode: '313001', locality: 'Udaipur GPO',        district: 'Udaipur',      state: 'Rajasthan', zone: 'urban', lat: 24.5854, lng: 73.7125, densityPerKm2: 12000 },
  { pincode: '313004', locality: 'Pratap Nagar',       district: 'Udaipur',      state: 'Rajasthan', zone: 'urban', lat: 24.5742, lng: 73.7313, densityPerKm2: 8000  },
  { pincode: '334001', locality: 'Bikaner GPO',        district: 'Bikaner',      state: 'Rajasthan', zone: 'urban', lat: 28.0229, lng: 73.3119, densityPerKm2: 10000 },
  { pincode: '301001', locality: 'Alwar GPO',          district: 'Alwar',        state: 'Rajasthan', zone: 'urban', lat: 27.5530, lng: 76.6346, densityPerKm2: 8000  },

  // ════════════════════════════════════════════════════════════════════════════
  // MADHYA PRADESH
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '452001', locality: 'Indore GPO',         district: 'Indore',       state: 'Madhya Pradesh', zone: 'urban', lat: 22.7196, lng: 75.8577, densityPerKm2: 18000 },
  { pincode: '452002', locality: 'Vijay Nagar',        district: 'Indore',       state: 'Madhya Pradesh', zone: 'urban', lat: 22.7528, lng: 75.8935, densityPerKm2: 14000 },
  { pincode: '452003', locality: 'Palasia',            district: 'Indore',       state: 'Madhya Pradesh', zone: 'urban', lat: 22.7222, lng: 75.8698, densityPerKm2: 16000 },
  { pincode: '452010', locality: 'Scheme 54 AB Road',  district: 'Indore',       state: 'Madhya Pradesh', zone: 'urban', lat: 22.7041, lng: 75.8903, densityPerKm2: 10000 },
  { pincode: '452014', locality: 'Bhawarkua',          district: 'Indore',       state: 'Madhya Pradesh', zone: 'urban', lat: 22.6834, lng: 75.8631, densityPerKm2: 8000  },
  { pincode: '452018', locality: 'Rajendra Nagar',     district: 'Indore',       state: 'Madhya Pradesh', zone: 'urban', lat: 22.7333, lng: 75.8188, densityPerKm2: 7000  },
  { pincode: '462001', locality: 'Bhopal GPO',         district: 'Bhopal',       state: 'Madhya Pradesh', zone: 'urban', lat: 23.2599, lng: 77.4126, densityPerKm2: 14000 },
  { pincode: '462003', locality: 'New Market',         district: 'Bhopal',       state: 'Madhya Pradesh', zone: 'urban', lat: 23.2316, lng: 77.4248, densityPerKm2: 16000 },
  { pincode: '462016', locality: 'Kolar Road',         district: 'Bhopal',       state: 'Madhya Pradesh', zone: 'urban', lat: 23.1979, lng: 77.4634, densityPerKm2: 6000  },
  { pincode: '462043', locality: 'Hoshangabad Rd',     district: 'Bhopal',       state: 'Madhya Pradesh', zone: 'semi-urban', lat: 23.1920, lng: 77.4000, densityPerKm2: 4000  },
  { pincode: '482001', locality: 'Jabalpur GPO',       district: 'Jabalpur',     state: 'Madhya Pradesh', zone: 'urban', lat: 23.1815, lng: 79.9864, densityPerKm2: 12000 },
  { pincode: '474001', locality: 'Gwalior GPO',        district: 'Gwalior',      state: 'Madhya Pradesh', zone: 'urban', lat: 26.2183, lng: 78.1828, densityPerKm2: 14000 },
  { pincode: '456001', locality: 'Ujjain GPO',         district: 'Ujjain',       state: 'Madhya Pradesh', zone: 'urban', lat: 23.1765, lng: 75.7885, densityPerKm2: 12000 },
  { pincode: '456010', locality: 'Freeganj',           district: 'Ujjain',       state: 'Madhya Pradesh', zone: 'urban', lat: 23.1857, lng: 75.7801, densityPerKm2: 10000 },

  // ════════════════════════════════════════════════════════════════════════════
  // GUJARAT
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '395001', locality: 'Surat GPO',          district: 'Surat',        state: 'Gujarat', zone: 'urban', lat: 21.1702, lng: 72.8311, densityPerKm2: 22000 },
  { pincode: '395002', locality: 'Adajan',             district: 'Surat',        state: 'Gujarat', zone: 'urban', lat: 21.2096, lng: 72.8079, densityPerKm2: 14000 },
  { pincode: '395005', locality: 'Katargam',           district: 'Surat',        state: 'Gujarat', zone: 'urban', lat: 21.2139, lng: 72.8619, densityPerKm2: 18000 },
  { pincode: '395007', locality: 'Vesu',               district: 'Surat',        state: 'Gujarat', zone: 'urban', lat: 21.1537, lng: 72.7786, densityPerKm2: 10000 },
  { pincode: '395009', locality: 'Piplod',             district: 'Surat',        state: 'Gujarat', zone: 'urban', lat: 21.1641, lng: 72.7965, densityPerKm2: 12000 },
  { pincode: '395010', locality: 'Citylight',          district: 'Surat',        state: 'Gujarat', zone: 'urban', lat: 21.1671, lng: 72.8147, densityPerKm2: 10000 },
  { pincode: '390001', locality: 'Vadodara GPO',       district: 'Vadodara',     state: 'Gujarat', zone: 'urban', lat: 22.3072, lng: 73.1812, densityPerKm2: 18000 },
  { pincode: '390007', locality: 'Alkapuri',           district: 'Vadodara',     state: 'Gujarat', zone: 'urban', lat: 22.3130, lng: 73.1702, densityPerKm2: 12000 },
  { pincode: '390015', locality: 'Productivity Road',  district: 'Vadodara',     state: 'Gujarat', zone: 'urban', lat: 22.3240, lng: 73.1768, densityPerKm2: 10000 },
  { pincode: '360001', locality: 'Rajkot GPO',         district: 'Rajkot',       state: 'Gujarat', zone: 'urban', lat: 22.3039, lng: 70.8022, densityPerKm2: 16000 },
  { pincode: '360005', locality: 'Kalawad Rd',         district: 'Rajkot',       state: 'Gujarat', zone: 'urban', lat: 22.3219, lng: 70.7800, densityPerKm2: 8000  },
  { pincode: '382001', locality: 'Gandhinagar GPO',    district: 'Gandhinagar',  state: 'Gujarat', zone: 'urban', lat: 23.2156, lng: 72.6369, densityPerKm2: 8000  },

  // ════════════════════════════════════════════════════════════════════════════
  // MAHARASHTRA (non-metro)
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '440001', locality: 'Nagpur GPO',         district: 'Nagpur',       state: 'Maharashtra', zone: 'urban', lat: 21.1458, lng: 79.0882, densityPerKm2: 18000 },
  { pincode: '440010', locality: 'Dharampeth',         district: 'Nagpur',       state: 'Maharashtra', zone: 'urban', lat: 21.1488, lng: 79.0645, densityPerKm2: 12000 },
  { pincode: '440012', locality: 'Sadar',              district: 'Nagpur',       state: 'Maharashtra', zone: 'urban', lat: 21.1393, lng: 79.0740, densityPerKm2: 16000 },
  { pincode: '440022', locality: 'Manewada',           district: 'Nagpur',       state: 'Maharashtra', zone: 'urban', lat: 21.1025, lng: 79.0984, densityPerKm2: 8000  },
  { pincode: '422001', locality: 'Nashik GPO',         district: 'Nashik',       state: 'Maharashtra', zone: 'urban', lat: 19.9975, lng: 73.7898, densityPerKm2: 14000 },
  { pincode: '422002', locality: 'Canada Corner',      district: 'Nashik',       state: 'Maharashtra', zone: 'urban', lat: 19.9940, lng: 73.7759, densityPerKm2: 10000 },
  { pincode: '422009', locality: 'Gangapur Road',      district: 'Nashik',       state: 'Maharashtra', zone: 'urban', lat: 20.0149, lng: 73.7678, densityPerKm2: 8000  },
  { pincode: '431001', locality: 'Aurangabad GPO',     district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', zone: 'urban', lat: 19.8762, lng: 75.3433, densityPerKm2: 14000 },
  { pincode: '431005', locality: 'Cantonment',         district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', zone: 'urban', lat: 19.8820, lng: 75.3580, densityPerKm2: 10000 },
  { pincode: '416001', locality: 'Kolhapur GPO',       district: 'Kolhapur',     state: 'Maharashtra', zone: 'urban', lat: 16.7050, lng: 74.2433, densityPerKm2: 14000 },
  { pincode: '413001', locality: 'Solapur GPO',        district: 'Solapur',      state: 'Maharashtra', zone: 'urban', lat: 17.6854, lng: 75.9064, densityPerKm2: 16000 },

  // ════════════════════════════════════════════════════════════════════════════
  // KARNATAKA (non-metro)
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '570001', locality: 'Mysuru GPO',         district: 'Mysuru',       state: 'Karnataka', zone: 'urban', lat: 12.2958, lng: 76.6394, densityPerKm2: 12000 },
  { pincode: '570007', locality: 'Nazarbad',           district: 'Mysuru',       state: 'Karnataka', zone: 'urban', lat: 12.2824, lng: 76.6516, densityPerKm2: 10000 },
  { pincode: '570020', locality: 'Kuvempunagar',       district: 'Mysuru',       state: 'Karnataka', zone: 'urban', lat: 12.3010, lng: 76.6220, densityPerKm2: 8000  },
  { pincode: '575001', locality: 'Mangaluru GPO',      district: 'Dakshina Kannada', state: 'Karnataka', zone: 'urban', lat: 12.9141, lng: 74.8560, densityPerKm2: 14000 },
  { pincode: '575006', locality: 'Bejai',              district: 'Dakshina Kannada', state: 'Karnataka', zone: 'urban', lat: 12.8727, lng: 74.8397, densityPerKm2: 10000 },
  { pincode: '580001', locality: 'Hubli GPO',          district: 'Dharwad',      state: 'Karnataka', zone: 'urban', lat: 15.3647, lng: 75.1240, densityPerKm2: 14000 },
  { pincode: '580003', locality: 'Vidyanagar Hubli',   district: 'Dharwad',      state: 'Karnataka', zone: 'urban', lat: 15.3741, lng: 75.1315, densityPerKm2: 10000 },
  { pincode: '590001', locality: 'Belagavi GPO',       district: 'Belagavi',     state: 'Karnataka', zone: 'urban', lat: 15.8497, lng: 74.4977, densityPerKm2: 12000 },

  // ════════════════════════════════════════════════════════════════════════════
  // TAMIL NADU (non-metro)
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '641001', locality: 'Coimbatore GPO',     district: 'Coimbatore',   state: 'Tamil Nadu', zone: 'urban', lat: 11.0168, lng: 76.9558, densityPerKm2: 14000 },
  { pincode: '641002', locality: 'RS Puram',           district: 'Coimbatore',   state: 'Tamil Nadu', zone: 'urban', lat: 11.0054, lng: 76.9559, densityPerKm2: 12000 },
  { pincode: '641011', locality: 'Singanallur',        district: 'Coimbatore',   state: 'Tamil Nadu', zone: 'urban', lat: 10.9949, lng: 77.0078, densityPerKm2: 10000 },
  { pincode: '641018', locality: 'Gandhipuram',        district: 'Coimbatore',   state: 'Tamil Nadu', zone: 'urban', lat: 11.0108, lng: 76.9694, densityPerKm2: 16000 },
  { pincode: '625001', locality: 'Madurai GPO',        district: 'Madurai',      state: 'Tamil Nadu', zone: 'urban', lat: 9.9252, lng: 78.1198, densityPerKm2: 18000 },
  { pincode: '625009', locality: 'Anna Nagar Madurai', district: 'Madurai',      state: 'Tamil Nadu', zone: 'urban', lat: 9.9533, lng: 78.0883, densityPerKm2: 10000 },
  { pincode: '620001', locality: 'Trichy GPO',         district: 'Tiruchirappalli', state: 'Tamil Nadu', zone: 'urban', lat: 10.7905, lng: 78.7047, densityPerKm2: 14000 },
  { pincode: '620008', locality: 'Thillai Nagar',      district: 'Tiruchirappalli', state: 'Tamil Nadu', zone: 'urban', lat: 10.8081, lng: 78.7185, densityPerKm2: 12000 },
  { pincode: '636001', locality: 'Salem GPO',          district: 'Salem',        state: 'Tamil Nadu', zone: 'urban', lat: 11.6643, lng: 78.1460, densityPerKm2: 16000 },
  { pincode: '627001', locality: 'Tirunelveli GPO',    district: 'Tirunelveli', state: 'Tamil Nadu', zone: 'urban', lat: 8.7139, lng: 77.7567, densityPerKm2: 12000 },

  // ════════════════════════════════════════════════════════════════════════════
  // ANDHRA PRADESH / TELANGANA (non-metro)
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '530001', locality: 'Visakhapatnam GPO',  district: 'Visakhapatnam', state: 'Andhra Pradesh', zone: 'urban', lat: 17.6868, lng: 83.2185, densityPerKm2: 16000 },
  { pincode: '530003', locality: 'MVP Colony',         district: 'Visakhapatnam', state: 'Andhra Pradesh', zone: 'urban', lat: 17.7360, lng: 83.2355, densityPerKm2: 12000 },
  { pincode: '530016', locality: 'Madhurawada',        district: 'Visakhapatnam', state: 'Andhra Pradesh', zone: 'urban', lat: 17.7835, lng: 83.3734, densityPerKm2: 6000  },
  { pincode: '520001', locality: 'Vijayawada GPO',     district: 'Krishna',      state: 'Andhra Pradesh', zone: 'urban', lat: 16.5062, lng: 80.6480, densityPerKm2: 20000 },
  { pincode: '520010', locality: 'Benz Circle',        district: 'Krishna',      state: 'Andhra Pradesh', zone: 'urban', lat: 16.5055, lng: 80.6397, densityPerKm2: 16000 },
  { pincode: '522001', locality: 'Guntur GPO',         district: 'Guntur',       state: 'Andhra Pradesh', zone: 'urban', lat: 16.3067, lng: 80.4365, densityPerKm2: 14000 },
  { pincode: '506001', locality: 'Warangal GPO',       district: 'Hanamkonda',   state: 'Telangana', zone: 'urban', lat: 17.9784, lng: 79.5941, densityPerKm2: 14000 },
  { pincode: '504001', locality: 'Adilabad GPO',       district: 'Adilabad',     state: 'Telangana', zone: 'semi-urban', lat: 19.6641, lng: 78.5320, densityPerKm2: 5000  },

  // ════════════════════════════════════════════════════════════════════════════
  // KERALA
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '682001', locality: 'Kochi GPO',          district: 'Ernakulam',    state: 'Kerala', zone: 'urban', lat: 9.9312, lng: 76.2673, densityPerKm2: 22000 },
  { pincode: '682016', locality: 'Edappally',          district: 'Ernakulam',    state: 'Kerala', zone: 'urban', lat: 10.0198, lng: 76.3048, densityPerKm2: 14000 },
  { pincode: '682019', locality: 'Kakkanad',           district: 'Ernakulam',    state: 'Kerala', zone: 'urban', lat: 10.0157, lng: 76.3437, densityPerKm2: 8000  },
  { pincode: '682030', locality: 'Aluva',              district: 'Ernakulam',    state: 'Kerala', zone: 'urban', lat: 10.1004, lng: 76.3540, densityPerKm2: 10000 },
  { pincode: '695001', locality: 'Thiruvananthapuram GPO', district: 'Thiruvananthapuram', state: 'Kerala', zone: 'urban', lat: 8.5241, lng: 76.9366, densityPerKm2: 14000 },
  { pincode: '695010', locality: 'Kowdiar',            district: 'Thiruvananthapuram', state: 'Kerala', zone: 'urban', lat: 8.5345, lng: 76.9545, densityPerKm2: 8000  },
  { pincode: '695014', locality: 'Pattom',             district: 'Thiruvananthapuram', state: 'Kerala', zone: 'urban', lat: 8.5302, lng: 76.9620, densityPerKm2: 10000 },
  { pincode: '673001', locality: 'Kozhikode GPO',      district: 'Kozhikode',    state: 'Kerala', zone: 'urban', lat: 11.2588, lng: 75.7804, densityPerKm2: 16000 },
  { pincode: '673005', locality: 'Medical College Kzd', district: 'Kozhikode',   state: 'Kerala', zone: 'urban', lat: 11.2560, lng: 75.7795, densityPerKm2: 10000 },

  // ════════════════════════════════════════════════════════════════════════════
  // PUNJAB / HARYANA (NCR belt + industrial belt)
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '141001', locality: 'Ludhiana GPO',       district: 'Ludhiana',     state: 'Punjab', zone: 'urban', lat: 30.9010, lng: 75.8573, densityPerKm2: 20000 },
  { pincode: '141002', locality: 'Model Town Ludhiana', district: 'Ludhiana',    state: 'Punjab', zone: 'urban', lat: 30.9195, lng: 75.8486, densityPerKm2: 12000 },
  { pincode: '141003', locality: 'Sarabha Nagar',      district: 'Ludhiana',     state: 'Punjab', zone: 'urban', lat: 30.8985, lng: 75.8464, densityPerKm2: 10000 },
  { pincode: '143001', locality: 'Amritsar GPO',       district: 'Amritsar',     state: 'Punjab', zone: 'urban', lat: 31.6340, lng: 74.8723, densityPerKm2: 18000 },
  { pincode: '143005', locality: 'Ranjit Avenue',      district: 'Amritsar',     state: 'Punjab', zone: 'urban', lat: 31.6410, lng: 74.8573, densityPerKm2: 10000 },
  { pincode: '143009', locality: 'Mall Road Amritsar', district: 'Amritsar',     state: 'Punjab', zone: 'urban', lat: 31.6220, lng: 74.8770, densityPerKm2: 14000 },
  { pincode: '160001', locality: 'Chandigarh GPO',     district: 'Chandigarh',   state: 'Chandigarh', zone: 'urban', lat: 30.7333, lng: 76.7794, densityPerKm2: 9000  },
  { pincode: '160017', locality: 'Sector 17',          district: 'Chandigarh',   state: 'Chandigarh', zone: 'urban', lat: 30.7440, lng: 76.7918, densityPerKm2: 6000  },
  { pincode: '160019', locality: 'Sector 26',          district: 'Chandigarh',   state: 'Chandigarh', zone: 'urban', lat: 30.7244, lng: 76.8038, densityPerKm2: 7000  },
  { pincode: '121001', locality: 'Faridabad GPO',      district: 'Faridabad',    state: 'Haryana', zone: 'urban', lat: 28.4089, lng: 77.3178, densityPerKm2: 16000 },
  { pincode: '121007', locality: 'Sector 15 Faridabad', district: 'Faridabad',   state: 'Haryana', zone: 'urban', lat: 28.3919, lng: 77.3186, densityPerKm2: 10000 },
  { pincode: '122001', locality: 'Gurugram GPO',       district: 'Gurugram',     state: 'Haryana', zone: 'urban', lat: 28.4595, lng: 77.0266, densityPerKm2: 12000 },
  { pincode: '122002', locality: 'DLF Phase 1',        district: 'Gurugram',     state: 'Haryana', zone: 'urban', lat: 28.4759, lng: 77.1025, densityPerKm2: 6000  },
  { pincode: '122018', locality: 'Sohna Road',         district: 'Gurugram',     state: 'Haryana', zone: 'urban', lat: 28.4232, lng: 77.0348, densityPerKm2: 5000  },
  { pincode: '132001', locality: 'Karnal GPO',         district: 'Karnal',       state: 'Haryana', zone: 'urban', lat: 29.6857, lng: 76.9905, densityPerKm2: 10000 },
  { pincode: '135001', locality: 'Yamunanagar GPO',    district: 'Yamunanagar',  state: 'Haryana', zone: 'urban', lat: 30.1290, lng: 77.3017, densityPerKm2: 10000 },

  // ════════════════════════════════════════════════════════════════════════════
  // ODISHA
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '751001', locality: 'Bhubaneswar GPO',    district: 'Khorda',       state: 'Odisha', zone: 'urban', lat: 20.2961, lng: 85.8245, densityPerKm2: 8000  },
  { pincode: '751007', locality: 'Nayapalli',          district: 'Khorda',       state: 'Odisha', zone: 'urban', lat: 20.2990, lng: 85.8058, densityPerKm2: 6000  },
  { pincode: '751013', locality: 'Saheed Nagar',       district: 'Khorda',       state: 'Odisha', zone: 'urban', lat: 20.2851, lng: 85.8432, densityPerKm2: 8000  },
  { pincode: '753001', locality: 'Cuttack GPO',        district: 'Cuttack',      state: 'Odisha', zone: 'urban', lat: 20.4625, lng: 85.8830, densityPerKm2: 12000 },

  // ════════════════════════════════════════════════════════════════════════════
  // ASSAM / NORTH EAST
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '781001', locality: 'Guwahati GPO',       district: 'Kamrup',       state: 'Assam', zone: 'urban', lat: 26.1445, lng: 91.7362, densityPerKm2: 12000 },
  { pincode: '781005', locality: 'Paltan Bazar',       district: 'Kamrup',       state: 'Assam', zone: 'urban', lat: 26.1710, lng: 91.7463, densityPerKm2: 14000 },
  { pincode: '781007', locality: 'Six Mile',           district: 'Kamrup',       state: 'Assam', zone: 'urban', lat: 26.1446, lng: 91.8012, densityPerKm2: 6000  },
  { pincode: '781019', locality: 'Narengi',            district: 'Kamrup',       state: 'Assam', zone: 'semi-urban', lat: 26.2063, lng: 91.7106, densityPerKm2: 4000  },
  { pincode: '788001', locality: 'Silchar GPO',        district: 'Cachar',       state: 'Assam', zone: 'urban', lat: 24.8333, lng: 92.7789, densityPerKm2: 8000  },
  { pincode: '793001', locality: 'Shillong GPO',       district: 'East Khasi Hills', state: 'Meghalaya', zone: 'urban', lat: 25.5788, lng: 91.8933, densityPerKm2: 8000  },
  { pincode: '796001', locality: 'Aizawl GPO',         district: 'Aizawl',       state: 'Mizoram', zone: 'urban', lat: 23.7271, lng: 92.7176, densityPerKm2: 4000  },
  { pincode: '795001', locality: 'Imphal GPO',         district: 'Imphal West',  state: 'Manipur', zone: 'urban', lat: 24.8170, lng: 93.9368, densityPerKm2: 6000  },

  // ════════════════════════════════════════════════════════════════════════════
  // JAMMU & KASHMIR
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '190001', locality: 'Srinagar GPO',       district: 'Srinagar',     state: 'Jammu & Kashmir', zone: 'urban', lat: 34.0837, lng: 74.7973, densityPerKm2: 14000 },
  { pincode: '190005', locality: 'Lal Chowk',          district: 'Srinagar',     state: 'Jammu & Kashmir', zone: 'urban', lat: 34.0883, lng: 74.8050, densityPerKm2: 12000 },
  { pincode: '190011', locality: 'Nawab Bazar',        district: 'Srinagar',     state: 'Jammu & Kashmir', zone: 'urban', lat: 34.0789, lng: 74.8087, densityPerKm2: 10000 },
  { pincode: '180001', locality: 'Jammu GPO',          district: 'Jammu',        state: 'Jammu & Kashmir', zone: 'urban', lat: 32.7357, lng: 74.8691, densityPerKm2: 16000 },
  { pincode: '180004', locality: 'Trikuta Nagar',      district: 'Jammu',        state: 'Jammu & Kashmir', zone: 'urban', lat: 32.7193, lng: 74.8554, densityPerKm2: 8000  },

  // ════════════════════════════════════════════════════════════════════════════
  // UTTARAKHAND
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '248001', locality: 'Dehradun GPO',       district: 'Dehradun',     state: 'Uttarakhand', zone: 'urban', lat: 30.3165, lng: 78.0322, densityPerKm2: 10000 },
  { pincode: '248006', locality: 'Patel Nagar Ddn',    district: 'Dehradun',     state: 'Uttarakhand', zone: 'urban', lat: 30.3300, lng: 78.0150, densityPerKm2: 8000  },
  { pincode: '249401', locality: 'Rishikesh',          district: 'Dehradun',     state: 'Uttarakhand', zone: 'urban', lat: 30.0869, lng: 78.2676, densityPerKm2: 8000  },
  { pincode: '263139', locality: 'Haldwani',           district: 'Nainital',     state: 'Uttarakhand', zone: 'urban', lat: 29.2183, lng: 79.5130, densityPerKm2: 10000 },

  // ════════════════════════════════════════════════════════════════════════════
  // CHHATTISGARH
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '492001', locality: 'Raipur GPO',         district: 'Raipur',       state: 'Chhattisgarh', zone: 'urban', lat: 21.2514, lng: 81.6296, densityPerKm2: 12000 },
  { pincode: '492007', locality: 'Pandri',             district: 'Raipur',       state: 'Chhattisgarh', zone: 'urban', lat: 21.2380, lng: 81.6474, densityPerKm2: 8000  },
  { pincode: '490001', locality: 'Bhilai GPO',         district: 'Durg',         state: 'Chhattisgarh', zone: 'urban', lat: 21.2090, lng: 81.4285, densityPerKm2: 10000 },

  // ════════════════════════════════════════════════════════════════════════════
  // JHARKHAND
  // ════════════════════════════════════════════════════════════════════════════

  { pincode: '834001', locality: 'Ranchi GPO',         district: 'Ranchi',       state: 'Jharkhand', zone: 'urban', lat: 23.3441, lng: 85.3096, densityPerKm2: 10000 },
  { pincode: '834002', locality: 'Lalpur',             district: 'Ranchi',       state: 'Jharkhand', zone: 'urban', lat: 23.3600, lng: 85.3400, densityPerKm2: 8000  },
  { pincode: '831001', locality: 'Jamshedpur GPO',     district: 'East Singhbhum', state: 'Jharkhand', zone: 'urban', lat: 22.8046, lng: 86.2029, densityPerKm2: 12000 },
];
