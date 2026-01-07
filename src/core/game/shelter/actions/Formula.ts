/**
 * Formula Class
 * 
 * Represents a crafting recipe that can be produced at a building.
 * Ported from OriginalGame/src/game/buildAction.js
 */

import { formulaConfig } from '@/core/data/formulas'
import type { FormulaConfig } from '@/common/types/formula.types'
import { usePlayerStore } from '@/core/store/playerStore'
import { useBuildingStore } from '@/core/store/buildingStore'
import type { BuildingCost } from '@/common/types/building.types'
import { game } from '@/core/game/Game'
import { TimerCallback } from '@/core/game/core/TimeManager'
import { emitter } from '@/common/utils/emitter'
import type { Building } from '@/core/game/shelter/Building'

export interface FormulaSaveData {
  id: number
  step?: number
  isActioning?: boolean
  pastTime?: number
  [key: string]: any
}

// Global flag preventing concurrent crafting (matches original game)
let BuildOccupied = false

export function getBuildOccupied(): boolean {
  return BuildOccupied
}

export function setBuildOccupied(value: boolean): void {
  BuildOccupied = value
}

/**
 * Formula class for crafting recipes
 */
export class Formula {
  id: number
  buildingId: number
  needBuild?: { bid: number; level: number }
  config: FormulaConfig | null
  
  // Recipe state
  step: number
  isActioning: boolean
  purchaseId?: number
  isLocked: boolean
  
  // Timer tracking
  pastTime: number = 0
  totalTime: number = 0
  timerCallback?: TimerCallback
  
  // Step system
  maxStep: number = 1
  
  // Building reference (needed for activeBtnIndex)
  building?: Building
  
  constructor(id: number, buildingId: number) {
    this.id = id
    this.buildingId = buildingId
    this.config = formulaConfig[String(id)] || null
    this.step = 0
    this.isActioning = false
    this.isLocked = true
    
    // Calculate maxStep based on config (2 if placedTime exists, 1 otherwise)
    // Original: this.maxStep = this.config["placedTime"] ? 2 : 1
    this.maxStep = this.config?.placedTime ? 2 : 1
  }
  
  /**
   * Get formula cost items
   */
  getCost(): BuildingCost[] {
    if (!this.config) {
      return []
    }
    return this.config.cost.map(c => ({
      itemId: c.itemId,
      num: c.num
    }))
  }
  
  /**
   * Get produced items
   */
  getProduce(): Array<{ itemId: number | string; num: number }> {
    if (!this.config) {
      return []
    }
    return this.config.produce
  }
  
  /**
   * Get make time in minutes
   */
  getMakeTime(): number {
    return this.config?.makeTime || 0
  }
  
  /**
   * Save formula state
   * Original: save: function () { return {step: this.step, pastTime: this.pastTime}; }
   */
  save(): FormulaSaveData {
    return {
      id: this.id,
      step: this.step,
      isActioning: this.isActioning,
      pastTime: this.pastTime
    }
  }
  
  /**
   * Restore formula state
   * Original: restore: function (saveObj) { if (saveObj) { this.step = saveObj.step; this.pastTime = saveObj.pastTime; if (this.step == 1) { this.place(); } } }
   */
  restore(saveData: FormulaSaveData | undefined): void {
    if (saveData) {
      if (saveData.step !== undefined) {
        this.step = saveData.step
      }
      if (saveData.isActioning !== undefined) {
        this.isActioning = saveData.isActioning
      }
      if (saveData.pastTime !== undefined) {
        this.pastTime = saveData.pastTime
      }
      // TODO: If step === 1, resume placement timer (this.place())
    }
  }
  
  /**
   * Check if formula can be made
   * Checks if player has all required items and building level requirement
   */
  canMake(): boolean {
    if (!this.config) {
      return false
    }
    
    // Check if locked
    if (this.isLocked) {
      return false
    }
    
    // Check if already crafting or completed
    if (this.isActioning || this.step !== 0) {
      return false
    }
    
    // Check building level requirement (needBuild)
    if (this.needBuild) {
      const buildingStore = useBuildingStore.getState()
      const requiredBuilding = buildingStore.getBuilding(this.needBuild.bid)
      const currentLevel = requiredBuilding ? requiredBuilding.level : -1
      
      if (currentLevel < this.needBuild.level) {
        return false
      }
    }
    
    // Check if player has all required items
    const playerStore = usePlayerStore.getState()
    const cost = this.getCost()
    
    for (const costItem of cost) {
      const itemId = String(costItem.itemId)
      const requiredCount = costItem.num
      
      const bagCount = playerStore.getBagItemCount(itemId)
      const storageCount = playerStore.getStorageItemCount(itemId)
      const totalCount = bagCount + storageCount
      
      if (totalCount < requiredCount) {
        return false
      }
    }
    
    return true
  }
  
  /**
   * Add timer for crafting/placement
   * Ported from buildAction.js addTimer() (lines 46-90)
   */
  addTimer(
    time: number,
    totalTime: number,
    endCb: () => void,
    notAccelerate: boolean = false,
    startTime?: number
  ): TimerCallback {
    this.isActioning = true
    this.pastTime = startTime || 0
    this.totalTime = totalTime
    
    // Get TimeManager from Game instance
    const timeManager = game.getTimeManager()
    
    // Calculate timer start time if resuming
    // Original: if (startTime) { timerStartTime = cc.timer.time - startTime; }
    let timerStartTime: number | undefined
    if (startTime !== undefined && startTime !== null) {
      timerStartTime = timeManager.now() - startTime
    }
    
    // Create timer callback
    // Original: var tcb = cc.timer.addTimerCallback(new TimerCallback(time, this, { process: ..., end: ... }), timerStartTime)
    const self = this
    const timerCallback = new TimerCallback(time, this, {
      process: (dt: number) => {
        self.pastTime += dt
        
        // Update UI progress (emit event for UI to listen)
        // Original: var percent = self.pastTime / self.totalTime * 100; self.view.updatePercentage(percent);
        const percent = (self.pastTime / self.totalTime) * 100
        emitter.emit('formula_progress', {
          formulaId: self.id,
          buildingId: self.buildingId,
          progress: percent
        })
      },
      end: () => {
        self.isActioning = false
        self.pastTime = 0
        
        if (endCb) {
          endCb()
        }
        
        // Original: self._sendUpdageSignal(); // Emit build_node_update
        emitter.emit('build_node_update')
      }
    })
    
    // Add to TimeManager
    this.timerCallback = timeManager.addTimerCallback(timerCallback, timerStartTime)
    
    // Accelerate work time if not disabled
    // Original: if (!notAccelerate) { cc.timer.accelerateWorkTime(time); }
    if (!notAccelerate) {
      timeManager.accelerateWorkTime(time)
    }
    
    return this.timerCallback
  }
  
  /**
   * Start placement phase (for recipes with placedTime)
   * Ported from buildAction.js Formula.place() (lines 122-156)
   */
  place(check: boolean = false): void {
    if (!this.config || !this.config.placedTime) {
      return // No placement time configured
    }
    
    // Get placedTime (it's an array, use first element)
    // Original: var time = this.config["placedTime"]; time *= 60;
    const placedTimeArray = this.config.placedTime
    let time = (Array.isArray(placedTimeArray) ? placedTimeArray[0] : placedTimeArray) * 60 // Convert minutes to seconds
    
    const self = this
    
    // If check is true, remove existing timer callback first
    // Original: if (check) { cc.timer.removeTimerCallback(this.tcb2); ... }
    if (check && this.timerCallback) {
      // TODO: Remove timer callback if needed
      // For now, just continue
    }
    
    // Reset pastTime for placement phase (start fresh)
    // Original uses this.pastTime for resume, but for fresh start it should be 0
    // When restoring from save, pastTime will be set from save data
    const startTime = check ? this.pastTime : 0
    
    // Start placement timer
    // Original: this.addTimer(time, time, function () { ... }, true, this.pastTime);
    // notAccelerate = true (don't accelerate work time for placement)
    // startTime = this.pastTime (resume from saved time if restoring) or 0 for fresh start
    this.addTimer(time, time, () => {
      // Placement completion callback
      // Original: if (self.step < self.maxStep) { self.step++; ... }
      if (self.step < self.maxStep) {
        self.step++
        
        // Original: player.log.addMsg(1091, ...);
        // TODO: Add log message when log system is ready
        // const itemInfo = self.config.produce[0]
        // const itemName = getItemName(itemInfo.itemId)
        // const buildingName = getBuildingName(self.buildingId)
        // player.log.addMsg(1091, buildingName, itemName) // or itemName, buildingName based on language
        
        // Original: utils.emitter.emit("placed_success", self.bid);
        emitter.emit('placed_success', self.buildingId)
        
        // Emit build_node_update to refresh UI
        emitter.emit('build_node_update')
      }
    }, true, startTime) // notAccelerate = true, startTime = startTime (0 for fresh, pastTime for restore)
  }
  
  /**
   * Take items after placement completes (equivalent to clickAction1 when step === 2)
   * Ported from buildAction.js Formula.clickAction1() (lines 207-230)
   */
  take(): boolean {
    // Original: else if (this.step == 2 || this.bid != 2)
    // Only allow when step === 2 (placement complete)
    if (this.step !== 2) {
      return false
    }
    
    if (!this.config) {
      return false
    }
    
    const playerStore = usePlayerStore.getState()
    
    // Apply weather effects to produce
    // Original: var produce = utils.clone(this.config.produce);
    const produce = this.getProduce().map(item => ({ ...item }))
    
    // TODO: Apply weather effects
    // Original weather effects:
    // - Distilled water (1101061): item.num += player.weather.getValue("item_1101061")
    // - Greenhouse (building 2): all items += player.weather.getValue("build_2")
    // For now, skip weather effects
    
    // Give items to player
    // Original: player.gainItems(produce);
    playerStore.gainItems(produce)
    
    // Original: produce.forEach(function (item) { Achievement.checkProduce(item.itemId, item.num); });
    // TODO: Check achievements
    // produce.forEach(item => {
    //   Achievement.checkProduce(item.itemId, item.num)
    // })
    
    // Reset step to 0
    // Original: this.step = 0;
    this.step = 0
    
    // Original: player.log.addMsg(1092, produce[0].num, itemName, player.storage.getNumByItemId(itemInfo.itemId));
    // TODO: Add log message
    // const itemInfo = produce[0]
    // const itemName = getItemName(itemInfo.itemId)
    // player.log.addMsg(1092, itemInfo.num, itemName, playerStore.getStorageItemCount(String(itemInfo.itemId)))
    
    // Reset active button
    // Original: this.build.resetActiveBtnIndex();
    if (this.building) {
      this.building.resetActiveBtnIndex()
    }
    
    // Original: Record.saveAll();
    // TODO: Save game
    // Record.saveAll()
    
    // Original: this._sendUpdageSignal();
    emitter.emit('build_node_update')
    
    return true
  }
  
  /**
   * Start crafting (equivalent to clickAction1 when step === 0)
   * Ported from buildAction.js Formula.clickAction1() (lines 157-207)
   */
  make(): boolean {
    // Pre-checks
    // Original: if (!uiUtil.checkVigour()) return;
    // TODO: Check vigour (stub for now)
    // if (!checkVigour()) return false
    
    // Original: if (BuildOccupied) { return; }
    if (BuildOccupied) {
      return false // Another action is active
    }
    
    // Original: if (this.step == 0) { ... }
    if (this.step !== 0) {
      // For now, only handle step === 0 (starting craft)
      // TODO: Handle step === 1 (placement) and step === 2 (take) later
      return false
    }
    
    // Check building level requirement (needBuild) - also checked in canMake, but double-check here
    if (this.needBuild) {
      const buildingStore = useBuildingStore.getState()
      const requiredBuilding = buildingStore.getBuilding(this.needBuild.bid)
      const currentLevel = requiredBuilding ? requiredBuilding.level : -1
      
      if (currentLevel < this.needBuild.level) {
        return false
      }
    }
    
    if (!this.canMake()) {
      return false // Cannot make (missing items, locked, etc.)
    }
    
    // Check if building has other active actions
    // Original: this.build.setActiveBtnIndex(this.idx);
    if (this.building && this.building.anyBtnActive()) {
      // Only allow if this formula is the active one
      // For now, check if building is upgrading
      if (this.building.isUpgrading) {
        return false
      }
    }
    
    // Initialize
    // Original: BuildOccupied = true;
    BuildOccupied = true
    
    if (this.building) {
      // Get formula index from building actions
      const index = this.building.actions.findIndex(a => a.id === this.id)
      if (index !== -1) {
        this.building.setActiveBtnIndex(index)
      }
    }
    
    // Original: utils.emitter.emit("left_btn_enabled", false);
    emitter.emit('left_btn_enabled', false)
    
    // Calculate time
    // Original: var time = this.config["makeTime"]; time *= 60;
    let time = this.getMakeTime() * 60 // Convert minutes to seconds
    
    // Original: if (IAPPackage.isHandyworkerUnlocked()) { time = Math.round(time * 0.7); }
    // TODO: Apply IAP bonus (stub for now)
    // if (IAPPackage.isHandyworkerUnlocked()) {
    //   time = Math.round(time * 0.7)
    // }
    
    // Deduct items IMMEDIATELY (before timer starts)
    // Original: player.costItems(this.config.cost); // Front-load item deduction to prevent bugs with NPC trading at 8PM
    const playerStore = usePlayerStore.getState()
    const cost = this.getCost()
    playerStore.costItems(cost)
    
    // Start timer
    // Original: this.addTimer(time, time, function () { ... });
    const self = this
    this.addTimer(time, time, () => {
      // Timer completion callback
      // Original: self.step++; if (self.step == self.maxStep) { self.step = 0; }
      self.step++
      if (self.step >= self.maxStep) {
        self.step = 0
      }
      
      // Original: BuildOccupied = false;
      BuildOccupied = false
      
      // Original: if (self.step == 1) { ... } else { ... }
      if (self.step === 1 && self.maxStep === 2) {
        // Placement recipe: start placement phase
        self.place()
      } else {
        // Non-placement recipe (like 1402021): give items immediately
        // Original: player.gainItems(self.config.produce);
        const produce = self.getProduce()
        playerStore.gainItems(produce)
        
        // Original: self.config.produce.forEach(function (item) { Achievement.checkMake(item.itemId, item.num); });
        // TODO: Check achievements
        // produce.forEach(item => {
        //   Achievement.checkMake(item.itemId, item.num)
        // })
        
        // Original: player.log.addMsg(1090, itemInfo.num, itemName, player.storage.getNumByItemId(itemInfo.itemId));
        // TODO: Add log message
        // const itemInfo = produce[0]
        // const itemName = getItemName(itemInfo.itemId)
        // player.log.addMsg(1090, itemInfo.num, itemName, playerStore.getStorageItemCount(String(itemInfo.itemId)))
        
        if (self.building) {
          self.building.resetActiveBtnIndex()
        }
        
        // Tutorial: Unlock gate when crafting first tool (recipe 1402021)
        // Original: if (self.build.id === 1 && userGuide.isStep(userGuide.stepName.TOOL_ALEX)) { userGuide.step(); player.room.createBuild(14, 0); }
        if (self.buildingId === 1 && self.id === 1402021) {
          // TODO: Check tutorial step
          // if (userGuide.isStep(userGuide.stepName.TOOL_ALEX)) {
          //   userGuide.step()
          //   // Create Gate (building 14, level 0)
          //   const buildingStore = useBuildingStore.getState()
          //   buildingStore.createBuilding(14, 0)
          // }
        }
      }
      
      // Original: utils.emitter.emit("left_btn_enabled", true);
      emitter.emit('left_btn_enabled', true)
      
      // Original: Record.saveAll();
      // TODO: Save game
      // Record.saveAll()
    })
    
    // Original: this._sendUpdageSignal();
    emitter.emit('build_node_update')
    return true
  }
}

