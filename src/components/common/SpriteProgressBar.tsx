/**
 * SpriteProgressBar Component
 * Progress bar using sprites (pb_bg.png and pb.png)
 * Used in BattleProcessView and WorkProcessView
 */

import { Sprite } from '@/components/sprites/Sprite'
import { PROGRESS_BAR_Y } from '@/components/panels/site/constants'

interface SpriteProgressBarProps {
  progress: number // 0-100 percentage
  position?: 'bottom' | 'top' // Position relative to container
  offsetY?: number // Y offset from position (default: 60 for bottom)
  className?: string
  style?: React.CSSProperties
}

export function SpriteProgressBar({ 
  progress, 
  position = 'bottom',
  offsetY = PROGRESS_BAR_Y,
  className = '',
  style = {}
}: SpriteProgressBarProps) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        left: '50%',
        [position]: `${offsetY}px`,
        transform: 'translateX(-50%)',
        width: 'auto',
        height: 'auto',
        pointerEvents: 'none', // Don't block clicks on other elements
        ...style
      }}
    >
      <div style={{ position: 'relative' }}>
        <Sprite
          atlas="ui"
          frame="pb_bg.png"
          style={{ width: 'auto', height: 'auto', display: 'block' }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            [position === 'bottom' ? 'bottom' : 'top']: 0,
            width: `${progress}%`,
            height: '100%',
            overflow: 'hidden',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Sprite
            atlas="ui"
            frame="pb.png"
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
          />
        </div>
      </div>
    </div>
  )
}

