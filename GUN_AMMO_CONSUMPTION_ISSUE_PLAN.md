# Gun Ammo and Bomb Consumption Issue Investigation Plan

## Problem

When using a gun in battle, ammo (bullets) are not being consumed from the player's bag. The bullet count in the bag remains the same after battle.

**Additionally, the same bug affects bombs/tools** - they are not correctly decreased from the bag after battle.

## Investigation Findings

### Current Implementation Flow

1. **Battle Initialization** (`BattlePanelContent.tsx` lines 85-88):
   - Bullets are **READ** from player bag into `BattlePlayer.bulletNum` and `BattlePlayer.homemadeNum`
   - **Items are NOT removed from bag** - they're just copied into battle variables
   - Bag still contains the original items

2. **During Battle** (`Gun.ts`):
   - `Gun.cost()` method decreases `this.bPlayer.bulletNum--` or `this.bPlayer.homemadeNum--`
   - This only affects the local battle variables, NOT the player's bag
   - `sumRes.bulletNum++` and `sumRes.homemadeNum++` track usage for statistics
   - **Bag count remains unchanged during battle**

3. **Battle End** (`Battle.ts` lines 223-236):
   ```typescript
   // Save bullet/tool counts back to player
   if (this.player) {
     const playerStore = usePlayerStore.getState()
     playerStore.addItemToBag(BattleConfig.BULLET_ID, this.player.bulletNum)
     playerStore.addItemToBag(BattleConfig.HOMEMADE_ID, this.player.homemadeNum)
     
     if (this.player.equip && this.sumRes.toolItemId) {
       playerStore.addItemToBag(this.sumRes.toolItemId, this.player.toolNum)
       if (this.player.toolNum === 0) {
         // Unequip tool if count is 0
         // TODO: Implement unequip
       }
     }
   }
   ```

4. **Bomb/Tool Consumption** (`BattleEquipment.ts` and `Bomb.ts`):
   - `BattleEquipment.cost()` decreases `this.bPlayer.toolNum--`
   - This only affects local battle variable, NOT the player's bag
   - Same issue as bullets: `addItemToBag()` adds instead of setting

### Root Cause

**The bug has TWO parts:**

1. **Items are NOT removed from bag at battle start** (`BattlePanelContent.tsx` lines 85-88):
   - Items are only READ from bag, not removed
   - Bag still contains original items throughout battle
   - Battle uses copies in battle variables

2. **Items are added back incorrectly at battle end** (`Battle.ts` lines 226-227 and 230):
   - Code uses `addItemToBag()` which **ADDS** to existing count
   - Since items were never removed, this would increase the count
   - However, if `addItemToBag()` fails (weight limit, etc.), count stays the same

**Actual Behavior:**
- Player starts with 50 bullets in bag
- Battle reads 50 bullets into battle variable (bag still has 50)
- Battle uses 10 bullets (battle variable becomes 40, bag still has 50)
- `addItemToBag(BULLET_ID, 40)` is called and **succeeds**
- Result: Bag now has 50 + 40 = **90 bullets** (WRONG! Items duplicated)
- Expected: Bag should have **40 bullets** (50 - 10 used)

**The Problem:**
- Items are never removed from bag at battle start
- `addItemToBag()` successfully adds remaining items back
- This causes item duplication (original count + remaining count)
- Items need to be **removed at battle start** and **set at battle end** (not added)

### Original Game Behavior

**Found in `OriginalGame/src/game/Battle.js` (lines 161-165):**
```javascript
player.bag.setItem(BattleConfig.BULLET_ID, this.player.bulletNum);
player.bag.setItem(BattleConfig.HOMEMADE_ID, this.player.homemadeNum);
if (this.player.equip) {
    this.sumRes.toolItemId = player.equip.getEquip(EquipmentPos.TOOL);
    player.bag.setItem(this.sumRes.toolItemId, this.player.toolNum);
    if (this.player.toolNum == 0) {
        player.equip.unequip(EquipmentPos.TOOL);
    }
}
```

The original game uses `setItem()` which **SETS** the count directly for:
- Bullets (`BULLET_ID`)
- Homemade bullets (`HOMEMADE_ID`)
- Tools/Bombs (`toolItemId`)

**Our implementation uses `addItemToBag()` which ADDS to existing count - this is the bug for all three item types!**

## Solution Options

### Option 1: Remove All Bullets at Battle Start, Add Remaining at End
**Pros:**
- Simple and clear
- Matches typical game pattern

**Cons:**
- Requires tracking initial counts

**Implementation:**
```typescript
// In Battle constructor or start method
const initialBulletNum = playerStore.getBagItemCount(BattleConfig.BULLET_ID)
const initialHomemadeNum = playerStore.getBagItemCount(BattleConfig.HOMEMADE_ID)
playerStore.removeItemFromBag(BattleConfig.BULLET_ID, initialBulletNum)
playerStore.removeItemFromBag(BattleConfig.HOMEMADE_ID, initialHomemadeNum)

// In Battle.gameEnd()
playerStore.addItemToBag(BattleConfig.BULLET_ID, this.player.bulletNum)
playerStore.addItemToBag(BattleConfig.HOMEMADE_ID, this.player.homemadeNum)
```

### Option 2: Calculate Used Bullets and Remove at Battle End
**Pros:**
- No need to track initial counts
- More efficient

**Cons:**
- Requires calculating difference

**Implementation:**
```typescript
// In Battle.gameEnd()
const initialBulletNum = this.sumRes.bulletNum + this.player.bulletNum
const initialHomemadeNum = this.sumRes.homemadeNum + this.player.homemadeNum
const usedBullets = initialBulletNum - this.player.bulletNum
const usedHomemade = initialHomemadeNum - this.player.homemadeNum

playerStore.removeItemFromBag(BattleConfig.BULLET_ID, usedBullets)
playerStore.removeItemFromBag(BattleConfig.HOMEMADE_ID, usedHomemade)
```

### Option 3: Set Bullet Count Directly (Requires New Method)
**Pros:**
- Most direct approach
- Clear intent

**Cons:**
- Requires adding new method to playerStore

**Implementation:**
```typescript
// Add to playerStore
setBagItemCount: (itemId: string, count: number) => {
  set((state) => ({
    bag: {
      ...state.bag,
      [itemId]: count
    }
  }))
}

// In Battle.gameEnd()
playerStore.setBagItemCount(BattleConfig.BULLET_ID, this.player.bulletNum)
playerStore.setBagItemCount(BattleConfig.HOMEMADE_ID, this.player.homemadeNum)
```

## Recommended Solution

**Option 2 (Calculate and Remove Used)** is recommended because:
1. **Simpler**: No need to remove items at battle start
2. **Safer**: Items stay in bag during battle (no risk of losing items if battle crashes)
3. **Cleaner**: Only remove what was actually used
4. **No new method needed**: Uses existing `removeItemFromBag()`
5. **Matches user preference**: Keep items in bag, remove used amount at end

**Alternative: Option 3** (Set Count Directly) is also valid but requires adding a new method and removing items at start.

## Implementation Steps

### Step 1: Update Battle.gameEnd() to Remove Used Items

**File:** `src/game/combat/Battle.ts` (in `gameEnd()` method, lines 223-236)

**Replace the current code:**
```typescript
// Save bullet/tool counts back to player
if (this.player) {
  const playerStore = usePlayerStore.getState()
  playerStore.addItemToBag(BattleConfig.BULLET_ID, this.player.bulletNum)
  playerStore.addItemToBag(BattleConfig.HOMEMADE_ID, this.player.homemadeNum)
  
  if (this.player.equip && this.sumRes.toolItemId) {
    playerStore.addItemToBag(this.sumRes.toolItemId, this.player.toolNum)
    if (this.player.toolNum === 0) {
      // Unequip tool if count is 0
      // TODO: Implement unequip
    }
  }
}
```

**With:**
```typescript
// Remove used items from bag (items stay in bag during battle)
if (this.player) {
  const playerStore = usePlayerStore.getState()
  
  // Calculate and remove used bullets
  const usedBullets = this.sumRes.bulletNum
  if (usedBullets > 0) {
    playerStore.removeItemFromBag(BattleConfig.BULLET_ID, usedBullets)
  }
  
  // Calculate and remove used homemade bullets
  const usedHomemade = this.sumRes.homemadeNum
  if (usedHomemade > 0) {
    playerStore.removeItemFromBag(BattleConfig.HOMEMADE_ID, usedHomemade)
  }
  
  // Calculate and remove used tools/bombs
  if (this.player.equip && this.sumRes.toolItemId) {
    // Calculate used tools: initial - remaining
    // We know how many were used from sumRes.tools, but we need the actual count
    // The toolNum in player is the remaining count
    // We need to calculate: initial = used + remaining
    // But we don't track initial, so we calculate: used = current bag count - remaining
    const currentToolCount = playerStore.getBagItemCount(this.sumRes.toolItemId)
    const remainingToolCount = this.player.toolNum
    const usedTools = currentToolCount - remainingToolCount
    
    if (usedTools > 0) {
      playerStore.removeItemFromBag(this.sumRes.toolItemId, usedTools)
    }
    
    if (this.player.toolNum === 0) {
      // Unequip tool if count is 0
      playerStore.unequipItem('tool')
    }
  }
}
```

**Note:** This approach:
- Keeps items in bag during battle (safer)
- Only removes what was actually used
- Uses existing `removeItemFromBag()` method
- No need to track initial counts

Add to `src/store/playerStore.ts`:
```typescript
setBagItemCount: (itemId: string, count: number) => {
  set((state) => {
    const newBag = { ...state.bag }
    if (count === 0) {
      delete newBag[itemId]
    } else {
      newBag[itemId] = count
    }
    return { bag: newBag }
  })
}
```

### Step 2: (Alternative) Add setBagItemCount Method (Option 3)

Change from:
```typescript
playerStore.addItemToBag(BattleConfig.BULLET_ID, this.player.bulletNum)
playerStore.addItemToBag(BattleConfig.HOMEMADE_ID, this.player.homemadeNum)

if (this.player.equip && this.sumRes.toolItemId) {
  playerStore.addItemToBag(this.sumRes.toolItemId, this.player.toolNum)
  if (this.player.toolNum === 0) {
    // Unequip tool if count is 0
    // TODO: Implement unequip
  }
}
```

To:
```typescript
playerStore.setBagItemCount(BattleConfig.BULLET_ID, this.player.bulletNum)
playerStore.setBagItemCount(BattleConfig.HOMEMADE_ID, this.player.homemadeNum)

if (this.player.equip && this.sumRes.toolItemId) {
  playerStore.setBagItemCount(this.sumRes.toolItemId, this.player.toolNum)
  if (this.player.toolNum === 0) {
    // Unequip tool if count is 0
    const playerStore = usePlayerStore.getState()
    playerStore.unequipItem('tool')
  }
}
```

### Alternative: Step 3 (Option 2 - Calculate and Remove)


### Step 3: Test
- Start with 50 bullets
- Use gun in battle (should consume bullets)
- Check bag after battle (should have remaining bullets, not more)

## Files to Modify

**Recommended Approach (Option 2 - Remove Used at End):**

1. `src/game/combat/Battle.ts`
   - Update `gameEnd()` to remove used items from bag
   - Calculate used bullets from `sumRes.bulletNum`
   - Calculate used homemade from `sumRes.homemadeNum`
   - Calculate used tools from bag count - remaining count
   - Implement tool unequip when count reaches 0

**Alternative Approach (Option 3 - Remove at Start, Set at End):**

1. `src/components/panels/BattlePanelContent.tsx`
   - Remove items from bag at battle start (in `startBattle()`)

2. `src/store/playerStore.ts`
   - Add `setBagItemCount()` method

3. `src/game/combat/Battle.ts`
   - Update `gameEnd()` to set item counts (not add)

## Testing Checklist

### Bullets
- [ ] Start battle with 50 bullets
- [ ] Use gun multiple times during battle
- [ ] Check bullet count decreases during battle (in battle UI)
- [ ] End battle
- [ ] Verify bag has correct remaining bullet count (not increased)
- [ ] Test with homemade bullets
- [ ] Test with both bullet types
- [ ] Test with 0 bullets remaining
- [ ] Test with no bullets at start (should not error)

### Bombs/Tools
- [ ] Start battle with 10 bombs
- [ ] Use bombs multiple times during battle
- [ ] Check bomb count decreases during battle (in battle UI)
- [ ] End battle
- [ ] Verify bag has correct remaining bomb count (not increased)
- [ ] Test with 0 bombs remaining (should unequip)
- [ ] Test with no bombs at start (should not error)
- [ ] Test with other tools (if applicable)

## Additional Notes

- **Confirmed:** The same issue exists for tools/bombs (line 230)
- All three item types (bullets, homemade bullets, tools) need to be fixed
- Original game uses `setItem()` for all three types
- Need to implement tool unequip when count reaches 0 (currently TODO)

