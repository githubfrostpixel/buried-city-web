/**
 * WorkProcessView Component
 * Work progress view with progress bar
 */

import { SpriteProgressBar } from '@/common/ui/SpriteProgressBar'
import { PROGRESS_BAR_Y } from './constants'

interface WorkProcessViewProps {
  progress: number
}

export function WorkProcessView({ progress }: WorkProcessViewProps) {
  return (
    <div className="relative w-full h-full" style={{ opacity: 1 }}>
      {/* Progress bar - anchor (0.5, 0) = bottom-center, position (bgWidth/2, 60) */}
      {/* Note: Only progress bar is shown, doesn't block other elements */}
      <SpriteProgressBar 
        progress={progress} 
        position="bottom" 
        offsetY={PROGRESS_BAR_Y}
      />
    </div>
  )
}

