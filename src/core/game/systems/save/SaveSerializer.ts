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
  
  // Get map if available
  let mapSaveData: import('@/common/types/site.types').MapSaveData | undefined
  try {
    const map = playerState.getMap()
    mapSaveData = map.save()
  } catch {
    // Map not initialized yet
    mapSaveData = undefined
  }
  
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
      weather: gameState.weatherSystem.save(),
      map: mapSaveData
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
  // Restore TimeManager's internal time (this is the source of truth for game time)
  // TimeManager.restore() will call updateStore() which syncs to gameStore
  const { game } = await import('@/core/game/Game')
  const timeManager = game.getTimeManager()
  timeManager.restore({ time: saveData.game.time })
  
  // setTime() also calculates and sets season, but we explicitly set it to match save data
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
  // Use Zustand setState() to properly update state (direct assignment doesn't trigger state updates)
  usePlayerStore.setState({
    bag: saveData.player.bag,
    storage: saveData.player.storage,
    safe: saveData.player.safe
  })
  
  // Restore equipment, dog, weaponRound, and other player data using setState
  usePlayerStore.setState({
    equipment: saveData.player.equipment,
    dog: saveData.player.dog,
    weaponRound: saveData.player.weaponRound || {},
    level: saveData.player.level,
    exp: saveData.player.exp,
    talent: saveData.player.talent
  })
  
  // Restore currency using the setter method
  playerStore.setCurrency(saveData.player.money)
  
  // Restore buildings
  const { useBuildingStore } = await import('@/core/store/buildingStore')
  const buildingStore = useBuildingStore.getState()
  if (saveData.buildings && saveData.buildings.length > 0) {
    buildingStore.restore(saveData.buildings)
  } else {
    // Initialize buildings for new game
    buildingStore.initialize()
  }
  
  // Restore map (must be done before NPCManager restore)
  if (saveData.game.map) {
    // Initialize map if it doesn't exist
    try {
      playerStore.getMap()
    } catch {
      // Map not initialized, initialize it first
      playerStore.initializeMap()
    }
    
    const map = playerStore.getMap()
    map.restore(saveData.game.map)
  } else {
    // No map data in save, initialize fresh map if it doesn't exist
    try {
      playerStore.getMap()
    } catch {
      playerStore.initializeMap()
    }
  }
  
  // Restore NPCManager (map must be initialized first)
  if (saveData.npcManager) {
    try {
      const npcManager = playerStore.getNPCManager()
      npcManager.restore(saveData.npcManager)
    } catch (e) {
      // NPCManager not initialized yet, will be initialized with map
      console.warn('NPCManager not initialized, skipping restore')
    }
  }
  
  // TODO: Restore sites when site system is ready
}

