/**
 * Position Overlay Component
 * Shows element positions and measurements for testing
 */

import { useEffect, useState } from 'react'

interface PositionOverlayProps {
  enabled: boolean
  targetSelector?: string
  showExpected?: boolean
  expectedPositions?: Array<{
    id: string
    label: string
    expected: { x: number; y: number; width?: number; height?: number }
  }>
}

export function PositionOverlay({ 
  enabled, 
  targetSelector = '[data-test-position]',
  showExpected = false,
  expectedPositions = []
}: PositionOverlayProps) {
  const [positions, setPositions] = useState<Array<{
    id: string
    label: string
    x: number
    y: number
    width: number
    height: number
  }>>([])

  useEffect(() => {
    if (!enabled) {
      setPositions([])
      return
    }

    const updatePositions = () => {
      const elements = document.querySelectorAll(targetSelector)
      const newPositions: typeof positions = []

      elements.forEach((element, index) => {
        const rect = element.getBoundingClientRect()
        const id = element.getAttribute('data-test-id') || `element-${index}`
        const label = element.getAttribute('data-test-label') || id

        newPositions.push({
          id,
          label,
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        })
      })

      setPositions(newPositions)
    }

    updatePositions()
    const interval = setInterval(updatePositions, 100)

    return () => clearInterval(interval)
  }, [enabled, targetSelector])

  if (!enabled) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ overflow: 'visible' }}
    >
      {/* Actual positions */}
      {positions.map((pos) => (
        <div
          key={pos.id}
          className="absolute border-2 border-blue-500 bg-blue-500/20"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: `${pos.width}px`,
            height: `${pos.height}px`,
          }}
        >
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1 whitespace-nowrap">
            {pos.label}: ({Math.round(pos.x)}, {Math.round(pos.y)})
            {pos.width > 0 && pos.height > 0 && (
              <span className="ml-2">
                {Math.round(pos.width)}×{Math.round(pos.height)}
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Expected positions */}
      {showExpected && expectedPositions.map((expected) => {
        const actual = positions.find((p) => p.id === expected.id)
        const diff = actual
          ? Math.sqrt(
              Math.pow(actual.x - expected.expected.x, 2) +
              Math.pow(actual.y - expected.expected.y, 2)
            )
          : null
        const isMatch = diff !== null && diff <= 1

        return (
          <div
            key={`expected-${expected.id}`}
            className="absolute border-2 border-dashed border-green-500 bg-green-500/10"
            style={{
              left: `${expected.expected.x}px`,
              top: `${expected.expected.y}px`,
              width: expected.expected.width ? `${expected.expected.width}px` : 'auto',
              height: expected.expected.height ? `${expected.expected.height}px` : 'auto',
            }}
          >
            <div
              className={`absolute -top-6 left-0 text-xs px-1 whitespace-nowrap ${
                isMatch ? 'bg-green-500' : 'bg-red-500'
              } text-white`}
            >
              Expected {expected.label}: ({expected.expected.x}, {expected.expected.y})
              {diff !== null && (
                <span className="ml-2">
                  Diff: {diff.toFixed(1)}px {isMatch ? '✓' : '✗'}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

