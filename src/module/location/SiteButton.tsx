/**
 * SiteButton Component
 * Reusable button component for SitePanelContent
 */

import { Sprite } from '@/common/ui/sprite/Sprite'

interface SiteButtonProps {
  text: string
  onClick?: () => void
  disabled?: boolean
  showNotification?: boolean // For new items indicator
  position: { x: number; y: number }
  testId?: string
  testLabel?: string
}

export function SiteButton({ 
  text, 
  onClick, 
  disabled = false,
  showNotification = false,
  position,
  testId,
  testLabel
}: SiteButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, 0)',
        width: '120px',
        height: '50px',
        background: 'transparent',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      data-test-id={testId}
      data-test-label={testLabel}
      data-test-position
    >
      <Sprite atlas="ui" frame="btn_common_white_normal.png" className="w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center text-black text-sm font-bold">
        {text}
      </div>
      {/* Notification icon if showNotification */}
      {showNotification && (
        <div
          className="absolute"
          style={{
            right: '5px',
            top: '5px',
            width: '20px',
            height: '20px',
          }}
        >
          <Sprite atlas="gate" frame="map_actor.png" className="w-full h-full" />
        </div>
      )}
    </button>
  )
}

