/**
 * Test Registry
 * Simple array-based registry for all test screens
 * 
 * To add a new test:
 * 1. Create your TestScreen component in src/test/
 * 2. Import it here
 * 3. Add entry to testRegistry array
 */

import { lazy, ComponentType } from 'react'

export interface TestEntry {
  id: string
  name: string
  description: string
  component: ComponentType
  color?: string
}

// Lazy load test components for better performance
const TopBarTestScreen = lazy(() => import('./TopBarTestScreen').then(m => ({ default: m.TopBarTestScreen })))
const BottomBarTestScreen = lazy(() => import('./BottomBarTestScreen').then(m => ({ default: m.BottomBarTestScreen })))
const HomePanelTestScreen = lazy(() => import('./HomePanelTestScreen').then(m => ({ default: m.HomePanelTestScreen })))
const MainSceneTestScreen = lazy(() => import('./MainSceneTestScreen').then(m => ({ default: m.MainSceneTestScreen })))
const Phase2ETestScreen = lazy(() => import('./Phase2ETestScreen').then(m => ({ default: m.Phase2ETestScreen })))
const WeatherSystemTestScreen = lazy(() => import('./WeatherSystemTestScreen').then(m => ({ default: m.WeatherSystemTestScreen })))

export const testRegistry: TestEntry[] = [
  {
    id: 'topbar',
    name: 'TopBar Test',
    description: 'Test TopBar component positions, scaling, and interactions',
    component: TopBarTestScreen,
    color: 'blue',
  },
  {
    id: 'bottombar',
    name: 'BottomBar Test',
    description: 'Test BottomBar component positions and panel switching',
    component: BottomBarTestScreen,
    color: 'green',
  },
  {
    id: 'homepanel',
    name: 'HomePanel Test',
    description: 'Test HomePanel building positions and interactions',
    component: HomePanelTestScreen,
    color: 'purple',
  },
  {
    id: 'mainscene',
    name: 'MainScene Test',
    description: 'Test MainScene integration with TopBar and BottomBar',
    component: MainSceneTestScreen,
    color: 'yellow',
  },
  {
    id: 'phase2e',
    name: 'Phase 2E Test',
    description: 'Test death overlay and sleep mechanics',
    component: Phase2ETestScreen,
    color: 'indigo',
  },
  {
    id: 'weather',
    name: 'Weather System Test',
    description: 'Test weather system functionality and effects',
    component: WeatherSystemTestScreen,
    color: 'teal',
  },
]

// Helper to get test by id
export function getTestById(id: string): TestEntry | undefined {
  return testRegistry.find(test => test.id === id)
}



