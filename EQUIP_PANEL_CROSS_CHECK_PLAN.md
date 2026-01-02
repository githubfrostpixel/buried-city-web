# EquipPanel Cross-Check Plan

## Overview
Compare the current `EquipPanel` implementation with the original game's `EquipNode` to ensure 1:1 functionality and visual accuracy.

## Original Game Implementation Analysis

### From `OriginalGame/src/ui/equipNode.js`:

1. **Positioning in GateNode**:
   - Anchor: `(0.5, 1)` (top-center)
   - Position: `(bgRect.width / 2, contentTopLineHeight)` 
   - This places it at the top of the content area, anchored at the top

2. **Size**:
   - Content size: `572 x 100` pixels

3. **Slot Layout**:
   - 5 slots (Gun, Weapon, Equip, Tool, Special)
   - Padding calculation: `(width - 5 * slotWidth) / (5 + 1)`
   - Slot position: `padding * (i + 1) + slotWidth * (i + 0.5)`
   - Slot Y position: `height / 2` (centered vertically)

4. **Icon Naming Conventions**:
   - **Empty slots**:
     - Gun: `#icon_tab_gun.png`
     - Weapon: `#icon_tab_weapon.png`
     - Equip: `#icon_tab_equip.png`
     - Tool: `#icon_tab_tool.png`
     - Special: `#build_action_fix.png`
   - **Equipped items**:
     - Hand (weapon): `#icon_tab_hand.png`
     - Special items (1305053, 1305064, 1305075): `#icon_item_${itemId}.png`
     - Other items: `#icon_tab_${itemId}.png`
   - **Dropdown icons**:
     - Hand: `#icon_tab_content_hand.png` (scale 0.8)
     - Special items: `#icon_item_${itemId}.png` (scale 1.0)
     - Other items: `#icon_tab_content_${itemId}.png` (scale 0.8)

5. **Selected Indicator**:
   - Sprite: `frame_tab_head.png`
   - Anchor: `(0.5, 1)` (top-center)
   - Position: `(slotX, height / 2 + slotHeight / 2)` (below the slot)
   - Visible when slot is selected

6. **Dropdown View**:
   - Background: Scale9Sprite `frame_tab_content.png` with rect `(14, 14, 1, 1)`
   - Size: `565 x (72 * itemCount + 2 * vPadding)` where `vPadding = 10`
   - Anchor: `(0.5, 1)` (top-center)
   - Position: `(width / 2, 5)` (5px from bottom of EquipNode)
   - Each item line: `520 x 72` pixels
   - Separator lines: `frame_tab_line.png` between items (except first)

7. **Dropdown Item Display**:
   - **Icon**: Left side, anchor `(0, 0.5)`, position `(0, height / 2)`
   - **Name**: Position `(icon.x + icon.width * scale, height - 5)`, anchor `(0, 1)`
   - **Weight**: Position `(name.x, name.y - name.height - 5)`, anchor `(0, 1)`, format: "Weight: {weight}"
   - **Count**: Position `(width - 10, name.y - 5)`, anchor `(1, 1)`, format: "Count: {count}"
   - **Attack Cooldown** (if weapon): Position `(width - 10, name.y - name.height - 5)`, anchor `(1, 1)`, format: "CD: {atkCD}"
   - **Empty state**: Centered text, different for special slot vs others

8. **Item Selection Logic**:
   - Uses `player.tmpBag` if available, otherwise `player.bag`
   - Special slot: Only checks for items 1305053, 1305064, 1305075
   - Weapon slot: Adds `Equipment.HAND` (value 1) at the beginning
   - Empty list: Adds item `0` (empty option)

9. **Event Listeners**:
   - `equiped_item_decrease_in_bag`: Updates tab view
   - `equip_item_need_guide`: Updates icon warn for specific position

## Current Implementation Analysis

### From `src/components/common/EquipPanel.tsx`:

1. **Positioning**:
   - Positioned in `GatePanelContent` at `equipPanelTop` (calculated from `contentTopLineHeight`)
   - Uses `left: 50%`, `top: ${equipPanelTop}px`, `transform: translateX(-50%)`
   - Size: `572 x 125` (height differs from original 100)

2. **Slot Layout**:
   - 5 slots with same order
   - Padding calculation: `(PANEL_WIDTH - 5 * SLOT_SIZE) / 6` ✓
   - Slot position: `PADDING * (index + 1) + SLOT_SIZE * (index + 0.5)` ✓
   - Slot Y: `PANEL_HEIGHT / 2 - SLOT_SIZE / 2` (centered) ✓

3. **Icon Naming**:
   - Uses `icon_item_${itemId}.png` for all items ✗ (should use different naming for tabs vs dropdown)
   - Missing empty slot icons ✗
   - Missing hand icon for weapon slot ✗

4. **Selected Indicator**:
   - Uses `frame_tab_head.png` ✓
   - Position: `top: ${PANEL_HEIGHT / 2 + SLOT_SIZE / 2}px` (below slot) ✓
   - But positioned incorrectly - should be at top of slot, not bottom ✗

5. **Dropdown View**:
   - Uses simple div with gray background ✗ (should use `frame_tab_content.png` Scale9Sprite)
   - Size: `565px x max 300px` ✗ (should be dynamic based on item count)
   - Position: `top: ${PANEL_HEIGHT + 10}px` ✗ (should be 5px from bottom)
   - Missing separator lines ✗
   - Missing proper item details (weight, count, attack cooldown) ✗

6. **Dropdown Item Display**:
   - Only shows icon and simple text ✗
   - Missing: item name, weight, count, attack cooldown
   - Missing proper positioning and layout

7. **Item Selection Logic**:
   - Uses `playerStore.bag` directly ✓
   - Special slot logic: ✓
   - Weapon slot: Adds HAND option ✓
   - Empty list: Adds empty option ✓

## Issues to Fix

### 1. **Panel Height**
- **Current**: `125px`
- **Original**: `100px`
- **Fix**: Change `PANEL_HEIGHT` to `100`

### 2. **Icon Naming and Display**
- **Issue**: Using wrong icon naming conventions
- **Fix**: 
  - Empty slots: Use `icon_tab_gun.png`, `icon_tab_weapon.png`, etc.
  - Equipped items: Use `icon_tab_${itemId}.png` or `icon_item_${itemId}.png` for special items
  - Hand icon: Use `icon_tab_hand.png` for equipped, `icon_tab_content_hand.png` for dropdown

### 3. **Selected Indicator Position**
- **Issue**: Currently positioned below slot, should be at top
- **Fix**: Position at `top: ${PANEL_HEIGHT / 2 - SLOT_SIZE / 2 - 20}px` (above slot)

### 4. **Dropdown Background**
- **Issue**: Using simple gray background
- **Fix**: Use `frame_tab_content.png` as Scale9Sprite background

### 5. **Dropdown Size and Position**
- **Issue**: Fixed max height, wrong position
- **Fix**: 
  - Dynamic height: `72 * itemCount + 20` (10px padding top and bottom)
  - Position: `top: ${PANEL_HEIGHT - 5}px` (5px from bottom, anchored at top)

### 6. **Dropdown Item Layout**
- **Issue**: Missing item details and proper layout
- **Fix**: 
  - Add item name (from string config)
  - Add weight display: "Weight: {weight}"
  - Add count display: "Count: {count}" (right-aligned)
  - Add attack cooldown for weapons: "CD: {atkCD}" (right-aligned)
  - Use proper font sizes (COMMON_2 for name, COMMON_3 for details)

### 7. **Separator Lines**
- **Issue**: Missing separator lines between dropdown items
- **Fix**: Add `frame_tab_line.png` between items (except first)

### 8. **Empty State Text**
- **Issue**: Simple "Empty" text
- **Fix**: 
  - Special slot: Show "1305053 / 1305064 / 1305075" (item names)
  - Other slots: Show "Empty" (from string 1024)

### 9. **Icon Scales**
- **Issue**: All icons same size
- **Fix**: 
  - Hand icon: scale 0.8
  - Special items (1305053, 1305064, 1305075): scale 1.0
  - Other items: scale 0.8

### 10. **Event Listeners**
- **Issue**: Missing event listeners for equipment updates
- **Fix**: 
  - Listen to `equiped_item_decrease_in_bag` to update view
  - Listen to `equip_item_need_guide` for tutorial integration

## Implementation Steps

### Step 1: Fix Panel Dimensions
- Change `PANEL_HEIGHT` from `125` to `100`
- Update all calculations that use `PANEL_HEIGHT`

### Step 2: Fix Icon Naming and Display
- Create helper function to get correct icon name based on slot state
- Add empty slot icons
- Fix hand icon display
- Use correct icon naming for tabs vs dropdown

### Step 3: Fix Selected Indicator
- Reposition to top of slot (above, not below)
- Ensure proper anchor point

### Step 4: Implement Proper Dropdown Background
- Use `frame_tab_content.png` as Scale9Sprite
- Calculate dynamic height based on item count
- Position correctly (5px from bottom)

### Step 5: Implement Dropdown Item Layout
- Add item name display
- Add weight display
- Add count display (right-aligned)
- Add attack cooldown for weapons (right-aligned)
- Use proper font sizes and positioning

### Step 6: Add Separator Lines
- Add `frame_tab_line.png` between items
- Position correctly

### Step 7: Fix Empty State
- Show proper text for special slot
- Show "Empty" for other slots

### Step 8: Add Event Listeners
- Listen to `equiped_item_decrease_in_bag`
- Listen to `equip_item_need_guide`
- Update view when events fire

### Step 9: Verify Positioning
- Cross-check with `COCOS_TO_CSS_POSITION_MAPPING.md`
- Ensure EquipPanel is positioned correctly relative to content area
- Verify anchor point conversion (0.5, 1) = top-center

## Testing Checklist

- [ ] Panel height matches original (100px)
- [ ] Empty slots show correct icons
- [ ] Equipped items show correct icons
- [ ] Hand icon displays correctly for weapon slot
- [ ] Selected indicator appears above slot (not below)
- [ ] Dropdown uses correct background sprite
- [ ] Dropdown shows correct item details (name, weight, count, CD)
- [ ] Separator lines appear between items
- [ ] Empty state shows correct text
- [ ] Icon scales are correct (0.8 for most, 1.0 for special)
- [ ] Event listeners update view correctly
- [ ] Positioning matches original game

## Files to Modify

1. `src/components/common/EquipPanel.tsx` - Main component
2. `src/components/panels/GatePanelContent.tsx` - May need positioning adjustments
3. Potentially add utility functions for icon name resolution

## Dependencies Needed

- String config access for item names
- Item config access for weight and effects
- Scale9Sprite component (may need to create or use existing)
- Font size constants (COMMON_2, COMMON_3)


