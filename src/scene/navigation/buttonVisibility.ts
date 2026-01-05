/**
 * Button Visibility Utilities
 * Extract button visibility calculation logic
 * Extracted from MainScene.tsx
 */

import type { Panel } from '@/core/store/uiStore'
import { useUIStore } from '@/core/store/uiStore'
import { usePlayerStore } from '@/core/store/playerStore'

// Get store state types by calling getState() on the store
type UIStoreState = ReturnType<typeof useUIStore.getState>
type PlayerStoreState = ReturnType<typeof usePlayerStore.getState>

/**
 * Determine if back button should be shown (from original uiConfig.leftBtn)
 */
export function shouldShowBackButton(
  currentPanel: Panel,
  uiStore: UIStoreState,
  playerStore: PlayerStoreState
): boolean {
  // Gate out panel has no buttons
  if (currentPanel === 'gateOut') return false
  // Map panel has no buttons (matches original uiConfig.leftBtn: false)
  if (currentPanel === 'map') return false
  
  // Disable back button during battle (matches original game behavior)
  if (currentPanel === 'siteExplore') {
    const isInBattle = uiStore.isInBattle
    if (isInBattle) {
      return false // Disable back button during battle
    }
    
    // Hide left button when secret room entry is shown (matches original game: this.leftBtn.setVisible(false))
    const siteId = uiStore.siteExplorePanelSiteId
    if (siteId) {
      const map = playerStore.map
      if (map) {
        const site = map.getSite(siteId)
        if (site && site.isSecretRoomsEntryShowed) {
          return false // Hide left button when secret room entry dialog is shown
        }
      }
    }
  }
  
  // Show back button if not on home panel
  return currentPanel !== 'home' && currentPanel !== null
}

/**
 * Determine if forward button should be shown (from original uiConfig.rightBtn)
 */
export function shouldShowForwardButton(currentPanel: Panel): boolean {
  // Gate out panel has no buttons
  if (currentPanel === 'gateOut') return false
  // Map panel has no buttons (matches original uiConfig.rightBtn: false)
  if (currentPanel === 'map') return false
  // Gate panel has forward button (Go Out)
  return currentPanel === 'gate'
}

