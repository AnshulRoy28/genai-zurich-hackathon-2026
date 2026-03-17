import { useState, useCallback } from 'react';
import MapView from './components/Map/MapView';
import ResponderMarkers from './components/Map/ResponderMarkers';
import EmergencyMarker from './components/Map/EmergencyMarker';
import RadiusCircle from './components/Map/RadiusCircle';
import SimulationControls from './components/Dashboard/SimulationControls';
import { useSimulationStore } from './store/simulationStore';
import { useResponderSimulation } from './hooks/useResponderSimulation';
import type { Location } from './types';
import type maplibregl from 'maplibre-gl';

// Zurich city center
const ZURICH_CENTER: Location = { lat: 47.3769, lng: 8.5417 };

function App() {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const maptilerKey = import.meta.env.VITE_MAPTILER_KEY;

  const { allResponders, currentEmergency, currentRadius } = useSimulationStore();
  
  // Enable responder movement simulation
  useResponderSimulation();

  const handleMapLoad = useCallback((loadedMap: maplibregl.Map) => {
    setMap(loadedMap);
    setMapLoaded(true);
  }, []);

  if (!maptilerKey) {
    return (
      <div className="w-full h-full bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Emergency Response Simulation</h1>
          <p className="text-gray-400 mb-8">3D Map with Real-Time Proximity Matching</p>
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-yellow-300 font-semibold mb-2">Setup Required</p>
            <p className="text-sm text-gray-300">
              Add your Maptiler API key to <code className="bg-gray-800 px-2 py-1 rounded">.env</code>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              See README.md for setup instructions
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapView
        center={ZURICH_CENTER}
        zoom={15}
        pitch={45}
        bearing={0}
        onLoad={handleMapLoad}
      />

      {/* Map overlays */}
      {mapLoaded && (
        <>
          <ResponderMarkers map={map} responders={allResponders} />
          <EmergencyMarker map={map} emergency={currentEmergency} />
          {currentEmergency && (
            <RadiusCircle
              map={map}
              center={currentEmergency.location}
              radius={currentRadius}
            />
          )}
        </>
      )}
      
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading 3D Map...</p>
          </div>
        </div>
      )}

      {/* UI Panels */}
      {mapLoaded && (
        <SimulationControls map={map} />
      )}
    </div>
  );
}

export default App;
