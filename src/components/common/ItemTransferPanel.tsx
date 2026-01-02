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
import { audioManager, SoundPaths } from '@/game/systems/AudioManager'

interface ItemTransferPanelProps {
  topStorage: Storage // Used for reference, but we get data from playerStore based on storageName
  topStorageName: string
  bottomStorage: Storage // Used for reference, but we get data from playerStore based on storageName
  bottomStorageName: string
  showWeight?: boolean
  withTakeAll?: boolean // Show "Take All" button on bottom section
  siteId?: number // Site ID if bottom storage is site storage
}

const PANEL_WIDTH = 596
const PANEL_HEIGHT = 400
const SECTION_HEIGHT = 300
const CELL_WIDTH = 110
const CELL_HEIGHT = 100
const COLUMNS = 5

export function ItemTransferPanel({
  topStorage: _topStorage, // Used for reference type, actual data comes from playerStore
  topStorageName,
  bottomStorage: _bottomStorage, // Used for reference type, actual data comes from playerStore
  bottomStorageName,
  showWeight = false,
  withTakeAll = false,
  siteId
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
    // Handle site storage (Depository)
    if (bottomStorageName === 'Depository' && siteId) {
      const map = playerStore.map
      if (map) {
        const site = map.getSite(siteId)
        if (site) {
          const storage = new Storage('site')
          storage.restore(site.storage.save())
          return storage
        }
      }
      return new Storage('site')
    }
    
    const storage = new Storage('player')
    // Match by storageName to get the right data from playerStore
    if (bottomStorageName === 'Bag') {
      storage.restore(playerStore.bag)
    } else if (bottomStorageName === 'Storage') {
      storage.restore(playerStore.storage)
    }
    return storage
  }, [bottomStorageName, playerStore.bag, playerStore.storage, playerStore.map, siteId, updateTrigger])
  
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
    // Handle site storage (Depository)
    if (bottomStorageName === 'Depository' && siteId) {
      const map = playerStore.map
      if (map) {
        const site = map.getSite(siteId)
        if (site) {
          const storage = new Storage('site')
          storage.restore(site.storage.save())
          return storage.getItemsByType('')
        }
      }
      return []
    }
    
    // Use the prop storage and refresh from playerStore to ensure latest data
    const storage = new Storage('player')
    if (bottomStorageName === 'Bag') {
      storage.restore(playerStore.bag)
    } else if (bottomStorageName === 'Storage') {
      storage.restore(playerStore.storage)
    }
    return storage.getItemsByType('')
  }, [bottomStorageName, playerStore.bag, playerStore.storage, playerStore.map, siteId, updateTrigger])
  
  // Get weight for top storage (Bag) - should show bag weight / bag max weight
  const topWeight = showWeight && topStorageName === 'Bag' ? topStorageInstance.getWeight() : 0
  const topMaxWeight = showWeight && topStorageName === 'Bag' ? playerStore.getBagMaxWeight() : 0
  
  // Handle item click - transfer to opposite storage
  // Top section: displays Storage items (bottomItems) but has Bag label
  // Bottom section: displays Bag items (topItems) but has Storage label
  const handleItemClick = (itemId: string, fromTop: boolean) => {
    // Items are swapped in display, so swap storage instances
    // Top section shows Storage items, bottom section shows Bag items
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
       // Top section shows Storage items, bottom section shows Bag items
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
    const bagData = topStorageInstance.save() // Top is always Bag in site storage panel
    const storageData = bottomStorageInstance.save() // Bottom is always Depository (site storage) in site storage panel
    
    // Update bag in player store
    const updateState: any = { bag: bagData }
    
    // If this is site storage panel, update site storage in map
    if (siteId && bottomStorageName === 'Depository') {
      const map = playerStore.map
      if (map) {
        const site = map.getSite(siteId)
        if (site) {
          site.storage.restore(storageData)
          // Force map update in playerStore to trigger re-render
          // Save and restore map to create new reference
          const mapSave = map.save()
          map.restore(mapSave)
          // Update playerStore with new map reference
          updateState.map = map
        }
      }
    } else {
      // Regular player storage (Gate panel)
      updateState.storage = storageData
    }
    
    ;(usePlayerStore as any).setState(updateState)
    
    // Trigger update to refresh the component
    setUpdateTrigger(prev => prev + 1)
  }
  
  // Handle "Take All" button - transfer all items from bottom storage (site storage) to top storage (bag)
  const handleTakeAll = () => {
    if (!withTakeAll || !siteId) return
    
    const sourceStorage = bottomStorageInstance // Site storage
    const targetStorage = topStorageInstance // Bag
    
    // Get all items from source
    const allItems = sourceStorage.getItemsByType('')
    
    // Transfer each item, respecting weight limits
    let transferred = false
    for (const cell of allItems) {
      const itemId = cell.item.id
      const count = cell.num
      
      // Check weight for each item
      const item = new Item(itemId)
      const itemConfig = item.config
      if (itemConfig) {
        const itemWeight = itemConfig.weight === 0 ? Math.ceil(1 / 50) : itemConfig.weight
        const currentWeight = targetStorage.getWeight()
        const maxWeight = playerStore.getBagMaxWeight()
        
        // Calculate how many items can fit
        const availableWeight = maxWeight - currentWeight
        if (availableWeight <= 0) break // Bag is full
        
        const canFitCount = Math.floor(availableWeight / itemWeight)
        const transferCount = Math.min(count, canFitCount)
        
        if (transferCount > 0) {
          // Transfer items
          sourceStorage.removeItem(itemId, transferCount)
          targetStorage.addItem(itemId, transferCount, false)
          transferred = true
        }
      } else {
        // No weight config, transfer all
        sourceStorage.removeItem(itemId, count)
        targetStorage.addItem(itemId, count, false)
        transferred = true
      }
    }
    
    if (transferred) {
      // Update site storage in map
      const map = playerStore.map
      if (map) {
        const site = map.getSite(siteId)
        if (site) {
          site.storage.restore(sourceStorage.save())
          // Force map update in playerStore to trigger re-render
          const mapSave = map.save()
          map.restore(mapSave)
        }
      }
      
      // Update bag and map in player store
      ;(usePlayerStore as any).setState({ 
        bag: targetStorage.save(),
        map: map // Update map reference to trigger re-render
      })
      
      // Play sound effect
      audioManager.playEffect(SoundPaths.EXCHANGE)
      
      // Trigger update to refresh the component
      setUpdateTrigger(prev => prev + 1)
    }
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
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '-20px',
          transform: 'translateX(-50%)',
          width: `${PANEL_WIDTH}px`,
          height: `${SECTION_HEIGHT}px`
        }}
        data-test-id="item-transfer-top"
      >

        <div
          className="absolute"
          style={{
            left: '50%',
            top: `0px`,
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
          
          {renderItemGrid(topItems, false)}
        </div>
      </div>

      <div
        className="absolute"
        style={{
          left: '50%',
          bottom: `-220px`,
          transform: 'translateX(-50%)',
          width: `${PANEL_WIDTH}px`,
          height: `${SECTION_HEIGHT + 50}px`
        }}
        data-test-id="item-transfer-bottom"
      >

        <div
          className="absolute"
          style={{
            left: '50%',
            top: `-10px`,
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
               {bottomStorageName}
             </span>
             {withTakeAll && siteId && (
               <button
                 onClick={handleTakeAll}
                 className="relative"
                 style={{
                   width: '120px',
                   height: '40px',
                   background: 'transparent',
                   border: 'none',
                   cursor: 'pointer',
                   padding: 0
                 }}
                 data-test-id="take-all-btn"
               >
                 <Sprite
                   atlas="ui"
                   frame="btn_common_black_normal.png"
                   className="w-full h-full"
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Sprite
                     atlas="ui"
                     frame="btn_icon_take_all.png"
                     className="absolute"
                     style={{
                       left: '27px',
                       top: '50%',
                       transform: 'translateY(-50%)',
                       width: '20px',
                       height: '20px'
                     }}
                   />
                   <span
                     className="text-white"
                     style={{
                       fontSize: '14px',
                       fontFamily: "'Noto Sans', sans-serif",
                       fontWeight: 'normal',
                       marginLeft: '10px'
                     }}
                   >
                     Take All
                   </span>
                 </div>
               </button>
             )}
          </div>
          
         </div>
        

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

          {renderItemGrid(bottomItems, true)}
        </div>
      </div>
      

      
    </div>
  )
}

