import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Responder } from "@/types";

interface ResponderMarkersProps {
  map: maplibregl.Map | null;
  responders: Responder[];
}

// All responders are blue (first responders)
const RESPONDER_COLOR = "#3B82F6";

function ResponderMarkers({ map, responders }: ResponderMarkersProps) {
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  useEffect(() => {
    if (!map) return;

    const currentMarkers = markersRef.current;
    const currentResponderIds = new Set(responders.map((r) => r.id));

    // Remove markers for responders that no longer exist
    currentMarkers.forEach((marker, id) => {
      if (!currentResponderIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    // Add or update markers for each responder
    responders.forEach((responder) => {
      let marker = currentMarkers.get(responder.id);

      if (!marker) {
        // Create new marker
        const el = document.createElement("div");
        el.className = "responder-marker";
        el.style.width = "24px";
        el.style.height = "24px";
        el.style.borderRadius = "50%";
        el.style.border = "3px solid white";
        el.style.backgroundColor = RESPONDER_COLOR;
        el.style.cursor = "pointer";
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
        el.style.transition = "opacity 0.3s ease";

        marker = new maplibregl.Marker({ element: el })
          .setLngLat([responder.location.lng, responder.location.lat])
          .addTo(map);

        currentMarkers.set(responder.id, marker);
      } else {
        // Update existing marker position
        marker.setLngLat([responder.location.lng, responder.location.lat]);
      }

      // Update marker appearance based on status
      const el = marker.getElement();
      el.style.opacity = responder.status === "available" ? "1" : "0.5";
      el.title = `${responder.name} - First Responder (${responder.status})`;
    });

    // Cleanup on unmount
    return () => {
      currentMarkers.forEach((marker) => marker.remove());
      currentMarkers.clear();
    };
  }, [map, responders]);

  return null;
}

export default ResponderMarkers;
