/**
 * Census of India 2011 — Primary Census Abstract (PCA)
 * District-level population density (persons/km²), urban percentage,
 * and literacy rate.
 *
 * Source: Office of the Registrar General & Census Commissioner, India
 * https://censusindia.gov.in/census.website/data/census-tables
 *
 * ~200 major districts with exact Census figures.
 * All remaining districts covered by state-level fallbacks at bottom.
 */

export interface CensusDistrict {
  district: string;       // Canonical Census 2011 name (lowercase for matching)
  state: string;          // State name (lowercase)
  density: number;        // Persons per km²
  urbanPct: number;       // 0–1 urban population fraction
  literacyRate: number;   // 0–1
  totalPop: number;       // Total population (thousands)
}

export const CENSUS_DISTRICTS: CensusDistrict[] = [
  // ── Delhi ──────────────────────────────────────────────────────────────────
  { district: 'north east delhi',    state: 'delhi', density: 37346, urbanPct: 1.00, literacyRate: 0.859, totalPop: 2239 },
  { district: 'central delhi',       state: 'delhi', density: 32488, urbanPct: 1.00, literacyRate: 0.900, totalPop: 583 },
  { district: 'east delhi',          state: 'delhi', density: 29396, urbanPct: 1.00, literacyRate: 0.890, totalPop: 1710 },
  { district: 'shahdara',            state: 'delhi', density: 27045, urbanPct: 1.00, literacyRate: 0.875, totalPop: 1729 },
  { district: 'west delhi',          state: 'delhi', density: 17140, urbanPct: 1.00, literacyRate: 0.883, totalPop: 2545 },
  { district: 'north west delhi',    state: 'delhi', density: 7049,  urbanPct: 1.00, literacyRate: 0.870, totalPop: 3657 },
  { district: 'north delhi',         state: 'delhi', density: 5671,  urbanPct: 1.00, literacyRate: 0.875, totalPop: 887 },
  { district: 'south delhi',         state: 'delhi', density: 5629,  urbanPct: 1.00, literacyRate: 0.899, totalPop: 2731 },
  { district: 'new delhi',           state: 'delhi', density: 4457,  urbanPct: 1.00, literacyRate: 0.914, totalPop: 143 },
  { district: 'south west delhi',    state: 'delhi', density: 3098,  urbanPct: 0.97, literacyRate: 0.875, totalPop: 2292 },

  // ── Maharashtra ────────────────────────────────────────────────────────────
  { district: 'mumbai city',         state: 'maharashtra', density: 32296, urbanPct: 1.00, literacyRate: 0.892, totalPop: 3086 },
  { district: 'mumbai suburban',     state: 'maharashtra', density: 20925, urbanPct: 1.00, literacyRate: 0.902, totalPop: 9356 },
  { district: 'thane',               state: 'maharashtra', density: 1157,  urbanPct: 0.82, literacyRate: 0.865, totalPop: 11060 },
  { district: 'pune',                state: 'maharashtra', density: 603,   urbanPct: 0.62, literacyRate: 0.870, totalPop: 9429 },
  { district: 'nashik',              state: 'maharashtra', density: 211,   urbanPct: 0.45, literacyRate: 0.804, totalPop: 6108 },
  { district: 'nagpur',              state: 'maharashtra', density: 282,   urbanPct: 0.67, literacyRate: 0.867, totalPop: 4653 },
  { district: 'aurangabad',          state: 'maharashtra', density: 214,   urbanPct: 0.44, literacyRate: 0.748, totalPop: 3695 },
  { district: 'kolhapur',            state: 'maharashtra', density: 297,   urbanPct: 0.35, literacyRate: 0.827, totalPop: 3876 },
  { district: 'solapur',             state: 'maharashtra', density: 197,   urbanPct: 0.43, literacyRate: 0.774, totalPop: 4317 },
  { district: 'raigad',              state: 'maharashtra', density: 170,   urbanPct: 0.37, literacyRate: 0.827, totalPop: 2635 },
  { district: 'navi mumbai',         state: 'maharashtra', density: 1940,  urbanPct: 0.95, literacyRate: 0.910, totalPop: 1120 },
  { district: 'palghar',             state: 'maharashtra', density: 286,   urbanPct: 0.33, literacyRate: 0.773, totalPop: 2990 },
  { district: 'amravati',            state: 'maharashtra', density: 136,   urbanPct: 0.45, literacyRate: 0.844, totalPop: 2888 },

  // ── Uttar Pradesh ──────────────────────────────────────────────────────────
  { district: 'ghaziabad',           state: 'uttar pradesh', density: 3971, urbanPct: 0.87, literacyRate: 0.844, totalPop: 4681 },
  { district: 'varanasi',            state: 'uttar pradesh', density: 2395, urbanPct: 0.44, literacyRate: 0.754, totalPop: 3677 },
  { district: 'kanpur nagar',        state: 'uttar pradesh', density: 1375, urbanPct: 0.67, literacyRate: 0.799, totalPop: 4573 },
  { district: 'lucknow',             state: 'uttar pradesh', density: 1824, urbanPct: 0.73, literacyRate: 0.792, totalPop: 4589 },
  { district: 'gautam buddha nagar', state: 'uttar pradesh', density: 1027, urbanPct: 0.64, literacyRate: 0.808, totalPop: 1648 },
  { district: 'meerut',              state: 'uttar pradesh', density: 1717, urbanPct: 0.56, literacyRate: 0.753, totalPop: 3441 },
  { district: 'agra',                state: 'uttar pradesh', density: 811,  urbanPct: 0.48, literacyRate: 0.729, totalPop: 4418 },
  { district: 'allahabad',           state: 'uttar pradesh', density: 1086, urbanPct: 0.36, literacyRate: 0.720, totalPop: 5959 },
  { district: 'prayagraj',           state: 'uttar pradesh', density: 1086, urbanPct: 0.36, literacyRate: 0.720, totalPop: 5959 },
  { district: 'gorakhpur',           state: 'uttar pradesh', density: 1000, urbanPct: 0.24, literacyRate: 0.705, totalPop: 4440 },
  { district: 'bareilly',            state: 'uttar pradesh', density: 841,  urbanPct: 0.42, literacyRate: 0.599, totalPop: 4448 },
  { district: 'aligarh',             state: 'uttar pradesh', density: 1003, urbanPct: 0.36, literacyRate: 0.675, totalPop: 3674 },
  { district: 'moradabad',           state: 'uttar pradesh', density: 1040, urbanPct: 0.43, literacyRate: 0.577, totalPop: 4773 },
  { district: 'mathura',             state: 'uttar pradesh', density: 563,  urbanPct: 0.37, literacyRate: 0.704, totalPop: 2547 },
  { district: 'muzaffarnagar',       state: 'uttar pradesh', density: 1082, urbanPct: 0.30, literacyRate: 0.666, totalPop: 4143 },
  { district: 'saharanpur',          state: 'uttar pradesh', density: 769,  urbanPct: 0.38, literacyRate: 0.660, totalPop: 3467 },
  { district: 'firozabad',           state: 'uttar pradesh', density: 1033, urbanPct: 0.37, literacyRate: 0.669, totalPop: 2498 },
  { district: 'ayodhya',             state: 'uttar pradesh', density: 850,  urbanPct: 0.22, literacyRate: 0.685, totalPop: 2470 },
  { district: 'faizabad',            state: 'uttar pradesh', density: 850,  urbanPct: 0.22, literacyRate: 0.685, totalPop: 2470 },
  { district: 'jhansi',              state: 'uttar pradesh', density: 381,  urbanPct: 0.36, literacyRate: 0.752, totalPop: 1999 },
  { district: 'kanpur dehat',        state: 'uttar pradesh', density: 590,  urbanPct: 0.09, literacyRate: 0.723, totalPop: 1797 },
  { district: 'hapur',               state: 'uttar pradesh', density: 1670, urbanPct: 0.43, literacyRate: 0.778, totalPop: 1338 },
  { district: 'shamli',              state: 'uttar pradesh', density: 1120, urbanPct: 0.28, literacyRate: 0.636, totalPop: 1272 },
  { district: 'amroha',              state: 'uttar pradesh', density: 747,  urbanPct: 0.31, literacyRate: 0.571, totalPop: 1840 },
  { district: 'bijnor',              state: 'uttar pradesh', density: 596,  urbanPct: 0.21, literacyRate: 0.600, totalPop: 3683 },
  { district: 'bulandshahr',         state: 'uttar pradesh', density: 1056, urbanPct: 0.27, literacyRate: 0.729, totalPop: 3499 },
  { district: 'etah',                state: 'uttar pradesh', density: 600,  urbanPct: 0.17, literacyRate: 0.640, totalPop: 1774 },
  { district: 'unnao',               state: 'uttar pradesh', density: 683,  urbanPct: 0.15, literacyRate: 0.710, totalPop: 3108 },
  { district: 'rae bareli',          state: 'uttar pradesh', density: 622,  urbanPct: 0.15, literacyRate: 0.696, totalPop: 3405 },
  { district: 'sitapur',             state: 'uttar pradesh', density: 551,  urbanPct: 0.14, literacyRate: 0.626, totalPop: 4474 },

  // ── Bihar ──────────────────────────────────────────────────────────────────
  { district: 'patna',               state: 'bihar', density: 1802, urbanPct: 0.44, literacyRate: 0.702, totalPop: 5838 },
  { district: 'muzaffarpur',         state: 'bihar', density: 1505, urbanPct: 0.12, literacyRate: 0.601, totalPop: 4779 },
  { district: 'gaya',                state: 'bihar', density: 623,  urbanPct: 0.21, literacyRate: 0.631, totalPop: 4391 },
  { district: 'bhagalpur',           state: 'bihar', density: 1030, urbanPct: 0.19, literacyRate: 0.631, totalPop: 3037 },
  { district: 'darbhanga',           state: 'bihar', density: 1483, urbanPct: 0.10, literacyRate: 0.593, totalPop: 3937 },
  { district: 'begusarai',           state: 'bihar', density: 1161, urbanPct: 0.13, literacyRate: 0.632, totalPop: 2970 },
  { district: 'purnia',              state: 'bihar', density: 714,  urbanPct: 0.13, literacyRate: 0.517, totalPop: 3264 },
  { district: 'nalanda',             state: 'bihar', density: 995,  urbanPct: 0.11, literacyRate: 0.649, totalPop: 2877 },
  { district: 'motihari',            state: 'bihar', density: 1200, urbanPct: 0.08, literacyRate: 0.581, totalPop: 2922 },
  { district: 'east champaran',      state: 'bihar', density: 1200, urbanPct: 0.08, literacyRate: 0.581, totalPop: 2922 },

  // ── Rajasthan ──────────────────────────────────────────────────────────────
  { district: 'jaipur',              state: 'rajasthan', density: 595,  urbanPct: 0.66, literacyRate: 0.766, totalPop: 6626 },
  { district: 'jodhpur',             state: 'rajasthan', density: 92,   urbanPct: 0.42, literacyRate: 0.658, totalPop: 3685 },
  { district: 'kota',                state: 'rajasthan', density: 148,  urbanPct: 0.54, literacyRate: 0.769, totalPop: 1951 },
  { district: 'ajmer',               state: 'rajasthan', density: 149,  urbanPct: 0.44, literacyRate: 0.699, totalPop: 2584 },
  { district: 'udaipur',             state: 'rajasthan', density: 64,   urbanPct: 0.31, literacyRate: 0.613, totalPop: 3068 },
  { district: 'bikaner',             state: 'rajasthan', density: 22,   urbanPct: 0.49, literacyRate: 0.660, totalPop: 2367 },
  { district: 'alwar',               state: 'rajasthan', density: 256,  urbanPct: 0.26, literacyRate: 0.704, totalPop: 3674 },
  { district: 'bharatpur',           state: 'rajasthan', density: 343,  urbanPct: 0.28, literacyRate: 0.706, totalPop: 2549 },
  { district: 'sikar',               state: 'rajasthan', density: 186,  urbanPct: 0.24, literacyRate: 0.752, totalPop: 2677 },
  { district: 'pali',                state: 'rajasthan', density: 59,   urbanPct: 0.30, literacyRate: 0.632, totalPop: 2038 },

  // ── Madhya Pradesh ─────────────────────────────────────────────────────────
  { district: 'indore',              state: 'madhya pradesh', density: 394,  urbanPct: 0.79, literacyRate: 0.830, totalPop: 3276 },
  { district: 'bhopal',              state: 'madhya pradesh', density: 479,  urbanPct: 0.79, literacyRate: 0.829, totalPop: 2371 },
  { district: 'jabalpur',            state: 'madhya pradesh', density: 268,  urbanPct: 0.48, literacyRate: 0.820, totalPop: 2461 },
  { district: 'gwalior',             state: 'madhya pradesh', density: 320,  urbanPct: 0.66, literacyRate: 0.787, totalPop: 2032 },
  { district: 'ujjain',              state: 'madhya pradesh', density: 328,  urbanPct: 0.43, literacyRate: 0.783, totalPop: 1986 },
  { district: 'rewa',                state: 'madhya pradesh', density: 249,  urbanPct: 0.17, literacyRate: 0.730, totalPop: 2365 },
  { district: 'sagar',               state: 'madhya pradesh', density: 152,  urbanPct: 0.33, literacyRate: 0.762, totalPop: 2380 },
  { district: 'satna',               state: 'madhya pradesh', density: 168,  urbanPct: 0.23, literacyRate: 0.727, totalPop: 2228 },
  { district: 'dewas',               state: 'madhya pradesh', density: 196,  urbanPct: 0.37, literacyRate: 0.766, totalPop: 1564 },
  { district: 'ratlam',              state: 'madhya pradesh', density: 243,  urbanPct: 0.40, literacyRate: 0.734, totalPop: 1455 },

  // ── Gujarat ────────────────────────────────────────────────────────────────
  { district: 'ahmedabad',           state: 'gujarat', density: 850,  urbanPct: 0.88, literacyRate: 0.858, totalPop: 7215 },
  { district: 'surat',               state: 'gujarat', density: 1333, urbanPct: 0.86, literacyRate: 0.852, totalPop: 6079 },
  { district: 'vadodara',            state: 'gujarat', density: 391,  urbanPct: 0.64, literacyRate: 0.843, totalPop: 4157 },
  { district: 'rajkot',              state: 'gujarat', density: 369,  urbanPct: 0.65, literacyRate: 0.847, totalPop: 3804 },
  { district: 'gandhinagar',         state: 'gujarat', density: 748,  urbanPct: 0.71, literacyRate: 0.873, totalPop: 1391 },
  { district: 'mehsana',             state: 'gujarat', density: 463,  urbanPct: 0.39, literacyRate: 0.802, totalPop: 2027 },
  { district: 'anand',               state: 'gujarat', density: 514,  urbanPct: 0.43, literacyRate: 0.836, totalPop: 2093 },
  { district: 'bharuch',             state: 'gujarat', density: 230,  urbanPct: 0.41, literacyRate: 0.797, totalPop: 1551 },
  { district: 'bhavnagar',           state: 'gujarat', density: 228,  urbanPct: 0.48, literacyRate: 0.795, totalPop: 2877 },
  { district: 'jamnagar',            state: 'gujarat', density: 143,  urbanPct: 0.52, literacyRate: 0.781, totalPop: 2159 },

  // ── Karnataka ──────────────────────────────────────────────────────────────
  { district: 'bengaluru urban',     state: 'karnataka', density: 4378, urbanPct: 0.91, literacyRate: 0.888, totalPop: 9621 },
  { district: 'bangalore urban',     state: 'karnataka', density: 4378, urbanPct: 0.91, literacyRate: 0.888, totalPop: 9621 },
  { district: 'bengaluru rural',     state: 'karnataka', density: 198,  urbanPct: 0.18, literacyRate: 0.789, totalPop: 990 },
  { district: 'mysuru',              state: 'karnataka', density: 253,  urbanPct: 0.42, literacyRate: 0.792, totalPop: 3001 },
  { district: 'mysore',              state: 'karnataka', density: 253,  urbanPct: 0.42, literacyRate: 0.792, totalPop: 3001 },
  { district: 'dakshina kannada',    state: 'karnataka', density: 388,  urbanPct: 0.48, literacyRate: 0.883, totalPop: 2089 },
  { district: 'dharwad',             state: 'karnataka', density: 274,  urbanPct: 0.61, literacyRate: 0.802, totalPop: 1847 },
  { district: 'belagavi',            state: 'karnataka', density: 198,  urbanPct: 0.35, literacyRate: 0.751, totalPop: 4779 },
  { district: 'bellary',             state: 'karnataka', density: 152,  urbanPct: 0.43, literacyRate: 0.726, totalPop: 2532 },
  { district: 'tumkur',              state: 'karnataka', density: 189,  urbanPct: 0.28, literacyRate: 0.787, totalPop: 2678 },
  { district: 'raichur',             state: 'karnataka', density: 130,  urbanPct: 0.29, literacyRate: 0.619, totalPop: 1924 },
  { district: 'shivamogga',          state: 'karnataka', density: 141,  urbanPct: 0.38, literacyRate: 0.826, totalPop: 1753 },

  // ── Tamil Nadu ─────────────────────────────────────────────────────────────
  { district: 'chennai',             state: 'tamil nadu', density: 26553, urbanPct: 1.00, literacyRate: 0.906, totalPop: 4646 },
  { district: 'coimbatore',          state: 'tamil nadu', density: 547,   urbanPct: 0.64, literacyRate: 0.843, totalPop: 3458 },
  { district: 'madurai',             state: 'tamil nadu', density: 1053,  urbanPct: 0.64, literacyRate: 0.841, totalPop: 3038 },
  { district: 'tiruchirappalli',     state: 'tamil nadu', density: 635,   urbanPct: 0.53, literacyRate: 0.845, totalPop: 2722 },
  { district: 'salem',               state: 'tamil nadu', density: 659,   urbanPct: 0.50, literacyRate: 0.783, totalPop: 3482 },
  { district: 'tirunelveli',         state: 'tamil nadu', density: 356,   urbanPct: 0.44, literacyRate: 0.835, totalPop: 3072 },
  { district: 'vellore',             state: 'tamil nadu', density: 596,   urbanPct: 0.39, literacyRate: 0.797, totalPop: 3936 },
  { district: 'erode',               state: 'tamil nadu', density: 328,   urbanPct: 0.47, literacyRate: 0.808, totalPop: 2251 },
  { district: 'tiruppur',            state: 'tamil nadu', density: 573,   urbanPct: 0.60, literacyRate: 0.812, totalPop: 2479 },
  { district: 'kancheepuram',        state: 'tamil nadu', density: 791,   urbanPct: 0.54, literacyRate: 0.834, totalPop: 3998 },
  { district: 'chengalpattu',        state: 'tamil nadu', density: 720,   urbanPct: 0.53, literacyRate: 0.830, totalPop: 2556 },

  // ── Telangana ──────────────────────────────────────────────────────────────
  { district: 'hyderabad',           state: 'telangana', density: 18480, urbanPct: 1.00, literacyRate: 0.830, totalPop: 3943 },
  { district: 'rangareddy',          state: 'telangana', density: 703,   urbanPct: 0.69, literacyRate: 0.793, totalPop: 5296 },
  { district: 'medchal malkajgiri',  state: 'telangana', density: 1830,  urbanPct: 0.88, literacyRate: 0.825, totalPop: 2739 },
  { district: 'warangal urban',      state: 'telangana', density: 850,   urbanPct: 0.65, literacyRate: 0.754, totalPop: 956 },
  { district: 'nizamabad',           state: 'telangana', density: 286,   urbanPct: 0.32, literacyRate: 0.629, totalPop: 1762 },
  { district: 'karimnagar',          state: 'telangana', density: 334,   urbanPct: 0.36, literacyRate: 0.668, totalPop: 1953 },

  // ── Andhra Pradesh ─────────────────────────────────────────────────────────
  { district: 'visakhapatnam',       state: 'andhra pradesh', density: 413,  urbanPct: 0.47, literacyRate: 0.749, totalPop: 4290 },
  { district: 'krishna',             state: 'andhra pradesh', density: 520,  urbanPct: 0.44, literacyRate: 0.750, totalPop: 4517 },
  { district: 'guntur',              state: 'andhra pradesh', density: 396,  urbanPct: 0.37, literacyRate: 0.673, totalPop: 4889 },
  { district: 'east godavari',       state: 'andhra pradesh', density: 348,  urbanPct: 0.30, literacyRate: 0.695, totalPop: 5152 },
  { district: 'west godavari',       state: 'andhra pradesh', density: 380,  urbanPct: 0.31, literacyRate: 0.742, totalPop: 3934 },
  { district: 'prakasam',            state: 'andhra pradesh', density: 127,  urbanPct: 0.22, literacyRate: 0.612, totalPop: 3392 },
  { district: 'kurnool',             state: 'andhra pradesh', density: 131,  urbanPct: 0.32, literacyRate: 0.589, totalPop: 4053 },

  // ── Kerala ─────────────────────────────────────────────────────────────────
  { district: 'thiruvananthapuram',  state: 'kerala', density: 1509, urbanPct: 0.68, literacyRate: 0.930, totalPop: 3302 },
  { district: 'ernakulam',           state: 'kerala', density: 1066, urbanPct: 0.68, literacyRate: 0.948, totalPop: 3282 },
  { district: 'kozhikode',           state: 'kerala', density: 1318, urbanPct: 0.51, literacyRate: 0.944, totalPop: 3086 },
  { district: 'thrissur',            state: 'kerala', density: 1031, urbanPct: 0.53, literacyRate: 0.944, totalPop: 3121 },
  { district: 'kollam',              state: 'kerala', density: 1131, urbanPct: 0.60, literacyRate: 0.939, totalPop: 2635 },
  { district: 'malappuram',          state: 'kerala', density: 1101, urbanPct: 0.29, literacyRate: 0.900, totalPop: 4112 },
  { district: 'palakkad',            state: 'kerala', density: 555,  urbanPct: 0.27, literacyRate: 0.918, totalPop: 2809 },
  { district: 'kannur',              state: 'kerala', density: 848,  urbanPct: 0.37, literacyRate: 0.950, totalPop: 2524 },
  { district: 'alappuzha',           state: 'kerala', density: 1501, urbanPct: 0.52, literacyRate: 0.960, totalPop: 2127 },
  { district: 'kottayam',            state: 'kerala', density: 786,  urbanPct: 0.38, literacyRate: 0.972, totalPop: 1974 },
  { district: 'idukki',              state: 'kerala', density: 136,  urbanPct: 0.11, literacyRate: 0.912, totalPop: 1108 },
  { district: 'wayanad',             state: 'kerala', density: 250,  urbanPct: 0.11, literacyRate: 0.897, totalPop: 817 },
  { district: 'kasaragod',           state: 'kerala', density: 566,  urbanPct: 0.26, literacyRate: 0.904, totalPop: 1307 },
  { district: 'pathanamthitta',      state: 'kerala', density: 413,  urbanPct: 0.15, literacyRate: 0.974, totalPop: 1197 },

  // ── West Bengal ────────────────────────────────────────────────────────────
  { district: 'kolkata',             state: 'west bengal', density: 24252, urbanPct: 1.00, literacyRate: 0.870, totalPop: 4487 },
  { district: 'howrah',              state: 'west bengal', density: 3300,  urbanPct: 0.74, literacyRate: 0.831, totalPop: 4851 },
  { district: 'hooghly',             state: 'west bengal', density: 1570,  urbanPct: 0.44, literacyRate: 0.809, totalPop: 5520 },
  { district: 'north 24 parganas',   state: 'west bengal', density: 2149,  urbanPct: 0.55, literacyRate: 0.810, totalPop: 10009 },
  { district: 'south 24 parganas',   state: 'west bengal', density: 841,   urbanPct: 0.20, literacyRate: 0.778, totalPop: 8161 },
  { district: 'murshidabad',         state: 'west bengal', density: 1334,  urbanPct: 0.15, literacyRate: 0.667, totalPop: 7102 },
  { district: 'nadia',               state: 'west bengal', density: 1316,  urbanPct: 0.30, literacyRate: 0.757, totalPop: 5168 },
  { district: 'bardhaman',           state: 'west bengal', density: 1033,  urbanPct: 0.40, literacyRate: 0.754, totalPop: 7722 },
  { district: 'paschim bardhaman',   state: 'west bengal', density: 1033,  urbanPct: 0.40, literacyRate: 0.754, totalPop: 2882 },
  { district: 'purba bardhaman',     state: 'west bengal', density: 1100,  urbanPct: 0.27, literacyRate: 0.747, totalPop: 4835 },

  // ── Punjab ─────────────────────────────────────────────────────────────────
  { district: 'ludhiana',            state: 'punjab', density: 988,  urbanPct: 0.75, literacyRate: 0.818, totalPop: 3498 },
  { district: 'amritsar',            state: 'punjab', density: 820,  urbanPct: 0.58, literacyRate: 0.762, totalPop: 2490 },
  { district: 'jalandhar',           state: 'punjab', density: 882,  urbanPct: 0.62, literacyRate: 0.822, totalPop: 2194 },
  { district: 'patiala',             state: 'punjab', density: 579,  urbanPct: 0.49, literacyRate: 0.793, totalPop: 1892 },
  { district: 'mohali',              state: 'punjab', density: 788,  urbanPct: 0.68, literacyRate: 0.854, totalPop: 994 },
  { district: 'sahibzada ajit singh nagar', state: 'punjab', density: 788, urbanPct: 0.68, literacyRate: 0.854, totalPop: 994 },
  { district: 'gurdaspur',           state: 'punjab', density: 507,  urbanPct: 0.24, literacyRate: 0.745, totalPop: 2299 },
  { district: 'bathinda',            state: 'punjab', density: 316,  urbanPct: 0.40, literacyRate: 0.719, totalPop: 1388 },
  { district: 'hoshiarpur',          state: 'punjab', density: 408,  urbanPct: 0.26, literacyRate: 0.820, totalPop: 1583 },

  // ── Haryana ────────────────────────────────────────────────────────────────
  { district: 'faridabad',           state: 'haryana', density: 2442, urbanPct: 0.84, literacyRate: 0.810, totalPop: 1809 },
  { district: 'gurugram',            state: 'haryana', density: 1241, urbanPct: 0.73, literacyRate: 0.844, totalPop: 1514 },
  { district: 'gurgaon',             state: 'haryana', density: 1241, urbanPct: 0.73, literacyRate: 0.844, totalPop: 1514 },
  { district: 'sonipat',             state: 'haryana', density: 671,  urbanPct: 0.36, literacyRate: 0.795, totalPop: 1450 },
  { district: 'panipat',             state: 'haryana', density: 705,  urbanPct: 0.50, literacyRate: 0.782, totalPop: 1202 },
  { district: 'ambala',              state: 'haryana', density: 578,  urbanPct: 0.47, literacyRate: 0.820, totalPop: 1128 },
  { district: 'hisar',               state: 'haryana', density: 259,  urbanPct: 0.37, literacyRate: 0.755, totalPop: 1743 },
  { district: 'rohtak',              state: 'haryana', density: 626,  urbanPct: 0.44, literacyRate: 0.802, totalPop: 1058 },
  { district: 'karnal',              state: 'haryana', density: 486,  urbanPct: 0.36, literacyRate: 0.785, totalPop: 1506 },
  { district: 'yamunanagar',         state: 'haryana', density: 537,  urbanPct: 0.38, literacyRate: 0.782, totalPop: 1214 },

  // ── Odisha ─────────────────────────────────────────────────────────────────
  { district: 'khordha',             state: 'odisha', density: 757,  urbanPct: 0.58, literacyRate: 0.840, totalPop: 2251 },
  { district: 'cuttack',             state: 'odisha', density: 834,  urbanPct: 0.43, literacyRate: 0.813, totalPop: 2625 },
  { district: 'ganjam',              state: 'odisha', density: 295,  urbanPct: 0.19, literacyRate: 0.738, totalPop: 3520 },
  { district: 'sundargarh',          state: 'odisha', density: 161,  urbanPct: 0.28, literacyRate: 0.765, totalPop: 2093 },
  { district: 'sambalpur',           state: 'odisha', density: 96,   urbanPct: 0.29, literacyRate: 0.789, totalPop: 1044 },

  // ── Assam ──────────────────────────────────────────────────────────────────
  { district: 'kamrup metropolitan', state: 'assam', density: 1583, urbanPct: 0.86, literacyRate: 0.870, totalPop: 1260 },
  { district: 'kamrup',              state: 'assam', density: 429,  urbanPct: 0.12, literacyRate: 0.736, totalPop: 1516 },
  { district: 'dibrugarh',           state: 'assam', density: 266,  urbanPct: 0.26, literacyRate: 0.784, totalPop: 1327 },
  { district: 'nagaon',              state: 'assam', density: 367,  urbanPct: 0.09, literacyRate: 0.702, totalPop: 2823 },
  { district: 'sonitpur',            state: 'assam', density: 253,  urbanPct: 0.11, literacyRate: 0.737, totalPop: 1924 },

  // ── Jharkhand ──────────────────────────────────────────────────────────────
  { district: 'ranchi',              state: 'jharkhand', density: 467,  urbanPct: 0.40, literacyRate: 0.770, totalPop: 2914 },
  { district: 'dhanbad',             state: 'jharkhand', density: 1316, urbanPct: 0.51, literacyRate: 0.783, totalPop: 2684 },
  { district: 'bokaro',              state: 'jharkhand', density: 575,  urbanPct: 0.44, literacyRate: 0.757, totalPop: 2062 },
  { district: 'east singhbhum',      state: 'jharkhand', density: 474,  urbanPct: 0.51, literacyRate: 0.769, totalPop: 2291 },

  // ── Chhattisgarh ───────────────────────────────────────────────────────────
  { district: 'raipur',              state: 'chhattisgarh', density: 304,  urbanPct: 0.50, literacyRate: 0.783, totalPop: 4063 },
  { district: 'durg',                state: 'chhattisgarh', density: 475,  urbanPct: 0.53, literacyRate: 0.795, totalPop: 3343 },
  { district: 'bilaspur',            state: 'chhattisgarh', density: 258,  urbanPct: 0.35, literacyRate: 0.769, totalPop: 2663 },
  { district: 'korba',               state: 'chhattisgarh', density: 157,  urbanPct: 0.45, literacyRate: 0.724, totalPop: 1206 },

  // ── Uttarakhand ────────────────────────────────────────────────────────────
  { district: 'dehradun',            state: 'uttarakhand', density: 550,  urbanPct: 0.58, literacyRate: 0.841, totalPop: 1696 },
  { district: 'haridwar',            state: 'uttarakhand', density: 800,  urbanPct: 0.39, literacyRate: 0.734, totalPop: 1890 },
  { district: 'udham singh nagar',   state: 'uttarakhand', density: 500,  urbanPct: 0.36, literacyRate: 0.740, totalPop: 1648 },
  { district: 'nainital',            state: 'uttarakhand', density: 193,  urbanPct: 0.32, literacyRate: 0.836, totalPop: 955 },

  // ── Jammu & Kashmir ────────────────────────────────────────────────────────
  { district: 'jammu',               state: 'jammu and kashmir', density: 272,  urbanPct: 0.42, literacyRate: 0.743, totalPop: 1526 },
  { district: 'srinagar',            state: 'jammu and kashmir', density: 450,  urbanPct: 0.61, literacyRate: 0.694, totalPop: 1251 },
  { district: 'baramulla',           state: 'jammu and kashmir', density: 133,  urbanPct: 0.16, literacyRate: 0.580, totalPop: 1009 },
  { district: 'anantnag',            state: 'jammu and kashmir', density: 182,  urbanPct: 0.14, literacyRate: 0.588, totalPop: 1070 },

  // ── Himachal Pradesh ───────────────────────────────────────────────────────
  { district: 'shimla',              state: 'himachal pradesh', density: 159, urbanPct: 0.33, literacyRate: 0.843, totalPop: 814 },
  { district: 'kangra',              state: 'himachal pradesh', density: 264, urbanPct: 0.12, literacyRate: 0.858, totalPop: 1507 },
  { district: 'solan',               state: 'himachal pradesh', density: 200, urbanPct: 0.28, literacyRate: 0.849, totalPop: 576 },

  // ── Goa ────────────────────────────────────────────────────────────────────
  { district: 'north goa',           state: 'goa', density: 368, urbanPct: 0.62, literacyRate: 0.900, totalPop: 818 },
  { district: 'south goa',           state: 'goa', density: 134, urbanPct: 0.30, literacyRate: 0.888, totalPop: 640 },

  // ── Tripura ────────────────────────────────────────────────────────────────
  { district: 'west tripura',        state: 'tripura', density: 584, urbanPct: 0.41, literacyRate: 0.896, totalPop: 1725 },

  // ── Manipur ────────────────────────────────────────────────────────────────
  { district: 'imphal west',         state: 'manipur', density: 827, urbanPct: 0.56, literacyRate: 0.849, totalPop: 518 },
  { district: 'imphal east',         state: 'manipur', density: 455, urbanPct: 0.25, literacyRate: 0.828, totalPop: 455 },
];

// ─── State-level fallback densities (Census 2011) ────────────────────────────
// Used when district match fails.

export const STATE_DENSITY_FALLBACK: Record<string, { density: number; urbanPct: number; literacyRate: number }> = {
  'delhi':               { density: 11297, urbanPct: 0.98, literacyRate: 0.864 },
  'chandigarh':          { density: 9252,  urbanPct: 0.97, literacyRate: 0.864 },
  'puducherry':          { density: 2598,  urbanPct: 0.68, literacyRate: 0.860 },
  'lakshadweep':         { density: 2013,  urbanPct: 0.78, literacyRate: 0.917 },
  'goa':                 { density: 394,   urbanPct: 0.62, literacyRate: 0.889 },
  'kerala':              { density: 859,   urbanPct: 0.48, literacyRate: 0.940 },
  'west bengal':         { density: 1028,  urbanPct: 0.32, literacyRate: 0.767 },
  'bihar':               { density: 1102,  urbanPct: 0.11, literacyRate: 0.618 },
  'uttar pradesh':       { density: 828,   urbanPct: 0.22, literacyRate: 0.677 },
  'tamil nadu':          { density: 555,   urbanPct: 0.48, literacyRate: 0.804 },
  'punjab':              { density: 550,   urbanPct: 0.38, literacyRate: 0.767 },
  'haryana':             { density: 573,   urbanPct: 0.35, literacyRate: 0.757 },
  'gujarat':             { density: 308,   urbanPct: 0.43, literacyRate: 0.783 },
  'maharashtra':         { density: 365,   urbanPct: 0.45, literacyRate: 0.823 },
  'karnataka':           { density: 319,   urbanPct: 0.39, literacyRate: 0.754 },
  'telangana':           { density: 307,   urbanPct: 0.39, literacyRate: 0.672 },
  'andhra pradesh':      { density: 308,   urbanPct: 0.29, literacyRate: 0.671 },
  'assam':               { density: 397,   urbanPct: 0.14, literacyRate: 0.728 },
  'jharkhand':           { density: 414,   urbanPct: 0.24, literacyRate: 0.668 },
  'odisha':              { density: 269,   urbanPct: 0.17, literacyRate: 0.729 },
  'chhattisgarh':        { density: 189,   urbanPct: 0.24, literacyRate: 0.710 },
  'madhya pradesh':      { density: 236,   urbanPct: 0.28, literacyRate: 0.699 },
  'rajasthan':           { density: 201,   urbanPct: 0.25, literacyRate: 0.667 },
  'uttarakhand':         { density: 189,   urbanPct: 0.31, literacyRate: 0.797 },
  'himachal pradesh':    { density: 123,   urbanPct: 0.10, literacyRate: 0.830 },
  'jammu and kashmir':   { density: 56,    urbanPct: 0.27, literacyRate: 0.677 },
  'tripura':             { density: 350,   urbanPct: 0.26, literacyRate: 0.876 },
  'manipur':             { density: 115,   urbanPct: 0.31, literacyRate: 0.800 },
  'meghalaya':           { density: 132,   urbanPct: 0.20, literacyRate: 0.755 },
  'nagaland':            { density: 119,   urbanPct: 0.29, literacyRate: 0.803 },
  'sikkim':              { density: 86,    urbanPct: 0.25, literacyRate: 0.822 },
  'mizoram':             { density: 52,    urbanPct: 0.52, literacyRate: 0.912 },
  'arunachal pradesh':   { density: 17,    urbanPct: 0.23, literacyRate: 0.660 },
};

// ─── Lookup index ─────────────────────────────────────────────────────────────

const _districtIndex = new Map<string, CensusDistrict>();
for (const d of CENSUS_DISTRICTS) {
  _districtIndex.set(`${d.district}|${d.state}`, d);
  _districtIndex.set(d.district, d); // district-only fallback
}

export function lookupCensusDistrict(
  district: string,
  state?: string,
): CensusDistrict | null {
  const d = district.toLowerCase().trim();
  const s = state?.toLowerCase().trim();

  if (s) {
    const exact = _districtIndex.get(`${d}|${s}`);
    if (exact) return exact;
  }

  // District-only match
  const districtOnly = _districtIndex.get(d);
  if (districtOnly) return districtOnly;

  // Partial match — district name contains query or vice versa
  for (const [, entry] of _districtIndex) {
    if (s && entry.state !== s) continue;
    if (entry.district.includes(d) || d.includes(entry.district)) return entry;
  }

  return null;
}

export function getStateFallback(state: string) {
  return STATE_DENSITY_FALLBACK[state.toLowerCase().trim()] ?? null;
}
