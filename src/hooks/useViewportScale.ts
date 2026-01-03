/**
 * Viewport Scale Hook
 * Calculate scale factor to fit game container in viewport
 * Similar to Cocos2d resolution policy
 */

import { useState, useEffect } from 'react'

interface ViewportScaleResult {
  scale: number
  viewportWidth: number
  viewportHeight: number
}

export type ScalingPolicy = 'fit-height' | 'fit-width' | 'fit-both'

/**
 * Calculate scale factor to fit game container in viewport
 * @param gameWidth - Game design width (default: 640)
 * @param gameHeight - Game design height (default: 1136)
 * @param policy - Scaling policy: 'fit-height' | 'fit-width' | 'fit-both'
 * @param minScale - Minimum scale factor (default: 0.3)
 * @param maxScale - Maximum scale factor (default: 1.0)
 * @returns Scale factor and viewport dimensions
 */
export function useViewportScale(
  gameWidth: number = 640,
  gameHeight: number = 1136,
  policy: ScalingPolicy = 'fit-height',
  minScale: number = 0.3,
  maxScale: number = 1.0
): ViewportScaleResult {
  const [scale, setScale] = useState(1)
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight)

  useEffect(() => {
    const calculateScale = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      
      setViewportWidth(vw)
      setViewportHeight(vh)
      
      let newScale = 1
      
      switch (policy) {
        case 'fit-height':
          // Scale to fit viewport height (like Cocos2d FIXED_HEIGHT)
          newScale = vh / gameHeight
          break
        case 'fit-width':
          // Scale to fit viewport width
          newScale = vw / gameWidth
          break
        case 'fit-both':
          // Scale to fit both dimensions (use smaller scale to avoid overflow)
          newScale = Math.min(vw / gameWidth, vh / gameHeight)
          break
      }
      
      // Clamp scale between min and max
      newScale = Math.max(minScale, Math.min(newScale, maxScale))
      
      setScale(newScale)
    }
    
    // Calculate initial scale
    calculateScale()
    
    // Listen for resize events
    window.addEventListener('resize', calculateScale)
    
    return () => {
      window.removeEventListener('resize', calculateScale)
    }
  }, [gameWidth, gameHeight, policy, minScale, maxScale])
  
  return { scale, viewportWidth, viewportHeight }
}

