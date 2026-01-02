# Escape Monster Count Investigation Plan

## Overview

Investigate whether killing a zombie/monster during escape will correctly decrease the monster count, and identify any potential race conditions or bugs.

## Question

**If a player kills a zombie and then escapes, will the monster count decrease correctly?**

## Code Flow Analysis

### 1. Monster Death Flow

**File:** `src/game/combat/Monster.ts` (lines 198-224)

```typescript
die(obj: BattleEquipment | "Dog" | Bomb | Flamethrower | null): void {
  this.battle.sumRes.monsterKilledNum++  // ✅ Increments kill count
  this.dead = true
  this.battle.removeMonster(this)        // ✅ Removes from array immediately
  
  if (obj instanceof Bomb || obj instanceof Flamethrower) {
    // Bomb or Flamethrower - they track dead monsters
    obj.deadMonsterNum++
  } else {
    // Regular kill
    const logMsg = this.useBandit()
      ? `Killed 1 bandit ${this.attr.prefixType}`
      : `Killed 1 zombie ${this.attr.prefixType}`
    this.battle.processLog(logMsg)
    this.battle.checkGameEnd()           // ⚠️ Checks if battle should end (win)
  }
  
  // ... cleanup code
}
```

**Key Points:**
- ✅ `monsterKilledNum` is incremented immediately
- ✅ `removeMonster()` is called immediately
- ⚠️ `checkGameEnd()` is called, which could end battle as win

### 2. Remove Monster Flow

**File:** `src/game/combat/Battle.ts` (lines 192-200)

```typescript
removeMonster(monster: Monster): void {
  const index = this.monsters.indexOf(monster)
  if (index > -1) {
    this.monsters.splice(index, 1)  // ✅ Removes from array
  }

  emitter.emit("battleMonsterLength", this.monsters.length)  // ✅ Emits new count
  this.updateTargetMonster()
}
```

**Key Points:**
- ✅ Monster is removed from `this.monsters` array immediately
- ✅ `battleMonsterLength` event is emitted with new count
- ✅ UI listens to this event and updates display

### 3. Check Game End Flow

**File:** `src/game/combat/Battle.ts` (lines 202-208)

```typescript
checkGameEnd(): boolean {
  if (this.monsters.length === 0) {
    this.gameEnd(true)  // ⚠️ Ends battle as WIN
    return true
  } else {
    return false
  }
}
```

**Key Points:**
- ⚠️ If all monsters are killed, battle ends as WIN
- ⚠️ This happens even if player is escaping

### 4. Escape Flow

**File:** `src/game/combat/BattlePlayer.ts` (lines 252-280)

```typescript
escape(): void {
  if (this.isEscaping) {
    return
  }

  this.isEscaping = true
  this.escapeStartTime = Date.now()
  this.battle.processLog("You trying to escape", "#FFAA00")

  // Set timeout for escape completion
  this.escapeTimeoutId = window.setTimeout(() => {
    this.clearEscapeProgress()
    this.escapeAction()  // ⚠️ Ends battle as LOSS after 1.5s
  }, BattleConfig.ESCAPE_TIME * 1000)
}

escapeAction(): void {
  this.battle.processLog("Escape success", "#00FF00")
  this.isEscaping = false
  this.battle.gameEnd(false)  // ⚠️ Ends battle as LOSS
}
```

**Key Points:**
- ⚠️ Escape ends battle as LOSS after 1.5 seconds
- ⚠️ No check if battle already ended

### 5. Game End Flow

**File:** `src/game/combat/Battle.ts` (lines 210-309)

```typescript
gameEnd(isWin: boolean): void {
  this.isBattleEnd = true  // ✅ Sets flag to prevent multiple calls
  this.sumRes.win = isWin
  this.isMonsterStop = true
  
  // Stop update loops
  this.stopUpdateLoops()
  
  // ... rest of cleanup
}
```

**Key Points:**
- ✅ `isBattleEnd` flag prevents multiple game end calls
- ✅ But race condition could still occur if both happen simultaneously

## Analysis

### ✅ Monster Count WILL Decrease

**Answer: YES, the monster count will decrease correctly.**

**Reasoning:**
1. When monster dies, `removeMonster()` is called immediately
2. `removeMonster()` removes monster from array and emits `battleMonsterLength` event
3. UI listens to this event and updates the count display
4. This happens **regardless** of escape state

### ⚠️ Potential Race Condition

**Issue: Double Game End**

**Scenario:**
1. Player starts escape (1.5s timer starts)
2. Player kills last monster during escape
3. `checkGameEnd()` is called → `gameEnd(true)` (WIN)
4. Escape timer fires → `gameEnd(false)` (LOSS)

**Current Protection:**
- `isBattleEnd` flag in `gameEnd()` method
- First call sets `isBattleEnd = true`
- Subsequent calls should check this flag

**Problem:**
- Need to verify if `gameEnd()` checks `isBattleEnd` at the start
- If not, both could execute, causing inconsistent state

## Investigation Tasks

### Task 1: Verify Monster Count Update
- [ ] Test: Kill monster during escape
- [ ] Verify: Monster count decreases in UI
- [ ] Verify: `monsterKilledNum` is incremented
- [ ] Verify: `battleMonsterLength` event is emitted

### Task 2: Check Race Condition Protection
- [ ] Verify: `gameEnd()` checks `isBattleEnd` flag at start
- [ ] Test: Kill last monster during escape
- [ ] Verify: Only one `gameEnd()` call executes
- [ ] Verify: Correct win/loss state

### Task 3: Test Edge Cases
- [ ] Test: Kill all monsters during escape
- [ ] Test: Kill some but not all monsters during escape
- [ ] Test: Escape completes after killing monsters
- [ ] Test: Escape completes before killing monsters

## Expected Behavior

### Scenario 1: Kill Monster During Escape
1. Player clicks Escape → "You trying to escape" log
2. Player kills a zombie → "Killed 1 zombie X" log
3. Monster count decreases ✅
4. After 1.5s → "Escape success" log
5. Battle ends as LOSS ✅
6. `monsterKilledNum` should be 1 ✅

### Scenario 2: Kill Last Monster During Escape
1. Player clicks Escape → "You trying to escape" log
2. Player kills last zombie → "Killed 1 zombie X" log
3. Monster count decreases to 0 ✅
4. `checkGameEnd()` is called
5. **Question:** Does battle end as WIN or LOSS?
   - If `checkGameEnd()` executes first → WIN
   - If escape timer fires first → LOSS
   - If both execute → Race condition

## Code to Check

### 1. Verify `gameEnd()` Protection

**File:** `src/game/combat/Battle.ts`

```typescript
gameEnd(isWin: boolean): void {
  // ⚠️ Need to verify: Does this check happen at the start?
  if (this.isBattleEnd) {
    return  // Prevent multiple calls
  }
  
  this.isBattleEnd = true
  // ... rest of code
}
```

### 2. Verify Escape Action Protection

**File:** `src/game/combat/BattlePlayer.ts`

```typescript
escapeAction(): void {
  // ⚠️ Should check if battle already ended
  if (this.battle.isBattleEnd) {
    return  // Don't end battle if already ended
  }
  
  this.battle.processLog("Escape success", "#00FF00")
  this.isEscaping = false
  this.battle.gameEnd(false)
}
```

## Recommendations

### 1. Add Protection in `gameEnd()`
- Check `isBattleEnd` flag at the start
- Return early if battle already ended
- Prevents race conditions

### 2. Add Protection in `escapeAction()`
- Check `battle.isBattleEnd` before calling `gameEnd()`
- Prevents escape from ending an already-ended battle

### 3. Add Protection in `checkGameEnd()`
- Check `isBattleEnd` before calling `gameEnd()`
- Prevents win from ending an already-ended battle

### 4. Test All Scenarios
- Create test cases for all edge cases
- Verify monster count updates correctly
- Verify no double game end calls

## Files to Review

1. `src/game/combat/Battle.ts` - `gameEnd()` method
2. `src/game/combat/Battle.ts` - `checkGameEnd()` method
3. `src/game/combat/BattlePlayer.ts` - `escapeAction()` method
4. `src/game/combat/Monster.ts` - `die()` method
5. `src/components/panels/BattlePanelContent.tsx` - UI event listeners

## Original Game Investigation: Monster Count Persistence

### Question
**If you kill a zombie then escape, and later return to the same battle, does the zombie count decrease permanently?**

### Analysis

**Battle Creation:**
- Each battle is created from `battleInfo.monsterList` (original list)
- `this.monsters` array is created from `monsterList.map()` - a fresh copy
- Battle result (`sumRes`) tracks `monsterKilledNum` but doesn't modify original list

**Battle End:**
- When battle ends (win or loss), only the result is returned via `gameEndListener`
- The original `battleInfo.monsterList` is NOT modified
- If player returns to same battle, it uses the original `battleInfo.monsterList` again

**Conclusion:**
- ❌ **NO, zombie count does NOT decrease permanently**
- Each battle is independent
- If you escape and return, you get a fresh battle with the original monster list
- Killed monsters are only tracked in the battle result, not persisted to the battle info

**Example:**
1. Battle starts with 3 zombies: `[zombie1, zombie2, zombie3]`
2. Player kills zombie1 → `monsters = [zombie2, zombie3]`
3. Player escapes → Battle ends as loss
4. Player returns to same battle → New battle created with `[zombie1, zombie2, zombie3]` again

**This matches the original game behavior:**
- Battles are independent encounters
- Monster kills are only counted for that specific battle
- Escaping resets the encounter (you didn't complete it)

## Implementation Status

### ✅ Race Condition Protection Added

1. **`Battle.gameEnd()`** - Now checks `isBattleEnd` flag at start
2. **`Battle.checkGameEnd()`** - Now checks `isBattleEnd` before checking monsters
3. **`BattlePlayer.escapeAction()`** - Now checks `battle.isBattleEnd` before ending

### ✅ Monster Count Behavior

- **During Battle:** Monster count decreases correctly when monsters die (even during escape)
- **After Escape:** Monster count is NOT persisted - returning to battle uses original list
- **Battle Result:** `monsterKilledNum` is tracked in result but doesn't affect future battles

## Next Steps

1. ✅ Review `gameEnd()` implementation for race condition protection - **DONE**
2. Test monster count update during escape
3. Test race condition scenario (kill last monster during escape)
4. ✅ Add protection if missing - **DONE**
5. Verify all edge cases work correctly
6. ✅ Document original game behavior - **DONE**

