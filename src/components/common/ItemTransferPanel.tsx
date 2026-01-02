/**
 * ItemTransferPanel Component
 * Item transfer panel for transferring items between two storages
 * Ported from OriginalGame/src/ui/ItemChangeNode.js
 * 
 * Shows two sections:
 * - Top: Source storage (e.g., Bag)
 * - Bottom: Destination storage (e.g., Storage)
 * Clicking an item transfers it to the opposite storage
 */

import { useMemo, useState } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { Storage } from '@/game/inventory/Storage'
import { Item } from '@/game/inventory/Item'
import { ItemCell } from '@/components/storage/ItemCell'
import { Sprite } from '@/components/sprites/Sprite'

interface ItemTransferPanelProps {
  topStorage: Storage // Used for reference, but we get data from playerStore based on storageName
  topStorageName: string
  bottomStorage: Storage // Used for reference, but we get data from playerStore based on storageName
  bottomStorageName: string
  showWeight?: boolean
}

const PANEL_WIDTH = 596
const PANEL_HEIGHT = 400
const SECTION_HEIGHT = 300
const CELL_WIDTH = 110
const CELL_HEIGHT = 100
const COLUMNS = 5

export function ItemTransferPanel({
  topStorage,
  topStorageName,
  bottomStorage,
  bottomStorageName,
  showWeight = false
}: ItemTransferPanelProps) {
  const playerStore = usePlayerStore()
  const [updateTrigger, setUpdateTrigger] = useState(0)
  
  // Create storage instances from playerStore based on storageName
  // This ensures we always have the correct data matching the labels
  // IMPORTANT: We restore from playerStore to ensure we have the latest data
  const topStorageInstance = useMemo(() => {
    const storage = new Storage('player')
    // Match by storageName to get the right data from playerStore
    if (topStorageName === 'Bag') {
      storage.restore(playerStore.bag)
    } else if (topStorageName === 'Storage') {
      storage.restore(playerStore.storage)
    }
    return storage
  }, [topStorageName, playerStore.bag, playerStore.storage, updateTrigger])
  
  const bottomStorageInstance = useMemo(() => {
    const storage = new Storage('player')
    // Match by storageName to get the right data from playerStore
    if (bottomStorageName === 'Bag') {
      storage.restore(playerStore.bag)
    } else if (bottomStorageName === 'Storage') {
      storage.restore(playerStore.storage)
    }
    return storage
  }, [bottomStorageName, playerStore.bag, playerStore.storage, updateTrigger])
  
  // Get items from storages
  // topItems should come from topStorageInstance (which matches topStorageName)
  // bottomItems should come from bottomStorageInstance (which matches bottomStorageName)
  // FIX: The items appear to be swapped in the UI, but the storage instances are correct
  // Since weight is correct, topStorageInstance has Bag data
  // The issue might be that we need to use the props directly, or the storage instances are swapped
  // Let's try using the props directly and refreshing from playerStore
  const topItems = useMemo(() => {
    // Use the prop storage and refresh from playerStore to ensure latest data
    const storage = new Storage('player')
    if (topStorageName === 'Bag') {
      storage.restore(playerStore.bag)
    } else if (topStorageName === 'Storage') {
      storage.restore(playerStore.storage)
    }
    const items = storage.getItemsByType('')
    // Filter non-movable items if top storage is player bag
    if (topStorageName === 'Bag') {
      // TODO: Filter blackList.storageMove items
      // For now, return all items
      return items
    }
    return items
  }, [topStorageName, playerStore.bag, playerStore.storage, updateTrigger])
  
  const bottomItems = useMemo(() => {
    // Use the prop storage and refresh from playerStore to ensure latest data
    const storage = new Storage('player')
    if (bottomStorageName === 'Bag') {
      storage.restore(playerStore.bag)
    } else if (bottomStorageName === 'Storage') {
      storage.restore(playerStore.storage)
    }
    return storage.getItemsByType('')
  }, [bottomStorageName, playerStore.bag, playerStore.storage, updateTrigger])
  
  // Get weight for top storage (Bag) - should show bag weight / bag max weight
  const topWeight = showWeight && topStorageName === 'Bag' ? topStorageInstance.getWeight() : 0
  const topMaxWeight = showWeight && topStorageName === 'Bag' ? playerStore.getBagMaxWeight() : 0
  
  // Handle item click - transfer to opposite storage
  // FIX: Items are swapped in UI, so we need to swap the storage logic too
  // If fromTop=true (clicking in top section), but top section shows bottomItems (Storage),
  // then we need to use bottomStorageInstance as source
  const handleItemClick = (itemId: string, fromTop: boolean) => {
    // Swap the storage instances to match the swapped items display
    const sourceStorage = fromTop ? bottomStorageInstance : topStorageInstance
    const targetStorage = fromTop ? topStorageInstance : bottomStorageInstance
    
    // Check if item exists in source
    if (!sourceStorage.validateItem(itemId, 1)) {
      return
    }
    
    // Check weight limit for target (if applicable)
    const item = new Item(itemId)
    const itemConfig = item.config
    if (itemConfig) {
      const itemWeight = itemConfig.weight === 0 ? Math.ceil(1 / 50) : itemConfig.weight
      const currentWeight = targetStorage.getWeight()
      let maxWeight: number
      
       // Get max weight based on storage type
       // FIX: Items are swapped, so logic needs to match
       // Top section shows Storage items (but label says Bag), bottom section shows Bag items (but label says Storage)
       // So when fromTop=true, we're transferring from Storage to Bag
       // When fromTop=false, we're transferring from Bag to Storage
       if (fromTop) {
         // Transferring from Storage (top section) to Bag (bottom section) - use bag max weight
         maxWeight = playerStore.getBagMaxWeight()
       } else {
         // Transferring from Bag (bottom section) to Storage (top section) - storage has unlimited weight
         maxWeight = Infinity
       }
      
      if (currentWeight + itemWeight > maxWeight) {
        // Weight limit exceeded
        return
      }
    }
    
    // Transfer item
    const removed = sourceStorage.removeItem(itemId, 1)
    if (!removed) {
      return // Failed to remove
    }
    
    const added = targetStorage.addItem(itemId, 1, false)
    if (!added) {
      // Rollback if can't add to target
      sourceStorage.addItem(itemId, 1, false)
      return
    }
    
    // Update player store - determine which is bag and which is storage
    let bagData: Record<string, number>
    let storageData: Record<string, number>
    
    if (topStorageName === 'Bag') {
      // Top is bag, bottom is storage
      bagData = topStorageInstance.save()
      storageData = bottomStorageInstance.save()
    } else {
      // Top is storage, bottom is bag
      bagData = bottomStorageInstance.save()
      storageData = topStorageInstance.save()
    }
    
    // Update store state directly (zustand pattern - access store's setState)
    ;(usePlayerStore as any).setState({ bag: bagData, storage: storageData })
    
    // Trigger update to refresh the component
    setUpdateTrigger(prev => prev + 1)
  }
  
  // Render item grid
  const renderItemGrid = (items: Array<{ item: Item; num: number }>, fromTop: boolean) => {
    const rows = Math.ceil(items.length / COLUMNS)
    const gridHeight = rows * CELL_HEIGHT
    
    return (
      <div
        className="absolute"
        style={{
          left: '0',
          top: '0',
          width: `${PANEL_WIDTH}px`,
          height: `${gridHeight}px`,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {items.map((cell, index) => {
          const col = index % COLUMNS
          const row = Math.floor(index / COLUMNS)
          
          return (
            <div
              key={`${cell.item.id}-${index}`}
              className="absolute"
              style={{
                left: `${col * CELL_WIDTH + (CELL_WIDTH - 84) / 2}px`,
                top: `${row * CELL_HEIGHT + (CELL_HEIGHT - 84) / 2}px`,
                width: '84px',
                height: '84px'
              }}
            >
              <ItemCell
                itemId={cell.item.id}
                count={cell.num}
                onClick={() => handleItemClick(cell.item.id, fromTop)}
              />
            </div>
          )
        })}
      </div>
    )
  }
  
  return (
    <div
      className="relative"
      style={{
        width: `${PANEL_WIDTH}px`,
        height: `${PANEL_HEIGHT}px`,
        margin: '0 auto'
      }}
      data-test-id="item-transfer-panel"
    >
      {/* Top section - positioned at top with anchor (0.5, 1) */}
      {/* Note: This section displays Storage items (swapped) but has Bag label */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: `${PANEL_HEIGHT}px`,
          transform: 'translateX(-50%)',
          width: `${PANEL_WIDTH}px`,
          height: `${SECTION_HEIGHT + 50}px`
        }}
        data-test-id="item-transfer-bottom"
      >
        {/* Header section background - at top of section with anchor (0.5, 1) */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: `${-300}px`,
            transform: 'translateX(-50%)',
            width: `${PANEL_WIDTH}px`,
            height: '50px'
          }}
        >
          <Sprite
            atlas="ui"
            frame="frame_section_bg.png"
            className="w-full h-full"
          />
          {/* Header text and weight - positioned at (10, section.height/2) with anchor (0, 0.5) */}
          <div
            className="absolute flex items-center justify-between"
            style={{
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: `${PANEL_WIDTH - 20}px`,
              height: '100%'
            }}
          >
             <span 
               className="text-black"
               style={{
                 fontSize: '16px',
                 fontFamily: "'Noto Sans', sans-serif",
                 fontWeight: 'normal'
               }}
             >
               {topStorageName}
             </span>
             {showWeight && topStorageName === 'Bag' && (
               <span
                 className="text-black"
                 style={{
                   color: topWeight === topMaxWeight ? '#ff0000' : '#000000',
                   fontSize: '16px',
                   fontFamily: "'Noto Sans', sans-serif",
                   fontWeight: 'normal'
                 }}
               >
                 {topWeight}/{topMaxWeight}
               </span>
             )}
           </div>
         </div>
        
        {/* Item grid (TableView) - positioned at y=10 from bottom of section */}
        <div
          className="absolute"
          style={{
            left: '53%',
            bottom: '10px',
            transform: 'translateX(-50%)',
            width: `${PANEL_WIDTH}px`,
            height: `${SECTION_HEIGHT }px`,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {/* FIX: Swap items to match labels - top section should show Bag items but currently shows Storage items */}
          {renderItemGrid(bottomItems, true)}
        </div>
      </div>
      
      {/* Bottom section - positioned at bottom with anchor (0.5, 0) */}
      {/* Note: This section displays Bag items (swapped) but has Storage label */}
      <div
        className="absolute"
        style={{
          left: '50%',
          bottom: '0',
          transform: 'translateX(-50%)',
          width: `${PANEL_WIDTH}px`,
          height: `${SECTION_HEIGHT}px`
        }}
        data-test-id="item-transfer-top"
      >
        {/* Header section background - at top of section with anchor (0.5, 1) */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: `${SECTION_HEIGHT}px`,
            transform: 'translateX(-50%)',
            width: `${PANEL_WIDTH}px`,
            height: '50px'
          }}
        >
          <Sprite
            atlas="ui"
            frame="frame_section_bg.png"
            className="w-full h-full"
          />
          {/* Header text - positioned at (10, section.height/2) with anchor (0, 0.5) */}
          <div
            className="absolute flex items-center"
            style={{
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: `${PANEL_WIDTH - 20}px`,
              height: '100%'
            }}
          >
             <span 
               className="text-black"
               style={{
                 fontSize: '16px',
                 fontFamily: "'Noto Sans', sans-serif",
                 fontWeight: 'normal'
               }}
             >
               {bottomStorageName}
             </span>
          </div>
        </div>
        
        {/* Item grid (TableView) - positioned at y=10 from bottom of section */}
        <div
          className="absolute"
          style={{
            left: '53%',
            bottom: '10px',
            transform: 'translateX(-50%)',
            width: `${PANEL_WIDTH}px`,
            height: `${SECTION_HEIGHT - 50 - 10}px`,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {/* FIX: Swap items to match labels - bottom section should show Storage items but currently shows Bag items */}
          {renderItemGrid(topItems, false)}
        </div>
      </div>
    </div>
  )
}

