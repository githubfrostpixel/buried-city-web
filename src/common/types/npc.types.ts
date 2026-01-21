import type { Storage } from '@/core/game/inventory/Storage'

/**
 * Favorite item configuration for NPC trading
 * Items NPC prefers and their price multipliers at different reputation levels
 */
export interface FavoriteItem {
  itemId: string
  price: number // Multiplier (e.g., 1.2 = 20% more expensive)
}

/**
 * Trading item configuration
 * Items NPC sells at different reputation levels
 */
export interface TradingItem {
  itemId: string
  num: number
}

/**
 * Need item configuration
 * Items NPC needs from player at different reputation levels
 */
export interface NeedItem {
  itemId: string
  num: number
}

/**
 * Gift configuration
 * Gifts NPC gives to player at different reputation levels
 */
export interface Gift {
  itemId?: string
  num?: string
  siteId?: string
}

/**
 * Steal log entry
 * Records of stealing attempts and results
 */
export interface StealLogEntry {
  ti: number // Time
  ar: Array<{ itemId: string; num: number }> // Stolen items
}

/**
 * NPC configuration data
 * Static configuration for each NPC
 */
export interface NPCConfig {
  id: number
  favorite: FavoriteItem[][] // Array of 11 arrays (reputation 0-10)
  trading: (TradingItem[] | null)[] // Array of 11 arrays (reputation 0-10)
  needItem: (NeedItem | null)[] // Array of 11 items (reputation 0-10)
  gift: (Gift | null)[] // Array of 11 gifts (reputation 0-10)
  gift_extra: (Gift | null)[] // Array of 11 extra gifts (for Social talent)
  coordinate: { x: number; y: number } // Map position
}

/**
 * NPC gift configuration
 * Configuration for random gifts NPCs give when visiting
 */
export interface NPCGiftConfig {
  produceValue: number
  produceList: Array<{
    itemId: string
    weight: number
  }>
}

/**
 * NPC runtime state
 * Represents an NPC instance in the game
 */
export interface NPC {
  id: number
  config: NPCConfig
  pos: { x: number; y: number }
  reputation: number // 0-10
  reputationMax: number // 10
  maxRep: number // Highest reputation reached (-1 initially)
  tradingCount: number
  storage: Storage // NPC's inventory
  isUnlocked: boolean
  isSteal: boolean // Can steal today
  Alert: number // Alert level (0-30)
  log: StealLogEntry[] // Stealing history
  needSendGiftList: {
    item?: Gift[]
    site?: Gift[]
  }
  sentGiftNumbers: Set<number> // Sequential gift numbers (1, 2, 3, 4, 5, 6, 7...) of gifts that have been sent
  lastGiftDay: number // Day when last gift was sent (-1 if never sent)
}

/**
 * NPC save data
 * Data structure for saving NPC state
 */
export interface NPCSaveData {
  pos: { x: number; y: number }
  reputation: number
  maxRep: number
  storage: Record<string, number> // Storage.save() format
  needSendGiftList: {
    item?: Gift[]
    site?: Gift[]
  }
  isUnlocked: boolean
  tradingCount: number
  isSteal: boolean
  Alert: number
  log: StealLogEntry[]
  sentGiftNumbers: number[] // Array of gift numbers (1, 2, 3, 4, 5, 6, 7...) that have been sent
}

/**
 * NPC Manager save data
 * Data structure for saving all NPCs
 */
export interface NPCManagerSaveData {
  npcList: Record<string, NPCSaveData>
  lastGiftDay: number // Day when last gift was sent globally (-1 if never sent)
}

/**
 * NPC config map
 * All NPC configurations indexed by ID
 */
export type NPCConfigMap = Record<string, NPCConfig>


