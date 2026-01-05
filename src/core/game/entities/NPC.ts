/**
 * NPC Entity Class
 * Ported from OriginalGame/src/game/npc.js
 * 
 * This is a placeholder implementation for Phase 5.
 * All methods are stubs that will be fully implemented in Phase 5.
 */

import { Storage } from '@/core/game/inventory/Storage'
import { clone } from '@/common/utils/clone'
import { npcConfig } from '@/core/data/npcs'
import { getString } from '@/common/utils/stringUtil'
import type {
  NPCConfig,
  NPCSaveData,
  NeedItem,
  Gift,
  StealLogEntry
} from '@/common/types/npc.types'
import { Item } from '@/core/game/inventory/Item'
import { useLogStore } from '@/core/store/logStore'
import { audioManager, SoundPaths } from '@/core/game/systems/AudioManager'
import { useUIStore } from '@/core/store/uiStore'
import { usePlayerStore } from '@/core/store/playerStore'

/**
 * NPC class
 * Represents a non-player character in the game
 */
export class NPC {
  id: number
  config: NPCConfig
  pos: { x: number; y: number }
  reputation: number // 0-10
  reputationMax: number // 10
  maxRep: number // Highest reputation reached (-1 initially)
  tradingCount: number
  storage: Storage
  // Temp storage for trade preview (not persisted)
  tempBagPreview?: Storage  // Preview of player bag with temp changes
  tempStoragePreview?: Storage  // Preview of NPC storage with temp changes
  isUnlocked: boolean
  isSteal: boolean // Can steal today
  Alert: number // Alert level (0-30)
  log: StealLogEntry[] // Stealing history
  needSendGiftList: {
    item?: Gift[]
    site?: Gift[]
  }

  constructor(npcId: number) {
    this.id = npcId
    const configData = npcConfig[String(npcId)]
    if (!configData) {
      throw new Error(`NPC config not found for ID: ${npcId}`)
    }
    this.config = clone(configData) as NPCConfig
    this.pos = { ...this.config.coordinate }
    this.reputation = 0
    this.reputationMax = 10
    this.maxRep = -1
    this.tradingCount = 0
    this.storage = new Storage(`npc_${npcId}`)
    this.isUnlocked = false
    this.isSteal = true
    this.Alert = 0
    this.log = []
    this.needSendGiftList = {}
    this.changeReputation(0)
  }

  /**
   * Save NPC state
   * TODO: Implement in Phase 5
   */
  save(): NPCSaveData {
    return {
      pos: { ...this.pos },
      reputation: this.reputation,
      maxRep: this.maxRep,
      storage: this.storage.save(),
      needSendGiftList: { ...this.needSendGiftList },
      isUnlocked: this.isUnlocked,
      tradingCount: this.tradingCount,
      isSteal: this.isSteal,
      Alert: this.Alert,
      log: [...this.log]
    }
  }

  /**
   * Restore NPC state from save data
   * TODO: Implement in Phase 5
   */
  restore(saveObj: NPCSaveData | null): void {
    if (saveObj) {
      this.pos = { ...saveObj.pos }
      this.reputation = saveObj.reputation
      this.maxRep = saveObj.maxRep
      this.storage.restore(saveObj.storage)
      this.needSendGiftList = { ...saveObj.needSendGiftList }
      this.isUnlocked = saveObj.isUnlocked
      this.tradingCount = saveObj.tradingCount
      this.isSteal = saveObj.isSteal
      this.Alert = saveObj.Alert
      this.log = [...saveObj.log]
    } else {
      this.init()
    }
  }

  /**
   * Initialize NPC
   * TODO: Implement in Phase 5
   */
  init(): void {
    this.changeReputation(0)
  }

  /**
   * Change alert level
   * TODO: Implement in Phase 5
   */
  changeAlert(value: number): boolean {
    // Placeholder: Will implement alert logic in Phase 5
    if (this.Alert === 30 && value > 0) {
      return false
    } else if (this.Alert <= 0 && value < 0) {
      return false
    }
    this.Alert += value
    // TODO: Emit alert event
    return true
  }

  /**
   * Change reputation (friendship level)
   * Ported from OriginalGame/src/game/npc.js changeReputation() (lines 75-98)
   */
  changeReputation(value: number): boolean {
    if (this.reputation === this.reputationMax && value > 0) {
      return false
    } else if (this.reputation === 0 && value < 0) {
      return false
    }

    // Add log messages and audio effects
    if (value > 0) {
      const npcName = this.getName()
      const message = getString(1105, npcName) // "%s is very thankful for your help! Your friendship increases."
      useLogStore.getState().addLog(message)
      audioManager.playEffect(SoundPaths.GOOD_EFFECT)
    } else if (value < 0) {
      const npcName = this.getName()
      const message = getString(1106, npcName) // "%s feels very disappointed. Your friendship decreases."
      useLogStore.getState().addLog(message)
      audioManager.playEffect(SoundPaths.BAD_EFFECT)
    }

    this.reputation += value
    this.reputation = Math.max(0, Math.min(this.reputationMax, this.reputation))
    
    if (this.isReputationMax()) {
      // TODO: Check achievements (Achievement.checkNpcReputation(this.id))
    }
    this.unlockByReputation()
    return true
  }

  /**
   * Unlock trading and gifts based on reputation
   * TODO: Implement in Phase 5
   */
  unlockByReputation(): void {
    if (this.reputation > this.maxRep) {
      for (let start = this.maxRep + 1; start <= this.reputation; start++) {
        this.unlockTrading(start, true)
        this.unlockGift(start)
      }
      this.maxRep = this.reputation
    }
  }

  /**
   * Unlock gift at reputation level
   * TODO: Implement in Phase 5
   */
  unlockGift(index: number): void {
    const gift = this.config.gift[index]
    if (gift) {
      if (gift.itemId) {
        this.needSendGiftList.item = this.needSendGiftList.item || []
        this.needSendGiftList.item.push(gift)
      } else if (gift.siteId) {
        this.needSendGiftList.site = this.needSendGiftList.site || []
        this.needSendGiftList.site.push(gift)
      }
    }
    // TODO: Check for Social talent and add gift_extra
  }

  /**
   * Unlock trading items at reputation level
   * TODO: Implement in Phase 5
   */
  unlockTrading(index: number, _isUnlock?: boolean): void {
    const tradingList = this.config.trading[index]
    if (tradingList) {
      // TODO: Add log message if isUnlock and index > 0
      for (const itemInfo of tradingList) {
        if (itemInfo) {
          this.storage.addItem(String(itemInfo.itemId), itemInfo.num)
        }
      }
    }
  }

  /**
   * Update trading items based on current reputation
   * TODO: Implement in Phase 5
   */
  updateTradingItem(): void {
    this.storage = new Storage(`npc_${this.id}`)
    for (let start = 0; start <= this.reputation; start++) {
      this.unlockTrading(start)
    }
  }

  /**
   * Get item NPC needs at current reputation level
   * TODO: Implement in Phase 5
   */
  getNeedItem(): NeedItem | null {
    let itemInfo: NeedItem | null = null
    for (let i = this.reputation; i >= 0; i--) {
      itemInfo = this.config.needItem[i]
      if (itemInfo != null) {
        break
      }
    }
    return itemInfo
  }

  /**
   * Take need item from player (increase reputation)
   * Ported from OriginalGame/src/game/npc.js takeNeedItem() (lines 166-172)
   */
  takeNeedItem(): void {
    const itemInfo = this.getNeedItem()
    if (!itemInfo) return
    
    const playerStore = usePlayerStore.getState()
    const itemId = String(itemInfo.itemId)
    const num = itemInfo.num
    
    // Validate player has item in bag
    if (playerStore.getBagItemCount(itemId) >= num) {
      // Decrease from player bag
      playerStore.removeItemFromBag(itemId, num)
      // Increase reputation
      this.changeReputation(1)
    }
  }

  /**
   * Get random dialog
   * TODO: Implement in Phase 5
   */
  getDialog(): string {
    const dialogs = getString(`npc_${this.id}`).dialogs
    if (!dialogs || dialogs.length === 0) {
      return ""
    }
    const rand = Math.floor(Math.random() * dialogs.length)
    return dialogs[rand] || ""
  }

  /**
   * Get trade rate (price multiplier based on favorite items)
   * Ported from OriginalGame/src/game/npc.js getTradeRate() (lines 178-203)
   * 
   * Calculates the value ratio between player's offered items and NPC's original items.
   * Applies favorite item price multipliers based on NPC reputation.
   * 
   * @param playerStorage - Player's storage (bag) with items they want to trade
   * @returns Trade rate (playerTotalPrice / npcOriginTotalPrice). Trade is valid when >= 1.0
   */
  getTradeRate(playerStorage: Storage): number {
    // Get favorite items for current reputation level
    const favorite = this.config.favorite[this.reputation] || []
    
    // Calculate NPC's original total value (with favorite multipliers)
    let npcOriginTotalPrice = 0
    Object.entries(this.storage.items).forEach(([itemId, num]) => {
      if (num <= 0) return
      
      const item = new Item(itemId)
      const basePrice = item.getPrice()
      
      // Check if item is in favorite list and get multiplier
      let deltaPrice = 1
      const itemIdNum = Number(itemId)
      favorite.forEach((favItem) => {
        if (favItem.itemId === itemIdNum) {
          deltaPrice = favItem.price
        }
      })
      
      npcOriginTotalPrice += (basePrice * deltaPrice * num)
    })
    
    // Round to 3 decimal places (matching original game)
    npcOriginTotalPrice = Number(npcOriginTotalPrice.toFixed(3))
    
    // Calculate player's offered total value (with favorite multipliers)
    let playerTotalPrice = 0
    Object.entries(playerStorage.items).forEach(([itemId, num]) => {
      if (num <= 0) return
      
      const item = new Item(itemId)
      const basePrice = item.getPrice()
      
      // Check if item is in favorite list and get multiplier
      let deltaPrice = 1
      const itemIdNum = Number(itemId)
      favorite.forEach((favItem) => {
        if (favItem.itemId === itemIdNum) {
          deltaPrice = favItem.price
        }
      })
      
      playerTotalPrice += (basePrice * deltaPrice * num)
    })
    
    // Round to 3 decimal places (matching original game)
    playerTotalPrice = Number(playerTotalPrice.toFixed(3))
    
    // Return ratio (player / NPC)
    // Handle division by zero (if NPC storage is empty)
    if (npcOriginTotalPrice === 0) {
      return playerTotalPrice > 0 ? Infinity : 1.0
    }
    
    return playerTotalPrice / npcOriginTotalPrice
  }

  /**
   * Check if NPC needs to send gift
   * TODO: Implement in Phase 5
   */
  needSendGift(): boolean {
    return Object.keys(this.needSendGiftList).length > 0
  }

  /**
   * Send gift to player
   * Ported from OriginalGame/src/ui/uiUtil.js showNpcSendGiftDialog() (lines 973-1050)
   */
  sendGift(): void {
    const uiStore = useUIStore.getState()
    // Delay showing dialog slightly to ensure UI is ready (especially after sleep)
    setTimeout(() => {
      uiStore.showOverlay('npcGiftDialog', { npc: this })
      audioManager.playEffect(SoundPaths.NPC_KNOCK)
    }, 100)
  }

  /**
   * NPC wants to sell to player
   * TODO: Implement in Phase 5
   */
  needSell(_rid?: number): void {
    // Placeholder: Will show sale dialog in Phase 5
  }

  /**
   * NPC needs help from player
   * Ported from OriginalGame/src/game/npc.js needHelp() (lines 255-285)
   * For now, shows a simple confirmation dialog until full help dialog is implemented
   */
  needHelp(): void {
    // TODO: Implement full help dialog (NpcHelpDialog.tsx) with items needed
    // For now, show a simple confirmation dialog
    const uiStore = useUIStore.getState()
    const npcName = this.getName()
    
    // Delay showing dialog slightly to ensure UI is ready (especially after sleep)
    setTimeout(() => {
      // Show confirmation dialog as temporary solution
      uiStore.showOverlay('confirmationDialog', {
        title: npcName,
        message: getString(1065) || "I am sorry to interrupt, but can you do me a favor?",
        confirmText: getString(1138) || 'Help',
        cancelText: getString(1193) || 'Cancel',
        onConfirm: () => {
          uiStore.hideOverlay()
          // TODO: Show items needed and handle giving items
          // For now, just show a message
          useLogStore.getState().addLog(`${npcName} needs help, but help dialog is not yet implemented.`)
        },
        onCancel: () => {
          uiStore.hideOverlay()
          // TODO: Decrease reputation if refusing (unless Social talent)
          useLogStore.getState().addLog(`You refused to help ${npcName}.`)
        }
      })
      audioManager.playEffect(SoundPaths.NPC_KNOCK)
    }, 100)
  }

  /**
   * Get items needed for help
   * TODO: Implement in Phase 5
   */
  getNeedHelpItems(): Item[] {
    // Placeholder: Will generate random items based on npcGiftConfig
    return []
  }

  /**
   * Get NPC name
   */
  getName(): string {
    return getString(`npc_${this.id}`).name || `NPC ${this.id}`
  }

  /**
   * Get NPC description
   */
  getDes(): string {
    return getString(`npc_${this.id}`).des || ""
  }

  /**
   * Check if reputation is at maximum
   */
  isReputationMax(): boolean {
    return this.reputation === this.reputationMax
  }
}

