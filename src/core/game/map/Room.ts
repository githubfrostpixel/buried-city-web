/**
 * Room Class
 * Ported from OriginalGame/src/game/Build.js
 * 
 * Manages the collection of buildings in the player's home/base.
 */

import { Building } from '@/core/game/shelter/Building'
import type { BuildingSaveData, RoomSaveData } from '@/common/types/building.types'
import { TimeManager } from '@/core/game/core/TimeManager'
import { getString } from '@/common/utils/stringUtil'

/**
 * Initial building states for new game
 * Based on OriginalGame/src/game/Build.js initData()
 */
const INITIAL_BUILDINGS: Array<{ id: number; level: number }> = [
  { id: 1, level: 0 },   // Workbench
  { id: 2, level: -1 },   // Chemical bench
  { id: 3, level: -1 },   // Medical bench
  { id: 4, level: -1 },   // Stove
  { id: 5, level: -1 },   // Fireplace
  { id: 6, level: -1 },   // Water purifier
  { id: 7, level: -1 },   // Hare trap
  { id: 8, level: -1 },   // Garden
  { id: 9, level: -1 },   // Bed
  { id: 10, level: -1 },  // Storage shelf
  { id: 11, level: -1 },  // Fence
  { id: 12, level: -1 },  // Dog house
  { id: 13, level: 0 },   // Gate
  { id: 14, level: 0 },   // Toilet
  { id: 15, level: 0 },   // Minefield
  { id: 16, level: -1 },  // Radio
  { id: 17, level: 0 },   // Storeroom
  { id: 18, level: -1 },  // Electric stove
  { id: 19, level: -1 },  // Electric fence
  { id: 20, level: -1 },  // Safe
  { id: 21, level: -1 }   // Fridge
]

/**
 * Room class managing building collection
 */
export class Room {
  private buildings: Map<number, Building>
  private timeManager: TimeManager

  constructor(timeManager?: TimeManager) {
    this.buildings = new Map()
    // TimeManager is passed in or created new instance
    // Note: In practice, TimeManager should be a singleton from Game instance
    this.timeManager = timeManager || new TimeManager()
  }

  /**
   * Initialize default buildings for new game
   */
  initData(): void {
    for (const { id, level } of INITIAL_BUILDINGS) {
      this.createBuild(id, level)
    }
  }

  /**
   * Create a building
   */
  createBuild(
    bid: number | string,
    level: number,
    saveObj?: BuildingSaveData
  ): Building {
    const buildingId = Number(bid)
    const buildingLevel = Number(level)

    // Create building with building exists checker
    const building = new Building(
      buildingId,
      buildingLevel,
      saveObj,
      (checkBid: number, checkLevel: number) => {
        return this.isBuildExist(checkBid, checkLevel)
      },
      this.timeManager
    )

    this.buildings.set(buildingId, building)
    return building
  }

  /**
   * Get building by ID
   */
  getBuilding(id: number): Building | null {
    return this.buildings.get(id) || null
  }

  /**
   * Check if building exists
   * If level is not provided, checks if building exists at any level
   * If level is provided, checks if building exists at that level or higher
   */
  isBuildExist(bid: number, level?: number): boolean {
    const build = this.buildings.get(bid)
    
    if (!build) {
      return false
    }

    if (level === undefined) {
      return true
    }

    return build.level >= level
  }

  /**
   * Get buildings at a specific position
   * Note: Position system may be implemented later for grid placement
   */
  getBuildingsAtPosition(x: number, y: number): Building[] {
    const result: Building[] = []
    for (const building of this.buildings.values()) {
      if (building.position && building.position.x === x && building.position.y === y) {
        result.push(building)
      }
    }
    return result
  }

  /**
   * Place building at position
   */
  placeBuilding(building: Building, x: number, y: number): boolean {
    // TODO: Add validation for grid placement, overlapping, etc.
    building.position = { x, y }
    return true
  }

  /**
   * Remove building
   */
  removeBuilding(id: number): void {
    this.buildings.delete(id)
  }

  /**
   * Get all buildings
   */
  getAllBuildings(): Building[] {
    return Array.from(this.buildings.values())
  }

  /**
   * Get building count
   */
  getBuildingCount(): number {
    return this.buildings.size
  }

  /**
   * Save room state
   */
  save(): RoomSaveData {
    const saveData: BuildingSaveData[] = []
    for (const building of this.buildings.values()) {
      saveData.push(building.save())
    }
    return saveData
  }

  /**
   * Restore room state from save data
   */
  restore(saveData?: RoomSaveData): void {
    if (saveData && saveData.length > 0) {
      // Clear existing buildings
      this.buildings.clear()

      // Restore buildings from save data
      for (const buildingSave of saveData) {
        this.createBuild(buildingSave.id, buildingSave.level, buildingSave)
      }
    } else {
      // Initialize default buildings if no save data
      this.initData()
    }
  }

  /**
   * Get building name (for UI/logging)
   */
  getBuildCurrentName(id: number): string {
    const building = this.buildings.get(id)
    if (!building) {
      // Building doesn't exist - try to get name from level 0
      const buildingConfig0 = getString(`${id}_0`)
      if (typeof buildingConfig0 === 'object' && buildingConfig0 !== null && 'title' in buildingConfig0) {
        return buildingConfig0.title as string
      }
      return `Building ${id}` // Final fallback
    }
    
    const level = building.level
    // If building is not built (level -1), try level 0 instead
    const effectiveLevel = level < 0 ? 0 : level
    const stringId = `${id}_${effectiveLevel}`
    const buildingConfig = getString(stringId)
    
    if (typeof buildingConfig === 'object' && buildingConfig !== null && 'title' in buildingConfig) {
      return buildingConfig.title as string
    }
    
    // If current level doesn't work, try level 0 as fallback
    if (effectiveLevel !== 0) {
      const buildingConfig0 = getString(`${id}_0`)
      if (typeof buildingConfig0 === 'object' && buildingConfig0 !== null && 'title' in buildingConfig0) {
        return buildingConfig0.title as string
      }
    }
    
    return `Building ${id}` // Final fallback
  }
}

