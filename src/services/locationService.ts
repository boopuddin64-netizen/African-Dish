import { SavedLocation } from '../types';

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Port Harcourt': { lat: 4.8156, lng: 7.0498 },
  'London': { lat: 51.5074, lng: -0.1278 },
  'Manchester': { lat: 53.4808, lng: -2.2426 },
  'Birmingham': { lat: 52.4862, lng: -1.8904 }
};

/**
 * Calculates real Haversine distance in kilometers between two lat/lng points.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place e.g. 2.4
}

/**
 * Calculates distance between a user location and a restaurant.
 */
export function getDistanceToRestaurant(
  userLocation: SavedLocation,
  restaurantCoordinates?: { lat: number; lng: number },
  restaurantCity?: string
): number {
  const userCoords = userLocation.coordinates || CITY_COORDINATES[userLocation.city] || CITY_COORDINATES['Port Harcourt'];
  const restCoords = restaurantCoordinates || (restaurantCity ? CITY_COORDINATES[restaurantCity] : CITY_COORDINATES['Port Harcourt']);

  return calculateHaversineDistanceKm(
    userCoords.lat,
    userCoords.lng,
    restCoords.lat,
    restCoords.lng
  );
}

export const MAX_SAVED_LOCATIONS = 10;

export function validateSavedLocationCount(currentCount: number): boolean {
  return currentCount < MAX_SAVED_LOCATIONS;
}
