/**
 * Building Store
 * Zustand store for managing building state
 * Manages Room instance and building placement, upgrades, and interactions
 * 
 * Used by:
 * - MainScene.tsx (building display and interactions)
 * - Game systems: Formula, BedAction, SaveSystem, FoodExpirationSystem
 * - Panels: HomePanelContent, BuildPanelContent, RecipeDialog, BuildDialog
 * - Components: BuildingButton, RadioPanelContent
 * - Game world: Building, Safe (inventory system)
 * - PlayerStore (for safe weight calculations)
 */

import { create } from 'zustand'
import { Room } from '@/game/world/Room'
import { Building } from '@/game/world/Building'
import type { BuildingSaveData, RoomSaveData } from '@/types/building.types'
import { game } from '@/game/Game'

interface BuildingStore {
  // Room instance
  room: Room | null
  
  // Actions
  initialize: () => void
  getBuilding: (id: number) => Building | null
  addBuilding: (building: Building) => void
  removeBuilding: (id: number) => void
  isBuildExist: (id: number, level?: number) => boolean
  updateBuilding: (id: number, updates: Partial<Building>) => void
  
  // Room management
  getBuildingsAtPosition: (x: number, y: number) => Building[]
  canPlaceBuilding: (x: number, y: number, id: number) => boolean
  placeBuilding: (id: number, x: number, y: number) => boolean
  
  // Save/load
  save: () => RoomSaveData
  restore: (saveData: RoomSaveData) => void
}

export const useBuildingStore = create<BuildingStore>((set, get) => ({
  room: null,
  
  initialize: () => {
    const timeManager = game.getTimeManager()
    const room = new Room(timeManager)
    room.initData()
    set({ room })
  },
  
  getBuilding: (id: number) => {
    const { room } = get()
    return room?.getBuilding(id) || null
  },
  
  addBuilding: (building: Building) => {
    const { room } = get()
    if (room) {
      // Building is already in room if created through room.createBuild
      // This method is for adding externally created buildings
      const existing = room.getBuilding(building.id)
      if (!existing) {
        // Add to room's internal map
        // Note: Room uses Map internally, so we need to access it
        // For now, use createBuild which handles this
        room.createBuild(building.id, building.level, building.save())
      }
    }
  },
  
  removeBuilding: (id: number) => {
    const { room } = get()
    room?.removeBuilding(id)
  },
  
  isBuildExist: (id: number, level?: number) => {
    const { room } = get()
    return room?.isBuildExist(id, level) || false
  },
  
  updateBuilding: (id: number, updates: Partial<Building>) => {
    const { room } = get()
    const building = room?.getBuilding(id)
    if (building) {
      Object.assign(building, updates)
    }
  },
  
  getBuildingsAtPosition: (x: number, y: number) => {
    const { room } = get()
    return room?.getBuildingsAtPosition(x, y) || []
  },
  
  canPlaceBuilding: (x: number, y: number, id: number) => {
    // TODO: Add validation logic (grid checks, overlapping, etc.)
    const { room } = get()
    const building = room?.getBuilding(id)
    return building !== null
  },
  
  placeBuilding: (id: number, x: number, y: number) => {
    const { room } = get()
    if (!room) return false
    const building = room.getBuilding(id)
    if (building) {
      return room.placeBuilding(building, x, y)
    }
    return false
  },
  
  save: () => {
    const { room } = get()
    return room?.save() || []
  },
  
  restore: (saveData: RoomSaveData) => {
    const timeManager = game.getTimeManager()
    const room = new Room(timeManager)
    room.restore(saveData)
    set({ room })
  }
}))

