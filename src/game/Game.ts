/**
 * Game initialization and management
 * Sets up core game systems
 */

import { TimeManager } from './systems/TimeManager'
import { SurvivalSystem } from './systems/SurvivalSystem'
import { FoodExpirationSystem } from './systems/FoodExpirationSystem'

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
      // TODO: Check if fridge building (ID 21) is active
      // Placeholder - integrate with building system in Phase 2C
      const hasFridge = false
      
      const result = this.foodExpirationSystem.processDailyExpiration(hasFridge)
      
      if (result.lostItems.length > 0 || result.fertilizerHome > 0 || result.fertilizerSite > 0) {
        // TODO: Show food expiration dialog (Phase 2D or later)
        // TODO: Save game state
        console.log('Food expired:', result)
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

