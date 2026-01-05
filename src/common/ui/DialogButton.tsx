/**
 * Dialog Button Component
 * Sprite-based button for dialogs matching original game appearance
 * Ported from OriginalGame/src/ui/uiUtil.js createCommonBtnBlack()
 * 
 * Uses btn_common_black_normal.png sprite with white text
 */

import { Sprite } from '@/common/ui/sprite/Sprite'

interface DialogButtonProps {
  text: string
  position: { x: number; y: number }  // Position as percentage (0-100) within parent
  onClick?: () => void
  enabled?: boolean
  className?: string
}

export function DialogButton({
  text,
  position,
  onClick,
  enabled = true,
  className = ''
}: DialogButtonProps) {
  return (
    <button
      className={`absolute ${className}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',  // Center anchor
        cursor: enabled && onClick ? 'pointer' : 'not-allowed',
        background: 'transparent',
        border: 'none',
        padding: 0,
        opacity: enabled ? 1 : 0.5,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '100px',  // Minimum button width
        height: 'auto',
        position: 'relative'
      }}
      onClick={enabled ? onClick : undefined}
      disabled={!enabled}
      data-test-id={`dialog-button-${text.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Button sprite background - stretches horizontally to fit text */}
      <Sprite
        atlas="ui"
        frame="btn_common_black_normal.png"
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'fill'  // Stretch to fit button size (scale9 behavior)
        }}
      />
      
      {/* Button text - centered on sprite */}
      <span
        className="relative z-10 text-white"
        style={{
          fontSize: '20px',  // COMMON_2 - 4 = 24 - 4 = 20px
          fontFamily: "'Noto Sans', sans-serif",
          fontWeight: 'normal',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          padding: '8px 16px',  // Vertical and horizontal padding for text
          lineHeight: '1.2',
          display: 'block'
        }}
      >
        {text}
      </span>
    </button>
  )
}

