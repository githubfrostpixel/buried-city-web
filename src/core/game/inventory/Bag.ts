import { Storage } from './Storage'
import { usePlayerStore } from '@/core/store/playerStore'
import { itemConfig } from '@/core/data/items'

export class Bag extends Storage {
  constructor() {
    super('player', 0) // Max weight calculated dynamically
  }
  
  /**
   * Get max weight (base 40 + bonuses from storage items)
   */
  getMaxWeight(): number {
    let maxWeight = 40 // Base weight
    
    const playerStore = usePlayerStore.getState()
    
    // +10 if storage has item item_ammo_enhanced_backpack
    if (playerStore.getStorageItemCount('item_ammo_enhanced_backpack') > 0) {
      maxWeight += 10
    }
    // +20 if storage has item item_ammo_military_grade_backpack
    if (playerStore.getStorageItemCount('item_ammo_military_grade_backpack') > 0) {
      maxWeight += 20
    }
    // +30 if storage has item item_ammo_motorcycle
    if (playerStore.getStorageItemCount('item_ammo_motorcycle') > 0) {
      maxWeight += 30
    }
    // +30 if IAP big bag unlocked (skip for now)
    
    return maxWeight
  }
  
  /**
   * Override canAddItem to use dynamic max weight
   */
  canAddItem(itemId: string, count: number): boolean {
    const currentWeight = this.getWeight()
    const config = itemConfig[itemId]
    if (!config) return false
    
    const itemWeight = config.weight === 0 
      ? Math.ceil(count / 50) 
      : config.weight * count
    
    return currentWeight + itemWeight <= this.getMaxWeight()
  }
}

