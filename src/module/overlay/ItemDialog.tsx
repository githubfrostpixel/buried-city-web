/**
 * ItemDialog Component
 * Dialog showing item information and use button
 * Ported from OriginalGame/src/ui/uiUtil.js showItemDialog()
 * 
 * Structure:
 * - Title section: Icon, title, count
 * - Content section: Large image, description, special messages
 * - Action section: Close and Use buttons
 */

import { useEffect, useState } from 'react'
import { useUIStore } from '@/core/store/uiStore'
import { usePlayerStore } from '@/core/store/playerStore'
import { Item } from '@/core/game/inventory/Item'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { DialogButton } from '@/common/ui/DialogButton'
import { emitter } from '@/common/utils/emitter'
import { getString } from '@/common/utils/stringUtil'

interface ItemDialogData {
  itemId: string
  source: 'storage' | 'bag' | 'bazaar'
  showOnly?: boolean
}

export function ItemDialog() {
  const uiStore = useUIStore()
  const playerStore = usePlayerStore()
  const [bottomBarRect, setBottomBarRect] = useState<DOMRect | null>(null)
  
  // Get dialog data from overlay state
  const dialogData = (uiStore.activeOverlay === 'itemDialog' 
    ? (uiStore as any).overlayData as ItemDialogData 
    : null)
  
  // Get BottomBar position dynamically (same as DeathOverlay)
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
        uiStore.hideOverlay()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dialogData, uiStore])
  
  // Early return after all hooks are called
  if (!dialogData || !bottomBarRect) return null
  
  const { itemId, source, showOnly = false } = dialogData
  const item = new Item(itemId)
  
  // Determine dialog type based on item type
  // Original: item_1 = default (no use button), item_2 = food (has use), item_3 = medicine/buff (has use)
  const getDialogType = (): 'item_1' | 'item_2' | 'item_3' => {
    // ItemType.TOOL = "11", ItemType.FOOD = "03", ItemType.MEDICINE = "04", ItemType.BUFF = "07"
    if (item.isType('11', '03')) {
      return 'item_2'  // Food items - has use button
    } else if (item.isType('11', '04')) {
      return 'item_3'  // Medicine items - has use button
    } else if (item.isType('11', '07') || itemId === '1106014') {
      return 'item_3'  // Buff items - has use button
    }
    return 'item_1'  // Default items - NO use button
  }
  
  const dialogType = getDialogType()
  
  // Use button is only shown for item_2 and item_3, and only if not showOnly
  // Original: config.action.btn_2 exists only for item_2 and item_3
  const shouldShowUseButton = !showOnly && (dialogType === 'item_2' || dialogType === 'item_3')
  
  // Get item count from appropriate storage
  const getItemCount = (): number => {
    if (playerStore.isAtHome && source === 'storage') {
      return playerStore.getStorageItemCount(itemId)
    } else if (source === 'bag') {
      return playerStore.getBagItemCount(itemId)
    } else if (source === 'storage') {
      return playerStore.getStorageItemCount(itemId)
    }
    return 0
  }
  
  const itemCount = getItemCount()
  
  // Get item name and description from string system
  const getItemName = (): string => {
    const itemConfig = getString(itemId)
    if (typeof itemConfig === 'object' && itemConfig !== null && 'title' in itemConfig) {
      return itemConfig.title as string
    }
    return `Item ${itemId}` // Fallback
  }
  
  const getItemDescription = (): string => {
    const itemConfig = getString(itemId)
    if (typeof itemConfig === 'object' && itemConfig !== null && 'des' in itemConfig) {
      return itemConfig.des as string
    }
    return '' // Fallback
  }
  
  const itemName = getItemName()
  const itemDescription = getItemDescription()
  
  // Special item handling
  const equipNeededItems = ['1305053', '1305075', '1305064']
  const equipNotNeededItems = ['1305034', '1305024', '1305023', '1306001']
  const needsEquip = equipNeededItems.includes(itemId)
  const noEquipNeeded = equipNotNeededItems.includes(itemId)
  const isBuffItem = item.isType('11', '07')
  
  // Handle close
  const handleClose = () => {
    uiStore.hideOverlay()
  }
  
  // Handle use
  const handleUse = () => {
    // Emit btn_1_click event (StoragePanelContent listens to this)
    emitter.emit('btn_1_click', { itemId, source })
    // Don't close immediately - let the item use handler close it
    // This prevents closing the dialog if death occurs during item use
    // The dialog will be closed by handleDeath() if needed
    // handleClose()
  }
  
  // Dialog dimensions (approximate, will be adjusted based on actual sprite)
  const dialogWidth = 400
  const dialogHeight = 500
  const titleHeight = 90
  const actionHeight = 72
  const contentHeight = dialogHeight - titleHeight - actionHeight
  const leftEdge = 20
  const rightEdge = dialogWidth - leftEdge
  
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
      data-test-id="item-dialog-overlay"
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
          transform: 'translate(-50%, -50%)',
          width: `${dialogWidth}px`,
          height: `${dialogHeight}px`,
          zIndex: 51
        }}
        onClick={(e) => e.stopPropagation()}
        data-test-id="item-dialog"
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
            left: '0',
            top: '0',
            width: `${dialogWidth}px`,
            height: `${titleHeight}px`
          }}
        >
          {/* Item icon */}
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
              frame={`icon_item_${itemId}.png`}
              className="w-full h-full"
            />
          </div>
          
          {/* Item title */}
          <div
            className="absolute text-black"
            style={{
              left: `${leftEdge + 70}px`,
              top: '40%',
              transform: 'translateY(-50%)',
              fontSize: '32px',
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 'bold',
              maxWidth: `${rightEdge - leftEdge - 70}px`
            }}
            data-test-id="item-dialog-title"
          >
            {itemName}
          </div>
          
          {/* Item count */}
          <div
            className="absolute text-black"
            style={{
              left: `${leftEdge + 70}px`,
              top: '55%',
              fontSize: '20px',
              fontFamily: "'Noto Sans', sans-serif"
            }}
            data-test-id="item-dialog-count"
          >
            Count: {itemCount}
          </div>
        </div>
        
        {/* Content section */}
        <div
          className="absolute overflow-auto"
          style={{
            left: '0',
            top: `${titleHeight}px`,
            width: `${dialogWidth}px`,
            height: `${contentHeight}px`,
            padding: '10px'
          }}
        >
          {/* Large item image */}
          <div
            className="relative mx-auto mb-4"
            style={{
              width: '200px',
              height: '200px'
            }}
          >
            <Sprite
              atlas="dig_item"
              frame={`dig_item_${itemId}.png`}
              className="w-full h-full"
            />
          </div>
          
          {/* Description */}
          <div
            className="text-black mb-2"
            style={{
              fontSize: '20px',
              fontFamily: "'Noto Sans', sans-serif",
              lineHeight: '1.4',
              paddingLeft: `${leftEdge}px`,
              paddingRight: `${leftEdge}px`
            }}
            data-test-id="item-dialog-description"
          >
            {itemDescription}
            {needsEquip && (
              <div className="mt-2 text-red-600">
                Equipment needed
              </div>
            )}
            {noEquipNeeded && (
              <div className="mt-2 text-green-600">
                No equipment needed
              </div>
            )}
          </div>
          
          {/* Buff warning */}
          {isBuffItem && (
            <div
              className="text-red-600 mt-2"
              style={{
                fontSize: '20px',
                fontFamily: "'Noto Sans', sans-serif",
                paddingLeft: `${leftEdge}px`,
                paddingRight: `${leftEdge}px`
              }}
            >
              Warning: Buff items have special effects
            </div>
          )}
        </div>
        
        {/* Action section - 72px height, matches original actionNode */}
        <div
          className="absolute"
          style={{
            left: '0',
            bottom: '-60px',
            width: `${dialogWidth}px`,
            height: `${actionHeight}px`
          }}
        >
          {/* Close button (btn_1) */}
          <DialogButton
            text={(() => {
              const config = getString(dialogType)
              if (typeof config === 'object' && config !== null && 'action' in config) {
                return (config as any).action.btn_1.txt
              }
              return dialogType === 'item_1' ? 'OK' : 'Back'
            })()}
            position={shouldShowUseButton ? { x: 25, y: 50 } : { x: 50, y: 50 }}
            onClick={handleClose}
            enabled={true}
          />
          
          {/* Use button (btn_2) - only for food, medicine, buff items - item_2 and item_3 */}
          {shouldShowUseButton && (
            <DialogButton
              text={(() => {
                const config = getString(dialogType)
                if (typeof config === 'object' && config !== null && 'action' in config && 'btn_2' in (config as any).action) {
                  return (config as any).action.btn_2.txt
                }
                return dialogType === 'item_2' ? 'Eat (10 m)' : 'Use (10 m)'
              })()}
              position={{ x: 45, y: 50 }}
              onClick={handleUse}
              enabled={true}
            />
          )}
        </div>
      </div>


    </div>
  )
}

