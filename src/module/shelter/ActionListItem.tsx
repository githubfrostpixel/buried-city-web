/**
 * Action List Item Component
 * Generic component for displaying building actions (BonfireBuildAction, RestBuildAction, DrinkBuildAction)
 * Uses same layout as BedActionListItem
 */

import { Sprite } from '@/common/ui/sprite/Sprite'
import { CommonListItemButton } from '@/common/ui/CommonListItemButton'
import { SpriteProgressBar } from '@/common/ui/SpriteProgressBar'
import { ItemCostDisplay } from '@/common/ui/ItemCostDisplay'
import { useState, useEffect } from 'react'
import { emitter } from '@/common/utils/emitter'

interface ActionDisplayInfo {
  iconName: string
  hint: string
  hintColor: string | null
  actionText: string
  disabled: boolean
  percentage: number
  items?: Array<{ itemId: number; num: number; color?: string }>
}

interface ActionListItemProps {
  action: {
    getDisplayInfo: () => ActionDisplayInfo
    clickAction1: () => void
  }
  index: number
  buildingId: number
  onIconClick?: () => void
}

export function ActionListItem({ action, index, onIconClick }: ActionListItemProps) {
  const [updateTrigger, setUpdateTrigger] = useState(0)
  
  // Force re-render on updates
  void updateTrigger
  
  // Listen for build updates to refresh display
  useEffect(() => {
    const handleBuildUpdate = () => {
      setUpdateTrigger(prev => prev + 1)
    }
    
    emitter.on('build_node_update', handleBuildUpdate)
    
    return () => {
      emitter.off('build_node_update', handleBuildUpdate)
    }
  }, [])
  
  // Get display info from action
  const displayInfo = action.getDisplayInfo()
  
  // Handle icon click
  const handleIconClick = () => {
    if (onIconClick) {
      onIconClick()
    } else {
      // TODO: Show action dialog
      console.log('Action icon clicked:', index)
    }
  }
  
  // Handle action button click
  const handleAction = () => {
    if (displayInfo.disabled) return
    
    action.clickAction1()
    setUpdateTrigger(prev => prev + 1)
  }
  
  return (
    <div
      className="relative"
      style={{
        width: '596px',
        height: '120px',
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
      
      {/* Action icon (left side, clickable) */}
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
        {/* Action icon */}
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
      
      {/* Content area (middle) */}
      <div
        className="absolute"
        style={{
          left: '120px',
          top: '45%',
          transform: 'translateY(-50%)',
          width: '300px'
        }}
      >
        {/* Hint text */}
        <div
          style={{
            fontSize: '20px',
            fontFamily: "'Noto Sans', sans-serif",
            color: displayInfo.hintColor || '#FFFFFF',
            fontWeight: 'normal',
            lineHeight: '1.2',
            wordWrap: 'break-word',
            marginBottom: displayInfo.items && displayInfo.items.length > 0 ? '8px' : '0'
          }}
        >
          {displayInfo.hint}
        </div>
        
        {/* Cost items (if available) */}
        {displayInfo.items && displayInfo.items.length > 0 && (
          <ItemCostDisplay
            costs={displayInfo.items.map(item => ({
              itemId: item.itemId,
              num: item.num
            }))}
            columns={3}
            width={300}
            iconScale={0.8}
            textSize={18}
            textColor={displayInfo.items[0]?.color || '#ffffff'}
          />
        )}
      </div>
      
      {/* Action button (right side) */}
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
          onClick={handleAction}
          enabled={!displayInfo.disabled}
        />
      </div>
      
      {/* Progress bar overlay (when actioning) */}
      {displayInfo.percentage > 0 && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              pointerEvents: 'none'
            }}
          />
          <SpriteProgressBar
            progress={Math.min(100, Math.max(0, displayInfo.percentage))}
            position="bottom"
            offsetY={12}
            style={{ 
              pointerEvents: 'none',
              left: '45%',
              transform: 'translateX(-50%)'
            }}
          />
        </>
      )}
    </div>
  )
}

