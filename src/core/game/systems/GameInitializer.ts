/**
 * Game Initializer
 * Handles initialization of new game state
 * Extracted from MenuScene for reuse across scenes
 */

import { game } from '@/core/game/Game'
import { usePlayerStore } from '@/core/store/playerStore'
import { useBuildingStore } from '@/core/store/buildingStore'
import { useGameStore } from '@/core/store/gameStore'
import { itemConfig } from '@/core/data/items'

/**
 * Initialize a new game with default state
 * - Initializes game systems
 * - Resets player attributes and inventory
 * - Initializes map with default sites
 * - Initializes building store
 * - Initializes game store (time, weather)
 */
export async function initializeNewGame(): Promise<void> {
  // Initialize game systems
  game.initialize()
  
  // Ensure game is not paused
  game.resume()
  
  // Reset and initialize player store
  const playerStore = usePlayerStore.getState()
  
  // Reset player attributes to initial values
  playerStore.updateAttribute('hp', 100)
  playerStore.updateAttribute('spirit', 50)
  playerStore.updateAttribute('starve', 50)
  playerStore.updateAttribute('vigour', 50)
  playerStore.updateAttribute('injury', 0)
  playerStore.updateAttribute('infect', 0)
  playerStore.updateAttribute('water', 50)
  playerStore.updateAttribute('virus', 0)
  playerStore.updateAttribute('temperature', 20)
  
  // Reset player stats
  playerStore.setCurrency(0)
  
  // Clear inventory
  Object.keys(playerStore.bag).forEach(itemId => {
    playerStore.removeItemFromBag(itemId, playerStore.getBagItemCount(itemId))
  })
  Object.keys(playerStore.storage).forEach(itemId => {
    playerStore.removeItemFromStorage(itemId, playerStore.getStorageItemCount(itemId))
  })
  
  // Reset equipment
  playerStore.equipItem('gun', null)
  playerStore.equipItem('weapon', null)
  playerStore.equipItem('equip', null)
  playerStore.equipItem('tool', null)
  playerStore.equipItem('special', null)
  
  // Reset dog
  playerStore.updateDogHunger(50)
  playerStore.updateDogMood(50)
  playerStore.updateDogInjury(0)
  playerStore.setDogActive(false)
  
  // Initialize map
  playerStore.initializeMap()
  
  // Set player location to home
  playerStore.setLocation({ isAtHome: true, isAtBazaar: false, isAtSite: false, siteId: null })
  
  // Only add test items if dev=true is in URL
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('dev') === 'true') {
    addTestItemsToStorage()
  }
  
  // Initialize building store (room with default buildings)
  const buildingStore = useBuildingStore.getState()
  buildingStore.initialize()
  
  // Initialize game store (time, weather, etc.)
  const gameStore = useGameStore.getState()
  gameStore.setTime(6 * 60 * 60 + 1) // Start at 6:00:01 (matches original)
  gameStore.initializeWeatherSystem()
}

/**
 * Test function to add items to player storage for testing Storage Panel
 * Adds 1000 of each item from itemConfig, grouped by category
 * Only called when dev=true is in URL
 */
function addTestItemsToStorage(): void {
  const playerStore = usePlayerStore.getState()
  
  // Add 1000 of each item in itemConfig
  Object.keys(itemConfig).forEach(itemId => {
    playerStore.addItemToStorage(itemId, 1000)
  })
  
  // Unlock all map locations
  try {
    const map = playerStore.getMap()
    const allSiteIds = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
      20, 21, 22,
      30, 31, 32, 33,
      41, 42, 43,
      51, 52,
      61,
      100, 201, 202, 203, 204,
      301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312,
      400,
      500, 501, 502,
      666
    ]
    
    allSiteIds.forEach(siteId => {
      map.unlockSite(siteId)
    })
    
    console.log('All map locations unlocked')
    
    // Unlock all NPCs
    try {
      const npcManager = playerStore.getNPCManager()
      const allNpcIds = [1, 2, 3, 4, 5, 6, 7]
      
      allNpcIds.forEach(npcId => {
        map.unlockNpc(npcId, npcManager)
      })
      
      console.log('All NPCs unlocked')
    } catch (error) {
      console.warn('Failed to unlock NPCs:', error)
    }
  } catch (error) {
    console.warn('Failed to unlock map locations:', error)
  }
  
  console.log('Test items added to storage')
}

