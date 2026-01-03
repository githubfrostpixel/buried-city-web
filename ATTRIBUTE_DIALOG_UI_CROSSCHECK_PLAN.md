# Attribute Dialog UI Crosscheck Plan

## Overview

This plan outlines how to verify and crosscheck the UI appearance when clicking on an attribute button in the TopBar, comparing the current implementation with the original game behavior.

## Original Game Behavior

### Dialog Structure (from `OriginalGame/src/ui/topFrame.js`)

When clicking an attribute button, `showAttrStatusDialog(stringId, attr)` is called, which creates a `DialogBig` dialog with the following structure:

#### 1. Dialog Container
- **Type**: `DialogBig` (extends `DialogCommon`)
- **Background**: `dialog_big_bg.png`
- **Position**: Centered on screen
- **Overlay**: Semi-transparent black background (opacity 200, color (0, 0, 0, 155))
- **Auto-dismiss**: `false` (must click close button)

#### 2. Title Section (`titleNode`)
- **Height**: 90px
- **Position**: Top of dialog (height - 90px from bottom)
- **Components**:
  - **Icon**: `icon_{attr}_0.png` (e.g., `icon_injury_0.png`)
    - Position: `leftEdge` (20px), center vertically
    - Anchor: (0, 0.5)
  - **Title**: Attribute name from `stringUtil.getString(stringId).title`
    - Position: Next to icon (leftEdge + icon.width * icon.scale)
    - Font: `uiUtil.fontFamily.normal`, `uiUtil.fontSize.COMMON_1`
    - Color: Black
  - **txt_1**: Current value display
    - Format for HP/Virus: `"Current: {value}/{max}"` (e.g., "Current: 50/100")
    - Format for others: `"{attrStr} Current: {value}/{max}"` (e.g., "Hunger Current: 30/100")
    - Position: Below title, at `title.x`, `title.y - title.height / 2 + 2`
    - Font: `uiUtil.fontSize.COMMON_3`
    - Color: Black

#### 3. Content Section (`contentNode`)
- **Position**: Below title, above action buttons
- **Height**: `dialogHeight - 90px (title) - 72px (action)`
- **Components**:
  - **Description**: `stringUtil.getString(stringId).des`
    - Position: `leftEdge` (20px), top of content area
    - Width: `rightEdge - leftEdge` (dialog width - 40px)
    - Font: `uiUtil.fontSize.COMMON_3`
    - Color: Black
    - Anchor: (0, 1) - top-left aligned
  
  - **Buff Effect Text** (conditional, green color):
    - Visible when attribute has active buff effect
    - Position: `leftEdge`, `des.y - des.height - 10`
    - Font: `uiUtil.fontSize.COMMON_3`
    - Color: `cc.color(0, 162, 53)` (green)
    - Content: Buff name and effect description
  
  - **Buff Last Time Text** (conditional, green color):
    - Visible when attribute has active buff effect
    - Position: `leftEdge`, `buffEffect.y - buffEffect.height - 6`
    - Font: `uiUtil.fontSize.COMMON_3`
    - Color: `cc.color(0, 162, 53)` (green)
    - Content: Remaining buff time
  
  - **Item List Slider** (if not in tmpBag):
    - Type: `uiUtil.createItemListSliders(itemList)`
    - Position: `x: 20, y: 2` (relative to contentNode)
    - Shows items that can affect the attribute:
      - `starve`: Items of type "1103" (food)
      - `infect`: Items of type "1104" except "1104011" (medicine except bandage)
      - `injury`: Items of type "1104" with id "1104011" (bandage only)
      - `hp`: Items of type "1107" (HP items)
    - Items can be clicked to use them directly from the dialog
    - Updates when items are used
  
  - **Virus Exchange Buttons** (only for `virus` attribute):
    - Shows exchange buttons for other attributes if their max > 14
    - Each button: `ImageButton` with `icon_{attr}_0.png` at scale 0.7
    - Positions: x = 40, 100, 160, 220, 280, 340, 400 (for injury, infect, starve, vigour, spirit, water, hp)
    - y = 40 (from bottom of contentNode)
    - Clicking opens `virusExchangeDialog` to exchange attribute max for virus max

#### 4. Action Section (`actionNode`)
- **Height**: 72px
- **Position**: Bottom of dialog (72px from bottom)
- **Components**:
  - **btn_1**: Close button
    - Text: "OK" (from `statusDialog.action.btn_1.txt`)
    - Position: Center of action node
    - Click: Dismisses dialog

### Dialog Positioning

From `OriginalGame/src/ui/dialog.js`:
- Dialog base position: `(winSize.width - contentSize.width) / 2, 29 + (839 - contentSize.height) / 2`
- Background size: Based on `dialog_big_bg.png` sprite
- Screen size: 640x1136

### String IDs for Attributes

- Injury: `stringId = 10`
- Infect: `stringId = 9`
- Starve: `stringId = 6`
- Vigour: `stringId = 7`
- Spirit: `stringId = 8`
- Water: `stringId = 14`
- Virus: `stringId = 15`
- HP: `stringId = 5`

## Current Implementation Status

### TopBar.tsx
- **Location**: `src/components/layout/TopBar.tsx`
- **Current State**: 
  - Attribute buttons have `onClick` handlers calling `showAttrStatusDialog(stringId, attr)`
  - Function is placeholder: `console.log('Attribute status dialog:', { stringId, attr })`
  - **TODO**: Implement attribute status dialog

### Missing Components

1. **AttributeStatusDialog Component**: Not yet implemented
2. **DialogBig Component**: Not yet implemented (similar to ItemDialog but different structure)
3. **Item List Slider**: Not yet implemented for attribute dialogs
4. **Buff Display System**: Not yet implemented
5. **Virus Exchange System**: Not yet implemented

## Crosscheck Tasks

### Task 1: Verify Dialog Structure
**Objective**: Ensure the dialog matches the original game's DialogBig structure

**Steps**:
1. Check dialog background sprite: `dialog_big_bg.png` exists in assets
2. Verify dialog positioning: Centered on screen (640x1136)
3. Verify overlay: Semi-transparent black background
4. Verify dialog sections:
   - Title section: 90px height at top
   - Content section: Variable height in middle
   - Action section: 72px height at bottom

**Expected Result**: Dialog structure matches original game layout

### Task 2: Verify Title Section
**Objective**: Ensure title section displays correctly

**Steps**:
1. Check icon display:
   - Icon sprite: `icon_{attr}_0.png` (e.g., `icon_injury_0.png`)
   - Position: Left edge (20px), vertically centered
   - Scale: Default (no scale specified in original)
2. Check title text:
   - Source: `stringUtil.getString(stringId).title`
   - Position: Next to icon
   - Font size: `COMMON_1`
   - Color: Black
3. Check value display (txt_1):
   - Format for HP/Virus: `"Current: {value}/{max}"`
   - Format for others: `"{attrStr} Current: {value}/{max}"`
   - Position: Below title
   - Font size: `COMMON_3`
   - Color: Black

**Expected Result**: Title section matches original game appearance

### Task 3: Verify Content Section
**Objective**: Ensure content section displays description and items correctly

**Steps**:
1. Check description text:
   - Source: `stringUtil.getString(stringId).des`
   - Position: Top of content area, left edge (20px)
   - Width: Dialog width - 40px
   - Font size: `COMMON_3`
   - Color: Black
2. Check buff display (if applicable):
   - Buff effect text: Green color, positioned below description
   - Buff time text: Green color, positioned below buff effect
   - Only visible when buff is active
3. Check item list:
   - Items filtered by attribute type
   - Displayed in scrollable list
   - Items can be clicked to use
   - List updates after item use

**Expected Result**: Content section matches original game appearance and functionality

### Task 4: Verify Action Section
**Objective**: Ensure action buttons are correctly positioned

**Steps**:
1. Check close button:
   - Text: "OK" (from string config)
   - Position: Center of action section
   - Click: Dismisses dialog

**Expected Result**: Action section matches original game appearance

### Task 5: Verify Item List Filtering
**Objective**: Ensure correct items are shown for each attribute

**Steps**:
1. Test each attribute:
   - **Starve**: Should show items of type "1103" (food)
   - **Infect**: Should show items of type "1104" except "1104011"
   - **Injury**: Should show items of type "1104" with id "1104011" (bandage)
   - **HP**: Should show items of type "1107"
   - **Vigour/Spirit/Water**: Should show appropriate items (if any)
2. Verify item list updates after using items
3. Verify item use updates attribute values

**Expected Result**: Correct items displayed for each attribute type

### Task 6: Verify Virus Exchange (Special Case)
**Objective**: Ensure virus attribute shows exchange buttons correctly

**Steps**:
1. Check exchange button display:
   - Only shown when attribute max > threshold (14 for most, 29 for HP)
   - Button icons: `icon_{attr}_0.png` at scale 0.7
   - Positions: x = 40, 100, 160, 220, 280, 340, 400
   - y = 40 (from bottom of content)
2. Check exchange dialog:
   - Opens `virusExchangeDialog` when clicking exchange button
   - Shows confirmation before exchange
   - Updates attribute maxes after exchange

**Expected Result**: Virus exchange functionality matches original game

### Task 7: Verify Dialog Positioning (CSS Conversion)
**Objective**: Ensure dialog positioning matches original using Cocos-to-CSS conversion

**Steps**:
1. Check dialog center calculation:
   - Original: `(winSize.width - contentSize.width) / 2, 29 + (839 - contentSize.height) / 2`
   - CSS: Use `cocosToCssPosition` utility or manual calculation
   - Screen: 640x1136
2. Check overlay positioning:
   - Full screen overlay
   - Semi-transparent black background
3. Check dialog sections positioning:
   - Title: Top of dialog
   - Content: Middle of dialog
   - Action: Bottom of dialog

**Expected Result**: Dialog positioning matches original game using CSS coordinates

### Task 8: Verify String Localization
**Objective**: Ensure all text strings are correctly localized

**Steps**:
1. Check string IDs:
   - Injury: 10
   - Infect: 9
   - Starve: 6
   - Vigour: 7
   - Spirit: 8
   - Water: 14
   - Virus: 15
   - HP: 5
2. Check string config:
   - `statusDialog.title.txt_1`: "Current: %s" (or localized equivalent)
   - `statusDialog.action.btn_1.txt`: "OK" (or localized equivalent)
   - Attribute-specific strings: `stringUtil.getString(stringId).title` and `.des`

**Expected Result**: All strings correctly localized and displayed

### Task 9: Visual Comparison
**Objective**: Compare visual appearance with original game

**Steps**:
1. Open original game and click on an attribute
2. Take screenshot of dialog
3. Open ported game and click on same attribute
4. Take screenshot of dialog
5. Compare:
   - Dialog size and position
   - Title section layout
   - Content section layout
   - Action section layout
   - Font sizes and colors
   - Spacing and padding

**Expected Result**: Visual appearance matches original game

### Task 10: Functional Testing
**Objective**: Verify all interactive elements work correctly

**Steps**:
1. Test item clicking:
   - Click item in list
   - Verify item is used
   - Verify attribute value updates
   - Verify item list updates
   - Verify title value display updates
2. Test buff display:
   - Apply buff to attribute
   - Open attribute dialog
   - Verify buff effect and time are displayed
3. Test virus exchange (if applicable):
   - Open virus attribute dialog
   - Click exchange button
   - Verify exchange dialog appears
   - Complete exchange
   - Verify attribute maxes update
4. Test close button:
   - Click close button
   - Verify dialog dismisses
   - Verify no auto-dismiss on overlay click (autoDismiss = false)

**Expected Result**: All interactive elements work as expected

## Implementation Checklist

- [ ] Create `AttributeStatusDialog` component
- [ ] Implement `DialogBig` base component (or reuse existing dialog system)
- [ ] Implement title section with icon, title, and value display
- [ ] Implement content section with description
- [ ] Implement buff display system
- [ ] Implement item list slider for attribute dialogs
- [ ] Implement virus exchange buttons (special case)
- [ ] Implement item use functionality from dialog
- [ ] Add string localization support
- [ ] Verify CSS positioning matches Cocos positioning
- [ ] Test all attributes
- [ ] Visual comparison with original game

## Files to Review

### Original Game Files
- `OriginalGame/src/ui/topFrame.js` - `showAttrStatusDialog` function (lines 409-701)
- `OriginalGame/src/ui/dialog.js` - `DialogBig` class (lines 452-536)
- `OriginalGame/src/ui/uiUtil.js` - `createItemListSliders` function
- `OriginalGame/src/data/string/string_en.js` - String configurations

### Current Implementation Files
- `src/components/layout/TopBar.tsx` - Attribute button click handlers
- `src/components/overlays/ItemDialog.tsx` - Reference for dialog structure
- `src/utils/position.ts` - Cocos-to-CSS position conversion utilities
- `src/data/strings/` - String data files

## Notes

1. **Dialog Positioning**: The original game uses Cocos2d-JS coordinate system (bottom-left origin). CSS uses top-left origin. Use `cocosToCssPosition` utility or manual conversion.

2. **Item List**: The item list is created using `uiUtil.createItemListSliders(itemList)`, which creates a scrollable list of items. This needs to be ported or recreated.

3. **Buff System**: The buff display shows active buff effects for attributes. This requires the buff system to be implemented first.

4. **Virus Exchange**: This is a special feature only for the virus attribute. It allows exchanging max values of other attributes for virus max.

5. **Auto-dismiss**: The attribute dialog has `autoDismiss = false`, meaning clicking outside the dialog does not close it. Only the close button dismisses it.

6. **Item Use**: Items can be used directly from the dialog. The dialog updates the attribute value display and item list after use.




