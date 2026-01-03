/**
 * SiteExploreContent Component
 * Site room exploration panel content
 * Ported from OriginalGame/src/ui/battleAndWorkNode.js
 * 
 * This component handles all room exploration views:
 * - Secret room entry
 * - Battle rooms (begin, process, end)
 * - Work rooms (begin, process, storage)
 * - Site completion
 */

import { useState, useEffect, useRef } from 'react'
import { Site } from '@/game/world/Site'
import { Room } from '@/types/site.types'
import { Battle, BattleInfo, BattleResult } from '@/game/combat/Battle'
import { BattlePlayer, type BattlePlayerState } from '@/game/combat/BattlePlayer'
import { Monster } from '@/game/combat/Monster'
import { BattleConfig, Equipment } from '@/game/combat/BattleConfig'
import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'
import { itemConfig } from '@/data/items'
import { game } from '@/game/Game'
import { saveAll } from '@/game/systems/SaveSystem'
import { WORK_ANIMATION_DURATION } from './constants'
import { useBattleEvents } from './useBattleEvents'
import { SecretRoomEntryView } from './SecretRoomEntryView'
import { BattleBeginView } from './BattleBeginView'
import { BattleProcessView } from './BattleProcessView'
import { BattleEndView } from './BattleEndView'
import { WorkBeginView } from './WorkBeginView'
import { WorkProcessView } from './WorkProcessView'
import { WorkRoomStorageView } from './WorkRoomStorageView'
import { SiteEndView } from './SiteEndView'

interface SiteExploreContentProps {
  site: Site
  onBack?: () => void
}

type ViewMode = 
  | 'secretEntry'      // Secret room discovery
  | 'battleBegin'       // Battle room preparation
  | 'battleProcess'     // Battle in progress
  | 'battleEnd'         // Battle results
  | 'workBegin'         // Work room tool selection
  | 'workProcess'       // Work in progress
  | 'workStorage'       // Work room item collection
  | 'siteEnd'           // All rooms completed

export function SiteExploreContent({ site, onBack }: SiteExploreContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('battleBegin')
  const [currentRoom, setCurrentRoom] = useState<Room | undefined>(undefined)
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null)
  const [battle, setBattle] = useState<Battle | null>(null)
  const [selectedToolId, setSelectedToolId] = useState<string | undefined>(undefined)
  const [workProgress, setWorkProgress] = useState<number>(0)

  const playerStore = usePlayerStore.getState()
  const setWorkStorageView = useUIStore(state => state.setWorkStorageView)
  const isInWorkStorageView = useUIStore(state => state.isInWorkStorageView)
  const setInBattle = useUIStore(state => state.setInBattle)
  const isInWorkStorageRef = useRef(false)
  const workStorageFlushRef = useRef<(() => void) | null>(null)
  const battleResultRef = useRef<BattleResult | null>(null)

  // Use battle events hook
  const { combatLogs, monsterCount, setCombatLogs, setMonsterCount } = useBattleEvents(viewMode)

  // Check if we should restore work storage view on mount (after remount)
  useEffect(() => {
    const uiStore = useUIStore.getState()
    console.log('[SiteExploreContent] Component mount/remount check:', {
      isInWorkStorageView: uiStore.isInWorkStorageView,
      currentViewMode: viewMode,
      isInWorkStorageRef: isInWorkStorageRef.current,
      isInSecretRooms: site.isInSecretRooms,
      isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed
    })
    // Only restore work storage view if we're actually in secret rooms
    // Don't restore if we just exited secret rooms (isInSecretRooms=false, isSecretRoomsEntryShowed=false)
    // The work storage view should only be restored if we're actively exploring secret rooms
    if (uiStore.isInWorkStorageView && site.isInSecretRooms) {
      console.log('[SiteExploreContent] Component mounted: Restoring work storage view from UI store flag (in secret rooms)')
      isInWorkStorageRef.current = true
      // Set flag immediately before setting viewMode to prevent race condition
      setWorkStorageView(true)
      setViewMode('workStorage')
    } else {
      // If flag was cleared by MainScene, clear the ref too
      console.log('[SiteExploreContent] Component mounted: Flag is false or not in secret rooms, clearing ref')
      isInWorkStorageRef.current = false
      setWorkStorageView(false)
      // Clear the UI store flag if we're not in a valid state to restore
      if (uiStore.isInWorkStorageView) {
        const uiStoreState = useUIStore.getState()
        uiStoreState.setWorkStorageView(false)
      }
    }
  }, []) // Only run on mount

  // Sync ref with uiStore flag when it changes (e.g., when MainScene clears it)
  useEffect(() => {
    if (!isInWorkStorageView && isInWorkStorageRef.current) {
      console.log('[SiteExploreContent] uiStore flag was cleared, clearing ref too')
      isInWorkStorageRef.current = false
    }
  }, [isInWorkStorageView])

  // Sync battle state with UIStore (for disabling back button during battle)
  useEffect(() => {
    const isInBattleProcess = viewMode === 'battleProcess' && battle !== null
    setInBattle(isInBattleProcess)
    
    // Cleanup: clear battle state on unmount
    return () => {
      setInBattle(false)
    }
  }, [viewMode, battle, setInBattle])

  // Clear battle end state when viewMode changes away from battleEnd
  useEffect(() => {
    if (viewMode !== 'battleEnd') {
      const uiStore = useUIStore.getState()
      if (uiStore.isInBattleEndView) {
        uiStore.setBattleEndView(false)
        uiStore.setBattleEndCompleteFunction(null)
      }
    }
  }, [viewMode])

  // Cleanup: Complete room on unmount if in battle end view with win
  useEffect(() => {
    return () => {
      const uiStore = useUIStore.getState()
      // Check if we're unmounting while in battle end view with a win
      // This handles the case where back button is clicked
      // Use ref to get latest battleResult value
      const result = battleResultRef.current
      if (uiStore.isInBattleEndView && result?.win) {
        console.log('[SiteExploreContent] Component unmounting: Completing room from battle end (back button clicked)')
        try {
          // Complete the room based on whether we're in secret rooms
          if (site.isInSecretRooms) {
            site.secretRoomEnd()
            site.secretRoomsEnd() // Always end secret rooms when back is clicked
            site.isSecretRoomsEntryShowed = false
          } else {
            site.roomEnd(true) // Complete normal room
            site.testSecretRoomsBegin() // Check for secret room discovery
          }
          // Auto-save
          saveAll().catch(err => console.error('Auto-save failed in battle end cleanup:', err))
        } catch (error) {
          console.error('[SiteExploreContent] Error completing room in battle end cleanup:', error)
        }
      }
      // Always clear the state on unmount
      uiStore.setBattleEndView(false)
      uiStore.setBattleEndCompleteFunction(null)
      // Clear ref
      battleResultRef.current = null
    }
  }, [site])

  // Cleanup: Clear temp storages when component unmounts (if not flushed)
  // If flush function exists, call it as safety net (flush function has duplicate prevention)
  useEffect(() => {
    return () => {
      const uiStore = useUIStore.getState()
      if (uiStore.workStorageFlushFunction) {
        // Flush function exists - call it as safety net in case MainScene didn't call it
        // The flush function will clear room.tempStorage internally
        console.log('[SiteExploreContent] Component unmounting: Flush function exists, calling as safety net')
        try {
          uiStore.workStorageFlushFunction()
        } catch (error) {
          console.error('[SiteExploreContent] Error calling flush function in cleanup:', error)
        }
        return
      }
      
      // Clear temp storages from all rooms (safety cleanup)
      // This should rarely be needed since flush should have been called
      const playerStore = usePlayerStore.getState()
      const map = playerStore.map
      if (map) {
        // Clear tempStorage from current site's rooms
        const currentSite = map.getSite(site.id)
        if (currentSite) {
          currentSite.rooms.forEach(room => {
            if (room.tempStorage) {
              console.log('[SiteExploreContent] Component unmounting: Clearing tempStorage from room')
              room.tempStorage = undefined
            }
          })
          currentSite.secretRooms.forEach(room => {
            if (room.tempStorage) {
              console.log('[SiteExploreContent] Component unmounting: Clearing tempStorage from secret room')
              room.tempStorage = undefined
            }
          })
        }
      }
    }
  }, [site.id])

  // Initialize site if rooms not generated (only once when component mounts)
  // Also ensure secret room state is cleared if we're not in secret rooms
  useEffect(() => {
    
    // Safety check: Only clear secret room state if we've already left secret rooms (showedCount >= maxCount)
    // This handles the case where the site was restored from an old save with stale state
    // BUT: Don't clear if we just discovered secret rooms (isSecretRoomsEntryShowed=true, isInSecretRooms=false, showedCount < maxCount)
    // This is a valid state - we discovered them but haven't entered yet
    if (!site.isInSecretRooms && site.secretRoomsConfig) {
      const maxCount = Number.parseInt(site.secretRoomsConfig.maxCount)
      // Only clear if we've already used up all chances (showedCount >= maxCount)
      // This means we've already left secret rooms and shouldn't be able to re-enter
      if (site.secretRoomsShowedCount >= maxCount && site.isSecretRoomsEntryShowed) {
        console.error('[SiteExploreContent] MOUNT SAFETY: Clearing stale secret room entry flag (already left secret rooms)')
        site.isSecretRoomsEntryShowed = false
      }
    }
    
    if (site.rooms.length === 0 && site.id !== 100) {
      console.log('[SiteExploreContent] Initializing site', site.id, 'rooms before:', site.rooms.length)
      site.init()
      console.log('[SiteExploreContent] Site initialized, rooms after:', site.rooms.length, 'rooms:', site.rooms.map(r => r.type))
    }
  }, [site.id]) // Only depend on site.id to avoid re-initializing

  // Update view based on site state
  useEffect(() => {
    // Don't update view if we're in work storage (check both state and ref)
    // But only skip if we're actually in workStorage view, not if we're transitioning
    if (viewMode === 'workStorage' && isInWorkStorageRef.current) {
      console.log('[SiteExploreContent] Skipping updateView - in work storage', {
        viewMode,
        isInWorkStorageRef: isInWorkStorageRef.current
      })
      return
    }
    updateView()
  }, [site.step, site.isInSecretRooms, site.isSecretRoomsEntryShowed])

  // Set/unset work storage view flag
  useEffect(() => {
    // Check uiStore flag first - if MainScene cleared it, we should respect that
    const uiStore = useUIStore.getState()
    const shouldBeInWorkStorage = (viewMode === 'workStorage' || isInWorkStorageRef.current) && uiStore.isInWorkStorageView
    
    if (shouldBeInWorkStorage) {
      console.log('[SiteExploreContent] Setting work storage view flag to true', {
        viewMode,
        isInWorkStorageRef: isInWorkStorageRef.current,
        uiStoreFlag: uiStore.isInWorkStorageView
      })
      isInWorkStorageRef.current = true
      setWorkStorageView(true)
    } else {
      console.log('[SiteExploreContent] Setting work storage view flag to false', {
        viewMode,
        isInWorkStorageRef: isInWorkStorageRef.current,
        uiStoreFlag: uiStore.isInWorkStorageView
      })
      isInWorkStorageRef.current = false
      setWorkStorageView(false)
    }
  }, [viewMode, setWorkStorageView])

  // Cleanup on unmount only - but don't reset if we're actually in work storage
  useEffect(() => {
    return () => {
      const uiStore = useUIStore.getState()
      console.log('[SiteExploreContent] Component unmounting:', {
        viewMode,
        isInWorkStorageRef: isInWorkStorageRef.current,
        uiStoreFlag: uiStore.isInWorkStorageView,
        willResetFlag: !isInWorkStorageRef.current || !uiStore.isInWorkStorageView
      })
      // Check both the ref AND the uiStore flag
      // If MainScene cleared the flag, we should respect that and clear the ref too
      if (!isInWorkStorageRef.current || !uiStore.isInWorkStorageView) {
        console.log('[SiteExploreContent] Component unmounting: Setting work storage view flag to false and clearing ref')
        isInWorkStorageRef.current = false
        setWorkStorageView(false)
      } else {
        console.log('[SiteExploreContent] Component unmounting: Keeping work storage view flag true (will restore on remount)')
      }
    }
  }, [setWorkStorageView, viewMode])

  // Flush items when leaving work storage view (when MainScene navigates away)
  // This must be at the top level with other hooks, before any conditional returns
  useEffect(() => {
    // If we were in work storage view but now we're not, and we have a flush function, call it
    if (!isInWorkStorageView && workStorageFlushRef.current && viewMode === 'workStorage') {
      workStorageFlushRef.current()
      workStorageFlushRef.current = null // Clear ref after flushing
    }
  }, [isInWorkStorageView, viewMode])

  const updateView = () => {
    // Debug: Log site state
    console.log('[SiteExploreContent] updateView:', {
      step: site.step,
      roomsLength: site.rooms.length,
      isSiteEnd: site.isSiteEnd(),
      currentRoom: site.roomBegin(),
      rooms: site.rooms.map(r => ({ type: r.type, hasList: !!r.list })),
      currentViewMode: viewMode,
      isInWorkStorageRef: isInWorkStorageRef.current,
      // Secret room state logging
      isInSecretRooms: site.isInSecretRooms,
      isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
      secretRoomsShowedCount: site.secretRoomsShowedCount,
      secretRoomsStep: site.secretRoomsStep,
      secretRoomsLength: site.secretRooms.length
    })
    
    // Don't update view if we're in workStorage - let user finish item transfer first
    // Check the ref since it's set synchronously (viewMode is async React state)
    if (isInWorkStorageRef.current) {
      console.log('[SiteExploreContent] updateView: Skipping update - in workStorage view', {
        viewMode,
        isInWorkStorageRef: isInWorkStorageRef.current
      })
      return
    }

    // Check if site is complete - automatically go back to SitePanel
    if (site.isSiteEnd()) {
      console.log('[SiteExploreContent] Site is complete, returning to SitePanel')
      if (onBack) {
        // Use setTimeout to avoid state updates during render
        setTimeout(() => {
          onBack()
        }, 0)
      }
      return
    }

    // Check for secret room entry
    if (site.isSecretRoomsEntryShowed && !site.isInSecretRooms) {
      console.log('[SiteExploreContent] ===== SECRET ROOM ENTRY DETECTED =====')
      console.log('[SiteExploreContent] Secret room state:', {
        isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
        isInSecretRooms: site.isInSecretRooms,
        secretRoomsShowedCount: site.secretRoomsShowedCount,
        secretRoomsLength: site.secretRooms.length,
        hasSecretRoomsConfig: !!site.secretRoomsConfig
      })
      console.log('[SiteExploreContent] Setting viewMode to secretEntry')
      setViewMode('secretEntry')
      return
    } else {
      // Log when secret room entry is NOT shown (for debugging)
      if (site.secretRoomsConfig) {
        console.log('[SiteExploreContent] Secret room entry NOT shown. State:', {
          isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
          isInSecretRooms: site.isInSecretRooms,
          secretRoomsShowedCount: site.secretRoomsShowedCount,
          maxCount: site.secretRoomsConfig ? Number.parseInt(site.secretRoomsConfig.maxCount) : 'N/A'
        })
      }
    }

    // Get current room
    const room = site.isInSecretRooms ? site.secretRoomBegin() : site.roomBegin()
    setCurrentRoom(room)

    if (!room) {
      console.log('[SiteExploreContent] No room found, returning to SitePanel')
      if (onBack) {
        // Use setTimeout to avoid state updates during render
        setTimeout(() => {
          onBack()
        }, 0)
      }
      return
    }

    // Set view mode based on room type
    if (room.type === 'battle') {
      setViewMode('battleBegin')
    } else if (room.type === 'work') {
      setViewMode('workBegin')
    }
  }

  // Battle handlers
  const handleBattleStart = () => {
    if (!currentRoom || currentRoom.type !== 'battle') return

    const battleInfo: BattleInfo = {
      id: '0',
      monsterList: currentRoom.list as string[]
    }

    const isBandit = site.id === 500
    const difficulty = currentRoom.difficulty || 1

    const battleInstance = new Battle(battleInfo, false, difficulty, isBandit, false)

    // Create player state
    const playerState: BattlePlayerState = {
      bulletNum: playerStore.getBagItemCount(BattleConfig.BULLET_ID),
      homemadeNum: playerStore.getBagItemCount(BattleConfig.HOMEMADE_ID),
      toolNum: playerStore.getBagItemCount(playerStore.equipment.tool || ''),
      hp: playerStore.hp,
      virus: playerStore.virus,
      virusMax: playerStore.virusMax,
      injury: playerStore.injury,
      weapon1: playerStore.equipment.gun,
      weapon2: playerStore.equipment.weapon || Equipment.HAND,
      equip: playerStore.equipment.tool,
      def: playerStore.equipment.equip ? (itemConfig[playerStore.equipment.equip]?.effect_arm?.def || 0) : 0
    }

    const battlePlayer = new BattlePlayer(battleInstance, playerState, isBandit, false)

    const monsters = battleInfo.monsterList.map((monId) => {
      return new Monster(battleInstance, monId, isBandit)
    })

    battleInstance.initialize(monsters, battlePlayer)

    battleInstance.setGameEndListener((result) => {
      handleBattleEnd(result)
    })

    setBattle(battleInstance)
    setViewMode('battleProcess')
    setCombatLogs([])
    setMonsterCount(monsters.length)
  }

  const handleBattleEnd = (result: BattleResult) => {
    setBattleResult(result)
    battleResultRef.current = result // Store in ref for cleanup access
    setViewMode('battleEnd')

    // Apply virus damage
    if (result.totalVirus > 0) {
      playerStore.updateAttribute('virus', playerStore.virus + result.totalVirus)
    }

    // Check weapon breaking
    if (result.brokenWeapon && result.brokenWeapon.length > 0) {
      result.brokenWeapon.forEach((itemId) => {
        playerStore.testWeaponBroken(itemId, 0, 1)
      })
    }

    // Auto-save
    saveAll().catch(err => console.error('Auto-save failed:', err))

    // Check breakdown
    // TODO: player.checkBreakdown(8112)

    // Set battle end state for back button handling (only for wins)
    if (result.win) {
      const uiStore = useUIStore.getState()
      uiStore.setBattleEndView(true)
      uiStore.setBattleEndCompleteFunction(() => {
        // This will be called by MainScene when back button is clicked
        // For secret rooms: complete room AND end secret rooms
        // For normal rooms: just complete room
        if (site.isInSecretRooms) {
          site.secretRoomEnd()
          site.secretRoomsEnd() // Always end secret rooms when back is clicked
          site.isSecretRoomsEntryShowed = false
        } else {
          site.roomEnd(true) // Complete normal room
          site.testSecretRoomsBegin() // Check for secret room discovery
        }
        // Auto-save
        saveAll().catch(err => console.error('Auto-save failed:', err))
      })
    }
  }

  const handleBattleEndNext = () => {
    if (!battleResult) return

    const isWin = battleResult.win

    // Clear battle end state (user clicked "Next" button)
    const uiStore = useUIStore.getState()
    uiStore.setBattleEndView(false)
    uiStore.setBattleEndCompleteFunction(null)
    battleResultRef.current = null // Clear ref

    // Complete room
    if (site.isInSecretRooms) {
      site.secretRoomEnd()
      
      // If escaping from secret room battle (loss), end secret rooms and go back to site panel
      // This matches the back button behavior: escape = leave secret rooms
      if (!isWin) {
        site.secretRoomsEnd()
        site.isSecretRoomsEntryShowed = false
        // Auto-save
        saveAll().catch(err => console.error('Auto-save failed:', err))
        // Go back to site panel (like back button)
        if (onBack) {
          onBack()
        }
        return
      }
      
      // If won, check if secret rooms ended
      if (site.isSecretRoomsEnd()) {
        site.secretRoomsEnd()
      }
    } else {
      site.roomEnd(isWin)
      if (isWin) {
        site.testSecretRoomsBegin()
      }
    }

    // updateView will be called automatically by useEffect when site.step changes
    // No need for setTimeout delay - update immediately
    updateView()
  }

  // Work handlers
  const handleWorkStart = (toolId: string, time: number) => {
    setSelectedToolId(toolId)
    setWorkProgress(0)
    setViewMode('workProcess')

    // Start work timer
    const timeManager = game.getTimeManager()
    if (timeManager) {
      const workTimeSeconds = time * 60 // Convert minutes to seconds
      timeManager.accelerateWorkTime(workTimeSeconds)

      // Update progress (work time is accelerated to 3 real seconds max)
      const startTime = Date.now()
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000
        const progress = Math.min((elapsed / WORK_ANIMATION_DURATION) * 100, 100)
        setWorkProgress(progress)

        if (progress >= 100) {
          clearInterval(interval)
          handleWorkComplete()
        }
      }, 100)
    }
  }

  const handleWorkComplete = () => {
    // Check weapon breaking
    if (selectedToolId) {
      playerStore.testWeaponBroken(selectedToolId, 0, 1)
    }

    // Ensure currentRoom is set (should already be set, but double-check)
    if (!currentRoom) {
      const room = site.isInSecretRooms ? site.secretRoomBegin() : site.roomBegin()
      setCurrentRoom(room)
      console.log('[SiteExploreContent] handleWorkComplete: Set currentRoom:', room)
    }

    // Set work storage flags FIRST to prevent updateView() from navigating away
    // This is critical because roomEnd() may cause isSiteEnd() to be true
    console.log('[SiteExploreContent] handleWorkComplete: Setting work storage flags')
    isInWorkStorageRef.current = true
    setWorkStorageView(true)

    // Mark room as done BEFORE showing storage view (matches original game)
    // This ensures room cannot be worked again regardless of how user exits storage view
    console.log('[SiteExploreContent] handleWorkComplete: Marking room as done, step before:', site.step)
    if (site.isInSecretRooms) {
      site.secretRoomEnd()
    } else {
      site.roomEnd(true) // Work rooms always succeed
      site.testSecretRoomsBegin()
    }
    console.log('[SiteExploreContent] handleWorkComplete: Room marked as done, step after:', site.step)

    // Auto-save
    saveAll().catch(err => console.error('Auto-save failed:', err))

    // Navigate to storage view
    console.log('[SiteExploreContent] handleWorkComplete: Navigating to workStorage, currentRoom:', currentRoom)
    setViewMode('workStorage')
  }

  const handleWorkStorageNext = () => {
    // Room is already marked as done in handleWorkComplete()
    // Just need to check if secret rooms ended
    if (site.isInSecretRooms && site.isSecretRoomsEnd()) {
      site.secretRoomsEnd()
    }

    // Clear work storage flags BEFORE updateView()
    // This allows updateView() to properly navigate to next room or site end
    console.log('[SiteExploreContent] handleWorkStorageNext: Clearing work storage flags')
    isInWorkStorageRef.current = false
    setWorkStorageView(false)

    // Auto-save
    saveAll().catch(err => console.error('Auto-save failed:', err))

    // Update view to show next room or site end
    updateView()
  }


  // Secret room handlers
  const handleSecretRoomLeave = () => {
    console.log('[SiteExploreContent] handleSecretRoomLeave called')
    console.log('[SiteExploreContent] Secret room state BEFORE leave:', {
      isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
      isInSecretRooms: site.isInSecretRooms,
      secretRoomsShowedCount: site.secretRoomsShowedCount
    })
    site.isSecretRoomsEntryShowed = false
    console.log('[SiteExploreContent] Secret room state AFTER leave:', {
      isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
      isInSecretRooms: site.isInSecretRooms
    })
    updateView()
  }

  const handleSecretRoomEnter = () => {
    console.log('[SiteExploreContent] handleSecretRoomEnter called')
    console.log('[SiteExploreContent] Secret room state BEFORE enter:', {
      isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
      isInSecretRooms: site.isInSecretRooms,
      secretRoomsShowedCount: site.secretRoomsShowedCount
    })
    site.enterSecretRooms()
    console.log('[SiteExploreContent] Secret room state AFTER enter:', {
      isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
      isInSecretRooms: site.isInSecretRooms
    })
    updateView()
  }

  // Render based on view mode
  // Handle case where currentRoom is not set yet but we have a viewMode that needs it
  // This can happen due to React state update timing
  if (!currentRoom && (viewMode === 'battleBegin' || viewMode === 'battleProcess' || viewMode === 'battleEnd' || viewMode === 'workBegin' || viewMode === 'workProcess' || viewMode === 'workStorage')) {
    // Get room directly from site to avoid blank screen
    const room = site.isInSecretRooms ? site.secretRoomBegin() : site.roomBegin()
    if (room) {
      // Use the room directly for this render, but also update state for next render
      setCurrentRoom(room)
      // Render with the room we just got
      if (viewMode === 'battleBegin') {
        return <BattleBeginView room={room} site={site} onStartBattle={handleBattleStart} />
      }
      if (viewMode === 'battleProcess' && battle) {
        return <BattleProcessView room={room} site={site} battle={battle} monsterCount={monsterCount} combatLogs={combatLogs} />
      }
      if (viewMode === 'battleEnd' && battleResult) {
        return <BattleEndView result={battleResult} site={site} room={room} onNext={handleBattleEndNext} />
      }
      if (viewMode === 'workBegin') {
        return <WorkBeginView room={room} site={site} onToolSelect={handleWorkStart} />
      }
      if (viewMode === 'workProcess') {
        return <WorkProcessView progress={workProgress} />
      }
      if (viewMode === 'workStorage') {
        return <WorkRoomStorageView room={room} site={site} onNextRoom={handleWorkStorageNext} flushRef={workStorageFlushRef} />
      }
    }
  }
  
  if (viewMode === 'secretEntry') {
    return <SecretRoomEntryView site={site} onLeave={handleSecretRoomLeave} onEnter={handleSecretRoomEnter} />
  }

  if (viewMode === 'battleBegin' && currentRoom) {
    return <BattleBeginView room={currentRoom} site={site} onStartBattle={handleBattleStart} />
  }

  if (viewMode === 'battleProcess' && currentRoom && battle) {
    return <BattleProcessView room={currentRoom} site={site} battle={battle} monsterCount={monsterCount} combatLogs={combatLogs} />
  }

  if (viewMode === 'battleEnd' && battleResult && currentRoom) {
    return <BattleEndView result={battleResult} site={site} room={currentRoom} onNext={handleBattleEndNext} />
  }

  if (viewMode === 'workBegin' && currentRoom) {
    return <WorkBeginView room={currentRoom} site={site} onToolSelect={handleWorkStart} />
  }

  if (viewMode === 'workProcess') {
    return <WorkProcessView progress={workProgress} />
  }

  if (viewMode === 'workStorage' && currentRoom) {
    // WorkRoomStorageView exposes flush function via ref
    return <WorkRoomStorageView room={currentRoom} site={site} onNextRoom={handleWorkStorageNext} flushRef={workStorageFlushRef} />
  }

  if (viewMode === 'siteEnd') {
    return <SiteEndView site={site} onBack={onBack} />
  }

  return null
}

