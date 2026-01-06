export type Season = 0 | 1 | 2 | 3 // 0=Autumn, 1=Winter, 2=Spring, 3=Summer

export type TimeOfDay = 'day' | 'night'

export type WeatherType = 0 | 1 | 2 | 3 | 4 // Clear, Cloudy, Rain, Snow, Storm

export interface GameState {
  time: number // Game time in seconds
  season: Season
  stage: TimeOfDay
  isPaused: boolean
  day: number // Current day number
  hour: number // Current hour (0-23)
}

import type { WeatherSaveData } from '@/core/game/systems/WeatherSystem'

import type { MapSaveData } from './site.types'

export interface GameSaveData {
  time: number
  season: Season
  day: number
  weather: WeatherSaveData
  map?: MapSaveData // Optional for backward compatibility
}

export type DeathReason = 
  | 'hp_zero'
  | 'virus_overload'
  | 'infection'
  | 'starvation'
  | 'thirst'


