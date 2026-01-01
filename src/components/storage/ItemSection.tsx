/**
 * ItemSection Component
 * Section with title and grid of item cells
 * Ported from OriginalGame/src/ui/SectionTableView.js ItemSection
 * 
 * Layout:
 * - Title: 50px height, left-aligned
 * - Grid: 5 columns, 110px width each
 * - Item cells: 84×84px, centered in 110×100px cells
 */

import { ItemCell } from './ItemCell'

interface ItemSectionProps {
  title: string
  items: Array<{ itemId: string; count: number }>
  onItemClick: (itemId: string) => void
}

export function ItemSection({ title, items, onItemClick }: ItemSectionProps) {
  const cellWidth = 110
  const cellHeight = 100
  const titleHeight = title ? 50 : 0
  const columns = 5
  const rows = Math.ceil(items.length / columns)
  const sectionHeight = rows * cellHeight + titleHeight
  
  return (
    <div
      className="relative"
      style={{
        width: `${cellWidth * columns}px`,
        height: `${sectionHeight}px`,
        margin: '0 auto'
      }}
      data-test-id={`item-section-${title}`}
    >
      {/* Title - positioned at top of section */}
      {title && (
        <div
          className="absolute text-white"
          style={{
            left: `${(cellWidth - 84) / 2}px`,
            top: '0',
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            height: `${titleHeight}px`,
            lineHeight: `${titleHeight}px`
          }}
          data-test-id={`section-title-${title}`}
        >
          {title}
        </div>
      )}
      
      {/* Item grid - positioned below title */}
      <div
        className="absolute"
        style={{
          left: '0',
          top: `${titleHeight}px`,
          width: `${cellWidth * columns}px`,
          height: `${rows * cellHeight}px`
        }}
      >
        {items.map((item, index) => {
          const col = index % columns
          const row = Math.floor(index / columns)
          
          return (
            <div
              key={`${item.itemId}-${index}`}
              className="absolute"
              style={{
                left: `${col * cellWidth + (cellWidth - 84) / 2}px`,
                top: `${row * cellHeight + (cellHeight - 84) / 2}px`,
                width: '84px',
                height: '84px'
              }}
            >
              <ItemCell
                itemId={item.itemId}
                count={item.count}
                onClick={() => onItemClick(item.itemId)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

