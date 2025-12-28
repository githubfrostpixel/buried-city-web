/**
 * Status Button Component
 * Button with icon and optional label for status display
 * Used in TopBar for day, season, time, weather, etc.
 */

import { Sprite } from '@/components/sprites/Sprite'
import { applyScale } from '@/utils/scaling'

interface StatusButtonProps {
  icon: string
  iconAtlas?: string
  label?: string
  position: { x: number; y: number }
  scale?: number
  noLabel?: boolean
  onClick?: () => void
  className?: string
}

export function StatusButton({
  icon,
  iconAtlas = 'icon',
  label,
  position,
  scale = 1.0,
  noLabel = false,
  onClick,
  className = ''
}: StatusButtonProps) {
  return (
    <button
      className={`absolute flex items-center justify-center ${className}`}
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
      <div 
        className="flex items-center"
         style={{ 
          transform: applyScale(scale), 
          gap: scale <= 0.4 ? '6px' : scale < 0.5 ? '4px' : '2px' // More gap for smaller scales
        }}
      >
        <Sprite
          atlas={iconAtlas}
          frame={icon}
          className="block"
        />
        {!noLabel && label !== undefined && (
          <span 
            className="text-white text-sm whitespace-nowrap pointer-events-none"
            style={{ 
              transform: `scale(${1 / scale})` // Inverse scale to keep text normal size
            }}
          >
            {label}
          </span>
        )}
      </div>
    </button>
  )
}

