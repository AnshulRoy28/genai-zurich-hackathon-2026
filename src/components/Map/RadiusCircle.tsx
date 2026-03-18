import { useEffect } from "react";
import maplibregl from "maplibre-gl";
import type { Location, AlertRadius } from "@/types";

interface RadiusCircleProps {
  map: maplibregl.Map | null;
  center: Location | null;
  radius: AlertRadius;
}

function RadiusCircle({ map, center, radius }: RadiusCircleProps) {
  useEffect(() => {
    if (!map || !center) return;

    const sourceId = "radius-circle";
    const layerId = "radius-circle-layer";

    // Create circle GeoJSON
    const createCircle = (
      centerLng: number,
      centerLat: number,
      radiusInMeters: number,
    ): GeoJSON.Feature<GeoJSON.Polygon> => {
      const points = 64;
      const coords: number[][] = [];
      const distanceX =
        radiusInMeters / (111320 * Math.cos((centerLat * Math.PI) / 180));
      const distanceY = radiusInMeters / 110540;

      for (let i = 0; i < points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const x = distanceX * Math.cos(theta);
        const y = distanceY * Math.sin(theta);
        coords.push([centerLng + x, centerLat + y]);
      }
      coords.push(coords[0]); // Close the circle

      return {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [coords],
        },
      };
    };

    const circleData: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [createCircle(center.lng, center.lat, radius)],
    };

    // Remove existing source and layer if they exist
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }

    // Add source
    map.addSource(sourceId, {
      type: "geojson",
      data: circleData,
    });

    // Add layer with color based on radius
    const color =
      radius === 300 ? "#3B82F6" : radius === 400 ? "#F97316" : "#EF4444";

    map.addLayer({
      id: layerId,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": color,
        "fill-opacity": 0.15,
      },
    });

    // Add border
    map.addLayer({
      id: `${layerId}-border`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": color,
        "line-width": 2,
        "line-opacity": 0.8,
      },
    });

    // Cleanup
    return () => {
      if (map.getLayer(`${layerId}-border`)) {
        map.removeLayer(`${layerId}-border`);
      }
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    };
  }, [map, center, radius]);

  return null;
}

export default RadiusCircle;
