/**
 * Common List Item Button Component
 * White button with text for CommonListItem action buttons
 * Ported from OriginalGame/src/ui/uiUtil.js createCommonListItem() action1/action2
 * 
 * Uses btn_common_white_normal.png sprite with black text
 */

import { Sprite } from '@/components/sprites/Sprite'

interface CommonListItemButtonProps {
  text: string
  onClick?: () => void
  enabled?: boolean
  className?: string
  style?: React.CSSProperties
}

export function CommonListItemButton({
  text,
  onClick,
  enabled = true,
  className = '',
  style = {}
}: CommonListItemButtonProps) {
  return (
    <button
      className={`absolute ${className}`}
      style={{
        cursor: enabled && onClick ? 'pointer' : 'not-allowed',
        background: 'transparent',
        border: 'none',
        padding: 0,
        opacity: enabled ? 1 : 0.5,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '80px',  // Minimum button width
        height: 'auto',
        position: 'relative',
        ...style
      }}
      onClick={enabled ? onClick : undefined}
      disabled={!enabled}
    >
      {/* Button sprite background - stretches horizontally to fit text */}
      <Sprite
        atlas="ui"
        frame="btn_common_white_normal.png"
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'fill'  // Stretch to fit button size (scale9 behavior)
        }}
      />
      
      {/* Button text - centered on sprite, black text */}
      <span
        className="relative z-10"
        style={{
          fontSize: '20px',  // COMMON_2 - 4 = 24 - 4 = 20px (from uiUtil.createSpriteBtn)
          fontFamily: "'Noto Sans', sans-serif",
          fontWeight: 'normal',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          padding: '8px 16px',  // Vertical and horizontal padding for text
          lineHeight: '1.2',
          display: 'block',
          color: enabled ? '#000000' : '#808080'  // BLACK for normal, GRAY for disabled
        }}
      >
        {text}
      </span>
    </button>
  )
}

