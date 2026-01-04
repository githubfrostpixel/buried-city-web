/**
 * Gate Panel Utilities
 * Extract gate panel item transfer logic
 * Extracted from MainScene.tsx
 */

import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'

// Get store state type by calling getState() on the store
type UIStoreState = ReturnType<typeof useUIStore.getState>

/**
 * Transfer all items from bag to storage
 */
export function transferBagToStorage(): void {
  const playerStore = usePlayerStore.getState()
  const bagItems = { ...playerStore.bag }
  
  // Transfer all items from bag to storage
  Object.entries(bagItems).forEach(([itemId, count]) => {
    if (count > 0) {
      playerStore.addItemToStorage(itemId, count)
      playerStore.removeItemFromBag(itemId, count)
    }
  })
}

/**
 * Unequip items not in bag
 * Items in storage cannot be equipped when outside
 */
export function unequipItemsNotInBag(): void {
  const stateAfterTransfer = usePlayerStore.getState()
  const slots: Array<'gun' | 'weapon' | 'equip' | 'tool' | 'special'> = ['gun', 'weapon', 'equip', 'tool', 'special']
  const newEquipment = { ...stateAfterTransfer.equipment }
  let equipmentChanged = false
  
  for (const slot of slots) {
    const equippedItemId = stateAfterTransfer.equipment[slot]
    if (equippedItemId && equippedItemId !== "1") { // Skip hand (weapon slot default)
      const bagCount = stateAfterTransfer.bag[equippedItemId] || 0
      
      // If item is not in bag, unequip it
      if (bagCount === 0) {
        if (slot === 'weapon') {
          // Weapon always defaults to hand
          newEquipment[slot] = "1"
        } else {
          newEquipment[slot] = null
        }
        equipmentChanged = true
      }
    }
  }
  
  // Update equipment if any changes were made
  if (equipmentChanged) {
    usePlayerStore.setState({ equipment: newEquipment })
  }
}

/**
 * Handle gate panel back button
 * Transfers all items from bag to storage and unequips items not in bag
 */
export function handleGateBack(uiStore: UIStoreState): void {
  // Transfer all items from bag to storage
  transferBagToStorage()
  
  // After transferring all items, unequip any items that are no longer in the bag
  unequipItemsNotInBag()
  
  // Navigate back to home
  uiStore.openPanelAction('home')
}

