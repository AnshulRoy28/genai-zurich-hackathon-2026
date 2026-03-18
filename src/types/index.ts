// Core type definitions for Emergency Response Simulation
// Following TypeScript best practices: explicit types, no any, immutable patterns

// ============================================================================
// Location Types
// ============================================================================

export interface Location {
  lat: number;
  lng: number;
}

export interface Address extends Location {
  street: string;
  city: string;
  postalCode: string;
  floor?: string;
  apartment?: string;
}

// ============================================================================
// Responder Types
// ============================================================================

export type CertificationLevel = "first_responder";

export type ResponderStatus = "available" | "busy" | "offline" | "responding";

export interface ResponseHistory {
  totalResponses: number;
  avgResponseTime: number;
  successRate: number;
}

export interface Responder {
  id: string;
  name: string;
  certification: CertificationLevel;
  location: Location;
  status: ResponderStatus;
  responseHistory: ResponseHistory;
}

// ============================================================================
// Patient Types
// ============================================================================

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type Gender = "male" | "female" | "other";

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Patient {
  id: string;
  age: number;
  gender: Gender;
  bloodType: BloodType;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyContacts: EmergencyContact[];
  location: Address;
}

// ============================================================================
// Emergency Types
// ============================================================================

export type EmergencyType =
  | "cardiac_arrest"
  | "choking"
  | "severe_bleeding"
  | "unconscious"
  | "stroke"
  | "seizure";

export type EmergencyStatus =
  | "active"
  | "responder_assigned"
  | "responder_arrived"
  | "ambulance_arrived"
  | "resolved"
  | "cancelled";

export interface Emergency {
  id: string;
  timestamp: Date;
  type: EmergencyType;
  patient: Patient;
  location: Location;
  status: EmergencyStatus;
  assignedResponderId?: string;
  responseTime?: number;
  outcome?: "success" | "failure";
}

// ============================================================================
// Alert Types
// ============================================================================

export type AlertRadius = 300 | 400 | 600;

export type AlertStatus = "pending" | "accepted" | "declined" | "timeout";

export interface Alert {
  id: string;
  emergencyId: string;
  responderId: string;
  radius: AlertRadius;
  sentAt: Date;
  status: AlertStatus;
  acceptedAt?: Date;
}

// ============================================================================
// Briefing Types
// ============================================================================

export interface AudioBriefing {
  id: string;
  patientId: string;
  audioUrl: string;
  transcript: string;
  duration: number;
  generatedAt: Date;
}

export interface BriefingSection {
  title: string;
  content: string;
  priority: "critical" | "important" | "informational";
}

// ============================================================================
// Simulation Types
// ============================================================================

export interface SimulationState {
  isRunning: boolean;
  currentEmergency: Emergency | null;
  activeAlerts: Alert[];
  matchedResponders: Responder[];
  currentRadius: AlertRadius;
  elapsedTime: number;
  ambulanceETA: number;
}

export interface SimulationStats {
  responseTime: number;
  survivalProbability: number;
  timeSaved: number;
  ambulanceResponseTime: number;
  responderDistance: number;
}

// ============================================================================
// Scenario Types
// ============================================================================

export interface Scenario {
  id: string;
  name: string;
  description: string;
  patient: Patient;
  emergencyType: EmergencyType;
  nearbyResponders: number;
  expectedOutcome: "success" | "escalation_needed" | "failure";
}

// ============================================================================
// Map Types
// ============================================================================

export interface MapConfig {
  center: Location;
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface MarkerData {
  id: string;
  location: Location;
  type: "responder" | "emergency" | "ambulance";
  data: Responder | Emergency;
}

// ============================================================================
// Route Types
// ============================================================================

export interface Route {
  id: string;
  from: Location;
  to: Location;
  distance: number;
  duration: number;
  coordinates: Location[];
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
