/**
 * MainScene Component
 * Main game scene with TopSection and BottomSection
 * Ported from OriginalGame/src/ui/MainScene.js
 * 
 * Structure matches original:
 * - TopFrame (TopSection) at z-index 1
 * - BottomFrame (BottomSection) with current panel at z-index 0
 */

import { useEffect } from 'react'
import { TopSection } from '@/components/layout/TopSection'
import { BottomSection } from '@/components/layout/BottomSection'
import { HomePanelContent } from '@/components/panels/HomePanelContent'
import { BuildPanelContent } from '@/components/panels/BuildPanelContent'
import { StoragePanelContent } from '@/components/panels/StoragePanelContent'
import { RadioPanelContent } from '@/components/panels/RadioPanelContent'
import { GatePanelContent } from '@/components/panels/GatePanelContent'
import { GateOutPanelContent } from '@/components/panels/GateOutPanelContent'
import { MapPanelContent } from '@/components/panels/MapPanelContent'
import { SitePanelContent, getSiteBottomBarProps } from '@/components/panels/site/SitePanelContent'
import { SiteStoragePanelContent } from '@/components/panels/SiteStoragePanelContent'
import { SiteExploreContent } from '@/components/panels/site/SiteExploreContent'
import { useUIStore } from '@/store/uiStore'
import { usePlayerStore } from '@/store/playerStore'
import { useBuildingStore } from '@/store/buildingStore'
import { audioManager, MusicPaths, SoundPaths } from '@/game/systems/AudioManager'
import { game } from '@/game/Game'
import { saveAll } from '@/game/systems/SaveSystem'

export function MainScene() {
  const uiStore = useUIStore()
  const buildingStore = useBuildingStore()
  const playerStore = usePlayerStore() // Subscribe to playerStore changes
  const currentPanel = uiStore.openPanel
  
  // Screen dimensions (640x1136 from original game)
  const screenWidth = 640
  const screenHeight = 1136
  
  // Initialize to home panel if none open (matches Navigation.current() behavior)
  useEffect(() => {
    if (!currentPanel) {
      uiStore.openPanelAction('home')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount
  
  // Play home music when entering main scene (matches Navigation music logic)
  // Home, Build, Storage, Gate, Radio panels all use HOME music
  useEffect(() => {
    if (currentPanel === 'home' || 
        currentPanel === 'build' || 
        currentPanel === 'storage' || 
        currentPanel === 'gate' ||
        currentPanel === 'radio') {
      audioManager.playMusic(MusicPaths.HOME, true)
    }
  }, [currentPanel])
  
  // Stop music when leaving main scene (matches Navigation.stopMusic())
  useEffect(() => {
    return () => {
      audioManager.stopMusic()
    }
  }, [])

  // Game loop - update game every frame
  useEffect(() => {
    // Ensure game is initialized and resumed
    game.initialize()
    game.resume()
    
    let lastTime = performance.now()
    let animationFrameId: number
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000 // Convert to seconds
      lastTime = currentTime
      
      // Update game systems (time, survival, etc.)
      game.update(deltaTime)
      
      // Continue loop
      animationFrameId = requestAnimationFrame(gameLoop)
    }
    
    // Start game loop
    animationFrameId = requestAnimationFrame(gameLoop)
    
    // Cleanup on unmount
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])
  
  // Handle back button - matches original back button behavior
  const handleBackButton = () => {
    console.log('[MainScene] handleBackButton called', { currentPanel, isInWorkStorageView: uiStore.isInWorkStorageView, hasFlushFunction: !!uiStore.workStorageFlushFunction })
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/39f2a772-061a-4dd3-bf94-6d4f18e3a9a9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MainScene.tsx:100',message:'handleBackButton called',data:{currentPanel,isInWorkStorageView:uiStore.isInWorkStorageView,hasFlushFunction:!!uiStore.workStorageFlushFunction},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch((err)=>{console.error('[MainScene] Log fetch failed:', err)});
    // #endregion
    try {
      if (currentPanel === 'home') {
      // On home panel, back button should show exit dialog
      // For now, just log (exit dialog to be implemented later)
      console.log('Exit to menu - dialog to be implemented')
    } else if (currentPanel === 'gate') {
      // When leaving Gate panel, transfer all items from bag to storage
      const playerStore = usePlayerStore.getState()
      const bagItems = { ...playerStore.bag }
      
      // Transfer all items from bag to storage
      Object.entries(bagItems).forEach(([itemId, count]) => {
        if (count > 0) {
          playerStore.addItemToStorage(itemId, count)
          playerStore.removeItemFromBag(itemId, count)
        }
      })
      
      // Navigate back to home
      uiStore.openPanelAction('home')
    } else if (currentPanel === 'site') {
      // When at a site, navigate back to map (not home)
      // This matches the navigation flow: Home → Map → Site → (back) → Map
      uiStore.openPanelAction('map')
    } else if (currentPanel === 'siteStorage') {
      // When at site storage, navigate back to site panel
      const siteId = uiStore.siteStoragePanelSiteId
      if (siteId) {
        uiStore.openPanelAction('site', undefined, siteId)
      } else {
        uiStore.openPanelAction('map')
      }
    } else if (currentPanel === 'siteExplore') {
      const isInWorkStorage = uiStore.isInWorkStorageView
      const siteId = uiStore.siteExplorePanelSiteId
      console.error('[MainScene] ===== BACK BUTTON IN SITEEXPLORE =====')
      console.log('[MainScene] Back button clicked in siteExplore panel', {
        isInWorkStorageView: isInWorkStorage,
        siteId: siteId,
        timestamp: Date.now()
      })
      
      // Get site to check secret room state
      let site = null
      if (siteId && playerStore.map) {
        site = playerStore.map.getSite(siteId)
      }
      
      
      // ALWAYS clear secret room state when leaving siteExplore (safety net)
      // This ensures state is cleared regardless of which navigation path is taken
      if (site) {
        const hasSecretRoomState = site.isInSecretRooms || site.isSecretRoomsEntryShowed || (site.secretRoomsShowedCount > 0 && site.secretRooms.length > 0 && !site.isSecretRoomsEnd())
        console.error('[MainScene] ALWAYS CLEAR: Checking secret room state:', {
          isInSecretRooms: site.isInSecretRooms,
          isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
          secretRoomsShowedCount: site.secretRoomsShowedCount,
          hasSecretRoomState
        })
        
        if (hasSecretRoomState) {
          console.error('[MainScene] ALWAYS CLEAR: Clearing secret room state!')
          site.secretRoomsEnd()
          site.isSecretRoomsEntryShowed = false
          
          if (site.secretRoomsConfig) {
            const maxCount = Number.parseInt(site.secretRoomsConfig.maxCount)
            site.secretRoomsShowedCount = maxCount
          }
          
          
          saveAll().catch((err: Error) => {
            console.error('[MainScene] Auto-save failed in ALWAYS CLEAR:', err)
          })
        }
      }
      
      // Check if we're in work storage view - if so, handle work storage back
      if (uiStore.isInWorkStorageView) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/39f2a772-061a-4dd3-bf94-6d4f18e3a9a9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MainScene.tsx:179',message:'Back button clicked in work storage view',data:{siteId,isInWorkStorageView:uiStore.isInWorkStorageView,hasFlushFunction:!!uiStore.workStorageFlushFunction},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.log('[MainScene] In work storage view, handling work storage back')
        
        // Call flush function BEFORE clearing flag and navigating
        if (uiStore.workStorageFlushFunction) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/39f2a772-061a-4dd3-bf94-6d4f18e3a9a9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MainScene.tsx:190',message:'Calling flush function from MainScene',data:{source:'MainScene'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          uiStore.workStorageFlushFunction()
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/39f2a772-061a-4dd3-bf94-6d4f18e3a9a9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MainScene.tsx:193',message:'Flush function called from MainScene, clearing flag',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/39f2a772-061a-4dd3-bf94-6d4f18e3a9a9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MainScene.tsx:191',message:'WARNING: No flush function available',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          console.warn('[MainScene] No flush function available when clicking back from work storage')
        }
        
        // Clear the flag and flush function
        uiStore.setWorkStorageView(false)
        uiStore.setWorkStorageFlushFunction(null)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/39f2a772-061a-4dd3-bf94-6d4f18e3a9a9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MainScene.tsx:197',message:'Cleared flags, navigating to site panel',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.log('[MainScene] Work room back - flushed items, cleared flag, navigating to site panel')
        
        // Navigate back to site panel
        if (siteId) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/39f2a772-061a-4dd3-bf94-6d4f18e3a9a9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MainScene.tsx:203',message:'Navigating to site panel',data:{siteId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          uiStore.openPanelAction('site', undefined, siteId)
        } else {
          uiStore.openPanelAction('map')
        }
      } else {
        // Check secret room condition step by step
        const condition1 = site?.isInSecretRooms
        const condition2 = site?.isSecretRoomsEntryShowed
        const condition3a = (site?.secretRoomsShowedCount ?? 0) > 0
        const condition3b = (site?.secretRooms?.length ?? 0) > 0
        const condition3c = site ? !site.isSecretRoomsEnd() : false
        const condition3 = condition3a && condition3b && condition3c
        const conditionMet = condition1 || condition2 || condition3
        
        
        if (site && conditionMet) {
          // Handle secret room back - matches original game behavior
          // This handles: currently in secret rooms, entry dialog shown, or previously entered secret rooms
          console.log('[MainScene] ===== SECRET ROOM BACK BUTTON CLICKED =====')
          console.log('[MainScene] Secret room state BEFORE clearing:', {
            isInSecretRooms: site.isInSecretRooms,
            isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
            secretRoomsShowedCount: site.secretRoomsShowedCount,
            secretRoomsStep: site.secretRoomsStep,
            secretRoomsLength: site.secretRooms.length,
            hasSecretRoomsConfig: !!site.secretRoomsConfig,
            conditionMet: site.isInSecretRooms || site.isSecretRoomsEntryShowed || (site.secretRoomsShowedCount > 0 && site.secretRooms.length > 0)
          })
          
          
          // End secret rooms and clear entry flag (prevents re-entry)
          // This matches original game: once you leave secret rooms, you can't re-enter
          const beforeSecretRoomsEnd = {
            isInSecretRooms: site.isInSecretRooms,
            isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed
          }
          site.secretRoomsEnd()
          const afterSecretRoomsEnd = {
            isInSecretRooms: site.isInSecretRooms,
            isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed
          }
          console.log('[MainScene] After secretRoomsEnd():', {
            before: beforeSecretRoomsEnd,
            after: afterSecretRoomsEnd
          })
          
          // Clear entry flag
          site.isSecretRoomsEntryShowed = false
          
          // Prevent re-discovery by setting showedCount to maxCount
          // This ensures that once you leave secret rooms, you can't re-enter them
          if (site.secretRoomsConfig) {
            const maxCount = Number.parseInt(site.secretRoomsConfig.maxCount)
            const oldCount = site.secretRoomsShowedCount
            site.secretRoomsShowedCount = maxCount
            console.log('[MainScene] Prevented re-discovery by setting secretRoomsShowedCount:', {
              oldCount,
              newCount: site.secretRoomsShowedCount,
              maxCount
            })
          }
          
          console.log('[MainScene] After clearing flags and preventing re-discovery:', {
            isInSecretRooms: site.isInSecretRooms,
            isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
            secretRoomsShowedCount: site.secretRoomsShowedCount
          })
          
          
          // Auto-save to persist the state
          console.log('[MainScene] Starting auto-save to persist secret room state...')
          saveAll()
            .then(() => {
              console.log('[MainScene] Auto-save completed. Secret room state after save:', {
                isInSecretRooms: site.isInSecretRooms,
                isSecretRoomsEntryShowed: site.isSecretRoomsEntryShowed,
                secretRoomsShowedCount: site.secretRoomsShowedCount
              })
            })
            .catch((err: Error) => {
              console.error('[MainScene] Auto-save failed:', err)
            })
          
          console.log('[MainScene] ===== SECRET ROOM BACK PROCESSING COMPLETE =====')
          
          // Navigate back to site panel
          if (siteId) {
            uiStore.openPanelAction('site', undefined, siteId)
          } else {
            uiStore.openPanelAction('map')
          }
        } else {
          // Normal site explore back - but still check for secret rooms to clear state
          console.log('[MainScene] Normal back navigation, checking for secret rooms to clear')
          
          // Always clear secret room state when leaving siteExplore, even if condition didn't match
          // This ensures state is cleared regardless of which path we take
          if (site) {
            const condition1 = site.isInSecretRooms
            const condition2 = site.isSecretRoomsEntryShowed
            const condition3a = site.secretRoomsShowedCount > 0
            const condition3b = site.secretRooms.length > 0
            const condition3c = !site.isSecretRoomsEnd()
            const condition3 = condition3a && condition3b && condition3c
            const hasSecretRoomState = condition1 || condition2 || condition3
            
            
            if (hasSecretRoomState) {
              console.log('[MainScene] Clearing secret room state in normal back path')
              site.secretRoomsEnd()
              site.isSecretRoomsEntryShowed = false
              
              if (site.secretRoomsConfig) {
                const maxCount = Number.parseInt(site.secretRoomsConfig.maxCount)
                site.secretRoomsShowedCount = maxCount
              }
              
              saveAll().catch((err: Error) => {
                console.error('[MainScene] Auto-save failed in normal back path:', err)
              })
            }
          }
          
          if (siteId) {
            uiStore.openPanelAction('site', undefined, siteId)
          } else {
            uiStore.openPanelAction('map')
          }
        }
      }
    } else {
      // Navigate back to home (matches Navigation.back() behavior)
      uiStore.openPanelAction('home')
    }
    } catch (error) {
      console.error('[MainScene] Error in handleBackButton:', error)
    }
  }
  
  // Render current panel based on openPanel state
  // Matches Navigation.current() behavior
  const renderPanel = () => {
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
          const playerStore = usePlayerStore.getState()
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
          const playerStore = usePlayerStore.getState()
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
                  currentSite.isSecretRoomsEntryShowed = false
                  
                  if (currentSite.secretRoomsConfig) {
                    const maxCount = Number.parseInt(currentSite.secretRoomsConfig.maxCount)
                    currentSite.secretRoomsShowedCount = maxCount
                  }
                  
                  saveAll().catch((err: Error) => {
                    console.error('[MainScene] Auto-save failed in onBack wrapper:', err)
                  })
                }
                
                uiStore.openPanelAction('site', undefined, siteId)
              };
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
      
      default:
        // Default to home (matches Navigation.current() default)
        return <HomePanelContent />
    }
  }
  
  // Determine panel title (from original BottomFrameNode uiConfig)
  const getPanelTitle = (): string => {
    switch (currentPanel) {
      case 'home': return ''
      case 'build': {
        const buildingId = uiStore.buildPanelBuildingId
        if (buildingId) {
          const building = buildingStore.getBuilding(buildingId)
          return building && buildingStore.room
            ? buildingStore.room.getBuildCurrentName(buildingId)
            : 'Building'
        }
        return 'Building'
      }
      case 'storage': {
        // Get building 13 (Storage Shelf) name
        const building = buildingStore.getBuilding(13)
        return building && buildingStore.room
          ? buildingStore.room.getBuildCurrentName(13)
          : 'Storage'
      }
      case 'radio': {
        // Get building 15 (Radio) name
        const building = buildingStore.getBuilding(15)
        return building && buildingStore.room
          ? buildingStore.room.getBuildCurrentName(15)
          : 'Radio'
      }
      case 'gate': {
        // Get building 14 (Gate) name
        const building = buildingStore.getBuilding(14)
        return building && buildingStore.room
          ? buildingStore.room.getBuildCurrentName(14)
          : 'Gate'
      }
      case 'site': {
        // Get site name for site panel
        const siteId = uiStore.sitePanelSiteId
        if (siteId) {
          const playerStore = usePlayerStore.getState()
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
          const playerStore = usePlayerStore.getState()
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
          const playerStore = usePlayerStore.getState()
          const map = playerStore.map
          if (map) {
            const site = map.getSite(siteId)
            if (site) {
              // Show secret room title when in secret rooms (matches original game String 3012[secretRoomType])
              if (site.isInSecretRooms) {
                return `Secret Room ${site.secretRoomType ?? 0}`
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
      default: return ''
    }
  }
  
  // Get site bottom bar props (progress and item count) for site panel
  const getSiteBottomBarSubtexts = () => {
    if (currentPanel !== 'site' && currentPanel !== 'siteExplore' && currentPanel !== 'siteStorage') {
      return { leftSubtext: undefined, rightSubtext: undefined }
    }
    
    let siteId: number | null = null
    if (currentPanel === 'site') {
      siteId = uiStore.sitePanelSiteId
    } else if (currentPanel === 'siteExplore') {
      siteId = uiStore.siteExplorePanelSiteId
    } else if (currentPanel === 'siteStorage') {
      siteId = uiStore.siteStoragePanelSiteId
    }
    
    if (siteId) {
      const map = playerStore.map
      if (map) {
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
    }
    
    return { leftSubtext: undefined, rightSubtext: undefined }
  }
  
  // Determine if back button should be shown (from original uiConfig.leftBtn)
  const shouldShowBackButton = (): boolean => {
    // Gate out panel has no buttons
    if (currentPanel === 'gateOut') return false
    // Map panel has no buttons (matches original uiConfig.leftBtn: false)
    if (currentPanel === 'map') return false
    
    // Disable back button during battle (matches original game behavior)
    if (currentPanel === 'siteExplore') {
      const isInBattle = uiStore.isInBattle
      if (isInBattle) {
        return false // Disable back button during battle
      }
    }
    
    // Show back button if not on home panel
    return currentPanel !== 'home' && currentPanel !== null
  }
  
  // Determine if forward button should be shown (from original uiConfig.rightBtn)
  const shouldShowForwardButton = (): boolean => {
    // Gate out panel has no buttons
    if (currentPanel === 'gateOut') return false
    // Map panel has no buttons (matches original uiConfig.rightBtn: false)
    if (currentPanel === 'map') return false
    // Gate panel has forward button (Go Out)
    return currentPanel === 'gate'
  }
  
  // Handle forward button click
  const handleForwardButton = () => {
    if (currentPanel === 'gate') {
      // Gate panel: Go Out
      const playerStore = usePlayerStore.getState()
      playerStore.out()
      
      // Play FOOT_STEP sound
      audioManager.playEffect(SoundPaths.FOOT_STEP)
      
      // Call deleteUnusableSite if map exists
      // Note: Map should always be initialized in new game, but check for safety
      let map = playerStore.map
      if (!map) {
        // Edge case: Map not initialized (shouldn't happen in new game)
        // Initialize map if missing (defensive programming)
        console.warn('Map is null, initializing map...')
        playerStore.initializeMap()
        map = playerStore.map
      }
      if (map) {
        map.deleteUnusableSite()
      }
      
      // Navigate to gate out panel (transition)
      // Gate out panel will auto-navigate to map after 3 seconds
      uiStore.openPanelAction('gateOut')
    }
  }
  
  return (
    <div
      data-test-id="mainscene-container"
      className="relative"
      style={{
        width: `${screenWidth}px`,
        height: `${screenHeight}px`,
        margin: '0 auto',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        backgroundColor: '#000000' // Black background like original game
      }}
    >
      {/* TopFrame (TopSection) - z-index 1, always visible */}
      <TopSection />
      
      {/* BottomFrame (BottomSection) - z-index 0, contains current panel */}
      <BottomSection
        title={getPanelTitle()}
        leftBtn={shouldShowBackButton()}
        rightBtn={shouldShowForwardButton()}
        onLeftClick={handleBackButton}
        onRightClick={handleForwardButton}
        fullScreen={currentPanel === 'home' || currentPanel === 'gateOut' || currentPanel === 'map'} // Home, gate out, and map panels use fullScreen mode
        {...getSiteBottomBarSubtexts()}
      >
        {renderPanel()}
      </BottomSection>
    </div>
  )
}



