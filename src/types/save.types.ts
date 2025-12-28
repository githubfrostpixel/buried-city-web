import type { PlayerSaveData } from './player.types'
import type { GameSaveData } from './game.types'
import type { Building } from './building.types'
import type { NPC } from './npc.types'
import type { Site } from './site.types'

export interface SaveData {
  version: string
  timestamp: number
  player: PlayerSaveData
  game: GameSaveData
  buildings: Building[]
  npcs: NPC[]
  sites: Site[]
}


