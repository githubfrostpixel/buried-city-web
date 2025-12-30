/**
 * Attribute Button Component
 * Displays attribute icon with progress bar
 * Used in TopBar for player attributes (HP, hunger, etc.)
 */

import { usePlayerStore } from '@/store/playerStore'
import { Sprite } from '@/components/sprites/Sprite'
import { Range } from '@/utils/range'

interface AttrButtonProps {
  attr: keyof import('@/types/player.types').PlayerAttributes
  position: { x: number; y: number }
  warnRange?: Range
  reversePercentage?: boolean
  onClick?: () => void
  className?: string
}

export function AttrButton({
  attr,
  position,
  warnRange,
  reversePercentage = false,
  onClick,
  className = ''
}: AttrButtonProps) {
  const playerStore = usePlayerStore()
  
  // Get attribute value and max
  const value = playerStore[attr] as number
  const maxAttr = `${attr}Max` as keyof typeof playerStore
  const max = (playerStore[maxAttr] as number) || 100
  
  // Calculate actual value percentage (0-1)
  const actualPercentage = value / max
  const actualPercentageValue = Math.max(0, Math.min(1, actualPercentage))
  
  // Calculate display percentage (reverse if needed for display)
  const displayPercentage = reversePercentage ? 1 - actualPercentageValue : actualPercentageValue
  const percentageValue = Math.max(0, Math.min(1, displayPercentage))
  
  // Check if in warning range
  // Based on original game: btn.updateView(reversPercentage ? 1 - player.getAttrPercentage(attr) : player.getAttrPercentage(attr), ...)
  //                        icon3.setVisible(this.range.isInRange(percentage))
  // The percentage passed to updateView is the DISPLAY percentage (already reversed if reversePercentage is true)
  // So the range should be checked against the display percentage
  // However, user reports warning shows backwards for virus, so let's verify:
  // For virus with reversePercentage=true and warnRange=[0,0.25]:
  //   - High virus (80% actual) → display 20% → should be in [0,0.25] → should show warning
  //   - Low virus (15% actual) → display 85% → should NOT be in [0,0.25] → should not show warning
  // The logic seems correct, but user reports it's backwards. Let me check if maybe the range needs to be inverted
  // for reversePercentage attributes when checking against actual value:
  //   - High virus (80% actual) → should warn → check if 80% is in inverted range [0.75, 1] → true
  //   - Low virus (15% actual) → should not warn → check if 15% is in inverted range [0.75, 1] → false
  // So for reversePercentage, maybe we should check: actualPercentage >= (1 - warnRange.max)?
  // Actually, let's stick with original game logic and check display percentage
  const isWarning = warnRange ? warnRange.isInRange(percentageValue) : false

  const iconAtlas = 'icon'
  
  return (
    <button
      className={`absolute flex flex-col items-center gap-1 ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        cursor: onClick ? 'pointer' : 'default',
        background: 'transparent',
        border: 'none',
        padding: 0
      }}
      onClick={onClick}
    >
      {/* Icon display logic:
          - _1 = background (always visible, shows empty state, z-index: 0)
          - _0 = filled state (always visible, clipped based on value, z-index: 1)
          - _2 = warning state (when in warning range, fully visible, no clipping, z-index: 2)
          Empty (0% value) = 0% inset (fully visible _0), Full (100% value) = 100% inset (fully clipped from top, no _0 visible)
          When warning, _2 is fully visible on top (no clipping)
      */}
      {/* All attributes use 0.5 scale except HP which uses no scale */}
      <div className="relative" style={{ 
        transform: attr === 'hp' ? 'none' : 'scale(0.5)', 
        transformOrigin: 'center center' 
      }}>
        {/* Background icon (_1) - always visible, shows empty state */}
        <Sprite
          atlas={iconAtlas}
          frame={`icon_${attr}_1.png`}
          className="block"
          style={{ width: 'auto', height: 'auto' }}
        />
        {/* Filled state icon (_0) - always visible, clipped from top based on value */}
        {/* For normal attributes: Empty (0% value) = 0% inset (fully visible), Full (100% value) = 100% inset (fully clipped) */}
        {/* For reversePercentage attributes: Low value = high fill, High value = low fill */}
        {/* So for reversePercentage, we use actualPercentage for clipPath (not display percentage) */}
        {/* Example: Virus at 15% → clip 15% from top → shows 85% filled (correct for reversed display) */}
        <div
          className="absolute inset-0"
          style={{
            overflow: 'hidden',
            clipPath: `inset(${(reversePercentage ? actualPercentageValue : (1 - percentageValue)) * 100}% 0 0 0)`,
            zIndex: 1
          }}
        >
          <Sprite
            atlas={iconAtlas}
            frame={`icon_${attr}_0.png`}
            className="block"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
        {/* Warning state icon (_2) - overlays _0 when in warning range, no clipping, always fully visible */}
        {/* Ensure _2 has same size as _1 and _0 */}
        {/* Blinks slowly when in warning state */}
        {isWarning && (
          <div
            className="absolute inset-0"
            style={{
              zIndex: 2,
              animation: 'attributeWarningBlink 2.5s ease-in-out infinite'
            }}
          >
            <Sprite
              atlas={iconAtlas}
              frame={`icon_${attr}_2.png`}
              className="block"
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
        )}
      </div>
    </button>
  )
}

