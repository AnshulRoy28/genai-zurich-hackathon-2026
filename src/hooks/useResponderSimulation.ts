// Hook for simulating responder movement toward emergency along real streets
// Following coding standards: explicit types, immutable updates

import { useEffect, useRef, useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { findBestRespondersWithRoutes } from "@/lib/algorithms/proximityMatching";
import { getLocationAtProgress } from "@/lib/services/routingService";
import {
  generateAudioBriefing,
  playAudioBriefing,
} from "@/lib/services/ttsService";
import { calculateDistance } from "@/lib/utils/distance";
import type { Location } from "@/types";

interface ResponderRoute {
  responderId: string;
  route: Location[];
  totalDistance: number;
}

export interface RouteWithProgress {
  responderId: string;
  route: Location[];
  progress: number;
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
 * Returns route data with progress for visualization
 */
export function useResponderSimulation(): RouteWithProgress[] {
  const { currentEmergency, allResponders, currentRadius, assignResponder } =
    useSimulationStore();

  const [routes, setRoutes] = useState<ResponderRoute[]>([]);
  const [progress, setProgress] = useState<Map<string, number>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const assignedResponderIdsRef = useRef<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentEmergencyIdRef = useRef<string | null>(null);

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
      currentEmergencyIdRef.current = null;
      setRoutes([]);
      setProgress(new Map());

      // Stop audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      return;
    }

    // If this is a new emergency, reset everything
    if (currentEmergencyIdRef.current !== currentEmergency.id) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      startTimeRef.current = null;
      assignedResponderIdsRef.current = [];
      currentEmergencyIdRef.current = currentEmergency.id;
      setRoutes([]);
      setProgress(new Map());

      // Stop previous audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }

    // Find best responders within current radius based on actual route distance
    // This computes routes for all responders in range and selects the 2 with shortest routes
    const emergencyId = currentEmergency.id;

    findBestRespondersWithRoutes(
      allResponders,
      currentEmergency,
      currentRadius,
      2,
    )
      .then((bestResponders) => {
        // Check if this emergency is still active (not reset)
        if (currentEmergencyIdRef.current !== emergencyId) {
          return; // Ignore results from old emergency
        }

        // If NO responders found, escalate radius
        if (bestResponders.length === 0) {
          const { escalateRadius } = useSimulationStore.getState();

          // Escalate after a short delay
          setTimeout(() => {
            // Check again if emergency is still active
            if (currentEmergencyIdRef.current === emergencyId) {
              escalateRadius();
            }
          }, 1000);

          return;
        }

        // If we have 1 or 2 responders, send them (don't wait for 2)
        // Only start animation if we haven't assigned responders yet
        if (assignedResponderIdsRef.current.length === 0) {
          const responderIds = bestResponders.map((r) => r.responder.id);
          assignedResponderIdsRef.current = responderIds;

          // Assign all found responders (1 or 2)
          responderIds.forEach((id) => assignResponder(id));

          // Generate and play audio briefing
          generateAudioBriefing(currentEmergency.patient)
            .then((audioUrl) => {
              // Check if emergency is still active before playing
              if (currentEmergencyIdRef.current === emergencyId) {
                audioRef.current = playAudioBriefing(audioUrl);
              }
            })
            .catch((error: unknown) => {
              if (error instanceof Error) {
                alert(
                  `TTS Briefing failed: ${error.message}\n\nContinuing simulation without audio.`,
                );
              }
            });

          // Use the pre-computed routes
          const routesData = bestResponders.map(({ responder, route }) => ({
            responderId: responder.id,
            route,
            totalDistance: calculateRouteDistance(route),
          }));

          setRoutes(routesData);
        }
      })
      .catch(() => {
        // Ignore errors
      });
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
        const progressValue = Math.min(distanceTraveled / totalDistance, 1);

        if (progressValue < 1) {
          allComplete = false;
        }

        const newLocation = getLocationAtProgress(route, progressValue);

        // Update progress map
        setProgress((prev) => new Map(prev).set(responderId, progressValue));

        // Update store with new location
        useSimulationStore.setState((state) => ({
          allResponders: state.allResponders.map((r) =>
            r.id === responderId ? { ...r, location: newLocation } : r,
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

  // Return routes with current progress for visualization
  return routes.map(({ responderId, route }) => ({
    responderId,
    route,
    progress: progress.get(responderId) || 0,
  }));
}
