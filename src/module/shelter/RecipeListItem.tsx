/**
 * Recipe List Item Component
 * Displays individual recipe item in the crafting list
 * Ported from OriginalGame/src/ui/buildNode.js tableCellAtIndex()
 */

import { Formula } from '@/core/game/systems/Formula'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { ItemCostDisplay } from '@/common/ui/ItemCostDisplay'
import { CommonListItemButton } from '@/common/ui/CommonListItemButton'
import { SpriteProgressBar } from '@/common/ui/SpriteProgressBar'
import { emitter } from '@/common/utils/emitter'
import { useState, useEffect } from 'react'
import { useUIStore } from '@/core/store/uiStore'
import { useBuildingStore } from '@/core/store/buildingStore'
import { getRecipeIcon } from '@/common/utils/recipeIcon'
import { getString } from '@/common/utils/stringUtil'

interface RecipeListItemProps {
  recipe: Formula
  index: number
  buildingId: number
  onIconClick?: () => void
}

export function RecipeListItem({ recipe, index, buildingId, onIconClick }: RecipeListItemProps) {
  const uiStore = useUIStore()
  const buildingStore = useBuildingStore()
  
  // Get recipe state
  const step = recipe.step ?? 0
  const isActioning = recipe.isActioning ?? false
  const canMake = recipe.canMake ? recipe.canMake() : false
  
  // Check building requirement (needBuild)
  let buildingRequirement: { name: string; met: boolean } | null = null
  if (recipe.needBuild) {
    const requiredBuilding = buildingStore.getBuilding(recipe.needBuild.bid)
    const currentLevel = requiredBuilding ? requiredBuilding.level : -1
    const requiredLevel = recipe.needBuild.level
    const buildingName = getString(`${recipe.needBuild.bid}_${requiredLevel}`)?.title || 
                        getString(`${recipe.needBuild.bid}_0`)?.title || 
                        `Building ${recipe.needBuild.bid}`
    buildingRequirement = {
      name: buildingName,
      met: currentLevel >= requiredLevel
    }
  }
  
  // Progress tracking
  const [progress, setProgress] = useState(0)
  
  // Listen for progress updates
  useEffect(() => {
    const handleProgress = (data: { formulaId: number; buildingId: number; progress: number }) => {
      if (data.formulaId === recipe.id && data.buildingId === buildingId) {
        setProgress(data.progress)
      }
    }
    
    emitter.on('formula_progress', handleProgress)
    
    // Listen for build_node_update to refresh state
    const handleBuildUpdate = () => {
      // Reset progress when crafting completes
      if (!recipe.isActioning && step === 0) {
        setProgress(0)
      }
    }
    
    emitter.on('build_node_update', handleBuildUpdate)
    
    return () => {
      emitter.off('formula_progress', handleProgress)
      emitter.off('build_node_update', handleBuildUpdate)
    }
  }, [recipe.id, buildingId, recipe.isActioning, step])
  
  // Determine button state
  const showMakeButton = step === 0 && !isActioning && canMake
  const showTakeButton = step === 2 && !isActioning
  const showProgress = step === 1 || isActioning
  
  // Get recipe icon - use build_action icon for special buildings, otherwise use produced item's icon
  // From buildAction.js: Default uses icon_item_{itemId}.png, special buildings use build_action_{bid}_{index}.png
  const produce = recipe.getProduce()
  const producedItemId = produce.length > 0 ? produce[0].itemId : null
  const { iconName, atlas: iconAtlas } = getRecipeIcon(buildingId, index, producedItemId)
  
  // Get recipe cost from Formula config
  const recipeCost = recipe.getCost()
  
  // Handle icon click (show recipe info dialog)
  const handleIconClick = () => {
    if (onIconClick) {
      onIconClick()
    } else {
      // Show recipe info dialog
      uiStore.showRecipeDialog(buildingId, index)
    }
  }
  
  // Handle Make button click
  const handleMake = () => {
    if (!showMakeButton) return
    
    // Call Formula.make() method
    const success = recipe.make()
    if (!success) {
      // Show error message or notification
      console.warn('Cannot start crafting:', recipe.id)
      return
    }
    
    // UI will update via build_node_update event
  }
  
  // Handle Take button click
  const handleTake = () => {
    if (!showTakeButton) return
    
    // Call Formula.take() method
    const success = recipe.take()
    if (!success) {
      // Show error message or notification
      console.warn('Cannot take item:', recipe.id)
      return
    }
    
    // UI will update via build_node_update event
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
      
      {/* Recipe icon (left side, clickable) - with build_icon_bg.png background */}
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
        {/* Recipe icon - bigger and fit snugly inside bg */}
        <Sprite
          atlas={iconAtlas}
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
      
      {/* Recipe cost items and building requirement (middle) */}
      <div
        className="absolute"
        style={{
          left: '120px',
          top: '45%',
          transform: 'translateY(-50%)',
          width: '300px'
        }}
      >
        {/* Building requirement hint (if not met) */}
        {buildingRequirement && !buildingRequirement.met && (
          <div
            style={{
              color: '#FF0000',
              fontSize: '14px',
              marginBottom: '8px',
              fontFamily: "'Noto Sans', sans-serif"
            }}
          >
            {getString(1006, buildingRequirement.name) || `You need ${buildingRequirement.name}!`}
          </div>
        )}
        {/* Recipe cost items - bigger icons and text */}
        {recipeCost.length > 0 && (
          <ItemCostDisplay
            costs={recipeCost}
            columns={3}
            width={300}
            iconScale={0.95}
            textSize={20}
            textColor="#ffffff"
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
        {showMakeButton && (
          <CommonListItemButton
            text="Make"
            onClick={handleMake}
            enabled={true}
          />
        )}
        
        {showTakeButton && (
          <CommonListItemButton
            text="Take"
            onClick={handleTake}
            enabled={true}
          />
        )}
        
        {showProgress && (
          <CommonListItemButton
            text="Crafting..."
            enabled={false}
          />
        )}
      </div>
      
      {/* Progress bar overlay (when crafting) */}
      {showProgress && (
        <>
          {/* Dark overlay to indicate crafting in progress */}
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              pointerEvents: 'none'
            }}
          />
          {/* Sprite-based progress bar */}
          <SpriteProgressBar
            progress={Math.min(100, Math.max(0, progress))}
            position="bottom"
            offsetY={12}
            style={{ 
              pointerEvents: 'none',
              left:  '45%',
              transform: 'translateX(-50%)'
            }}
          />
        </>
      )}
    </div>
  )
}

