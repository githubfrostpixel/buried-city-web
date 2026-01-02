# Plan: Cross-Check Weapon Slot Functionality with Original Game

## Mode: PLAN

## 1. UNDERSTANDING THE REQUIREMENTS

### Current Task
- User wants to check the **functional behavior** of weapon slot equipment (not display)
- Need to verify that equipping/unequipping weapons works correctly
- Cross-check with original game implementation

### Original Game Implementation

**From OriginalGame/src/game/equipment.js:**

**equip function (lines 13-21):**
```javascript
equip: function (pos, itemId) {
    if (itemId !== Equipment.HAND) {
        if (!player.bag.validateItem(itemId, 1)) {
            return false;
        }
    }
    this.equipPos[pos] = itemId;
    return true;
}
```

**Key behaviors:**
1. If itemId is NOT Equipment.HAND (1), validates item is in bag
2. If validation fails, returns false
3. Sets `equipPos[pos] = itemId` (stores the item ID)
4. Returns true on success

**unequip function (lines 22-27):**
```javascript
unequip: function (pos) {
    this.equipPos[pos] = 0;
    if (pos === EquipmentPos.WEAPON) {
        this.equipPos[pos] = Equipment.HAND;
    }
}
```

**Key behaviors:**
1. Sets equipment to 0 (empty)
2. For weapon slot, sets to Equipment.HAND (1) instead of 0

**From OriginalGame/src/ui/equipNode.js:**

**Equip action (line 186):**
```javascript
player.equip.equip(self.selectedPos, itemId);
```

**Dropdown item list (lines 117-119):**
```javascript
if (pos === EquipmentPos.WEAPON) {
    itemList.unshift(Equipment.HAND);
}
```

### Current Implementation Analysis

**From src/store/playerStore.ts:**

**equipItem function (lines 488-505):**
```typescript
equipItem: (slot: 'gun' | 'weapon' | 'equip' | 'tool' | 'special', itemId: string | null) => {
  const state = get()
  
  // If equipping an item, it must be in bag
  if (itemId !== null) {
    if (state.getBagItemCount(itemId) < 1) {
      return false
    }
  }
  
  set((state) => ({
    equipment: {
      ...state.equipment,
      [slot]: itemId
    }
  }))
  return true
}
```

**From src/components/common/EquipPanel.tsx:**

**handleEquipItem function (lines 115-163):**
```typescript
const handleEquipItem = (itemId: string) => {
  if (selectedSlot === null) return
  
  const slot = EQUIPMENT_SLOTS[selectedSlot]
  const itemIdToEquip = itemId === '0' ? null : (itemId === '1' ? null : itemId)
  
  // Equip item
  let success = false
  if (itemIdToEquip) {
    success = playerStore.equipItem(slot.key, itemIdToEquip)
    if (!success) {
      // Failed to equip (item not in bag)
      // Close dropdown anyway
      setSelectedSlot(null)
      setDropdownItems([])
      return
    }
  } else {
    // Unequip (for weapon, null means hand)
    if (slot.key === 'weapon') {
      success = playerStore.equipItem(slot.key, null)
    } else {
      playerStore.unequipItem(slot.key)
      success = true
    }
  }
  
  if (success) {
    // Update view to refresh icons
    forceUpdate(prev => prev + 1)
    
    // Close dropdown
    setSelectedSlot(null)
    setDropdownItems([])
    
    // Save game state
    saveAll().catch(err => {
      console.error('Failed to save game state after equipping:', err)
    })
  }
}
```

## 2. FUNCTIONALITY COMPARISON

### Key Differences to Check

#### 1. Hand/Null Handling
**Original:**
- `Equipment.HAND = 1`
- When equipping hand: `equip(pos, 1)`
- When unequipping weapon: sets to `Equipment.HAND` (1)

**Current:**
- Hand is represented as `'1'` in dropdown
- When selecting hand: `itemId === '1'` → `itemIdToEquip = null`
- When equipping hand: `equipItem('weapon', null)`
- Storage: `equipment.weapon = null` (not `'1'`)

**Potential Issue:**
- Original stores `1` for hand, current stores `null`
- Need to verify if this causes issues in other systems

#### 2. Item Validation
**Original:**
- Validates item is in bag (except for HAND)
- Uses `player.bag.validateItem(itemId, 1)`

**Current:**
- Validates item is in bag for all items (including null check)
- Uses `state.getBagItemCount(itemId) < 1`
- Should be equivalent

#### 3. Dropdown Item List
**Original:**
- Gets items by type: `player.bag.getItemsByType(itemType)` (itemType = 1302 for weapon)
- Adds HAND at beginning: `itemList.unshift(Equipment.HAND)`
- If empty, adds 0 (empty option)

**Current:**
- Gets items by type: `bag.getItemsByType(slot.itemType)` (itemType = '1302' for weapon)
- Adds '1' at beginning: `items.unshift('1')`
- If empty, adds '0' (empty option)

**Should be equivalent** - both get weapon items (1302 type) and add hand option

#### 4. Storage Format
**Original:**
- Stores as: `equipPos[pos] = itemId` (number or string, depending on itemId)
- Weapon hand: `equipPos[1] = 1` (number)
- Weapon item: `equipPos[1] = "1302011"` (string)

**Current:**
- Stores as: `equipment[slot] = itemId` (string | null)
- Weapon hand: `equipment.weapon = null`
- Weapon item: `equipment.weapon = "1302011"` (string)

**Potential Issue:**
- Hand representation differs: `1` vs `null`
- Need to verify if other systems expect `1` for hand

## 3. FUNCTIONAL TESTS TO VERIFY

### Test 1: Equip Weapon Item
**Steps:**
1. Have a weapon item (e.g., axe 1302011) in bag
2. Click weapon slot
3. Select the weapon from dropdown
4. Verify:
   - Item is equipped (stored in `equipment.weapon`)
   - Dropdown closes
   - Icon updates (display issue, but verify state)
   - Game saves

**Expected:**
- `equipment.weapon = "1302011"`
- Success = true
- Dropdown closes

### Test 2: Equip Hand
**Steps:**
1. Have a weapon equipped
2. Click weapon slot
3. Select "Hand" option (first in list)
4. Verify:
   - Hand is equipped (stored as null)
   - Dropdown closes

**Expected:**
- `equipment.weapon = null` (or should it be `"1"`?)
- Success = true
- Dropdown closes

### Test 3: Unequip Weapon
**Steps:**
1. Have a weapon equipped
2. Click weapon slot
3. Select empty option (if available) or hand
4. Verify behavior matches original

**Expected:**
- Should set to hand (null) for weapon slot

### Test 4: Item Not in Bag
**Steps:**
1. Try to equip an item that's not in bag
2. Verify:
   - Equip fails
   - Returns false
   - Dropdown closes (current behavior)

**Expected:**
- `equipItem` returns false
- Dropdown closes
- Item not equipped

### Test 5: Dropdown Item List
**Steps:**
1. Have multiple weapon items in bag
2. Click weapon slot
3. Verify:
   - Hand option appears first
   - All weapon items (1302 type) appear
   - Items are in correct order

**Expected:**
- Hand ('1') at index 0
- Weapon items (1302*) follow
- Empty option if no items

### Test 6: Item Type Filtering
**Steps:**
1. Have weapon items (1302*) in bag
2. Click weapon slot
3. Verify only weapon items appear (not guns, tools, etc.)

**Expected:**
- Only items with type 1302 appear
- Other item types filtered out

## 4. POTENTIAL ISSUES TO FIX

### Issue 1: Hand Representation Mismatch
**Problem:**
- Original stores `1` for hand
- Current stores `null` for hand
- Other systems might expect `1`

**Fix Options:**
- Option A: Store `"1"` instead of `null` for hand (match original)
- Option B: Keep `null` but ensure all systems handle it correctly
- Option C: Use `"1"` internally but convert for display

**Recommendation:** Check if other systems (battle, etc.) expect `1` for hand

### Issue 2: Empty Option Handling
**Current:**
- Empty option (`'0'`) is converted to `null`
- For weapon, `null` means hand (correct)
- For other slots, `null` means unequipped (correct)

**Should be correct** - matches original behavior

## 5. VERIFICATION CHECKLIST

- [ ] Equip weapon item works (stores item ID correctly)
- [ ] Equip hand works (stores null or "1" correctly)
- [ ] Item validation works (fails if not in bag)
- [ ] Dropdown shows correct items (weapon type only)
- [ ] Dropdown shows hand option first
- [ ] Dropdown closes after equipping
- [ ] Game saves after equipping
- [ ] View updates after equipping (forceUpdate works)
- [ ] Hand representation is consistent across systems
- [ ] Unequip works correctly for weapon slot

## 6. RESTATEMENT

**User Request:** Cross-check the functional behavior of weapon slot equipment (not display) to ensure it matches the original game.

**Key Areas to Verify:**
1. Equipping weapon items works correctly
2. Equipping hand works correctly
3. Item validation (bag check) works
4. Dropdown item list is correct (weapon type items + hand)
5. Storage format is correct (or at least compatible)
6. Hand representation (`null` vs `"1"`) doesn't break other systems

**Potential Issues:**
- Hand is stored as `null` instead of `"1"` - need to verify if this causes issues
- Otherwise, functionality appears to match original game

---

**Ready for ACT mode?** Please review this plan and type "ACT" if you'd like me to proceed with the functional verification and fixes.

