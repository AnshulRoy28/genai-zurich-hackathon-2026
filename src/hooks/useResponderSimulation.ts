// Hook for simulating responder movement toward emergency along real streets
// Following coding standards: explicit types, immutable updates

import { useEffect, useRef, useState } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { findBestResponders } from '@/lib/algorithms/proximityMatching';
import { fetchRoute, getLocationAtProgress } from '@/lib/services/routingService';
import { generateAudioBriefing, playAudioBriefing } from '@/lib/services/ttsService';
import { calculateDistance } from '@/lib/utils/distance';
import type { Location } from '@/types';

interface ResponderRoute {
  responderId: string;
  route: Location[];
  totalDistance: number;
}

/**
 * Create straight-line route as fallback
 */
function createStraightLineRoute(start: Location, end: Location): Location[] {
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
 * Hook to simulate 2 responders moving toward emergency at uniform speed
 */
export function useResponderSimulation() {
  const {
    currentEmergency,
    allResponders,
    currentRadius,
    assignResponder,
  } = useSimulationStore();

  const [routes, setRoutes] = useState<ResponderRoute[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const assignedResponderIdsRef = useRef<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch routes for nearest responders (1 or 2)
  useEffect(() => {
    if (!currentEmergency) {
      // Reset when no emergency
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      startTimeRef.current = null;
      assignedResponderIdsRef.current = [];
      setRoutes([]);
      
      // Stop audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      return;
    }

    // Find best responders within current radius (try to get 2)
    const bestResponders = findBestResponders(
      allResponders,
      currentEmergency,
      currentRadius,
      2
    );

    // If NO responders found, escalate radius
    if (bestResponders.length === 0) {
      const { escalateRadius } = useSimulationStore.getState();
      
      // Escalate after a short delay
      setTimeout(() => {
        escalateRadius();
      }, 1000);
      
      return;
    }

    // If we have 1 or 2 responders, send them (don't wait for 2)
    // Only start animation if we haven't assigned responders yet
    if (assignedResponderIdsRef.current.length === 0) {
      const responderIds = bestResponders.map(r => r.responder.id);
      assignedResponderIdsRef.current = responderIds;
      
      // Assign all found responders (1 or 2)
      responderIds.forEach(id => assignResponder(id));

      // Generate and play audio briefing
      generateAudioBriefing(currentEmergency.patient)
        .then(audioUrl => {
          audioRef.current = playAudioBriefing(audioUrl);
        })
        .catch((error: unknown) => {
          if (error instanceof Error) {
            alert(`TTS Briefing failed: ${error.message}\n\nContinuing simulation without audio.`);
          }
        });

      // Fetch routes for all found responders
      Promise.all(
        bestResponders.map(async ({ responder }) => {
          try {
            const route = await fetchRoute(responder.location, currentEmergency.location);
            return {
              responderId: responder.id,
              route,
              totalDistance: calculateRouteDistance(route),
            };
          } catch {
            // Fallback to straight line
            const route = createStraightLineRoute(responder.location, currentEmergency.location);
            return {
              responderId: responder.id,
              route,
              totalDistance: calculateDistance(responder.location, currentEmergency.location),
            };
          }
        })
      ).then(fetchedRoutes => {
        setRoutes(fetchedRoutes);
      }).catch(() => {
        // Ignore errors
      });
    }
  }, [currentEmergency, allResponders, currentRadius, assignResponder]);

  // Animate all responders at uniform speed (50 km/h = ~13.9 m/s)
  useEffect(() => {
    if (routes.length === 0 || !currentEmergency) {
      return;
    }

    const SPEED_MS = 13.9; // meters per second (50 km/h)

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = (timestamp - startTimeRef.current) / 1000; // seconds
      const distanceTraveled = elapsed * SPEED_MS; // meters

      let allComplete = true;

      routes.forEach(({ responderId, route, totalDistance }) => {
        const progress = Math.min(distanceTraveled / totalDistance, 1);

        if (progress < 1) {
          allComplete = false;
        }

        const newLocation = getLocationAtProgress(route, progress);

        // Update store with new location
        useSimulationStore.setState((state) => ({
          allResponders: state.allResponders.map((r) =>
            r.id === responderId
              ? { ...r, location: newLocation }
              : r
          ),
        }));
      });

      if (!allComplete) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [routes, currentEmergency]);
}

