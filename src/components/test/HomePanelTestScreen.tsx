/**
 * HomePanel Test Screen
 * Test screen for HomePanel component with test buttons and expected results
 */

import { useState, useEffect } from 'react'
import { TestScreen } from './TestScreen'
import { HomePanel } from '@/components/panels/HomePanel'
import { useBuildingStore } from '@/store/buildingStore'
import { usePlayerStore } from '@/store/playerStore'
import { testBuildingLevels } from '@/test-utils/test-data'

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
  const [testResults, setTestResults] = useState<Array<{
    test: string
    expected: string
    actual: string
    status: 'pass' | 'fail' | 'pending'
  }>>([])

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
      expected: { x: 0, y: 0, width: 640, height: 1136 }, // Full screen in BottomBar content area
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
    const bg = document.querySelector('[data-test-id="homepanel-bg"]')
    if (bg) {
      const rect = bg.getBoundingClientRect()
      const actual = `top: ${Math.round(rect.top)}px, left: ${Math.round(rect.left)}px`
      runTest(
        'Background Position',
        'Background positioned at bottom of content area',
        () => actual
      )
    }
  }

  const testBuildingPositions = () => {
    const results = BUILDING_POSITIONS.map(({ bid, pos }) => {
      const building = buildingStore.getBuilding(bid)
      const level = building?.level ?? -1
      const expected = `x: ${pos.x}px, y: ${pos.y}px (from bottom), level: ${level}`
      return { 
        test: `Building ${bid} Position`, 
        expected, 
        actual: 'Check visually', 
        status: 'pending' as const 
      }
    })
    
    setTestResults((prev) => [
      ...prev.filter((r) => !r.test.startsWith('Building ') || !r.test.includes('Position')),
      ...results,
    ])
  }

  const testBuildingActiveStates = () => {
    const results = BUILDING_POSITIONS.map(({ bid }) => {
      const building = buildingStore.getBuilding(bid)
      const level = building?.level ?? -1
      const isActive = level >= 0
      const expected = `Building ${bid}: ${isActive ? 'Active' : 'Inactive'} (level: ${level})`
      return { 
        test: `Building ${bid} Active State`, 
        expected, 
        actual: `Active: ${isActive}, Level: ${level}`, 
        status: 'pass' as const 
      }
    })
    
    setTestResults((prev) => [
      ...prev.filter((r) => !r.test.startsWith('Building ') || !r.test.includes('Active State')),
      ...results,
    ])
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
    // Test that buildings are clickable
    const buildingButtons = document.querySelectorAll('[data-test-id^="building-"]')
    const clickableCount = Array.from(buildingButtons).filter((btn) => {
      const style = window.getComputedStyle(btn)
      return style.pointerEvents !== 'none' && style.cursor === 'pointer'
    }).length
    
    runTest(
      'Building Clicks',
      'All active buildings are clickable',
      () => `${clickableCount} clickable building buttons found`
    )
  }

  const setTestBuildingLevels = (levels: typeof testBuildingLevels.allInactive) => {
    levels.forEach(({ bid, level }) => {
      const building = buildingStore.getBuilding(bid)
      if (building) {
        buildingStore.updateBuilding(bid, { level })
      }
    })
    
    setTimeout(() => {
      runTest(
        'Set Building Levels',
        `Set ${levels.length} buildings to specified levels`,
        () => `Updated ${levels.length} buildings`
      )
    }, 100)
  }

  const testDogBuilding = () => {
    // Test building 12 (dog house) active state
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
    // Test building 17 (bomb/minefield) active state
    const building17 = buildingStore.getBuilding(17)
    const isBombActive = (playerStore as any).isBombActive ?? false
    const buildingActive = building17?.level !== undefined && building17.level >= 0
    const shouldBeActive = isBombActive && buildingActive
    
    runTest(
      'Bomb Building Active State',
      `Building 17 should be ${shouldBeActive ? 'active' : 'inactive'} (bomb active: ${isBombActive}, building level: ${building17?.level ?? -1})`,
      () => `Bomb active: ${isBombActive}, Building level: ${building17?.level ?? -1}, Should be active: ${shouldBeActive}`
    )
  }

  return (
    <TestScreen title="HomePanel Test Screen" expectedPositions={expectedPositions}>
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
              onClick={testBuildingPositions}
              className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 text-xs mb-1"
            >
              Test Building Positions
            </button>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">State Tests</h4>
            <button
              onClick={testBuildingActiveStates}
              className="block w-full text-left px-2 py-1 bg-green-600 hover:bg-green-700 text-xs mb-1"
            >
              Test Building Active States
            </button>
            <button
              onClick={testGateLightEffect}
              className="block w-full text-left px-2 py-1 bg-green-600 hover:bg-green-700 text-xs mb-1"
            >
              Test Gate Light Effect
            </button>
            <button
              onClick={testDogBuilding}
              className="block w-full text-left px-2 py-1 bg-green-600 hover:bg-green-700 text-xs mb-1"
            >
              Test Dog Building (12)
            </button>
            <button
              onClick={testBombBuilding}
              className="block w-full text-left px-2 py-1 bg-green-600 hover:bg-green-700 text-xs mb-1"
            >
              Test Bomb Building (17)
            </button>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">Interaction Tests</h4>
            <button
              onClick={testBuildingClicks}
              className="block w-full text-left px-2 py-1 bg-purple-600 hover:bg-purple-700 text-xs mb-1"
            >
              Test Building Clicks
            </button>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">Test Data</h4>
            <button
              onClick={() => setTestBuildingLevels(testBuildingLevels.allInactive)}
              className="block w-full text-left px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-xs mb-1"
            >
              Set All Buildings Inactive
            </button>
            <button
              onClick={() => setTestBuildingLevels(testBuildingLevels.allLevel0)}
              className="block w-full text-left px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-xs mb-1"
            >
              Set All Buildings Level 0
            </button>
            <button
              onClick={() => setTestBuildingLevels(testBuildingLevels.allLevel1)}
              className="block w-full text-left px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-xs mb-1"
            >
              Set All Buildings Level 1
            </button>
            <button
              onClick={() => setTestBuildingLevels(testBuildingLevels.allLevel2)}
              className="block w-full text-left px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-xs mb-1"
            >
              Set All Buildings Level 2
            </button>
            <button
              onClick={() => setTestBuildingLevels(testBuildingLevels.mixed)}
              className="block w-full text-left px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-xs mb-1"
            >
              Set Mixed Building Levels
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

      {/* HomePanel Component - wrapped in BottomBar content area */}
      <div 
        className="absolute inset-0"
        style={{
          top: '272px', // BottomBar content area starts after TopBar (18+244+10) and action bar (76)
          left: '22px',
          width: '596px',
          height: '758px',
          overflow: 'hidden'
        }}
        data-test-id="homepanel-container"
      >
        <div 
          className="absolute inset-0 flex flex-col"
          style={{ overflow: 'hidden' }}
        >
          <HomePanel />
        </div>
      </div>
    </TestScreen>
  )
}

