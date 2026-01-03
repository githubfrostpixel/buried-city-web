# Site 201 Test Plan

## Overview

Add test functionality to `SiteSystemTestScreen` specifically for testing site 201 exploration, including buttons to heal the player and add weapons/items similar to the `BattleSystemTestScreen`.

## Current Implementation Analysis

### Existing SiteSystemTestScreen
**File:** `src/components/test/SiteSystemTestScreen.tsx`

**Current Structure:**
- Has test functions for site creation, room generation, storage, etc.
- Uses `TestPanel`, `TestSection`, `TestButton`, `TestResultsList` components
- Can create sites by type (normal, ad, bazaar, work, boss)
- Has site ID input field

### Reference: BattleSystemTestScreen
**File:** `src/components/test/BattleSystemTestScreen.tsx`

**Heal Player Function (lines 251-259):**
```typescript
const healPlayer = () => {
  const playerStore = usePlayerStore.getState()
  const maxHp = playerStore.hpMax
  playerStore.updateAttribute('hp', maxHp)
  runTest(
    'Heal Player',
    `Healed to ${maxHp} HP`,
    () => `HP: ${playerStore.hp}/${maxHp}`
  )
}
```

**Add Gun Function (lines 193-212):**
```typescript
const addGun = () => {
  const gunId = "1301011" // Basic gun item ID
  // First add gun to bag (required for equipping)
  playerStore.addItemToBag(gunId, 1)
  // Then equip it
  const success = playerStore.equipItem('gun', gunId)
  if (success) {
    runTest(
      'Add Gun',
      'Equipped gun',
      () => `Current gun: ${playerStore.equipment.gun || 'None'}`
    )
  } else {
    runTest(
      'Add Gun',
      'Failed to equip gun',
      () => `Gun in bag: ${playerStore.getBagItemCount(gunId)}`
    )
  }
}
```

**Add Melee Weapon Function (lines 215-235):**
```typescript
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

**Add Gun Ammo Function (lines 151-159):**
```typescript
const addGunAmmo = () => {
  playerStore.addItemToBag(BattleConfig.BULLET_ID, 50)
  runTest(
    'Add Gun Ammo',
    'Added 50 bullets',
    () => `Current bullets: ${playerStore.getBagItemCount(BattleConfig.BULLET_ID)}`
  )
}
```

**Add Homemade Bullets Function (lines 161-169):**
```typescript
const addHomemadeBullets = () => {
  playerStore.addItemToBag(BattleConfig.HOMEMADE_ID, 50)
  runTest(
    'Add Homemade Bullets',
    'Added 50 homemade bullets',
    () => `Current homemade: ${playerStore.getBagItemCount(BattleConfig.HOMEMADE_ID)}`
  )
}
```

**Add Bomb Function (lines 171-191):**
```typescript
const addBomb = () => {
  const bombId = "1303012" // Bomb item ID
  // First add bomb to bag (required for equipping)
  playerStore.addItemToBag(bombId, 10)
  // Then equip it in tool slot
  const success = playerStore.equipItem('tool', bombId)
  if (success) {
    runTest(
      'Add Bomb',
      'Equipped bomb',
      () => `Current tool: ${playerStore.equipment.tool || 'None'}, Bombs in bag: ${playerStore.getBagItemCount(bombId)}`
    )
  } else {
    runTest(
      'Add Bomb',
      'Failed to equip bomb',
      () => `Bombs in bag: ${playerStore.getBagItemCount(bombId)}`
    )
  }
}
```

**Button Layout (lines 340-365):**
```typescript
<TestSection title="Add Items">
  <TestButton variant="state" onClick={addGun}>
    Add Gun
  </TestButton>
  <TestButton variant="state" onClick={addMeleeWeapon}>
    Add Melee Weapon
  </TestButton>
  <TestButton variant="state" onClick={addGunAmmo}>
    Add Gun Ammo (50)
  </TestButton>
  <TestButton variant="state" onClick={addHomemadeBullets}>
    Add Homemade (50)
  </TestButton>
  <TestButton variant="state" onClick={addBomb}>
    Add Bomb (10)
  </TestButton>
</TestSection>

<TestSection title="Game Settings">
  <TestButton variant="state" onClick={setGameDayTo3}>
    Set Day to 3 (Weapon Breaking)
  </TestButton>
  <TestButton variant="state" onClick={healPlayer}>
    Heal Player
  </TestButton>
</TestSection>
```

## Site 201 Configuration

**From `src/data/sites.ts`:**
```typescript
"201": {
  id: 201,
  coordinate: { x: 108, y: 127 },
  battleRoom: 1,
  difficulty: [1, 1],
  workRoom: 1,
  produceList: [],
  fixedProduceList: [
    { itemId: "1101031", num: 7 },
    { itemId: "1101041", num: 2 },
    { itemId: "1101021", num: 2 },
    { itemId: "1101061", num: 3 },
    { itemId: "1103083", num: 1 }
  ],
  unlockValue: {
    site: ["1", "202"]
  },
  def: 20
}
```

**Site 201 Details:**
- Has 1 battle room (difficulty 1)
- Has 1 work room
- Total: 2 rooms (battle + work)

## Implementation Tasks

### Task 1: Add Helper Functions for Site 201 Testing

**Location:** `src/components/test/SiteSystemTestScreen.tsx`

**Add after existing test functions (around line 500):**

1. **Heal Player Function:**
```typescript
// Heal Player (restore HP to max)
const healPlayer = () => {
  const playerStore = usePlayerStore.getState()
  const maxHp = playerStore.hpMax
  playerStore.updateAttribute('hp', maxHp)
  runTest(
    'Heal Player',
    `Healed to ${maxHp} HP`,
    () => `HP: ${playerStore.hp}/${maxHp}`
  )
}
```

2. **Add Gun Function:**
```typescript
// Add Gun (equip it)
const addGun = () => {
  const gunId = "1301011" // Basic gun item ID
  const playerStore = usePlayerStore.getState()
  // First add gun to bag (required for equipping)
  playerStore.addItemToBag(gunId, 1)
  // Then equip it
  const success = playerStore.equipItem('gun', gunId)
  if (success) {
    runTest(
      'Add Gun',
      'Equipped gun',
      () => `Current gun: ${playerStore.equipment.gun || 'None'}`
    )
  } else {
    runTest(
      'Add Gun',
      'Failed to equip gun',
      () => `Gun in bag: ${playerStore.getBagItemCount(gunId)}`
    )
  }
}
```

3. **Add Melee Weapon Function:**
```typescript
// Add Melee Weapon (equip it)
const addMeleeWeapon = () => {
  const weaponId = "1302011" // Basic melee weapon item ID
  const playerStore = usePlayerStore.getState()
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

4. **Add Gun Ammo Function:**
```typescript
// Add Gun Ammo
const addGunAmmo = () => {
  const playerStore = usePlayerStore.getState()
  playerStore.addItemToBag(BattleConfig.BULLET_ID, 50)
  runTest(
    'Add Gun Ammo',
    'Added 50 bullets',
    () => `Current bullets: ${playerStore.getBagItemCount(BattleConfig.BULLET_ID)}`
  )
}
```

5. **Add Homemade Bullets Function:**
```typescript
// Add Homemade Bullets
const addHomemadeBullets = () => {
  const playerStore = usePlayerStore.getState()
  playerStore.addItemToBag(BattleConfig.HOMEMADE_ID, 50)
  runTest(
    'Add Homemade Bullets',
    'Added 50 homemade bullets',
    () => `Current homemade: ${playerStore.getBagItemCount(BattleConfig.HOMEMADE_ID)}`
  )
}
```

6. **Add Bomb Function:**
```typescript
// Add Bomb (equip it)
const addBomb = () => {
  const bombId = "1303012" // Bomb item ID
  const playerStore = usePlayerStore.getState()
  // First add bomb to bag (required for equipping)
  playerStore.addItemToBag(bombId, 10)
  // Then equip it in tool slot
  const success = playerStore.equipItem('tool', bombId)
  if (success) {
    runTest(
      'Add Bomb',
      'Equipped bomb',
      () => `Current tool: ${playerStore.equipment.tool || 'None'}, Bombs in bag: ${playerStore.getBagItemCount(bombId)}`
    )
  } else {
    runTest(
      'Add Bomb',
      'Failed to equip bomb',
      () => `Bombs in bag: ${playerStore.getBagItemCount(bombId)}`
    )
  }
}
```

7. **Create Site 201 Function:**
```typescript
// Create Site 201 for testing
const createSite201 = () => {
  try {
    const site = new Site(201)
    site.init()
    setCurrentSite(site)
    runTest(
      'Create Site 201',
      'Site 201 created',
      () => `Site ID: ${site.id}, Rooms: ${site.rooms.length} (Battle: ${site.rooms.filter(r => r.type === 'battle').length}, Work: ${site.rooms.filter(r => r.type === 'work').length})`
    )
  } catch (error) {
    runTest(
      'Create Site 201',
      'Site 201 created',
      () => `Error: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
```

### Task 2: Add Required Imports

**Location:** `src/components/test/SiteSystemTestScreen.tsx`

**Add to imports (around line 1-23):**
```typescript
import { usePlayerStore } from '@/store/playerStore'
import { BattleConfig } from '@/game/combat/BattleConfig'
```

### Task 3: Add Test Sections to UI

**Location:** `src/components/test/SiteSystemTestScreen.tsx`

**Add new TestSections in the TestPanel (after existing sections, around line 600-700):**

```typescript
<TestSection title="Site 201 Testing">
  <TestButton variant="state" onClick={createSite201}>
    Create Site 201
  </TestButton>
</TestSection>

<TestSection title="Add Items">
  <TestButton variant="state" onClick={addGun}>
    Add Gun
  </TestButton>
  <TestButton variant="state" onClick={addMeleeWeapon}>
    Add Melee Weapon
  </TestButton>
  <TestButton variant="state" onClick={addGunAmmo}>
    Add Gun Ammo (50)
  </TestButton>
  <TestButton variant="state" onClick={addHomemadeBullets}>
    Add Homemade (50)
  </TestButton>
  <TestButton variant="state" onClick={addBomb}>
    Add Bomb (10)
  </TestButton>
</TestSection>

<TestSection title="Player Actions">
  <TestButton variant="state" onClick={healPlayer}>
    Heal Player
  </TestButton>
</TestSection>
```

## Testing Checklist

- [ ] Verify heal player button restores HP to max
- [ ] Verify add gun button adds gun to bag and equips it
- [ ] Verify add melee weapon button adds weapon to bag and equips it
- [ ] Verify add gun ammo button adds 50 bullets to bag
- [ ] Verify add homemade bullets button adds 50 homemade bullets to bag
- [ ] Verify add bomb button adds bomb to bag and equips it in tool slot
- [ ] Verify create site 201 button creates site with 2 rooms (1 battle, 1 work)
- [ ] Verify all buttons show test results in the results list
- [ ] Verify site 201 exploration works correctly after adding items and healing

## Files to Modify

1. **`src/components/test/SiteSystemTestScreen.tsx`**
   - Add imports for `usePlayerStore` and `BattleConfig`
   - Add helper functions (healPlayer, addGun, addMeleeWeapon, addGunAmmo, addHomemadeBullets, addBomb, createSite201)
   - Add new TestSections for "Site 201 Testing", "Add Items", and "Player Actions"

## Notes

- All functions should use `usePlayerStore.getState()` to get the player store instance
- All functions should use `runTest()` to log test results
- Button variants should be `"state"` for state-changing operations
- The test sections should be placed logically in the UI, after existing site testing sections
- Site 201 has 1 battle room and 1 work room, so the test should verify both room types work correctly


