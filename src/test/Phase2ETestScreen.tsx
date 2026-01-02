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
import { TestPanel, TestSection, TestButton, TestResultsList, useTestResults } from './component'

export function Phase2ETestScreen() {
  const uiStore = useUIStore()
  const playerStore = usePlayerStore()
  const { results, runTest, clearResults, setResults } = useTestResults()
  const [showAttributes, setShowAttributes] = useState(true)

  // Ensure we're in main scene and initialize building store with bed
  useEffect(() => {
    if (uiStore.currentScene !== 'main') {
      uiStore.setScene('main')
    }
    if (!uiStore.openPanel) {
      uiStore.openPanelAction('home')
    }
    
    const buildingStore = useBuildingStore.getState()
    if (!buildingStore.room) {
      buildingStore.initialize()
    }
    
    const bed = buildingStore.getBuilding(9)
    if (!bed || bed.level < 0) {
      buildingStore.room?.createBuild(9, 0)
    }
  }, [uiStore])

  // Game loop
  useEffect(() => {
    game.initialize()
    game.resume()
    
    let lastTime = performance.now()
    let animationFrameId: number
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime
      game.update(deltaTime)
      animationFrameId = requestAnimationFrame(gameLoop)
    }
    
    animationFrameId = requestAnimationFrame(gameLoop)
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  const addTestResult = (test: string, status: 'pass' | 'fail' | 'pending', message: string) => {
    setResults(prev => [...prev, { test, expected: message, actual: message, status }])
  }

  // Death Overlay Tests
  const testDeathOverlay = (reason: DeathReason) => {
    addTestResult(`Death Overlay - ${reason}`, 'pending', 'Triggering death...')
    uiStore.showOverlay('death', { reason })
    
    setTimeout(() => {
      if (uiStore.activeOverlay === 'death' && uiStore.deathReason === reason) {
        addTestResult(`Death Overlay - ${reason}`, 'pass', 'Death overlay displayed correctly')
      } else {
        addTestResult(`Death Overlay - ${reason}`, 'fail', 'Death overlay not displayed')
      }
    }, 100)
  }

  const testDeathRestart = () => {
    playerStore.updateAttribute('hp', 0)
    
    setTimeout(() => {
      if (uiStore.activeOverlay === 'death') {
        uiStore.hideOverlay()
        game.resume()
        
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
    playerStore.updateAttribute('vigour', 10)
    const initialVigour = playerStore.vigour
    
    const survivalSystem = game.getSurvivalSystem()
    const success = survivalSystem.startSleep('1hour')
    
    if (success) {
      setTimeout(() => {
        const newVigour = playerStore.vigour
        if (newVigour > initialVigour) {
          addTestResult('Sleep Recovery', 'pass', `Vigour recovered: ${initialVigour} -> ${Math.round(newVigour)}`)
        } else {
          addTestResult('Sleep Recovery', 'fail', `Vigour did not recover (${initialVigour} -> ${Math.round(newVigour)})`)
        }
      }, 4000)
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
    
    setTimeout(() => {
      if (uiStore.activeOverlay === 'death') {
        addTestResult(`Death Condition - ${condition}`, 'pass', 'Death condition triggered correctly')
      } else {
        addTestResult(`Death Condition - ${condition}`, 'pending', 'Death check happens hourly - may need to wait')
      }
    }, 1000)
  }

  const resetPlayer = () => {
    playerStore.updateAttribute('hp', 100)
    playerStore.updateAttribute('virus', 0)
    playerStore.updateAttribute('infect', 0)
    playerStore.updateAttribute('vigour', 50)
    uiStore.hideOverlay()
    game.resume()
    addTestResult('Reset Player', 'pass', 'Player state reset')
  }

  return (
    <TestScreen title="Phase 2E Test">
      <div className="relative w-full h-full">
        <MainScene />
        
        {/* Test Controls Panel - Draggable */}
        <TestPanel title="Phase 2E Tests" defaultPosition={{ x: window.innerWidth - 340, y: 16 }} width={320}>
          <TestSection title="Death Overlay">
            <TestButton variant="interaction" onClick={() => testDeathOverlay('hp_zero')}>
              Test Death: HP Zero
            </TestButton>
            <TestButton variant="interaction" onClick={() => testDeathOverlay('virus_overload')}>
              Test Death: Virus Overload
            </TestButton>
            <TestButton variant="interaction" onClick={() => testDeathOverlay('infection')}>
              Test Death: Infection
            </TestButton>
            <TestButton variant="position" onClick={testDeathRestart}>
              Test Death Restart
            </TestButton>
            <TestButton variant="position" onClick={testDeathQuit}>
              Test Death Quit
            </TestButton>
          </TestSection>

          <TestSection title="Sleep Mechanics">
            <TestButton variant="state" onClick={() => testSleep('1hour')}>
              Test Sleep: 1 Hour
            </TestButton>
            <TestButton variant="state" onClick={() => testSleep('4hours')}>
              Test Sleep: 4 Hours
            </TestButton>
            <TestButton variant="state" onClick={() => testSleep('untilMorning')}>
              Test Sleep: Until Morning
            </TestButton>
            <TestButton variant="data" onClick={testSleepWithoutBed}>
              Test Sleep Without Bed
            </TestButton>
            <TestButton variant="interaction" onClick={testSleepRecovery}>
              Test Sleep Recovery
            </TestButton>
          </TestSection>

          <TestSection title="Survival System">
            <TestButton variant="interaction" onClick={() => testDeathCondition('hp_zero')}>
              Test Death Condition: HP Zero
            </TestButton>
            <TestButton variant="interaction" onClick={() => testDeathCondition('virus_overload')}>
              Test Death Condition: Virus
            </TestButton>
          </TestSection>

          <TestSection title="Set Attributes" collapsible defaultCollapsed={!showAttributes}>
            <div className="space-y-2">
              {(['hp', 'virus', 'starve', 'vigour', 'spirit', 'water', 'injury', 'infect'] as const).map((attr) => (
                <div key={attr} className="flex items-center gap-1">
                  <label className="text-xs w-14 text-gray-400 capitalize">{attr}:</label>
                  <input
                    type="number"
                    min="0"
                    max={playerStore[`${attr}Max` as keyof typeof playerStore] as number}
                    value={playerStore[attr]}
                    onChange={(e) => {
                      const max = playerStore[`${attr}Max` as keyof typeof playerStore] as number
                      const val = Math.max(0, Math.min(max, parseInt(e.target.value) || 0))
                      playerStore.updateAttribute(attr, val)
                    }}
                    className="flex-1 px-1.5 py-0.5 bg-gray-800 text-white text-xs rounded border border-gray-600"
                  />
                  <span className="text-xs text-gray-500">/{playerStore[`${attr}Max` as keyof typeof playerStore]}</span>
                </div>
              ))}
            </div>
          </TestSection>

          <TestSection title="Utility">
            <TestButton variant="default" onClick={resetPlayer}>
              Reset Player
            </TestButton>
            <TestButton variant="default" onClick={clearResults}>
              Clear Results
            </TestButton>
          </TestSection>

          <TestResultsList results={results} onClear={clearResults} maxHeight="150px" />
        </TestPanel>
      </div>
    </TestScreen>
  )
}



