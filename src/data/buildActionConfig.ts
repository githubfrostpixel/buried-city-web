/**
 * Build Action Configuration Data
 * Ported from OriginalGame/src/data/buildActionConfig.js
 * 
 * Contains configuration for special building actions (bed sleep, rest, etc.)
 */

export interface BedActionConfig {
  rate: number  // Recovery rate per hour (0.6, 0.8, 1.0)
}

export type BuildActionConfig = {
  [buildingId: string]: BedActionConfig[] | any[]
}

export const buildActionConfig: BuildActionConfig = {
  "9": [
    { rate: 0.6 },  // Level 0 - Basic bed
    { rate: 0.8 },  // Level 1 - Improved bed
    { rate: 1.0 }   // Level 2 - Best bed
  ]
}



