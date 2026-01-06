/**
 * Save System
 * Ported from OriginalGame/src/game/record.js
 * 
 * Manages game save/load using localforage with Zod validation
 */

import localforage from 'localforage'
import { z } from 'zod'
import type { SaveData, SaveMetadata } from '@/common/types/save.types'
import { SaveDataSchema, type ValidatedSaveData } from './saveSchemas'
import type { PlayerAttributes } from '@/common/types/player.types'
import type { Building } from '@/common/types/building.types'
import { getString } from '@/common/utils/stringUtil'

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
    console.log(`[SaveSystem] Saved ${fullKey} to localforage (IndexedDB/localStorage)`)
  } catch (error) {
    console.error(`[SaveSystem] Failed to save ${key}:`, error)
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
      weather: gameState.weatherSystem.save(),
      map: playerState.map?.save() // Save map state (sites, NPCs, position)
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
  
  // Save metadata
  const metadata: SaveMetadata = {
    saveName: playerState.saveName || getString('6007'), // "Save File"
    cloned: false, // Will be set if this is a cloned save
    timestamp: Date.now()
  }
  
  // Check if metadata exists to preserve cloned flag
  const existingMetadata = await loadMetadata(currentSaveSlot)
  if (existingMetadata?.cloned) {
    metadata.cloned = true
  }
  
  await saveMetadata(currentSaveSlot, metadata)
  
  // Log save completion
  console.log(`[SaveSystem] saveAll() completed for slot ${currentSaveSlot}`)
  console.log(`[SaveSystem] Data stored in browser IndexedDB (or localStorage) under keys: save_${currentSaveSlot}, metadata_${currentSaveSlot}`)
  console.log(`[SaveSystem] You can inspect saved data in browser DevTools: Application > IndexedDB > BuriedTown > saves`)
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
  
  // CRITICAL: Restore TimeManager's internal time to match the saved time
  // TimeManager has its own internal time that needs to be synced, otherwise
  // it will overwrite the gameStore time on the next update() call
  const { game } = await import('@/core/game/Game')
  const timeManager = game.getTimeManager()
  timeManager.restore({ time: saveData.game.time })
  
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
  // Use setState() instead of direct assignment to ensure Zustand properly updates the store
  usePlayerStore.setState({
    bag: saveData.player.bag,
    storage: saveData.player.storage,
    safe: saveData.player.safe
  })
  
  // Get fresh state after setState
  const freshStateAfterInventory = usePlayerStore.getState()
  
  // Restore equipment, dog, weaponRound, and other player data using setState
  usePlayerStore.setState({
    equipment: saveData.player.equipment,
    dog: saveData.player.dog,
    weaponRound: saveData.player.weaponRound || {},
    level: saveData.player.level,
    exp: saveData.player.exp,
    talent: saveData.player.talent
  })
  
  // Set currency separately (it also sets money)
  freshStateAfterInventory.setCurrency(saveData.player.money)
  
  // Restore buildings
  const { useBuildingStore } = await import('@/core/store/buildingStore')
  const buildingStore = useBuildingStore.getState()
  if (saveData.buildings && saveData.buildings.length > 0) {
    buildingStore.restore(saveData.buildings)
  } else {
    // Initialize buildings for new game
    buildingStore.initialize()
  }
  
  // Initialize or restore map
  if (!playerStore.map) {
    playerStore.initializeMap()
  }
  
  // Get fresh state after initialization (Zustand set updates the store, but our reference might be stale)
  const freshPlayerStore = usePlayerStore.getState()
  const map = freshPlayerStore.map
  
  // Restore map state if we have saved map data
  if (saveData.game.map && map) {
    map.restore(saveData.game.map)
  }
  
  // Restore NPCManager (now that map is initialized)
  if (saveData.npcManager) {
    try {
      const npcManager = freshPlayerStore.getNPCManager()
      npcManager.restore(saveData.npcManager)
    } catch (error) {
      console.error('Failed to restore NPCManager:', error)
      // NPCManager restore failed, but game can continue
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

/**
 * Save metadata for a slot
 */
export async function saveMetadata(slot: number, metadata: SaveMetadata): Promise<void> {
  try {
    const key = `metadata_${slot}`
    await localforage.setItem(key, metadata)
    console.log(`[SaveSystem] Saved metadata for slot ${slot}`)
  } catch (error) {
    console.error(`[SaveSystem] Failed to save metadata for slot ${slot}:`, error)
    throw error
  }
}

/**
 * Load metadata for a slot
 */
export async function loadMetadata(slot: number): Promise<SaveMetadata | null> {
  try {
    const key = `metadata_${slot}`
    const metadata = await localforage.getItem<SaveMetadata>(key)
    return metadata
  } catch (error) {
    console.error(`Failed to load metadata for slot ${slot}:`, error)
    return null
  }
}

/**
 * Format time string as "Day X, HH:MM"
 */
export function formatTimeString(seconds: number): string {
  const day = Math.floor(seconds / (24 * 60 * 60))
  const dayTime = seconds % (24 * 60 * 60)
  const hour = Math.floor(dayTime / (60 * 60))
  const hourTime = dayTime % (60 * 60)
  const minute = Math.floor(hourTime / 60)
  
  const hourStr = hour < 10 ? `0${hour}` : `${hour}`
  const minuteStr = minute < 10 ? `0${minute}` : `${minute}`
  
  return `Day ${day}, ${hourStr}:${minuteStr}`
}

/**
 * Get formatted metadata for a save slot
 */
export async function getSaveSlotMetadata(slot: number): Promise<{ name: string; description: string }> {
  const saveData = await loadAllForSlot(slot)
  
  if (!saveData) {
    // Empty slot - no save data
    const emptyName = getString('6001') // "EMPTY SLOT"
    const emptyDesc = getString('6013') // "\n\nClick to start new survival"
    return {
      name: emptyName,
      description: emptyDesc
    }
  }
  
  // Has save data - load or create metadata
  let metadata = await loadMetadata(slot)
  if (!metadata) {
    // Metadata missing but save data exists - create default metadata
    metadata = {
      saveName: getString('6007'), // "Save File"
      cloned: false,
      timestamp: Date.now()
    }
    // Save the default metadata
    await saveMetadata(slot, metadata)
  }
  
  // Has save data
  const saveName = metadata.saveName || getString('6007') // "Save File"
  
  // Format time - ensure we use the exact time from save data
  const gameTime = saveData.game.time
  const timeStr = formatTimeString(gameTime)
  
  const talentCount = saveData.player.talent?.length || 0
  const currency = saveData.player.money || 0
  const clonedStr = metadata.cloned ? getString('6003') : '' // ", cloned"
  
  const description = getString('6002', timeStr, talentCount.toString(), currency.toString(), clonedStr) + getString('6014') // "\nClick to Start"
  
  return {
    name: saveName,
    description
  }
}

/**
 * Check if a slot has save data
 */
export async function checkSlotExists(slot: number): Promise<boolean> {
  const oldSlot = currentSaveSlot
  setSaveSlot(slot)
  
  try {
    const data = await loadData<SaveData>('save')
    return data !== null
  } finally {
    setSaveSlot(oldSlot)
  }
}

/**
 * Load all save data for a specific slot
 */
export async function loadAllForSlot(slot: number): Promise<ValidatedSaveData | null> {
  const oldSlot = currentSaveSlot
  setSaveSlot(slot)
  
  try {
    return await loadAll()
  } finally {
    setSaveSlot(oldSlot)
  }
}

/**
 * Clone save slot from source to target
 */
export async function cloneSaveSlot(sourceSlot: number, targetSlot: number): Promise<void> {
  // Load source data
  const sourceData = await loadAllForSlot(sourceSlot)
  const sourceMetadata = await loadMetadata(sourceSlot)
  
  if (!sourceData || !sourceMetadata) {
    throw new Error(`Source slot ${sourceSlot} has no save data`)
  }
  
  // Check target slot is empty
  const targetExists = await checkSlotExists(targetSlot)
  if (targetExists) {
    throw new Error(`Target slot ${targetSlot} is not empty`)
  }
  
  // Clone metadata
  const clonedMetadata: SaveMetadata = {
    saveName: (sourceMetadata.saveName + getString('6005')).substring(0, 24), // Append " (Copy)" and limit to 24 chars
    cloned: true,
    timestamp: Date.now()
  }
  
  // Save to target slot
  const oldSlot = currentSaveSlot
  setSaveSlot(targetSlot)
  
  try {
    // Save data
    const validated = validateSaveData(sourceData)
    await saveDataToStorage('save', validated)
    
    // Save metadata
    await saveMetadata(targetSlot, clonedMetadata)
  } finally {
    setSaveSlot(oldSlot)
  }
}

/**
 * Delete save slot (including metadata)
 */
export async function deleteSaveSlotComplete(slot: number): Promise<void> {
  const oldSlot = currentSaveSlot
  
  try {
    // Delete save data
    await deleteSaveSlot(slot)
    
    // Delete metadata
    const metadataKey = `metadata_${slot}`
    await localforage.removeItem(metadataKey)
  } finally {
    setSaveSlot(oldSlot)
  }
}


