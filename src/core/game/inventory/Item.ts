import { itemConfig } from '@/core/data/items'
import type { 
  ItemConfig,
  FoodEffect, 
  MedicineEffect, 
  WeaponEffect, 
  ArmorEffect, 
  ToolEffect, 
  BuffEffect 
} from '@/common/types/item.types'

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
    const itemKey = String(this.id)
    
    // Map key prefixes to numeric type codes
    // Main category (level 0)
    let mainType = ''
    let subType = ''
    
    if (itemKey.startsWith('item_mat_')) {
      mainType = '11'
      subType = '01'
    } else if (itemKey.startsWith('item_model_')) {
      mainType = '11'
      subType = '02'
    } else if (itemKey.startsWith('item_food_')) {
      mainType = '11'
      subType = '03'
    } else if (itemKey.startsWith('item_med_')) {
      mainType = '11'
      subType = '04'
    } else if (itemKey.startsWith('item_econ_')) {
      mainType = '11'
      subType = '05'
    } else if (itemKey.startsWith('item_special_')) {
      mainType = '11'
      subType = '06'
    } else if (itemKey.startsWith('item_buff_')) {
      mainType = '11'
      subType = '07'
    } else if (itemKey.startsWith('item_weapon_gun_')) {
      mainType = '13'
      subType = '01'
    } else if (itemKey.startsWith('item_weapon_melee_')) {
      mainType = '13'
      subType = '02'
    } else if (itemKey.startsWith('item_weapon_explosive_')) {
      mainType = '13'
      subType = '03'
    } else if (itemKey.startsWith('item_armor_')) {
      mainType = '13'
      subType = '04'
    } else if (itemKey.startsWith('item_ammo_')) {
      mainType = '13'
      subType = '05'
    } else if (itemKey.startsWith('item_equip_other_')) {
      mainType = '13'
      subType = '06'
    } else {
      // Fallback: try to extract from numeric ID if it's still numeric
      const itemIdStr = String(this.id)
      if (/^\d{7}$/.test(itemIdStr)) {
        const startPos = level * 2
        return itemIdStr.substring(startPos, startPos + 2)
      }
      // Unknown type, return empty string
      return ''
    }
    
    return level === 0 ? mainType : subType
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

