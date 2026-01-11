/**
 * SpriteSlider Component
 * Custom slider using sprites matching original game's cc.ControlSlider
 * Uses: slider_bg.png (background), slider_content.png (fill), slider_cap.png (thumb)
 * Ported from OriginalGame/src/ui/uiUtil.js cc.ControlSlider usage
 */

import { useRef, useState, useEffect, useCallback } from 'react'
import { Sprite } from '@/common/ui/sprite/Sprite'

interface SpriteSliderProps {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  width?: number
  className?: string
  style?: React.CSSProperties
}

export function SpriteSlider({
  min,
  max,
  value,
  onChange,
  width = 360,
  className = '',
  style = {}
}: SpriteSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  
  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])
  
  // Calculate percentage (0-1) from value
  const getPercentage = useCallback((val: number): number => {
    if (max === min) return 0
    return Math.max(0, Math.min(1, (val - min) / (max - min)))
  }, [min, max])
  
  // Calculate value from percentage (0-1)
  const getValueFromPercentage = useCallback((percent: number): number => {
    const rawValue = min + (max - min) * percent
    return Math.round(Math.max(min, Math.min(max, rawValue)))
  }, [min, max])
  
  // Get position from clientX
  const getValueFromPosition = useCallback((clientX: number): number => {
    if (!sliderRef.current) return localValue
    
    const rect = sliderRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return getValueFromPercentage(percent)
  }, [getValueFromPercentage, localValue])
  
  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const newValue = getValueFromPosition(e.clientX)
    setLocalValue(newValue)
    onChange(newValue)
  }, [getValueFromPosition, onChange])
  
  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const touch = e.touches[0]
    if (touch) {
      const newValue = getValueFromPosition(touch.clientX)
      setLocalValue(newValue)
      onChange(newValue)
    }
  }, [getValueFromPosition, onChange])
  
  // Handle mouse move (when dragging)
  useEffect(() => {
    if (!isDragging) return
    
    const handleMouseMove = (e: MouseEvent) => {
      const newValue = getValueFromPosition(e.clientX)
      setLocalValue(newValue)
      onChange(newValue)
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      if (touch) {
        const newValue = getValueFromPosition(touch.clientX)
        setLocalValue(newValue)
        onChange(newValue)
      }
    }
    
    const handleTouchEnd = () => {
      setIsDragging(false)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, getValueFromPosition, onChange])
  
  const percentage = getPercentage(localValue)
  const thumbPosition = percentage * 100 // Percentage for thumb position
  
  return (
    <div
      ref={sliderRef}
      className={`relative ${className}`}
      style={{
        width: `${width}px`,
        height: '20px',
        cursor: 'pointer',
        ...style
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      data-test-id="sprite-slider"
    >
      {/* Background track */}
      <div
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      >
        <Sprite
          atlas="ui"
          frame="slider_bg.png"
          className="w-full h-full"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            display: 'block'
          }}
        />
      </div>
      
      {/* Fill/progress bar (slider_content) */}
      <div
        className="absolute"
        style={{
          left: '0',
          top: '0',
          width: `${percentage * 100}%`,
          height: '100%',
          overflow: 'hidden',
          zIndex: 2
        }}
      >
        <Sprite
          atlas="ui"
          frame="slider_content.png"
          style={{
            width: `${width}px`,
            height: '100%',
            objectFit: 'fill',
            display: 'block'
          }}
        />
      </div>
      
      {/* Thumb/cap */}
      <div
        className="absolute"
        style={{
          left: `${thumbPosition}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '30px',
          height: '30px',
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 3,
          pointerEvents: 'auto'
        }}
      >
        <Sprite
          atlas="ui"
          frame="slider_cap.png"
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
        />
      </div>
    </div>
  )
}
