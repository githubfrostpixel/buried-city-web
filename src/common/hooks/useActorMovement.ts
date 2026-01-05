/**
 * useActorMovement Hook
 * Handles frame-by-frame actor movement animation on the map
 * Ported from OriginalGame/src/ui/MapNode.js Actor.updateActor()
 * 
 * Updates actor position smoothly from current position to target position
 * using velocity-based movement over calculated travel time
 */

import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/core/store/playerStore'
import { calculateDistance } from '@/common/utils/distance'

export function useActorMovement() {
  const playerStore = usePlayerStore()
  const map = playerStore.map
  const isMoving = playerStore.isMoving
  const actorTargetPos = playerStore.actorTargetPos
  const actorMaxVelocity = playerStore.actorMaxVelocity
  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  
  useEffect(() => {
    // Get fresh store state (avoid stale closures)
    const getStoreState = () => usePlayerStore.getState()
    
    console.log('[useActorMovement] Effect triggered:', {
      isMoving,
      hasTargetPos: !!actorTargetPos,
      targetPos: actorTargetPos,
      hasMap: !!map,
      maxVelocity: actorMaxVelocity
    })
    
    // Only run if moving and have target position and map
    if (!isMoving || !actorTargetPos || !map) {
      console.log('[useActorMovement] Conditions not met, cleaning up')
      // Clean up if animation is running but conditions not met
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      lastTimeRef.current = null
      return
    }
    
    console.log('[useActorMovement] Starting movement animation')
    
    // Initialize last time on first frame
    if (lastTimeRef.current === null) {
      lastTimeRef.current = performance.now()
    }
    
    const updateMovement = (currentTime: number) => {
      // Get fresh store state each frame (avoid stale closures)
      const currentStoreState = getStoreState()
      
      // Check conditions again (may have changed)
      if (!currentStoreState.isMoving || !currentStoreState.actorTargetPos || !map) {
        console.log('[useActorMovement] Movement stopped:', {
          isMoving: currentStoreState.isMoving,
          hasTargetPos: !!currentStoreState.actorTargetPos,
          hasMap: !!map
        })
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        lastTimeRef.current = null
        return
      }
      
      // Calculate delta time (seconds)
      const lastTime = lastTimeRef.current || currentTime
      const deltaTime = (currentTime - lastTime) / 1000
      lastTimeRef.current = currentTime
      
      const currentPos = map.pos
      const targetPos = currentStoreState.actorTargetPos
      
      // Calculate distance to target
      const distance = calculateDistance(currentPos, targetPos)
      
      // Log every 10 frames to avoid spam
      if (Math.floor(currentTime / 100) % 10 === 0) {
        console.log('[useActorMovement] Frame update:', {
          currentPos,
          targetPos,
          distance: distance.toFixed(2),
          maxVelocity: currentStoreState.actorMaxVelocity,
          deltaTime: deltaTime.toFixed(4)
        })
      }
      
      // Check if reached destination (within 10 pixels, matching original)
      if (distance <= 10) {
        console.log('[useActorMovement] Reached destination!')
        // Reached destination - snap to exact position
        map.updatePos(targetPos)
        currentStoreState.setIsMoving(false)
        
        // Call completion callback if exists
        const callback = currentStoreState.actorMovementCallback
        if (callback) {
          console.log('[useActorMovement] Calling completion callback')
          callback()
          currentStoreState.setActorMovementCallback(null)
        } else {
          console.warn('[useActorMovement] No completion callback found!')
        }
        
        // Clear movement state
        currentStoreState.clearActorMovement()
        
        // Clean up
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        lastTimeRef.current = null
        return
      }
      
      // Calculate velocity vector (normalized direction * maxVelocity)
      const dx = targetPos.x - currentPos.x
      const dy = targetPos.y - currentPos.y
      const normalizedDx = dx / distance
      const normalizedDy = dy / distance
      
      // Calculate movement for this frame
      const maxVelocity = currentStoreState.actorMaxVelocity
      if (maxVelocity <= 0) {
        console.warn('[useActorMovement] Max velocity is 0 or negative!', { maxVelocity })
      }
      
      const moveX = normalizedDx * maxVelocity * deltaTime
      const moveY = normalizedDy * maxVelocity * deltaTime
      
      // Calculate new position
      const newPos = {
        x: currentPos.x + moveX,
        y: currentPos.y + moveY
      }
      
      // Update position (this triggers re-render)
      map.updatePos(newPos)
      
      // Store current velocity for potential use
      const currentVelocity = Math.sqrt(moveX * moveX + moveY * moveY) / deltaTime
      currentStoreState.setActorVelocity(currentVelocity)
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(updateMovement)
    }
    
    // Start animation
    animationFrameRef.current = requestAnimationFrame(updateMovement)
    
    // Cleanup on unmount or when dependencies change
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      lastTimeRef.current = null
    }
  }, [isMoving, actorTargetPos, actorMaxVelocity, map])  // React to movement state changes
}

