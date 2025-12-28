# Phase 2: Home & Survival - Implementation Plan

## Overview

This document outlines the detailed implementation plan for Phase 2: Home & Survival. This phase focuses on implementing the core survival mechanics, item system, storage system, building system, and home scene UI.

**Prerequisites**: Phase 1 must be complete (TimeManager, SaveSystem, PlayerStore with inventory, AudioManager)

---

## 2.1 Survival System

### Requirements Analysis

From `OriginalGame/src/game/player.js` and `OriginalGame/src/data/playerConfig.js`:

**Hourly Attribute Decay**:
- Attributes decay based on `playerConfig.changeByTime` array (6 values for 6 hours)
- Temperature changes based on `playerConfig.temperature` array (season-based)
- Attributes: starve, vigour, water, infect, injury, virus, spirit, hp

**Attribute Range Effects**:
- Each attribute has range-based effects defined in `playerAttrEffect`
- Effects apply when attribute falls into specific ranges (e.g., starve < 25 = -5 spirit, +1.5 infect)
- Range parsing uses format like `[-,25]`, `(25,50]`, `(50,75]`, `(75,-]`

**Death Conditions**:
- HP reaches 0 (from injury, infection, or other damage)
- Virus overload (virus >= virusMax)
- Death from infection has special handling

**Sleep Mechanics**:
- Bed building required (building ID 9)
- Recovers vigour (energy) over time
- Time acceleration during sleep
- Cannot sleep if certain conditions not met

**Temperature Effects**:
- Temperature changes based on season and weather
- Fireplace building (ID 5) provides heating
- Low temperature causes infection increase
- Temperature range effects from `playerAttrEffect.temperature`

### Implementation Plan

**File**: `src/game/systems/SurvivalSystem.ts`

**Core Functions**:

```typescript
export class SurvivalSystem {
  /**
   * Process hourly attribute decay
   * Called by TimeManager on hourly callbacks
   */
  processHourlyDecay(): void
  
  /**
   * Apply attribute range effects
   * Checks each attribute against playerAttrEffect ranges
   */
  applyAttributeRangeEffects(): void
  
  /**
   * Check and handle death conditions
   * Returns death reason if player died
   */
  checkDeathConditions(): DeathReason | null
  
  /**
   * Process sleep mechanics
   * Called when player sleeps in bed
   */
  startSleep(): boolean
  processSleep(dt: number): void
  endSleep(): void
  
  /**
   * Update temperature based on season, weather, and buildings
   */
  updateTemperature(): void
  
  /**
   * Get attribute range info for a given attribute and value
   */
  getAttrRangeInfo(attr: string, value: number): AttributeRangeInfo | null
}
```

**Range Parser**:

**File**: `src/utils/range.ts` (extend existing)

Add function to parse range strings:
```typescript
/**
 * Parse range string like "[-,25]" or "(25,50]"
 * Returns { min: number | null, max: number | null, minInclusive: boolean, maxInclusive: boolean }
 */
export function parseRange(rangeStr: string): RangeResult
```

**Integration with TimeManager**:

- TimeManager should call `SurvivalSystem.processHourlyDecay()` on hourly callbacks
- TimeManager should call `SurvivalSystem.updateTemperature()` on time updates
- TimeManager should support time acceleration for sleep

**Death Handling**:

**File**: `src/types/game.types.ts` (extend)

```typescript
export type DeathReason = 
  | 'hp_zero'
  | 'virus_overload'
  | 'infection'
  | 'starvation'
  | 'thirst'
```

**Implementation Steps**:

1. Create `SurvivalSystem.ts` with core structure
2. Implement range parser in `utils/range.ts`
3. Implement hourly decay logic using `playerConfig.changeByTime`
4. Implement attribute range effects using `playerAttrEffect`
5. Implement temperature system using `playerConfig.temperature`
6. Implement death condition checking
7. Implement sleep mechanics
8. Integrate with TimeManager hourly callbacks
9. Add death overlay trigger when death detected
10. Test all survival mechanics

**Dependencies**:
- `data/player.ts` - playerConfig and playerAttrEffect
- `store/playerStore.ts` - Player attributes
- `store/gameStore.ts` - Time, season, weather
- `utils/range.ts` - Range parsing (extend)
- Building system (for fireplace, bed checks)

**Testing Checklist**:
- [ ] Hourly decay applies correctly for all attributes
- [ ] Attribute range effects trigger at correct thresholds
- [ ] Death conditions trigger correctly
- [ ] Sleep recovers vigour over time
- [ ] Temperature updates based on season/weather
- [ ] Fireplace affects temperature
- [ ] Range parser handles all range formats correctly

---

## 2.2 Item System

### Requirements Analysis

From `OriginalGame/src/game/Item.js`:

**Item Class**:
- Item ID-based lookup
- Config access (weight, price, value, effects)
- Type checking (by ID string parsing)
- Food/medicine effect access

**Item Categories**:
- Materials (wood, metal, cloth, etc.)
- Food (with expiration mechanics)
- Medicine (healing effects)
- Weapons (guns, melee)
- Tools
- Buff items

**Food Expiration**:
- Food items expire daily with probability
- Fridge building (ID 21) prevents expiration
- Expired food converts to fertilizer (if applicable)

### Implementation Plan

**File**: `src/game/inventory/Item.ts`

**Item Class**:

```typescript
export class Item {
  id: string
  config: ItemConfig
  
  constructor(id: string)
  
  getPrice(): number
  getValue(): number
  getWeight(): number
  getType(level: number): string
  isType(type1: string, type2: string): boolean
  getFoodEffect(): FoodEffect | undefined
  getMedicineEffect(): MedicineEffect | undefined
  getWeaponEffect(): WeaponEffect | undefined
  getArmorEffect(): ArmorEffect | undefined
  getToolEffect(): ToolEffect | undefined
  getBuffEffect(): BuffEffect | undefined
}
```

**Item Type Constants**:

**File**: `src/types/item.types.ts` (extend)

```typescript
export enum ItemType {
  // Main categories
  TOOL = "11",
  EQUIP = "13",
  MATERIAL = "01",
  MODEL = "02",
  FOOD = "03",
  MEDICINE = "04",
  ECONOMY = "05",
  SPECIFIC = "06",
  BUFF = "07",
  
  // Weapon subcategories
  GUN = "01",
  WEAPON = "02",
  WEAPON_TOOL = "03",
  DEFEND = "04",
  OTHER = "05"
}
```

**Food Expiration System**:

**File**: `src/game/systems/FoodExpirationSystem.ts`

```typescript
export class FoodExpirationSystem {
  /**
   * Process daily food expiration
   * Called by TimeManager on daily callbacks
   */
  processDailyExpiration(): void
  
  /**
   * Check if item is food
   */
  isFood(itemId: string): boolean
  
  /**
   * Get expiration rate for item
   */
  getExpirationRate(itemId: string): number
  
  /**
   * Get fertilizer conversion rate for item
   */
  getFertilizerRate(itemId: string): number
}
```

**Implementation Steps**:

1. Create `Item.ts` class with all methods
2. Extend `item.types.ts` with ItemType enum
3. Create `FoodExpirationSystem.ts` for expiration logic
4. Integrate expiration system with TimeManager daily callbacks
5. Add fridge building check for expiration prevention
6. Implement fertilizer conversion
7. Test item creation and type checking
8. Test food expiration mechanics

**Dependencies**:
- `data/items.ts` - ItemConfig definitions
- `types/item.types.ts` - Item types
- Building system (for fridge check)
- TimeManager (for daily callbacks)

**Testing Checklist**:
- [ ] Item class correctly loads config
- [ ] Item type parsing works correctly
- [ ] Food expiration processes daily
- [ ] Fridge prevents expiration
- [ ] Expired food converts to fertilizer
- [ ] All item effects accessible

---

## 2.3 Storage System

### Requirements Analysis

From `OriginalGame/src/game/Storage.js`:

**Storage Class**:
- Generic storage container
- Item storage as `Record<itemId, count>`
- Weight calculation
- Item stacking
- Transfer operations

**Storage Types**:
- **Bag**: Player's carried inventory (weight limit: 40 base + bonuses)
- **Storage**: Home storage (unlimited or large capacity)
- **Safe**: Protected storage (50 weight, requires building 20)

**Special Features**:
- Water auto-consumption (if includeWater flag)
- Random item selection (for raids/theft)
- Item validation

**Note**: Basic storage operations already exist in `playerStore.ts`. This section focuses on creating the Storage class for more complex operations.

### Implementation Plan

**File**: `src/game/inventory/Storage.ts`

**Storage Class**:

```typescript
export class Storage {
  name: string
  items: Record<string, number>
  maxWeight: number | null // null = unlimited
  
  constructor(name: string, maxWeight?: number)
  
  /**
   * Add item to storage
   */
  addItem(itemId: string, count: number, includeWater?: boolean): boolean
  
  /**
   * Remove item from storage
   */
  removeItem(itemId: string, count: number): boolean
  
  /**
   * Get item count
   */
  getItemCount(itemId: string): number
  
  /**
   * Get total weight
   */
  getWeight(): number
  
  /**
   * Check if can add item (weight check)
   */
  canAddItem(itemId: string, count: number): boolean
  
  /**
   * Transfer item to another storage
   */
  transferItem(itemId: string, count: number, target: Storage): boolean
  
  /**
   * Get random item (for raids)
   */
  getRandomItem(): { itemId: string; num: number } | null
  
  /**
   * Get rob item (for theft)
   */
  getRobItem(): { itemId: string; num: number } | null
  
  /**
   * Save/load state
   */
  save(): Record<string, number>
  restore(saveObj: Record<string, number>): void
}
```

**Specialized Storage Classes**:

**File**: `src/game/inventory/Bag.ts`

```typescript
export class Bag extends Storage {
  constructor()
  
  /**
   * Get max weight (base 40 + bonuses from storage items)
   */
  getMaxWeight(): number
}
```

**File**: `src/game/inventory/Safe.ts`

```typescript
export class Safe extends Storage {
  constructor()
  
  /**
   * Check if safe is available (building 20 level >= 0)
   */
  isAvailable(): boolean
  
  /**
   * Get max weight (50 if available, 0 otherwise)
   */
  getMaxWeight(): number
}
```

**Implementation Steps**:

1. Create base `Storage.ts` class
2. Implement weight calculation logic
3. Implement item add/remove operations
4. Implement transfer operations
5. Implement random item selection (for raids)
6. Create `Bag.ts` extending Storage
7. Create `Safe.ts` extending Storage
8. Integrate with playerStore (or refactor playerStore to use Storage classes)
9. Test all storage operations
10. Test weight limits

**Dependencies**:
- `data/items.ts` - ItemConfig for weight
- `types/item.types.ts` - Item types
- Building system (for safe availability check)
- `store/playerStore.ts` - May need refactoring

**Note**: Consider whether to refactor `playerStore.ts` to use Storage classes, or keep current implementation and use Storage classes only for complex operations.

**Testing Checklist**:
- [ ] Storage add/remove operations work
- [ ] Weight calculation correct
- [ ] Weight limits enforced
- [ ] Transfer between storages works
- [ ] Random item selection works
- [ ] Safe availability check works
- [ ] Bag max weight includes bonuses

---

## 2.4 Building System

### Requirements Analysis

From `OriginalGame/src/game/Build.js` and `OriginalGame/src/data/buildConfig.js`:

**Building Class**:
- Building ID and level
- Config per level (cost, createTime, condition, produceList)
- Upgrade system
- Active/inactive states
- Building actions (crafting recipes)

**21 Building Types**:
1. Workbench (ID 1) - Crafting
2. Chemical bench (ID 2) - Chemical crafting
3. Medical bench (ID 3) - Medicine crafting
4. Stove (ID 4) - Cooking
5. Fireplace (ID 5) - Heating
6. Water purifier (ID 6) - Water purification
7. Hare trap (ID 7) - Trap for resources
8. Garden (ID 8) - Food production
9. Bed (ID 9) - Sleep
10. Storage shelf (ID 10) - Storage
11. Fence (ID 11) - Defense
12. Dog house (ID 12) - Dog companion
13. Gate (ID 13) - Entrance
14. Toilet (ID 14) - Sanitation
15. Minefield (ID 15) - Defense
16. Radio (ID 16) - Communication
17. Storeroom (ID 17) - Storage
18. Electric stove (ID 18) - Cooking
19. Electric fence (ID 19) - Defense
20. Safe (ID 20) - Protected storage
21. Fridge (ID 21) - Food preservation

**Building Features**:
- Upgrade levels (0, 1, 2 typically)
- Construction costs and time
- Prerequisites (condition system)
- Active/inactive states
- Crafting recipes per building (produceList)
- Building actions (Formula system)

**Upgrade Types**:
- UPGRADABLE: Can upgrade
- MAX_LEVEL: Already at max level
- CONDITION: Prerequisites not met
- COST: Cannot afford upgrade cost

### Implementation Plan

**File**: `src/game/world/Building.ts`

**Building Class**:

```typescript
export enum BuildUpgradeType {
  UPGRADABLE = 1,
  MAX_LEVEL = 2,
  CONDITION = 3,
  COST = 4
}

export interface UpgradeResult {
  buildUpgradeType: BuildUpgradeType
  condition?: BuildingCondition
  cost?: BuildingCost[]
}

export class Building {
  id: number
  level: number
  configs: BuildingLevel[]
  currentConfig: BuildingLevel
  isUpgrading: boolean
  active: boolean
  position?: { x: number; y: number }
  activeBtnIndex: number // For UI state
  
  constructor(id: number, level?: number, saveObj?: BuildingSaveData)
  
  /**
   * Check if building needs to be built (level < 0)
   */
  needBuild(): boolean
  
  /**
   * Check if at max level
   */
  isMax(): boolean
  
  /**
   * Check if can upgrade
   */
  canUpgrade(): UpgradeResult
  
  /**
   * Start upgrade process
   */
  upgrade(processCb?: (progress: number) => void, endCb?: () => void): void
  
  /**
   * Get upgrade config for next level
   */
  getUpgradeConfig(): UpgradeConfig | null
  
  /**
   * Get building actions (crafting recipes)
   */
  getBuildActions(): Formula[]
  
  /**
   * Set active button index (for UI)
   */
  setActiveBtnIndex(index: number): void
  resetActiveBtnIndex(): void
  anyBtnActive(): boolean
  
  /**
   * Check if building needs warning (can upgrade/make/take)
   */
  needWarn(): { upgrade: boolean; make: boolean; take: boolean }
  
  /**
   * Save/load state
   */
  save(): BuildingSaveData
  restore(saveObj: BuildingSaveData): void
}
```

**Building Store**:

**File**: `src/store/buildingStore.ts`

```typescript
interface BuildingStore {
  buildings: Building[]
  
  // Actions
  getBuilding(id: number): Building | null
  addBuilding(building: Building): void
  removeBuilding(id: number): void
  isBuildExist(id: number, level: number): boolean
  updateBuilding(id: number, updates: Partial<Building>): void
  
  // Room management
  getBuildingsAtPosition(x: number, y: number): Building[]
  canPlaceBuilding(x: number, y: number, id: number): boolean
  placeBuilding(id: number, x: number, y: number): boolean
}
```

**Room System**:

**File**: `src/game/world/Room.ts`

```typescript
export class Room {
  buildings: Building[]
  gridWidth: number
  gridHeight: number
  
  constructor()
  
  /**
   * Get building by ID
   */
  getBuilding(id: number): Building | null
  
  /**
   * Check if building exists at level
   */
  isBuildExist(id: number, level: number): boolean
  
  /**
   * Get buildings at position
   */
  getBuildingsAtPosition(x: number, y: number): Building[]
  
  /**
   * Place building
   */
  placeBuilding(building: Building, x: number, y: number): boolean
  
  /**
   * Remove building
   */
  removeBuilding(id: number): void
  
  /**
   * Save/load state
   */
  save(): BuildingSaveData[]
  restore(saveData: BuildingSaveData[]): void
}
```

**Building Config Data**:

**File**: `src/data/buildings.ts` (create from buildConfig.js)

Convert `OriginalGame/src/data/buildConfig.js` to TypeScript format.

**Building Actions (Formula System)**:

**File**: `src/game/systems/CraftingSystem.ts` (Phase 2.5 or later)

This will handle crafting recipes. For Phase 2, focus on building structure.

**Implementation Steps**:

1. Create `Building.ts` class with core structure
2. Create `buildingStore.ts` for state management
3. Create `Room.ts` for building collection
4. Convert `buildConfig.js` to `data/buildings.ts`
5. Implement upgrade system
6. Implement prerequisite checking
7. Implement construction time system
8. Integrate with TimeManager for construction timers
9. Implement building actions initialization
10. Test building creation and upgrades
11. Test prerequisite system
12. Test construction timers

**Dependencies**:
- `data/buildings.ts` - Building configs (need to create)
- `types/building.types.ts` - Building types (exists)
- `store/playerStore.ts` - For cost validation
- `game/systems/TimeManager.ts` - For construction timers
- Formula/Crafting system (for building actions - may defer)

**Testing Checklist**:
- [ ] Building creation works
- [ ] Upgrade system works
- [ ] Prerequisites checked correctly
- [ ] Construction costs validated
- [ ] Construction timers work
- [ ] Building actions initialized
- [ ] Room placement works
- [ ] Building save/load works

---

## 2.5 Home Scene UI

### Requirements Analysis

From original game UI files:

**Home Scene Components**:
- Building grid layout (grid-based placement)
- Building interaction dialogs
- Status bars (HP, hunger, spirit, etc.)
- Top bar (time, weather, currency)
- Bottom bar (map, inventory, sleep buttons)

**Building Interaction**:
- Click building to open interaction panel
- Show upgrade options
- Show crafting recipes
- Show building status

### Implementation Plan

**File**: `src/components/scenes/MainScene.tsx` (extend existing)

Main game scene that contains home panel.

**File**: `src/components/panels/HomePanel.tsx`

**Home Panel Component**:

```typescript
export function HomePanel() {
  // Building grid display
  // Building click handlers
  // Building placement UI
}
```

**File**: `src/components/panels/BuildPanel.tsx`

**Building Interaction Panel**:

```typescript
export function BuildPanel({ buildingId }: { buildingId: number }) {
  // Building info display
  // Upgrade button and cost display
  // Crafting recipes list
  // Building actions
}
```

**File**: `src/components/layout/TopBar.tsx`

**Top Status Bar**:

```typescript
export function TopBar() {
  // Time display
  // Weather display
  // Currency display
  // Player attribute bars (HP, hunger, etc.)
}
```

**File**: `src/components/layout/BottomBar.tsx`

**Bottom Action Bar**:

```typescript
export function BottomBar() {
  // Map button
  // Inventory button
  // Sleep button
  // Other action buttons
}
```

**File**: `src/components/common/ProgressBar.tsx`

**Progress Bar Component**:

```typescript
export function ProgressBar({ 
  value, 
  max, 
  label, 
  color 
}: ProgressBarProps) {
  // Reusable progress bar for attributes
}
```

**File**: `src/components/common/StatusBar.tsx`

**Status Bar Component**:

```typescript
export function StatusBar({ 
  attribute, 
  label 
}: StatusBarProps) {
  // Attribute display with icon and bar
}
```

**Implementation Steps**:

1. Create `TopBar.tsx` with time, weather, currency
2. Create `BottomBar.tsx` with action buttons
3. Create `ProgressBar.tsx` component
4. Create `StatusBar.tsx` component
5. Create `HomePanel.tsx` with building grid
6. Create `BuildPanel.tsx` for building interactions
7. Integrate building click handlers
8. Add building placement UI
9. Add status bars to TopBar
10. Style components to match original game
11. Test all UI interactions
12. Test responsive layout

**Dependencies**:
- `store/gameStore.ts` - Time, weather
- `store/playerStore.ts` - Attributes, currency
- `store/buildingStore.ts` - Buildings
- `store/uiStore.ts` - UI state
- Building system (for building data)
- Sprite system (for building sprites)

**UI Design Notes**:
- Mobile-first design (640x1136 base resolution)
- Grid-based building layout
- Touch-friendly buttons
- Status bars should be compact but readable
- Match original game's visual style

**Testing Checklist**:
- [ ] TopBar displays time, weather, currency correctly
- [ ] Status bars update in real-time
- [ ] BottomBar buttons work
- [ ] Building grid displays correctly
- [ ] Building click opens interaction panel
- [ ] Building placement UI works
- [ ] BuildPanel shows upgrade options
- [ ] BuildPanel shows crafting recipes
- [ ] UI is responsive on mobile
- [ ] All buttons are touch-friendly

---

## Implementation Order

### Phase 2A: Core Survival (Priority: High)
1. **Survival System** - Foundation for all survival mechanics
2. **Range Parser** - Required for attribute effects
3. **Integration with TimeManager** - Hourly callbacks

### Phase 2B: Item & Storage (Priority: High)
4. **Item Class** - Required for all item operations
5. **Storage Classes** - Required for inventory management
6. **Food Expiration System** - Daily mechanics

### Phase 2C: Building System (Priority: High)
7. **Building Class** - Core building logic
8. **Building Store** - State management
9. **Room System** - Building collection
10. **Building Config Data** - Convert from original
11. **Upgrade System** - Building upgrades

### Phase 2D: UI Components (Priority: Medium)
12. **TopBar** - Status display
13. **BottomBar** - Action buttons
14. **HomePanel** - Building grid
15. **BuildPanel** - Building interactions
16. **Status Bars** - Attribute display

### Phase 2E: Integration & Polish (Priority: Medium)
17. **Integrate all systems** - Connect everything
18. **Sleep mechanics** - Complete sleep system
19. **Death handling** - Death overlay integration
20. **Testing** - Comprehensive testing

---

## Dependencies & Blockers

### Blockers
- **Building Config Data**: Need to convert `buildConfig.js` to TypeScript
  - **Solution**: Create conversion script or manual conversion
- **Formula/Crafting System**: Building actions depend on crafting system
  - **Solution**: Create stub system for Phase 2, implement fully in Phase 2.5 or Phase 3

### Dependencies
- `data/player.ts` - Already exists
- `data/items.ts` - Already exists
- `data/buildings.ts` - Need to create
- `store/playerStore.ts` - Already exists
- `store/gameStore.ts` - Already exists
- `store/buildingStore.ts` - Need to create
- `game/systems/TimeManager.ts` - Already exists
- `utils/range.ts` - Exists, may need extension

---

## Testing Strategy

### Unit Tests
- Survival system attribute decay
- Range parser
- Item class methods
- Storage operations
- Building upgrade logic

### Integration Tests
- Survival system with TimeManager
- Building system with playerStore
- UI components with stores
- Save/load with buildings

### Manual Testing
- Full survival gameplay loop
- Building construction and upgrades
- Item management
- UI responsiveness

---

## Estimated Time

- Survival System: 6-8 hours
- Item System: 3-4 hours
- Storage System: 4-5 hours
- Building System: 10-12 hours
- Home Scene UI: 8-10 hours
- Integration & Testing: 4-6 hours

**Total: ~35-45 hours**

---

## Next Steps

1. Review and approve this plan
2. Switch to ACT mode
3. Implement in order: Phase 2A → Phase 2B → Phase 2C → Phase 2D → Phase 2E
4. Test each component as implemented
5. Update PORTING_PLAN.md with completion status

---

## Notes

1. **Building Actions**: The Formula/Crafting system is complex and may need to be partially implemented in Phase 2, with full implementation in a later phase.

2. **Storage Refactoring**: Consider whether to refactor `playerStore.ts` to use Storage classes, or keep current implementation. Current implementation is functional, so refactoring is optional.

3. **UI Styling**: Match original game's visual style as closely as possible. Use sprite atlases for building graphics.

4. **Performance**: Building grid may have performance issues with many buildings. Consider optimization if needed.

5. **Save/Load**: Ensure all new systems integrate with SaveSystem for persistence.

