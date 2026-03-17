// Routing service using OSRM (Open Source Routing Machine)
// Completely free, no API key required

import type { Location } from '@/types';

interface OSRMRoute {
  routes: Array<{
    geometry: {
      coordinates: Array<[number, number]>;
    };
    distance: number;
    duration: number;
  }>;
}

/**
 * Fetch route between two locations using OSRM
 * Returns array of coordinates along the route
 */
export async function fetchRoute(
  start: Location,
  end: Location
): Promise<Location[]> {
  try {
    // OSRM public demo server (free, no API key)
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }

    const data: OSRMRoute = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found in response');
    }

    // Convert coordinates to Location format
    const coordinates = data.routes[0].geometry.coordinates;
    return coordinates.map(([lng, lat]: [number, number]) => ({ lat, lng }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch route: ${error.message}`);
    }
    throw new Error('Failed to fetch route');
  }
}

/**
 * Get location at specific progress along route
 */
export function getLocationAtProgress(
  route: Location[],
  progress: number
): Location {
  if (route.length === 0) {
    throw new Error('Route is empty');
  }

  if (progress <= 0) return route[0];
  if (progress >= 1) return route[route.length - 1];

  const totalSegments = route.length - 1;
  const targetIndex = progress * totalSegments;
  const segmentIndex = Math.floor(targetIndex);
  const segmentProgress = targetIndex - segmentIndex;

  if (segmentIndex >= route.length - 1) {
    return route[route.length - 1];
  }

  const start = route[segmentIndex];
  const end = route[segmentIndex + 1];

  return {
    lat: start.lat + (end.lat - start.lat) * segmentProgress,
    lng: start.lng + (end.lng - start.lng) * segmentProgress,
  };
}
