# Homemade Penicillin Death Check Plan

## Problem
When using homemade penicillin (item 1104032), HP turns to 0, time freezes, but death overlay doesn't trigger.

## Original Game Analysis

### Homemade Penicillin Effect (`OriginalGame/src/game/player.js:1189-1206`)
```javascript
item1104032Effect: function (item, obj) {
    var hpChance = obj.hp_chance;
    var rand = Math.random();
    if (rand <= hpChance) {
        this.changeHp(obj.hp);  // obj.hp is -150 (negative)
        return false;
    } else {
        var newObj = {};
        for (var key in obj) {
            if (key.indexOf("hp") == -1) {
                newObj[key] = newObj[key];
            }
        }
        this.itemEffect(item, newObj);
        return true;
    }
}
```

**Key Points**:
1. `obj.hp` is **-150** (negative value from item config)
2. Calls `this.changeHp(obj.hp)` which calls `this.changeAttr("hp", -150)`
3. `changeAttr()` updates HP: `this.hp += value` (so HP decreases by 150)
4. `changeAttr()` then checks: `if (key === "hp" && this.hp == 0) { this.die(); }`
5. Death check happens **immediately** in `changeAttr()`

### Item Config (`OriginalGame/src/data/itemConfig.js:229-241`)
```javascript
"1104032": {
    "id": "1104032",
    "weight": 1,
    "price": 31,
    "value": 30.0731189840807,
    "effect_medicine": {
        "id": "1104032",
        "infect": -100,
        "infect_chance": 1,
        "hp": -150,        // Negative HP damage
        "hp_chance": 0.5   // 50% chance to apply HP damage
    }
}
```

## Current Implementation Analysis

### PlayerStore.item1104032Effect() (`src/store/playerStore.ts:691-710`)
```typescript
item1104032Effect: (item: Item, effectObj: MedicineEffect | undefined) => {
  if (!effectObj) return false
  
  const state = get()
  const hpChance = effectObj.hp_chance || 0
  
  if (Math.random() <= hpChance) {
    // Apply HP damage
    const hpChange = effectObj.hp || 0  // This is -150
    const currentHp = state.hp
    state.updateAttribute('hp', currentHp + hpChange)  // currentHp + (-150)
    return false // No cure
  } else {
    // Apply other effects (excluding hp)
    // ...
    return true // Can cure
  }
}
```

**Issue**: The code looks correct - it should call `updateAttribute('hp', currentHp + hpChange)` which should trigger death check.

### Possible Issues

1. **Death check not triggering**: The death check in `updateAttribute()` might not be working correctly
2. **HP value calculation**: The HP might not actually reach 0 (clamped incorrectly)
3. **Timing issue**: Death check might be called but overlay not showing
4. **Game pause before death check**: Time freezes (game pauses) but death overlay doesn't show

## Investigation Steps

### Step 1: Verify HP Calculation
**Check**: When `hpChange = -150` and `currentHp = 100`, does `currentHp + hpChange = -50` get clamped to 0 correctly?

**Expected**: `updateAttribute('hp', -50)` should clamp to 0 and trigger death check.

### Step 2: Verify Death Check is Called
**Check**: Add console.log in `checkDeathOnAttributeChange()` and `handleDeath()` to see if they're called.

### Step 3: Verify Death Overlay Trigger
**Check**: Is `uiStore.showOverlay('death', { reason })` being called? Check if overlay is actually shown.

### Step 4: Check Game Pause Timing
**Check**: Is game being paused before death check? The user says "time freezes" which suggests game.pause() is called, but maybe it's called at the wrong time.

## Root Cause Hypothesis

Looking at the code flow:
1. `useItem()` calls `item1104032Effect()`
2. `item1104032Effect()` calls `updateAttribute('hp', currentHp + hpChange)`
3. `updateAttribute()` should check for death and call `handleDeath()`
4. `handleDeath()` calls `game.pause()` and `uiStore.showOverlay('death', { reason })`

**Possible Issues**:

1. **Death check not being called**: The `updateAttribute()` might not be triggering the death check correctly
2. **HP calculation issue**: The HP might not actually reach 0 (calculation error)
3. **Overlay not showing**: `showOverlay()` might be called but overlay doesn't render (React rendering issue)
4. **Overlay data issue**: `deathReason` might not be set correctly in UIStore
5. **Game pause timing**: Game might be paused before death check, preventing overlay from showing

**Most Likely Issue**: The death check is being called, but the overlay isn't rendering because:
- `activeOverlay` is set but `DeathOverlay` component doesn't render
- Or `deathReason` is not set correctly
- Or there's a React rendering issue preventing the overlay from appearing

## Potential Issues Found

### Issue 1: ItemDialog Still Open
When item is used from ItemDialog:
1. User clicks "Use" button in ItemDialog
2. `handleUse()` emits `btn_1_click` event
3. `StoragePanelContent.handleItemUse()` calls `useItem()`
4. HP reaches 0, death check triggers
5. `handleDeath()` is called, but **ItemDialog might still be open**

**Fix**: Close ItemDialog before or when death occurs.

### Issue 2: Overlay Z-Index or Rendering
Death overlay might be rendered but hidden behind ItemDialog or other UI elements.

**Fix**: Ensure death overlay has higher z-index than ItemDialog.

### Issue 3: Death Check Not Triggering
The `updateAttribute()` might not be calling the death check correctly for homemade penicillin.

**Fix**: Verify HP calculation and death check logic.

## Implementation Plan

### Step 1: Add Debug Logging
**File**: `src/store/playerStore.ts` and `src/utils/deathCheck.ts`

**Add console.log statements**:
- In `item1104032Effect()`: Log HP change calculation
- In `updateAttribute()`: Log when HP changes and death check result
- In `checkDeathOnAttributeChange()`: Log when death is detected
- In `handleDeath()`: Log when death is handled

### Step 2: Verify HP Calculation
**Check**: Ensure `currentHp + hpChange` calculation is correct and HP reaches 0.

**Test**: Use homemade penicillin with HP = 100, verify HP becomes 0.

### Step 3: Verify Death Check Logic
**Check**: Ensure `checkDeathOnAttributeChange('hp', 0)` returns death reason correctly.

**Test**: Manually set HP to 0 and verify death check works.

### Step 4: Verify Death Overlay Display
**Check**: Ensure `uiStore.showOverlay('death', { reason })` is called and overlay is displayed.

**Test**: Check if overlay state is set correctly and DeathOverlay component renders.

### Step 5: Check Game Pause Timing
**Check**: Ensure game pause happens in `handleDeath()`, not before.

**Issue**: If game is paused during `useItem()` (e.g., during time update), the death overlay might not show correctly.

### Step 6: Fix the Issue
Based on investigation results, fix the root cause:
- If death check not called: Fix the logic
- If death check called but overlay not shown: Fix overlay display
- If game pause timing issue: Fix pause timing

## Files to Check/Modify

### Files to Check
1. `src/store/playerStore.ts` - `item1104032Effect()` and `updateAttribute()`
2. `src/utils/deathCheck.ts` - `checkDeathOnAttributeChange()` and `handleDeath()`
3. `src/store/uiStore.ts` - `showOverlay()` method
4. `src/components/overlays/DeathOverlay.tsx` - Overlay rendering

### Files to Modify (if needed)
1. `src/store/playerStore.ts` - Fix HP calculation or death check
2. `src/utils/deathCheck.ts` - Fix death handling
3. `src/store/uiStore.ts` - Fix overlay display

## Testing Checklist

1. **HP Calculation**:
   - [ ] Use homemade penicillin with HP = 100
   - [ ] Verify HP becomes 0 (not negative)
   - [ ] Check console logs for HP calculation

2. **Death Check**:
   - [ ] Verify `checkDeathOnAttributeChange()` is called
   - [ ] Verify it returns 'hp_zero' or 'infection'
   - [ ] Check console logs for death check

3. **Death Handling**:
   - [ ] Verify `handleDeath()` is called
   - [ ] Verify game is paused
   - [ ] Verify `uiStore.showOverlay()` is called
   - [ ] Check console logs for death handling

4. **Death Overlay**:
   - [ ] Verify `activeOverlay === 'death'` in UIStore
   - [ ] Verify `deathReason` is set correctly
   - [ ] Verify DeathOverlay component renders
   - [ ] Check if overlay is visible on screen

5. **Edge Cases**:
   - [ ] HP = 50, use penicillin (HP damage = -150) → should go to 0
   - [ ] HP = 150, use penicillin (HP damage = -150) → should go to 0
   - [ ] HP = 1, use penicillin (HP damage = -150) → should go to 0
   - [ ] HP = 0 already → should trigger death immediately

## Expected Behavior

1. User uses homemade penicillin
2. 50% chance: HP damage applied (HP -= 150)
3. HP becomes 0 (clamped)
4. `updateAttribute()` detects HP = 0
5. `checkDeathOnAttributeChange()` returns 'hp_zero' or 'infection'
6. `handleDeath()` is called
7. Game pauses
8. Death overlay appears

## Notes

1. **HP Value**: Homemade penicillin has `hp: -150` in effect_medicine, so `hpChange` will be negative.

2. **Death Check**: Should happen immediately when HP reaches 0, not deferred.

3. **Game Pause**: Game should pause in `handleDeath()`, not during `useItem()` time update.

4. **Overlay Display**: Death overlay should appear even if game is paused.

5. **Time Freeze**: User reports "time freezes" - this suggests `game.pause()` is called, but maybe death overlay isn't showing. Need to check if overlay is actually rendered.

