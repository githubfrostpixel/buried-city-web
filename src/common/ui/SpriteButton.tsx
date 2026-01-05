/**
 * Sprite Button Component
 * Button with sprite images for normal and disabled states
 * Used in BottomBar for navigation buttons
 */

import { Sprite } from '@/common/ui/sprite/Sprite'
import { cocosToCssY } from '@/common/utils/position'

interface SpriteButtonProps {
  normal: string
  disabled?: string
  size: { width: number; height: number }
  position: { x: number; y: number }
  enabled?: boolean
  onClick?: () => void
  className?: string
}

export function SpriteButton({
  normal,
  disabled,
  size,
  position,
  enabled = true,
  onClick,
  className = ''
}: SpriteButtonProps) {
  const spriteFrame = enabled ? normal : (disabled || normal)
  
  // If position.y is very large (like bgHeight), treat it as "at bottom"
  // Otherwise use it as top position
  const useBottom = position.y >= 700 // If y >= 700, assume it's meant to be at bottom
  
  return (
    <button
      className={`absolute ${className}`}
      style={{
        left: `${position.x}px`,
        ...(useBottom 
          ? { bottom: '0px', transform: 'translate(-50%, 0)' } // At bottom, anchor at bottom-center
          : { top: `${position.y}px`, transform: 'translate(-50%, -50%)' } // Centered at position
        ),
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: enabled && onClick ? 'pointer' : 'not-allowed',
        background: 'transparent',
        border: 'none',
        padding: 0,
        opacity: enabled ? 1 : 0.5
      }}
      onClick={enabled ? onClick : undefined}
      disabled={!enabled}
    >
      <Sprite
        atlas="ui"
        frame={spriteFrame}
        className="w-full h-full block"
      />
    </button>
  )
}

