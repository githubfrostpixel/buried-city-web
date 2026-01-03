/**
 * WorkRoomStorageView Component
 * Work room item collection view
 */

import React, { useMemo, useRef, useCallback, useEffect } from 'react'
import { Site } from '@/game/world/Site'
import { Room } from '@/types/site.types'
import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'
import { BOTTOM_BAR_LAYOUT } from '@/components/layout/layoutConstants'
import { EquipPanel } from '@/components/common/EquipPanel'
import { ItemTransferPanel } from '@/components/common/ItemTransferPanel'
import { CommonListItemButton } from '@/components/common/CommonListItemButton'
import { Storage } from '@/game/inventory/Storage'
import { Bag } from '@/game/inventory/Bag'
import { Item } from '@/game/inventory/Item'
import { saveAll } from '@/game/systems/SaveSystem'
import { EQUIP_PANEL_HEIGHT, SEPARATOR_HEIGHT } from './constants'

interface WorkRoomStorageViewProps {
  room: Room
  site: Site
  onNextRoom: () => void
  onBack: () => void
  flushRef?: React.MutableRefObject<(() => void) | null>
}

export function WorkRoomStorageView({ room, site, onNextRoom, onBack, flushRef }: WorkRoomStorageViewProps) {
  const playerStore = usePlayerStore.getState()
  const setWorkStorageFlushFunction = useUIStore(state => state.setWorkStorageFlushFunction)
  const hasFlushedRef = useRef(false)
  // Store initial items in ref to prevent recreation from empty room.list
  const initialItemsRef = useRef<Record<string, number> | null>(null)

  // Create temporary storage from room.list
  // CRITICAL: Check if items have already been flushed (room-level flag) to prevent duplication
  const tempStorage = useMemo(() => {
    const storage = new Storage('temp')
    console.log('[WorkRoomStorageView] Creating temp storage from room:', {
      roomType: room.type,
      listLength: Array.isArray(room.list) ? room.list.length : 'not array',
      list: room.list,
      itemsFlushed: room.itemsFlushed
    })
    
    // CRITICAL: If items have already been flushed from this room, don't create tempStorage from room.list
    // This prevents duplication when room.list is restored from save data
    if (room.type === 'work' && Array.isArray(room.list) && !room.itemsFlushed) {
      let itemCounts: Record<string, number> = {}
      
      // If we have stored initial items (from previous render), use those instead of room.list
      // This prevents recreation from empty room.list after it's been cleared
      if (initialItemsRef.current) {
        itemCounts = { ...initialItemsRef.current }
      } else if (room.list.length > 0) {
        // First time: count items from room.list and store in ref
        room.list.forEach((item: Item) => {
          if (item && item.id) {
            itemCounts[item.id] = (itemCounts[item.id] || 0) + 1
          } else {
            console.warn('[WorkRoomStorageView] Invalid item in room.list:', item)
          }
        })
        // Store initial items in ref for future recreations
        initialItemsRef.current = { ...itemCounts }
      } else {
        // room.list is empty and no stored items - this shouldn't happen on first render
        console.warn('[WorkRoomStorageView] room.list is empty and no stored items - creating empty tempStorage')
      }
      
      // Add items to storage
      Object.entries(itemCounts).forEach(([itemId, count]) => {
        storage.increaseItem(itemId, count, false)
      })
      console.log('[WorkRoomStorageView] Temp storage created with items:', storage.items)
    } else if (room.type === 'work' && room.itemsFlushed) {
      console.log('[WorkRoomStorageView] Items already flushed from this room, creating empty tempStorage')
    } else {
      console.warn('[WorkRoomStorageView] Room is not work type or list is not array:', {
        type: room.type,
        isArray: Array.isArray(room.list)
      })
    }
    return storage
  }, [room])

  // Create bag storage - use Bag class for dynamic maxWeight
  const bagStorage = useMemo(() => {
    const bag = new Bag()
    bag.restore(playerStore.bag)
    return bag
  }, [playerStore.bag])
  
  // Callbacks to persist storage changes
  const handleTopStorageUpdate = (storage: Storage) => {
    // Save bag back to playerStore
    usePlayerStore.setState({ bag: storage.save() })
  }
  
  const handleBottomStorageUpdate = (storage: Storage) => {
    // For work room, tempStorage is temporary UI state that will be flushed to site.storage later
    // No need to persist tempStorage - flushItems() handles that
    // This callback can be empty or just trigger a re-render if needed
  }

  // Flush items to site storage (only once)
  const flushItems = useCallback(() => {
    // Check both component-level ref and room-level flag to prevent duplication
    if (hasFlushedRef.current || room.itemsFlushed) {
      console.log('[WorkRoomStorageView] Items already flushed, skipping', { hasFlushedRef: hasFlushedRef.current, roomItemsFlushed: room.itemsFlushed })
      return
    }
    
    hasFlushedRef.current = true
    console.log('[WorkRoomStorageView] Flushing items to depository:', tempStorage.items)
    
    // Transfer all items from tempStorage to site.storage (don't remove from source - tempStorage is temporary)
    const result = tempStorage.transferAll(site.storage, false)
    
    // Set haveNewItems flag (site.increaseItem does this automatically, but we're using transferAll directly)
    site.haveNewItems = true
    
    // CRITICAL FIX: Mark room as flushed and clear room.list to prevent duplication
    // This prevents tempStorage from being recreated with original items when room.list is restored from save data
    if (room.type === 'work' && Array.isArray(room.list)) {
      // Mark room as flushed - this flag is saved/restored, preventing duplication on restore
      room.itemsFlushed = true
      room.list = []
      // Also clear the initial items ref since we've flushed
      initialItemsRef.current = null
    }
    
    console.log('[WorkRoomStorageView] Site storage after flush:', site.storage.items)
    if (result.failed > 0) {
      console.warn('[WorkRoomStorageView] Some items failed to transfer:', result.failed)
    }
    
    saveAll().catch(err => console.error('Auto-save failed:', err))
  }, [tempStorage, site, room])

  // Expose flush function via ref so parent can call it when navigating away
  useEffect(() => {
    if (flushRef) {
      flushRef.current = flushItems
    }
    // Also expose via uiStore so MainScene can call it
    setWorkStorageFlushFunction(flushItems)
    return () => {
      // CRITICAL: Call flush function before clearing it, in case component unmounts before MainScene can call it
      const flushFn = useUIStore.getState().workStorageFlushFunction
      if (flushFn) {
        console.log('[WorkRoomStorageView] Component unmounting, calling flush function')
        flushFn()
      }
      if (flushRef) {
        flushRef.current = null
      }
      setWorkStorageFlushFunction(null)
    }
  }, [flushItems, flushRef, setWorkStorageFlushFunction])

  const handleNextRoom = () => {
    // Explicitly flush before navigating
    flushItems()
    onNextRoom()
  }

  // Calculate positions (same as GatePanelContent)
  const contentTopLineHeight = BOTTOM_BAR_LAYOUT.cocosRef.contentTopLineHeight
  const contentHeight = BOTTOM_BAR_LAYOUT.content.height
  const equipPanelTop = contentHeight - contentTopLineHeight
  const itemTransferPanelTop = equipPanelTop + EQUIP_PANEL_HEIGHT + SEPARATOR_HEIGHT

  const workType = room.workType || 0
  const workRoomTypeName = `Work Room Type ${workType}` // TODO: Use string ID 3007[workType]

  return (
    <div className="relative w-full h-full">
      {/* EquipPanel at top */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: `${equipPanelTop}px`,
          transform: 'translateX(-50%)',
          width: '572px',
          height: `${EQUIP_PANEL_HEIGHT}px`,
          zIndex: 1,
          overflow: 'visible'
        }}
      >
        <EquipPanel />
      </div>

      {/* Separator line */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: `${equipPanelTop + EQUIP_PANEL_HEIGHT}px`,
          transform: 'translateX(-50%)',
          width: '596px',
          height: `${SEPARATOR_HEIGHT}px`,
          zIndex: 1
        }}
      />

      {/* ItemTransferPanel below EquipPanel */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: `${itemTransferPanelTop}px`,
          transform: 'translateX(-50%)',
          width: '596px',
          height: '400px',
          zIndex: 0
        }}
      >
        <ItemTransferPanel
          topStorage={bagStorage}
          topStorageName="Bag"
          bottomStorage={tempStorage}
          bottomStorageName={workRoomTypeName}
          showWeight={true}
          withTakeAll={true}
          onTopStorageUpdate={handleTopStorageUpdate}
          onBottomStorageUpdate={handleBottomStorageUpdate}
        />
      </div>

      {/* Next Room button */}
      <div
        className="absolute"
        style={{
          left: '50%',
          bottom: '20px',
          transform: 'translateX(-50%)',
        }}
      >
        <CommonListItemButton text="Next" onClick={handleNextRoom} enabled={true} />
      </div>
    </div>
  )
}

