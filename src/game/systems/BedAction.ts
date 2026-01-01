/**
 * Bed Action System
 * Ported from OriginalGame/src/game/buildAction.js BedBuildAction
 * 
 * Handles bed sleep actions (1 hour, 4 hours, until morning)
 */

import { buildActionConfig, type BedActionConfig } from '@/data/buildActionConfig'
import { game } from '@/game/Game'
import { usePlayerStore } from '@/store/playerStore'
import { useBuildingStore } from '@/store/buildingStore'
import { emitter } from '@/utils/emitter'
import type { Building } from '@/types/building.types'

export enum BedActionType {
  SLEEP_1_HOUR = 1,
  SLEEP_4_HOUR = 2,
  SLEEP_ALL_NIGHT = 3
}

export class BedAction {
  buildingId: number
  buildingLevel: number
  type: BedActionType
  building: Building
  isActioning: boolean = false
  
  constructor(
    buildingId: number,
    buildingLevel: number,
    type: BedActionType,
    building: Building
  ) {
    this.buildingId = buildingId
    this.buildingLevel = buildingLevel >= 0 ? buildingLevel : 0
    this.type = type
    this.building = building
  }
  
  /**
   * Get bed action config for current level
   */
  getConfig(): BedActionConfig {
    const configs = buildActionConfig[String(this.buildingId)] as BedActionConfig[]
    if (!configs || this.buildingLevel >= configs.length) {
      // Fallback to level 0 config
      return configs?.[0] || { rate: 0.6 }
    }
    return configs[this.buildingLevel]
  }
  
  /**
   * Get current building level (updates dynamically)
   */
  getCurrentBuildLevel(): number {
    const buildingStore = useBuildingStore.getState()
    const bed = buildingStore.getBuilding(this.buildingId)
    return bed ? Math.max(0, bed.level) : 0
  }
  
  /**
   * Get sleep duration in seconds
   */
  getSleepDuration(): number {
    const timeManager = game.getTimeManager()
    
    switch (this.type) {
      case BedActionType.SLEEP_1_HOUR:
        return 1 * 60 * 60  // 1 hour in seconds
      case BedActionType.SLEEP_4_HOUR:
        return 4 * 60 * 60  // 4 hours in seconds
      case BedActionType.SLEEP_ALL_NIGHT:
        return timeManager.getTimeFromNowToMorning()
      default:
        return 0
    }
  }
  
  /**
   * Start sleep action
   * Returns true if sleep started successfully
   */
  startSleep(): boolean {
    // Check if bed is available
    const buildingStore = useBuildingStore.getState()
    const bed = buildingStore.getBuilding(this.buildingId)
    
    if (!bed || bed.level < 0 || !bed.active) {
      return false
    }
    
    // Check if already sleeping
    const survivalSystem = game.getSurvivalSystem()
    if (survivalSystem.getSleepState().isSleeping) {
      return false
    }
    
    // Convert action type to sleep duration
    let duration: '1hour' | '4hours' | 'untilMorning'
    switch (this.type) {
      case BedActionType.SLEEP_1_HOUR:
        duration = '1hour'
        break
      case BedActionType.SLEEP_4_HOUR:
        duration = '4hours'
        break
      case BedActionType.SLEEP_ALL_NIGHT:
        duration = 'untilMorning'
        break
      default:
        return false
    }
    
    // Start sleep via SurvivalSystem
    const success = survivalSystem.startSleep(duration)
    
    if (success) {
      // Set active button index (action index = type - 1)
      this.building.setActiveBtnIndex(this.type - 1)
      this.isActioning = true
      
      // Emit update signal
      emitter.emit('build_node_update')
      
      // Listen for sleep end to reset state
      // Note: We'll check sleep state in getDisplayInfo() instead of using events
    }
    
    return success
  }
  
  /**
   * Get display information for UI
   * Matches original _getUpdateViewInfo() structure
   */
  getDisplayInfo(): {
    iconName: string
    hint: string
    hintColor: string | null
    actionText: string
    disabled: boolean
    percentage: number
  } {
    const iconName = `build_action_9_${this.type - 1}.png`
    const actionText = "Sleep"  // String 1018 - placeholder until string system
    
    // Update building level
    this.buildingLevel = this.getCurrentBuildLevel()
    
    // Check if bed is built
    if (this.buildingLevel < 0) {
      return {
        iconName,
        hint: "Bed not built", // String 1006 - placeholder
        hintColor: '#FF0000', // RED
        actionText,
        disabled: true,
        percentage: 0
      }
    }
    
    // Check if already sleeping
    const survivalSystem = game.getSurvivalSystem()
    const sleepState = survivalSystem.getSleepState()
    
    if (sleepState.isSleeping) {
      // Calculate sleep progress percentage
      const timeManager = game.getTimeManager()
      const currentTime = timeManager.now()
      const elapsed = currentTime - sleepState.startTime
      const total = sleepState.endTime - sleepState.startTime
      const percentage = total > 0 ? Math.min(100, (elapsed / total) * 100) : 0
      
      // Check if this action is the active one (by comparing button index)
      const isActiveAction = this.building.activeBtnIndex === (this.type - 1)
      
      // Update isActioning based on whether this is the active action
      this.isActioning = isActiveAction
      
      return {
        iconName,
        hint: "Sleeping...", // String 1019 - placeholder
        hintColor: '#FFFFFF', // WHITE
        actionText,
        disabled: true,
        percentage: isActiveAction ? percentage : 0
      }
    }
    
    // Not sleeping - reset actioning state
    this.isActioning = false
    
    // Get hint text based on action type
    let hint = ""
    switch (this.type) {
      case BedActionType.SLEEP_1_HOUR:
        hint = "Sleep 1 hour"  // String 1144, 1 - placeholder
        break
      case BedActionType.SLEEP_4_HOUR:
        hint = "Sleep 4 hours"  // String 1144, 4 - placeholder
        break
      case BedActionType.SLEEP_ALL_NIGHT:
        hint = "Sleep until morning"  // String 1145 - placeholder
        break
    }
    
    return {
      iconName,
      hint,
      hintColor: '#FFFFFF', // WHITE (default)
      actionText,
      disabled: false,
      percentage: 0
    }
  }
  
  /**
   * Save action state (for bed actions, state is minimal)
   */
  save(): any {
    return {
      type: this.type,
      isActioning: this.isActioning
    }
  }
  
  /**
   * Restore action state
   */
  restore(saveObj?: any): void {
    if (saveObj) {
      this.isActioning = saveObj.isActioning || false
    }
  }
}

