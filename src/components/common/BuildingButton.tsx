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
  const hasWarning = warnState.upgrade || warnState.make || warnState.take
  
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
        filter: isActive ? 'none' : 'brightness(0.3)',
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
          maxHeight: 'none'
        }}
      />
      {/* Warning icon if needed */}
      {hasWarning && (
        <div className="absolute top-0 right-0" style={{ transform: 'translate(50%, -50%)' }}>
          <Sprite
            atlas="ui"
            frame="icon_warn.png"
            className="w-4 h-4 block"
          />
        </div>
      )}
    </button>
  )
}

