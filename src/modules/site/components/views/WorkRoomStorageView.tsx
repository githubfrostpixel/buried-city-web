/**
 * WorkRoomStorageView Component
 * Work room item collection view
 */

import React, { useMemo, useCallback, useEffect } from 'react'
import { Site } from '@/core/game/world/Site'
import { Room } from '@/shared/types/site.types'
import { usePlayerStore } from '@/core/store/playerStore'
import { useUIStore } from '@/core/store/uiStore'
import { BOTTOM_BAR_LAYOUT } from '@/shared/constants/layoutConstants'
import { EquipPanel } from '@/shared/components/common/EquipPanel'
import { ItemTransferPanel } from '@/shared/components/common/ItemTransferPanel'
import { CommonListItemButton } from '@/shared/components/common/CommonListItemButton'
import { Storage } from '@/core/game/inventory/Storage'
import { Bag } from '@/core/game/inventory/Bag'
import { Item } from '@/core/game/inventory/Item'
import { saveAll } from '@/core/game/systems/SaveSystem'
import { EQUIP_PANEL_HEIGHT, SEPARATOR_HEIGHT } from './constants'
import { getString } from '@/shared/utils/i18n/stringUtil'

interface WorkRoomStorageViewProps {
  room: Room
  site: Site
  onNextRoom: () => void
  flushRef?: React.MutableRefObject<(() => void) | null>
}

export function WorkRoomStorageView({ room, site, onNextRoom, flushRef }: WorkRoomStorageViewProps) {
  const playerStore = usePlayerStore.getState()
  const setWorkStorageFlushFunction = useUIStore(state => state.setWorkStorageFlushFunction)

  // Get or create tempStorage from room
  const tempStorage = useMemo(() => {
    // Return existing if already created
    if (room.tempStorage) {
      return room.tempStorage
    }
    
    // Create new storage for work rooms
    if (room.type === 'work' && !room.itemsFlushed) {
      const storage = new Storage('temp')
      
      // Initialize from room.list if items exist
      if (Array.isArray(room.list) && room.list.length > 0) {
        console.log('[WorkRoomStorageView] Initializing tempStorage from room.list')
        const itemCounts: Record<string, number> = {}
        room.list.forEach((item: Item) => {
          if (item && item.id) {
            itemCounts[item.id] = (itemCounts[item.id] || 0) + 1
          }
        })
        
        Object.entries(itemCounts).forEach(([itemId, count]) => {
          storage.increaseItem(itemId, count, false)
        })
      }
      
      // Store in room for future access
      room.tempStorage = storage
      return storage
    }
    
    // Return empty storage for non-work rooms (shouldn't happen)
    return new Storage('temp')
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
    const newBag = storage.save()
    usePlayerStore.setState({ bag: newBag })
    
    // Check for auto-unequip: if any equipped item is not in bag (and not in storage/safe), unequip it
    const stateAfter = usePlayerStore.getState()
    const slots: Array<'gun' | 'weapon' | 'equip' | 'tool' | 'special'> = ['gun', 'weapon', 'equip', 'tool', 'special']
    for (const slot of slots) {
      const equippedItemId = stateAfter.equipment[slot]
      if (equippedItemId && equippedItemId !== "1") { // Skip hand (weapon slot default)
        const bagCount = newBag[equippedItemId] || 0
        const storageCount = stateAfter.storage[equippedItemId] || 0
        const safeCount = stateAfter.safe[equippedItemId] || 0
        const totalCount = bagCount + storageCount + safeCount
        if (totalCount === 0) {
          if (slot === 'weapon') {
            // Weapon always defaults to hand
            usePlayerStore.setState((state) => ({
              equipment: { ...state.equipment, [slot]: "1" }
            }))
          } else {
            usePlayerStore.setState((state) => ({
              equipment: { ...state.equipment, [slot]: null }
            }))
          }
        }
      }
    }
  }
  
  const handleBottomStorageUpdate = (_storage: Storage) => {
    // No action needed - tempStorage is stored in room.tempStorage
    // Changes to storage.items are already reflected in the room.tempStorage instance
  }

  // Flush items to site storage (only once)
  const flushItems = useCallback(() => {
    if (!room.tempStorage) {
      console.log('[WorkRoomStorageView] No tempStorage to flush')
      // Still mark as flushed to prevent re-initialization
      if (room.type === 'work' && Array.isArray(room.list)) {
        room.itemsFlushed = true
        room.list = []
      }
      return
    }
    
    console.log('[WorkRoomStorageView] flushItems called', { 
      siteId: site.id,
      itemCount: Object.keys(room.tempStorage.items).length,
      items: room.tempStorage.items
    })
    
    // Check room-level flag to prevent duplication
    if (room.itemsFlushed) {
      console.log('[WorkRoomStorageView] Items already flushed, skipping')
      return
    }
    
    // Check if storage has items to flush
    if (Object.keys(room.tempStorage.items).length === 0) {
      console.log('[WorkRoomStorageView] No items to flush')
      // Still mark as flushed to prevent re-initialization
      if (room.type === 'work' && Array.isArray(room.list)) {
        room.itemsFlushed = true
        room.list = []
      }
      // Clear tempStorage
      room.tempStorage = undefined
      return
    }
    
    console.log('[WorkRoomStorageView] Flushing items to depository:', room.tempStorage.items)
    
    // Transfer all items from tempStorage to site.storage
    const result = room.tempStorage.transferAll(site.storage, false)
    
    // Set haveNewItems flag
    site.haveNewItems = true
    
    // Mark room as flushed and clear room.list to prevent duplication
    if (room.type === 'work' && Array.isArray(room.list)) {
      room.itemsFlushed = true
      room.list = []
    }
    
    // Clear tempStorage after flush
    room.tempStorage = undefined
    
    console.log('[WorkRoomStorageView] Site storage after flush:', site.storage.items)
    if (result.failed > 0) {
      console.warn('[WorkRoomStorageView] Some items failed to transfer:', result.failed)
    }
    
    saveAll().catch(err => console.error('Auto-save failed:', err))
  }, [site, room])

  // Expose flush function via ref so parent can call it when navigating away
  useEffect(() => {
    if (flushRef) {
      flushRef.current = flushItems
    }
    // Also expose via uiStore so MainScene can call it
    setWorkStorageFlushFunction(flushItems)
    return () => {
      // Only clear function references on cleanup - don't call flush during re-renders
      // Flush should only be called explicitly (e.g., when clicking "Next Room" or when MainScene calls it)
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
  // Get work room type name from string system (array)
  const workRoomTypes = getString('3007')
  const workRoomTypeName = Array.isArray(workRoomTypes) && workRoomTypes[workType]
    ? workRoomTypes[workType]
    : `Work Room Type ${workType}` // Fallback

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

