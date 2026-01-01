export interface SiteCoordinate {
  x: number
  y: number
}

export interface SiteProduceItem {
  itemId: string
  weight: number
}

export interface SiteFixedProduceItem {
  itemId: string
  num: number
}

export interface SiteConfig {
  id: number
  coordinate: SiteCoordinate
  battleRoom?: number
  difficulty?: number[]
  workRoom?: number
  produceValue?: number
  produceList?: SiteProduceItem[]
  fixedProduceList?: SiteFixedProduceItem[]
  unlockValue?: SiteUnlockValue
  secretRoomsId?: number
  def?: number
  [key: string]: any
}

export type SiteConfigMap = Record<string, SiteConfig>

export interface SiteUnlockValue {
  site?: string[]
  npc?: number[]
}

export interface SecretRoomConfig {
  id: number
  maxCount: string  // Stored as string, parsed to int
  probability: string  // Stored as string, parsed to float
  minRooms: number
  maxRooms: number
  minDifficultyOffset: number
  maxDifficultyOffset: number
  produceValue: number
  produceList: SiteProduceItem[]
}

export type SecretRoomConfigMap = Record<string, SecretRoomConfig>

// Room interface for site exploration
export interface Room {
  list: string[] | any[]  // Monster IDs (strings) for battle, Items for work
  type: "battle" | "work"
  difficulty?: number  // Only for battle rooms
  workType?: number    // Only for work rooms (0-2)
}

export interface SiteSaveData {
  pos: SiteCoordinate
  step: number
  rooms: Room[]
  storage: any  // Storage save data
  secretRoomsShowedCount?: number
  isSecretRoomsEntryShowed?: boolean
  isInSecretRooms?: boolean
  secretRooms?: Room[]
  secretRoomsStep?: number
  secretRoomType?: number
  closed?: boolean
  isUnderAttacked?: boolean
  haveNewItems?: boolean
  isActive?: boolean
  fixedTime?: number
}

export interface AdSiteSaveData {
  pos: SiteCoordinate
  step: number
  storage: any
  isActive: boolean
  haveNewItems: boolean
}

export interface BossSiteSaveData {
  pos: SiteCoordinate
  step: number
  storage: any
}

// Legacy interface (keep for compatibility)
export interface Site {
  id: number
  explored: boolean
  cleared: boolean
  storage?: any
}

// Map save data
export interface MapSaveData {
  npcMap: number[]  // Array of unlocked NPC IDs
  siteMap: Record<string, SiteSaveData>  // Site ID -> Site save data
  pos: { x: number; y: number }
  needDeleteSiteList: number[]
}


