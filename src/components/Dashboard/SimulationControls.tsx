// Simplified simulation controls
// Following coding standards: explicit types, immutable updates

import { useState, useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import type { Location, Patient } from "@/types";
import type maplibregl from "maplibre-gl";

interface SimulationControlsProps {
  map: maplibregl.Map | null;
}

export default function SimulationControls({ map }: SimulationControlsProps) {
  const [emergencyLocation, setEmergencyLocation] = useState<Location | null>(
    null,
  );
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);
  const { startEmergency, resetSimulation, isRunning } = useSimulationStore();

  // Load patient data from JSON
  useEffect(() => {
    fetch("/data/patients.json")
      .then((response) => response.json())
      .then((data: Patient[]) => setPatients(data))
      .catch((error: unknown) => {
        if (error instanceof Error) {
          alert(`Failed to load patient data: ${error.message}`);
        }
      });
  }, []);

  // Handle Ctrl+Space to place emergency marker
  useEffect(() => {
    if (!map) return;

    let cursorPosition: { lng: number; lat: number } | null = null;

    const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      cursorPosition = e.lngLat;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        if (cursorPosition) {
          setEmergencyLocation({
            lat: cursorPosition.lat,
            lng: cursorPosition.lng,
          });
        }
      }
    };

    map.on("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      map.off("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [map]);

  const handleStart = () => {
    if (!emergencyLocation) {
      alert("Press Ctrl+Space on the map to place emergency location first!");
      return;
    }

    if (patients.length === 0) {
      alert("Patient data not loaded yet!");
      return;
    }

    // Use selected patient with the emergency location
    const patient = {
      ...patients[selectedPatientIndex],
      location: {
        ...patients[selectedPatientIndex].location,
        lat: emergencyLocation.lat,
        lng: emergencyLocation.lng,
      },
    };

    startEmergency(patient, "cardiac_arrest");
  };

  const handleReset = () => {
    setEmergencyLocation(null);
    resetSimulation();
  };

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 space-y-3">
      <h2 className="font-bold text-lg">Emergency Response Simulation</h2>

      <div className="text-sm space-y-1">
        <p className="text-gray-600 text-xs">
          Press{" "}
          <kbd className="px-2 py-1 bg-gray-100 rounded border">Ctrl+Space</kbd>{" "}
          to place emergency
        </p>
        <p className={emergencyLocation ? "text-green-600" : "text-gray-400"}>
          {emergencyLocation
            ? "✓ Emergency location set"
            : "○ No emergency location"}
        </p>
      </div>

      {patients.length > 0 && (
        <div className="text-sm">
          <label className="block text-gray-700 mb-1">Patient:</label>
          <select
            value={selectedPatientIndex}
            onChange={(e) => setSelectedPatientIndex(Number(e.target.value))}
            disabled={isRunning}
            className="w-full px-2 py-1 border rounded text-sm"
          >
            {patients.map((patient, index) => (
              <option key={patient.id} value={index}>
                {patient.age}y {patient.gender} - {patient.bloodType}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={handleStart}
          disabled={isRunning || !emergencyLocation}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 font-semibold"
        >
          {isRunning ? "Simulation Running..." : "Start Emergency"}
        </button>

        <button
          onClick={handleReset}
          disabled={!emergencyLocation && !isRunning}
          className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300"
        >
          Reset
        </button>
      </div>

      {isRunning && (
        <div className="text-xs text-gray-600 border-t pt-2">
          <p>🚨 Emergency active</p>
          <p>👥 Responders dispatched</p>
        </div>
      )}
    </div>
  );
}
