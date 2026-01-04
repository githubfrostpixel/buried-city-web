/**
 * SecretRoomEntryView Component
 * Secret room entry/discovery view
 */

import { useEffect } from 'react'
import { Site } from '@/core/game/world/Site'
import { BOTTOM_BAR_LAYOUT } from '@/shared/constants/layoutConstants'
import { Sprite } from '@/shared/components/sprites/Sprite'
import { CommonListItemButton } from '@/shared/components/common/CommonListItemButton'
import { getString } from '@/shared/utils/i18n/stringUtil'
import { audioManager, SoundPaths } from '@/core/game/systems/AudioManager'

interface SecretRoomEntryViewProps {
  site: Site
  onLeave: () => void
  onEnter: () => void
}

export function SecretRoomEntryView({ site, onLeave, onEnter }: SecretRoomEntryViewProps) {
  const { leftEdge, rightEdge, content } = BOTTOM_BAR_LAYOUT
  const secretRoomType = site.secretRoomType || 0

  // Play popup sound when secret room entry view appears (discovery sound)
  useEffect(() => {
    audioManager.playEffect(SoundPaths.POPUP)
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* Background images */}
      <div className="absolute" style={{ left: '0%', top: `${content.top}px`, transform: 'translate(10%, -20%)' }}>
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
          {(() => {
            const titleArray = getString(3012)
            return Array.isArray(titleArray) ? titleArray[secretRoomType] || titleArray[0] : titleArray || `Secret Room ${secretRoomType}`
          })()}
        </div>
        <div className="text-white text-center mb-8" style={{ fontSize: '18px' }}>
          {(() => {
            const descArray = getString(3013)
            return Array.isArray(descArray) ? descArray[secretRoomType] || descArray[0] : descArray || `Description for secret room type ${secretRoomType}`
          })()}
        </div>

        <div className="flex justify-center gap-4">
          <CommonListItemButton text={getString(1193) || 'Leave'} onClick={onLeave} enabled={true} />
          <CommonListItemButton text={getString(1204) || 'Enter'} onClick={onEnter} enabled={true} />
        </div>
      </div>
    </div>
  )
}

