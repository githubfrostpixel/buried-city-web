/**
 * Site Utilities
 * Utility functions for site-related components
 */

/**
 * Calculate button positions for SitePanelContent
 * @param bgWidth - Background width
 * @param isBazaar - Whether this is a bazaar site (id === 400)
 * @returns Button X positions
 */
export function calculateSiteButtonPositions(
  bgWidth: number,
  isBazaar: boolean
): { btn1X: number; btn2X: number } {
  const btn1X = isBazaar ? bgWidth / 6 : bgWidth / 4
  const btn2X = isBazaar ? bgWidth / 6 * 5 : bgWidth / 4 * 3
  return { btn1X, btn2X }
}

/**
 * Calculate content area top position
 * @param contentTop - Content top position from layout
 * @param estimatedImageHeight - Estimated image height
 * @param contentAreaOffset - Offset for content area (default: 120)
 * @param digDesYOffset - Offset for digDesY (default: 40)
 * @returns Content area top position
 */
export function calculateContentAreaTop(
  contentTop: number,
  estimatedImageHeight: number = 400,
  contentAreaOffset: number = 120,
  digDesYOffset: number = 40
): number {
  const digDesY = contentTop - digDesYOffset
  const imageBottom = digDesY + estimatedImageHeight
  return imageBottom - contentAreaOffset
}

/**
 * Calculate battle image position
 * @param screenWidth - Screen width
 * @param digDesY - Dig description Y position
 * @returns Battle image stack position
 */
export function calculateBattleImagePosition(
  screenWidth: number,
  digDesY: number
): { left: number; top: number } {
  return {
    left: screenWidth / 2 - 20,
    top: digDesY
  }
}

/**
 * Calculate work image position
 * @param bgHeight - Background height
 * @param contentTopLineHeight - Content top line height from Cocos
 * @param offset - Offset from top (default: 20)
 * @returns Work image top position
 */
export function calculateWorkImagePosition(
  bgHeight: number,
  contentTopLineHeight: number,
  offset: number = 20
): number {
  return bgHeight - contentTopLineHeight + offset
}

