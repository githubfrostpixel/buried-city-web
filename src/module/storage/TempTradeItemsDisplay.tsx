/**
 * TempTradeItemsDisplay Component
 * Displays temporary trade items in a 2x2 grid (max 4 items)
 * Used in TradePanel to show items being transferred
 */

import { ItemCell } from './ItemCell'

interface TempTradeItemsDisplayProps {
  items: Array<{ itemId: string; count: number }>
  onItemClick?: (itemId: string) => void
  title?: string
}

export function TempTradeItemsDisplay({ items, onItemClick, title }: TempTradeItemsDisplayProps) {
  // Limit to max 4 items (2x2 grid)
  const displayItems = items.slice(0, 4)
  const cellSize = 90
  const cellSpacing = 10
  const gridSize = 2
  const totalWidth = gridSize * cellSize + (gridSize - 1) * cellSpacing
  const totalHeight = gridSize * cellSize + (gridSize - 1) * cellSpacing
  
  return (
    <div
      className="relative"
      style={{
        width: `${totalWidth}px`,
        height: `${totalHeight}px`
      }}
    >
      {/* Title (optional) */}
      {title && (
        <div
          className="absolute text-white text-center"
          style={{
            left: '50%',
            top: '-25px',
            transform: 'translateX(-50%)',
            fontSize: '16px',
            fontFamily: "'Noto Sans', sans-serif",
            fontWeight: 'bold'
          }}
        >
          {title}
        </div>
      )}
      
      {/* 2x2 Grid */}
      {displayItems.map((item, index) => {
        const col = index % gridSize
        const row = Math.floor(index / gridSize)
        
        return (
          <div
            key={`${item.itemId}-${index}`}
            className="absolute"
            style={{
              left: `${col * (cellSize + cellSpacing)}px`,
              top: `${row * (cellSize + cellSpacing)}px`,
              width: `${cellSize}px`,
              height: `${cellSize}px`
            }}
          >
            <ItemCell
              itemId={item.itemId}
              count={item.count}
              onClick={() => onItemClick?.(item.itemId)}
            />
          </div>
        )
      })}
      
      {/* Empty cells (show empty slots if less than 4 items) */}
      {displayItems.length < 4 && (
        <>
          {Array.from({ length: 4 - displayItems.length }).map((_, index) => {
            const itemIndex = displayItems.length + index
            const col = itemIndex % gridSize
            const row = Math.floor(itemIndex / gridSize)
            
            return (
              <div
                key={`empty-${index}`}
                className="absolute border-2 border-dashed border-gray-500"
                style={{
                  left: `${col * (cellSize + cellSpacing)}px`,
                  top: `${row * (cellSize + cellSpacing)}px`,
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)'
                }}
              />
            )
          })}
        </>
      )}
    </div>
  )
}


