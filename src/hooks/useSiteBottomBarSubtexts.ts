/**
 * useSiteBottomBarSubtexts Hook
 * Calculates bottom bar subtexts for site-related panels
 * Extracted from MainScene.tsx
 */

import { useMemo } from 'react'
import type { Panel } from '@/store/uiStore'
import type { Map } from '@/game/world/Map'
import { getSiteBottomBarProps } from '@/components/panels/site/SitePanelContent'

interface UseSiteBottomBarSubtextsProps {
  currentPanel: Panel
  sitePanelSiteId: number | null
  siteExplorePanelSiteId: number | null
  siteStoragePanelSiteId: number | null
  map: Map | null
}

/**
 * Returns bottom bar subtexts (left and right) for site-related panels
 * Returns undefined for non-site panels
 */
export function useSiteBottomBarSubtexts({
  currentPanel,
  sitePanelSiteId,
  siteExplorePanelSiteId,
  siteStoragePanelSiteId,
  map
}: UseSiteBottomBarSubtextsProps) {
  // Get site storage items for dependency tracking (ensures updates when depository changes)
  const siteStorageItems = useMemo(() => {
    if (currentPanel === 'site' && sitePanelSiteId && map) {
      const site = map.getSite(sitePanelSiteId)
      if (site) {
        // Return a serialized version of storage items to detect changes
        return JSON.stringify(site.storage.items)
      }
    }
    return null
  }, [currentPanel, sitePanelSiteId, map])

  // Get site bottom bar props (progress and item count) for site panel
  // Use useMemo to make it reactive to playerStore.map changes
  // Also depend on site storage items to ensure updates when depository changes
  return useMemo(() => {
    if (currentPanel !== 'site' && currentPanel !== 'siteExplore' && currentPanel !== 'siteStorage') {
      return { leftSubtext: undefined, rightSubtext: undefined }
    }
    
    let siteId: number | null = null
    if (currentPanel === 'site') {
      siteId = sitePanelSiteId
    } else if (currentPanel === 'siteExplore') {
      siteId = siteExplorePanelSiteId
    } else if (currentPanel === 'siteStorage') {
      siteId = siteStoragePanelSiteId
    }
    
    if (siteId && map) {
      const site = map.getSite(siteId)
      if (site) {
        if (currentPanel === 'siteExplore') {
          // For site explore, show progress and item count with labels
          return {
            leftSubtext: site.isInSecretRooms ? "???" : `Progress ${site.getCurrentProgressStr()}`,
            rightSubtext: `Items ${site.storage.getAllItemNum()}`
          }
        } else if (currentPanel === 'siteStorage') {
          // For site storage, show "Depository" and item count
          return {
            leftSubtext: "Depository",
            rightSubtext: String(site.storage.getAllItemNum())
          }
        } else {
          const props = getSiteBottomBarProps(site)
          return {
            leftSubtext: props.leftSubtext,
            rightSubtext: props.rightSubtext
          }
        }
      }
    }
    
    return { leftSubtext: undefined, rightSubtext: undefined }
  }, [
    currentPanel,
    sitePanelSiteId,
    siteExplorePanelSiteId,
    siteStoragePanelSiteId,
    map, // This will trigger recalculation when map changes
    siteStorageItems // Also depend on site storage items to ensure updates when depository changes
  ])
}

