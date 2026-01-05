/**
 * Game initialization and management
 * Sets up core game systems
 */

import { TimeManager } from './systems/TimeManager'
import { SurvivalSystem } from './systems/SurvivalSystem'
import { FoodExpirationSystem } from './systems/FoodExpirationSystem'
import { useGameStore } from '@/core/store/gameStore'
import { usePlayerStore } from '@/core/store/playerStore'
import type { Season } from '@/common/types/game.types'

class Game {
  private static instance: Game | null = null
  private timeManager: TimeManager
  private survivalSystem: SurvivalSystem
  private foodExpirationSystem: FoodExpirationSystem
  private initialized = false

  private constructor() {
    this.timeManager = new TimeManager()
    this.survivalSystem = new SurvivalSystem(this.timeManager)
    this.foodExpirationSystem = new FoodExpirationSystem()
    
    // Set up food expiration daily callback at 1:05 AM
    this.timeManager.addTimerCallbackDayByDayOneAM(this.foodExpirationSystem, () => {
      // Check if fridge building (ID 21) is active
      // processDailyExpiration will check if hasFridge is not provided
      const result = this.foodExpirationSystem.processDailyExpiration()
      
      if (result.lostItems.length > 0 || result.fertilizerHome > 0 || result.fertilizerSite > 0) {
        // TODO: Show food expiration dialog (Phase 2D or later)
        // TODO: Save game state
        console.log('Food expired:', result)
      }
    })
    
    // Add weather check and NPC visits at day/night transitions
    // Original: cc.timer.addTimerCallbackDayAndNight(null, function (flag) { ... })
    this.timeManager.addTimerCallbackDayAndNight(null, (stage) => {
      if (stage === 'day') {
        const gameStore = useGameStore.getState()
        const currentDay = gameStore.day
        
        // Calculate season for tomorrow (day + 1) to match original game
        // Original: var season = cc.timer.getSeason({ d: (cc.timer.formatTime().d + 1) })
        const dayInCycle = (currentDay + 1) % 120
        const tomorrowSeason = Math.floor(dayInCycle / 30) as Season
        
        // Check and update weather
        gameStore.weatherSystem.checkWeather(tomorrowSeason, currentDay)
        
        // Update GameStore
        gameStore.updateWeather()
        
        // NPC visits player home (Original: self.npcManager.visitPlayer())
        try {
          const playerStore = usePlayerStore.getState()
          const npcManager = playerStore.getNPCManager()
          npcManager.visitPlayer()
          
          // Update trading items (Original: self.npcManager.updateTradingItem())
          npcManager.updateTradingItem()
        } catch (error) {
          console.warn('[Game] NPCManager not available for visitPlayer:', error)
        }
      } else if (stage === 'night') {
        // NPC comes to buy from player (Original: self.npcManager.visitSale())
        try {
          const playerStore = usePlayerStore.getState()
          const npcManager = playerStore.getNPCManager()
          npcManager.visitSale()
        } catch (error) {
          console.warn('[Game] NPCManager not available for visitSale:', error)
        }
      }
    })
  }

  static getInstance(): Game {
    if (!Game.instance) {
      Game.instance = new Game()
    }
    return Game.instance
  }

  /**
   * Initialize game systems
   */
  initialize(): void {
    if (this.initialized) {
      return
    }

    // Systems are already initialized in constructors
    // TimeManager sets up its callbacks
    // SurvivalSystem sets up hourly callbacks in constructor
    
    this.initialized = true
  }

  /**
   * Update game (called every frame)
   */
  update(dt: number): void {
    this.timeManager.update(dt)
    
    // Process sleep if sleeping
    // Sleep processing is handled by hourly callbacks and time acceleration
    // No need to process here as it's handled by the time system
  }

  /**
   * Get time manager
   */
  getTimeManager(): TimeManager {
    return this.timeManager
  }

  /**
   * Get survival system
   */
  getSurvivalSystem(): SurvivalSystem {
    return this.survivalSystem
  }

  /**
   * Get food expiration system
   */
  getFoodExpirationSystem(): FoodExpirationSystem {
    return this.foodExpirationSystem
  }

  /**
   * Pause game
   */
  pause(): void {
    this.timeManager.pause()
  }

  /**
   * Resume game
   */
  resume(): void {
    this.timeManager.resume()
  }
}

export const game = Game.getInstance()

