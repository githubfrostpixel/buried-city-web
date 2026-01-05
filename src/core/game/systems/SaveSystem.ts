/**
 * Save System
 * Ported from OriginalGame/src/game/record.js
 * 
 * Manages game save/load using localforage with Zod validation
 */

import localforage from 'localforage'
import { z } from 'zod'
import type { SaveData } from '@/common/types/save.types'
import { SaveDataSchema, type ValidatedSaveData } from './saveSchemas'
import type { PlayerAttributes } from '@/common/types/player.types'
import type { Building } from '@/common/types/building.types'

// Save slot management
let currentSaveSlot = 1

export function setSaveSlot(slot: number): void {
  currentSaveSlot = slot
}

export function getSaveSlot(): number {
  return currentSaveSlot
}

// Initialize localforage
localforage.config({
  name: 'BuriedTown',
  storeName: 'saves',
  description: 'BuriedTown game saves'
})

/**
 * Save data to storage
 */
export async function saveDataToStorage(key: string, data: unknown): Promise<void> {
  try {
    const fullKey = `${key}_${currentSaveSlot}`
    await localforage.setItem(fullKey, data)
  } catch (error) {
    console.error(`Failed to save ${key}:`, error)
    throw error
  }
}

/**
 * Load data from storage
 */
export async function loadData<T>(key: string): Promise<T | null> {
  try {
    const fullKey = `${key}_${currentSaveSlot}`
    const data = await localforage.getItem<T>(fullKey)
    return data
  } catch (error) {
    console.error(`Failed to load ${key}:`, error)
    return null
  }
}

/**
 * Delete save data
 */
export async function deleteData(key: string): Promise<void> {
  try {
    const fullKey = `${key}_${currentSaveSlot}`
    await localforage.removeItem(fullKey)
  } catch (error) {
    console.error(`Failed to delete ${key}:`, error)
    throw error
  }
}

/**
 * Delete entire save slot
 */
export async function deleteSaveSlot(slot: number): Promise<void> {
  const oldSlot = currentSaveSlot
  setSaveSlot(slot)
  
  try {
    // Delete all keys for this slot
    const keys = await localforage.keys()
    for (const key of keys) {
      if (key.endsWith(`_${slot}`)) {
        await localforage.removeItem(key)
      }
    }
  } finally {
    setSaveSlot(oldSlot)
  }
}

/**
 * Validate save data with Zod
 */
export function validateSaveData(data: unknown): ValidatedSaveData {
  try {
    return SaveDataSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Save data validation failed:', error.errors)
      throw new Error(`Invalid save data: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

/**
 * Save all game data with validation
 */
export async function saveAll(): Promise<void> {
  // Import stores dynamically to avoid circular dependencies
  const { useGameStore } = await import('@/core/store/gameStore')
  const { usePlayerStore } = await import('@/core/store/playerStore')
  const { useBuildingStore } = await import('@/core/store/buildingStore')
  
  const gameState = useGameStore.getState()
  const playerState = usePlayerStore.getState()
  const buildingStore = useBuildingStore.getState()
  
  // Get NPCManager if available
  let npcManagerSave: import('@/common/types/npc.types').NPCManagerSaveData | undefined
  try {
    const npcManager = playerState.getNPCManager()
    npcManagerSave = npcManager.save()
  } catch {
    // NPCManager not initialized yet
    npcManagerSave = undefined
  }
  
  const saveData: SaveData = {
    version: '1.0.0',
    timestamp: Date.now(),
    player: {
      attributes: {
        hp: playerState.hp,
        hpMax: playerState.hpMax,
        spirit: playerState.spirit,
        spiritMax: playerState.spiritMax,
        starve: playerState.starve,
        starveMax: playerState.starveMax,
        vigour: playerState.vigour,
        vigourMax: playerState.vigourMax,
        injury: playerState.injury,
        injuryMax: playerState.injuryMax,
        infect: playerState.infect,
        infectMax: playerState.infectMax,
        water: playerState.water,
        waterMax: playerState.waterMax,
        virus: playerState.virus,
        virusMax: playerState.virusMax,
        temperature: playerState.temperature,
        temperatureMax: playerState.temperatureMax
      },
      level: playerState.level,
      exp: playerState.exp,
      money: playerState.money,
      talent: playerState.talent,
      bag: playerState.bag || {},
      storage: playerState.storage || {},
      safe: playerState.safe || {},
      equipment: playerState.equipment || {
        gun: null,
        weapon: null,
        equip: null,
        tool: null,
        special: null
      },
      dog: playerState.dog || {
        hunger: 50,
        hungerMax: 100,
        mood: 50,
        moodMax: 100,
        injury: 0,
        injuryMax: 100,
        active: false
      },
      weaponRound: playerState.weaponRound || {}
    },
    game: {
      time: gameState.time,
      season: gameState.season,
      day: gameState.day,
      weather: gameState.weatherSystem.save()
    },
    buildings: buildingStore.save() as Building[],
    npcManager: npcManagerSave,
    npcs: [], // Legacy NPC schema for backward compatibility
    sites: [] // TODO: Get from site store when available
  }
  
  // Validate before saving
  const validated = validateSaveData(saveData)
  
  // Save to localforage
  await saveDataToStorage('save', validated)
}

/**
 * Load all game data with validation
 */
export async function loadAll(): Promise<ValidatedSaveData | null> {
  const data = await loadData<SaveData>('save')
  
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
  // Restore game state
  const { useGameStore } = await import('@/core/store/gameStore')
  const gameStore = useGameStore.getState()
  gameStore.setTime(saveData.game.time)
  gameStore.setSeason(saveData.game.season)
  
  // Restore weather system state
  if (saveData.game.weather) {
    gameStore.weatherSystem.restore(saveData.game.weather)
    gameStore.updateWeather()
  }
  
  // Restore player state
  const { usePlayerStore } = await import('@/core/store/playerStore')
  const playerStore = usePlayerStore.getState()
  
  // Restore attributes
  Object.entries(saveData.player.attributes).forEach(([key, value]) => {
    playerStore.updateAttribute(key as keyof PlayerAttributes, value)
  })
  
  // Restore inventory
  playerStore.bag = saveData.player.bag
  playerStore.storage = saveData.player.storage
  playerStore.safe = saveData.player.safe
  
  // Restore equipment
  playerStore.equipment = saveData.player.equipment
  
  // Restore dog
  playerStore.dog = saveData.player.dog
  
  // Restore weaponRound
  if (saveData.player.weaponRound) {
    playerStore.weaponRound = saveData.player.weaponRound
  }
  
  // Restore other player data
  playerStore.level = saveData.player.level
  playerStore.exp = saveData.player.exp
  playerStore.setCurrency(saveData.player.money)
  playerStore.talent = saveData.player.talent
  
  // Restore buildings
  const { useBuildingStore } = await import('@/core/store/buildingStore')
  const buildingStore = useBuildingStore.getState()
  if (saveData.buildings && saveData.buildings.length > 0) {
    buildingStore.restore(saveData.buildings)
  } else {
    // Initialize buildings for new game
    buildingStore.initialize()
  }
  
  // Restore NPCManager
  if (saveData.npcManager) {
    try {
      const npcManager = playerStore.getNPCManager()
      npcManager.restore(saveData.npcManager)
    } catch {
      // NPCManager not initialized yet, will be initialized with map
      console.warn('NPCManager not initialized, skipping restore')
    }
  }
  
  // TODO: Restore sites when site system is ready
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

/**
 * Export save data as JSON string
 */
export async function exportSaveAsJSON(): Promise<string> {
  const data = await loadData<SaveData>('save')
  if (!data) {
    throw new Error('No save data to export')
  }
  return JSON.stringify(data, null, 2)
}

/**
 * Import save data from JSON string
 */
export async function importSaveFromJSON(jsonString: string): Promise<void> {
  try {
    const data = JSON.parse(jsonString)
    const validated = validateSaveData(data)
    await saveDataToStorage('save', validated)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format')
    }
    throw error
  }
}

/**
 * Download save file to user's computer
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

/**
 * Get UUID for analytics/identification
 */
export async function getUUID(): Promise<string> {
  let uuid = await localforage.getItem<string>('uuid')
  
  if (!uuid) {
    uuid = `${Date.now()}${Math.floor(Math.random() * 100000)}`
    await localforage.setItem('uuid', uuid)
  }
  
  return uuid
}

/**
 * Get username
 */
export async function getUsername(): Promise<string> {
  const username = await localforage.getItem<string>('username')
  
  if (!username || username === '0' || username === '') {
    const uid = await getUUID()
    return uid.substring(uid.length - 5)
  }
  
  return username
}

/**
 * Set username
 */
export async function setUsername(username: string): Promise<void> {
  await localforage.setItem('username', username)
}

/**
 * Check if this is first time playing
 */
export async function isFirstTime(): Promise<boolean> {
  const record = await localforage.getItem('record')
  return !record
}

/**
 * Initialize save system
 */
export async function initSaveSystem(_recordName: string = 'record'): Promise<void> {
  // Initialize localforage
  await localforage.ready()
  
  // Check if first time
  const firstTime = await isFirstTime()
  if (firstTime) {
    // Initialize default save
    await localforage.setItem('record', {})
  }
}


