/**
 * MapPanelContent Component
 * World map panel for exploring locations
 * 
 * Ported from OriginalGame/src/ui/MapNode.js
 * 
 * Structure:
 * - Map background (map_bg_new.png) spans bottom bar content area
 * - Sites positioned on map
 * - Player actor showing current position
 * - Clickable sites for navigation
 * 
 * Original Game Reference:
 * - MapNode extends BottomFrameNode (panel, not scene)
 * - uiConfig: { title: "", leftBtn: false, rightBtn: false }
 * - MapView size: (bgRect.width - 12, bgRect.height - 12)
 * - MapView position: ((bgRect.width - mapView.getViewSize().width) / 2 + 1, 6)
 */

import { useEffect, useState } from 'react'
import { useUIStore } from '@/core/store/uiStore'
import { usePlayerStore } from '@/core/store/playerStore'
import { useGameStore } from '@/core/store/gameStore'
import { game } from '@/core/game/Game'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { HOME_SITE, AD_SITE, BOSS_SITE, WORK_SITE, GAS_SITE, BAZAAR_SITE } from '@/core/game/world/Site'
import { BOTTOM_BAR_LAYOUT } from '@/layout/layoutConstants'
import { cocosToCssY } from '@/common/utils/position'
import { calculateDistance } from '@/common/utils/distance'
import { getMaxVelocityGameTime } from '@/common/utils/actor'
import { useActorMovement } from '@/common/hooks/useActorMovement'
import { audioManager, MusicPaths } from '@/core/game/systems/AudioManager'
import { transferBagToStorage, unequipItemsNotInBag } from '@/scene/navigation/gatePanelUtils'
import type { Site } from '@/core/game/world/Site'
import type { Panel } from '@/core/store/uiStore'

export function MapPanelContent() {
  const uiStore = useUIStore()
  const playerStore = usePlayerStore()
  const gameStore = useGameStore()
  const map = playerStore.map
  const isMoving = playerStore.isMoving
  const weatherId = gameStore.weather
  const [sites, setSites] = useState<Site[]>([])
  const [npcs, setNpcs] = useState<Array<{ id: number; pos: { x: number; y: number }; getName: () => string }>>([])
  const [actorPos, setActorPos] = useState<{ x: number; y: number } | null>(map?.pos || null)

  // Use actor movement hook for smooth animation
  useActorMovement()

  // Play weather-based music when map panel is active
  // Ported from OriginalGame/src/ui/bottomFrame.js:73-90
  useEffect(() => {
    let musicPath: string
    switch (weatherId) {
      case 0:
        musicPath = MusicPaths.MAP_CLOUDY
        break
      case 1:
        musicPath = MusicPaths.MAP_SUNNY
        break
      case 2:
        musicPath = MusicPaths.MAP_RAIN
        break
      case 3:
        musicPath = MusicPaths.MAP_SNOW
        break
      case 4:
        musicPath = MusicPaths.MAP_FOG
        break
      default:
        musicPath = MusicPaths.MAP_CLOUDY
    }
    audioManager.playMusic(musicPath, true)
  }, [weatherId])

  // Update actor position state when map position changes (for re-rendering)
  useEffect(() => {
    if (!map) return
    
    // Initial position
    setActorPos(map.pos)
    
    // When moving, poll position updates to trigger re-renders
    if (isMoving) {
      const interval = setInterval(() => {
        if (map.pos) {
          setActorPos({ ...map.pos })
        }
      }, 16) // ~60fps
      
      return () => clearInterval(interval)
    } else {
      // Update once when not moving
      setActorPos(map.pos)
    }
  }, [map, isMoving])

  // Get content area dimensions (for coordinate conversion)
  const contentHeight = BOTTOM_BAR_LAYOUT.content.fullScreenHeight

  // Get all sites and NPCs from map
  useEffect(() => {
    if (!map) return

    const siteList: Site[] = []
    const npcList: Array<{ id: number; pos: { x: number; y: number }; getName: () => string }> = []
    
    // Get NPCManager if available
    let npcManager: { getNPC: (id: number) => any } | undefined
    try {
      npcManager = playerStore.getNPCManager()
    } catch {
      // NPCManager not initialized yet
    }
    
    map.forEach((entity) => {
      // Check if entity is a Site (has id and getName method, and is instance of Site)
      if (entity && typeof (entity as any).id === 'number' && typeof (entity as any).getName === 'function') {
        // Check if it's an NPC (has isUnlocked property) or Site
        if ('isUnlocked' in entity) {
          // It's an NPC
          const npc = entity as any
          if (npc.isUnlocked) {
            npcList.push({
              id: npc.id,
              pos: npc.pos,
              getName: () => npc.getName()
            })
          }
        } else {
          // It's a Site
          siteList.push(entity as Site)
        }
      }
    }, npcManager)
    
    setSites(siteList)
    setNpcs(npcList)
  }, [map, playerStore])

  // Enter site after travel completes
  const enterSite = (site: Site) => {
    // Determine panel to navigate to
    let panel: Panel | null = null
    let siteId: number | null = null
    
    if (site.id === HOME_SITE) {
      panel = 'home'
      // Transfer all items from bag to storage when returning home
      transferBagToStorage()
      // After transferring all items, unequip any items that are no longer in the bag
      unequipItemsNotInBag()
      // TODO: Add log message 1111
      // TODO: Call player.trySteal()
    } else if (site.id === AD_SITE) {
      panel = 'site'  // TODO: Create AD_SITE panel
      siteId = site.id
    } else if (site.id === BOSS_SITE) {
      panel = 'site'  // TODO: Create BOSS_SITE panel
      siteId = site.id
    } else if (site.id === WORK_SITE || site.id === GAS_SITE) {
      panel = 'site'  // TODO: Create WORK_SITE panel
      siteId = site.id
    } else if (site.id === BAZAAR_SITE) {
      panel = 'bazaar'
      siteId = site.id
    } else {
      panel = 'site'
      siteId = site.id
    }
    
    // TODO: Add log message 1116 with site name
    
    // Set location
    playerStore.setLocation({
      isAtHome: site.id === HOME_SITE,
      isAtBazaar: site.id === BAZAAR_SITE,
      isAtSite: panel === 'site',
      siteId: site.id
    })
    
    // Navigate to panel
    uiStore.setScene('main')
    if (panel === 'site' && siteId) {
      uiStore.openPanelAction('site', undefined, siteId)
    } else {
      uiStore.openPanelAction(panel)
    }
    
    // TODO: Save game (Record.saveAll())
  }

  // Enter NPC after travel completes
  const enterNPC = (npcId: number) => {
    // TODO: Add log message 1116 with NPC name
    // Get NPC instance to get name for log
    // let npcManager
    // try {
    //   npcManager = playerStore.getNPCManager()
    //   const npc = npcManager.getNPC(npcId)
    //   // player.log.addMsg(1116, npc.getName())
    // } catch {
    //   console.error('[MapPanelContent] NPCManager not available')
    // }
    
    // Set location
    playerStore.setLocation({
      isAtHome: false,
      isAtBazaar: false,
      isAtSite: false,
      siteId: null
    })
    
    // Navigate to NPC panel
    uiStore.setScene('main')
    uiStore.openPanelAction('npc', undefined, undefined, npcId)
    
    // TODO: Save game (Record.saveAll())
  }

  // Handle NPC click
  const handleNPCClick = (npcId: number) => {
    // 1. Check if moving (prevent clicks during movement)
    if (playerStore.isMoving) return
    
    // 2. Get NPC instance
    let npcManager
    try {
      npcManager = playerStore.getNPCManager()
    } catch {
      console.error('[MapPanelContent] NPCManager not available')
      return
    }
    
    const npc = npcManager.getNPC(npcId)
    if (!npc) {
      console.error('[MapPanelContent] NPC not found:', npcId)
      return
    }
    
    // 3. Get current position
    if (!map || !map.pos) return
    const startPos = map.pos
    const endPos = npc.pos
    
    // 4. Calculate distance
    const distance = calculateDistance(startPos, endPos)
    
    // 5. Calculate fuel needed
    let fuelNeed = Math.ceil(distance / 80)
    let canAfford = false
    if (playerStore.fuel >= fuelNeed) {
      canAfford = true
    }
    
    // 6. Check motorcycle availability
    const hasMotorcycle = playerStore.getStorageItemCount('1305034') > 0 || 
                          playerStore.getBagItemCount('1305034') > 0
    if (!hasMotorcycle || !playerStore.useMoto) {
      fuelNeed = -1  // No fuel needed
    }
    
    // 7. Calculate travel time (in game seconds)
    // TODO: Get weather speed multiplier from gameStore
    const weatherSpeedMultiplier = 0  // Stub for now
    // Use game-time velocity for time calculation (matches original game)
    const maxVelocityGameTime = getMaxVelocityGameTime(playerStore, canAfford, weatherSpeedMultiplier)
    const time = distance / maxVelocityGameTime
    
    // 8. Create movement completion callback
    // This is called AFTER movement animation completes
    const handleMovementComplete = () => {
      // Consume fuel if needed
      if (fuelNeed > 0 && canAfford) {
        playerStore.fuel = Math.max(0, playerStore.fuel - fuelNeed)
      }
      
      // Update total distance
      playerStore.totalDistance += Math.round(distance)
      
      // TODO: Update dog distance if dog is active
      
      // Navigate to NPC
      enterNPC(npcId)
    }
    
    // 9. Create OK callback (initiates movement)
    const okFunc = () => {
      console.log('[MapPanelContent] NPC okFunc called - initiating movement', {
        npcId,
        startPos,
        endPos,
        distance,
        fuelNeed,
        canAfford,
        time,
        weatherSpeedMultiplier
      })
      
      // Set moving state
      playerStore.setIsMoving(true)
      console.log('[MapPanelContent] Set isMoving = true')
      
      // Accelerate time during travel
      const TRAVEL_ANIMATION_DURATION = 3 // Always 3 real seconds for animation
      console.log('[MapPanelContent] Accelerating time:', { 
        gameTime: time, 
        realTime: TRAVEL_ANIMATION_DURATION,
        timeScale: time / TRAVEL_ANIMATION_DURATION
      })
      
      // Get TimeManager from game and accelerate time
      const timeManager = game.getTimeManager()
      if (timeManager) {
        timeManager.accelerate(time, TRAVEL_ANIMATION_DURATION, true)
        console.log('[MapPanelContent] Time acceleration applied:', { 
          gameTime: time, 
          realTime: TRAVEL_ANIMATION_DURATION,
          expectedTimeScale: time / TRAVEL_ANIMATION_DURATION
        })
      } else {
        console.warn('[MapPanelContent] TimeManager not available')
      }
      
      // Calculate animation velocity for constant 3-second movement
      const ANIMATION_DURATION = 3 // seconds
      const animationVelocity = distance / ANIMATION_DURATION
      console.log('[MapPanelContent] Calculated animation velocity (3s constant):', animationVelocity)
      playerStore.setActorMaxVelocity(animationVelocity)
      
      // Set target position (triggers movement animation via useActorMovement hook)
      console.log('[MapPanelContent] Setting target position:', endPos)
      playerStore.setActorTargetPos(endPos)
      
      // Store completion callback (called by useActorMovement when movement finishes)
      console.log('[MapPanelContent] Setting movement completion callback')
      playerStore.setActorMovementCallback(handleMovementComplete)
    }
    
    // 10. Create cancel callback
    const cancelFunc = () => {
      // Nothing to do on cancel
    }
    
    // 11. Show dialog
    uiStore.showOverlay('npcDialog', {
      npc,
      time,
      fuelNeed,
      canAfford,
      onConfirm: okFunc,
      onCancel: cancelFunc
    })
  }

  // Handle site click
  const handleSiteClick = (site: Site) => {
    // 1. Check if moving (prevent clicks during movement)
    if (playerStore.isMoving) return
    
    // 2. Get current position
    if (!map || !map.pos) return
    const startPos = map.pos
    const endPos = site.pos
    
    // 3. Calculate distance
    const distance = calculateDistance(startPos, endPos)
    
    // 4. Calculate fuel needed
    let fuelNeed = Math.ceil(distance / 80)
    let canAfford = false
    if (playerStore.fuel >= fuelNeed) {
      canAfford = true
    }
    
    // 5. Check motorcycle availability
    const hasMotorcycle = playerStore.getStorageItemCount('1305034') > 0 || 
                          playerStore.getBagItemCount('1305034') > 0
    if (!hasMotorcycle || !playerStore.useMoto) {
      fuelNeed = -1  // No fuel needed
    }
    
    // 6. Calculate travel time (in game seconds)
    // TODO: Get weather speed multiplier from gameStore
    const weatherSpeedMultiplier = 0  // Stub for now
    // Use game-time velocity for time calculation (matches original game)
    const maxVelocityGameTime = getMaxVelocityGameTime(playerStore, canAfford, weatherSpeedMultiplier)
    const time = distance / maxVelocityGameTime
    
    // 7. Create movement completion callback
    // This is called AFTER movement animation completes
    const handleMovementComplete = () => {
      // Consume fuel if needed
      if (fuelNeed > 0 && canAfford) {
        playerStore.fuel = Math.max(0, playerStore.fuel - fuelNeed)
      }
      
      // Update total distance
      playerStore.totalDistance += Math.round(distance)
      
      // TODO: Update dog distance if dog is active
      
      // Navigate to site
      enterSite(site)
    }
    
    // 8. Create OK callback (initiates movement)
    const okFunc = () => {
      console.log('[MapPanelContent] okFunc called - initiating movement', {
        startPos,
        endPos,
        distance,
        fuelNeed,
        canAfford,
        time,
        weatherSpeedMultiplier
      })
      
      // Set moving state
      playerStore.setIsMoving(true)
      console.log('[MapPanelContent] Set isMoving = true')
      
      // Highlight site (TODO: Implement site highlighting)
      
      // Accelerate time during travel
      // Animation always takes 3 real seconds, but game time should advance by calculated amount
      // So we accelerate the game time to pass in 3 real seconds
      const TRAVEL_ANIMATION_DURATION = 3 // Always 3 real seconds for animation
      console.log('[MapPanelContent] Accelerating time:', { 
        gameTime: time, 
        realTime: TRAVEL_ANIMATION_DURATION,
        timeScale: time / TRAVEL_ANIMATION_DURATION
      })
      
      // Get TimeManager from game and accelerate time
      const timeManager = game.getTimeManager()
      if (timeManager) {
        // Accelerate game time to pass in 3 real seconds
        // time: game time duration (in game seconds)
        // TRAVEL_ANIMATION_DURATION: real-world time (in real seconds)
        timeManager.accelerate(time, TRAVEL_ANIMATION_DURATION, true)
        console.log('[MapPanelContent] Time acceleration applied:', { 
          gameTime: time, 
          realTime: TRAVEL_ANIMATION_DURATION,
          expectedTimeScale: time / TRAVEL_ANIMATION_DURATION
        })
      } else {
        console.warn('[MapPanelContent] TimeManager not available')
      }
      
      // Draw path line (TODO: Implement path line)
      // makeLine(startPos, endPos)
      
      // Calculate animation velocity for constant 3-second movement
      // Animation always takes 3 seconds regardless of distance
      const ANIMATION_DURATION = 3 // seconds
      const animationVelocity = distance / ANIMATION_DURATION
      console.log('[MapPanelContent] Calculated animation velocity (3s constant):', animationVelocity)
      playerStore.setActorMaxVelocity(animationVelocity)
      
      // Set target position (triggers movement animation via useActorMovement hook)
      console.log('[MapPanelContent] Setting target position:', endPos)
      playerStore.setActorTargetPos(endPos)
      
      // Store completion callback (called by useActorMovement when movement finishes)
      console.log('[MapPanelContent] Setting movement completion callback')
      playerStore.setActorMovementCallback(handleMovementComplete)
      
      // Verify state was set
      const verifyState = usePlayerStore.getState()
      console.log('[MapPanelContent] State after setup:', {
        isMoving: verifyState.isMoving,
        actorTargetPos: verifyState.actorTargetPos,
        actorMaxVelocity: verifyState.actorMaxVelocity,
        hasCallback: !!verifyState.actorMovementCallback
      })
    }
    
    // 9. Create cancel callback
    const cancelFunc = () => {
      // Unhighlight site (TODO: Implement site highlighting)
    }
    
    // 10. Show dialog
    const isHome = site.id === HOME_SITE
    uiStore.showOverlay('siteDialog', {
      site,
      time,
      fuelNeed,
      canAfford,
      onConfirm: okFunc,
      onCancel: cancelFunc,
      isHome
    })
  }

  // Convert Cocos Y to CSS Y (map uses Cocos coordinates relative to map background)
  // Map background is larger than content area, but we use content area for visible portion
  const cocosToCssYMap = (cocosY: number): number => {
    // Map coordinates are relative to map background (which is larger than screen)
    // For now, use content area height as reference
    // In original: MapView is scrollable, but for initial implementation we use content area
    return cocosToCssY(cocosY, contentHeight)
  }

  // Render map content
  if (!map) {
    return (
      <div className="text-center p-8 text-white">
        <p>Map not initialized</p>
        <button
          onClick={() => {
            playerStore.setLocation({ isAtHome: true, isAtBazaar: false, isAtSite: false, siteId: null })
            uiStore.setScene('main')
            uiStore.openPanelAction('home')
          }}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div 
      className="relative w-full h-full"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Map background - spans bottom bar content area */}
      {/* Original: map_bg_new.png, anchor (0, 0), fills MapView container */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: -1
        }}
      >
        <Sprite
          atlas="ui"
          frame="map_bg_new.png"
          className="w-full h-full object-cover"
          style={{
            width: '100%',
            height: '100%'
          }}
        />
        {/* Weather overlay - shown when weather is not 0 (not CLOUDY/Clear) */}
        {/* Original: weather_{id}.png, anchor (0, 0), added as child of bg sprite */}
        {weatherId !== 0 && (
          <Sprite
            atlas="ui"
            frame={`weather_${weatherId}.png`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              width: '100%',
              height: '100%'
            }}
          />
        )}
      </div>

      {/* Map content - sites and player */}
      {/* Original: Actor and Entity list are children of MapView container */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          pointerEvents: 'auto'
        }}
      >
        {/* Player actor (current position) */}
        {/* Original: Actor extends cc.Node, anchor (0.5, 0.5), positioned at player.map.pos */}
        {actorPos && (
          <div
            className="absolute"
            style={{
              left: `${actorPos.x}px`,
              top: `${cocosToCssYMap(actorPos.y)}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              pointerEvents: 'none'  // Allow clicks to pass through to sites
            }}
          >
            <Sprite
              atlas="gate"
              frame="map_actor.png"
              style={{
                width: '32px',
                height: '32px'
              }}
            />
          </div>
        )}

        {/* Sites */}
        {/* Original: Entity extends Button, anchor (0.5, 0.5), positioned at baseSite.pos */}
        {sites.map((site) => {
          const sitePos = site.pos || { x: 0, y: 0 }
          const isHome = site.id === HOME_SITE
          
          return (
            <button
              key={`site-${site.id}`}
              onClick={() => handleSiteClick(site)}
              className="absolute cursor-pointer"
              style={{
                left: `${sitePos.x}px`,
                top: `${cocosToCssYMap(sitePos.y)}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
                background: 'transparent',
                border: 'none',
                padding: 0
              }}
              title={site.getName()}
            >
              {/* Site background */}
              {/* Original: site_big_bg.png for HOME_SITE, site_bg.png for others, scale 0.8 */}
              <Sprite
                atlas="site"
                frame={isHome ? "site_big_bg.png" : "site_bg.png"}
                style={{
                  width: isHome ? '80px' : '60px',
                  height: isHome ? '80px' : '60px',
                  transform: 'scale(0.8)'
                }}
              />
              
              {/* Site icon */}
              {/* Original: site_{id}.png or npc_{id}.png, scale 0.8, centered on bg */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Sprite
                  atlas="site"
                  frame={`site_${site.id}.png`}
                  style={{
                    width: '40px',
                    height: '40px',
                    transform: 'scale(0.8)'
                  }}
                />
              </div>
            </button>
          )
        })}

        {/* NPCs */}
        {/* Original: Entity extends Button, anchor (0.5, 0.5), positioned at npc.pos, uses npc_{id}.png */}
        {npcs.map((npc) => {
          const npcPos = npc.pos || { x: 0, y: 0 }
          
          return (
            <button
              key={`npc-${npc.id}`}
              onClick={() => handleNPCClick(npc.id)}
              className="absolute cursor-pointer"
              style={{
                left: `${npcPos.x}px`,
                top: `${cocosToCssYMap(npcPos.y)}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
                background: 'transparent',
                border: 'none',
                padding: 0
              }}
              title={npc.getName()}
            >
              {/* NPC background */}
              {/* Original: site_bg.png (same as sites), scale 0.8 */}
              <Sprite
                atlas="site"
                frame="site_bg.png"
                style={{
                  width: '60px',
                  height: '60px',
                  transform: 'scale(0.8)'
                }}
              />
              
              {/* NPC icon */}
              {/* Original: npc_{id}.png, scale 0.8, centered on bg */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Sprite
                  atlas="npc"
                  frame={`npc_${npc.id}.png`}
                  style={{
                    width: '40px',
                    height: '40px',
                    transform: 'scale(0.8)'
                  }}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

