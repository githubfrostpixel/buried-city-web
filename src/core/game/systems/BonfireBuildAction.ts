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
import { TimerCallback } from './TimeManager'
import type { Building } from '@/core/game/world/Building'

export class BonfireBuildAction {
  buildingId: number
  building: Building
  config: BonfireActionConfig
  fuel: number = 0
  pastTime: number = 0
  startTime: number | null = null
  fuelMax: number = 6
  timePerFuel: number = 0  // Seconds per wood
  isActioning: boolean = false
  timerCallback: TimerCallback | null = null
  
  constructor(buildingId: number, building: Building) {
    this.buildingId = buildingId
    this.building = building
    const configs = buildActionConfig[String(buildingId)] as BonfireActionConfig[]
    this.config = configs?.[0] || {
      cost: [{ itemId: 1101011, num: 1 }],
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
   * Add fuel (wood) to stove
   * Ported from buildAction.js:549-563
   */
  addFuel(): void {
    const playerStore = usePlayerStore.getState()
    
    // Check if building is built
    if (this.getCurrentBuildLevel() < 0) {
      return
    }
    
    // Check if fuel is at max
    if (this.fuel >= this.fuelMax) {
      return
    }
    
    // Validate items
    if (!(playerStore as any).validateItems(this.config.cost)) {
      return
    }
    
    // Cost items
    ;(playerStore as any).costItems(this.config.cost)
    
    // Increment fuel first
    this.fuel++
    
    // If fuel was 0, start timer (after incrementing)
    if (this.fuel === 1) {
      this.addFuelTimer()
      this.building.setActiveBtnIndex(0)
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
   * Ported from buildAction.js:532-548
   */
  addFuelTimer(): void {
    const timeManager = game.getTimeManager()
    const currentTime = timeManager.now()
    
    // Calculate start time (for save/restore)
    if (this.startTime === null) {
      this.startTime = currentTime
    }
    
    // Calculate elapsed time if restoring
    let elapsedTime = 0
    if (this.startTime > 0 && this.pastTime > 0) {
      elapsedTime = this.pastTime
    }
    
    // Calculate remaining time for this fuel
    const remainingTime = this.timePerFuel - elapsedTime
    
    if (remainingTime <= 0) {
      // Time already elapsed, consume fuel immediately
      this.consumeFuel()
      return
    }
    
    this.isActioning = true
    
    // Create timer callback
    const self = this
    const timerCallback = new TimerCallback(
      remainingTime,
      this,
      {
        process: (dt: number) => {
          self.pastTime += dt
          // Emit update for UI progress
          emitter.emit('build_node_update')
        },
        end: () => {
          self.consumeFuel()
        }
      }
    )
    
    // Set start time in timer callback
    if (this.startTime > 0) {
      timerCallback.setStartTime(this.startTime)
    }
    
    // Add timer to time manager
    timeManager.addTimerCallback(timerCallback)
    this.timerCallback = timerCallback
    
    // Accelerate work time
    timeManager.accelerateWorkTime(remainingTime)
  }
  
  /**
   * Consume one fuel (wood)
   */
  consumeFuel(): void {
    this.fuel--
    this.pastTime = 0
    this.startTime = null
    this.isActioning = false
    
    if (this.timerCallback) {
      const timeManager = game.getTimeManager()
      timeManager.removeTimerCallback(this.timerCallback)
      this.timerCallback = null
    }
    
    if (this.fuel > 0) {
      // More fuel remaining, start next timer
      this.addFuelTimer()
    } else {
      // No fuel left, reset active button
      this.building.resetActiveBtnIndex()
      
      // Update temperature (fireplace is now inactive)
      // Note: isActive() checks fuel directly, so no need to set building.active
      const survivalSystem = game.getSurvivalSystem()
      survivalSystem.updateTemperature()
    }
    
    // Emit update signal
    emitter.emit('build_node_update')
  }
  
  /**
   * Handle click action (add wood)
   * Ported from buildAction.js:518-531
   */
  clickAction1(): void {
    const playerStore = usePlayerStore.getState()
    
    // Check vigour (stub for now - TODO: implement vigour check)
    // if (!checkVigour()) return
    
    // Check if building is built
    if (this.getCurrentBuildLevel() < 0) {
      return
    }
    
    // Validate items
    if (!(playerStore as any).validateItems(this.config.cost)) {
      // Show error dialog (stub for now)
      // uiUtil.showTinyInfoDialog(1146) // "Not enough items"
      return
    }
    
    // Check if fuel is at max
    if (this.fuel >= this.fuelMax) {
      // Show info dialog (stub for now)
      // uiUtil.showTinyInfoDialog(1134) // "The stove is full of wood now."
      return
    }
    
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
    
    // Check if building is built
    const buildingLevel = this.getCurrentBuildLevel()
    if (buildingLevel < 0) {
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
    
    // Check if fuel is at max
    if (this.fuel >= this.fuelMax) {
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
    if (this.fuel === 0) {
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
    const remainingHours = Math.ceil((this.fuel * this.timePerFuel - this.pastTime) / 3600)
    const hint = getString(1012, this.fuel, remainingHours) || 
      `The fire is on. There is ${this.fuel} wood in the stove, which can last for ${remainingHours} hours.`
    
    // Calculate progress percentage
    const totalTime = this.fuel * this.timePerFuel
    const percentage = totalTime > 0 ? Math.min(100, (this.pastTime / totalTime) * 100) : 0
    
    return {
      iconName,
      hint,
      hintColor: '#FFFFFF', // WHITE
      actionText,
      disabled: this.isActioning || this.building.anyBtnActive() && this.building.activeBtnIndex !== 0,
      percentage: this.isActioning ? percentage : 0
    }
  }
  
  /**
   * Save action state
   * Ported from buildAction.js:564-570
   */
  save(): any {
    return {
      fuel: this.fuel,
      pastTime: this.pastTime,
      startTime: this.startTime
    }
  }
  
  /**
   * Restore action state
   * Ported from buildAction.js:571-580
   */
  restore(saveObj?: any): void {
    if (saveObj) {
      this.fuel = saveObj.fuel || 0
      this.pastTime = saveObj.pastTime || 0
      this.startTime = saveObj.startTime || null
    }
    
    // If fuel > 0, restart timer
    if (this.fuel > 0) {
      // Calculate elapsed time since startTime
      if (this.startTime) {
        const timeManager = game.getTimeManager()
        const currentTime = timeManager.now()
        const elapsed = currentTime - this.startTime
        
        // Update pastTime based on elapsed time
        this.pastTime = elapsed % this.timePerFuel
        
        // If pastTime exceeds timePerFuel, consume fuel
        const fuelConsumed = Math.floor(elapsed / this.timePerFuel)
        if (fuelConsumed > 0) {
          this.fuel = Math.max(0, this.fuel - fuelConsumed)
          if (this.fuel === 0) {
            this.pastTime = 0
            this.startTime = null
          }
        }
      }
      
      // Restart timer if fuel still > 0
      if (this.fuel > 0) {
        this.addFuelTimer()
      }
    }
  }
}

