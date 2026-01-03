/**
 * RecipeDialog Component
 * Dialog showing recipe information (name, icon, description)
 * Ported from OriginalGame/src/ui/uiUtil.js showBuildActionDialog()
 * 
 * Structure:
 * - Title section: Recipe icon, recipe title
 * - Content section: Recipe description text
 * - Action section: OK button
 */

import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useBuildingStore } from '@/store/buildingStore'
import { Sprite } from '@/components/sprites/Sprite'
import { DialogButton } from '@/components/common/DialogButton'
import { getRecipeIcon } from '@/utils/recipeIcon'
import { getString } from '@/utils/stringUtil'

interface RecipeDialogData {
  buildingId: number
  recipeIndex: number  // Index in building's recipe list
}

// Get build dialog base config from string system (uses same "build" string)
function getBuildDialogBase() {
  const config = getString('build')
  if (typeof config === 'object' && config !== null) {
    return config as {
      action: { btn_1: { txt: string } }
    }
  }
  // Fallback if not found
  return {
    action: { btn_1: { txt: 'OK' } }
  }
}

export function RecipeDialog() {
  const uiStore = useUIStore()
  const buildingStore = useBuildingStore()
  
  // Get dialog data from overlay state
  const dialogData = (uiStore.activeOverlay === 'recipeDialog' 
    ? (uiStore as any).overlayData as RecipeDialogData 
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
  
  const { buildingId, recipeIndex } = dialogData
  
  // Get building instance
  const building = buildingStore.getBuilding(buildingId)
  if (!building) return null
  
  // Get recipe list
  const recipes = building.getBuildActions()
  
  // Validate recipe index
  if (recipeIndex < 0 || recipeIndex >= recipes.length) return null
  
  const recipe = recipes[recipeIndex]
  
  // Get recipe name and description from string system
  // Special building actions (5, 8, 9, 10, 12, 17) use "b_a_" + buildingId strings
  // Regular crafting recipes use the produced item's string ID
  const BUILD_ACTION_BUILDINGS = [5, 8, 9, 10, 12, 17] // Bonfire, Trap, Bed, Rest, Dog, Bomb
  
  let recipeName = `Recipe ${recipe.id}` // Fallback
  let recipeDescription = '' // Fallback
  
  if (BUILD_ACTION_BUILDINGS.includes(buildingId)) {
    // Special building action - use "b_a_" string
    let stringId: string
    if (buildingId === 10 && recipeIndex === 1) {
      // Special case: Building 10 (Rest), index 1 uses "b_a_10_1"
      stringId = `b_a_${buildingId}_${recipeIndex}`
    } else {
      stringId = `b_a_${buildingId}`
    }
    
    const recipeConfig = getString(stringId)
    if (typeof recipeConfig === 'object' && recipeConfig !== null) {
      if ('title' in recipeConfig) {
        recipeName = recipeConfig.title as string
      }
      if ('des' in recipeConfig) {
        recipeDescription = recipeConfig.des as string
      }
    }
  } else {
    // Regular crafting recipe - use produced item's string ID
    const produce = recipe.getProduce()
    if (produce.length > 0) {
      const producedItemId = produce[0].itemId
      const itemConfig = getString(String(producedItemId))
      if (typeof itemConfig === 'object' && itemConfig !== null) {
        if ('title' in itemConfig) {
          recipeName = itemConfig.title as string
        }
        if ('des' in itemConfig) {
          recipeDescription = itemConfig.des as string
        }
      }
    }
  }
  
  // Get recipe icon - use build_action icon for special buildings, otherwise use produced item's icon
  // Original: Default uses icon_item_{itemId}.png, special buildings use build_action_{bid}_{index}.png
  const produce = recipe.getProduce()
  const producedItemId = produce.length > 0 ? produce[0].itemId : null
  const { iconName, atlas: iconAtlas } = getRecipeIcon(buildingId, recipeIndex, producedItemId)
  
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
      data-test-id="recipe-dialog-overlay"
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
        data-test-id="recipe-dialog"
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
          {/* Recipe icon */}
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
              atlas={iconAtlas}
              frame={iconName}
              className="w-full h-full"
            />
          </div>
          
          {/* Recipe title */}
          <div
            className="absolute"
            style={{
              left: `${leftEdge + 50}px`,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '24px', // COMMON_1
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 'normal',
              color: '#000000',
              lineHeight: '1.2'
            }}
          >
            {recipeName}
          </div>
        </div>
        
        {/* Content section */}
        <div
          className="absolute overflow-y-auto"
          style={{
            left: 0,
            top: `${titleHeight}px`,
            width: `${dialogWidth}px`,
            height: `${contentHeight}px`
          }}
        >
          {/* Description text */}
          <div
            className="absolute"
            style={{
              left: `${leftEdge}px`,
              top: '5px',
              width: `${rightEdge - leftEdge}px`,
              fontSize: '20px', // COMMON_3
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 'normal',
              color: '#000000',
              lineHeight: '1.4',
              wordWrap: 'break-word'
            }}
          >
            {recipeDescription}
          </div>
        </div>
        
        {/* Action section */}
        <div
          className="absolute"
          style={{
            left: 0,
            bottom: '-75px',
            width: `${dialogWidth}px`,
            height: `${actionHeight}px`
          }}
        >
          {/* OK button - centered */}
          <DialogButton
            text={getBuildDialogBase().action.btn_1.txt}
            position={{ x: 50, y: 50 }} // 50% = center
            onClick={() => uiStore.hideOverlay()}
            className=""
          />
        </div>
      </div>
    </div>
  )
}

