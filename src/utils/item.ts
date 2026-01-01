/**
 * Item utility functions
 * Ported from OriginalGame/src/util/utils.js
 */

import { itemConfig } from '@/data/items'
import { Item } from '@/game/inventory/Item'
import { getRandomInt, getRoundRandom } from './random'
import type { SiteProduceItem } from '@/types/site.types'

// Blacklist for random item generation (wildcard mode)
// Items that cannot drop from wildcard patterns
const RANDOM_LOOP_BLACKLIST = [
  1305023, 1305024, 1106013, 1106054, 1306001, 1305034, 1305053, 1305064,
  1303033, 1303044, 1102053, 1107012, 1107022, 1107032, 1107042, 1101081
]

/**
 * Get random item ID from wildcard pattern
 * Ported from OriginalGame/src/util/utils.js:getRandomItemId
 * 
 * @param itemId - Item ID pattern (e.g., "1101**" for any item starting with 1101)
 * @returns Resolved item ID or null if no match
 */
export function getRandomItemId(itemId: string): string | null {
  if (itemId.indexOf('*') === -1) {
    return itemId  // No wildcard, return as-is
  }
  
  const itemIds = Object.keys(itemConfig)
  const itemIdStr = String(itemId)
  let index = 0
  let filteredIds = [...itemIds]
  
  for (let i = 0; i < itemIdStr.length; i++) {
    if (itemIdStr[i] === '*') {
      // Skip wildcard character
    } else {
      const len = index === 6 ? 1 : 2
      const flag = itemIdStr.substr(i, len)
      
      filteredIds = filteredIds.filter((iid) => {
        // Exclude blacklisted items
        if (RANDOM_LOOP_BLACKLIST.indexOf(Number(iid)) !== -1) {
          return false
        }
        const iidStr = String(iid)
        return flag === iidStr.substr(index, len)
      })
      i++  // Skip next character (already processed)
    }
    index += 2
  }
  
  if (filteredIds.length === 0) {
    return null
  } else {
    return filteredIds[getRandomInt(0, filteredIds.length - 1)]
  }
}

/**
 * Generate item IDs based on produce value
 * Ported from OriginalGame/src/util/utils.js:getFixedValueItemIds
 * 
 * @param produceValue - Target total value
 * @param produceList - Weighted list of possible items
 * @returns Array of item IDs
 */
export function getFixedValueItemIds(
  produceValue: number,
  produceList: SiteProduceItem[]
): string[] {
  const itemIds: string[] = []
  let remainingValue = produceValue
  
  while (remainingValue > 0) {
    // Get weighted random item from produce list
    const itemInfo = getRoundRandom(produceList)
    const itemId = getRandomItemId(itemInfo.itemId)
    
    if (!itemId) {
      throw new Error(`Failed to resolve item ID from pattern: ${itemInfo.itemId}`)
    }
    
    const itemc = itemConfig[itemId]
    if (!itemc) {
      throw new Error(`Item config not found: ${itemId}`)
    }
    
    const value = itemc.value
    remainingValue -= value
    itemIds.push(itemId)
  }
  
  return itemIds
}

/**
 * Convert item IDs to Item objects
 * Ported from OriginalGame/src/util/utils.js:convertItemIds2Item
 * 
 * @param itemIds - Array of item ID strings
 * @returns Array of Item objects
 */
export function convertItemIds2Item(itemIds: string[]): Item[] {
  return itemIds.map((itemId) => {
    return new Item(itemId)
  })
}


