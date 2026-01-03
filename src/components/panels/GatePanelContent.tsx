/**
 * GatePanelContent Component
 * Gate panel showing equipment and item transfer
 * Ported from OriginalGame/src/ui/gateNode.js
 * 
 * Structure:
 * - EquipPanel at top (equipment management)
 * - ItemTransferPanel at bottom (bag <-> storage transfer)
 */

import { useEffect, useMemo } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { useBuildingStore } from '@/store/buildingStore'
import { audioManager, SoundPaths } from '@/game/systems/AudioManager'
import { emitter } from '@/utils/emitter'
import { EquipPanel } from '@/components/common/EquipPanel'
import { ItemTransferPanel } from '@/components/common/ItemTransferPanel'
import { Storage } from '@/game/inventory/Storage'
import { Bag } from '@/game/inventory/Bag'
import { BOTTOM_BAR_LAYOUT } from '@/components/layout/layoutConstants'

export function GatePanelContent() {
  const playerStore = usePlayerStore()
  const buildingStore = useBuildingStore()
  
  // Set inGate setting on mount
  useEffect(() => {
    const setSetting = playerStore.setSetting
    setSetting('inGate', true)
    
    // Play CLOSE_DOOR sound
    audioManager.playEffect(SoundPaths.CLOSE_DOOR)
    
    // Listen to item_click events (for tutorial - stub for now)
    const handleItemClick = (data: any) => {
      // TODO: Handle tutorial integration
      // if (userGuide.isStep(userGuide.stepName.GATE_EQUIP_1) && userGuide.isItemCreate(data.itemId)) {
      //   // Update equip panel icon warn
      // }
    }
    
    emitter.on('item_click', handleItemClick)
    
    return () => {
      setSetting('inGate', false)
      emitter.off('item_click', handleItemClick)
    }
  }, []) // Empty dependency array - only run on mount/unmount
  
  // Create storage instances for item transfer - refresh when store updates
  // Use Bag class for bag to get dynamic maxWeight
  const bagStorage = useMemo(() => {
    const bag = new Bag()
    bag.restore(playerStore.bag)
    return bag
  }, [playerStore.bag, playerStore.storage]) // Include both to refresh when either changes
  
  const storageStorage = useMemo(() => {
    const storage = new Storage('player')
    storage.restore(playerStore.storage)
    return storage
  }, [playerStore.bag, playerStore.storage]) // Include both to refresh when either changes
  
  // Callbacks to persist storage changes
  const handleTopStorageUpdate = (storage: Storage) => {
    // Save bag back to playerStore
    usePlayerStore.setState({ bag: storage.save() })
  }
  
  const handleBottomStorageUpdate = (storage: Storage) => {
    // Save storage back to playerStore
    usePlayerStore.setState({ storage: storage.save() })
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
          bottomStorage={storageStorage}
          bottomStorageName="Storage"
          showWeight={true}
          onTopStorageUpdate={handleTopStorageUpdate}
          onBottomStorageUpdate={handleBottomStorageUpdate}
        />
      </div>
    </div>
  )
}

