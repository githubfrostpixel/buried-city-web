# Item Dialog UI Crosscheck Plan

## Overview

This plan outlines how to verify and crosscheck the ItemDialog UI appearance and functionality, comparing the current implementation with the original game behavior.

## Original Game Behavior

### Dialog Structure (from `OriginalGame/src/ui/dialog.js` and `OriginalGame/src/ui/uiUtil.js`)

When clicking an item, `showItemDialog(itemId, showOnly, source)` creates a `DialogBig` dialog with the following structure:

#### 1. Dialog Container
- **Type**: `DialogBig` (extends `DialogCommon`)
- **Background**: `dialog_big_bg.png`
- **Position**: Centered on screen
  - Original: `(winSize.width - contentSize.width) / 2, 29 + (839 - contentSize.height) / 2`
  - Screen size: 640x1136
- **Overlay**: Semi-transparent black background (opacity 200, color (0, 0, 0, 155))
- **Auto-dismiss**: `true` (can close by clicking outside)

#### 2. Title Section (`titleNode`)
- **Height**: 90px
- **Position**: Top of dialog (height - 90px from bottom)
- **Components**:
  - **Icon**: `icon_item_{itemId}.png`
    - Position: `leftEdge` (20px), `height / 2 - 4` (vertically centered with -4px offset)
    - Anchor: (0, 0.5) - left edge, vertically centered
    - No scale specified (uses sprite's natural size)
  - **Title**: Item name from `stringUtil.getString(itemId).title`
    - Position: `leftEdge + icon.width * icon.scale` (next to icon)
    - Y: `height / 2` (vertically centered)
    - Font: `uiUtil.fontFamily.normal`, `uiUtil.fontSize.COMMON_1` (32px)
    - Color: Black
    - Max width: 360px (for text wrapping)
    - Anchor: (0, 0.5) - left edge, vertically centered
  - **txt_1**: Item count display
    - Format: `cc.formatStr(config.title.txt_1, storage.getNumByItemId(itemId))`
    - Example: "Count: 5" (from string config "Count: %d")
    - Position: `title.x`, `title.y - title.height / 2 + 2` (below title, 2px offset)
    - Font: `uiUtil.fontSize.COMMON_3` (20px)
    - Color: Black
    - Anchor: (0, 1) - left edge, top-aligned

#### 3. Content Section (`contentNode`)
- **Position**: Below title, above action buttons
- **Height**: `dialogHeight - 90px (title) - 72px (action)`
- **Components**:
  - **dig_des**: Large item image (`dig_item_{itemId}.png`)
    - Position: `width / 2` (center horizontally), `height - 5` (top of content, 5px from top)
    - Anchor: (0.5, 1) - center horizontally, top-aligned
    - No scale specified (uses sprite's natural size)
  
  - **des**: Item description text
    - Source: `stringUtil.getString(itemId).des` (with special messages appended)
    - Position: `leftEdge` (20px), calculated Y based on dig_des:
      - If dig_des exists: `contentHeight - digDes.height * digDes.scale`
      - If no dig_des: `contentHeight - 20`
    - Width: `rightEdge - leftEdge` (dialog width - 40px)
    - Font: `uiUtil.fontSize.COMMON_3` (20px)
    - Color: Black
    - Anchor: (0, 1) - left edge, top-aligned
  
  - **Special Messages** (appended to description):
    - **Equip needed**: For items [1305053, 1305075, 1305064]
      - Message: `stringUtil.getString("equip_needed")`
      - Appended as: `strConfig.des += "\n" + stringUtil.getString("equip_needed")`
    - **No equip needed**: For items [1305034, 1305024, 1305023, 1306001]
      - Message: `stringUtil.getString("no_need_equip")`
      - Appended as: `strConfig.des += "\n" + stringUtil.getString("no_need_equip")`
  
  - **Buff Warning** (for buff items only):
    - Visible when: `item.isType(ItemType.TOOL, ItemType.BUFF)`
    - Position: `leftEdge`, `des.y - des.height - 20` (20px below description)
    - Font: `uiUtil.fontSize.COMMON_3` (20px)
    - Color: `cc.color.RED`
    - Text: `stringUtil.getString(1299)`
    - Anchor: (0, 1) - left edge, top-aligned

#### 4. Action Section (`actionNode`)
- **Height**: 72px
- **Position**: Bottom of dialog (72px from bottom)
- **Components**:
  - **btn_1**: Close button
    - Text: From `config.action.btn_1.txt` (string config)
    - Position: 
      - If only btn_1: `width / 2` (center)
      - If btn_1 + btn_2: `width / 4` (left quarter)
    - Y: `height / 2` (vertically centered)
  
  - **btn_2**: Use button (only for item_2 and item_3, and only if not showOnly)
    - Text: From `config.action.btn_2.txt` (string config)
    - Position: `width / 4 * 3` (right quarter)
    - Y: `height / 2` (vertically centered)
    - Click: Emits `btn_1_click` event with `(itemId, source)`

### Dialog Type Selection

**Based on Item Type:**
- **item_1**: Default items (no use button)
- **item_2**: Food items (`ItemType.TOOL, ItemType.FOOD` = "1103")
- **item_3**: Medicine/Buff items (`ItemType.TOOL, ItemType.MEDICINE` = "1104" or `ItemType.TOOL, ItemType.BUFF` = "1107" or itemId == 1106014)

### Item Count Source

**Determines which storage to check:**
```javascript
var storage;
if (player.isAtHome) {
    storage = player.storage;  // Use home storage
} else if (player.isAtBazaar && source == "bazaar") {
    // Use shop list (special case)
} else {
    if (player.tmpBag) {
        storage = player.tmpBag;
    } else {
        storage = player.bag;  // Use bag
    }
}
txt1.setString(cc.formatStr(txt1.getString(), storage.getNumByItemId(itemId)));
```

### Font Sizes (from `OriginalGame/src/ui/uiUtil.js`)
- **COMMON_1**: 32px (for title)
- **COMMON_2**: 24px
- **COMMON_3**: 20px (for txt_1, description, buff warning)

## Current Implementation Status

### ItemDialog.tsx
- **Location**: `src/components/overlays/ItemDialog.tsx`
- **Current State**: Implemented with basic structure

### Comparison Checklist

#### Dialog Structure
- [x] Dialog background: `dialog_big_bg.png` ✓
- [x] Dialog positioning: Centered ✓
- [x] Overlay: Semi-transparent black ✓
- [x] Title section: 90px height ✓
- [x] Content section: Variable height ✓
- [x] Action section: 72px height ✓

#### Title Section
- [x] Icon: `icon_item_{itemId}.png` ✓
- [ ] Icon position: Should be `leftEdge` (20px), `height / 2 - 4` (currently using 50% with translateY)
- [ ] Icon anchor: Should be (0, 0.5) - left edge, vertically centered
- [x] Title text: Item name ✓
- [ ] Title font size: Should be 32px (COMMON_1), currently 32px but need to verify
- [ ] Title position: Should be `leftEdge + icon.width * icon.scale` (currently using fixed 70px offset)
- [ ] Title anchor: Should be (0, 0.5) - left edge, vertically centered
- [x] Count display (txt_1): Shows item count ✓
- [ ] Count font size: Should be 20px (COMMON_3), currently 20px but need to verify
- [ ] Count position: Should be `title.x`, `title.y - title.height / 2 + 2` (currently using fixed 55% top)

#### Content Section
- [x] Large image (dig_des): `dig_item_{itemId}.png` ✓
- [ ] Image position: Should be center horizontally, `contentHeight - 5` from top (currently using margin auto)
- [ ] Image anchor: Should be (0.5, 1) - center horizontally, top-aligned
- [x] Description text: Item description ✓
- [ ] Description font size: Should be 20px (COMMON_3), currently 20px but need to verify
- [ ] Description position: Should be calculated based on dig_des position
- [ ] Description anchor: Should be (0, 1) - left edge, top-aligned
- [x] Equip needed message: Shows for specific items ✓
- [x] No equip needed message: Shows for specific items ✓
- [x] Buff warning: Shows for buff items ✓
- [ ] Buff warning position: Should be `des.y - des.height - 20` (20px below description)
- [ ] Buff warning color: Should be RED (currently using text-red-600)

#### Action Section
- [x] Close button (btn_1): Present ✓
- [ ] Close button text: Should come from string config (currently hardcoded "OK"/"Back")
- [ ] Close button position: 
  - If only btn_1: Should be `width / 2` (center) - currently using x: 50%
  - If btn_1 + btn_2: Should be `width / 4` (left quarter) - currently using x: 25%
- [x] Use button (btn_2): Conditional display ✓
- [ ] Use button text: Should come from string config (currently hardcoded "Eat (10 m)"/"Use (10 m)")
- [ ] Use button position: Should be `width / 4 * 3` (right quarter) - currently using x: 45%
- [x] Use button click: Emits `btn_1_click` event ✓

#### Item Count Logic
- [x] Checks storage when at home ✓
- [x] Checks bag when not at home ✓
- [ ] Should check tmpBag when at site (not implemented yet)
- [ ] Should check bazaar shop list when at bazaar (not implemented yet)

#### Dialog Type Logic
- [x] item_1: Default items ✓
- [x] item_2: Food items ✓
- [x] item_3: Medicine/Buff items ✓
- [x] showOnly handling: Removes use button ✓

## Crosscheck Tasks

### Task 1: Verify Dialog Positioning
**Objective**: Ensure dialog is centered correctly on screen

**Steps**:
1. Check dialog center calculation:
   - Original: `(winSize.width - contentSize.width) / 2, 29 + (839 - contentSize.height) / 2`
   - Current: `left: 50%, top: 50%, transform: translate(-50%, -50%)`
2. Verify overlay covers full screen
3. Verify dialog is within BottomBar area (current implementation)

**Expected Result**: Dialog positioning matches original game or is appropriately adapted for BottomBar context

### Task 2: Verify Title Section Layout
**Objective**: Ensure title section matches original game layout

**Steps**:
1. Check icon positioning:
   - Original: `leftEdge` (20px), `height / 2 - 4` (with -4px offset)
   - Current: `leftEdge` (20px), `50%` with `translateY(-50%)`
2. Check title positioning:
   - Original: `leftEdge + icon.width * icon.scale` (dynamic based on icon size)
   - Current: `leftEdge + 70` (fixed 70px offset)
3. Check count positioning:
   - Original: `title.x`, `title.y - title.height / 2 + 2`
   - Current: `leftEdge + 70`, `55%` (fixed position)
4. Verify font sizes:
   - Title: 32px (COMMON_1)
   - Count: 20px (COMMON_3)

**Expected Result**: Title section layout matches original game

### Task 3: Verify Content Section Layout
**Objective**: Ensure content section matches original game layout

**Steps**:
1. Check large image positioning:
   - Original: Center horizontally, `contentHeight - 5` from top
   - Current: `mx-auto` (center), `mb-4` (margin bottom)
2. Check description positioning:
   - Original: `leftEdge`, calculated Y based on image
   - Current: `leftEdge`, `mb-2` (margin bottom)
3. Check buff warning positioning:
   - Original: `des.y - des.height - 20` (20px below description)
   - Current: `mt-2` (margin top)
4. Verify font sizes:
   - Description: 20px (COMMON_3)
   - Buff warning: 20px (COMMON_3), RED color

**Expected Result**: Content section layout matches original game

### Task 4: Verify Action Section Layout
**Objective**: Ensure action buttons are correctly positioned

**Steps**:
1. Check button positions:
   - Original: `width / 4` (left) and `width / 4 * 3` (right) for two buttons
   - Current: `x: 25%` (left) and `x: 45%` (right) - **MISMATCH**
2. Check button text:
   - Original: From string config
   - Current: Hardcoded "OK"/"Back"/"Eat (10 m)"/"Use (10 m)"
3. Verify button centering:
   - Original: `height / 2` (vertically centered)
   - Current: `y: 50%` (vertically centered)

**Expected Result**: Action section layout matches original game

### Task 5: Verify Item Count Logic
**Objective**: Ensure item count is retrieved from correct storage

**Steps**:
1. Test at home: Should use `player.storage`
2. Test not at home: Should use `player.bag` (or `player.tmpBag` if at site)
3. Test at bazaar: Should use shop list (not implemented yet)
4. Verify count format: Should use string config format

**Expected Result**: Item count logic matches original game

### Task 6: Verify Special Messages
**Objective**: Ensure special messages display correctly

**Steps**:
1. Test equip needed items: [1305053, 1305075, 1305064]
2. Test no equip needed items: [1305034, 1305024, 1305023, 1306001]
3. Test buff items: Should show red warning message
4. Verify message text: Should come from string config

**Expected Result**: Special messages match original game

### Task 7: Verify Dialog Type Logic
**Objective**: Ensure correct dialog type is selected

**Steps**:
1. Test default items: Should be item_1 (no use button)
2. Test food items: Should be item_2 (has use button)
3. Test medicine items: Should be item_3 (has use button)
4. Test buff items: Should be item_3 (has use button)
5. Test showOnly: Should remove use button even for item_2/item_3

**Expected Result**: Dialog type logic matches original game

### Task 8: Verify Button Click Behavior
**Objective**: Ensure buttons work correctly

**Steps**:
1. Test close button: Should dismiss dialog
2. Test use button: Should emit `btn_1_click` event
3. Test overlay click: Should close dialog (autoDismiss = true)
4. Test ESC key: Should close dialog

**Expected Result**: Button behavior matches original game

### Task 9: Visual Comparison
**Objective**: Compare visual appearance with original game

**Steps**:
1. Open original game and click on an item
2. Take screenshot of dialog
3. Open ported game and click on same item
4. Take screenshot of dialog
5. Compare:
   - Dialog size and position
   - Title section layout
   - Content section layout
   - Action section layout
   - Font sizes and colors
   - Spacing and padding
   - Image positioning

**Expected Result**: Visual appearance matches original game

### Task 10: Functional Testing
**Objective**: Verify all interactive elements work correctly

**Steps**:
1. Test item clicking from storage panel
2. Test use button functionality
3. Test close button functionality
4. Test overlay click to close
5. Test ESC key to close
6. Test item count updates after use
7. Test dialog closes after item use (unless death occurs)

**Expected Result**: All interactive elements work as expected

## Issues Found

### Issue 1: Button Positioning Mismatch
**Location**: Action section
**Problem**: 
- Original: `width / 4` (25%) and `width / 4 * 3` (75%)
- Current: `x: 25%` (25%) and `x: 45%` (45%) - **WRONG**

**Fix**: Change btn_2 position from `x: 45%` to `x: 75%`

### Issue 2: Icon/Title Positioning
**Location**: Title section
**Problem**: 
- Current uses fixed 70px offset for title
- Should use dynamic offset based on icon width

**Fix**: Calculate title position as `leftEdge + icon.width * icon.scale`

### Issue 3: Image Positioning
**Location**: Content section
**Problem**:
- Current uses margin auto and margin bottom
- Should use explicit positioning: center horizontally, `contentHeight - 5` from top

**Fix**: Use absolute positioning with calculated Y

### Issue 4: Description Positioning
**Location**: Content section
**Problem**:
- Current uses margin bottom
- Should be positioned relative to image: `contentHeight - imageHeight - 5` (or `contentHeight - 20` if no image)

**Fix**: Calculate description Y based on image position

### Issue 5: Buff Warning Positioning
**Location**: Content section
**Problem**:
- Current uses margin top
- Should be positioned: `des.y - des.height - 20` (20px below description)

**Fix**: Calculate buff warning Y based on description position

### Issue 6: Hardcoded Strings
**Location**: Multiple places
**Problem**:
- Button texts are hardcoded
- Should come from string config

**Fix**: Integrate with string system when available

### Issue 7: Font Sizes
**Location**: Title and content sections
**Problem**:
- Font sizes are set but need verification
- Should match: Title 32px, Count/Description 20px

**Fix**: Verify and ensure font sizes match original

## Implementation Checklist

- [ ] Fix button positioning (btn_2 should be at 75%, not 45%)
- [ ] Fix icon/title positioning (use dynamic offset)
- [ ] Fix image positioning (use explicit positioning)
- [ ] Fix description positioning (relative to image)
- [ ] Fix buff warning positioning (relative to description)
- [ ] Verify font sizes match original (32px title, 20px count/description)
- [ ] Integrate string system for button texts
- [ ] Add tmpBag support for item count
- [ ] Add bazaar shop list support for item count
- [ ] Visual comparison with original game
- [ ] Test all item types
- [ ] Test all special messages

## Files to Review

### Original Game Files
- `OriginalGame/src/ui/uiUtil.js` - `showItemDialog` function (lines 591-667)
- `OriginalGame/src/ui/dialog.js` - `DialogBig` class (lines 452-536)
- `OriginalGame/src/ui/dialog.js` - `DialogCommon` class (lines 161-274)
- `OriginalGame/src/data/string/string_en.js` - String configurations

### Current Implementation Files
- `src/components/overlays/ItemDialog.tsx` - Item dialog component
- `src/components/common/DialogButton.tsx` - Dialog button component
- `src/utils/position.ts` - Cocos-to-CSS position conversion utilities
- `src/data/strings/` - String data files (if exists)

## Notes

1. **Dialog Positioning**: The current implementation positions the dialog within the BottomBar area, which is different from the original game's screen-centered approach. This may be intentional for the port.

2. **Font Sizes**: Font sizes should match:
   - Title: 32px (COMMON_1)
   - Count/Description/Buff warning: 20px (COMMON_3)

3. **Button Positions**: The action buttons should be at:
   - btn_1 (close): `width / 4` (25%) when two buttons, `width / 2` (50%) when one button
   - btn_2 (use): `width / 4 * 3` (75%) when two buttons

4. **String System**: Button texts and messages should come from string configs, not be hardcoded.

5. **Item Count**: Should handle tmpBag and bazaar shop list cases.

6. **Auto-dismiss**: The original game has `autoDismiss = true`, meaning clicking outside the dialog closes it. Current implementation supports this.


