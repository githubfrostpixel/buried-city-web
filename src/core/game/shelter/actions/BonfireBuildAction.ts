/**
 * Bonfire Build Action System
 * Ported from OriginalGame/src/game/buildAction.js BonfireBuildAction
 * 
 * Handles fireplace/wood stove fuel management (Building 5)
 * Note: Building 4 is the cooking stove (has recipes), Building 5 is the fireplace for warming
 */

import { buildActionConfig, type BonfireActionConfig } from '@/core/data/buildActionConfig'
import { game } from '@/core/game/Game'
import { usePlayerStore } from '@/core/store/playerStore'
import { useBuildingStore } from '@/core/store/buildingStore'
import { emitter } from '@/common/utils/emitter'
import { getString } from '@/common/utils/stringUtil'
import { useLogStore } from '@/core/store/logStore'
import { TimerCallback } from '@/core/game/core/TimeManager'
import { checkVigour, showTinyInfoDialog } from '@/common/utils/uiUtil'
import type { Building } from '@/core/game/shelter/Building'

export class BonfireBuildAction {
  id: number = 0  // Action ID for saving (always 0 for bonfire action)
  buildingId: number
  building: Building
  config: BonfireActionConfig
  fuel: number = 0  // Time remaining in seconds (not wood count)
  fuelMax: number = 6
  timePerFuel: number = 0  // Seconds per wood (14400 = 4 hours)
  isActioning: boolean = false
  timerCallback: TimerCallback | null = null
  
  constructor(buildingId: number, building: Building) {
    this.buildingId = buildingId
    this.building = building
    const configs = buildActionConfig[String(buildingId)] as BonfireActionConfig[]
    this.config = configs?.[0] || {
      cost: [{ itemId: "item_mat_wood", num: 1 }],
      makeTime: 240,
      max: 6
    }
    this.fuelMax = this.config.max
    this.timePerFuel = this.config.makeTime * 60  // Convert minutes to seconds
  }
  
  /**
   * Get current building level
   */
  getCurrentBuildLevel(): number {
    const buildingStore = useBuildingStore.getState()
    const build = buildingStore.getBuilding(this.buildingId)
    return build ? Math.max(0, build.level) : 0
  }
  
  /**
   * Get current wood count from fuel time
   */
  getWoodCount(): number {
    return this.fuel > 0 ? Math.ceil(this.fuel / this.timePerFuel) : 0
  }
  
  /**
   * Add fuel (wood) to stove
   * Each wood adds timePerFuel seconds (4 hours) to fuel time remaining
   * Note: This method assumes validation and item consumption already done in clickAction1()
   */
  addFuel(): void {
    const wasEmpty = this.fuel <= 0
    // Add time for one wood (4 hours = 14400 seconds)
    this.fuel += this.timePerFuel
    
    // If fuel was empty, start timer
    if (wasEmpty) {
      this.building.setActiveBtnIndex(0)
      this.addFuelTimer()
    } else {
      // Fuel already burning, restart timer with new total duration
      // Stop current timer
      if (this.timerCallback) {
        const timeManager = game.getTimeManager()
        timeManager.removeTimerCallback(this.timerCallback)
        this.timerCallback = null
      }
      // Restart with new total time
      this.addFuelTimer()
    }
    
    // Update temperature (fireplace is now active)
    // Original: player.updateTemperature() - applies difference instantly
    // Note: isActive() checks fuel directly, so no need to set building.active
    const survivalSystem = game.getSurvivalSystem()
    survivalSystem.updateTemperature()
    
    // Emit update signal
    emitter.emit('build_node_update')
    
    // Log message
    const logStore = useLogStore.getState()
    logStore.addLog(getString(1097)) // "You added some wood to the stove."
  }
  
  /**
   * Add fuel timer callback
   * Fuel is now tracked as time remaining, so we just subtract dt from fuel
   */
  addFuelTimer(): void {
    const timeManager = game.getTimeManager()
    
    if (this.fuel <= 0) {
      // No fuel, reset state
      this.fuel = 0
      this.isActioning = false
      this.building.resetActiveBtnIndex()
      const survivalSystem = game.getSurvivalSystem()
      survivalSystem.updateTemperature()
      emitter.emit('build_node_update')
      return
    }
    
    // Ensure remaining time is at least 1 second
    const safeRemainingTime = Math.max(1, this.fuel)
    
    this.isActioning = true
    
    // Create timer callback - simply subtract dt from fuel
    const self = this
    const timerCallback = new TimerCallback(
      safeRemainingTime,
      this,
      {
        process: (dt: number) => {
          // Simply subtract time from fuel
          self.fuel = Math.max(0, self.fuel - dt)
          
          // If fuel depleted, stop timer
          if (self.fuel <= 0) {
            self.fuel = 0
            self.isActioning = false
            self.building.resetActiveBtnIndex()
            const survivalSystem = game.getSurvivalSystem()
            survivalSystem.updateTemperature()
          }
          
          // Emit update for UI progress
          emitter.emit('build_node_update')
        },
        end: () => {
          // Timer ended, all fuel consumed
          self.fuel = 0
          self.isActioning = false
          self.building.resetActiveBtnIndex()
          // Update temperature (fireplace is now inactive)
          const survivalSystem = game.getSurvivalSystem()
          survivalSystem.updateTemperature()
          emitter.emit('build_node_update')
        }
      }
    )
    
    // Add timer to time manager
    timeManager.addTimerCallback(timerCallback)
    this.timerCallback = timerCallback
  }
  
  
  /**
   * Handle click action (add wood)
   * Ported from buildAction.js:518-531
   */
  clickAction1(): void {
    const playerStore = usePlayerStore.getState()
    
    // Check if wood stove is built (need stove first)
    const buildingStore = useBuildingStore.getState()
    const stove = buildingStore.getBuilding(this.buildingId)
    if (!stove || stove.level < 0) {
      return
    }
    
    // Check vigour
    if (!checkVigour()) {
      return
    }
    
    // Validate items
    if (!(playerStore as any).validateItems(this.config.cost)) {
      // Show error dialog (string ID 1146)
      showTinyInfoDialog(1146) // "Insufficient wood"
      return
    }
    
    // Check if fuel is at max (max time = fuelMax * timePerFuel)
    const maxFuelTime = this.fuelMax * this.timePerFuel
    if (this.fuel >= maxFuelTime) {
      // Show info dialog (string ID 1134)
      showTinyInfoDialog(1134) // "The stove is full of wood now."
      return
    }
    
    // Cost items (consume wood) - BEFORE calling addFuel()
    ;(playerStore as any).costItems(this.config.cost)
    
    // Add fuel
    this.addFuel()
  }
  
  /**
   * Get display information for UI
   * Ported from buildAction.js:600-635
   */
  getDisplayInfo(): {
    iconName: string
    hint: string
    hintColor: string | null
    actionText: string
    disabled: boolean
    percentage: number
    items?: Array<{ itemId: number; num: number; color?: string }>
  } {
    const iconName = `build_action_${this.buildingId}_0.png`
    const actionText = getString(1010) || "Add wood" // "Add wood"
    
    // Check if wood stove is built (need stove first)
    const buildingStore = useBuildingStore.getState()
    const stove = buildingStore.getBuilding(this.buildingId)
    if (!stove || stove.level < 0) {
      const buildingName = getString(`${this.buildingId}_0`)?.title || `Building ${this.buildingId}`
      return {
        iconName,
        hint: getString(1006, buildingName) || `You need ${buildingName}!`, // "You need %s!"
        hintColor: '#FF0000', // RED
        actionText,
        disabled: true,
        percentage: 0
      }
    }
    
    // Calculate wood count from fuel time
    const woodCount = this.getWoodCount()
    const maxFuelTime = this.fuelMax * this.timePerFuel
    
    // Check if fuel is at max
    if (this.fuel >= maxFuelTime) {
      return {
        iconName,
        hint: getString(1134) || "The stove is full of wood now.",
        hintColor: '#FFFFFF', // WHITE
        actionText,
        disabled: true,
        percentage: 0
      }
    }
    
    // Check if fuel is 0
    if (this.fuel <= 0) {
      return {
        iconName,
        hint: getString(1011) || "The stove fire is out. 1 wood lasts for 4 hours.",
        hintColor: '#FFFFFF', // WHITE
        actionText,
        disabled: false,
        percentage: 0,
        items: this.config.cost.map(item => ({
          itemId: item.itemId,
          num: item.num,
          color: '#FFFFFF'
        }))
      }
    }
    
    // Fuel is active
    const remainingTime = this.fuel
    const remainingHours = Math.ceil(remainingTime / 3600)
    const hint = getString(1012, woodCount, remainingHours) || 
      `The fire is on. There is ${woodCount} wood in the stove, which can last for ${remainingHours} hours.`
    
    // Calculate progress percentage: remaining time / max time (24 hours)
    const percentage = maxFuelTime > 0 ? (remainingTime / maxFuelTime) * 100 : 0
    
    return {
      iconName,
      hint,
      hintColor: '#FFFFFF', // WHITE
      actionText,
      disabled: this.building.anyBtnActive() && this.building.activeBtnIndex !== 0,
      percentage: this.isActioning ? Math.min(100, Math.max(0, percentage)) : 0
    }
  }
  
  /**
   * Save action state
   * Saves fuel as time remaining and current game time for restore calculation
   */
  save(): any {
    const timeManager = game.getTimeManager()
    return {
      fuel: this.fuel,  // Time remaining in seconds
      saveTime: timeManager.now()  // Current game time for restore calculation
    }
  }
  
  /**
   * Restore action state
   */
  restore(saveObj?: any): void {
    if (saveObj) {
      const savedFuel = saveObj.fuel || 0
      const timeManager = game.getTimeManager()
      const currentTime = timeManager.now()
      
      // Use saveTime if available, otherwise fall back to startTime
      const saveTime = saveObj.saveTime || saveObj.startTime || currentTime
      const elapsed = currentTime - saveTime
      // Subtract elapsed time from saved fuel time
      this.fuel = Math.max(0, savedFuel - elapsed)
    }
    
    // Restart timer if fuel still > 0
    if (this.fuel > 0) {
      this.addFuelTimer()
    } else {
      // No fuel left, reset state
      this.fuel = 0
      this.isActioning = false
      this.building.resetActiveBtnIndex()
      const survivalSystem = game.getSurvivalSystem()
      survivalSystem.updateTemperature()
    }
  }
}

