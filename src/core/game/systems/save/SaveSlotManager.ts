/**
 * Save Slot Manager
 * Encapsulates save slot state and operations with validation
 */

// Private state - encapsulated slot management
let currentSaveSlot = 1

const MIN_SLOT = 1
const MAX_SLOT = 4

/**
 * Validate slot number is within valid range
 */
function validateSlot(slot: number): boolean {
  return Number.isInteger(slot) && slot >= MIN_SLOT && slot <= MAX_SLOT
}

/**
 * Generate storage key with slot number
 */
function getSlotKey(key: string, slot: number): string {
  return `${key}_${slot}`
}

/**
 * Set the current save slot
 * @param slot Slot number (1-4)
 * @throws Error if slot is invalid
 */
export function setSaveSlot(slot: number): void {
  if (!validateSlot(slot)) {
    throw new Error(`Invalid save slot: ${slot}. Must be between ${MIN_SLOT} and ${MAX_SLOT}`)
  }
  currentSaveSlot = slot
}

/**
 * Get the current save slot
 */
export function getSaveSlot(): number {
  return currentSaveSlot
}

/**
 * Delete entire save slot
 * @param slot Slot number to delete (1-4)
 * @throws Error if slot is invalid or deletion fails
 */
export async function deleteSaveSlot(slot: number): Promise<void> {
  if (!validateSlot(slot)) {
    throw new Error(`Invalid save slot: ${slot}. Must be between ${MIN_SLOT} and ${MAX_SLOT}`)
  }

  const oldSlot = currentSaveSlot
  
  try {
    // Import localforage dynamically
    const localforage = (await import('localforage')).default
    
    // Get all keys from localforage
    const keys = await localforage.keys()
    
    // Use a regex pattern to ensure we match exactly _${slot} (not _${slot}0, _${slot}1, etc.)
    // This matches keys like "save_1", "player_1", etc. but not "save_10"
    const slotPattern = new RegExp(`_${slot}$`)
    const keysToDelete: string[] = []
    
    // Find all keys that match this slot
    for (const key of keys) {
      if (typeof key === 'string' && slotPattern.test(key)) {
        keysToDelete.push(key)
      }
    }
    
    // Delete all matching keys in parallel
    if (keysToDelete.length > 0) {
      await Promise.all(keysToDelete.map(key => localforage.removeItem(key)))
      console.log(`Deleted save slot ${slot}: ${keysToDelete.length} key(s) removed`, keysToDelete)
    } else {
      console.log(`No keys found for save slot ${slot}`)
    }
  } catch (error) {
    console.error(`Failed to delete save slot ${slot}:`, error)
    throw error
  } finally {
    setSaveSlot(oldSlot)
  }
}

/**
 * Get slot key for storage operations (internal use)
 */
export function getStorageKey(key: string): string {
  return getSlotKey(key, currentSaveSlot)
}

