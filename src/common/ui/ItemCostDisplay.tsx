/**
 * Item Cost Display Component
 * Displays a list of cost items with icons and quantities
 * Colors items red if player doesn't have enough
 */

import { usePlayerStore } from '@/core/store/playerStore'
import { Sprite } from '@/common/ui/sprite/Sprite'
import type { BuildingCost } from '@/common/types/building.types'

interface ItemCostDisplayProps {
  costs: BuildingCost[]
  // Number of columns for layout (default: 3)
  columns?: number
  // Icon scale (default: 0.5)
  iconScale?: number
  // Text size (default: 14)
  textSize?: number
  // Text color (default: black)
  textColor?: string
  // Width of container
  width?: number
}

export function ItemCostDisplay({
  costs,
  columns = 3,
  iconScale = 0.5,
  textSize = 14,
  textColor = '#ffffff',
  width = 556
}: ItemCostDisplayProps) {
  const playerStore = usePlayerStore()
  
  if (!costs || costs.length === 0) {
    return null
  }
  
  // Calculate column width
  const colWidth = width / columns
  const iconSize = 32 * iconScale
  
  // Check if player has enough items
  const checkItemAvailability = (itemId: string | number, requiredNum: number): boolean => {
    const itemIdStr = String(itemId)
    const bagCount = playerStore.getBagItemCount(itemIdStr)
    const storageCount = playerStore.getStorageItemCount(itemIdStr)
    const haveNum = bagCount + storageCount
    return haveNum >= requiredNum
  }
  
  return (
    <div
      style={{
        width: `${width}px`,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px'
      }}
    >
      {costs.map((cost, index) => {
        const itemIdStr = String(cost.itemId)
        const hasEnough = checkItemAvailability(cost.itemId, cost.num)
        const itemColor = hasEnough ? textColor : '#ff0000' // Red if not enough
        
        return (
          <div
            key={`${itemIdStr}-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              width: `${colWidth - 10}px`
            }}
          >
            {/* Item icon */}
            <div
              style={{
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                flexShrink: 0
              }}
            >
              <Sprite
                atlas="icon"
                frame={`icon_${itemIdStr}.png`}
                className="w-full h-full"
                style={{
                  transform: `scale(${iconScale})`,
                  transformOrigin: 'top left'
                }}
              />
            </div>
            
            {/* Item quantity text */}
            <span
              style={{
                fontSize: `${textSize}px`,
                fontFamily: "'Noto Sans', sans-serif",
                color: itemColor,
                fontWeight: 'normal'
              }}
            >
              {cost.num}
            </span>
          </div>
        )
      })}
    </div>
  )
}

