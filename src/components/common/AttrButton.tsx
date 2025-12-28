/**
 * Attribute Button Component
 * Displays attribute icon with progress bar
 * Used in TopBar for player attributes (HP, hunger, etc.)
 */

import { usePlayerStore } from '@/store/playerStore'
import { Sprite } from '@/components/sprites/Sprite'
import { Range } from '@/utils/range'

interface AttrButtonProps {
  attr: keyof import('@/types/player.types').PlayerAttributes
  position: { x: number; y: number }
  warnRange?: Range
  reversePercentage?: boolean
  onClick?: () => void
  className?: string
}

export function AttrButton({
  attr,
  position,
  warnRange,
  reversePercentage = false,
  onClick,
  className = ''
}: AttrButtonProps) {
  const playerStore = usePlayerStore()
  
  // Get attribute value and max
  const value = playerStore[attr] as number
  const maxAttr = `${attr}Max` as keyof typeof playerStore
  const max = (playerStore[maxAttr] as number) || 100
  
  // Calculate percentage (reverse if needed for display)
  const percentage = reversePercentage ? 1 - (value / max) : value / max
  const percentageValue = Math.max(0, Math.min(1, percentage))
  
  // Check if in warning range
  // Warning check uses the same percentageValue (already reversed if reversePercentage is true)
  // This matches original game logic: warning range is checked against the display percentage
  const isWarning = warnRange ? warnRange.isInRange(percentageValue) : false

  const iconAtlas = 'icon'
  
  return (
    <button
      className={`absolute flex flex-col items-center gap-1 ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        cursor: onClick ? 'pointer' : 'default',
        background: 'transparent',
        border: 'none',
        padding: 0
      }}
      onClick={onClick}
    >
      {/* Icon display logic:
          - _1 = background (always visible, shows empty state, z-index: 0)
          - _0 = filled state (always visible, clipped based on value, z-index: 1)
          - _2 = warning state (when in warning range, fully visible, no clipping, z-index: 2)
          Empty (0% value) = 0% inset (fully visible _0), Full (100% value) = 100% inset (fully clipped from top, no _0 visible)
          When warning, _2 is fully visible on top (no clipping)
      */}
      {/* All attributes use 0.5 scale except HP which uses no scale */}
      <div className="relative" style={{ 
        transform: attr === 'hp' ? 'none' : 'scale(0.5)', 
        transformOrigin: 'center center' 
      }}>
        {/* Background icon (_1) - always visible, shows empty state */}
        <Sprite
          atlas={iconAtlas}
          frame={`icon_${attr}_1.png`}
          className="block"
          style={{ width: 'auto', height: 'auto' }}
        />
        {/* Filled state icon (_0) - always visible, clipped from top based on value */}
        {/* Empty (0% value) = 0% inset (fully visible), Full (100% value) = 100% inset (fully clipped from top) */}
        {/* So we use (1 - percentageValue) to reverse: empty shows all, full shows none */}
        <div
          className="absolute inset-0"
          style={{
            overflow: 'hidden',
            clipPath: `inset(${(1 - percentageValue) * 100}% 0 0 0)`,
            zIndex: 1
          }}
        >
          <Sprite
            atlas={iconAtlas}
            frame={`icon_${attr}_0.png`}
            className="block"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
        {/* Warning state icon (_2) - overlays _0 when in warning range, no clipping, always fully visible */}
        {/* Ensure _2 has same size as _1 and _0 */}
        {isWarning && (
          <div
            className="absolute inset-0"
            style={{
              zIndex: 2
            }}
          >
            <Sprite
              atlas={iconAtlas}
              frame={`icon_${attr}_2.png`}
              className="block"
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
        )}
      </div>
    </button>
  )
}

