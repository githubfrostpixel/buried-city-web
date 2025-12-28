/**
 * MainScene Test Screen
 * Test screen for MainScene component integration testing
 */

import { useState } from 'react'
import { TestScreen } from './TestScreen'
import { MainScene } from '@/components/scenes/MainScene'
import { useUIStore } from '@/store/uiStore'

export function MainSceneTestScreen() {
  const uiStore = useUIStore()
  const [testResults, setTestResults] = useState<Array<{
    test: string
    expected: string
    actual: string
    status: 'pass' | 'fail' | 'pending'
  }>>([])

  // Expected positions for MainScene elements
  const topBarBottom = 18 + 244 // TopBar bottom edge
  const bottomBarTop = topBarBottom + 10 // BottomBar top position
  const expectedPositions = [
    {
      id: 'topbar-bg',
      label: 'TopBar Background',
      expected: { x: 22, y: 18, width: 596, height: 244 },
    },
    {
      id: 'bottombar-bg',
      label: 'BottomBar Background',
      expected: { x: 22, y: bottomBarTop, width: 596, height: 834 },
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

  const testTopBarPosition = () => {
    const topBar = document.querySelector('[data-test-id="topbar-bg"]')
    if (topBar) {
      const rect = topBar.getBoundingClientRect()
      const actual = `top: ${Math.round(rect.top)}px, left: ${Math.round(rect.left)}px`
      runTest(
        'TopBar Position',
        'top: 18px, left: 22px (centered)',
        () => actual
      )
    }
  }

  const testBottomBarPosition = () => {
    const bottomBar = document.querySelector('[data-test-id="bottombar-bg"]')
    if (bottomBar) {
      const rect = bottomBar.getBoundingClientRect()
      const actual = `top: ${Math.round(rect.top)}px, left: ${Math.round(rect.left)}px`
      runTest(
        'BottomBar Position',
        `top: ${bottomBarTop}px, left: 22px (centered)`,
        () => actual
      )
    }
  }

  const testPanelSwitching = () => {
    const panels = ['home', 'build', 'storage', 'radio'] as const
    const currentPanel = uiStore.openPanel
    const currentIndex = currentPanel ? panels.indexOf(currentPanel) : -1
    const nextIndex = (currentIndex + 1) % panels.length
    const nextPanel = panels[nextIndex]
    
    uiStore.openPanelAction(nextPanel)
    
    setTimeout(() => {
      const actualPanel = uiStore.openPanel
      runTest(
        'Panel Switching',
        `Panel switches to ${nextPanel}`,
        () => `Current panel: ${actualPanel}`
      )
    }, 100)
  }

  const testBackButtonVisibility = () => {
    const currentPanel = uiStore.openPanel
    const shouldShow = currentPanel !== 'home' && currentPanel !== null
    const leftBtn = document.querySelector('[data-test-id="bottombar-left-btn"]')
    const isVisible = leftBtn && window.getComputedStyle(leftBtn).display !== 'none'
    
    runTest(
      'Back Button Visibility',
      `Back button ${shouldShow ? 'visible' : 'hidden'} (panel: ${currentPanel})`,
      () => `Back button ${isVisible ? 'visible' : 'hidden'}, Panel: ${currentPanel}`
    )
  }

  const testPanelTitle = () => {
    const currentPanel = uiStore.openPanel
    const expectedTitle = currentPanel === 'home' ? '' : 
                          currentPanel === 'build' ? 'Building' :
                          currentPanel === 'storage' ? 'Storage' :
                          currentPanel === 'radio' ? 'Radio' : ''
    
    const titleElement = document.querySelector('[data-test-id="bottombar-title"]')
    const actualTitle = titleElement?.textContent?.trim() || ''
    
    runTest(
      'Panel Title',
      `Title: "${expectedTitle}" (panel: ${currentPanel})`,
      () => `Title: "${actualTitle}", Panel: ${currentPanel}`
    )
  }

  const testFullScreenMode = () => {
    const currentPanel = uiStore.openPanel
    const shouldBeFullScreen = currentPanel === 'home'
    const bottomBar = document.querySelector('[data-test-id="bottombar-bg"]')
    const contentArea = document.querySelector('[data-test-id="bottombar-content"]')
    
    // Check if content area extends to full height (fullScreen mode)
    const contentHeight = contentArea ? contentArea.getBoundingClientRect().height : 0
    const expectedHeight = shouldBeFullScreen ? 758 : 758 // Both modes use same height for now
    
    runTest(
      'Full Screen Mode',
      `Full screen: ${shouldBeFullScreen} (panel: ${currentPanel})`,
      () => `Full screen: ${shouldBeFullScreen}, Content height: ${Math.round(contentHeight)}px`
    )
  }

  const testZIndexLayering = () => {
    const topBar = document.querySelector('[data-test-id="topbar-bg"]')
    const bottomBar = document.querySelector('[data-test-id="bottombar-bg"]')
    
    if (topBar && bottomBar) {
      const topBarZ = window.getComputedStyle(topBar).zIndex
      const bottomBarZ = window.getComputedStyle(bottomBar).zIndex
      
      // TopBar should have higher z-index than BottomBar
      const topBarHigher = parseInt(topBarZ) > parseInt(bottomBarZ)
      
      runTest(
        'Z-Index Layering',
        'TopBar z-index > BottomBar z-index',
        () => `TopBar: ${topBarZ}, BottomBar: ${bottomBarZ}, TopBar higher: ${topBarHigher}`
      )
    }
  }

  const testScreenDimensions = () => {
    const mainScene = document.querySelector('[data-test-id="mainscene-container"]')
    if (mainScene) {
      const rect = mainScene.getBoundingClientRect()
      const actual = `width: ${Math.round(rect.width)}px, height: ${Math.round(rect.height)}px`
      runTest(
        'Screen Dimensions',
        'width: 640px, height: 1136px',
        () => actual
      )
    }
  }

  return (
    <TestScreen title="MainScene Test Screen" expectedPositions={expectedPositions}>
      {/* Test Controls - Left side, smaller, moved up */}
      <div className="absolute top-4 left-4 bg-gray-800/95 text-white p-3 z-[10001]" style={{ maxWidth: '280px', maxHeight: '60vh', overflowY: 'auto', borderBottomRightRadius: '8px' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold">Test Controls</h3>
        </div>
        
        <div className="space-y-2 mb-4">
          <div>
            <h4 className="text-sm font-semibold mb-1">Position Tests</h4>
            <button
              onClick={testTopBarPosition}
              className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 text-xs mb-1"
            >
              Test TopBar Position
            </button>
            <button
              onClick={testBottomBarPosition}
              className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 text-xs mb-1"
            >
              Test BottomBar Position
            </button>
            <button
              onClick={testScreenDimensions}
              className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 text-xs mb-1"
            >
              Test Screen Dimensions
            </button>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">Integration Tests</h4>
            <button
              onClick={testPanelSwitching}
              className="block w-full text-left px-2 py-1 bg-green-600 hover:bg-green-700 text-xs mb-1"
            >
              Test Panel Switching
            </button>
            <button
              onClick={testBackButtonVisibility}
              className="block w-full text-left px-2 py-1 bg-green-600 hover:bg-green-700 text-xs mb-1"
            >
              Test Back Button Visibility
            </button>
            <button
              onClick={testPanelTitle}
              className="block w-full text-left px-2 py-1 bg-green-600 hover:bg-green-700 text-xs mb-1"
            >
              Test Panel Title
            </button>
            <button
              onClick={testFullScreenMode}
              className="block w-full text-left px-2 py-1 bg-green-600 hover:bg-green-700 text-xs mb-1"
            >
              Test Full Screen Mode
            </button>
            <button
              onClick={testZIndexLayering}
              className="block w-full text-left px-2 py-1 bg-green-600 hover:bg-green-700 text-xs mb-1"
            >
              Test Z-Index Layering
            </button>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">Panel Navigation</h4>
            <button
              onClick={() => uiStore.openPanelAction('home')}
              className="block w-full text-left px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-xs mb-1"
            >
              Switch to Home Panel
            </button>
            <button
              onClick={() => uiStore.openPanelAction('build')}
              className="block w-full text-left px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-xs mb-1"
            >
              Switch to Build Panel
            </button>
            <button
              onClick={() => uiStore.openPanelAction('storage')}
              className="block w-full text-left px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-xs mb-1"
            >
              Switch to Storage Panel
            </button>
            <button
              onClick={() => uiStore.openPanelAction('radio')}
              className="block w-full text-left px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-xs mb-1"
            >
              Switch to Radio Panel
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

      {/* MainScene Component */}
      <div 
        data-test-id="mainscene-container"
        style={{
          width: '640px',
          height: '1136px',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <MainScene />
      </div>
    </TestScreen>
  )
}

