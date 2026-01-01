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
import { useUIStore } from '@/store/uiStore'
import { audioManager, MusicPaths } from '@/game/systems/AudioManager'

export function MainScene() {
  const uiStore = useUIStore()
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
  
  // Handle back button - matches original back button behavior
  const handleBackButton = () => {
    if (currentPanel === 'home') {
      // On home panel, back button should show exit dialog
      // For now, just log (exit dialog to be implemented later)
      console.log('Exit to menu - dialog to be implemented')
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
      case 'build':
        // return <BuildPanel />
        return <div className="text-white p-4">Build Panel - Coming soon</div>
      
      case 'storage':
        // return <StoragePanel />
        return <div className="text-white p-4">Storage Panel - Coming soon</div>
      
      case 'radio':
        // return <RadioPanel />
        return <div className="text-white p-4">Radio Panel - Coming soon</div>
      
      default:
        // Default to home (matches Navigation.current() default)
        return <HomePanelContent />
    }
  }
  
  // Determine panel title (from original BottomFrameNode uiConfig)
  const getPanelTitle = (): string => {
    switch (currentPanel) {
      case 'home': return ''
      case 'build': return 'Building'
      case 'storage': return 'Storage'
      case 'radio': return 'Radio'
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
    // Most panels don't need forward button in original game
    return false
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
        onRightClick={() => {}}
        fullScreen={currentPanel === 'home'} // Home panel uses fullScreen mode
      >
        {renderPanel()}
      </BottomBar>
    </div>
  )
}

