/**
 * Build Panel Content Component
 * Main build panel showing upgrade view and recipe list
 * Ported from OriginalGame/src/ui/buildNode.js
 */

import { useEffect, useState } from 'react'
import { useBuildingStore } from '@/store/buildingStore'
import { emitter } from '@/utils/emitter'
import { Sprite } from '@/components/sprites/Sprite'
import { UpgradeView } from './UpgradeView'
import { RecipeListItem } from './RecipeListItem'
import { BedActionListItem } from './BedActionListItem'
import { BOTTOM_BAR_LAYOUT } from '@/components/layout/layoutConstants'
import { BedAction } from '@/game/systems/BedAction'

interface BuildPanelContentProps {
  buildingId: number
}

export function BuildPanelContent({ buildingId }: BuildPanelContentProps) {
  const buildingStore = useBuildingStore()
  const [updateTrigger, setUpdateTrigger] = useState(0)
  
  // Get building instance
  const building = buildingStore.getBuilding(buildingId)
  
  // Force re-render on updates
  void updateTrigger
  
  // Listen for building updates
  useEffect(() => {
    const handleBuildUpdate = () => {
      setUpdateTrigger(prev => prev + 1)
    }
    
    emitter.on('build_node_update', handleBuildUpdate)
    
    return () => {
      emitter.off('build_node_update', handleBuildUpdate)
    }
  }, [])
  
  if (!building) {
    return (
      <div className="text-white p-4">
        Building {buildingId} not found
      </div>
    )
  }
  
  // Check if bed building
  const isBed = buildingId === 9
  
  // Get building actions (recipes or bed actions)
  const actions = building.getBuildActions()
  const bedActions = isBed ? (actions as unknown as BedAction[]) : []
  const recipes = isBed ? [] : actions
  
  // Calculate layout dimensions based on original game
  // CommonListItem height = 100px (from uiUtil.createCommonListItem)
  const upgradeViewHeight = 100
  // Section separator positioned at: contentTopLineHeight - upgradeView.height with anchor (0.5, 1)
  // In CSS content area: top = upgradeViewHeight = 100px
  const sectionTop = upgradeViewHeight
  // Get actual section height from sprite (approximate, will adjust if needed)
  const sectionHeight = 30 // Approximate height of frame_section_bg.png
  // TableView: y = 10 (from bottom of bg in Cocos), size 596x610
  // Content area starts at top: 76px, height: 758px (834 - 76)
  // In CSS: tableView positioned from top of content area
  const contentHeight = BOTTOM_BAR_LAYOUT.content.height
  const tableViewHeight = 610
  const tableViewWidth = 596
  // Gap between section and table view
  const gapAfterSection = 10
  const recipeListTop = sectionTop + sectionHeight + gapAfterSection
  // Recipe list height should fill remaining space up to tableView height (610px)
  // Leave 10px margin at bottom (matching original tableView.y = 10)
  const recipeListHeight = Math.min(tableViewHeight, contentHeight - recipeListTop - 10)
  
  return (
    <div
      className="relative"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Upgrade View (top) - positioned at contentTopLineHeight with anchor (0.5, 1) */}
      {/* In CSS content area: top = 0 (at the very top) */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '0px',
          transform: 'translateX(-50%)',
          width: '600px' // CommonListItem width is 600px (from uiUtil.createCommonListItem)
        }}
      >
        <UpgradeView
          building={building}
          onUpgradeComplete={() => {
            setUpdateTrigger(prev => prev + 1)
          }}
        />
      </div>
      
      {/* Section Separator - positioned at contentTopLineHeight - upgradeView.height with anchor (0.5, 1) */}
      {/* In CSS content area: top = upgradeViewHeight = 100px */}
      <div
        className="absolute"
        style={{
          left: '51.4%',
          top: `${sectionTop}px`,
          transform: 'translateX(-50%)',
          width: '600px',
          height: 'auto'
        }}
      >
        <Sprite
          atlas="ui"
          frame="frame_section_bg.png"
          className="block"
        />
        
        {/* Operator text - positioned at (20, sectionView.height / 2) with anchor (0, 0.5) */}
        <div
          className="absolute"
          style={{
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '20px',
            fontFamily: "'Noto Sans', sans-serif",
            color: '#000000',
            fontWeight: 'normal'
          }}
        >
          Operator
        </div>
      </div>
      
      {/* Recipe List or Bed Actions (scrollable) - TableView positioned at y=10 from bottom */}
      {/* Width: 596px, Height: 610px, centered horizontally */}
      <div
        className="overflow-y-auto overflow-x-hidden"
        style={{
          position: 'absolute',
          left: '50%',
          top: `${recipeListTop}px`,
          transform: 'translateX(-50%)',
          width: `${tableViewWidth}px`, // TableView width from original
          height: `${recipeListHeight}px`
        }}
      >
        {isBed ? (
          // Bed actions display - use same layout as recipes
          bedActions.length === 0 ? (
            <div
              className="text-white p-4"
              style={{
                textAlign: 'center',
                fontSize: '16px',
                fontFamily: "'Noto Sans', sans-serif"
              }}
            >
              Bed not built
            </div>
          ) : (
            bedActions.map((action, index) => (
              <BedActionListItem
                key={index}
                action={action}
                index={index}
                buildingId={buildingId}
              />
            ))
          )
        ) : (
          // Normal recipe list
          recipes.length === 0 ? (
            <div
              className="text-white p-4"
              style={{
                textAlign: 'center',
                fontSize: '16px',
                fontFamily: "'Noto Sans', sans-serif"
              }}
            >
              No recipes available
            </div>
          ) : (
            recipes.map((recipe, index) => (
              <RecipeListItem
                key={recipe.id}
                recipe={recipe}
                index={index}
                buildingId={buildingId}
              />
            ))
          )
        )}
      </div>
    </div>
  )
}

