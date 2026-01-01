# Item Use Function Implementation Plan

## Overview
Implement the item use functionality that handles food, medicine, and buff items when the user clicks "Use" in the ItemDialog. Cross-checked with original game implementation.

## Original Game Analysis

### Event Flow (`OriginalGame/src/ui/storageNode.js`)
1. User clicks "Use" button in ItemDialog
2. Dialog emits `btn_1_click` event with `(itemId, source)`
3. `StorageNode.onItemUseFunc()` listens to `btn_1_click`
4. Calls `player.useItem(player.storage, itemId)`
5. If successful, updates the view

### Item Use Logic (`OriginalGame/src/game/player.js`)

#### `player.useItem(storage, itemId)`
**Returns**: `{result: boolean, type?: number, msg?: string}`

**Flow**:
1. **Validate**: `storage.validateItem(itemId, 1)` - check if item exists and count >= 1
2. **Get item**: `storage.getItem(itemId)` and `stringUtil.getString(itemId).title`
3. **Handle by type**:
   - **Food (ItemType.TOOL, ItemType.FOOD = "1103")**:
     - Check: `uiUtil.checkStarve()` - returns false if starve is max
     - Update time: `cc.timer.updateTime(600)` - 10 minutes
     - Decrease item: `storage.decreaseItem(itemId, 1)`
     - Log message: `this.log.addMsg(1093, itemName, remainingCount)`
     - Apply effect: `this.itemEffect(item, item.getFoodEffect())`
     - Return `{result: true}`
   
   - **Medicine (ItemType.TOOL, ItemType.MEDICINE = "1104")**:
     - Update time: `cc.timer.updateTime(600)` - 10 minutes
     - Special case for `1104011` (Bandage):
       - Decrease item
       - Log: `this.log.addMsg(1094, itemName, remainingCount)`
       - Apply effect: `this.itemEffect(item, item.getMedicineEffect())`
       - Call: `this.bindUp()` - sets binded state
     - Other medicines:
       - Decrease item
       - Log: `this.log.addMsg(1095, itemName, remainingCount)`
       - Special case for `1104032` (Homemade Penicillin):
         - Call: `this.item1104032Effect(item, item.getMedicineEffect())`
         - If returns true: `this.cure()` - sets cured state
       - Other medicines:
         - Apply effect: `this.itemEffect(item, item.getMedicineEffect())`
         - Call: `this.cure()` - sets cured state
     - Return `{result: true}`
   
   - **Buff (ItemType.TOOL, ItemType.BUFF = "1107")**:
     - Update time: `cc.timer.updateTime(600)` - 10 minutes
     - Decrease item: `storage.decreaseItem(itemId, 1)`
     - Log message: `this.log.addMsg(1095, itemName, remainingCount)`
     - Apply buff: `this.buffManager.applyBuff(itemId)`
     - Return `{result: true}`
   
   - **Other types**:
     - Return `{result: false, type: 2, msg: "this type can't use"}`

4. **If validation fails**:
   - Return `{result: false, type: 1, msg: "not enough"}`

#### Helper Functions

**`uiUtil.checkStarve()`** (`OriginalGame/src/ui/uiUtil.js`):
- Checks if `player.isAttrMax("starve")`
- If max, shows dialog: `uiUtil.showTinyInfoDialog(1128)` (string ID 1128)
- Returns `false` if max, `true` otherwise

**`player.itemEffect(item, obj)`**:
- Calls `this.applyEffect(obj)` to apply item effects
- Handles bad effects (negative changes) and logs warning message (1107)

**`player.applyEffect(obj)`**:
- Iterates through effect object properties
- For each effect with `_chance` property:
  - Random roll to determine if effect applies
  - Calls corresponding `change{Attr}` method (e.g., `changeHp`, `changeSpirit`)
  - Tracks bad effects (negative changes)
- Returns array of bad effects

**`player.cure()`**:
- Sets `this.cured = true`
- Sets `this.cureTime = cc.timer.now()`
- Medicine treatment state

**`player.bindUp()`**:
- Sets `this.binded = true`
- Sets `this.bindTime = cc.timer.now()`
- Bandage treatment state

**`player.item1104032Effect(item, obj)`** (Homemade Penicillin):
- Special logic for item 1104032
- Has `hp_chance` property
- If random <= hp_chance: applies hp damage, returns false
- Otherwise: applies other effects (excluding hp), returns true

**`cc.timer.updateTime(600)`**:
- Advances game time by 600 seconds (10 minutes)
- Updates day/hour/minute counters
- Triggers time-based events

## Current Implementation Status

### StoragePanelContent (`src/components/panels/StoragePanelContent.tsx`)
- ✅ Listens to `btn_1_click` event
- ✅ Has placeholder handler: `handleItemUse`
- ❌ TODO: Implement actual item use logic

### Player Store (`src/store/playerStore.ts`)
- ❌ TODO: Add `cured`, `binded`, `cureTime`, `bindTime` state
- ❌ TODO: Add `useItem()` action method
- ❌ TODO: Add `itemEffect()` helper method
- ❌ TODO: Add `applyEffect()` helper method
- ❌ TODO: Add `cure()` action method
- ❌ TODO: Add `bindUp()` action method
- ❌ TODO: Add `item1104032Effect()` helper method

### TimeManager (`src/game/time/TimeManager.ts`)
- ❌ TODO: Implement `updateTime(seconds)` method

### UI Utilities
- ❌ TODO: Implement `checkStarve()` function
- ❌ TODO: Implement `showTinyInfoDialog()` for error messages

## Implementation Plan

### Step 1: Implement TimeManager.updateTime()
**File**: `src/game/time/TimeManager.ts`

**Function**:
```typescript
updateTime(seconds: number): void {
  // Add seconds to current time
  // Update day/hour/minute
  // Trigger time-based events (season change, etc.)
}
```

**Dependencies**:
- Current time state
- Day/hour/minute calculations
- Season change detection

### Step 2: Implement PlayerStore.useItem()
**File**: `src/store/playerStore.ts`

**Function Signature**:
```typescript
useItem: (storage: Storage, itemId: string) => {result: boolean, type?: number, msg?: string}
```

**Note**: Since we're using Zustand, this will be an action method in the store.

**Implementation Steps**:
1. Validate item exists and count >= 1
2. Get item and item name
3. Determine item type (food, medicine, buff)
4. Handle each type:
   - Food: check starve, update time, decrease item, apply effect, log
   - Medicine: update time, decrease item, apply effect, cure/bindUp, log
   - Buff: update time, decrease item, apply buff, log
5. Return result object

**Dependencies**:
- `Storage.validateItem()`
- `Storage.getItem()`
- `Storage.decreaseItem()`
- `TimeManager.updateTime()`
- `checkStarve()` utility
- `itemEffect()` method
- `cure()` method
- `bindUp()` method
- `buffManager.applyBuff()` (if buff system exists)
- Log system

### Step 3: Implement PlayerStore.itemEffect()
**File**: `src/store/playerStore.ts` (or helper function)

**Function**:
```typescript
itemEffect(item: Item, effectObj: FoodEffect | MedicineEffect | BuffEffect): void {
  const badEffects = this.applyEffect(effectObj)
  if (badEffects.length > 0) {
    // Log warning message about negative effects
  }
}
```

**Dependencies**:
- `applyEffect()` method
- Log system
- String system (for item names)

### Step 4: Implement PlayerStore.applyEffect()
**File**: `src/store/playerStore.ts` (or helper function)

**Function**:
```typescript
applyEffect(effectObj: Record<string, number>): Array<{attrName: string, changeValue: number}> {
  const badEffects = []
  for (const key in effectObj) {
    if (this.hasOwnProperty(key)) {
      const chance = effectObj[`${key}_chance`]
      if (chance && Math.random() <= chance) {
        const value = effectObj[key]
        this[`change${capitalize(key)}`](value)
        if (!this.isAttrChangeGood(key, value)) {
          badEffects.push({attrName: key, changeValue: value})
        }
      }
    }
  }
  return badEffects
}
```

**Dependencies**:
- Attribute change methods (`changeHp`, `changeSpirit`, etc.)
- `isAttrChangeGood()` method (determines if change is positive)

### Step 5: Implement PlayerStore.cure() and PlayerStore.bindUp()
**File**: `src/store/playerStore.ts`

**Functions**:
```typescript
cure(): void {
  this.cured = true
  this.cureTime = game.getTimeManager().now()
}

bindUp(): void {
  this.binded = true
  this.bindTime = game.getTimeManager().now()
}
```

**Dependencies**:
- TimeManager
- Player state (cured, binded, cureTime, bindTime)

### Step 6: Implement PlayerStore.item1104032Effect()
**File**: `src/store/playerStore.ts` (or helper function)

**Function**:
```typescript
item1104032Effect(item: Item, effectObj: MedicineEffect): boolean {
  const hpChance = effectObj.hp_chance
  if (Math.random() <= hpChance) {
    this.changeHp(effectObj.hp)
    return false  // No cure
  } else {
    // Apply other effects (excluding hp)
    const newObj = { ...effectObj }
    delete newObj.hp
    delete newObj.hp_chance
    this.itemEffect(item, newObj)
    return true  // Can cure
  }
}
```

**Dependencies**:
- `itemEffect()` method
- `changeHp()` method

### Step 7: Implement checkStarve() Utility
**File**: `src/utils/uiUtil.ts` or `src/components/overlays/ItemDialog.tsx`

**Function**:
```typescript
function checkStarve(playerStore: PlayerStore): boolean {
  if (playerStore.isAttrMax('starve')) {
    // Show error dialog: "Cannot eat when full"
    uiStore.showTinyInfoDialog('Cannot eat when full') // TODO: Use string system
    return false
  }
  return true
}
```

**Dependencies**:
- PlayerStore
- UIStore (for showing dialog)
- String system (for error message)

### Step 8: Update StoragePanelContent Handler
**File**: `src/components/panels/StoragePanelContent.tsx`

**Update**:
```typescript
const handleItemUse = (data: { itemId: string; source: string }) => {
  if (data.source !== 'storage') return
  
  const storage = new Storage('player')
  storage.restore(playerStore.storage)
  
  const res = playerStore.useItem(storage, data.itemId)
  if (res.result) {
    // Update player store with new storage state
    // Storage state is updated by useItem internally
    setUpdateTrigger(prev => prev + 1)
  } else {
    // Show error message if needed
    if (res.type === 1) {
      // Not enough items
      uiStore.addNotification('Not enough items', 'warning')
    } else if (res.type === 2) {
      // Can't use this type
      uiStore.addNotification("This item can't be used", 'warning')
    }
  }
}
```

**Dependencies**:
- Storage class
- PlayerStore (with useItem method)
- UIStore (for notifications)

### Step 9: Implement Log Messages
**File**: `src/game/player/Player.ts` or separate log system

**Messages needed**:
- 1093: Food consumed message (with item name and remaining count)
- 1094: Bandage used message (with item name and remaining count)
- 1095: Medicine/Buff used message (with item name and remaining count)
- 1107: Bad effect warning (with item name and effect details)
- 1128: Cannot eat when full

**Dependencies**:
- Log system
- String system

## Files to Create/Modify

### New Files
1. `src/utils/uiUtil.ts` - UI utility functions (checkStarve, showTinyInfoDialog)

### Modified Files
1. `src/store/playerStore.ts` - Add cured, binded, cureTime, bindTime state and useItem, itemEffect, applyEffect, cure, bindUp, item1104032Effect methods
2. `src/game/systems/TimeManager.ts` - Add updateTime method
3. `src/components/panels/StoragePanelContent.tsx` - Update handleItemUse implementation
4. `src/utils/uiUtil.ts` - Add checkStarve and showTinyInfoDialog functions

## Dependencies and Prerequisites

### Required Systems
1. **TimeManager**: Must support `updateTime(seconds)`
2. **Storage**: Must have `validateItem()`, `getItem()`, `decreaseItem()` methods
3. **Item**: Must have `getFoodEffect()`, `getMedicineEffect()`, `getBuffEffect()` methods
4. **Player Attributes**: Must have change methods (`changeHp`, `changeSpirit`, etc.)
5. **Log System**: Must support `addMsg()` with string IDs
6. **String System**: For item names and messages (can use placeholders for now)
7. **Buff System**: Must have `buffManager.applyBuff()` (if buff items are implemented)

### Testing Checklist
1. **Food Items**:
   - [ ] Can use food when starve < max
   - [ ] Cannot use food when starve is max (shows error)
   - [ ] Time advances by 10 minutes
   - [ ] Item count decreases by 1
   - [ ] Effects are applied correctly
   - [ ] Log message is shown

2. **Medicine Items**:
   - [ ] Can use medicine
   - [ ] Time advances by 10 minutes
   - [ ] Item count decreases by 1
   - [ ] Effects are applied correctly
   - [ ] cure() is called (except bandage)
   - [ ] bindUp() is called for bandage (1104011)
   - [ ] Special logic for 1104032 (Homemade Penicillin)
   - [ ] Log message is shown

3. **Buff Items**:
   - [ ] Can use buff items
   - [ ] Time advances by 10 minutes
   - [ ] Item count decreases by 1
   - [ ] Buff is applied via buffManager
   - [ ] Log message is shown

4. **Error Cases**:
   - [ ] Cannot use item when count is 0
   - [ ] Cannot use non-usable item types
   - [ ] Error messages are shown correctly

5. **UI Updates**:
   - [ ] Storage panel updates after item use
   - [ ] Item count reflects correctly
   - [ ] Dialog closes after successful use

## Notes

1. **Time Update**: 600 seconds = 10 minutes. This is consistent across all item types.

2. **Item Effects**: Effects are stored in item config as `effect_food`, `effect_medicine`, `effect_buff`. Each effect can have:
   - Direct values: `{hp: 10, spirit: 5}`
   - Chance values: `{hp_chance: 0.8, hp: 10}` (80% chance to apply)

3. **Special Items**:
   - `1104011`: Bandage - uses `bindUp()` instead of `cure()`
   - `1104032`: Homemade Penicillin - has special logic with hp_chance

4. **State Management**: Player needs `cured`, `binded`, `cureTime`, `bindTime` state for medicine effects.

5. **String System**: For now, can use placeholder strings. Should integrate with string system later.

6. **Log Messages**: Need to implement log message system or use notifications for now.

7. **Buff System**: If buff system is not yet implemented, can stub `buffManager.applyBuff()` for now.

