# Bed Build Implementation Plan

## Overview

This plan covers implementing bed building functionality and cross-checking it with the original game. The bed (building ID 9) is a special building that has sleep actions instead of crafting recipes.

**Original Game References:**
- `OriginalGame/src/game/Build.js` - `BedBuild` class (lines 244-256)
- `OriginalGame/src/game/buildAction.js` - `BedBuildAction` class (lines 843-958)
- `OriginalGame/src/data/buildActionConfig.js` - Bed action config (lines 13-19)
- `OriginalGame/src/ui/buildNode.js` - Bed UI handling (lines 167-168, 361-395)
- `OriginalGame/src/ui/uiUtil.js` - `showBuildDialog()` and `showBuildActionDialog()` (lines 726-764, 766-805)

---

## 1. Original Game Analysis

### 1.1 Bed Building Structure

**Building ID:** 9

**Initial State:**
- Starts at level -1 (needs to be built)
- Created in `Room.initData()`: `this.createBuild(9, -1)`

**Building Levels:**
- Level 0: Basic bed (sleeping bag)
- Level 1: Improved bed
- Level 2: Best bed

**Building Config (from `buildings.ts`):**
```typescript
"9": [
  {
    id: 9,
    cost: [
      { itemId: 1101031, num: 6 },
      { itemId: 1101041, num: 2 }
    ],
    createTime: 60,
    condition: { bid: 1, level: 0 },
    produceList: []  // No crafting recipes
  },
  {
    id: 9,
    cost: [
      { itemId: 1101011, num: 2 },
      { itemId: 1101031, num: 12 },
      { itemId: 1101041, num: 4 }
    ],
    createTime: 120,
    condition: { bid: 1, level: 1 },
    produceList: []
  },
  {
    id: 9,
    cost: [
      { itemId: 1101011, num: 4 },
      { itemId: 1101021, num: 6 },
      { itemId: 1101031, num: 18 },
      { itemId: 1101041, num: 8 }
    ],
    createTime: 180,
    condition: { bid: 1, level: 2 },
    produceList: []
  }
]
```

### 1.2 Bed Build Class

**Original Implementation:**
```javascript
var BedBuild = Build.extend({
    ctor: function (bid, level) {
        this._super(bid, level);
    },
    initBuildActions: function () {
        for (var type in BedBuildActionType) {
            var action = new BedBuildAction(this.id, this.level, BedBuildActionType[type]);
            this.actions.push(action);
        }
    },
    restore: function (opt) {
    }
});
```

**Key Points:**
- Bed has NO crafting recipes (produceList is empty)
- Bed has 3 sleep actions instead:
  1. Sleep 1 Hour
  2. Sleep 4 Hours
  3. Sleep Until Morning
- Actions are created in `initBuildActions()` using `BedBuildActionType` enum

### 1.3 Bed Build Action Types

**Original Implementation:**
```javascript
var BedBuildActionType = {
    SLEEP_1_HOUR: 1,
    SLEEP_4_HOUR: 2,
    SLEEP_ALL_NIGHT: 3
}
```

**Action Icons:**
- `build_action_9_0.png` - Sleep 1 Hour
- `build_action_9_1.png` - Sleep 4 Hours
- `build_action_9_2.png` - Sleep Until Morning

### 1.4 Bed Build Action Config

**From `buildActionConfig.js`:**
```javascript
"9": [{
    "rate": 0.6  // Level 0
}, {
    "rate": 0.8  // Level 1
}, {
    "rate": 1   // Level 2
}]
```

**Key Points:**
- Config only contains `rate` (recovery rate per hour)
- Rate increases with bed level (0.6 → 0.8 → 1.0)
- No cost, no makeTime (sleep is instant to start)
- Effect calculation happens in `BedBuildAction.clickAction1()`

### 1.5 Bed Build Action Behavior

**Sleep Time Calculation:**
```javascript
switch (this.type) {
    case BedBuildActionType.SLEEP_1_HOUR:
        time = 1 * 60 * 60;  // 1 hour in seconds
        break;
    case BedBuildActionType.SLEEP_4_HOUR:
        time = 4 * 60 * 60;  // 4 hours in seconds
        break;
    case BedBuildActionType.SLEEP_ALL_NIGHT:
        time = cc.timer.getTimeFromNowToMorning();  // Until morning
        break;
}
```

**Effect Calculation:**
```javascript
var effect = this.config["effect"];  // Note: effect is calculated from rate
var hours = time / 60 / 60;
var totalEffect = {};
for (var key in effect) {
    if (key.indexOf("_chance") === -1) {
        totalEffect[key] = Math.ceil(effect[key] * hours);
    } else {
        totalEffect[key] = effect[key];
    }
}
```

**Note:** The original code references `this.config["effect"]`, but `buildActionConfig[9]` only has `rate`. The effect must be calculated from the rate and player attributes (see `player.js` lines 848-864).

**Player Sleep Effect (from `player.js`):**
```javascript
var bedLevel = player.room.getBuildLevel(9);
if (bedLevel < 0) {
    bedLevel = 2;  // Default to level 2 if bed not built
}
var bedRate = buildActionConfig[9][bedLevel].rate;
// Calculate actual rate based on satiety and mood
bedRate = bedRate * 0.5 + this.starve / this.starveMax * 0.2 + this.spirit / this.spiritMax * 0.3;
// Calculate recovery per hour
var vigour = bedRate * 15;
var hp = bedRate * 20;
```

### 1.6 Bed UI Display

**In Build Panel (`buildNode.js`):**
- Bed actions are displayed like crafting recipes
- Each action shows:
  - Icon: `build_action_9_{type-1}.png`
  - Hint text (sleep duration)
  - Action button: "Sleep" (string 1018)
  - No cost items (sleep is free)
  - Disabled if bed level < 0 or already sleeping

**Build Dialog:**
- Shows bed building info when clicking bed icon
- Displays upgrade costs (same as other buildings)
- No special handling needed

**Build Action Dialog:**
- Shows sleep action details when clicking action icon
- Displays sleep duration and recovery preview

### 1.7 Bed Audio

**Music Change:**
- When entering bed panel: `audioManager.insertMusic(audioManager.music.HOME_BED)`
- When exiting bed panel: `audioManager.resumeMusic()`
- Music file: `res/music/bed.ogg`

---

## 2. Current Implementation Status

### 2.1 Building Class

**File:** `src/game/world/Building.ts`

**Current State:**
- Generic `Building` class handles all buildings
- `initBuildActions()` only creates actions from `produceList`
- Bed has empty `produceList`, so no actions are created
- **Issue:** Bed needs special action initialization

### 2.2 Building Config

**File:** `src/data/buildings.ts`

**Current State:**
- Bed config exists with correct costs and conditions
- `produceList` is empty (correct)
- **Status:** ✅ Correct

### 2.3 Build Action Config

**File:** Not yet created

**Current State:**
- No `buildActionConfig` equivalent exists
- Bed action config needs to be created
- **Issue:** Need to create build action config system

### 2.4 Bed Actions

**File:** Not yet created

**Current State:**
- No `BedBuildAction` equivalent exists
- Sleep actions are handled directly in `SurvivalSystem`
- **Issue:** Need to create bed action system or integrate with existing sleep system

### 2.5 Build Dialog

**File:** `src/components/overlays/BuildDialog.tsx`

**Current State:**
- Generic build dialog works for all buildings
- Should work for bed without changes
- **Status:** ✅ Should work

### 2.6 Build Panel

**File:** `src/components/panels/BuildPanelContent.tsx`

**Current State:**
- Shows crafting recipes from `building.getBuildActions()`
- Bed has no recipes, so panel would be empty
- **Issue:** Need to show bed sleep actions instead of recipes

### 2.7 Home Panel

**File:** `src/components/panels/HomePanelContent.tsx`

**Current State:**
- Bed click handler directly calls `survivalSystem.startSleep('untilMorning')`
- **Issue:** Should navigate to build panel to show sleep options, not directly sleep

---

## 3. Implementation Plan

### 3.1 Task: Create Build Action Config System

**Priority:** High

**Files to Create/Modify:**
- `src/data/buildActionConfig.ts` (new)

**Requirements:**
1. Create build action config data structure
2. Port bed config from original game
3. Support other special buildings (Rest, Bonfire, etc.)

**Implementation:**
```typescript
// src/data/buildActionConfig.ts
export interface BedActionConfig {
  rate: number  // Recovery rate per hour (0.6, 0.8, 1.0)
}

export type BuildActionConfig = {
  [buildingId: string]: BedActionConfig[] | any[]
}

export const buildActionConfig: BuildActionConfig = {
  "9": [
    { rate: 0.6 },  // Level 0
    { rate: 0.8 },  // Level 1
    { rate: 1.0 }   // Level 2
  ]
}
```

**Cross-Check:**
- ✅ Match `OriginalGame/src/data/buildActionConfig.js` lines 13-19
- ✅ Verify rate values: 0.6, 0.8, 1.0

---

### 3.2 Task: Create Bed Action System

**Priority:** High

**Files to Create/Modify:**
- `src/game/systems/BedAction.ts` (new) - OR integrate with existing sleep system
- `src/game/world/Building.ts` - Modify `initBuildActions()` for bed

**Option A: Create BedAction Class (Matches Original Structure)**

**Requirements:**
1. Create `BedAction` class similar to `BedBuildAction`
2. Support three sleep types: 1 hour, 4 hours, until morning
3. Calculate sleep effects based on bed level and player attributes
4. Integrate with `SurvivalSystem` for actual sleep mechanics

**Implementation:**
```typescript
// src/game/systems/BedAction.ts
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
  
  constructor(buildingId: number, buildingLevel: number, type: BedActionType, building: Building) {
    this.buildingId = buildingId
    this.buildingLevel = buildingLevel >= 0 ? buildingLevel : 0
    this.type = type
    this.building = building
  }
  
  getConfig(): { rate: number } {
    const configs = buildActionConfig[String(this.buildingId)] as BedActionConfig[]
    return configs[this.buildingLevel] || configs[0]
  }
  
  getSleepDuration(): number {
    switch (this.type) {
      case BedActionType.SLEEP_1_HOUR:
        return 1 * 60 * 60  // 1 hour in seconds
      case BedActionType.SLEEP_4_HOUR:
        return 4 * 60 * 60  // 4 hours in seconds
      case BedActionType.SLEEP_ALL_NIGHT:
        return game.getTimeManager().getTimeFromNowToMorning()
      default:
        return 0
    }
  }
  
  startSleep(): boolean {
    // Check if bed is available
    if (this.buildingLevel < 0) {
      return false
    }
    
    // Check if already sleeping
    const survivalSystem = game.getSurvivalSystem()
    if (survivalSystem.isSleeping()) {
      return false
    }
    
    // Calculate sleep duration
    const duration = this.getSleepDuration()
    
    // Start sleep via SurvivalSystem
    const success = survivalSystem.startSleep(
      this.type === BedActionType.SLEEP_1_HOUR ? '1hour' :
      this.type === BedActionType.SLEEP_4_HOUR ? '4hours' :
      'untilMorning'
    )
    
    if (success) {
      // Set active button index
      this.building.setActiveBtnIndex(this.type - 1)
      emitter.emit('build_node_update')
    }
    
    return success
  }
  
  getDisplayInfo(): {
    iconName: string
    hint: string
    actionText: string
    disabled: boolean
  } {
    const iconName = `build_action_9_${this.type - 1}.png`
    const actionText = "Sleep"  // String 1018
    
    let hint = ""
    if (this.buildingLevel < 0) {
      hint = "Bed not built"
      return { iconName, hint, actionText, disabled: true }
    }
    
    const survivalSystem = game.getSurvivalSystem()
    if (survivalSystem.isSleeping()) {
      hint = "Already sleeping"
      return { iconName, hint, actionText, disabled: true }
    }
    
    switch (this.type) {
      case BedActionType.SLEEP_1_HOUR:
        hint = "Sleep 1 hour"  // String 1144, 1
        break
      case BedActionType.SLEEP_4_HOUR:
        hint = "Sleep 4 hours"  // String 1144, 4
        break
      case BedActionType.SLEEP_ALL_NIGHT:
        hint = "Sleep until morning"  // String 1145
        break
    }
    
    return { iconName, hint, actionText, disabled: false }
  }
}
```

**Option B: Integrate with Existing Sleep System (Simpler)**

**Requirements:**
1. Modify `Building.initBuildActions()` to create bed actions
2. Use existing `SurvivalSystem.startSleep()` directly
3. Create simple action objects that wrap sleep calls

**Decision:** Use Option B for simplicity, but structure similar to original for consistency.

**Cross-Check:**
- ✅ Match `OriginalGame/src/game/buildAction.js` lines 843-958
- ✅ Verify sleep duration calculations
- ✅ Verify effect calculation (rate-based)

---

### 3.3 Task: Modify Building Class for Bed

**Priority:** High

**Files to Modify:**
- `src/game/world/Building.ts`

**Requirements:**
1. Detect bed building (ID 9) in `initBuildActions()`
2. Create bed actions instead of recipes for bed
3. Support bed action types

**Implementation:**
```typescript
// In Building.ts initBuildActions()
private initBuildActions(): void {
  // Special handling for bed (ID 9)
  if (this.id === 9) {
    this.initBedActions()
    return
  }
  
  // Normal recipe initialization for other buildings
  const produceList: Formula[] = []
  // ... existing code ...
}

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
```

**Cross-Check:**
- ✅ Match `OriginalGame/src/game/Build.js` lines 244-256
- ✅ Verify action creation for all three types

---

### 3.4 Task: Update Build Panel to Show Bed Actions

**Priority:** High

**Files to Modify:**
- `src/components/panels/BuildPanelContent.tsx`

**Requirements:**
1. Detect bed building (ID 9)
2. Show bed sleep actions instead of recipes
3. Display action icons, hints, and buttons
4. Handle sleep action clicks

**Implementation:**
```typescript
// In BuildPanelContent.tsx
export function BuildPanelContent({ buildingId }: BuildPanelContentProps) {
  const building = buildingStore.getBuilding(buildingId)
  
  // Check if bed
  const isBed = buildingId === 9
  
  if (isBed) {
    // Get bed actions
    const bedActions = building.actions as BedAction[]
    
    return (
      <div>
        {/* Upgrade view */}
        <UpgradeView building={building} />
        
        {/* Bed actions list */}
        <div className="bed-actions-list">
          {bedActions.map((action, index) => {
            const info = action.getDisplayInfo()
            return (
              <div key={index} className="bed-action-item">
                <Sprite atlas="build" frame={info.iconName} />
                <div className="hint">{info.hint}</div>
                <button
                  disabled={info.disabled}
                  onClick={() => action.startSleep()}
                >
                  {info.actionText}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  // Normal recipe display for other buildings
  // ... existing code ...
}
```

**Cross-Check:**
- ✅ Match `OriginalGame/src/ui/buildNode.js` bed action display
- ✅ Verify action button layout and styling
- ✅ Verify disabled states

---

### 3.5 Task: Update Home Panel Bed Click Handler

**Priority:** Medium

**Files to Modify:**
- `src/components/panels/HomePanelContent.tsx`

**Requirements:**
1. Change bed click to navigate to build panel (not direct sleep)
2. Show build panel with bed actions

**Implementation:**
```typescript
// In HomePanelContent.tsx handleBuildingClick()
case 9:
  // Bed building - navigate to build panel
  uiStore.openPanelAction('build', 9)
  break
```

**Cross-Check:**
- ✅ Match original behavior (bed click shows build panel with actions)

---

### 3.6 Task: Add Bed Audio Support

**Priority:** Low

**Files to Modify:**
- `src/components/panels/BuildPanelContent.tsx` or parent component

**Requirements:**
1. Play bed music when bed panel opens
2. Resume normal music when bed panel closes

**Implementation:**
```typescript
// In BuildPanelContent.tsx
useEffect(() => {
  if (buildingId === 9) {
    // Play bed music
    audioManager.insertMusic('bed')
  }
  
  return () => {
    if (buildingId === 9) {
      // Resume normal music
      audioManager.resumeMusic()
    }
  }
}, [buildingId])
```

**Cross-Check:**
- ✅ Match `OriginalGame/src/ui/buildNode.js` lines 167-179

---

### 3.7 Task: Update Building Action Types

**Priority:** Medium

**Files to Modify:**
- `src/types/building.types.ts`

**Requirements:**
1. Update `Building.actions` type to support both `Formula` and `BedAction`
2. Create union type for building actions

**Implementation:**
```typescript
// In building.types.ts
export type BuildingAction = Formula | BedAction

export interface Building {
  // ...
  actions: BuildingAction[]
}
```

---

### 3.8 Task: Cross-Check Bed Build Dialog

**Priority:** Medium

**Files to Check:**
- `src/components/overlays/BuildDialog.tsx`

**Requirements:**
1. Verify bed build dialog shows correctly
2. Verify upgrade costs display correctly
3. Verify bed images load correctly

**Cross-Check Items:**
- ✅ Bed icon: `build_9_{level}.png`
- ✅ Bed large image: `dig_build_9_{level}.png`
- ✅ Bed title: From string config `9_{level}.title`
- ✅ Bed description: From string config `9_{level}.des`
- ✅ Upgrade costs: From building config

**Test Cases:**
1. Click bed icon at level -1 → Shows build dialog with level 0 costs
2. Click bed icon at level 0 → Shows build dialog with level 1 costs
3. Click bed icon at level 1 → Shows build dialog with level 2 costs
4. Click bed icon at level 2 → Shows build dialog (max level, no upgrade)

---

## 4. Cross-Check Checklist

### 4.1 Bed Building Initialization

- [ ] Bed starts at level -1 (needs to be built)
- [ ] Bed can be built with correct costs (level 0)
- [ ] Bed can be upgraded to level 1 with correct costs
- [ ] Bed can be upgraded to level 2 with correct costs
- [ ] Bed upgrade times match original (60, 120, 180 minutes)

### 4.2 Bed Actions

- [ ] Bed has 3 sleep actions (1 hour, 4 hours, until morning)
- [ ] Actions are created when bed is built (level >= 0)
- [ ] Actions are not created when bed is not built (level < 0)
- [ ] Action icons load correctly (`build_action_9_0.png`, etc.)

### 4.3 Bed Sleep Mechanics

- [ ] Sleep 1 hour works correctly
- [ ] Sleep 4 hours works correctly
- [ ] Sleep until morning works correctly
- [ ] Sleep recovery rate matches bed level (0.6, 0.8, 1.0)
- [ ] Sleep recovery considers satiety and mood (50% base + 20% satiety + 30% mood)
- [ ] Sleep recovery calculates vigour (rate * 15 per hour)
- [ ] Sleep recovery calculates HP (rate * 20 per hour)

### 4.4 Bed UI

- [ ] Bed click in home panel opens build panel
- [ ] Build panel shows bed sleep actions (not recipes)
- [ ] Action buttons show correct icons
- [ ] Action buttons show correct hints
- [ ] Action buttons are disabled when bed not built
- [ ] Action buttons are disabled when already sleeping
- [ ] Build dialog shows bed info correctly
- [ ] Build dialog shows upgrade costs correctly

### 4.5 Bed Audio

- [ ] Bed music plays when bed panel opens
- [ ] Normal music resumes when bed panel closes

### 4.6 Bed Build Dialog

- [ ] Bed icon displays correctly in dialog title
- [ ] Bed large image displays correctly
- [ ] Bed title displays correctly
- [ ] Bed description displays correctly
- [ ] Upgrade costs display correctly
- [ ] Cost items show correct colors (black/red based on availability)

---

## 5. Testing Plan

### 5.1 Unit Tests

1. **BedAction Class:**
   - Test sleep duration calculation
   - Test config retrieval
   - Test display info generation
   - Test disabled states

2. **Building Class:**
   - Test bed action initialization
   - Test bed action creation for all levels
   - Test bed action not created when level < 0

### 5.2 Integration Tests

1. **Bed Build Flow:**
   - Start new game → Bed at level -1
   - Build bed (level 0) → Actions created
   - Upgrade bed (level 1) → Actions updated
   - Upgrade bed (level 2) → Actions updated

2. **Bed Sleep Flow:**
   - Click bed in home → Opens build panel
   - Click sleep action → Starts sleep
   - Sleep completes → Recovery applied
   - Try to sleep while sleeping → Disabled

3. **Bed UI Flow:**
   - Click bed icon → Shows build dialog
   - Click upgrade → Shows costs
   - Click action icon → Shows action dialog (if implemented)

### 5.3 Visual Cross-Check

1. **Compare with Original Game:**
   - Bed panel layout matches original
   - Action button positions match original
   - Action icons match original
   - Build dialog layout matches original

---

## 6. Dependencies

### 6.1 Required Systems

- ✅ Building system (exists)
- ✅ Survival system (exists - sleep mechanics)
- ✅ Time manager (exists)
- ✅ UI store (exists)
- ✅ Building store (exists)
- ⚠️ Build action config (needs creation)
- ⚠️ Bed action system (needs creation)

### 6.2 String System

- ⚠️ Bed strings needed:
  - `9_0.title`, `9_0.des` (level 0)
  - `9_1.title`, `9_1.des` (level 1)
  - `9_2.title`, `9_2.des` (level 2)
  - `1018` - "Sleep" button text
  - `1144` - "Sleep {hours} hour(s)" format
  - `1145` - "Sleep until morning"

**Note:** String system may not be fully implemented yet. Use placeholders if needed.

---

## 7. Implementation Order

1. **Create build action config** (Task 3.1)
   - Foundation for bed actions

2. **Create bed action system** (Task 3.2)
   - Core bed functionality

3. **Modify building class** (Task 3.3)
   - Integrate bed actions into building system

4. **Update build panel** (Task 3.4)
   - Show bed actions in UI

5. **Update home panel** (Task 3.5)
   - Fix bed click handler

6. **Add audio support** (Task 3.6)
   - Polish

7. **Cross-check and test** (Section 4, 5)
   - Verify against original

---

## 8. Notes

### 8.1 Sleep System Integration

The existing `SurvivalSystem.startSleep()` may already handle sleep mechanics. The bed action system should:
- Use `SurvivalSystem` for actual sleep execution
- Calculate sleep effects based on bed level
- Provide UI display information

### 8.2 Action vs Formula

Bed actions are different from crafting formulas:
- No cost items
- No make time (instant start)
- No produced items
- Direct player effect (recovery)

The UI should handle both types gracefully.

### 8.3 Build Action Dialog

The original game has `showBuildActionDialog()` for showing action details. This may not be critical for initial implementation, but should be considered for full feature parity.

---

## 9. Success Criteria

✅ Bed can be built and upgraded
✅ Bed has 3 sleep actions when built
✅ Sleep actions work correctly
✅ Bed UI matches original game
✅ Bed build dialog works correctly
✅ All cross-check items pass

