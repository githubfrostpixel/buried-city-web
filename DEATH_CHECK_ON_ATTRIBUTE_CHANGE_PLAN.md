# Death Check on Attribute Change Plan

## Problem
When using an item that reduces health to 0, death is not triggered. The death check should happen immediately when HP reaches 0, not just during hourly updates.

## Original Game Analysis

### Death Check in Original Game (`OriginalGame/src/game/player.js`)

#### `changeAttr()` Method (`OriginalGame/src/game/player.js:608-687`)
The original game has a `changeAttr()` method that is called whenever an attribute changes:

```javascript
changeAttr: function (key, value) {
    // ... buff checks, range info, etc ...
    
    // Update attribute
    this[key] += value;
    this[key] = Math.round(this[key]);
    this[key] = cc.clampf(this[key], 0, this[key + "Max"]);
    
    // ... range change logging, etc ...
    
    // Death check happens immediately after attribute change
    if (key === "hp") {
        if (this.hp == 0 && this === player) {
            this.die();
        }
    }
    if (key == "virus") {
        if (this.virus >= this.virusMax && this === player) {
            this.log.addMsg(stringUtil.getString(6671));
            this.changeAttr("hp", -this["hp"]); // Sets HP to 0, which triggers die()
        }
    }
    // Note: infect death is checked when HP changes to 0, not when infect changes
}
```

**Key Points**:
1. Death check happens **immediately** after attribute change
2. Checks for HP = 0, virus >= max, and infect >= max with HP = 0
3. Called for **all** attribute changes, not just hourly updates

#### `die()` Method
```javascript
die: function () {
    this.buffManager.abortBuff();
    this.isDead = true;
    game.stop();
    this.map.resetPos();
    Navigation.gotoDeathNode();
}
```

**Key Points**:
1. Sets `isDead = true`
2. Stops the game
3. Resets map position
4. Navigates to death node (shows death overlay)

## Current Implementation Analysis

### PlayerStore.updateAttribute() (`src/store/playerStore.ts`)
```typescript
updateAttribute: (attr: keyof PlayerAttributes, value: number) => set((state: PlayerStore) => {
  const newValue = Math.max(0, Math.min(value, state[`${attr}Max` as keyof PlayerAttributes] as number || 100))
  return {
    [attr]: newValue
  } as Partial<PlayerStore>
})
```

**Issue**: No death check! It just updates the value.

### SurvivalSystem.changeAttribute() (`src/game/systems/SurvivalSystem.ts`)
```typescript
private changeAttribute(attr: keyof PlayerAttributes, value: number): void {
  // ... attribute update logic ...
  playerStore.updateAttribute(attr, newValue)
  
  // Check death conditions immediately after attribute update
  if (attr === 'hp') {
    const updatedPlayerStore = usePlayerStore.getState()
    if (updatedPlayerStore.hp === 0) {
      const deathReason = this.deathCausedInfect ? 'infection' : 'hp_zero'
      this.handleDeath(deathReason)
    }
  }
  
  if (attr === 'virus') {
    // ... virus death check ...
  }
}
```

**Issue**: Death check exists here, but `applyEffect()` in PlayerStore bypasses this and calls `updateAttribute()` directly!

### PlayerStore.applyEffect() (`src/store/playerStore.ts`)
```typescript
applyEffect: (effectObj: Record<string, number>) => {
  // ...
  state.updateAttribute(attr, newValue)  // ❌ Bypasses SurvivalSystem.changeAttribute()
  // ...
}
```

**Root Cause**: Item effects call `updateAttribute()` directly, bypassing the death check in `SurvivalSystem.changeAttribute()`.

## Solution Options

### Option 1: Add Death Check to PlayerStore.updateAttribute() (Recommended)
**Pros**:
- Simple and direct
- Matches original game pattern (death check in changeAttr)
- Works for all attribute changes (not just survival system)

**Cons**:
- Creates dependency on SurvivalSystem/Game systems in PlayerStore
- May need to handle circular dependencies

**Implementation**:
1. Add death check logic to `updateAttribute()`
2. Call `SurvivalSystem.handleDeath()` or create a death check utility
3. Ensure it works for HP, virus, and infect death conditions

### Option 2: Make applyEffect() Use SurvivalSystem.changeAttribute()
**Pros**:
- Uses existing death check logic
- Centralizes attribute change logic

**Cons**:
- Requires passing SurvivalSystem instance to PlayerStore
- More complex architecture
- May have circular dependency issues

### Option 3: Create Wrapper Method in PlayerStore
**Pros**:
- Keeps PlayerStore independent
- Can be used by both SurvivalSystem and item effects

**Cons**:
- Duplicates some logic
- Need to ensure both paths use same method

## Recommended Implementation Plan

### Step 1: Create Death Check Utility Function
**File**: `src/utils/deathCheck.ts`

**Function**:
```typescript
export function checkDeathOnAttributeChange(
  attr: keyof PlayerAttributes,
  newValue: number,
  oldValue: number
): DeathReason | null {
  const playerStore = usePlayerStore.getState()
  
  if (attr === 'hp' && newValue === 0) {
    // Check if death was caused by infection
    if (playerStore.infect >= playerStore.infectMax) {
      return 'infection'
    }
    return 'hp_zero'
  }
  
  if (attr === 'virus' && newValue >= playerStore.virusMax) {
    return 'virus_overload'
  }
  
  // Note: infect death requires both infect >= max AND hp === 0
  // This is checked when hp changes to 0, not when infect changes
  
  return null
}
```

### Step 2: Update PlayerStore.updateAttribute()
**File**: `src/store/playerStore.ts`

**Changes**:
1. Import death check utility
2. Import SurvivalSystem or create handleDeath function
3. After updating attribute, check for death
4. If death detected, trigger death handling

**Implementation**:
```typescript
updateAttribute: (attr: keyof PlayerAttributes, value: number) => {
  const state = get()
  const oldValue = state[attr] as number
  const newValue = Math.max(0, Math.min(value, state[`${attr}Max` as keyof PlayerAttributes] as number || 100))
  
  set({ [attr]: newValue } as Partial<PlayerStore>)
  
  // Check for death immediately after attribute change (matching original game)
  const deathReason = checkDeathOnAttributeChange(attr, newValue, oldValue)
  if (deathReason) {
    handleDeath(deathReason)
  }
}
```

### Step 3: Create handleDeath Function
**File**: `src/utils/deathCheck.ts` or `src/game/systems/SurvivalSystem.ts`

**Function**:
```typescript
export function handleDeath(reason: DeathReason): void {
  const playerStore = usePlayerStore.getState()
  const uiStore = useUIStore.getState()
  const gameInstance = game
  
  // Set isDead flag (if we add it to PlayerStore)
  // For now, just show death overlay
  
  // Stop game
  gameInstance.pause()
  
  // Show death overlay
  uiStore.showOverlay('death', { reason })
  
  // Reset map position (if needed)
  // playerStore.map?.resetPos()
}
```

### Step 4: Update SurvivalSystem.changeAttribute()
**File**: `src/game/systems/SurvivalSystem.ts`

**Changes**:
- Remove duplicate death check (now handled in updateAttribute)
- Or keep it as backup/validation

### Step 5: Test Death Conditions
**Test Cases**:
1. Use item that reduces HP to 0 → should trigger death
2. Use item that reduces HP below 0 → should clamp to 0 and trigger death
3. Use item that increases virus to max → should trigger death
4. Use item that increases infect to max while HP is 0 → should trigger death with 'infection' reason
5. Use item that reduces HP but not to 0 → should NOT trigger death

## Files to Create/Modify

### New Files
1. `src/utils/deathCheck.ts` - Death check utility functions

### Modified Files
1. `src/store/playerStore.ts` - Add death check to `updateAttribute()`
2. `src/game/systems/SurvivalSystem.ts` - May remove duplicate death check or keep as validation

## Death Conditions (from Original Game)

1. **HP = 0**: 
   - Reason: `'hp_zero'` (default) or `'infection'` (if infect >= max)
   - Check: `if (key === 'hp' && this.hp == 0 && this === player)`
   - Action: `this.die()`

2. **Virus >= Max**:
   - Reason: `'virus_overload'`
   - Check: `if (key == 'virus' && this.virus >= this.virusMax && this === player)`
   - Action: Log message, then `this.changeAttr("hp", -this["hp"])` (sets HP to 0, which triggers die())

3. **Infect >= Max AND HP = 0**:
   - Reason: `'infection'`
   - Check: When HP changes to 0, check if `infect >= infectMax`
   - Note: In original game, this is checked in `updateInfect()` when HP reaches 0, not in `changeAttr()`
   - Sets `deathCausedInfect = true` in original

## Implementation Notes

1. **Immediate Check**: Death should be checked immediately when attribute changes, not deferred to hourly updates.

2. **Multiple Death Conditions**: Need to check all three conditions (HP, virus, infect).

3. **Death Reason Priority**: 
   - If HP = 0 and infect >= max → 'infection'
   - If HP = 0 → 'hp_zero'
   - If virus >= max → 'virus_overload'

4. **Game State**: On death, should:
   - Pause game
   - Show death overlay
   - Reset map position (if needed)
   - Set isDead flag (if we add it)

5. **Circular Dependencies**: Be careful not to create circular dependencies between PlayerStore, SurvivalSystem, and Game.

## Testing Checklist

1. **HP Death**:
   - [ ] Use item that reduces HP to exactly 0 → death triggered
   - [ ] Use item that reduces HP below 0 → clamped to 0, death triggered
   - [ ] Use item that reduces HP but not to 0 → no death

2. **Virus Death**:
   - [ ] Use item that increases virus to max → death triggered
   - [ ] Use item that increases virus above max → clamped to max, death triggered

3. **Infection Death**:
   - [ ] Set infect to max, then reduce HP to 0 → death with 'infection' reason
   - [ ] Set infect to max, HP not 0 → no death
   - [ ] HP = 0, infect not max → death with 'hp_zero' reason

4. **Item Use Integration**:
   - [ ] Use food item that reduces HP → death check works
   - [ ] Use medicine item that reduces HP → death check works
   - [ ] Use buff item that reduces HP → death check works

5. **Death Overlay**:
   - [ ] Death overlay appears when HP reaches 0
   - [ ] Death overlay shows correct reason
   - [ ] Game is paused when death overlay appears

