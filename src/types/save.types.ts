import type { PlayerSaveData } from './player.types'
import type { GameSaveData } from './game.types'
import type { Building } from './building.types'
import type { NPCManagerSaveData } from './npc.types'
import type { Site } from './site.types'

export interface SaveData {
  version: string
  timestamp: number
  player: PlayerSaveData
  game: GameSaveData
  buildings: Building[]
  npcManager?: NPCManagerSaveData // New NPC manager system
  npcs?: Array<{ // Legacy NPC format for backward compatibility
    id: number
    friendship: number
    visited: boolean
    lastVisitDay?: number
  }>
  sites: Site[]
}


