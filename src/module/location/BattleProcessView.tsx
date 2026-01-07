/**
 * BattleProcessView Component
 * Battle in progress view
 */

import { Site } from '@/core/game/map/Site'
import { Room } from '@/common/types/site.types'
import { Battle } from '@/core/game/combat/Battle'
import { BOTTOM_BAR_LAYOUT } from '@/layout/layoutConstants'
import { BattleImageStack } from '@/common/ui/BattleImageStack'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { CommonListItemButton } from '@/common/ui/CommonListItemButton'
import { ESTIMATED_IMAGE_HEIGHT, CONTENT_AREA_OFFSET, DIG_DES_Y_OFFSET } from './constants'

interface BattleProcessViewProps {
  room: Room
  site: Site
  battle: Battle | null
  monsterCount: number
  combatLogs: Array<{ log: string; color?: string; bigger?: boolean }>
}

export function BattleProcessView({ room, site, battle, monsterCount, combatLogs }: BattleProcessViewProps) {
  const { leftEdge, rightEdge, content, screenWidth } = BOTTOM_BAR_LAYOUT
  const digDesY = content.top - DIG_DES_Y_OFFSET
  const imageBottom = digDesY + ESTIMATED_IMAGE_HEIGHT
  const contentAreaTop = imageBottom - CONTENT_AREA_OFFSET

  const isBandit = site.id === 500
  const monsterList = (room.list as string[]) || []
  const totalMonsters = monsterList.length
  const remainingMonsters = monsterCount
  const progressPercentage = totalMonsters > 0 ? ((totalMonsters - remainingMonsters) / totalMonsters) * 100 : 0

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
        <div style={{ width: '100%', height: '200px', fontSize: '20px', fontFamily: "'Noto Sans', sans-serif", marginBottom: '20px' }}>
          {combatLogs.map((log, index) => (
            <div
              key={index}
              style={{
                color: log.color || '#FFFFFF',
                fontSize: log.bigger ? '24px' : '20px',
                marginBottom: '4px',
              }}
            >
              {log.log}
            </div>
          ))}
        </div>

        <div style={{ width: '100%', marginTop: '40px', marginBottom: '10px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                  top: 0,
                  width: `${progressPercentage}%`,
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
            <div className="text-white" style={{ fontSize: '20px', textAlign: 'right', marginTop: '5px', width: '100%' }}>
              {isBandit ? 'Bandits' : 'Monsters'}: {remainingMonsters}/{totalMonsters}
            </div>
          </div>
        </div>

        <div style={{ width: '100%', marginTop: '15px', display: 'flex', justifyContent: 'center' }}>
          <CommonListItemButton
            text="Escape"
            onClick={() => {
              if (battle && battle.player) {
                battle.player.escape()
              }
            }}
            enabled={true}
          />
        </div>
      </div>
    </div>
  )
}

