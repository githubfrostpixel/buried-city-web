/**
 * NpcDialog Component
 * Dialog showing NPC travel information and confirmation
 * Ported from OriginalGame/src/ui/uiUtil.js showNpcInMapDialog()
 * 
 * Structure:
 * - Title section: NPC icon, NPC name, reputation (heart display)
 * - Content section: NPC description image, description text, travel info (time, fuel), items needed
 * - Action section: Cancel button, Go button
 */

import { useEffect, useState } from 'react'
import { useUIStore } from '@/core/store/uiStore'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { DialogButton } from '@/common/ui/DialogButton'
import { getTimeDistanceStr } from '@/common/utils/time'
import { getString } from '@/common/utils/stringUtil'
import { game } from '@/core/game/Game'
import type { NPC } from '@/core/game/entities/NPC'
import { useViewportScaleContext } from '@/common/context/ViewportScaleContext'

interface NpcDialogData {
  npc: NPC
  time: number  // Travel time in seconds
  fuelNeed: number  // Fuel needed (-1 if no motorcycle)
  canAfford: boolean  // Whether player can afford fuel
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Heart display component for reputation
 * Ported from OriginalGame/src/ui/uiUtil.js createHeartNode()
 */
function HeartDisplay({ reputation }: { reputation: number }) {
  const heartNum = 5
  const heartPadding = 5
  const heartWidth = 20  // Approximate width of icon_heart_bg.png
  const heartHeight = 20  // Approximate height
  
  // Calculate which hearts to show
  // Reputation is 0-10, displayed as 5 hearts (each heart = 2 reputation)
  const min = Math.floor(reputation / 2)  // Full hearts
  const max = Math.ceil(reputation / 2)   // Total hearts (including half)
  const hasHalf = max !== min
  
  return (
    <div
      style={{
        display: 'flex',
        gap: `${heartPadding}px`,
        alignItems: 'center',
        height: `${heartHeight}px`
      }}
    >
      {Array.from({ length: heartNum }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'relative',
            width: `${heartWidth}px`,
            height: `${heartHeight}px`
          }}
        >
          {/* Heart background */}
          <Sprite
            atlas="icon"
            frame="icon_heart_bg.png"
            style={{
              width: `${heartWidth}px`,
              height: `${heartHeight}px`
            }}
          />
          {/* Full heart */}
          {i < min && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                zIndex: 1
              }}
            >
              <Sprite
                atlas="icon"
                frame="icon_heart_full.png"
                style={{
                  width: `${heartWidth}px`,
                  height: `${heartHeight}px`
                }}
              />
            </div>
          )}
          {/* Half heart */}
          {hasHalf && i === (max - 1) && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                zIndex: 1
              }}
            >
              <Sprite
                atlas="icon"
                frame="icon_heart_half.png"
                style={{
                  width: `${heartWidth}px`,
                  height: `${heartHeight}px`
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function NpcDialog() {
  const uiStore = useUIStore()
  const { scale } = useViewportScaleContext()
  const [bottomBarRect, setBottomBarRect] = useState<DOMRect | null>(null)
  
  // Get dialog data from overlay state
  const dialogData = (uiStore.activeOverlay === 'npcDialog' 
    ? (uiStore as any).overlayData as NpcDialogData 
    : null)
  
  // Pause game when dialog appears
  useEffect(() => {
    if (!dialogData) return
    
    // Pause game
    game.pause()
    
    // Resume game when dialog closes
    return () => {
      game.resume()
    }
  }, [dialogData])
  
  // Get BottomBar position dynamically (same as ItemDialog)
  // Must be called before early return to follow Rules of Hooks
  useEffect(() => {
    const updatePosition = () => {
      const bottomBar = document.querySelector('[data-test-id="bottombar-bg"]')
      if (bottomBar) {
        setBottomBarRect(bottomBar.getBoundingClientRect())
      }
    }
    
    // Initial update
    updatePosition()
    
    // Update on resize
    window.addEventListener('resize', updatePosition)
    
    // Update periodically in case BottomBar moves (e.g., during transitions)
    const interval = setInterval(updatePosition, 100)
    
    return () => {
      window.removeEventListener('resize', updatePosition)
      clearInterval(interval)
    }
  }, [])
  
  // Handle ESC key - must be called before early return
  useEffect(() => {
    if (!dialogData) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dialogData])
  
  // Early return after all hooks are called
  if (!dialogData || !bottomBarRect) return null
  
  const { npc, time, fuelNeed, canAfford, onConfirm, onCancel } = dialogData
  
  // Dialog dimensions (based on dialog_big_bg.png sprite)
  const dialogWidth = 400
  const dialogHeight = 500
  
  // Title section: 90px height
  const titleHeight = 90
  // Action section: 72px height
  const actionHeight = 72
  // Content section: remaining height
  const contentHeight = dialogHeight - titleHeight - actionHeight + 120
  
  // Left/Right edges: 20px from dialog edges
  const leftEdge = 20
  const rightEdge = dialogWidth - leftEdge
  
  // NPC icon name
  const iconName = "icon_npc.png"
  
  // NPC description image name
  const digDesName = `npc_dig_${npc.id}.png`
  
  // Get NPC name
  const npcName = npc.getName()
  
  // Get NPC description
  const npcDes = npc.getDes()
  
  // Format travel time
  const timeStr = getTimeDistanceStr(time)
  
  // Format fuel cost string
  const fuelStr = fuelNeed > 0 ? getString(1340, fuelNeed) : null  // Format: "Fuel Need: %s"
  
  // Get items needed from NPC storage
  const needItems: Array<{ itemId: string; num: number }> = []
  Object.entries(npc.storage.items).forEach(([itemId, count]) => {
    needItems.push({
      itemId: itemId,
      num: count
    })
  })
  
  // Handle close
  const handleClose = () => {
    onCancel()
    uiStore.hideOverlay()
  }
  
  return (
    <div
      className="fixed z-[9999]"
      style={{
        left: `${bottomBarRect.left}px`,
        top: `${bottomBarRect.top}px`,
        width: `${bottomBarRect.width}px`,
        height: `${bottomBarRect.height}px`,
        animation: 'fadeIn 0.3s ease-in'
      }}
      onClick={(e) => {
        // Close on overlay click (not on dialog itself)
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
      data-test-id="npc-dialog-overlay"
    >
      {/* Dark background overlay covering BottomBar area */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          width: '100%',
          height: '100%'
        }}
        onClick={handleClose}
      />
      
      {/* Dialog container - centered within BottomBar area */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          width: `${dialogWidth}px`,
          height: `${dialogHeight}px`,
          zIndex: 51
        }}
        onClick={(e) => e.stopPropagation()}
        data-test-id="npc-dialog"
      >
        {/* Background */}
        <Sprite
          atlas="ui"
          frame="dialog_big_bg.png"
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Title section */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: 0,
            width: `${dialogWidth}px`,
            height: `${titleHeight}px`
          }}
        >
          {/* NPC icon */}
          <div
            className="absolute"
            style={{
              left: `${leftEdge}px`,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '64px',
              height: '64px'
            }}
          >
            <Sprite
              atlas="icon"
              frame={iconName}
              className="w-full h-full"
            />
          </div>
          
          {/* NPC name */}
          <div
            className="absolute text-black"
            style={{
              left: `${leftEdge + 70}px`,
              top: '35%',
              transform: 'translateY(-50%)',
              fontSize: '25px',
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 'bold',
              maxWidth: `${rightEdge - leftEdge - 100}px`,
              lineHeight: '1.2'
            }}
            data-test-id="npc-dialog-title"
          >
            {npcName}
          </div>
          
          {/* Reputation (heart display) */}
          <div
            className="absolute"
            style={{
              right: `${rightEdge-190}px`,
              top: '50%',
              transform: 'translateY(20%)'
            }}
          >
            <HeartDisplay reputation={npc.reputation} />
          </div>
        </div>
        
        {/* Content section */}
        <div
          className="absolute overflow-auto"
          style={{
            left: '0',
            top: `${titleHeight-15}px`,
            width: `${dialogWidth}px`,
            height: `${contentHeight}px`,
            padding: '10px'
          }}
        >
          {/* NPC description image (dig_des) - scaled to 0.8 */}
          <div
            className="relative mx-auto mb-1"
            style={{
              width: '380px',
              height: 'auto'
            }}
          >
            <Sprite
              atlas="npc"
              frame={digDesName}
              className="w-full h-full"
            />
          </div>
          
          {/* Description text */}
          <div
            className="text-black"
            style={{
              fontSize: '18px',
              fontFamily: "'Noto Sans', sans-serif",
              lineHeight: '1.4',
              paddingLeft: `${leftEdge}px`,
              paddingRight: `${leftEdge}px`
            }}
            data-test-id="npc-dialog-description"
          >
            {npcDes}
          </div>
          
          {/* Travel info log section */}
          <div
            className="text-black"
            style={{
              fontSize: '18px',
              fontFamily: "'Noto Sans', sans-serif",
              lineHeight: '1.4',
              paddingLeft: `${leftEdge}px`,
              paddingRight: `${leftEdge}px`,
              marginTop: '0px'
            }}
            data-test-id="npc-dialog-travel-info"
          >
            {/* Travel time */}
            <div style={{ marginBottom: '0px' }}>
              {timeStr}
            </div>
            
            {/* Fuel cost - if fuel needed */}
            {fuelStr && (
              <div style={{ color: canAfford ? '#000000' : '#ff0000', marginBottom: '10px' }}>
                {fuelStr}
              </div>
            )}
            
            {/* Items needed - if NPC has items in storage */}
            {needItems.length > 0 && (
              <div style={{ marginTop: '0px' }}>
                <div style={{ marginBottom: '0px', fontWeight: 'bold' }}>
                  {getString(1066) || 'Items Needed:'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {needItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '18px'
                      }}
                    >
                      <Sprite
                        atlas="icon"
                        frame={`icon_${item.itemId}.png`}
                        style={{
                          width: '24px',
                          height: '24px'
                        }}
                      />
                      <span>x{item.num}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action section */}
        <div
          className="absolute"
          style={{
            left: 0,
            bottom: '-60px',
            width: `${dialogWidth}px`,
            height: `${actionHeight}px`
          }}
        >
          {/* Cancel button (btn_1) */}
          <DialogButton
            text={getString(1157) || 'Cancel'}  // "Return"
            position={{ x: 25, y: 50 }}  // Left side, centered vertically
            onClick={handleClose}
            enabled={true}
          />
          
          {/* Go button (btn_2) */}
          <DialogButton
            text={getString(1138) || 'Go'}  // "Go"
            position={{ x: 40, y: 50 }}  // Right side, centered vertically
            onClick={() => {
              onConfirm()
              uiStore.hideOverlay()
            }}
            enabled={true}
          />
        </div>
      </div>
    </div>
  )
}

