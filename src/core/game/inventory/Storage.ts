import { itemConfig } from '@/core/data/items'
import { Item } from './Item'

export class Storage {
  name: string
  private _items: Record<string, number> = {} // itemId -> count
  maxWeight: number | null // null = unlimited
  
  get items(): Record<string, number> {
    return this._items
  }
  
  set items(value: Record<string, number>) {
    this._items = value
  }
  
  constructor(name: string, maxWeight?: number) {
    this.name = name
    this._items = {}
    this.maxWeight = maxWeight ?? null
  }
  
  /**
   * Add item to storage
   * @param includeWater - If true, auto-consume water items to fill water attribute
   */
  addItem(itemId: string, count: number, includeWater?: boolean): boolean {
    const config = itemConfig[itemId]
    if (!config) return false
    
    // Water auto-consumption (only for player bag)
    if (includeWater && this.name === 'player') {
      // TODO: Integrate with playerStore to check waterMax and increment water
      // For now, skip water auto-consumption
    }
    
    // Check weight limit
    if (!this.canAddItem(itemId, count)) {
      return false
    }
    
    this.items[itemId] = (this.items[itemId] || 0) + count
    return true
  }
  
  /**
   * Remove item from storage
   */
  removeItem(itemId: string, count: number): boolean {
    const currentCount = this.items[itemId] || 0
    if (currentCount < count) {
      return false
    }
    
    const newCount = currentCount - count
    if (newCount === 0) {
      delete this.items[itemId]
    } else {
      this.items[itemId] = newCount
    }
    return true
  }
  
  /**
   * Get item count
   */
  getItemCount(itemId: string): number {
    return this.items[itemId] || 0
  }
  
  /**
   * Get total weight
   */
  getWeight(): number {
    let weight = 0
    Object.entries(this.items).forEach(([itemId, count]) => {
      const config = itemConfig[itemId]
      if (config) {
        if (config.weight === 0) {
          weight += Math.ceil(count / 50)
        } else {
          weight += config.weight * count
        }
      }
    })
    return weight
  }
  
  /**
   * Check if can add item (weight check)
   */
  canAddItem(itemId: string, count: number): boolean {
    if (this.maxWeight === null) {
      return true // Unlimited storage
    }
    
    const config = itemConfig[itemId]
    if (!config) return false
    
    const currentWeight = this.getWeight()
    const itemWeight = config.weight === 0 
      ? Math.ceil(count / 50) 
      : config.weight * count
    
    return currentWeight + itemWeight <= this.maxWeight
  }
  
  /**
   * Transfer item to another storage
   */
  transferItem(itemId: string, count: number, target: Storage): boolean {
    if (!this.removeItem(itemId, count)) {
      return false
    }
    
    if (!target.addItem(itemId, count)) {
      // Rollback if target can't accept
      this.addItem(itemId, count)
      return false
    }
    
    return true
  }

  /**
   * Transfer all items to another storage
   * @param target - Target storage to transfer items to
   * @param removeFromSource - If true, remove items from source after successful transfer. Default: true
   * @returns Object with transferred and failed counts
   */
  transferAll(target: Storage, removeFromSource: boolean = true): { transferred: number; failed: number } {
    let transferred = 0
    let failed = 0
    
    // Create a copy to avoid modification during iteration
    const itemsToTransfer = { ...this.items }
    
    Object.entries(itemsToTransfer).forEach(([itemId, count]) => {
      if (count > 0) {
        if (target.addItem(itemId, count)) {
          if (removeFromSource) {
            this.removeItem(itemId, count)
          }
          transferred++
        } else {
          // Target couldn't accept item (weight limit, invalid item, etc.)
          failed++
        }
      }
    })
    
    return { transferred, failed }
  }
  
  /**
   * Get random item for raids
   * Excludes: 1106013, 1305034, 1102073, 1301091, 1305075
   */
  getRandomItem(): { itemId: string; num: number } | null {
    const excludedItems = ['1106013', '1305034', '1102073', '1301091', '1305075']
    const availableItems = Object.keys(this.items).filter(
      itemId => !excludedItems.includes(itemId) && this.items[itemId] > 0
    )
    
    if (availableItems.length === 0) {
      return null
    }
    
    // Select random item
    const randomIndex = Math.floor(Math.random() * availableItems.length)
    const itemId = availableItems[randomIndex]
    const itemCount = this.items[itemId]
    
    // Calculate amount based on count and price
    let amount = itemCount
    if (itemCount > 10) {
      amount = Math.floor(Math.random() * (9 - 3 + 1)) + 3
    } else if (itemCount > 3) {
      amount = Math.floor(Math.random() * (itemCount - 2 - 1 + 1)) + 1
    }
    
    const item = new Item(itemId)
    const price = item.getPrice()
    
    // Special handling for bullets
    if (itemId === '1305011' || itemId === '1305012') {
      amount *= 2
      if (amount > itemCount) {
        amount = Math.max(1, itemCount - 4)
      }
    } else if (price >= 15) {
      // Reduce amount for expensive items
      if (price < 30) {
        amount = Math.ceil(amount / 3 * 2)
      } else if (price > 45) {
        amount = Math.ceil(amount / 4)
      } else {
        amount = Math.ceil(amount / 3)
      }
    }
    
    return {
      itemId,
      num: Math.min(amount, itemCount)
    }
  }
  
  /**
   * Get rob item for theft
   * Similar to getRandomItem but with different amount calculation
   */
  getRobItem(): { itemId: string; num: number } | null {
    const excludedItems = ['1106013', '1305034', '1102073', '1301091', '1305075']
    const availableItems = Object.keys(this.items).filter(
      itemId => !excludedItems.includes(itemId) && this.items[itemId] > 0
    )
    
    if (availableItems.length === 0) {
      return null
    }
    
    // TODO: Check if should return money instead (30% chance if player.currency > 10)
    // For now, always return item
    
    const randomIndex = Math.floor(Math.random() * availableItems.length)
    const itemId = availableItems[randomIndex]
    const itemCount = this.items[itemId]
    
    // Calculate amount
    let amount = itemCount
    if (itemCount > 10) {
      amount = Math.floor(Math.random() * (7 - 3 + 1)) + 3
    } else {
      amount = Math.floor(Math.random() * (itemCount - 4 - 1 + 1)) + 1
    }
    
    const item = new Item(itemId)
    const price = item.getPrice()
    
    // Special handling for bullets
    if (itemId === '1305011' || itemId === '1305012') {
      amount *= 2
      if (amount > itemCount) {
        amount = Math.max(1, itemCount - 4)
      }
    } else if (price >= 5) {
      // Reduce amount for expensive items
      if (price < 10) {
        amount = Math.ceil(amount / 2)
      } else if (price < 15) {
        amount = Math.ceil(amount / 3)
      } else if (price < 20) {
        amount = Math.ceil(amount / 4)
      } else {
        amount = Math.ceil(amount / 5)
      }
    }
    
    return {
      itemId,
      num: Math.min(amount, itemCount)
    }
  }
  
  /**
   * Check if storage is empty
   */
  isEmpty(): boolean {
    return Object.keys(this.items).length === 0
  }
  
  /**
   * Get total item count (sum of all item quantities)
   */
  getAllItemNum(): number {
    return Object.values(this.items).reduce((sum, count) => sum + count, 0)
  }
  
  /**
   * Increase item count (used by Site.increaseItem)
   */
  increaseItem(itemId: string, num: number, includeWater?: boolean): void {
    this.addItem(itemId, num, includeWater)
  }
  
  /**
   * Get all items by type prefix (e.g., "1103" for food)
   */
  getItemsByType(typePrefix: string): Array<{ item: Item; num: number }> {
    const result: Array<{ item: Item; num: number }> = []
    Object.entries(this.items).forEach(([itemId, count]) => {
      if (itemId.startsWith(typePrefix)) {
        result.push({
          item: new Item(itemId),
          num: count
        })
      }
    })
    return result
  }

  /**
   * Get items grouped by type prefixes
   * @param typeArray - Array of type prefixes to match (e.g., ["1101", "1103", "13", "other"])
   * @returns Object with type keys and arrays of {item: Item, num: number}
   * 
   * Items are matched by ID prefix. Items not matching any prefix go to "other".
   * The last element in typeArray should be "other" for catch-all.
   */
  getItemsByTypeGroup(typeArray: string[]): Record<string, Array<{item: Item, num: number}>> {
    const result: Record<string, Array<{item: Item, num: number}>> = {}
    
    // Initialize result object with empty arrays
    typeArray.forEach(key => {
      result[key] = []
    })
    
    // Group items by type prefix
    Object.entries(this.items).forEach(([itemId, count]) => {
      // Note: blackList.storageDisplay is empty in original, so no filtering needed
      const itemIdStr = String(itemId)
      let matched = false
      
      // Try to match against each type prefix (except "other")
      for (let i = 0; i < typeArray.length - 1; i++) {
        const type = typeArray[i]
        const len = type.length
        if (itemIdStr.substring(0, len) === type) {
          result[type].push({
            item: new Item(itemId),
            num: count
          })
          matched = true
          break
        }
      }
      
      // If no match, put in "other"
      if (!matched && typeArray.includes('other')) {
        result['other'].push({
          item: new Item(itemId),
          num: count
        })
      }
    })
    
    return result
  }
  
  /**
   * Validate item exists with sufficient count
   */
  validateItem(itemId: string, count: number): boolean {
    return (this.items[itemId] || 0) >= count
  }
  
  /**
   * Save state
   */
  save(): Record<string, number> {
    return { ...this.items }
  }
  
  /**
   * Restore state
   */
  restore(saveObj: Record<string, number>): void {
    this.items = { ...saveObj }
  }
}

