/**
 * Site System
 * Ported from OriginalGame/src/game/site.js
 * 
 * Manages site exploration, room generation, and secret rooms
 */

import { Storage } from '@/core/game/inventory/Storage'
import { Item } from '@/core/game/inventory/Item'
import { clone } from '@/common/utils/clone'
import { getRandomInt } from '@/common/utils/random'
import { getFixedValueItemIds, convertItemIds2Item } from '@/common/utils/item'
import { getMonsterListByDifficulty } from '@/common/utils/monster'
import { getDropEffect, isAllItemUnlocked } from '@/common/utils/iap'
import { siteConfig } from '@/core/data/sites'
import { secretRooms } from '@/core/data/secretRooms'
import { usePlayerStore } from '@/core/store/playerStore'
import { useLogStore } from '@/core/store/logStore'
import { getString } from '@/common/utils/stringUtil'
import type {
  SiteConfig,
  Room,
  SiteSaveData,
  AdSiteSaveData,
  BossSiteSaveData,
  SecretRoomConfig
} from '@/common/types/site.types'

// Constants
export const HOME_SITE = 100
export const AD_SITE = 202
export const BOSS_SITE = 61
export const WORK_SITE = 204
export const GAS_SITE = 201
export const BAZAAR_SITE = 400

export const WorkRoomTypeLen = 3
export const SecretWorkRoomTypeLen = 3

// Battle room data structure
interface BattleRoomData {
  list: string[] | null  // Monster IDs
  difficulty: number
}

/**
 * BaseSite class
 * Base class with random position generation
 */
export class BaseSite {
  public pos: { x: number; y: number }
  
  constructor() {
    // Random position: x: 5-25, y: 5-50
    this.pos = {
      x: getRandomInt(5, 25),
      y: getRandomInt(5, 50)
    }
  }
}

/**
 * Site class
 * Main site exploration system
 */
export class Site extends BaseSite {
  public id: number
  public config: SiteConfig
  public storage: Storage
  public step: number
  public rooms: Room[]
  
  // Secret room properties
  public secretRoomsConfig?: SecretRoomConfig
  public secretRoomType?: number
  public secretRoomsShowedCount: number
  public isSecretRoomsEntryShowed: boolean
  public isInSecretRooms: boolean
  public secretRooms: Room[]
  public secretRoomsStep: number
  
  // State properties
  public isUnderAttacked: boolean
  public haveNewItems: boolean
  public isActive: boolean
  public fixedTime: number
  public closed?: boolean
  
  constructor(siteId: number) {
    super()  // BaseSite constructor (random pos)
    
    this.id = siteId
    const config = siteConfig[String(siteId)]
    if (!config) {
      throw new Error(`Site config not found for ID: ${siteId}`)
    }
    this.config = clone(config)  // Deep clone required
    this.pos = this.config.coordinate  // Override BaseSite random pos
    this.storage = new Storage('site')
    this.step = 0
    this.rooms = []
    
    // Secret room initialization
    if (this.config.secretRoomsId) {
      const secretRoomId = String(this.config.secretRoomsId)
      const secretRoomConfig = secretRooms[secretRoomId]
      if (secretRoomConfig) {
        this.secretRoomsConfig = clone(secretRoomConfig)
        this.secretRoomType = getRandomInt(0, SecretWorkRoomTypeLen - 1)  // 0-2
      }
    }
    this.secretRoomsShowedCount = 0
    this.isSecretRoomsEntryShowed = false
    this.isInSecretRooms = false
    this.secretRooms = []
    this.secretRoomsStep = 0
    
    // State initialization
    this.isUnderAttacked = false
    this.haveNewItems = false
    this.isActive = false
    this.fixedTime = 0
  }
  
  /**
   * Initialize site (generate rooms)
   */
  init(): void {
    // Home doesn't generate rooms
    if (this.id !== HOME_SITE) {
      this.genRooms()
    }
  }
  
  /**
   * Generate rooms for exploration
   * Rooms are built in reverse order (unshift)
   */
  genRooms(): void {
    const battleRooms = this.genBattleRoom()
    const workRooms = this.genWorkRoom()
    let roomLen = (this.config.battleRoom || 0) + (this.config.workRoom || 0)
    const rooms: Room[] = []
    
    // If work rooms exist, place one at the end (will be first after unshift)
    if (workRooms.length > 0) {
      const endWorkRoomIndex = getRandomInt(0, workRooms.length - 1)
      const workRoom = workRooms.splice(endWorkRoomIndex, 1)[0]
      const room: Room = {
        list: workRoom,
        type: "work",
        workType: getRandomInt(0, WorkRoomTypeLen - 1)  // 0-2
      }
      rooms.unshift(room)
      roomLen--
    }
    
    // Shuffle remaining rooms
    let remainingRoomLen = roomLen
    while (remainingRoomLen-- > 0) {
      const index = getRandomInt(0, remainingRoomLen)
      let room: Room
      
      if (index > battleRooms.length - 1) {
        // Select from work rooms
        const workIndex = index - battleRooms.length
        if (workRooms.length === 0) {
          console.error('[Site] genRooms: No work rooms available but index requires work room')
          break
        }
        const workRoom = workRooms.splice(workIndex, 1)[0]
        room = {
          list: workRoom,
          type: "work",
          workType: getRandomInt(0, WorkRoomTypeLen - 1)
        }
      } else {
        // Select from battle rooms
        if (battleRooms.length === 0) {
          console.error('[Site] genRooms: No battle rooms available but index requires battle room')
          break
        }
        const battleRoom = battleRooms.splice(index, 1)[0]
        room = {
          list: battleRoom.list || [],
          type: "battle",
          difficulty: battleRoom.difficulty
        }
      }
      
      rooms.unshift(room)  // Add to front (reverse order)
    }
    
    console.log('[Site] genRooms completed:', {
      siteId: this.id,
      battleRoomCount: this.config.battleRoom,
      workRoomCount: this.config.workRoom,
      generatedBattleRooms: battleRooms.length + rooms.filter(r => r.type === 'battle').length,
      generatedWorkRooms: workRooms.length + rooms.filter(r => r.type === 'work').length,
      totalRooms: rooms.length,
      roomTypes: rooms.map(r => r.type)
    })
    
    this.rooms = rooms
  }
  
  /**
   * Generate battle rooms
   */
  genBattleRoom(): BattleRoomData[] {
    const res: BattleRoomData[] = []
    const battleRoomCount = this.config.battleRoom || 0
    
    for (let i = 0; i < battleRoomCount; i++) {
      const difficulty = this.config.difficulty
      if (!difficulty || difficulty.length < 2) {
        continue
      }
      
      const diff = getRandomInt(difficulty[0], difficulty[1])
      const list = getMonsterListByDifficulty(diff)
      // Only add battle room if monster list was generated
      if (list) {
        res.push({ list, difficulty: diff })
      } else {
        console.warn(`[Site] Failed to generate monster list for difficulty ${diff}, skipping battle room`)
      }
    }
    
    return res
  }
  
  /**
   * Generate work rooms
   */
  genWorkRoom(): Item[][] {
    const workRooms: Item[][] = []
    const workRoomCount = this.config.workRoom || 0
    
    if (workRoomCount > 0) {
      // Apply IAP drop effect
      let produceValue = this.config.produceValue || 0
      produceValue = getDropEffect(produceValue)
      
      // Generate items based on produceValue and produceList
      const produceList = this.config.produceList || []
      let itemIds: string[] = []
      
      if (produceList.length > 0 && produceValue > 0) {
        itemIds = getFixedValueItemIds(produceValue, produceList)
      }
      
      // Add fixed produce items
      const fixedProduceList = this.config.fixedProduceList || []
      fixedProduceList.forEach((item) => {
        for (let i = 0; i < item.num; i++) {
          itemIds.push(item.itemId)
        }
      })
      
      // Create empty arrays for each work room
      for (let i = 0; i < workRoomCount; i++) {
        workRooms.push([])
      }
      
      // Distribute items randomly across work rooms (as strings first)
      const workRoomsString: string[][] = workRooms.map(() => [])
      itemIds.forEach((itemId) => {
        const index = getRandomInt(0, workRoomsString.length - 1)
        workRoomsString[index].push(itemId)
      })
      
      // Convert item IDs to Item objects
      return workRoomsString.map((workRoom) => {
        return convertItemIds2Item(workRoom)
      })
    }
    
    return workRooms
  }
  
  /**
   * Get current room
   */
  roomBegin(): Room | undefined {
    return this.rooms[this.step]
  }
  
  /**
   * Complete current room and advance
   */
  roomEnd(isWin: boolean): void {
    if (isWin) {
      const doneRoom = this.roomBegin()
      if (doneRoom && doneRoom.type === "work") {
        // Log work room completion message
        // TODO: Integrate with log system
        // player.log.addMsg(1117, stringUtil.getString(3007)[doneRoom.workType])
      }
      this.step++
      if (this.step >= this.rooms.length) {
        this.siteEnd()
      }
    }
  }
  
  /**
   * Handle site completion
   */
  siteEnd(): void {
    // Add log message
    const logStore = useLogStore.getState()
    logStore.addLog(getString(1119, this.getName())) // Format: "You have cleared out all threats in %s."
    
    const unlockValue = this.config.unlockValue
    if (unlockValue) {
      // Unlock new sites
      if (unlockValue.site) {
        const playerStore = usePlayerStore.getState()
        try {
          const map = playerStore.getMap()
          unlockValue.site.forEach((siteIdStr) => {
            const siteId = Number(siteIdStr)
            map.unlockSite(siteId)
          })
        } catch (error) {
          console.warn('Map not initialized, cannot unlock sites:', error)
        }
      }
      
      // Unlock NPCs (Phase 5)
      // TODO: Integrate with NPC system (Phase 5)
      // if (unlockValue.npc) {
      //   const playerStore = usePlayerStore.getState()
      //   try {
      //     const map = playerStore.getMap()
      //     unlockValue.npc.forEach((npcId) => {
      //       map.unlockNpc(npcId)
      //     })
      //   } catch (error) {
      //     console.warn('Map not initialized, cannot unlock NPCs:', error)
      //   }
      // }
    }
  }
  
  /**
   * Check if site is completed
   */
  isSiteEnd(): boolean {
    return this.step >= this.rooms.length
  }
  
  /**
   * Get progress string
   */
  getProgressStr(val: number, id: number): string {
    // Special reset logic for IAP unlocked
    if (val === 1 && this.step >= this.rooms.length && isAllItemUnlocked()) {
      this.step = 0
    } else if (val === 0 && this.step >= this.rooms.length && isAllItemUnlocked() && id > 300) {
      this.step = 0
    }
    return `${this.step}/${this.rooms.length}`
  }
  
  /**
   * Get current progress string (1-indexed)
   */
  getCurrentProgressStr(): string {
    return `${this.step + 1}/${this.rooms.length}`
  }
  
  /**
   * Check if site can be closed
   */
  canClose(): boolean {
    if (isAllItemUnlocked()) {
      return false
    }
    return this.isSiteEnd() && this.storage.isEmpty()
  }
  
  /**
   * Test for secret room discovery
   */
  testSecretRoomsBegin(): void {
    if (!this.secretRoomsConfig) return
    
    // Don't test if we're already in secret rooms or already showing the entry
    // This prevents multiple discoveries during the same exploration session
    if (this.isInSecretRooms || this.isSecretRoomsEntryShowed) {
      console.log('[Site] testSecretRoomsBegin() skipped - already in secret rooms or entry already showed')
      return
    }
    
    // Check max count (can be increased by item 1305064)
    let maxCount = Number.parseInt(this.secretRoomsConfig.maxCount)
    // TODO: Check if player.equip.isEquiped(1305064)
    // if (player.equip.isEquiped(1305064)) {
    //   maxCount += 1
    // }
    
    
    if (this.secretRoomsShowedCount < maxCount) {
      let probability = Number.parseFloat(this.secretRoomsConfig.probability)
      
      // Item 1305064 doubles probability
      // TODO: Check if player.equip.isEquiped(1305064)
      // if (player.equip.isEquiped(1305064)) {
      //   probability *= 2
      // }
      
      const rand = Math.random()
      console.log('[Site] testSecretRoomsBegin() probability check:', {
        probability,
        rand,
        willShow: probability >= rand,
        currentCount: this.secretRoomsShowedCount,
        maxCount
      })
      if (probability >= rand) {
        console.log('[Site] Secret room discovered! Setting entry flag')
        console.log('[Site] Secret room state BEFORE discovery:', {
          isSecretRoomsEntryShowed: this.isSecretRoomsEntryShowed,
          secretRoomsShowedCount: this.secretRoomsShowedCount
        })
        this.isSecretRoomsEntryShowed = true
        this.secretRoomsShowedCount++
        this.secretRooms = []
        this.secretRoomsStep = 0
        this.genSecretRooms()
        console.log('[Site] Secret room state AFTER discovery:', {
          isSecretRoomsEntryShowed: this.isSecretRoomsEntryShowed,
          secretRoomsShowedCount: this.secretRoomsShowedCount,
          secretRoomsLength: this.secretRooms.length
        })
      } else {
        console.log('[Site] Secret room NOT discovered (probability check failed)')
      }
    }
  }
  
  /**
   * Enter secret rooms
   */
  enterSecretRooms(): void {
    console.log('[Site] enterSecretRooms() called')
    console.log('[Site] Secret room state BEFORE enterSecretRooms:', {
      isInSecretRooms: this.isInSecretRooms,
      isSecretRoomsEntryShowed: this.isSecretRoomsEntryShowed,
      secretRoomsShowedCount: this.secretRoomsShowedCount
    })
    this.isInSecretRooms = true
    this.isSecretRoomsEntryShowed = false
    console.log('[Site] Secret room state AFTER enterSecretRooms:', {
      isInSecretRooms: this.isInSecretRooms,
      isSecretRoomsEntryShowed: this.isSecretRoomsEntryShowed
    })
  }
  
  /**
   * Get current secret room
   */
  secretRoomBegin(): Room | undefined {
    return this.secretRooms[this.secretRoomsStep]
  }
  
  /**
   * Complete current secret room and advance
   */
  secretRoomEnd(): void {
    this.secretRoomsStep++
    if (this.isSecretRoomsEnd()) {
      this.secretRoomsEnd()
    }
  }
  
  /**
   * Handle secret rooms completion
   */
  secretRoomsEnd(): void {
    console.log('[Site] secretRoomsEnd() called')
    console.log('[Site] Secret room state BEFORE secretRoomsEnd:', {
      isInSecretRooms: this.isInSecretRooms,
      isSecretRoomsEntryShowed: this.isSecretRoomsEntryShowed,
      secretRoomsShowedCount: this.secretRoomsShowedCount
    })
    this.isInSecretRooms = false
    console.log('[Site] Secret room state AFTER secretRoomsEnd:', {
      isInSecretRooms: this.isInSecretRooms,
      isSecretRoomsEntryShowed: this.isSecretRoomsEntryShowed
    })
    // TODO: Integrate with achievement system
    // Medal.checkSecretRoomEnd(1)
  }
  
  /**
   * Check if secret rooms are completed
   */
  isSecretRoomsEnd(): boolean {
    return this.secretRoomsStep >= this.secretRooms.length
  }
  
  /**
   * Generate secret rooms
   */
  genSecretRooms(): void {
    if (!this.secretRoomsConfig) return
    
    // Generate random number of rooms
    const secretRoomsLength = getRandomInt(
      this.secretRoomsConfig.minRooms,
      this.secretRoomsConfig.maxRooms
    )
    
    // Generate battle rooms (all except last)
    for (let i = 0; i < secretRoomsLength - 1; i++) {
      const difficulty = this.config.difficulty
      if (!difficulty || difficulty.length < 2) {
        continue
      }
      
      const diff = getRandomInt(
        difficulty[0] + this.secretRoomsConfig.minDifficultyOffset,
        difficulty[1] + this.secretRoomsConfig.maxDifficultyOffset
      )
      const clampedDiff = Math.max(1, Math.min(12, diff))  // Clamp to 1-12
      const list = getMonsterListByDifficulty(clampedDiff)
      
      this.secretRooms.push({
        list: list || [],
        difficulty: clampedDiff,
        type: "battle"
      })
    }
    
    // Generate work room (last room)
    let produceValue = this.secretRoomsConfig.produceValue
    produceValue = getDropEffect(produceValue)
    
    // Special logic for secretRoomsId === 5
    if (this.config.secretRoomsId === 5) {
      const randAdd = Math.random()
      const randItem: { itemId: string; weight: number } = { itemId: "0", weight: 0 }
      
      if (randAdd < 0.1) {
        randItem.itemId = "1107022"
      } else if (randAdd < 0.2) {
        randItem.itemId = "1107032"
      } else if (randAdd < 0.3) {
        randItem.itemId = "1107042"
      } else if (randAdd < 0.4) {
        randItem.itemId = "1107052"
      } else if (randAdd < 0.5) {
        randItem.itemId = "1107012"
      }
      
      if (randItem.itemId !== "0") {
        produceValue += 24
        // Clone produceList before modifying
        if (this.secretRoomsConfig.produceList) {
          this.secretRoomsConfig.produceList = [...this.secretRoomsConfig.produceList, randItem]
        }
      }
    }
    
    const itemIds = getFixedValueItemIds(produceValue, this.secretRoomsConfig.produceList || [])
    const workRoom = convertItemIds2Item(itemIds)
    
    this.secretRooms.push({
      list: workRoom,
      workType: getRandomInt(0, SecretWorkRoomTypeLen - 1),  // 0-2
      type: "work"
    })
  }
  
  /**
   * Add item to site storage
   */
  increaseItem(itemId: string, num: number): void {
    this.storage.addItem(itemId, num, false)
    this.haveNewItems = true
  }
  
  /**
   * Get total item count in storage
   */
  getAllItemNum(): number {
    return this.storage.getAllItemNum()
  }
  
  /**
   * Get site name
   */
  getName(): string {
    const siteConfig = getString(`site_${this.id}`)
    if (typeof siteConfig === 'object' && siteConfig !== null && 'name' in siteConfig) {
      return siteConfig.name as string
    }
    return `Site ${this.id}` // Fallback
  }
  
  /**
   * Get site description
   */
  getDes(): string {
    const siteConfig = getString(`site_${this.id}`)
    if (typeof siteConfig === 'object' && siteConfig !== null && 'des' in siteConfig) {
      return siteConfig.des as string
    }
    return '' // Fallback
  }
  
  /**
   * Save site state
   */
  save(): SiteSaveData {
    return {
      pos: this.pos,
      step: this.step,
      rooms: this.rooms,
      storage: this.storage.save(),
      secretRoomsShowedCount: this.secretRoomsShowedCount,
      isSecretRoomsEntryShowed: this.isSecretRoomsEntryShowed,
      isInSecretRooms: this.isInSecretRooms,
      secretRooms: this.secretRooms,
      secretRoomsStep: this.secretRoomsStep,
      secretRoomType: this.secretRoomType,
      closed: this.closed,
      isUnderAttacked: this.isUnderAttacked,
      haveNewItems: this.haveNewItems,
      isActive: this.isActive,
      fixedTime: this.fixedTime
    }
  }
  
  /**
   * Restore site state
   */
  restore(saveObj: SiteSaveData | null): void {
    if (saveObj) {
      this.pos = saveObj.pos
      this.step = saveObj.step
      this.rooms = saveObj.rooms
      this.storage.restore(saveObj.storage)
      this.secretRoomsShowedCount = saveObj.secretRoomsShowedCount ?? 0
      this.isSecretRoomsEntryShowed = saveObj.isSecretRoomsEntryShowed ?? false
      this.isInSecretRooms = saveObj.isInSecretRooms ?? false
      this.secretRooms = saveObj.secretRooms ?? []
      this.secretRoomsStep = saveObj.secretRoomsStep ?? 0
      this.secretRoomType = saveObj.secretRoomType
      this.closed = saveObj.closed
      this.isUnderAttacked = saveObj.isUnderAttacked ?? false
      this.haveNewItems = saveObj.haveNewItems ?? false
      this.isActive = saveObj.isActive ?? false
      this.fixedTime = saveObj.fixedTime ?? 0
    } else {
      this.init()  // Initialize new site
    }
  }
}

/**
 * AdSite class (ID 202)
 * Ad location - no room generation
 */
export class AdSite extends Site {
  constructor(siteId: number) {
    // Call super with siteId, then override properties
    super(siteId)
    
    const config = siteConfig[String(siteId)]
    if (!config) {
      throw new Error(`Site config not found for ID: ${siteId}`)
    }
    
    // Override Site properties
    this.pos = config.coordinate
    this.config = clone(config)
    this.isActive = false
  }
  
  init(): void {
    // Empty - no room generation
  }
  
  isSiteEnd(): boolean {
    return false  // Never ends
  }
  
  getProgressStr(): string {
    return "???"
  }
  
  getCurrentProgressStr(): string {
    return ""
  }
  
  override save(): SiteSaveData {
    return {
      pos: this.pos,
      step: this.step,
      rooms: [],  // AdSite has no rooms
      storage: this.storage.save(),
      isActive: this.isActive,
      haveNewItems: this.haveNewItems
    }
  }
  
  override restore(saveObj: AdSiteSaveData | SiteSaveData | null): void {
    if (saveObj) {
      // Handle both AdSiteSaveData and SiteSaveData for compatibility
      if ('isActive' in saveObj && 'haveNewItems' in saveObj) {
        const adSave = saveObj as AdSiteSaveData
        this.pos = adSave.pos
        this.step = adSave.step
        this.storage.restore(adSave.storage)
        this.isActive = adSave.isActive
        this.haveNewItems = adSave.haveNewItems
      } else {
        // Fallback to Site restore
        super.restore(saveObj as SiteSaveData)
      }
    } else {
      this.init()
    }
  }
}

/**
 * BazaarSite class (ID 400)
 * Shop/bazaar - no room generation
 */
export class BazaarSite extends Site {
  constructor(siteId: number) {
    // Call super with siteId, then override properties
    super(siteId)
    
    const config = siteConfig[String(siteId)]
    if (!config) {
      throw new Error(`Site config not found for ID: ${siteId}`)
    }
    
    // Override Site properties
    this.pos = config.coordinate
    this.config = clone(config)
    this.isActive = false
  }
  
  init(): void {
    // Empty - no room generation
  }
  
  isSiteEnd(): boolean {
    return false  // Never ends
  }
  
  getProgressStr(): string {
    return "???"
  }
  
  getCurrentProgressStr(): string {
    return ""
  }
  
  override save(): SiteSaveData {
    return {
      pos: this.pos,
      step: this.step,
      rooms: [],  // AdSite has no rooms
      storage: this.storage.save(),
      isActive: this.isActive,
      haveNewItems: this.haveNewItems
    }
  }
  
  override restore(saveObj: AdSiteSaveData | SiteSaveData | null): void {
    if (saveObj) {
      // Handle both AdSiteSaveData and SiteSaveData for compatibility
      if ('isActive' in saveObj && 'haveNewItems' in saveObj) {
        const adSave = saveObj as AdSiteSaveData
        this.pos = adSave.pos
        this.step = adSave.step
        this.storage.restore(adSave.storage)
        this.isActive = adSave.isActive
        this.haveNewItems = adSave.haveNewItems
      } else {
        // Fallback to Site restore
        super.restore(saveObj as SiteSaveData)
      }
    } else {
      this.init()
    }
  }
}

/**
 * WorkSite class (ID 201, 204)
 * Power plant and gas station - can be fixed
 */
export class WorkSite extends Site {
  canClose(): boolean {
    return false  // Can never be closed
  }
  
  fix(): void {
    this.isActive = true
    // TODO: Get time from TimeManager
    // this.fixedTime = TimeManager.getTime()
    this.fixedTime = Date.now() / 1000  // Temporary stub
    
    // TODO: Integrate with event emitter and log system
    // if (this.id === 204) {
    //   emitter.emit('onWorkSiteChange', this.isActive)
    //   player.log.addMsg(6677)
    // } else {
    //   emitter.emit('onGasSiteChange', this.isActive)
    //   player.log.addMsg(6678)
    // }
  }
  
  checkActive(): void {
    if (!this.isActive) return
    
    // TODO: Get time from TimeManager
    // const intervalTime = parseInt(TimeManager.getTime() - this.fixedTime)
    const currentTime = Date.now() / 1000
    const intervalTime = parseInt(String(currentTime - this.fixedTime))
    
    // TODO: Import workSiteConfig and gasSiteConfig
    // For now, use hardcoded values
    let criteria: number
    let probability: number
    
    if (this.id === 204) {
      criteria = 96 * 60  // 96 hours in seconds
      probability = 0.03
    } else {
      criteria = 72 * 60  // 72 hours in seconds
      probability = 0.03
    }
    
    if (intervalTime > criteria) {
      const rand = Math.random()
      if (rand < probability) {
        this.isActive = false
        // TODO: Auto-save
        // Record.saveAll()
        
        // TODO: Integrate with event emitter and log system
        // if (this.id === 204) {
        //   emitter.emit('onWorkSiteChange', this.isActive)
        //   player.log.addMsg(6679)
        // } else {
        //   emitter.emit('onGasSiteChange', this.isActive)
        //   player.log.addMsg(6680)
        // }
      }
    }
  }
}

/**
 * BossSite class (ID 61)
 * Boss location - tracks sub-sites
 */
export class BossSite extends Site {
  public bossSubSiteIds: number[] = [301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312]
  
  constructor(siteId: number) {
    // Call super with siteId, then override properties
    super(siteId)
    
    const config = siteConfig[String(siteId)]
    if (!config) {
      throw new Error(`Site config not found for ID: ${siteId}`)
    }
    
    // Override Site properties
    this.pos = config.coordinate
    this.config = clone(config)
  }
  
  init(): void {
    // Empty - no room generation
  }
  
  isSiteEnd(): boolean {
    return false  // Never ends
  }
  
  getProgressStr(): string {
    // TODO: Integrate with Map system
    // let doneNum = 0
    // this.bossSubSiteIds.forEach((siteId) => {
    //   const site = player.map.getSite(siteId)
    //   if (site) {
    //     doneNum++
    //   }
    // })
    // return `${doneNum}/${this.bossSubSiteIds.length}`
    return "0/12"  // Stub
  }
  
  getCurrentProgressStr(): string {
    return ""
  }
  
  getAllItemNum(): number {
    // TODO: Integrate with Map system
    // let num = 0
    // this.bossSubSiteIds.forEach((siteId) => {
    //   const site = player.map.getSite(siteId)
    //   if (site) {
    //     num += site.getAllItemNum()
    //   }
    // })
    // return num
    return this.storage.getAllItemNum()  // Stub - return own storage count
  }
  
  override save(): SiteSaveData {
    return {
      pos: this.pos,
      step: this.step,
      rooms: [],  // BossSite has no rooms
      storage: this.storage.save()
    }
  }
  
  override restore(saveObj: BossSiteSaveData | SiteSaveData | null): void {
    if (saveObj) {
      // Handle both BossSiteSaveData and SiteSaveData for compatibility
      if ('pos' in saveObj && 'step' in saveObj && 'storage' in saveObj && !('rooms' in saveObj)) {
        const bossSave = saveObj as BossSiteSaveData
        this.pos = bossSave.pos
        this.step = bossSave.step
        this.storage.restore(bossSave.storage)
      } else {
        // Fallback to Site restore
        super.restore(saveObj as SiteSaveData)
      }
    } else {
      this.init()
    }
  }
}

