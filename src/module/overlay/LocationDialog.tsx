/**
 * SiteDialog Component
 * Dialog showing site travel information and confirmation
 * Ported from OriginalGame/src/ui/uiUtil.js showSiteDialog() and showHomeDialog()
 * 
 * Structure:
 * - Title section: Site icon, site name, progress (txt_1), item count (txt_2)
 * - Content section: Site description image, description text, travel info (time, fuel)
 * - Action section: Cancel button, Go button
 * - Transport toggle: Motorcycle on/off (if player has motorcycle)
 */

import { useEffect, useState } from 'react'
import { useUIStore } from '@/core/store/uiStore'
import { usePlayerStore } from '@/core/store/playerStore'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { DialogButton } from '@/common/ui/DialogButton'
import { getTimeDistanceStr } from '@/common/utils/time'
import type { Site } from '@/core/game/map/Site'
import { getString } from '@/common/utils/stringUtil'
import { game } from '@/core/game/Game'

interface SiteDialogData {
  site: Site
  time: number  // Travel time in seconds
  fuelNeed: number  // Fuel needed (-1 if no motorcycle)
  canAfford: boolean  // Whether player can afford fuel
  onConfirm: () => void
  onCancel: () => void
  isHome: boolean  // Whether this is home site
}

export function SiteDialog() {
  const uiStore = useUIStore()
  const playerStore = usePlayerStore()
  const [bottomBarRect, setBottomBarRect] = useState<DOMRect | null>(null)
  
  // Get dialog data from overlay state
  const dialogData = (uiStore.activeOverlay === 'siteDialog' 
    ? (uiStore as any).overlayData as SiteDialogData 
    : null)
  
  // Pause game when dialog appears
  useEffect(() => {
    if (!dialogData) return
    
    // Pause game
    game.pause()
    
    // Resume game when dialog closes
    return () => {
      game.resume()
    }
  }, [dialogData])
  
  // Get BottomBar position dynamically (same as ItemDialog)
  // Must be called before early return to follow Rules of Hooks
  useEffect(() => {
    const updatePosition = () => {
      const bottomBar = document.querySelector('[data-test-id="bottombar-bg"]')
      if (bottomBar) {
        setBottomBarRect(bottomBar.getBoundingClientRect())
      }
    }
    
    // Initial update
    updatePosition()
    
    // Update on resize
    window.addEventListener('resize', updatePosition)
    
    // Update periodically in case BottomBar moves (e.g., during transitions)
    const interval = setInterval(updatePosition, 100)
    
    return () => {
      window.removeEventListener('resize', updatePosition)
      clearInterval(interval)
    }
  }, [])
  
  // Handle ESC key - must be called before early return
  useEffect(() => {
    if (!dialogData) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dialogData])
  
  // Early return after all hooks are called
  if (!dialogData || !bottomBarRect) return null
  
  const { site, time, fuelNeed, canAfford, onConfirm, onCancel, isHome } = dialogData
  
  // Check if player has motorcycle
  const hasMotorcycle = playerStore.getStorageItemCount('1305034') > 0 || 
                        playerStore.getBagItemCount('1305034') > 0
  
  // Dialog dimensions (based on dialog_big_bg.png sprite)
  const dialogWidth = 400
  const dialogHeight = 500
  
  // Title section: 90px height
  const titleHeight = 90
  // Action section: 72px height
  const actionHeight = 72
  // Content section: remaining height
  const contentHeight = dialogHeight - titleHeight - actionHeight + 120
  
  // Left/Right edges: 20px from dialog edges
  const leftEdge = 20
  const rightEdge = dialogWidth - leftEdge
  
  // Site icon name
  const iconName = `site_${site.id}.png`
  
  // Site description image name
  const digDesName = `site_dig_${site.id}.png`
  
  // Get site name
  const siteName = site.getName()
  
  // Get site description
  const siteDes = site.getDes()
  
  // Get progress string (for non-home sites)
  const progressStr = isHome ? null : site.getProgressStr(1, site.id)
  
  // Get item count (for non-home sites)
  const itemCount = isHome ? null : site.getAllItemNum()
  
  // Format travel time
  const timeStr = getTimeDistanceStr(time)
  
  // Format fuel cost string
  const fuelStr = fuelNeed > 0 ? getString(1340, fuelNeed) : null  // Format: "Fuel Need: %s"
  
  // Handle close
  const handleClose = () => {
    onCancel()
    uiStore.hideOverlay()
  }
  
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
        // Close on overlay click (not on dialog itself)
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
      data-test-id="site-dialog-overlay"
    >
      {/* Dark background overlay covering BottomBar area */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          width: '100%',
          height: '100%'
        }}
        onClick={handleClose}
      />
      
      {/* Dialog container - centered within BottomBar area */}
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
        data-test-id="site-dialog"
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
            left: 0,
            top: 0,
            width: `${dialogWidth}px`,
            height: `${titleHeight}px`
          }}
        >
          {/* Site icon */}
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
              atlas="site"
              frame={iconName}
              className="w-full h-full"
            />
          </div>
          
          {/* Site name */}
          <div
            className="absolute text-black"
            style={{
              left: `${leftEdge + 70}px`,
              top: '35%',
              transform: 'translateY(-50%)',
              fontSize: '25px',
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 'bold',
              maxWidth: `${rightEdge - leftEdge - 20}px`,
              lineHeight: '1.2'
            }}
            data-test-id="site-dialog-title"
          >
            {siteName}
          </div>
          
          {/* Progress/Item count - only for non-home sites */}
          {!isHome && (progressStr || itemCount !== null) && (
            <div
              className="absolute text-black"
              style={{
                left: `${leftEdge + 70}px`,
                top: '55%',
                fontSize: '20px',
                fontFamily: "'Noto Sans', sans-serif",
                lineHeight: '1.2'
              }}
              data-test-id="site-dialog-info"
            >
              {progressStr && <span>{progressStr}</span>}
              {progressStr && itemCount !== null && <span> | </span>}
              {itemCount !== null && <span>Items: {itemCount}</span>}
            </div>
          )}
          
          {/* Transport toggle (motorcycle on/off) - if player has motorcycle */}
          {hasMotorcycle && (
            <div
              className="absolute"
              style={{
                right: `${rightEdge + 30}px`,
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation()
                playerStore.setUseMoto(!playerStore.useMoto)
              }}
            >
              {/* TODO: Create transport toggle UI (motorcycle icon with on/off state) */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: playerStore.useMoto ? '#00ff00' : '#888888',
                  border: '2px solid #000000',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#000000'
                }}
                title={playerStore.useMoto ? 'Motorcycle: ON' : 'Motorcycle: OFF'}
              >
                M
              </div>
            </div>
          )}
        </div>
        
        {/* Content section */}
        <div
          className="absolute overflow-auto"
          style={{
            left: '0',
            top: `${titleHeight-15}px`,
            width: `${dialogWidth}px`,
            height: `${contentHeight}px`,
            padding: '10px'
          }}
        >
          {/* Site description image (dig_des) - scaled to 0.8 */}
          <div
            className="relative mx-auto mb-1"
            style={{
              width: '380px',
              height: 'auto'
            }}
          >
            <Sprite
              atlas="site"
              frame={digDesName}
              className="w-full h-full"
            />
          </div>
          
          {/* Description text */}
          <div
            className="text-black mb-2"
            style={{
              fontSize: '18px',
              fontFamily: "'Noto Sans', sans-serif",
              lineHeight: '1.4',
              paddingLeft: `${leftEdge}px`,
              paddingRight: `${leftEdge}px`
            }}
            data-test-id="site-dialog-description"
          >
            {siteDes}
          </div>
          
          {/* Travel info log section */}
          <div
            className="text-black"
            style={{
              fontSize: '18px',
              fontFamily: "'Noto Sans', sans-serif",
              lineHeight: '1.4',
              paddingLeft: `${leftEdge}px`,
              paddingRight: `${leftEdge}px`,
              marginTop: '10px'
            }}
            data-test-id="site-dialog-travel-info"
          >
            {/* Travel time */}
            <div style={{ marginBottom: '10px' }}>
              {timeStr}
            </div>
            
            {/* Fuel cost - if fuel needed */}
            {fuelStr && (
              <div style={{ color: canAfford ? '#000000' : '#ff0000' }}>
                {fuelStr}
              </div>
            )}
          </div>
        </div>
        
        {/* Action section */}
        <div
          className="absolute"
          style={{
            left: 0,
            bottom: '-60px',
            width: `${dialogWidth}px`,
            height: `${actionHeight}px`
          }}
        >
          {/* Cancel button (btn_1) */}
          <DialogButton
            text={getString(1193) || 'Cancel'}  // "Return"
            position={{ x: 25, y: 50 }}  // Left side, centered vertically
            onClick={handleClose}
            enabled={true}
          />
          
          {/* Go button (btn_2) */}
          <DialogButton
            text={getString(1138) || 'Go'}  // "Go"
            position={{ x: 50, y: 50 }}  // Right side, centered vertically
            onClick={() => {
              onConfirm()
              uiStore.hideOverlay()
            }}
            enabled={true}
          />
        </div>
      </div>
    </div>
  )
}

