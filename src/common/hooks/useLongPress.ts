/**
 * useLongPress Hook
 * Detects long press gestures (0.5 seconds) with movement cancellation
 * Ported from OriginalGame/src/ui/SectionTableView.js TableViewButton
 * 
 * Original behavior:
 * - Long press threshold: 0.5 seconds
 * - Movement threshold: 200px (cancels long press)
 * - Supports both mouse and touch events
 */

import { useRef, useCallback } from 'react'

interface UseLongPressOptions {
  onLongPress: () => void
  onClick?: () => void
  threshold?: number  // Default: 500ms
  moveThreshold?: number  // Default: 200px
}

export function useLongPress({
  onLongPress,
  onClick,
  threshold = 500,
  moveThreshold = 200
}: UseLongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startPosRef = useRef<{ x: number; y: number } | null>(null)
  const isPressedRef = useRef(false)
  const longPressTriggeredRef = useRef(false)
  const clickHandledRef = useRef(false) // Track if onClick has already been called to prevent double-firing

  const cancelLongPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    isPressedRef.current = false
    startPosRef.current = null
  }, [])

  const handleStart = useCallback((clientX: number, clientY: number) => {
    startPosRef.current = { x: clientX, y: clientY }
    isPressedRef.current = true
    longPressTriggeredRef.current = false
    clickHandledRef.current = false // Reset click handled flag on new press

    timerRef.current = setTimeout(() => {
      if (isPressedRef.current) {
        longPressTriggeredRef.current = true
        onLongPress()
        isPressedRef.current = false
        startPosRef.current = null
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }, threshold)
  }, [onLongPress, threshold])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isPressedRef.current || !startPosRef.current) return

    const distance = Math.sqrt(
      Math.pow(clientX - startPosRef.current.x, 2) +
      Math.pow(clientY - startPosRef.current.y, 2)
    )

    if (distance > moveThreshold) {
      cancelLongPress()
    }
  }, [moveThreshold, cancelLongPress])

  const handleEnd = useCallback(() => {
    const wasPressed = isPressedRef.current
    const longPressWasTriggered = longPressTriggeredRef.current
    cancelLongPress()

    // Only trigger onClick if:
    // 1. We were pressed (not just a hover)
    // 2. Long press was NOT triggered (to prevent double action)
    // 3. onClick is provided
    // 4. onClick hasn't already been called (prevent double-firing from touch+mouse events)
    if (wasPressed && !longPressWasTriggered && onClick && !clickHandledRef.current) {
      clickHandledRef.current = true // Mark as handled to prevent double-firing
      onClick()
    }
    
    // Reset flags after a short delay to allow for next interaction
    setTimeout(() => {
      longPressTriggeredRef.current = false
      clickHandledRef.current = false
    }, 100)
  }, [onClick, cancelLongPress])

  // Mouse event handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }, [handleStart])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }, [handleMove])

  const onMouseUp = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  const onMouseLeave = useCallback(() => {
    cancelLongPress()
  }, [cancelLongPress])

  // Touch event handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (touch) {
      handleStart(touch.clientX, touch.clientY)
    }
  }, [handleStart])
  
  // Prevent mouse events from firing after touch events (browser compatibility behavior)
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    handleEnd()
    // Prevent mouse events from also firing (touch devices fire both touch and mouse events)
    e.preventDefault()
  }, [handleEnd])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (touch) {
      handleMove(touch.clientX, touch.clientY)
    }
  }, [handleMove])


  const onTouchCancel = useCallback(() => {
    cancelLongPress()
  }, [cancelLongPress])

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel
  }
}
