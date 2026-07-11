import type { CityData } from '../types';

export const INDIAN_CITIES: CityData[] = [
  { name: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', population: 2815000, lat: 26.8467, lng: 80.9462, pincodes: ['226001', '226002', '226003'] },
  { name: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', population: 2876000, lat: 26.4499, lng: 80.3319, pincodes: ['208001', '208002', '208003'] },
  { name: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', population: 1435000, lat: 25.3176, lng: 82.9739, pincodes: ['221001', '221002'] },
  { name: 'Agra', state: 'Uttar Pradesh', district: 'Agra', population: 1575000, lat: 27.1767, lng: 78.0081, pincodes: ['282001', '282002'] },
  { name: 'Allahabad', state: 'Uttar Pradesh', district: 'Prayagraj', population: 1178000, lat: 25.4358, lng: 81.8463, pincodes: ['211001', '211002'] },
  { name: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar', population: 642000, lat: 28.5355, lng: 77.3910, pincodes: ['201301', '201302'] },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', district: 'Ghaziabad', population: 1648000, lat: 28.6692, lng: 77.4538, pincodes: ['201001', '201002'] },
  { name: 'Meerut', state: 'Uttar Pradesh', district: 'Meerut', population: 1305000, lat: 28.9845, lng: 77.7064, pincodes: ['250001', '250002'] },
  { name: 'Patna', state: 'Bihar', district: 'Patna', population: 1684000, lat: 25.5941, lng: 85.1376, pincodes: ['800001', '800002'] },
  { name: 'Gaya', state: 'Bihar', district: 'Gaya', population: 468000, lat: 24.7914, lng: 85.0002, pincodes: ['823001'] },
  { name: 'Bhagalpur', state: 'Bihar', district: 'Bhagalpur', population: 460000, lat: 25.2440, lng: 86.9696, pincodes: ['812001'] },
  { name: 'Muzaffarpur', state: 'Bihar', district: 'Muzaffarpur', population: 357000, lat: 26.1203, lng: 85.3647, pincodes: ['842001'] },
  { name: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', population: 3073000, lat: 26.9124, lng: 75.7873, pincodes: ['302001', '302002'] },
  { name: 'Jodhpur', state: 'Rajasthan', district: 'Jodhpur', population: 1059000, lat: 26.2389, lng: 73.0243, pincodes: ['342001'] },
  { name: 'Udaipur', state: 'Rajasthan', district: 'Udaipur', population: 451000, lat: 24.5854, lng: 73.7125, pincodes: ['313001'] },
  { name: 'Kota', state: 'Rajasthan', district: 'Kota', population: 1001000, lat: 25.2138, lng: 75.8648, pincodes: ['324001'] },
  { name: 'Mumbai', state: 'Maharashtra', district: 'Mumbai', population: 12442000, lat: 19.0760, lng: 72.8777, pincodes: ['400001', '400002'] },
  { name: 'Pune', state: 'Maharashtra', district: 'Pune', population: 3125000, lat: 18.5204, lng: 73.8567, pincodes: ['411001', '411002'] },
  { name: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', population: 2406000, lat: 21.1458, lng: 79.0882, pincodes: ['440001'] },
  { name: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', population: 5577000, lat: 23.0225, lng: 72.5714, pincodes: ['380001', '380002'] },
  { name: 'Surat', state: 'Gujarat', district: 'Surat', population: 4467000, lat: 21.1702, lng: 72.8311, pincodes: ['394101'] },
  { name: 'Vadodara', state: 'Gujarat', district: 'Vadodara', population: 1799000, lat: 22.3072, lng: 73.1812, pincodes: ['390001'] },
  { name: 'Rajkot', state: 'Gujarat', district: 'Rajkot', population: 1287000, lat: 22.3039, lng: 70.8022, pincodes: ['360001'] },
  { name: 'Delhi', state: 'Delhi', district: 'New Delhi', population: 11034000, lat: 28.6139, lng: 77.2090, pincodes: ['110001', '110002'] },
  { name: 'Bangalore', state: 'Karnataka', district: 'Bangalore Urban', population: 8443000, lat: 12.9716, lng: 77.5946, pincodes: ['560001', '560002'] },
  { name: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', population: 6809000, lat: 17.3850, lng: 78.4867, pincodes: ['500001', '500002'] },
  { name: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', population: 4681000, lat: 13.0827, lng: 80.2707, pincodes: ['600001', '600002'] },
  { name: 'Kolkata', state: 'West Bengal', district: 'Kolkata', population: 4497000, lat: 22.5726, lng: 88.3639, pincodes: ['700001', '700002'] },
  { name: 'Indore', state: 'Madhya Pradesh', district: 'Indore', population: 1964000, lat: 22.7196, lng: 75.8577, pincodes: ['452001'] },
  { name: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', population: 1796000, lat: 23.2599, lng: 77.4126, pincodes: ['462001'] },
  { name: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh', population: 964000, lat: 30.7333, lng: 76.7794, pincodes: ['160001'] }
];

export function findNearestCity(lat: number, lng: number): CityData | null {
  let nearest: CityData | null = null;
  let minDist = Infinity;

  for (const city of INDIAN_CITIES) {
    const dist = Math.sqrt(
      Math.pow(city.lat - lat, 2) + Math.pow(city.lng - lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }

  return minDist < 2 ? nearest : null;
}

export function getCityByPincode(pincode: string): CityData | null {
  for (const city of INDIAN_CITIES) {
    if (city.pincodes.includes(pincode)) {
      return city;
    }
  }
  return null;
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
