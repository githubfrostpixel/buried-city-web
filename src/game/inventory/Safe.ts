import { Storage } from './Storage'
import { itemConfig } from '@/data/items'

export class Safe extends Storage {
  constructor() {
    super('safe', 0) // Max weight calculated dynamically
  }
  
  /**
   * Check if safe is available (building 20 level >= 0)
   * TODO: Integrate with building system when available
   */
  isAvailable(): boolean {
    // TODO: Check building 20 level from buildingStore
    // For now, return true if safe has any items (placeholder)
    return Object.keys(this.items).length > 0
  }
  
  /**
   * Get max weight (50 if available, 0 otherwise)
   */
  getMaxWeight(): number {
    return this.isAvailable() ? 50 : 0
  }
  
  /**
   * Override canAddItem to use dynamic max weight
   */
  canAddItem(itemId: string, count: number): boolean {
    if (!this.isAvailable()) {
      return false
    }
    
    const currentWeight = this.getWeight()
    const config = itemConfig[itemId]
    if (!config) return false
    
    const itemWeight = config.weight === 0 
      ? Math.ceil(count / 50) 
      : config.weight * count
    
    return currentWeight + itemWeight <= 50
  }
}

