/**
 * Random number utilities
 * Ported from OriginalGame/src/util/utils.js
 */

/**
 * Get random integer between min and max (inclusive)
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Get random float between min and max
 */
export function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Get random element from array
 */
export function getRandomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[getRandomInt(0, array.length - 1)]
}

/**
 * Shuffle array in place
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}


