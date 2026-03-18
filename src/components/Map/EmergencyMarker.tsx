import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Emergency } from "@/types";

interface EmergencyMarkerProps {
  map: maplibregl.Map | null;
  emergency: Emergency | null;
}

function EmergencyMarker({ map, emergency }: EmergencyMarkerProps) {
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!map) return;

    // Add CSS animation if not already added
    if (!styleRef.current) {
      const style = document.createElement("style");
      style.textContent = `
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
          100% {
            transform: scale(0.8);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
      styleRef.current = style;
    }

    if (emergency) {
      if (!markerRef.current) {
        // Create pulsing emergency marker
        const el = document.createElement("div");
        el.className = "emergency-marker";
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.position = "relative";

        // Inner circle
        const inner = document.createElement("div");
        inner.style.width = "20px";
        inner.style.height = "20px";
        inner.style.borderRadius = "50%";
        inner.style.backgroundColor = "#EF4444";
        inner.style.position = "absolute";
        inner.style.top = "50%";
        inner.style.left = "50%";
        inner.style.transform = "translate(-50%, -50%)";
        inner.style.boxShadow = "0 0 10px rgba(239, 68, 68, 0.8)";

        // Pulsing outer circle
        const outer = document.createElement("div");
        outer.style.width = "40px";
        outer.style.height = "40px";
        outer.style.borderRadius = "50%";
        outer.style.border = "3px solid #EF4444";
        outer.style.position = "absolute";
        outer.style.top = "0";
        outer.style.left = "0";
        outer.style.animation = "pulse 2s infinite";

        el.appendChild(outer);
        el.appendChild(inner);

        markerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([emergency.location.lng, emergency.location.lat])
          .addTo(map);
      } else {
        // Update existing marker position
        markerRef.current.setLngLat([
          emergency.location.lng,
          emergency.location.lat,
        ]);
      }
    } else {
      // Remove marker if no emergency
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, [map, emergency]);

  return null;
}

export default EmergencyMarker;
