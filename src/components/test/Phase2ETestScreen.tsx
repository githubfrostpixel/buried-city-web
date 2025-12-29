/**
 * Phase 2E Test Screen
 * Test death overlay and sleep mechanics
 */

import { useState, useEffect } from 'react'
import { TestScreen } from './TestScreen'
import { MainScene } from '@/components/scenes/MainScene'
import { useUIStore } from '@/store/uiStore'
import { usePlayerStore } from '@/store/playerStore'
import { useBuildingStore } from '@/store/buildingStore'
import { game } from '@/game/Game'
import type { DeathReason } from '@/types/game.types'
import type { SleepDuration } from '@/game/systems/SurvivalSystem'

export function Phase2ETestScreen() {
  const uiStore = useUIStore()
  const playerStore = usePlayerStore()
  const [testResults, setTestResults] = useState<Array<{ test: string; status: 'pass' | 'fail' | 'pending'; message: string }>>([])

  // Ensure we're in main scene and initialize building store with bed
  useEffect(() => {
    if (uiStore.currentScene !== 'main') {
      uiStore.setScene('main')
    }
    if (!uiStore.openPanel) {
      uiStore.openPanelAction('home')
    }
    
    // Initialize building store if not already initialized
    const buildingStore = useBuildingStore.getState()
    if (!buildingStore.room) {
      buildingStore.initialize()
    }
    
    // Ensure bed (ID 9) exists at level 0 or higher for sleep tests
    const bed = buildingStore.getBuilding(9)
    if (!bed || bed.level < 0) {
      // Create bed at level 0 if it doesn't exist or is not built
      buildingStore.room?.createBuild(9, 0)
    }
  }, [uiStore])

  // Game loop - update game time every frame
  useEffect(() => {
    // Initialize game if not already initialized
    game.initialize()
    
    // Ensure game is not paused
    game.resume()
    
    let lastTime = performance.now()
    let animationFrameId: number
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000 // Convert to seconds
      lastTime = currentTime
      
      // Update game (this updates TimeManager and other systems)
      game.update(deltaTime)
      
      animationFrameId = requestAnimationFrame(gameLoop)
    }
    
    // Start game loop
    animationFrameId = requestAnimationFrame(gameLoop)
    
    // Cleanup on unmount
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  const addTestResult = (test: string, status: 'pass' | 'fail' | 'pending', message: string) => {
    setTestResults(prev => [...prev, { test, status, message }])
  }

  // Death Overlay Tests
  const testDeathOverlay = (reason: DeathReason) => {
    addTestResult(`Death Overlay - ${reason}`, 'pending', 'Triggering death...')
    
    // Manually trigger death overlay
    uiStore.showOverlay('death', { reason })
    
    // Check if overlay is shown
    setTimeout(() => {
      if (uiStore.activeOverlay === 'death' && uiStore.deathReason === reason) {
        addTestResult(`Death Overlay - ${reason}`, 'pass', 'Death overlay displayed correctly')
      } else {
        addTestResult(`Death Overlay - ${reason}`, 'fail', 'Death overlay not displayed')
      }
    }, 100)
  }

  const testDeathRestart = () => {
    // Set HP to 0 to trigger death
    playerStore.updateAttribute('hp', 0)
    
    // Wait a bit for death check
    setTimeout(() => {
      if (uiStore.activeOverlay === 'death') {
      // Test restart
      uiStore.hideOverlay()
      game.resume()
        
        // Check if game resumed
        setTimeout(() => {
          if (!game.getTimeManager().isPaused()) {
            addTestResult('Death Restart', 'pass', 'Restart button works correctly')
          } else {
            addTestResult('Death Restart', 'fail', 'Game did not resume')
          }
        }, 100)
      } else {
        addTestResult('Death Restart', 'fail', 'Death overlay not triggered')
      }
    }, 500)
  }

  const testDeathQuit = () => {
    // Trigger death
    uiStore.showOverlay('death', { reason: 'hp_zero' })
    
    setTimeout(() => {
      uiStore.hideOverlay()
      uiStore.setScene('menu')
      
      if (uiStore.currentScene === 'menu') {
        addTestResult('Death Quit', 'pass', 'Quit button works correctly')
      } else {
        addTestResult('Death Quit', 'fail', 'Did not navigate to menu')
      }
    }, 100)
  }

  // Sleep Mechanics Tests
  const testSleep = (duration: SleepDuration) => {
    addTestResult(`Sleep - ${duration}`, 'pending', 'Starting sleep...')
    
    const survivalSystem = game.getSurvivalSystem()
    const sleepState = survivalSystem.getSleepState()
    
    if (sleepState.isSleeping) {
      addTestResult(`Sleep - ${duration}`, 'fail', 'Already sleeping')
      return
    }
    
    const success = survivalSystem.startSleep(duration)
    
    if (success) {
      const newSleepState = survivalSystem.getSleepState()
      if (newSleepState.isSleeping) {
        addTestResult(`Sleep - ${duration}`, 'pass', `Sleep started successfully (${duration})`)
      } else {
        addTestResult(`Sleep - ${duration}`, 'fail', 'Sleep state not set')
      }
    } else {
      addTestResult(`Sleep - ${duration}`, 'fail', 'Sleep failed to start (check bed building)')
    }
  }

  const testSleepWithoutBed = () => {
    // Remove bed temporarily (if possible) or check if bed exists
    const buildingStore = useBuildingStore.getState()
    const bed = buildingStore.getBuilding(9)
    
    if (!bed || bed.level < 0) {
      const survivalSystem = game.getSurvivalSystem()
      const success = survivalSystem.startSleep('1hour')
      
      if (!success) {
        addTestResult('Sleep Without Bed', 'pass', 'Correctly prevented sleep without bed')
      } else {
        addTestResult('Sleep Without Bed', 'fail', 'Sleep allowed without bed')
      }
    } else {
      addTestResult('Sleep Without Bed', 'pending', 'Bed exists - cannot test this scenario')
    }
  }

  const testSleepRecovery = () => {
    // Set low vigour
    playerStore.updateAttribute('vigour', 10)
    const initialVigour = playerStore.vigour
    
    const survivalSystem = game.getSurvivalSystem()
    const success = survivalSystem.startSleep('1hour')
    
    if (success) {
      // Wait a bit for recovery
      setTimeout(() => {
        const newVigour = playerStore.vigour
        if (newVigour > initialVigour) {
          addTestResult('Sleep Recovery', 'pass', `Vigour recovered: ${initialVigour} → ${Math.round(newVigour)}`)
        } else {
          addTestResult('Sleep Recovery', 'fail', `Vigour did not recover (${initialVigour} → ${Math.round(newVigour)})`)
        }
      }, 4000) // Wait 4 seconds (sleep accelerates time)
    } else {
      addTestResult('Sleep Recovery', 'fail', 'Sleep failed to start')
    }
  }

  // Survival System Tests
  const testDeathCondition = (condition: DeathReason) => {
    addTestResult(`Death Condition - ${condition}`, 'pending', 'Testing death condition...')
    
    switch (condition) {
      case 'hp_zero':
        playerStore.updateAttribute('hp', 0)
        break
      case 'virus_overload':
        playerStore.updateAttribute('virus', playerStore.virusMax)
        break
      case 'infection':
        playerStore.updateAttribute('infect', playerStore.infectMax)
        playerStore.updateAttribute('hp', 0)
        break
      default:
        addTestResult(`Death Condition - ${condition}`, 'fail', 'Unknown death condition')
        return
    }
    
    // Wait for death check (happens hourly)
    setTimeout(() => {
      if (uiStore.activeOverlay === 'death') {
        addTestResult(`Death Condition - ${condition}`, 'pass', 'Death condition triggered correctly')
      } else {
        addTestResult(`Death Condition - ${condition}`, 'pending', 'Death check happens hourly - may need to wait')
      }
    }, 1000)
  }

  const resetPlayer = () => {
    // Reset to safe values
    playerStore.updateAttribute('hp', 100)
    playerStore.updateAttribute('virus', 0)
    playerStore.updateAttribute('infect', 0)
    playerStore.updateAttribute('vigour', 50)
    uiStore.hideOverlay()
    game.resume()
    addTestResult('Reset Player', 'pass', 'Player state reset')
  }

  const [showControls, setShowControls] = useState(true)
  const [showResults, setShowResults] = useState(true)
  const [showAttributes, setShowAttributes] = useState(true)

  return (
    <TestScreen title="Phase 2E Test Screen">
      <div className="relative w-full h-full">
        <MainScene />
        
        {/* Test Controls Panel - Collapsible, Right Side */}
        {showControls && (
          <div
            className="absolute top-4 right-4 bg-gray-900/95 text-white p-3 z-[10000] rounded shadow-lg"
            style={{ 
              width: '320px', 
              maxHeight: '90vh', 
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold">Phase 2E Tests</h2>
              <button
                onClick={() => setShowControls(false)}
                className="text-gray-400 hover:text-white text-lg leading-none"
                title="Hide Controls"
              >
                ×
              </button>
            </div>
          
            {/* Death Overlay Tests */}
            <div className="mb-3">
              <h3 className="text-xs font-semibold mb-1.5 text-gray-300">Death Overlay</h3>
              <div className="space-y-1">
              <button
                onClick={() => testDeathOverlay('hp_zero')}
                className="w-full px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
              >
                Test Death: HP Zero
              </button>
              <button
                onClick={() => testDeathOverlay('virus_overload')}
                className="w-full px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
              >
                Test Death: Virus Overload
              </button>
              <button
                onClick={() => testDeathOverlay('infection')}
                className="w-full px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
              >
                Test Death: Infection
              </button>
              <button
                onClick={testDeathRestart}
                className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
              >
                Test Death Restart
              </button>
              <button
                onClick={testDeathQuit}
                className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
              >
                Test Death Quit
              </button>
            </div>
          </div>

            {/* Sleep Mechanics Tests */}
            <div className="mb-3">
              <h3 className="text-xs font-semibold mb-1.5 text-gray-300">Sleep Mechanics</h3>
              <div className="space-y-1">
              <button
                onClick={() => testSleep('1hour')}
                className="w-full px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
              >
                Test Sleep: 1 Hour
              </button>
              <button
                onClick={() => testSleep('4hours')}
                className="w-full px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
              >
                Test Sleep: 4 Hours
              </button>
              <button
                onClick={() => testSleep('untilMorning')}
                className="w-full px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
              >
                Test Sleep: Until Morning
              </button>
              <button
                onClick={testSleepWithoutBed}
                className="w-full px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
              >
                Test Sleep Without Bed
              </button>
              <button
                onClick={testSleepRecovery}
                className="w-full px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
              >
                Test Sleep Recovery
              </button>
            </div>
          </div>

            {/* Survival System Tests */}
            <div className="mb-3">
              <h3 className="text-xs font-semibold mb-1.5 text-gray-300">Survival System</h3>
              <div className="space-y-1">
              <button
                onClick={() => testDeathCondition('hp_zero')}
                className="w-full px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
              >
                Test Death Condition: HP Zero
              </button>
              <button
                onClick={() => testDeathCondition('virus_overload')}
                className="w-full px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
              >
                Test Death Condition: Virus
              </button>
            </div>
          </div>

            {/* Attribute Controls */}
            <div className="mb-3 border-t border-gray-700 pt-3">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-semibold text-gray-300">Set Attributes</h3>
                <button
                  onClick={() => setShowAttributes(!showAttributes)}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  {showAttributes ? '▼' : '▶'}
                </button>
              </div>
              {showAttributes && (
              <div className="space-y-2">
                {/* HP */}
                <div className="flex items-center gap-1">
                  <label className="text-xs w-16 text-gray-400">HP:</label>
                  <input
                    type="number"
                    min="0"
                    max={playerStore.hpMax}
                    value={playerStore.hp}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(playerStore.hpMax, parseInt(e.target.value) || 0))
                      playerStore.updateAttribute('hp', val)
                    }}
                    className="flex-1 px-1.5 py-0.5 bg-gray-800 text-white text-xs rounded border border-gray-600"
                  />
                  <span className="text-xs text-gray-500">/{playerStore.hpMax}</span>
                </div>
                
                {/* Virus */}
                <div className="flex items-center gap-1">
                  <label className="text-xs w-16 text-gray-400">Virus:</label>
                  <input
                    type="number"
                    min="0"
                    max={playerStore.virusMax}
                    value={playerStore.virus}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(playerStore.virusMax, parseInt(e.target.value) || 0))
                      playerStore.updateAttribute('virus', val)
                    }}
                    className="flex-1 px-1.5 py-0.5 bg-gray-800 text-white text-xs rounded border border-gray-600"
                  />
                  <span className="text-xs text-gray-500">/{playerStore.virusMax}</span>
                </div>
                
                {/* Starve */}
                <div className="flex items-center gap-1">
                  <label className="text-xs w-16 text-gray-400">Starve:</label>
                  <input
                    type="number"
                    min="0"
                    max={playerStore.starveMax}
                    value={playerStore.starve}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(playerStore.starveMax, parseInt(e.target.value) || 0))
                      playerStore.updateAttribute('starve', val)
                    }}
                    className="flex-1 px-1.5 py-0.5 bg-gray-800 text-white text-xs rounded border border-gray-600"
                  />
                  <span className="text-xs text-gray-500">/{playerStore.starveMax}</span>
                </div>
                
                {/* Vigour */}
                <div className="flex items-center gap-1">
                  <label className="text-xs w-16 text-gray-400">Vigour:</label>
                  <input
                    type="number"
                    min="0"
                    max={playerStore.vigourMax}
                    value={playerStore.vigour}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(playerStore.vigourMax, parseInt(e.target.value) || 0))
                      playerStore.updateAttribute('vigour', val)
                    }}
                    className="flex-1 px-1.5 py-0.5 bg-gray-800 text-white text-xs rounded border border-gray-600"
                  />
                  <span className="text-xs text-gray-500">/{playerStore.vigourMax}</span>
                </div>
                
                {/* Spirit */}
                <div className="flex items-center gap-1">
                  <label className="text-xs w-16 text-gray-400">Spirit:</label>
                  <input
                    type="number"
                    min="0"
                    max={playerStore.spiritMax}
                    value={playerStore.spirit}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(playerStore.spiritMax, parseInt(e.target.value) || 0))
                      playerStore.updateAttribute('spirit', val)
                    }}
                    className="flex-1 px-1.5 py-0.5 bg-gray-800 text-white text-xs rounded border border-gray-600"
                  />
                  <span className="text-xs text-gray-500">/{playerStore.spiritMax}</span>
                </div>
                
                {/* Water */}
                <div className="flex items-center gap-1">
                  <label className="text-xs w-16 text-gray-400">Water:</label>
                  <input
                    type="number"
                    min="0"
                    max={playerStore.waterMax}
                    value={playerStore.water}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(playerStore.waterMax, parseInt(e.target.value) || 0))
                      playerStore.updateAttribute('water', val)
                    }}
                    className="flex-1 px-1.5 py-0.5 bg-gray-800 text-white text-xs rounded border border-gray-600"
                  />
                  <span className="text-xs text-gray-500">/{playerStore.waterMax}</span>
                </div>
                
                {/* Injury */}
                <div className="flex items-center gap-1">
                  <label className="text-xs w-16 text-gray-400">Injury:</label>
                  <input
                    type="number"
                    min="0"
                    max={playerStore.injuryMax}
                    value={playerStore.injury}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(playerStore.injuryMax, parseInt(e.target.value) || 0))
                      playerStore.updateAttribute('injury', val)
                    }}
                    className="flex-1 px-1.5 py-0.5 bg-gray-800 text-white text-xs rounded border border-gray-600"
                  />
                  <span className="text-xs text-gray-500">/{playerStore.injuryMax}</span>
                </div>
                
                {/* Infect */}
                <div className="flex items-center gap-1">
                  <label className="text-xs w-16 text-gray-400">Infect:</label>
                  <input
                    type="number"
                    min="0"
                    max={playerStore.infectMax}
                    value={playerStore.infect}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(playerStore.infectMax, parseInt(e.target.value) || 0))
                      playerStore.updateAttribute('infect', val)
                    }}
                    className="flex-1 px-1.5 py-0.5 bg-gray-800 text-white text-xs rounded border border-gray-600"
                  />
                  <span className="text-xs text-gray-500">/{playerStore.infectMax}</span>
                </div>
                
                {/* Quick Set Buttons */}
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => {
                      playerStore.updateAttribute('virus', Math.floor(playerStore.virusMax * 0.8))
                      addTestResult('Set Virus 80%', 'pass', `Virus set to ${Math.floor(playerStore.virusMax * 0.8)}`)
                    }}
                    className="flex-1 px-1.5 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
                    title="Set virus to 80% (high, should show warning)"
                  >
                    Virus 80%
                  </button>
                  <button
                    onClick={() => {
                      playerStore.updateAttribute('virus', Math.floor(playerStore.virusMax * 0.15))
                      addTestResult('Set Virus 15%', 'pass', `Virus set to ${Math.floor(playerStore.virusMax * 0.15)}`)
                    }}
                    className="flex-1 px-1.5 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                    title="Set virus to 15% (low, should not show warning)"
                  >
                    Virus 15%
                  </button>
                </div>
              </div>
              )}
            </div>

            {/* Utility */}
            <div className="mb-3 border-t border-gray-700 pt-3">
              <h3 className="text-xs font-semibold mb-1.5 text-gray-300">Utility</h3>
              <button
                onClick={resetPlayer}
                className="w-full px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
              >
                Reset Player
              </button>
              <button
                onClick={() => setTestResults([])}
                className="w-full px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs mt-1"
              >
                Clear Results
              </button>
            </div>

            {/* Test Results - Collapsible */}
            <div className="mt-3 border-t border-gray-700 pt-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold">Test Results</h3>
                <button
                  onClick={() => setShowResults(!showResults)}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  {showResults ? '▼' : '▶'}
                </button>
              </div>
              {showResults && (
                <div className="space-y-1 max-h-48 overflow-y-auto text-xs">
                  {testResults.length === 0 ? (
                    <p className="text-gray-400 text-xs">No tests run yet</p>
                  ) : (
                    testResults.slice(-10).map((result, index) => (
                      <div
                        key={index}
                        className={`p-1.5 rounded ${
                          result.status === 'pass'
                            ? 'bg-green-900/50'
                            : result.status === 'fail'
                            ? 'bg-red-900/50'
                            : 'bg-yellow-900/50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">
                            {result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⏳'}
                          </span>
                          <span className="font-semibold text-xs truncate">{result.test}</span>
                        </div>
                        <p className="text-gray-300 mt-0.5 text-xs">{result.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Show Controls Button - when hidden */}
        {!showControls && (
          <button
            onClick={() => setShowControls(true)}
            className="absolute top-4 right-4 bg-gray-900/95 text-white px-3 py-2 rounded z-[10000] hover:bg-gray-800 shadow-lg text-xs"
            title="Show Test Controls"
          >
            Show Tests
          </button>
        )}
      </div>
    </TestScreen>
  )
}

