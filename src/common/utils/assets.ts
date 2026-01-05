/**
 * Asset path utilities
 * Handles asset paths for both development and production
 * Uses Vite's BASE_URL to support base path configuration
 */

/**
 * Get the base URL for assets (includes base path if configured)
 */
function getBaseUrl(): string {
  return import.meta.env.BASE_URL
}

/**
 * Get sprite atlas image path
 */
export function getSpriteAtlasPath(atlas: string): string {
  // In Vite, assets in src/assets can be imported or accessed via public
  // For now, we'll use the public folder approach
  return `${getBaseUrl()}assets/sprites/${atlas}.png`
}

/**
 * Get sprite atlas JSON path
 */
export function getSpriteAtlasJsonPath(atlas: string): string {
  return `${getBaseUrl()}assets/sprites/${atlas}.json`
}

/**
 * Get individual extracted sprite path
 * Sprites are stored in subdirectories: src/assets/sprites/{atlas}/{frame}.png
 */
export function getSpritePath(atlas: string, frame: string): string {
  return `${getBaseUrl()}assets/sprites/${atlas}/${frame}`
}

/**
 * Get image asset path
 */
export function getImagePath(path: string): string {
  return `${getBaseUrl()}assets/${path}`
}

/**
 * Get audio path
 */
export function getAudioPath(path: string): string {
  return `${getBaseUrl()}assets/audio/${path}`
}


