/**
 * SiteEndView Component
 * Site completion view
 */

import { Site } from '@/core/game/world/Site'
import { BOTTOM_BAR_LAYOUT } from '@/shared/constants/layoutConstants'
import { CommonListItemButton } from '@/shared/components/common/CommonListItemButton'

interface SiteEndViewProps {
  site: Site
  onBack?: () => void
}

export function SiteEndView({ site, onBack }: SiteEndViewProps) {
  const { leftEdge, rightEdge, content } = BOTTOM_BAR_LAYOUT

  return (
    <div className="relative w-full h-full">
      <div
        className="absolute text-white text-center"
        style={{
          left: `${leftEdge}px`,
          top: `${content.top + 200}px`,
          width: `${rightEdge - leftEdge}px`,
          fontSize: '24px',
        }}
      >
        <div className="mb-8">Site Completed!</div>
        <div className="mb-8" style={{ fontSize: '18px' }}>
          {site.getName()} has been fully explored.
        </div>
        {onBack && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CommonListItemButton text="Back" onClick={onBack} enabled={true} />
          </div>
        )}
      </div>
    </div>
  )
}

