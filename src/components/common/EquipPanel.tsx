/**
 * EquipPanel Component
 * Equipment panel showing 5 equipment slots
 * Ported from OriginalGame/src/ui/equipNode.js
 * 
 * Shows 5 equipment slots: Gun, Weapon, Equip, Tool, Special
 * Clicking a slot opens dropdown to select/change equipment
 */

import { useState } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { Storage } from '@/game/inventory/Storage'
import { Item } from '@/game/inventory/Item'
import { Sprite } from '@/components/sprites/Sprite'

const EQUIPMENT_SLOTS = [
  { key: 'gun' as const, label: 'Gun', itemType: '1301' },
  { key: 'weapon' as const, label: 'Weapon', itemType: '1302' },
  { key: 'equip' as const, label: 'Equip', itemType: '1304' },
  { key: 'tool' as const, label: 'Tool', itemType: '1303' },
  { key: 'special' as const, label: 'Special', itemType: 'special' }
]

const SLOT_SIZE = 100
const PANEL_WIDTH = 572
const PANEL_HEIGHT = 100
const PADDING = (PANEL_WIDTH - 5 * SLOT_SIZE) / 6

export function EquipPanel() {
  const playerStore = usePlayerStore()
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [dropdownItems, setDropdownItems] = useState<string[]>([])
  
  // Get items from bag
  const bag = new Storage('player')
  bag.restore(playerStore.bag)
  
  // Open dropdown for slot
  const handleSlotClick = (slotIndex: number) => {
    const slot = EQUIPMENT_SLOTS[slotIndex]
    
    if (selectedSlot === slotIndex) {
      // Close dropdown if clicking same slot
      setSelectedSlot(null)
      return
    }
    
    // Get available items for this slot
    let items: string[] = []
    
    if (slot.key === 'special') {
      // Special slot: only specific items
      const specialItems = ['1305053', '1305064', '1305075']
      items = specialItems.filter(itemId => bag.validateItem(itemId, 1))
    } else {
      // Get items by type from bag
      const itemsByType = bag.getItemsByType(slot.itemType)
      items = itemsByType.map(cell => cell.item.id)
    }
    
    // For weapon slot, add "HAND" option at the beginning
    if (slot.key === 'weapon') {
      items.unshift('1') // Equipment.HAND = 1
    }
    
    // If no items, add empty option
    if (items.length === 0) {
      items.push('0')
    }
    
    setDropdownItems(items)
    setSelectedSlot(slotIndex)
  }
  
  // Equip item
  const handleEquipItem = (itemId: string) => {
    if (selectedSlot === null) return
    
    const slot = EQUIPMENT_SLOTS[selectedSlot]
    const itemIdToEquip = itemId === '0' ? null : (itemId === '1' ? null : itemId)
    
    // Equip item
    if (itemIdToEquip) {
      playerStore.equipItem(slot.key, itemIdToEquip)
    } else {
      // Unequip (for weapon, null means hand)
      if (slot.key === 'weapon') {
        playerStore.equipItem(slot.key, null)
      } else {
        playerStore.unequipItem(slot.key)
      }
    }
    
    // Close dropdown
    setSelectedSlot(null)
  }
  
  // Get equipped item icon for slot
  const getEquippedIcon = (slotKey: typeof EQUIPMENT_SLOTS[number]['key']): string | null => {
    const equipped = playerStore.getEquippedItem(slotKey)
    if (!equipped) {
      // For weapon, null means hand
      if (slotKey === 'weapon') {
        return 'icon_item_1.png' // HAND icon
      }
      return null
    }
    return `icon_item_${equipped}.png`
  }
  
  return (
    <div
      className="relative"
      style={{
        width: `${PANEL_WIDTH}px`,
        height: `${PANEL_HEIGHT}px`,
        margin: '0 auto'
      }}
      data-test-id="equip-panel"
    >
      {/* Equipment slots */}
      {EQUIPMENT_SLOTS.map((slot, index) => {
        const slotX = PADDING * (index + 1) + SLOT_SIZE * (index + 0.5)
        const equippedIcon = getEquippedIcon(slot.key)
        
        return (
          <div key={slot.key}>
            {/* Slot button */}
            <button
              onClick={() => handleSlotClick(index)}
              className="absolute cursor-pointer"
              style={{
                left: `${slotX - SLOT_SIZE / 2}px`,
                top: `${PANEL_HEIGHT / 2 - SLOT_SIZE / 2}px`,
                width: `${SLOT_SIZE}px`,
                height: `${SLOT_SIZE}px`,
                background: 'transparent',
                border: 'none',
                padding: 0
              }}
              data-test-id={`equip-slot-${slot.key}`}
            >
              <Sprite
                atlas="ui"
                frame="build_icon_bg.png"
                className="w-full h-full"
              />
              {/* Equipped item icon */}
              {equippedIcon && (
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
                    frame={equippedIcon}
                    className="w-full h-full"
                  />
                </div>
              )}
            </button>
            
            {/* Selected indicator (frame_tab_head.png) */}
            {selectedSlot === index && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${slotX - SLOT_SIZE / 2}px`,
                  top: `${PANEL_HEIGHT / 2 + SLOT_SIZE / 2}px`,
                  width: `${SLOT_SIZE}px`,
                  height: '20px'
                }}
              >
                <Sprite
                  atlas="ui"
                  frame="frame_tab_head.png"
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        )
      })}
      
      {/* Dropdown view */}
      {selectedSlot !== null && dropdownItems.length > 0 && (
        <div
          className="absolute bg-gray-800 border-2 border-gray-600 rounded"
          style={{
            left: '50%',
            top: `${PANEL_HEIGHT + 10}px`,
            transform: 'translateX(-50%)',
            width: '565px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 100
          }}
          data-test-id="equip-dropdown"
        >
          {dropdownItems.map((itemId, idx) => {
            const isHand = itemId === '1'
            const isEmpty = itemId === '0'
            const displayName = isHand ? 'Hand' : isEmpty ? 'Empty' : `Item ${itemId}`
            const iconFrame = isHand ? 'icon_item_1.png' : isEmpty ? null : `icon_item_${itemId}.png`
            
            return (
              <button
                key={`${itemId}-${idx}`}
                onClick={() => handleEquipItem(itemId)}
                className="w-full flex items-center p-2 hover:bg-gray-700 text-white"
                style={{
                  height: '72px'
                }}
                data-test-id={`equip-dropdown-item-${itemId}`}
              >
                {iconFrame && (
                  <div className="w-16 h-16 flex-shrink-0 mr-4">
                    <Sprite
                      atlas="icon"
                      frame={iconFrame}
                      className="w-full h-full"
                    />
                  </div>
                )}
                <span className="text-lg">{displayName}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}


