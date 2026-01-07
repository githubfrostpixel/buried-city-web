/**
 * BattleImageStack Component
 * Reusable battle image stack component
 * Used in BattleBeginView, BattleProcessView, BattleEndView, and BattlePanelContent
 */

import { Sprite } from '@/common/ui/sprite/Sprite'
import { Site } from '@/core/game/map/Site'
import { Room } from '@/common/types/site.types'

interface BattleImageStackProps {
  site: Site
  room: Room
  digDesY: number
  screenWidth: number
  showMonster?: boolean // For BattleEndView (only show if !result.win)
}

export function BattleImageStack({ 
  site, 
  room, 
  digDesY, 
  screenWidth,
  showMonster = true 
}: BattleImageStackProps) {
  const isBandit = site.id === 500
  const difficulty = room.difficulty || 1

  return (
    <div
      className="absolute"
      style={{
        left: `${screenWidth / 2 - 20}px`,
        top: `${digDesY}px`,
        transform: 'translateX(-50%)',
        width: 'max-content',
      }}
    >
      {/* Bottom layer: npc_dig_bg */}
      <Sprite
        atlas="npc"
        frame="npc_dig_bg.png"
        style={{ width: '500px', height: 'auto', position: 'relative', zIndex: 1 }}
      />
      {/* Middle layer: monster_dig_mid_bg - hidden if showMonster is false */}
      {showMonster && (
        <Sprite
          atlas="dig_monster"
          frame="monster_dig_mid_bg.png"
          style={{
            width: '500px',
            height: 'auto',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2
          }}
        />
      )}
      {/* Top layer: monster_dig or bandit_dig - hidden if showMonster is false */}
      {showMonster && (
        <Sprite
          atlas="dig_monster"
          frame={isBandit ? `bandit_dig_${difficulty}.png` : `monster_dig_${difficulty}.png`}
          style={{
            width: '500px',
            height: 'auto',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 3
          }}
        />
      )}
    </div>
  )
}

