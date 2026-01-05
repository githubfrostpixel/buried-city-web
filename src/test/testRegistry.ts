/**
 * Test Registry
 * Simple array-based registry for all test screens
 * 
 * To add a new test:
 * 1. Create your TestScreen component in src/components/test/
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
const TopSectionTestScreen = lazy(() => import('./TopSectionTestScreen').then(m => ({ default: m.TopSectionTestScreen })))
const BottomSectionTestScreen = lazy(() => import('./BottomSectionTestScreen').then(m => ({ default: m.BottomSectionTestScreen })))
const HomePanelTestScreen = lazy(() => import('./HomePanelTestScreen').then(m => ({ default: m.HomePanelTestScreen })))
const MainSceneTestScreen = lazy(() => import('./MainSceneTestScreen').then(m => ({ default: m.MainSceneTestScreen })))
const Phase2ETestScreen = lazy(() => import('./Phase2ETestScreen').then(m => ({ default: m.Phase2ETestScreen })))
const WeatherSystemTestScreen = lazy(() => import('./WeatherSystemTestScreen').then(m => ({ default: m.WeatherSystemTestScreen })))
const SiteSystemTestScreen = lazy(() => import('./SiteSystemTestScreen').then(m => ({ default: m.SiteSystemTestScreen })))
const MapSystemTestScreen = lazy(() => import('./MapSystemTestScreen').then(m => ({ default: m.MapSystemTestScreen })))
const BattleSystemTestScreen = lazy(() => import('./BattleSystemTestScreen').then(m => ({ default: m.BattleSystemTestScreen })))

export const testRegistry: TestEntry[] = [
  {
    id: 'topbar',
    name: 'TopSection Test',
    description: 'Test TopSection component positions, scaling, and interactions',
    component: TopSectionTestScreen,
    color: 'blue',
  },
  {
    id: 'bottombar',
    name: 'BottomSection Test',
    description: 'Test BottomSection component positions and panel switching',
    component: BottomSectionTestScreen,
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
    description: 'Test MainScene integration with TopSection and BottomSection',
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
  {
    id: 'site',
    name: 'Site System Test',
    description: 'Test site exploration, room generation, and secret rooms',
    component: SiteSystemTestScreen,
    color: 'orange',
  },
  {
    id: 'map',
    name: 'Map System Test',
    description: 'Test map system, site unlocking, position management, and save/restore',
    component: MapSystemTestScreen,
    color: 'red',
  },
  {
    id: 'battle',
    name: 'Battle System Test',
    description: 'Test battle system, combat mechanics, weapons, and battle UI',
    component: BattleSystemTestScreen,
    color: 'pink',
  },
]

// Helper to get test by id
export function getTestById(id: string): TestEntry | undefined {
  return testRegistry.find(test => test.id === id)
}

