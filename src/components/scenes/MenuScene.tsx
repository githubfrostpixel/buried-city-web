/**
 * Main Menu Scene
 * Ported from OriginalGame/src/ui/MenuScene.js
 */

import { useEffect, useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { audioManager, MusicPaths, SoundPaths } from '@/game/systems/AudioManager'
import { getImagePath } from '@/utils/assets'
import { cocosPosition } from '@/utils/position'
import { game } from '@/game/Game'
import { usePlayerStore } from '@/store/playerStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useGameStore } from '@/store/gameStore'
import { itemConfig } from '@/data/items'
import { ImageSprite } from '../sprites/ImageSprite'
import { Sprite } from '../sprites/Sprite'

export function MenuScene() {
  const uiStore = useUIStore()
  const [isDecember, setIsDecember] = useState(false)

  useEffect(() => {
    // Check if December (for Christmas background)
    const now = new Date()
    setIsDecember(now.getMonth() === 11 && now.getDate() > 18)

    // Play main menu music
    audioManager.playMusic(MusicPaths.MAIN_PAGE, true)

    return () => {
      // Stop music when leaving menu
      audioManager.stopMusic()
    }
  }, [])

  const handleNewGame = () => {
    audioManager.playEffect(SoundPaths.CLICK)
    
    // Initialize new game
    initializeNewGame()
    
    // Navigate to main scene
    uiStore.setScene('main')
  }

  const initializeNewGame = () => {
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
    

    addTestItemsToStorage()
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
   * Adds items from all categories to test grouping
   */
  const addTestItemsToStorage = () => {
    const playerStore = usePlayerStore.getState()
    
    // Materials (1101 prefix) - 100 of each
    Object.keys(itemConfig)
      .filter(itemId => itemId.startsWith('1101'))
      .forEach(itemId => {
        playerStore.addItemToStorage(itemId, 100)
      })
    
    // Food (1103 prefix)
    playerStore.addItemToStorage('1103011', 10) // Bread
    playerStore.addItemToStorage('1103022', 8)  // Meat
    playerStore.addItemToStorage('1103033', 6)  // Canned food
    playerStore.addItemToStorage('1103041', 12) // Water
    
    // Medicines (1104 prefix)
    playerStore.addItemToStorage('1104011', 3)  // Medicine
    playerStore.addItemToStorage('1104021', 2) // Bandage
    playerStore.addItemToStorage('1104032', 4) // Antiseptic
    
    // Enhancement (1107 prefix)
    playerStore.addItemToStorage('1107012', 2)  // Enhancement item
    playerStore.addItemToStorage('1107022', 1)  // Enhancement item
    
    // Equipment (13 prefix)
    playerStore.addItemToStorage('1301011', 1)  // Gun
    playerStore.addItemToStorage('1302011', 1)  // Weapon
    playerStore.addItemToStorage('1305011', 50) // Bullet
    playerStore.addItemToStorage('1305012', 30) // Bullet
    
    // Bombs - 100 of each type
    playerStore.addItemToStorage('1303012', 100) // Bomb type 1
    playerStore.addItemToStorage('1303033', 100) // Bomb type 2
    playerStore.addItemToStorage('1303044', 100) // Bomb type 3
    
    // Miscellaneous (other - items not matching above prefixes)
    playerStore.addItemToStorage('1102063', 5)  // Basic item
    playerStore.addItemToStorage('1102073', 3) // Basic item
    
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
    } catch (error) {
      console.warn('Failed to unlock map locations:', error)
    }
    
    console.log('Test items added to storage')
  }

  // Temporary test function to navigate directly to MainScene
  const handleTestMainScene = () => {
    audioManager.playEffect(SoundPaths.CLICK)
    uiStore.setScene('main')
  }

  const handleHallOfFame = () => {
    audioManager.playEffect(SoundPaths.CLICK)
    // TODO: Navigate to Hall of Fame scene
    uiStore.addNotification('Hall of Fame - Coming soon!', 'info')
  }

  const handleAbout = () => {
    audioManager.playEffect(SoundPaths.CLICK)
    // TODO: Show about dialog
    uiStore.addNotification('About - Coming soon!', 'info')
  }

  const handleMedal = () => {
    audioManager.playEffect(SoundPaths.CLICK)
    // TODO: Navigate to medal scene
    uiStore.addNotification('Medals - Coming soon!', 'info')
  }

  const handleAchievement = () => {
    audioManager.playEffect(SoundPaths.CLICK)
    // TODO: Navigate to achievement scene
    uiStore.addNotification('Achievements - Coming soon!', 'info')
  }

  const handleSettings = () => {
    audioManager.playEffect(SoundPaths.CLICK)
    // TODO: Show settings panel
    uiStore.addNotification('Settings - Coming soon!', 'info')
  }

  // Background image path
  const bgPath = isDecember 
    ? getImagePath('sprites/new/menu_bg_christmas.png')
    : getImagePath('sprites/new/menu_bg.png')

  // Screen dimensions (640x1136 from original game)
  const screenWidth = 640
  const screenHeight = 1136

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ maxWidth: screenWidth, maxHeight: screenHeight }}>
      {/* Background */}
      <div className="absolute inset-0">
        <ImageSprite 
          src={bgPath}
          alt="Menu Background"
          className="w-full h-full object-cover"
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Logo */}
      <div 
        className="absolute"
        style={{
          ...cocosPosition(320, 938, 0.5, 0.5, screenHeight),
          width: 'auto',
          height: 'auto'
        }}
      >
        <ImageSprite 
          src={getImagePath('sprites/new/top_logo_en.png')}
          alt="BuriedTown Logo"
        />
      </div>

      {/* Main Buttons */}
      {/* Button 1: New Game */}
      <div 
        className="absolute"
        style={{
          ...cocosPosition(320, 442, 0.5, 0.5, screenHeight),
          width: '242px',
          height: '74px'
        }}
      >
        <button
          onClick={handleNewGame}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          style={{ 
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
        >
          <Sprite 
            atlas="ui" 
            frame="btn_big_white_normal.png"
            className="absolute inset-0"
            style={{ width: '242px', height: '74px' }}
          />
          <span className="relative z-10 text-black font-bold text-lg">New Game</span>
        </button>
      </div>

      {/* Button 2: Hall of Fame */}
      <div 
        className="absolute"
        style={{
          ...cocosPosition(320, 332, 0.5, 0.5, screenHeight),
          width: '242px',
          height: '74px'
        }}
      >
        <button
          onClick={handleHallOfFame}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          style={{ 
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
        >
          <Sprite 
            atlas="ui" 
            frame="btn_big_white_normal.png"
            className="absolute inset-0"
            style={{ width: '242px', height: '74px' }}
          />
          <span className="relative z-10 text-black font-bold text-lg">Hall of Fame</span>
        </button>
      </div>

      {/* Button 3: About */}
      <div 
        className="absolute"
        style={{
          ...cocosPosition(320, 222, 0.5, 0.5, screenHeight),
          width: '242px',
          height: '74px'
        }}
      >
        <button
          onClick={handleAbout}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          style={{ 
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
        >
          <Sprite 
            atlas="ui" 
            frame="btn_big_white_normal.png"
            className="absolute inset-0"
            style={{ width: '242px', height: '74px' }}
          />
          <span className="relative z-10 text-black font-bold text-lg">About</span>
        </button>
      </div>

      {/* Bottom Icon Buttons */}
      {/* Medal Button */}
      <button
        onClick={handleMedal}
        className="absolute w-16 h-16"
        style={cocosPosition(248, 106, 0.5, 0.5, screenHeight)}
      >
        <Sprite 
          atlas="ui" 
          frame="icon_medal.png"
          className="w-full h-full"
        />
      </button>

      {/* Achievement Button */}
      <button
        onClick={handleAchievement}
        className="absolute w-16 h-16"
        style={cocosPosition(392, 106, 0.5, 0.5, screenHeight)}
      >
        <Sprite 
          atlas="ui" 
          frame="btn_achievement.png"
          className="w-full h-full"
        />
      </button>

      {/* Settings Button (Top Right) */}
      <button
        onClick={handleSettings}
        className="absolute w-16 h-16"
        style={cocosPosition(549, 1045, 0.5, 0.5, screenHeight)}
      >
        <Sprite 
          atlas="ui" 
          frame="btn_game_setting.png"
          className="w-full h-full"
        />
      </button>

      {/* Version Text (Bottom Center) */}
      <div 
        className="absolute text-white text-xs text-center"
        style={cocosPosition(320, 20, 0.5, 0.5, screenHeight)}
      >
        "When there's no more room in Hell, the dead will walk the Earth"
      </div>

      {/* TEMPORARY: Test Buttons (Top Left) - Remove after testing */}
      <div
        className="absolute"
        style={{ 
          top: '20px',
          left: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <button
          onClick={handleTestMainScene}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          style={{ fontSize: '12px' }}
        >
          TEST: MainScene
        </button>
        <button
          onClick={() => {
            addTestItemsToStorage()
            uiStore.addNotification('Test items added to storage!', 'success')
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
          style={{ fontSize: '12px' }}
        >
          TEST: Add Items
        </button>
      </div>
    </div>
  )
}

