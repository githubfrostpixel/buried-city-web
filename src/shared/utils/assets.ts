/**
 * Asset path utilities
 * Handles asset paths for both development and production
 */

/**
 * Get sprite atlas image path
 */
export function getSpriteAtlasPath(atlas: string): string {
  // In Vite, assets in src/assets can be imported or accessed via public
  // For now, we'll use the public folder approach
  return `/assets/sprites/${atlas}.png`
}

/**
 * Get sprite atlas JSON path
 */
export function getSpriteAtlasJsonPath(atlas: string): string {
  return `/assets/sprites/${atlas}.json`
}

/**
 * Get individual extracted sprite path
 * Sprites are stored in subdirectories: src/assets/sprites/{atlas}/{frame}.png
 */
export function getSpritePath(atlas: string, frame: string): string {
  return `/assets/sprites/${atlas}/${frame}`
}

/**
 * Get image asset path
 */
export function getImagePath(path: string): string {
  return `/assets/${path}`
}

/**
 * Get audio path
 */
export function getAudioPath(path: string): string {
  return `/assets/audio/${path}`
}


