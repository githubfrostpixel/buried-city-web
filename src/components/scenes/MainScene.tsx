/**
 * MainScene Component
 * Main game scene with TopBar and BottomBar
 * Ported from OriginalGame/src/ui/MainScene.js
 * 
 * Structure matches original:
 * - TopFrame (TopBar) at z-index 1
 * - BottomFrame (BottomBar) with current panel at z-index 0
 */

import { useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { BottomBar } from '@/components/layout/BottomBar'
import { HomePanelContent } from '@/components/panels/HomePanelContent'
import { BuildPanelContent } from '@/components/panels/BuildPanelContent'
import { StoragePanelContent } from '@/components/panels/StoragePanelContent'
import { RadioPanelContent } from '@/components/panels/RadioPanelContent'
import { GatePanelContent } from '@/components/panels/GatePanelContent'
import { useUIStore } from '@/store/uiStore'
import { useBuildingStore } from '@/store/buildingStore'
import { usePlayerStore } from '@/store/playerStore'
import { audioManager, MusicPaths, SoundPaths } from '@/game/systems/AudioManager'
import { game } from '@/game/Game'

export function MainScene() {
  const uiStore = useUIStore()
  const buildingStore = useBuildingStore()
  const currentPanel = uiStore.openPanel
  
  // Screen dimensions (640x1136 from original game)
  const screenWidth = 640
  const screenHeight = 1136
  
  // Initialize to home panel if none open (matches Navigation.current() behavior)
  useEffect(() => {
    if (!currentPanel) {
      uiStore.openPanelAction('home')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount
  
  // Play home music when entering main scene (matches Navigation music logic)
  // Home, Build, Storage, Gate, Radio panels all use HOME music
  useEffect(() => {
    if (currentPanel === 'home' || 
        currentPanel === 'build' || 
        currentPanel === 'storage' || 
        currentPanel === 'gate' ||
        currentPanel === 'radio') {
      audioManager.playMusic(MusicPaths.HOME, true)
    }
  }, [currentPanel])
  
  // Stop music when leaving main scene (matches Navigation.stopMusic())
  useEffect(() => {
    return () => {
      audioManager.stopMusic()
    }
  }, [])

  // Game loop - update game every frame
  useEffect(() => {
    // Ensure game is initialized and resumed
    game.initialize()
    game.resume()
    
    let lastTime = performance.now()
    let animationFrameId: number
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000 // Convert to seconds
      lastTime = currentTime
      
      // Update game systems (time, survival, etc.)
      game.update(deltaTime)
      
      // Continue loop
      animationFrameId = requestAnimationFrame(gameLoop)
    }
    
    // Start game loop
    animationFrameId = requestAnimationFrame(gameLoop)
    
    // Cleanup on unmount
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])
  
  // Handle back button - matches original back button behavior
  const handleBackButton = () => {
    if (currentPanel === 'home') {
      // On home panel, back button should show exit dialog
      // For now, just log (exit dialog to be implemented later)
      console.log('Exit to menu - dialog to be implemented')
    } else if (currentPanel === 'gate') {
      // When leaving Gate panel, transfer all items from bag to storage
      const playerStore = usePlayerStore.getState()
      const bagItems = { ...playerStore.bag }
      
      // Transfer all items from bag to storage
      Object.entries(bagItems).forEach(([itemId, count]) => {
        if (count > 0) {
          playerStore.addItemToStorage(itemId, count)
          playerStore.removeItemFromBag(itemId, count)
        }
      })
      
      // Navigate back to home
      uiStore.openPanelAction('home')
    } else {
      // Navigate back to home (matches Navigation.back() behavior)
      uiStore.openPanelAction('home')
    }
  }
  
  // Render current panel based on openPanel state
  // Matches Navigation.current() behavior
  const renderPanel = () => {
    switch (currentPanel) {
      case 'home':
        return <HomePanelContent />
      
      // Future panels (to be implemented in later phases)
      // These will be 1:1 ports of original panels
      case 'build': {
        const buildingId = uiStore.buildPanelBuildingId
        if (buildingId) {
          return <BuildPanelContent buildingId={buildingId} />
        }
        return <div className="text-white p-4">No building selected</div>
      }
      
      case 'storage':
        return <StoragePanelContent />
      
      case 'radio':
        return <RadioPanelContent />
      
      case 'gate':
        return <GatePanelContent />
      
      default:
        // Default to home (matches Navigation.current() default)
        return <HomePanelContent />
    }
  }
  
  // Determine panel title (from original BottomFrameNode uiConfig)
  const getPanelTitle = (): string => {
    switch (currentPanel) {
      case 'home': return ''
      case 'build': {
        const buildingId = uiStore.buildPanelBuildingId
        if (buildingId) {
          const building = buildingStore.getBuilding(buildingId)
          return building && buildingStore.room
            ? buildingStore.room.getBuildCurrentName(buildingId)
            : 'Building'
        }
        return 'Building'
      }
      case 'storage': {
        // Get building 13 (Storage Shelf) name
        const building = buildingStore.getBuilding(13)
        return building && buildingStore.room
          ? buildingStore.room.getBuildCurrentName(13)
          : 'Storage'
      }
      case 'radio': {
        // Get building 15 (Radio) name
        const building = buildingStore.getBuilding(15)
        return building && buildingStore.room
          ? buildingStore.room.getBuildCurrentName(15)
          : 'Radio'
      }
      case 'gate': {
        // Get building 14 (Gate) name
        const building = buildingStore.getBuilding(14)
        return building && buildingStore.room
          ? buildingStore.room.getBuildCurrentName(14)
          : 'Gate'
      }
      default: return ''
    }
  }
  
  // Determine if back button should be shown (from original uiConfig.leftBtn)
  const shouldShowBackButton = (): boolean => {
    // Show back button if not on home panel
    return currentPanel !== 'home' && currentPanel !== null
  }
  
  // Determine if forward button should be shown (from original uiConfig.rightBtn)
  const shouldShowForwardButton = (): boolean => {
    // Gate panel has forward button (Go Out)
    return currentPanel === 'gate'
  }
  
  // Handle forward button click
  const handleForwardButton = () => {
    if (currentPanel === 'gate') {
      // Gate panel: Go Out
      const playerStore = usePlayerStore.getState()
      playerStore.out()
      
      // Play FOOT_STEP sound
      audioManager.playEffect(SoundPaths.FOOT_STEP)
      
      // Navigate to map scene
      // TODO: For now, navigate to map scene directly
      // In original game, it goes to GATE_OUT_NODE first, then to MAP_NODE
      // We'll skip the gate out transition for now
      uiStore.setScene('map')
    }
  }
  
  return (
    <div
      data-test-id="mainscene-container"
      className="relative"
      style={{
        width: `${screenWidth}px`,
        height: `${screenHeight}px`,
        margin: '0 auto',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        backgroundColor: '#000000' // Black background like original game
      }}
    >
      {/* TopFrame (TopBar) - z-index 1, always visible */}
      <TopBar />
      
      {/* BottomFrame (BottomBar) - z-index 0, contains current panel */}
      <BottomBar
        title={getPanelTitle()}
        leftBtn={shouldShowBackButton()}
        rightBtn={shouldShowForwardButton()}
        onLeftClick={handleBackButton}
        onRightClick={handleForwardButton}
        fullScreen={currentPanel === 'home'} // Home panel uses fullScreen mode
      >
        {renderPanel()}
      </BottomBar>
    </div>
  )
}

