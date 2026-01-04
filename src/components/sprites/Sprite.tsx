/**
 * Sprite Component
 * Displays individual extracted sprite images
 * Sprites are pre-extracted from atlases and stored as individual PNG files
 */

import { useState } from 'react'
import { getSpritePath } from '@/utils/assets'

interface SpriteProps {
  atlas: string // e.g., 'ui', 'npc', 'icon'
  frame: string // e.g., 'button_normal.png', 'npc_1.png' (include .png extension)
  className?: string
  style?: React.CSSProperties
}

export function Sprite({ atlas, frame, className = '', style = {} }: SpriteProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Ensure frame has .png extension
  const frameName = frame.endsWith('.png') ? frame : `${frame}.png`
  const spritePath = getSpritePath(atlas, frameName)

  if (imageError) {
    return (
      <div className={`bg-red-700 ${className}`} style={style}>
        Missing: {frame}
      </div>
    )
  }

  return (
    <img
      src={spritePath}
      alt={frame}
      className={`inline-block ${className}`}
      onLoad={() => setImageLoaded(true)}
      onError={() => {
        console.warn(`Sprite not found: ${atlas}/${frameName}`)
        setImageError(true)
      }}
      style={{
        display: imageLoaded ? 'block' : 'none',
        imageRendering: 'auto',
        width: 'auto',
        height: 'auto',
        ...style
      }}
    />
  )
}

