import type {
  LocationAnalysis,
  DemographicsData,
  POIData,
  TransportData,
  CompetitorData,
  CatchmentData,
  TrafficData,
  LocationScores,
  SiteFormat
} from './types';
import { findNearestCity, calculateDistance, INDIAN_CITIES } from './data/census';

function generateId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export class IntelligenceEngine {
  async analyzeLocation(lat: number, lng: number, radius: number = 2): Promise<LocationAnalysis> {
    const nearestCity = findNearestCity(lat, lng);
    const cityData = nearestCity || INDIAN_CITIES[0];

    const demographics = this.estimateDemographics(lat, lng, cityData);
    const poi = await this.fetchPOIs(lat, lng, radius);
    const transport = await this.fetchTransport(lat, lng);
    const competitors = await this.fetchCompetitors(lat, lng, radius);
    const catchment = this.calculateCatchment(demographics, poi);
    const traffic = this.estimateTraffic(lat, lng, poi);
    const scores = this.calculateScores(demographics, traffic, competitors, poi);
    const recommendation = this.generateRecommendation(scores, demographics, poi);

    return {
      id: generateId(),
      lat,
      lng,
      address: await this.reverseGeocode(lat, lng),
      pincode: '226001',
      city: cityData.name,
      state: cityData.state,
      radius,
      demographics,
      poi,
      transport,
      competitors,
      catchment,
      traffic,
      scores,
      recommendation,
      generatedAt: new Date().toISOString()
    };
  }

  private estimateDemographics(lat: number, lng: number, cityData: { population: number; name: string }): DemographicsData {
    const populationDensity = cityData.population / 500;
    const estimatedPopulation = Math.round(populationDensity * 10);

    return {
      population: estimatedPopulation,
      households: Math.round(estimatedPopulation / 4.5),
      avgHouseholdSize: 4.5,
      sexRatio: 940,
      literacyRate: 78,
      workingPopulation: Math.round(estimatedPopulation * 0.35),
      ageDistribution: {
        '0-14': 25,
        '15-29': 28,
        '30-44': 22,
        '45-59': 15,
        '60+': 10
      },
      incomeLevel: 'middle'
    };
  }

  private async fetchPOIs(lat: number, lng: number, radius: number): Promise<POIData[]> {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"](around:${radius * 1000},${lat},${lng});
        node["shop"](around:${radius * 1000},${lat},${lng});
        node["tourism"](around:${radius * 1000},${lat},${lng});
      );
      out body 100;
    `;

    try {
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`
      });

      const data = await response.json();
      const pois: POIData[] = [];

      for (const element of (data.elements || []).slice(0, 50)) {
        const poiLat = element.lat || lat;
        const poiLng = element.lon || lng;
        const distance = calculateDistance(lat, lng, poiLat, poiLng);

        const tags = element.tags || {};
        const category = tags.amenity || tags.shop || tags.tourism || 'other';
        const name = tags.name || `${category} ${element.id}`;

        pois.push({
          category,
          name,
          distance: Math.round(distance * 100) / 100,
          type: tags.amenity ? 'amenity' : tags.shop ? 'shop' : 'tourism'
        });
      }

      return pois.sort((a, b) => a.distance - b.distance).slice(0, 20);
    } catch {
      return this.getFallbackPOIs(lat, lng);
    }
  }

  private getFallbackPOIs(lat: number, lng: number): POIData[] {
    return [
      { category: 'school', name: 'Primary School', distance: 0.3, type: 'amenity' },
      { category: 'hospital', name: 'Medical Centre', distance: 0.5, type: 'amenity' },
      { category: 'supermarket', name: 'Grocery Store', distance: 0.2, type: 'shop' },
      { category: 'restaurant', name: 'Restaurant', distance: 0.15, type: 'amenity' },
      { category: 'bank', name: 'Bank ATM', distance: 0.4, type: 'amenity' },
      { category: 'fuel', name: 'Petrol Pump', distance: 0.6, type: 'amenity' },
      { category: 'pharmacy', name: 'Medical Store', distance: 0.25, type: 'amenity' },
      { category: 'convenience', name: 'General Store', distance: 0.1, type: 'shop' }
    ];
  }

  private async fetchTransport(lat: number, lng: number): Promise<TransportData> {
    const nearestCity = findNearestCity(lat, lng);

    return {
      nearestAirport: nearestCity?.name === 'Lucknow' ? { name: 'Chaudhary Charan Singh International Airport', distance: 15 } : { name: 'Nearest Airport', distance: 50 },
      nearestRailway: { name: 'Nearest Railway Station', distance: 2 },
      busStops: 8,
      highways: ['NH-27', 'SH-1']
    };
  }

  private async fetchCompetitors(lat: number, lng: number, radius: number): Promise<CompetitorData[]> {
    return [
      { name: 'Competitor A', format: 'HRD', distance: 0.8, operator: 'Unknown' },
      { name: 'Competitor B', format: 'UNI', distance: 1.2, operator: 'Unknown' }
    ];
  }

  private calculateCatchment(demographics: DemographicsData, pois: POIData[]): CatchmentData {
    const commercialCount = pois.filter(p => p.category === 'supermarket' || p.category === 'mall').length;
    const floatingMultiplier = 1 + (commercialCount * 0.1);

    return {
      residentialPopulation: demographics.population,
      workingPopulation: demographics.workingPopulation,
      floatingPopulation: Math.round(demographics.population * 0.2 * floatingMultiplier),
      vehicleOwnership: 45,
      primaryAudience: 'Working professionals, 25-45 years',
      secondaryAudience: 'Business owners, daily commuters'
    };
  }

  private estimateTraffic(lat: number, lng: number, pois: POIData[]): TrafficData {
    const commercialPOIs = pois.filter(p =>
      p.category === 'supermarket' || p.category === 'mall' ||
      p.category === 'bank' || p.category.includes('market')
    ).length;

    const baseTraffic = 15000;
    const trafficMultiplier = 1 + (commercialPOIs * 0.15);

    return {
      avgDailyVehicles: Math.round(baseTraffic * trafficMultiplier),
      peakHours: ['09:00-11:00', '17:00-20:00'],
      vehicleSplit: {
        two_wheeler: 55,
        car: 25,
        commercial: 12,
        three_wheeler: 8
      },
      roadType: 'Arterial Road'
    };
  }

  private calculateScores(
    demographics: DemographicsData,
    traffic: TrafficData,
    competitors: CompetitorData[],
    pois: POIData[]
  ): LocationScores {
    const visibilityScore = Math.min(100, 60 + (pois.length * 2));
    const trafficScore = Math.min(100, Math.round(traffic.avgDailyVehicles / 500));
    const affluenceScore = demographics.incomeLevel === 'high' ? 90 :
                          demographics.incomeLevel === 'upper-middle' ? 75 :
                          demographics.incomeLevel === 'middle' ? 60 : 45;
    const competitionScore = Math.max(10, 100 - (competitors.length * 15));
    const overall = Math.round((visibilityScore + trafficScore + affluenceScore + competitionScore) / 4);

    return {
      visibility: visibilityScore,
      traffic: trafficScore,
      affluence: affluenceScore,
      competition: competitionScore,
      overall
    };
  }

  private generateRecommendation(
    scores: LocationScores,
    demographics: DemographicsData,
    pois: POIData[]
  ): string {
    const parts: string[] = [];

    if (scores.overall >= 75) {
      parts.push('Excellent location for outdoor advertising.');
    } else if (scores.overall >= 50) {
      parts.push('Good location with moderate potential.');
    } else {
      parts.push('Below average location. Consider alternatives.');
    }

    if (scores.traffic >= 70) {
      parts.push('High traffic ensures good visibility.');
    }

    if (scores.competition < 50) {
      parts.push('High competition may affect visibility share.');
    }

    if (demographics.population > 50000) {
      parts.push('Good catchment population.');
    }

    return parts.join(' ');
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'User-Agent': 'Atlas-OOH/1.0' } }
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  estimateSiteRevenue(scores: LocationScores, format: SiteFormat): number {
    const baseRates: Record<SiteFormat, number> = {
      HRD: 50000,
      UNI: 35000,
      GAN: 75000,
      SHL: 15000,
      BJB: 20000,
      DFS: 25000
    };

    const base = baseRates[format] || 40000;
    const multiplier = scores.overall / 75;
    return Math.round(base * multiplier);
  }

  estimateOccupancy(scores: LocationScores): number {
    if (scores.overall >= 75) return 85;
    if (scores.overall >= 60) return 70;
    if (scores.overall >= 45) return 55;
    return 40;
  }
}

export const intelligenceEngine = new IntelligenceEngine();
