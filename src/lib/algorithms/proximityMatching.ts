// Proximity-based responder matching algorithm
// Following coding standards: explicit types, immutable patterns

import type { Responder, Emergency, AlertRadius } from '@/types';
import { calculateDistance } from '../utils/distance';

interface RankedResponder {
  responder: Responder;
  distance: number;
  score: number;
}

/**
 * Certification level weights for ranking
 */
const CERTIFICATION_WEIGHTS: Record<string, number> = {
  doctor: 1.0,
  paramedic: 0.8,
  nurse: 0.6,
  cpr_trained: 0.4,
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
  radius: AlertRadius
): Responder[] {
  return responders.filter((responder) => {
    if (responder.status !== 'available') return false;
    
    const distance = calculateDistance(
      responder.location,
      emergency.location
    );
    
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
  emergency: Emergency
): RankedResponder[] {
  const maxDistance = 600; // Maximum search radius

  const ranked = responders.map((responder) => {
    const distance = calculateDistance(
      responder.location,
      emergency.location
    );

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
 * Find best responders within radius
 * @param responders All available responders
 * @param emergency Emergency location
 * @param radius Search radius
 * @param limit Maximum number of responders to return
 * @returns Top N ranked responders
 */
export function findBestResponders(
  responders: Responder[],
  emergency: Emergency,
  radius: AlertRadius,
  limit: number = 5
): RankedResponder[] {
  const withinRadius = filterRespondersByRadius(responders, emergency, radius);
  const ranked = rankResponders(withinRadius, emergency);
  return ranked.slice(0, limit);
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
