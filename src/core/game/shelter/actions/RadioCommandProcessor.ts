/**
 * Radio Command Processor
 * Processes radio commands and returns response messages
 * Ported from OriginalGame/src/ui/radioNode.js sendMsg()
 */

import { usePlayerStore } from '@/core/store/playerStore'
import { getUUID } from '@/core/game/systems/save'
import { itemConfig } from '@/core/data/items'
import { Storage } from '@/core/game/inventory/Storage'

export interface RadioMessage {
  uid: string | number
  msg: string
  time: number
}

export interface CommandEffects {
  type: 'heal' | 'obtain' | 'unlockmap' | 'giveitem'
  data?: any
}

/**
 * Check if IAP is unlocked
 * For development/mod version, always return true to allow commands
 */
function isIAPUnlocked(): boolean {
  // TODO: Implement proper IAP check for production
  // For now, return true to allow all commands in development
  return true
}

/**
 * Process radio command and return response message
 */
export async function processRadioCommand(
  command: string,
  time: number
): Promise<{ message: RadioMessage; effects?: CommandEffects }> {
  const playerStore = usePlayerStore.getState()
  const uuid = await getUUID()
  
  // Create initial message (will be modified by command processing)
  const msgData: RadioMessage = {
    uid: uuid,
    msg: command,
    time: Math.round(time)
  }
  
  // Remove leading slash if present (e.g., "/giveitem" -> "giveitem")
  const normalizedCommand = command.startsWith('/') ? command.substring(1) : command
  
  // Extract command prefix
  const spaceIndex = normalizedCommand.indexOf(' ')
  const prefix = spaceIndex > 0 ? normalizedCommand.substring(0, spaceIndex) : normalizedCommand
  
  // Check IAP requirement
  if (!isIAPUnlocked()) {
    // Commands that don't require IAP: heal
    if (normalizedCommand !== 'heal') {
      // Return without processing
      msgData.uid = Math.floor(Math.random() * 9999999) + 1
      return { message: msgData }
    }
  }
  
  // Process commands
  if (prefix === 'obtain') {
    // Parse: obtain <itemName> <amount>
    const field = spaceIndex > 0 ? normalizedCommand.substring(spaceIndex + 1) : ''
    const itemNameSpaceIndex = field.indexOf(' ')
    const itemName = itemNameSpaceIndex > 0 ? field.substring(0, itemNameSpaceIndex) : field
    const amountStr = itemNameSpaceIndex > 0 ? field.substring(itemNameSpaceIndex + 1) : ''
    const amount = Number(amountStr)
    
    if (isNaN(amount) || amount === null || amount === 0) {
      msgData.msg = 'Item number not a number or is 0.'
    } else {
      let found = false
      
      if (itemName === 'everything') {
        found = true
        // Add currency
        playerStore.addCurrency(amount)
        // Add all items
        const storage = new Storage('player')
        storage.restore(playerStore.storage)
        for (const itemId in itemConfig) {
          storage.increaseItem(itemId, amount, true)
        }
        // Update player store storage with the modified storage
        const updatedStorage = storage.save()
        usePlayerStore.setState({ storage: updatedStorage })
        // Add fuel
        // TODO: Add fuel change method
        // playerStore.onFuelChange(amount)
      } else {
        // Check for currency (string 13) and fuel (string 16)
        // For now, check item names directly
        // TODO: Use string system to get proper names
        if (itemName.toLowerCase() === 'currency' || itemName.toLowerCase() === 'money') {
          playerStore.addCurrency(amount)
          found = true
        } else if (itemName.toLowerCase() === 'fuel') {
          // TODO: Add fuel change method
          // playerStore.onFuelChange(amount)
          found = true
        } else {
          // Search for item by name
          // TODO: Use string system to get item name for proper matching
          // For now, obtain command requires exact item ID or IAP unlock
          // This is a simplified implementation
          const storage = new Storage('player')
          storage.restore(playerStore.storage)
          // Try to match itemId directly (itemName might be itemId)
          if (itemConfig[itemName]) {
            storage.increaseItem(itemName, amount, true)
            found = true
          } else {
            // Search by itemId (fallback - not ideal but works for now)
            for (const itemId in itemConfig) {
              if (itemId.toLowerCase() === itemName.toLowerCase()) {
                storage.increaseItem(itemId, amount, true)
                found = true
                break
              }
            }
          }
          
          // Update player store storage if item was found
          if (found) {
            const updatedStorage = storage.save()
            usePlayerStore.setState({ storage: updatedStorage })
          }
        }
      }
      
      if (!found) {
        msgData.msg = 'Item name is not found. Please check the name.'
      } else {
        msgData.msg = 'Item added. Enjoy...'
        return { message: msgData, effects: { type: 'obtain', data: { itemName, amount } } }
      }
    }
  } else if (prefix === 'giveitem') {
    // Parse: giveitem everything
    const field = spaceIndex > 0 ? normalizedCommand.substring(spaceIndex + 1) : ''
    
    if (field === 'everything') {
      const amount = 100 // Fixed amount per item
      let itemCount = 0
      
      // Group items by main category (first 2 digits)
      const itemsByCategory: Record<string, string[]> = {}
      
      for (const itemId in itemConfig) {
        const category = itemId.substring(0, 2) // First 2 digits
        if (!itemsByCategory[category]) {
          itemsByCategory[category] = []
        }
        itemsByCategory[category].push(itemId)
      }
      
      // Add items by category
      const storage = new Storage('player')
      storage.restore(playerStore.storage)
      
      for (const category in itemsByCategory) {
        for (const itemId of itemsByCategory[category]) {
          storage.increaseItem(itemId, amount, true)
          itemCount++
        }
      }
      
      // Update player store storage with the modified storage
      const updatedStorage = storage.save()
      usePlayerStore.setState({ storage: updatedStorage })
      
      // Add currency
      playerStore.addCurrency(amount)
      
      // Add fuel (if method exists)
      // TODO: Add fuel change method
      // playerStore.onFuelChange(amount)
      
      msgData.msg = `Added ${itemCount} items (100 each) from ${Object.keys(itemsByCategory).length} categories. Enjoy...`
      return { message: msgData, effects: { type: 'giveitem', data: { command: 'giveitem everything', itemCount, categories: Object.keys(itemsByCategory).length } } }
    } else {
      msgData.msg = 'Usage: /giveitem everything'
    }
  } else if (normalizedCommand === 'unlockmap') {
    const map = playerStore.getMap()
    
    // All site IDs from the game
    const allSiteIds = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
      20, 21, 22,
      30, 31, 32, 33,
      41, 42, 43,
      51, 52,
      61,
      100, 201, 202, 203, 204,
      301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312,
      400,
      500, 501, 502,
      666
    ]
    
    // Unlock all sites
    allSiteIds.forEach(siteId => {
      map.unlockSite(siteId)
    })
    
    msgData.msg = 'All map locations unlocked.'
    return { message: msgData, effects: { type: 'unlockmap' } }
  } else if (normalizedCommand === 'heal') {
    // Heal all attributes to max
    // updateAttribute expects the NEW absolute value, not a delta
    playerStore.updateAttribute('spirit', playerStore.spiritMax)
    playerStore.updateAttribute('vigour', playerStore.vigourMax)
    playerStore.updateAttribute('starve', playerStore.starveMax)
    playerStore.updateAttribute('infect', 0) // Remove all infection
    playerStore.updateAttribute('injury', 0) // Remove all injury
    playerStore.updateAttribute('hp', playerStore.hpMax)
    playerStore.updateAttribute('water', playerStore.waterMax)
    playerStore.updateAttribute('virus', 0) // Remove all virus
    
    // Dog attributes
    playerStore.updateDogHunger(playerStore.dog.hungerMax)
    playerStore.updateDogMood(playerStore.dog.moodMax)
    playerStore.updateDogInjury(0) // Remove all injury
    
    msgData.msg = 'You are healed. Welcome.'
    return { message: msgData, effects: { type: 'heal' } }
  } else {
    msgData.msg = 'Unknown command. Available commands: /obtain, /obtain everything, /giveitem everything, /unlockmap, /heal'
  }
  
  // Set random UID for non-player messages
  msgData.uid = Math.floor(Math.random() * 9999999) + 1
  
  return { message: msgData }
}

