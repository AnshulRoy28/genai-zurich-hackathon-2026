// Distance calculation utilities using Haversine formula
// Following coding standards: explicit types, no any, immutable patterns

import type { Location } from '@/types';

/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * @param from Starting location
 * @param to Destination location
 * @returns Distance in meters
 */
export function calculateDistance(from: Location, to: Location): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (from.lat * Math.PI) / 180;
  const φ2 = (to.lat * Math.PI) / 180;
  const Δφ = ((to.lat - from.lat) * Math.PI) / 180;
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate walking time based on distance
 * @param distanceInMeters Distance in meters
 * @returns Time in seconds (assumes 5 km/h walking speed)
 */
export function calculateWalkingTime(distanceInMeters: number): number {
  const walkingSpeedKmh = 5;
  const walkingSpeedMs = (walkingSpeedKmh * 1000) / 3600;
  return Math.round(distanceInMeters / walkingSpeedMs);
}

/**
 * Calculate driving time based on distance
 * @param distanceInMeters Distance in meters
 * @returns Time in seconds (assumes 40 km/h with traffic)
 */
export function calculateDrivingTime(distanceInMeters: number): number {
  const drivingSpeedKmh = 40;
  const drivingSpeedMs = (drivingSpeedKmh * 1000) / 3600;
  return Math.round(distanceInMeters / drivingSpeedMs);
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "250m" or "1.2km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format time for display
 * @param seconds Time in seconds
 * @returns Formatted string (e.g., "2m 30s" or "45s")
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}
