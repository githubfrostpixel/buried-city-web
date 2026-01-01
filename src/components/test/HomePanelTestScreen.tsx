/**
 * HomePanel Test Screen
 * Test screen for HomePanel component with test buttons and expected results
 */

import { useEffect } from 'react'
import { TestScreen } from './TestScreen'
import { HomePanelContent } from '@/components/panels/HomePanelContent'
import { useBuildingStore } from '@/store/buildingStore'
import { usePlayerStore } from '@/store/playerStore'
import { testBuildingLevels } from '@/test-utils/test-data'
import { TestPanel, TestSection, TestButton, TestResultsList, useTestResults } from './component'

// Building positions from HomePanel (Cocos coordinates)
const BUILDING_POSITIONS = [
  { bid: 1, pos: { x: 65, y: 230 } },
  { bid: 2, pos: { x: 425, y: 780 } },
  { bid: 18, pos: { x: 205, y: 165 } },
  { bid: 4, pos: { x: 477, y: 562 } },
  { bid: 5, pos: { x: 310, y: 330 } },
  { bid: 6, pos: { x: 75, y: 390 } },
  { bid: 15, pos: { x: 408, y: 677 } },
  { bid: 7, pos: { x: 250, y: 630 } },
  { bid: 8, pos: { x: 84, y: 780 } },
  { bid: 9, pos: { x: 75, y: 590 } },
  { bid: 10, pos: { x: 480, y: 410 } },
  { bid: 11, pos: { x: 436, y: 85 } },
  { bid: 13, pos: { x: 124, y: 49 } },
  { bid: 14, pos: { x: 425, y: 216 } },
  { bid: 16, pos: { x: 203, y: 290 } },
  { bid: 19, pos: { x: 436, y: 85 } },
  { bid: 17, pos: { x: 416, y: 108 } },
  { bid: 3, pos: { x: 545, y: 268 } },
  { bid: 12, pos: { x: 335, y: 125 } },
  { bid: 20, pos: { x: 196, y: 780 } },
  { bid: 21, pos: { x: 525, y: 674 } },
]

export function HomePanelTestScreen() {
  const buildingStore = useBuildingStore()
  const playerStore = usePlayerStore()
  const { results, runTest, addPendingTests, clearResults } = useTestResults()

  // Initialize building store if needed
  useEffect(() => {
    if (!buildingStore.room) {
      buildingStore.initialize()
    }
  }, [buildingStore])

  // Expected positions for HomePanel elements
  const expectedPositions = [
    {
      id: 'homepanel-bg',
      label: 'Home Background',
      expected: { x: 0, y: 0, width: 640, height: 1136 },
    },
  ]

  const testBackgroundPosition = () => {
    const bg = document.querySelector('[data-test-id="homepanel-bg"]')
    if (bg) {
      const rect = bg.getBoundingClientRect()
      const actual = `top: ${Math.round(rect.top)}px, left: ${Math.round(rect.left)}px`
      runTest('Background Position', 'Background positioned at bottom of content area', () => actual)
    }
  }

  const testBuildingPositions = () => {
    const tests = BUILDING_POSITIONS.map(({ bid, pos }) => {
      const building = buildingStore.getBuilding(bid)
      const level = building?.level ?? -1
      return {
        test: `Building ${bid} Position`,
        expected: `x: ${pos.x}px, y: ${pos.y}px (from bottom), level: ${level}`,
      }
    })
    addPendingTests(tests)
  }

  const testBuildingActiveStates = () => {
    BUILDING_POSITIONS.forEach(({ bid }) => {
      const building = buildingStore.getBuilding(bid)
      const level = building?.level ?? -1
      const isActive = level >= 0
      runTest(
        `Building ${bid} Active State`,
        `Building ${bid}: ${isActive ? 'Active' : 'Inactive'} (level: ${level})`,
        () => `Active: ${isActive}, Level: ${level}`
      )
    })
  }

  const testGateLightEffect = () => {
    const building14 = buildingStore.getBuilding(14)
    const level = building14?.level ?? -1
    const shouldShowLight = level >= 0
    
    runTest(
      'Gate Light Effect',
      `Gate light ${shouldShowLight ? 'visible' : 'hidden'} (building 14 level: ${level})`,
      () => `Building 14 level: ${level}, Light should be ${shouldShowLight ? 'visible' : 'hidden'}`
    )
  }

  const testBuildingClicks = () => {
    const buildingButtons = document.querySelectorAll('[data-test-id^="building-"]')
    const clickableCount = Array.from(buildingButtons).filter((btn) => {
      const style = window.getComputedStyle(btn)
      return style.pointerEvents !== 'none' && style.cursor === 'pointer'
    }).length
    
    runTest('Building Clicks', 'All active buildings are clickable', () => `${clickableCount} clickable building buttons found`)
  }

  const setTestBuildingLevels = (levels: typeof testBuildingLevels.allInactive) => {
    levels.forEach(({ bid, level }) => {
      const building = buildingStore.getBuilding(bid)
      if (building) {
        buildingStore.updateBuilding(bid, { level })
      }
    })
    
    setTimeout(() => {
      runTest('Set Building Levels', `Set ${levels.length} buildings to specified levels`, () => `Updated ${levels.length} buildings`)
    }, 100)
  }

  const testDogBuilding = () => {
    const building12 = buildingStore.getBuilding(12)
    const dog = playerStore.dog
    const isDogActive = dog.active && dog.hunger > 0 && dog.mood > 0 && dog.injury < dog.injuryMax
    const buildingActive = building12?.level !== undefined && building12.level >= 0
    const shouldBeActive = isDogActive && buildingActive
    
    runTest(
      'Dog Building Active State',
      `Building 12 should be ${shouldBeActive ? 'active' : 'inactive'} (dog active: ${isDogActive}, building level: ${building12?.level ?? -1})`,
      () => `Dog active: ${isDogActive}, Building level: ${building12?.level ?? -1}, Should be active: ${shouldBeActive}`
    )
  }

  const testBombBuilding = () => {
    const building17 = buildingStore.getBuilding(17)
    const isBombActive = (playerStore as unknown as { isBombActive?: boolean }).isBombActive ?? false
    const buildingActive = building17?.level !== undefined && building17.level >= 0
    const shouldBeActive = isBombActive && buildingActive
    
    runTest(
      'Bomb Building Active State',
      `Building 17 should be ${shouldBeActive ? 'active' : 'inactive'} (bomb active: ${isBombActive}, building level: ${building17?.level ?? -1})`,
      () => `Bomb active: ${isBombActive}, Building level: ${building17?.level ?? -1}, Should be active: ${shouldBeActive}`
    )
  }

  return (
    <TestScreen title="HomePanel Test" expectedPositions={expectedPositions}>
      {/* Test Controls Panel - Draggable */}
      <TestPanel title="Test Controls" defaultPosition={{ x: 16, y: 16 }} width={280}>
        <TestSection title="Position Tests">
          <TestButton variant="position" onClick={testBackgroundPosition}>
            Test Background Position
          </TestButton>
          <TestButton variant="position" onClick={testBuildingPositions}>
            Test Building Positions
          </TestButton>
        </TestSection>

        <TestSection title="State Tests">
          <TestButton variant="state" onClick={testBuildingActiveStates}>
            Test Building Active States
          </TestButton>
          <TestButton variant="state" onClick={testGateLightEffect}>
            Test Gate Light Effect
          </TestButton>
          <TestButton variant="state" onClick={testDogBuilding}>
            Test Dog Building (12)
          </TestButton>
          <TestButton variant="state" onClick={testBombBuilding}>
            Test Bomb Building (17)
          </TestButton>
        </TestSection>

        <TestSection title="Interaction Tests">
          <TestButton variant="interaction" onClick={testBuildingClicks}>
            Test Building Clicks
          </TestButton>
        </TestSection>

        <TestSection title="Test Data">
          <TestButton variant="data" onClick={() => setTestBuildingLevels(testBuildingLevels.allInactive)}>
            Set All Buildings Inactive
          </TestButton>
          <TestButton variant="data" onClick={() => setTestBuildingLevels(testBuildingLevels.allLevel0)}>
            Set All Buildings Level 0
          </TestButton>
          <TestButton variant="data" onClick={() => setTestBuildingLevels(testBuildingLevels.allLevel1)}>
            Set All Buildings Level 1
          </TestButton>
          <TestButton variant="data" onClick={() => setTestBuildingLevels(testBuildingLevels.allLevel2)}>
            Set All Buildings Level 2
          </TestButton>
          <TestButton variant="data" onClick={() => setTestBuildingLevels(testBuildingLevels.mixed)}>
            Set Mixed Building Levels
          </TestButton>
        </TestSection>

        <TestResultsList results={results} onClear={clearResults} />
      </TestPanel>

      {/* HomePanel Component - wrapped in BottomBar content area */}
      <div 
        className="absolute inset-0"
        style={{
          top: '272px',
          left: '22px',
          width: '596px',
          height: '758px',
          overflow: 'hidden'
        }}
        data-test-id="homepanel-container"
      >
        <div className="absolute inset-0 flex flex-col" style={{ overflow: 'hidden' }}>
          <HomePanelContent />
        </div>
      </div>
    </TestScreen>
  )
}

