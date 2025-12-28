/**
 * TopBar Test Screen
 * Test screen for TopBar component with test buttons and expected results
 */

import { useState } from 'react'
import { TestScreen } from './TestScreen'
import { TopBar } from '@/components/layout/TopBar'
import { useGameStore } from '@/store/gameStore'
import { usePlayerStore } from '@/store/playerStore'
import { testGameStates, testAttributeStates, testLogs } from '@/test-utils/test-data'

export function TopBarTestScreen() {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const [testResults, setTestResults] = useState<Array<{
    test: string
    expected: string
    actual: string
    status: 'pass' | 'fail' | 'pending'
  }>>([])

  // Expected positions for TopBar elements
  const expectedPositions = [
    {
      id: 'topbar-bg',
      label: 'TopBar Background',
      expected: { x: 22, y: 18, width: 596, height: 244 }, // Centered: (640-596)/2 = 22
    },
    {
      id: 'topbar-first-line',
      label: 'First Line (Status)',
      expected: { x: 28, y: 4, width: 584, height: 50 }, // 22 + 6 = 28, bg height 244 - 190 - 50 = 4
    },
    {
      id: 'topbar-second-line',
      label: 'Second Line (Attributes)',
      expected: { x: 28, y: 60, width: 584, height: 50 }, // 22 + 6 = 28, bg height 244 - 134 - 50 = 60
    },
    {
      id: 'topbar-third-line',
      label: 'Third Line (Log)',
      expected: { x: 28, y: 116, width: 584, height: 122 }, // 22 + 6 = 28, bg height 244 - 6 - 122 = 116
    },
  ]

  const runTest = (testName: string, expected: string, getActual: () => string) => {
    const actual = getActual()
    const status = actual === expected ? 'pass' : 'fail'
    setTestResults((prev) => [
      ...prev.filter((r) => r.test !== testName),
      { test: testName, expected, actual, status },
    ])
  }

  const testBackgroundPosition = () => {
    const bg = document.querySelector('[data-test-id="topbar-bg"]')
    if (bg) {
      const rect = bg.getBoundingClientRect()
      const actual = `top: ${Math.round(rect.top)}px, left: ${Math.round(rect.left)}px`
      runTest(
        'Background Position',
        'top: 18px, left: 22px (centered)',
        () => actual
      )
    }
  }

  const testStatusButtons = () => {
    const btnSize = { width: 584 / 6, height: 50 }
    const expectedPositions = [
      { name: 'Day', x: btnSize.width * 0.4 + 7.3 },
      { name: 'Season', x: btnSize.width * 1.2 + 4.8 },
      { name: 'Time', x: btnSize.width * 2 + 5.5 },
      { name: 'Weather', x: btnSize.width * 2.9 - 3 },
      { name: 'Temperature', x: btnSize.width * 3.5 - 4 },
      { name: 'Electric', x: btnSize.width * 4 + 4.5 },
      { name: 'Currency', x: btnSize.width * 5 - 12.5 },
      { name: 'Fuel', x: btnSize.width * 5.7 - 0.4 },
    ]
    
    const results = expectedPositions.map((pos) => {
      const expected = `x: ~${Math.round(pos.x)}px, y: 25px`
      return { test: `Status Button: ${pos.name}`, expected, actual: 'Check visually', status: 'pending' as const }
    })
    
    setTestResults((prev) => [
      ...prev.filter((r) => !r.test.startsWith('Status Button:')),
      ...results,
    ])
  }

  const testAttributeButtons = () => {
    const positions = [
      { name: 'Injury', x: 584 / 16 * 1 },
      { name: 'Infect', x: 584 / 16 * 3 },
      { name: 'Starve', x: 584 / 16 * 5 },
      { name: 'Vigour', x: 584 / 16 * 7 },
      { name: 'Spirit', x: 584 / 16 * 9 },
      { name: 'Water', x: 584 / 16 * 11 },
      { name: 'Virus', x: 584 / 16 * 13 },
      { name: 'HP', x: 584 / 16 * 15 },
    ]
    
    const results = positions.map((pos) => {
      const expected = `x: ${Math.round(pos.x)}px, y: 25px`
      return { test: `Attribute Button: ${pos.name}`, expected, actual: 'Check visually', status: 'pending' as const }
    })
    
    setTestResults((prev) => [
      ...prev.filter((r) => !r.test.startsWith('Attribute Button:')),
      ...results,
    ])
  }

  const testScaleFactor = () => {
    const bg = document.querySelector('[data-test-id="topbar-bg"]')
    if (bg) {
      const transform = window.getComputedStyle(bg).transform
      const scale = transform === 'none' ? 1 : parseFloat(transform.match(/scale\(([^)]+)\)/)?.[1] || '1')
      runTest(
        'Scale Factor',
        'scale(1.0) for screenFix=0, scale(0.87) for screenFix=1',
        () => `scale(${scale})`
      )
    }
  }

  const testAttributeUpdates = () => {
    // Test that attributes update when values change
    playerStore.updateAttribute('hp', 50)
    playerStore.updateAttribute('starve', 30)
    
    setTimeout(() => {
      runTest(
        'Attribute Updates',
        'Attribute bars reflect current values',
        () => `HP: ${playerStore.hp}, Starve: ${playerStore.starve}`
      )
    }, 100)
  }

  const testButtonClicks = () => {
    // Test that all buttons are clickable
    const buttons = document.querySelectorAll('button')
    const clickableCount = Array.from(buttons).filter((btn) => {
      const style = window.getComputedStyle(btn)
      return style.pointerEvents !== 'none' && style.cursor === 'pointer'
    }).length
    
    runTest(
      'Button Clicks',
      'All buttons are clickable',
      () => `${clickableCount} clickable buttons found`
    )
  }

  const setTestGameState = (state: keyof typeof testGameStates) => {
    const testState = testGameStates[state]
    // Calculate time including days: days * 24 * 3600 + hours * 3600 + minutes * 60
    const totalSeconds = testState.day * 24 * 3600 + testState.hour * 3600 + testState.minute * 60
    gameStore.setTime(totalSeconds)
    gameStore.setSeason(testState.season)
    gameStore.setWeather(testState.weather)
  }

  const setTestAttributes = (state: keyof typeof testAttributeStates) => {
    const attrs = testAttributeStates[state]
    Object.entries(attrs).forEach(([key, value]) => {
      if (typeof value === 'number') {
        playerStore.updateAttribute(key as keyof typeof playerStore, value)
      }
    })
  }

  return (
    <TestScreen title="TopBar Test Screen" expectedPositions={expectedPositions}>
      {/* Test Controls - Left side, smaller, moved up */}
      <div className="absolute top-4 left-4 bg-gray-800/95 text-white p-3 z-[10001]" style={{ maxWidth: '280px', maxHeight: '60vh', overflowY: 'auto', borderBottomRightRadius: '8px' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold">Test Controls</h3>
        </div>
        
        <div className="space-y-2 mb-4">
          <div>
            <h4 className="text-sm font-semibold mb-1">Position Tests</h4>
            <button
              onClick={testBackgroundPosition}
              className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 text-xs mb-1"
            >
              Test Background Position
            </button>
            <button
              onClick={testStatusButtons}
              className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 text-xs mb-1"
            >
              Test Status Buttons
            </button>
            <button
              onClick={testAttributeButtons}
              className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 text-xs mb-1"
            >
              Test Attribute Buttons
            </button>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">Scaling Tests</h4>
            <button
              onClick={testScaleFactor}
              className="block w-full text-left px-2 py-1 bg-green-600 hover:bg-green-700 text-xs mb-1"
            >
              Test Scale Factor
            </button>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">Interaction Tests</h4>
            <button
              onClick={testAttributeUpdates}
              className="block w-full text-left px-2 py-1 bg-purple-600 hover:bg-purple-700 text-xs mb-1"
            >
              Test Attribute Updates
            </button>
            <button
              onClick={testButtonClicks}
              className="block w-full text-left px-2 py-1 bg-purple-600 hover:bg-purple-700 text-xs mb-1"
            >
              Test Button Clicks
            </button>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">Test Data</h4>
            <button
              onClick={() => setTestGameState('default')}
              className="block w-full text-left px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-xs mb-1"
            >
              Set Default Game State
            </button>
            <button
              onClick={() => setTestGameState('midday')}
              className="block w-full text-left px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-xs mb-1"
            >
              Set Midday Game State
            </button>
            <button
              onClick={() => setTestAttributes('full')}
              className="block w-full text-left px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-xs mb-1"
            >
              Set Full Attributes
            </button>
            <button
              onClick={() => setTestAttributes('warning')}
              className="block w-full text-left px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-xs mb-1"
            >
              Set Warning Attributes
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="mt-4 pt-4 border-t border-gray-600">
          <h4 className="text-sm font-semibold mb-2">Test Results</h4>
          <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-400">No tests run yet</p>
            ) : (
              testResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-1 rounded ${
                    result.status === 'pass'
                      ? 'bg-green-900/50'
                      : result.status === 'fail'
                      ? 'bg-red-900/50'
                      : 'bg-gray-700/50'
                  }`}
                >
                  <div className="font-semibold">{result.test}</div>
                  <div className="text-gray-300">Expected: {result.expected}</div>
                  <div className="text-gray-300">Actual: {result.actual}</div>
                  <div className={`text-xs ${result.status === 'pass' ? 'text-green-400' : result.status === 'fail' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {result.status === 'pass' ? '✓ PASS' : result.status === 'fail' ? '✗ FAIL' : '⏳ PENDING'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* TopBar Component */}
      <TopBar testLogs={testLogs} />
    </TestScreen>
  )
}

