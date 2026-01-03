/**
 * MainScene Test Screen
 * Test screen for MainScene component integration testing
 */

import { TestScreen } from './TestScreen'
import { MainScene } from '@/components/scenes/MainScene'
import { useUIStore } from '@/store/uiStore'
import { TestPanel, TestSection, TestButton, TestResultsList, useTestResults } from './component'

export function MainSceneTestScreen() {
  const uiStore = useUIStore()
  const { results, runTest, clearResults } = useTestResults()

  // Expected positions for MainScene elements
  const topBarBottom = 18 + 244
  const bottomBarTop = topBarBottom + 10
  const expectedPositions = [
    {
      id: 'topbar-bg',
      label: 'TopSection Background',
      expected: { x: 22, y: 18, width: 596, height: 244 },
    },
    {
      id: 'bottombar-bg',
      label: 'BottomSection Background',
      expected: { x: 22, y: bottomBarTop, width: 596, height: 834 },
    },
  ]

  const testTopBarPosition = () => {
    const topBar = document.querySelector('[data-test-id="topbar-bg"]')
    if (topBar) {
      const rect = topBar.getBoundingClientRect()
      const actual = `top: ${Math.round(rect.top)}px, left: ${Math.round(rect.left)}px`
      runTest('TopSection Position', 'top: 18px, left: 22px (centered)', () => actual)
    }
  }

  const testBottomBarPosition = () => {
    const bottomBar = document.querySelector('[data-test-id="bottombar-bg"]')
    if (bottomBar) {
      const rect = bottomBar.getBoundingClientRect()
      const actual = `top: ${Math.round(rect.top)}px, left: ${Math.round(rect.left)}px`
      runTest('BottomSection Position', `top: ${bottomBarTop}px, left: 22px (centered)`, () => actual)
    }
  }

  const testPanelSwitching = () => {
    const panels = ['home', 'build', 'storage', 'radio'] as const
    const currentPanel = uiStore.openPanel
    const currentIndex = currentPanel && panels.includes(currentPanel as typeof panels[number]) 
      ? panels.indexOf(currentPanel as typeof panels[number]) 
      : -1
    const nextIndex = (currentIndex + 1) % panels.length
    const nextPanel = panels[nextIndex]
    
    uiStore.openPanelAction(nextPanel)
    
    setTimeout(() => {
      const actualPanel = uiStore.openPanel
      runTest('Panel Switching', `Panel switches to ${nextPanel}`, () => `Current panel: ${actualPanel}`)
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
    const contentArea = document.querySelector('[data-test-id="bottombar-content"]')
    const contentHeight = contentArea ? contentArea.getBoundingClientRect().height : 0
    
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
      const topBarHigher = parseInt(topBarZ) > parseInt(bottomBarZ)
      
      runTest(
        'Z-Index Layering',
        'TopSection z-index > BottomSection z-index',
        () => `TopSection: ${topBarZ}, BottomSection: ${bottomBarZ}, TopSection higher: ${topBarHigher}`
      )
    }
  }

  const testScreenDimensions = () => {
    const mainScene = document.querySelector('[data-test-id="mainscene-container"]')
    if (mainScene) {
      const rect = mainScene.getBoundingClientRect()
      const actual = `width: ${Math.round(rect.width)}px, height: ${Math.round(rect.height)}px`
      runTest('Screen Dimensions', 'width: 640px, height: 1136px', () => actual)
    }
  }

  return (
    <TestScreen title="MainScene Test" expectedPositions={expectedPositions}>
      {/* Test Controls Panel - Draggable */}
      <TestPanel title="Test Controls" defaultPosition={{ x: 16, y: 16 }} width={280}>
        <TestSection title="Position Tests">
          <TestButton variant="position" onClick={testTopBarPosition}>
            Test TopSection Position
          </TestButton>
          <TestButton variant="position" onClick={testBottomBarPosition}>
            Test BottomSection Position
          </TestButton>
          <TestButton variant="position" onClick={testScreenDimensions}>
            Test Screen Dimensions
          </TestButton>
        </TestSection>

        <TestSection title="Integration Tests">
          <TestButton variant="state" onClick={testPanelSwitching}>
            Test Panel Switching
          </TestButton>
          <TestButton variant="state" onClick={testBackButtonVisibility}>
            Test Back Button Visibility
          </TestButton>
          <TestButton variant="state" onClick={testPanelTitle}>
            Test Panel Title
          </TestButton>
          <TestButton variant="state" onClick={testFullScreenMode}>
            Test Full Screen Mode
          </TestButton>
          <TestButton variant="state" onClick={testZIndexLayering}>
            Test Z-Index Layering
          </TestButton>
        </TestSection>

        <TestSection title="Panel Navigation">
          <TestButton variant="data" onClick={() => uiStore.openPanelAction('home')}>
            Switch to Home Panel
          </TestButton>
          <TestButton variant="data" onClick={() => uiStore.openPanelAction('build')}>
            Switch to Build Panel
          </TestButton>
          <TestButton variant="data" onClick={() => uiStore.openPanelAction('storage')}>
            Switch to Storage Panel
          </TestButton>
          <TestButton variant="data" onClick={() => uiStore.openPanelAction('radio')}>
            Switch to Radio Panel
          </TestButton>
        </TestSection>

        <TestResultsList results={results} onClear={clearResults} />
      </TestPanel>

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





