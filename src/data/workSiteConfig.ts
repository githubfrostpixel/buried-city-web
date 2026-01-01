/**
 * Work site configuration
 * Ported from OriginalGame/src/ui/workSiteNode.js
 */

export interface WorkSiteNeedItem {
  itemId: number
  num: number
}

export interface WorkSiteConfig {
  costTime: number  // minutes
  needItems: WorkSiteNeedItem[]
  lastTime: number  // seconds
  brokenProbability: number
}

export const workSiteConfig: WorkSiteConfig = {
  costTime: 120,  // minutes
  needItems: [
    { itemId: 1102063, num: 1 }
  ],
  lastTime: 96 * 60,  // seconds (96 hours)
  brokenProbability: 0.03
}

export const gasSiteConfig: WorkSiteConfig = {
  costTime: 90,  // minutes
  needItems: [
    { itemId: 1102073, num: 1 }
  ],
  lastTime: 72 * 60,  // seconds (72 hours)
  brokenProbability: 0.03
}

