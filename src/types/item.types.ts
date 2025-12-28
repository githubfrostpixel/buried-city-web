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
  hp?: number
  spirit?: number
  starve?: number
  vigour?: number
  water?: number
  temperature?: number
}

export interface MedicineEffect {
  hp?: number
  injury?: number
  infect?: number
  virus?: number
}

export interface WeaponEffect {
  attack?: number
  range?: number
  precise?: number // Accuracy
  speed?: number
  durability?: number
  bulletType?: string
}

export interface ArmorEffect {
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


