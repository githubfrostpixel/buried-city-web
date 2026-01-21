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
import { useLongPress } from '@/common/hooks/useLongPress'

interface ItemCellProps {
  itemId: string
  count: number
  onClick: () => void
  onLongPress?: () => void
}

export function ItemCell({ itemId, count, onClick, onLongPress }: ItemCellProps) {
  // Long press detection
  const longPressHandlers = useLongPress({
    onLongPress: onLongPress || (() => {}),
    onClick: onClick,
    threshold: 500, // 0.5 seconds
    moveThreshold: 200 // 200px
  })
  // Determine background based on item type
  const getBackgroundFrame = (): string => {
    const item = new Item(itemId)
    
    // Equipment items (type 13, but not OTHER)
    if (item.getType(0) === '13' && item.getType(1) !== '05') {
      return 'item_equip_bg.png'
    }
    
    // Basic items
    if (itemId === 'item_model_generator_component' || itemId === 'item_model_gasoline_pump_component') {
      return 'item_basic_bg.png'
    }
    
    // Bullet items
    if (itemId === 'item_ammo_standard_bullet' || itemId === 'item_ammo_handmade_bullet') {
      return 'item_bullet_bg.png'
    }
    
    // Default background
    return 'item_bg.png'
  }
  
  // Get item icon (fallback to default if not found)
  const getIconFrame = (): string => {
    // Try item-specific icon first
    // itemId already includes "item_" prefix, so use icon_ prefix
    const iconName = `icon_${itemId}.png`
    // Note: Sprite component will handle missing frames
    // Original game falls back to icon_item_mat_components.png if not found
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
      {...(onLongPress ? longPressHandlers : { onClick })}
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

