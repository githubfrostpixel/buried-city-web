/**
 * Save Serializer
 * Converts game state to/from save data format
 * Internal module - not exported publicly
 */

import type { SaveData } from '@/common/types/save.types'
import type { PlayerAttributes } from '@/common/types/player.types'
import type { Building } from '@/common/types/building.types'

/**
 * Serialize game state to save data format
 * Collects data from all stores
 */
export async function serializeGameState(): Promise<SaveData> {
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
      weaponRound: playerState.weaponRound || {},
      saveName: playerState.saveName,
      cloned: false // TODO: Track cloned state if needed
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
  
  return saveData
}

/**
 * Deserialize save data and restore to game stores
 * @param saveData Validated save data
 */
export async function deserializeGameState(saveData: import('./saveSchemas').ValidatedSaveData): Promise<void> {
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

