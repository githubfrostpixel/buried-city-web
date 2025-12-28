import { Storage } from './Storage'
import { usePlayerStore } from '@/store/playerStore'
import { itemConfig } from '@/data/items'

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
    
    // +10 if storage has item 1305023
    if (playerStore.getStorageItemCount('1305023') > 0) {
      maxWeight += 10
    }
    // +20 if storage has item 1305024
    if (playerStore.getStorageItemCount('1305024') > 0) {
      maxWeight += 20
    }
    // +30 if storage has item 1305034
    if (playerStore.getStorageItemCount('1305034') > 0) {
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

