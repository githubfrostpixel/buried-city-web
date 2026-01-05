/**
 * MainScene Component
 * Main game scene with TopSection and BottomSection
 * Ported from OriginalGame/src/ui/MainScene.js
 * 
 * Structure matches original:
 * - TopFrame (TopSection) at z-index 1
 * - BottomFrame (BottomSection) with current panel at z-index 0
 * 
 * Refactored to use extracted modules for better maintainability:
 * - Custom hooks for music, game loop, and bottom bar subtexts
 * - Navigation handlers for panel-specific back button logic
 * - Panel renderer and title utilities
 * - Button visibility utilities
 */

import { useEffect } from 'react'
import { TopSection } from '@/layout/TopSection'
import { BottomSection } from '@/layout/BottomSection'
import { useUIStore } from '@/core/store/uiStore'
import { usePlayerStore } from '@/core/store/playerStore'
import { useBuildingStore } from '@/core/store/buildingStore'
import { audioManager, SoundPaths } from '@/core/game/systems/AudioManager'
import { useMainSceneMusic } from '@/common/hooks/useMainSceneMusic'
import { useGameLoop } from '@/common/hooks/useGameLoop'
import { useSiteBottomBarSubtexts } from '@/common/hooks/useSiteBottomBarSubtexts'
import { handlePanelBack } from '@/scene/navigation/panelNavigationHandlers'
import { PanelRenderer } from '@/scene/navigation/panelRenderer'
import { getPanelTitle } from '@/scene/navigation/panelTitleUtils'
import { shouldShowBackButton, shouldShowForwardButton } from '@/scene/navigation/buttonVisibility'

export function MainScene() {
  const uiStore = useUIStore()
  const buildingStore = useBuildingStore()
  const playerStore = usePlayerStore() // Subscribe to playerStore changes
  const currentPanel = uiStore.openPanel
  
  const screenWidth = 640
  const screenHeight = 1136
  
  // Initialize to home panel if none open (matches Navigation.current() behavior)
  useEffect(() => {
    if (!currentPanel) {
      uiStore.openPanelAction('home')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount
  
  // Custom hooks for music, game loop, and bottom bar subtexts
  useMainSceneMusic({ currentPanel, sitePanelSiteId: uiStore.sitePanelSiteId })
  useGameLoop()
  const siteBottomBarSubtexts = useSiteBottomBarSubtexts({
    currentPanel,
    sitePanelSiteId: uiStore.sitePanelSiteId,
    siteExplorePanelSiteId: uiStore.siteExplorePanelSiteId,
    siteStoragePanelSiteId: uiStore.siteStoragePanelSiteId,
    map: playerStore.map
  })
  
  // Navigation handlers
  const handleBackButton = () => {
    handlePanelBack(currentPanel, uiStore, playerStore)
  }
  
  // Handle forward button click
  const handleForwardButton = () => {
    if (currentPanel === 'gate') {
      // Gate panel: Go Out
      const playerStoreState = usePlayerStore.getState()
      playerStoreState.out()
      
      // Play FOOT_STEP sound
      audioManager.playEffect(SoundPaths.FOOT_STEP)
      
      // Call deleteUnusableSite if map exists
      // Note: Map should always be initialized in new game, but check for safety
      let map = playerStoreState.map
      if (!map) {
        // Edge case: Map not initialized (shouldn't happen in new game)
        // Initialize map if missing (defensive programming)
        console.warn('Map is null, initializing map...')
        playerStoreState.initializeMap()
        map = playerStoreState.map
      }
      if (map) {
        map.deleteUnusableSite()
      }
      
      // Navigate to gate out panel (transition)
      // Gate out panel will auto-navigate to map after 3 seconds
      uiStore.openPanelAction('gateOut')
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
      {/* TopFrame (TopSection) - z-index 1, always visible */}
      <TopSection />
      
      {/* BottomFrame (BottomSection) - z-index 0, contains current panel */}
      <BottomSection
        title={getPanelTitle(currentPanel, uiStore, buildingStore, playerStore)}
        leftBtn={shouldShowBackButton(currentPanel, uiStore, playerStore)}
        rightBtn={shouldShowForwardButton(currentPanel)}
        onLeftClick={handleBackButton}
        onRightClick={handleForwardButton}
        fullScreen={currentPanel === 'home' || currentPanel === 'gateOut' || currentPanel === 'map'} // Home, gate out, and map panels use fullScreen mode
        {...siteBottomBarSubtexts}
      >
        <PanelRenderer 
          currentPanel={currentPanel}
          uiStore={uiStore}
          playerStore={playerStore}
        />
      </BottomSection>
    </div>
  )
}



