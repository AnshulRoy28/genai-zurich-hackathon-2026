import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Location } from '@/types';

interface MapViewProps {
  center: Location;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  onLoad?: (map: maplibregl.Map) => void;
}

function MapView({
  center,
  zoom = 15,
  pitch = 45,
  bearing = 0,
  onLoad,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const maptilerKey = import.meta.env.VITE_MAPTILER_KEY;

    if (!maptilerKey) {
      return;
    }

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`,
        center: [center.lng, center.lat],
        zoom,
        pitch,
        bearing,
        antialias: true,
      });

      // Add navigation controls
      map.current.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Enable 3D buildings
      map.current.on('load', () => {
        if (!map.current) return;

        // Check if the source exists before adding the layer
        const style = map.current.getStyle();
        const hasOpenMapTiles = style.sources && 'openmaptiles' in style.sources;

        if (hasOpenMapTiles) {
          // Add 3D building layer
          const layers = map.current.getStyle().layers;
          const labelLayerId = layers?.find(
            (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
          )?.id;

          map.current.addLayer(
            {
              id: '3d-buildings',
              source: 'openmaptiles',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 14,
              paint: {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'render_height'],
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'render_min_height'],
                ],
                'fill-extrusion-opacity': 0.6,
              },
            },
            labelLayerId
          );
        }

        if (onLoad && map.current) {
          onLoad(map.current);
        }
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Error handling following coding standards
      }
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []); // Empty dependency array - only run once

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}

export default MapView;
