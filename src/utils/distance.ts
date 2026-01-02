/**
 * Distance Calculation Utilities
 * Calculate distances between points on the map
 */

/**
 * Calculate Euclidean distance between two points
 * @param pos1 First position {x, y}
 * @param pos2 Second position {x, y}
 * @returns Distance in pixels
 */
export function calculateDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
  const dx = pos2.x - pos1.x
  const dy = pos2.y - pos1.y
  return Math.sqrt(dx * dx + dy * dy)
}

