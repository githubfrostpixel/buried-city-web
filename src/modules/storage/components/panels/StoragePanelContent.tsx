/**
 * StoragePanelContent Component
 * Storage panel showing player's storage items organized by category
 * Ported from OriginalGame/src/ui/storageNode.js
 * 
 * Features:
 * - Scrollable item list grouped by type
 * - Item sections: Materials, Food, Medicines, Enhancement, Equipment, Miscellaneous
 * - Item cells with icons and counts
 * - Shop button (if IAP unlocked - stub for now)
 */

import { useEffect, useState, useMemo } from 'react'
import { usePlayerStore } from '@/core/store/playerStore'
import { useUIStore } from '@/core/store/uiStore'
import { Storage } from '@/core/game/inventory/Storage'
import { Item } from '@/core/game/inventory/Item'
import { ItemSection } from '@/modules/storage/components/shared/ItemSection'
import { BOTTOM_BAR_LAYOUT } from '@/shared/constants/layoutConstants'
import { emitter } from '@/shared/utils/emitter'
import { Sprite } from '@/shared/components/sprites/Sprite'
import { checkStarve } from '@/shared/utils/ui/uiUtil'

// Item type categories (from string 3006)
// English: ["Materials ", "Food ", "Medicines ", "Enhancement ", "Equipment ", "Miscellaneous "]
const TYPE_NAMES = [
  'Materials ',
  'Food ',
  'Medicines ',
  'Enhancement ',
  'Equipment ',
  'Miscellaneous '
]

const TYPE_PREFIXES = [
  '1101',  // Materials
  '1103',  // Food
  '1104',  // Medicines
  '1107',  // Enhancement
  '13',    // Equipment
  'other'  // Miscellaneous (catch-all)
]

export function StoragePanelContent() {
  const playerStore = usePlayerStore()
  const uiStore = useUIStore()
  const [updateTrigger, setUpdateTrigger] = useState(0)
  
  // Create Storage instance from playerStore.storage
  const storage = useMemo(() => {
    const storageInstance = new Storage('player')
    storageInstance.restore(playerStore.storage)
    return storageInstance
  }, [playerStore.storage, updateTrigger])
  
  // Group items by type
  const groupedItems = useMemo(() => {
    const itemsGroup = storage.getItemsByTypeGroup(TYPE_PREFIXES)
    return TYPE_PREFIXES.map((key, index) => ({
      title: TYPE_NAMES[index],
      items: itemsGroup[key].map(cell => ({
        itemId: cell.item.id,
        count: cell.num
      }))
    })).filter(section => section.items.length > 0)
  }, [storage])
  
  // Handle item click - show item dialog
  const handleItemClick = (itemId: string) => {
    uiStore.showItemDialog(itemId, 'storage', false)
  }
  
  // Handle item use - use item from storage
  useEffect(() => {
    const handleItemUse = (data: { itemId: string; source: string }) => {
      if (data.source !== 'storage') return
      
      // Check if food item and starve is max
      const item = new Item(data.itemId)
      if (item.isType('11', '03')) {
        // Food item - check starve
        if (!checkStarve()) {
          return // Can't eat when full
        }
      }
      
      // Create storage instance from playerStore.storage
      const storage = new Storage('player')
      storage.restore(playerStore.storage)
      
      // Use item
      const res = playerStore.useItem(storage, data.itemId)
      
      // Close ItemDialog after item use (unless death occurred)
      // Use setTimeout to ensure death overlay state has been set if death occurred
      setTimeout(() => {
        const currentOverlay = useUIStore.getState().activeOverlay
        if (currentOverlay !== 'death') {
          useUIStore.getState().hideOverlay()
        }
      }, 0)
      
      if (res.result) {
        // Storage state is updated by useItem internally via set()
        // Just trigger UI update
        setUpdateTrigger(prev => prev + 1)
      } else {
        // Show error message if needed
        if (res.type === 1) {
          uiStore.addNotification('Not enough items', 'warning')
        } else if (res.type === 2) {
          uiStore.addNotification("This item can't be used", 'warning')
        }
      }
    }
    
    emitter.on('item_use', handleItemUse)
    emitter.on('btn_1_click', handleItemUse)
    
    return () => {
      emitter.off('item_use', handleItemUse)
      emitter.off('btn_1_click', handleItemUse)
    }
  }, [playerStore, uiStore])
  
  // Listen to storage changes
  useEffect(() => {
    setUpdateTrigger(prev => prev + 1)
  }, [playerStore.storage])
  
  // SectionTableView dimensions
  // Original: size(640, 750), positioned at ((bgWidth - 640) / 2, 10) from bottom of bg
  // In CSS: positioned relative to content area, 10px from top, centered
  const tableViewWidth = 640
  const tableViewHeight = 750
  const tableViewTop = 10 // 10px from top of content area (not from screen)
  const contentHeight = BOTTOM_BAR_LAYOUT.content.height
  const maxHeight = contentHeight - tableViewTop
  
  // Calculate total height of all sections
  // Section layout: title (50px) at top, then items below
  const totalHeight = groupedItems.reduce((sum, section) => {
    const rows = Math.ceil(section.items.length / 5)
    const titleHeight = section.title ? 50 : 0
    const sectionHeight = titleHeight + rows * 100
    return sum + sectionHeight
  }, 0)
  
  // Shop button visibility (stub - always false for now)
  const showShopButton = false // TODO: Check IAP unlock status
  
  return (
    <div className="relative w-full h-full">
      {/* Scrollable item list container - relative to content area */}
      <div
        className="absolute custom-scrollbar"
        style={{
          left: '50%',
          top: `${tableViewTop}px`,
          transform: 'translateX(-50%)',
          width: `${tableViewWidth}px`,
          height: `${Math.min(tableViewHeight, maxHeight)}px`,
          overflow: 'auto',
          overflowX: 'hidden'
        }}
        data-test-id="storage-table-view"
      >
        {/* Sections - stack from top to bottom */}
        <div
          className="relative"
          style={{
            width: `${tableViewWidth}px`,
            minHeight: `${totalHeight}px`
          }}
        >
          {groupedItems.map((section, sectionIndex) => {
            // Calculate Y position (sections stack from top, anchored at top)
            // Section layout: title (50px) at top, then items below
            let sectionTop = 0
            for (let i = 0; i < sectionIndex; i++) {
              const prevRows = Math.ceil(groupedItems[i].items.length / 5)
              const prevTitleHeight = groupedItems[i].title ? 50 : 0
              sectionTop += prevTitleHeight + prevRows * 100
            }
            
            return (
              <div
                key={section.title}
                className="absolute"
                style={{
                  left: '50%',
                  top: `${sectionTop}px`,
                  transform: 'translateX(-50%)',
                  width: '550px' // 5 columns * 110px
                }}
              >
                <ItemSection
                  title={section.title}
                  items={section.items}
                  onItemClick={handleItemClick}
                />
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Shop button - positioned relative to content area (if IAP unlocked) */}
      {/* Note: Shop button should be in action bar, but action bar is in BottomSection, not here */}
      {/* For now, this is a placeholder - shop button should be handled by BottomSection if needed */}
      {showShopButton && (
        <button
          onClick={() => {
            // TODO: Navigate to shop panel
            console.log('Shop button clicked')
          }}
          className="absolute"
          style={{
            right: `${BOTTOM_BAR_LAYOUT.actionBar.rightButtonX}px`,
            top: `${-BOTTOM_BAR_LAYOUT.content.top + BOTTOM_BAR_LAYOUT.actionBar.paddingTop}px`,
            width: '100px',
            height: '70px',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
          data-test-id="storage-shop-btn"
        >
          <Sprite
            atlas="ui"
            frame="btn_shop.png"
            className="w-full h-full block"
          />
        </button>
      )}
    </div>
  )
}

