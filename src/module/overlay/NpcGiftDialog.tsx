/**
 * NpcGiftDialog Component
 * Dialog showing NPC gift (items or site unlock)
 * Ported from OriginalGame/src/ui/uiUtil.js showNpcSendGiftDialog() (lines 973-1050)
 * 
 * Structure:
 * - Title section: NPC icon, NPC name, time, reputation (heart display)
 * - Content section: NPC description image, gift message, item list (if items) or site unlock message (if site)
 * - Action section: "Got it" button
 */

import { useEffect, useState, useMemo } from 'react'
import { useUIStore } from '@/core/store/uiStore'
import { usePlayerStore } from '@/core/store/playerStore'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { DialogButton } from '@/common/ui/DialogButton'
import { getString } from '@/common/utils/stringUtil'
import { useLogStore } from '@/core/store/logStore'
import { game } from '@/core/game/Game'
import type { NPC } from '@/core/game/entities/NPC'
import type { Gift } from '@/common/types/npc.types'
import { useViewportScaleContext } from '@/common/context/ViewportScaleContext'

interface NpcGiftDialogData {
  npc: NPC
  giftNumber?: number // Sequential gift number (1, 2, 3, 4, 5, 6, 7...)
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

export function NpcGiftDialog() {
  const uiStore = useUIStore()
  const playerStore = usePlayerStore()
  const { scale } = useViewportScaleContext()
  const [bottomBarRect, setBottomBarRect] = useState<DOMRect | null>(null)
  
  // Get dialog data from overlay state
  const dialogData = (uiStore.activeOverlay === 'npcGiftDialog' 
    ? (uiStore as any).overlayData as NpcGiftDialogData 
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
  
  // No auto-processing - gifts are processed when player clicks "Got it"
  
  // Handle ESC key (must be before early return)
  useEffect(() => {
    if (!dialogData) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        uiStore.hideOverlay()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dialogData, uiStore])
  
  // Compute gift data (must be before early return for hooks)
  const isItemGift = npc ? (npc.needSendGiftList.item && npc.needSendGiftList.item.length > 0) : false
  const isSiteGift = npc ? (npc.needSendGiftList.site && npc.needSendGiftList.site.length > 0) : false
  
  // Get gifts (prioritize items over sites)
  const rawGifts: Gift[] = useMemo(() => {
    if (!npc) return []
    if (isItemGift) {
      return [...(npc.needSendGiftList.item || [])]
    }
    if (isSiteGift) {
      return [...(npc.needSendGiftList.site || [])]
    }
    return []
  }, [npc, isItemGift, isSiteGift])
  
  // Merge duplicate items (same itemId)
  const mergedGifts = useMemo(() => {
    if (!isItemGift) return rawGifts
    const itemMap: Record<string, number> = {}
    rawGifts.forEach((gift) => {
      if (gift.itemId !== undefined) {
        const itemId = String(gift.itemId)
        const num = typeof gift.num === 'string' ? Number(gift.num) : (gift.num || 0)
        itemMap[itemId] = (itemMap[itemId] || 0) + num
      }
    })
    return Object.keys(itemMap).map(itemId => ({
      itemId: itemId,
      num: String(itemMap[itemId])
    })) as Gift[]
  }, [rawGifts, isItemGift])
  
  // Site unlock message (for site gifts)
  const siteUnlockMessages = useMemo(() => {
    if (!isSiteGift || !mergedGifts.length) return []
    return mergedGifts.map(gift => {
      if ('siteId' in gift && gift.siteId !== undefined) {
        const siteName = getString(`site_${gift.siteId}`).name || `Site ${gift.siteId}`
        return getString(1221, siteName) // "(new location %s unlocked)"
      }
      return ''
    }).filter(Boolean)
  }, [mergedGifts, isSiteGift])
  
  // Handle close function (defined after hooks, before early return)
  const handleClose = () => {
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
  
  // Gift message
  const giftMessage = isItemGift 
    ? getString(1068) // "I think you're going to need this..."
    : getString(1070) // "I know a place..."
  
  // Handle accept - process gift and mark as sent
  const handleAccept = () => {
    if (!npc || !dialogData) return
    
    // Get gifts to process (should be only one gift)
    const itemGifts = npc.needSendGiftList.item || []
    const siteGifts = npc.needSendGiftList.site || []
    
    // Process item gifts
    itemGifts.forEach((gift) => {
      if (gift.itemId !== undefined) {
        const itemId = typeof gift.itemId === 'string' ? Number(gift.itemId) : gift.itemId
        const num = typeof gift.num === 'string' ? Number(gift.num) : (gift.num || 0)
        playerStore.gainItems([{ itemId, num }])
        
        // Add log message (1103: "You got %s %s (stock: %s)")
        const itemIdStr = String(itemId)
        const itemName = getString(itemId).title || `Item ${itemId}`
        const stock = playerStore.getStorageItemCount(itemIdStr)
        const message = getString(1103, num, itemName, stock)
        useLogStore.getState().addLog(message)
      }
    })
    
    // Process site gifts
    siteGifts.forEach((gift) => {
      if (gift.siteId !== undefined) {
        const map = playerStore.getMap()
        const siteId = typeof gift.siteId === 'string' ? Number(gift.siteId) : gift.siteId
        map.unlockSite(siteId)
        
        const siteName = getString(`site_${siteId}`).name || `Site ${siteId}`
        const message = getString(1221, siteName)
        useLogStore.getState().addLog(message)
      }
    })
    
    // Mark gift as sent if giftNumber is provided
    if (dialogData.giftNumber !== undefined) {
      npc.markGiftAsSent(dialogData.giftNumber)
    }
    
    // Clear gifts from needSendGiftList
    delete npc.needSendGiftList.item
    delete npc.needSendGiftList.site
    
    // Save game after accepting gift (original: Record.saveAll() in npc.js:213, 238, 251, 270, 282)
    import('@/core/game/systems/save').then(({ saveAll }) => {
      saveAll().catch(err => console.error('Auto-save failed after accepting gift:', err))
    })
    
    // Close dialog
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
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
      data-test-id="npc-gift-dialog-overlay"
    >
      {/* Dark background overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          width: '100%',
          height: '100%'
        }}
        onClick={handleClose}
      />
      
      {/* Dialog container */}
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
        data-test-id="npc-gift-dialog"
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
            <HeartDisplay reputation={npc.reputation} />
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
          
          {/* Gift message */}
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
            {giftMessage}
          </div>
          
          {/* Item list (for item gifts) */}
          {isItemGift && (
            <div
              style={{
                paddingLeft: `${leftEdge}px`,
                paddingRight: `${leftEdge}px`,
                marginTop: '10px'
              }}
            >
              <div
                className="text-black mb-2"
                style={{
                  fontSize: '18px',
                  fontFamily: "'Noto Sans', sans-serif",
                  fontWeight: 'bold'
                }}
              >
                {getString(1069)} {/* "You received " */}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                {mergedGifts.map((gift, idx) => {
                  if (!('itemId' in gift) || gift.itemId === undefined) return null
                  const itemId = typeof gift.itemId === 'string' ? Number(gift.itemId) : gift.itemId
                  const itemIdStr = String(itemId)
                  const itemName = getString(itemId).title || `Item ${itemId}`
                  const num = typeof gift.num === 'string' ? Number(gift.num) : (gift.num || 0)
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '16px',
                        fontFamily: "'Noto Sans', sans-serif"
                      }}
                    >
                      <Sprite
                        atlas="icon"
                        frame={`icon_${itemIdStr}.png`}
                        style={{
                          width: '32px',
                          height: '32px'
                        }}
                      />
                      <span>{itemName} x{num}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Site unlock messages (for site gifts) */}
          {isSiteGift && siteUnlockMessages.length > 0 && (
            <div
              style={{
                paddingLeft: `${leftEdge}px`,
                paddingRight: `${leftEdge}px`,
                marginTop: '10px'
              }}
            >
              {siteUnlockMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="text-black"
                  style={{
                    fontSize: '18px',
                    fontFamily: "'Noto Sans', sans-serif",
                    lineHeight: '1.4',
                    marginBottom: '5px'
                  }}
                >
                  {msg}
                </div>
              ))}
            </div>
          )}
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
          {/* "Got it" button (processes gift when clicked) */}
          <DialogButton
            text={getString(1073) || 'Got it'}
            position={{ x: 50, y: 50 }}
            onClick={handleAccept}
            enabled={true}
          />
        </div>
      </div>
    </div>
  )
}

