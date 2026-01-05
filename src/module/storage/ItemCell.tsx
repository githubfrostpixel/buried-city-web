/**
 * ItemCell Component
 * Individual item cell in storage grid
 * Ported from OriginalGame/src/ui/SectionTableView.js ItemCell
 * 
 * Displays:
 * - Item background (varies by type)
 * - Item icon
 * - Item count label
 */

import { Sprite } from '@/common/ui/sprite/Sprite'
import { Item } from '@/core/game/inventory/Item'

interface ItemCellProps {
  itemId: string
  count: number
  onClick: () => void
}

export function ItemCell({ itemId, count, onClick }: ItemCellProps) {
  // Determine background based on item type
  const getBackgroundFrame = (): string => {
    const item = new Item(itemId)
    
    // Equipment items (type 13, but not OTHER)
    if (item.getType(0) === '13' && item.getType(1) !== '05') {
      return 'item_equip_bg.png'
    }
    
    // Basic items
    if (itemId === '1102063' || itemId === '1102073') {
      return 'item_basic_bg.png'
    }
    
    // Bullet items
    if (itemId === '1305011' || itemId === '1305012') {
      return 'item_bullet_bg.png'
    }
    
    // Default background
    return 'item_bg.png'
  }
  
  // Get item icon (fallback to default if not found)
  const getIconFrame = (): string => {
    // Try item-specific icon first
    const iconName = `icon_item_${itemId}.png`
    // Note: Sprite component will handle missing frames
    // Original game falls back to icon_item_1101051.png if not found
    // For now, use item ID - fallback can be handled by Sprite component
    return iconName
  }
  
  return (
    <div
      className="relative cursor-pointer"
      style={{
        width: '84px',
        height: '84px',
        margin: '0 auto'
      }}
      onClick={() => {
        onClick()
      }}
      data-test-id={`item-cell-${itemId}`}
    >
      {/* Background */}
      <Sprite
        atlas="ui"
        frame={getBackgroundFrame()}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Item icon */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '64px',
          height: '64px'
        }}
      >
        <Sprite
          atlas="icon"
          frame={getIconFrame()}
          className="w-full h-full"
        />
      </div>
      
      {/* Count label - bottom-right */}
      <div
        className="absolute text-white"
        style={{
          right: '4px',
          bottom: '4px',
          fontSize: '18px',
          fontFamily: "'Noto Sans', sans-serif",
          fontWeight: 'bold',
          textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
          lineHeight: '1'
        }}
        data-test-id={`item-count-${itemId}`}
      >
        {count}
      </div>
    </div>
  )
}

