# Phase 2C: Building System - Preparation Plan

## Mode: PLAN

This document outlines the preparation steps needed before implementing Phase 2C: Building System. This plan identifies existing infrastructure, dependencies, and the detailed steps required to prepare for implementation.

---

## Current State Assessment

### ✅ Already Exists

1. **Type Definitions** (`src/types/building.types.ts`)
   - `BuildingCost` interface
   - `BuildingCondition` interface
   - `BuildingLevel` interface
   - `BuildingConfig` type
   - Basic `Building` interface (needs extension)

2. **Save System Integration**
   - `BuildingSaveDataSchema` in `src/game/systems/saveSchemas.ts`
   - Save data structure includes `buildings: Building[]`
   - SaveSystem has placeholder for buildings (line 172)

3. **Integration Points (Placeholders)**
   - `FoodExpirationSystem.ts` - Has TODO for fridge check (building ID 21)
   - `SurvivalSystem.ts` - Has TODO for fireplace check (building ID 5) and bed check (building ID 9)
   - `Safe.ts` - Has TODO for safe availability check (building ID 20)
   - `playerStore.ts` - Has TODO for building checks
   - `Game.ts` - Has TODO for fridge check

4. **Original Game Reference Files**
   - `OriginalGame/src/game/Build.js` - Complete building class implementation
   - `OriginalGame/src/data/buildConfig.js` - All 21 building configurations
   - `OriginalGame/src/game/Build.js` - Room class implementation

5. **TimeManager System**
   - Exists and supports timer callbacks
   - Has `addTimerCallback()` method for construction timers
   - Supports time acceleration (`accelerateWorkTime()`)

6. **PlayerStore**
   - Has `validateItems()` and `costItems()` methods (need to verify)
   - Has inventory management

### ❌ Missing / Needs Creation

1. **Core Building System Files**
   - `src/game/world/Building.ts` - Building class (does not exist)
   - `src/game/world/Room.ts` - Room class (does not exist)
   - `src/store/buildingStore.ts` - Building store (does not exist)
   - `src/data/buildings.ts` - Building config data (does not exist)

2. **Extended Type Definitions**
   - `BuildingSaveData` type (referenced but not defined)
   - Extended `Building` interface with all required properties
   - `BuildUpgradeType` enum
   - `UpgradeResult` interface
   - `UpgradeConfig` interface

3. **Building Config Data**
   - Need to convert `buildConfig.js` to TypeScript format
   - 21 buildings with multiple levels each
   - Each level has: cost, createTime, condition, produceList

4. **Formula/Crafting System** (Deferred)
   - Building actions depend on Formula system
   - Can create stub/placeholder for Phase 2C
   - Full implementation in Phase 2.5 or Phase 3

---

## Dependencies Analysis

### Required Dependencies (Available)

1. ✅ **TimeManager** (`src/game/systems/TimeManager.ts`)
   - Supports timer callbacks for construction
   - Has time acceleration support
   - **Integration**: Building upgrade will use `addTimerCallback()`

2. ✅ **PlayerStore** (`src/store/playerStore.ts`)
   - Has inventory management (addItemToBag, removeItemFromBag, etc.)
   - **Missing**: `validateItems(cost: BuildingCost[]): boolean` - needs to be created
   - **Missing**: `costItems(cost: BuildingCost[]): void` - needs to be created
   - **Integration**: Building upgrade cost validation and deduction

3. ✅ **SaveSystem** (`src/game/systems/SaveSystem.ts`)
   - Already has building save schema
   - **Integration**: Building save/load via buildingStore

4. ✅ **Item System** (`src/game/inventory/Item.ts`)
   - Item class exists
   - **Integration**: Building costs use item IDs

5. ✅ **Type Definitions** (`src/types/building.types.ts`)
   - Basic types exist, need extension

### Missing Dependencies (Can Defer)

1. ⚠️ **Formula/Crafting System**
   - Building actions (produceList) depend on Formula system
   - **Solution**: Create stub Formula class for Phase 2C
   - Store formula IDs in building actions, implement later

2. ⚠️ **BuildAction System**
   - Special building actions (TrapBuildAction, BedBuildAction, etc.)
   - **Solution**: Create stub system or defer to Phase 2.5

---

## Preparation Steps

### Step 1: Extend Type Definitions

**File**: `src/types/building.types.ts`

**Tasks**:
1. Add `BuildUpgradeType` enum
2. Add `UpgradeResult` interface
3. Add `UpgradeConfig` interface
4. Extend `Building` interface with all required properties:
   - `configs: BuildingLevel[]`
   - `currentConfig: BuildingLevel`
   - `isUpgrading: boolean`
   - `activeBtnIndex: number`
   - `actions: Formula[]` (or stub type)
5. Add `BuildingSaveData` interface (matches schema)
6. Add `RoomSaveData` type

**Reference**: Original `Build.js` lines 1-6, 509-568 in plan

---

### Step 2: Create PlayerStore Methods for Building Costs

**File**: `src/store/playerStore.ts`

**Tasks**:
1. **Create `validateItems(cost: BuildingCost[]): boolean`**
   - Check if player has all required items in bag or storage
   - BuildingCost format: `{ itemId: number | string, num: number }`
   - Check both bag and storage for items
   - Return true if all items available in sufficient quantities
   
2. **Create `costItems(cost: BuildingCost[]): void`**
   - Remove items from inventory when building upgrade starts
   - Try to remove from bag first, then storage if needed
   - Handle itemId as both number and string (convert to string for lookup)
   - Should only be called after validateItems returns true

**Implementation Notes**:
- Item IDs in BuildingCost may be numbers, but playerStore uses string keys
- Need to convert itemId to string for lookup: `String(costItem.itemId)`
- Check both bag and storage, remove from bag first, then storage

**Reference**: Original `Build.js` lines 81, 92

---

### Step 3: Create Building Config Data

**File**: `src/data/buildings.ts`

**Tasks**:
1. Read `OriginalGame/src/data/buildConfig.js` completely
2. Convert to TypeScript format:
   - Use `BuildingConfig` type
   - Convert all 21 buildings
   - Ensure proper typing for:
     - `itemId` in costs (number | string)
     - `produceList` (number[] - formula IDs)
     - `condition` (BuildingCondition)
     - `createTime` (number in minutes)
3. Export as `buildingConfig: BuildingConfig`
4. Update `src/data/index.ts` to export buildings

**Structure**:
```typescript
export const buildingConfig: BuildingConfig = {
  "1": [ /* Workbench levels */ ],
  "2": [ /* Chemical bench levels */ ],
  // ... all 21 buildings
}
```

**Reference**: `OriginalGame/src/data/buildConfig.js` (710 lines)

---

### Step 4: Create Formula Stub (For Building Actions)

**File**: `src/game/systems/Formula.ts` (or stub)

**Tasks**:
1. Create minimal Formula class/stub:
   - `id: number` (formula ID)
   - `buildingId: number`
   - `needBuild?: { bid: number; level: number }`
   - `save()` and `restore()` methods (stubs)
2. This allows Building class to initialize actions
3. Full Formula implementation deferred to Phase 2.5

**Alternative**: Use `any[]` for actions temporarily, implement later

**Reference**: Original `Build.js` lines 20-32, 142-160

---

### Step 5: Create Directory Structure

**Tasks**:
1. Ensure `src/game/world/` directory exists (currently empty)
2. Create placeholder files if needed:
   - `src/game/world/Building.ts`
   - `src/game/world/Room.ts`

---

### Step 6: Review TimeManager Integration

**File**: `src/game/systems/TimeManager.ts`

**Tasks**:
1. Verify `addTimerCallback()` signature matches needs
2. Verify `accelerateWorkTime()` exists (for construction speed-up)
3. Document integration pattern:
   - Building upgrade creates TimerCallback
   - Process callback updates progress
   - End callback completes upgrade

**Reference**: Original `Build.js` lines 103-114

---

### Step 7: Review SaveSystem Integration

**File**: `src/game/systems/SaveSystem.ts`

**Tasks**:
1. Verify `BuildingSaveDataSchema` matches our needs
2. Check if save schema needs extension:
   - `activeBtnIndex` (for UI state)
   - `saveActions` (for formula states - may defer)
3. Update SaveSystem to integrate with buildingStore (when created)

**Current Schema** (from `saveSchemas.ts`):
```typescript
{
  id: number
  level: number
  active: boolean
  position?: { x: number; y: number }
}
```

**May Need**:
```typescript
{
  id: number
  level: number
  active: boolean
  position?: { x: number; y: number }
  activeBtnIndex?: number
  saveActions?: Record<string, any> // For formula states
}
```

---

### Step 8: Document Building Initialization

**Tasks**:
1. Document initial building states from `OriginalGame/src/game/Build.js` lines 323-366
2. Create initialization data structure:
   - Which buildings start at level -1 (need to build)
   - Which buildings start at level 0 (already built)
3. This will be used in Room.initData()

**Initial Building States**:
- Level -1 (need build): 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 15, 16, 18, 19, 20, 21
- Level 0 (built): 1, 13, 14, 17

---

### Step 9: Identify Special Building Types

**Tasks**:
1. Review `OriginalGame/src/game/Build.js` for special building classes:
   - `TrapBuild` (ID 7 - Hare trap)
   - `SafeBuild` (ID 20 - Safe)
   - `DogBuild` (ID 12 - Dog house)
   - `RestBuild` (ID 14 - Toilet)
   - `BedBuild` (ID 9 - Bed)
   - `BonfireBuild` (ID 5 - Fireplace)
   - `BombBuild` (ID 15 - Minefield)
   - `ElectricStoveBuild` (ID 18)
   - `FridgeBuild` (ID 21)
   - `ElectricFenceBuild` (ID 19)
2. Document which buildings need special handling
3. Decide: Implement as separate classes or use flags in base Building class?

**Recommendation**: Start with base Building class, add special handling via methods/flags. Can refactor to subclasses later if needed.

---

### Step 10: Plan Building Store Structure

**File**: `src/store/buildingStore.ts` (to be created)

**Tasks**:
1. Design Zustand store structure:
   - `buildings: Building[]` or `buildings: Map<number, Building>`
   - Actions for CRUD operations
   - Room management methods
2. Consider: Should Room be separate class or part of store?
   - **Option A**: Room as separate class, store manages Room instance
   - **Option B**: Room logic in store directly
   - **Recommendation**: Option A (matches original structure)

---

## Implementation Order (After Preparation)

Once preparation is complete, implement in this order:

1. **Extend Types** - Complete all type definitions
2. **Create Building Config** - Convert buildConfig.js to TypeScript
3. **Create Building Class** - Core building logic
4. **Create Room Class** - Building collection and management
5. **Create Building Store** - Zustand store for state
6. **Integrate with TimeManager** - Construction timers
7. **Integrate with SaveSystem** - Save/load buildings
8. **Integrate with PlayerStore** - Cost validation
9. **Update Integration Points** - Remove TODOs in other systems
10. **Test** - Building creation, upgrades, save/load

---

## Blockers & Considerations

### Blockers

1. **Formula System Dependency**
   - **Impact**: Building actions (produceList) won't work fully
   - **Solution**: Create stub Formula class, implement fully in Phase 2.5
   - **Status**: Can proceed with stub

2. **BuildAction System Dependency**
   - **Impact**: Special building actions won't work
   - **Solution**: Defer special actions, implement base building first
   - **Status**: Can proceed without special actions

### Considerations

1. **Building Actions Initialization**
   - Original code initializes actions from produceList
   - For Phase 2C, can store formula IDs without full Formula objects
   - Full implementation when Formula system is ready

2. **Active/Inactive States**
   - Some buildings have `isActive()` methods (Safe, Dog, Fireplace, etc.)
   - Need to implement these checks
   - May require other systems (dog state, site state)

3. **Construction Time Acceleration**
   - Original code checks `IAPPackage.isHandyworkerUnlocked()` for 30% time reduction
   - Can implement as configurable bonus later
   - For now, use base construction time

4. **Building Position System**
   - Original code doesn't show explicit grid system in Build.js
   - Room uses `map` object keyed by building ID
   - Grid placement may be UI-only concern
   - Start with simple building collection, add grid later if needed

5. **Save Actions State**
   - Original code saves formula states in building save data
   - For Phase 2C, can save empty object `{}` for saveActions
   - Implement fully when Formula system is ready

---

## Files to Create/Modify

### New Files
1. `src/game/world/Building.ts`
2. `src/game/world/Room.ts`
3. `src/store/buildingStore.ts`
4. `src/data/buildings.ts`
5. `src/game/systems/Formula.ts` (stub, optional)

### Files to Modify
1. `src/types/building.types.ts` - Extend types (add enums, interfaces)
2. `src/data/index.ts` - Export buildings config
3. `src/store/playerStore.ts` - **Add** `validateItems()` and `costItems()` methods
4. `src/game/systems/saveSchemas.ts` - Extend BuildingSaveData if needed (activeBtnIndex, saveActions)
5. `src/game/systems/SaveSystem.ts` - Integrate buildingStore for save/load
6. `src/game/systems/FoodExpirationSystem.ts` - Remove TODO, add fridge check (building ID 21)
7. `src/game/systems/SurvivalSystem.ts` - Remove TODOs, add building checks (fireplace ID 5, bed ID 9)
8. `src/game/inventory/Safe.ts` - Remove TODO, add building check (building ID 20)
9. `src/game/Game.ts` - Remove TODO, add fridge check (building ID 21)

---

## Testing Preparation

### Test Cases to Prepare

1. **Building Creation**
   - Create building with initial level
   - Create building from save data
   - Initialize Room with default buildings

2. **Building Upgrade**
   - Check upgrade prerequisites
   - Validate upgrade costs
   - Start upgrade process
   - Complete upgrade after timer

3. **Building State**
   - Check if building needs to be built (level < 0)
   - Check if building is at max level
   - Check active/inactive states

4. **Room Management**
   - Get building by ID
   - Check if building exists at level
   - Save/load room state

5. **Integration**
   - Building costs deducted from inventory
   - Construction timers work correctly
   - Buildings save/load correctly
   - Fridge check works for food expiration
   - Fireplace check works for temperature
   - Bed check works for sleep
   - Safe check works for safe availability

---

## Questions for Clarification

1. **Building Actions (Formula System)**
   - Should we create a minimal Formula stub now, or use `any[]` temporarily?
   - **Recommendation**: Create minimal stub with id, buildingId, save/restore

2. **Special Building Classes**
   - Should we implement special building types (TrapBuild, SafeBuild, etc.) now or later?
   - **Recommendation**: Start with base Building class, add special handling via methods

3. **Building Position/Grid**
   - Is grid placement needed for Phase 2C, or can we defer to Phase 2D (UI)?
   - **Recommendation**: Defer grid to UI phase, use simple building collection for now

4. **Room vs BuildingStore**
   - Should Room be a separate class or integrated into buildingStore?
   - **Recommendation**: Separate Room class, buildingStore manages Room instance

5. **Construction Time Bonus**
   - Should we implement IAPPackage check now or later?
   - **Recommendation**: Defer to later, use base construction time for now

---

## Next Steps

1. **Review this preparation plan**
2. **Answer clarification questions** (if any)
3. **Approve preparation steps**
4. **Execute preparation** (if approved)
5. **Switch to ACT mode** for implementation

---

## Summary

This preparation plan identifies:
- ✅ What already exists (types, save schemas, integration points)
- ❌ What needs to be created (Building class, Room class, buildingStore, building config)
- 🔗 Dependencies and integration points
- 📋 Step-by-step preparation checklist
- ⚠️ Blockers and considerations
- ❓ Questions for clarification

Once preparation is complete, we'll have:
- Complete type definitions
- Building config data converted to TypeScript
- Verified dependencies
- Clear implementation path
- Stub systems for deferred features

**Ready to proceed with preparation?** Please review and let me know if you'd like any clarifications or changes to the plan.

