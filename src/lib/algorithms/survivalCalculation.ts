// Survival probability calculation based on response time
// Following coding standards: explicit types, no any

/**
 * Calculate survival probability based on response time
 * Base: 90% at 0 minutes, drops 8.5% per minute
 * @param responseTimeInSeconds Response time in seconds
 * @returns Survival probability as percentage (0-100)
 */
export function calculateSurvivalProbability(responseTimeInSeconds: number): number {
  const baseSurvival = 90;
  const dropPerMinute = 8.5;
  const responseTimeInMinutes = responseTimeInSeconds / 60;

  const survival = Math.max(
    10, // Minimum 10% survival
    baseSurvival - responseTimeInMinutes * dropPerMinute
  );

  return Math.round(survival);
}

/**
 * Calculate time saved by using responder vs ambulance
 * @param responderTime Responder arrival time in seconds
 * @param ambulanceTime Ambulance arrival time in seconds
 * @returns Time saved in seconds
 */
export function calculateTimeSaved(
  responderTime: number,
  ambulanceTime: number
): number {
  return Math.max(0, ambulanceTime - responderTime);
}

/**
 * Calculate survival improvement
 * @param responderTime Responder arrival time in seconds
 * @param ambulanceTime Ambulance arrival time in seconds
 * @returns Survival probability improvement as percentage points
 */
export function calculateSurvivalImprovement(
  responderTime: number,
  ambulanceTime: number
): number {
  const responderSurvival = calculateSurvivalProbability(responderTime);
  const ambulanceSurvival = calculateSurvivalProbability(ambulanceTime);
  return responderSurvival - ambulanceSurvival;
}

/**
 * Estimate ambulance arrival time based on distance
 * Assumes 40 km/h average speed with traffic + 2 minute dispatch delay
 * @param distanceInMeters Distance in meters
 * @returns Estimated time in seconds
 */
export function estimateAmbulanceTime(distanceInMeters: number): number {
  const dispatchDelay = 120; // 2 minutes
  const avgSpeedKmh = 40;
  const avgSpeedMs = (avgSpeedKmh * 1000) / 3600;
  const travelTime = distanceInMeters / avgSpeedMs;
  return Math.round(dispatchDelay + travelTime);
}
