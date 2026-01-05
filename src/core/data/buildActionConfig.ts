/**
 * Build Action Configuration Data
 * Ported from OriginalGame/src/data/buildActionConfig.js
 * 
 * Contains configuration for special building actions (bed sleep, rest, etc.)
 */

export interface BedActionConfig {
  rate: number  // Recovery rate per hour (0.6, 0.8, 1.0)
}

export interface BonfireActionConfig {
  cost: Array<{ itemId: number; num: number }>
  makeTime: number  // Minutes per wood
  max: number  // Maximum fuel capacity
}

export interface RestActionConfig {
  cost: Array<{ itemId: number; num: number }>
  makeTime: number  // Minutes
  effect: {
    spirit: number
    spirit_chance: number
  }
}

export type BuildActionConfig = {
  [buildingId: string]: BedActionConfig[] | BonfireActionConfig[] | RestActionConfig[][] | any[]
}

export const buildActionConfig: BuildActionConfig = {
  "5": [{
    cost: [{ itemId: 1101011, num: 1 }],  // 1 wood
    makeTime: 240,  // 240 minutes = 4 hours per wood
    max: 6  // Maximum 6 wood
  }],
  "9": [
    { rate: 0.6 },  // Level 0 - Basic bed
    { rate: 0.8 },  // Level 1 - Improved bed
    { rate: 1.0 }   // Level 2 - Best bed
  ],
  "10": [
    [  // Level 0
      {
        cost: [{ itemId: 1105011, num: 4 }, { itemId: 1101061, num: 1 }, { itemId: 1101011, num: 1 }],
        makeTime: 60,
        effect: { spirit: 60, spirit_chance: 1 }
      },
      {
        cost: [{ itemId: 1105022, num: 3 }],
        makeTime: 60,
        effect: { spirit: 60, spirit_chance: 1 }
      }
    ],
    [  // Level 1
      {
        cost: [{ itemId: 1105011, num: 4 }, { itemId: 1101061, num: 1 }, { itemId: 1101011, num: 1 }],
        makeTime: 60,
        effect: { spirit: 80, spirit_chance: 1 }
      },
      {
        cost: [{ itemId: 1105022, num: 3 }],
        makeTime: 60,
        effect: { spirit: 80, spirit_chance: 1 }
      }
    ],
    [  // Level 2
      {
        cost: [{ itemId: 1105011, num: 4 }, { itemId: 1101061, num: 1 }, { itemId: 1101011, num: 1 }],
        makeTime: 60,
        effect: { spirit: 100, spirit_chance: 1 }
      },
      {
        cost: [{ itemId: 1105022, num: 3 }],
        makeTime: 60,
        effect: { spirit: 100, spirit_chance: 1 }
      }
    ]
  ]
}





