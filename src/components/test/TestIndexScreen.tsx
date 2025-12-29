/**
 * Test Index Screen
 * Main entry point for all test screens
 */

import { useState } from 'react'
import { TopBarTestScreen } from './TopBarTestScreen'
import { BottomBarTestScreen } from './BottomBarTestScreen'
import { HomePanelTestScreen } from './HomePanelTestScreen'
import { MainSceneTestScreen } from './MainSceneTestScreen'
import { Phase2ETestScreen } from './Phase2ETestScreen'

type TestScreenType = 'index' | 'topbar' | 'bottombar' | 'homepanel' | 'mainscene' | 'phase2e'

export function TestIndexScreen() {
  const [currentTest, setCurrentTest] = useState<TestScreenType>('index')

  if (currentTest === 'topbar') {
    return <TopBarTestScreen />
  }

  if (currentTest === 'bottombar') {
    return <BottomBarTestScreen />
  }

  if (currentTest === 'homepanel') {
    return <HomePanelTestScreen />
  }

  if (currentTest === 'mainscene') {
    return <MainSceneTestScreen />
  }

  if (currentTest === 'phase2e') {
    return <Phase2ETestScreen />
  }

  return (
    <div className="w-full h-full bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Phase 2D.6 Test Screens</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Available Test Screens</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentTest('topbar')}
              className="p-4 bg-blue-600 hover:bg-blue-700 rounded text-left"
            >
              <h3 className="font-bold">TopBar Test Screen</h3>
              <p className="text-sm text-gray-300 mt-1">
                Test TopBar component positions, scaling, and interactions
              </p>
            </button>
            
            <button
              onClick={() => setCurrentTest('bottombar')}
              className="p-4 bg-green-600 hover:bg-green-700 rounded text-left"
            >
              <h3 className="font-bold">BottomBar Test Screen</h3>
              <p className="text-sm text-gray-300 mt-1">
                Test BottomBar component positions and panel switching
              </p>
            </button>
            
            <button
              onClick={() => setCurrentTest('homepanel')}
              className="p-4 bg-purple-600 hover:bg-purple-700 rounded text-left"
            >
              <h3 className="font-bold">HomePanel Test Screen</h3>
              <p className="text-sm text-gray-300 mt-1">
                Test HomePanel building positions and interactions
              </p>
            </button>
            
            <button
              onClick={() => setCurrentTest('mainscene')}
              className="p-4 bg-yellow-600 hover:bg-yellow-700 rounded text-left"
            >
              <h3 className="font-bold">MainScene Test Screen</h3>
              <p className="text-sm text-gray-300 mt-1">
                Test MainScene integration with TopBar and BottomBar
              </p>
            </button>
            
            <button
              onClick={() => setCurrentTest('phase2e')}
              className="p-4 bg-indigo-600 hover:bg-indigo-700 rounded text-left"
            >
              <h3 className="font-bold">Phase 2E Test Screen</h3>
              <p className="text-sm text-gray-300 mt-1">
                Test death overlay and sleep mechanics
              </p>
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Instructions</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Select a test screen from above</li>
            <li>Use the test controls panel (top-right) to toggle position overlay</li>
            <li>Click test buttons to run automated tests</li>
            <li>Review expected vs actual results</li>
            <li>Check visual appearance matches original game</li>
            <li>Document any discrepancies found</li>
          </ul>
        </div>

        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            ← Back to Game
          </button>
        </div>
      </div>
    </div>
  )
}

