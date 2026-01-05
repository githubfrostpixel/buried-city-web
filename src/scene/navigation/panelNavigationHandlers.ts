/**
 * Panel Navigation Handlers
 * Extract all panel-specific back button handlers
 * Extracted from MainScene.tsx
 */

import type { Panel } from '@/core/store/uiStore'
import { useUIStore } from '@/core/store/uiStore'
import { usePlayerStore } from '@/core/store/playerStore'

// Get store state types by calling getState() on the store
type UIStoreState = ReturnType<typeof useUIStore.getState>
type PlayerStoreState = ReturnType<typeof usePlayerStore.getState>
import { getString } from '@/common/utils/stringUtil'
import { saveAll } from '@/core/game/systems/SaveSystem'
import { handleGateBack } from './gatePanelUtils'
import { hasSecretRoomState, clearSecretRoomState, shouldShowSecretRoomWarning } from './secretRoomUtils'
import { audioManager, MusicPaths, getSiteMusic } from '@/core/game/systems/AudioManager'

/**
 * Handle home panel back button
 * On home panel, back button should show exit dialog
 * (Exit dialog to be implemented later)
 */
export function handleHomeBack(uiStore: UIStoreState): void {
  // On home panel, back button should show exit dialog
  // For now, just log (exit dialog to be implemented later)
  console.log('Exit to menu - dialog to be implemented')
}

/**
 * Handle site panel back button
 * When at a site, navigate back to map (not home)
 * This matches the navigation flow: Home → Map → Site → (back) → Map
 */
export function handleSiteBack(uiStore: UIStoreState): void {
  uiStore.openPanelAction('map')
}

/**
 * Handle NPC panel back button
 * When at an NPC, navigate back to map (not home)
 * This matches the navigation flow: Home → Map → NPC → (back) → Map
 */
export function handleNpcBack(uiStore: UIStoreState): void {
  uiStore.openPanelAction('map')
}

/**
 * Handle NPC storage panel back button
 * When at NPC storage (trade panel), navigate back to NPC panel
 */
export function handleNpcStorageBack(uiStore: UIStoreState): void {
  const npcId = uiStore.npcStoragePanelNpcId
  if (npcId) {
    uiStore.openPanelAction('npc', undefined, undefined, npcId)
  } else {
    uiStore.openPanelAction('map')
  }
}

/**
 * Handle site storage panel back button
 * When at site storage, navigate back to site panel
 */
export function handleSiteStorageBack(uiStore: UIStoreState): void {
  const siteId = uiStore.siteStoragePanelSiteId
  if (siteId) {
    uiStore.openPanelAction('site', undefined, siteId)
  } else {
    uiStore.openPanelAction('map')
  }
}

/**
 * Handle site explore panel back button
 * Complex handler that manages work storage, battle end, and secret room states
 */
export async function handleSiteExploreBack(
  uiStore: UIStoreState,
  playerStore: PlayerStoreState,
  siteId: number | null
): Promise<void> {
  console.error('[panelNavigationHandlers] ===== BACK BUTTON IN SITEEXPLORE =====')
  console.log('[panelNavigationHandlers] Back button clicked in siteExplore panel', {
    isInWorkStorageView: uiStore.isInWorkStorageView,
    siteId: siteId,
    timestamp: Date.now()
  })
  
  // Get site to check secret room state
  let site = null
  if (siteId && playerStore.map) {
    site = playerStore.map.getSite(siteId)
  }
  
  // ALWAYS clear secret room state when leaving siteExplore (safety net)
  // This ensures state is cleared regardless of which navigation path is taken
  if (site) {
    const hasState = hasSecretRoomState(site)
    console.error('[panelNavigationHandlers] ALWAYS CLEAR: Checking secret room state:', {
      isInSecretRooms: site.isInSecretRooms,
      isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
      secretRoomsShowedCount: site.secretRoomsShowedCount,
      hasSecretRoomState: hasState
    })
    
    if (hasState) {
      console.error('[panelNavigationHandlers] ALWAYS CLEAR: Clearing secret room state!')
      try {
        await clearSecretRoomState(site)
      } catch (err) {
        console.error('[panelNavigationHandlers] Auto-save failed in ALWAYS CLEAR:', err)
      }
    }
  }
  
  // Check if we're in work storage view - if so, handle work storage back
  if (uiStore.isInWorkStorageView) {
    console.log('[panelNavigationHandlers] In work storage view, handling work storage back')
    
    // Call flush function BEFORE clearing flag and navigating
    const flushFn = uiStore.workStorageFlushFunction
    if (flushFn) {
      // Flush function gets siteId from site object in closure
      flushFn()
    } else {
      console.warn('[panelNavigationHandlers] No flush function available when clicking back from work storage')
    }
    
    // Clear the flag and flush function
    uiStore.setWorkStorageView(false)
    uiStore.setWorkStorageFlushFunction(null)
    console.log('[panelNavigationHandlers] Work room back - flushed items, cleared flag, navigating to site panel')
    
    // Navigate back to site panel
    if (siteId) {
      uiStore.openPanelAction('site', undefined, siteId)
    } else {
      uiStore.openPanelAction('map')
    }
    return
  }
  
  // Check if we're in battle end view with a win - if so, complete room before navigating back
  if (uiStore.isInBattleEndView) {
    console.log('[panelNavigationHandlers] In battle end view, handling battle end back')
    
    // Call completion function BEFORE clearing flag and navigating
    const completeFn = uiStore.battleEndCompleteFunction
    if (completeFn) {
      // Completion function will complete the room (and end secret rooms if applicable)
      completeFn()
    } else {
      console.warn('[panelNavigationHandlers] No completion function available when clicking back from battle end')
    }
    
    // Clear the flag and completion function
    uiStore.setBattleEndView(false)
    uiStore.setBattleEndCompleteFunction(null)
    console.log('[panelNavigationHandlers] Battle end back - completed room, cleared flag, navigating to site panel')
    
    // Navigate back to site panel
    if (siteId) {
      uiStore.openPanelAction('site', undefined, siteId)
    } else {
      uiStore.openPanelAction('map')
    }
    return
  }
  
  // Normal back navigation - check for secret room warning
  if (site && shouldShowSecretRoomWarning(site)) {
    // Handle secret room back - show warning dialog (matches original game)
    // This handles: currently in secret rooms, entry dialog shown, or previously entered secret rooms
    console.log('[panelNavigationHandlers] ===== SECRET ROOM BACK BUTTON CLICKED =====')
    console.log('[panelNavigationHandlers] Secret room state BEFORE showing warning:', {
      isInSecretRooms: site.isInSecretRooms,
      isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
      secretRoomsShowedCount: site.secretRoomsShowedCount
    })
    
    // Show warning dialog (matches original game showSecretRoomLeaveWarning)
    const warningMessage = getString(1229) || 'You cannot reenter the secret room once you leave. Are you sure you want to leave?'
    
    uiStore.showOverlay('confirmationDialog', {
      message: warningMessage,
      confirmText: getString(1228) || 'Leave',
      cancelText: getString(1157) || 'Never mind',
      onConfirm: async () => {
        // End secret rooms and clear entry flag (prevents re-entry)
        // This matches original game: once you leave secret rooms, you can't re-enter
        const beforeSecretRoomsEnd = {
          isInSecretRooms: site.isInSecretRooms,
          isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed
        }
        site.secretRoomsEnd()
        const afterSecretRoomsEnd = {
          isInSecretRooms: site.isInSecretRooms,
          isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed
        }
        console.log('[panelNavigationHandlers] After secretRoomsEnd():', {
          before: beforeSecretRoomsEnd,
          after: afterSecretRoomsEnd
        })
        
        // Stop secret room music and resume site music when leaving secret rooms
        // (matches OriginalGame/src/ui/battleAndWorkNode.js:116-119)
        if (audioManager.getPlayingMusic() === MusicPaths.SITE_SECRET) {
          audioManager.stopMusic()
          const siteMusic = getSiteMusic(site.id)
          audioManager.playMusic(siteMusic, true)
        }
        
        // Clear entry flag
        site.isSecretRoomsEntryShowed = false
        
        // Prevent re-discovery by setting showedCount to maxCount
        // This ensures that once you leave secret rooms, you can't re-enter them
        if (site.secretRoomsConfig) {
          const maxCount = Number.parseInt(site.secretRoomsConfig.maxCount)
          const oldCount = site.secretRoomsShowedCount
          site.secretRoomsShowedCount = maxCount
          console.log('[panelNavigationHandlers] Prevented re-discovery by setting secretRoomsShowedCount:', {
            oldCount,
            newCount: site.secretRoomsShowedCount,
            maxCount
          })
        }
        
        console.log('[panelNavigationHandlers] After clearing flags and preventing re-discovery:', {
          isInSecretRooms: site.isInSecretRooms,
          isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
          secretRoomsShowedCount: site.secretRoomsShowedCount
        })
        
        // Auto-save to persist the state
        console.log('[panelNavigationHandlers] Starting auto-save to persist secret room state...')
        try {
          await saveAll()
          console.log('[panelNavigationHandlers] Auto-save completed. Secret room state after save:', {
            isInSecretRooms: site.isInSecretRooms,
            isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
            secretRoomsShowedCount: site.secretRoomsShowedCount
          })
        } catch (err) {
          console.error('[panelNavigationHandlers] Auto-save failed:', err)
        }
        
        console.log('[panelNavigationHandlers] ===== SECRET ROOM BACK PROCESSING COMPLETE =====')
        
        // Navigate back to site panel
        if (siteId) {
          uiStore.openPanelAction('site', undefined, siteId)
        } else {
          uiStore.openPanelAction('map')
        }
      },
      onCancel: () => {
        // User cancelled, do nothing
        console.log('[panelNavigationHandlers] Secret room leave cancelled by user')
      }
    })
    return
  }
  
  // Normal site explore back - but still check for secret rooms to clear state
  console.log('[panelNavigationHandlers] Normal back navigation, checking for secret rooms to clear')
  
  // Always clear secret room state when leaving siteExplore, even if condition didn't match
  // This ensures state is cleared regardless of which path we take
  if (site) {
    const hasState = hasSecretRoomState(site)
    
    if (hasState) {
      console.log('[panelNavigationHandlers] Clearing secret room state in normal back path')
      try {
        await clearSecretRoomState(site)
      } catch (err) {
        console.error('[panelNavigationHandlers] Auto-save failed in normal back path:', err)
      }
    }
  }
  
  if (siteId) {
    uiStore.openPanelAction('site', undefined, siteId)
  } else {
    uiStore.openPanelAction('map')
  }
}

/**
 * Handle default back button (for panels not explicitly handled)
 * Navigate back to home (matches Navigation.back() behavior)
 */
export function handleDefaultBack(uiStore: UIStoreState): void {
  uiStore.openPanelAction('home')
}

/**
 * Main router function for panel back button
 * Routes to appropriate handler based on current panel
 */
export function handlePanelBack(
  currentPanel: Panel,
  uiStore: UIStoreState,
  playerStore: PlayerStoreState
): void {
  console.log('[panelNavigationHandlers] handlePanelBack called', { 
    currentPanel, 
    isInWorkStorageView: uiStore.isInWorkStorageView, 
    hasFlushFunction: !!uiStore.workStorageFlushFunction 
  })
  
  try {
    if (currentPanel === 'home') {
      handleHomeBack(uiStore)
    } else if (currentPanel === 'gate') {
      handleGateBack(uiStore)
    } else if (currentPanel === 'site') {
      handleSiteBack(uiStore)
    } else if (currentPanel === 'npc') {
      handleNpcBack(uiStore)
    } else if (currentPanel === 'npcStorage') {
      handleNpcStorageBack(uiStore)
    } else if (currentPanel === 'siteStorage') {
      handleSiteStorageBack(uiStore)
    } else if (currentPanel === 'siteExplore') {
      const siteId = uiStore.siteExplorePanelSiteId
      // Note: handleSiteExploreBack is async, but we can't await here
      // The function handles its own async operations internally
      handleSiteExploreBack(uiStore, playerStore, siteId).catch((err) => {
        console.error('[panelNavigationHandlers] Error in handleSiteExploreBack:', err)
      })
    } else {
      handleDefaultBack(uiStore)
    }
  } catch (error) {
    console.error('[panelNavigationHandlers] Error in handlePanelBack:', error)
  }
}

