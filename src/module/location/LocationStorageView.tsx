/**
 * SiteStoragePanelContent Component
 * Site storage panel showing equipment and item transfer between Bag and Site Storage
 * Ported from OriginalGame/src/ui/siteStorageNode.js
 * 
 * Structure:
 * - EquipPanel at top (equipment management)
 * - ItemTransferPanel at bottom (bag <-> site storage transfer)
 */

import { useMemo } from 'react'
import { usePlayerStore } from '@/core/store/playerStore'
import { EquipPanel } from '@/common/ui/EquipPanel'
import { ItemTransferPanel } from '@/common/ui/ItemTransferPanel'
import { Storage } from '@/core/game/inventory/Storage'
import { Bag } from '@/core/game/inventory/Bag'
import { BOTTOM_BAR_LAYOUT } from '@/layout/layoutConstants'

interface SiteStoragePanelContentProps {
  siteId: number
  onStorageUpdate?: () => void
}

export function SiteStoragePanelContent({ siteId, onStorageUpdate }: SiteStoragePanelContentProps) {
  const playerStore = usePlayerStore()
  
  // Get site from map
  const site = useMemo(() => {
    const map = playerStore.map
    if (!map) return null
    return map.getSite(siteId)
  }, [playerStore.map, siteId])
  
  if (!site) {
    return <div className="text-white p-4">Site not found</div>
  }
  
  // Create storage instances for item transfer - refresh when store updates
  // Use Bag class for bag to get dynamic maxWeight
  const bagStorage = useMemo(() => {
    const bag = new Bag()
    bag.restore(playerStore.bag)
    return bag
  }, [playerStore.bag]) // Refresh when bag changes
  
  const siteStorage = useMemo(() => {
    const storage = new Storage('site')
    storage.restore(site.storage.save())
    return storage
  }, [site, playerStore.map]) // Refresh when site or map changes
  
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
  
  const handleBottomStorageUpdate = (storage: Storage) => {
    // Save site storage back to map
    const map = playerStore.map
    if (map) {
      const site = map.getSite(siteId)
      if (site) {
        site.storage.restore(storage.save())
        // Force map update
        const mapSave = map.save()
        map.restore(mapSave)
        usePlayerStore.setState({ map })
      }
    }
    onStorageUpdate?.()
  }
  
  // Calculate positions
  // Layout: EquipPanel at top, separator line, then ItemTransferPanel below
  const contentTopLineHeight = BOTTOM_BAR_LAYOUT.cocosRef.contentTopLineHeight
  const contentHeight = BOTTOM_BAR_LAYOUT.content.height
  const equipPanelHeight = 125 // EquipPanel height
  const separatorHeight = 10 // Space between EquipPanel and ItemTransferPanel
  const equipPanelTop = contentHeight - contentTopLineHeight // Top of content area
  const itemTransferPanelTop = equipPanelTop + equipPanelHeight + separatorHeight // Below EquipPanel
  
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
          height: `${equipPanelHeight}px`,
          zIndex: 1,
          overflow: 'visible' // Allow dropdown to extend beyond EquipPanel bounds
        }}
      >
        <EquipPanel />
      </div>
      
      {/* Separator line */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: `${equipPanelTop + equipPanelHeight}px`,
          transform: 'translateX(-50%)',
          width: '596px',
          height: `${separatorHeight}px`,
          zIndex: 1
        }}
      >
        {/* Visual separator - optional, can be removed if not needed */}
      </div>
      
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
          bottomStorage={siteStorage}
          bottomStorageName="Depository"
          showWeight={true}
          withTakeAll={true}
          onTopStorageUpdate={handleTopStorageUpdate}
          onBottomStorageUpdate={handleBottomStorageUpdate}
          onStorageUpdate={onStorageUpdate}
        />
      </div>
    </div>
  )
}

