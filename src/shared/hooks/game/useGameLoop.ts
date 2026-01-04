/**
 * useGameLoop Hook
 * Handles game update loop
 * Extracted from MainScene.tsx
 */

import { useEffect } from 'react'
import { game } from '@/core/game/Game'

/**
 * Initializes and runs the game loop
 * Updates game systems every frame
 */
export function useGameLoop() {
  useEffect(() => {
    // Ensure game is initialized and resumed
    game.initialize()
    game.resume()
    
    let lastTime = performance.now()
    let animationFrameId: number
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000 // Convert to seconds
      lastTime = currentTime
      
      // Update game systems (time, survival, etc.)
      game.update(deltaTime)
      
      // Continue loop
      animationFrameId = requestAnimationFrame(gameLoop)
    }
    
    // Start game loop
    animationFrameId = requestAnimationFrame(gameLoop)
    
    // Cleanup on unmount
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])
}

