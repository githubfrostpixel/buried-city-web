/**
 * Formula Stub Class
 * 
 * This is a minimal stub implementation for the Formula system.
 * Full implementation will be done in Phase 2.5 or Phase 3.
 * 
 * Formula represents a crafting recipe that can be produced at a building.
 */

export interface FormulaSaveData {
  id: number
  [key: string]: any
}

/**
 * Minimal Formula class stub
 * Used by Building class to store building actions (crafting recipes)
 */
export class Formula {
  id: number
  buildingId: number
  needBuild?: { bid: number; level: number }
  
  // Placeholder properties (will be implemented in full Formula system)
  step?: number
  isActioning?: boolean
  purchaseId?: number
  isLocked?: boolean
  
  constructor(id: number, buildingId: number) {
    this.id = id
    this.buildingId = buildingId
    this.step = 0
    this.isActioning = false
    this.isLocked = true
  }
  
  /**
   * Save formula state
   * Stub implementation - will be fully implemented later
   */
  save(): FormulaSaveData {
    return {
      id: this.id
      // Additional state will be saved in full implementation
    }
  }
  
  /**
   * Restore formula state
   * Stub implementation - will be fully implemented later
   */
  restore(saveData: FormulaSaveData | undefined): void {
    if (saveData) {
      // Restore state from save data
      // Full implementation will restore all formula properties
    }
  }
  
  /**
   * Check if formula can be made
   * Stub implementation - will be fully implemented later
   */
  canMake(): boolean {
    // Full implementation will check prerequisites, costs, etc.
    return false
  }
}

