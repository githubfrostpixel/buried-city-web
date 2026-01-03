/**
 * Weather System Test Screen
 * Test screen for Weather System functionality
 */

import { useState, useEffect } from 'react'
import { TestScreen } from './TestScreen'
import { TopBar } from '@/components/layout/TopBar'
import { useGameStore } from '@/store/gameStore'
import { usePlayerStore } from '@/store/playerStore'
import { weatherSystemConfig } from '@/data/weather'
import { WeatherSystem } from '@/game/systems/WeatherSystem'
import { game } from '@/game/Game'
import type { WeatherType, Season } from '@/types/game.types'
import { TestPanel, TestSection, TestButton, TestResultsList, useTestResults } from './component'

const WEATHER_NAMES = ['Cloudy', 'Clear', 'Rain', 'Snow', 'Storm']
const SEASON_NAMES = ['Autumn', 'Winter', 'Spring', 'Summer']

export function WeatherSystemTestScreen() {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const { results, runTest, clearResults } = useTestResults()
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Initialize game and start timer loop
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

  // Auto-refresh state
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      gameStore.weather
      gameStore.weatherForecast
    }, 1000)
    return () => clearInterval(interval)
  }, [autoRefresh, gameStore])

  const testWeatherState = () => {
    const ws = gameStore.weatherSystem
    const weatherId = ws.getCurrentWeather()
    const forecast = ws.getForecast()
    const config = ws.getWeatherConfig()
    
    runTest(
      'Weather System State',
      'Weather system initialized correctly',
      () => `Weather: ${WEATHER_NAMES[weatherId]}, Forecast: ${forecast}, Config: ${JSON.stringify(config).substring(0, 50)}...`
    )
  }

  const testWeatherChange = async () => {
    const initialWeather = gameStore.weather
    const initialVigour = playerStore.vigour
    const initialSpirit = playerStore.spirit
    
    gameStore.setWeather(1)
    
    const { game } = await import('@/game/Game')
    const survivalSystem = game.getSurvivalSystem()
    survivalSystem.applyWeatherEffects()
    
    setTimeout(() => {
      const newWeather = gameStore.weather
      const newVigour = playerStore.vigour
      const newSpirit = playerStore.spirit
      
      runTest(
        'Weather Change',
        'Weather changes and effects apply',
        () => `Weather: ${WEATHER_NAMES[initialWeather]} -> ${WEATHER_NAMES[newWeather]}, Vigour: ${initialVigour} -> ${newVigour}, Spirit: ${initialSpirit} -> ${newSpirit}`
      )
      
      gameStore.setWeather(initialWeather)
      survivalSystem.applyWeatherEffects()
    }, 100)
  }

  const testWeatherCheck = () => {
    const initialWeather = gameStore.weather
    const day = gameStore.day
    
    gameStore.setWeather(0)
    
    setTimeout(() => {
      const dayInCycle = (day + 1) % 120
      const tomorrowSeason = Math.floor(dayInCycle / 30) as Season
      
      gameStore.weatherSystem.checkWeather(tomorrowSeason, day)
      gameStore.updateWeather()
      
      setTimeout(() => {
        const newWeather = gameStore.weather
        runTest(
          'Weather Check',
          'Weather check rolls new weather based on season',
          () => `Season: ${SEASON_NAMES[tomorrowSeason]}, Weather: ${WEATHER_NAMES[initialWeather]} -> ${WEATHER_NAMES[newWeather]}`
        )
      }, 100)
    }, 100)
  }

  const testWeatherEffects = () => {
    const ws = gameStore.weatherSystem
    const config = ws.getWeatherConfig()
    
    const effects: string[] = []
    if (config.vigour !== undefined) effects.push(`Vigour: ${config.vigour}`)
    if (config.spirit !== undefined) effects.push(`Spirit: ${config.spirit}`)
    if (config.temperature !== undefined) effects.push(`Temperature: ${config.temperature}`)
    if (config.speed !== undefined) effects.push(`Speed: ${config.speed}`)
    if (config.gun_precise !== undefined) effects.push(`Gun Accuracy: ${config.gun_precise}`)
    if (config.monster_speed !== undefined) effects.push(`Monster Speed: ${config.monster_speed}`)
    
    runTest(
      'Weather Effects',
      'Weather effects are accessible',
      () => effects.length > 0 ? effects.join(', ') : 'No effects (Clear weather)'
    )
  }

  const testWeatherForecast = () => {
    const forecast = gameStore.weatherForecast
    const ws = gameStore.weatherSystem
    const saveData = ws.save()
    
    const isValidForecast = WEATHER_NAMES.includes(forecast)
    const tomorrowDisplay = saveData.Tomorrow.map((w: number) => WEATHER_NAMES[w]).join(', ')
    
    runTest(
      'Weather Forecast',
      'Forecast is generated correctly',
      () => isValidForecast 
        ? `Forecast: "${forecast}", Tomorrow: [${tomorrowDisplay}]` 
        : `Forecast invalid: "${forecast}", Tomorrow: [${tomorrowDisplay}]`
    )
  }

  const testWeatherSaveLoad = () => {
    const ws = gameStore.weatherSystem
    const saveData = ws.save()
    
    const testWS = new WeatherSystem()
    testWS.restore(saveData)
    
    const restoredWeather = testWS.getCurrentWeather()
    const restoredForecast = testWS.getForecast()
    const restoredSave = testWS.save()
    
    const matches = 
      restoredWeather === saveData.weatherId &&
      restoredForecast === saveData.Random &&
      JSON.stringify(restoredSave.Tomorrow) === JSON.stringify(saveData.Tomorrow) &&
      restoredSave.lastDays === saveData.lastDays &&
      restoredSave.aa === saveData.aa
    
    runTest(
      'Weather Save/Load',
      'Weather state saves and restores correctly',
      () => matches ? 'Save/Load successful' : 'Save/Load failed'
    )
  }

  const testWeatherDuration = () => {
    gameStore.setWeather(2)
    const ws = gameStore.weatherSystem
    
    const saveData = ws.save()
    saveData.lastDays = 1
    ws.restore(saveData)
    
    const season = gameStore.season
    const day = gameStore.day
    ws.checkWeather(season, day)
    gameStore.updateWeather()
    
    setTimeout(() => {
      const newSave = ws.save()
      runTest(
        'Weather Duration',
        'Weather duration increments correctly',
        () => `lastDays: ${saveData.lastDays} -> ${newSave.lastDays} (should be 2, weather should change when >= 2)`
      )
    }, 100)
  }

  const getWeatherSystemState = () => {
    const ws = gameStore.weatherSystem
    const saveData = ws.save()
    return {
      weatherId: saveData.weatherId,
      weatherName: WEATHER_NAMES[saveData.weatherId],
      Tomorrow: saveData.Tomorrow,
      Random: saveData.Random,
      lastDays: saveData.lastDays,
      aa: saveData.aa,
      config: ws.getWeatherConfig()
    }
  }

  const getSeasonWeights = (season: Season) => {
    const seasonKey = season.toString()
    return weatherSystemConfig[seasonKey] || []
  }

  return (
    <TestScreen title="Weather System Test" expectedPositions={[]}>
      {/* TopBar at the top */}
      <TopBar />
      
      {/* Test Controls Panel - Draggable */}
      <TestPanel title="Weather Tests" defaultPosition={{ x: 16, y: 280 }} width={380}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs">Auto Refresh</span>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-2 py-1 text-xs rounded ${autoRefresh ? 'bg-green-600' : 'bg-gray-600'}`}
          >
            {autoRefresh ? 'ON' : 'OFF'}
          </button>
        </div>

        <TestSection title="State Tests">
          <TestButton variant="position" onClick={testWeatherState}>
            Test Weather State
          </TestButton>
          <TestButton variant="position" onClick={testWeatherForecast}>
            Test Weather Forecast
          </TestButton>
          <TestButton variant="position" onClick={testWeatherEffects}>
            Test Weather Effects
          </TestButton>
        </TestSection>

        <TestSection title="Functionality Tests">
          <TestButton variant="state" onClick={testWeatherChange}>
            Test Weather Change
          </TestButton>
          <TestButton variant="state" onClick={testWeatherCheck}>
            Test Weather Check (Roll New)
          </TestButton>
          <TestButton variant="state" onClick={testWeatherDuration}>
            Test Weather Duration
          </TestButton>
          <TestButton variant="state" onClick={testWeatherSaveLoad}>
            Test Save/Load
          </TestButton>
        </TestSection>

        <TestSection title="Manual Controls">
          <div className="grid grid-cols-3 gap-1 mb-2">
            {[0, 1, 2, 3, 4].map((weatherId) => (
              <button
                key={weatherId}
                onClick={async () => {
                  gameStore.setWeather(weatherId as WeatherType)
                  const { game } = await import('@/game/Game')
                  const survivalSystem = game.getSurvivalSystem()
                  survivalSystem.applyWeatherEffects()
                }}
                className={`px-2 py-1 text-xs rounded ${
                  gameStore.weather === weatherId
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {WEATHER_NAMES[weatherId]}
              </button>
            ))}
          </div>
          <TestButton variant="interaction" onClick={() => {
            const season = gameStore.season
            const day = gameStore.day
            const dayInCycle = (day + 1) % 120
            const tomorrowSeason = Math.floor(dayInCycle / 30) as Season
            gameStore.weatherSystem.checkWeather(tomorrowSeason, day)
            gameStore.updateWeather()
          }}>
            Trigger Weather Check
          </TestButton>
          <TestButton variant="interaction" onClick={() => {
            const ws = gameStore.weatherSystem
            ws.changeWeather(0, false)
            gameStore.updateWeather()
          }}>
            Reset to Clear
          </TestButton>
        </TestSection>

        <TestSection title="Time Controls">
          <TestButton variant="data" onClick={() => game.getTimeManager().updateTime(1 * 60 * 60)}>
            Skip 1 Hour
          </TestButton>
          <TestButton variant="data" onClick={() => game.getTimeManager().updateTime(6 * 60 * 60)}>
            Skip 6 Hours
          </TestButton>
          <TestButton variant="data" onClick={() => game.getTimeManager().skipStage()}>
            Skip to Next Day/Night
          </TestButton>
          <TestButton variant="data" onClick={() => game.getTimeManager().updateTime(24 * 60 * 60)}>
            Skip 1 Day (Triggers Weather Check)
          </TestButton>
        </TestSection>

        <TestResultsList results={results} onClear={clearResults} maxHeight="120px" />
      </TestPanel>

      {/* Weather State Display Panel - Draggable */}
      <TestPanel title="Weather State" defaultPosition={{ x: window.innerWidth - 520, y: 280 }} width={480}>
        <div className="space-y-3 text-xs">
          <div className="p-2 bg-gray-700/50 rounded">
            <h4 className="font-semibold mb-1">Current Weather</h4>
            <div>ID: {getWeatherSystemState().weatherId} ({getWeatherSystemState().weatherName})</div>
            <div>Forecast: "{getWeatherSystemState().Random}"</div>
            <div>Days Lasted: {getWeatherSystemState().lastDays}</div>
            <div>Flag (aa): {getWeatherSystemState().aa ? 'true' : 'false'}</div>
          </div>

          <div className="p-2 bg-gray-700/50 rounded">
            <h4 className="font-semibold mb-1">Tomorrow Array</h4>
            <div>Tomorrow[0]: {WEATHER_NAMES[getWeatherSystemState().Tomorrow[0]]} (ID: {getWeatherSystemState().Tomorrow[0]})</div>
            <div>Tomorrow[1]: {WEATHER_NAMES[getWeatherSystemState().Tomorrow[1]]} (ID: {getWeatherSystemState().Tomorrow[1]})</div>
          </div>

          <div className="p-2 bg-gray-700/50 rounded">
            <h4 className="font-semibold mb-1">Current Weather Config</h4>
            {Object.entries(getWeatherSystemState().config).map(([key, value]) => (
              <div key={key}><span className="font-mono">{key}:</span> {String(value)}</div>
            ))}
            {Object.keys(getWeatherSystemState().config).length === 0 && (
              <div className="text-gray-400">No effects (Clear weather)</div>
            )}
          </div>

          <div className="p-2 bg-gray-700/50 rounded">
            <h4 className="font-semibold mb-1">Player Attributes</h4>
            <div>Vigour: {playerStore.vigour} / {playerStore.vigourMax}</div>
            <div>Spirit: {playerStore.spirit} / {playerStore.spiritMax}</div>
            <div>Temperature: {playerStore.temperature} / {playerStore.temperatureMax}</div>
          </div>

          <div className="p-2 bg-gray-700/50 rounded">
            <h4 className="font-semibold mb-1">Game State</h4>
            <div>Day: {gameStore.day}</div>
            <div>Season: {SEASON_NAMES[gameStore.season]} ({gameStore.season})</div>
            <div>Time: {gameStore.hour.toString().padStart(2, '0')}:{gameStore.minute.toString().padStart(2, '0')}</div>
            <div>Stage: {gameStore.stage}</div>
          </div>
        </div>
      </TestPanel>

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -z-10" />
    </TestScreen>
  )
}





