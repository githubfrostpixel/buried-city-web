# Phase 1 Missing Items - Implementation Plan

## Overview

This document outlines the detailed implementation plan for completing Phase 1: Core Systems. The plan addresses 5 critical missing components identified in the Phase 1 status review.

---

## 1. Battle Store (`store/battleStore.ts`)

### Requirements Analysis

From `OriginalGame/src/game/Battle.js`, the battle system manages:
- Monster list and positions (6-line distance system)
- Player combat state (HP, weapons, ammo, tools)
- Battle result tracking (damage dealt, items consumed, win/loss)
- Escape/dodge mechanics
- Turn-based combat state

### Implementation Plan

**File**: `src/store/battleStore.ts`

**State Structure**:
```typescript
interface BattleStore {
  // Battle state
  isInBattle: boolean
  battleId: string | null
  
  // Monster state
  monsters: Monster[]
  playerDistance: number // 0-6 lines
  
  // Player combat state
  battlePlayer: {
    hp: number
    hpMax: number
    virus: number
    virusMax: number
    injury: number
    bulletNum: number
    homemadeNum: number
    toolNum: number
    weapon1: string | null // Gun
    weapon2: string | null // Melee
    equip: string | null // Tool
    defense: number
  } | null
  
  // Battle result tracking
  battleResult: {
    id: string
    underAtk: number
    totalVirus: number
    totalHarm: number
    weapon1: number // Uses
    weapon2: number // Uses
    bulletNum: number // Consumed
    homemadeNum: number // Consumed
    fuel: number
    tools: number
    win: boolean
    isDodge: boolean
    monsterKilledNum: number
  } | null
  
  // Escape state
  isDodging: boolean
  dodgeProgress: number // 0-1
  
  // Actions
  startBattle: (battleInfo: BattleInfo) => void
  endBattle: (result: BattleResult) => void
  updateMonster: (monsterId: number, updates: Partial<Monster>) => void
  updatePlayerDistance: (distance: number) => void
  updateBattlePlayer: (updates: Partial<BattleStore['battlePlayer']>) => void
  setDodging: (isDodging: boolean) => void
  updateDodgeProgress: (progress: number) => void
  resetBattle: () => void
}
```

**Implementation Steps**:
1. Create `battleStore.ts` with Zustand store
2. Define Monster type (from `combat.types.ts`)
3. Implement battle state management
4. Add battle result tracking
5. Export from `store/index.ts`

**Dependencies**:
- `types/combat.types.ts` - Monster, BattleState types
- `types/item.types.ts` - Item types for weapons

---

## 2. Player Store - Inventory System

### Requirements Analysis

From `OriginalGame/src/game/Storage.js` and `player.js`:
- **Bag**: Player's carried inventory with weight limit (40 base, +10/20/30 from items)
- **Storage**: Home storage (unlimited or large capacity)
- **Safe**: Protected storage (50 weight capacity, requires building level 20)
- **Equipment**: 5 slots (GUN, WEAPON, EQUIP, TOOL, SPECIAL)
- **Dog**: State tracking (hunger, mood, injury, active status)

### Implementation Plan

**File**: `src/store/playerStore.ts` (extend existing)

**Additional State to Add**:

```typescript
interface PlayerStore {
  // ... existing state ...
  
  // Inventory
  bag: Record<string, number> // itemId -> count
  storage: Record<string, number> // itemId -> count
  safe: Record<string, number> // itemId -> count
  
  // Equipment (5 slots)
  equipment: {
    gun: string | null // EquipmentPos.GUN = 0
    weapon: string | null // EquipmentPos.WEAPON = 1
    equip: string | null // EquipmentPos.EQUIP = 2
    tool: string | null // EquipmentPos.TOOL = 3
    special: string | null // EquipmentPos.SPECIAL = 4
  }
  
  // Dog state
  dog: {
    hunger: number
    hungerMax: number
    mood: number
    moodMax: number
    injury: number
    injuryMax: number
    active: boolean
  }
  
  // Inventory actions
  addItemToBag: (itemId: string, count: number) => boolean
  removeItemFromBag: (itemId: string, count: number) => boolean
  getBagItemCount: (itemId: string) => number
  getBagWeight: () => number
  getBagMaxWeight: () => number
  
  addItemToStorage: (itemId: string, count: number) => void
  removeItemFromStorage: (itemId: string, count: number) => void
  getStorageItemCount: (itemId: string) => number
  
  addItemToSafe: (itemId: string, count: number) => boolean
  removeItemFromSafe: (itemId: string, count: number) => void
  getSafeItemCount: (itemId: string) => number
  getSafeWeight: () => number
  getSafeMaxWeight: () => number
  
  // Equipment actions
  equipItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special', itemId: string | null) => boolean
  unequipItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special') => void
  getEquippedItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special') => string | null
  isEquipped: (itemId: string) => boolean
  
  // Dog actions
  updateDogHunger: (value: number) => void
  updateDogMood: (value: number) => void
  updateDogInjury: (value: number) => void
  setDogActive: (active: boolean) => void
}
```

**Implementation Steps**:
1. Extend `playerStore.ts` with inventory state
2. Implement bag weight calculation (base 40 + item bonuses)
3. Implement storage operations
4. Implement safe weight calculation (requires building check)
5. Implement equipment slot management
6. Implement dog state management
7. Add validation for item operations (weight limits, item existence)

**Weight Calculation Logic**:
- Bag base: 40
- +10 if storage has item 1305023
- +20 if storage has item 1305024
- +30 if storage has item 1305034
- +30 if IAP big bag unlocked (skip for now)

**Safe Weight Logic**:
- Max weight: 50 (if building 20 level >= 0), else 0
- Weight calculation: For weight=0 items, use ceil(count/50), else weight * count

**Dependencies**:
- `types/item.types.ts` - ItemConfig for weight/price
- `data/items.ts` - Item definitions
- Building system (for safe capacity check) - may need to defer building check

---

## 3. Save System - Zod Validation

### Requirements Analysis

The plan requires:
- Save data validation with Zod
- Complete save/load implementation
- Export/import save as JSON

### Implementation Plan

**File**: `src/game/systems/SaveSystem.ts` (extend existing)

**Zod Schema Creation**:

```typescript
// Create src/game/systems/saveSchemas.ts

import { z } from 'zod'
import type { SaveData } from '@/types/save.types'

// Player attributes schema
const PlayerAttributesSchema = z.object({
  hp: z.number().min(0),
  hpMax: z.number().min(0),
  spirit: z.number().min(0),
  spiritMax: z.number().min(0),
  starve: z.number().min(0),
  starveMax: z.number().min(0),
  vigour: z.number().min(0),
  vigourMax: z.number().min(0),
  injury: z.number().min(0),
  injuryMax: z.number().min(0),
  infect: z.number().min(0),
  infectMax: z.number().min(0),
  water: z.number().min(0),
  waterMax: z.number().min(0),
  virus: z.number().min(0),
  virusMax: z.number().min(0),
  temperature: z.number(),
  temperatureMax: z.number().min(0)
})

// Player save schema
const PlayerSaveDataSchema = z.object({
  attributes: PlayerAttributesSchema,
  level: z.number().int().min(1),
  exp: z.number().min(0),
  money: z.number().min(0),
  talent: z.array(z.string()),
  bag: z.record(z.string(), z.number().int().min(0)),
  storage: z.record(z.string(), z.number().int().min(0)),
  safe: z.record(z.string(), z.number().int().min(0)),
  equipment: z.object({
    gun: z.string().nullable(),
    weapon: z.string().nullable(),
    equip: z.string().nullable(),
    tool: z.string().nullable(),
    special: z.string().nullable()
  }),
  dog: z.object({
    hunger: z.number().min(0),
    hungerMax: z.number().min(0),
    mood: z.number().min(0),
    moodMax: z.number().min(0),
    injury: z.number().min(0),
    injuryMax: z.number().min(0),
    active: z.boolean()
  })
})

// Game save schema
const GameSaveDataSchema = z.object({
  time: z.number().min(0),
  season: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  day: z.number().int().min(0),
  weather: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
})

// Building save schema
const BuildingSaveDataSchema = z.object({
  id: z.number().int(),
  level: z.number().int().min(0),
  active: z.boolean(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }).optional()
})

// NPC save schema
const NPCSaveDataSchema = z.object({
  id: z.number().int(),
  friendship: z.number().min(0),
  visited: z.boolean(),
  lastVisitDay: z.number().int().optional()
})

// Site save schema
const SiteSaveDataSchema = z.object({
  id: z.number().int(),
  explored: z.boolean(),
  cleared: z.boolean(),
  // Add more site-specific save data as needed
})

// Complete save data schema
export const SaveDataSchema = z.object({
  version: z.string(),
  timestamp: z.number().int(),
  player: PlayerSaveDataSchema,
  game: GameSaveDataSchema,
  buildings: z.array(BuildingSaveDataSchema),
  npcs: z.array(NPCSaveDataSchema),
  sites: z.array(SiteSaveDataSchema)
})

export type ValidatedSaveData = z.infer<typeof SaveDataSchema>
```

**Updated SaveSystem Functions**:

```typescript
// In SaveSystem.ts

import { SaveDataSchema, type ValidatedSaveData } from './saveSchemas'

/**
 * Validate save data with Zod
 */
export function validateSaveData(data: unknown): ValidatedSaveData {
  try {
    return SaveDataSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Save data validation failed:', error.errors)
      throw new Error(`Invalid save data: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

/**
 * Save all game data with validation
 */
export async function saveAll(): Promise<void> {
  const { useGameStore } = await import('@/store/gameStore')
  const { usePlayerStore } = await import('@/store/playerStore')
  // Import other stores as needed (buildings, npcs, sites)
  
  const gameState = useGameStore.getState()
  const playerState = usePlayerStore.getState()
  
  const saveData: SaveData = {
    version: '1.0.0',
    timestamp: Date.now(),
    player: {
      attributes: {
        hp: playerState.hp,
        hpMax: playerState.hpMax,
        spirit: playerState.spirit,
        spiritMax: playerState.spiritMax,
        starve: playerState.starve,
        starveMax: playerState.starveMax,
        vigour: playerState.vigour,
        vigourMax: playerState.vigourMax,
        injury: playerState.injury,
        injuryMax: playerState.injuryMax,
        infect: playerState.infect,
        infectMax: playerState.infectMax,
        water: playerState.water,
        waterMax: playerState.waterMax,
        virus: playerState.virus,
        virusMax: playerState.virusMax,
        temperature: playerState.temperature,
        temperatureMax: playerState.temperatureMax
      },
      level: playerState.level,
      exp: playerState.exp,
      money: playerState.money,
      talent: playerState.talent,
      bag: playerState.bag || {},
      storage: playerState.storage || {},
      safe: playerState.safe || {},
      equipment: playerState.equipment || {
        gun: null,
        weapon: null,
        equip: null,
        tool: null,
        special: null
      },
      dog: playerState.dog || {
        hunger: 50,
        hungerMax: 100,
        mood: 50,
        moodMax: 100,
        injury: 0,
        injuryMax: 100,
        active: false
      }
    },
    game: {
      time: gameState.time,
      season: gameState.season,
      day: gameState.day,
      weather: gameState.weather
    },
    buildings: [], // TODO: Get from building store
    npcs: [], // TODO: Get from NPC store
    sites: [] // TODO: Get from site store
  }
  
  // Validate before saving
  const validated = validateSaveData(saveData)
  
  // Save to localforage
  await saveData('save', validated)
}

/**
 * Load all game data with validation
 */
export async function loadAll(): Promise<ValidatedSaveData | null> {
  const data = await loadData<SaveData>('save')
  
  if (!data) {
    return null
  }
  
  // Validate loaded data
  try {
    return validateSaveData(data)
  } catch (error) {
    console.error('Failed to validate loaded save data:', error)
    return null
  }
}

/**
 * Export save data as JSON string
 */
export async function exportSaveAsJSON(): Promise<string> {
  const data = await loadData<SaveData>('save')
  if (!data) {
    throw new Error('No save data to export')
  }
  return JSON.stringify(data, null, 2)
}

/**
 * Import save data from JSON string
 */
export async function importSaveFromJSON(jsonString: string): Promise<void> {
  try {
    const data = JSON.parse(jsonString)
    const validated = validateSaveData(data)
    await saveData('save', validated)
    
    // Optionally reload the game state
    // await restoreFromSave(validated)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format')
    }
    throw error
  }
}
```

**Implementation Steps**:
1. Create `src/game/systems/saveSchemas.ts` with Zod schemas
2. Update `SaveSystem.ts` to use validation
3. Complete `saveAll()` to collect all game state
4. Complete `loadAll()` with validation
5. Add `exportSaveAsJSON()` function
6. Add `importSaveFromJSON()` function
7. Add error handling for validation failures

**Dependencies**:
- `zod` package (already in dependencies)
- All store types (gameStore, playerStore, etc.)
- Building/NPC/Site stores (may need to create stubs if not ready)

---

## 4. Complete Save/Load Implementation

### Requirements

The `saveAll()` function needs to collect data from:
- Game store (time, weather, season)
- Player store (attributes, inventory, equipment, dog)
- Building system (building states)
- NPC system (NPC friendship, visits)
- Site system (explored sites, cleared sites)

### Implementation Plan

**File**: `src/game/systems/SaveSystem.ts`

**Additional Functions Needed**:

```typescript
/**
 * Restore game state from validated save data
 */
export async function restoreFromSave(saveData: ValidatedSaveData): Promise<void> {
  // Restore game state
  const { useGameStore } = await import('@/store/gameStore')
  const gameStore = useGameStore.getState()
  gameStore.setTime(saveData.game.time)
  gameStore.setSeason(saveData.game.season)
  gameStore.setWeather(saveData.game.weather)
  
  // Restore player state
  const { usePlayerStore } = await import('@/store/playerStore')
  const playerStore = usePlayerStore.getState()
  
  // Restore attributes
  Object.entries(saveData.player.attributes).forEach(([key, value]) => {
    playerStore.updateAttribute(key as keyof PlayerAttributes, value)
  })
  
  // Restore inventory
  playerStore.bag = saveData.player.bag
  playerStore.storage = saveData.player.storage
  playerStore.safe = saveData.player.safe
  
  // Restore equipment
  playerStore.equipment = saveData.player.equipment
  
  // Restore dog
  playerStore.dog = saveData.player.dog
  
  // Restore other player data
  playerStore.level = saveData.player.level
  playerStore.exp = saveData.player.exp
  playerStore.setCurrency(saveData.player.money)
  playerStore.talent = saveData.player.talent
  
  // TODO: Restore buildings, NPCs, sites when those systems are ready
}

/**
 * Auto-save on important actions
 */
export async function autoSave(): Promise<void> {
  try {
    await saveAll()
    console.log('Auto-save completed')
  } catch (error) {
    console.error('Auto-save failed:', error)
  }
}
```

**Implementation Steps**:
1. Complete `saveAll()` to collect all state
2. Implement `restoreFromSave()` to restore all state
3. Add `autoSave()` function for automatic saves
4. Integrate auto-save into key game actions (when those systems are ready)
5. Handle missing optional data gracefully

---

## 5. Export/Import Save as JSON

### Requirements

Users should be able to:
- Export their save file as a downloadable JSON file
- Import a save file from a JSON file
- Share save files between devices

### Implementation Plan

**File**: `src/game/systems/SaveSystem.ts` (extend existing)

**Functions** (already outlined in section 3):
- `exportSaveAsJSON()` - Returns JSON string
- `importSaveFromJSON()` - Parses and validates JSON

**UI Integration** (for future phases):
- Export button in settings menu
- Import button in save file selection
- File download/upload handling

**Implementation Steps**:
1. Implement `exportSaveAsJSON()` (see section 3)
2. Implement `importSaveFromJSON()` (see section 3)
3. Add file download helper (for browser)
4. Add file upload helper (for browser)
5. Test JSON export/import round-trip

**File Download Helper**:
```typescript
export function downloadSaveFile(jsonString: string, filename: string = 'buriedtown-save.json'): void {
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

**File Upload Helper**:
```typescript
export function readSaveFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        resolve(e.target.result)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('File read error'))
    reader.readAsText(file)
  })
}
```

---

## Implementation Order

### Phase 1A: Core Store Extensions (Priority: High)
1. **Battle Store** - Required for combat system
2. **Player Store Inventory** - Required for item management
3. **Player Store Equipment** - Required for combat
4. **Player Store Dog** - Required for dog companion

### Phase 1B: Save System Completion (Priority: High)
5. **Zod Schemas** - Foundation for validation
6. **Complete saveAll()** - Collect all game state
7. **Complete loadAll()** - Restore all game state
8. **Export/Import JSON** - User convenience

### Phase 1C: Integration (Priority: Medium)
9. **Auto-save integration** - Automatic saves on key actions
10. **Error handling** - Robust error messages
11. **Testing** - Verify save/load integrity

---

## Testing Checklist

### Battle Store
- [ ] Battle state initializes correctly
- [ ] Monster updates work
- [ ] Player distance updates
- [ ] Battle result tracking
- [ ] Escape/dodge state management

### Player Store Inventory
- [ ] Bag weight calculation (base + bonuses)
- [ ] Item add/remove operations
- [ ] Weight limit enforcement
- [ ] Storage operations
- [ ] Safe weight calculation (with building check)
- [ ] Equipment slot management
- [ ] Equipment validation (item must be in bag)
- [ ] Dog state management

### Save System
- [ ] Zod schema validation works
- [ ] saveAll() collects all state
- [ ] loadAll() restores all state
- [ ] Export JSON produces valid file
- [ ] Import JSON validates and loads
- [ ] Round-trip save/load preserves all data
- [ ] Invalid save data is rejected gracefully

---

## Dependencies & Blockers

### Blockers
- **Building system** - Required for safe weight calculation
  - **Solution**: Defer building check or use placeholder (always return 0 for now)

### Dependencies
- `types/combat.types.ts` - Already exists
- `types/item.types.ts` - Already exists
- `data/items.ts` - Need to verify item definitions exist
- Building store - May need to create stub
- NPC store - May need to create stub
- Site store - May need to create stub

---

## Notes

1. **Weight Calculation**: Bag weight bonuses depend on storage items. This creates a dependency where bag max weight depends on storage contents. Handle this carefully.

2. **Equipment Validation**: When equipping, item must exist in bag. When unequipping or item count reaches 0, auto-unequip.

3. **Save Data Versioning**: Use version string in save data for future migration support.

4. **Error Recovery**: If save data is corrupted or invalid, provide fallback to new game or last known good save.

5. **Performance**: Large inventories may slow down save/load. Consider optimization if needed.

---

## Estimated Time

- Battle Store: 2-3 hours
- Player Store Extensions: 4-5 hours
- Zod Schemas: 2-3 hours
- Complete Save/Load: 3-4 hours
- Export/Import: 1-2 hours
- Testing & Integration: 2-3 hours

**Total: ~14-20 hours**

---

## Next Steps

1. Review and approve this plan
2. Switch to ACT mode
3. Implement in order: Phase 1A → Phase 1B → Phase 1C
4. Test each component as implemented
5. Update PORTING_PLAN.md with completion status

