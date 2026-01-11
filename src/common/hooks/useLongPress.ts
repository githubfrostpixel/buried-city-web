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
    if (wasPressed && !longPressWasTriggered && onClick) {
      onClick()
    }
    
    // Reset long press flag after a short delay to allow for next interaction
    setTimeout(() => {
      longPressTriggeredRef.current = false
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

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (touch) {
      handleMove(touch.clientX, touch.clientY)
    }
  }, [handleMove])

  const onTouchEnd = useCallback(() => {
    handleEnd()
  }, [handleEnd])

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
