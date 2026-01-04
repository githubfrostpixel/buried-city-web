/**
 * Scaling Utilities
 * Handle image scaling for UI components
 * 
 * Original game uses various scale factors:
 * - 0.4 - Small icons (status buttons)
 * - 0.5 - Medium icons (attribute buttons, currency)
 * - 0.6 - Larger icons (electric, fuel)
 * - 0.7 - Talent button, dog button
 * - 0.87 - Screen fix scale for backgrounds
 */

/**
 * Apply scale transform to element
 * @param scale - Scale factor (0-1 or larger)
 * @returns CSS transform string
 */
export function applyScale(scale: number): string {
  return `scale(${scale})`
}

/**
 * Scale sprite dimensions
 * @param width - Original width
 * @param height - Original height
 * @param scale - Scale factor
 * @returns Scaled dimensions
 */
export function scaleDimensions(
  width: number,
  height: number,
  scale: number
): { width: number; height: number } {
  return {
    width: width * scale,
    height: height * scale
  }
}

/**
 * Get scaled width
 * @param width - Original width
 * @param scale - Scale factor
 * @returns Scaled width
 */
export function scaleWidth(width: number, scale: number): number {
  return width * scale
}

/**
 * Get scaled height
 * @param height - Original height
 * @param scale - Scale factor
 * @returns Scaled height
 */
export function scaleHeight(height: number, scale: number): number {
  return height * scale
}

/**
 * Common scale constants used in the game
 */
export const SCALE = {
  SMALL: 0.4,      // Small icons (status buttons)
  MEDIUM: 0.5,     // Medium icons (attribute buttons, currency)
  LARGE: 0.6,      // Larger icons (electric, fuel)
  TALENT: 0.7,     // Talent button, dog button
  SCREEN_FIX: 0.87 // Screen fix scale for backgrounds
} as const

