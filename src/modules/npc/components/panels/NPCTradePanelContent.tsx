/**
 * NPCTradePanelContent Component
 * NPC trade panel for exchanging items with NPCs
 * Ported from OriginalGame/src/ui/npcStorageNode.js
 * 
 * Simple wrapper that:
 * - Initializes temp storage on NPC object
 * - Passes storages to TradePanel (which handles all transfer logic)
 * - Handles flush on unmount
 */

import { useEffect, useMemo, useCallback, useRef } from 'react'
import { useUIStore } from '@/core/store/uiStore'
import { usePlayerStore } from '@/core/store/playerStore'
import { Storage } from '@/core/game/inventory/Storage'
import { Bag } from '@/core/game/inventory/Bag'
import { TradePanel } from '@/modules/storage/components/shared/TradePanel'
import { BOTTOM_BAR_LAYOUT } from '@/shared/constants/layoutConstants'
import { getString } from '@/shared/utils/i18n/stringUtil'
import { audioManager, SoundPaths } from '@/core/game/systems/AudioManager'

interface NPCTradePanelContentProps {
  npcId: number | null
}

export function NPCTradePanelContent({ npcId }: NPCTradePanelContentProps) {
  const uiStore = useUIStore()
  const playerStore = usePlayerStore()
  const hasFlushedRef = useRef(false)
  
  // Get NPC instance
  const npc = useMemo(() => {
    if (!npcId) return null
    try {
      const npcManager = playerStore.getNPCManager()
      return npcManager.getNPC(npcId)
    } catch {
      return null
    }
  }, [npcId, playerStore])
   
  const playerBag = useMemo(() => {
    const bag = new Bag()
    bag.restore(playerStore.bag)
    return bag
  }, [playerStore.bag]) // Refresh when bag changes

  const npcStorage = useMemo(() => {
    if (!npc) return null
    const storage = new Storage(`npc_${npc.id}`)
    storage.restore(npc.storage.save())
    return storage
  }, [npc?.storage]) 

  const topTempStorage = useMemo(() => {
    if (!npc) return new Storage('temp_top')
    if (!npc.tempBagPreview) {
      npc.tempBagPreview = new Storage('temp_top')
    }
    const storage = new Storage('temp_top')
    storage.restore(npc.tempBagPreview.save())
    return npc.tempBagPreview
  }, [npc?.tempBagPreview])

  const bottomTempStorage = useMemo(() => {
    if (!npc) return new Storage('temp_bottom')
    if (!npc.tempStoragePreview) {
      npc.tempStoragePreview = new Storage(`temp_bottom`)
    }
    const storage = new Storage(`temp_bottom`)
    storage.restore(npc.tempStoragePreview.save())
    return storage
  }, [npc?.tempStoragePreview])

  
  
  // Flush function: return items to original storage
  const flushTempStorage = useCallback(() => {
    if (!npc || !npc.tempBagPreview || !npc.tempStoragePreview) return
    
    topTempStorage.transferAll(playerBag);
    bottomTempStorage.transferAll(npc.storage);
    // Clear temp storage from NPC
    npc.tempBagPreview = undefined
    npc.tempStoragePreview = undefined
  }, [npc, playerStore])
  
  // Set flush function in store and cleanup on unmount
  useEffect(() => {
    // Use getState() to avoid subscribing to store updates
    useUIStore.getState().setNPCTradeFlushFunction(flushTempStorage)
    
    return () => {
      // CRITICAL: Flush items back to original storage before unmounting
      // Use ref to prevent multiple calls
      if (hasFlushedRef.current) {
        return
      }
      hasFlushedRef.current = true
      
      console.log('[NPCTradePanelContent] Component unmounting, calling flush function')
      // Call flush directly (not through store) to avoid state update loops
      flushTempStorage()
      
      // Clear flush function from store AFTER flush
      useUIStore.getState().setNPCTradeFlushFunction(null)
    }
  }, [flushTempStorage])
  
 
  if (!npcId || !npc || !playerBag || !npcStorage) {
    return (
      <div className="text-center p-8 text-white">
        <p>NPC not found</p>
      </div>
    )
  }
  
  // Layout dimensions
  const contentHeight = BOTTOM_BAR_LAYOUT.content.height
  
  return (
    <div className="relative w-full h-full">
      {/* TradePanel (full height) */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '0px',
          transform: 'translateX(-50%)',
          width: '596px',
          height: `${contentHeight}px`
        }}
      >
        <TradePanel
          topStorage={playerBag}
          bottomStorage={npcStorage}
          topTempStorage={topTempStorage}
          bottomTempStorage={bottomTempStorage}
          topStorageName={getString(1034) || 'Bag'}
          bottomStorageName={getString(1039) || 'Traded goods'}
          getTradeRate={npc.getTradeRate.bind(npc)}
          showWeight={true}
          topMaxWeight={playerStore.getBagMaxWeight()}
          width={596}
          height={contentHeight}
        />
      </div>
    </div>
  )
}
