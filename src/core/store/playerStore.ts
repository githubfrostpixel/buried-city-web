/**
 * Player Store
 * Manages all player-related state including attributes, inventory, equipment, location, and game mechanics
 * Handles player attributes (HP, spirit, starve, etc.), inventory management (bag, storage, safe),
 * equipment system, dog state, map/travel state, item usage, and weapon breaking system
 * Ported from OriginalGame/src/game/player.js
 * 
 * Used by:
 * - Game systems: Battle, BattlePlayer, SurvivalSystem, SaveSystem (save/), BedAction, Formula, RadioCommandProcessor
 * - Combat systems: Gun, Flamethrower, ElectricGun, Bomb, Trap, Monster
 * - World systems: Site, Building, Map, Bag, Safe
 * - Components: MainScene, TopSection, all panels (Home, Storage, Build, Gate, etc.), all overlays
 * - Hooks: useActorMovement
 * - Utils: actor, deathCheck, uiUtil
 */

import { create } from 'zustand'
import type { PlayerState, PlayerAttributes } from '@/common/types/player.types'
import type { BuildingCost } from '@/common/types/building.types'
import type { FoodEffect, MedicineEffect, BuffEffect } from '@/common/types/item.types'
import { itemConfig } from '@/core/data/items'
import { Item } from '@/core/game/inventory/Item'
import { Storage } from '@/core/game/inventory/Storage'
import { Map } from '@/core/game/map/Map'
import { NPCManager } from '@/core/game/entities/NPCManager'
import { game } from '@/core/game/Game'
import { useBuildingStore } from '@/core/store/buildingStore'
import { useGameStore } from '@/core/store/gameStore'
import { weaponReturn } from '@/core/data/weaponReturn'
import { checkDeathOnAttributeChange, handleDeath } from '@/common/utils/deathCheck'
import { getString } from '@/common/utils/stringUtil'
import { useLogStore } from '@/core/store/logStore'
import { audioManager, SoundPaths } from '@/core/game/core/AudioManager'

interface PlayerStore extends PlayerState {
  // Location state
  isAtHome: boolean
  isAtBazaar: boolean
  isAtSite: boolean
  nowSiteId: number | null
  
  // Game state
  currency: number
  fuel: number
  totalDistance: number
  leftHomeTime: number | null
  saveName: string // Save file name
  
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
  
  // Weapon usage tracking (for breaking system)
  weaponRound: Record<string, number> // itemId -> usage count
  
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
  
  // NPC Manager
  npcManager: NPCManager | null
  
  // Travel state
  useMoto: boolean  // Whether player wants to use motorcycle
  isMoving: boolean  // Whether actor is currently moving (prevents clicks)
  
  // Actor movement state
  actorTargetPos: { x: number; y: number } | null  // Target position for movement
  actorVelocity: number  // Current movement velocity (pixels per second)
  actorMaxVelocity: number  // Maximum velocity for current trip
  actorMovementCallback: (() => void) | null  // Callback to call when movement completes
  
  // Medicine treatment state
  cured: boolean
  binded: boolean
  cureTime: number | null
  bindTime: number | null
  
  // Coffee and alcohol state
  lastCoffeeTime: number
  lastAlcoholTime: number
  alcoholPrice: number
  
  // Actions
  updateAttribute: (attr: keyof PlayerAttributes, value: number) => void
  setCurrency: (amount: number) => void
  addCurrency: (amount: number) => void
  setLocation: (location: { isAtHome?: boolean; isAtBazaar?: boolean; isAtSite?: boolean; siteId?: number | null }) => void
  setSetting: (key: string, value: any) => void
  setSaveName: (name: string) => void
  out: () => void
  
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
  getItemCountInAnyInventory: (itemId: string) => number
  
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
  
  // NPC Manager actions
  getNPCManager: () => NPCManager
  
  // Travel actions
  setUseMoto: (use: boolean) => void
  setIsMoving: (moving: boolean) => void
  
  // Actor movement actions
  setActorTargetPos: (pos: { x: number; y: number } | null) => void
  setActorVelocity: (velocity: number) => void
  setActorMaxVelocity: (maxVelocity: number) => void
  setActorMovementCallback: (callback: (() => void) | null) => void
  clearActorMovement: () => void
  
  // Item use actions
  useItem: (storage: Storage, itemId: string) => {result: boolean, type?: number, msg?: string}
  cure: () => void
  bindUp: () => void
  isAttrMax: (attr: keyof PlayerAttributes) => boolean
  isAttrChangeGood: (attr: keyof PlayerAttributes, changeValue: number) => boolean
  applyEffect: (effectObj: Record<string, number>) => Array<{attrName: string, changeValue: number}>
  itemEffect: (item: Item, effectObj: FoodEffect | MedicineEffect | BuffEffect | undefined) => void
  item1104032Effect: (item: Item, effectObj: MedicineEffect | undefined) => boolean
  
  // Building cost/item management
  validateItems: (cost: BuildingCost[]) => boolean
  costItems: (cost: BuildingCost[]) => void
  gainItems: (items: Array<{ itemId: number | string; num: number }>) => void
  
  // Weapon breaking system
  incrementWeaponRound: (itemId: string) => void
  resetWeaponRound: (itemId: string) => void
  getWeaponRound: (itemId: string) => number
  setWeaponRound: (itemId: string, count: number) => void
  testWeaponBroken: (itemId: string, type: 0 | 1, multiplier: number) => boolean
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
  fuel: 0,
  totalDistance: 0,
  leftHomeTime: null,
  saveName: '',
  
  // Settings
  setting: {
    sound: true,
    music: true
  },
  
  // Inventory
  bag: {},
  storage: {},
  safe: {},
  
  // Weapon usage tracking
  weaponRound: {},
  
  // Equipment
  equipment: {
    gun: null,
    weapon: "1", // Default to hand (always hand, never null)
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
  
  // NPC Manager
  npcManager: null,
  
  // Travel state
  useMoto: false,
  isMoving: false,
  
  // Actor movement state
  actorTargetPos: null,
  actorVelocity: 0,
  actorMaxVelocity: 0,
  actorMovementCallback: null,
  
  // Medicine treatment state
  cured: false,
  binded: false,
  cureTime: null,
  bindTime: null,
  
  // Coffee and alcohol state
  lastCoffeeTime: -999999,
  lastAlcoholTime: -999999,
  alcoholPrice: 1,
  
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
        // Log message
        const logStore = useLogStore.getState()
        logStore.addLog(getString(6671)) // "The virus finally defeated your immune system and ended your humanity."
        
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
  
  addCurrency: (amount: number) => {
    const state = get()
    const newAmount = state.currency + amount
    // Play GOLD sound effect when gaining currency (matches OriginalGame/src/game/player.js:382)
    if (amount > 0) {
      audioManager.playEffect(SoundPaths.GOLD)
    }
    set({ currency: newAmount, money: newAmount })
  },
  
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
  
  setSaveName: (name: string) => set({ saveName: name }),
  
  out: () => {
    // Get current time from game time manager
    const currentTime = game.getTimeManager().getTimeNum()
    set({
      isAtHome: false,
      leftHomeTime: currentTime
    })
    // TODO: Add log message 1110 when log system is ready
    // player.log.addMsg(1110)
  },
  
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
        // Auto-unequip if item was equipped AND not in any inventory
        const isEquipped = state.isEquipped(itemId)
        if (isEquipped) {
          // Check if item exists in any inventory (bag, storage, or safe)
          // Since newBag[itemId] is already deleted (count is 0), only check storage and safe
          const totalCount = (state.storage[itemId] || 0) + (state.safe[itemId] || 0)
          
          // Only unequip if item is not in any inventory
          if (totalCount === 0) {
            const slots: Array<'gun' | 'weapon' | 'equip' | 'tool' | 'special'> = ['gun', 'weapon', 'equip', 'tool', 'special']
            for (const slot of slots) {
              if (state.equipment[slot] === itemId) {
                // Directly update equipment in same set() callback instead of calling unequipItem
                // (which would cause nested set() calls)
                const newEquipment = { ...state.equipment }
                if (slot === 'weapon') {
                  // Weapon always defaults to hand
                  newEquipment[slot] = "1"
                } else {
                  newEquipment[slot] = null
                }
                // Return updated bag and equipment together
                return { bag: newBag, equipment: newEquipment }
              }
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
  
  getItemCountInAnyInventory: (itemId: string) => {
    const state = get()
    return (
      (state.bag[itemId] || 0) +
      (state.storage[itemId] || 0) +
      (state.safe[itemId] || 0)
    )
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
    
    // If equipping an item (not hand), it must be in bag
    if (itemId !== null && itemId !== "1") {
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
        // Weapon always defaults to hand
        newEquipment[slot] = "1"
      } else {
        newEquipment[slot] = null
      }
      return { equipment: newEquipment }
    })
  },
  
  getEquippedItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special') => {
    const item = get().equipment[slot]
    // For weapon slot, null means hand (backward compatibility with old saves)
    if (slot === 'weapon' && item === null) {
      return "1"
    }
    return item
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
    
    // Initialize NPCManager
    const npcManager = new NPCManager()
    npcManager.init()
    
    set({ map, npcManager })
  },
  
  getMap: () => {
    const { map } = get()
    if (!map) {
      throw new Error('Map not initialized. Call initializeMap() first.')
    }
    return map
  },
  
  // NPC Manager actions
  getNPCManager: () => {
    const { npcManager } = get()
    if (!npcManager) {
      throw new Error('NPCManager not initialized. Call initializeMap() first.')
    }
    return npcManager
  },
  
  // Travel actions
  setUseMoto: (use: boolean) => set({ useMoto: use }),
  setIsMoving: (moving: boolean) => set({ isMoving: moving }),
  
  // Actor movement actions
  setActorTargetPos: (pos: { x: number; y: number } | null) => set({ actorTargetPos: pos }),
  setActorVelocity: (velocity: number) => set({ actorVelocity: velocity }),
  setActorMaxVelocity: (maxVelocity: number) => set({ actorMaxVelocity: maxVelocity }),
  setActorMovementCallback: (callback: (() => void) | null) => set({ actorMovementCallback: callback }),
  clearActorMovement: () => set({ 
    actorTargetPos: null, 
    actorVelocity: 0, 
    actorMaxVelocity: 0, 
    actorMovementCallback: null 
  }),
  
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
  
  // Gain items (add to storage)
  // Ported from OriginalGame: player.gainItems(items)
  gainItems: (items: Array<{ itemId: number | string; num: number }>) => {
    set((state) => {
      const newStorage = { ...state.storage }
      
      for (const item of items) {
        const itemId = String(item.itemId)
        const count = item.num
        
        // Add to storage (items go to storage, not bag)
        newStorage[itemId] = (newStorage[itemId] || 0) + count
      }
      
      return { storage: newStorage }
    })
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
  applyEffect: (effectObj: Record<string, number> | { spirit?: number; spirit_chance?: number }) => {
    const state = get()
    const badEffects: Array<{attrName: string, changeValue: number}> = []
    
    // Convert to Record for indexing
    const effectRecord = effectObj as Record<string, number>
    
    for (const key in effectRecord) {
      if (state.hasOwnProperty(key) && key !== 'id') {
        const chanceKey = `${key}_chance`
        const chance = effectRecord[chanceKey]
        const value = effectRecord[key]
        
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
      // Log warning message
      const logStore = useLogStore.getState()
      const itemConfig = getString(item.id)
      const itemName = typeof itemConfig === 'object' && itemConfig !== null && 'title' in itemConfig
        ? itemConfig.title as string
        : item.id
      // Format bad effects string
      const effectsStr = badEffects.map((e: {attrName: string, changeValue: number}) => `${e.attrName}:${e.changeValue}`).join(' ')
      logStore.addLog(getString(1107, itemName, effectsStr)) // Format: "The impurities of %s caused harmful consequences! (%s)"
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
    // Get item name from string system
    const itemConfig = getString(itemId)
    const itemName = typeof itemConfig === 'object' && itemConfig !== null && 'title' in itemConfig
      ? itemConfig.title as string
      : `Item ${itemId}` // Fallback
    
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
      
      // Log message
      const remainingCount = storage.getItemCount(itemId)
      const logStore = useLogStore.getState()
      logStore.addLog(getString(1093, itemName, remainingCount)) // Format: "You ate a %s (stock: %s)"
      
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
        
        // Log message
        const remainingCount = storage.getItemCount(itemId)
        const logStore = useLogStore.getState()
        logStore.addLog(getString(1094, itemName, remainingCount)) // Format: "You wrapped your wound with %s (stock: %s)"
        
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
        
        // Log message
        const remainingCount = storage.getItemCount(itemId)
        const logStore = useLogStore.getState()
        logStore.addLog(getString(1095, itemName, remainingCount)) // Format: "You took %s (stock: %s)"
        
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
      
      // Log message
      const remainingCount = storage.getItemCount(itemId)
      const logStore = useLogStore.getState()
      logStore.addLog(getString(1095, itemName, remainingCount)) // Format: "You took %s (stock: %s)"
      
      // Apply buff (TODO: Implement buffManager.applyBuff)
      // For now, just log
      console.log(`Buff item ${itemId} used - buff system not yet implemented`)
      
      return { result: true }
    } else {
      // Other types can't be used
      return { result: false, type: 2, msg: "this type can't use" }
    }
  },
  
  // Weapon breaking system
  incrementWeaponRound: (itemId: string) => {
    set((state) => ({
      weaponRound: {
        ...state.weaponRound,
        [itemId]: (state.weaponRound[itemId] || 0) + 1
      }
    }))
  },
  
  resetWeaponRound: (itemId: string) => {
    set((state) => ({
      weaponRound: {
        ...state.weaponRound,
        [itemId]: 0
      }
    }))
  },
  
  getWeaponRound: (itemId: string) => {
    return get().weaponRound[itemId] || 0
  },
  
  setWeaponRound: (itemId: string, count: number) => {
    set((state) => ({
      weaponRound: {
        ...state.weaponRound,
        [itemId]: count
      }
    }))
  },
  
  testWeaponBroken: (itemId: string, type: 0 | 1, multiplier: number) => {
    const state = get()
    
    // Newbie protection: weapons don't break in first 2 days
    const gameStore = useGameStore.getState()
    if (gameStore.day < 2) {
      return false
    }
    
    const config = itemConfig[itemId]
    if (!config) {
      return false
    }
    
    // Get break probability
    let weaponBrokenProbability = 0
    if (type === 0) {
      // Weapon
      weaponBrokenProbability = (config.effect_weapon?.brokenProbability || 0) * multiplier
    } else {
      // Armor
      weaponBrokenProbability = config.effect_arm?.brokenProbability || 0
    }
    
    // IAP reduction (75% reduction if unlocked)
    // TODO: Implement IAP package check
    // For now, skip IAP reduction
    // if (IAPPackage.isWeaponEffectUnlocked()) {
    //   weaponBrokenProbability -= weaponBrokenProbability * 0.75
    // }
    
    // Random roll
    const rand = Math.random()
    const isBroken = rand <= weaponBrokenProbability
    
    const currentRound = state.getWeaponRound(itemId)
    
    if (isBroken && currentRound > 2) {
      // Weapon breaks - remove item
      const currentCount = state.getBagItemCount(itemId)
      if (currentCount > 0) {
        state.removeItemFromBag(itemId, 1)
        
        // If no more items, unequip
        if (state.getBagItemCount(itemId) === 0) {
          // Find which slot has this item and unequip it
          if (state.equipment.gun === itemId) {
            state.unequipItem('gun')
          } else if (state.equipment.weapon === itemId) {
            state.unequipItem('weapon')
          } else if (state.equipment.equip === itemId) {
            state.unequipItem('equip')
          } else if (state.equipment.tool === itemId) {
            state.unequipItem('tool')
          } else if (state.equipment.special === itemId) {
            state.unequipItem('special')
          }
        }
        
        // Add return items (scrap)
        const returnItems = weaponReturn[itemId] || []
        if (returnItems.length > 0) {
          returnItems.forEach((scrapId) => {
            state.addItemToBag(scrapId, 1)
          })
        }
        
        // Reset weapon round
        state.resetWeaponRound(itemId)
        
        // Log message
        const logStore = useLogStore.getState()
        const brokenItemConfig = getString(itemId)
        const brokenItemName = typeof brokenItemConfig === 'object' && brokenItemConfig !== null && 'title' in brokenItemConfig
          ? brokenItemConfig.title as string
          : itemId
        logStore.addLog(getString(1205, brokenItemName)) // Format: "%s is broken!"
        
        return true
      }
    } else if (isBroken) {
      // Warning state - weapon would break but round <= 2
      state.setWeaponRound(itemId, 3)
      return false
    } else {
      // Increment usage count
      state.incrementWeaponRound(itemId)
      return false
    }
    
    return false
  }
}))

