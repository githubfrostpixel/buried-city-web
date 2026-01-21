/**
 * Item utility functions
 * Ported from OriginalGame/src/util/utils.js
 */

import { itemConfig } from '@/core/data/items'
import { Item } from '@/core/game/inventory/Item'
import { getRandomInt, getRoundRandom } from './random'
import type { SiteProduceItem } from '@/common/types/site.types'

// Blacklist for random item generation (wildcard mode)
// Items that cannot drop from wildcard patterns
const RANDOM_LOOP_BLACKLIST = [
                                                      'item_ammo_enhanced_backpack', 'item_ammo_military_grade_backpack', 'item_special_dog', 'item_special_first_aid_kit', 'item_equip_other_boot', 'item_ammo_motorcycle', 'item_ammo_strong_flashlight', 'item_ammo_hyper_detector',
  'item_weapon_explosive_rocket_launcher', 'item_weapon_explosive_grenade', 'item_model_motorcycle_engine', 'item_buff_protoplasm_serum', 'item_buff_transmission_blocker', 'item_buff_stimpack', 'item_buff_military_ration', 'item_mat_fertilizer'
]

/**
 * Mapping from old numeric wildcard patterns to new string-based patterns
 */
const WILDCARD_PATTERN_MAP: Record<string, string> = {
  '1101**': 'item_mat_*',      // Any material item
  '1101*1': 'item_mat_*',      // Any material item (same as 1101**)
  '1102**': 'item_model_*',   // Any model part
  '1103*1': 'item_food_*',    // Any food item (all food items match)
  '1104*1': 'item_med_*',     // Any medicine item
  '1105**': 'item_econ_*',     // Any econ item
  '1301**': 'item_weapon_gun_*', // Any gun weapon
  '1302*1': 'item_weapon_melee_*', // Any melee weapon
}

/**
 * Get random item ID from wildcard pattern
 * Supports both old numeric patterns (e.g., "1101**") and new string patterns (e.g., "item_mat_*")
 * 
 * @param itemId - Item ID pattern (e.g., "item_mat_*" for any material item)
 * @returns Resolved item ID or null if no match
 */
export function getRandomItemId(itemId: string): string | null {
  // Convert old numeric patterns to new string patterns
  if (WILDCARD_PATTERN_MAP[itemId]) {
    itemId = WILDCARD_PATTERN_MAP[itemId]
  }
  
  if (itemId.indexOf('*') === -1) {
    return itemId  // No wildcard, return as-is
  }
  
  const itemIds = Object.keys(itemConfig)
  let filteredIds = [...itemIds]
  
  // Handle string-based wildcard patterns (e.g., "item_mat_*", "item_weapon_gun_*")
  if (itemId.includes('*')) {
    // Convert wildcard pattern to regex
    // "item_mat_*" -> matches items starting with "item_mat_"
    // "item_weapon_gun_*" -> matches items starting with "item_weapon_gun_"
    const pattern = itemId.replace(/\*/g, '.*')
    const regex = new RegExp(`^${pattern}$`)
    
    filteredIds = filteredIds.filter((iid) => {
      // Exclude blacklisted items
      if (RANDOM_LOOP_BLACKLIST.includes(iid)) {
        return false
      }
      return regex.test(iid)
    })
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


