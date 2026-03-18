// Route line visualization for responder paths
// Shows blue lines like Uber to indicate the route being taken

import { useEffect, useRef } from "react";
import type maplibregl from "maplibre-gl";
import type { Location } from "@/types";

interface RouteData {
  responderId: string;
  route: Location[];
  progress: number;
}

interface RouteLinesProps {
  map: maplibregl.Map | null;
  routes: RouteData[];
}

export default function RouteLines({ map, routes }: RouteLinesProps) {
  const sourcesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!map) return;

    // Clean up old sources and layers
    sourcesRef.current.forEach((sourceId) => {
      const layerId = `route-line-${sourceId}`;
      const progressLayerId = `route-progress-${sourceId}`;

      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getLayer(progressLayerId)) {
        map.removeLayer(progressLayerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    });
    sourcesRef.current.clear();

    // Add route lines for each responder
    routes.forEach(({ responderId, route, progress }) => {
      const sourceId = `route-${responderId}`;
      sourcesRef.current.add(sourceId);

      // Convert route to GeoJSON LineString
      const coordinates = route.map((loc) => [loc.lng, loc.lat]);

      // Full route (gray/light blue)
      const fullRouteGeoJSON = {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates,
        },
      };

      // Traveled portion (bright blue)
      const traveledIndex = Math.floor(progress * (route.length - 1));
      const traveledCoordinates = coordinates.slice(
        0,
        Math.max(traveledIndex + 1, 2),
      );

      const traveledRouteGeoJSON = {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: traveledCoordinates,
        },
      };

      // Add source for full route
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: fullRouteGeoJSON,
        });
      } else {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(
          fullRouteGeoJSON,
        );
      }

      // Add source for traveled portion
      const progressSourceId = `${sourceId}-progress`;
      if (!map.getSource(progressSourceId)) {
        map.addSource(progressSourceId, {
          type: "geojson",
          data: traveledRouteGeoJSON,
        });
      } else {
        (map.getSource(progressSourceId) as maplibregl.GeoJSONSource).setData(
          traveledRouteGeoJSON,
        );
      }

      // Add layer for full route (light gray/blue)
      const layerId = `route-line-${sourceId}`;
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#94a3b8", // Light gray-blue
            "line-width": 4,
            "line-opacity": 0.6,
          },
        });
      }

      // Add layer for traveled portion (bright blue)
      const progressLayerId = `route-progress-${sourceId}`;
      if (!map.getLayer(progressLayerId)) {
        map.addLayer({
          id: progressLayerId,
          type: "line",
          source: progressSourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b82f6", // Bright blue (Uber-style)
            "line-width": 5,
            "line-opacity": 1,
          },
        });
      }
    });

    // Cleanup function
    return () => {
      sourcesRef.current.forEach((sourceId) => {
        const layerId = `route-line-${sourceId}`;
        const progressLayerId = `route-progress-${sourceId}`;
        const progressSourceId = `${sourceId}-progress`;

        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
        if (map.getLayer(progressLayerId)) {
          map.removeLayer(progressLayerId);
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
        if (map.getSource(progressSourceId)) {
          map.removeSource(progressSourceId);
        }
      });
      sourcesRef.current.clear();
    };
  }, [map, routes]);

  return null;
}
