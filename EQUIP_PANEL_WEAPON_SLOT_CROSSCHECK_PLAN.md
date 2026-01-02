# Plan: Cross-Check Weapon Slot Equipment Display with Original Game

## Mode: PLAN

## 1. UNDERSTANDING THE REQUIREMENTS

### Current Issue
- User has an axe equipped in the weapon slot
- The axe should appear but may not be displaying correctly
- Need to cross-check with original game implementation

### Current Implementation Analysis

**EquipPanel.tsx - getEquippedIcon function (lines 167-185):**
```typescript
const getEquippedIcon = (slotKey: typeof EQUIPMENT_SLOTS[number]['key']): string | null => {
  const equipped = playerStore.getEquippedItem(slotKey)
  if (!equipped) {
    return null // Empty slot - will show default icon
  }
  
  // Hand icon for weapon slot
  if (equipped === '1' || (slotKey === 'weapon' && !equipped)) {
    return 'icon_tab_hand.png'
  }
  
  // Special items use icon_item_ prefix
  if (equipped === '1305053' || equipped === '1305064' || equipped === '1305075') {
    return `icon_item_${equipped}.png`
  }
  
  // Other items use icon_tab_ prefix
  return `icon_tab_${equipped}.png`
}
```

**Icon rendering (lines 253-257):**
```typescript
<Sprite
  atlas="icon"
  frame={equippedIcon}
  className="w-full h-full"
/>
```

### Original Game Implementation

**From OriginalGame/src/ui/equipNode.js (lines 284-298):**
```javascript
var itemId = player.equip.getEquip(equipPos)
if (itemId) {
    if (itemId === Equipment.HAND) {
        iconName = "#icon_tab_hand.png";
    } else {
        if (itemId == "1305053") {
            iconName = "#icon_item_1305053.png";
        } else if (itemId == "1305064") {
            iconName = "#icon_item_1305064.png";
        } else if (itemId == "1305075") {
            iconName = "#icon_item_1305075.png";
        } else {
            iconName = "#icon_tab_" + itemId + ".png";
        }
    }
} else {
    // Show empty slot icon
}
```

**Icon file locations:**
- From `OriginalGame/res/gate.plist`: `icon_tab_1302011.png`, `icon_tab_1302021.png`, `icon_tab_1302032.png`, `icon_tab_1302043.png` are in the `gate` atlas
- From file structure: `src/assets/sprites/gate/icon_tab_1302*.png` exist

### Potential Issues Identified

1. **Atlas Mismatch:**
   - Current code uses `atlas="icon"` for equipped icons
   - Original game uses `gate` atlas for `icon_tab_*` files
   - Weapon icons (`icon_tab_1302*.png`) are in `gate` atlas, not `icon` atlas

2. **Logic Check:**
   - Current logic seems correct: `icon_tab_${equipped}.png` for weapon items
   - But if atlas is wrong, icons won't display

3. **Hand Icon Handling:**
   - Original: `itemId === Equipment.HAND` (which is `1`)
   - Current: `equipped === '1'` - correct
   - Also checks `slotKey === 'weapon' && !equipped` - this might be redundant but should work

## 2. SOLUTION FORMULATION

### Step-by-Step Investigation

#### Step 1: Verify Atlas Usage
**Check:**
- Where are `icon_tab_*` files located in our asset structure?
- What atlas should be used for equipment slot icons?
- Check dropdown item icons - they use `atlas="icon"` - is this correct?

**From file structure:**
- `src/assets/sprites/gate/icon_tab_1302011.png` - in `gate` folder
- `src/assets/sprites/icon/` - has 156 files, need to check if weapon icons are here too

**Hypothesis:**
- Equipment slot icons should use `atlas="gate"` (matches original game)
- Dropdown item icons might use `atlas="icon"` (different context)

#### Step 2: Check Icon Naming
**Verify:**
- Weapon item IDs: `1302011`, `1302021`, `1302032`, `1302043`
- Icon names should be: `icon_tab_1302011.png`, etc.
- These match the pattern in original game

#### Step 3: Check Equipment Storage
**Verify:**
- `playerStore.getEquippedItem('weapon')` returns correct item ID
- Item ID format is string (e.g., `'1302011'`) not number
- Null/undefined handling is correct

### Implementation Fixes

**Fix 1: Correct Atlas for Equipment Slot Icons**
- Change `atlas="icon"` to `atlas="gate"` for equipped item icons in slots
- Keep `atlas="icon"` for dropdown items if that's where those icons are

**Fix 2: Verify Logic Flow**
- Ensure weapon items (1302*) are handled correctly
- Ensure hand icon (1) is handled correctly
- Ensure empty weapon slot shows default icon

### Code Changes Preview

**Before (line 254):**
```typescript
<Sprite
  atlas="icon"
  frame={equippedIcon}
  className="w-full h-full"
/>
```

**After:**
```typescript
<Sprite
  atlas="gate"
  frame={equippedIcon}
  className="w-full h-full"
/>
```

**Also check empty slot icon (line 270):**
```typescript
<Sprite
  atlas="gate"
  frame={getEmptySlotIcon(slot.key)}
  className="w-full h-full"
/>
```

This already uses `atlas="gate"` which is correct.

## 3. SOLUTION VALIDATION

### Alignment with Original Game
- ✅ Icon naming matches: `icon_tab_${itemId}.png`
- ✅ Atlas should be `gate` (matches original game plist)
- ✅ Logic flow matches original game

### Edge Cases Considered
1. **Hand icon:** `equipped === '1'` - should work correctly
2. **Weapon items:** `icon_tab_1302*.png` - should work if atlas is correct
3. **Empty slot:** Shows default icon - already using correct atlas
4. **Special items:** `icon_item_*` - need to verify which atlas these use

### Testing Considerations
- Equip a weapon (e.g., axe 1302011) and verify icon appears
- Equip hand (1) and verify hand icon appears
- Unequip weapon and verify default weapon icon appears
- Check all weapon types (1302011, 1302021, 1302032, 1302043)
- Verify icon displays in correct position and size

## 4. RESTATEMENT

**User Request:** Cross-check weapon slot equipment display - user has an axe equipped that should appear, need to verify it matches original game behavior.

**Issues Found:**
1. Equipment slot icons use `atlas="icon"` but weapon icons are in `gate` atlas
2. Should use `atlas="gate"` for `icon_tab_*` files to match original game

**Solution:**
1. Change equipped item icon atlas from `"icon"` to `"gate"` in the slot rendering
2. Verify the logic correctly handles weapon items (1302*)
3. Test with actual weapon items to ensure they display correctly

This should fix the issue where weapon icons don't appear when equipped.

---

**Ready for ACT mode?** Please review this plan and type "ACT" if you'd like me to proceed with the implementation and verification.

