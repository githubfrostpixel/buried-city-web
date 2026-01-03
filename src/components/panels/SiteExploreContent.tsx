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

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Site } from '@/game/world/Site'
import { Room } from '@/types/site.types'
import { Battle, BattleInfo, BattleResult } from '@/game/combat/Battle'
import { BattlePlayer, type BattlePlayerState } from '@/game/combat/BattlePlayer'
import { Monster } from '@/game/combat/Monster'
import { BattleConfig, Equipment } from '@/game/combat/BattleConfig'
import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'
import { emitter } from '@/utils/emitter'
import { Sprite } from '@/components/sprites/Sprite'
import { BOTTOM_BAR_LAYOUT } from '@/components/layout/layoutConstants'
import { itemConfig } from '@/data/items'
import { CommonListItemButton } from '@/components/common/CommonListItemButton'
import { EquipPanel } from '@/components/common/EquipPanel'
import { ItemTransferPanel } from '@/components/common/ItemTransferPanel'
import { Storage } from '@/game/inventory/Storage'
import { Bag } from '@/game/inventory/Bag'
import { Item } from '@/game/inventory/Item'
import { game } from '@/game/Game'
import { saveAll } from '@/game/systems/SaveSystem'

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
  const [combatLogs, setCombatLogs] = useState<Array<{ log: string; color?: string; bigger?: boolean }>>([])
  const [monsterCount, setMonsterCount] = useState<number>(0)

  const playerStore = usePlayerStore.getState()
  const setWorkStorageView = useUIStore(state => state.setWorkStorageView)
  const isInWorkStorageView = useUIStore(state => state.isInWorkStorageView)
  const setInBattle = useUIStore(state => state.setInBattle)
  const isInWorkStorageRef = useRef(false)
  const workStorageFlushRef = useRef<(() => void) | null>(null)
  const { leftEdge, rightEdge, content, screenWidth } = BOTTOM_BAR_LAYOUT

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

  // Subscribe to battle events
  useEffect(() => {
    if (viewMode !== 'battleProcess') return

    const handleLog = (data: { log: string; color?: string; bigger?: boolean }) => {
      setCombatLogs(prev => {
        const newLogs = [...prev, data]
        return newLogs.slice(-7)
      })
    }

    const handleMonsterLength = (count: number) => {
      setMonsterCount(count)
    }

    emitter.on('battleProcessLog', handleLog)
    emitter.on('battleMonsterLength', handleMonsterLength)

    return () => {
      emitter.off('battleProcessLog', handleLog)
      emitter.off('battleMonsterLength', handleMonsterLength)
    }
  }, [viewMode])

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
  }

  const handleBattleEndNext = () => {
    if (!battleResult) return

    const isWin = battleResult.win

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
      const WORK_ANIMATION_DURATION = 3 // Real seconds
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

  // Handle back button from work room storage view
  // Note: Item flushing is now handled by WorkRoomStorageView's handleBack
  // Room is already marked as done in handleWorkComplete()
  const handleWorkStorageBack = () => {
    console.log('[SiteExploreContent] handleWorkStorageBack called - navigating back')
    // Items will be flushed by WorkRoomStorageView's handleBack before calling this
    // Room is already marked as done in handleWorkComplete()
    // Check if we need to end secret rooms
    if (site.isInSecretRooms && site.isSecretRoomsEnd()) {
      site.secretRoomsEnd()
      // Clear entry flag to prevent showing secret entry again when re-entering
      site.isSecretRoomsEntryShowed = false
    }
    // Just navigate back
    if (onBack) {
      onBack()
    }
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

  // Common image position
  const digDesY = content.top - 40
  const estimatedImageHeight = 400
  const imageBottom = digDesY + estimatedImageHeight
  const contentAreaTop = imageBottom - 120

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
        return <BattleEndView result={battleResult} site={site} onNext={handleBattleEndNext} />
      }
      if (viewMode === 'workBegin') {
        return <WorkBeginView room={room} site={site} onToolSelect={handleWorkStart} />
      }
      if (viewMode === 'workProcess') {
        return <WorkProcessView progress={workProgress} />
      }
      if (viewMode === 'workStorage') {
        return <WorkRoomStorageView room={room} site={site} onNextRoom={handleWorkStorageNext} onBack={handleWorkStorageBack} />
      }
    }
  }
  
  if (viewMode === 'secretEntry') {
    return <SecretRoomEntryView site={site} onLeave={handleSecretRoomLeave} onEnter={handleSecretRoomEnter} />
  }

  if (viewMode === 'battleBegin' && currentRoom) {
    return <BattleBeginView room={currentRoom} site={site} onStartBattle={handleBattleStart} />
  }

  if (viewMode === 'battleProcess' && currentRoom) {
    return <BattleProcessView room={currentRoom} site={site} battle={battle} monsterCount={monsterCount} combatLogs={combatLogs} />
  }

  if (viewMode === 'battleEnd' && battleResult) {
    return <BattleEndView result={battleResult} site={site} onNext={handleBattleEndNext} />
  }

  if (viewMode === 'workBegin' && currentRoom) {
    return <WorkBeginView room={currentRoom} site={site} onToolSelect={handleWorkStart} />
  }

  if (viewMode === 'workProcess') {
    return <WorkProcessView progress={workProgress} />
  }

  if (viewMode === 'workStorage' && currentRoom) {
    // WorkRoomStorageView exposes flush function via ref
    return <WorkRoomStorageView room={currentRoom} site={site} onNextRoom={handleWorkStorageNext} onBack={handleWorkStorageBack} flushRef={workStorageFlushRef} />
  }

  if (viewMode === 'siteEnd') {
    return <SiteEndView site={site} onBack={onBack} />
  }

  return null
}

// Secret Room Entry View
function SecretRoomEntryView({ site, onLeave, onEnter }: { site: Site; onLeave: () => void; onEnter: () => void }) {
  const { leftEdge, rightEdge, content } = BOTTOM_BAR_LAYOUT
  const secretRoomType = site.secretRoomType || 0

  return (
    <div className="relative w-full h-full">
      {/* Background images */}
      <div className="absolute" style={{ left: '50%', top: `${content.top}px`, transform: 'translate(-50%, -50%)' }}>
        <Sprite atlas="site" frame="site_dig_secret.png" style={{ width: '500px', height: 'auto' }} />
        <Sprite
          atlas="dig_monster"
          frame="monster_dig_mid_bg.png"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: 'auto'
          }}
        />
      </div>

      {/* Content */}
      <div className="absolute" style={{ left: `${leftEdge}px`, top: `${content.top + 200}px`, width: `${rightEdge - leftEdge}px` }}>
        <div className="text-white text-center mb-4" style={{ fontSize: '24px' }}>
          Secret Room {secretRoomType}
        </div>
        <div className="text-white text-center mb-8" style={{ fontSize: '18px' }}>
          Description for secret room type {secretRoomType}
        </div>

        <div className="flex justify-center gap-4">
          <CommonListItemButton text="Leave" onClick={onLeave} enabled={true} />
          <CommonListItemButton text="Enter" onClick={onEnter} enabled={true} />
        </div>
      </div>
    </div>
  )
}

// Battle Begin View
function BattleBeginView({ room, site, onStartBattle }: { room: Room; site: Site; onStartBattle: () => void }) {
  const playerStore = usePlayerStore.getState()
  const { leftEdge, rightEdge, content, screenWidth } = BOTTOM_BAR_LAYOUT
  const digDesY = content.top - 40
  const estimatedImageHeight = 400
  const imageBottom = digDesY + estimatedImageHeight
  const contentAreaTop = imageBottom - 120

  const isBandit = site.id === 500
  const difficulty = room.difficulty || 1
  const hasGun = !!playerStore.equipment.gun
  const hasWeapon = !!playerStore.equipment.weapon || playerStore.equipment.weapon === Equipment.HAND

  // Image stack
  const battleImageStack = (
    <div
      className="absolute"
      style={{
        left: `${screenWidth / 2 - 20}px`,
        top: `${digDesY}px`,
        transform: 'translateX(-50%)',
        width: 'max-content',
      }}
    >
      <Sprite
        atlas="npc"
        frame="npc_dig_bg.png"
        style={{ width: '500px', height: 'auto', position: 'relative', zIndex: 1 }}
      />
      <Sprite
        atlas="dig_monster"
        frame="monster_dig_mid_bg.png"
        style={{
          width: '500px',
          height: 'auto',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2
        }}
      />
      <Sprite
        atlas="dig_monster"
        frame={isBandit ? `bandit_dig_${difficulty}.png` : `monster_dig_${difficulty}.png`}
        style={{
          width: '500px',
          height: 'auto',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 3
        }}
      />
    </div>
  )

  return (
    <div className="relative w-full h-full" style={{ overflow: 'visible' }}>
      {battleImageStack}

      <div
        className="absolute"
        style={{
          left: `${leftEdge}px`,
          top: `${contentAreaTop}px`,
          width: `${rightEdge - leftEdge}px`,
        }}
      >
        <div className="text-white" style={{ fontSize: '20px', marginBottom: '10px' }}>
          Equipment:
        </div>

        <div className="flex gap-2" style={{ marginBottom: '25px' }}>
          {playerStore.equipment.gun && (
            <div style={{ position: 'relative' }}>
              <Sprite
                atlas="icon"
                frame={`icon_item_${playerStore.equipment.gun}.png`}
                style={{ width: '40px', height: '40px' }}
              />
              {playerStore.equipment.gun !== "1301091" && (
                <div
                  className="text-white"
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '16px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {playerStore.getBagItemCount(BattleConfig.BULLET_ID) + playerStore.getBagItemCount(BattleConfig.HOMEMADE_ID)}
                </div>
              )}
            </div>
          )}
          {playerStore.equipment.weapon && (
            <Sprite
              atlas="icon"
              frame={`icon_item_${playerStore.equipment.weapon}.png`}
              style={{ width: '40px', height: '40px' }}
            />
          )}
          {playerStore.equipment.tool && (
            <div style={{ position: 'relative' }}>
              <Sprite
                atlas="icon"
                frame={`icon_item_${playerStore.equipment.tool}.png`}
                style={{ width: '40px', height: '40px' }}
              />
              {(playerStore.equipment.tool === "1303012" ||
                playerStore.equipment.tool === "1303033" ||
                playerStore.equipment.tool === "1303044") && (
                <div
                  className="text-white"
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '16px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {playerStore.getBagItemCount(playerStore.equipment.tool)}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="text-white"
          style={{
            fontSize: '20px',
            color: difficulty > 2 ? '#FF0000' : '#FFFFFF',
            marginBottom: '10px',
          }}
        >
          {isBandit ? `Difficulty: ${difficulty + 5}` : `Difficulty: ${difficulty}`}
        </div>

        <div className="text-red-500" style={{ fontSize: '20px', marginBottom: '20px' }}>
          {!hasGun && !hasWeapon && <div>No weapon equipped!</div>}
          {playerStore.vigour < 30 && <div>Low energy!</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CommonListItemButton text="Start Battle" onClick={onStartBattle} enabled={true} />
        </div>
      </div>
    </div>
  )
}

// Battle Process View
function BattleProcessView({ room, site, battle, monsterCount, combatLogs }: { room: Room; site: Site; battle: Battle | null; monsterCount: number; combatLogs: Array<{ log: string; color?: string; bigger?: boolean }> }) {
  const { leftEdge, rightEdge, content, screenWidth } = BOTTOM_BAR_LAYOUT
  const digDesY = content.top - 40
  const estimatedImageHeight = 400
  const imageBottom = digDesY + estimatedImageHeight
  const contentAreaTop = imageBottom - 120

  const isBandit = site.id === 500
  const difficulty = room.difficulty || 1
  const monsterList = (room.list as string[]) || []
  const totalMonsters = monsterList.length
  const remainingMonsters = monsterCount
  const progressPercentage = totalMonsters > 0 ? ((totalMonsters - remainingMonsters) / totalMonsters) * 100 : 0

  const battleImageStack = (
    <div
      className="absolute"
      style={{
        left: `${screenWidth / 2 - 20}px`,
        top: `${digDesY}px`,
        transform: 'translateX(-50%)',
        width: 'max-content',
      }}
    >
      <Sprite
        atlas="npc"
        frame="npc_dig_bg.png"
        style={{ width: '500px', height: 'auto', position: 'relative', zIndex: 1 }}
      />
      <Sprite
        atlas="dig_monster"
        frame="monster_dig_mid_bg.png"
        style={{
          width: '500px',
          height: 'auto',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2
        }}
      />
      <Sprite
        atlas="dig_monster"
        frame={isBandit ? `bandit_dig_${difficulty}.png` : `monster_dig_${difficulty}.png`}
        style={{
          width: '500px',
          height: 'auto',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 3
        }}
      />
    </div>
  )

  return (
    <div className="relative w-full h-full" style={{ overflow: 'visible' }}>
      {battleImageStack}

      <div
        className="absolute"
        style={{
          left: `${leftEdge}px`,
          top: `${contentAreaTop}px`,
          width: `${rightEdge - leftEdge}px`,
        }}
      >
        <div style={{ width: '100%', height: '200px', fontSize: '20px', fontFamily: "'Noto Sans', sans-serif", marginBottom: '20px' }}>
          {combatLogs.map((log, index) => (
            <div
              key={index}
              style={{
                color: log.color || '#FFFFFF',
                fontSize: log.bigger ? '24px' : '20px',
                marginBottom: '4px',
              }}
            >
              {log.log}
            </div>
          ))}
        </div>

        <div style={{ width: '100%', marginTop: '40px', marginBottom: '10px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Sprite
                atlas="ui"
                frame="pb_bg.png"
                style={{ width: 'auto', height: 'auto', display: 'block' }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: `${progressPercentage}%`,
                  height: '100%',
                  overflow: 'hidden',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Sprite
                  atlas="ui"
                  frame="pb.png"
                  style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                />
              </div>
            </div>
            <div className="text-white" style={{ fontSize: '20px', textAlign: 'right', marginTop: '5px', width: '100%' }}>
              {isBandit ? 'Bandits' : 'Monsters'}: {remainingMonsters}/{totalMonsters}
            </div>
          </div>
        </div>

        <div style={{ width: '100%', marginTop: '15px', display: 'flex', justifyContent: 'center' }}>
          <CommonListItemButton
            text="Escape"
            onClick={() => {
              if (battle && battle.player) {
                battle.player.escape()
              }
            }}
            enabled={true}
          />
        </div>
      </div>
    </div>
  )
}

// Battle End View
function BattleEndView({ result, site, onNext }: { result: BattleResult; site: Site; onNext: () => void }) {
  const { leftEdge, rightEdge, content, screenWidth } = BOTTOM_BAR_LAYOUT
  const digDesY = content.top - 40
  const estimatedImageHeight = 400
  const imageBottom = digDesY + estimatedImageHeight
  const contentAreaTop = imageBottom - 120

  const isBandit = site.id === 500
  const difficulty = 1 // TODO: Get from room

  const consumedItems: Array<{ itemId: string; num: number }> = []
  if (result.bulletNum > 0) {
    consumedItems.push({ itemId: BattleConfig.BULLET_ID, num: result.bulletNum })
  }
  if (result.homemadeNum > 0) {
    consumedItems.push({ itemId: BattleConfig.HOMEMADE_ID, num: result.homemadeNum })
  }
  if (result.tools > 0 && result.toolItemId) {
    consumedItems.push({ itemId: result.toolItemId, num: result.tools })
  }
  if (result.fuel > 0) {
    consumedItems.push({ itemId: "gas", num: result.fuel })
  }

  const battleImageStack = (
    <div
      className="absolute"
      style={{
        left: `${screenWidth / 2 - 20}px`,
        top: `${digDesY}px`,
        transform: 'translateX(-50%)',
        width: 'max-content',
      }}
    >
      <Sprite
        atlas="npc"
        frame="npc_dig_bg.png"
        style={{ width: '500px', height: 'auto', position: 'relative', zIndex: 1 }}
      />
      {!result.win && (
        <>
          <Sprite
            atlas="dig_monster"
            frame="monster_dig_mid_bg.png"
            style={{
              width: '500px',
              height: 'auto',
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2
            }}
          />
          <Sprite
            atlas="dig_monster"
            frame={isBandit ? `bandit_dig_${difficulty}.png` : `monster_dig_${difficulty}.png`}
            style={{
              width: '500px',
              height: 'auto',
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 3
            }}
          />
        </>
      )}
    </div>
  )

  return (
    <div className="relative w-full h-full" style={{ overflow: 'visible' }}>
      {battleImageStack}

      <div
        className="absolute"
        style={{
          left: `${leftEdge}px`,
          top: `${contentAreaTop}px`,
          width: `${rightEdge - leftEdge}px`,
        }}
      >
        <div className="text-white mb-4" style={{ fontSize: '20px' }}>
          {isBandit ? 'Bandit Battle Complete' : 'Battle Complete'}
        </div>

        {consumedItems.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <div className="text-white mb-2" style={{ fontSize: '20px' }}>Consumed Items:</div>
            <div className="flex gap-2 flex-wrap">
              {consumedItems.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Sprite
                    atlas="icon"
                    frame={`icon_item_${item.itemId}.png`}
                    style={{ width: '24px', height: '24px' }}
                  />
                  <span className="text-xs text-white">x{item.num}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-white mb-4" style={{ fontSize: '20px' }}>
          <div>HP Lost: {result.totalHarm}</div>
          {result.totalVirus > 0 && <div>Virus Gained: {result.totalVirus}</div>}
        </div>

        {result.brokenWeapon && result.brokenWeapon.length > 0 && (
          <div className="mb-4">
            <div className="text-white mb-2" style={{ fontSize: '20px' }}>Broken Weapons:</div>
            <div className="flex gap-2">
              {result.brokenWeapon.map((itemId, index) => (
                <Sprite
                  key={index}
                  atlas="icon"
                  frame={`icon_item_${itemId}.png`}
                  style={{ width: '32px', height: '32px' }}
                />
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CommonListItemButton text="Next" onClick={onNext} enabled={true} />
        </div>
      </div>
    </div>
  )
}

// Work Begin View
function WorkBeginView({ room, site, onToolSelect }: { room: Room; site: Site; onToolSelect: (toolId: string, time: number) => void }) {
  const playerStore = usePlayerStore.getState()
  const { leftEdge, rightEdge, bgHeight, cocosRef } = BOTTOM_BAR_LAYOUT

  const workType = room.workType || 0
  const isSpecial = site.id === 666 && site.step === site.rooms.length - 1

  // Constants from original game
  const contentTopLineHeight = cocosRef.contentTopLineHeight  // 770px (Cocos Y from bottom)
  const containerWidth = rightEdge - leftEdge  // rightEdge - leftEdge
  const containerHeight = 600  // Tool container height
  const toolButtonY = 120  // Y position from bottom of container
  const buttonWidth = 80  // Estimated button width (btn_tool.png)
  const workImageWidth = 500
  const workImageHeight = 400  // Estimated height for work_dig images

  // Calculate positions (Cocos to CSS conversion)
  // Work image: anchor (0.5, 1), position (bgWidth/2, contentTopLineHeight - 20)
  // CSS top = bgHeight - (contentTopLineHeight - 20) = bgHeight - contentTopLineHeight + 20
  const workImageTop = bgHeight - contentTopLineHeight + 20

  // Description: position (bgWidth/2, digDes.y - digDes.height - 20)
  // digDes.y = contentTopLineHeight - 20 (Cocos Y from bottom)
  // digDes.y in CSS = bgHeight - (contentTopLineHeight - 20) = workImageTop
  // digDes bottom = workImageTop - workImageHeight
  // Description top = digDes bottom - 20
  const descriptionTop = workImageTop - workImageHeight - 20

  // Tool container: anchor (0.5, 0), position (bgWidth/2, 0)
  // CSS: bottom: 0, left: 50%, transform: translateX(-50%)
  const containerBottom = 0

  // Get available tools
  const availableTools = useMemo(() => {
    const tools: Array<{ itemId: string; time: number }> = []
    
    // Hand is always first
    tools.push({ itemId: Equipment.HAND, time: 45 })

    // Get tools from bag (type 1302 with effect_tool)
    Object.entries(playerStore.bag).forEach(([itemId, count]) => {
      if (count > 0) {
        const config = itemConfig[itemId]
        // Check if item type is 1302 (tools) - type is first 2 digits of item ID
        const itemType = itemId.substring(0, 2)
        if (itemType === '13' && config?.effect_tool) {
          const workingTime = config.effect_tool.workingTime || 45
          const vigourEffect = playerStore.vigour < 30 ? 2 : 1 // vigourEffect: 2 if low, 1 otherwise
          const time = workingTime * vigourEffect
          tools.push({ itemId, time })
        }
      }
    })

    return tools
  }, [playerStore.bag, playerStore.vigour])

  // Calculate button padding (from original game)
  const buttonCount = availableTools.length
  const padding = buttonCount > 0 ? (containerWidth - buttonCount * buttonWidth) / (buttonCount * 2) : 0

  return (
    <div className="relative w-full h-full">
      {/* Work image - anchor (0.5, 1) = top-center */}
      <div 
        className="absolute" 
        style={{ 
          left: '50%', 
          top: `${workImageTop}px`, 
          transform: 'translate(-50%, 0)' 
        }}
      >
        <Sprite
          atlas="site"
          frame={isSpecial ? "work_dig_3.png" : `work_dig_${workType}.png`}
          style={{ width: `${workImageWidth}px`, height: 'auto' }}
        />
      </div>

      {/* Description - centered, below work image */}
      <div
        className="absolute text-white text-center"
        style={{
          left: '50%',
          top: `${descriptionTop}px`,
          transform: 'translateX(-50%)',
          width: `${containerWidth}px`,
          fontSize: '18px',
        }}
      >
        {isSpecial ? 'Special work description' : `Work room type ${workType} description`}
      </div>

      {/* Tool selection container - at bottom of bg, 600px height */}
      <div
        className="absolute"
        style={{
          left: '50%',
          bottom: `${containerBottom}px`,
          transform: 'translateX(-50%)',
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,
        }}
      >
        {/* Tool buttons - positioned at Y=120 from container bottom */}
        {availableTools.map((tool, i) => {
          // Button X position: (padding * 2 + buttonWidth) * i + (padding + buttonWidth / 2)
          const buttonX = (padding * 2 + buttonWidth) * i + (padding + buttonWidth / 2)
          // Button Y position: 120 from bottom of container
          const buttonY = containerHeight - toolButtonY

          return (
            <div key={tool.itemId} className="absolute" style={{ left: `${buttonX}px`, top: `${buttonY}px`, transform: 'translate(-50%, -50%)' }}>
              <button
                onClick={() => onToolSelect(tool.itemId, tool.time)}
                className="relative"
                style={{
                  width: `${buttonWidth}px`,
                  height: `${buttonWidth}px`,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Sprite atlas="ui" frame="btn_tool.png" className="w-full h-full" />
                {/* Icon - centered, scale 0.5 (50% of original size) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {tool.itemId === Equipment.HAND ? (
                    <Sprite 
                      atlas="gate" 
                      frame="icon_tab_content_hand.png" 
                      style={{ width: '50%', height: '50%' }} 
                    />
                  ) : (
                    <Sprite
                      atlas="icon"
                      frame={`icon_item_${tool.itemId}.png`}
                      style={{ width: '50%', height: '50%' }}
                    />
                  )}
                </div>
              </button>
              {/* Label - below button, anchor (0.5, 1) = top-center */}
              {/* Original: label Y = btn.getPositionY() - iconWidth / 2 - 10 */}
              {/* Button center is at (buttonX, buttonY) with transform translate(-50%, -50%) */}
              {/* Label should be at buttonY - buttonWidth/2 - 10 from container top */}
              {/* But since label is relative to button div, and button div center is at buttonY */}
              {/* Label top relative to div = (buttonY - buttonWidth/2 - 10) - buttonY = -buttonWidth/2 - 10 */}
              {/* Actually, simpler: label is buttonWidth/2 + 10px below button center */}
              <div
                className="absolute text-white text-center"
                style={{
                  left: '50%',
                  top: `${buttonWidth / 2 + 10}px`,
                  transform: 'translateX(-50%)',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                }}
              >
                {Math.round(tool.time)}m
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Work Process View
function WorkProcessView({ progress }: { progress: number }) {
  // Constants from original game
  // Original: container at (bgWidth/2, 0) with anchor (0.5, 0), progress bar at (containerWidth/2, 60)
  // Progress bar is 60px from bottom of bg
  const progressBarY = 60  // Y position from bottom of bg

  return (
    <div className="relative w-full h-full" style={{ opacity: 1 }}>
      {/* Progress bar - anchor (0.5, 0) = bottom-center, position (bgWidth/2, 60) */}
      {/* Note: Only progress bar is shown, doesn't block other elements */}
      <div
        className="absolute"
        style={{
          left: '50%',
          bottom: `${progressBarY}px`,
          transform: 'translateX(-50%)',
          width: 'auto',
          height: 'auto',
          pointerEvents: 'none', // Don't block clicks on other elements
        }}
      >
        <div style={{ position: 'relative' }}>
          <Sprite
            atlas="ui"
            frame="pb_bg.png"
            style={{ width: 'auto', height: 'auto', display: 'block' }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: `${progress}%`,
              height: '100%',
              overflow: 'hidden',
              zIndex: 1,
            }}
          >
            <Sprite
              atlas="ui"
              frame="pb.png"
              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Work Room Storage View
function WorkRoomStorageView({ room, site, onNextRoom, onBack, flushRef }: { room: Room; site: Site; onNextRoom: () => void; onBack: () => void; flushRef?: React.MutableRefObject<(() => void) | null> }) {
  const playerStore = usePlayerStore.getState()
  const { content } = BOTTOM_BAR_LAYOUT
  const setWorkStorageFlushFunction = useUIStore(state => state.setWorkStorageFlushFunction)
  const hasFlushedRef = useRef(false)
  // Store initial items in ref to prevent recreation from empty room.list
  const initialItemsRef = useRef<Record<string, number> | null>(null)

  // Create temporary storage from room.list
  // CRITICAL: Check if items have already been flushed (room-level flag) to prevent duplication
  const tempStorage = useMemo(() => {
    const storage = new Storage('temp')
    console.log('[WorkRoomStorageView] Creating temp storage from room:', {
      roomType: room.type,
      listLength: Array.isArray(room.list) ? room.list.length : 'not array',
      list: room.list,
      itemsFlushed: room.itemsFlushed
    })
    
    // CRITICAL: If items have already been flushed from this room, don't create tempStorage from room.list
    // This prevents duplication when room.list is restored from save data
    if (room.type === 'work' && Array.isArray(room.list) && !room.itemsFlushed) {
      let itemCounts: Record<string, number> = {}
      
      // If we have stored initial items (from previous render), use those instead of room.list
      // This prevents recreation from empty room.list after it's been cleared
      if (initialItemsRef.current) {
        itemCounts = { ...initialItemsRef.current }
      } else if (room.list.length > 0) {
        // First time: count items from room.list and store in ref
        room.list.forEach((item: Item) => {
          if (item && item.id) {
            itemCounts[item.id] = (itemCounts[item.id] || 0) + 1
          } else {
            console.warn('[WorkRoomStorageView] Invalid item in room.list:', item)
          }
        })
        // Store initial items in ref for future recreations
        initialItemsRef.current = { ...itemCounts }
      } else {
        // room.list is empty and no stored items - this shouldn't happen on first render
        console.warn('[WorkRoomStorageView] room.list is empty and no stored items - creating empty tempStorage')
      }
      
      // Add items to storage
      Object.entries(itemCounts).forEach(([itemId, count]) => {
        storage.increaseItem(itemId, count, false)
      })
      console.log('[WorkRoomStorageView] Temp storage created with items:', storage.items)
    } else if (room.type === 'work' && room.itemsFlushed) {
      console.log('[WorkRoomStorageView] Items already flushed from this room, creating empty tempStorage')
    } else {
      console.warn('[WorkRoomStorageView] Room is not work type or list is not array:', {
        type: room.type,
        isArray: Array.isArray(room.list)
      })
    }
    return storage
  }, [room])

  // Create bag storage - use Bag class for dynamic maxWeight
  const bagStorage = useMemo(() => {
    const bag = new Bag()
    bag.restore(playerStore.bag)
    return bag
  }, [playerStore.bag])
  
  // Callbacks to persist storage changes
  const handleTopStorageUpdate = (storage: Storage) => {
    // Save bag back to playerStore
    usePlayerStore.setState({ bag: storage.save() })
  }
  
  const handleBottomStorageUpdate = (storage: Storage) => {
    // For work room, tempStorage is temporary UI state that will be flushed to site.storage later
    // No need to persist tempStorage - flushItems() handles that
    // This callback can be empty or just trigger a re-render if needed
  }

  // Flush items to site storage (only once)
  const flushItems = useCallback(() => {
    // Check both component-level ref and room-level flag to prevent duplication
    if (hasFlushedRef.current || room.itemsFlushed) {
      console.log('[WorkRoomStorageView] Items already flushed, skipping', { hasFlushedRef: hasFlushedRef.current, roomItemsFlushed: room.itemsFlushed })
      return
    }
    
    hasFlushedRef.current = true
    console.log('[WorkRoomStorageView] Flushing items to depository:', tempStorage.items)
    Object.entries(tempStorage.items).forEach(([itemId, count]) => {
      if (count > 0) {
        site.increaseItem(itemId, count)
      }
    })
    // CRITICAL FIX: Mark room as flushed and clear room.list to prevent duplication
    // This prevents tempStorage from being recreated with original items when room.list is restored from save data
    if (room.type === 'work' && Array.isArray(room.list)) {
      // Mark room as flushed - this flag is saved/restored, preventing duplication on restore
      room.itemsFlushed = true
      room.list = []
      // Also clear the initial items ref since we've flushed
      initialItemsRef.current = null
    }
    console.log('[WorkRoomStorageView] Site storage after flush:', site.storage.items)
    saveAll().catch(err => console.error('Auto-save failed:', err))
  }, [tempStorage, site, room])

  // Expose flush function via ref so parent can call it when navigating away
  useEffect(() => {
    if (flushRef) {
      flushRef.current = flushItems
    }
    // Also expose via uiStore so MainScene can call it
    setWorkStorageFlushFunction(flushItems)
    return () => {
      // CRITICAL: Call flush function before clearing it, in case component unmounts before MainScene can call it
      const flushFn = useUIStore.getState().workStorageFlushFunction
      if (flushFn) {
        console.log('[WorkRoomStorageView] Component unmounting, calling flush function')
        flushFn()
      }
      if (flushRef) {
        flushRef.current = null
      }
      setWorkStorageFlushFunction(null)
    }
  }, [flushItems, flushRef, setWorkStorageFlushFunction])

  // DO NOT flush on unmount - this causes issues with React Strict Mode double renders
  // Items should only be flushed when user explicitly navigates (via handleNextRoom or handleWorkStorageBack)
  // The unmount effect is removed to prevent premature flushing

  const handleNextRoom = () => {
    // Explicitly flush before navigating
    flushItems()
    onNextRoom()
  }

  // Calculate positions (same as GatePanelContent)
  const contentTopLineHeight = BOTTOM_BAR_LAYOUT.cocosRef.contentTopLineHeight
  const contentHeight = BOTTOM_BAR_LAYOUT.content.height
  const equipPanelHeight = 125
  const separatorHeight = 10
  const equipPanelTop = contentHeight - contentTopLineHeight
  const itemTransferPanelTop = equipPanelTop + equipPanelHeight + separatorHeight

  const workType = room.workType || 0
  const workRoomTypeName = `Work Room Type ${workType}` // TODO: Use string ID 3007[workType]

  return (
    <div className="relative w-full h-full">
      {/* EquipPanel at top */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: `${equipPanelTop}px`,
          transform: 'translateX(-50%)',
          width: '572px',
          height: `${equipPanelHeight}px`,
          zIndex: 1,
          overflow: 'visible'
        }}
      >
        <EquipPanel />
      </div>

      {/* Separator line */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: `${equipPanelTop + equipPanelHeight}px`,
          transform: 'translateX(-50%)',
          width: '596px',
          height: `${separatorHeight}px`,
          zIndex: 1
        }}
      />

      {/* ItemTransferPanel below EquipPanel */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: `${itemTransferPanelTop}px`,
          transform: 'translateX(-50%)',
          width: '596px',
          height: '400px',
          zIndex: 0
        }}
      >
        <ItemTransferPanel
          topStorage={bagStorage}
          topStorageName="Bag"
          bottomStorage={tempStorage}
          bottomStorageName={workRoomTypeName}
          showWeight={true}
          withTakeAll={true}
          onTopStorageUpdate={handleTopStorageUpdate}
          onBottomStorageUpdate={handleBottomStorageUpdate}
        />
      </div>

      {/* Next Room button */}
      <div
        className="absolute"
        style={{
          left: '50%',
          bottom: '20px',
          transform: 'translateX(-50%)',
        }}
      >
        <CommonListItemButton text="Next" onClick={handleNextRoom} enabled={true} />
      </div>
    </div>
  )
}

// Site End View
function SiteEndView({ site, onBack }: { site: Site; onBack?: () => void }) {
  const { leftEdge, rightEdge, content } = BOTTOM_BAR_LAYOUT

  return (
    <div className="relative w-full h-full">
      <div
        className="absolute text-white text-center"
        style={{
          left: `${leftEdge}px`,
          top: `${content.top + 200}px`,
          width: `${rightEdge - leftEdge}px`,
          fontSize: '24px',
        }}
      >
        <div className="mb-8">Site Completed!</div>
        <div className="mb-8" style={{ fontSize: '18px' }}>
          {site.getName()} has been fully explored.
        </div>
        {onBack && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CommonListItemButton text="Back" onClick={onBack} enabled={true} />
          </div>
        )}
      </div>
    </div>
  )
}

