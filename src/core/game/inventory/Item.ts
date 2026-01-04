import { itemConfig } from '@/core/data/items'
import type { 
  ItemConfig,
  FoodEffect, 
  MedicineEffect, 
  WeaponEffect, 
  ArmorEffect, 
  ToolEffect, 
  BuffEffect 
} from '@/shared/types/item.types'

export class Item {
  id: string
  config: ItemConfig
  
  constructor(id: string) {
    this.id = id
    const config = itemConfig[id]
    if (!config) {
      throw new Error(`Item config not found for ID: ${id}`)
    }
    this.config = { ...config } // Clone to prevent mutations
  }
  
  getPrice(): number {
    return this.config.price
  }
  
  getValue(): number {
    return this.config.value
  }
  
  getWeight(): number {
    return this.config.weight
  }
  
  /**
   * Get item type at specified level
   * @param level - 0 for main category, 1 for subcategory
   * @returns 2-digit type string
   */
  getType(level: number): string {
    const itemIdStr = String(this.id)
    const startPos = level * 2
    return itemIdStr.substring(startPos, startPos + 2)
  }
  
  /**
   * Check if item matches both type levels
   */
  isType(type1: string, type2: string): boolean {
    return this.getType(0) === type1 && this.getType(1) === type2
  }
  
  getFoodEffect(): FoodEffect | undefined {
    return this.config.effect_food
  }
  
  getMedicineEffect(): MedicineEffect | undefined {
    return this.config.effect_medicine
  }
  
  getWeaponEffect(): WeaponEffect | undefined {
    return this.config.effect_weapon
  }
  
  getArmorEffect(): ArmorEffect | undefined {
    return this.config.effect_arm
  }
  
  getToolEffect(): ToolEffect | undefined {
    return this.config.effect_tool
  }
  
  getBuffEffect(): BuffEffect | undefined {
    return this.config.effect_buff
  }
}

