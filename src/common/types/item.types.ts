export interface ItemConfig {
  id: string
  weight: number
  price: number
  value: number
  effect_food?: FoodEffect
  effect_medicine?: MedicineEffect
  effect_weapon?: WeaponEffect
  effect_arm?: ArmorEffect
  effect_tool?: ToolEffect
  effect_buff?: BuffEffect
}

export interface FoodEffect {
  id?: string
  hp?: number
  spirit?: number
  starve?: number
  vigour?: number
  water?: number
  temperature?: number
  starve_chance?: number
  infect?: number
  infect_chance?: number
  spirit_chance?: number
}

export interface MedicineEffect {
  id?: string
  hp?: number
  injury?: number
  infect?: number
  virus?: number
  injury_chance?: number
  infect_chance?: number
  hp_chance?: number
}

export interface WeaponEffect {
  id?: string
  atk?: number
  atkCD?: number
  range?: number
  bulletMin?: number
  bulletMax?: number
  bulletNum?: number
  reloadCD?: number
  precise?: number
  dtPrecise?: number
  deathHit?: number
  dtDeathHit?: number
  brokenProbability?: number
  // Legacy fields for compatibility
  attack?: number
  speed?: number
  durability?: number
  bulletType?: string
}

export interface ArmorEffect {
  id?: string
  def?: number
  brokenProbability?: number
  // Legacy fields for compatibility
  defense?: number
  durability?: number
}

export interface ToolEffect {
  [key: string]: any
}

export interface BuffEffect {
  [key: string]: any
}

export interface Item {
  id: string
  count: number
  config: ItemConfig
}

export type ExpireRate = Record<string, number>
export type FertilizerRate = Record<string, number>

export enum ItemType {
  // Main categories (level 0)
  TOOL = "11",
  EQUIP = "13",
  MATERIAL = "01",
  MODEL = "02",
  FOOD = "03",
  MEDICINE = "04",
  ECONOMY = "05",
  SPECIFIC = "06",
  BUFF = "07",
  
  // Weapon subcategories (level 1, for EQUIP items)
  GUN = "01",
  WEAPON = "02",
  WEAPON_TOOL = "03",
  DEFEND = "04",
  OTHER = "05"
}

