/**
 * Map System Test Screen
 * Test screen for Map System functionality
 */

import { useState, useEffect } from 'react'
import { TestScreen } from './TestScreen'
import { Map } from '@/core/game/world/Map'
import { Site, HOME_SITE, AD_SITE, WORK_SITE, GAS_SITE, BAZAAR_SITE } from '@/core/game/world/Site'
import { usePlayerStore } from '@/core/store/playerStore'
import { useLogStore } from '@/core/store/logStore'
import { emitter } from '@/common/utils/emitter'
import { TestPanel, TestSection, TestButton, TestResultsList, useTestResults } from './component'

export function MapSystemTestScreen() {
  const { results, runTest, clearResults } = useTestResults()
  const [map, setMap] = useState<Map | null>(null)
  const [playerStore] = useState(() => usePlayerStore.getState())
  const [logStore] = useState(() => useLogStore.getState())
  const [unlockEvents, setUnlockEvents] = useState<Array<{ type: string; id: number; timestamp: number }>>([])
  const [closeEvents, setCloseEvents] = useState<Array<{ siteId: number; timestamp: number }>>([])

  // Listen to events
  useEffect(() => {
    const handleUnlock = (entity: any) => {
      const id = entity.id || (entity instanceof Site ? entity.id : null)
      if (id !== null) {
        setUnlockEvents(prev => [...prev, {
          type: entity instanceof Site ? 'site' : 'npc',
          id,
          timestamp: Date.now()
        }])
      }
    }

    const handleClose = (siteId: number) => {
      setCloseEvents(prev => [...prev, {
        siteId,
        timestamp: Date.now()
      }])
    }

    emitter.on('unlock_site', handleUnlock)
    emitter.on('close_site', handleClose)

    return () => {
      emitter.off('unlock_site', handleUnlock)
      emitter.off('close_site', handleClose)
    }
  }, [])

  // Test Map Initialization
  const testMapInitialization = () => {
    try {
      const newMap = new Map()
      newMap.init()
      
      const homeSite = newMap.getSite(HOME_SITE)
      const defaultSites = [HOME_SITE, GAS_SITE, AD_SITE, WORK_SITE, BAZAAR_SITE]
      const allSitesExist = defaultSites.every(id => newMap.getSite(id) !== undefined)
      
      runTest(
        'Map Initialization',
        'Map initialized with default sites',
        () => {
          const pos = newMap.pos
          const siteCount = Object.keys((newMap as any).siteMap).length
          return `Position: (${pos.x}, ${pos.y}), Sites: ${siteCount}, Home exists: ${homeSite !== undefined}, All default sites: ${allSitesExist}`
        }
      )
      setMap(newMap)
    } catch (error) {
      runTest(
        'Map Initialization',
        'Map initialized with default sites',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Site Unlocking
  const testSiteUnlocking = () => {
    if (!map) {
      runTest('Site Unlocking', 'Site unlocked successfully', () => 'Map not initialized')
      return
    }

    try {
      const testSiteId = 1
      const beforeCount = Object.keys((map as any).siteMap).length
      map.unlockSite(testSiteId)
      const afterCount = Object.keys((map as any).siteMap).length
      const site = map.getSite(testSiteId)
      
      runTest(
        'Site Unlocking',
        'Site unlocked successfully',
        () => `Before: ${beforeCount} sites, After: ${afterCount} sites, Site exists: ${site !== undefined}, Site ID: ${site?.id}`
      )
    } catch (error) {
      runTest(
        'Site Unlocking',
        'Site unlocked successfully',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Duplicate Unlock Prevention
  const testDuplicateUnlock = () => {
    if (!map) {
      runTest('Duplicate Unlock Prevention', 'Duplicate unlock prevented', () => 'Map not initialized')
      return
    }

    try {
      const testSiteId = 2
      map.unlockSite(testSiteId)
      const count1 = Object.keys((map as any).siteMap).length
      map.unlockSite(testSiteId) // Try to unlock again
      const count2 = Object.keys((map as any).siteMap).length
      
      runTest(
        'Duplicate Unlock Prevention',
        'Duplicate unlock prevented',
        () => `First unlock: ${count1} sites, Second unlock: ${count2} sites, Same count: ${count1 === count2}`
      )
    } catch (error) {
      runTest(
        'Duplicate Unlock Prevention',
        'Duplicate unlock prevented',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Site Closing
  const testSiteClosing = () => {
    if (!map) {
      runTest('Site Closing', 'Site closed successfully', () => 'Map not initialized')
      return
    }

    try {
      const testSiteId = 3
      map.unlockSite(testSiteId)
      const site = map.getSite(testSiteId)
      const canClose = site?.canClose() ?? false
      
      if (!canClose) {
        runTest(
          'Site Closing',
          'Site closed successfully',
          () => `Site ${testSiteId} cannot be closed (expected for some site types)`
        )
        return
      }

      map.closeSite(testSiteId)
      const queueLength = (map as any).needDeleteSiteList.length
      
      runTest(
        'Site Closing',
        'Site closed successfully',
        () => `Site queued for deletion, Queue length: ${queueLength}`
      )
    } catch (error) {
      runTest(
        'Site Closing',
        'Site closed successfully',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Delete Unusable Sites
  const testDeleteUnusableSites = () => {
    if (!map) {
      runTest('Delete Unusable Sites', 'Sites deleted successfully', () => 'Map not initialized')
      return
    }

    try {
      const testSiteId = 4
      map.unlockSite(testSiteId)
      const site = map.getSite(testSiteId)
      
      if (!site || !site.canClose()) {
        runTest(
          'Delete Unusable Sites',
          'Sites deleted successfully',
          () => `Site ${testSiteId} cannot be closed, skipping deletion test`
        )
        return
      }

      map.closeSite(testSiteId)
      const beforeClosed = site.closed
      map.deleteUnusableSite()
      const afterClosed = site.closed
      const queueLength = (map as any).needDeleteSiteList.length
      
      runTest(
        'Delete Unusable Sites',
        'Sites deleted successfully',
        () => `Before: closed=${beforeClosed}, After: closed=${afterClosed}, Queue: ${queueLength}`
      )
    } catch (error) {
      runTest(
        'Delete Unusable Sites',
        'Sites deleted successfully',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Position Management
  const testPositionManagement = () => {
    if (!map) {
      runTest('Position Management', 'Position updated correctly', () => 'Map not initialized')
      return
    }

    try {
      const originalPos = { ...map.pos }
      const newPos = { x: 100, y: 200 }
      map.updatePos(newPos)
      const updatedPos = map.pos
      map.resetPos()
      const resetPos = map.pos
      const homeSite = map.getSite(HOME_SITE)
      
      runTest(
        'Position Management',
        'Position updated correctly',
        () => `Original: (${originalPos.x}, ${originalPos.y}), Updated: (${updatedPos.x}, ${updatedPos.y}), Reset: (${resetPos.x}, ${resetPos.y}), Matches home: ${resetPos.x === homeSite?.pos.x && resetPos.y === homeSite?.pos.y}`
      )
    } catch (error) {
      runTest(
        'Position Management',
        'Position updated correctly',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test forEach Iteration
  const testForEach = () => {
    if (!map) {
      runTest('forEach Iteration', 'Sites iterated correctly', () => 'Map not initialized')
      return
    }

    try {
      const sites: Site[] = []
      map.forEach((entity) => {
        if (entity instanceof Site) {
          sites.push(entity)
        }
      })
      
      const closedSites = sites.filter(s => s.closed).length
      const bossSubSites = sites.filter(s => {
        const id = s.id
        return id >= 300 && id <= 399
      }).length
      
      runTest(
        'forEach Iteration',
        'Sites iterated correctly',
        () => `Total sites: ${sites.length}, Closed: ${closedSites}, Boss sub-sites (should be 0): ${bossSubSites}`
      )
    } catch (error) {
      runTest(
        'forEach Iteration',
        'Sites iterated correctly',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test NPC Unlocking (Stub)
  const testNpcUnlocking = () => {
    if (!map) {
      runTest('NPC Unlocking', 'NPC unlocked successfully', () => 'Map not initialized')
      return
    }

    try {
      const testNpcId = 1
      const beforeCount = Object.keys((map as any).npcMap).length
      map.unlockNpc(testNpcId)
      const afterCount = Object.keys((map as any).npcMap).length
      const isUnlocked = (map as any).npcMap[testNpcId] === true
      
      runTest(
        'NPC Unlocking',
        'NPC unlocked successfully',
        () => `Before: ${beforeCount} NPCs, After: ${afterCount} NPCs, Unlocked: ${isUnlocked}`
      )
    } catch (error) {
      runTest(
        'NPC Unlocking',
        'NPC unlocked successfully',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Save/Restore
  const testSaveRestore = () => {
    if (!map) {
      runTest('Save/Restore', 'Map saved and restored correctly', () => 'Map not initialized')
      return
    }

    try {
      // Unlock some sites and NPCs
      map.unlockSite(5)
      map.unlockSite(6)
      map.unlockNpc(1)
      map.updatePos({ x: 50, y: 75 })
      
      const saveData = map.save()
      const siteCount = Object.keys(saveData.siteMap).length
      const npcCount = saveData.npcMap.length
      
      // Create new map and restore
      const newMap = new Map()
      newMap.restore(saveData)
      
      const restoredSiteCount = Object.keys((newMap as any).siteMap).length
      const restoredNpcCount = Object.keys((newMap as any).npcMap).length
      const restoredPos = newMap.pos
      const matches = restoredSiteCount === siteCount && 
                     restoredNpcCount === npcCount &&
                     restoredPos.x === saveData.pos.x &&
                     restoredPos.y === saveData.pos.y
      
      runTest(
        'Save/Restore',
        'Map saved and restored correctly',
        () => `Original: ${siteCount} sites, ${npcCount} NPCs, Pos: (${saveData.pos.x}, ${saveData.pos.y}) | Restored: ${restoredSiteCount} sites, ${restoredNpcCount} NPCs, Pos: (${restoredPos.x}, ${restoredPos.y}) | Matches: ${matches}`
      )
      setMap(newMap)
    } catch (error) {
      runTest(
        'Save/Restore',
        'Map saved and restored correctly',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Restore with Null (Initialization)
  const testRestoreNull = () => {
    try {
      const newMap = new Map()
      newMap.restore(null)
      
      const homeSite = newMap.getSite(HOME_SITE)
      const siteCount = Object.keys((newMap as any).siteMap).length
      const pos = newMap.pos
      
      runTest(
        'Restore Null (Init)',
        'Map initialized when restore(null) called',
        () => `Sites: ${siteCount}, Home exists: ${homeSite !== undefined}, Pos: (${pos.x}, ${pos.y})`
      )
      setMap(newMap)
    } catch (error) {
      runTest(
        'Restore Null (Init)',
        'Map initialized when restore(null) called',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test PlayerStore Integration
  const testPlayerStoreIntegration = () => {
    try {
      playerStore.initializeMap()
      const map = playerStore.getMap()
      const homeSite = map.getSite(HOME_SITE)
      
      runTest(
        'PlayerStore Integration',
        'Map accessible via PlayerStore',
        () => `Map exists: ${map !== null}, Home site: ${homeSite !== undefined}, Pos: (${map.pos.x}, ${map.pos.y})`
      )
    } catch (error) {
      runTest(
        'PlayerStore Integration',
        'Map accessible via PlayerStore',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Get current map state info
  const getMapInfo = () => {
    if (!map) return 'Map not initialized'
    
    const siteCount = Object.keys((map as any).siteMap).length
    const npcCount = Object.keys((map as any).npcMap).length
    const queueLength = (map as any).needDeleteSiteList.length
    const pos = map.pos
    
    return `Sites: ${siteCount}, NPCs: ${npcCount}, Queue: ${queueLength}, Pos: (${pos.x}, ${pos.y})`
  }

  // Get site list
  const getSiteList = () => {
    if (!map) return []
    
    const sites: Array<{ id: number; name: string; closed: boolean }> = []
    map.forEach((entity) => {
      if (entity instanceof Site) {
        sites.push({
          id: entity.id,
          name: entity.getName(),
          closed: entity.closed || false
        })
      }
    })
    
    return sites.sort((a, b) => a.id - b.id)
  }

  return (
    <TestScreen title="Map System Test">
      <div className="w-full h-full bg-gray-900 text-white p-4 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Map System Test</h1>
          
          {/* Map State Display */}
          <TestPanel
            title="Map State"
            defaultPosition={{ x: 20, y: 20 }}
            width={300}
          >
            <div className="space-y-2 text-xs">
              <div className="font-semibold">Current State:</div>
              <div className="text-gray-300">{getMapInfo()}</div>
              
              {map && (
                <>
                  <div className="mt-4 font-semibold">Sites ({getSiteList().length}):</div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {getSiteList().map(site => (
                      <div key={site.id} className="text-xs text-gray-400">
                        {site.id}: {site.name} {site.closed && '(closed)'}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TestPanel>

          {/* Event Log */}
          <TestPanel
            title="Event Log"
            defaultPosition={{ x: 340, y: 20 }}
            width={300}
          >
            <div className="space-y-2 text-xs">
              <div className="font-semibold">Unlock Events ({unlockEvents.length}):</div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {unlockEvents.slice(-10).reverse().map((event, idx) => (
                  <div key={idx} className="text-xs text-gray-400">
                    {event.type} {event.id}
                  </div>
                ))}
              </div>
              
              <div className="mt-2 font-semibold">Close Events ({closeEvents.length}):</div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {closeEvents.slice(-10).reverse().map((event, idx) => (
                  <div key={idx} className="text-xs text-gray-400">
                    Site {event.siteId}
                  </div>
                ))}
              </div>
            </div>
          </TestPanel>

          {/* Test Controls */}
          <TestPanel
            title="Test Controls"
            defaultPosition={{ x: 20, y: 300 }}
            width={620}
          >
            <div className="space-y-4">
              <TestSection title="Initialization">
                <TestButton onClick={testMapInitialization} variant="primary">
                  Initialize Map
                </TestButton>
                <TestButton onClick={testPlayerStoreIntegration} variant="secondary">
                  Test PlayerStore Integration
                </TestButton>
              </TestSection>

              <TestSection title="Site Management">
                <TestButton onClick={testSiteUnlocking} variant="primary">
                  Unlock Site
                </TestButton>
                <TestButton onClick={testDuplicateUnlock} variant="secondary">
                  Test Duplicate Unlock
                </TestButton>
                <TestButton onClick={testSiteClosing} variant="secondary">
                  Close Site
                </TestButton>
                <TestButton onClick={testDeleteUnusableSites} variant="secondary">
                  Delete Unusable Sites
                </TestButton>
              </TestSection>

              <TestSection title="Position & Iteration">
                <TestButton onClick={testPositionManagement} variant="primary">
                  Test Position Management
                </TestButton>
                <TestButton onClick={testForEach} variant="secondary">
                  Test forEach
                </TestButton>
              </TestSection>

              <TestSection title="NPC & Save">
                <TestButton onClick={testNpcUnlocking} variant="primary">
                  Unlock NPC (Stub)
                </TestButton>
                <TestButton onClick={testSaveRestore} variant="primary">
                  Test Save/Restore
                </TestButton>
                <TestButton onClick={testRestoreNull} variant="secondary">
                  Test Restore Null
                </TestButton>
              </TestSection>

              <TestSection title="Results">
                <TestButton onClick={clearResults} variant="danger">
                  Clear Results
                </TestButton>
              </TestSection>
            </div>
          </TestPanel>

          {/* Test Results */}
          <TestPanel
            title="Test Results"
            defaultPosition={{ x: 20, y: 600 }}
            width={620}
            maxHeight="400px"
          >
            <TestResultsList results={results} />
          </TestPanel>
        </div>
      </div>
    </TestScreen>
  )
}

