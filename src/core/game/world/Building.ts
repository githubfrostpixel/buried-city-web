/**
 * Building Class
 * Ported from OriginalGame/src/game/Build.js
 * 
 * Represents a building in the game with upgrade mechanics, construction timers, and crafting actions.
 */

import type {
  BuildingLevel,
  BuildingSaveData,
  UpgradeResult,
  UpgradeConfig
} from '@/shared/types/building.types'
import { BuildUpgradeType } from '@/shared/types/building.types'
import { buildingConfig } from '@/core/data/buildings'
import { Formula } from '@/core/game/systems/Formula'
import { BedAction, BedActionType } from '@/core/game/systems/BedAction'
import { TimeManager } from '@/core/game/systems/TimeManager'
import { TimerCallback } from '@/core/game/systems/TimeManager'
import { usePlayerStore } from '@/core/store/playerStore'
import { emitter } from '@/shared/utils/emitter'
import { audioManager, SoundPaths } from '@/core/game/systems/AudioManager'

/**
 * Type for checking if building exists (used by canUpgrade)
 */
type BuildingExistsChecker = (bid: number, level: number) => boolean

/**
 * Building class representing a single building instance
 */
export class Building {
  id: number
  level: number
  configs: BuildingLevel[]
  currentConfig: BuildingLevel
  isUpgrading: boolean
  active: boolean
  position?: { x: number; y: number }
  activeBtnIndex: number
  actions: Formula[]
  
  private checkBuildingExists: BuildingExistsChecker
  private timeManager: TimeManager

  constructor(
    id: number,
    level: number = 0,
    saveObj?: BuildingSaveData,
    checkBuildingExists?: BuildingExistsChecker,
    timeManager?: TimeManager
  ) {
    this.id = id
    this.level = level
    this.configs = JSON.parse(JSON.stringify(buildingConfig[String(id)] || [])) // Deep clone
    this.currentConfig = this.configs[Math.max(0, this.level)] || this.configs[0]
    this.isUpgrading = false
    this.active = true
    this.activeBtnIndex = -2
    this.actions = []
    
    // Dependencies
    this.checkBuildingExists = checkBuildingExists || (() => false)
    // TimeManager is passed in or created new instance
    // Note: In practice, TimeManager should be a singleton from Game instance
    this.timeManager = timeManager || new TimeManager()
    
    // Initialize building actions
    this.initBuildActions()
    
    // Restore from save data if provided
    this.restore(saveObj)
  }

  /**
   * Initialize building actions (formulas) from produceList
   * Special handling for bed (ID 9) - creates sleep actions instead of recipes
   */
  private initBuildActions(): void {
    // Special handling for bed (ID 9)
    if (this.id === 9) {
      this.initBedActions()
      return
    }
    
    // Normal recipe initialization for other buildings
    const produceList: Formula[] = []
    let levelIndex = 0
    
    for (const config of this.configs) {
      if (config.produceList) {
        for (const formulaId of config.produceList) {
          const formula = new Formula(formulaId, this.id)
          formula.needBuild = { bid: this.id, level: levelIndex }
          formula.building = this // Add building reference (needed for activeBtnIndex)
          // Unlock formula if building is at required level or higher
          if (this.level >= levelIndex) {
            formula.isLocked = false
          }
          produceList.push(formula)
        }
      }
      levelIndex++
    }
    
    this.actions = produceList
  }
  
  /**
   * Initialize bed sleep actions
   * Creates three sleep actions: 1 hour, 4 hours, until morning
   */
  private initBedActions(): void {
    const bedActions: BedAction[] = []
    
    // Create three sleep actions
    bedActions.push(
      new BedAction(this.id, this.level, BedActionType.SLEEP_1_HOUR, this),
      new BedAction(this.id, this.level, BedActionType.SLEEP_4_HOUR, this),
      new BedAction(this.id, this.level, BedActionType.SLEEP_ALL_NIGHT, this)
    )
    
    // Store as actions (type will be union of Formula | BedAction)
    this.actions = bedActions as any[]
  }

  /**
   * Check if building needs to be built (level < 0)
   */
  needBuild(): boolean {
    return this.level < 0
  }

  /**
   * Check if building is at max level
   */
  isMax(): boolean {
    return this.level >= this.configs.length - 1
  }

  /**
   * Check if building can upgrade
   */
  canUpgrade(): UpgradeResult {
    const result: UpgradeResult = {
      buildUpgradeType: BuildUpgradeType.UPGRADABLE
    }

    // 1. Check if there's a next level
    if (this.level >= this.configs.length - 1) {
      result.buildUpgradeType = BuildUpgradeType.MAX_LEVEL
      return result
    }

    // 2. Check prerequisites
    const nextLevel = this.level + 1
    const nextConfig = this.configs[nextLevel]
    if (nextConfig.condition) {
      const condition = nextConfig.condition
      if (condition.bid !== undefined && condition.level !== undefined) {
        if (!this.checkBuildingExists(condition.bid, condition.level)) {
          result.buildUpgradeType = BuildUpgradeType.CONDITION
          result.condition = condition
          return result
        }
      }
    }

    // 3. Check if player has required items
    const cost = nextConfig.cost
    const playerStore = usePlayerStore.getState()
    // Type assertion needed because TypeScript doesn't see the methods in interface
    if (!(playerStore as any).validateItems(cost)) {
      result.buildUpgradeType = BuildUpgradeType.COST
      result.cost = cost
      return result
    }

    return result
  }

  /**
   * Start upgrade process
   */
  upgrade(
    processCb?: (progress: number) => void,
    endCb?: () => void
  ): void {
    const nextLevel = this.level + 1
    const nextConfig = this.configs[nextLevel]
    const cost = nextConfig.cost

    // Deduct items from inventory
    const playerStore = usePlayerStore.getState()
    // Type assertion needed because TypeScript doesn't see the methods in interface
    ;(playerStore as any).costItems(cost)

    // Start upgrade
    this.isUpgrading = true
    let createTime = (nextConfig.createTime || 0) * 60 // Convert minutes to seconds
    
    // TODO: Apply IAPPackage.isHandyworkerUnlocked() bonus (30% reduction)
    // For now, use base time
    
    let pastTime = 0
    const self = this

    // Create timer callback
    const timerCallback = new TimerCallback(
      createTime,
      this,
      {
        process: (dt: number) => {
          pastTime += dt
          if (processCb) {
            processCb((pastTime / createTime) * 100)
          }
        },
        end: () => {
          self.isUpgrading = false
          self.afterUpgrade()
          if (endCb) {
            endCb()
          }
          // TODO: Add log message when log system is ready
          // player.log.addMsg(1089, player.room.getBuildCurrentName(self.id))
        }
      }
    )

    // Add timer callback
    this.timeManager.addTimerCallback(timerCallback)
    
    // Accelerate work time
    this.timeManager.accelerateWorkTime(createTime)
    
    // Set active button index
    this.setActiveBtnIndex(-1)
    
    // Emit build_node_update event for UI updates
    emitter.emit("build_node_update")
    
    // Play build upgrade sound (matches OriginalGame/src/game/Build.js:119)
    audioManager.playEffect(SoundPaths.BUILD_UPGRADE)
  }

  /**
   * Called after upgrade completes
   */
  private afterUpgrade(): void {
    this.level++
    this.currentConfig = this.configs[this.level]
    this.resetActiveBtnIndex()
    
    // Reinitialize actions for bed (to update action levels)
    if (this.id === 9) {
      this.initBedActions()
    } else {
      // Unlock formulas for the new level
      let levelIndex = 0
      for (const config of this.configs) {
        if (config.produceList && this.level >= levelIndex) {
          for (const formulaId of config.produceList) {
            const formula = this.actions.find(f => f.id === formulaId)
            if (formula && formula.needBuild?.level === levelIndex) {
              formula.isLocked = false
            }
          }
        }
        levelIndex++
      }
    }
    
    // Emit build_node_update event for UI updates
    emitter.emit("build_node_update")
    // TODO: Save game when save system integration is ready
    // Record.saveAll()
  }

  /**
   * Get upgrade configuration for next level
   */
  getUpgradeConfig(): UpgradeConfig | null {
    const nextLevel = this.level + 1
    const config = this.configs[nextLevel]
    
    if (config) {
      return {
        level: nextLevel,
        upgradeTime: config.createTime || 0,
        upgradeCost: config.cost
      }
    }
    
    return null
  }

  /**
   * Get building actions (crafting recipes)
   */
  getBuildActions(): Formula[] {
    // Apply special unlock logic for certain formulas
    this.actions.forEach((f) => {
      if (f.id === 1405024) {
        f.purchaseId = 105
        f.isLocked = false
      } else if (f.id === 1404024) {
        f.purchaseId = 106
        f.isLocked = false
      }
    })

    // Filter actions (placeholder - full filtering will be in Formula system)
    return this.actions.filter(() => true)
  }

  /**
   * Set active button index (for UI state)
   */
  setActiveBtnIndex(index: number): void {
    this.activeBtnIndex = index
  }

  /**
   * Reset active button index
   */
  resetActiveBtnIndex(): void {
    this.activeBtnIndex = -2
  }

  /**
   * Check if any button is active
   */
  anyBtnActive(): boolean {
    return this.activeBtnIndex !== -2
  }

  /**
   * Check if building needs warning (can upgrade/make/take)
   */
  needWarn(): { upgrade: boolean; make: boolean; take: boolean } {
    const upgradeResult = this.canUpgrade()
    const canUpgrade = upgradeResult.buildUpgradeType === BuildUpgradeType.UPGRADABLE
    
    const replacedSuccess = this.actions.some((action) => {
      return action.step === 2 && !action.isActioning
    })
    
    const canMake = this.actions.some((action) => {
      return action.step === 0 && !action.isActioning && action.canMake()
    })
    
    const isActioning = this.actions.some((action) => {
      return action.isActioning
    })

    const result = {
      upgrade: canUpgrade,
      make: canMake,
      take: replacedSuccess
    }

    if (isActioning) {
      result.upgrade = false
      result.make = false
      result.take = false
    }

    return result
  }

  /**
   * Save building state
   */
  save(): BuildingSaveData {
    const saveActions: Record<string, any> = {}
    this.actions.forEach((action) => {
      saveActions[String(action.id)] = action.save()
    })

    return {
      id: this.id,
      level: this.level,
      active: this.active,
      position: this.position,
      activeBtnIndex: this.activeBtnIndex,
      saveActions: saveActions
    }
  }

  /**
   * Restore building state from save data
   */
  restore(saveObj?: BuildingSaveData): void {
    if (saveObj) {
      const saveActions = saveObj.saveActions
      this.actions.forEach((action) => {
        const actionSaveData = saveActions?.[String(action.id)]
        action.restore(actionSaveData)
      })

      // Fix bug: ensure activeBtnIndex is restored if present
      if (saveObj.activeBtnIndex !== undefined && saveObj.activeBtnIndex !== null) {
        this.activeBtnIndex = saveObj.activeBtnIndex
      }

      if (saveObj.position) {
        this.position = saveObj.position
      }

      if (saveObj.active !== undefined) {
        this.active = saveObj.active
      }
    }
  }

  /**
   * Set building exists checker (used for prerequisite checking)
   */
  setBuildingExistsChecker(checker: BuildingExistsChecker): void {
    this.checkBuildingExists = checker
  }
}

