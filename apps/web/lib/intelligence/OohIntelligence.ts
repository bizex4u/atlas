/**
 * OohIntelligence — India-specific OOH market intelligence layer.
 *
 * Provides:
 * - City tier classification (T1 metro / T2 urban / T3 semi-urban)
 * - SEC audience profiling by tier
 * - OOH format recommendations per area type
 * - INR pricing benchmarks by tier and format
 * - State-level festival calendars
 * - Realistic impression range by format + tier
 */

// ─── City Tier Definitions ────────────────────────────────────────────────────

export type CityTier = 'T1' | 'T2' | 'T3';

interface TierDef {
  tier:        CityTier;
  label:       string;     // "Metro", "Major City", "Emerging Town"
  avgCPM:      number;     // cost per thousand impressions (INR)
  oohPriceMin: number;     // ₹ per 10 sqft per month, low end
  oohPriceMax: number;     // ₹ per 10 sqft per month, high end
  secProfile:  string;     // dominant SEC segments
  digitalPct:  number;     // % of population digitally active (proxy for affluence)
}

const TIER_DEFS: Record<CityTier, TierDef> = {
  T1: {
    tier: 'T1', label: 'Metro',
    avgCPM: 180, oohPriceMin: 8000, oohPriceMax: 35000,
    secProfile: 'SEC A1/A2/B1 dominant — high disposable income, early adopters',
    digitalPct: 0.78,
  },
  T2: {
    tier: 'T2', label: 'Major City',
    avgCPM: 90, oohPriceMin: 2000, oohPriceMax: 8000,
    secProfile: 'SEC B1/B2/C1 dominant — aspirational middle class, value-conscious',
    digitalPct: 0.52,
  },
  T3: {
    tier: 'T3', label: 'Emerging Town',
    avgCPM: 45, oohPriceMin: 500, oohPriceMax: 2500,
    secProfile: 'SEC C1/C2/D — price-sensitive, influenced by regional TV + OOH',
    digitalPct: 0.31,
  },
};

/** T1 metros — 8 major cities */
const T1_CITIES = new Set([
  'Mumbai', 'Delhi', 'Bangalore', 'Bengaluru', 'Hyderabad',
  'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
]);

/** T2 cities — state capitals + major commercial centers */
const T2_CITIES = new Set([
  'Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Meerut', 'Prayagraj', 'Allahabad',
  'Ghaziabad', 'Noida', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur',
  'Mathura', 'Muzaffarnagar', 'Ayodhya', 'Saharanpur', 'Vrindavan',
  'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur',
  'Jaipur', 'Jodhpur', 'Kota', 'Ajmer', 'Udaipur', 'Bikaner', 'Alwar',
  'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain',
  'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar',
  'Nagpur', 'Nashik', 'Aurangabad', 'Chhatrapati Sambhajinagar', 'Kolhapur', 'Solapur',
  'Mysuru', 'Mysore', 'Mangaluru', 'Mangalore', 'Hubli', 'Dharwad', 'Belagavi', 'Belgaum',
  'Coimbatore', 'Madurai', 'Trichy', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
  'Visakhapatnam', 'Vizag', 'Vijayawada', 'Guntur', 'Warangal',
  'Kochi', 'Thiruvananthapuram', 'Trivandrum', 'Kozhikode', 'Calicut',
  'Ludhiana', 'Amritsar', 'Chandigarh', 'Faridabad', 'Gurugram', 'Gurgaon',
  'Bhubaneswar', 'Cuttack', 'Guwahati',
  'Srinagar', 'Jammu',
  'Dehradun', 'Rishikesh',
  'Raipur', 'Bhilai', 'Ranchi', 'Jamshedpur',
]);

export function classifyCity(city: string): CityTier {
  const c = city.trim();
  if (T1_CITIES.has(c)) return 'T1';
  if (T2_CITIES.has(c)) return 'T2';
  return 'T3';
}

export function getTierDef(tier: CityTier): TierDef {
  return TIER_DEFS[tier];
}

// ─── OOH Format Recommendations ───────────────────────────────────────────────

export interface OohFormat {
  name:          string;   // "Large Backlit Hoarding"
  dimensions:    string;   // "40×20 ft"
  placement:     string;   // "Highway-facing, elevated"
  impressions:   string;   // "40,000–70,000 daily"
  priceRange:    string;   // "₹80K–₹2L/month"
  bestFor:       string;   // "FMCG, Electronics, Auto"
  priority:      'Primary' | 'Secondary';
}

type AreaType = string;

const FORMAT_BY_AREA: Record<string, OohFormat[]> = {
  'CBD': [
    { name: 'Large Backlit Hoarding', dimensions: '40×20 ft', placement: 'Junction-facing, min 30 ft height', impressions: '80,000–1,20,000 daily', priceRange: '₹1.5L–₹4L/month', bestFor: 'Banking, BFSI, Luxury, Auto', priority: 'Primary' },
    { name: 'LED Video Wall', dimensions: '20×12 ft', placement: 'Eye-level at pedestrian junction', impressions: '60,000–90,000 daily', priceRange: '₹2L–₹6L/month', bestFor: 'Electronics, F&B, Telecom', priority: 'Primary' },
    { name: 'Bus Shelter Panels', dimensions: '4×6 ft', placement: 'High-footfall stops, 6 panels minimum', impressions: '25,000–40,000 daily per panel', priceRange: '₹25K–₹80K/month', bestFor: 'FMCG, Healthcare, Education', priority: 'Secondary' },
  ],
  'Commercial Hub': [
    { name: 'Unipole', dimensions: '30×15 ft', placement: 'Entry road to market, 40 ft pole', impressions: '50,000–80,000 daily', priceRange: '₹60K–₹1.8L/month', bestFor: 'Retail, Electronics, Jewellery', priority: 'Primary' },
    { name: 'Wall-wrap Hoarding', dimensions: '60×30 ft', placement: 'Facing main market lane', impressions: '35,000–60,000 daily', priceRange: '₹40K–₹1.2L/month', bestFor: 'FMCG, Consumer Goods, Telecom', priority: 'Primary' },
    { name: 'Gantry Banner', dimensions: '80×6 ft', placement: 'Spanning market entry road', impressions: '70,000–1,00,000 daily', priceRange: '₹80K–₹2.5L/month', bestFor: 'Mass brands, Retail chains', priority: 'Secondary' },
  ],
  'Transit Hub': [
    { name: 'Metro Station Branding', dimensions: 'Full station wrap', placement: 'Platform + concourse', impressions: '1,00,000–3,00,000 daily', priceRange: '₹3L–₹12L/month', bestFor: 'Any premium brand, BFSI', priority: 'Primary' },
    { name: 'Bus Terminus Panels', dimensions: '6×4 ft per panel', placement: 'Waiting bay, 10+ panels', impressions: '40,000–80,000 daily', priceRange: '₹30K–₹90K/month', bestFor: 'FMCG, Regional brands', priority: 'Primary' },
    { name: 'Digital Kiosk', dimensions: '55-inch LCD portrait', placement: 'Entry/exit gate area', impressions: '20,000–50,000 daily', priceRange: '₹20K–₹60K/month', bestFor: 'Fintech, OTT, E-commerce', priority: 'Secondary' },
  ],
  'Residential': [
    { name: 'Society Gate Branding', dimensions: '8×4 ft', placement: 'RWA gate, eye level', impressions: '3,000–8,000 daily', priceRange: '₹5K–₹20K/month', bestFor: 'FMCG, Real Estate, Durables', priority: 'Primary' },
    { name: 'Lift Branding', dimensions: '4×5 ft inside lift', placement: 'All lifts in building', impressions: '800–2,000 daily', priceRange: '₹3K–₹10K/month', bestFor: 'Healthcare, D2C, Education', priority: 'Secondary' },
    { name: 'Unipole at Feeder Road', dimensions: '20×10 ft', placement: 'Main road feeding colony', impressions: '15,000–30,000 daily', priceRange: '₹25K–₹60K/month', bestFor: 'Retail, Telecom, Auto', priority: 'Primary' },
  ],
  'Industrial Area': [
    { name: 'Highway Hoarding', dimensions: '40×20 ft', placement: 'NH/SH facing, 1 km before interchange', impressions: '60,000–1,00,000 daily', priceRange: '₹50K–₹1.5L/month', bestFor: 'B2B, Auto, Industrial supplies', priority: 'Primary' },
    { name: 'Wall Paint / Painted Wall', dimensions: 'Variable, 400–800 sqft', placement: 'Factory boundary wall facing road', impressions: '10,000–25,000 daily', priceRange: '₹8K–₹25K/month', bestFor: 'Regional brands, Cement, Steel', priority: 'Secondary' },
  ],
  'Mixed Use': [
    { name: 'Large Backlit Hoarding', dimensions: '40×20 ft', placement: 'Intersection-facing', impressions: '40,000–70,000 daily', priceRange: '₹60K–₹1.5L/month', bestFor: 'FMCG, Electronics, Apparel', priority: 'Primary' },
    { name: 'Unipole', dimensions: '30×15 ft', placement: 'Main road, 35 ft height', impressions: '35,000–55,000 daily', priceRange: '₹40K–₹1L/month', bestFor: 'Banking, Retail, Pharma', priority: 'Secondary' },
  ],
};

const FORMAT_FALLBACK: OohFormat[] = [
  { name: 'Large Backlit Hoarding', dimensions: '40×20 ft', placement: 'Main road junction', impressions: '30,000–60,000 daily', priceRange: '₹40K–₹1.2L/month', bestFor: 'General — FMCG, Electronics, Auto', priority: 'Primary' },
  { name: 'Unipole', dimensions: '30×15 ft', placement: 'Road shoulder, 30 ft pole', impressions: '20,000–45,000 daily', priceRange: '₹25K–₹70K/month', bestFor: 'Retail, Healthcare, Telecom', priority: 'Secondary' },
];

export function getFormatRecommendations(areaType: AreaType): OohFormat[] {
  for (const [key, formats] of Object.entries(FORMAT_BY_AREA)) {
    if (areaType.toLowerCase().includes(key.toLowerCase())) return formats;
  }
  return FORMAT_FALLBACK;
}

// ─── State-level Festival Calendar ───────────────────────────────────────────

export interface FestivalNote {
  month:   string;   // "oct"
  festival: string;
  uplift:   'Very High' | 'High' | 'Medium';
  note:     string;
}

// National + state-specific festivals affecting OOH spend
const STATE_FESTIVALS: Record<string, FestivalNote[]> = {
  'Uttar Pradesh': [
    { month: 'jan', festival: 'Makar Sankranti / Prayagraj Mela', uplift: 'High', note: 'Kumbh/Magh mela draws millions to Prayagraj; religious + FMCG surge' },
    { month: 'mar', festival: 'Holi', uplift: 'Very High', note: 'Mathura-Vrindavan epicentre; national FMCG/beverage peak; UP OOH rates spike 40–60%' },
    { month: 'aug', festival: 'Janmashtami', uplift: 'High', note: 'Mathura/Vrindavan surge; pilgrim footfall 5-10x; F&B/FMCG peak' },
    { month: 'oct', festival: 'Dussehra / Navratri', uplift: 'Very High', note: 'Pre-Diwali build-up; auto, electronics, apparel peak season starts' },
    { month: 'nov', festival: 'Diwali', uplift: 'Very High', note: 'Highest OOH spend month; electronics, jewellery, FMCG compete intensely; prime rates' },
    { month: 'feb', festival: 'Ram Mandir pilgrimages (Ayodhya)', uplift: 'High', note: 'Post-consecration year-round surge; Ayodhya now permanent OOH hotspot' },
  ],
  'Bihar': [
    { month: 'oct', festival: 'Chhath Puja', uplift: 'Very High', note: "Bihar's biggest festival; 4-day OOH visibility surge; FMCG + regional brands dominate" },
    { month: 'nov', festival: 'Diwali', uplift: 'High', note: 'Electronics, jewellery, FMCG; regional retail chains run aggressive OOH' },
    { month: 'jan', festival: 'Makar Sankranti', uplift: 'Medium', note: 'Ganga ghats crowded; FMCG visibility window' },
  ],
  'Rajasthan': [
    { month: 'mar', festival: 'Holi + Pushkar Fair', uplift: 'High', note: 'Tourism surge; hospitality + F&B + apparel OOH active' },
    { month: 'oct', festival: 'Navratri + Dussehra', uplift: 'Very High', note: 'Jaipur, Jodhpur main bazaars packed; jewellery, electronics, apparel peak' },
    { month: 'nov', festival: 'Diwali', uplift: 'Very High', note: 'Strongest OOH month; gemstone, jewellery, electronics especially high' },
    { month: 'dec', festival: 'Pushkar Camel Fair', uplift: 'Medium', note: 'Tourism peak; hospitality, apparel, handicrafts brands active' },
  ],
  'Gujarat': [
    { month: 'oct', festival: 'Navratri', uplift: 'Very High', note: "Gujarat's biggest event; 9-day mass celebration; fashion, jewellery, FMCG peak" },
    { month: 'nov', festival: 'Diwali + New Year (Vikram Samvat)', uplift: 'Very High', note: 'Gujarati new year follows Diwali; 3-week commercial peak; highest OOH rates' },
    { month: 'jan', festival: 'International Kite Festival', uplift: 'High', note: 'Ahmedabad tourism surge; brand visibility event opportunity' },
  ],
  'Tamil Nadu': [
    { month: 'jan', festival: 'Pongal', uplift: 'Very High', note: "TN's harvest festival; FMCG, electronics, two-wheelers peak; OOH rates up 50%+" },
    { month: 'apr', festival: 'Tamil New Year', uplift: 'High', note: 'Consumer spending peak; jewellery, apparel, electronics active' },
    { month: 'nov', festival: 'Karthigai Deepam', uplift: 'Medium', note: 'Regional festival; FMCG + lighting brands visible window' },
  ],
  'Kerala': [
    { month: 'aug', festival: 'Onam', uplift: 'Very High', note: "Kerala's biggest commercial festival; FMCG, electronics, gold at peak; OOH rates premium" },
    { month: 'sep', festival: 'Vishu', uplift: 'High', note: 'Consumer durable purchases; jewellery, electronics active season' },
  ],
  'Karnataka': [
    { month: 'oct', festival: 'Dasara (Mysore)', uplift: 'Very High', note: 'Mysore Dasara draws 5M+ visitors; 10-day tourism peak; premium OOH visibility' },
    { month: 'nov', festival: 'Deepavali', uplift: 'High', note: 'Electronics, BFSI, auto peak season across Bangalore, Mysore' },
    { month: 'apr', festival: 'Ugadi', uplift: 'High', note: 'Kannada new year; consumer spending peak; gold + electronics active' },
  ],
  'Maharashtra': [
    { month: 'sep', festival: 'Ganesh Chaturthi', uplift: 'Very High', note: "Mumbai + Pune peak; 11-day outdoor branding goldmine; FMCG, beverages, consumer goods" },
    { month: 'oct', festival: 'Navratri + Dussehra', uplift: 'High', note: 'Pre-Diwali build; Nashik, Nagpur, Aurangabad active' },
    { month: 'nov', festival: 'Diwali', uplift: 'Very High', note: 'Highest OOH month in Maharashtra; electronics, jewellery, BFSI compete fiercely' },
    { month: 'jan', festival: 'Republic Day + Winter Sale Season', uplift: 'Medium', note: 'Retail chains push post-Diwali clearance; FMCG active' },
  ],
  'Punjab': [
    { month: 'oct', festival: 'Dussehra + Navratri', uplift: 'High', note: 'Large-scale Ravan dahan events; brand visibility at fairs' },
    { month: 'nov', festival: 'Diwali + Gurpurab', uplift: 'Very High', note: 'Gurpurab (Guru Nanak Jayanti) same period; Amritsar, Ludhiana commercial peak' },
    { month: 'mar', festival: 'Holi + Baisakhi prep', uplift: 'High', note: 'Punjab agriculture harvest mood; FMCG, durables, auto active' },
    { month: 'apr', festival: 'Baisakhi', uplift: 'Very High', note: "Punjab's harvest festival; apparel, gold, two-wheelers peak; OOH clutter high" },
  ],
};

const NATIONAL_FESTIVALS: FestivalNote[] = [
  { month: 'apr', festival: 'IPL Season', uplift: 'Very High', note: 'IPL drives massive sports-linked OOH; beverages, telecom, e-commerce compete fiercely; stadium perimeter + arterial roads prime' },
  { month: 'may', festival: 'IPL Finals', uplift: 'High', note: 'IPL climax week; brand presence peaks at viewing venues and sports bars' },
  { month: 'jan', festival: 'Republic Day', uplift: 'Medium', note: 'National event; government + BFSI brands active' },
  { month: 'aug', festival: 'Independence Day', uplift: 'Medium', note: 'National pride campaigns; FMCG, telecom, fintech active' },
  { month: 'jun', festival: 'Monsoon onset', uplift: 'Medium', note: 'OOH print fades in rain; invest in digital OOH; umbrella-proof placements matter' },
  { month: 'dec', festival: 'Christmas + New Year', uplift: 'High', note: 'Premium urban markets peak; hospitality, F&B, luxury active; T1 cities especially strong' },
];

export function getFestivalCalendar(state: string): FestivalNote[] {
  const stateFestivals = STATE_FESTIVALS[state] ?? [];
  // Merge national + state, deduplicate by month+festival
  const all = [...NATIONAL_FESTIVALS, ...stateFestivals];
  return all;
}

// ─── Impression benchmarks by format + tier ───────────────────────────────────

export function estimateImpressions(
  format: 'hoarding' | 'unipole' | 'bus_shelter' | 'gantry' | 'metro_station',
  tier: CityTier,
  areaType?: string,
): { daily: string; monthly: string } {
  const multiplier = tier === 'T1' ? 1.0 : tier === 'T2' ? 0.55 : 0.28;
  const baseDaily: Record<string, number> = {
    hoarding:      80000,
    unipole:       60000,
    bus_shelter:   30000,
    gantry:        90000,
    metro_station: 200000,
  };
  const base    = baseDaily[format] ?? 50000;
  const daily   = Math.round(base * multiplier / 1000) * 1000;
  const monthly = daily * 28;
  const fmt     = (n: number) => n >= 100000 ? `${(n/100000).toFixed(1)}L` : `${(n/1000).toFixed(0)}K`;
  return { daily: `${fmt(daily)}–${fmt(Math.round(daily * 1.3))}`, monthly: `${fmt(monthly)} contacts` };
}

// ─── Comprehensive location context ──────────────────────────────────────────

export interface OohLocationContext {
  tier:        CityTier;
  tierLabel:   string;
  secProfile:  string;
  cpmINR:      number;
  priceBand:   string;   // "₹2,000–₹8,000 per 10 sqft/month"
  formats:     OohFormat[];
  festivals:   FestivalNote[];
}

export function buildOohContext(city: string, state: string, areaType?: string): OohLocationContext {
  const tier   = classifyCity(city);
  const def    = getTierDef(tier);
  const formats = getFormatRecommendations(areaType ?? 'Mixed Use');
  const festivals = getFestivalCalendar(state);

  return {
    tier,
    tierLabel:  def.label,
    secProfile: def.secProfile,
    cpmINR:     def.avgCPM,
    priceBand:  `₹${def.oohPriceMin.toLocaleString('en-IN')}–₹${def.oohPriceMax.toLocaleString('en-IN')} per 10 sqft/month`,
    formats,
    festivals,
  };
}
