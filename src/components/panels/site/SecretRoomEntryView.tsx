/**
 * SecretRoomEntryView Component
 * Secret room entry/discovery view
 */

import { Site } from '@/game/world/Site'
import { BOTTOM_BAR_LAYOUT } from '@/components/layout/layoutConstants'
import { Sprite } from '@/components/sprites/Sprite'
import { CommonListItemButton } from '@/components/common/CommonListItemButton'

interface SecretRoomEntryViewProps {
  site: Site
  onLeave: () => void
  onEnter: () => void
}

export function SecretRoomEntryView({ site, onLeave, onEnter }: SecretRoomEntryViewProps) {
  const { leftEdge, rightEdge, content } = BOTTOM_BAR_LAYOUT
  const secretRoomType = site.secretRoomType || 0

  return (
    <div className="relative w-full h-full">
      {/* Background images */}
      <div className="absolute" style={{ left: '50%', top: `${content.top}px`, transform: 'translate(-50%, -50%)' }}>
        <Sprite atlas="site" frame="site_dig_secret.png" style={{ width: '500px', height: 'auto' }} />
        <Sprite
          atlas="dig_monster"
          frame="monster_dig_mid_bg.png"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: 'auto'
          }}
        />
      </div>

      {/* Content */}
      <div className="absolute" style={{ left: `${leftEdge}px`, top: `${content.top + 200}px`, width: `${rightEdge - leftEdge}px` }}>
        <div className="text-white text-center mb-4" style={{ fontSize: '24px' }}>
          Secret Room {secretRoomType}
        </div>
        <div className="text-white text-center mb-8" style={{ fontSize: '18px' }}>
          Description for secret room type {secretRoomType}
        </div>

        <div className="flex justify-center gap-4">
          <CommonListItemButton text="Leave" onClick={onLeave} enabled={true} />
          <CommonListItemButton text="Enter" onClick={onEnter} enabled={true} />
        </div>
      </div>
    </div>
  )
}

