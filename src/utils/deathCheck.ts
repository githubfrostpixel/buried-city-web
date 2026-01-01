/**
 * Death Check Utility
 * Checks for death conditions when attributes change
 * Ported from OriginalGame/src/game/player.js changeAttr() method
 * 
 * Death conditions:
 * 1. HP = 0 → 'hp_zero' or 'infection' (if infect >= max)
 * 2. Virus >= max → 'virus_overload' (sets HP to 0, then dies)
 * 3. Infect >= max + HP = 0 → 'infection' (checked when HP changes to 0)
 */

import { usePlayerStore } from '@/store/playerStore'
import type { PlayerAttributes } from '@/types/player.types'
import type { DeathReason } from '@/types/game.types'
import { game } from '@/game/Game'
import { useUIStore } from '@/store/uiStore'

/**
 * Check for death conditions after attribute change
 * Returns death reason if player died, null otherwise
 * 
 * Original: OriginalGame/src/game/player.js:673-683
 */
export function checkDeathOnAttributeChange(
  attr: keyof PlayerAttributes,
  newValue: number
): DeathReason | null {
  const playerStore = usePlayerStore.getState()
  
  // HP death check (Original: if (key === "hp") { if (this.hp == 0 && this === player) { this.die(); } })
  if (attr === 'hp' && newValue === 0) {
    // Check if death was caused by infection
    // Original: infection death is checked in updateInfect() when HP reaches 0
    // For now, check if infect is at max when HP reaches 0
    if (playerStore.infect >= playerStore.infectMax) {
      return 'infection'
    }
    return 'hp_zero'
  }
  
  // Virus death check (Original: if (key == "virus") { if (this.virus >= this.virusMax && this === player) { ... } })
  if (attr === 'virus' && newValue >= playerStore.virusMax) {
    return 'virus_overload'
  }
  
  // Note: Infect death is checked when HP changes to 0, not when infect changes
  // This is handled in the HP death check above
  
  return null
}

/**
 * Handle player death
 * Pauses game and shows death overlay
 * 
 * Original: OriginalGame/src/game/player.js:1657-1663
 */
export function handleDeath(reason: DeathReason): void {
  const gameInstance = game
  
  // Get current state
  const currentState = useUIStore.getState()
  
  // Pause game first (Original: game.stop())
  gameInstance.pause()
  
  // Close any open dialogs/overlays first (e.g., ItemDialog)
  // This ensures death overlay is visible
  // Note: hideOverlay() sets deathReason to null, so we need to set it again
  if (currentState.activeOverlay && currentState.activeOverlay !== 'death') {
    useUIStore.getState().hideOverlay()
  }
  
  // Show death overlay (Original: Navigation.gotoDeathNode())
  // Must pass reason in data object for showOverlay to set deathReason
  useUIStore.getState().showOverlay('death', { reason })
  
  // TODO: Reset map position (Original: this.map.resetPos())
  // TODO: Set isDead flag (Original: this.isDead = true)
  // TODO: Abort buffs (Original: this.buffManager.abortBuff())
}

