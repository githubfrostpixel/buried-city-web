export interface BuildingCost {
  itemId: number | string
  num: number
}

export interface BuildingCondition {
  bid?: number
  level?: number
  [key: string]: any
}

export interface BuildingLevel {
  id: number
  cost: BuildingCost[]
  createTime?: number // Construction time in seconds
  condition?: BuildingCondition
  produceList?: number[] // Items that can be produced
}

export type BuildingConfig = Record<string, BuildingLevel[]>

export interface Building {
  id: number
  level: number
  active: boolean
  position?: { x: number; y: number }
}


