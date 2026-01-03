# Melee Weapon Test Button Plan

## Overview

Add a test button to the BattleSystemTestScreen to add and equip a melee weapon, similar to the existing "Add Gun" and "Add Bomb" buttons.

## Current Implementation Analysis

### Existing Test Buttons
From `src/components/test/BattleSystemTestScreen.tsx`:

**Add Gun (lines 192-210):**
```typescript
const addGun = () => {
  const gunId = "1301011" // Basic gun item ID
  // First add gun to bag (required for equipping)
  playerStore.addItemToBag(gunId, 1)
  // Then equip it
  const success = playerStore.equipItem('gun', gunId)
  if (success) {
    runTest('Add Gun', 'Equipped gun', () => `Current gun: ${playerStore.equipment.gun || 'None'}`)
  } else {
    runTest('Add Gun', 'Failed to equip gun', () => `Gun in bag: ${playerStore.getBagItemCount(gunId)}`)
  }
}
```

**Add Bomb (lines 170-190):**
```typescript
const addBomb = () => {
  const bombId = "1303012" // Bomb item ID
  // First add bomb to bag (required for equipping)
  playerStore.addItemToBag(bombId, 10)
  // Then equip it in tool slot
  const success = playerStore.equipItem('tool', bombId)
  if (success) {
    runTest('Add Bomb', 'Equipped bomb', () => `Current tool: ${playerStore.equipment.tool || 'None'}, Bombs in bag: ${playerStore.getBagItemCount(bombId)}`)
  } else {
    runTest('Add Bomb', 'Failed to equip bomb', () => `Bombs in bag: ${playerStore.getBagItemCount(bombId)}`)
  }
}
```

### Melee Weapon Item IDs
From `src/game/combat/createEquipment.ts`:
- **1302011** - Basic melee weapon
- **1302021** - Melee weapon type 2
- **1302032** - Melee weapon type 3
- **1302043** - Melee weapon type 4
- **"1"** - Hand (Equipment.HAND) - not a real item, can't be equipped

## Implementation Tasks

### Task 1: Add Melee Weapon Function
- [ ] Create `addMeleeWeapon()` function similar to `addGun()` and `addBomb()`
- [ ] Use melee weapon ID: `"1302011"` (basic melee weapon)
- [ ] Add weapon to bag first: `playerStore.addItemToBag(weaponId, 1)`
- [ ] Equip weapon: `playerStore.equipItem('weapon', weaponId)`
- [ ] Show success/failure message with current weapon status

### Task 2: Add Test Button
- [ ] Add button in "Add Items" TestSection
- [ ] Use TestButton component with variant="state"
- [ ] Call `addMeleeWeapon()` on click
- [ ] Button text: "Add Melee Weapon"

### Task 3: Test
- [ ] Verify weapon is added to bag
- [ ] Verify weapon is equipped in weapon slot
- [ ] Verify weapon appears in battle Equipment section
- [ ] Verify weapon is used in battle (weapon2)

## Code Location

**File:** `src/components/test/BattleSystemTestScreen.tsx`

**Add function after line 210 (after addGun function):**
```typescript
// Add Melee Weapon (equip it)
const addMeleeWeapon = () => {
  const weaponId = "1302011" // Basic melee weapon item ID
  // First add weapon to bag (required for equipping)
  playerStore.addItemToBag(weaponId, 1)
  // Then equip it
  const success = playerStore.equipItem('weapon', weaponId)
  if (success) {
    runTest(
      'Add Melee Weapon',
      'Equipped melee weapon',
      () => `Current weapon: ${playerStore.equipment.weapon || 'None'}`
    )
  } else {
    runTest(
      'Add Melee Weapon',
      'Failed to equip melee weapon',
      () => `Weapon in bag: ${playerStore.getBagItemCount(weaponId)}`
    )
  }
}
```

**Add button in TestSection "Add Items" (around line 290, after Add Bomb button):**
```typescript
<TestButton variant="state" onClick={addMeleeWeapon}>
  Add Melee Weapon
</TestButton>
```

## Weapon Breaking Function

### Function: `testWeaponBroken`
**Location:** `OriginalGame/src/game/Storage.js` (lines 373-414)

**Signature:**
```javascript
testWeaponBroken: function (itemId, type, multiplier)
```

**Parameters:**
- `itemId`: String - The item ID to test
- `type`: Number - 0 for weapon, 1 for armor
- `multiplier`: Number - Damage multiplier affecting break probability

**Logic:**
1. **Newbie Protection**: If game day < 2, weapons never break (return false)
2. **Get Break Probability**: 
   - If type == 0 (weapon): `itemConfig[itemId].effect_weapon.brokenProbability * multiplier`
   - If type == 1 (armor): `itemConfig[itemId].effect_arm.brokenProbability`
3. **IAP Reduction**: If IAP package unlocked, reduce probability by 75%
4. **Random Roll**: `Math.random() <= weaponBrokenProbability`
5. **Break Check**: 
   - If broken AND `player.weaponRound[itemId] > 2`:
     - Decrease item by 1: `this.decreaseItem(itemId, 1)`
     - If no more items: Unequip the item
     - Add return items (scrap): `WeaponReturn[itemId]` items added to bag
     - Reset weapon round: `player.weaponRound[itemId] = 0`
     - Log message: `player.log.addMsg(1205, itemName)`
     - Return true (broken)
   - Else if broken but `weaponRound <= 2`:
     - Set `player.weaponRound[itemId] = 3` (warning state)
     - Return false (not broken yet)
   - Else:
     - Increment `player.weaponRound[itemId]++`
     - Return false (not broken)

**Called From:**
- `OriginalGame/src/game/Battle.js` (lines 193, 198, 203):
  - Gun breaking: `player.bag.testWeaponBroken(gunItemId, 0, multiplier)`
  - Melee weapon breaking: `player.bag.testWeaponBroken(weaponItemId, 0, 1)`
  - Armor breaking: `player.bag.testWeaponBroken(armItemId, 1)`

**Current Implementation Status:**
- ❌ **Not Implemented**: `src/game/combat/Battle.ts` line 240 has TODO comment
- ✅ **UI Ready**: Battle end view already displays broken weapons (line 510)

**Required Data:**
- `brokenProbability` in `effect_weapon` or `effect_arm` of item config
- `weaponRound` tracking per item (usage count)
- `WeaponReturn` mapping (scrap items returned when weapon breaks)

## Next Steps

1. Implement `addMeleeWeapon()` function
2. Add test button to UI
3. Test melee weapon functionality
4. Future: Implement weapon breaking logic (separate task)


