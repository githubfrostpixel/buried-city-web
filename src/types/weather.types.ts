import type { WeatherType } from './game.types'

export interface WeatherConfig {
  id: WeatherType
  lastDays?: number
  vigour?: number
  spirit?: number
  speed?: number
  temperature?: number
  gun_precise?: number
  monster_speed?: number
  build_2?: number // Building ID 2 effect
  [itemKey: string]: number | WeatherType | undefined // item_1101061, etc.
}

export interface WeatherSystemEntry {
  weatherId: string
  weight: number
}

export type WeatherSystemConfig = Record<string, WeatherSystemEntry[]>

