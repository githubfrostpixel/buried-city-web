/**
 * Upgrade View Component
 * Displays building upgrade section with icon, costs, and upgrade button
 * Ported from OriginalGame/src/ui/buildNode.js updateUpgradeView()
 */

import { useState, useEffect } from 'react'
import { Building } from '@/game/world/Building'
import { BuildUpgradeType } from '@/types/building.types'
import { Sprite } from '@/components/sprites/Sprite'
import { ItemCostDisplay } from '@/components/common/ItemCostDisplay'
import { CommonListItemButton } from '@/components/common/CommonListItemButton'
import { emitter } from '@/utils/emitter'
import { useUIStore } from '@/store/uiStore'

interface UpgradeViewProps {
  building: Building
  onUpgradeStart?: () => void
  onUpgradeComplete?: () => void
}

export function UpgradeView({ building, onUpgradeStart, onUpgradeComplete }: UpgradeViewProps) {
  const [upgradeProgress, setUpgradeProgress] = useState(0)
  const uiStore = useUIStore()
  
  // Get upgrade info
  const upgradeResult = building.canUpgrade()
  const upgradeConfig = building.getUpgradeConfig()
  
  // Handle icon click - show build dialog (same as original)
  const handleIconClick = () => {
    // Show build dialog with target level (next level if upgradeable, current if max)
    const targetLevel = building.isMax() ? building.level : (building.level + 1)
    uiStore.showBuildDialog(building.id, targetLevel)
  }
  
  // Listen for upgrade progress updates
  useEffect(() => {
    if (!building.isUpgrading) {
      setUpgradeProgress(0)
      return
    }
    
    // TODO: Listen to actual upgrade progress from Building class
    // For now, we'll update via building state changes
    const handleBuildUpdate = () => {
      if (building.isUpgrading) {
        // Progress will be updated by Building class via callback
        // For now, just check if still upgrading
      } else {
        setUpgradeProgress(0)
        if (onUpgradeComplete) {
          onUpgradeComplete()
        }
      }
    }
    
    emitter.on('build_node_update', handleBuildUpdate)
    
    return () => {
      emitter.off('build_node_update', handleBuildUpdate)
    }
  }, [building.isUpgrading, onUpgradeComplete])
  
  // Handle upgrade button click
  const handleUpgrade = () => {
    if (upgradeResult.buildUpgradeType !== BuildUpgradeType.UPGRADABLE) {
      return
    }
    
    if (building.isUpgrading || building.anyBtnActive()) {
      return
    }
    
    // Start upgrade with progress callback
    building.upgrade(
      (progress: number) => {
        setUpgradeProgress(progress)
      },
      () => {
        setUpgradeProgress(0)
        if (onUpgradeComplete) {
          onUpgradeComplete()
        }
        emitter.emit('build_node_update')
      }
    )
    
    if (onUpgradeStart) {
      onUpgradeStart()
    }
    
    emitter.emit('build_node_update')
  }
  
  // Determine display level (next level if upgradeable, current if max)
  const displayLevel = building.isMax() 
    ? building.level 
    : (upgradeConfig ? upgradeConfig.level : building.level)
  
  // Get icon name (use current level if upgradeConfig is null)
  const iconLevel = upgradeConfig ? displayLevel : building.level
  const iconName = `build_${building.id}_${iconLevel}.png`
  
  // Determine button text and state
  let buttonText = ''
  let buttonDisabled = true
  let hint = ''
  let hintColor: string | null = null
  let costItems: Array<{ itemId: number | string; num: number }> | null = null
  
  switch (upgradeResult.buildUpgradeType) {
    case BuildUpgradeType.UPGRADABLE:
      if (upgradeConfig) {
        // TODO: Apply IAPPackage.isHandyworkerUnlocked() bonus (30% reduction)
        const upgradeTime = upgradeConfig.upgradeTime
        buttonText = building.needBuild() 
          ? `Build (${upgradeTime}m)` 
          : `Upgrade (${upgradeTime}m)`
        buttonDisabled = building.isUpgrading || building.anyBtnActive()
        costItems = upgradeConfig.upgradeCost
      } else {
        buttonText = building.needBuild() ? 'Build' : 'Upgrade'
        buttonDisabled = true
      }
      break
      
    case BuildUpgradeType.MAX_LEVEL:
      buttonText = 'Max Level'
      buttonDisabled = true
      hint = 'Already at maximum level'
      break
      
    case BuildUpgradeType.CONDITION:
      if (upgradeResult.condition) {
        // TODO: Get building name from string system
        const requiredBuildingName = `Building ${upgradeResult.condition.bid} Level ${upgradeResult.condition.level}`
        hint = `Requires: ${requiredBuildingName}`
        hintColor = '#ff0000'
        buttonText = building.needBuild() ? 'Build' : 'Upgrade'
        buttonDisabled = true
      }
      break
      
    case BuildUpgradeType.COST:
      if (upgradeResult.cost) {
        // Map cost to show haveNum vs num
        costItems = upgradeResult.cost.map((itemInfo: any) => ({
          itemId: itemInfo.itemId,
          num: itemInfo.num
        }))
        buttonText = building.needBuild() ? 'Build' : 'Upgrade'
        buttonDisabled = true
      }
      break
  }
  
  return (
    <div
      className="relative"
      style={{
        width: '600px', // CommonListItem width is 600px (from uiUtil.createCommonListItem)
        height: '100px', // CommonListItem height is 100px
        margin: '0 auto'
      }}
    >
      {/* Background frame (similar to CommonListItem) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px'
        }}
      />
      
      {/* Building icon (left side) - with build_icon_bg.png background */}
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
        {/* Building icon - scaled to fit snugly inside bg */}
        <Sprite
          atlas="build"
          frame={iconName}
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
      
      {/* Cost items and hint (middle) */}
      <div
        className="absolute"
        style={{
          left: '120px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '300px'
        }}
      >
        {/* Hint text (if any) */}
        {hint && (
          <div
            style={{
              fontSize: '14px',
              fontFamily: "'Noto Sans', sans-serif",
              color: hintColor || '#000000',
              marginBottom: '5px'
            }}
          >
            {hint}
          </div>
        )}
        
        {/* Cost items */}
        {costItems && costItems.length > 0 && (
          <ItemCostDisplay
            costs={costItems}
            columns={3}
            width={300}
            iconScale={0.95}
            textSize={20}
          />
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
          text={building.isUpgrading ? `${Math.round(upgradeProgress)}%` : buttonText}
          onClick={handleUpgrade}
          enabled={!buttonDisabled && !building.isUpgrading}
        />
      </div>
      
      {/* Progress bar overlay (when upgrading) */}
      {building.isUpgrading && (
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '4px',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '0',
              bottom: '0',
              width: `${upgradeProgress}%`,
              height: '4px',
              background: '#4CAF50',
              transition: 'width 0.1s linear'
            }}
          />
        </div>
      )}
    </div>
  )
}

