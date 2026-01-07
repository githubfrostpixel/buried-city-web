/**
 * Save Export/Import
 * Export and import save data as JSON
 */

import type { SaveData } from '@/common/types/save.types'
import { getSaveSlot } from './SaveSlotManager'
import { loadDataFromStorage, saveDataToStorage } from './SaveStorage'
import { validateSaveData } from './SaveValidator'

/**
 * Export save data as JSON string
 * @param slot Optional slot number (uses current slot if not provided)
 */
export async function exportSaveAsJSON(slot?: number): Promise<string> {
  const targetSlot = slot ?? getSaveSlot()
  const data = await loadDataFromStorage<SaveData>('save', targetSlot)
  if (!data) {
    throw new Error('No save data to export')
  }
  return JSON.stringify(data, null, 2)
}

/**
 * Import save data from JSON string
 * @param jsonString JSON string to import
 * @param slot Optional slot number (uses current slot if not provided)
 */
export async function importSaveFromJSON(jsonString: string, slot?: number): Promise<void> {
  try {
    const data = JSON.parse(jsonString)
    const validated = validateSaveData(data)
    const targetSlot = slot ?? getSaveSlot()
    await saveDataToStorage('save', validated, targetSlot)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format')
    }
    throw error
  }
}

/**
 * Download save file to user's computer
 * @param jsonString JSON string to download
 * @param filename Optional filename (default: 'buriedtown-save.json')
 */
export function downloadSaveFile(jsonString: string, filename: string = 'buriedtown-save.json'): void {
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Read save file from File object
 * @param file File object to read
 */
export function readSaveFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        resolve(e.target.result)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('File read error'))
    reader.readAsText(file)
  })
}

