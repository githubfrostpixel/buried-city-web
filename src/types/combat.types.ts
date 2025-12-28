export interface MonsterConfig {
  id: number
  hp: number
  speed: number
  attackSpeed: number
  attack: number
  range: number
  prefixType: number
}

export interface MonsterListEntry {
  id: number
  difficulty: number
  monsterIds: number[]
  [key: string]: any
}

export type MonsterList = Record<string, MonsterListEntry>

export interface BattleState {
  monsters: Monster[]
  playerDistance: number // Distance in lines (0-6)
  turn: number
  isPlayerTurn: boolean
}

export interface Monster {
  id: number
  config: MonsterConfig
  hp: number
  hpMax: number
  distance: number
}


