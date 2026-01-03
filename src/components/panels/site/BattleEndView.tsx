/**
 * BattleEndView Component
 * Battle results view
 */

import { Site } from '@/game/world/Site'
import { Room } from '@/types/site.types'
import { BattleResult } from '@/game/combat/Battle'
import { BattleConfig } from '@/game/combat/BattleConfig'
import { BOTTOM_BAR_LAYOUT } from '@/components/layout/layoutConstants'
import { BattleImageStack } from '@/components/common/BattleImageStack'
import { Sprite } from '@/components/sprites/Sprite'
import { CommonListItemButton } from '@/components/common/CommonListItemButton'
import { ESTIMATED_IMAGE_HEIGHT, CONTENT_AREA_OFFSET, DIG_DES_Y_OFFSET } from './constants'

interface BattleEndViewProps {
  result: BattleResult
  site: Site
  room: Room
  onNext: () => void
}

export function BattleEndView({ result, site, room, onNext }: BattleEndViewProps) {
  const { leftEdge, rightEdge, content, screenWidth } = BOTTOM_BAR_LAYOUT
  const digDesY = content.top - DIG_DES_Y_OFFSET
  const imageBottom = digDesY + ESTIMATED_IMAGE_HEIGHT
  const contentAreaTop = imageBottom - CONTENT_AREA_OFFSET

  const isBandit = site.id === 500

  const consumedItems: Array<{ itemId: string; num: number }> = []
  if (result.bulletNum > 0) {
    consumedItems.push({ itemId: BattleConfig.BULLET_ID, num: result.bulletNum })
  }
  if (result.homemadeNum > 0) {
    consumedItems.push({ itemId: BattleConfig.HOMEMADE_ID, num: result.homemadeNum })
  }
  if (result.tools > 0 && result.toolItemId) {
    consumedItems.push({ itemId: result.toolItemId, num: result.tools })
  }
  if (result.fuel > 0) {
    consumedItems.push({ itemId: "gas", num: result.fuel })
  }

  return (
    <div className="relative w-full h-full" style={{ overflow: 'visible' }}>
      <BattleImageStack 
        site={site} 
        room={room} 
        digDesY={digDesY} 
        screenWidth={screenWidth}
        showMonster={!result.win}
      />

      <div
        className="absolute"
        style={{
          left: `${leftEdge}px`,
          top: `${contentAreaTop}px`,
          width: `${rightEdge - leftEdge}px`,
        }}
      >
        <div className="text-white mb-4" style={{ fontSize: '20px' }}>
          {isBandit ? 'Bandit Battle Complete' : 'Battle Complete'}
        </div>

        {consumedItems.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <div className="text-white mb-2" style={{ fontSize: '20px' }}>Consumed Items:</div>
            <div className="flex gap-2 flex-wrap">
              {consumedItems.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Sprite
                    atlas="icon"
                    frame={`icon_item_${item.itemId}.png`}
                    style={{ width: '24px', height: '24px' }}
                  />
                  <span className="text-xs text-white">x{item.num}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-white mb-4" style={{ fontSize: '20px' }}>
          <div>HP Lost: {result.totalHarm}</div>
          {result.totalVirus > 0 && <div>Virus Gained: {result.totalVirus}</div>}
        </div>

        {result.brokenWeapon && result.brokenWeapon.length > 0 && (
          <div className="mb-4">
            <div className="text-white mb-2" style={{ fontSize: '20px' }}>Broken Weapons:</div>
            <div className="flex gap-2">
              {result.brokenWeapon.map((itemId, index) => (
                <Sprite
                  key={index}
                  atlas="icon"
                  frame={`icon_item_${itemId}.png`}
                  style={{ width: '32px', height: '32px' }}
                />
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CommonListItemButton text="Next" onClick={onNext} enabled={true} />
        </div>
      </div>
    </div>
  )
}

