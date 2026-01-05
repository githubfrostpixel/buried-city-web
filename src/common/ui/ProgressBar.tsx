/**
 * Progress Bar Component
 * Reusable progress bar for attributes and other progress displays
 * Uses sprite icons (icon_spirit_1) as background and foreground
 */

import { Sprite } from '@/common/ui/sprite/Sprite'

interface ProgressBarProps {
  value: number
  max: number
  color?: string
  attr?: string // Attribute name for sprite-based progress bars
  attrAtlas?: string // Atlas for attribute icons (default: 'icon')
  isWarning?: boolean
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
}

export function ProgressBar({
  value,
  max,
  color,
  attr,
  attrAtlas = 'icon',
  isWarning = false,
  width = 30,
  height = 4,
  className = '',
  style = {}
}: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100))
  
  // If attr is provided, use sprite-based progress bar
  if (attr) {
    // Use icon_{attr}_1 as background and foreground
    // Background: full sprite (empty/dimmed state)
    // Foreground: same sprite but clipped to show only bottom portion based on percentage
    const foregroundHeight = (percentage / 100) * height
    
    return (
      <div
        className={`relative ${className}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          overflow: 'hidden',
          ...style
        }}
      >
        {/* Background sprite (full, dimmed) */}
        <Sprite
          atlas={attrAtlas}
          frame={`icon_${attr}_1.png`}
          className="absolute inset-0 block"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            objectFit: 'cover',
            opacity: 0.3
          }}
        />
        
        {/* Foreground sprite (shows only bottom portion based on percentage) */}
        {/* If 50%, show only bottom half of the sprite */}
        {percentage > 0 && (
          <div
            className="absolute bottom-0 left-0"
            style={{
              width: `${width}px`,
              height: `${foregroundHeight}px`,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${width}px`,
                height: `${height}px`,
                position: 'absolute',
                bottom: 0,
                clipPath: `inset(${height - foregroundHeight}px 0 0 0)`
              }}
            >
              <Sprite
                atlas={attrAtlas}
                frame={`icon_${attr}_1.png`}
                className="block"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  objectFit: 'cover',
                  filter: isWarning ? 'brightness(1.5) saturate(1.5)' : undefined
                }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // Fallback to color-based progress bar
  const colorMap: Record<string, string> = {
    green: '#00ff00',
    red: '#ff0000',
    yellow: '#ffff00',
    blue: '#0000ff',
    orange: '#ff8800'
  }
  
  const barColor = color ? (colorMap[color] || color) : (isWarning ? '#ff0000' : '#00ff00')
  
  return (
    <div
      className={`relative ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        ...style
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: barColor,
          transition: 'width 0.2s ease'
        }}
      />
    </div>
  )
}

