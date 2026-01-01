/**
 * BuildDialog Component
 * Dialog showing building information and upgrade costs
 * Ported from OriginalGame/src/ui/uiUtil.js showBuildDialog()
 * 
 * Structure:
 * - Title section: Building icon, building title
 * - Content section: Large building image, description, upgrade costs (if available)
 * - Action section: OK button
 */

import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useBuildingStore } from '@/store/buildingStore'
import { Sprite } from '@/components/sprites/Sprite'
import { DialogButton } from '@/components/common/DialogButton'
import { ItemCostDisplay } from '@/components/common/ItemCostDisplay'

interface BuildDialogData {
  buildingId: number
  level: number  // Level to show (current level + 1 for upgrade, or current level)
}

// Base build dialog config (from string "build")
const BUILD_DIALOG_BASE = {
  content: {
    log: "To build you need:"
  },
  action: {
    btn_1: { txt: "OK" }
  }
}

export function BuildDialog() {
  const uiStore = useUIStore()
  const buildingStore = useBuildingStore()
  
  // Get dialog data from overlay state
  const dialogData = (uiStore.activeOverlay === 'buildDialog' 
    ? (uiStore as any).overlayData as BuildDialogData 
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
  
  const { buildingId, level } = dialogData
  
  // Get building instance
  const building = buildingStore.getBuilding(buildingId)
  if (!building) return null
  
  // Get building name (placeholder until string system is implemented)
  const buildingName = buildingStore.room
    ? buildingStore.room.getBuildCurrentName(buildingId)
    : `Building ${buildingId}`
  
  // Get building description (placeholder until string system is implemented)
  // Original: stringUtil.getString(bid + "_" + level).des
  const buildingDescription = `This is ${buildingName} at level ${level}.` // Placeholder
  
  // Get upgrade config for the target level
  const upgradeConfig = building.getUpgradeConfig()
  
  // Get upgrade costs if upgrade config exists
  // ItemCostDisplay handles validation and color coding internally
  let upgradeCosts: Array<{ itemId: number | string; num: number }> | null = null
  if (upgradeConfig && upgradeConfig.upgradeCost) {
    upgradeCosts = upgradeConfig.upgradeCost.map((itemInfo: any) => ({
      itemId: itemInfo.itemId,
      num: itemInfo.num
    }))
  }
  
  // Dialog dimensions (based on dialog_big_bg.png sprite)
  // Typical size: ~400px width, ~500px height (adjust based on actual sprite)
  const dialogWidth = 400
  const dialogHeight = 500
  
  // Title section: 90px height
  const titleHeight = 90
  // Action section: 72px height
  const actionHeight = 72
  // Content section: remaining height
  const contentHeight = dialogHeight - titleHeight - actionHeight
  
  // Log section height (when upgrade available): 130px
  const logHeight = 130
  
  // Left/Right edges: 20px from dialog edges
  const leftEdge = 20
  const rightEdge = dialogWidth - leftEdge
  
  // Calculate available space for image + description
  // If upgrade available, reserve logHeight at bottom
  const imageDescriptionHeight = upgradeCosts && upgradeCosts.length > 0
    ? contentHeight - logHeight
    : contentHeight
  
  // Building icon name
  const iconName = `build_${buildingId}_${level}.png`
  
  // Large building image name
  const largeImageName = `dig_build_${buildingId}_${level}.png`
  
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={(e) => {
        // Close on overlay click (autoDismiss = true in original)
        if (e.target === e.currentTarget) {
          uiStore.hideOverlay()
        }
      }}
      data-test-id="build-dialog-overlay"
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
        data-test-id="build-dialog"
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
          {/* Building icon */}
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
              atlas="build"
              frame={iconName}
              className="w-full h-full"
            />
          </div>
          
          {/* Building title */}
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
            {buildingName}
          </div>
        </div>
        
        {/* Content section */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: 0,
            top: `${titleHeight}px`,
            width: `${dialogWidth}px`,
            height: `${contentHeight}px`
          }}
        >
          {/* Large building image - centered, 5px from top */}
          <div
            className="absolute"
            style={{
              left: '50%',
              top: '-20px',
              transform: 'translateX(-50%)',
              width: '400px',
              height: 'auto'
            }}
          >
            <Sprite
              atlas="dig_build"
              frame={largeImageName}
              className="w-full h-full"
            />
          </div>
          
          {/* Description text - below image */}
          <div
            className="absolute overflow-y-auto"
            style={{
              left: `${leftEdge}px`,
              top: '210px', // Below image (5px + 200px + 5px gap)
              width: `${rightEdge - leftEdge}px`,
              // If log section exists, limit height to prevent overlap
              height: upgradeCosts && upgradeCosts.length > 0
                ? `${imageDescriptionHeight - 210}px` // Available space minus image area
                : `${contentHeight - 210}px`, // Full content height minus image area
              fontSize: '20px', // COMMON_3
              fontFamily: "'Noto Sans', sans-serif",
              fontWeight: 'normal',
              color: '#000000',
              lineHeight: '1.4',
              wordWrap: 'break-word'
            }}
          >
            {buildingDescription}
          </div>
          
          {/* Log section (upgrade costs) - at bottom of content, 130px height */}
          {upgradeCosts && upgradeCosts.length > 0 && (
            <div
              className="absolute"
              style={{
                left: 0,
                bottom: 0,
                width: `${dialogWidth}px`,
                height: `${logHeight}px`
              }}
            >
              {/* Label: "To build you need:" */}
              <div
                className="absolute"
                style={{
                  left: `${leftEdge}px`,
                  top: '35px',
                  fontSize: '20px', // COMMON_3
                  fontFamily: "'Noto Sans', sans-serif",
                  fontWeight: 'normal',
                  color: '#000000',
                  lineHeight: '1.2'
                }}
              >
                {BUILD_DIALOG_BASE.content.log}
              </div>
              
              {/* Item cost display - below label, 10px gap */}
              <div
                className="absolute"
                style={{
                  left: `${leftEdge}px`,
                  top: '60px', // 10px label + 20px font size + 10px gap
                  width: `${rightEdge - leftEdge}px`
                }}
              >
                <ItemCostDisplay
                  costs={upgradeCosts}
                  columns={3}
                  iconScale={1}
                  textSize={20} // COMMON_3
                  textColor="#000000" // BLACK
                  width={rightEdge - leftEdge}
                />
              </div>
            </div>
          )}
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
            text={BUILD_DIALOG_BASE.action.btn_1.txt}
            position={{ x: 50, y: 50 }} // 50% = center
            onClick={() => uiStore.hideOverlay()}
            className=""
          />
        </div>
      </div>
    </div>
  )
}

