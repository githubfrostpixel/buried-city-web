export interface PlayerAttributes {
  hp: number
  hpMax: number
  spirit: number // Mood
  spiritMax: number
  starve: number // Hunger
  starveMax: number
  vigour: number // Energy
  vigourMax: number
  injury: number
  injuryMax: number
  infect: number // Infection
  infectMax: number
  water: number // Thirst
  waterMax: number
  virus: number
  virusMax: number
  temperature: number
  temperatureMax: number
}

export interface PlayerState extends PlayerAttributes {
  level: number
  exp: number
  expMax: number
  money: number
  talent: string[] // Selected talents
}

export interface PlayerSaveData {
  attributes: PlayerAttributes
  level: number
  exp: number
  money: number
  talent: string[]
  bag: Record<string, number>
  storage: Record<string, number>
  safe: Record<string, number>
  equipment: {
    gun: string | null
    weapon: string | null
    equip: string | null
    tool: string | null
    special: string | null
  }
  dog: {
    hunger: number
    hungerMax: number
    mood: number
    moodMax: number
    injury: number
    injuryMax: number
    active: boolean
  }
}

export interface AttributeEffect {
  hp?: number
  spirit?: number
  starve?: number
  vigour?: number
  injury?: number
  infect?: number
  water?: number
  virus?: number
  temperature?: number
  [key: string]: number | undefined
}

export interface PlayerAttributeEffectConfig {
  id: number
  range: string // Range string like "[-,25]" or "(25,50]"
  effect: AttributeEffect
}

export interface PlayerConfig {
  changeByTime: number[][]
  temperature: number[][]
}

export interface PlayerAttrEffectConfig {
  [attribute: string]: {
    [level: string]: PlayerAttributeEffectConfig
  }
}


