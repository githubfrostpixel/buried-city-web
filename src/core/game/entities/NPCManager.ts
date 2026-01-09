/**
 * NPC Manager Class
 * Ported from OriginalGame/src/game/npc.js
 * 
 * This is a placeholder implementation for Phase 5.
 * All methods are stubs that will be fully implemented in Phase 5.
 */

import { NPC } from './NPC'
import { npcConfig } from '@/core/data/npcs'
import type { NPCManagerSaveData } from '@/common/types/npc.types'
import { useGameStore } from '@/core/store/gameStore'
import { useLogStore } from '@/core/store/logStore'
import { usePlayerStore } from '@/core/store/playerStore'
import { getString } from '@/common/utils/stringUtil'
import { getSaveSlot } from '@/core/game/systems/save'
import { game } from '@/core/game/Game'
import { emitter } from '@/common/utils/emitter'

/**
 * NPCManager class
 * Manages all NPCs in the game
 */
export class NPCManager {
  npcList: Record<number, NPC>
  private pendingVisit: { npcId: number; type: 'gift' | 'help' } | null = null
  lastGiftDay: number // Day when last gift was sent globally (-1 if never sent)

  constructor() {
    this.npcList = {}
    this.lastGiftDay = -1
    // Listen for sleep end to show pending visits
    emitter.on('sleep_end', () => {
      this.processPendingVisit()
    })
  }

  /**
   * Save all NPCs
   * TODO: Implement in Phase 5
   */
  save(): NPCManagerSaveData {
    const npcSaveObj: Record<string, ReturnType<NPC['save']>> = {}
    for (const npcId in this.npcList) {
      npcSaveObj[npcId] = this.npcList[npcId].save()
    }
    return {
      npcList: npcSaveObj,
      lastGiftDay: this.lastGiftDay
    }
  }

  /**
   * Restore all NPCs from save data
   * TODO: Implement in Phase 5
   */
  restore(saveObj: NPCManagerSaveData | null): void {
    if (saveObj) {
      for (const npcId in saveObj.npcList) {
        const npc = new NPC(Number(npcId))
        npc.restore(saveObj.npcList[npcId])
        this.npcList[Number(npcId)] = npc
      }
      this.lastGiftDay = saveObj.lastGiftDay ?? -1
    } else {
      this.init()
    }
  }

  /**
   * Initialize all NPCs
   * TODO: Implement in Phase 5
   */
  init(): void {
    // Initialize all NPCs from config
    for (const npcId in npcConfig) {
      this.npcList[Number(npcId)] = new NPC(Number(npcId))
    }
    this.lastGiftDay = -1
  }

  /**
   * Get NPC by ID
   */
  getNPC(npcId: number): NPC {
    if (!this.npcList[npcId]) {
      // Initialize if not exists
      this.npcList[npcId] = new NPC(npcId)
    }
    return this.npcList[npcId]
  }

  /**
   * Unlock NPC
   * Ported from OriginalGame/src/game/npc.js unlockNpc() (lines 380-390)
   */
  unlockNpc(npcId: number): void {
    const npc = this.getNPC(npcId)
    if (!npc.isUnlocked) {
      npc.isUnlocked = true
      
      // Unlock on map (makes NPC location available on map)
      // Original: player.map.unlockNpc(npcId)
      try {
        const playerStore = usePlayerStore.getState()
        const map = playerStore.getMap()
        // Pass this as npcManager so Map can get NPC instance for events/logs
        // Map.unlockNpc will NOT call unlockNpc() again since NPC is already unlocked
        map.unlockNpc(npcId, this)
      } catch (error) {
        // Map not initialized yet, skip map unlock for now
        // This can happen during initialization
        console.warn('[NPCManager] Map not available for unlockNpc:', error)
      }
      
      // TODO: Check achievements (Achievement.checkNpcUnlock(npcId))
      // TODO: If All Unlock cheat, set reputation to 10
    }
  }

  /**
   * NPC visits player home
   * Ported from OriginalGame/src/game/npc.js visitPlayer() (lines 332-363)
   */
  visitPlayer(): void {
    const gameStore = useGameStore.getState()
    
    // Check if day >= 2
    if (gameStore.day < 2) {
      return
    }
    
    // Calculate visit chance
    let criteria = 20 // Base 20%
    
    // Check radio messages (last 36 hours)
    const saveSlot = getSaveSlot()
    const radioKey = `radio${saveSlot}`
    const chatlog = JSON.parse(localStorage.getItem(radioKey) || "[]")
    if (chatlog.length > 0) {
      const currentTime = gameStore.time
      const addtime = currentTime - 36 * 60 * 60 // 36 hours ago
      if (chatlog[0].time > addtime) {
        criteria += 20 // +20% bonus
      }
    }
    
    // Random chance check
    const rand = Math.floor(Math.random() * 100)
    if (rand > criteria) {
      return // No visit
    }
    
    // Check if player is sleeping
    const survivalSystem = game.getSurvivalSystem()
    const sleepState = survivalSystem.getSleepState()
    
    if (sleepState.isSleeping) {
      // Player is sleeping, delay the visit until after sleep
      // Select random NPC from pool
      const npcPool = [1, 2, 3, 4, 6, 7]
      if (this.getNPC(5).isUnlocked) {
        npcPool.push(5)
      }
      const npcId = npcPool[Math.floor(Math.random() * npcPool.length)]
      
      // Unlock NPC
      this.unlockNpc(npcId)
      
      // Store pending visit (gifts are only sent at 6:00 AM, so always help)
      this.pendingVisit = {
        npcId,
        type: 'help'
      }
      
      // Add log message (will show when sleep ends)
      // Don't add log yet - wait until sleep ends
      return
    }
    
    // Player is awake, show visit immediately
    // Add log message (1100: "Someone is knocking at your door...")
    useLogStore.getState().addLog(getString(1100))
    
    // Select random NPC from pool
    const npcPool = [1, 2, 3, 4, 6, 7]
    if (this.getNPC(5).isUnlocked) {
      npcPool.push(5)
    }
    const npcId = npcPool[Math.floor(Math.random() * npcPool.length)]
    
    // Unlock NPC
    this.unlockNpc(npcId)
    
    // Show help dialog (gifts are only sent at 6:00 AM via checkAndSendDailyGifts)
    const npc = this.getNPC(npcId)
    npc.needHelp() // TODO: Implement help dialog
  }
  
  /**
   * Process pending visit after sleep ends
   */
  private processPendingVisit(): void {
    if (!this.pendingVisit) return
    
    const { npcId, type } = this.pendingVisit
    this.pendingVisit = null
    
    // Add log message (1100: "Someone is knocking at your door...")
    useLogStore.getState().addLog(getString(1100))
    
    // Show help dialog (gifts are only sent at 6:00 AM)
    const npc = this.getNPC(npcId)
    npc.needHelp()
  }

  /**
   * NPC comes to buy from player
   * Ported from OriginalGame/src/game/npc.js visitSale() (lines 364-379)
   */
  visitSale(): void {
    const rand = Math.floor(Math.random() * 7)
    
    if (rand !== 0) {
      // Random NPC (1-7)
      const npc = this.getNPC(rand)
      if (npc.isUnlocked) {
        // Gifts are only sent at 6:00 AM, so only show sale dialog
        npc.needSell(rand) // TODO: Implement sale dialog
      }
    } else {
      // Special case: NPC 1 (always available)
      const npc = this.getNPC(1)
      npc.needSell(rand) // TODO: Implement sale dialog
    }
  }

  /**
   * Update trading items for all NPCs
   * TODO: Implement in Phase 5
   */
  updateTradingItem(): void {
    for (const npcId in this.npcList) {
      this.npcList[npcId].updateTradingItem()
    }
  }

  /**
   * Check and send daily gifts at 6:00 AM
   * Only one gift per day total (across all NPCs)
   */
  checkAndSendDailyGifts(): void {
    const gameStore = useGameStore.getState()
    const currentDay = gameStore.day
    
    // Check if a gift was already sent today
    if (this.lastGiftDay >= currentDay) {
      return // Already sent a gift today
    }
    
    // Check all unlocked NPCs in priority order
    // Find the first NPC with an unreceived gift
    for (const npcId in this.npcList) {
      const npc = this.npcList[npcId]
      
      // Only check unlocked NPCs
      if (!npc.isUnlocked) continue
      
      // Check if NPC has an unreceived gift
      if (!npc.needSendGift()) continue
      
      // Send the gift
      npc.sendGift()
      
      // Mark that a gift was sent today (globally)
      this.lastGiftDay = currentDay
      
      // Only send one gift per day total, so break after first gift sent
      break
    }
  }
}

