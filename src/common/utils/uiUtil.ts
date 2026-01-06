/**
 * UI Utility Functions
 * Ported from OriginalGame/src/ui/uiUtil.js
 */

import { usePlayerStore } from '@/core/store/playerStore'
import { useUIStore } from '@/core/store/uiStore'
import { getString } from './stringUtil'
import { game } from '@/core/game/Game'

/**
 * Check if player can eat (starve is not max)
 * Returns false if starve is max, shows error dialog
 */
export function checkStarve(): boolean {
  const playerStore = usePlayerStore.getState()
  
  if (playerStore.isAttrMax('starve')) {
    // Show error dialog (string ID 1128)
    const uiStore = useUIStore.getState()
    const message = getString(1128) || 'Cannot eat when full'
    uiStore.addNotification(message, 'warning')
    return false
  }
  
  return true
}

/**
 * Check if player has enough vigour (energy)
 * Returns false if vigour is low, shows error dialog
 * Ported from OriginalGame/src/ui/uiUtil.js:1320-1327
 */
export function checkVigour(): boolean {
  const playerStore = usePlayerStore.getState()
  const survivalSystem = game.getSurvivalSystem()
  
  // Get vigour range info (low vigour is range ID 1, which is <= 25)
  const attrRangeInfo = survivalSystem.getAttrRangeInfo('vigour', playerStore.vigour)
  
  // TODO: Check buff ITEM_1107032 prevents vigour effects
  // if (buffManager.isBuffEffect(BuffItemEffectType.ITEM_1107032)) {
  //   return true
  // }
  
  // Check if vigour is low (range ID 1)
  if (attrRangeInfo && attrRangeInfo.id === 1) {
    // Show error dialog (string ID 1133)
    const uiStore = useUIStore.getState()
    const message = getString(1133) || 'You are too tired to do anything. Go to bed.'
    uiStore.addNotification(message, 'warning')
    return false
  }
  
  return true
}

/**
 * Show tiny info dialog
 * Accepts string messages or string IDs (numbers)
 * Ported from OriginalGame/src/ui/uiUtil.js:1301-1318
 */
export function showTinyInfoDialog(message: string | number, ...args: any[]): void {
  const uiStore = useUIStore.getState()
  
  // If message is a number (string ID), resolve it using getString
  let displayMessage: string
  if (typeof message === 'number') {
    displayMessage = getString(message, ...args) || `Message ${message}`
  } else {
    displayMessage = message
  }
  
  uiStore.addNotification(displayMessage, 'info')
}

