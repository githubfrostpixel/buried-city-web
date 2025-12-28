export type Season = 0 | 1 | 2 | 3 // Spring, Summer, Autumn, Winter

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

export interface GameSaveData {
  time: number
  season: Season
  day: number
  weather: WeatherType
}

export type DeathReason = 
  | 'hp_zero'
  | 'virus_overload'
  | 'infection'
  | 'starvation'
  | 'thirst'


