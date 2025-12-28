/**
 * BottomBar Test Screen
 * Test screen for BottomBar component with test buttons and expected results
 */

import { useState } from 'react'
import { TestScreen } from './TestScreen'
import { BottomBar } from '@/components/layout/BottomBar'
import { useUIStore } from '@/store/uiStore'

export function BottomBarTestScreen() {
  const uiStore = useUIStore()
  const [testResults, setTestResults] = useState<Array<{
    test: string
    expected: string
    actual: string
    status: 'pass' | 'fail' | 'pending'
  }>>([])
  const [showLeftBtn, setShowLeftBtn] = useState(false)
  const [showRightBtn, setShowRightBtn] = useState(true)
  const [panelTitle, setPanelTitle] = useState('Test Panel')
  const [fullScreen, setFullScreen] = useState(false)

  // Expected positions for BottomBar elements
  const topBarBottom = 18 + 244 // TopBar bottom edge
  const bottomBarTop = topBarBottom + 10 // BottomBar top position
  const expectedPositions = [
    {
      id: 'bottombar-bg',
      label: 'BottomBar Background',
      expected: { x: 22, y: bottomBarTop, width: 596, height: 834 }, // Centered: (640-596)/2 = 22
    },
    {
      id: 'bottombar-action-bar',
      label: 'Action Bar Row',
      expected: { x: 22, y: bottomBarTop + 1, width: 596, height: 70 },
    },
    {
      id: 'bottombar-line',
      label: 'Line Separator',
      expected: { x: 298, y: bottomBarTop + 76, width: 596, height: 1 }, // Centered
    },
    {
      id: 'bottombar-content',
      label: 'Content Area',
      expected: { x: 22, y: bottomBarTop + 76, width: 596, height: 758 }, // 834 - 76 = 758
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
    const bg = document.querySelector('[data-test-id="bottombar-bg"]')
    if (bg) {
      const rect = bg.getBoundingClientRect()
      const actual = `top: ${Math.round(rect.top)}px, left: ${Math.round(rect.left)}px`
      runTest(
        'Background Position',
        `top: ${bottomBarTop}px, left: 22px (centered)`,
        () => actual
      )
    }
  }

  const testActionBar = () => {
    const actionBar = document.querySelector('[data-test-id="bottombar-action-bar"]')
    if (actionBar) {
      const rect = actionBar.getBoundingClientRect()
      const actual = `top: ${Math.round(rect.top)}px`
      runTest(
        'Action Bar Position',
        `top: ${bottomBarTop + 1}px`,
        () => actual
      )
    }
  }

  const testLineSeparator = () => {
    const line = document.querySelector('[data-test-id="bottombar-line"]')
    if (line) {
      const rect = line.getBoundingClientRect()
      const actual = `top: ${Math.round(rect.top)}px`
      runTest(
        'Line Separator Position',
        `top: ${bottomBarTop + 76}px`,
        () => actual
      )
    }
  }

  const testContentArea = () => {
    const content = document.querySelector('[data-test-id="bottombar-content"]')
    if (content) {
      const rect = content.getBoundingClientRect()
      const actual = `top: ${Math.round(rect.top)}px, height: ${Math.round(rect.height)}px`
      runTest(
        'Content Area Position',
        `top: ${bottomBarTop + 76}px, height: 758px`,
        () => actual
      )
    }
  }

  const testPanelSwitching = () => {
    const panels = ['home', 'build', 'storage', 'radio']
    const currentPanel = uiStore.openPanel
    const nextPanel = panels[(panels.indexOf(currentPanel || 'home') + 1) % panels.length]
    uiStore.openPanelAction(nextPanel)
    
    setTimeout(() => {
      runTest(
        'Panel Switching',
        `Panel switches to ${nextPanel}`,
        () => `Current panel: ${uiStore.openPanel}`
      )
    }, 100)
  }

  const testButtonVisibility = () => {
    const leftBtn = document.querySelector('[data-test-id="bottombar-left-btn"]')
    const rightBtn = document.querySelector('[data-test-id="bottombar-right-btn"]')
    
    const leftVisible = leftBtn && window.getComputedStyle(leftBtn).display !== 'none'
    const rightVisible = rightBtn && window.getComputedStyle(rightBtn).display !== 'none'
    
    runTest(
      'Button Visibility',
      `Left: ${showLeftBtn}, Right: ${showRightBtn}`,
      () => `Left: ${leftVisible}, Right: ${rightVisible}`
    )
  }

  return (
    <TestScreen title="BottomBar Test Screen" expectedPositions={expectedPositions}>
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
              onClick={testActionBar}
              className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 text-xs mb-1"
            >
              Test Action Bar Row
            </button>
            <button
              onClick={testLineSeparator}
              className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 text-xs mb-1"
            >
              Test Line Separator
            </button>
            <button
              onClick={testContentArea}
              className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 text-xs mb-1"
            >
              Test Content Area
            </button>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">Interaction Tests</h4>
            <button
              onClick={testPanelSwitching}
              className="block w-full text-left px-2 py-1 bg-purple-600 hover:bg-purple-700 text-xs mb-1"
            >
              Test Panel Switching
            </button>
            <button
              onClick={testButtonVisibility}
              className="block w-full text-left px-2 py-1 bg-purple-600 hover:bg-purple-700 text-xs mb-1"
            >
              Test Button Visibility
            </button>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">Test Settings</h4>
            <label className="flex items-center gap-2 text-sm mb-1">
              <input
                type="checkbox"
                checked={showLeftBtn}
                onChange={(e) => setShowLeftBtn(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Show Left Button</span>
            </label>
            <label className="flex items-center gap-2 text-sm mb-1">
              <input
                type="checkbox"
                checked={showRightBtn}
                onChange={(e) => setShowRightBtn(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Show Right Button</span>
            </label>
            <label className="flex items-center gap-2 text-sm mb-1">
              <input
                type="checkbox"
                checked={fullScreen}
                onChange={(e) => setFullScreen(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Full Screen Mode</span>
            </label>
            <input
              type="text"
              value={panelTitle}
              onChange={(e) => setPanelTitle(e.target.value)}
              placeholder="Panel Title"
              className="w-full px-2 py-1 bg-gray-700 text-white text-sm mb-1"
            />
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

      {/* BottomBar Component */}
      <BottomBar
        title={panelTitle}
        leftBtn={showLeftBtn}
        rightBtn={showRightBtn}
        onLeftClick={() => console.log('Left button clicked')}
        onRightClick={() => console.log('Right button clicked')}
        fullScreen={fullScreen}
      >
        <div 
          data-test-id="bottombar-content" 
          data-test-label="Content Area" 
          data-test-position
          className="p-4 text-white"
        >
          <p>BottomBar Test Content</p>
          <p>This is the content area of the BottomBar.</p>
          <p>Use the test controls to test different configurations.</p>
        </div>
      </BottomBar>
    </TestScreen>
  )
}

