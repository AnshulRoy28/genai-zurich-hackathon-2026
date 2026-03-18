// Proximity-based responder matching algorithm with route optimization
// Following coding standards: explicit types, immutable patterns

import type { Responder, Emergency, AlertRadius, Location } from "@/types";
import { calculateDistance } from "../utils/distance";
import { fetchRoute } from "../services/routingService";

interface RankedResponder {
  responder: Responder;
  distance: number;
  score: number;
}

export interface ResponderWithRoute {
  responder: Responder;
  route: Location[];
  routeDistance: number;
}

/**
 * Certification level weights for ranking
 */
const CERTIFICATION_WEIGHTS: Record<string, number> = {
  doctor: 1.0,
  paramedic: 0.8,
  nurse: 0.6,
  cpr_trained: 0.4,
  first_responder: 0.4,
};

/**
 * Filter responders within a given radius of the emergency
 * @param responders All available responders
 * @param emergency Emergency location
 * @param radius Search radius in meters
 * @returns Responders within radius
 */
export function filterRespondersByRadius(
  responders: Responder[],
  emergency: Emergency,
  radius: AlertRadius,
): Responder[] {
  return responders.filter((responder) => {
    if (responder.status !== "available") return false;

    const distance = calculateDistance(responder.location, emergency.location);

    return distance <= radius;
  });
}

/**
 * Rank responders by distance and certification level
 * @param responders Responders to rank
 * @param emergency Emergency location
 * @returns Ranked responders with scores
 */
export function rankResponders(
  responders: Responder[],
  emergency: Emergency,
): RankedResponder[] {
  const maxDistance = 600; // Maximum search radius

  const ranked = responders.map((responder) => {
    const distance = calculateDistance(responder.location, emergency.location);

    // Normalize distance (0 = far, 1 = close)
    const normalizedDistance = 1 - Math.min(distance / maxDistance, 1);

    // Get certification weight
    const certWeight = CERTIFICATION_WEIGHTS[responder.certification] || 0.4;

    // Calculate composite score (60% distance, 40% certification)
    const score = normalizedDistance * 0.6 + certWeight * 0.4;

    return {
      responder,
      distance,
      score,
    };
  });

  // Sort by score (highest first)
  return ranked.sort((a, b) => b.score - a.score);
}

/**
 * Find best responders within radius based on actual route distance
 * Computes routes for all responders in range and selects the 2 with shortest routes
 * @param responders All available responders
 * @param emergency Emergency location
 * @param radius Search radius
 * @param limit Maximum number of responders to return
 * @returns Top N responders with their computed routes
 */
export async function findBestRespondersWithRoutes(
  responders: Responder[],
  emergency: Emergency,
  radius: AlertRadius,
  limit: number = 2,
): Promise<ResponderWithRoute[]> {
  // Filter responders within radius
  const withinRadius = filterRespondersByRadius(responders, emergency, radius);

  if (withinRadius.length === 0) {
    return [];
  }

  // Compute routes for all responders in range
  const respondersWithRoutes = await Promise.all(
    withinRadius.map(async (responder) => {
      try {
        const route = await fetchRoute(responder.location, emergency.location);
        const routeDistance = calculateRouteDistance(route);

        return {
          responder,
          route,
          routeDistance,
        };
      } catch {
        // Fallback to straight-line distance if routing fails
        const straightLineDistance = calculateDistance(
          responder.location,
          emergency.location,
        );

        return {
          responder,
          route: [responder.location, emergency.location],
          routeDistance: straightLineDistance,
        };
      }
    }),
  );

  // Sort by actual route distance (shortest first)
  const sorted = respondersWithRoutes.sort(
    (a, b) => a.routeDistance - b.routeDistance,
  );

  // Return top N responders
  return sorted.slice(0, limit);
}

/**
 * Calculate total route distance
 */
function calculateRouteDistance(route: Location[]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += calculateDistance(route[i], route[i + 1]);
  }
  return total;
}

/**
 * Get next escalation radius
 * @param currentRadius Current search radius
 * @returns Next radius or null if at maximum
 */
export function getNextRadius(currentRadius: AlertRadius): AlertRadius | null {
  switch (currentRadius) {
    case 300:
      return 400;
    case 400:
      return 600;
    case 600:
      return null;
    default:
      return null;
  }
}
