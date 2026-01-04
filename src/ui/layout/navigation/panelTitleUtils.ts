/**
 * Panel Title Utilities
 * Extract panel title calculation logic
 * Extracted from MainScene.tsx
 */

import type { Panel } from '@/core/store/uiStore'
import { useUIStore } from '@/core/store/uiStore'
import { useBuildingStore } from '@/core/store/buildingStore'
import { usePlayerStore } from '@/core/store/playerStore'

// Get store state types by calling getState() on the store
type UIStoreState = ReturnType<typeof useUIStore.getState>
type BuildingStoreState = ReturnType<typeof useBuildingStore.getState>
type PlayerStoreState = ReturnType<typeof usePlayerStore.getState>
import { getString } from '@/shared/utils/i18n/stringUtil'

/**
 * Determine panel title (from original BottomFrameNode uiConfig)
 */
export function getPanelTitle(
  currentPanel: Panel,
  uiStore: UIStoreState,
  buildingStore: BuildingStoreState,
  playerStore: PlayerStoreState
): string {
  switch (currentPanel) {
    case 'home': 
      return ''
    
    case 'build': {
      const buildingId = uiStore.buildPanelBuildingId
      if (buildingId) {
        const building = buildingStore.getBuilding(buildingId)
        if (building && buildingStore.room) {
          return buildingStore.room.getBuildCurrentName(buildingId)
        }
        // Fallback: try to get name from string system using level 0
        const buildingConfig = getString(`${buildingId}_0`)
        if (typeof buildingConfig === 'object' && buildingConfig !== null && 'title' in buildingConfig) {
          return buildingConfig.title as string
        }
      }
      return getString('1_0')?.title || 'Building' // Fallback to Toolbox name or hardcoded
    }
    
    case 'storage': {
      // Get building 13 (Storage Shelf) name
      const building = buildingStore.getBuilding(13)
      if (building && buildingStore.room) {
        return buildingStore.room.getBuildCurrentName(13)
      }
      // Fallback: get from string system
      const buildingConfig = getString('13_0')
      return typeof buildingConfig === 'object' && buildingConfig !== null && 'title' in buildingConfig
        ? buildingConfig.title as string
        : 'Storage'
    }
    
    case 'radio': {
      // Get building 15 (Radio) name
      const building = buildingStore.getBuilding(15)
      if (building && buildingStore.room) {
        return buildingStore.room.getBuildCurrentName(15)
      }
      // Fallback: get from string system
      const buildingConfig = getString('15_0')
      return typeof buildingConfig === 'object' && buildingConfig !== null && 'title' in buildingConfig
        ? buildingConfig.title as string
        : 'Radio'
    }
    
    case 'gate': {
      // Get building 14 (Gate) name
      const building = buildingStore.getBuilding(14)
      if (building && buildingStore.room) {
        return buildingStore.room.getBuildCurrentName(14)
      }
      // Fallback: get from string system
      const buildingConfig = getString('14_0')
      return typeof buildingConfig === 'object' && buildingConfig !== null && 'title' in buildingConfig
        ? buildingConfig.title as string
        : 'Gate'
    }
    
    case 'site': {
      // Get site name for site panel
      const siteId = uiStore.sitePanelSiteId
      if (siteId) {
        const map = playerStore.map
        if (map) {
          const site = map.getSite(siteId)
          if (site) {
            return site.getName()
          }
        }
      }
      return ''
    }
    
    case 'siteStorage': {
      // Get site name for site storage panel
      const siteId = uiStore.siteStoragePanelSiteId
      if (siteId) {
        const map = playerStore.map
        if (map) {
          const site = map.getSite(siteId)
          if (site) {
            return site.getName()
          }
        }
      }
      return ''
    }
    
    case 'siteExplore': {
      // Get site name for site explore panel
      const siteId = uiStore.siteExplorePanelSiteId
      if (siteId) {
        const map = playerStore.map
        if (map) {
          const site = map.getSite(siteId)
          if (site) {
            // Show secret room title when in secret rooms OR when entry dialog is shown
            // (matches original game: String 3012[secretRoomType] for both cases)
            if (site.isInSecretRooms || site.isSecretRoomsEntryShowed) {
              const titleArray = getString(3012)
              const secretRoomType = site.secretRoomType ?? 0
              return Array.isArray(titleArray) ? titleArray[secretRoomType] || titleArray[0] : titleArray || `Secret Room ${secretRoomType}`
            }
            return site.getName()
          }
        }
      }
      return ''
    }
    
    case 'gateOut':
      return '' // Empty title for gate out panel
    
    case 'map':
      return '' // Empty title for map panel (matches original uiConfig)
    
    case 'npc': {
      // Get NPC name for NPC panel
      const npcId = uiStore.npcPanelNpcId
      if (npcId) {
        try {
          const npcManager = playerStore.getNPCManager()
          const npc = npcManager.getNPC(npcId)
          return npc.getName()
        } catch {
          return ''
        }
      }
      return ''
    }
    
    case 'npcStorage': {
      // Get NPC name for NPC storage panel
      const npcId = uiStore.npcStoragePanelNpcId
      if (npcId) {
        try {
          const npcManager = playerStore.getNPCManager()
          const npc = npcManager.getNPC(npcId)
          return npc.getName()
        } catch {
          return ''
        }
      }
      return ''
    }
    
    default: 
      return ''
  }
}

