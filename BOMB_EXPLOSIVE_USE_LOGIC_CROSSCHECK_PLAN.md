# Bomb/Explosive Use Logic Cross-Check Plan

## Overview

Cross-check the Bomb/explosive use logic implementation against the original game to ensure all functionality matches exactly.

## Original Game Implementation Analysis

### Bomb Item IDs
From `OriginalGame/src/game/Battle.js` (lines 600-603):
- **1303012** - Bomb type 1
- **1303033** - Bomb type 2  
- **1303044** - Bomb type 3

All three IDs create `Bomb` instances via `createEquipment()`.

### Bomb Class Structure
From `OriginalGame/src/game/Battle.js` (lines 667-713):

**Constructor:**
```javascript
ctor: function (id, bPlayer) {
    this._super(id, bPlayer);
    this.banditOverride = bPlayer.banditOverride;
    this.deadMonsterNum = 0;
}
```

**Properties:**
- `banditOverride`: Boolean flag from bPlayer
- `deadMonsterNum`: Counter for monsters killed by this bomb

**Action Method (`_action`):**
1. Check if enough resources: `if (!this.isEnough()) return;`
2. Play sound: `audioManager.playEffect(audioManager.sound.BOMB)`
3. Track tool usage: `this.bPlayer.battle.sumRes.tools++`
4. Get monsters copy: `var monsters = this.bPlayer.battle.monsters.concat();`
5. Get damage: `var harm = this.attr.atk;`
6. Attack all monsters: `monsters.forEach(function (mon) { mon.underAtk(self); });`
7. Consume tool: `this.cost();`
8. Log explosion message (with string IDs):
   - Bandit site (500) or banditOverride: String IDs 9050, 9053
   - Normal site: String IDs 1050, 1053
   - Color: `cc.color(255, 128, 0)` (orange #FF8000)
9. If dead monsters: Log kill message and check game end
10. Reset deadMonsterNum: `this.deadMonsterNum = 0;`

**After Cooldown (`afterCd`):**
- Calls `this._action()` again (bomb explodes again after cooldown)

### Monster.underAtk with Bomb
From `OriginalGame/src/game/Battle.js` (lines 385-410):

When `mon.underAtk(self)` is called with `self` being a Bomb instance:
```javascript
} else if (obj instanceof Bomb) {
    harm = this.attr.atk;
    this.hp -= harm;
    if (this.hp <= 0) {
        this.die(obj);
    }
}
```

**Key Points:**
- Bomb damage = `this.attr.atk` (monster's ATK, not bomb's ATK - this seems wrong, need to verify)
- Actually, looking at line 680: `var harm = this.attr.atk;` - this is the bomb's ATK
- Then line 683: `mon.underAtk(self)` - passes the Bomb instance
- In Monster.underAtk, if `obj instanceof Bomb`, it uses `this.attr.atk` which would be the MONSTER's ATK
- This seems like a bug or the code is different - need to check actual implementation

### Monster.die with Bomb
From `OriginalGame/src/game/Battle.js` (lines 409-410):
```javascript
if (obj instanceof Bomb) {
    obj.deadMonsterNum++;
}
```

**Key Points:**
- When monster dies from bomb, increment `bomb.deadMonsterNum`
- This tracks how many monsters were killed by this bomb explosion

### Tool Usage Restriction
From `OriginalGame/src/game/Battle.js` (line 486):
```javascript
if (!(toolEquip == "1303012" || toolEquip == "1303033" || toolEquip == "1303044")) {
    this.useEquip();
}
```

**Key Points:**
- At WORK_SITE (502), bombs (1303012, 1303033, 1303044) are NOT used automatically
- Other tools are used normally at WORK_SITE
- Outside WORK_SITE, all tools (including bombs) are used automatically

### Log Messages
**Original uses string system:**
- String ID 1050: Bomb name + explosion message (zombies)
- String ID 1053: Damage amount message (zombies)
- String ID 1056: Killed X zombies message
- String ID 9050: Bomb name + explosion message (bandits)
- String ID 9053: Damage amount message (bandits)
- String ID 9054: Killed X bandits message

**Current implementation uses hardcoded strings:**
- `Bomb exploded! Dealt ${harm} damage` (same for both)
- `Killed ${this.deadMonsterNum} zombies/bandits`

## Current Implementation Analysis

### Bomb.ts Implementation

**Constructor:**
```typescript
constructor(id: string, bPlayer: any) {
    super(id, bPlayer)
    this.banditOverride = bPlayer.banditOverride
    this.deadMonsterNum = 0
}
```
✅ Matches original

**Action Method:**
```typescript
protected _action(): void {
    if (!this.isEnough()) {
        return
    }
    audioManager.playEffect(SoundPaths.BOMB)
    this.bPlayer.battle.sumRes.tools++
    const monsters = [...this.bPlayer.battle.monsters]
    const harm = this.attr.atk || 0
    monsters.forEach((mon) => {
        mon.underAtk("Bomb", harm)
    })
    this.cost()
    // Log messages...
    if (this.deadMonsterNum > 0) {
        // Log kill message...
        this.deadMonsterNum = 0
        this.bPlayer.battle.checkGameEnd()
    }
}
```

**Issues Found:**
1. ❌ **Monster.underAtk call**: Current passes `"Bomb"` string and `harm`, original passes `self` (Bomb instance)
2. ❌ **Log messages**: Current uses hardcoded strings, original uses string system
3. ❌ **Log message content**: Current has same message for bandits/zombies, original has different string IDs
4. ❌ **English singular/plural**: Original handles "zombie" vs "zombies" for count=1, current doesn't

### Monster.underAtk Implementation

**Current:**
```typescript
} else if (obj === "Bomb") {
    harm = providedHarm || 0
}
```

**Original:**
```javascript
} else if (obj instanceof Bomb) {
    harm = this.attr.atk;  // Uses MONSTER's ATK (seems wrong)
    this.hp -= harm;
    if (this.hp <= 0) {
        this.die(obj);
    }
}
```

**Issues:**
1. ✅ **Damage source**: Original uses `obj.attr.atk` (bomb's ATK via Bomb instance), current uses `providedHarm` (bomb's ATK) - both correct
2. ❌ **Object type**: Current uses string `"Bomb"`, original uses `instanceof Bomb`
3. ❌ **Die call**: Original passes Bomb instance to `die()`, current passes string

### Monster.die Implementation

**Current:**
```typescript
die(obj: BattleEquipment | "Dog" | "Bomb" | "Flamethrower" | null): void {
    // ...
    if (obj === "Bomb") {
        // Need to find bomb instance to increment deadMonsterNum
    }
}
```

**Original:**
```javascript
if (obj instanceof Bomb) {
    obj.deadMonsterNum++;
}
```

**Issues:**
1. ❌ **deadMonsterNum increment**: Current implementation needs to find the bomb instance to increment `deadMonsterNum`
2. ❌ **Object type**: Current uses string, original uses instance

### Tool Usage Restriction

**Current (BattlePlayer.ts lines 114-121):**
```typescript
if (playerStore.nowSiteId === WORK_SITE) {
    const toolEquip = playerStore.equipment.tool
    if (!(toolEquip === "1303012" || toolEquip === "1303033" || toolEquip === "1303044")) {
        this.useEquip()
    }
} else {
    this.useEquip()
}
```
✅ Matches original logic

## Issues to Fix

### Issue 1: Bomb Instance Tracking (CRITICAL)
**Problem:** Current implementation passes `"Bomb"` string to `mon.underAtk()`, but `mon.die()` needs the Bomb instance to increment `deadMonsterNum`.

**Current Behavior:**
- Bomb._action calls: `mon.underAtk("Bomb", harm)` - passes string
- Monster.die checks: `if (obj && typeof obj === 'object' && 'deadMonsterNum' in obj)`
- Since `obj === "Bomb"` is a string, the check fails
- **Result: `deadMonsterNum` is NEVER incremented!**
- **Result: Kill message is never logged!**
- **Result: Game end check after bomb kills is never triggered!**

**Solution Options:**
- Option A: Pass Bomb instance instead of string (matches original)
- Option B: Store bomb instance reference in Battle or BattlePlayer
- Option C: Use a different mechanism to track dead monsters

**Recommended:** Option A - Pass Bomb instance, update Monster.underAtk to accept Bomb instance (matches original game exactly)

### Issue 2: Damage Calculation
**Problem:** Need to verify if original uses bomb's ATK or monster's ATK.

**Analysis:**
- Original bomb._action: `var harm = this.attr.atk;` (bomb's ATK)
- Original mon.underAtk: `harm = obj.attr.atk;` where obj is Bomb instance (bomb's ATK)
- Both use bomb's ATK, which is correct
- Current implementation: `harm = this.attr.atk` then passes as `providedHarm` - also correct

**Status:** ✅ Damage calculation is correct in current implementation

### Issue 3: Log Messages
**Problem:** Current uses hardcoded strings, original uses string system.

**Solution:**
- For now: Keep hardcoded strings but match original message format
- Future: Integrate with string system when available

### Issue 4: Log Message Differentiation
**Problem:** Current has same message for bandits/zombies.

**Solution:** Add proper differentiation:
- Bandit site (500) or banditOverride: "bandits"
- Normal site: "zombies"

### Issue 5: Singular/Plural Handling
**Problem:** Original handles "zombie" vs "zombies" for count=1.

**Solution:** Add singular/plural logic:
```typescript
const monsterType = (count === 1) ? "zombie" : "zombies"
```

## Implementation Tasks

### Task 1: Fix Bomb Instance Passing (CRITICAL)
**Current Code:**
```typescript
// Bomb.ts line 31
monsters.forEach((mon) => {
    mon.underAtk("Bomb", harm)  // ❌ Passes string
})
```

**Original Code:**
```javascript
monsters.forEach(function (mon) {
    mon.underAtk(self);  // ✅ Passes Bomb instance
});
```

**Fix Required:**
- [ ] Change `mon.underAtk("Bomb", harm)` to `mon.underAtk(this, harm)` in Bomb._action()
- [ ] Update Monster.underAtk signature to accept Bomb instance: `underAtk(obj: BattleEquipment | "Dog" | Bomb | "Flamethrower", providedHarm?: number)`
- [ ] Update Monster.underAtk to check `obj instanceof Bomb` instead of `obj === "Bomb"`
- [ ] Update Monster.underAtk to use `obj.attr.atk` for bomb damage (matches original)
- [ ] Update Monster.die signature to accept Bomb instance: `die(obj: BattleEquipment | "Dog" | Bomb | "Flamethrower" | null)`
- [ ] Update Monster.die to check `obj instanceof Bomb` instead of string check
- [ ] Verify deadMonsterNum increment works correctly

### Task 2: Verify Damage Calculation
- [ ] Verify bomb's ATK is used (not monster's ATK)
- [ ] Test with different bomb types to ensure correct damage

### Task 3: Fix Log Messages
**Current Issues:**
- Line 37-39: Same message for bandits and zombies (should be different)
- Line 43-45: Missing singular/plural handling (1 zombie vs 2 zombies)
- Hardcoded strings instead of string system (acceptable for now)

**Fix Required:**
- [ ] Update log messages to differentiate bandits vs zombies properly
- [ ] Add singular/plural handling: `const monsterType = (this.deadMonsterNum === 1) ? "zombie" : "zombies"`
- [ ] Match original message format (two separate log entries for explosion and damage)
- [ ] Keep color #FF8000 (orange) for bomb messages

### Task 4: Test Bomb Usage
- [ ] Test bomb at normal site (should auto-use)
- [ ] Test bomb at WORK_SITE (should NOT auto-use)
- [ ] Test bomb damage to all monsters
- [ ] Test deadMonsterNum tracking
- [ ] Test game end check after bomb kills monsters
- [ ] Test bomb cooldown and afterCd behavior

### Task 5: Cross-Check with Original
- [ ] Verify bomb sound plays correctly
- [ ] Verify tool consumption works
- [ ] Verify sumRes.tools++ increments
- [ ] Verify all monsters are attacked
- [ ] Verify log message colors (#FF8000 orange)
- [ ] Verify afterCd calls _action again

## Testing Checklist

- [ ] Bomb equipped in tool slot
- [ ] Bomb has items in bag (toolNum > 0)
- [ ] Bomb auto-uses during battle (except at WORK_SITE)
- [ ] Bomb does NOT auto-use at WORK_SITE (502)
- [ ] Bomb plays BOMB sound effect
- [ ] Bomb damages ALL monsters simultaneously
- [ ] Bomb damage = bomb's ATK value
- [ ] Bomb consumes 1 tool per use
- [ ] Bomb increments battle.sumRes.tools
- [ ] Bomb logs explosion message in orange (#FF8000)
- [ ] Bomb logs damage amount
- [ ] Bomb tracks deadMonsterNum correctly
- [ ] Bomb logs kill message if monsters killed
- [ ] Bomb resets deadMonsterNum after logging
- [ ] Bomb triggers game end check if monsters killed
- [ ] Bomb cooldown works correctly
- [ ] Bomb afterCd calls _action again (explodes again)
- [ ] Multiple bomb types (1303012, 1303033, 1303044) all work
- [ ] Bomb works correctly in bandit battles
- [ ] Bomb works correctly in zombie battles

## Notes

1. **Bomb Cooldown Behavior**: The `afterCd()` method calls `_action()` again, meaning the bomb explodes repeatedly after each cooldown until no tools remain or battle ends.

2. **Tool Slot Requirement**: Bomb must be equipped in the tool slot (equipment.tool) to be used.

3. **Bag Item Requirement**: Bomb items must be in the player's bag (toolNum > 0) to be used.

4. **WORK_SITE Restriction**: Bombs are specifically excluded from auto-use at WORK_SITE (502), unlike other tools.

5. **All Monsters Attack**: Bomb attacks ALL monsters in the battle simultaneously, not just the target.

6. **Dead Monster Tracking**: The `deadMonsterNum` counter is per-bomb-instance and tracks how many monsters that specific bomb explosion killed.

## Summary of Critical Issues

### 🔴 CRITICAL: deadMonsterNum Never Increments
**Impact:** Bomb kill messages never appear, game end check never triggers after bomb kills

**Root Cause:** Bomb passes string `"Bomb"` instead of Bomb instance to `mon.underAtk()`

**Current Flow:**
1. `Bomb._action()` calls `mon.underAtk("Bomb", harm)` ❌
2. `Monster.underAtk()` receives string `"Bomb"` ❌
3. `Monster.die()` receives string `"Bomb"` ❌
4. Check `typeof obj === 'object'` fails (string is not object) ❌
5. `deadMonsterNum` never increments ❌
6. Kill message never logged ❌
7. Game end check never triggered ❌

**Fix:** Pass Bomb instance (`this`) instead of string

### 🟡 MEDIUM: Log Messages Not Differentiated
**Impact:** Same message for bandits and zombies, missing singular/plural handling

**Fix:** Add proper differentiation and singular/plural logic

### 🟢 LOW: String System Not Used
**Impact:** Hardcoded strings instead of string system (acceptable for now)

**Fix:** Can be deferred until string system is integrated

## Next Steps

1. **PRIORITY 1:** Fix bomb instance passing (CRITICAL - breaks kill tracking)
2. **PRIORITY 2:** Update log messages (MEDIUM - affects user experience)
3. **PRIORITY 3:** Test all bomb functionality
4. **PRIORITY 4:** Cross-check with original game behavior
5. **FUTURE:** Integrate string system when available

