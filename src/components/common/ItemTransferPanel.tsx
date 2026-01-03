/**
 * ItemTransferPanel Component
 * Item transfer panel for transferring items between two storages
 * Ported from OriginalGame/src/ui/ItemChangeNode.js
 * 
 * Shows two sections:
 * - Top: Source storage (e.g., Bag)
 * - Bottom: Destination storage (e.g., Storage)
 * Clicking an item transfers it to the opposite storage
 * 
 * Generic implementation: treats all Storage instances the same
 */

import { useMemo, useState, useCallback } from 'react'
import { Storage } from '@/game/inventory/Storage'
import { Bag } from '@/game/inventory/Bag'
import { Item } from '@/game/inventory/Item'
import { ItemCell } from '@/components/storage/ItemCell'
import { Sprite } from '@/components/sprites/Sprite'
import { audioManager, SoundPaths } from '@/game/systems/AudioManager'

interface ItemTransferPanelProps {
  topStorage: Storage // Non-null, already initialized with correct data
  topStorageName: string // Display label only
  bottomStorage: Storage // Non-null, already initialized with correct data
  bottomStorageName: string // Display label only
  showWeight?: boolean // Show weight for top storage if it has maxWeight
  withTakeAll?: boolean // Show "Take All" button
  onTopStorageUpdate?: (storage: Storage) => void // Callback to persist top storage changes
  onBottomStorageUpdate?: (storage: Storage) => void // Callback to persist bottom storage changes
  onStorageUpdate?: () => void // Optional general callback
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
  showWeight = false,
  withTakeAll = false,
  onTopStorageUpdate,
  onBottomStorageUpdate,
  onStorageUpdate
}: ItemTransferPanelProps) {
  // Validate storages are non-null
  if (!topStorage || !bottomStorage) {
    throw new Error('ItemTransferPanel: topStorage and bottomStorage must be non-null')
  }
  
  const [updateTrigger, setUpdateTrigger] = useState(0)
  
  // Get items from storages - use props directly
  const topItems = useMemo(() => {
    return topStorage.getItemsByType('')
  }, [topStorage, updateTrigger])
  
  const bottomItems = useMemo(() => {
    return bottomStorage.getItemsByType('')
  }, [bottomStorage, updateTrigger, Object.keys(bottomStorage.items).length, Object.keys(bottomStorage.items).join(',')])
  
  // Get weight for top storage - generic logic
  const topWeight = showWeight && topStorage.maxWeight !== null 
    ? topStorage.getWeight() 
    : 0
  
  const topMaxWeight = showWeight && topStorage.maxWeight !== null
    ? (topStorage instanceof Bag ? (topStorage as Bag).getMaxWeight() : topStorage.maxWeight)
    : 0
  
  // Handle item click - transfer to opposite storage
  // Use useCallback to ensure we always use the latest storage references
  const handleItemClick = useCallback((itemId: string, fromTop: boolean) => {
    const sourceStorage = fromTop ? topStorage : bottomStorage
    const targetStorage = fromTop ? bottomStorage : topStorage
    
    // Use Storage.transferItem() which handles rollback automatically
    const transferred = sourceStorage.transferItem(itemId, 1, targetStorage)
    
    if (transferred) {
      // Notify parent to persist changes
      onTopStorageUpdate?.(topStorage)
      onBottomStorageUpdate?.(bottomStorage)
      onStorageUpdate?.()
      
      // Trigger re-render
      setUpdateTrigger(prev => prev + 1)
      
      // Play sound
      audioManager.playEffect(SoundPaths.EXCHANGE)
    }
  }, [topStorage, bottomStorage, onTopStorageUpdate, onBottomStorageUpdate, onStorageUpdate])
  
  // Handle "Take All" button - transfer all items from bottom storage to top storage
  const handleTakeAll = () => {
    if (!withTakeAll) return
    
    const sourceStorage = bottomStorage
    const targetStorage = topStorage
    
    const allItems = sourceStorage.getItemsByType('')
    let transferred = false
    
    for (const cell of allItems) {
      const itemId = cell.item.id
      const count = cell.num
      
      // Try to transfer as many as possible
      // Storage.transferItem handles weight checks automatically
      let remaining = count
      while (remaining > 0) {
        const canTransfer = Math.min(remaining, 100) // Transfer in batches
        if (sourceStorage.transferItem(itemId, canTransfer, targetStorage)) {
          transferred = true
          remaining -= canTransfer
        } else {
          break // Can't transfer more (weight limit or other issue)
        }
      }
    }
    
    if (transferred) {
      // Notify parent to persist both storages
      onTopStorageUpdate?.(topStorage)
      onBottomStorageUpdate?.(bottomStorage)
      onStorageUpdate?.()
      
      // Trigger re-render
      setUpdateTrigger(prev => prev + 1)
      
      // Play sound
      audioManager.playEffect(SoundPaths.EXCHANGE)
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
            {showWeight && topStorage.maxWeight !== null && (
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
          {renderItemGrid(topItems, true)}
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
            {withTakeAll && (
              <button
                onClick={() => {
                  handleTakeAll()
                }}
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
            height: `${SECTION_HEIGHT}px`,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {renderItemGrid(bottomItems, false)}
        </div>
      </div>
    </div>
  )
}
