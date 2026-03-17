// Simulation state management using Zustand
// Following coding standards: explicit types, immutable updates

import { create } from 'zustand';
import type {
  Emergency,
  Responder,
  Alert,
  AlertRadius,
  SimulationState,
  Patient,
  EmergencyType,
} from '@/types';
import { mockResponders, mockPatients } from '@/lib/data/mockData';

interface SimulationStore extends SimulationState {
  // State
  allResponders: Responder[];
  
  // Actions
  startEmergency: (patient: Patient, type: EmergencyType) => void;
  assignResponder: (responderId: string) => void;
  escalateRadius: () => void;
  resetSimulation: () => void;
  updateElapsedTime: (time: number) => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  // Initial state
  isRunning: false,
  currentEmergency: null,
  activeAlerts: [],
  matchedResponders: [],
  currentRadius: 300,
  elapsedTime: 0,
  ambulanceETA: 600, // 10 minutes default
  allResponders: mockResponders,

  // Start new emergency
  startEmergency: (patient: Patient, type: EmergencyType) => {
    const emergency: Emergency = {
      id: `emergency-${Date.now()}`,
      timestamp: new Date(),
      type,
      patient,
      location: patient.location,
      status: 'active',
    };

    set({
      isRunning: true,
      currentEmergency: emergency,
      activeAlerts: [],
      matchedResponders: [],
      currentRadius: 300,
      elapsedTime: 0,
    });
  },

  // Assign responder to emergency
  assignResponder: (responderId: string) =>
    set((state) => {
      if (!state.currentEmergency) return state;

      return {
        currentEmergency: {
          ...state.currentEmergency,
          status: 'responder_assigned',
          assignedResponderId: responderId,
        },
        allResponders: state.allResponders.map((r) =>
          r.id === responderId
            ? { ...r, status: 'responding' as const }
            : r
        ),
      };
    }),

  // Escalate to next radius
  escalateRadius: () =>
    set((state) => {
      let nextRadius: AlertRadius = 300;
      if (state.currentRadius === 300) nextRadius = 400;
      else if (state.currentRadius === 400) nextRadius = 600;
      else nextRadius = 600;

      return { currentRadius: nextRadius };
    }),

  // Reset simulation
  resetSimulation: () =>
    set({
      isRunning: false,
      currentEmergency: null,
      activeAlerts: [],
      matchedResponders: [],
      currentRadius: 300,
      elapsedTime: 0,
      allResponders: mockResponders.map((r) => ({
        ...r,
        status: Math.random() > 0.2 ? 'available' : 'busy',
      })),
    }),

  // Update elapsed time
  updateElapsedTime: (time: number) =>
    set({ elapsedTime: time }),
}));
