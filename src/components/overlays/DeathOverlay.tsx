/**
 * DeathOverlay Component
 * Overlay that positions itself over the BottomBar element
 * Ported from OriginalGame/src/ui/deathNode.js
 * 
 * This overlay positions itself relative to the BottomBar element,
 * matching its exact position and dimensions.
 */

import { useState, useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { usePlayerStore } from '@/store/playerStore'
import { useBuildingStore } from '@/store/buildingStore'
import { game } from '@/game/Game'
import type { DeathReason } from '@/types/game.types'
import { Sprite } from '@/components/sprites/Sprite'

interface DeathOverlayProps {
  reason: DeathReason
}

export function DeathOverlay({ reason }: DeathOverlayProps) {
  const uiStore = useUIStore()
  const playerStore = usePlayerStore()
  const buildingStore = useBuildingStore()
  const [bottomBarRect, setBottomBarRect] = useState<DOMRect | null>(null)

  // Get BottomBar position dynamically
  useEffect(() => {
    const updatePosition = () => {
      const bottomBar = document.querySelector('[data-test-id="bottombar-bg"]')
      if (bottomBar) {
        const rect = bottomBar.getBoundingClientRect()
        // Only update state if rect actually changed (prevents unnecessary re-renders)
        setBottomBarRect((prev) => {
          if (!prev || 
              prev.x !== rect.x || 
              prev.y !== rect.y || 
              prev.width !== rect.width || 
              prev.height !== rect.height) {
            return rect
          }
          return prev
        })
      }
    }
    
    // Initial update
    updatePosition()
    
    // Update on resize
    window.addEventListener('resize', updatePosition)
    
    // Update periodically in case BottomBar moves (e.g., during transitions)
    // Use a longer interval to reduce re-renders (1000ms instead of 100ms)
    const interval = setInterval(updatePosition, 1000)
    
    return () => {
      window.removeEventListener('resize', updatePosition)
      clearInterval(interval)
    }
  }, [])

  // Death description (from original: "You have finally fallen after surviving for %s")
  // Note: reason is available but original game doesn't show different messages per reason
  void reason // Suppress unused warning
  
  // Get time directly from TimeManager to ensure it's current
  // The store might not be updated if game loop isn't running
  const timeManager = game.getTimeManager()
  const timeFormat = timeManager.formatTime()
  const day = timeFormat.d || 0
  
  // Format description similar to original: "You have finally fallen after surviving for X day(s)"
  const description = `You have finally fallen after surviving for ${day + 1} day${day !== 0 ? 's' : ''}.`

  const handleRevive = () => {
    // TODO: Check for First Aid Kit (FAK) item ID 1106054
    // For now, just revive without item check
    
    // Reset player attributes (relive function from original)
    playerStore.updateAttribute('spirit', playerStore.spiritMax)
    playerStore.updateAttribute('starve', playerStore.starveMax)
    playerStore.updateAttribute('vigour', playerStore.vigourMax)
    playerStore.updateAttribute('injury', 0)
    playerStore.updateAttribute('infect', 0)
    playerStore.updateAttribute('water', playerStore.waterMax)
    playerStore.updateAttribute('virus', Math.ceil(playerStore.virus / 2)) // Reduce virus by half
    playerStore.updateAttribute('hp', playerStore.hpMax)

    // Reset sleep state (Original: this.isInSleep = false)
    const survivalSystem = game.getSurvivalSystem()
    survivalSystem.endSleep()

    // Reset all building active button indices (Original: this.room.forEach(function (build) { build.resetActiveBtnIndex(); }))
    const room = buildingStore.room
    if (room) {
      const allBuildings = room.getAllBuildings()
      allBuildings.forEach(building => {
        building.resetActiveBtnIndex()
      })
    }

    // Resume game BEFORE hiding overlay to ensure time continues
    // Force resume by calling multiple times if needed (pause uses ref counter)
    const timeManager = game.getTimeManager()
    while (timeManager.isPaused()) {
      game.resume()
    }

    // Hide overlay and go home
    uiStore.hideOverlay()
    uiStore.openPanelAction('home')
  }

  const handleConfirm = () => {
    // Navigate to menu scene (EndScene in original)
    uiStore.hideOverlay()
    uiStore.setScene('menu')
    game.pause()
  }
  
  // Check for First Aid Kit (FAK) - item ID 1106054
  const RELIVE_ITEMID = '1106054'
  const fakCount = playerStore.getBagItemCount(RELIVE_ITEMID) + 
                   playerStore.getStorageItemCount(RELIVE_ITEMID) + 
                   playerStore.getSafeItemCount(RELIVE_ITEMID)
  
  const hasFak = fakCount > 0

  // Panel dimensions (matching BottomFrameNode from original)
  // screenFix: 0 = normal, 1 = scaled (0.87)
  const screenFix: number = 0 // TODO: Get from settings
  const bgScale = screenFix === 1 ? 0.87 : 1.0
  // Original: bg.height = 834px (from frame_bg_bottom.png)
  // But contentTopLineHeight = 770, actionBarBaseHeight = 803
  // So bgHeight should be at least 834px to accommodate these
  const bgHeight = 834 * bgScale
  const bgWidth = 596 * bgScale
  const contentTopLineHeight = 770 * bgScale // Line separator position from bottom
  const actionBarBaseHeight = 803 * bgScale // Title/buttons position from bottom

  // Don't render if BottomBar not found
  if (!bottomBarRect) {
    // Return a placeholder that will update once BottomBar is found
    // This ensures the overlay is in the DOM and will update when bottomBarRect is set
    return (
      <div
        className="fixed z-[9999]"
        style={{
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          pointerEvents: 'auto'
        }}
        data-test-id="death-overlay-loading"
      >
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <>
      {/* Full-screen blocking layer to hardlock the game - prevents all interactions */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          pointerEvents: 'auto',
          animation: 'fadeIn 0.3s ease-in'
        }}
        data-test-id="death-overlay-blocker"
      />
      {/* Death overlay panel */}
      <div
        className="fixed z-[9999]"
        style={{
          left: `${bottomBarRect.left}px`,
          top: `${bottomBarRect.top}px`,
          width: `${bottomBarRect.width}px`,
          height: `${bottomBarRect.height}px`,
          animation: 'fadeIn 0.3s ease-in',
          pointerEvents: 'auto'
        }}
        data-test-id="death-overlay"
      >
      {/* Dark background overlay covering BottomBar area */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 1)',
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Panel positioned to match BottomBar */}
      <div
        className="relative"
        style={{
          width: `${bgWidth}px`,
          height: `${bgHeight}px`,
          position: 'relative'
        }}
      >
        {/* Panel background frame */}
        <div
          className="absolute inset-0"
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          <Sprite
            atlas="ui"
            frame="frame_bg_bottom.png"
            className="block w-full h-full"
            style={{
              width: `${bgWidth}px`,
              height: `${bgHeight}px`
            }}
          />
        </div>

        {/* Title bar line - positioned from bottom of bg */}
        {/* Original: setPosition(bgRect.width / 2, contentTopLineHeight) with anchor (0.5, 0.5) */}
        {/* Cocos Y = 770 from bottom, CSS top = bgHeight - 770 - lineHeight/2 */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: `${bgHeight - contentTopLineHeight }px`, // From bottom: 770px
            transform: 'translateX(-50%)',
            width: '100%'
          }}
        >
          <Sprite
            atlas="ui"
            frame="frame_line.png"
            className="block"
          />
        </div>

        {/* Title - positioned from bottom of bg */}
        {/* Original: setPosition(bgRect.width / 2, actionBarBaseHeight) with anchor (0.5, 0.5) */}
        {/* Cocos Y = 803 from bottom, CSS top = bgHeight - 803 - titleHeight/2 */}
        <div
          className="absolute text-white text-center"
          style={{
            left: '50%',
            top: `${bgHeight - actionBarBaseHeight + 5}px`, // From bottom: 803px
            transform: 'translate(-50%, -50%)', // Center vertically too
            fontSize: '18px',
            fontFamily: "'Noto Sans', sans-serif",
            fontWeight: 'bold'
          }}
        >
          Dying
        </div>

        {/* Content area - all elements positioned relative to bg (Cocos coordinate system) */}
        {/* Original: all children added to this.bg, positioned relative to bgRect */}
        {/* Cocos: origin at bottom-left (0,0), Y increases upward */}
        {/* CSS: origin at top-left (0,0), Y increases downward */}
        {/* Conversion: cssTop = bgHeight - cocosY - elementHeight (for anchor.y = 0) */}
        
        {/* Death sprite - Original: setPosition(bgRect.width / 2, contentTopLineHeight - 10) with anchor (0.5, 1) */}
        {/* Cocos: center X, Y = 760 from bottom, anchor top edge */}
        {/* CSS: left: 50%, top: bgHeight - 760, transform: translateX(-50%) */}
        {/* Sprite dimensions from plist: sourceSize {526,230}, rotated: true */}
        <div
          className="absolute"
          style={{
            top: `${bgHeight - (contentTopLineHeight - 30)}px`, // 760px from bottom = bgHeight - 760 from top
            transform: 'translateX(7%)'
          }}
        >
          <Sprite
            atlas="ui"
            frame="dig_death.png"
            className="block"
            style={{ 
              width: 'auto', 
              height: 'auto'
            }}
          />
        </div>

        {/* Description text - Original: setPosition(bgRect.width / 2, digDes.y - digDes.height - 10) with anchor (0.5, 1) */}
        {/* Positioned below death sprite, we'll use marginTop for spacing */}
        <div
          className="absolute text-white text-center"
          style={{
            left: '50%',
            top: `${bgHeight - (contentTopLineHeight - 10) + 300}px`, // Approximate: below sprite
            transform: 'translateX(-50%)',
            width: `${bgWidth - 80}px`, // rightEdge - leftEdge = width - 40 - 40
            fontSize: '16px',
            fontFamily: "'Noto Sans', sans-serif",
            lineHeight: '1.5'
          }}
        >
          {description}
        </div>

        {/* Buttons - Original: setPosition(bgRect.width / 2, 100) with anchor (0.5, 0.5) */}
        {/* Cocos: center X, Y = 100 from bottom, anchor center */}
        {/* CSS: left: 50%, bottom: 100px, transform: translateX(-50%) */}
        {/* If no FAK: btn2 at width/4, btn1 at width/4*3 */}
        <div 
          className="absolute flex gap-4 items-center"
          style={{ 
            left: hasFak ? '50%' : 'auto',
            right: hasFak ? 'auto' : 'auto',
            bottom: '100px', // 100px from bottom of bg
            transform: hasFak ? 'translateX(-50%)' : 'none',
            width: hasFak ? 'auto' : `${bgWidth}px`
          }}
        >
          {/* Revive button */}
          <div 
            className="flex flex-col items-center"
            style={{
              position: 'relative',
              left: hasFak ? '0' : `${bgWidth / 4 * 3}px`, // If no FAK, at 3/4 width
              transform: hasFak ? 'none' : 'translateX(-50%)'
            }}
          >
            <button
              onClick={handleRevive}
              className="relative cursor-pointer border-none bg-transparent p-0"
              style={{
                width: '120px',
                height: '50px'
              }}
              data-test-id="death-revive-btn"
            >
              <Sprite
                atlas="ui"
                frame="btn_common_white_normal.png"
                className="w-full h-full block"
              />
              <div
                className="absolute inset-0 flex items-center justify-center text-black"
                style={{
                  fontSize: '16px',
                  fontFamily: "'Noto Sans', sans-serif",
                  fontWeight: 'bold',
                  pointerEvents: 'none'
                }}
              >
                Revive
              </div>
            </button>
            {/* FAK count label - Original: label.y = btn1.y + btn1.height / 2 + 10 with anchor (0.5, 0) */}
            {/* Positioned above button: bottom = 100 + 25 + 10 = 135px from bottom */}
            <div
              className="absolute text-white text-center"
              style={{
                left: '50%',
                bottom: '-30px', // Button center (100 + 25) + 10px above
                transform: 'translateX(-50%)',
                fontSize: '14px',
                fontFamily: "'Noto Sans', sans-serif",
                whiteSpace: 'nowrap'
              }}
            >
              {fakCount} FAK in stock
            </div>
          </div>

          {/* Confirm/Quit button - only show if no FAK */}
          {!hasFak && (
            <button
              onClick={handleConfirm}
              className="absolute cursor-pointer border-none bg-transparent p-0"
              style={{
                left: `${bgWidth / 4}px`, 
                transform: 'translateX(-50%)',
                width: '120px',
                height: '50px'
              }}
              data-test-id="death-confirm-btn"
            >
              <Sprite
                atlas="ui"
                frame="btn_common_white_normal.png"
                className="w-full h-full block"
              />
              <div
                className="absolute inset-0 flex items-center justify-center text-black"
                style={{
                  fontSize: '16px',
                  fontFamily: "'Noto Sans', sans-serif",
                  fontWeight: 'bold',
                  pointerEvents: 'none'
                }}
              >
                Confirm
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Fade in animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
      </div>
    </>
  )
}

