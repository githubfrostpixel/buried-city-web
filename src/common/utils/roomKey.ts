import { Site } from '@/core/game/world/Site'
import { Room } from '@/common/types/site.types'

/**
 * Generate unique key for a room
 * @param site Site instance
 * @param room Room instance (optional, for validation)
 * @returns Unique room key string
 */
export function getRoomKey(site: Site, room?: Room): string {
  if (site.isInSecretRooms) {
    return `${site.id}-secret-${site.secretRoomsStep}`
  } else {
    return `${site.id}-${site.step}`
  }
}



