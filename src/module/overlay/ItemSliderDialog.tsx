/**
 * ItemSliderDialog Component
 * Dialog with slider to select item transfer quantity
 * Ported from OriginalGame/src/ui/uiUtil.js showItemSliderDialog()
 * 
 * Structure:
 * - Title section: Icon, title, weight (txt_1), count (txt_2)
 * - Content section: Large image, description, slider control
 * - Action section: Confirm button
 */

import { useEffect, useState } from 'react'
import { useUIStore } from '@/core/store/uiStore'
import { Storage } from '@/core/game/inventory/Storage'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { DialogButton } from '@/common/ui/DialogButton'
import { SpriteSlider } from '@/common/ui/SpriteSlider'
import { getString } from '@/common/utils/stringUtil'
import { itemConfig } from '@/core/data/items'
import { game } from '@/core/game/Game'
import { useViewportScaleContext } from '@/common/context/ViewportScaleContext'

interface ItemSliderDialogData {
  itemId: string
  sourceStorage: Storage
  targetStorage: Storage
  onConfirm: (quantity: number) => void
  siteId?: number
}

export function ItemSliderDialog() {
  const uiStore = useUIStore()
  const { scale } = useViewportScaleContext()
  const [bottomBarRect, setBottomBarRect] = useState<DOMRect | null>(null)
  const [sliderValue, setSliderValue] = useState(1)
  
  // Get dialog data from overlay state
  const dialogData = (uiStore.activeOverlay === 'itemSliderDialog' 
    ? (uiStore as any).overlayData as ItemSliderDialogData 
    : null)
  
  // Pause game when dialog appears
  useEffect(() => {
    if (!dialogData) return
    
    game.pause()
    
    return () => {
      game.resume()
    }
  }, [dialogData])
  
  // Get BottomBar position dynamically
  useEffect(() => {
    const updatePosition = () => {
      const bottomBar = document.querySelector('[data-test-id="bottombar-bg"]')
      if (bottomBar) {
        setBottomBarRect(bottomBar.getBoundingClientRect())
      }
    }
    
    updatePosition()
    window.addEventListener('resize', updatePosition)
    const interval = setInterval(updatePosition, 100)
    
    return () => {
      window.removeEventListener('resize', updatePosition)
      clearInterval(interval)
    }
  }, [])
  
  // Handle ESC key
  useEffect(() => {
    if (!dialogData) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        uiStore.hideOverlay()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dialogData, uiStore])
  
  // Initialize slider value to 1 when itemId changes
  useEffect(() => {
    if (dialogData) {
      setSliderValue(1)
    }
  }, [dialogData?.itemId])
  
  // Early return after all hooks are called
  if (!dialogData || !bottomBarRect) return null
  
  const { itemId, sourceStorage, onConfirm, siteId } = dialogData
  const totalNum = sourceStorage.getItemCount(itemId)
  
  // Get item name and description from string system
  const getItemName = (): string => {
    const itemConfig = getString(itemId)
    if (typeof itemConfig === 'object' && itemConfig !== null && 'title' in itemConfig) {
      return itemConfig.title as string
    }
    return `Item ${itemId}`
  }
  
  const getItemDescription = (): string => {
    const itemConfig = getString(itemId)
    if (typeof itemConfig === 'object' && itemConfig !== null && 'des' in itemConfig) {
      return itemConfig.des as string
    }
    return ''
  }
  
  const itemName = getItemName()
  const itemDescription = getItemDescription()
  
  // Calculate weight for selected quantity
  const getWeight = (quantity: number): number => {
    // Special handling for bullet items
    if (itemId === 'item_ammo_standard_bullet' || itemId === 'item_econ_coffee' || itemId === 'item_ammo_handmade_bullet') {
      return Math.ceil(0.02 * quantity)
    }
    const config = itemConfig[itemId]
    return quantity * (config?.weight || 0)
  }
  
  // Format value string (pad single digits with space)
  const formatValue = (value: number): string => {
    if (value < 10) {
      return ` ${value}`
    }
    return `${value}`
  }
  
  // Get weight string
  const getWeightString = (quantity: number): string => {
    const weight = getWeight(quantity)
    // Use string ID 1028 for weight display (same as original)
    const weightConfig = getString('1028')
    if (typeof weightConfig === 'object' && weightConfig !== null && 'title' in weightConfig) {
      return `${weightConfig.title} ${weight}`
    }
    return `Weight: ${weight}`
  }
  
  // Get count string
  const getCountString = (quantity: number): string => {
    const valueStr = formatValue(quantity)
    // Use string ID 1029 for count display (same as original)
    const countConfig = getString('1029')
    if (typeof countConfig === 'object' && countConfig !== null && 'title' in countConfig) {
      return `${valueStr}/${totalNum}`
    }
    return `${valueStr}/${totalNum}`
  }
  
  // Handle slider change
  const handleSliderChange = (value: number) => {
    setSliderValue(value)
  }
  
  // Handle confirm
  const handleConfirm = () => {
    onConfirm(sliderValue)
    uiStore.hideOverlay()
  }
  
  // Handle close
  const handleClose = () => {
    uiStore.hideOverlay()
  }
  
  // Dialog dimensions (matching ItemDialog)
  const dialogWidth = 400
  const dialogHeight = 500
  const titleHeight = 90
  const actionHeight = 72
  const contentHeight = dialogHeight - titleHeight - actionHeight
  const leftEdge = 20
  const rightEdge = dialogWidth - leftEdge
  
  // Get confirm button text (string ID 1030)
  const confirmButtonText = (() => {
    const config = getString('1030')
    if (typeof config === 'object' && config !== null && 'title' in config) {
      return config.title as string
    }
    return 'Confirm'
  })()
  
  return (
    <div
      className="fixed z-[9999]"
      style={{
        left: `${bottomBarRect.left}px`,
        top: `${bottomBarRect.top}px`,
        width: `${bottomBarRect.width}px`,
        height: `${bottomBarRect.height}px`,
        animation: 'fadeIn 0.3s ease-in'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
      data-test-id="item-slider-dialog-overlay"
    >
      {/* Dark background overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          width: '100%',
          height: '100%'
        }}
        onClick={handleClose}
      />
      
      {/* Dialog container - centered */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          width: `${dialogWidth}px`,
          height: `${dialogHeight}px`,
          zIndex: 51
        }}
        onClick={(e) => e.stopPropagation()}
        data-test-id="item-slider-dialog"
      >
        {/* Background */}
        <Sprite
          atlas="ui"
          frame="dialog_big_bg.png"
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Title section */}
        <div
          className="absolute"
          style={{
            left: '0',
            top: '0',
            width: `${dialogWidth}px`,
            height: `${titleHeight}px`
          }}
        >
          {/* Item icon */}
          <div
            className="absolute"
            style={{
              left: `${leftEdge}px`,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '64px',
              height: '64px'
            }}
          >
            <Sprite
              atlas="icon"
              frame={`icon_${itemId}.png`}
              className="w-full h-full"
            />
          </div>
          
          {/* Item title */}
          <div
            className="absolute text-black"
            style={{
              left: `${leftEdge + 70}px`,
              top: '25%',
              transform: 'translateY(-50%)',
              fontSize: '28px',
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 'bold',
              maxWidth: `${rightEdge - leftEdge - 70}px`
            }}
            data-test-id="item-slider-dialog-title"
          >
            {itemName}
          </div>
          
          {/* Weight (txt_1) */}
          <div
            className="absolute text-black"
            style={{
              left: `${leftEdge + 70}px`,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '18px',
              fontFamily: "'Noto Sans', sans-serif"
            }}
            data-test-id="item-slider-dialog-weight"
          >
            {getWeightString(sliderValue)}
          </div>
          
          {/* Count (txt_2) */}
          <div
            className="absolute text-black"
            style={{
              left: `${leftEdge + 70}px`,
              top: '75%',
              transform: 'translateY(-50%)',
              fontSize: '18px',
              fontFamily: "'Noto Sans', sans-serif"
            }}
            data-test-id="item-slider-dialog-count"
          >
            {getCountString(sliderValue)}
          </div>
        </div>
        
        {/* Content section */}
        <div
          className="absolute overflow-auto"
          style={{
            left: '0',
            top: `${titleHeight}px`,
            width: `${dialogWidth}px`,
            height: `${contentHeight+50}px`,
            padding: '10px'
          }}
        >
          {/* Large item image */}
          <div
            className="relative mx-auto"
            style={{
              width: '200px',
              height: '200px'
            }}
          >
            <Sprite
              atlas="dig_item"
              frame={`dig_item_${itemId}.png`}
              className="w-full h-full"
            />
          </div>
          
          {/* Description */}
          <div
            className="text-black mb-2"
            style={{
              fontSize: '20px',
              fontFamily: "'Noto Sans', sans-serif",
              lineHeight: '1.4',
              paddingLeft: `${leftEdge}px`,
              paddingRight: `${leftEdge}px`
            }}
            data-test-id="item-slider-dialog-description"
          >
            {itemDescription}
          </div>
          
          {/* Special warning for site 400 (bazaar) */}
          {siteId === 400 && (
            <div
              className="text-red-600 mt-2"
              style={{
                fontSize: '20px',
                fontFamily: "'Noto Sans', sans-serif",
                paddingLeft: `${leftEdge}px`,
                paddingRight: `${leftEdge}px`
              }}
            >
              {/* Use string ID 1326 for bazaar warning */}
              {(() => {
                const config = getString('1326')
                if (typeof config === 'object' && config !== null && 'title' in config) {
                  return config.title as string
                }
                return 'Warning: Bazaar sale'
              })()}
            </div>
          )}
          
          {/* Slider control - positioned at content.width / 2, 40px from bottom */}
          <div
            className="absolute"
            style={{
              left: '50%',
              bottom: '-0px',
              transform: 'translateX(-50%)',
              width: `${dialogWidth - leftEdge * 2}px`,
              minHeight: '30px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <SpriteSlider
              min={1}
              max={totalNum}
              value={sliderValue}
              onChange={handleSliderChange}
              width={dialogWidth - leftEdge * 2 -50}
              data-test-id="item-slider-dialog-slider"
            />
          </div>
        </div>
        
        {/* Action section */}
        <div
          className="absolute"
          style={{
            left: '0',
            bottom: '-60px',
            width: `${dialogWidth}px`,
            height: `${actionHeight}px`
          }}
        >
          {/* Confirm button (btn_1) */}
          <DialogButton
            text={confirmButtonText}
            position={{ x: 50, y: 50 }}
            onClick={handleConfirm}
            enabled={true}
          />
        </div>
      </div>
    </div>
  )
}
