import { create } from 'zustand'
import type { PlayerState, PlayerAttributes } from '@/types/player.types'
import type { BuildingCost } from '@/types/building.types'
import type { FoodEffect, MedicineEffect, BuffEffect } from '@/types/item.types'
import { itemConfig } from '@/data/items'
import { Item } from '@/game/inventory/Item'
import { Storage } from '@/game/inventory/Storage'
import { Map } from '@/game/world/Map'
import { game } from '@/game/Game'
import { useBuildingStore } from '@/store/buildingStore'
import { checkDeathOnAttributeChange, handleDeath } from '@/utils/deathCheck'

interface PlayerStore extends PlayerState {
  // Location state
  isAtHome: boolean
  isAtBazaar: boolean
  isAtSite: boolean
  nowSiteId: number | null
  
  // Game state
  currency: number
  totalDistance: number
  leftHomeTime: number | null
  
  // Settings
  setting: {
    sound: boolean
    music: boolean
    [key: string]: any
  }
  
  // Inventory
  bag: Record<string, number> // itemId -> count
  storage: Record<string, number> // itemId -> count
  safe: Record<string, number> // itemId -> count
  
  // Equipment (5 slots)
  equipment: {
    gun: string | null // EquipmentPos.GUN = 0
    weapon: string | null // EquipmentPos.WEAPON = 1
    equip: string | null // EquipmentPos.EQUIP = 2
    tool: string | null // EquipmentPos.TOOL = 3
    special: string | null // EquipmentPos.SPECIAL = 4
  }
  
  // Dog state
  dog: {
    hunger: number
    hungerMax: number
    mood: number
    moodMax: number
    injury: number
    injuryMax: number
    active: boolean
  }
  
  // Map state
  map: Map | null
  
  // Medicine treatment state
  cured: boolean
  binded: boolean
  cureTime: number | null
  bindTime: number | null
  
  // Actions
  updateAttribute: (attr: keyof PlayerAttributes, value: number) => void
  setCurrency: (amount: number) => void
  addCurrency: (amount: number) => void
  setLocation: (location: { isAtHome?: boolean; isAtBazaar?: boolean; isAtSite?: boolean; siteId?: number | null }) => void
  setSetting: (key: string, value: any) => void
  
  // Inventory actions
  addItemToBag: (itemId: string, count: number) => boolean
  removeItemFromBag: (itemId: string, count: number) => boolean
  getBagItemCount: (itemId: string) => number
  getBagWeight: () => number
  getBagMaxWeight: () => number
  
  addItemToStorage: (itemId: string, count: number) => void
  removeItemFromStorage: (itemId: string, count: number) => void
  getStorageItemCount: (itemId: string) => number
  
  addItemToSafe: (itemId: string, count: number) => boolean
  removeItemFromSafe: (itemId: string, count: number) => void
  getSafeItemCount: (itemId: string) => number
  getSafeWeight: () => number
  getSafeMaxWeight: () => number
  
  // Equipment actions
  equipItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special', itemId: string | null) => boolean
  unequipItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special') => void
  getEquippedItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special') => string | null
  isEquipped: (itemId: string) => boolean
  
  // Dog actions
  updateDogHunger: (value: number) => void
  updateDogMood: (value: number) => void
  updateDogInjury: (value: number) => void
  setDogActive: (active: boolean) => void
  
  // Map actions
  initializeMap: () => void
  getMap: () => Map
  
  // Item use actions
  useItem: (storage: Storage, itemId: string) => {result: boolean, type?: number, msg?: string}
  cure: () => void
  bindUp: () => void
  isAttrMax: (attr: keyof PlayerAttributes) => boolean
  isAttrChangeGood: (attr: keyof PlayerAttributes, changeValue: number) => boolean
  applyEffect: (effectObj: Record<string, number>) => Array<{attrName: string, changeValue: number}>
  itemEffect: (item: Item, effectObj: FoodEffect | MedicineEffect | BuffEffect | undefined) => void
  item1104032Effect: (item: Item, effectObj: MedicineEffect | undefined) => boolean
}

const initialAttributes: PlayerAttributes = {
  hp: 100,
  hpMax: 100,
  spirit: 50,
  spiritMax: 100,
  starve: 50,
  starveMax: 100,
  vigour: 50,
  vigourMax: 100,
  injury: 0,
  injuryMax: 100,
  infect: 0,
  infectMax: 100,
  water: 50,
  waterMax: 100,
  virus: 0,
  virusMax: 100,
  temperature: 20,
  temperatureMax: 100
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // Player attributes
  ...initialAttributes,
  
  // Player stats
  level: 1,
  exp: 0,
  expMax: 100,
  money: 0,
  talent: [],
  
  // Location
  isAtHome: true,
  isAtBazaar: false,
  isAtSite: false,
  nowSiteId: null,
  
  // Game state
  currency: 0,
  totalDistance: 0,
  leftHomeTime: null,
  
  // Settings
  setting: {
    sound: true,
    music: true
  },
  
  // Inventory
  bag: {},
  storage: {},
  safe: {},
  
  // Equipment
  equipment: {
    gun: null,
    weapon: null, // Default to hand (null means hand)
    equip: null,
    tool: null,
    special: null
  },
  
  // Dog state
  dog: {
    hunger: 50,
    hungerMax: 100,
    mood: 50,
    moodMax: 100,
    injury: 0,
    injuryMax: 100,
    active: false
  },
  
  // Map state
  map: null,
  
  // Medicine treatment state
  cured: false,
  binded: false,
  cureTime: null,
  bindTime: null,
  
  // Actions
  updateAttribute: (attr: keyof PlayerAttributes, value: number) => {
    const state = get()
    const maxAttr = `${attr}Max` as keyof PlayerAttributes
    const maxValue = state[maxAttr] as number || 100
    
    // Clamp value to valid range (matching original: cc.clampf)
    let newValue: number
    if (attr === 'temperature') {
      newValue = Math.max(-2, Math.min(value, maxValue))
    } else {
      newValue = Math.max(0, Math.min(value, maxValue))
    }
    
    // Round value (matching original: Math.round)
    newValue = Math.round(newValue)
    
    // Update attribute
    set({ [attr]: newValue } as Partial<PlayerStore>)
    
    // Check for death immediately after attribute change (matching original game)
    // Original: OriginalGame/src/game/player.js:673-683
    const deathReason = checkDeathOnAttributeChange(attr, newValue)
    
    if (deathReason) {
      // Special handling for virus death: set HP to 0 first, then die
      // Original: this.log.addMsg(stringUtil.getString(6671)); this.changeAttr("hp", -this["hp"]);
      if (deathReason === 'virus_overload') {
        // Log message (TODO: Use string system - message 6671)
        console.log('Virus overload!')
        
        // Set HP to 0 using updateAttribute (this will trigger death check automatically)
        // This matches original: this.changeAttr("hp", -this["hp"])
        // The HP change will trigger death check, so we don't call handleDeath here
        get().updateAttribute('hp', 0)
      } else {
        // HP death or infection death
        handleDeath(deathReason)
      }
    }
  },
  
  setCurrency: (amount: number) => set({ currency: amount, money: amount }),
  
  addCurrency: (amount: number) => set((state: PlayerStore) => {
    const newAmount = state.currency + amount
    return { currency: newAmount, money: newAmount }
  }),
  
  setLocation: (location: { isAtHome?: boolean; isAtBazaar?: boolean; isAtSite?: boolean; siteId?: number | null }) => set({
    isAtHome: location.isAtHome ?? false,
    isAtBazaar: location.isAtBazaar ?? false,
    isAtSite: location.isAtSite ?? false,
    nowSiteId: location.siteId ?? null
  }),
  
  setSetting: (key: string, value: any) => set((state: PlayerStore) => ({
    setting: {
      ...state.setting,
      [key]: value
    }
  })),
  
  // Inventory actions - Bag
  addItemToBag: (itemId: string, count: number) => {
    const state = get()
    const config = itemConfig[itemId]
    if (!config) return false
    
    // Calculate weight
    const currentWeight = state.getBagWeight()
    const itemWeight = config.weight === 0 ? Math.ceil(count / 50) : config.weight * count
    const maxWeight = state.getBagMaxWeight()
    
    if (currentWeight + itemWeight > maxWeight) {
      return false
    }
    
    set((state) => ({
      bag: {
        ...state.bag,
        [itemId]: (state.bag[itemId] || 0) + count
      }
    }))
    return true
  },
  
  removeItemFromBag: (itemId: string, count: number) => {
    const state = get()
    const currentCount = state.bag[itemId] || 0
    if (currentCount < count) {
      return false
    }
    
    set((state) => {
      const newCount = Math.max(0, currentCount - count)
      
      const newBag = { ...state.bag }
      if (newCount === 0) {
        delete newBag[itemId]
        // Auto-unequip if item was equipped
        if (state.isEquipped(itemId)) {
          const slots: Array<'gun' | 'weapon' | 'equip' | 'tool' | 'special'> = ['gun', 'weapon', 'equip', 'tool', 'special']
          for (const slot of slots) {
            if (state.equipment[slot] === itemId) {
              state.unequipItem(slot)
              break
            }
          }
        }
      } else {
        newBag[itemId] = newCount
      }
      
      return { bag: newBag }
    })
    return true
  },
  
  getBagItemCount: (itemId: string) => {
    return get().bag[itemId] || 0
  },
  
  getBagWeight: () => {
    const state = get()
    let weight = 0
    Object.entries(state.bag).forEach(([itemId, count]) => {
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
  },
  
  getBagMaxWeight: () => {
    const state = get()
    let maxWeight = 40 // Base weight
    
    // +10 if storage has item 1305023
    if (state.getStorageItemCount('1305023') > 0) {
      maxWeight += 10
    }
    // +20 if storage has item 1305024
    if (state.getStorageItemCount('1305024') > 0) {
      maxWeight += 20
    }
    // +30 if storage has item 1305034
    if (state.getStorageItemCount('1305034') > 0) {
      maxWeight += 30
    }
    // +30 if IAP big bag unlocked (skip for now)
    
    return maxWeight
  },
  
  // Inventory actions - Storage
  addItemToStorage: (itemId: string, count: number): void => {
    set((state) => ({
      storage: {
        ...state.storage,
        [itemId]: (state.storage[itemId] || 0) + count
      }
    }))
  },
  
  removeItemFromStorage: (itemId: string, count: number) => {
    set((state) => {
      const currentCount = state.storage[itemId] || 0
      const newCount = Math.max(0, currentCount - count)
      
      const newStorage = { ...state.storage }
      if (newCount === 0) {
        delete newStorage[itemId]
      } else {
        newStorage[itemId] = newCount
      }
      
      return { storage: newStorage }
    })
  },
  
  getStorageItemCount: (itemId: string) => {
    return get().storage[itemId] || 0
  },
  
  // Inventory actions - Safe
  addItemToSafe: (itemId: string, count: number) => {
    const state = get()
    const config = itemConfig[itemId]
    if (!config) return false
    
    // Check if safe is available (building 20 level >= 0)
    // For now, assume safe is available if we have any safe items or building exists
    const maxWeight = state.getSafeMaxWeight()
    if (maxWeight === 0) return false
    
    // Calculate weight
    const currentWeight = state.getSafeWeight()
    const itemWeight = config.weight === 0 ? Math.ceil(count / 50) : config.weight * count
    
    if (currentWeight + itemWeight > maxWeight) {
      return false
    }
    
    set((state) => ({
      safe: {
        ...state.safe,
        [itemId]: (state.safe[itemId] || 0) + count
      }
    }))
    return true
  },
  
  removeItemFromSafe: (itemId: string, count: number) => {
    set((state) => {
      const currentCount = state.safe[itemId] || 0
      const newCount = Math.max(0, currentCount - count)
      
      const newSafe = { ...state.safe }
      if (newCount === 0) {
        delete newSafe[itemId]
      } else {
        newSafe[itemId] = newCount
      }
      
      return { safe: newSafe }
    })
  },
  
  getSafeItemCount: (itemId: string) => {
    return get().safe[itemId] || 0
  },
  
  getSafeWeight: () => {
    const state = get()
    let weight = 0
    Object.entries(state.safe).forEach(([itemId, count]) => {
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
  },
  
  getSafeMaxWeight: () => {
    // Check building 20 level >= 0
    try {
      const buildingStore = useBuildingStore.getState()
      const safe = buildingStore.getBuilding(20) // Safe building ID
      if (safe && safe.level >= 0 && safe.active) {
        return 50
      }
    } catch {
      // Building store not initialized yet
    }
    return 0
  },
  
  // Equipment actions
  equipItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special', itemId: string | null) => {
    const state = get()
    
    // If equipping an item, it must be in bag
    if (itemId !== null) {
      if (state.getBagItemCount(itemId) < 1) {
        return false
      }
    }
    
    set((state) => ({
      equipment: {
        ...state.equipment,
        [slot]: itemId
      }
    }))
    return true
  },
  
  unequipItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special') => {
    set((state) => {
      const newEquipment = { ...state.equipment }
      if (slot === 'weapon') {
        // Weapon defaults to hand (null)
        newEquipment[slot] = null
      } else {
        newEquipment[slot] = null
      }
      return { equipment: newEquipment }
    })
  },
  
  getEquippedItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special') => {
    return get().equipment[slot]
  },
  
  isEquipped: (itemId: string) => {
    const state = get()
    return (
      state.equipment.gun === itemId ||
      state.equipment.weapon === itemId ||
      state.equipment.equip === itemId ||
      state.equipment.tool === itemId ||
      state.equipment.special === itemId
    )
  },
  
  // Dog actions
  updateDogHunger: (value: number) => {
    set((state) => ({
      dog: {
        ...state.dog,
        hunger: Math.max(0, Math.min(value, state.dog.hungerMax))
      }
    }))
  },
  
  updateDogMood: (value: number) => {
    set((state) => ({
      dog: {
        ...state.dog,
        mood: Math.max(0, Math.min(value, state.dog.moodMax))
      }
    }))
  },
  
  updateDogInjury: (value: number) => {
    set((state) => ({
      dog: {
        ...state.dog,
        injury: Math.max(0, Math.min(value, state.dog.injuryMax))
      }
    }))
  },
  
  setDogActive: (active: boolean) => {
    set((state) => ({
      dog: {
        ...state.dog,
        active
      }
    }))
  },
  
  // Map actions
  initializeMap: () => {
    const map = new Map()
    map.init()
    set({ map })
  },
  
  getMap: () => {
    const { map } = get()
    if (!map) {
      throw new Error('Map not initialized. Call initializeMap() first.')
    }
    return map
  },
  
  // Building cost validation
  validateItems: (cost: BuildingCost[]) => {
    const state = get()
    
    // Check if all required items are available in bag or storage
    for (const costItem of cost) {
      const itemId = String(costItem.itemId) // Convert to string for lookup
      const requiredCount = costItem.num
      
      // Check bag and storage combined
      const bagCount = state.getBagItemCount(itemId)
      const storageCount = state.getStorageItemCount(itemId)
      const totalCount = bagCount + storageCount
      
      if (totalCount < requiredCount) {
        return false
      }
    }
    
    return true
  },
  
  costItems: (cost: BuildingCost[]) => {
    const state = get()
    
    // Remove items from inventory (bag first, then storage)
    for (const costItem of cost) {
      const itemId = String(costItem.itemId) // Convert to string for lookup
      let remaining = costItem.num
      
      // Try to remove from bag first
      const bagCount = state.getBagItemCount(itemId)
      if (bagCount > 0) {
        const removeFromBag = Math.min(bagCount, remaining)
        state.removeItemFromBag(itemId, removeFromBag)
        remaining -= removeFromBag
      }
      
      // Remove remaining from storage if needed
      if (remaining > 0) {
        state.removeItemFromStorage(itemId, remaining)
      }
    }
  },
  
  // Item use actions
  isAttrMax: (attr: keyof PlayerAttributes) => {
    const state = get()
    const maxAttr = `${attr}Max` as keyof PlayerAttributes
    return state[attr] >= (state[maxAttr] as number || 100)
  },
  
  isAttrChangeGood: (attr: keyof PlayerAttributes, changeValue: number) => {
    // Positive change is good for most attributes
    // Exception: infect, virus, injury - negative change is good
    if (attr === 'infect' || attr === 'virus' || attr === 'injury') {
      return changeValue <= 0
    }
    return changeValue >= 0
  },
  
  cure: () => {
    const timeManager = game.getTimeManager()
    set({
      cured: true,
      cureTime: timeManager.now()
    })
  },
  
  bindUp: () => {
    const timeManager = game.getTimeManager()
    set({
      binded: true,
      bindTime: timeManager.now()
    })
  },
  
  // Apply effect to player attributes
  applyEffect: (effectObj: Record<string, number>) => {
    const state = get()
    const badEffects: Array<{attrName: string, changeValue: number}> = []
    
    for (const key in effectObj) {
      if (state.hasOwnProperty(key) && key !== 'id') {
        const chanceKey = `${key}_chance`
        const chance = effectObj[chanceKey]
        const value = effectObj[key]
        
        // Apply effect if chance check passes (or no chance specified)
        if (chance === undefined || Math.random() <= chance) {
          const attr = key as keyof PlayerAttributes
          const currentValue = state[attr] as number
          const maxAttr = `${attr}Max` as keyof PlayerAttributes
          const maxValue = state[maxAttr] as number || 100
          const newValue = Math.max(0, Math.min(currentValue + value, maxValue))
          state.updateAttribute(attr, newValue)
          
          // Track bad effects
          if (!state.isAttrChangeGood(attr, value)) {
            badEffects.push({ attrName: key, changeValue: value })
          }
        }
      }
    }
    
    return badEffects
  },
  
  // Apply item effect and log bad effects
  itemEffect: (item: Item, effectObj: FoodEffect | MedicineEffect | BuffEffect | undefined) => {
    if (!effectObj) return
    
    const state = get()
    const badEffects = state.applyEffect(effectObj as Record<string, number>)
    
    if (badEffects.length > 0) {
      // TODO: Log warning message (string ID 1107)
      // For now, just log to console
      const effectStr = badEffects.map((e: {attrName: string, changeValue: number}) => `${e.attrName}: ${e.changeValue}`).join(' ')
      console.warn(`Item ${item.id} had negative effects: ${effectStr}`)
    }
  },
  
  // Special effect for Homemade Penicillin (1104032)
  item1104032Effect: (item: Item, effectObj: MedicineEffect | undefined) => {
    if (!effectObj) return false
    
    const state = get()
    const hpChance = effectObj.hp_chance || 0
    
    if (Math.random() <= hpChance) {
      // Apply HP damage
      // Original: this.changeHp(obj.hp) where obj.hp is -150
      const hpChange = effectObj.hp || 0  // This is -150 (negative)
      const currentHp = state.hp
      const newHp = currentHp + hpChange  // e.g., 100 + (-150) = -50
      
      // Update HP (will clamp to 0 and trigger death check)
      state.updateAttribute('hp', newHp)
      return false // No cure
    } else {
      // Apply other effects (excluding hp)
      const newObj: Record<string, number> = {}
      for (const key in effectObj) {
        if (key !== 'hp' && key !== 'hp_chance' && key !== 'id') {
          newObj[key] = effectObj[key as keyof MedicineEffect] as number
        }
      }
      state.itemEffect(item, newObj as MedicineEffect)
      return true // Can cure
    }
  },
  
  // Main item use function
  useItem: (storage: Storage, itemId: string) => {
    const state = get()
    
    // Validate item exists and count >= 1
    if (!storage.validateItem(itemId, 1)) {
      return { result: false, type: 1, msg: 'not enough' }
    }
    
    const item = new Item(itemId)
    const itemName = `Item ${itemId}` // TODO: Get from string system
    
    // Get time manager
    const timeManager = game.getTimeManager()
    
    // Handle by item type
    if (item.isType('11', '03')) {
      // Food items
      // Check starve max (handled by checkStarve utility before calling useItem)
      // Update time: 600 seconds = 10 minutes
      timeManager.updateTime(600)
      
      // Decrease item
      storage.removeItem(itemId, 1)
      
      // Update storage in playerStore if it's player storage
      if (storage.name === 'player') {
        const storageState = storage.save()
        set({ storage: storageState })
      }
      
      // Log message (TODO: Use string system - message 1093)
      const remainingCount = storage.getItemCount(itemId)
      console.log(`Consumed ${itemName}, remaining: ${remainingCount}`)
      
      // Apply effect
      state.itemEffect(item, item.getFoodEffect())
      
      return { result: true }
    } else if (item.isType('11', '04')) {
      // Medicine items
      // Update time: 600 seconds = 10 minutes
      timeManager.updateTime(600)
      
      // Special case for bandage (1104011)
      if (itemId === '1104011') {
        storage.removeItem(itemId, 1)
        
        if (storage.name === 'player') {
          const storageState = storage.save()
          set({ storage: storageState })
        }
        
        // Log message (TODO: Use string system - message 1094)
        const remainingCount = storage.getItemCount(itemId)
        console.log(`Used ${itemName}, remaining: ${remainingCount}`)
        
        // Apply effect and bind up
        state.itemEffect(item, item.getMedicineEffect())
        state.bindUp()
      } else {
        // Other medicines
        storage.removeItem(itemId, 1)
        
        if (storage.name === 'player') {
          const storageState = storage.save()
          set({ storage: storageState })
        }
        
        // Log message (TODO: Use string system - message 1095)
        const remainingCount = storage.getItemCount(itemId)
        console.log(`Used ${itemName}, remaining: ${remainingCount}`)
        
        // Special case for Homemade Penicillin (1104032)
        if (itemId === '1104032') {
          const canCure = state.item1104032Effect(item, item.getMedicineEffect())
          if (canCure) {
            state.cure()
          }
        } else {
          // Other medicines: apply effect and cure
          state.itemEffect(item, item.getMedicineEffect())
          state.cure()
        }
      }
      
      return { result: true }
    } else if (item.isType('11', '07')) {
      // Buff items
      // Update time: 600 seconds = 10 minutes
      timeManager.updateTime(600)
      
      // Decrease item
      storage.removeItem(itemId, 1)
      
      if (storage.name === 'player') {
        const storageState = storage.save()
        set({ storage: storageState })
      }
      
      // Log message (TODO: Use string system - message 1095)
      const remainingCount = storage.getItemCount(itemId)
      console.log(`Used ${itemName}, remaining: ${remainingCount}`)
      
      // Apply buff (TODO: Implement buffManager.applyBuff)
      // For now, just log
      console.log(`Buff item ${itemId} used - buff system not yet implemented`)
      
      return { result: true }
    } else {
      // Other types can't be used
      return { result: false, type: 2, msg: "this type can't use" }
    }
  }
}))

