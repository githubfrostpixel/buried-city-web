import { create } from 'zustand'
import type { PlayerState, PlayerAttributes } from '@/types/player.types'
import { itemConfig } from '@/data/items'

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
  
  // Actions
  updateAttribute: (attr: keyof PlayerAttributes, value: number) => set((state: PlayerStore) => {
    const newValue = Math.max(0, Math.min(value, state[`${attr}Max` as keyof PlayerAttributes] as number || 100))
    return {
      [attr]: newValue
    } as Partial<PlayerStore>
  }),
  
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
    // TODO: Check building 20 level >= 0
    // For now, return 50 if safe has any items (placeholder logic)
    const state = get()
    const hasItems = Object.keys(state.safe).length > 0
    return hasItems ? 50 : 0
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
  }
}))

