/**
 * StatusDialog Component
 * Small dialog showing status information (Day, Season, Time, Weather, etc.)
 * Ported from OriginalGame/src/ui/topFrame.js showStatusDialog()
 * Uses DialogSmall structure from OriginalGame/src/ui/dialog.js
 * 
 * Structure:
 * - Title section: Icon, title, current value (txt_1), optional txt_2
 * - Content section: Description text
 * - Action section: OK button
 */

import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useGameStore } from '@/store/gameStore'
import { usePlayerStore } from '@/store/playerStore'
import { useBuildingStore } from '@/store/buildingStore'
import { Sprite } from '@/components/sprites/Sprite'
import { DialogButton } from '@/components/common/DialogButton'

interface StatusDialogData {
  stringId: number
  value: string | number
  iconName: string
}

// Status dialog string configurations (placeholder until string system is implemented)
const STATUS_STRINGS: Record<number, { title: string; des: string }> = {
  1: { title: 'Day', des: 'Current day in the game.' },
  2: { title: 'Season', des: 'Current season: Spring, Summer, Autumn, or Winter.' },
  3: { title: 'Temperature', des: 'Current temperature in degrees.' },
  4: { title: 'Time', des: 'Current time of day.' },
  11: { title: 'Weather', des: 'Current weather conditions.' },
  12: { title: 'Electric', des: 'Work site electric status.' },
  13: { title: 'Currency', des: 'Current amount of money.' },
  16: { title: 'Fuel', des: 'Current fuel level and maximum capacity.' }
}

// Base status dialog config
const STATUS_DIALOG_BASE = {
  txt_1: 'Current: %s',
  btn_1: { txt: 'OK' }
}

// Determine icon atlas based on icon name
function getIconAtlas(iconName: string): string {
  // Remove # prefix if present
  const cleanName = iconName.replace('#', '')
  
  // Fuel icons are in "new" atlas
  if (cleanName.startsWith('icon_oil_')) {
    return 'new'
  }
  
  // Item money icon is in "new_temp" atlas
  if (cleanName === 'icon_item_money.png') {
    return 'new_temp'
  }
  
  // Most other icons are in "icon" atlas
  // (icon_season_*, icon_weather_*, icon_time, icon_day, icon_temperature, icon_electric)
  return 'icon'
}

export function StatusDialog() {
  const uiStore = useUIStore()
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const buildingStore = useBuildingStore()
  
  // Get dialog data from overlay state
  const dialogData = (uiStore.activeOverlay === 'statusDialog' 
    ? (uiStore as any).overlayData as StatusDialogData 
    : null)
  
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
  
  // Early return if no dialog data
  if (!dialogData) return null
  
  const { stringId, value, iconName } = dialogData
  
  // Get string config for this status
  const strConfig = STATUS_STRINGS[stringId] || { title: 'Status', des: 'Status information.' }
  
  // Format txt_1: "Current: {value}"
  const txt1 = STATUS_DIALOG_BASE.txt_1.replace('%s', String(value))
  
  // Special case: Weather txt_2 when Radio building exists
  let txt2: string | null = null
  if (stringId === 11) {
    const radioBuilding = buildingStore.getBuilding(15)
    if (radioBuilding && radioBuilding.level > -1) {
      // TODO: Get string 9003 and weather.Random when string system is implemented
      // For now, use placeholder
      const weatherRandom = gameStore.weatherSystem?.getRandomValue?.() || 0
      txt2 = `Random: ${weatherRandom}` // Placeholder until string system
    }
  }
  
  // Dialog dimensions (based on dialog_small_2_bg.png sprite)
  // Typical size: ~400px width, ~300px height (adjust based on actual sprite)
  const dialogWidth = 400
  const dialogHeight = 300
  
  // Title section: 90px height
  const titleHeight = 90
  // Action section: 72px height
  const actionHeight = 72
  // Content section: remaining height
  const contentHeight = dialogHeight - titleHeight - actionHeight
  
  const leftEdge = 20
  const rightEdge = dialogWidth - leftEdge
  
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={(e) => {
        // Close on overlay click (autoDismiss = true in original)
        if (e.target === e.currentTarget) {
          uiStore.hideOverlay()
        }
      }}
      data-test-id="status-dialog-overlay"
    >
      {/* Dark background overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)', // opacity 200/255 ≈ 0.78, using 0.75
        }}
        onClick={() => uiStore.hideOverlay()}
      />
      
      {/* Dialog container - centered */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${dialogWidth}px`,
          height: `${dialogHeight}px`,
          zIndex: 51
        }}
        onClick={(e) => e.stopPropagation()}
        data-test-id="status-dialog"
      >
        {/* Background */}
        <Sprite
          atlas="ui"
          frame="dialog_small_2_bg.png"
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Title section */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: 0,
            width: `${dialogWidth}px`,
            height: `${titleHeight}px`
          }}
        >
          {/* Icon */}
          {iconName && (
            <div
              className="absolute"
              style={{
                left: `${leftEdge}px`,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px'
              }}
            >
              <Sprite
                atlas={getIconAtlas(iconName)}
                frame={iconName.replace('#', '')}
                className="w-full h-full"
              />
            </div>
          )}
          
          {/* Title text */}
          <div
            className="absolute"
            style={{
              left: iconName ? `${leftEdge + 50}px` : `${leftEdge}px`,
              top: '35%',
              transform: 'translateY(-50%)',
              fontSize: '24px', // COMMON_1
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 'normal',
              color: '#000000',
              lineHeight: '1.2'
            }}
          >
            {strConfig.title}
          </div>
          
          {/* txt_1: Current value */}
          <div
            className="absolute"
            style={{
              left: `${leftEdge + 50}px`,
              top: '50%',
              fontSize: '20px', // COMMON_3
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 'normal',
              color: '#000000',
              lineHeight: '1.2'
            }}
          >
            {txt1}
          </div>
          
          {/* txt_2: Optional (for weather) */}
          {txt2 && (
            <div
              className="absolute"
              style={{
                left: `${leftEdge}px`,
                top: '75%',
                fontSize: '20px', // COMMON_3
                fontFamily: "'Noto Sans', sans-serif",
                fontWeight: 'normal',
                color: '#000000',
                lineHeight: '1.2'
              }}
            >
              {txt2}
            </div>
          )}
        </div>
        
        {/* Content section */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: `${titleHeight}px`,
            width: `${dialogWidth}px`,
            height: `${contentHeight}px`,
            overflow: 'hidden'
          }}
        >
          {/* Description text */}
          <div
            className="absolute"
            style={{
              left: `${leftEdge}px`,
              top: '20px',
              width: `${rightEdge - leftEdge}px`,
              fontSize: '20px', // COMMON_3
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 'normal',
              color: '#000000',
              lineHeight: '1.4',
              wordWrap: 'break-word'
            }}
          >
            {strConfig.des}
          </div>
        </div>
        
        {/* Action section */}
        <div
          className="absolute"
          style={{
            left: 0,
            bottom: 0,
            width: `${dialogWidth}px`,
            height: `${actionHeight}px`
          }}
        >
          {/* OK button - centered */}
          <DialogButton
            text={STATUS_DIALOG_BASE.btn_1.txt}
            position={{ x: 50, y: 50 }} // 50% = center
            onClick={() => uiStore.hideOverlay()}
            className=""
          />
        </div>
      </div>
    </div>
  )
}

