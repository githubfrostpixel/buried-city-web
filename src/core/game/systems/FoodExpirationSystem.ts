import { expireRate, fertilizerRate } from '@/core/data/items'
import { usePlayerStore } from '@/core/store/playerStore'
import { useBuildingStore } from '@/core/store/buildingStore'
import { Storage } from '@/core/game/inventory/Storage'

export class FoodExpirationSystem {
  /**
   * Process daily food expiration
   * Called by TimeManager on daily callbacks (1:05 AM)
   * @param hasFridge - Whether fridge building (ID 21) is active (optional, will check if not provided)
   */
  processDailyExpiration(hasFridge?: boolean): {
    lostItems: Array<{ itemId: string; num: number }>
    fertilizerHome: number
    fertilizerSite: number
  } {
    const lostItems: Array<{ itemId: string; num: number }> = []
    let fertilizerHome = 0
    let fertilizerSite = 0
    
    // Check fridge building if not provided
    if (hasFridge === undefined) {
      const buildingStore = useBuildingStore.getState()
      const fridge = buildingStore.getBuilding(21) // Fridge building ID
      hasFridge = fridge !== null && fridge.level >= 0 && fridge.active
    }
    
    // Process home storage (if no fridge)
    if (!hasFridge) {
      const homeStorage = this.createStorageFromPlayerStore('storage')
      const foodItems = homeStorage.getItemsByType('1103') // Food type prefix
      
      for (const foodItem of foodItems) {
        const expiredAmount = this.calculateExpired(foodItem.item.id, foodItem.num)
        if (expiredAmount > 0) {
          if (homeStorage.validateItem(foodItem.item.id, expiredAmount)) {
            homeStorage.removeItem(foodItem.item.id, expiredAmount)
            lostItems.push({ itemId: foodItem.item.id, num: expiredAmount })
            
            const fertilizerAmount = this.getFertilizerAmount(foodItem.item.id, expiredAmount)
            fertilizerHome += fertilizerAmount
            homeStorage.addItem('1101081', fertilizerAmount) // Fertilizer item ID
          }
        }
      }
      
      // Update player store with modified storage
      this.updatePlayerStoreStorage(homeStorage.items, 'storage')
    }
    
    // TODO: Process site storages when site system is implemented
    // For now, only process home storage
    
    return {
      lostItems,
      fertilizerHome,
      fertilizerSite
    }
  }
  
  /**
   * Calculate expired amount for a food item
   * Uses probabilistic rounding
   */
  calculateExpired(itemId: string, itemCount: number): number {
    const expire = expireRate[itemId]
    if (!expire) {
      return 0 // Not a food item or no expiration rate
    }
    
    let amount = expire * itemCount
    const floorValue = Math.floor(amount)
    const ceilValue = Math.ceil(amount)
    const probDown = 1 - (amount - floorValue)
    
    const random = Math.random()
    if (random <= probDown) {
      amount = floorValue
    } else {
      amount = ceilValue
    }
    
    return amount
  }
  
  /**
   * Check if item is food (type starts with "1103")
   */
  isFood(itemId: string): boolean {
    return itemId.startsWith('1103')
  }
  
  /**
   * Get expiration rate for item
   */
  getExpirationRate(itemId: string): number {
    return expireRate[itemId] || 0
  }
  
  /**
   * Get fertilizer amount for expired food
   */
  getFertilizerAmount(itemId: string, expiredAmount: number): number {
    const rate = fertilizerRate[itemId]
    if (!rate) {
      return 0
    }
    return rate * expiredAmount
  }
  
  /**
   * Get fertilizer conversion rate for item
   */
  getFertilizerRate(itemId: string): number {
    return fertilizerRate[itemId] || 0
  }
  
  /**
   * Helper: Create Storage instance from playerStore data
   */
  private createStorageFromPlayerStore(type: 'bag' | 'storage' | 'safe'): Storage {
    const playerStore = usePlayerStore.getState()
    const storage = new Storage(type, undefined)
    
    const items = type === 'bag' 
      ? playerStore.bag 
      : type === 'storage' 
        ? playerStore.storage 
        : playerStore.safe
    
    storage.restore(items)
    return storage
  }
  
  /**
   * Helper: Update playerStore with modified storage items
   */
  private updatePlayerStoreStorage(items: Record<string, number>, type: 'bag' | 'storage' | 'safe'): void {
    const playerStore = usePlayerStore.getState()
    
    if (type === 'bag') {
      // Update bag items
      Object.keys(playerStore.bag).forEach(itemId => {
        if (!items[itemId]) {
          playerStore.removeItemFromBag(itemId, playerStore.bag[itemId])
        }
      })
      Object.entries(items).forEach(([itemId, count]) => {
        const currentCount = playerStore.getBagItemCount(itemId)
        const diff = count - currentCount
        if (diff > 0) {
          playerStore.addItemToBag(itemId, diff)
        } else if (diff < 0) {
          playerStore.removeItemFromBag(itemId, -diff)
        }
      })
    } else if (type === 'storage') {
      // Update storage items
      Object.keys(playerStore.storage).forEach(itemId => {
        if (!items[itemId]) {
          playerStore.removeItemFromStorage(itemId, playerStore.storage[itemId])
        }
      })
      Object.entries(items).forEach(([itemId, count]) => {
        const currentCount = playerStore.getStorageItemCount(itemId)
        const diff = count - currentCount
        if (diff > 0) {
          playerStore.addItemToStorage(itemId, diff)
        } else if (diff < 0) {
          playerStore.removeItemFromStorage(itemId, -diff)
        }
      })
    } else {
      // Update safe items
      Object.keys(playerStore.safe).forEach(itemId => {
        if (!items[itemId]) {
          playerStore.removeItemFromSafe(itemId, playerStore.safe[itemId])
        }
      })
      Object.entries(items).forEach(([itemId, count]) => {
        const currentCount = playerStore.getSafeItemCount(itemId)
        const diff = count - currentCount
        if (diff > 0) {
          playerStore.addItemToSafe(itemId, diff)
        } else if (diff < 0) {
          playerStore.removeItemFromSafe(itemId, -diff)
        }
      })
    }
  }
}

