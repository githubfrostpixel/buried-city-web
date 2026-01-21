/**
 * EquipPanel Component
 * Equipment panel showing 5 equipment slots
 * Ported from OriginalGame/src/ui/equipNode.js
 * 
 * Shows 5 equipment slots: Gun, Weapon, Equip, Tool, Special
 * Clicking a slot opens dropdown to select/change equipment
 */

import { useState, useEffect } from 'react'
import { usePlayerStore } from '@/core/store/playerStore'
import { Storage } from '@/core/game/inventory/Storage'
import { Item } from '@/core/game/inventory/Item'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { emitter } from '@/common/utils/emitter'
import { saveAll } from '@/core/game/systems/save'
import { getString } from '@/common/utils/stringUtil'

const EQUIPMENT_SLOTS = [
  { key: 'gun' as const, label: 'Gun', itemType: 'item_weapon_gun', emptyIcon: 'icon_tab_gun.png' },
  { key: 'weapon' as const, label: 'Weapon', itemType: 'item_weapon_melee', emptyIcon: 'icon_tab_weapon.png' },
  { key: 'equip' as const, label: 'Equip', itemType: 'item_equip', emptyIcon: 'icon_tab_equip.png' },
  { key: 'tool' as const, label: 'Tool', itemType: 'item_weapon_explosive', emptyIcon: 'icon_tab_tool.png' },
  { key: 'special' as const, label: 'Special', itemType: 'special', emptyIcon: 'build_action_fix.png' }
]

const SLOT_SIZE = 100
const PANEL_WIDTH = 572
const PANEL_HEIGHT = 125 // Fixed: Original is 100, not 125
const PADDING = (PANEL_WIDTH - 5 * SLOT_SIZE) / 6
const DROPDOWN_V_PADDING = 10
const DROPDOWN_ITEM_HEIGHT = 72

export function EquipPanel() {
  const playerStore = usePlayerStore()
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [dropdownItems, setDropdownItems] = useState<string[]>([])
  const [, forceUpdate] = useState(0)
  
  // Get items from bag
  const bag = new Storage('player')
  bag.restore(playerStore.bag)
  
  // Listen to equipment update events
  useEffect(() => {
    const handleEquipDecrease = () => {
      forceUpdate(prev => prev + 1)
    }
    
    const handleEquipGuide = (_itemId: string) => {
      // TODO: Handle tutorial guide integration
      // For now, just update view
      forceUpdate(prev => prev + 1)
    }
    
    emitter.on('equiped_item_decrease_in_bag', handleEquipDecrease)
    emitter.on('equip_item_need_guide', handleEquipGuide)
    
    return () => {
      emitter.off('equiped_item_decrease_in_bag', handleEquipDecrease)
      emitter.off('equip_item_need_guide', handleEquipGuide)
    }
  }, [])
  
  // Open dropdown for slot
  const handleSlotClick = (slotIndex: number) => {
    const slot = EQUIPMENT_SLOTS[slotIndex]
    
    if (selectedSlot === slotIndex) {
      // Toggle: close dropdown if clicking same slot
      setSelectedSlot(null)
      setDropdownItems([])
      return
    }
    
    // Switching to different slot: previous dropdown will close automatically
    // when selectedSlot changes, but we clear dropdown items explicitly
    if (selectedSlot !== null) {
      setDropdownItems([])
    }
    
    // Get available items for this slot
    let items: string[] = []
    
    if (slot.key === 'special') {
      // Special slot: only specific items
      const specialItems = ['item_ammo_strong_flashlight', 'item_ammo_hyper_detector', 'item_ammo_siphon_tool']
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
    
    // TODO: Tutorial integration
    // if (userGuide.isStep(userGuide.stepName.GATE_EQUIP_1)) {
    //   userGuide.step()
    //   uiUtil.removeIconWarn(this)
    // }
  }
  
  // Equip item
  const handleEquipItem = (itemId: string) => {
    if (selectedSlot === null) return
    
    const slot = EQUIPMENT_SLOTS[selectedSlot]
    const itemIdToEquip = itemId === '0' ? null : (itemId === '1' ? "1" : itemId)
    
    // Equip item
    let success = false
    if (itemIdToEquip) {
      success = playerStore.equipItem(slot.key, itemIdToEquip)
      if (!success) {
        // Failed to equip (item not in bag)
        // Close dropdown anyway
        setSelectedSlot(null)
        setDropdownItems([])
        return
      }
    } else {
      // Unequip (for weapon, set to hand)
      if (slot.key === 'weapon') {
        success = playerStore.equipItem(slot.key, "1") // Equip hand instead of null
      } else {
        playerStore.unequipItem(slot.key)
        success = true
      }
    }
    
    if (success) {
      // Update view to refresh icons
      forceUpdate(prev => prev + 1)
      
      // Close dropdown
      setSelectedSlot(null)
      setDropdownItems([])
      
      // Save game state
      saveAll().catch(err => {
        console.error('Failed to save game state after equipping:', err)
      })
      
      // TODO: Tutorial integration
      // if (userGuide.isStep(userGuide.stepName.GATE_EQUIP_2) && userGuide.isItemCreate(itemId)) {
      //   userGuide.step()
      //   emitter.emit('nextStep')
      // }
      // if (userGuide.equipNeedGuide2(itemId)) {
      //   userGuide.guide2Step(itemId)
      // }
    }
  }
  
  // Get equipped item icon for slot (matches original icon naming)
  const getEquippedIcon = (slotKey: typeof EQUIPMENT_SLOTS[number]['key']): string | null => {
    const equipped = playerStore.getEquippedItem(slotKey)
    if (!equipped) {
      return null // Empty slot - will show default icon
    }
    
    // Hand icon for weapon slot
    if (equipped === '1' || (slotKey === 'weapon' && !equipped)) {
      return 'icon_tab_hand.png'
    }
    
    // Special items - itemId already includes "item_" prefix, so use icon_ prefix
    if (equipped === 'item_ammo_strong_flashlight' || equipped === 'item_ammo_hyper_detector' || equipped === 'item_ammo_siphon_tool') {
      return `icon_${equipped}.png`
    }
    
    // Other items use icon_tab_ prefix
    return `icon_tab_${equipped}.png`
  }
  
  // Get empty slot icon
  const getEmptySlotIcon = (slotKey: typeof EQUIPMENT_SLOTS[number]['key']): string => {
    const slot = EQUIPMENT_SLOTS.find(s => s.key === slotKey)
    return slot?.emptyIcon || 'build_icon_bg.png'
  }
  
  return (
    <div
      className="relative"
      style={{
        width: `${PANEL_WIDTH}px`,
        height: `${PANEL_HEIGHT}px`,
        margin: '0 auto',
        overflow: 'visible' // Allow dropdown to extend beyond panel bounds
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
              <div
                className="absolute"
                style={{
                  top: '15px',
                  width: '100%',
                  height: '100%'
                }}
              >
                <Sprite
                  atlas={selectedSlot === index ? "gate" : "ui"}
                  frame={selectedSlot === index ? "frame_tab_head.png" : "build_icon_bg.png"}
                  className="w-full h-full"
                />
              </div>
              {/* Equipped item icon or empty slot icon */}
              {equippedIcon ? (
                <div
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '55%', // Moved down from 50% to 55%
                    transform: 'translate(-50%, -50%)',
                    width: '64px',
                    height: '64px',
                    zIndex: 2 // In front of frame_tab_head
                  }}
                >
                  <Sprite
                    atlas="gate"
                    frame={equippedIcon}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: '50%',
                    top: '60%', // Moved down from 50% to 55%
                    transform: 'translate(-50%, -50%)',
                    width: '64px',
                    height: '64px',
                    zIndex: 2 // In front of frame_tab_head
                  }}
                >
                  <Sprite
                    atlas="gate"
                    frame={getEmptySlotIcon(slot.key)}
                    className="w-full h-full"
                  />
                </div>
              )}
            </button>
          </div>
        )
      })}
      
      {/* Dropdown view - matches original frame_tab_content.png Scale9Sprite */}
      {selectedSlot !== null && dropdownItems.length > 0 && (
        <div
          className="absolute"
          style={{
            left: '50%',
            top: `${PANEL_HEIGHT -25}px`, // 5px from bottom (anchored at top)
            transform: 'translateX(-50%)',
            width: '565px',
            height: `${DROPDOWN_ITEM_HEIGHT * dropdownItems.length + 2 * DROPDOWN_V_PADDING }px`,
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 100,
            pointerEvents: 'auto'
          }}
          data-test-id="equip-dropdown"
        >
          {/* Background with solid color - no top border */}
          <div
            className="absolute inset-0"
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#222222',
              borderLeft: '6px solid #666666',
              borderRight: '6px solid #666666',
              borderBottom: '6px solid #666666',
              borderTop: 'none'
            }}
          />
          
          {/* Top border segments with gap for selected slot */}
          {(() => {
            const dropdownLeft = (PANEL_WIDTH - 565) / 2; // 3.5px - dropdown left edge relative to panel
            const selectedSlotX = PADDING * (selectedSlot + 1) + SLOT_SIZE * (selectedSlot + 0.5);
            const slotLeftEdge = selectedSlotX - SLOT_SIZE / 2;
            const slotRightEdge = selectedSlotX + SLOT_SIZE / 2;
            
            // Positions relative to dropdown (dropdown starts at dropdownLeft from panel left)
            // Narrow gap by 6px on both sides
            const gapStart = slotLeftEdge - dropdownLeft + 6;
            const gapEnd = slotRightEdge - dropdownLeft - 6;
            
            return (
              <>
                {/* Left border segment */}
                {gapStart > 0 && (
                  <div
                    className="absolute"
                    style={{
                      left: '0',
                      top: '0',
                      width: `${gapStart}px`,
                      height: '6px',
                      backgroundColor: '#666666'
                    }}
                  />
                )}
                
                {/* Right border segment */}
                {gapEnd < 565 && (
                  <div
                    className="absolute"
                    style={{
                      left: `${gapEnd}px`,
                      top: '0',
                      width: `${565 - gapEnd}px`,
                      height: '6px',
                      backgroundColor: '#666666'
                    }}
                  />
                )}
              </>
            );
          })()}
          
          {/* Dropdown items */}
          <div
            className="absolute"
            style={{
              left: '0',
              top: '0',
              width: '100%',
              height: '100%',
              paddingTop: `${DROPDOWN_V_PADDING}px`,
              paddingBottom: `${DROPDOWN_V_PADDING}px`
            }}
          >
            {dropdownItems.map((itemId, idx) => {
              const isHand = itemId === '1'
              const isEmpty = itemId === '0'
              const slot = EQUIPMENT_SLOTS[selectedSlot]
              
              // Get item info
              let itemInfo: { name: string; weight: number; count: number; atkCD?: number } | null = null
              let iconFrame: string | null = null
              let iconScale = 0.8
              
              if (isHand) {
                itemInfo = {
                  name: getString(1170) || 'Hand',
                  weight: 0,
                  count: 0,
                  atkCD: 1
                }
                iconFrame = 'icon_tab_content_hand.png'
              } else if (isEmpty) {
                itemInfo = null
                iconFrame = null
              } else {
                const item = new Item(itemId)
                const config = item.config
                const count = playerStore.getBagItemCount(itemId)
                
                // Get name from string system
                const itemConfig = getString(itemId)
                const name = typeof itemConfig === 'object' && itemConfig !== null && 'title' in itemConfig
                  ? itemConfig.title as string
                  : `Item ${itemId}` // Fallback
                
                itemInfo = {
                  name,
                  weight: config.weight,
                  count,
                  atkCD: config.effect_weapon?.atkCD
                }
                
                // Icon naming and scale
                if (itemId === 'item_ammo_strong_flashlight' || itemId === 'item_ammo_hyper_detector' || itemId === 'item_ammo_siphon_tool') {
                  iconFrame = `icon_${itemId}.png`
                  iconScale = 1.0
                } else {
                  iconFrame = `icon_tab_content_${itemId}.png`
                  iconScale = 0.8
                }
              }
              
              return (
                <div
                  key={`${itemId}-${idx}`}
                  className="relative"
                  style={{
                    width: '520px',
                    height: `${DROPDOWN_ITEM_HEIGHT}px`,
                    margin: '0 auto',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => handleEquipItem(itemId)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  data-test-id={`equip-dropdown-item-${itemId}`}
                >
                  {/* Separator line (except for first item) */}
                  {idx > 0 && (
                    <div
                      className="absolute"
                      style={{
                        left: '50%',
                        top: '0',
                        transform: 'translateX(-50%)',
                        width: '520px',
                        height: '1px',
                        backgroundColor: '#666666'
                      }}
                    />
                  )}
                  
                  {/* Item content */}
                  {itemInfo ? (
                    <>
                      {/* Icon */}
                      {iconFrame && (
                        <div
                          className="absolute"
                          style={{
                            left: '0',
                            top: '50%',
                            transform: `translateY(-50%) scale(${iconScale})`,
                            transformOrigin: 'left center',
                            width: '64px',
                            height: '64px'
                          }}
                        >
                          <Sprite
                            atlas="gate"
                            frame={iconFrame}
                            className="w-full h-full"
                          />
                        </div>
                      )}
                      
                      {/* Item name */}
                      <div
                        className="absolute"
                        style={{
                          left: iconFrame ? '64px' : '0',
                          top: '5px',
                          fontSize: '20px', // COMMON_2
                          fontFamily: "'Noto Sans', sans-serif",
                          fontWeight: 'normal',
                          color: '#FFFFFF'
                        }}
                      >
                        {itemInfo.name}
                      </div>
                      
                      {/* Weight */}
                      <div
                        className="absolute"
                        style={{
                          left: iconFrame ? '64px' : '0',
                          top: '25px',
                          fontSize: '18px', // COMMON_3
                          fontFamily: "'Noto Sans', sans-serif",
                          fontWeight: 'normal',
                          color: '#FFFFFF'
                        }}
                      >
                        Weight: {itemInfo.weight}
                      </div>
                      
                      {/* Count (right-aligned) */}
                      <div
                        className="absolute"
                        style={{
                          right: '10px',
                          top: '5px',
                          fontSize: '18px', // COMMON_3
                          fontFamily: "'Noto Sans', sans-serif",
                          fontWeight: 'normal',
                          color: '#FFFFFF',
                          textAlign: 'right'
                        }}
                      >
                        Count: {itemInfo.count}
                      </div>
                      
                      {/* Attack Cooldown (if weapon, right-aligned below count) */}
                      {itemInfo.atkCD !== undefined && (
                        <div
                          className="absolute"
                          style={{
                            right: '10px',
                            top: '25px',
                            fontSize: '18px', // COMMON_3
                            fontFamily: "'Noto Sans', sans-serif",
                            fontWeight: 'normal',
                            color: '#FFFFFF',
                            textAlign: 'right'
                          }}
                        >
                          CD: {itemInfo.atkCD}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Empty state */
                    <div
                      className="absolute"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '20px', // COMMON_2
                        fontFamily: "'Noto Sans', sans-serif",
                        fontWeight: 'normal',
                        color: '#FFFFFF',
                        textAlign: 'center'
                      }}
                    >
                      {slot.key === 'special' 
                        ? (() => {
                            const name1 = getString('item_ammo_strong_flashlight')
                            const name2 = getString('item_ammo_hyper_detector')
                            const name3 = getString('item_ammo_siphon_tool')
                            const getName = (config: any): string => {
                              return typeof config === 'object' && config !== null && 'title' in config
                                ? config.title as string
                                : ''
                            }
                            return `${getName(name1)} / ${getName(name2)} / ${getName(name3)}`
                          })()
                        : getString(1024) || 'Empty'
                      }
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


