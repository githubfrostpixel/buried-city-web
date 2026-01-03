/**
 * AttributeStatusDialog Component
 * Dialog showing attribute information and usable items
 * Ported from OriginalGame/src/ui/topFrame.js showAttrStatusDialog()
 * 
 * Structure:
 * - Title section: Icon, title, current value
 * - Content section: Description, buff info (if applicable), item list
 * - Action section: Close button
 */

import { useEffect, useMemo } from 'react'
import { useUIStore } from '@/store/uiStore'
import { usePlayerStore } from '@/store/playerStore'
import { Item } from '@/game/inventory/Item'
import { Storage } from '@/game/inventory/Storage'
import { Sprite } from '@/components/sprites/Sprite'
import { DialogButton } from '@/components/common/DialogButton'
import { getString } from '@/utils/stringUtil'

interface AttributeDialogData {
  stringId: number
  attr: string
}

// Attribute string IDs mapping (for future string system integration)
// const ATTRIBUTE_STRING_IDS: Record<string, number> = {
//   injury: 10,
//   infect: 9,
//   starve: 6,
//   vigour: 7,
//   spirit: 8,
//   water: 14,
//   virus: 15,
//   hp: 5
// }

// Get items that can affect an attribute
function getItemsForAttribute(attr: string, storage: Storage): Array<{ item: Item; num: number }> {
  let itemList: Array<{ item: Item; num: number }> = []
  
  if (attr === 'starve') {
    // Food items (type 1103)
    itemList = storage.getItemsByType('1103')
  } else if (attr === 'infect') {
    // Medicine items except bandage (type 1104, exclude 1104011)
    itemList = storage.getItemsByType('1104')
    itemList = itemList.filter(({ item }) => item.id !== '1104011')
  } else if (attr === 'injury') {
    // Bandage only (type 1104, id 1104011)
    itemList = storage.getItemsByType('1104')
    itemList = itemList.filter(({ item }) => item.id === '1104011')
  } else if (attr === 'hp') {
    // HP items (type 1107)
    itemList = storage.getItemsByType('1107')
  }
  // Other attributes (vigour, spirit, water) don't have specific items in original
  
  return itemList
}

export function AttributeStatusDialog() {
  const uiStore = useUIStore()
  const playerStore = usePlayerStore()
  
  // Get dialog data from overlay state
  const dialogData = (uiStore.activeOverlay === 'attributeDialog' 
    ? (uiStore as any).overlayData as AttributeDialogData 
    : null)
  
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
  
  // Get attr from dialogData (safe default if not available)
  const attr = dialogData?.attr || ''
  
  // Check if tmpBag exists (items are hidden when at site with tmpBag)
  // tmpBag is not implemented yet, so we'll use isAtSite as a proxy
  // In original: if (!player.tmpBag) { show items }
  const hasTmpBag = playerStore.isAtSite // TODO: Replace with actual tmpBag check when implemented
  
  // Get storage (home = storage, else = bag or tmpBag)
  // Use useMemo to only calculate once when dialog opens
  // Must be called before early return to follow Rules of Hooks
  const storage = useMemo(() => {
    const storage = new Storage('temp')
    if (playerStore.isAtHome) {
      // Use storage items - restore directly to avoid weight checks
      storage.restore(playerStore.storage)
    } else {
      // Use bag items (tmpBag not implemented yet)
      storage.restore(playerStore.bag)
    }
    
    // Log once when dialog opens (only if dialogData exists)
    if (dialogData) {
      console.log('[AttributeDialog] Dialog opened:', {
        attr: dialogData.attr,
        isAtHome: playerStore.isAtHome,
        isAtSite: playerStore.isAtSite,
        hasTmpBag,
        sourceItems: playerStore.isAtHome ? playerStore.storage : playerStore.bag,
        storageItems: storage.save(),
        storageItemCount: Object.keys(storage.save()).length
      })
    }
    
    return storage
  }, [dialogData, playerStore.isAtHome, playerStore.isAtSite, playerStore.storage, playerStore.bag, hasTmpBag])
  
  // Only show items if tmpBag doesn't exist (original: if (!player.tmpBag))
  // Must be called before early return to follow Rules of Hooks
  const itemList = useMemo(() => {
    if (!dialogData || hasTmpBag) return []
    const items = getItemsForAttribute(attr, storage)
    console.log('[AttributeDialog] Item list for', attr, ':', items.length, 'items', items.map(({ item, num }: { item: Item; num: number }) => ({ itemId: item.id, num })))
    return items
  }, [dialogData, attr, storage, hasTmpBag])
  
  // Early return after all hooks are called
  if (!dialogData) return null
  
  // Get attribute value and max
  const getAttributeValue = (): { value: number; max: number } => {
    const attrKey = attr as keyof typeof playerStore
    const value = playerStore[attrKey] as number
    const maxKey = `${attr}Max` as keyof typeof playerStore
    const max = playerStore[maxKey] as number
    return { value, max }
  }
  
  const { value, max } = getAttributeValue()
  
  // Get attribute display string
  const getAttributeDisplayString = (): string => {
    if (attr === 'hp' || attr === 'virus') {
      return `Current: ${value}/${max}`
    } else {
      // For others, format as "{attrStr} Current: {value}/{max}"
      // For now, just use "Current: {value}/{max}" until string system is implemented
      const attrName = attr.charAt(0).toUpperCase() + attr.slice(1)
      return `${attrName} Current: ${value}/${max}`
    }
  }
  
  // Get attribute name from string system
  const getAttributeName = (): string => {
    // Map attribute names to string IDs (same as StatusDialog)
    const attrToStringId: Record<string, number> = {
      injury: 10,
      infect: 9,
      starve: 6,
      vigour: 7,
      spirit: 8,
      water: 14,
      virus: 15,
      hp: 5
    }
    const stringId = attrToStringId[attr]
    if (stringId) {
      const config = getString(String(stringId))
      if (typeof config === 'object' && config !== null && 'title' in config) {
        return config.title as string
      }
    }
    return attr // Fallback
  }
  
  // Get attribute description from string system
  const getAttributeDescription = (): string => {
    // Map attribute names to string IDs (same as StatusDialog)
    const attrToStringId: Record<string, number> = {
      injury: 10,
      infect: 9,
      starve: 6,
      vigour: 7,
      spirit: 8,
      water: 14,
      virus: 15,
      hp: 5
    }
    const stringId = attrToStringId[attr]
    if (stringId) {
      const config = getString(String(stringId))
      if (typeof config === 'object' && config !== null && 'des' in config) {
        return config.des as string
      }
    }
    // Fallback descriptions
    const descriptions: Record<string, string> = {
      injury: 'Injury affects your health. Use bandages to treat injuries.',
      infect: 'Infection can be dangerous. Use medicine to treat infections.',
      starve: 'Hunger decreases over time. Eat food to restore hunger.',
      vigour: 'Vigour affects your energy. Rest to restore vigour.',
      spirit: 'Spirit affects your mood. Maintain good spirit.',
      water: 'Water is essential for survival. Drink water regularly.',
      virus: 'Virus is a dangerous condition. Manage it carefully.',
      hp: 'HP is your health points. Keep it high to survive.'
    }
    return descriptions[attr] || `This is the ${attr} attribute.`
  }
  
  const attributeName = getAttributeName()
  const attributeDescription = getAttributeDescription()
  const valueDisplay = getAttributeDisplayString()
  
  // Handle close
  const handleClose = () => {
    uiStore.hideOverlay()
  }
  
  // Handle item use
  const handleItemUse = (itemId: string) => {
    // Create storage instance from appropriate source
    const storage = new Storage('temp')
    if (playerStore.isAtHome) {
      // Use storage items - restore directly to avoid weight checks
      storage.restore(playerStore.storage)
    } else {
      // Use bag items
      storage.restore(playerStore.bag)
    }
    
    // Use item directly (same as original game)
    const res = playerStore.useItem(storage, itemId)
    
    // Update storage in playerStore
    // useItem already updates storage if name === 'player', but we're using 'temp'
    // So we need to manually update the store
    if (playerStore.isAtHome) {
      const storageState = storage.save()
      usePlayerStore.setState({ storage: storageState })
    } else {
      const bagState = storage.save()
      usePlayerStore.setState({ bag: bagState })
    }
    
    if (!res.result) {
      // Show error message if needed
      if (res.type === 1) {
        uiStore.addNotification('Not enough items', 'warning')
      } else if (res.type === 2) {
        uiStore.addNotification("This item can't be used", 'warning')
      }
    }
    // Dialog stays open to show updated values (user can close manually)
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
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={(e) => {
        // Don't close on overlay click (autoDismiss = false in original)
        // Only close button dismisses
        if (e.target === e.currentTarget) {
          // Clicked on overlay background, but we don't close (autoDismiss = false)
        }
      }}
      data-test-id="attribute-dialog-overlay"
    >
      {/* Dark background overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
        }}
      />
      
      {/* Dialog container - centered */}
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
        data-test-id="attribute-dialog"
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
          {/* Attribute icon */}
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
              frame={`icon_${attr}_0.png`}
              className="w-full h-full"
            />
          </div>
          
          {/* Attribute title */}
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
            data-test-id="attribute-dialog-title"
          >
            {attributeName}
          </div>
          
          {/* Current value (txt_1) */}
          <div
            className="absolute text-black"
            style={{
              left: `${leftEdge + 70}px`,
              top: '55%',
              fontSize: '20px',
              fontFamily: "'Noto Sans', sans-serif"
            }}
            data-test-id="attribute-dialog-value"
          >
            {valueDisplay}
          </div>
        </div>
        
        {/* Content section */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: '0',
            top: `${titleHeight}px`,
            width: `${dialogWidth}px`,
            height: `${contentHeight}px`
          }}
        >
          {/* Description */}
          {/* Original: des.setPosition(leftEdge, contentHeight - 20) with anchor (0, 1) */}
          {/* Cocos Y = contentHeight - 20 means 20px from top, so CSS top = 20px */}
          <div
            className="absolute text-black"
            style={{
              left: `${leftEdge}px`,
              top: '20px',
              width: `${dialogWidth - leftEdge * 2}px`,
              fontSize: '20px',
              fontFamily: "'Noto Sans', sans-serif",
              lineHeight: '1.4'
            }}
            data-test-id="attribute-dialog-description"
          >
            {attributeDescription}
          </div>
          
          {/* Buff display (placeholder - will be implemented when buff system is ready) */}
          {/* TODO: Add buff effect and time display when buff system is implemented */}
          
          {/* Item list - horizontal scrollable grid (matching original game TableView) */}
          {/* Original: itemTableView.x = 20, itemTableView.y = 2 (2px from bottom of contentNode) */}
          {itemList.length > 0 && (
            <div
              className="absolute"
              style={{
                left: `${leftEdge}px`,
                bottom: '2px',
                width: '400px',
                height: '100px',
                overflowX: 'auto',
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin'
              }}
              data-test-id="attribute-dialog-item-list"
            >
              <div
                className="flex"
                style={{
                  width: 'max-content',
                  minWidth: '100%',
                  height: '100px',
                  gap: '0px'
                }}
              >
                {itemList.map(({ item, num }: { item: Item; num: number }) => {
                  // Determine background based on item type (same logic as ItemCell)
                  const getBackgroundFrame = (): string => {
                    // Equipment items (type 13, but not OTHER)
                    if (item.getType(0) === '13' && item.getType(1) !== '05') {
                      return 'item_equip_bg.png'
                    }
                    // Basic items
                    if (item.id === '1102063' || item.id === '1102073') {
                      return 'item_basic_bg.png'
                    }
                    // Bullet items
                    if (item.id === '1305011' || item.id === '1305012') {
                      return 'item_bullet_bg.png'
                    }
                    // Default background
                    return 'item_bg.png'
                  }
                  
                  return (
                    <div
                      key={item.id}
                      className="flex-shrink-0 relative cursor-pointer"
                      style={{
                        width: '100px',
                        height: '100px'
                      }}
                      onClick={() => handleItemUse(item.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.2)'
                        e.currentTarget.style.transition = 'transform 0.1s'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                      data-test-id={`attribute-dialog-item-${item.id}`}
                    >
                      {/* Background - 100x100, fills entire cell */}
                      <Sprite
                        atlas="ui"
                        frame={getBackgroundFrame()}
                        className="absolute"
                        style={{
                          left: '0',
                          top: '0',
                          width: '100px',
                          height: '100px'
                        }}
                      />
                      
                      {/* Item icon - centered in cell, larger size */}
                      <div
                        className="absolute"
                        style={{
                          left: '50px',
                          top: '50px',
                          transform: 'translate(-50%, -50%)',
                          width: '80px',
                          height: '80px',
                          pointerEvents: 'none'
                        }}
                      >
                        <Sprite
                          atlas="icon"
                          frame={`icon_item_${item.id}.png`}
                          className="w-full h-full"
                        />
                      </div>
                      
                      {/* Count label - bottom-right corner with black stroke */}
                      {/* Original: x = bg.width - 4, y = 4 (4px from right, 4px from bottom) */}
                      <div
                        className="absolute text-white"
                        style={{
                          right: '4px',
                          bottom: '4px',
                          fontSize: '18px',
                          fontFamily: "'Noto Sans', sans-serif",
                          fontWeight: 'bold',
                          textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
                          lineHeight: '1',
                          pointerEvents: 'none'
                        }}
                        data-test-id={`attribute-dialog-item-count-${item.id}`}
                      >
                        {num}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Virus exchange buttons (placeholder - only for virus attribute) */}
          {attr === 'virus' && (
            <div
              className="mt-4"
              style={{
                paddingLeft: `${leftEdge}px`,
                paddingRight: `${leftEdge}px`
              }}
            >
              <div
                className="text-red-600 mb-2"
                style={{
                  fontSize: '18px',
                  fontFamily: "'Noto Sans', sans-serif"
                }}
              >
                Virus Exchange (TODO: Implement)
              </div>
            </div>
          )}
        </div>
        
        {/* Action section */}
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
            text={getString('statusDialog.action.btn_1.txt')}
            position={{ x: 50, y: 50 }}
            onClick={handleClose}
            enabled={true}
          />
        </div>
      </div>
    </div>
  )
}

