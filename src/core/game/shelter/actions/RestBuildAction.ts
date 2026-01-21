/**
 * Rest Build Action System
 * Ported from OriginalGame/src/game/buildAction.js RestBuildAction
 * 
 * Handles chair coffee/rest action (Building 10, index 0)
 */

import { buildActionConfig, type RestActionConfig } from '@/core/data/buildActionConfig'
import { game } from '@/core/game/Game'
import { usePlayerStore } from '@/core/store/playerStore'
import { useBuildingStore } from '@/core/store/buildingStore'
import { emitter } from '@/common/utils/emitter'
import { getString } from '@/common/utils/stringUtil'
import { useLogStore } from '@/core/store/logStore'
import { audioManager, SoundPaths } from '@/core/game/core/AudioManager'
import { TimerCallback } from '@/core/game/core/TimeManager'
import type { Building } from '@/core/game/shelter/Building'

export class RestBuildAction {
  buildingId: number
  buildingLevel: number
  building: Building
  configs: RestActionConfig[][]
  config: RestActionConfig = {
    cost: [{ itemId: "item_econ_coffee", num: 4 }, { itemId: "item_mat_water", num: 1 }, { itemId: "item_mat_wood", num: 1 }],
    makeTime: 60,
    effect: { spirit: 60, spirit_chance: 1 }
  }
  index: number = 0  // Rest action is index 0
  isActioning: boolean = false
  pastTime: number = 0
  totalTime: number = 0
  timerCallback: TimerCallback | null = null
  
  constructor(buildingId: number, buildingLevel: number, building: Building) {
    this.buildingId = buildingId
    this.buildingLevel = buildingLevel >= 0 ? buildingLevel : 0
    this.building = building
    const configs = buildActionConfig[String(buildingId)] as RestActionConfig[][]
    this.configs = configs || []
    this.updateConfig()
  }
  
  /**
   * Get current building level (updates dynamically)
   */
  getCurrentBuildLevel(): number {
    const buildingStore = useBuildingStore.getState()
    const build = buildingStore.getBuilding(this.buildingId)
    return build ? Math.max(0, build.level) : 0
  }
  
  /**
   * Update config based on current building level
   * Ported from buildAction.js:646-649
   */
  updateConfig(): void {
    const level = this.getCurrentBuildLevel()
    const effectiveLevel = level >= 0 ? level : 0
    
    if (this.configs && this.configs[effectiveLevel] && this.configs[effectiveLevel][this.index]) {
      this.config = this.configs[effectiveLevel][this.index]
      this.buildingLevel = effectiveLevel
    } else {
      // Fallback to level 0
      this.config = this.configs[0]?.[this.index] || {
        cost: [{ itemId: "item_econ_coffee", num: 4 }, { itemId: "item_mat_water", num: 1 }, { itemId: "item_mat_wood", num: 1 }],
        makeTime: 60,
        effect: { spirit: 60, spirit_chance: 1 }
      }
      this.buildingLevel = 0
    }
  }
  
  /**
   * Handle click action (start rest)
   * Ported from buildAction.js:654-685
   */
  clickAction1(): void {
    const playerStore = usePlayerStore.getState()
    
    // Check vigour (stub for now - TODO: implement vigour check)
    // if (!checkVigour()) return
    
    // Update config
    this.updateConfig()
    
    // Check if chair is built (need chair first)
    const buildingStore = useBuildingStore.getState()
    const chair = buildingStore.getBuilding(this.buildingId)
    if (!chair || chair.level < 0) {
      return
    }
    
    // Check if another action is active
    if (this.building.anyBtnActive() && this.building.activeBtnIndex !== 0) {
      return
    }
    
    // Disable back button
    emitter.emit('left_btn_enabled', false)
    
    // Set active button index
    this.building.setActiveBtnIndex(0)
    
    // Calculate time
    let time = this.config.makeTime * 60  // Convert minutes to seconds
    
    // TODO: Apply IAP bonus (30% reduction)
    // if (IAPPackage.isHandyworkerUnlocked()) {
    //   time = Math.round(time * 0.7)
    // }
    
    // Play sound
    audioManager.playEffect(SoundPaths.COFFEE_POUR)
    
    // Cost items
    ;(playerStore as any).costItems(this.config.cost)
    
    // Start timer
    const self = this
    const timeManager = game.getTimeManager()
    const timerCallback = new TimerCallback(
      time,
      this,
      {
        process: (dt: number) => {
          self.pastTime += dt
          self.totalTime = time
          // Emit update for UI progress
          emitter.emit('build_node_update')
        },
        end: () => {
          // Update last coffee time
          const currentPlayerStore = usePlayerStore.getState()
          ;(currentPlayerStore as any).lastCoffeeTime = timeManager.now()
          
          // Check achievements (stub for now)
          // self.config.cost.forEach(item => {
          //   Achievement.checkCost(item.itemId, item.num)
          // })
          
          // Play sound
          audioManager.playEffect(SoundPaths.GOLP)
          
          // Apply effect
          ;(currentPlayerStore as any).applyEffect(self.config.effect)
          
          // Log message
          const itemInfo = self.config.cost[0]
          const itemName = getString(itemInfo.itemId)?.title || `Item ${itemInfo.itemId}`
          const remainingCount = currentPlayerStore.storage[String(itemInfo.itemId)] || 0
          const logStore = useLogStore.getState()
          logStore.addLog(getString(1096, itemName, remainingCount) || 
            `You drank ${itemName} (stock: ${remainingCount})`)
          
          // Reset state
          self.building.resetActiveBtnIndex()
          self.isActioning = false
          self.pastTime = 0
          self.totalTime = 0
          self.timerCallback = null
          
          // Enable back button
          emitter.emit('left_btn_enabled', true)
          
          // Emit update signal
          emitter.emit('build_node_update')
        }
      }
    )
    
    this.timerCallback = timerCallback
    this.isActioning = true
    this.totalTime = time
    
    // Add timer to time manager
    timeManager.addTimerCallback(timerCallback)
    
    // Accelerate work time
    timeManager.accelerateWorkTime(time)
    
    // Emit update signal
    emitter.emit('build_node_update')
  }
  
  /**
   * Get display information for UI
   * Ported from buildAction.js:686-734
   */
  getDisplayInfo(): {
    iconName: string
    hint: string
    hintColor: string | null
    actionText: string
    disabled: boolean
    percentage: number
    items?: Array<{ itemId: string; num: number; color?: string }>
  } {
    this.updateConfig()
    
    const iconName = `build_action_${this.buildingId}_0.png`
    let time = this.config.makeTime
    
    // TODO: Apply IAP bonus
    // if (IAPPackage.isHandyworkerUnlocked()) {
    //   time = Math.round(time * 0.7)
    // }
    
    const actionText = getString(1014, time) || `Drink coffee (${time} m)`
    
    // Check if chair is built (need chair first)
    const buildingStore = useBuildingStore.getState()
    const chair = buildingStore.getBuilding(this.buildingId)
    if (!chair || chair.level < 0) {
      return {
        iconName,
        hint: getString(1013) || "You need a chair first!",
        hintColor: '#FF0000', // RED
        actionText,
        disabled: true,
        percentage: 0
      }
    }
    
    // Get building level for config
    const buildingLevel = this.getCurrentBuildLevel()
    
    // Check if actioning
    if (this.isActioning) {
      let hint = ""
      if (this.buildingLevel === 1) {
        hint = getString(1016) || "The soft couch and savory coffee make you relax."
      } else if (this.buildingLevel === 2) {
        hint = getString(1017) || "With coffee and music, you feel like you've gone back to happier times."
      } else {
        hint = getString(1015) || "You are enjoying a cup of hot coffee."
      }
      
      const percentage = this.totalTime > 0 ? Math.min(100, (this.pastTime / this.totalTime) * 100) : 0
      
      return {
        iconName,
        hint,
        hintColor: '#FFFFFF', // WHITE
        actionText,
        disabled: true,
        percentage
      }
    }
    
    // Not actioning - check items
    const playerStore = usePlayerStore.getState()
    const cost = this.config.cost
    const hasItems = (playerStore as any).validateItems(cost)
    
    const items = cost.map(itemInfo => {
      const haveNum = playerStore.storage[String(itemInfo.itemId)] || 0
      return {
        itemId: itemInfo.itemId,
        num: itemInfo.num,
        color: haveNum >= itemInfo.num ? '#FFFFFF' : '#FF0000'
      }
    })
    
    return {
      iconName,
      hint: "",
      hintColor: null,
      actionText,
      disabled: !hasItems || (this.building.anyBtnActive() && this.building.activeBtnIndex !== 0),
      percentage: 0,
      items
    }
  }
  
  /**
   * Save action state
   */
  save(): any {
    return {
      pastTime: this.pastTime,
      totalTime: this.totalTime,
      isActioning: this.isActioning
    }
  }
  
  /**
   * Restore action state
   */
  restore(saveObj?: any): void {
    if (saveObj) {
      this.pastTime = saveObj.pastTime || 0
      this.totalTime = saveObj.totalTime || 0
      this.isActioning = saveObj.isActioning || false
    }
    
    // If actioning, restart timer
    if (this.isActioning && this.totalTime > 0) {
      const timeManager = game.getTimeManager()
      const remainingTime = this.totalTime - this.pastTime
      
      if (remainingTime > 0) {
        const timerCallback = new TimerCallback(
          remainingTime,
          this,
          {
            process: (dt: number) => {
              this.pastTime += dt
              emitter.emit('build_node_update')
            },
            end: () => {
              // Same end logic as clickAction1
              const currentPlayerStore = usePlayerStore.getState()
              ;(currentPlayerStore as any).lastCoffeeTime = timeManager.now()
              audioManager.playEffect(SoundPaths.GOLP)
              ;(currentPlayerStore as any).applyEffect(this.config.effect)
              
              const itemInfo = this.config.cost[0]
              const itemName = getString(itemInfo.itemId)?.title || `Item ${itemInfo.itemId}`
              const remainingCount = currentPlayerStore.storage[String(itemInfo.itemId)] || 0
              const logStore = useLogStore.getState()
              logStore.addLog(getString(1096, itemName, remainingCount) || 
                `You drank ${itemName} (stock: ${remainingCount})`)
              
              this.building.resetActiveBtnIndex()
              this.isActioning = false
              this.pastTime = 0
              this.totalTime = 0
              this.timerCallback = null
              emitter.emit('left_btn_enabled', true)
              emitter.emit('build_node_update')
            }
          }
        )
        
        this.timerCallback = timerCallback
        timeManager.addTimerCallback(timerCallback)
        timeManager.accelerateWorkTime(remainingTime)
      } else {
        // Time already elapsed, complete immediately
        this.isActioning = false
        this.pastTime = 0
        this.totalTime = 0
      }
    }
  }
}

