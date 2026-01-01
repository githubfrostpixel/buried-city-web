# Recipe Make Function Implementation Plan - Recipe 1402021

## Overview

This plan details the implementation of the recipe make function, specifically for recipe 1402021 (Alex's Tool), cross-checking with the original game's `Formula.clickAction1()` function.

**Recipe 1402021 Details:**
- **Produce**: 1× 1302021 (Alex's Tool)
- **Cost**: 1× 1101021 (Wood), 1× 1101031 (Metal)
- **Make Time**: 30 minutes
- **Building**: Workbench (Building ID 1)
- **Special**: First craft unlocks Gate (Building 14) in tutorial

**Original Game Reference**: 
- `OriginalGame/src/game/buildAction.js` - `Formula.clickAction1()` (lines 157-243)
- `OriginalGame/src/game/buildAction.js` - `Formula.addTimer()` (lines 46-90)
- `OriginalGame/src/game/buildAction.js` - `Formula.place()` (lines 122-156)

---

## 1. Original Game Analysis

### 1.1 Recipe 1402021 Flow (Step 0: Start Crafting)

**From `buildAction.js` lines 157-207:**

1. **Pre-checks**:
   ```javascript
   if (!uiUtil.checkVigour()) return;  // Check player vigour
   if (BuildOccupied) return;           // Check if another action is active
   ```

2. **Initialization**:
   ```javascript
   BuildOccupied = true;                                    // Set global flag
   this.build.setActiveBtnIndex(this.idx);                 // Set active button
   utils.emitter.emit("left_btn_enabled", false);          // Disable back button
   ```

3. **Time Calculation**:
   ```javascript
   var time = this.config["makeTime"];  // 30 minutes
   time *= 60;                          // Convert to seconds: 1800 seconds
   if (IAPPackage.isHandyworkerUnlocked()) {
       time = Math.round(time * 0.7);   // 30% reduction: 1260 seconds
   }
   ```

4. **Item Deduction** (IMMEDIATE):
   ```javascript
   player.costItems(this.config.cost);  // Deduct items BEFORE timer starts
   // Cost: 1× 1101021, 1× 1101031
   ```

5. **Timer Setup**:
   ```javascript
   this.addTimer(time, time, function () {
       // Completion callback
   });
   ```

6. **Timer Completion Callback**:
   ```javascript
   self.step++;                    // step: 0 → 1
   if (self.step == self.maxStep) {
       self.step = 0;              // Reset if maxStep = 1
   }
   BuildOccupied = false;
   
   // For recipe 1402021 (maxStep = 1, no placedTime):
   if (self.step == 1) {
       // This won't execute for 1402021 (maxStep = 1)
   } else {
       // Non-placement recipe: give items immediately
       player.gainItems(self.config.produce);  // Give 1× 1302021
       self.config.produce.forEach(function (item) {
           Achievement.checkMake(item.itemId, item.num);
       });
       player.log.addMsg(1090, itemInfo.num, itemName, player.storage.getNumByItemId(itemInfo.itemId));
       self.build.resetActiveBtnIndex();
       
       // Tutorial: Unlock gate when crafting first tool
       if (self.build.id === 1 && userGuide.isStep(userGuide.stepName.TOOL_ALEX)) {
           userGuide.step();
           player.room.createBuild(14, 0);  // Create Gate (building 14, level 0)
       }
   }
   utils.emitter.emit("left_btn_enabled", true);
   Record.saveAll();
   ```

### 1.2 Timer System (`addTimer` function)

**From `buildAction.js` lines 46-90:**

```javascript
addTimer: function (time, totalTime, endCb, notAccelerate, startTime) {
    this.isActioning = true;
    this.pastTime = startTime || 0;
    this.totalTime = totalTime;
    
    var timerStartTime;
    if (startTime) {
        timerStartTime = cc.timer.time - startTime;
    }
    
    var self = this;
    var tcb = cc.timer.addTimerCallback(new TimerCallback(time, this, {
        process: function (dt) {
            self.pastTime += dt;
            if (self.view) {
                var percent = self.pastTime / self.totalTime * 100;
                self.view.updatePercentage(percent);  // Update UI progress
            }
        },
        end: function () {
            self.isActioning = false;
            self.pastTime = 0;
            if (endCb) {
                endCb();
            }
            self._sendUpdageSignal();  // Emit build_node_update
        }
    }), timerStartTime);
    
    if (!notAccelerate) {
        cc.timer.accelerateWorkTime(time);  // Accelerate work time
    }
    
    this.tcb = tcb;
    return this.tcb;
}
```

**Key Points:**
- `pastTime` tracks elapsed time
- `totalTime` is the total duration
- Progress: `percent = pastTime / totalTime * 100`
- `isActioning` flag prevents concurrent actions
- Work time acceleration speeds up crafting (3 real seconds for long crafts)

### 1.3 Step System

**For Recipe 1402021:**
- `maxStep = 1` (no `placedTime` in config)
- `step = 0`: Can make (show "Make" button)
- `step = 1`: Crafting in progress (show progress)
- When `step == maxStep` after completion: reset to `step = 0` and give items immediately

**Step Flow:**
```
step 0 → [click Make] → step 1 (crafting) → [timer completes] → step 0 (items given)
```

### 1.4 Global State: BuildOccupied

**From `buildAction.js` line 1:**
```javascript
var BuildOccupied = false;  // Global flag preventing concurrent crafting
```

**Usage:**
- Set to `true` when starting any craft
- Set to `false` when craft completes
- Checked before allowing new crafts
- Prevents multiple recipes from crafting simultaneously

---

## 2. Current Implementation Status

### ✅ Already Implemented

1. **Formula Class Structure**:
   - ✅ `Formula` class exists in `src/game/systems/Formula.ts`
   - ✅ `canMake()` method checks item availability
   - ✅ `getCost()`, `getProduce()`, `getMakeTime()` methods
   - ✅ `step` and `isActioning` properties
   - ✅ `isLocked` flag
   - ✅ Save/restore structure

2. **Building Integration**:
   - ✅ `Building.setActiveBtnIndex()` and `resetActiveBtnIndex()`
   - ✅ `Building.anyBtnActive()` method
   - ✅ Building actions (formulas) initialized

3. **TimeManager**:
   - ✅ `TimeManager` class exists
   - ✅ `addTimerCallback()` method
   - ✅ `TimerCallback` class
   - ✅ `accelerateWorkTime()` method

4. **Player Store**:
   - ✅ `costItems()` method (needs verification)
   - ✅ `gainItems()` method (needs verification)

### ❌ Missing/Incomplete

1. **Make Function**:
   - ❌ No `make()` or `clickAction1()` method in Formula class
   - ❌ No vigour check
   - ❌ No `BuildOccupied` global flag
   - ❌ No timer integration
   - ❌ No step management during crafting
   - ❌ No item deduction/giving
   - ❌ No achievement checking
   - ❌ No log messages
   - ❌ No tutorial integration

2. **Timer System Integration**:
   - ❌ No `addTimer()` method in Formula class
   - ❌ No `pastTime` and `totalTime` tracking
   - ❌ No progress percentage calculation
   - ❌ No UI progress updates

3. **UI Updates**:
   - ❌ No progress percentage updates during crafting
   - ❌ No button state updates
   - ❌ RecipeListItem shows static "Crafting..." text

---

## 3. Implementation Plan

### Phase 1: Add Core Properties to Formula Class

**File**: `src/game/systems/Formula.ts`

**Add Properties:**
```typescript
export class Formula {
  // ... existing properties ...
  
  // Timer tracking
  pastTime: number = 0
  totalTime: number = 0
  timerCallback?: TimerCallback
  
  // Step system
  maxStep: number = 1  // 2 if placedTime exists, 1 otherwise
  
  // Building reference (needed for activeBtnIndex)
  building?: Building
}
```

**Update Constructor:**
```typescript
constructor(id: number, buildingId: number) {
  // ... existing code ...
  
  // Calculate maxStep based on config
  this.maxStep = this.config?.placedTime ? 2 : 1
}
```

### Phase 2: Add Timer System to Formula Class

**File**: `src/game/systems/Formula.ts`

**Add Method:**
```typescript
/**
 * Add timer for crafting/placement
 * Similar to buildAction.js addTimer()
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
  let timerStartTime: number | undefined
  if (startTime !== undefined && startTime !== null) {
    timerStartTime = timeManager.now() - startTime
  }
  
  // Create timer callback
  const timerCallback = new TimerCallback(time, this, {
    process: (dt: number) => {
      this.pastTime += dt
      
      // Update UI progress (emit event for UI to listen)
      const percent = (this.pastTime / this.totalTime) * 100
      emitter.emit('formula_progress', {
        formulaId: this.id,
        buildingId: this.buildingId,
        progress: percent
      })
    },
    end: () => {
      this.isActioning = false
      this.pastTime = 0
      
      if (endCb) {
        endCb()
      }
      
      emitter.emit('build_node_update')
    }
  })
  
  // Add to TimeManager
  this.timerCallback = timeManager.addTimerCallback(timerCallback, timerStartTime)
  
  // Accelerate work time if not disabled
  if (!notAccelerate) {
    timeManager.accelerateWorkTime(time)
  }
  
  return this.timerCallback
}
```

### Phase 3: Add Make Method to Formula Class

**File**: `src/game/systems/Formula.ts`

**Add Global BuildOccupied Flag:**
```typescript
// Global flag preventing concurrent crafting
let BuildOccupied = false
```

**Add Method:**
```typescript
/**
 * Start crafting (equivalent to clickAction1 when step === 0)
 */
make(): boolean {
  // Pre-checks
  // TODO: Check vigour (stub for now)
  // if (!checkVigour()) return false
  
  if (BuildOccupied) {
    return false  // Another action is active
  }
  
  if (!this.canMake()) {
    return false  // Cannot make (missing items, locked, etc.)
  }
  
  // Check if building has other active actions
  if (this.building && this.building.anyBtnActive()) {
    const activeIndex = this.building.activeBtnIndex
    // Only allow if this formula is the active one
    // Note: Need to get formula index from building.actions
    // For now, check if building is upgrading
    if (this.building.isUpgrading) {
      return false
    }
  }
  
  // Initialize
  BuildOccupied = true
  
  if (this.building) {
    // Get formula index from building actions
    const index = this.building.actions.findIndex(a => a.id === this.id)
    if (index !== -1) {
      this.building.setActiveBtnIndex(index)
    }
  }
  
  emitter.emit('left_btn_enabled', false)
  
  // Calculate time
  let time = this.getMakeTime() * 60  // Convert minutes to seconds
  // TODO: Apply IAP bonus (stub for now)
  // if (IAPPackage.isHandyworkerUnlocked()) {
  //   time = Math.round(time * 0.7)
  // }
  
  // Deduct items IMMEDIATELY (before timer starts)
  const playerStore = usePlayerStore.getState()
  const cost = this.getCost()
  // TODO: Implement costItems in playerStore
  // playerStore.costItems(cost)
  
  // Start timer
  const self = this
  this.addTimer(time, time, () => {
    // Timer completion callback
    self.step++
    if (self.step >= self.maxStep) {
      self.step = 0
    }
    
    BuildOccupied = false
    
    if (self.step === 1 && self.maxStep === 2) {
      // Placement recipe: start placement phase
      // self.place()
    } else {
      // Non-placement recipe (like 1402021): give items immediately
      const produce = self.getProduce()
      // TODO: Implement gainItems in playerStore
      // playerStore.gainItems(produce)
      
      // TODO: Check achievements
      // produce.forEach(item => {
      //   Achievement.checkMake(item.itemId, item.num)
      // })
      
      // TODO: Add log message
      // player.log.addMsg(1090, ...)
      
      if (self.building) {
        self.building.resetActiveBtnIndex()
      }
      
      // Tutorial: Unlock gate when crafting first tool (recipe 1402021)
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
    
    emitter.emit('left_btn_enabled', true)
    // TODO: Save game
    // Record.saveAll()
  })
  
  emitter.emit('build_node_update')
  return true
}
```

### Phase 4: Integrate with RecipeListItem Component

**File**: `src/components/panels/RecipeListItem.tsx`

**Update handleMake Function:**
```typescript
const handleMake = () => {
  if (!showMakeButton) return
  
  // Call Formula.make() method
  const success = recipe.make()
  if (!success) {
    // Show error message or notification
    console.warn('Cannot start crafting:', recipe.id)
    return
  }
  
  // UI will update via build_node_update event
}
```

**Add Progress Tracking:**
```typescript
const [progress, setProgress] = useState(0)

useEffect(() => {
  const handleProgress = (data: { formulaId: number; progress: number }) => {
    if (data.formulaId === recipe.id) {
      setProgress(data.progress)
    }
  }
  
  emitter.on('formula_progress', handleProgress)
  
  return () => {
    emitter.off('formula_progress', handleProgress)
  }
}, [recipe.id])
```

**Update Progress Bar:**
```typescript
{showProgress && (
  <div className="absolute inset-0" style={{...}}>
    <div
      style={{
        position: 'absolute',
        left: '0',
        bottom: '0',
        width: `${progress}%`,  // Use actual progress
        height: '4px',
        background: '#4CAF50',
        transition: 'width 0.1s linear'
      }}
    />
  </div>
)}
```

### Phase 5: Add Global BuildOccupied Flag

**File**: `src/game/systems/Formula.ts` or new file `src/game/systems/CraftingSystem.ts`

**Option 1: Module-level variable (matches original)**
```typescript
// Global flag preventing concurrent crafting
let BuildOccupied = false

export function getBuildOccupied(): boolean {
  return BuildOccupied
}

export function setBuildOccupied(value: boolean): void {
  BuildOccupied = value
}
```

**Option 2: Class-based (more TypeScript-friendly)**
```typescript
export class CraftingSystem {
  private static buildOccupied = false
  
  static isOccupied(): boolean {
    return this.buildOccupied
  }
  
  static setOccupied(value: boolean): void {
    this.buildOccupied = value
  }
}
```

### Phase 6: Player Store Integration

**File**: `src/store/playerStore.ts`

**Verify/Add Methods:**
```typescript
// Verify these methods exist:
costItems(cost: BuildingCost[]): boolean {
  // Deduct items from bag/storage
  // Return true if successful, false if insufficient items
}

gainItems(items: Array<{ itemId: number | string; num: number }>): void {
  // Add items to storage
  // Handle item stacking, capacity limits, etc.
}
```

### Phase 7: Building Reference in Formula

**File**: `src/game/world/Building.ts`

**Update initBuildActions:**
```typescript
private initBuildActions(): void {
  // ... existing code ...
  
  for (const config of this.configs) {
    if (config.produceList) {
      for (const formulaId of config.produceList) {
        const formula = new Formula(formulaId, this.id)
        formula.needBuild = { bid: this.id, level: levelIndex }
        formula.building = this  // Add building reference
        // ... rest of code ...
      }
    }
  }
}
```

---

## 4. Testing Checklist

### Basic Functionality
- [ ] Can start crafting recipe 1402021 when items available
- [ ] Items deducted immediately when starting (before timer)
- [ ] Timer runs and updates progress percentage
- [ ] Cannot start new craft while one is active (BuildOccupied)
- [ ] Step increments correctly (0 → 1 → 0)
- [ ] Items given when crafting completes
- [ ] Active button index managed correctly
- [ ] Left button disabled during crafting, enabled after

### UI Updates
- [ ] Progress bar updates during crafting
- [ ] Button changes from "Make" to "Crafting..." during process
- [ ] Recipe list refreshes when crafting completes
- [ ] Build panel updates when crafting state changes

### Edge Cases
- [ ] Cannot craft if missing items
- [ ] Cannot craft if locked
- [ ] Cannot craft if building is upgrading
- [ ] Cannot craft if another recipe is active
- [ ] Progress persists across saves (if step === 1)
- [ ] Timer resumes correctly after load (if step === 1)

### Special Cases (Future)
- [ ] Tutorial: Gate unlocks when crafting 1402021
- [ ] IAP bonus: 30% time reduction when handyworker unlocked
- [ ] Achievement: checkMake called when crafting completes
- [ ] Log message: 1090 added when crafting completes

---

## 5. Implementation Order

1. **Step 1**: Add properties to Formula class (pastTime, totalTime, maxStep, building)
2. **Step 2**: Add addTimer() method to Formula class
3. **Step 3**: Add global BuildOccupied flag
4. **Step 4**: Add make() method to Formula class (stub playerStore methods)
5. **Step 5**: Integrate with RecipeListItem (handleMake, progress tracking)
6. **Step 6**: Add building reference to Formula instances
7. **Step 7**: Verify playerStore.costItems() and gainItems() methods
8. **Step 8**: Test complete flow for recipe 1402021
9. **Step 9**: Add vigour check (stub for now)
10. **Step 10**: Add IAP bonus (stub for now)
11. **Step 11**: Add achievement checking (stub for now)
12. **Step 12**: Add log messages (stub for now)
13. **Step 13**: Add tutorial integration (stub for now)

---

## 6. Notes

1. **Item Deduction Timing**: Items are deducted **immediately** when starting, not when completing. This prevents bugs with NPC trading at 8PM.

2. **BuildOccupied Flag**: Global flag prevents concurrent crafting across all buildings. Only one recipe can be crafted at a time.

3. **Step System**: For recipe 1402021 (maxStep = 1), items are given immediately when timer completes. For placement recipes (maxStep = 2), there's an additional placement phase.

4. **Progress Updates**: Progress is calculated as `pastTime / totalTime * 100` and emitted via `formula_progress` event for UI updates.

5. **Work Time Acceleration**: Long crafts (> 3 real seconds) are accelerated to complete in 3 real seconds for better UX.

6. **Tutorial Integration**: Crafting recipe 1402021 at building 1 unlocks the Gate (building 14) in the tutorial.

7. **Active Button Index**: Each formula needs to know its index in the building's actions array to set the active button index correctly.

---

## 7. Future Enhancements (Deferred)

1. **Vigour Check**: Implement `checkVigour()` function
2. **IAP Bonus**: Implement `IAPPackage.isHandyworkerUnlocked()` check
3. **Achievement System**: Implement `Achievement.checkMake()`
4. **Log System**: Implement log message system (1090, 1091, 1092)
5. **Tutorial System**: Implement user guide step system
6. **Placement Recipes**: Implement `place()` method for recipes with `placedTime`
7. **Weather Effects**: Implement weather bonuses for greenhouse recipes
8. **Save/Restore**: Save `pastTime` and resume timer if `step === 1`

