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
  createTime?: number // Construction time in minutes (converted to seconds in Building class)
  condition?: BuildingCondition
  produceList?: (number | string)[] // Formula IDs that can be produced (supports both numeric and string IDs)
}

export type BuildingConfig = Record<string, BuildingLevel[]>

/**
 * Building upgrade result types
 */
export enum BuildUpgradeType {
  UPGRADABLE = 1,
  MAX_LEVEL = 2,
  CONDITION = 3,
  COST = 4
}

/**
 * Result of checking if building can upgrade
 */
export interface UpgradeResult {
  buildUpgradeType: BuildUpgradeType
  condition?: BuildingCondition
  cost?: BuildingCost[]
}

/**
 * Upgrade configuration for next level
 */
export interface UpgradeConfig {
  level: number
  upgradeTime: number // in minutes
  upgradeCost: BuildingCost[]
}

/**
 * Building save data structure
 */
export interface BuildingSaveData {
  id: number
  level: number
  active?: boolean
  position?: { x: number; y: number }
  activeBtnIndex?: number // For UI state
  saveActions?: Record<string, any> // For formula states (deferred)
}

/**
 * Room save data structure
 */
export type RoomSaveData = BuildingSaveData[]

/**
 * Building interface (extended with all required properties)
 * Note: This is the interface for the Building class instance
 */
export interface Building {
  id: number
  level: number
  configs: BuildingLevel[]
  currentConfig: BuildingLevel
  isUpgrading: boolean
  active: boolean
  position?: { x: number; y: number }
  activeBtnIndex: number // For UI state
  actions: any[] // Formula[] | BedAction[] - using any[] for now, will be properly typed when all action types are ready
}


