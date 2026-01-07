/**
 * Save Operations
 * Orchestrates save/load operations using internal modules
 */

import type { ValidatedSaveData } from './saveSchemas'
import { serializeGameState, deserializeGameState } from './SaveSerializer'
import { validateSaveData } from './SaveValidator'
import { saveDataToStorage, loadDataFromStorage } from './SaveStorage'
import type { SaveData } from '@/common/types/save.types'

/**
 * Save all game data with validation
 */
export async function saveAll(): Promise<void> {
  // Serialize game state
  const saveData = await serializeGameState()
  
  // Validate before saving
  const validated = validateSaveData(saveData)
  
  // Save to storage
  await saveDataToStorage('save', validated)
}

/**
 * Load all game data with validation
 */
export async function loadAll(): Promise<ValidatedSaveData | null> {
  const data = await loadDataFromStorage<SaveData>('save')
  
  if (!data) {
    return null
  }
  
  // Validate loaded data
  try {
    return validateSaveData(data)
  } catch (error) {
    console.error('Failed to validate loaded save data:', error)
    return null
  }
}

/**
 * Restore game state from validated save data
 */
export async function restoreFromSave(saveData: ValidatedSaveData): Promise<void> {
  await deserializeGameState(saveData)
}

/**
 * Auto-save on important actions
 */
export async function autoSave(): Promise<void> {
  try {
    await saveAll()
    console.log('Auto-save completed')
  } catch (error) {
    console.error('Auto-save failed:', error)
  }
}

