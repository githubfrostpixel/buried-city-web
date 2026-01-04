/**
 * WorkBeginView Component
 * Work tool selection view
 */

import { useMemo } from 'react'
import { Site } from '@/core/game/world/Site'
import { Room } from '@/shared/types/site.types'
import { Equipment } from '@/core/game/combat/BattleConfig'
import { usePlayerStore } from '@/core/store/playerStore'
import { BOTTOM_BAR_LAYOUT } from '@/shared/constants/layoutConstants'
import { Sprite } from '@/shared/components/sprites/Sprite'
import { itemConfig } from '@/core/data/items'
import { getString } from '@/shared/utils/i18n/stringUtil'
import { CONTAINER_HEIGHT, TOOL_BUTTON_Y, BUTTON_WIDTH, WORK_IMAGE_WIDTH } from './constants'

interface WorkBeginViewProps {
  room: Room
  site: Site
  onToolSelect: (toolId: string, time: number) => void
}

export function WorkBeginView({ room, site, onToolSelect }: WorkBeginViewProps) {
  const playerStore = usePlayerStore.getState()
  const { leftEdge, rightEdge } = BOTTOM_BAR_LAYOUT

  const workType = room.workType || 0
  const isSpecial = site.id === 666 && site.step === site.rooms.length - 1

  // Constants from original game
  const containerWidth = rightEdge - leftEdge  // rightEdge - leftEdge

  // Tool container: anchor (0.5, 0), position (bgWidth/2, 0)
  // CSS: bottom: 0, left: 50%, transform: translateX(-50%)
  const containerBottom = 0

  // Get available tools
  const availableTools = useMemo(() => {
    const tools: Array<{ itemId: string; time: number }> = []
    
    // Hand is always first
    tools.push({ itemId: Equipment.HAND, time: 45 })

    // Get tools from bag (type 1302 with effect_tool)
    Object.entries(playerStore.bag).forEach(([itemId, count]) => {
      if (count > 0) {
        const config = itemConfig[itemId]
        // Check if item type is 1302 (tools) - type is first 2 digits of item ID
        const itemType = itemId.substring(0, 2)
        if (itemType === '13' && config?.effect_tool) {
          const workingTime = config.effect_tool.workingTime || 45
          const vigourEffect = playerStore.vigour < 30 ? 2 : 1 // vigourEffect: 2 if low, 1 otherwise
          const time = workingTime * vigourEffect
          tools.push({ itemId, time })
        }
      }
    })

    return tools
  }, [playerStore.bag, playerStore.vigour])

  // Calculate button padding (from original game)
  const buttonCount = availableTools.length
  const padding = buttonCount > 0 ? (containerWidth - buttonCount * BUTTON_WIDTH) / (buttonCount * 2) : 0

  // Get description text from string system
  const descriptionText = useMemo(() => {
    if (isSpecial) {
      return getString(8102) || ''
    }
    const descriptions = getString(3008)
    if (Array.isArray(descriptions) && descriptions[workType]) {
      return descriptions[workType]
    }
    return ''
  }, [isSpecial, workType])

  return (
    <div className="relative w-full h-full">
      {/* Work image - anchor (0.5, 1) = top-center */}
      <div 
        className="absolute" 
        style={{ 
          left: '0%', 
          top: `${20}px`, 
          transform: 'translate(10%)' 
        }}
      >
        <Sprite
          atlas="site"
          frame={isSpecial ? "work_dig_3.png" : `work_dig_${workType}.png`}
          style={{ width: `${WORK_IMAGE_WIDTH}px`, height: 'auto' }}
        />
      </div>

      {/* Description - centered, below work image */}
      <div
        className="absolute text-white text-center"
        style={{
          left: '50%',
          top: `${270}px`,
          transform: 'translateX(-50%)',
          width: `${containerWidth}px`,
          fontSize: '18px',
        }}
      >
        {descriptionText}
      </div>

      {/* Tool selection container - at bottom of bg, 600px height */}
      <div
        className="absolute"
        style={{
          left: '50%',
          bottom: `${containerBottom}px`,
          transform: 'translateX(-50%)',
          width: `${containerWidth}px`,
          height: `${CONTAINER_HEIGHT}px`,
        }}
      >
        {/* Tool buttons - positioned at Y=120 from container bottom */}
        {availableTools.map((tool, i) => {
          // Button X position: (padding * 2 + buttonWidth) * i + (padding + buttonWidth / 2)
          const buttonX = (padding * 2 + BUTTON_WIDTH) * i + (padding + BUTTON_WIDTH / 2)
          // Button Y position: 120 from bottom of container
          const buttonY = CONTAINER_HEIGHT - TOOL_BUTTON_Y

          return (
            <div key={tool.itemId} className="absolute" style={{ left: `${buttonX}px`, top: `${buttonY}px`, transform: 'translate(-50%, -50%)' }}>
              <button
                onClick={() => onToolSelect(tool.itemId, tool.time)}
                className="relative"
                style={{
                  width: `${BUTTON_WIDTH}px`,
                  height: `${BUTTON_WIDTH}px`,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Sprite atlas="ui" frame="btn_tool.png" className="w-full h-full" />
                {/* Icon - left-aligned, scale 0.5 (50% of original size) */}
                <div style={{ left: '-28px' }} className="absolute inset-0 flex items-center justify-start pl-2">
                  {tool.itemId === Equipment.HAND ? (
                    <Sprite 
                      atlas="gate" 
                      frame="icon_tab_content_hand.png" 
                      style={{ width: 'auto', height: '50%' }} 
                    />
                  ) : (
                    <Sprite
                      atlas="icon"
                      frame={`icon_item_${tool.itemId}.png`}
                      style={{ width: 'auto', height: '50%' }}
                    />
                  )}
                </div>
              </button>
              {/* Label - below button, anchor (0.5, 1) = top-center */}
              <div
                className="absolute text-white text-center"
                style={{
                  left: '50%',
                  top: `${BUTTON_WIDTH / 2 + 30}px`,
                  transform: 'translateX(-80%)',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                }}
              >
                {Math.round(tool.time)}m
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

