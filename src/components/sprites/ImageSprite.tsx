/**
 * Simple Image Sprite Component
 * For displaying standalone PNG images (not from atlases)
 */

interface ImageSpriteProps {
  src: string
  alt?: string
  className?: string
  style?: React.CSSProperties
  width?: number
  height?: number
}

export function ImageSprite({ 
  src, 
  alt = '', 
  className = '', 
  style = {},
  width,
  height
}: ImageSpriteProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        imageRendering: 'pixelated',
        width,
        height,
        ...style
      }}
    />
  )
}


