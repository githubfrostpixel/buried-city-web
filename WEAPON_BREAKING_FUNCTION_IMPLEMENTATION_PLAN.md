# Weapon Breaking Function Implementation Plan

## Overview

Implement the weapon breaking system that checks if weapons/armor break after battle based on usage probability and returns scrap items.

## Original Game Implementation

### Function: `testWeaponBroken`
**Location:** `OriginalGame/src/game/Storage.js` (lines 373-414)

**Called From:** `OriginalGame/src/game/Battle.js` (lines 193, 198, 203) in `gameEnd()` method

### Key Components

1. **weaponRound Tracking**
   - Location: `OriginalGame/src/game/player.js` line 95
   - Type: `Record<string, number>` - tracks usage count per item ID
   - Initialized with all weapon/armor IDs set to 0
   - Incremented each battle, reset to 0 when broken

2. **WeaponReturn Mapping**
   - Location: `OriginalGame/src/data/formulaConfig.js`
   - Maps item ID to array of scrap items returned when weapon breaks
   - Example: `WeaponReturn["1301011"] = ["scrap_item_id"]`

3. **brokenProbability**
   - In item config: `effect_weapon.brokenProbability` or `effect_arm.brokenProbability`
   - Probability per battle usage

4. **Game Day Check**
   - Newbie protection: weapons don't break if `gameDay < 2`
   - Uses `cc.timer.formatTime().d` to get current day

5. **IAP Package Check**
   - If IAP package unlocked: reduce break probability by 75%
   - Uses `IAPPackage.isWeaponEffectUnlocked()`

## Current Implementation Status

### ✅ Already Implemented
- Battle end view displays broken weapons (UI ready)
- `brokenWeapon` array in BattleResult type
- Item config types include `brokenProbability` field

### ❌ Not Implemented
- `weaponRound` tracking in playerStore
- `testWeaponBroken()` function
- `WeaponReturn` mapping data
- Weapon breaking logic in `Battle.gameEnd()`
- Game day tracking
- IAP package check

## Implementation Tasks

### Task 1: Add weaponRound Tracking to PlayerStore
**File:** `src/store/playerStore.ts`

**Add to PlayerStore interface:**
```typescript
weaponRound: Record<string, number> // itemId -> usage count
```

**Add to initial state:**
```typescript
weaponRound: {}
```

**Add methods:**
- `incrementWeaponRound(itemId: string): void` - Increment usage count
- `resetWeaponRound(itemId: string): void` - Reset to 0
- `getWeaponRound(itemId: string): number` - Get current count
- `setWeaponRound(itemId: string, count: number): void` - Set count

### Task 2: Create WeaponReturn Data
**File:** `src/data/weaponReturn.ts` (new file)

**Structure:**
```typescript
export const weaponReturn: Record<string, string[]> = {
  "1301011": ["scrap_item_id"], // Example
  "1302011": ["scrap_item_id"],
  // ... other weapons
}
```

**Note:** Need to check original game's `formulaConfig.js` for actual mapping

### Task 3: Implement testWeaponBroken Function
**File:** `src/store/playerStore.ts` or `src/game/inventory/Bag.ts`

**Function signature:**
```typescript
testWeaponBroken(itemId: string, type: 0 | 1, multiplier: number): boolean
```

**Parameters:**
- `itemId`: Weapon/armor item ID
- `type`: 0 for weapon, 1 for armor
- `multiplier`: Damage multiplier (affects break probability)

**Logic:**
1. Check newbie protection (game day < 2) → return false
2. Get break probability from item config
3. Apply IAP reduction if unlocked (75% reduction)
4. Random roll: `Math.random() <= probability`
5. Check weaponRound:
   - If broken AND `weaponRound[itemId] > 2`: Break weapon
   - Else if broken but `weaponRound <= 2`: Set warning (round = 3)
   - Else: Increment weaponRound
6. On break:
   - Remove item from bag
   - Unequip if no duplicates
   - Add WeaponReturn items to bag
   - Reset weaponRound to 0
   - Log message (TODO: implement log system)

### Task 4: Use Game Day Tracking
**File:** `src/store/gameStore.ts` or `src/game/systems/TimeManager.ts`

**Already Implemented:**
- ✅ Game day tracking exists in `gameStore.day` (number)
- ✅ TimeManager has `formatTime().d` which returns day number
- ✅ Can use: `useGameStore.getState().day` or `game.getTimeManager().formatTime().d`

**Usage:**
```typescript
const gameStore = useGameStore.getState()
const currentDay = gameStore.day // 0-based (day 0 = first day)
// Newbie protection: if (currentDay < 2) return false
```

### Task 5: Implement IAP Package Check
**File:** `src/game/systems/IAPPackage.ts` or similar

**Need to:**
- Track IAP package unlock status
- Provide `isWeaponEffectUnlocked(): boolean` method

### Task 6: Integrate with Battle.gameEnd()
**File:** `src/game/combat/Battle.ts`

**Replace TODO (line 240) with:**
```typescript
// Calculate weapon breaking if win
if (isWin && this.player) {
  const brokenWeapon: string[] = []
  const playerStore = usePlayerStore.getState()
  
  // Check gun breaking
  const gunItemId = this.player.weapon1?.id
  if (gunItemId && this.sumRes.weapon1 > 0) {
    // Calculate multiplier based on bullet type
    let multiplier = 0.2
    if (this.sumRes.homemadeNum > 0) {
      const totalBullets = this.sumRes.homemadeNum + this.sumRes.bulletNum
      multiplier = (this.sumRes.homemadeNum / totalBullets) + 
                   ((this.sumRes.bulletNum / totalBullets) * 0.2)
    }
    // Special guns use multiplier 1
    if (gunItemId === "1301091" || gunItemId === "1301071" || gunItemId === "1301082") {
      multiplier = 1
    }
    if (playerStore.testWeaponBroken(gunItemId, 0, multiplier)) {
      brokenWeapon.push(gunItemId)
    }
  }
  
  // Check melee weapon breaking
  const weaponItemId = this.player.weapon2?.id
  if (weaponItemId && weaponItemId !== Equipment.HAND && this.sumRes.weapon2 > 0) {
    if (playerStore.testWeaponBroken(weaponItemId, 0, 1)) {
      brokenWeapon.push(weaponItemId)
    }
  }
  
  // Check armor breaking (if took damage)
  if (this.sumRes.totalHarm > 0) {
    const armItemId = this.player.bPlayer?.equipment?.equip
    if (armItemId && playerStore.testWeaponBroken(armItemId, 1, 1)) {
      brokenWeapon.push(armItemId)
    }
  }
  
  this.sumRes.brokenWeapon = brokenWeapon
}
```

## Required Data Structures

### weaponRound
```typescript
weaponRound: {
  "1301011": 0,
  "1301022": 0,
  "1301033": 0,
  "1301041": 0,
  "1301052": 0,
  "1301063": 0,
  "1301071": 0,
  "1301082": 0,
  "1301091": 0,
  "1302011": 0,
  "1302021": 0,
  "1302032": 0,
  "1302043": 0,
  "1304012": 0,
  "1304023": 0
}
```

### WeaponReturn
**Location:** `OriginalGame/src/data/formulaConfig.js` (lines 1-17)

**Mapping:**
```javascript
var WeaponReturn = {
    "1301011": ["1102011"],//handgun
    "1301022": ["1102022"],//Rifle
    "1301033": ["1102033"],//automatic rifle
    "1301041": ["1101021"],//Magnum
    "1301052": ["1101021", "1101041"],//M40
    "1301063": ["1101021", "1101041"],//FAMAS
    "1301071": ["1101051", "1102011"],//Ehandgun
    "1301082": ["1101021", "1101041", "1101051", "1101051", "1102022"],//Erifle
    "1301091": ["1101021", "1101041"],//flame
    "1302011": [],//crowbar (no scrap)
    "1302021": [],//axe (no scrap)
    "1302032": ["1102042"],//katana
    "1302043": ["1101021","1101041","1101051"],//chainsaw
    "1304012": [],//shirt (no scrap)
    "1304023": []//armor (no scrap)
};
```

### brokenProbability
Already in item config types, need to verify items have this field populated

## Implementation Order

1. **Phase 1: Basic Structure**
   - Add weaponRound to playerStore
   - Create WeaponReturn data file
   - Add testWeaponBroken function stub

2. **Phase 2: Core Logic**
   - Implement break probability calculation
   - Implement weaponRound tracking
   - Implement item removal and unequip

3. **Phase 3: Integration**
   - Integrate with Battle.gameEnd()
   - Add game day check
   - Add IAP package check

4. **Phase 4: Polish**
   - Add log messages
   - Test all weapon types
   - Verify scrap items are added

## Testing Checklist

- [ ] Newbie protection works (day < 2, no breaks)
- [ ] Gun breaking with different bullet types
- [ ] Melee weapon breaking
- [ ] Armor breaking when taking damage
- [ ] weaponRound increments correctly
- [ ] weaponRound warning state (round = 3)
- [ ] Weapon breaks after round > 2
- [ ] Item removed from bag on break
- [ ] Item unequipped if no duplicates
- [ ] Scrap items added to bag
- [ ] Broken weapons appear in battle end view
- [ ] IAP reduction works (if implemented)
- [ ] Special guns (flamethrower, electric) use correct multiplier

## Notes

1. **Newbie Protection**: Weapons don't break in first 2 days of gameplay
2. **Warning State**: If weapon would break but round <= 2, set round to 3 (gives warning)
3. **Multiplier**: Homemade bullets have higher break probability than good bullets
4. **Special Guns**: Flamethrower and electric guns use multiplier 1 (full probability)
5. **Armor**: Only breaks if player took damage (`totalHarm > 0`)
6. **Scrap Items**: Returned items are added to bag when weapon breaks

## Dependencies

- Game day tracking system
- IAP package system (optional, can stub for now)
- Log system (optional, can use console.log for now)
- WeaponReturn data mapping

## Next Steps

1. Check original game's WeaponReturn mapping
2. Check if game day tracking exists
3. Check if IAP system exists
4. Implement basic structure
5. Implement core logic
6. Integrate with battle system
7. Test thoroughly

