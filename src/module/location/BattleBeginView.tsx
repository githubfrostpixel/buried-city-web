/**
 * BattleBeginView Component
 * Battle preparation view
 */

import { Site } from '@/core/game/map/Site'
import { Room } from '@/common/types/site.types'
import { BattleConfig, Equipment } from '@/core/game/combat/BattleConfig'
import { usePlayerStore } from '@/core/store/playerStore'
import { BOTTOM_BAR_LAYOUT } from '@/layout/layoutConstants'
import { BattleImageStack } from '@/common/ui/BattleImageStack'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { CommonListItemButton } from '@/common/ui/CommonListItemButton'
import { ESTIMATED_IMAGE_HEIGHT, CONTENT_AREA_OFFSET, DIG_DES_Y_OFFSET } from './constants'

interface BattleBeginViewProps {
  room: Room
  site: Site
  onStartBattle: () => void
}

export function BattleBeginView({ room, site, onStartBattle }: BattleBeginViewProps) {
  const playerStore = usePlayerStore.getState()
  const { leftEdge, rightEdge, content, screenWidth } = BOTTOM_BAR_LAYOUT
  const digDesY = content.top - DIG_DES_Y_OFFSET
  const imageBottom = digDesY + ESTIMATED_IMAGE_HEIGHT
  const contentAreaTop = imageBottom - CONTENT_AREA_OFFSET

  const isBandit = site.id === 500
  const difficulty = room.difficulty || 1
  const hasGun = !!playerStore.equipment.gun
  const hasWeapon = !!playerStore.equipment.weapon || playerStore.equipment.weapon === Equipment.HAND

  return (
    <div className="relative w-full h-full" style={{ overflow: 'visible' }}>
      <BattleImageStack 
        site={site} 
        room={room} 
        digDesY={digDesY} 
        screenWidth={screenWidth}
      />

      <div
        className="absolute"
        style={{
          left: `${leftEdge}px`,
          top: `${contentAreaTop}px`,
          width: `${rightEdge - leftEdge}px`,
        }}
      >
        <div className="text-white" style={{ fontSize: '20px', marginBottom: '10px' }}>
          Equipment:
        </div>

        <div className="flex gap-2" style={{ marginBottom: '25px' }}>
          {playerStore.equipment.gun && (
            <div style={{ position: 'relative' }}>
              <Sprite
                atlas="icon"
                frame={`icon_${playerStore.equipment.gun}.png`}
                style={{ width: '40px', height: '40px' }}
              />
              {playerStore.equipment.gun !== "item_weapon_gun_flamethrower" && (
                <div
                  className="text-white"
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '16px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {playerStore.getBagItemCount(BattleConfig.BULLET_ID) + playerStore.getBagItemCount(BattleConfig.HOMEMADE_ID)}
                </div>
              )}
            </div>
          )}
          {playerStore.equipment.weapon && (
            <Sprite
              atlas="icon"
              frame={`icon_${playerStore.equipment.weapon}.png`}
              style={{ width: '40px', height: '40px' }}
            />
          )}
          {playerStore.equipment.tool && (
            <div style={{ position: 'relative' }}>
              <Sprite
                atlas="icon"
                frame={`icon_${playerStore.equipment.tool}.png`}
                style={{ width: '40px', height: '40px' }}
              />
              {(playerStore.equipment.tool === "item_weapon_explosive_explosive" ||
                playerStore.equipment.tool === "item_weapon_explosive_rocket_launcher" ||
                playerStore.equipment.tool === "item_weapon_explosive_grenade") && (
                <div
                  className="text-white"
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '16px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {playerStore.getBagItemCount(playerStore.equipment.tool)}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="text-white"
          style={{
            fontSize: '20px',
            color: difficulty > 2 ? '#FF0000' : '#FFFFFF',
            marginBottom: '10px',
          }}
        >
          {isBandit ? `Difficulty: ${difficulty + 5}` : `Difficulty: ${difficulty}`}
        </div>

        <div className="text-red-500" style={{ fontSize: '20px', marginBottom: '20px' }}>
          {!hasGun && !hasWeapon && <div>No weapon equipped!</div>}
          {playerStore.vigour < 30 && <div>Low energy!</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CommonListItemButton text="Start Battle" onClick={onStartBattle} enabled={true} />
        </div>
      </div>
    </div>
  )
}

