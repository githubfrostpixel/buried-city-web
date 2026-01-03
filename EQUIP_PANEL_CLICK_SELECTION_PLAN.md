# EquipPanel Clicking and Selection Functionality Plan

## Overview
Review and fix the clicking and selection functionality in `EquipPanel` to match the original game's behavior exactly.

## Original Game Behavior Analysis

### From `OriginalGame/src/ui/equipNode.js`:

#### 1. Slot Click Handling (`onTabClick`):
```javascript
onTabClick: function (sender) {
    if (this.selectedPos !== sender.idx) {
        // Clicking a different slot
        var lastSelectedTab = this.getChildByName("tab_" + this.selectedPos);
        if (lastSelectedTab) {
            if (lastSelectedTab.open) {
                this.closeDropDownView();
                this.selectedCap.setVisible(false);
            }
        }
        
        // Tutorial handling
        if (userGuide.isStep(userGuide.stepName.GATE_EQUIP_1)) {
            userGuide.step();
            uiUtil.removeIconWarn(this);
        }
        
        this.selectedPos = sender.idx;
        this.openDropDownView(this.selectedPos);
        this.removeIconWarn(this.selectedPos);
        
    } else {
        // Clicking the same slot
        var selectedTab = this.getChildByName("tab_" + this.selectedPos);
        if (selectedTab.open) {
            this.closeDropDownView();
        } else {
            this.openDropDownView(this.selectedPos);
        }
    }
}
```

**Key Behaviors:**
- If clicking a **different slot**: Close previous dropdown, hide indicator, then open new dropdown
- If clicking the **same slot**: Toggle dropdown (close if open, open if closed)
- Update selected indicator position when switching slots
- Handle tutorial steps

#### 2. Item Selection Handling (`createOneLineView` button click):
```javascript
var btn = uiUtil.createSpriteBtn({
    normal: "tab_content_btn_normal.png",
    pressed: "tab_content_btn_pressed.png"
}, this, function () {
    player.equip.equip(self.selectedPos, itemId);
    self.closeDropDownView();
    self.updateTabView();
    Record.saveAll();
    
    // Tutorial handling
    if (userGuide.isStep(userGuide.stepName.GATE_EQUIP_2) && userGuide.isItemCreate(itemId)) {
        userGuide.step();
        utils.emitter.emit("nextStep");
    }
    
    if (userGuide.equipNeedGuide2(itemId)) {
        userGuide.guide2Step(itemId);
    }
}, cc.rect(1, 1, 1, 1));
```

**Key Behaviors:**
- Equip the item using `player.equip.equip(pos, itemId)`
- Close dropdown immediately
- Update tab view (refresh all slot icons)
- Save game state (`Record.saveAll()`)
- Handle tutorial steps

#### 3. Tab View Update (`updateTabView`):
- Called after equipping to refresh all slot icons
- Updates icons based on current equipment state
- Handles empty slots, equipped items, and hand icon

## Current Implementation Analysis

### From `src/components/common/EquipPanel.tsx`:

#### 1. Slot Click Handling (`handleSlotClick`):
```typescript
const handleSlotClick = (slotIndex: number) => {
    const slot = EQUIPMENT_SLOTS[slotIndex]
    
    if (selectedSlot === slotIndex) {
        // Close dropdown if clicking same slot
        setSelectedSlot(null)
        return
    }
    
    // Get available items...
    setDropdownItems(items)
    setSelectedSlot(slotIndex)
}
```

**Issues:**
- ✅ Correctly toggles dropdown when clicking same slot
- ❌ **Missing**: Does not close previous dropdown when switching to different slot
- ❌ **Missing**: Does not update selected indicator position when switching slots
- ❌ **Missing**: Tutorial integration

#### 2. Item Selection Handling (`handleEquipItem`):
```typescript
const handleEquipItem = (itemId: string) => {
    if (selectedSlot === null) return
    
    const slot = EQUIPMENT_SLOTS[selectedSlot]
    const itemIdToEquip = itemId === '0' ? null : (itemId === '1' ? null : itemId)
    
    // Equip item
    if (itemIdToEquip) {
        playerStore.equipItem(slot.key, itemIdToEquip)
    } else {
        // Unequip...
    }
    
    // Close dropdown
    setSelectedSlot(null)
}
```

**Issues:**
- ✅ Correctly equips/unequips items
- ✅ Closes dropdown
- ❌ **Missing**: Does not explicitly update tab view (icons might not refresh)
- ❌ **Missing**: Does not save game state
- ❌ **Missing**: Tutorial integration

#### 3. View Updates:
- Uses `forceUpdate` state to trigger re-renders
- Listens to `equiped_item_decrease_in_bag` event
- Icons are recalculated on each render via `getEquippedIcon()`

**Issues:**
- Icons should update automatically via React state, but might need explicit refresh
- Need to ensure icons update immediately after equipping

## Issues to Fix

### 1. **Slot Click - Close Previous Dropdown**
**Problem**: When clicking a different slot, the previous dropdown stays open
**Fix**: Close previous dropdown before opening new one

### 2. **Slot Click - Update Selected Indicator Position**
**Problem**: Selected indicator position might not update correctly when switching slots
**Fix**: Ensure indicator moves to new slot position

### 3. **Item Selection - Update Tab View**
**Problem**: Icons might not refresh immediately after equipping
**Fix**: Explicitly trigger view update after equipping

### 4. **Item Selection - Save Game State**
**Problem**: Game state is not saved after equipping
**Fix**: Call `saveAll()` after equipping (if save system is available)

### 5. **Tutorial Integration**
**Problem**: Tutorial steps are not handled
**Fix**: Add tutorial integration (stub for now, implement when tutorial system is ready)

### 6. **Equipment Validation**
**Problem**: Need to verify equipment validation works correctly
**Fix**: Ensure `equipItem` validates item exists in bag

## Implementation Steps

### Step 1: Fix Slot Click - Close Previous Dropdown
**File**: `src/components/common/EquipPanel.tsx`
**Change**: Update `handleSlotClick` to close previous dropdown when switching slots

```typescript
const handleSlotClick = (slotIndex: number) => {
    const slot = EQUIPMENT_SLOTS[slotIndex]
    
    if (selectedSlot === slotIndex) {
        // Toggle: close if open, open if closed
        if (selectedSlot !== null) {
            setSelectedSlot(null)
            return
        }
    } else {
        // Switching to different slot: close previous dropdown first
        if (selectedSlot !== null) {
            // Previous dropdown will close when selectedSlot changes
        }
    }
    
    // Get available items for this slot
    // ... existing code ...
    
    setDropdownItems(items)
    setSelectedSlot(slotIndex)
}
```

### Step 2: Ensure Selected Indicator Updates
**File**: `src/components/common/EquipPanel.tsx`
**Change**: Verify selected indicator position updates correctly (should work automatically with React state)

### Step 3: Fix Item Selection - Update View
**File**: `src/components/common/EquipPanel.tsx`
**Change**: Add explicit view update after equipping

```typescript
const handleEquipItem = (itemId: string) => {
    if (selectedSlot === null) return
    
    const slot = EQUIPMENT_SLOTS[selectedSlot]
    const itemIdToEquip = itemId === '0' ? null : (itemId === '1' ? null : itemId)
    
    // Equip item
    if (itemIdToEquip) {
        const success = playerStore.equipItem(slot.key, itemIdToEquip)
        if (!success) {
            // Failed to equip (item not in bag)
            return
        }
    } else {
        // Unequip...
    }
    
    // Update view to refresh icons
    forceUpdate(prev => prev + 1)
    
    // Close dropdown
    setSelectedSlot(null)
    
    // TODO: Save game state when save system is ready
    // saveAll()
    
    // TODO: Tutorial integration
    // if (userGuide.isStep(userGuide.stepName.GATE_EQUIP_2) && userGuide.isItemCreate(itemId)) {
    //   userGuide.step()
    //   emitter.emit('nextStep')
    // }
}
```

### Step 4: Add Save System Integration
**File**: `src/components/common/EquipPanel.tsx`
**Change**: Import and call `saveAll()` after equipping

```typescript
import { saveAll } from '@/game/systems/SaveSystem'

// In handleEquipItem, after equipping:
saveAll().catch(err => {
    console.error('Failed to save game state:', err)
})
```

### Step 5: Add Tutorial Integration Stubs
**File**: `src/components/common/EquipPanel.tsx`
**Change**: Add TODO comments and stubs for tutorial integration

### Step 6: Verify Equipment Validation
**File**: `src/components/common/EquipPanel.tsx`
**Change**: Ensure `equipItem` returns success/failure and handle failures

## Testing Checklist

- [ ] Clicking same slot toggles dropdown (open/close)
- [ ] Clicking different slot closes previous dropdown and opens new one
- [ ] Selected indicator moves to correct slot when switching
- [ ] Equipping item updates slot icon immediately
- [ ] Unequipping item shows empty slot icon immediately
- [ ] Equipping weapon shows hand icon when selecting "Hand"
- [ ] Equipping invalid item (not in bag) fails gracefully
- [ ] Game state is saved after equipping
- [ ] Dropdown closes after selecting item
- [ ] View updates correctly when equipment changes via events

## Files to Modify

1. `src/components/common/EquipPanel.tsx` - Main component
2. Potentially `src/game/systems/SaveSystem.ts` - If save integration needed

## Dependencies

- `@/game/systems/SaveSystem` - For saving game state
- `@/utils/emitter` - Already imported, for tutorial events
- Tutorial system (when available)

## Notes

1. **React State Updates**: React should automatically update the view when `playerStore.equipment` changes, but we might need to force an update to ensure icons refresh immediately.

2. **Save System**: The save system exists (`SaveSystem.ts`), but we should verify it's safe to call `saveAll()` synchronously or if it needs to be async.

3. **Tutorial Integration**: Tutorial system is not yet implemented, so we'll add stubs with TODO comments.

4. **Equipment Validation**: The `equipItem` method in `playerStore` already validates that items exist in bag, so we just need to handle the return value.



