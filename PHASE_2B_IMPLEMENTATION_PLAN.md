# Phase 2B: Item & Storage System - Detailed Implementation Plan

## Overview

This document provides a detailed implementation plan for Phase 2B: Item & Storage System. This phase focuses on implementing the Item class, Storage classes (Bag, Safe, generic Storage), and Food Expiration System.

**Prerequisites**: 
- Phase 1 must be complete (TimeManager, SaveSystem, PlayerStore with inventory)
- `data/items.ts` exists with itemConfig, expireRate, fertilizerRate
- `types/item.types.ts` exists with ItemConfig interfaces
- `store/playerStore.ts` has basic inventory operations

---

## 1. Item Class Implementation

### 1.1 Requirements Analysis

From `OriginalGame/src/game/Item.js`:

**Item Class Features**:
- Item ID-based constructor
- Config access (weight, price, value)
- Type checking by parsing item ID string (7-digit format: `11XXYYZ`)
  - Level 0: First 2 digits = main category (11 = tool/equip, 13 = equipment, etc.)
  - Level 1: Next 2 digits = subcategory (01 = material, 03 = food, etc.)
- Effect access (food, medicine, weapon, armor, tool, buff)

**Item ID Format**:
- 7-digit string: `11XXYYZ`
- Example: `1103011` = Category 11, Subcategory 03 (food), Item 01, Level 1
- `getType(level)` extracts 2-digit type at position `level * 2`

### 1.2 Implementation Plan

**File**: `src/game/inventory/Item.ts`

**Item Class Structure**:

```typescript
import { itemConfig, type ItemConfig } from '@/data/items'
import type { 
  FoodEffect, 
  MedicineEffect, 
  WeaponEffect, 
  ArmorEffect, 
  ToolEffect, 
  BuffEffect 
} from '@/types/item.types'

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
```

**Implementation Steps**:

1. Create `src/game/inventory/Item.ts` file
2. Implement constructor with config validation
3. Implement `getPrice()`, `getValue()`, `getWeight()` methods
4. Implement `getType(level)` with string parsing
5. Implement `isType(type1, type2)` method
6. Implement all effect getter methods
7. Add error handling for missing configs
8. Test Item class with various item IDs
9. Test type parsing with different item categories

**Dependencies**:
- `data/items.ts` - itemConfig
- `types/item.types.ts` - Effect interfaces

**Testing Checklist**:
- [ ] Item constructor throws error for invalid ID
- [ ] Item constructor clones config correctly
- [ ] `getType(0)` returns main category correctly
- [ ] `getType(1)` returns subcategory correctly
- [ ] `isType()` works correctly for all item types
- [ ] All effect getters return correct values
- [ ] Effect getters return undefined for items without effects

---

## 2. ItemType Enum Extension

### 2.1 Requirements Analysis

From `OriginalGame/src/game/Item.js`:

**ItemType Constants**:
- Main categories: TOOL (11), EQUIP (13), MATERIAL (01), MODEL (02), FOOD (03), MEDICINE (04), ECONOMY (05), SPECIFIC (06), BUFF (07)
- Weapon subcategories: GUN (01), WEAPON (02), WEAPON_TOOL (03), DEFEND (04), OTHER (05)

### 2.2 Implementation Plan

**File**: `src/types/item.types.ts` (extend existing)

**Add ItemType Enum**:

```typescript
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
```

**Implementation Steps**:

1. Add ItemType enum to `src/types/item.types.ts`
2. Export enum for use in other files
3. Update Item class to optionally use enum values
4. Test enum values match original game constants

**Dependencies**:
- None (standalone enum)

**Testing Checklist**:
- [ ] Enum values match original game constants
- [ ] Enum can be imported and used in Item class
- [ ] Type checking works with enum values

---

## 3. Storage System Implementation

### 3.1 Requirements Analysis

From `OriginalGame/src/game/Storage.js`:

**Storage Class Features**:
- Generic storage container with name
- Item storage as `Record<itemId, count>`
- Weight calculation (handles weight=0 items: `Math.ceil(count / 50)`)
- Item add/remove operations
- Transfer operations between storages
- Random item selection (for raids) with complex logic
- Rob item selection (for theft) with complex logic
- Water auto-consumption (if includeWater flag)
- Save/load state

**Storage Types**:
- **Bag**: Player's carried inventory (weight limit: 40 base + bonuses from items 1305023, 1305024, 1305034)
- **Storage**: Home storage (unlimited weight)
- **Safe**: Protected storage (50 weight, requires building 20 level >= 0)

**Special Features**:
- `getRandomItem()`: Excludes certain items, calculates amount based on price and count
- `getRobItem()`: Similar to getRandomItem but with different amount calculation, can return money
- Water auto-consumption when adding water items (item 1101061)

### 3.2 Implementation Plan

**File**: `src/game/inventory/Storage.ts`

**Base Storage Class**:

```typescript
import { itemConfig } from '@/data/items'
import { Item } from './Item'

export class Storage {
  name: string
  items: Record<string, number> // itemId -> count
  maxWeight: number | null // null = unlimited
  
  constructor(name: string, maxWeight?: number) {
    this.name = name
    this.items = {}
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
```

**Implementation Steps**:

1. Create `src/game/inventory/Storage.ts` file
2. Implement base Storage class with constructor
3. Implement `addItem()` with weight checking
4. Implement `removeItem()` method
5. Implement `getItemCount()`, `getWeight()` methods
6. Implement `canAddItem()` weight validation
7. Implement `transferItem()` method
8. Implement `getRandomItem()` with complex logic
9. Implement `getRobItem()` with complex logic
10. Implement helper methods (`isEmpty()`, `getItemsByType()`, `validateItem()`)
11. Implement `save()` and `restore()` methods
12. Test all storage operations
13. Test weight limits
14. Test transfer operations
15. Test random/rob item selection

**Dependencies**:
- `data/items.ts` - itemConfig for weight
- `game/inventory/Item.ts` - Item class

**Testing Checklist**:
- [ ] Storage add/remove operations work correctly
- [ ] Weight calculation handles weight=0 items correctly
- [ ] Weight limits enforced for limited storage
- [ ] Unlimited storage (maxWeight=null) accepts all items
- [ ] Transfer between storages works
- [ ] Transfer rollback works if target can't accept
- [ ] Random item selection excludes correct items
- [ ] Random item amount calculation works correctly
- [ ] Rob item selection works correctly
- [ ] `getItemsByType()` filters correctly
- [ ] `validateItem()` works correctly
- [ ] Save/load state works correctly

---

## 4. Bag Class Implementation

### 4.1 Requirements Analysis

From `OriginalGame/src/game/Storage.js` and `playerStore.ts`:

**Bag Features**:
- Extends Storage
- Base weight: 40
- Bonuses from storage items:
  - Item 1305023: +10 weight
  - Item 1305024: +20 weight
  - Item 1305034: +30 weight
- Max weight = 40 + sum of bonuses

### 4.2 Implementation Plan

**File**: `src/game/inventory/Bag.ts`

**Bag Class**:

```typescript
import { Storage } from './Storage'
import { usePlayerStore } from '@/store/playerStore'

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
```

**Implementation Steps**:

1. Create `src/game/inventory/Bag.ts` file
2. Extend Storage class
3. Implement `getMaxWeight()` with bonus calculation
4. Override `canAddItem()` to use dynamic max weight
5. Test bag weight limits with bonuses
6. Test bag weight calculation

**Dependencies**:
- `game/inventory/Storage.ts` - Base Storage class
- `store/playerStore.ts` - For storage item checks

**Testing Checklist**:
- [ ] Bag base weight is 40
- [ ] Bag weight increases with storage bonuses
- [ ] Bag weight limit enforced correctly
- [ ] `canAddItem()` uses dynamic max weight

---

## 5. Safe Class Implementation

### 5.1 Requirements Analysis

From `OriginalGame/src/game/Storage.js` and `playerStore.ts`:

**Safe Features**:
- Extends Storage
- Max weight: 50 (if available)
- Availability: Requires building 20 (Safe) level >= 0
- If not available, max weight = 0

### 5.2 Implementation Plan

**File**: `src/game/inventory/Safe.ts`

**Safe Class**:

```typescript
import { Storage } from './Storage'

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
```

**Implementation Steps**:

1. Create `src/game/inventory/Safe.ts` file
2. Extend Storage class
3. Implement `isAvailable()` method (placeholder for building check)
4. Implement `getMaxWeight()` method
5. Override `canAddItem()` to check availability
6. Test safe availability check
7. Test safe weight limits
8. TODO: Integrate with building system when Phase 2C is complete

**Dependencies**:
- `game/inventory/Storage.ts` - Base Storage class
- Building system (for availability check - Phase 2C)

**Testing Checklist**:
- [ ] Safe max weight is 50 when available
- [ ] Safe max weight is 0 when not available
- [ ] Safe can't add items when not available
- [ ] Safe weight limit enforced correctly

---

## 6. Food Expiration System Implementation

### 6.1 Requirements Analysis

From `OriginalGame/src/game/player.js`:

**Food Expiration Features**:
- Daily expiration check at 1:05 AM
- Food items expire based on `expireRate` (probability per item per day)
- Fridge building (ID 21) prevents expiration in home storage
- Expired food converts to fertilizer (item 1101081) based on `fertilizerRate`
- Process both home storage and site storages
- Show dialog with lost items and fertilizer amounts

**Expiration Calculation**:
- `amount = expireRate[itemId] * itemCount`
- Use probabilistic rounding (floor vs ceil based on decimal part)
- Example: If expireRate = 0.003 and count = 100, amount = 0.3
  - floorValue = 0, ceilValue = 1
  - probDown = 0.7, probUp = 0.3
  - Random determines floor or ceil

**Fertilizer Conversion**:
- `fertilizerAmount = fertilizerRate[itemId] * expiredAmount`
- Add fertilizer to same storage where food expired

### 6.2 Implementation Plan

**File**: `src/game/systems/FoodExpirationSystem.ts`

**Food Expiration System**:

```typescript
import { expireRate, fertilizerRate, itemConfig } from '@/data/items'
import { usePlayerStore } from '@/store/playerStore'
import { Item } from '@/game/inventory/Item'
import { Storage } from '@/game/inventory/Storage'

export class FoodExpirationSystem {
  /**
   * Process daily food expiration
   * Called by TimeManager on daily callbacks (1:05 AM)
   * @param hasFridge - Whether fridge building (ID 21) is active
   */
  processDailyExpiration(hasFridge: boolean = false): {
    lostItems: Array<{ itemId: string; num: number }>
    fertilizerHome: number
    fertilizerSite: number
  } {
    const playerStore = usePlayerStore.getState()
    const lostItems: Array<{ itemId: string; num: number }> = []
    let fertilizerHome = 0
    let fertilizerSite = 0
    
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
    const probUp = 1 - probDown
    
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
    const storage = new Storage(type, null)
    
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
```

**Integration with TimeManager**:

**File**: `src/game/Game.ts` (or appropriate initialization file)

Add food expiration callback:

```typescript
import { TimeManager } from './systems/TimeManager'
import { FoodExpirationSystem } from './systems/FoodExpirationSystem'

// In game initialization
const timeManager = TimeManager.getInstance()
const foodExpirationSystem = new FoodExpirationSystem()

// Add daily callback at 1:05 AM
timeManager.addTimerCallbackDayByDayOneAM(foodExpirationSystem, () => {
  // TODO: Check if fridge building (ID 21) is active
  const hasFridge = false // Placeholder - integrate with building system
  
  const result = foodExpirationSystem.processDailyExpiration(hasFridge)
  
  if (result.lostItems.length > 0 || result.fertilizerHome > 0 || result.fertilizerSite > 0) {
    // TODO: Show food expiration dialog
    // TODO: Save game state
    console.log('Food expired:', result)
  }
})
```

**Implementation Steps**:

1. Create `src/game/systems/FoodExpirationSystem.ts` file
2. Implement `processDailyExpiration()` method
3. Implement `calculateExpired()` with probabilistic rounding
4. Implement `isFood()`, `getExpirationRate()`, `getFertilizerRate()` methods
5. Implement helper methods for playerStore integration
6. Integrate with TimeManager daily callback (1:05 AM)
7. Add fridge building check (placeholder for Phase 2C)
8. Test food expiration calculation
9. Test fertilizer conversion
10. Test with various food items and counts
11. Test probabilistic rounding
12. TODO: Add food expiration dialog UI (Phase 2D or later)
13. TODO: Integrate with site storage system (Phase 3 or later)

**Dependencies**:
- `data/items.ts` - expireRate, fertilizerRate
- `store/playerStore.ts` - For storage access
- `game/inventory/Item.ts` - Item class
- `game/inventory/Storage.ts` - Storage class
- `game/systems/TimeManager.ts` - For daily callbacks
- Building system (for fridge check - Phase 2C)

**Testing Checklist**:
- [ ] Food expiration calculates correctly with probabilistic rounding
- [ ] Expiration rate lookup works for all food items
- [ ] Fertilizer conversion calculates correctly
- [ ] Fridge prevents home storage expiration
- [ ] Expired food removed from storage
- [ ] Fertilizer added to storage
- [ ] Lost items tracked correctly
- [ ] Daily callback triggers at 1:05 AM
- [ ] PlayerStore updated correctly after expiration

---

## 7. Integration Points

### 7.1 PlayerStore Integration

**Current State**: `playerStore.ts` has basic inventory operations but doesn't use Storage classes.

**Options**:
1. **Keep current implementation**: Use Storage classes only for complex operations (random/rob items, transfers)
2. **Refactor to use Storage classes**: Replace Record<string, number> with Storage instances

**Recommendation**: Keep current implementation for Phase 2B. Storage classes can be used alongside playerStore for:
- Complex operations (getRandomItem, getRobItem)
- Transfer operations
- Food expiration processing

Future refactoring can be done if needed.

### 7.2 Export Structure

**File**: `src/game/inventory/index.ts`

```typescript
export { Item } from './Item'
export { Storage } from './Storage'
export { Bag } from './Bag'
export { Safe } from './Safe'
```

**File**: `src/game/systems/index.ts` (extend existing)

```typescript
// ... existing exports ...
export { FoodExpirationSystem } from './FoodExpirationSystem'
```

---

## 8. Implementation Order

### Phase 2B.1: Item Class (Priority: High)
1. Create Item class
2. Extend item.types.ts with ItemType enum
3. Test Item class

### Phase 2B.2: Storage Classes (Priority: High)
4. Create base Storage class
5. Create Bag class
6. Create Safe class
7. Test all storage operations

### Phase 2B.3: Food Expiration (Priority: Medium)
8. Create FoodExpirationSystem
9. Integrate with TimeManager
10. Test food expiration mechanics

### Phase 2B.4: Integration & Testing (Priority: Medium)
11. Export all classes
12. Integration testing
13. Update documentation

---

## 9. Dependencies & Blockers

### Blockers
- **Building System**: Fridge check requires building system (Phase 2C)
  - **Solution**: Use placeholder boolean for now, integrate in Phase 2C
- **Site Storage System**: Food expiration for sites requires site system (Phase 3)
  - **Solution**: Only implement home storage expiration for now

### Dependencies
- `data/items.ts` - Already exists ✓
- `types/item.types.ts` - Already exists ✓
- `store/playerStore.ts` - Already exists ✓
- `game/systems/TimeManager.ts` - Already exists ✓
- Building system - Phase 2C (placeholder for now)
- Site system - Phase 3 (defer site storage expiration)

---

## 10. Testing Strategy

### Unit Tests
- Item class methods
- Storage operations (add, remove, weight calculation)
- Bag max weight calculation
- Safe availability check
- Food expiration calculation
- Fertilizer conversion

### Integration Tests
- Storage transfer operations
- Random/rob item selection
- Food expiration with TimeManager
- PlayerStore integration

### Manual Testing
- Create items and verify properties
- Add/remove items from storage
- Test weight limits
- Test food expiration over multiple days
- Verify fertilizer conversion

---

## 11. Estimated Time

- Item Class: 2-3 hours
- ItemType Enum: 0.5 hours
- Storage Classes: 4-5 hours
- Bag Class: 1 hour
- Safe Class: 1 hour
- Food Expiration System: 3-4 hours
- Integration & Testing: 2-3 hours

**Total: ~13-18 hours**

---

## 12. Next Steps

1. Review and approve this plan
2. Switch to ACT mode
3. Implement in order: Phase 2B.1 → Phase 2B.2 → Phase 2B.3 → Phase 2B.4
4. Test each component as implemented
5. Update PHASE_2_IMPLEMENTATION_PLAN.md with completion status

---

## 13. Notes

1. **Water Auto-Consumption**: Storage.addItem() has placeholder for water auto-consumption. This can be implemented later when needed, or integrated directly with playerStore.

2. **Random/Rob Item Logic**: The logic for getRandomItem() and getRobItem() is complex and matches the original game. Test thoroughly with various item counts and prices.

3. **Storage Refactoring**: Current playerStore implementation is functional. Storage classes provide additional functionality without requiring a full refactor.

4. **Fridge Check**: Placeholder boolean for now. Will integrate with building system in Phase 2C.

5. **Site Storage**: Food expiration for site storages deferred to Phase 3 when site system is implemented.

6. **Food Expiration Dialog**: UI for showing expired food dialog deferred to Phase 2D or later.

