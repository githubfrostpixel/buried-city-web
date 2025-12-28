export interface NPCConfig {
  id: number
  name?: string
  friendship?: number
  [key: string]: any
}

export type NPCConfigMap = Record<string, NPCConfig>

export interface NPC {
  id: number
  friendship: number
  visited: boolean
  lastVisitDay?: number
}


