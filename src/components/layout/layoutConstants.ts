/**
 * Layout constants for BottomBar-based panels
 * All values derived from original Cocos game coordinates
 * Ported from OriginalGame/src/ui/bottomFrame.js
 * 
 * Coordinate System:
 * - Cocos: Y=0 at bottom, Y=bgHeight at top
 * - CSS: Y=0 at top, Y=bgHeight at bottom
 * - Use cocosToCssY() from @/utils/position for conversion
 */

// Scale factor (1.0 normal, 0.87 for screenFix mode)
// TODO: Make reactive if screenFix becomes a runtime setting
const SCALE = 1.0

/**
 * BottomBar layout dimensions and positions
 */
export const BOTTOM_BAR_LAYOUT = {
  // Scale factor
  scale: SCALE,
  
  // Main dimensions
  bgWidth: 596 * SCALE,
  bgHeight: 839 * SCALE,
  screenWidth: 640,
  
  // Action bar zone (contains title, buttons, subtexts)
  actionBar: {
    top: 1,
    height: 70,
    paddingTop: 5,
    // Button dimensions
    buttonWidth: 100,
    buttonHeight: 70,
    leftButtonX: 15,
    rightButtonX: 10, // from right edge
  },
  
  // Line separator position
  lineTop: 76,
  
  // Content area (where panel content renders)
  content: {
    top: 76,
    get height() { return BOTTOM_BAR_LAYOUT.bgHeight - this.top },
    // Full screen mode (no action bar/line)
    fullScreenTop: -1,
    get fullScreenHeight() { return BOTTOM_BAR_LAYOUT.bgHeight },
  },
  
  // Edge margins for content positioning
  leftEdge: 40,
  get rightEdge() { return this.bgWidth - this.leftEdge },
  
  // Cocos Y reference positions (for panel content positioning)
  // These are Cocos coordinates (measured from bottom)
  cocosRef: {
    actionBarBaseHeight: 803 * SCALE,  // Y position for action bar text
    contentTopLineHeight: 770 * SCALE, // Y position below separator line
    buttonRowY: 100,                    // Y position for bottom button row
  },
} as const

/**
 * TopBar layout dimensions
 */
export const TOP_BAR_LAYOUT = {
  top: 18,
  height: 244 * SCALE,
  get bottom() { return this.top + this.height },
  gap: 10, // Gap between TopBar and BottomBar
} as const

/**
 * Helper to get BottomBar top position (below TopBar)
 */
export function getBottomBarTop(): number {
  return TOP_BAR_LAYOUT.bottom + TOP_BAR_LAYOUT.gap
}

