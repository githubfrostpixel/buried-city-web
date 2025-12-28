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
  
  // Calculate percentage (reverse if needed)
  const percentage = reversePercentage ? 1 - (value / max) : value / max
  const percentageValue = Math.max(0, Math.min(1, percentage))
  
  // Check if in warning range
  const isWarning = warnRange ? warnRange.isInRange(percentageValue) : false
  
  // Water icons are in new_temp atlas, virus icons are in new atlas
  const iconAtlas = attr === 'water' ? 'new_temp' : (attr === 'virus' ? 'new' : 'icon')
  
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
      {/* Icon _0 and _1 should be at the same position (overlapping) */}
      {/* The icon itself IS the progress bar */}
      {/* Original game uses scale: 0.5 for attribute buttons, except HP which is full size */}
      <div className="relative" style={{ transform: attr === 'hp' ? 'none' : 'scale(0.5)', transformOrigin: 'center center' }}>
        {/* Background icon (_1) - always visible */}
        <Sprite
          atlas={iconAtlas}
          frame={`icon_${attr}_1.png`}
          className="block"
        />
        {/* Foreground icon (_0) - clipped from top, reveals from bottom to top */}
        {/* Smaller value = bigger _0 (less clipping) */}
        <div
          className="absolute inset-0"
          style={{
            overflow: 'hidden',
            clipPath: `inset(${percentageValue * 100}% 0 0 0)`
          }}
        >
          <Sprite
            atlas={iconAtlas}
            frame={`icon_${attr}_0.png`}
            className="block"
            style={{
              filter: isWarning ? 'brightness(1.5) saturate(1.5)' : undefined
            }}
          />
        </div>
      </div>
    </button>
  )
}

