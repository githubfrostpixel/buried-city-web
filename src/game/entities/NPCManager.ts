/**
 * NPC Manager Class
 * Ported from OriginalGame/src/game/npc.js
 * 
 * This is a placeholder implementation for Phase 5.
 * All methods are stubs that will be fully implemented in Phase 5.
 */

import { NPC } from './NPC'
import { npcConfig } from '@/data/npcs'
import type { NPCManagerSaveData } from '@/types/npc.types'

/**
 * NPCManager class
 * Manages all NPCs in the game
 */
export class NPCManager {
  npcList: Record<number, NPC>

  constructor() {
    this.npcList = {}
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
      npcList: npcSaveObj
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
   * TODO: Implement in Phase 5
   */
  unlockNpc(npcId: number): void {
    const npc = this.getNPC(npcId)
    if (!npc.isUnlocked) {
      npc.isUnlocked = true
      // TODO: Unlock on map, check achievements
      // TODO: If All Unlock cheat, set reputation to 10
    }
  }

  /**
   * NPC visits player home
   * TODO: Implement in Phase 5
   */
  visitPlayer(): void {
    // Placeholder: Will implement visit logic in Phase 5
    // - Check if day >= 2
    // - Random chance (20% base, +20% if radio message sent in last 36 hours)
    // - Select random NPC from pool
    // - Unlock NPC
    // - Show gift or help dialog
  }

  /**
   * NPC comes to buy from player
   * TODO: Implement in Phase 5
   */
  visitSale(): void {
    // Placeholder: Will implement sale logic in Phase 5
    // - Random NPC selection
    // - Show sale dialog
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
}

