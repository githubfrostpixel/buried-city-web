/**
 * TopSection Test Screen
 * Test screen for TopSection component with test buttons and expected results
 */

import { TestScreen } from './TestScreen'
import { TopSection } from '@/layout/TopSection'
import { useGameStore } from '@/core/store/gameStore'
import { usePlayerStore } from '@/core/store/playerStore'
import { testGameStates, testAttributeStates, testLogs } from '@/test/utils/test-data'
import { TestPanel, TestSection, TestButton, TestResultsList, useTestResults } from './component'

export function TopSectionTestScreen() {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const { results, runTest, addPendingTests, clearResults } = useTestResults()

  // Expected positions for TopSection elements
  const expectedPositions = [
    {
      id: 'topbar-bg',
      label: 'TopSection Background',
      expected: { x: 22, y: 18, width: 596, height: 244 },
    },
    {
      id: 'topbar-first-line',
      label: 'First Line (Status)',
      expected: { x: 28, y: 4, width: 584, height: 50 },
    },
    {
      id: 'topbar-second-line',
      label: 'Second Line (Attributes)',
      expected: { x: 28, y: 60, width: 584, height: 50 },
    },
    {
      id: 'topbar-third-line',
      label: 'Third Line (Log)',
      expected: { x: 28, y: 116, width: 584, height: 122 },
    },
  ]

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
    
    const tests = expectedPositions.map((pos) => ({
      test: `Status Button: ${pos.name}`,
      expected: `x: ~${Math.round(pos.x)}px, y: 25px`,
    }))
    
    addPendingTests(tests)
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
    
    const tests = positions.map((pos) => ({
      test: `Attribute Button: ${pos.name}`,
      expected: `x: ${Math.round(pos.x)}px, y: 25px`,
    }))
    
    addPendingTests(tests)
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
    <TestScreen title="TopSection Test" expectedPositions={expectedPositions}>
      {/* Test Controls Panel - Draggable */}
      <TestPanel title="Test Controls" defaultPosition={{ x: 16, y: 16 }} width={280}>
        <TestSection title="Position Tests">
          <TestButton variant="position" onClick={testBackgroundPosition}>
            Test Background Position
          </TestButton>
          <TestButton variant="position" onClick={testStatusButtons}>
            Test Status Buttons
          </TestButton>
          <TestButton variant="position" onClick={testAttributeButtons}>
            Test Attribute Buttons
          </TestButton>
        </TestSection>

        <TestSection title="Scaling Tests">
          <TestButton variant="state" onClick={testScaleFactor}>
            Test Scale Factor
          </TestButton>
        </TestSection>

        <TestSection title="Interaction Tests">
          <TestButton variant="interaction" onClick={testAttributeUpdates}>
            Test Attribute Updates
          </TestButton>
          <TestButton variant="interaction" onClick={testButtonClicks}>
            Test Button Clicks
          </TestButton>
        </TestSection>

        <TestSection title="Test Data">
          <TestButton variant="data" onClick={() => setTestGameState('default')}>
            Set Default Game State
          </TestButton>
          <TestButton variant="data" onClick={() => setTestGameState('midday')}>
            Set Midday Game State
          </TestButton>
          <TestButton variant="data" onClick={() => setTestAttributes('full')}>
            Set Full Attributes
          </TestButton>
          <TestButton variant="data" onClick={() => setTestAttributes('warning')}>
            Set Warning Attributes
          </TestButton>
        </TestSection>

        <TestResultsList results={results} onClear={clearResults} />
      </TestPanel>

      {/* TopSection Component */}
      <TopSection testLogs={testLogs} />
    </TestScreen>
  )
}







