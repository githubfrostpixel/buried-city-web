import { create } from 'zustand'
import type { GameState, Season, TimeOfDay, WeatherType } from '@/types/game.types'

interface GameStore extends GameState {
  // Time state
  day: number
  hour: number
  minute: number
  second: number
  
  // Weather
  weather: WeatherType
  
  // Game flags
  isPaused: boolean
  pausedRef: number
  
  // Actions
  pause: () => void
  resume: () => void
  setTime: (time: number) => void
  setWeather: (weather: WeatherType) => void
  setSeason: (season: Season) => void
  setStage: (stage: TimeOfDay) => void
  updateTime: (deltaTime: number) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  time: 6 * 60 * 60 + 1, // Start at 6:00:01
  season: 0, // Spring
  stage: 'day',
  isPaused: false,
  pausedRef: 0,
  day: 0,
  hour: 6,
  minute: 0,
  second: 1,
  weather: 0, // Clear
  
  // Actions
  pause: () => set((state: GameStore) => ({ 
    pausedRef: state.pausedRef + 1,
    isPaused: state.pausedRef + 1 > 0 
  })),
  
  resume: () => set((state: GameStore) => {
    const newRef = Math.max(0, state.pausedRef - 1)
    return {
      pausedRef: newRef,
      isPaused: newRef > 0
    }
  }),
  
  setTime: (time: number) => {
    const d = Math.floor(time / (24 * 60 * 60))
    const dTime = time % (24 * 60 * 60)
    const h = Math.floor(dTime / (60 * 60))
    const hTime = dTime % (60 * 60)
    const m = Math.floor(hTime / 60)
    const s = Math.floor(hTime % 60)
    
    // Determine stage (day/night)
    const stage: TimeOfDay = (h >= 6 && h < 20) ? 'day' : 'night'
    
    // Determine season (30 days per season, 4 seasons = 120 day cycle)
    const dayInCycle = d % 120
    const season = Math.floor(dayInCycle / 30) as Season
    
    set({
      time,
      day: d,
      hour: h,
      minute: m,
      second: s,
      stage,
      season
    })
  },
  
  setWeather: (weather: WeatherType) => set({ weather }),
  
  setSeason: (season: Season) => set({ season }),
  
  setStage: (stage: TimeOfDay) => set({ stage }),
  
  updateTime: (deltaTime: number) => {
    if (get().isPaused) return
    
    const currentTime = get().time
    const newTime = currentTime + deltaTime
    get().setTime(newTime)
  }
}))

