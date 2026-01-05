/**
 * Panel Renderer Component
 * Extract panel rendering logic
 * Extracted from MainScene.tsx
 */

import type { Panel } from '@/core/store/uiStore'
import { useUIStore } from '@/core/store/uiStore'
import { usePlayerStore } from '@/core/store/playerStore'
import { HomePanelContent } from '@/module/shelter/HomePanelContent'
import { BuildPanelContent } from '@/module/shelter/BuildPanelContent'
import { StoragePanelContent } from '@/module/shelter/StoragePanelContent'
import { RadioPanelContent } from '@/module/shelter/RadioPanelContent'
import { GatePanelContent } from '@/module/shelter/GatePanelContent'
import { GateOutPanelContent } from '@/module/shelter/GateOutPanelContent'
import { MapPanelContent } from '@/module/map/MapPanelContent'
import { SitePanelContent } from '@/module/location/SitePanelContent'
import { SiteStoragePanelContent } from '@/module/location/SiteStoragePanelContent'
import { SiteExploreContent } from '@/module/location/SiteExploreContent'
import { NPCPanelContent } from '@/module/npc/NPCPanelContent'
import { NPCTradePanelContent } from '@/module/npc/NPCTradePanelContent'
import { audioManager, MusicPaths, getSiteMusic } from '@/core/game/systems/AudioManager'
import { saveAll } from '@/core/game/systems/SaveSystem'

// Get store state types by calling getState() on the store
type UIStoreState = ReturnType<typeof useUIStore.getState>
type PlayerStoreState = ReturnType<typeof usePlayerStore.getState>

interface PanelRendererProps {
  currentPanel: Panel
  uiStore: UIStoreState
  playerStore: PlayerStoreState
}

/**
 * Render current panel based on openPanel state
 * Matches Navigation.current() behavior
 */
export function PanelRenderer({ currentPanel, uiStore, playerStore }: PanelRendererProps) {
  switch (currentPanel) {
    case 'home':
      return <HomePanelContent />
    
    // Future panels (to be implemented in later phases)
    // These will be 1:1 ports of original panels
    case 'build': {
      const buildingId = uiStore.buildPanelBuildingId
      if (buildingId) {
        return <BuildPanelContent buildingId={buildingId} />
      }
      return <div className="text-white p-4">No building selected</div>
    }
    
    case 'storage':
      return <StoragePanelContent />
    
    case 'radio':
      return <RadioPanelContent />
    
    case 'gate':
      return <GatePanelContent />
    
    case 'gateOut':
      return <GateOutPanelContent />
    
    case 'map':
      return <MapPanelContent />
    
    case 'site': {
      const siteId = uiStore.sitePanelSiteId
      if (siteId) {
        const map = playerStore.map
        if (map) {
          const site = map.getSite(siteId)
          if (site) {
            return (
              <SitePanelContent 
                site={site}
                onStorageClick={() => {
                  // Clear haveNewItems flag when opening storage (matches original game)
                  site.haveNewItems = false
                  // Navigate to site storage panel
                  uiStore.openPanelAction('siteStorage', undefined, siteId)
                }}
                onExploreClick={() => {
                  // Navigate to site explore panel
                  uiStore.openPanelAction('siteExplore', undefined, siteId)
                }}
              />
            )
          }
        }
      }
      return <div className="text-white p-4">Site not found</div>
    }
    
    case 'siteStorage': {
      const siteId = uiStore.siteStoragePanelSiteId
      if (siteId) {
        return <SiteStoragePanelContent siteId={siteId} />
      }
      return <div className="text-white p-4">Site not found</div>
    }
    
    case 'siteExplore': {
      const siteId = uiStore.siteExplorePanelSiteId
      if (siteId) {
        const map = playerStore.map
        if (map) {
          const site = map.getSite(siteId)
          if (site) {
            const onBackWrapper = () => {
              // Get fresh site reference to ensure we have the latest state
              const playerStore = usePlayerStore.getState()
              const map = playerStore.map
              const currentSite = map?.getSite(siteId)
              
              // Handle secret rooms if needed (same logic as handleBackButton)
              if (currentSite && (currentSite.isInSecretRooms || currentSite.isSecretRoomsEntryShowed || (currentSite.secretRoomsShowedCount > 0 && currentSite.secretRooms.length > 0 && !currentSite.isSecretRoomsEnd()))) {
                currentSite.secretRoomsEnd()
                // Stop secret room music and resume site music when leaving secret rooms (matches OriginalGame/src/ui/battleAndWorkNode.js:116-119)
                if (audioManager.getPlayingMusic() === MusicPaths.SITE_SECRET) {
                  audioManager.stopMusic()
                  const siteMusic = getSiteMusic(currentSite.id)
                  audioManager.playMusic(siteMusic, true)
                }
                currentSite.isSecretRoomsEntryShowed = false
                
                if (currentSite.secretRoomsConfig) {
                  const maxCount = Number.parseInt(currentSite.secretRoomsConfig.maxCount)
                  currentSite.secretRoomsShowedCount = maxCount
                }
                
                saveAll().catch((err: Error) => {
                  console.error('[PanelRenderer] Auto-save failed in onBack wrapper:', err)
                })
              }
              
              uiStore.openPanelAction('site', undefined, siteId)
            }
            return (
              <SiteExploreContent
                site={site}
                onBack={onBackWrapper}
              />
            )
          }
        }
      }
      return <div className="text-white p-4">Site not found</div>
    }
    
    case 'npc': {
      const npcId = uiStore.npcPanelNpcId
      if (npcId) {
        return <NPCPanelContent />
      }
      return <div className="text-white p-4">NPC not found</div>
    }
    
    case 'npcStorage': {
      const npcId = uiStore.npcStoragePanelNpcId
      if (npcId) {
        return <NPCTradePanelContent npcId={npcId} />
      }
      return <div className="text-white p-4">NPC not found</div>
    }
    
    default:
      // Default to home (matches Navigation.current() default)
      return <HomePanelContent />
  }
}

