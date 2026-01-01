/**
 * Test UI Home Scene
 * Test scene to verify HomePanel component
 */

import { TopBar } from '@/components/layout/TopBar'
import { BottomBar } from '@/components/layout/BottomBar'
import { HomePanelContent } from '@/components/panels/HomePanelContent'
import { useGameStore } from '@/store/gameStore'
import { usePlayerStore } from '@/store/playerStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useEffect } from 'react'

export function TestUIHome() {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const buildingStore = useBuildingStore()

  // Screen dimensions (640x1136 from original game)
  const screenWidth = 640
  const screenHeight = 1136

  // Sample log messages for testing
  const sampleLogs = [
    { txt: 'Welcome to Buried City!', timestamp: Date.now() - 10000 },
    { txt: 'You found some supplies in the ruins.', timestamp: Date.now() - 8000 },
    { txt: 'Your hunger is increasing. Find food soon!', timestamp: Date.now() - 5000 },
    { txt: 'A zombie approaches from the east!', timestamp: Date.now() - 3000 },
    { txt: 'You successfully defended yourself.', timestamp: Date.now() - 1000 },
  ]

  // Initialize test data
  useEffect(() => {
    // Set some test time
    gameStore.setTime(6 * 60 * 60 + 30 * 60) // 6:30 AM
    gameStore.setWeather(0) // Clear
    gameStore.setSeason(0) // Spring

    // Set test player data
    playerStore.setCurrency(1000)

    // Different attribute values for demo:
    playerStore.updateAttribute('hp', 90)        // 90% - high
    playerStore.updateAttribute('starve', 30)     // 30% - low (warning)
    playerStore.updateAttribute('vigour', 75)    // 75% - medium-high
    playerStore.updateAttribute('spirit', 50)    // 50% - medium
    playerStore.updateAttribute('water', 20)     // 20% - low (warning)
    playerStore.updateAttribute('injury', 60)    // 60% - medium (reverse, so shows 40% filled)
    playerStore.updateAttribute('infect', 80)    // 80% - high (reverse, so shows 20% filled)
    playerStore.updateAttribute('virus', 15)     // 15% - low (reverse, so shows 85% filled, warning)

    // Initialize building store if not already initialized
    if (!buildingStore.room) {
      buildingStore.initialize()
    }

    // Set some test building levels for demo
    // After initialization, we can manually set some buildings to different levels
    setTimeout(() => {
      // Example: Set building 1 (Toolbox) to level 0 (built)
      const building1 = buildingStore.getBuilding(1)
      if (building1 && building1.level < 0) {
        buildingStore.updateBuilding(1, { level: 0 })
      }

      // Set building 13 (Storage) to level 0 (built)
      const building13 = buildingStore.getBuilding(13)
      if (building13 && building13.level < 0) {
        buildingStore.updateBuilding(13, { level: 0 })
      }

      // Set building 14 (Gate) to level 0 (built) - for gate light effect
      const building14 = buildingStore.getBuilding(14)
      if (building14 && building14.level < 0) {
        buildingStore.updateBuilding(14, { level: 0 })
      }
    }, 100)
  }, [])

  return (
    <div
      className="relative"
      style={{
        width: `${screenWidth}px`,
        height: `${screenHeight}px`,
        margin: '0 auto',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        backgroundColor: '#000000' // Black background like original game
      }}
    >
      {/* Top Bar */}
      <TopBar testLogs={sampleLogs} />

      {/* Bottom Bar with HomePanel - fullScreen mode to fill entire bottom bar */}
      <BottomBar
        title="Home"
        leftBtn={false}
        rightBtn={false}
        fullScreen={true}
      >
        <HomePanelContent />
      </BottomBar>
    </div>
  )
}

