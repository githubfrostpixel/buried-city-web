/**
 * TradePanel Component
 * Generic trade panel for transferring items between two storages
 * Similar to ItemTransferPanel but with trade-specific features:
 * - Transfer preview area showing temp items
 * - Trade rate calculation and display
 * - Trade button to commit changes
 * 
 * Layout:
 * - Top: Storage items (scrollable)
 * - Below items: Section bar
 * - Middle: Transfer preview area (temp items + arrow)
 * - Bottom section bar
 * - Bottom: Storage items (scrollable)
 */

import { useMemo, useState, useCallback } from 'react'
import { Storage } from '@/core/game/inventory/Storage'
import { Item } from '@/core/game/inventory/Item'
import { ItemCell } from './ItemCell'
import { TempTradeItemsDisplay } from './TempTradeItemsDisplay'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { CommonListItemButton } from '@/common/ui/CommonListItemButton'
import { getString } from '@/common/utils/stringUtil'
import { audioManager, SoundPaths } from '@/core/game/systems/AudioManager'

interface TradePanelProps {
  topStorage: Storage  // Source storage (e.g., player bag)
  bottomStorage: Storage  // Target storage (e.g., NPC storage)
  topTempStorage: Storage  // Temp storage containing only moved items from top
  bottomTempStorage: Storage  // Temp storage containing only moved items to bottom
  topStorageName: string  // Display name for top storage
  bottomStorageName: string  // Display name for bottom storage
  getTradeRate?: (storage: Storage) => number  // Optional: function to calculate trade rate
  getTradeRateMessage?: (rate: number) => string  // Optional: function to get trade rate message
  onTrade?: () => void  // Callback when trade button is clicked (to commit changes)
  showWeight?: boolean  // Show weight for top storage
  topMaxWeight?: number  // Max weight for top storage
  width?: number
  height?: number
}

const CELL_WIDTH = 110
const CELL_HEIGHT = 100
const COLUMNS = 5

/**
 * Get trade rate message based on rate value
 */
function defaultGetTradeRateMessage(tradeRate: number): string {
  const messages = getString(3010)
  if (!Array.isArray(messages) || messages.length < 6) {
    return 'Calculating...'
  }
  
  let index = 0
  if (tradeRate >= 1.3) {
    index = 0
  } else if (tradeRate >= 1.1) {
    index = 1
  } else if (tradeRate >= 1.0) {
    index = 2
  } else if (tradeRate >= 0.9) {
    index = 3
  } else if (tradeRate >= 0.7) {
    index = 4
  } else {
    index = 5
  }
  
  return messages[index] || 'Calculating...'
}

export function TradePanel({
  topStorage,
  bottomStorage,
  topTempStorage,
  bottomTempStorage,
  topStorageName,
  bottomStorageName,
  getTradeRate: _getTradeRate, // Keep for backward compatibility but not used
  getTradeRateMessage = defaultGetTradeRateMessage,
  onTrade,
  showWeight = false,
  topMaxWeight = 0,
  width = 596,
  height = 670
}: TradePanelProps) {
  // Validate storages are non-null
  if (!topStorage || !bottomStorage || !topTempStorage || !bottomTempStorage) {
    throw new Error('TradePanel: topStorage, bottomStorage, topTempStorage, and bottomTempStorage must be non-null')
  }
  
  const sectionBarHeight = 30
  const transferPreviewHeight = 200
  const gap = 10
  const [updateTrigger, setUpdateTrigger] = useState(0)
  
  // Calculate available height for items areas
  const availableHeight = height - sectionBarHeight * 2 - transferPreviewHeight - gap * 3
  const itemsAreaHeight = Math.floor(availableHeight / 2)
  
  // Calculate total value of a storage
  const calculateStorageValue = useCallback((storage: Storage): number => {
    let totalValue = 0
    Object.entries(storage.items).forEach(([itemId, count]) => {
      if (count > 0) {
        const item = new Item(itemId)
        totalValue += item.getPrice() * count
      }
    })
    return totalValue
  }, [])
  
  // Calculate trade rate based on temp storage values
  const calculateTradeRate = useCallback((): number => {
    const topValue = calculateStorageValue(topTempStorage)
    const bottomValue = calculateStorageValue(bottomTempStorage)
    
    // Trade rate = value of what player receives / value of what player gives
    // If player gives nothing, rate is 1.0 (neutral)
    if (bottomValue === 0) {
      return topValue > 0 ? Infinity : 1.0
    }
    
    return  topValue/bottomValue
  }, [
    topTempStorage, 
    bottomTempStorage, 
    calculateStorageValue, 
    updateTrigger,
    Object.keys(topTempStorage.items).length,
    Object.keys(bottomTempStorage.items).length
  ])
  
  const topItems = useMemo(() => {
    return topStorage.getItemsByType('')
  }, [topStorage, updateTrigger])
  
  const bottomItems = useMemo(() => {
    return bottomStorage.getItemsByType('')
  }, [bottomStorage, updateTrigger, Object.keys(bottomStorage.items).length, Object.keys(bottomStorage.items).join(',')])
  
  // Get weight for top storage
  const topWeight = showWeight && topStorage.maxWeight !== null 
    ? topStorage.getWeight() 
    : 0
  
  // Calculate trade rate based on temp storage values
  const tradeRate = useMemo(() => {
    return calculateTradeRate()
  }, [calculateTradeRate])
  
  const tradeRateMessage = useMemo(() => {
    return getTradeRateMessage(tradeRate)
  }, [tradeRate, getTradeRateMessage])
  
  // Get temp items directly from temp storages
  const topTempItems = useMemo(() => {
    const items = topTempStorage.getItemsByType('')
    return items.slice(0, 4).map(item => ({
      itemId: item.item.id,
      count: item.num
    }))
  }, [topTempStorage, updateTrigger, Object.keys(topTempStorage.items).length])
  
  const bottomTempItems = useMemo(() => {
    const items = bottomTempStorage.getItemsByType('')
    return items.slice(0, 4).map(item => ({
      itemId: item.item.id,
      count: item.num
    }))
  }, [bottomTempStorage, updateTrigger, Object.keys(bottomTempStorage.items).length])
  
  // Handle top storage item click - transfer to topTempStorage
  const handleTopItemClick = useCallback((itemId: string) => {
    const transferred = topStorage.transferItem(itemId, 1, topTempStorage)
    if (transferred) {
      setUpdateTrigger(prev => prev + 1)
      audioManager.playEffect(SoundPaths.EXCHANGE)
    }
  }, [topStorage, topTempStorage])
  
  // Handle bottom storage item click - transfer to bottomTempStorage
  const handleBottomItemClick = useCallback((itemId: string) => {
    const transferred = bottomStorage.transferItem(itemId, 1, bottomTempStorage)
    if (transferred) {
      setUpdateTrigger(prev => prev + 1)
      audioManager.playEffect(SoundPaths.EXCHANGE)
    }
  }, [bottomStorage, bottomTempStorage])
  
  // Handle top temp item click - transfer back to topStorage
  const handleTopTempItemClick = useCallback((itemId: string) => {
    const transferred = topTempStorage.transferItem(itemId, 1, topStorage)
    if (transferred) {
      setUpdateTrigger(prev => prev + 1)
      audioManager.playEffect(SoundPaths.EXCHANGE)
    }
  }, [topTempStorage, topStorage])
  
  // Handle bottom temp item click - transfer back to bottomStorage
  const handleBottomTempItemClick = useCallback((itemId: string) => {
    const transferred = bottomTempStorage.transferItem(itemId, 1, bottomStorage)
    if (transferred) {
      setUpdateTrigger(prev => prev + 1)
      audioManager.playEffect(SoundPaths.EXCHANGE)
    }
  }, [bottomTempStorage, bottomStorage])
  

  
  // Calculate total heights for scrolling
  const topRows = Math.ceil(topItems.length / COLUMNS)
  const topTotalHeight = topRows * CELL_HEIGHT
  const bottomRows = Math.ceil(bottomItems.length / COLUMNS)
  const bottomTotalHeight = bottomRows * CELL_HEIGHT
  
  // Top section bar position (below items)
  const topSectionBarTop = itemsAreaHeight + gap
  
  // Transfer preview position
  const transferPreviewTop = topSectionBarTop + sectionBarHeight + gap
  
  // Bottom section bar position
  const bottomSectionBarTop = transferPreviewTop + transferPreviewHeight + gap
  
  // Bottom items position
  const bottomItemsTop = bottomSectionBarTop + sectionBarHeight + gap
  
  return (
    <div
      className="relative"
      style={{
        width: `${width}px`,
        height: `${height}px`
      }}
    >
      {/* Top Storage Items - Scrollable (at top) */}
      <div
        className="absolute custom-scrollbar"
        style={{
          left: '50%',
          top: '0px',
          transform: 'translateX(-50%)',
          width: `${width}px`,
          height: `${itemsAreaHeight}px`,
          overflow: 'auto',
          overflowX: 'hidden'
        }}
      >
        <div
          className="relative"
          style={{
            width: `${width}px`,
            minHeight: `${topTotalHeight}px`
          }}
        >
          {/* Simple grid without categories */}
          <div
            className="absolute"
            style={{
              left: '50%',
              top: '0px',
              transform: 'translateX(-50%)',
              width: `${CELL_WIDTH * COLUMNS}px`
            }}
          >
            {topItems.map((cell, index) => {
              const col = index % COLUMNS
              const row = Math.floor(index / COLUMNS)
              
              return (
                <div
                  key={`top-${cell.item.id}-${index}`}
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
                    onClick={() => handleTopItemClick(cell.item.id)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Top Section Bar (below items) */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: `${topSectionBarTop}px`,
          transform: 'translateX(-50%)',
          width: `${width}px`,
          height: `${sectionBarHeight}px`
        }}
      >
        <Sprite
          atlas="ui"
          frame="frame_section_bg.png"
          className="absolute inset-0 w-full h-full"
        />
        
        <div
          className="absolute text-black"
          style={{
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '20px',
            fontFamily: "'Noto Sans', sans-serif",
            fontWeight: 'normal'
          }}
        >
          {topStorageName}
        </div>
        
        {showWeight && (
          <div
            className="absolute text-black"
            style={{
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '20px',
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 'normal',
              color: topWeight >= topMaxWeight ? '#ff0000' : '#000000'
            }}
          >
            {topWeight}/{topMaxWeight}
          </div>
        )}
      </div>
      
      {/* Transfer Preview Area */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: `${transferPreviewTop}px`,
          transform: 'translateX(-50%)',
          width: `${width}px`,
          height: `${transferPreviewHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px'
        }}
      >
        {/* Top Temp Items (left) */}
        <TempTradeItemsDisplay
          items={topTempItems}
          onItemClick={handleTopTempItemClick}
        />
        
        {/* Arrow Placeholder (center) */}
        <div
          className="text-white text-4xl"
          style={{
            fontSize: '48px',
            fontFamily: "'Noto Sans', sans-serif"
          }}
        >
          →
        </div>
        
        {/* Bottom Temp Items (right) */}
        <TempTradeItemsDisplay
          items={bottomTempItems}
          onItemClick={handleBottomTempItemClick}
        />
      </div>
      
      {/* Bottom Section Bar */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: `${bottomSectionBarTop}px`,
          transform: 'translateX(-50%)',
          width: `${width}px`,
          height: `${sectionBarHeight}px`
        }}
      >
        <Sprite
          atlas="ui"
          frame="frame_section_bg.png"
          className="absolute inset-0 w-full h-full"
        />
        
        <div
          className="absolute text-black"
          style={{
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '20px',
            fontFamily: "'Noto Sans', sans-serif",
            fontWeight: 'normal'
          }}
        >
          {bottomStorageName}
        </div>
        
        <div
          className="absolute"
          style={{
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div
            className="text-black"
            style={{
              fontSize: '20px',
              fontFamily: "'Noto Sans', sans-serif",
              color: tradeRate >= 1.0 ? '#000000' : '#ff0000',
              textAlign: 'right'
            }}
          >
            {tradeRateMessage || 'Calculating...'}
          </div>
          
          {onTrade && (
            <CommonListItemButton
              text={getString(1040) || 'Trade'}
              onClick={() => {}} // Placeholder - will be implemented later
              enabled={tradeRate >= 1.0}
            />
          )}
        </div>
      </div>
      
      {/* Bottom Storage Items - Scrollable */}
      <div
        className="absolute custom-scrollbar"
        style={{
          left: '50%',
          top: `${bottomItemsTop}px`,
          transform: 'translateX(-50%)',
          width: `${width}px`,
          height: `${itemsAreaHeight}px`,
          overflow: 'auto',
          overflowX: 'hidden'
        }}
      >
        <div
          className="relative"
          style={{
            width: `${width}px`,
            minHeight: `${bottomTotalHeight}px`
          }}
        >
          {/* Simple grid without categories */}
          <div
            className="absolute"
            style={{
              left: '50%',
              top: '0px',
              transform: 'translateX(-50%)',
              width: `${CELL_WIDTH * COLUMNS}px`
            }}
          >
            {bottomItems.map((cell, index) => {
              const col = index % COLUMNS
              const row = Math.floor(index / COLUMNS)
              
              return (
                <div
                  key={`bottom-${cell.item.id}-${index}`}
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
                    onClick={() => handleBottomItemClick(cell.item.id)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
