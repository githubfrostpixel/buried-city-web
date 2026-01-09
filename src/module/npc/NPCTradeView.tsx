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

import { useEffect, useMemo, useCallback, useState } from 'react'
import { usePlayerStore } from '@/core/store/playerStore'
import { useUIStore } from '@/core/store/uiStore'
import { Storage } from '@/core/game/inventory/Storage'
import { Bag } from '@/core/game/inventory/Bag'
import { TradePanel } from '@/module/storage/TradePanel'
import { BOTTOM_BAR_LAYOUT } from '@/layout/layoutConstants'
import { getString } from '@/common/utils/stringUtil'
import { saveAll } from '@/core/game/systems/save'

interface NPCTradePanelContentProps {
  npcId: number | null
}

export function NPCTradePanelContent({ npcId }: NPCTradePanelContentProps) {
  const playerStore = usePlayerStore()
  
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
   
  const [playerBag, setPlayerBag] = useState<Bag | null>(null)

  useEffect(() => {
    const bag = new Bag()
    bag.restore(playerStore.bag)
    setPlayerBag(bag)
  }, [playerStore.bag])

  const [npcStorage, setNpcStorage] = useState<Storage | null>(null)

  useEffect(() => {
    if (!npc) return
    const storage = new Storage(`npc_${npc.id}`)
    storage.restore(npc.storage.save())
    setNpcStorage(storage)
  }, [npc?.id])

  // Get or create temp storage for player bag preview
  // This storage persists on the NPC object and tracks items moved from player bag
  const [topTempStorage, setTopTempStorage] = useState<Storage | null>(null)
  const [bottomTempStorage, setBottomTempStorage] = useState<Storage | null>(null)

  useEffect(() => {
    if (!npc) return

    if (!npc.tempBagPreview) {
      npc.tempBagPreview = new Storage('temp_top')
    }
    if (!npc.tempStoragePreview) {
      npc.tempStoragePreview = new Storage('temp_bottom')
    }

    setTopTempStorage(npc.tempBagPreview)
    setBottomTempStorage(npc.tempStoragePreview)
  }, [npc?.id])

  
  
  // Flush function: return items to original storage
  const flushTempStorage = useCallback(() => {
    if (!npc) return
  
    const bagPreview = npc.tempBagPreview
    const storagePreview = npc.tempStoragePreview
  
    if (!bagPreview || !storagePreview) return
  
    // Return items safely
    bagPreview.transferAll(playerBag as Storage)
    storagePreview.transferAll(npc.storage)
  
    // Clear AFTER transfer
    npc.tempBagPreview = undefined
    npc.tempStoragePreview = undefined
  }, [npc, playerBag])
  
  // Handle trade completion - persist changes to actual storages
  const handleTrade = useCallback(() => {
    if (!playerBag || !npcStorage || !npc) return
    
    // Persist player bag to playerStore
    const newBag = playerBag.save()
    usePlayerStore.setState({ bag: newBag })
    
    // Persist NPC storage to npc.storage
    npc.storage.restore(npcStorage.save())
    
    // Save game after trade completes (original: Record.saveAll() in npc.js:251)
    saveAll().catch(err => console.error('Auto-save failed after trade:', err))
  }, [playerBag, npcStorage, npc])
  
  // Set flush function in store and cleanup on unmount
  useEffect(() => {
    useUIStore.getState().setNPCTradeFlushFunction(flushTempStorage)
  
    return () => {
      console.log('[NPCTradePanelContent] Unmount → flushing trade')
      flushTempStorage()
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
        {topTempStorage && bottomTempStorage && (
          <TradePanel
            topStorage={playerBag}
            bottomStorage={npcStorage}
            topTempStorage={topTempStorage}
            bottomTempStorage={bottomTempStorage}
            topStorageName={getString(1034) || 'Bag'}
            bottomStorageName={getString(1039) || 'Traded goods'}
            getTradeRate={npc.getTradeRate.bind(npc)}
            onTrade={handleTrade}
            showWeight={true}
            topMaxWeight={playerStore.getBagMaxWeight()}
            width={596}
            height={contentHeight}
          />
        )}
      </div>
    </div>
  )
}
