/**
 * Bed Action List Item Component
 * Displays individual bed sleep action in the list
 * Ported from OriginalGame/src/ui/buildNode.js tableCellAtIndex() with createCommonListItem
 * Uses same layout as RecipeListItem but without cost items
 */

import { BedAction } from '@/core/game/systems/BedAction'
import { Sprite } from '@/shared/components/sprites/Sprite'
import { CommonListItemButton } from '@/shared/components/common/CommonListItemButton'
import { SpriteProgressBar } from '@/shared/components/common/SpriteProgressBar'
import { useState, useEffect } from 'react'
import { useUIStore } from '@/core/store/uiStore'
import { game } from '@/core/game/Game'
import { emitter } from '@/shared/utils/emitter'

interface BedActionListItemProps {
  action: BedAction
  index: number
  buildingId: number
  onIconClick?: () => void
}

export function BedActionListItem({ action, index, buildingId, onIconClick }: BedActionListItemProps) {
  const uiStore = useUIStore()
  const [updateTrigger, setUpdateTrigger] = useState(0)
  
  // Force re-render on updates
  void updateTrigger
  
  // Listen for build updates to refresh display
  useEffect(() => {
    const handleBuildUpdate = () => {
      setUpdateTrigger(prev => prev + 1)
    }
    
    const interval = setInterval(() => {
      // Update progress periodically when sleeping
      const survivalSystem = game.getSurvivalSystem()
      const sleepState = survivalSystem.getSleepState()
      if (sleepState.isSleeping) {
        setUpdateTrigger(prev => prev + 1)
      }
    }, 100) // Update every 100ms for smooth progress
    
    emitter.on('build_node_update', handleBuildUpdate)
    
    return () => {
      emitter.off('build_node_update', handleBuildUpdate)
      clearInterval(interval)
    }
  }, [])
  
  // Get display info from action
  const displayInfo = action.getDisplayInfo()
  
  // Handle icon click (show action info dialog - placeholder for now)
  const handleIconClick = () => {
    if (onIconClick) {
      onIconClick()
    } else {
      // TODO: Show bed action dialog (showBuildActionDialog equivalent)
      // For now, just log
      console.log('Bed action icon clicked:', action.type)
    }
  }
  
  // Handle Sleep button click
  const handleSleep = () => {
    if (displayInfo.disabled) return
    
    const success = action.startSleep()
    if (success) {
      setUpdateTrigger(prev => prev + 1)
    }
  }
  
  return (
    <div
      className="relative"
      style={{
        width: '596px', // TableView cell width is 596px (from tableCellSizeForIndex)
        height: '120px', // TableView cell height is 120px (from tableCellSizeForIndex)
        margin: '0 auto',
        padding: '0',
        boxSizing: 'border-box'
      }}
    >
      {/* Background frame */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      />
      
      {/* Action icon (left side, clickable) - with build_icon_bg.png background */}
      <button
        onClick={handleIconClick}
        className="absolute"
        style={{
          left: '20px',
          top: '60%',
          transform: 'translateY(-50%)',
          width: '80px',
          height: '80px',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer'
        }}
      >
        {/* Icon background sprite */}
        <Sprite
          atlas="ui"
          frame="build_icon_bg.png"
          className="absolute inset-0 w-full h-full"
        />
        {/* Action icon - bigger and fit snugly inside bg */}
        <Sprite
          atlas="build"
          frame={displayInfo.iconName}
          className="absolute"
          style={{
            left: '50%',
            top: '34%',
            transform: 'translate(-50%, -50%)',
            width: '95%',
            height: '95%',
            objectFit: 'contain'
          }}
        />
      </button>
      
      {/* Hint text (middle) - positioned like in original */}
      <div
        className="absolute"
        style={{
          left: '120px', // iconBg position (20px) + iconBg width/2 (40px) + 10px gap + iconBg width/2 (40px) + 10px
          top: '50%',
          transform: 'translateY(-50%)',
          width: '268px' // Hint width from original (uiUtil.fontSize.COMMON_3, cc.size(268, 0))
        }}
      >
        {/* Hint text */}
        <div
          style={{
            fontSize: '20px', // COMMON_3
            fontFamily: "'Noto Sans', sans-serif",
            color: displayInfo.hintColor || '#FFFFFF',
            fontWeight: 'normal',
            lineHeight: '1.2',
            wordWrap: 'break-word'
          }}
        >
          {displayInfo.hint}
        </div>
        
        {/* Progress bar (when sleeping) - positioned below hint like in original */}
        {displayInfo.percentage > 0 && (
          <div
            className="absolute"
            style={{
              left: '-100px',
              top: '100%',
              marginTop: '10px',
              width: '500px',
              height: 'auto'
            }}
          >
            <SpriteProgressBar
              progress={Math.min(100, Math.max(0, displayInfo.percentage))}
              position="top"
              offsetY={0}
              style={{ 
                pointerEvents: 'none'
              }}
            />
          </div>
        )}
      </div>
      
      {/* Action button (right side) - positioned at width - 10 - button.width/2, height/2 */}
      <div
        className="absolute"
        style={{
          right: '30px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        <CommonListItemButton
          text={displayInfo.actionText}
          onClick={handleSleep}
          enabled={!displayInfo.disabled}
        />
      </div>
      
      {/* Progress overlay (when sleeping) */}
      {displayInfo.percentage > 0 && (
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  )
}

