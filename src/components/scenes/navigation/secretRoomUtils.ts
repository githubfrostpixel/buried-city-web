/**
 * Secret Room Utilities
 * Centralized secret room state management logic
 * Extracted from MainScene.tsx to eliminate duplication
 */

import { Site } from '@/game/world/Site'
import { audioManager, MusicPaths, getSiteMusic } from '@/game/systems/AudioManager'
import { saveAll } from '@/game/systems/SaveSystem'

/**
 * Check if site has active secret room state
 */
export function hasSecretRoomState(site: Site): boolean {
  const condition1 = site.isInSecretRooms
  const condition2 = site.isSecretRoomsEntryShowed
  const condition3a = (site.secretRoomsShowedCount ?? 0) > 0
  const condition3b = (site.secretRooms?.length ?? 0) > 0
  const condition3c = !site.isSecretRoomsEnd()
  const condition3 = condition3a && condition3b && condition3c
  
  return condition1 || condition2 || condition3
}

/**
 * Clear secret room state (with music handling)
 * This ensures state is cleared regardless of which navigation path is taken
 */
export async function clearSecretRoomState(site: Site): Promise<void> {
  console.log('[secretRoomUtils] Clearing secret room state:', {
    isInSecretRooms: site.isInSecretRooms,
    isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
    secretRoomsShowedCount: site.secretRoomsShowedCount
  })
  
  site.secretRoomsEnd()
  
  // Stop secret room music and resume site music when leaving secret rooms
  // (matches OriginalGame/src/ui/battleAndWorkNode.js:116-119)
  if (audioManager.getPlayingMusic() === MusicPaths.SITE_SECRET) {
    audioManager.stopMusic()
    const siteMusic = getSiteMusic(site.id)
    audioManager.playMusic(siteMusic, true)
  }
  
  site.isSecretRoomsEntryShowed = false
  
  // Prevent re-discovery by setting showedCount to maxCount
  // This ensures that once you leave secret rooms, you can't re-enter them
  if (site.secretRoomsConfig) {
    const maxCount = Number.parseInt(site.secretRoomsConfig.maxCount)
    site.secretRoomsShowedCount = maxCount
  }
  
  // Auto-save to persist the state
  try {
    await saveAll()
    console.log('[secretRoomUtils] Secret room state cleared and saved')
  } catch (err) {
    console.error('[secretRoomUtils] Auto-save failed:', err)
    throw err
  }
}

/**
 * Check if secret room warning should be shown
 * Returns true if user is in secret rooms, entry dialog is shown, or previously entered secret rooms
 */
export function shouldShowSecretRoomWarning(site: Site): boolean {
  return hasSecretRoomState(site)
}

