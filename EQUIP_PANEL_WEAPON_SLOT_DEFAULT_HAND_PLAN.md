# Plan: Ensure Weapon Slot Always Defaults to Hand

## Mode: PLAN

## 1. UNDERSTANDING THE REQUIREMENTS

### User Requirements
- **Default equipment for weapon slot should always be hand**
- **If nothing is equipped, it should automatically equip hand**

### Original Game Behavior

**From OriginalGame/src/game/equipment.js:**

**Constructor (lines 9-12):**
```javascript
ctor: function () {
    this.equipPos = {};
    this.equip(EquipmentPos.WEAPON, Equipment.HAND); // Defaults to hand
}
```

**unequip function (lines 22-27):**
```javascript
unequip: function (pos) {
    this.equipPos[pos] = 0;
    if (pos === EquipmentPos.WEAPON) {
        this.equipPos[pos] = Equipment.HAND; // Always sets to hand, never 0
    }
}
```

**Key behaviors:**
1. Initial state: Weapon slot is set to `Equipment.HAND` (1)
2. When unequipping weapon: Always sets to `Equipment.HAND` (1), never 0 or null
3. Weapon slot never has value 0 - it's always either a weapon item or hand (1)

### Current Implementation Issues

**From src/store/playerStore.ts:**

**Initial state (line 182):**
```typescript
weapon: null, // Default to hand (null means hand)
```

**unequipItem function (lines 507-518):**
```typescript
unequipItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special') => {
  set((state) => {
    const newEquipment = { ...state.equipment }
    if (slot === 'weapon') {
      // Weapon defaults to hand (null)
      newEquipment[slot] = null  // ❌ Should be "1" not null
    } else {
      newEquipment[slot] = null
    }
    return { equipment: newEquipment }
  })
}
```

**getEquippedItem function (lines 520-522):**
```typescript
getEquippedItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special') => {
  return get().equipment[slot]  // Returns null for weapon, should return "1"
}
```

**Issues identified:**
1. Initial state stores `null` instead of `"1"` for weapon
2. `unequipItem` sets weapon to `null` instead of `"1"`
3. `getEquippedItem` returns `null` for weapon when it should return `"1"` (hand)
4. Need to ensure weapon slot is never `null` - always `"1"` (hand) or a weapon item ID

## 2. SOLUTION FORMULATION

### Approach: Always Store "1" for Hand

**Strategy:**
- Change initial state: `weapon: "1"` instead of `weapon: null`
- Change `unequipItem`: Set weapon to `"1"` instead of `null`
- Update `getEquippedItem`: Return `"1"` if weapon is `null` (backward compatibility)
- Update `equipItem`: Ensure it can handle equipping hand (`"1"`)
- Update `handleEquipItem`: When selecting hand, equip `"1"` not `null`

### Step-by-Step Changes

#### Step 1: Fix Initial State
**File:** `src/store/playerStore.ts`
**Change:** Line 182
```typescript
// Before:
weapon: null, // Default to hand (null means hand)

// After:
weapon: "1", // Default to hand (always hand, never null)
```

#### Step 2: Fix unequipItem Function
**File:** `src/store/playerStore.ts`
**Change:** Lines 510-512
```typescript
// Before:
if (slot === 'weapon') {
  // Weapon defaults to hand (null)
  newEquipment[slot] = null

// After:
if (slot === 'weapon') {
  // Weapon always defaults to hand
  newEquipment[slot] = "1"
```

#### Step 3: Fix getEquippedItem Function (Backward Compatibility)
**File:** `src/store/playerStore.ts`
**Change:** Lines 520-522
```typescript
// Before:
getEquippedItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special') => {
  return get().equipment[slot]
}

// After:
getEquippedItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special') => {
  const item = get().equipment[slot]
  // For weapon slot, null means hand (backward compatibility)
  if (slot === 'weapon' && item === null) {
    return "1"
  }
  return item
}
```

#### Step 4: Fix handleEquipItem to Equip Hand as "1"
**File:** `src/components/common/EquipPanel.tsx`
**Change:** Line 119
```typescript
// Before:
const itemIdToEquip = itemId === '0' ? null : (itemId === '1' ? null : itemId)

// After:
const itemIdToEquip = itemId === '0' ? null : (itemId === '1' ? "1" : itemId)
```

**Also update the unequip logic (lines 133-139):**
```typescript
// Before:
} else {
  // Unequip (for weapon, null means hand)
  if (slot.key === 'weapon') {
    success = playerStore.equipItem(slot.key, null)
  } else {
    playerStore.unequipItem(slot.key)
    success = true
  }
}

// After:
} else {
  // Unequip (for weapon, set to hand)
  if (slot.key === 'weapon') {
    success = playerStore.equipItem(slot.key, "1")  // Equip hand instead of null
  } else {
    playerStore.unequipItem(slot.key)
    success = true
  }
}
```

#### Step 5: Update getEquippedIcon Logic
**File:** `src/components/common/EquipPanel.tsx`
**Change:** Lines 167-176
```typescript
// Before:
const getEquippedIcon = (slotKey: typeof EQUIPMENT_SLOTS[number]['key']): string | null => {
  const equipped = playerStore.getEquippedItem(slotKey)
  if (!equipped) {
    return null // Empty slot - will show default icon
  }
  
  // Hand icon for weapon slot
  if (equipped === '1' || (slotKey === 'weapon' && !equipped)) {
    return 'icon_tab_hand.png'
  }

// After:
const getEquippedIcon = (slotKey: typeof EQUIPMENT_SLOTS[number]['key']): string | null => {
  const equipped = playerStore.getEquippedItem(slotKey)
  
  // For weapon slot, null or undefined should be treated as hand (backward compatibility)
  if (slotKey === 'weapon' && !equipped) {
    return 'icon_tab_hand.png'
  }
  
  if (!equipped) {
    return null // Empty slot - will show default icon
  }
  
  // Hand icon
  if (equipped === '1') {
    return 'icon_tab_hand.png'
  }
```

## 3. SOLUTION VALIDATION

### Alignment with Original Game
- ✅ Initial state: Weapon slot defaults to hand (`"1"`)
- ✅ Unequip: Weapon slot always sets to hand (`"1"`), never null
- ✅ Storage: Weapon slot is never null, always `"1"` or weapon item ID
- ✅ Backward compatibility: Handles existing saves with `null` values

### Edge Cases Considered
1. **Existing saves with null:** `getEquippedItem` converts null to "1" for backward compatibility
2. **Equipping hand:** Explicitly sets to "1" instead of null
3. **Unequipping weapon:** Sets to "1" instead of null
4. **Display logic:** Handles both "1" and null (for backward compatibility)

### Testing Considerations
- Verify initial state has weapon = "1"
- Verify equipping hand sets to "1"
- Verify unequipping weapon sets to "1"
- Verify existing saves with null still work (backward compatibility)
- Verify weapon items can still be equipped normally
- Verify display shows hand icon when weapon = "1"

## 4. RESTATEMENT

**User Requirements:**
- Default equipment for weapon slot should always be hand
- If nothing is equipped, it should automatically equip hand

**Solution:**
1. Change initial state: `weapon: "1"` instead of `weapon: null`
2. Change `unequipItem`: Set weapon to `"1"` instead of `null`
3. Update `getEquippedItem`: Return `"1"` if weapon is `null` (backward compatibility)
4. Update `handleEquipItem`: Equip `"1"` when selecting hand, not `null`
5. Ensure weapon slot is never `null` - always `"1"` (hand) or a weapon item ID

This matches the original game behavior where weapon slot always has a value (either hand or a weapon item), never null/empty.

---

**Ready for ACT mode?** Please review this plan and type "ACT" if you'd like me to proceed with the implementation.

