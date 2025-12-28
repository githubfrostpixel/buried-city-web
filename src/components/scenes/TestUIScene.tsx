/**
 * Test UI Scene
 * Test scene to verify TopBar and BottomBar components
 */

import { TopBar } from '@/components/layout/TopBar'
import { BottomBar } from '@/components/layout/BottomBar'
import { useGameStore } from '@/store/gameStore'
import { usePlayerStore } from '@/store/playerStore'
import { useEffect } from 'react'

export function TestUIScene() {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  
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
  
  // Initialize some test data with different values for demo
  useEffect(() => {
    // Set some test time
    gameStore.setTime(6 * 60 * 60 + 30 * 60) // 6:30 AM
    gameStore.setWeather(0) // Clear
    gameStore.setSeason(0) // Spring
    
    // Set test player data with different values to demo progress bars
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
  }, [])
  
  return (
    <div
      className="relative bg-gray-900"
      style={{
        width: `${screenWidth}px`,
        height: `${screenHeight}px`,
        margin: '0 auto',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Bar */}
      <TopBar testLogs={sampleLogs} />
      
      {/* Bottom Bar with test content */}
      <BottomBar
        title="Test UI"
        leftBtn={true}
        rightBtn={true}
        onLeftClick={() => console.log('Left button clicked')}
        onRightClick={() => console.log('Right button clicked')}
      >
        <div className="p-4 text-white">
          <h2 className="text-xl font-bold mb-4">UI Test Scene</h2>
          <div className="space-y-2 text-sm">
            <p>Day: {gameStore.day + 1}</p>
            <p>Time: {gameStore.hour}:{gameStore.minute.toString().padStart(2, '0')}</p>
            <p>Season: {['Spring', 'Summer', 'Autumn', 'Winter'][gameStore.season]}</p>
            <p>Weather: {['Clear', 'Cloudy', 'Rain', 'Snow', 'Storm'][gameStore.weather]}</p>
            <p>Currency: {playerStore.currency}</p>
            <p>HP: {playerStore.hp} / {playerStore.hpMax}</p>
            <p>Hunger: {playerStore.starve} / {playerStore.starveMax}</p>
            <p>Energy: {playerStore.vigour} / {playerStore.vigourMax}</p>
          </div>
        </div>
      </BottomBar>
    </div>
  )
}

