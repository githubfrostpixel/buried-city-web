/**
 * Weather System
 * Ported from OriginalGame/src/game/weather.js
 * 
 * Manages weather state, daily weather changes, and weather effects
 */

import type { WeatherType, Season } from '@/types/game.types'
import type { WeatherConfig, WeatherSystemEntry } from '@/types/weather.types'
import { weatherConfig, weatherSystemConfig } from '@/data/weather'
import { emitter } from '@/utils/emitter'
import { getRoundRandom, getRandomInt } from '@/utils/random'
import { useLogStore } from '@/store/logStore'

export interface WeatherSaveData {
  weatherId: WeatherType
  Tomorrow: [WeatherType, WeatherType]
  Random: string
  lastDays: number
  aa: boolean
}

export class WeatherSystem {
  private weatherId: WeatherType
  private Tomorrow: [WeatherType, WeatherType]
  private Random: string
  private lastDays: number
  private aa: boolean
  private weatherConfig: WeatherConfig

  constructor() {
    this.weatherId = 0 // CLOUDY/Clear
    this.Tomorrow = [0, 0]
    this.Random = this.getStr(0)
    this.lastDays = 0
    this.aa = true

    this.changeWeather(this.weatherId, false)
  }

  /**
   * Save weather state
   */
  save(): WeatherSaveData {
    return {
      weatherId: this.weatherId,
      Tomorrow: this.Tomorrow,
      Random: this.Random,
      lastDays: this.lastDays,
      aa: this.aa
    }
  }

  /**
   * Restore weather state
   */
  restore(saveObj: WeatherSaveData | null): void {
    if (saveObj) {
      this.weatherId = saveObj.weatherId
      this.Tomorrow = saveObj.Tomorrow
      this.Random = saveObj.Random
      this.aa = saveObj.aa
      this.lastDays = saveObj.lastDays

      this.changeWeather(this.weatherId, false)
    }
  }

  /**
   * Check and update weather (called daily at day transition)
   * Ported from OriginalGame/src/game/weather.js:checkWeather
   * 
   * Note: Season is calculated for tomorrow (day + 1) to match original game
   */
  checkWeather(season: Season, day: number): void {
    if (this.weatherId === 0) {
      // Current weather is Clear - roll for new weather
      // Original game calculates season for tomorrow (d + 1)
      // We pass the season for tomorrow, so we use the provided season directly
      const seasonKey = season.toString()
      const randomWeather = weatherSystemConfig[seasonKey]
      
      if (!randomWeather) {
        console.warn(`WeatherSystem: No weather config for season ${season}`)
        return
      }

      const weatherInfo = getRoundRandom(randomWeather)
      
      // Special check to reduce chance of consecutive abnormal weather
      // If tomorrow[1] is not Clear and we rolled non-Clear, 50% chance to force Clear
      if (weatherInfo.weatherId !== '0' && this.Tomorrow[1] !== 0 && Math.random() > 0.5) {
        weatherInfo.weatherId = '0'
      }

      // Update Tomorrow array (shift and push)
      this.Tomorrow.push(parseInt(weatherInfo.weatherId) as WeatherType)
      this.Tomorrow.shift()
      
      // Set new weather
      this.weatherId = this.Tomorrow[0]
      this.changeWeather(this.weatherId, true)
    } else {
      // Current weather is not Clear - increment lastDays
      this.lastDays++
      
      if (this.lastDays >= (this.weatherConfig.lastDays || 0)) {
        // Weather duration expired - change to Clear
        this.Tomorrow.push(0)
        this.Tomorrow.shift()
        this.weatherId = this.Tomorrow[0]
        this.changeWeather(this.weatherId, true)
      }
    }
  }

  /**
   * Change weather
   * Ported from OriginalGame/src/game/weather.js:changeWeather
   */
  changeWeather(weatherId: WeatherType, sendLog?: boolean): void {
    this.weatherId = weatherId
    this.weatherConfig = weatherConfig[weatherId.toString()]
    this.lastDays = 0
    
    // Update Tomorrow array when manually changing weather (for testing/initialization)
    // Shift current weather into Tomorrow[0], keep Tomorrow[1] for forecast
    // This ensures forecast works correctly
    if (this.Tomorrow[0] === 0 && this.Tomorrow[1] === 0) {
      // Initialize Tomorrow array with current weather
      this.Tomorrow = [weatherId, weatherId]
    } else {
      // Update Tomorrow[0] to current weather, keep Tomorrow[1] for forecast
      this.Tomorrow[0] = weatherId
    }
    
    this.Notice()

    // Emit weather change event
    emitter.emit('weather_change', weatherId)

    // Log weather change if requested
    if (sendLog) {
      // TODO: Get localized string (string ID 3015)
      const weatherName = this.getWeatherName()
      const logStore = useLogStore.getState()
      logStore.addLog(`Weather changed to ${weatherName}`)
      // Original: player.log.addMsg(stringUtil.getString(3015)[this.weatherId])
    }
  }

  /**
   * Generate random forecast
   * Ported from OriginalGame/src/game/weather.js:Notice
   */
  private Notice(): void {
    let str: string
    if (Math.random() >= 0.2) {
      // 80% chance: Show tomorrow's weather
      str = this.getStr(this.Tomorrow[1])
    } else {
      // 20% chance: Random weather string
      str = this.getStr(getRandomInt(0, 4) as WeatherType)
    }
    this.Random = str
  }

  /**
   * Get weather effect value
   * Ported from OriginalGame/src/game/weather.js:getValue
   */
  getValue(key: string): number {
    if (this.weatherConfig[key] !== undefined) {
      return this.weatherConfig[key] as number
    }
    return 0
  }

  /**
   * Get weather name (localized)
   * Ported from OriginalGame/src/game/weather.js:getWeatherName
   * 
   * Note: Weather icon mapping: 0=Cloudy, 1=Clear, 2=Rain, 3=Snow, 4=Storm
   */
  getWeatherName(): string {
    // TODO: Get from localization (string ID 3014)
    // Weather names match icon mapping: 0=Cloudy, 1=Clear, 2=Rain, 3=Snow, 4=Storm
    const names = ['Cloudy', 'Clear', 'Rain', 'Snow', 'Storm']
    return names[this.weatherId] || 'Unknown'
  }

  /**
   * Get weather string by ID
   * Ported from OriginalGame/src/game/weather.js:getStr
   * 
   * Note: Weather icon mapping: 0=Cloudy, 1=Clear, 2=Rain, 3=Snow, 4=Storm
   */
  private getStr(weatherId: WeatherType): string {
    // Get weather name for the specific weatherId, not current weather
    // Weather names match icon mapping: 0=Cloudy, 1=Clear, 2=Rain, 3=Snow, 4=Storm
    const names = ['Cloudy', 'Clear', 'Rain', 'Snow', 'Storm']
    return names[weatherId] || 'Unknown'
  }

  /**
   * Get current weather ID
   */
  getCurrentWeather(): WeatherType {
    return this.weatherId
  }

  /**
   * Get current weather config
   */
  getWeatherConfig(): WeatherConfig {
    return this.weatherConfig
  }

  /**
   * Get forecast string
   */
  getForecast(): string {
    return this.Random
  }
}

