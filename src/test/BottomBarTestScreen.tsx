/**
 * BottomBar Test Screen
 * Test screen for BottomBar component with test buttons and expected results
 */

import { useState } from 'react'
import { TestScreen } from './TestScreen'
import { BottomBar } from '@/components/layout/BottomBar'
import { useUIStore } from '@/store/uiStore'
import { TestPanel, TestSection, TestButton, TestResultsList, useTestResults } from './component'

export function BottomBarTestScreen() {
  const uiStore = useUIStore()
  const { results, runTest, clearResults } = useTestResults()
  const [showLeftBtn, setShowLeftBtn] = useState(false)
  const [showRightBtn, setShowRightBtn] = useState(true)
  const [panelTitle, setPanelTitle] = useState('Test Panel')
  const [fullScreen, setFullScreen] = useState(false)

  // Expected positions for BottomBar elements
  const topBarBottom = 18 + 244
  const bottomBarTop = topBarBottom + 10
  const expectedPositions = [
    {
      id: 'bottombar-bg',
      label: 'BottomBar Background',
      expected: { x: 22, y: bottomBarTop, width: 596, height: 834 },
    },
    {
      id: 'bottombar-action-bar',
      label: 'Action Bar Row',
      expected: { x: 22, y: bottomBarTop + 1, width: 596, height: 70 },
    },
    {
      id: 'bottombar-line',
      label: 'Line Separator',
      expected: { x: 298, y: bottomBarTop + 76, width: 596, height: 1 },
    },
    {
      id: 'bottombar-content',
      label: 'Content Area',
      expected: { x: 22, y: bottomBarTop + 76, width: 596, height: 758 },
    },
  ]

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
      runTest('Action Bar Position', `top: ${bottomBarTop + 1}px`, () => actual)
    }
  }

  const testLineSeparator = () => {
    const line = document.querySelector('[data-test-id="bottombar-line"]')
    if (line) {
      const rect = line.getBoundingClientRect()
      const actual = `top: ${Math.round(rect.top)}px`
      runTest('Line Separator Position', `top: ${bottomBarTop + 76}px`, () => actual)
    }
  }

  const testContentArea = () => {
    const content = document.querySelector('[data-test-id="bottombar-content"]')
    if (content) {
      const rect = content.getBoundingClientRect()
      const actual = `top: ${Math.round(rect.top)}px, height: ${Math.round(rect.height)}px`
      runTest('Content Area Position', `top: ${bottomBarTop + 76}px, height: 758px`, () => actual)
    }
  }

  const testPanelSwitching = () => {
    const panels = ['home', 'build', 'storage', 'radio']
    const currentPanel = uiStore.openPanel
    const nextPanel = panels[(panels.indexOf(currentPanel || 'home') + 1) % panels.length]
    uiStore.openPanelAction(nextPanel)
    
    setTimeout(() => {
      runTest('Panel Switching', `Panel switches to ${nextPanel}`, () => `Current panel: ${uiStore.openPanel}`)
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
    <TestScreen title="BottomBar Test" expectedPositions={expectedPositions}>
      {/* Test Controls Panel - Draggable */}
      <TestPanel title="Test Controls" defaultPosition={{ x: 16, y: 16 }} width={280}>
        <TestSection title="Position Tests">
          <TestButton variant="position" onClick={testBackgroundPosition}>
            Test Background Position
          </TestButton>
          <TestButton variant="position" onClick={testActionBar}>
            Test Action Bar Row
          </TestButton>
          <TestButton variant="position" onClick={testLineSeparator}>
            Test Line Separator
          </TestButton>
          <TestButton variant="position" onClick={testContentArea}>
            Test Content Area
          </TestButton>
        </TestSection>

        <TestSection title="Interaction Tests">
          <TestButton variant="interaction" onClick={testPanelSwitching}>
            Test Panel Switching
          </TestButton>
          <TestButton variant="interaction" onClick={testButtonVisibility}>
            Test Button Visibility
          </TestButton>
        </TestSection>

        <TestSection title="Test Settings">
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
            className="w-full px-2 py-1 bg-gray-700 text-white text-sm mb-1 rounded"
          />
        </TestSection>

        <TestResultsList results={results} onClear={clearResults} />
      </TestPanel>

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


