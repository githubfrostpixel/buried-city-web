/**
 * Building Button Component
 * Button for building on home panel
 * Displays building sprite with active/inactive state and warning icons
 */

import { useBuildingStore } from '@/store/buildingStore'
import { Sprite } from '@/components/sprites/Sprite'

interface BuildingButtonProps {
  bid: number
  level: number
  isActive: boolean
  position: { x: number; y: number }
  onClick?: () => void
  className?: string
}

export function BuildingButton({
  bid,
  level,
  isActive,
  position,
  onClick,
  className = ''
}: BuildingButtonProps) {
  const buildingStore = useBuildingStore()
  const building = buildingStore.getBuilding(bid)
  
  // Get warning state from building (Phase 2C complete)
  const warnState = building?.needWarn() || { upgrade: false, make: false, take: false }
  
  // Build list of active warnings (matching original createBuildWarn logic)
  const activeWarnings: Array<'upgrade' | 'make' | 'take'> = []
  if (warnState.upgrade) activeWarnings.push('upgrade')
  if (warnState.make) activeWarnings.push('make')
  if (warnState.take) activeWarnings.push('take')
  
  // If position is (0, 0), assume it's being positioned by parent wrapper
  const isPositionedByParent = position.x === 0 && position.y === 0
  
  return (
    <button
      className={`${isPositionedByParent ? 'relative' : 'absolute'} ${className}`}
      style={{
        ...(isPositionedByParent ? {} : {
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)'
        }),
        cursor: onClick ? 'pointer' : 'default',
        background: 'transparent',
        border: 'none',
        padding: 0
      }}
      onClick={onClick}
    >
      <Sprite
        atlas="home"
        frame={`icon_start_build_${bid}_${level}.png`}
        className="block"
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: 'none',
          maxHeight: 'none',
          filter: isActive ? 'none' : 'brightness(0.3)'
        }}
      />
      {/* Warning icons - positioned in top-right corner, exempt from grey filter */}
      {activeWarnings.length > 0 && (
        <div 
          className="absolute"
          style={{
            top: '0',
            right: '0',
            transform: 'translate(50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            height: '38px',
            zIndex: 11
          }}
        >
          {activeWarnings.map((warningType) => (
            <Sprite
              key={warningType}
              atlas="icon"
              frame={`icon_${warningType}.png`}
              className="block"
              style={{
                width: '38px',
                height: 'auto',
                maxWidth: 'none',
                maxHeight: 'none'
              }}
            />
          ))}
        </div>
      )}
    </button>
  )
}

