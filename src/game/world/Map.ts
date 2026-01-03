/**
 * Map System
 * Ported from OriginalGame/src/game/map.js
 * 
 * Manages all sites (locations) on the world map, NPC locations,
 * site discovery/unlocking, and player position
 */

import {
  Site,
  AdSite,
  BossSite,
  WorkSite,
  BazaarSite,
  HOME_SITE,
  AD_SITE,
  BOSS_SITE,
  WORK_SITE,
  GAS_SITE,
  BAZAAR_SITE
} from './Site'
import { emitter } from '@/utils/emitter'
import { useLogStore } from '@/store/logStore'
import { isAllItemUnlocked } from '@/utils/iap'
import type { SiteSaveData, MapSaveData } from '@/types/site.types'
import { getString } from '@/utils/stringUtil'

// NPC stub interface (will be replaced in Phase 5)
interface NPC {
  id: number
  getName(): string
}

/**
 * Map class
 * Manages world map state, sites, and NPCs
 */
export class Map {
  private npcMap: Record<number, boolean>
  private siteMap: Record<number, Site>
  private needDeleteSiteList: number[]
  public pos!: { x: number; y: number } // Initialized in init()

  constructor() {
    this.npcMap = {}
    this.siteMap = {}
    this.needDeleteSiteList = []
    // Note: pos is NOT initialized here, set in init()
  }

  /**
   * Save map state
   */
  save(): MapSaveData {
    // Convert npcMap object to array of IDs
    const npcSaveObj = Object.keys(this.npcMap).map(Number)

    // Save all sites
    const siteSaveObj: Record<string, SiteSaveData> = {}
    for (const siteId in this.siteMap) {
      const site = this.siteMap[siteId]
      siteSaveObj[String(siteId)] = site.save()
    }

    return {
      npcMap: npcSaveObj,
      siteMap: siteSaveObj,
      pos: this.pos,
      needDeleteSiteList: this.needDeleteSiteList
    }
  }

  /**
   * Restore map state from save data
   */
  restore(saveObj: MapSaveData | null): void {
    if (saveObj) {
      // Restore NPCs
      this.npcMap = {}
      for (const npcId of saveObj.npcMap) {
        this.npcMap[npcId] = true
      }

      // Restore sites
      this.siteMap = {}
      for (const siteIdStr in saveObj.siteMap) {
        const siteId = Number(siteIdStr)
        const site = this.createSite(siteId)
        site.restore(saveObj.siteMap[siteIdStr])
        this.siteMap[siteId] = site
      }

      // Restore position and deletion queue
      this.pos = saveObj.pos
      this.needDeleteSiteList = saveObj.needDeleteSiteList
    } else {
      // No save data, initialize fresh
      this.init()
    }
  }

  /**
   * Initialize map with default sites
   */
  init(): void {
    let allSites: number[]

    if (isAllItemUnlocked()) {
      // Full unlock (IAP)
      allSites = [
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
    } else {
      // Default sites
      allSites = [100, 201, 202, 204, 400]
    }

    // Unlock all sites
    for (const siteId of allSites) {
      this.unlockSite(siteId)
    }

    // Set home position (site 100)
    const homePos = { x: 45, y: 50 }
    const homeSite = this.getSite(HOME_SITE)
    if (homeSite) {
      homeSite.pos = homePos
      // Set player position to home
      this.pos = homeSite.pos
    } else {
      throw new Error('Home site (100) not found after initialization')
    }
  }

  /**
   * Iterate over all NPCs and sites
   * @param callback Function to call for each entity
   */
  forEach(callback: (entity: Site | NPC) => void): void {
    // Iterate NPCs
    // TODO: Integrate with NPC system (Phase 5)
    // For now, skip NPC iteration
    // for (const npcId in this.npcMap) {
    //   const npc = npcManager.getNPC(npcId)
    //   callback(npc)
    // }

    // Iterate sites
    for (const siteId in this.siteMap) {
      const site = this.siteMap[siteId]
      const siteIdNum = Number(siteId)

      // Skip closed sites
      if (site.closed) continue

      // Skip boss sub-sites (300-399)
      if (siteIdNum >= 300 && siteIdNum <= 399) continue

      callback(site)
    }
  }

  /**
   * Unlock an NPC location
   * @param npcId NPC ID to unlock
   */
  unlockNpc(npcId: number): void {
    // Mark NPC as unlocked
    this.npcMap[npcId] = true

    // TODO: Integrate with NPC system (Phase 5)
    // const npc = npcManager.getNPC(npcId)
    // emitter.emit("unlock_site", npc)
    // logStore.addLog(getString(1125, npc.getName()))

    // Stub for now:
    emitter.emit("unlock_site", { id: npcId, type: 'npc' })
    const logStore = useLogStore.getState()
    // Get NPC name from string system
    const npcConfig = getString(`npc_${npcId}`)
    const npcName = typeof npcConfig === 'object' && npcConfig !== null && 'name' in npcConfig
      ? npcConfig.name as string
      : `NPC ${npcId}`
    logStore.addLog(getString(1125, npcName)) // Format: "The new location %s house has been unlocked."
  }

  /**
   * Unlock a site
   * @param siteId Site ID to unlock
   */
  unlockSite(siteId: number): void {
    // Check if site already exists
    if (this.siteMap.hasOwnProperty(siteId)) {
      return // Site already unlocked
    }

    // Create site using factory
    const site = this.createSite(siteId)

    // Initialize site (generates rooms, etc.)
    site.init()

    // Add to map
    this.siteMap[siteId] = site

    // Emit event for UI updates (MapPanelContent listens to this)
    emitter.emit("unlock_site", site)

    // Add log message
    // TODO: Use proper string ID 1104
    const logStore = useLogStore.getState()
    logStore.addLog(getString(1104, site.getName())) // Format: "New location %s is unlocked!"
  }

  /**
   * Queue a site for deletion
   * @param siteId Site ID to close
   */
  closeSite(siteId: number): void {
    if (!this.siteMap.hasOwnProperty(siteId)) {
      return // Site doesn't exist
    }

    // Queue for deletion
    this.needDeleteSiteList.push(siteId)

    // Emit event (MapPanelContent may listen to this)
    emitter.emit("close_site", siteId)
  }

  /**
   * Process deletion queue and close sites that can be closed
   */
  deleteUnusableSite(): void {
    while (this.needDeleteSiteList.length > 0) {
      const siteId = this.needDeleteSiteList.pop()!
      const site = this.getSite(siteId)

      if (site && site.canClose()) {
        site.closed = true
      }
      // Note: If site.canClose() returns false, site remains in queue
      // This matches original behavior
    }
  }

  /**
   * Update player position on map
   * @param pos New position
   */
  updatePos(pos: { x: number; y: number }): void {
    this.pos = pos
  }

  /**
   * Get site by ID
   * @param siteId Site ID
   * @returns Site instance or undefined
   */
  getSite(siteId: number): Site | undefined {
    return this.siteMap[siteId]
  }

  /**
   * Reset player position to home
   */
  resetPos(): void {
    const homeSite = this.getSite(HOME_SITE)
    if (homeSite) {
      this.pos = homeSite.pos
    }
  }

  /**
   * Create site instance based on site type
   * @param siteId Site ID
   * @returns Site instance
   */
  private createSite(siteId: number): Site {
    if (siteId === AD_SITE) {
      return new AdSite(siteId)
    } else if (siteId === BOSS_SITE) {
      return new BossSite(siteId)
    } else if (siteId === WORK_SITE || siteId === GAS_SITE) {
      return new WorkSite(siteId)
    } else if (siteId === BAZAAR_SITE) {
      return new BazaarSite(siteId)
    } else {
      return new Site(siteId)
    }
  }
}

