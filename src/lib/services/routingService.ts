// Emergency routing service for first responders
// Uses OSRM for road-based routing with emergency vehicle optimizations

import type { Location } from "@/types";
import { calculateDistance } from "../utils/distance";

/**
 * Fetch route using OSRM with emergency vehicle optimizations
 * Emergency vehicles can take shortcuts when beneficial
 */
export async function fetchRoute(
  start: Location,
  end: Location,
): Promise<Location[]> {
  try {
    // Try OSRM routing first with timeout
    const route = await fetchOSRMRoute(start, end);

    // Optimize route for emergency vehicles (allow shortcuts)
    return optimizeEmergencyRoute(route, end);
  } catch {
    // Fallback to direct route if OSRM fails
    return createDirectRoute(start, end);
  }
}

/**
 * Fetch route from OSRM with timeout
 */
async function fetchOSRMRoute(
  start: Location,
  end: Location,
): Promise<Location[]> {
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("OSRM request failed");
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error("No route found");
    }

    const coordinates = data.routes[0].geometry.coordinates;

    return coordinates.map((coord: number[]) => ({
      lat: coord[1],
      lng: coord[0],
    }));
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Optimize route for emergency vehicles
 * Looks ahead and takes shortcuts when they save significant distance
 */
function optimizeEmergencyRoute(
  route: Location[],
  destination: Location,
): Location[] {
  if (route.length < 3) return route;

  const optimized: Location[] = [route[0]];
  let i = 0;

  while (i < route.length - 1) {
    const current = route[i];

    // Look ahead up to 10 waypoints
    const lookAhead = Math.min(10, route.length - i - 1);
    let bestShortcut = i + 1; // Default: next waypoint
    let bestSavings = 0;

    for (let j = 2; j <= lookAhead; j++) {
      const target = route[i + j];

      // Calculate road distance (sum of segments)
      let roadDistance = 0;
      for (let k = i; k < i + j; k++) {
        roadDistance += calculateDistance(route[k], route[k + 1]);
      }

      // Calculate direct distance (shortcut)
      const directDistance = calculateDistance(current, target);

      // Calculate savings percentage
      const savings = (roadDistance - directDistance) / roadDistance;

      // Take shortcut if it saves more than 30% distance
      if (savings > 0.3 && savings > bestSavings) {
        bestSavings = savings;
        bestShortcut = i + j;
      }
    }

    // Add the best target (either next waypoint or shortcut)
    if (bestShortcut > i + 1) {
      // Taking a shortcut - add intermediate points for smooth animation
      const target = route[bestShortcut];
      const steps = 5;

      for (let s = 1; s <= steps; s++) {
        const progress = s / steps;
        optimized.push({
          lat: current.lat + (target.lat - current.lat) * progress,
          lng: current.lng + (target.lng - current.lng) * progress,
        });
      }

      i = bestShortcut;
    } else {
      // Following road
      optimized.push(route[i + 1]);
      i++;
    }
  }

  // Ensure destination is the final point
  const lastPoint = optimized[optimized.length - 1];
  if (lastPoint.lat !== destination.lat || lastPoint.lng !== destination.lng) {
    optimized.push(destination);
  }

  return optimized;
}

/**
 * Create direct route as fallback
 */
function createDirectRoute(start: Location, end: Location): Location[] {
  const route: Location[] = [];
  const steps = 20;

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    route.push({
      lat: start.lat + (end.lat - start.lat) * progress,
      lng: start.lng + (end.lng - start.lng) * progress,
    });
  }

  return route;
}

/**
 * Get location at specific progress along route
 */
export function getLocationAtProgress(
  route: Location[],
  progress: number,
): Location {
  if (route.length === 0) {
    throw new Error("Route is empty");
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
