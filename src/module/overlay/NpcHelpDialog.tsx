/**
 * NpcHelpDialog Component
 * Dialog showing NPC help request with items needed
 * Ported from OriginalGame/src/ui/uiUtil.js showNpcNeedHelpDialog() (lines 854-912)
 * 
 * Structure:
 * - Title section: NPC icon, NPC name, time, reputation (heart display)
 * - Content section: NPC description image, help message (1065), "They need" label (1066), item list
 * - Action section: "Refuse" button (1071), "Agree" button (1072)
 */

import { useEffect, useState, useMemo } from 'react'
import { useUIStore } from '@/core/store/uiStore'
import { usePlayerStore } from '@/core/store/playerStore'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { DialogButton } from '@/common/ui/DialogButton'
import { getString } from '@/common/utils/stringUtil'
import { game } from '@/core/game/Game'
import type { NPC } from '@/core/game/entities/NPC'

interface NpcHelpDialogData {
  npc: NPC
  needRestore?: boolean  // Whether to restore reputation (if it was decreased)
  onRefuse: () => void
  onAgree: () => void
}

/**
 * Heart display component for reputation
 * Ported from OriginalGame/src/ui/uiUtil.js createHeartNode()
 */
function HeartDisplay({ reputation }: { reputation: number }) {
  const heartNum = 5
  const heartPadding = 5
  const heartWidth = 20
  const heartHeight = 20
  
  const min = Math.floor(reputation / 2)
  const max = Math.ceil(reputation / 2)
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
          <Sprite
            atlas="icon"
            frame="icon_heart_bg.png"
            style={{
              width: `${heartWidth}px`,
              height: `${heartHeight}px`
            }}
          />
          {i < min && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ zIndex: 1 }}
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
          {hasHalf && i === (max - 1) && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ zIndex: 1 }}
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

export function NpcHelpDialog() {
  const uiStore = useUIStore()
  const playerStore = usePlayerStore()
  const [bottomBarRect, setBottomBarRect] = useState<DOMRect | null>(null)
  
  // Get dialog data from overlay state
  const dialogData = (uiStore.activeOverlay === 'npcHelpDialog' 
    ? (uiStore as any).overlayData as NpcHelpDialogData 
    : null)
  
  // Get NPC reference (must be before hooks that use it)
  const npc = dialogData?.npc
  
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
  
  // Get BottomBar position dynamically
  useEffect(() => {
    const updatePosition = () => {
      const bottomBar = document.querySelector('[data-test-id="bottombar-bg"]')
      if (bottomBar) {
        setBottomBarRect(bottomBar.getBoundingClientRect())
      }
    }
    
    updatePosition()
    window.addEventListener('resize', updatePosition)
    const interval = setInterval(updatePosition, 100)
    
    return () => {
      window.removeEventListener('resize', updatePosition)
      clearInterval(interval)
    }
  }, [])
  
  // Handle ESC key (must be before early return)
  useEffect(() => {
    if (!dialogData) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleRefuse()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dialogData])
  
  // Get need help items and validate
  // Use the items that were already generated in needHelp(), don't regenerate
  const needItems = useMemo(() => {
    if (!npc) return []
    // Use the items already stored in npc.needHelpItems (generated in needHelp())
    // Don't call getNeedHelpItems() again as it would regenerate different items
    return npc.needHelpItems || []
  }, [npc])
  
  // Check if player has all required items
  const hasAllItems = useMemo(() => {
    if (!needItems.length) return false
    return playerStore.validateItems(needItems.map(item => ({
      itemId: Number(item.itemId),
      num: item.num
    })))
  }, [needItems, playerStore])
  
  // Get player item counts for each needed item (for color display)
  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    needItems.forEach((item) => {
      const itemId = String(item.itemId)
      counts[itemId] = playerStore.getBagItemCount(itemId) + playerStore.getStorageItemCount(itemId)
    })
    return counts
  }, [needItems, playerStore])
  
  // Handle close function (defined after hooks, before early return)
  const handleRefuse = () => {
    if (dialogData?.onRefuse) {
      dialogData.onRefuse()
    }
    uiStore.hideOverlay()
  }
  
  const handleAgree = () => {
    if (dialogData?.onAgree) {
      dialogData.onAgree()
    }
    uiStore.hideOverlay()
  }
  
  // Early return after all hooks are called
  if (!dialogData || !bottomBarRect || !npc) return null
  
  // Dialog dimensions
  const dialogWidth = 400
  const dialogHeight = 500
  const titleHeight = 90
  const actionHeight = 72
  const contentHeight = dialogHeight - titleHeight - actionHeight + 120
  const leftEdge = 20
  const rightEdge = dialogWidth - leftEdge
  
  // NPC info
  const iconName = "icon_npc.png"
  const digDesName = `npc_dig_${npc.id}.png`
  const npcName = npc.getName()
  
  // Reputation display (show +1 if needRestore)
  const displayReputation = dialogData.needRestore ? npc.reputation + 1 : npc.reputation
  
  // Help message
  const helpMessage = getString(1065) || "I am sorry to interrupt, but can you do me a favor?"
  
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
        if (e.target === e.currentTarget) {
          handleRefuse()
        }
      }}
      data-test-id="npc-help-dialog-overlay"
    >
      {/* Dark background overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          width: '100%',
          height: '100%'
        }}
        onClick={handleRefuse}
      />
      
      {/* Dialog container */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${dialogWidth}px`,
          height: `${dialogHeight}px`,
          zIndex: 51
        }}
        onClick={(e) => e.stopPropagation()}
        data-test-id="npc-help-dialog"
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
          >
            {npcName}
          </div>
          
          
          
          {/* Reputation (heart display) */}
          <div
            className="absolute"
            style={{
              right: `${rightEdge - 190}px`,
              top: '50%',
              transform: 'translateY(20%)'
            }}
          >
            <HeartDisplay reputation={displayReputation} />
          </div>
        </div>
        
        {/* Content section */}
        <div
          className="absolute overflow-auto"
          style={{
            left: '0',
            top: `${titleHeight - 15}px`,
            width: `${dialogWidth}px`,
            height: `${contentHeight}px`,
            padding: '10px'
          }}
        >
          {/* NPC description image */}
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
          
          {/* Help message */}
          <div
            className="text-black mb-2"
            style={{
              fontSize: '18px',
              fontFamily: "'Noto Sans', sans-serif",
              lineHeight: '1.4',
              paddingLeft: `${leftEdge}px`,
              paddingRight: `${leftEdge}px`
            }}
          >
            {helpMessage}
          </div>
          
          {/* "They need" label */}
          <div
            className="text-black mb-2"
            style={{
              fontSize: '18px',
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 'normal',
              paddingLeft: `${leftEdge}px`,
              paddingRight: `${leftEdge}px`,
              marginTop: '0px'
            }}
          >
            They need:
          </div>
          
          {/* Item list */}
          <div
            style={{
              paddingLeft: `${leftEdge}px`,
              paddingRight: `${leftEdge}px`,
              marginTop: '10px'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              {needItems.map((item, idx) => {
                const itemId = String(item.itemId)
                const itemName = getString(item.itemId).title || `Item ${itemId}`
                const playerCount = itemCounts[itemId] || 0
                const hasEnough = playerCount >= item.num
                const itemColor = hasEnough ? '#000000' : '#ff0000' // BLACK if enough, RED if not
                
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '16px',
                      fontFamily: "'Noto Sans', sans-serif",
                      color: itemColor
                    }}
                  >
                    <Sprite
                      atlas="icon"
                      frame={`icon_item_${itemId}.png`}
                      style={{
                        width: '32px',
                        height: '32px'
                      }}
                    />
                    <span>{itemName} x{item.num}</span>
                  </div>
                )
              })}
            </div>
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
          {/* "Refuse" button (left side) */}
          <DialogButton
            text={getString(1071) || 'Refuse'}
            position={{ x: 25, y: 50 }}
            onClick={handleRefuse}
            enabled={true}
          />
          
          {/* "Agree" button (right side) */}
          <DialogButton
            text={getString(1072) || 'Agree'}
            position={{ x: 50, y: 50 }}
            onClick={handleAgree}
            enabled={hasAllItems}
          />
        </div>
      </div>
    </div>
  )
}

