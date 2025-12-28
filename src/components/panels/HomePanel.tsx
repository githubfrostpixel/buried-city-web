/**
 * HomePanel Component
 * Home screen showing all buildings
 * Ported from OriginalGame/src/ui/home.js
 * 
 * Gate Light Effect:
 * - Positioned at center of gate button (building 14)
 * - Transform: translate(-47%, -55%) scale(2.35)
 * - Animation: gateLightFade 4s infinite (fade in/out)
 * - These values were fine-tuned to match original game appearance
 */

import { useEffect, useState } from 'react'
import { useBuildingStore } from '@/store/buildingStore'
import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'
import { emitter } from '@/utils/emitter'
import { Sprite } from '@/components/sprites/Sprite'
import { BuildingButton } from '@/components/common/BuildingButton'

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


export function HomePanel() {
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
      // Force re-render
      setUpdateTrigger(prev => prev + 1)
    }

    const handleDogStateChange = () => {
      // Force re-render building 12
      setUpdateTrigger(prev => prev + 1)
    }

    const handleBombUsed = () => {
      // Force re-render building 17
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

  // Use updateTrigger to force re-renders (even though we don't directly use it, it triggers re-render)
  void updateTrigger

  // Building click handler
  const handleBuildingClick = (bid: number) => {
    const building = buildingStore.getBuilding(bid)

    switch (bid) {
      case 13:
        // Navigate to Storage panel
        uiStore.openPanelAction('storage')
        break
      case 14:
        // Navigate to Gate panel (only if level >= 0)
        if (building?.level !== undefined && building.level >= 0) {
          // TODO: Add 'gate' to Panel type if needed, for now use null or handle differently
          console.log('Navigate to Gate panel')
        }
        break
      case 15:
        // Navigate to Radio panel
        uiStore.openPanelAction('radio')
        break
      default:
        // Navigate to Build panel with building info
        uiStore.openPanelAction('build')
        // TODO: Pass building info to build panel
        break
    }
  }

  // Background container style - positioned at bottom of content area
  // In Cocos: (bgRect.width / 2, 0) with anchor (0.5, 0) = center horizontally, bottom edge
  const bgContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: 'auto',
    marginTop: 'auto', // Push to bottom of flex container
    zIndex: 1 // Below frame_bg_bottom
  }


  return (
    <div className="absolute inset-0 flex flex-col" style={{ overflow: 'hidden' }}>
      <div style={bgContainerStyle}>
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
            // Bomb/Minefield - check player.isBombActive
            // TODO: Add isBombActive to playerStore if not present
            isActive = (playerStore as any).isBombActive ?? false
          } else if (bid === 12) {
            // Dog house - check player.isDogActive() && build.level >= 0
            isActive = isDogActive() && (building?.level !== undefined && building.level >= 0)
          } else {
            // All other buildings
            isActive = building ? building.level >= 0 : false
          }

          // Position: x from left, y from bottom (Cocos coordinates)
          // Use bottom property for Y since positions are from bottom
          // BuildingButton will be positioned relative to this wrapper
          const isGate = bid === 14
          const showLight = isGate && building && building.level >= 0

          return (
            <div
              key={bid}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                bottom: `${pos.y}px`,
                transform: 'translate(-50%, 50%)', // Center horizontally, adjust for bottom anchor
                pointerEvents: 'auto'
              }}
            >
              <BuildingButton
                bid={bid}
                level={displayLevel}
                isActive={isActive}
                position={{ x: 0, y: 0 }} // Relative to wrapper
                onClick={() => handleBuildingClick(bid)}
              />
              {/* Gate light effect - positioned at center of gate button */}
              {showLight && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-47%, -55%) scale(2.35)',
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
            </div>
          )
        })}
      </div>
    </div>
  )
}

