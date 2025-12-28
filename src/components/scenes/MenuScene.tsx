/**
 * Main Menu Scene
 * Ported from OriginalGame/src/ui/MenuScene.js
 */

import { useEffect, useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { audioManager, MusicPaths, SoundPaths } from '@/game/systems/AudioManager'
import { getImagePath } from '@/utils/assets'
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
    uiStore.setScene('saveFile')
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
          left: '50%',
          top: '938px',
          transform: 'translateX(-50%)',
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
      <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
        {/* Button 1: New Game */}
        <div className="relative mb-5" style={{ width: '242px', height: '74px' }}>
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
        <div className="relative mb-5" style={{ width: '242px', height: '74px' }}>
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
        <div className="relative" style={{ width: '242px', height: '74px' }}>
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
      </div>

      {/* Bottom Icon Buttons */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-4" style={{ bottom: '106px' }}>
        {/* Medal Button */}
        <button
          onClick={handleMedal}
          className="w-16 h-16"
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
          className="w-16 h-16"
        >
          <Sprite 
            atlas="ui" 
            frame="btn_achievement.png"
            className="w-full h-full"
          />
        </button>
      </div>

      {/* Settings Button (Top Right) */}
      <button
        onClick={handleSettings}
        className="absolute w-16 h-16"
        style={{ 
          top: '91px',
          right: '91px'
        }}
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
        style={{ 
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        BuriedTown React Port - Phase 1
      </div>
    </div>
  )
}

