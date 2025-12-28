/**
 * Position Conversion Utilities
 * Convert Cocos2d-JS coordinates (bottom-left origin) to CSS coordinates (top-left origin)
 * 
 * Original game uses Cocos coordinate system:
 * - Origin: Bottom-left (0, 0)
 * - Y-axis: Increases upward
 * 
 * CSS uses:
 * - Origin: Top-left (0, 0)
 * - Y-axis: Increases downward
 */

import type { CSSProperties } from 'react'

/**
 * Convert Cocos Y coordinate to CSS Y coordinate
 * @param cocosY - Y coordinate from Cocos (bottom-left origin)
 * @param screenHeight - Screen height (default: 1136)
 * @returns CSS Y coordinate (top-left origin)
 */
export function cocosToCssY(cocosY: number, screenHeight: number = 1136): number {
  return screenHeight - cocosY
}

/**
 * Convert Cocos position to CSS position
 * @param cocosPos - Position from Cocos {x, y}
 * @param anchor - Anchor point {x: 0-1, y: 0-1}
 * @param size - Element size {width, height} (optional, for precise positioning)
 * @param screenHeight - Screen height (default: 1136)
 * @returns CSS position style object
 * 
 * Note: In Cocos, anchor (0, 0) is bottom-left, anchor (1, 1) is top-right
 * The position represents where the anchor point is placed
 */
export function cocosToCssPosition(
  cocosPos: { x: number; y: number },
  anchor: { x: number; y: number } = { x: 0.5, y: 0.5 },
  size?: { width: number; height: number },
  screenHeight: number = 1136
): CSSProperties {
  const cssY = cocosToCssY(cocosPos.y, screenHeight)
  
  const styles: CSSProperties = {
    position: 'absolute'
  }
  
  // Handle horizontal positioning
  if (anchor.x === 0) {
    // Left edge at x
    styles.left = `${cocosPos.x}px`
  } else if (anchor.x === 0.5) {
    // Center at x - use transform for centering
    styles.left = `${cocosPos.x}px`
    styles.transform = 'translateX(-50%)'
  } else if (anchor.x === 1) {
    // Right edge at x
    if (size) {
      styles.left = `${cocosPos.x - size.width}px`
    } else {
      styles.left = `${cocosPos.x}px`
      styles.transform = 'translateX(-100%)'
    }
  } else {
    // Fractional anchor - use transform
    styles.left = `${cocosPos.x}px`
    styles.transform = `translateX(-${anchor.x * 100}%)`
  }
  
  // Handle vertical positioning
  // In Cocos: anchor.y = 0 is bottom, anchor.y = 1 is top
  // In CSS: we position from top, so we need to account for anchor
  if (anchor.y === 0) {
    // Bottom edge at cssY - use bottom property
    styles.bottom = `${screenHeight - cssY}px`
  } else if (anchor.y === 0.5) {
    // Center at cssY
    styles.top = `${cssY}px`
    const existingTransform = styles.transform || ''
    styles.transform = existingTransform 
      ? `${existingTransform} translateY(-50%)`
      : 'translateY(-50%)'
  } else if (anchor.y === 1) {
    // Top edge at cssY
    styles.top = `${cssY}px`
  } else {
    // Fractional anchor - use transform
    styles.top = `${cssY}px`
    const existingTransform = styles.transform || ''
    styles.transform = existingTransform
      ? `${existingTransform} translateY(-${anchor.y * 100}%)`
      : `translateY(-${anchor.y * 100}%)`
  }
  
  return styles
}

/**
 * Convert Cocos anchor point to CSS positioning
 * @param anchorX - Anchor X (0-1)
 * @param anchorY - Anchor Y (0-1)
 * @returns CSS positioning style
 */
export function cocosAnchorToCss(anchorX: number, anchorY: number): CSSProperties {
  const styles: CSSProperties = {}
  
  // Handle horizontal anchor
  if (anchorX === 0) {
    styles.left = 0
  } else if (anchorX === 0.5) {
    styles.left = '50%'
    styles.transform = 'translateX(-50%)'
  } else if (anchorX === 1) {
    styles.right = 0
  }
  
  // Handle vertical anchor
  if (anchorY === 0) {
    styles.bottom = 0
  } else if (anchorY === 0.5) {
    styles.top = '50%'
    // Combine transforms if both are centered
    if (anchorX === 0.5) {
      styles.transform = 'translate(-50%, -50%)'
    } else {
      styles.transform = 'translateY(-50%)'
    }
  } else if (anchorY === 1) {
    styles.top = 0
  }
  
  return styles
}

/**
 * Convert Cocos position with simple anchor (for common cases)
 * @param x - X coordinate
 * @param y - Y coordinate (Cocos, bottom-left origin)
 * @param anchorX - Anchor X (0 = left, 0.5 = center, 1 = right)
 * @param anchorY - Anchor Y (0 = bottom, 0.5 = center, 1 = top)
 * @param screenHeight - Screen height (default: 1136)
 * @returns CSS position style object
 */
export function cocosPosition(
  x: number,
  y: number,
  anchorX: number = 0.5,
  anchorY: number = 0.5,
  screenHeight: number = 1136
): CSSProperties {
  return cocosToCssPosition(
    { x, y },
    { x: anchorX, y: anchorY },
    undefined,
    screenHeight
  )
}

