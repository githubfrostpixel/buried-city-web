/**
 * HomePanelContent Component
 * Home screen content showing all buildings
 * Ported from OriginalGame/src/ui/home.js
 * 
 * This is the content-only component that goes inside BottomSection.
 * BottomSection handles the frame/layout, this handles the home content.
 * 
 * Gate Light Effect:
 * - Positioned at center of gate button (building 14)
 * - Transform: translate(-47%, -55%) scale(2.35)
 * - Animation: gateLightFade 4s infinite (fade in/out)
 * - These values were fine-tuned to match original game appearance
 */

import { useEffect, useState } from 'react'
import { useBuildingStore } from '@/core/store/buildingStore'
import { usePlayerStore } from '@/core/store/playerStore'
import { useUIStore } from '@/core/store/uiStore'
import { emitter } from '@/shared/utils/emitter'
import { Sprite } from '@/shared/components/sprites/Sprite'
import { BuildingButton } from '@/shared/components/common/BuildingButton'
import { game } from '@/core/game/Game'

// Building positions from original game (Cocos coordinates, relative to home_bg)
const BUILDING_POSITIONS = [
  { bid: 1, pos: { x: 65, y: 230 } },
  { bid: 2, pos: { x: 425, y: 780 } },
  { bid: 18, pos: { x: 205, y: 165 } },
  { bid: 4, pos: { x: 477, y: 562 } },
  { bid: 5, pos: { x: 310, y: 330 } },
  { bid: 6, pos: { x: 75, y: 390 } },
  { bid: 15, pos: { x: 408, y: 677 } },
  { bid: 7, pos: { x: 250, y: 630 } },
  { bid: 8, pos: { x: 84, y: 780 } },
  { bid: 9, pos: { x: 75, y: 590 } },
  { bid: 10, pos: { x: 480, y: 410 } },
  { bid: 11, pos: { x: 436, y: 85 } },
  { bid: 13, pos: { x: 124, y: 49 } },
  { bid: 14, pos: { x: 425, y: 216 } },
  { bid: 16, pos: { x: 203, y: 290 } },
  { bid: 19, pos: { x: 436, y: 85 } },
  { bid: 17, pos: { x: 416, y: 108 } },
  { bid: 3, pos: { x: 545, y: 268 } },
  { bid: 12, pos: { x: 335, y: 125 } },
  { bid: 20, pos: { x: 196, y: 780 } },
  { bid: 21, pos: { x: 525, y: 674 } }
]

interface HomePanelContentProps {
  onBuildingClick?: (bid: number) => void
}

export function HomePanelContent({ onBuildingClick }: HomePanelContentProps) {
  const buildingStore = useBuildingStore()
  const playerStore = usePlayerStore()
  const uiStore = useUIStore()
  const [updateTrigger, setUpdateTrigger] = useState(0)

  // Ensure building store is initialized
  useEffect(() => {
    if (!buildingStore.room) {
      buildingStore.initialize()
    }
  }, [buildingStore])

  // Helper function to check if dog is active
  const isDogActive = (): boolean => {
    const dog = playerStore.dog
    return dog.active && dog.hunger > 0 && dog.mood > 0 && dog.injury < dog.injuryMax
  }

  // Event listeners for building updates
  useEffect(() => {
    const handlePlacedSuccess = () => {
      setUpdateTrigger(prev => prev + 1)
    }

    const handleDogStateChange = () => {
      setUpdateTrigger(prev => prev + 1)
    }

    const handleBombUsed = () => {
      setUpdateTrigger(prev => prev + 1)
    }

    emitter.on('placed_success', handlePlacedSuccess)
    emitter.on('dogStateChange', handleDogStateChange)
    emitter.on('bombUsed', handleBombUsed)

    return () => {
      emitter.off('placed_success', handlePlacedSuccess)
      emitter.off('dogStateChange', handleDogStateChange)
      emitter.off('bombUsed', handleBombUsed)
    }
  }, [])

  // Use updateTrigger to force re-renders
  void updateTrigger

  // Default building click handler
  const handleBuildingClick = (bid: number) => {
    // If external handler provided, use it
    if (onBuildingClick) {
      onBuildingClick(bid)
      return
    }

    // Default behavior
    const building = buildingStore.getBuilding(bid)

    switch (bid) {
      case 9:
        // Bed building - navigate to build panel to show sleep actions
        uiStore.openPanelAction('build', 9)
        break
      case 13:
        // Navigate to Storage panel
        uiStore.openPanelAction('storage')
        break
      case 14:
        // Navigate to Gate panel (only if level >= 0)
        if (building?.level !== undefined && building.level >= 0) {
          uiStore.openPanelAction('gate')
        }
        break
      case 15:
        // Navigate to Radio panel
        uiStore.openPanelAction('radio')
        break
      default:
        // Navigate to Build panel with building info
        uiStore.openPanelAction('build', bid)
        break
    }
  }

  // Background container style
  const bgContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: 'auto',
    marginTop: 'auto',
    zIndex: 1
  }

  return (
    <div className="absolute inset-0 flex flex-col" style={{ overflow: 'hidden' }}>
      <div style={bgContainerStyle} data-test-id="homepanel-bg">
        {/* Home background */}
        <Sprite
          atlas="new"
          frame="home_bg.png"
          className="w-full h-auto block"
        />

        {/* Building buttons - positioned relative to bg container */}
        {BUILDING_POSITIONS.map(({ bid, pos }) => {
          const building = buildingStore.getBuilding(bid)
          const buildLevel = building?.level ?? -1
          const displayLevel = Math.max(0, buildLevel)

          // Determine active state based on building type
          let isActive = false
          if (bid === 17) {
            isActive = (playerStore as any).isBombActive ?? false
          } else if (bid === 12) {
            isActive = isDogActive() && (building?.level !== undefined && building.level >= 0)
          } else {
            isActive = building ? building.level >= 0 : false
          }

          const isGate = bid === 14
          const showLight = isGate && building && building.level >= 0

          return (
            <div
              key={bid}
              data-test-id={`building-${bid}`}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                bottom: `${pos.y}px`,
                transform: 'translate(-50%, 50%)',
                pointerEvents: 'auto'
              }}
            >
              {/* Gate light effect - rendered before gate button so gate appears on top */}
              {showLight && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -55%) scale(2.35)',
                    animation: 'gateLightFade 4s infinite',
                    opacity: 1
                  }}
                >
                  <Sprite
                    atlas="home"
                    frame="gate_light.png"
                    className="block"
                    style={{
                      width: 'auto',
                      height: 'auto'
                    }}
                  />
                </div>
              )}
              <BuildingButton
                bid={bid}
                level={displayLevel}
                isActive={isActive}
                position={{ x: 0, y: 0 }}
                onClick={() => handleBuildingClick(bid)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

