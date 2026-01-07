/**
 * Radio Command Processor
 * Processes radio commands and returns response messages
 * Ported from OriginalGame/src/ui/radioNode.js sendMsg()
 */

import { usePlayerStore } from '@/core/store/playerStore'
import { getUUID } from '@/core/game/systems/save'
import { itemConfig } from '@/core/data/items'
import { Storage } from '@/core/game/inventory/Storage'
import { WorkSite } from '@/core/game/map/Site'

export interface RadioMessage {
  uid: string | number
  msg: string
  time: number
}

export interface CommandEffects {
  type: 'heal' | 'kill' | 'fix' | 'obtain' | 'backup' | 'restore' | 'eval'
  data?: any
}

const HASHSECRET = 'PlzDontCheatTheAchievementsPlz'

/**
 * Check if IAP is unlocked (stub for now)
 */
function isIAPUnlocked(): boolean {
  // TODO: Implement IAP check
  return false
}

/**
 * Simple MD5 hash (stub - should use proper crypto library)
 * TODO: Use proper MD5 implementation
 */
function md5HexDigest(str: string): string {
  // Stub implementation - should use crypto library
  // For now, return a simple hash
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
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
  
  // Extract command prefix
  const spaceIndex = command.indexOf(' ')
  const prefix = spaceIndex > 0 ? command.substring(0, spaceIndex) : command
  
  // Check IAP requirement (except for backup and restore)
  if (!isIAPUnlocked() && prefix !== 'backup' && prefix !== 'restore') {
    // Commands that don't require IAP: help, heal, kill, fix, friendship
    if (command !== 'help' && command !== 'heal' && command !== 'kill' && command !== 'fix' && prefix !== 'friendship') {
      // Return without processing
      msgData.uid = Math.floor(Math.random() * 9999999) + 1
      return { message: msgData }
    }
  }
  
  // Process commands
  if (command === 'help') {
    msgData.msg = 'Welcome to the Cheat Terminal.\n\nCommand:\nobtain \'name\' int: Obtain item given name, amount.\nobtain everything int: Obtain everything given amount.\nheal: Heal the player on all aspect.\nkill: kill the player.\nfix: Fix generator and gas pump if fixable.\nfriendship npcId amount: Increase NPC friendship (reputation) by amount.\nbackup: Set achievement & medal data to input.\nRestore {data}: Restore backed-up data.'
  } else if (prefix === 'obtain') {
    // Parse: obtain <itemName> <amount>
    const field = command.substring(spaceIndex + 1)
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
        // Update player store storage
        playerStore.addItemToStorage('', 0) // Trigger storage update
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
        }
      }
      
      if (!found) {
        msgData.msg = 'Item name is not found. Please check the name.'
      } else {
        msgData.msg = 'Item added. Enjoy...'
        return { message: msgData, effects: { type: 'obtain', data: { itemName, amount } } }
      }
    }
  } else if (prefix === 'restore') {
    const field = command.substring(spaceIndex + 1)
    
    if (!field || field === '') {
      msgData.msg = 'Data cannot be null.'
    } else {
      try {
        if (field.length > 9999) {
          throw new Error('Data too long')
        }
        
        const payload = JSON.parse(field)
        const md5 = md5HexDigest(JSON.stringify(payload.data) + HASHSECRET)
        
        if (md5 !== payload.hash) {
          throw new Error('Hash mismatch')
        }
        
        const dataKeys = Object.keys(payload.data)
        if (dataKeys.length !== 2 && dataKeys.length !== 3) {
          throw new Error('Invalid data structure')
        }
        
        let count = 0
        let otp = ''
        
        // Restore achievement
        if (payload.data.achievement) {
          localStorage.setItem('achievement', JSON.stringify(payload.data.achievement))
          count++
        }
        
        // Restore medal
        if (payload.data.medal) {
          // Check if medal data is outdated (medal 103 aim != 5)
          if (payload.data.medal['103'] && payload.data.medal['103'].aim !== 5) {
            localStorage.setItem('medal', JSON.stringify(payload.data.medal))
            count++
          } else {
            otp += 'Medal data is outdated, discarded. '
          }
        }
        
        // Restore dataLog
        if (payload.data.dataLog) {
          localStorage.setItem('dataLog', JSON.stringify(payload.data.dataLog))
          count++
        }
        
        msgData.msg = `Restore ${count}/3 success. ${otp}`
        return { message: msgData, effects: { type: 'restore', data: payload } }
      } catch (ex) {
        msgData.msg = 'Input JSON data invalid.'
      }
    }
  } else if (prefix === uuid.substring(uuid.length - 5)) {
    // Eval command (last 5 chars of UUID as prefix)
    const field = command.substring(spaceIndex + 1)
    
    if (!field || field === '') {
      msgData.msg = 'Evaled content cannot be null.'
    } else {
      // Security: Only eval if IAP unlocked
      if (isIAPUnlocked()) {
        try {
          // eslint-disable-next-line no-eval
          eval(field)
          msgData.msg = 'Eval success.'
          return { message: msgData, effects: { type: 'eval', data: field } }
        } catch (ex) {
          msgData.msg = 'Eval error: ' + (ex as Error).message
        }
      } else {
        msgData.msg = 'Eval command requires IAP unlock.'
      }
    }
  } else {
    // Simple commands
    if (command === 'heal') {
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
    } else if (command === 'kill') {
      // Kill player by setting HP to 0
      playerStore.updateAttribute('hp', -playerStore.hp)
      msgData.msg = 'Bye'
      return { message: msgData, effects: { type: 'kill' } }
    } else if (command === 'fix') {
      // Fix generator (site 204) and gas pump (site 201 if has motorcycle)
      const map = playerStore.getMap()
      const generatorSite = map.getSite(204)
      if (generatorSite && generatorSite instanceof WorkSite) {
        generatorSite.fix()
      }
      
      // TODO: Check if player has motorcycle
      // For now, always try to fix gas pump
      const gasSite = map.getSite(201)
      if (gasSite && gasSite instanceof WorkSite) {
        gasSite.fix()
      }
      
      msgData.msg = 'Site fixed'
      return { message: msgData, effects: { type: 'fix' } }
    } else if (prefix === 'friendship') {
      // Parse: friendship <npcId> <amount>
      const field = command.substring(spaceIndex + 1)
      const npcIdSpaceIndex = field.indexOf(' ')
      const npcIdStr = npcIdSpaceIndex > 0 ? field.substring(0, npcIdSpaceIndex) : field
      const amountStr = npcIdSpaceIndex > 0 ? field.substring(npcIdSpaceIndex + 1) : ''
      const npcId = Number(npcIdStr)
      const amount = Number(amountStr)
      
      if (isNaN(npcId) || npcId < 1 || npcId > 7) {
        msgData.msg = 'NPC ID must be a number between 1 and 7.'
      } else if (isNaN(amount) || amount === 0) {
        msgData.msg = 'Amount must be a non-zero number.'
      } else {
        try {
          const npcManager = playerStore.getNPCManager()
          const npc = npcManager.getNPC(npcId)
          
          // Increase reputation (clamped to 0-10)
          const oldRep = npc.reputation
          npc.changeReputation(amount)
          const newRep = npc.reputation
          
          const npcName = npc.getName()
          if (newRep === oldRep) {
            msgData.msg = `${npcName} reputation is already at ${newRep >= 10 ? 'maximum' : 'minimum'}.`
          } else {
            msgData.msg = `${npcName} friendship increased from ${oldRep} to ${newRep}.`
            return { message: msgData, effects: { type: 'eval', data: { npcId, amount, oldRep, newRep } } }
          }
        } catch (error) {
          msgData.msg = `Failed to update NPC ${npcId}: ${(error as Error).message}`
        }
      }
    } else if (command === 'backup') {
      // Generate backup string
      const payload: any = {
        data: {
          achievement: JSON.parse(localStorage.getItem('achievement') || '{}'),
          medal: JSON.parse(localStorage.getItem('medal') || '{}'),
          dataLog: JSON.parse(localStorage.getItem('dataLog') || '[]')
        }
      }
      payload.hash = md5HexDigest(JSON.stringify(payload.data) + HASHSECRET)
      
      // Return backup string in message (will be set to input)
      msgData.msg = JSON.stringify(payload)
      return { message: msgData, effects: { type: 'backup', data: payload } }
    } else {
      msgData.msg = 'Type \'help\' to learn about the cheat terminal.'
    }
  }
  
  // Set random UID for non-player messages
  msgData.uid = Math.floor(Math.random() * 9999999) + 1
  
  return { message: msgData }
}

