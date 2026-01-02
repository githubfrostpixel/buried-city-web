/**
 * Actor Velocity Calculation Utilities
 * Calculate actor movement speed based on equipment and conditions
 * Ported from OriginalGame/src/ui/MapNode.js Actor class
 */

import type { PlayerStore } from '@/store/playerStore'

// Velocity constants (from original game)
// Original: MAX_VELOCITY = 97 / (60 * 60) * 0.88
// This is in pixels per game second
const BASE_VELOCITY_GAME = (97 / (60 * 60)) * 0.88  // Base speed in pixels per game second

// For real-time animation, we need to scale it
// Time scale: 1 real second = 100 game seconds (10 * 60 / 6)
const TIME_SCALE = (10 * 60) / 6  // 100
export const MAX_VELOCITY = BASE_VELOCITY_GAME * TIME_SCALE  // Convert to pixels per real second (for animation)
export const MAX_VELOCITY_ENHANCE = BASE_VELOCITY_GAME * 0.5  // Boots boost (game time)
export const MAX_VELOCITY_ENHANCE_MOTO = BASE_VELOCITY_GAME * 2  // Motorcycle boost (game time)

/**
 * Get maximum velocity for actor movement (in game time - for travel time calculation)
 * @param playerStore Player store instance
 * @param canAfford Whether player can afford fuel (for motorcycle)
 * @param weatherSpeedMultiplier Weather speed multiplier (default: 0)
 * @returns Maximum velocity in pixels per game second (for time calculation)
 */
export function getMaxVelocityGameTime(
  playerStore: PlayerStore,
  canAfford: boolean,
  weatherSpeedMultiplier: number = 0
): number {
  let v = BASE_VELOCITY_GAME
  
  // Check motorcycle (item 1305034)
  const hasMotorcycle = playerStore.getStorageItemCount('1305034') > 0 || 
                        playerStore.getBagItemCount('1305034') > 0
  
  if (hasMotorcycle && canAfford && playerStore.useMoto) {
    v += MAX_VELOCITY_ENHANCE_MOTO
  }
  
  // Check boots (item 1306001)
  const hasBoots = playerStore.getStorageItemCount('1306001') > 0 || 
                   playerStore.getBagItemCount('1306001') > 0
  if (hasBoots) {
    v += MAX_VELOCITY_ENHANCE
  }
  
  // Weather effect
  v += BASE_VELOCITY_GAME * weatherSpeedMultiplier
  
  return v
}

/**
 * Get maximum velocity for actor movement (in real time - for animation)
 * @param playerStore Player store instance
 * @param canAfford Whether player can afford fuel (for motorcycle)
 * @param weatherSpeedMultiplier Weather speed multiplier (default: 0)
 * @returns Maximum velocity in pixels per real second (for animation)
 */
export function getMaxVelocity(
  playerStore: PlayerStore,
  canAfford: boolean,
  weatherSpeedMultiplier: number = 0
): number {
  // Get game-time velocity and scale it for real-time animation
  const gameTimeVelocity = getMaxVelocityGameTime(playerStore, canAfford, weatherSpeedMultiplier)
  return gameTimeVelocity * TIME_SCALE
}

