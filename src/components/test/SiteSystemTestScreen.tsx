/**
 * Site System Test Screen
 * Test screen for Site System functionality
 */

import { useState, useEffect } from 'react'
import { TestScreen } from './TestScreen'
import {
  Site,
  AdSite,
  BazaarSite,
  WorkSite,
  BossSite,
  AD_SITE,
  BOSS_SITE,
  WORK_SITE,
  GAS_SITE,
  BAZAAR_SITE
} from '@/game/world/Site'
import { siteConfig } from '@/data/sites'
import { SitePanelContent, getSiteBottomBarProps } from '@/components/panels/SitePanelContent'
import { BottomBar } from '@/components/layout/BottomBar'
import { TestPanel, TestSection, TestButton, TestResultsList, useTestResults } from './component'

export function SiteSystemTestScreen() {
  const { results, runTest, clearResults } = useTestResults()
  const [currentSite, setCurrentSite] = useState<Site | null>(null)
  const [siteType, setSiteType] = useState<string>('normal')
  const [siteId, setSiteId] = useState<number>(1)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Test Site Creation
  const testSiteCreation = () => {
    try {
      const site = new Site(100) // Home site
      runTest(
        'Site Creation',
        'Site created successfully',
        () => `Site ID: ${site.id}, Pos: (${site.pos.x}, ${site.pos.y}), Rooms: ${site.rooms.length}`
      )
      setCurrentSite(site)
    } catch (error) {
      runTest(
        'Site Creation',
        'Site created successfully',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Room Generation
  const testRoomGeneration = () => {
    try {
      // Create a site with rooms (not home)
      const testSiteId = 1
      if (!siteConfig[String(testSiteId)]) {
        runTest(
          'Room Generation',
          'Site config not found - need full siteConfig data',
          () => 'Site config not found - need full siteConfig data'
        )
        return
      }

      const site = new Site(testSiteId)
      site.init()
      
      const battleRooms = site.rooms.filter(r => r.type === 'battle').length
      const workRooms = site.rooms.filter(r => r.type === 'work').length
      const lastRoom = site.rooms[site.rooms.length - 1]
      const isWorkRoomLast = lastRoom?.type === 'work'
      
      runTest(
        'Room Generation',
        'Rooms generated correctly',
        () => `Total: ${site.rooms.length}, Battle: ${battleRooms}, Work: ${workRooms}, Last is work: ${isWorkRoomLast}`
      )
      setCurrentSite(site)
    } catch (error) {
      runTest(
        'Room Generation',
        'Rooms generated correctly',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Battle Room Generation
  const testBattleRoomGeneration = () => {
    try {
      const testSiteId = 1
      if (!siteConfig[String(testSiteId)]) {
        runTest(
          'Battle Room Generation',
          'Site config not found',
          () => 'Site config not found'
        )
        return
      }

      const site = new Site(testSiteId)
      const battleRooms = site.genBattleRoom()
      
      runTest(
        'Battle Room Generation',
        'Battle rooms generated correctly',
        () => `Generated ${battleRooms.length} battle rooms, Difficulties: ${battleRooms.map(r => r.difficulty).join(', ')}`
      )
    } catch (error) {
      runTest(
        'Battle Room Generation',
        'Battle rooms generated correctly',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Work Room Generation
  const testWorkRoomGeneration = () => {
    try {
      const testSiteId = 1
      if (!siteConfig[String(testSiteId)]) {
        runTest(
          'Work Room Generation',
          'Site config not found',
          () => 'Site config not found'
        )
        return
      }

      const site = new Site(testSiteId)
      const workRooms = site.genWorkRoom()
      
      const totalItems = workRooms.reduce((sum, room) => sum + room.length, 0)
      
      runTest(
        'Work Room Generation',
        'Work rooms generated correctly',
        () => `Generated ${workRooms.length} work rooms, Total items: ${totalItems}`
      )
    } catch (error) {
      runTest(
        'Work Room Generation',
        'Work rooms generated correctly',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Room Progress
  const testRoomProgress = () => {
    if (!currentSite || currentSite.rooms.length === 0) {
      runTest(
        'Room Progress',
        'No site with rooms loaded',
        () => 'No site with rooms loaded'
      )
      return
    }

    const initialStep = currentSite.step
    const initialRoom = currentSite.roomBegin()
    const progressStr = currentSite.getProgressStr(0, currentSite.id)
    const currentProgressStr = currentSite.getCurrentProgressStr()
    const isEnd = currentSite.isSiteEnd()

    runTest(
      'Room Progress',
      'Progress tracking works',
      () => `Step: ${initialStep}, Progress: ${progressStr}, Current: ${currentProgressStr}, IsEnd: ${isEnd}, Room type: ${initialRoom?.type}`
    )
  }

  // Test Room Completion
  const testRoomCompletion = () => {
    if (!currentSite || currentSite.rooms.length === 0) {
      runTest(
        'Room Completion',
        'No site with rooms loaded',
        () => 'No site with rooms loaded'
      )
      return
    }

    const initialStep = currentSite.step
    currentSite.roomEnd(true)
    const newStep = currentSite.step
    const isEnd = currentSite.isSiteEnd()

    runTest(
      'Room Completion',
      'Room completion works',
      () => `Step: ${initialStep} -> ${newStep}, IsEnd: ${isEnd}`
    )
  }

  // Test Secret Room Discovery
  const testSecretRoomDiscovery = () => {
    try {
      const testSiteId = 1
      if (!siteConfig[String(testSiteId)]) {
        runTest(
          'Secret Room Discovery',
          'Site config not found',
          () => 'Site config not found'
        )
        return
      }

      const site = new Site(testSiteId)
      const initialCount = site.secretRoomsShowedCount
      const initialShowed = site.isSecretRoomsEntryShowed
      
      // Try to discover secret room
      site.testSecretRoomsBegin()
      
      const newCount = site.secretRoomsShowedCount
      const newShowed = site.isSecretRoomsEntryShowed
      const hasSecretRooms = site.secretRooms.length > 0
      
      runTest(
        'Secret Room Discovery',
        'Secret room discovery works',
        () => `Count: ${initialCount} -> ${newCount}, Showed: ${initialShowed} -> ${newShowed}, Has rooms: ${hasSecretRooms}`
      )
      setCurrentSite(site)
    } catch (error) {
      runTest(
        'Secret Room Discovery',
        'Secret room discovery works',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Secret Room Generation
  const testSecretRoomGeneration = () => {
    if (!currentSite || !currentSite.secretRoomsConfig) {
      runTest(
        'Secret Room Generation',
        'No site with secret rooms config loaded',
        () => 'No site with secret rooms config loaded'
      )
      return
    }

    const site = currentSite
    site.genSecretRooms()
    
    const battleRooms = site.secretRooms.filter(r => r.type === 'battle').length
    const workRooms = site.secretRooms.filter(r => r.type === 'work').length
    const lastRoom = site.secretRooms[site.secretRooms.length - 1]
    const isWorkRoomLast = lastRoom?.type === 'work'
    
    runTest(
      'Secret Room Generation',
      'Secret rooms generated correctly',
      () => `Total: ${site.secretRooms.length}, Battle: ${battleRooms}, Work: ${workRooms}, Last is work: ${isWorkRoomLast}`
    )
  }

  // Test AdSite
  const testAdSite = () => {
    try {
      const site = new AdSite(AD_SITE)
      site.init()
      
      const isEnd = site.isSiteEnd()
      const progressStr = site.getProgressStr()
      const currentProgressStr = site.getCurrentProgressStr()
      
      runTest(
        'AdSite',
        'AdSite works correctly',
        () => `IsEnd: ${isEnd}, Progress: ${progressStr}, Current: ${currentProgressStr}, Rooms: ${site.rooms.length}`
      )
      setCurrentSite(site)
    } catch (error) {
      runTest(
        'AdSite',
        'AdSite works correctly',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test BazaarSite
  const testBazaarSite = () => {
    try {
      const site = new BazaarSite(BAZAAR_SITE)
      site.init()
      
      const isEnd = site.isSiteEnd()
      const progressStr = site.getProgressStr()
      
      runTest(
        'BazaarSite',
        'BazaarSite works correctly',
        () => `IsEnd: ${isEnd}, Progress: ${progressStr}, Rooms: ${site.rooms.length}`
      )
      setCurrentSite(site)
    } catch (error) {
      runTest(
        'BazaarSite',
        'BazaarSite works correctly',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test WorkSite
  const testWorkSite = () => {
    try {
      const site = new WorkSite(WORK_SITE)
      site.init()
      
      const canClose = site.canClose()
      const isActive = site.isActive
      
      // Test fix
      site.fix()
      const isActiveAfterFix = site.isActive
      const hasFixedTime = site.fixedTime > 0
      
      runTest(
        'WorkSite',
        'WorkSite works correctly',
        () => `CanClose: ${canClose}, IsActive: ${isActive} -> ${isActiveAfterFix}, HasFixedTime: ${hasFixedTime}`
      )
      setCurrentSite(site)
    } catch (error) {
      runTest(
        'WorkSite',
        'WorkSite works correctly',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test BossSite
  const testBossSite = () => {
    try {
      const site = new BossSite(BOSS_SITE)
      site.init()
      
      const isEnd = site.isSiteEnd()
      const progressStr = site.getProgressStr()
      const itemNum = site.getAllItemNum()
      
      runTest(
        'BossSite',
        'BossSite works correctly',
        () => `IsEnd: ${isEnd}, Progress: ${progressStr}, ItemNum: ${itemNum}, SubSites: ${site.bossSubSiteIds.length}`
      )
      setCurrentSite(site)
    } catch (error) {
      runTest(
        'BossSite',
        'BossSite works correctly',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Save/Restore
  const testSaveRestore = () => {
    if (!currentSite) {
      runTest(
        'Save/Restore',
        'No site loaded',
        () => 'No site loaded'
      )
      return
    }

    try {
      const saved = currentSite.save()
      const newSite = new Site(currentSite.id)
      newSite.restore(saved)
      
      const matches = 
        newSite.id === currentSite.id &&
        newSite.step === currentSite.step &&
        newSite.rooms.length === currentSite.rooms.length &&
        newSite.pos.x === currentSite.pos.x &&
        newSite.pos.y === currentSite.pos.y
      
      runTest(
        'Save/Restore',
        'Save and restore works',
        () => `Matches: ${matches}, Saved step: ${saved.step}, Restored step: ${newSite.step}`
      )
    } catch (error) {
      runTest(
        'Save/Restore',
        'Save and restore works',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Site Storage
  const testSiteStorage = () => {
    if (!currentSite) {
      runTest(
        'Site Storage',
        'No site loaded',
        () => 'No site loaded'
      )
      return
    }

    try {
      const initialCount = currentSite.getAllItemNum()
      currentSite.increaseItem('1101011', 5)
      const afterAddCount = currentSite.getAllItemNum()
      const hasNewItems = currentSite.haveNewItems
      
      runTest(
        'Site Storage',
        'Site storage works',
        () => `Initial: ${initialCount}, After add: ${afterAddCount}, HasNewItems: ${hasNewItems}`
      )
    } catch (error) {
      runTest(
        'Site Storage',
        'Site storage works',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Site Info
  const testSiteInfo = () => {
    if (!currentSite) {
      runTest(
        'Site Info',
        'No site loaded',
        () => 'No site loaded'
      )
      return
    }

    try {
      const name = currentSite.getName()
      const des = currentSite.getDes()
      const canClose = currentSite.canClose()
      
      runTest(
        'Site Info',
        'Site info methods work',
        () => `Name: ${name}, Des: ${des.substring(0, 30)}..., CanClose: ${canClose}`
      )
    } catch (error) {
      runTest(
        'Site Info',
        'Site info methods work',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Create site by type
  const createSiteByType = (type: string, id: number) => {
    try {
      let site: Site | null = null
      
      switch (type) {
        case 'normal':
          site = new Site(id)
          break
        case 'ad':
          site = new AdSite(AD_SITE)
          break
        case 'bazaar':
          site = new BazaarSite(BAZAAR_SITE)
          break
        case 'work':
          site = new WorkSite(id === 201 ? GAS_SITE : WORK_SITE)
          break
        case 'boss':
          site = new BossSite(BOSS_SITE)
          break
      }
      
      if (site) {
        site.init()
        setCurrentSite(site)
        runTest(
          'Create Site',
          'Site created',
          () => `Created ${type} site with ID ${site.id}`
        )
      }
    } catch (error) {
      runTest(
        'Create Site',
        'Site created',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Auto-refresh current site info
  useEffect(() => {
    if (!autoRefresh || !currentSite) return
    
    const interval = setInterval(() => {
      // Force re-render by accessing site properties
      currentSite.step
      currentSite.rooms.length
    }, 1000)
    
    return () => clearInterval(interval)
  }, [autoRefresh, currentSite])

  return (
    <TestScreen title="Site System Test">
      <div className="relative w-full h-full" style={{ backgroundColor: '#000000' }}>
        {/* Main Scene Layout - matching original game */}
        {currentSite ? (
          <div className="absolute inset-0">
            <BottomBar
              {...getSiteBottomBarProps(currentSite)}
              leftBtn={true}
              rightBtn={false}
              onLeftClick={() => setCurrentSite(null)}
            >
              <SitePanelContent
                site={currentSite}
                onStorageClick={() => {
                  runTest('UI - Storage Click', 'Storage button works', () => 'Storage button works')
                }}
                onExploreClick={() => {
                  runTest('UI - Explore Click', 'Explore button works', () => `Explore button works, Site ended: ${currentSite.isSiteEnd()}`)
                }}
              />
            </BottomBar>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-900 text-white p-4 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-4">
              <h1 className="text-2xl font-bold">Site System Test</h1>
              <p className="text-gray-400">Create a site to see the UI panel</p>
            </div>
          </div>
        )}
        
        {/* Test Controls Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="pointer-events-auto">
            {/* Current Site Info */}
            {currentSite && (
              <div className="absolute top-20 left-4 bg-gray-800/90 p-4 rounded max-w-xs">
                <h2 className="text-lg font-semibold mb-2">Current Site</h2>
                <div className="text-sm space-y-1">
                  <div>ID: {currentSite.id}</div>
                  <div>Type: {currentSite.constructor.name}</div>
                  <div>Position: ({currentSite.pos.x}, {currentSite.pos.y})</div>
                  <div>Step: {currentSite.step} / {currentSite.rooms.length}</div>
                  <div>Rooms: {currentSite.rooms.length}</div>
                  <div>Storage Items: {currentSite.getAllItemNum()}</div>
                  {currentSite.secretRoomsConfig && (
                    <div>Secret Rooms: {currentSite.secretRooms.length} (Showed: {currentSite.secretRoomsShowedCount})</div>
                  )}
                  {currentSite instanceof WorkSite && (
                    <div>Active: {currentSite.isActive ? 'Yes' : 'No'}, Fixed Time: {currentSite.fixedTime}</div>
                  )}
                </div>
              </div>
            )}

            {/* Test Panels - Draggable */}
            <div className="absolute" style={{ top: currentSite ? '280px' : '20px', left: '20px' }}>
              {/* Basic Tests */}
            <TestPanel
              title="Basic Tests"
              defaultPosition={{ x: 20, y: 20 }}
              width={300}
            >
              <TestSection title="Site Creation">
                <TestButton onClick={testSiteCreation}>Test Site Creation</TestButton>
                <TestButton onClick={testRoomGeneration}>Test Room Generation</TestButton>
                <TestButton onClick={testBattleRoomGeneration}>Test Battle Rooms</TestButton>
                <TestButton onClick={testWorkRoomGeneration}>Test Work Rooms</TestButton>
              </TestSection>
              
              <TestSection title="Progress">
                <TestButton onClick={testRoomProgress}>Test Progress</TestButton>
                <TestButton onClick={testRoomCompletion}>Test Completion</TestButton>
              </TestSection>
            </TestPanel>

            {/* Secret Room Tests */}
            <TestPanel
              title="Secret Room Tests"
              defaultPosition={{ x: 340, y: 20 }}
              width={300}
            >
              <TestSection title="Secret Rooms">
                <TestButton onClick={testSecretRoomDiscovery}>Test Discovery</TestButton>
                <TestButton onClick={testSecretRoomGeneration}>Test Generation</TestButton>
              </TestSection>
            </TestPanel>

            {/* Special Site Tests */}
            <TestPanel
              title="Special Site Tests"
              defaultPosition={{ x: 20, y: 300 }}
              width={300}
            >
              <TestSection title="Site Types">
                <TestButton onClick={testAdSite}>Test AdSite</TestButton>
                <TestButton onClick={testBazaarSite}>Test BazaarSite</TestButton>
                <TestButton onClick={testWorkSite}>Test WorkSite</TestButton>
                <TestButton onClick={testBossSite}>Test BossSite</TestButton>
              </TestSection>
            </TestPanel>

            {/* Storage & Save Tests */}
            <TestPanel
              title="Storage & Save Tests"
              defaultPosition={{ x: 340, y: 300 }}
              width={300}
            >
              <TestSection title="Storage">
                <TestButton onClick={testSiteStorage}>Test Storage</TestButton>
                <TestButton onClick={testSiteInfo}>Test Site Info</TestButton>
              </TestSection>
              
              <TestSection title="Save/Restore">
                <TestButton onClick={testSaveRestore}>Test Save/Restore</TestButton>
              </TestSection>
            </TestPanel>

            {/* Site Creator */}
            <TestPanel
              title="Site Creator"
              defaultPosition={{ x: 20, y: 580 }}
              width={300}
            >
              <TestSection title="Create Site">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs mb-1">Site Type</label>
                    <select
                      value={siteType}
                      onChange={(e) => setSiteType(e.target.value)}
                      className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs"
                    >
                      <option value="normal">Normal</option>
                      <option value="ad">AdSite</option>
                      <option value="bazaar">BazaarSite</option>
                      <option value="work">WorkSite</option>
                      <option value="boss">BossSite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Site ID</label>
                    <input
                      type="number"
                      value={siteId}
                      onChange={(e) => setSiteId(Number(e.target.value))}
                      className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs"
                    />
                  </div>
                  <TestButton onClick={() => createSiteByType(siteType, siteId)}>
                    Create Site
                  </TestButton>
                </div>
              </TestSection>
            </TestPanel>

            {/* Test Results */}
            <TestPanel
              title="Test Results"
              defaultPosition={{ x: 340, y: 580 }}
              width={400}
              maxHeight="400px"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="w-3 h-3"
                    />
                    <span>Auto Refresh</span>
                  </label>
                  <TestButton onClick={clearResults} variant="default" className="!w-auto">
                    Clear
                  </TestButton>
                </div>
                <TestResultsList results={results} />
              </div>
            </TestPanel>
            </div>
          </div>
        </div>
      </div>
    </TestScreen>
  )
}

