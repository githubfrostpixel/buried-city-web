# Battle Mechanics Missing Features Plan

## Overview

Comprehensive review of battle mechanics to identify missing features, incomplete implementations, and potential bugs.

## Investigation Method

1. Compare original game (`OriginalGame/src/game/Battle.js`) with current implementation
2. Check all battle-related files in `src/game/combat/`
3. Verify UI components handle all battle states
4. Test edge cases and special scenarios

## Current Implementation Status

### ✅ Implemented Features

1. **Basic Battle System**
   - Battle initialization
   - Monster creation and management
   - Battle lines (6 lines)
   - Target monster selection
   - Update loops (player and monster)

2. **Player Actions**
   - Gun usage (weapon1)
   - Melee weapon usage (weapon2)
   - Tool usage (bombs, etc.)
   - Dog usage
   - Equipment system

3. **Monster System**
   - Monster movement
   - Monster attacks
   - Monster death
   - Monster removal

4. **Battle End**
   - Win/loss detection
   - Result calculation
   - Item consumption (bullets, tools)
   - Weapon breaking
   - Virus gain/loss

5. **Dodge System**
   - Dodge timer
   - Dodge progress tracking
   - Dodge end (virus gain)

6. **Audio**
   - Battle music (bandit vs zombie)
   - Sound effects (weapon sounds, monster death)

7. **UI Integration**
   - Battle panel content
   - Combat logs
   - Progress bars
   - Equipment display

### 13. Dog Bonus Loot Dialog
**Status:** Missing

**Original Game:**
- After battle win, 10% chance (rand > 0.9) to trigger dog bonus
- Shows dialog with loot items
- Items added to site storage
- Dog mood decreases by 3

**Current Implementation:**
- ❌ **Missing:** Dog bonus loot dialog
- ❌ **Missing:** 10% chance check after battle win
- ❌ **Missing:** Dialog system for loot display
- ❌ **Missing:** Items added to site storage

**Location:** Should be in `Battle.gameEnd()` after win check

## ❌ Missing or Incomplete Features

### 1. Escape Mechanic
**Status:** Partially implemented, not connected to UI

**Important Distinction:**
- **Dodge (`isDodge`)**: Used for road/map encounters - automatic timer, player doesn't fight, just waits to escape
- **Escape (`escape()`)**: Used for room/site battles - player manually chooses to escape, can be interrupted by weapon use

**Original Game:**
- **Dodge**: Road encounters use `isDodge = true`, automatic escape after timer (5-6 seconds)
- **Escape**: Room/site battles use `isDodge = false`, player can manually escape by waiting `ESCAPE_TIME` (1.5 seconds)
- Escape is interrupted by any weapon use
- Escape action ends battle (loss)

**Current Implementation:**
- ✅ `BattlePlayer.escape()` method exists (line 239)
- ✅ `BattlePlayer.escapeAction()` exists (line 245)
- ✅ `BattlePlayer.interruptEscape()` exists (line 249) - but implementation is incomplete
- ✅ Escape interruption called in `useWeapon1()`, `useWeapon2()`, `useEquip()` (lines 228, 233, 236)
- ❌ **Missing:** UI button to trigger escape (for room/site battles)
- ❌ **Missing:** Escape progress indicator (dodge progress exists for road encounters, but escape is different)
- ❌ **Missing:** Proper escape interruption (uses `setTimeout`, should use scheduler/interval)

**Issue:** `interruptEscape()` doesn't actually cancel the `setTimeout` - needs to track timeout ID

**Usage:**
- Road encounters: `isDodge = true` (automatic dodge timer)
- Room/site battles: `isDodge = false`, escape button needed

**Files to Check:**
- `src/game/combat/BattlePlayer.ts` (lines 239-251)
- `src/components/panels/BattlePanelContent.tsx`

### 2. Fuel Consumption
**Status:** Partially implemented

**Original Game:**
- Fuel is consumed by flamethrower during battle
- Tracked in `sumRes.fuel`
- Removed from player at battle end (if fuel was consumed)

**Current Implementation:**
- ✅ `sumRes.fuel` exists in BattleResult
- ✅ Flamethrower consumes fuel (increments `sumRes.fuel` in `_action`, line 28)
- ✅ Flamethrower removes fuel from player store (in `cost`, line 82)
- **Note:** Fuel is consumed during battle, not at battle end (different from bullets/tools)
- **Status:** Appears complete, but need to verify fuel is properly tracked

### 3. Log Messages (String System)
**Status:** Using console.log, not string system

**Original Game:**
- Uses `stringUtil.getString()` for all log messages
- Localized messages (English/Chinese)
- Message IDs for different events

**Current Implementation:**
- Hardcoded English strings
- **Missing:** String system integration
- **Missing:** Localization support

**Examples:**
- Battle start messages (string IDs 9045, 1045)
- Battle win messages (string IDs 9118, 1118)
- Weapon break message (string ID 1205)
- Monster death messages (string IDs 1056, 9054)

### 4. IAP Package Check
**Status:** Stubbed, not implemented

**Original Game:**
- `IAPPackage.isWeaponEffectUnlocked()` reduces weapon break probability by 75%
- Affects weapon breaking calculation

**Current Implementation:**
- Commented out in `testWeaponBroken()`
- **Missing:** IAP package system
- **Missing:** Integration with weapon breaking

### 5. Battle End Log Messages
**Status:** Missing win/loss log messages

**Original Game:**
```javascript
if (isWin) {
    if (!this.isDodge && !this.endLogOverride) {
        if (this.useBandit()) {
            player.log.addMsg(9118);
        } else {
            player.log.addMsg(1118);
        }
    }
}
```

**Current Implementation:**
- **Missing:** Win message logging
- **Missing:** Loss message logging
- **Missing:** Log system integration

### 6. Monster Death Sound Effects
**Status:** ✅ Implemented

**Original Game:**
```javascript
if (!this.useBandit()) {
    audioManager.playEffect(audioManager.sound.MONSTER_DIE);
} else {
    audioManager.playEffect(audioManager.sound.BANDIT_DIE);
}
```

**Current Implementation:**
- ✅ Sound playback exists in `Monster.die()` (lines 219-223)
- ✅ Sound paths exist in `AudioManager.ts` (`MONSTER_DIE`, `BANDIT_DIE`)
- **Status:** Complete

### 7. Dog Sound Effects
**Status:** Missing

**Original Game:**
- Dog attack plays `SHORT_BARK` sound
- Commented as TODO in current code

**Current Implementation:**
- `BattlePlayer.useDog()` has TODO comment (line 140)
- Sound path exists in `AudioManager.ts` (`SHORT_BARK`)
- **Missing:** Dog bark sound effect playback

### 8. Battle Result Application
**Status:** Need to verify all result fields are applied

**Original Game:**
- Applies virus gain/loss (in `gameEnd` for dodge, or in battle result handler)
- Applies damage (hp loss) - handled during battle
- Updates player attributes

**Current Implementation:**
- ✅ Virus gain applied in dodge end (line 350)
- ❓ **Need to verify:** Virus gain/loss is applied for regular battles (not just dodge)
- ✅ HP loss applied during battle (in `BattlePlayer.underAtk`)
- ✅ Injury increase applied during battle
- ❓ **Need to verify:** All result fields are properly applied to player after battle
- Check `BattlePanelContent.tsx` `onBattleEnd` callback to see if virus is applied

### 9. Monster Movement Logic
**Status:** Need to verify matches original

**Original Game:**
- Monsters move every 1 second
- Movement logic in `Monster.move()`
- Different behavior for bandits vs zombies

**Current Implementation:**
- Need to verify movement matches original game
- Check `Monster.ts` movement implementation

### 10. Weapon Cooldown System
**Status:** Need to verify all weapons respect cooldowns

**Original Game:**
- Each weapon has `atkCD` (attack cooldown)
- Cooldowns are independent per weapon type
- Vigour affects cooldown (2x if vigour < 30)

**Current Implementation:**
- Need to verify cooldown system works correctly
- Check `BattleEquipment.ts` cooldown logic

### 11. Battle Initialization Order
**Status:** ✅ Implemented

**Original Game:**
- Monsters created first
- First monster moves to last line (line 34: `this.monsters[0].moveToLine(this.getLastLine())`)
- Update loops started
- Battle music plays
- Timer paused

**Current Implementation:**
- ✅ First monster moves to last line in `Battle.initialize()` (line 128)
- ✅ Update loops started
- ✅ Battle music plays
- ✅ Timer paused
- **Status:** Complete

### 12. Special Site Conditions
**Status:** Need to verify all special conditions

**Original Game:**
- Site 502 (WORK_SITE): Special tool restrictions
- Site 500: Bandit battles
- Flamethrower restrictions at site 502

**Current Implementation:**
- Need to verify all site-specific logic is correct
- Check `BattlePlayer.action()` for site checks

## Testing Checklist

### Core Mechanics
- [ ] Battle starts correctly
- [ ] Monsters spawn and move
- [ ] Player can attack with all weapon types
- [ ] Monsters attack player
- [ ] Battle ends when all monsters killed
- [ ] Battle ends when player dies
- [ ] Items are consumed correctly
- [ ] Weapons can break
- [ ] Dodge mechanic works

### Missing Features
- [ ] Escape button appears in UI
- [ ] Escape progress indicator works
- [ ] Escape is interrupted by weapon use
- [ ] Fuel is consumed (if applicable)
- [ ] Fuel is removed at battle end
- [ ] Win/loss messages appear in log
- [ ] Monster death sounds play
- [ ] Dog bark sound plays
- [ ] All battle result fields are applied

### Edge Cases
- [ ] Battle with no weapons
- [ ] Battle with no ammo
- [ ] Battle with no tools
- [ ] Battle at different sites
- [ ] Battle with bandits vs zombies
- [ ] Battle with dog
- [ ] Battle with dodge
- [ ] Battle with all weapons broken
- [ ] Battle with 0 HP
- [ ] Battle with max virus

## Implementation Priority

### High Priority (Core Functionality)
1. **Escape Mechanic UI** - Players need way to escape
2. **Fuel Consumption** - If fuel is used, it should be consumed
3. **Battle Result Application** - Ensure all results are applied correctly

### Medium Priority (Polish)
4. **Sound Effects** - Monster death, dog bark
5. **Log Messages** - Win/loss messages
6. **Escape Interruption** - Weapon use should interrupt escape

### Low Priority (Future)
7. **String System** - Localization support
8. **IAP Package** - If IAP system is implemented

## Files to Review

1. `src/game/combat/Battle.ts` - Main battle controller
2. `src/game/combat/BattlePlayer.ts` - Player actions
3. `src/game/combat/Monster.ts` - Monster behavior
4. `src/components/panels/BattlePanelContent.tsx` - Battle UI
5. `src/game/combat/BattleEquipment.ts` - Weapon base class
6. `src/game/systems/AudioManager.ts` - Sound effects

## Summary of Missing Features

### High Priority (Core Functionality)
1. **Escape Mechanic UI** - No button to escape, escape interruption incomplete
2. **Virus Application** - Need to verify virus is applied after regular battles (not just dodge)
3. **Dog Bonus Loot Dialog** - Missing 10% chance loot dialog after battle win

### Medium Priority (Polish)
4. **Dog Sound Effect** - SHORT_BARK not played when dog attacks
5. **Battle End Log Messages** - Win/loss messages not logged
6. **Escape Progress Indicator** - UI shows dodge progress but not escape progress

### Low Priority (Future)
7. **String System** - Hardcoded English strings, no localization
8. **IAP Package** - Weapon break reduction not implemented

## Implementation Status Summary

### ✅ Fully Implemented
- Basic battle system
- Monster movement and attacks
- Player weapons (gun, melee, tools)
- Dog companion
- Dodge mechanic
- Weapon breaking
- Item consumption
- Monster death sounds
- Battle initialization
- Battle end result calculation

### ⚠️ Partially Implemented
- Escape mechanic (logic exists, UI missing, interruption incomplete)
- Fuel consumption (consumed during battle, but need to verify tracking)
- Virus application (applied in dodge, need to verify regular battles)

### ❌ Missing
- Escape UI button
- Escape progress indicator
- Escape interruption (setTimeout can't be cancelled)
- Dog bonus loot dialog
- Dog bark sound effect
- Battle win/loss log messages
- String system integration
- IAP package check

## Next Steps

1. Review each missing feature in detail
2. Check original game implementation
3. Create implementation plan for each feature
4. Prioritize based on importance
5. Implement missing features

