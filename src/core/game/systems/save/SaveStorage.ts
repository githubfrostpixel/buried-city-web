/**
 * Save Storage
 * Low-level storage operations with localforage
 * Internal module - not exported publicly
 */

import localforage from 'localforage'
import { getStorageKey } from './SaveSlotManager'

// Initialize localforage
localforage.config({
  name: 'BuriedTown',
  storeName: 'saves',
  description: 'BuriedTown game saves'
})

/**
 * Save data to storage
 * @param key Storage key (without slot suffix)
 * @param data Data to save
 * @param slot Optional slot number (uses current slot if not provided)
 */
export async function saveDataToStorage(key: string, data: unknown, slot?: number): Promise<void> {
  try {
    const fullKey = slot ? `${key}_${slot}` : getStorageKey(key)
    await localforage.setItem(fullKey, data)
  } catch (error) {
    console.error(`Failed to save ${key}:`, error)
    throw error
  }
}

/**
 * Load data from storage
 * @param key Storage key (without slot suffix)
 * @param slot Optional slot number (uses current slot if not provided)
 */
export async function loadDataFromStorage<T>(key: string, slot?: number): Promise<T | null> {
  try {
    const fullKey = slot ? `${key}_${slot}` : getStorageKey(key)
    const data = await localforage.getItem<T>(fullKey)
    return data
  } catch (error) {
    console.error(`Failed to load ${key}:`, error)
    return null
  }
}

/**
 * Delete data from storage
 * @param key Storage key (without slot suffix)
 * @param slot Optional slot number (uses current slot if not provided)
 */
export async function deleteDataFromStorage(key: string, slot?: number): Promise<void> {
  try {
    const fullKey = slot ? `${key}_${slot}` : getStorageKey(key)
    await localforage.removeItem(fullKey)
  } catch (error) {
    console.error(`Failed to delete ${key}:`, error)
    throw error
  }
}

/**
 * Get all storage keys for a specific slot
 * @param slot Slot number
 */
export async function getAllKeysForSlot(slot: number): Promise<string[]> {
  const keys = await localforage.keys()
  const slotPattern = new RegExp(`_${slot}$`)
  return keys.filter((key): key is string => 
    typeof key === 'string' && slotPattern.test(key)
  )
}


