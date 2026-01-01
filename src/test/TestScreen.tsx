/**
 * TestScreen Component
 * Base wrapper for test screens with controls and position overlay
 */

import { useState, ReactNode } from 'react'
import { PositionOverlay } from './PositionOverlay'
import { TestPanel } from './component'

interface TestScreenProps {
  title: string
  children: ReactNode
  onTestComplete?: (results: unknown) => void
  expectedPositions?: Array<{
    id: string
    label: string
    expected: { x: number; y: number; width?: number; height?: number }
  }>
}

export function TestScreen({ 
  title, 
  children, 
  expectedPositions = []
}: TestScreenProps) {
  const [showPositionOverlay, setShowPositionOverlay] = useState(false)
  const [showExpected, setShowExpected] = useState(false)
  const [screenFix, setScreenFix] = useState(0)

  return (
    <div className="relative w-full h-full" style={{ backgroundColor: '#000000' }}>
      {/* Test Controls Panel - Draggable */}
      <TestPanel
        title={title}
        defaultPosition={{ x: window.innerWidth - 340, y: window.innerHeight - 200 }}
        width={320}
        maxHeight="200px"
      >
        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPositionOverlay}
              onChange={(e) => setShowPositionOverlay(e.target.checked)}
              className="w-3 h-3"
            />
            <span>Position Overlay</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showExpected}
              onChange={(e) => setShowExpected(e.target.checked)}
              disabled={!showPositionOverlay}
              className="w-3 h-3"
            />
            <span>Expected Positions</span>
          </label>
          
          <div className="flex items-center gap-2 text-xs">
            <span>screenFix:</span>
            <button
              onClick={() => setScreenFix(0)}
              className={`px-2 py-0.5 text-xs rounded ${screenFix === 0 ? 'bg-blue-500' : 'bg-gray-700'}`}
            >
              0
            </button>
            <button
              onClick={() => setScreenFix(1)}
              className={`px-2 py-0.5 text-xs rounded ${screenFix === 1 ? 'bg-blue-500' : 'bg-gray-700'}`}
            >
              1
            </button>
          </div>
        </div>
      </TestPanel>

      {/* Position Overlay */}
      <PositionOverlay
        enabled={showPositionOverlay}
        showExpected={showExpected}
        expectedPositions={expectedPositions}
      />

      {/* Test Content - Centered */}
      <div className="flex items-center justify-center min-h-screen py-4">
        <div className="relative" style={{ width: '640px', height: '1136px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}


