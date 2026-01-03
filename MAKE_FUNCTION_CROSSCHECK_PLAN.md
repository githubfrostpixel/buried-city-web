# Make Function Cross-Check Plan

## Overview
Cross-check the crafting/make function implementation with the original game to ensure all functionality is correctly ported.

## Original Game Analysis

### Key Function: `clickAction1()` (buildAction.js lines 157-243)

#### Step 0: Start Crafting
1. **Pre-checks**:
   - ✅ Check vigour (`uiUtil.checkVigour()`)
   - ✅ Check if `BuildOccupied` (global flag preventing concurrent actions)
   - ✅ If occupied, return early

2. **Initialization**:
   - Set `BuildOccupied = true`
   - Set active button index (`this.build.setActiveBtnIndex(this.idx)`)
   - Disable left button (`utils.emitter.emit("left_btn_enabled", false)`)

3. **Time Calculation**:
   - Get `makeTime` from config (in minutes)
   - Convert to seconds: `time *= 60`
   - Apply IAP bonus: If `IAPPackage.isHandyworkerUnlocked()`, reduce by 30% (`time = Math.round(time * 0.7)`)

4. **Item Deduction**:
   - **Immediately deduct items** before starting timer: `player.costItems(this.config.cost)`
   - This prevents bugs with NPC trading at 8PM

5. **Timer Setup**:
   - Call `this.addTimer(time, time, callback)`
   - Timer tracks progress via `pastTime` and `totalTime`
   - Updates UI percentage during process
   - Emits `build_node_update` signal

6. **Timer Completion Callback**:
   - Increment `step++`
   - If `step == maxStep`, reset `step = 0`
   - Set `BuildOccupied = false`
   - If `step == 1`:
     - If building ID == 2 (greenhouse): Call `self.place(true)`
     - Otherwise: Call `self.place()`
   - Else (non-placement recipes, step == maxStep):
     - Give items immediately: `player.gainItems(self.config.produce)`
     - Check achievements: `Achievement.checkMake(item.itemId, item.num)`
     - Add log message: `player.log.addMsg(1090, ...)`
     - Reset active button: `self.build.resetActiveBtnIndex()`
     - Handle tutorial step (unlock gate for building 1)
   - Enable left button: `utils.emitter.emit("left_btn_enabled", true)`
   - Save game: `Record.saveAll()`

#### Step 2: Take Item (or building != 2)
1. **Weather Effects**:
   - Clone produce array
   - Apply weather bonuses:
     - Item 1101061 (distilled water): Add `player.weather.getValue("item_1101061")`
     - Building 2 (greenhouse): Add `player.weather.getValue("build_2")` to all items

2. **Give Items**:
   - `player.gainItems(produce)` (with weather bonuses)
   - Check achievements: `Achievement.checkProduce(item.itemId, item.num)`

3. **Reset State**:
   - Set `step = 0`
   - Add log message: `player.log.addMsg(1092, ...)`
   - Reset active button: `this.build.resetActiveBtnIndex()`
   - Save game: `Record.saveAll()`

#### Step 1 + Building 2: Greenhouse Special Case
- Check for fertilizer (item 1101081)
- If available:
  - Deduct fertilizer: `player.storage.decreaseItem(1101081, 1)`
  - Add time: `this.pastTime += 10800` (3 hours)
  - Cap at total time: `if (this.pastTime > this.totalTime) this.pastTime = this.totalTime`
  - Call `this.place(true)`
- Otherwise: Disable button

### Timer System (`addTimer` function, lines 46-90)

**Parameters**:
- `time`: Duration in seconds
- `totalTime`: Total duration (usually same as `time`)
- `endCb`: Callback when timer completes
- `notAccelerate`: If false, accelerates work time
- `startTime`: Optional past time for resume

**Process**:
- Sets `isActioning = true`
- Tracks `pastTime` and `totalTime`
- Updates UI percentage: `percent = pastTime / totalTime * 100`
- For step 1 (placement), updates hint with remaining time
- Calls `endCb` when complete
- Sets `isActioning = false` and resets `pastTime = 0`
- Emits `build_node_update` signal
- Accelerates work time if `notAccelerate` is false

### Step System

**maxStep Calculation**:
- If `config.placedTime` exists: `maxStep = 2` (placement recipe)
- Otherwise: `maxStep = 1` (immediate recipe)

**Step States**:
- `step = 0`: Can make (show "Make" button)
- `step = 1`: Crafting/placing in progress (show progress)
- `step = 2`: Completed, ready to take (show "Take" button)

### Place Function (lines 122-156)

**Purpose**: Handles placement phase for recipes that require placement (like greenhouse crops)

**Parameters**:
- `check`: If true, removes existing timer callback first

**Process**:
- Gets `placedTime` from config (in minutes)
- Converts to seconds: `time *= 60`
- Creates timer with `this.addTimer(time, time, callback, true, this.pastTime)`
- On completion:
  - Increments step if `step < maxStep`
  - Adds log message (language-aware)
  - Emits `placed_success` event

## Current Implementation Status

### ✅ Implemented
- Basic Formula class structure
- `canMake()` - checks if player has items
- `getCost()`, `getProduce()`, `getMakeTime()`
- Save/restore structure
- Step tracking (0, 1, 2)
- `isLocked` flag
- Building active button index system (`setActiveBtnIndex`, `resetActiveBtnIndex`, `anyBtnActive`)

### ❌ Missing/Incomplete
1. **Make Function (`clickAction1` equivalent)**:
   - ❌ No actual implementation (just emits event)
   - ❌ No vigour check
   - ❌ No `BuildOccupied` global flag
   - ❌ No timer system integration
   - ❌ No item deduction (`player.costItems`)
   - ❌ No item giving (`player.gainItems`)
   - ❌ No step management during crafting
   - ❌ No placement phase handling
   - ❌ No weather effects
   - ❌ No achievement checking
   - ❌ No log messages
   - ❌ No IAP bonus (handyworker 30% reduction)
   - ❌ No greenhouse special case (fertilizer)

2. **Timer System**:
   - ❌ No `addTimer` method in Formula class
   - ❌ No `pastTime` and `totalTime` tracking
   - ❌ No progress percentage updates
   - ❌ No `isActioning` flag management
   - ❌ No work time acceleration

3. **Place Function**:
   - ❌ Not implemented
   - ❌ No placement timer
   - ❌ No `placedTime` handling

4. **Take Function (`clickAction1` when step == 2)**:
   - ❌ Not implemented
   - ❌ No weather effects
   - ❌ No item giving
   - ❌ No achievement checking

5. **UI Updates**:
   - ❌ No progress percentage updates during crafting
   - ❌ No hint text updates for placement phase
   - ❌ No button state updates

## Implementation Plan

### Phase 1: Core Make Function

**File**: `src/game/systems/Formula.ts`

1. **Add Properties**:
   ```typescript
   pastTime: number = 0
   totalTime: number = 0
   maxStep: number = 1
   timerCallback?: TimerCallback
   ```

2. **Add Timer System**:
   - Integrate with `TimeManager` (similar to Building.upgrade)
   - Add `addTimer()` method
   - Track progress and update UI
   - Handle completion callback

3. **Add Make Method**:
   - Check vigour (stub for now)
   - Check `BuildOccupied` (global flag)
   - Calculate time with IAP bonus
   - Deduct items immediately
   - Start timer
   - Handle completion (step management, give items, etc.)

4. **Add Place Method**:
   - Handle placement phase for recipes with `placedTime`
   - Create placement timer
   - Update step on completion

5. **Add Take Method**:
   - Apply weather effects
   - Give items
   - Reset step
   - Check achievements

### Phase 2: Global State Management

**File**: `src/game/systems/Formula.ts` or new file

1. **BuildOccupied Flag**:
   - Create global `BuildOccupied` flag
   - Set to `true` when starting craft
   - Set to `false` when completing
   - Check before allowing new crafts

2. **Left Button Enabled**:
   - Emit `left_btn_enabled` event (false when starting, true when done)
   - Handle in UI components

### Phase 3: Integration Points

1. **Player Store**:
   - Ensure `costItems()` method exists
   - Ensure `gainItems()` method exists
   - Check item availability methods

2. **Building Integration**:
   - Formula needs reference to Building instance
   - Use `building.setActiveBtnIndex()` and `building.resetActiveBtnIndex()`
   - Check `building.anyBtnActive()` before allowing craft

3. **UI Updates**:
   - Listen to `build_node_update` event
   - Update progress percentage during crafting
   - Update button states
   - Update hint text for placement phase

### Phase 4: Special Cases

1. **Greenhouse (Building 2)**:
   - Handle fertilizer check in step 1
   - Handle placement phase differently
   - Apply weather bonuses

2. **IAP Bonus**:
   - Check `IAPPackage.isHandyworkerUnlocked()` (stub for now)
   - Apply 30% time reduction

3. **Weather Effects**:
   - Apply weather bonuses when taking items
   - Check for distilled water (1101061)
   - Check for greenhouse bonuses

4. **Tutorial Integration**:
   - Handle tutorial step for building 1
   - Unlock gate (building 14) when crafting first tool

### Phase 5: Additional Features

1. **Achievement System**:
   - Call `Achievement.checkMake()` when crafting completes
   - Call `Achievement.checkProduce()` when taking items

2. **Log System**:
   - Add log messages:
     - 1090: Item crafted
     - 1091: Item placed
     - 1092: Item harvested

3. **Save/Restore**:
   - Save `pastTime` in Formula.save()
   - Restore and resume timer if `step == 1`

## Testing Checklist

- [ ] Can start crafting when items available
- [ ] Items deducted immediately when starting
- [ ] Timer runs and updates progress
- [ ] Cannot start new craft while one is active (BuildOccupied)
- [ ] Step increments correctly
- [ ] Items given when crafting completes (non-placement)
- [ ] Placement phase works for recipes with placedTime
- [ ] Take button works when step == 2
- [ ] Weather effects applied when taking items
- [ ] Greenhouse fertilizer works
- [ ] IAP bonus reduces time by 30%
- [ ] UI updates during crafting
- [ ] Save/restore works correctly
- [ ] Active button index managed correctly
- [ ] Left button disabled during crafting

## Notes

- The original game uses a global `BuildOccupied` flag to prevent concurrent crafting
- Items are deducted **immediately** when starting, not when completing
- Timer system uses `TimeManager` with `TimerCallback` for progress tracking
- Placement recipes (like greenhouse crops) have two phases: make + place
- Weather effects only apply when **taking** items, not when crafting
- Greenhouse has special fertilizer mechanic that adds time to placement phase




