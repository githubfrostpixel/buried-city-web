/**
 * Site System Test Screen
 * Test screen for Site System functionality
 */

import { useState, useEffect, useMemo } from 'react'
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
} from '@/core/game/world/Site'
import { siteConfig } from '@/core/data/sites'
import { secretRooms } from '@/core/data/secretRooms'
import { SitePanelContent, getSiteBottomBarProps } from '@/modules/site/components/panels/SitePanelContent'
import { BottomSection } from '@/ui/layout/BottomSection'
import { TestPanel, TestSection, TestButton, TestResultsList, useTestResults } from './component'
import { usePlayerStore } from '@/core/store/playerStore'
import { BattleConfig } from '@/core/game/combat/BattleConfig'
import { SiteExploreContent } from '@/modules/site/components/views/SiteExploreContent'
import { SiteStoragePanelContent } from '@/modules/site/components/panels/SiteStoragePanelContent'
import { useUIStore } from '@/core/store/uiStore'

export function SiteSystemTestScreen() {
  const { results, runTest, clearResults } = useTestResults()
  const [currentSite, setCurrentSite] = useState<Site | null>(null)
  const [siteType, setSiteType] = useState<string>('normal')
  const [siteId, setSiteId] = useState<number>(1)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [isExploring, setIsExploring] = useState(false)
  const [isViewingStorage, setIsViewingStorage] = useState(false)
  const [storageUpdateTrigger, setStorageUpdateTrigger] = useState(0)
  const [secretRoomStateTrigger, setSecretRoomStateTrigger] = useState(0)
  const isInBattle = useUIStore(state => state.isInBattle)

  // Ensure map is initialized on mount
  useEffect(() => {
    const playerStore = usePlayerStore.getState()
    if (!playerStore.map) {
      playerStore.initializeMap()
    }
  }, [])

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

  // Test Site with Secret Rooms - Full Flow
  const testSiteWithSecretRooms = () => {
    try {
      // Create a site and manually set secret rooms config
      const testSiteId = 201
      const site = new Site(testSiteId)
      site.init()
      
      // Manually set secret rooms config (since site config might not have secretRoomsId)
      // We'll use secret room config ID 1
      if (secretRooms['1']) {
        const secretRoomConfig = JSON.parse(JSON.stringify(secretRooms['1']))
        site.secretRoomsConfig = secretRoomConfig
        site.secretRoomType = 0 // Random type 0-2
      }
      
      // Test initial state
      const hasConfig = !!site.secretRoomsConfig
      const initialShowed = site.isSecretRoomsEntryShowed
      const initialInSecret = site.isInSecretRooms
      const initialCount = site.secretRoomsShowedCount
      
      runTest(
        'Site with Secret Rooms - Initial',
        'Site has secret rooms config',
        () => `Has config: ${hasConfig}, Showed: ${initialShowed}, In secret: ${initialInSecret}, Count: ${initialCount}`
      )
      
      // Force secret room discovery (set probability to 1.0 temporarily)
      if (site.secretRoomsConfig) {
        const originalProb = site.secretRoomsConfig.probability
        site.secretRoomsConfig.probability = '1.0' // 100% chance
        site.testSecretRoomsBegin()
        site.secretRoomsConfig.probability = originalProb // Restore
      }
      
      const afterDiscoveryShowed = site.isSecretRoomsEntryShowed
      const afterDiscoveryCount = site.secretRoomsShowedCount
      
      runTest(
        'Site with Secret Rooms - Discovery',
        'Secret room discovered',
        () => `Showed: ${afterDiscoveryShowed}, Count: ${afterDiscoveryCount}`
      )
      
      // Generate secret rooms
      if (afterDiscoveryShowed) {
        site.genSecretRooms()
        const totalRooms = site.secretRooms.length
        const battleRooms = site.secretRooms.filter(r => r.type === 'battle').length
        const workRooms = site.secretRooms.filter(r => r.type === 'work').length
        const lastRoom = site.secretRooms[site.secretRooms.length - 1]
        const isWorkRoomLast = lastRoom?.type === 'work'
        
        runTest(
          'Site with Secret Rooms - Generation',
          'Secret rooms generated',
          () => `Total: ${totalRooms}, Battle: ${battleRooms}, Work: ${workRooms}, Last is work: ${isWorkRoomLast}`
        )
        
        // Test entering secret rooms
        if (totalRooms > 0) {
          // Simulate entering secret rooms (this would normally be done via UI)
          site.isInSecretRooms = true
          site.isSecretRoomsEntryShowed = false
          site.secretRoomsStep = 0
          
          const firstRoom = site.secretRoomBegin()
          const inSecret = site.isInSecretRooms
          const secretStep = site.secretRoomsStep
          
          runTest(
            'Site with Secret Rooms - Entry',
            'Entered secret rooms',
            () => `In secret: ${inSecret}, Step: ${secretStep}, First room type: ${firstRoom?.type}`
          )
          
          // Test completing a secret room
          if (firstRoom) {
            const stepBefore = site.secretRoomsStep
            site.secretRoomEnd()
            const stepAfter = site.secretRoomsStep
            const isEnd = site.isSecretRoomsEnd()
            
            runTest(
              'Site with Secret Rooms - Completion',
              'Secret room completed',
              () => `Step: ${stepBefore} -> ${stepAfter}, Is end: ${isEnd}`
            )
          }
          
          // Test exiting secret rooms
          if (site.isSecretRoomsEnd()) {
            site.secretRoomsEnd()
            const afterExit = site.isInSecretRooms
            const afterExitShowed = site.isSecretRoomsEntryShowed
            
            runTest(
              'Site with Secret Rooms - Exit',
              'Exited secret rooms',
              () => `In secret: ${afterExit}, Entry showed: ${afterExitShowed}`
            )
          }
        }
      }
      
      setCurrentSite(site)
    } catch (error) {
      runTest(
        'Site with Secret Rooms',
        'Test failed',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
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
        
        // Ensure map is initialized
        const playerStore = usePlayerStore.getState()
        if (!playerStore.map) {
          playerStore.initializeMap()
        }
        
        // Add site to map so storage panel can access it
        if (playerStore.map) {
          // Add site directly to map's siteMap
          ;(playerStore.map as any).siteMap[site.id] = site
        }
        
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

  // Create Site 201 for testing
  const createSite201 = () => {
    try {
      const site = new Site(201)
      site.init()
      
      // Ensure map is initialized
      const playerStore = usePlayerStore.getState()
      if (!playerStore.map) {
        playerStore.initializeMap()
      }
      
      // Add site to map so storage panel can access it
      if (playerStore.map) {
        // Add site directly to map's siteMap
        ;(playerStore.map as any).siteMap[site.id] = site
      }
      
      setCurrentSite(site)
      const battleRooms = site.rooms.filter(r => r.type === 'battle').length
      const workRooms = site.rooms.filter(r => r.type === 'work').length
      runTest(
        'Create Site 201',
        'Site 201 created',
        () => `Site ID: ${site.id}, Rooms: ${site.rooms.length} (Battle: ${battleRooms}, Work: ${workRooms})`
      )
    } catch (error) {
      runTest(
        'Create Site 201',
        'Site 201 created',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Create Site with Secret Rooms for exploration testing
  const createSiteWithSecretRooms = () => {
    try {
      const testSiteId = 201
      const site = new Site(testSiteId)
      site.init()
      
      // Manually set secret rooms config
      if (secretRooms['1']) {
        const secretRoomConfig = JSON.parse(JSON.stringify(secretRooms['1']))
        site.secretRoomsConfig = secretRoomConfig
        site.secretRoomType = 0 // Random type 0-2
      }
      
      // Force secret room discovery (100% chance)
      if (site.secretRoomsConfig) {
        const originalProb = site.secretRoomsConfig.probability
        site.secretRoomsConfig.probability = '1.0'
        site.testSecretRoomsBegin()
        site.secretRoomsConfig.probability = originalProb
      }
      
      // Generate secret rooms if discovered
      if (site.isSecretRoomsEntryShowed) {
        site.genSecretRooms()
      }
      
      // Ensure map is initialized
      const playerStore = usePlayerStore.getState()
      if (!playerStore.map) {
        playerStore.initializeMap()
      }
      
      // Add site to map so storage panel can access it
      if (playerStore.map) {
        ;(playerStore.map as any).siteMap[site.id] = site
      }
      
      setCurrentSite(site)
      const battleRooms = site.rooms.filter(r => r.type === 'battle').length
      const workRooms = site.rooms.filter(r => r.type === 'work').length
      const secretBattleRooms = site.secretRooms.filter(r => r.type === 'battle').length
      const secretWorkRooms = site.secretRooms.filter(r => r.type === 'work').length
      
      runTest(
        'Create Site with Secret Rooms',
        'Site with secret rooms created',
        () => `Site ID: ${site.id}, Normal Rooms: ${site.rooms.length} (Battle: ${battleRooms}, Work: ${workRooms}), Secret Rooms: ${site.secretRooms.length} (Battle: ${secretBattleRooms}, Work: ${secretWorkRooms}), Entry Showed: ${site.isSecretRoomsEntryShowed}`
      )
    } catch (error) {
      runTest(
        'Create Site with Secret Rooms',
        'Failed to create site',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Create Site 2 (longer site with 15 rooms, using original game data)
  const createSite2 = () => {
    try {
      const testSiteId = 2
      const site = new Site(testSiteId)
      site.init()
      
      // Ensure map is initialized
      const playerStore = usePlayerStore.getState()
      if (!playerStore.map) {
        playerStore.initializeMap()
      }
      
      // Add site to map so storage panel can access it
      if (playerStore.map) {
        ;(playerStore.map as any).siteMap[site.id] = site
      }
      
      setCurrentSite(site)
      const battleRooms = site.rooms.filter(r => r.type === 'battle').length
      const workRooms = site.rooms.filter(r => r.type === 'work').length
      const hasSecretRooms = !!site.secretRoomsConfig
      
      runTest(
        'Create Site 2',
        'Site 2 created',
        () => `Site ID: ${site.id}, Normal Rooms: ${site.rooms.length} (Battle: ${battleRooms}, Work: ${workRooms}), Has Secret Rooms: ${hasSecretRooms}`
      )
    } catch (error) {
      runTest(
        'Create Site 2',
        'Failed to create site',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Create Site 3 (with secret rooms, using original game data)
  const createSite3 = () => {
    try {
      const testSiteId = 3
      const site = new Site(testSiteId)
      site.init()
      
      // Ensure map is initialized
      const playerStore = usePlayerStore.getState()
      if (!playerStore.map) {
        playerStore.initializeMap()
      }
      
      // Add site to map so storage panel can access it
      if (playerStore.map) {
        ;(playerStore.map as any).siteMap[site.id] = site
      }
      
      setCurrentSite(site)
      const battleRooms = site.rooms.filter(r => r.type === 'battle').length
      const workRooms = site.rooms.filter(r => r.type === 'work').length
      const hasSecretRooms = !!site.secretRoomsConfig
      
      runTest(
        'Create Site 3',
        'Site 3 created',
        () => `Site ID: ${site.id}, Normal Rooms: ${site.rooms.length} (Battle: ${battleRooms}, Work: ${workRooms}), Has Secret Rooms: ${hasSecretRooms}`
      )
    } catch (error) {
      runTest(
        'Create Site 3',
        'Failed to create site',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Heal Player (restore HP to max)
  const healPlayer = () => {
    const playerStore = usePlayerStore.getState()
    const maxHp = playerStore.hpMax
    playerStore.updateAttribute('hp', maxHp)
    runTest(
      'Heal Player',
      `Healed to ${maxHp} HP`,
      () => `HP: ${playerStore.hp}/${maxHp}`
    )
  }

  // Add Gun (equip it)
  const addGun = () => {
    const gunId = "1301011" // Basic gun item ID
    const playerStore = usePlayerStore.getState()
    // First add gun to bag (required for equipping)
    playerStore.addItemToBag(gunId, 1)
    // Then equip it
    const success = playerStore.equipItem('gun', gunId)
    if (success) {
      runTest(
        'Add Gun',
        'Equipped gun',
        () => `Current gun: ${playerStore.equipment.gun || 'None'}`
      )
    } else {
      runTest(
        'Add Gun',
        'Failed to equip gun',
        () => `Gun in bag: ${playerStore.getBagItemCount(gunId)}`
      )
    }
  }

  // Add Melee Weapon (equip it)
  const addMeleeWeapon = () => {
    const weaponId = "1302011" // Basic melee weapon item ID
    const playerStore = usePlayerStore.getState()
    // First add weapon to bag (required for equipping)
    playerStore.addItemToBag(weaponId, 1)
    // Then equip it
    const success = playerStore.equipItem('weapon', weaponId)
    if (success) {
      runTest(
        'Add Melee Weapon',
        'Equipped melee weapon',
        () => `Current weapon: ${playerStore.equipment.weapon || 'None'}`
      )
    } else {
      runTest(
        'Add Melee Weapon',
        'Failed to equip melee weapon',
        () => `Weapon in bag: ${playerStore.getBagItemCount(weaponId)}`
      )
    }
  }

  // Add Axe (equip it)
  const addAxe = () => {
    const axeId = "1302021" // Axe item ID
    const playerStore = usePlayerStore.getState()
    // First add axe to bag (required for equipping)
    playerStore.addItemToBag(axeId, 1)
    // Then equip it
    const success = playerStore.equipItem('weapon', axeId)
    if (success) {
      runTest(
        'Add Axe',
        'Equipped axe',
        () => `Current weapon: ${playerStore.equipment.weapon || 'None'}`
      )
    } else {
      runTest(
        'Add Axe',
        'Failed to equip axe',
        () => `Axe in bag: ${playerStore.getBagItemCount(axeId)}`
      )
    }
  }

  // Add Gun Ammo
  const addGunAmmo = () => {
    const playerStore = usePlayerStore.getState()
    playerStore.addItemToBag(BattleConfig.BULLET_ID, 50)
    runTest(
      'Add Gun Ammo',
      'Added 50 bullets',
      () => `Current bullets: ${playerStore.getBagItemCount(BattleConfig.BULLET_ID)}`
    )
  }

  // Add Homemade Bullets
  const addHomemadeBullets = () => {
    const playerStore = usePlayerStore.getState()
    playerStore.addItemToBag(BattleConfig.HOMEMADE_ID, 50)
    runTest(
      'Add Homemade Bullets',
      'Added 50 homemade bullets',
      () => `Current homemade: ${playerStore.getBagItemCount(BattleConfig.HOMEMADE_ID)}`
    )
  }

  // Add Bomb (equip it)
  const addBomb = () => {
    const bombId = "1303012" // Bomb item ID
    const playerStore = usePlayerStore.getState()
    // First add bomb to bag (required for equipping)
    playerStore.addItemToBag(bombId, 10)
    // Then equip it in tool slot
    const success = playerStore.equipItem('tool', bombId)
    if (success) {
      runTest(
        'Add Bomb',
        'Equipped bomb',
        () => `Current tool: ${playerStore.equipment.tool || 'None'}, Bombs in bag: ${playerStore.getBagItemCount(bombId)}`
      )
    } else {
      runTest(
        'Add Bomb',
        'Failed to equip bomb',
        () => `Bombs in bag: ${playerStore.getBagItemCount(bombId)}`
      )
    }
  }

  // Watch for secret room state changes to force re-render
  useEffect(() => {
    if (!currentSite || !isExploring) return
    
    let lastIsInSecretRooms = currentSite.isInSecretRooms
    
    const interval = setInterval(() => {
      // Check if isInSecretRooms changed and trigger re-render
      const currentIsInSecretRooms = currentSite.isInSecretRooms
      
      if (currentIsInSecretRooms !== lastIsInSecretRooms) {
        lastIsInSecretRooms = currentIsInSecretRooms
        setSecretRoomStateTrigger(prev => prev + 1)
      }
    }, 100) // Check every 100ms for faster response
    
    return () => clearInterval(interval)
  }, [currentSite, isExploring])

  // Auto-refresh current site info
  useEffect(() => {
    if (!autoRefresh || !currentSite) return
    
    const interval = setInterval(() => {
      // Force re-render by accessing site properties
      currentSite.step
      currentSite.rooms.length
      // Also access isInSecretRooms to ensure it's tracked
      currentSite.isInSecretRooms
    }, 1000)
    
    return () => clearInterval(interval)
  }, [autoRefresh, currentSite])

  return (
    <TestScreen title="Site System Test">
      <div className="relative w-full h-full" style={{ backgroundColor: '#000000' }}>
        {/* Main Scene Layout - matching original game */}
        {currentSite ? (
          <div className="absolute inset-0">
            {isExploring ? (
              <BottomSection
                title={currentSite.isInSecretRooms ? `Secret Room ${currentSite.secretRoomType ?? 0}` : currentSite.getName()}
                leftSubtext={(() => {
                  // Reference secretRoomStateTrigger to ensure re-render when it changes
                  void secretRoomStateTrigger;
                  return currentSite.isInSecretRooms ? "???" : currentSite.getCurrentProgressStr();
                })()}
                rightSubtext={currentSite.isInSecretRooms ? undefined : String(currentSite.storage.getAllItemNum())}
                leftBtn={!isInBattle}
                rightBtn={false}
                onLeftClick={() => {
                  // Handle secret room cleanup when clicking back
                  if (currentSite.isInSecretRooms && currentSite.isSecretRoomsEnd()) {
                    currentSite.secretRoomsEnd()
                    currentSite.isSecretRoomsEntryShowed = false
                  }
                  setIsExploring(false)
                }}
              >
                <SiteExploreContent 
                  site={currentSite}
                  onBack={() => {
                    // Handle secret room cleanup when clicking back
                    if (currentSite.isInSecretRooms && currentSite.isSecretRoomsEnd()) {
                      currentSite.secretRoomsEnd()
                      currentSite.isSecretRoomsEntryShowed = false
                    }
                    setIsExploring(false)
                  }}
                />
              </BottomSection>
            ) : isViewingStorage ? (
              <SiteStorageBottomBar 
                siteId={currentSite.id}
                onBack={() => {
                  currentSite.haveNewItems = false
                  setIsViewingStorage(false)
                }}
                storageUpdateTrigger={storageUpdateTrigger}
                onStorageUpdate={() => {
                  // Force re-render by updating trigger to refresh item count
                  setStorageUpdateTrigger((prev: number) => prev + 1)
                }}
              />
            ) : (
              <BottomSection
                {...getSiteBottomBarProps(currentSite)}
                leftBtn={true}
                rightBtn={false}
                onLeftClick={() => setCurrentSite(null)}
              >
                <SitePanelContent
                  site={currentSite}
                  onStorageClick={() => {
                    currentSite.haveNewItems = false
                    runTest('UI - Storage Click', 'Storage button works', () => 'Opening storage panel')
                    setIsViewingStorage(true)
                  }}
                  onExploreClick={() => {
                    if (currentSite.isSiteEnd()) {
                      runTest('UI - Explore Click', 'Site already ended', () => 'Cannot explore completed site')
                      return
                    }
                    runTest('UI - Explore Click', 'Explore button works', () => `Starting exploration, Site ended: ${currentSite.isSiteEnd()}`)
                    setIsExploring(true)
                  }}
                />
              </BottomSection>
            )}
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
                <TestButton onClick={testSiteWithSecretRooms} variant="state">
                  Test Full Secret Room Flow
                </TestButton>
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

            {/* Site 201 Testing */}
            <TestPanel
              title="Site 201 Testing"
              defaultPosition={{ x: 660, y: 20 }}
              width={300}
            >
              <TestSection title="Site 201 Testing">
                <TestButton variant="state" onClick={createSite201}>
                  Create Site 201
                </TestButton>
                <TestButton variant="state" onClick={createSiteWithSecretRooms}>
                  Create Site with Secret Rooms
                </TestButton>
                <TestButton variant="state" onClick={createSite2}>
                  Create Site 2 (Long)
                </TestButton>
                <TestButton variant="state" onClick={createSite3}>
                  Create Site 3 (With Secret)
                </TestButton>
              </TestSection>

              <TestSection title="Add Items">
                <TestButton variant="state" onClick={addGun}>
                  Add Gun
                </TestButton>
                <TestButton variant="state" onClick={addMeleeWeapon}>
                  Add Melee Weapon
                </TestButton>
                <TestButton variant="state" onClick={addAxe}>
                  Add Axe
                </TestButton>
                <TestButton variant="state" onClick={addGunAmmo}>
                  Add Gun Ammo (50)
                </TestButton>
                <TestButton variant="state" onClick={addHomemadeBullets}>
                  Add Homemade (50)
                </TestButton>
                <TestButton variant="state" onClick={addBomb}>
                  Add Bomb (10)
                </TestButton>
              </TestSection>

              <TestSection title="Player Actions">
                <TestButton variant="state" onClick={healPlayer}>
                  Heal Player
                </TestButton>
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

// Helper component to get fresh site from map for item count
function SiteStorageBottomBar({ 
  siteId, 
  onBack, 
  storageUpdateTrigger,
  onStorageUpdate 
}: { 
  siteId: number
  onBack: () => void
  storageUpdateTrigger: number
  onStorageUpdate: () => void
}) {
  const playerStore = usePlayerStore()
  
  // Get fresh site from map to ensure we have latest storage count
  const site = useMemo(() => {
    const map = playerStore.map
    if (!map) return null
    return map.getSite(siteId)
  }, [playerStore.map, siteId, storageUpdateTrigger])
  
  if (!site) {
    return <div className="text-white p-4">Site not found</div>
  }
  
  return (
    <BottomSection
      title={site.getName()}
      leftSubtext="Depository"
      rightSubtext={String(site.storage.getAllItemNum())}
      leftBtn={true}
      rightBtn={false}
      onLeftClick={onBack}
    >
      <SiteStoragePanelContent 
        siteId={siteId} 
        onStorageUpdate={onStorageUpdate}
      />
    </BottomSection>
  )
}

