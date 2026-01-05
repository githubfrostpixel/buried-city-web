/**
 * useSiteBottomBarSubtexts Hook
 * Calculates bottom bar subtexts for site-related panels
 * Extracted from MainScene.tsx
 */

import { useMemo, useState, useEffect } from 'react'
import type { Panel } from '@/core/store/uiStore'
import type { Map } from '@/core/game/world/Map'
import { getSiteBottomBarProps } from '@/module/location/SitePanelContent'

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

  // Poll site state to detect changes (since site is a mutable object, React won't detect property changes)
  // This ensures the hook updates when step, isSecretRoomsEntryShowed, or isInSecretRooms changes
  const [siteStateTrigger, setSiteStateTrigger] = useState(0)
  
  useEffect(() => {
    // Only poll when we're in siteExplore panel
    if (currentPanel !== 'siteExplore' || !siteExplorePanelSiteId || !map) {
      return
    }
    
    const site = map.getSite(siteExplorePanelSiteId)
    if (!site) {
      return
    }
    
    // Track previous state to only update when something actually changes
    let previousState = JSON.stringify({
      step: site.step,
      isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
      isInSecretRooms: site.isInSecretRooms,
      roomsLength: site.rooms.length
    })
    
    // Poll every 100ms to check for changes (fast enough for responsive UI, not too frequent)
    const interval = setInterval(() => {
      // Get current state
      const currentState = JSON.stringify({
        step: site.step,
        isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
        isInSecretRooms: site.isInSecretRooms,
        roomsLength: site.rooms.length
      })
      
      // Only update trigger if state actually changed
      if (currentState !== previousState) {
        previousState = currentState
        setSiteStateTrigger(prev => prev + 1)
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [currentPanel, siteExplorePanelSiteId, map])

  // Get site state for dependency tracking (ensures updates when site progress or secret room state changes)
  // This tracks step, isSecretRoomsEntryShowed, isInSecretRooms, and rooms.length for siteExplore panel
  const siteState = useMemo(() => {
    if (currentPanel === 'siteExplore' && siteExplorePanelSiteId && map) {
      const site = map.getSite(siteExplorePanelSiteId)
      if (site) {
        // Return a serialized version of site state to detect changes
        // Include siteStateTrigger to ensure this re-evaluates when polling detects changes
        return JSON.stringify({
          step: site.step,
          isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
          isInSecretRooms: site.isInSecretRooms,
          roomsLength: site.rooms.length,
          trigger: siteStateTrigger // Include trigger to force re-evaluation
        })
      }
    }
    return null
  }, [currentPanel, siteExplorePanelSiteId, map, siteStateTrigger])

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
          // Show "???" when secret room entry is shown OR when in secret rooms
          // This matches OriginalGame/src/ui/battleAndWorkNode.js:54-66
          return {
            leftSubtext: (site.isSecretRoomsEntryShowed || site.isInSecretRooms) ? "???" : `Progress: ${site.getCurrentProgressStr()}`,
            rightSubtext: `Items: ${site.storage.getAllItemNum()}`
          }
        } else if (currentPanel === 'siteStorage') {
          // For site storage, show "Depository" and item count
          return {
            leftSubtext: "Depository",
            rightSubtext: `Items: ${site.storage.getAllItemNum()}`
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
    siteStorageItems, // Also depend on site storage items to ensure updates when depository changes
    siteState // Also depend on site state to ensure updates when progress or secret room state changes
  ])
}

