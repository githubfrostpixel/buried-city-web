/**
 * Log Store
 * Manages game log messages displayed in TopBar
 * Ported from OriginalGame/src/game/log.js
 * 
 * Used by:
 * - TopSection.tsx (displays log messages in LogBar component)
 * - Game systems: SurvivalSystem, WeatherSystem
 * - World systems: Site, Map (event logging)
 */

import { create } from 'zustand'

export interface LogMessage {
  txt: string
  timestamp: number
}

interface LogStore {
  logs: LogMessage[]
  maxLogs: number
  
  // Actions
  addLog: (message: string) => void
  clearLogs: () => void
}

export const useLogStore = create<LogStore>((set, get) => ({
  logs: [],
  maxLogs: 100, // Keep last 100 logs
  
  addLog: (message: string) => {
    const newLog: LogMessage = {
      txt: message,
      timestamp: Date.now()
    }
    
    set((state) => {
      const newLogs = [...state.logs, newLog].slice(-state.maxLogs)
      return { logs: newLogs }
    })
    
    // Emit event for UI updates (if needed)
    // utils.emitter.emit("logChanged", newLog)
  },
  
  clearLogs: () => set({ logs: [] })
}))

