/**
 * UI Utility Functions
 * Ported from OriginalGame/src/ui/uiUtil.js
 */

import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'

/**
 * Check if player can eat (starve is not max)
 * Returns false if starve is max, shows error dialog
 */
export function checkStarve(): boolean {
  const playerStore = usePlayerStore.getState()
  
  if (playerStore.isAttrMax('starve')) {
    // Show error dialog (TODO: Use string system - string ID 1128)
    const uiStore = useUIStore.getState()
    uiStore.addNotification('Cannot eat when full', 'warning')
    return false
  }
  
  return true
}

/**
 * Show tiny info dialog (placeholder for now)
 * TODO: Implement proper dialog system
 */
export function showTinyInfoDialog(message: string): void {
  const uiStore = useUIStore.getState()
  uiStore.addNotification(message, 'info')
}

