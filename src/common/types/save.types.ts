import type { PlayerSaveData } from './player.types'
import type { GameSaveData } from './game.types'
import type { Building } from './building.types'
import type { NPCManagerSaveData } from './npc.types'
import type { Site } from './site.types'

export interface SaveMetadata {
  saveName: string
  cloned: boolean
  timestamp: number
}

export interface SaveData {
  version: string
  timestamp: number
  player: PlayerSaveData
  game: GameSaveData
  buildings: Building[]
  npcManager?: NPCManagerSaveData // New NPC manager system
  sites: Site[]
}


