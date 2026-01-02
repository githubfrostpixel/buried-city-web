# Attribute Dialog Layout Crosscheck Plan

## Overview

This plan verifies and fixes the AttributeStatusDialog layout to match the original game's DialogBig structure, including proper coordinate system conversion from Cocos2d-JS to CSS.

## Original Game Structure

### Source Files
- `OriginalGame/src/ui/dialog.js` - DialogBig class (lines 452-536)
- `OriginalGame/src/ui/topFrame.js` - showAttrStatusDialog() function (lines 409-701)

### DialogBig Structure (Cocos2d-JS)

**Background (bgNode)**:
- Sprite: `dialog_big_bg.png`
- Anchor: `(0, 0)` (bottom-left)
- Position: `(0, 0)` (bottom-left of bgNode)
- Size: Determined by sprite dimensions

**Title Node (titleNode)**:
- Anchor: `(0.5, 0)` (center horizontally, bottom vertically)
- Position: `(bgWidth / 2, bgHeight - 90)` (center X, 90px from top)
- Size: `(bgWidth, 90)`
- Content:
  - Icon: `leftEdge (20px), height/2 - 4` (vertically centered)
  - Title: Next to icon, vertically centered
  - txt_1: Below title, `title.y - title.height / 2 + 2`

**Action Node (actionNode)**:
- Anchor: `(0.5, 1)` (center horizontally, top vertically)
- Position: `(bgWidth / 2, 72)` (center X, 72px from bottom)
- Size: `(bgWidth, 72)`
- Content: Close button (btn_1)

**Content Node (contentNode)**:
- Anchor: `(0.5, 0)` (center horizontally, bottom vertically)
- Position: `(bgWidth / 2, 72)` (center X, 72px from bottom - same as actionNode top)
- Size: `(bgWidth, bgHeight - 90 - 72)` (full width, height minus title and action)
- Coordinate System: Bottom-left origin (Cocos2d-JS)
  - Y: 0 = bottom of contentNode
  - Y increases upward

**Content Node Children**:

1. **Description (des)**:
   - Type: `cc.LabelTTF`
   - Anchor: `(0, 1)` (left edge, top edge)
   - Position: `(leftEdge (20px), contentHeight - 20)` (20px from top)
   - Width: `rightEdge - leftEdge`
   - Font: `COMMON_3`

2. **Buff Effect Text** (conditional):
   - Anchor: `(0, 1)` (left edge, top edge)
   - Position: `(leftEdge, des.y - des.height - 10)` (10px below description)
   - Color: `cc.color(0, 162, 53)` (green)

3. **Buff Last Time Text** (conditional):
   - Anchor: `(0, 1)` (left edge, top edge)
   - Position: `(leftEdge, buffEffect.y - buffEffect.height - 6)` (6px below buff effect)

4. **Item TableView** (if items exist):
   - Type: `cc.TableView` (horizontal scrollable)
   - Position: `(20, 2)` (20px from left, 2px from bottom of contentNode)
   - Size: `(400, 100)` (400px wide, 100px tall)
   - Cell Size: `(100, 100)` (each item cell)

## Current Implementation Analysis

### File
`src/components/overlays/AttributeStatusDialog.tsx`

### Current Structure

**Dialog Container**:
```typescript
const dialogWidth = 400
const dialogHeight = 500
const titleHeight = 90
const actionHeight = 72
const contentHeight = dialogHeight - titleHeight - actionHeight
```

**Title Section**:
```typescript
// Position: top: 0, height: 90px
// Icon: left: 20px, top: 50% (centered vertically)
// Title: left: 90px, top: 40%
// Value: left: 90px, top: 55%
```

**Content Section**:
```typescript
// Position: top: 90px, height: 338px
// Description: left: 20px, top: contentHeight - 20, transform: translateY(-100%)
// Item List: left: 20px, bottom: 2px, width: 400px, height: 100px
```

**Action Section**:
```typescript
// Position: bottom: 0, height: 72px
// Close button: position: { x: 50, y: 50 }
```

## Issues to Check

### 1. Dialog Dimensions

**Check**: Are dialog dimensions correct?
- Original: Uses sprite `dialog_big_bg.png` dimensions
- Current: Hardcoded `400x500`
- **Action**: Verify actual sprite dimensions

### 2. Title Node Positioning

**Original Cocos**:
- Anchor: `(0.5, 0)` - center horizontally, bottom vertically
- Position: `(bgWidth / 2, bgHeight - 90)` - 90px from top

**Current CSS**:
- Position: `top: 0, height: 90px`
- **Status**: ✓ Appears correct (top-aligned, 90px height)

**Check**:
- [ ] Icon position matches original (leftEdge, height/2 - 4)
- [ ] Title position matches original (next to icon, vertically centered)
- [ ] txt_1 position matches original (below title, title.y - title.height/2 + 2)

### 3. Action Node Positioning

**Original Cocos**:
- Anchor: `(0.5, 1)` - center horizontally, top vertically
- Position: `(bgWidth / 2, 72)` - 72px from bottom

**Current CSS**:
- Position: `bottom: 0, height: 72px`
- **Status**: ✓ Appears correct (bottom-aligned, 72px height)

**Check**:
- [ ] Button position matches original

### 4. Content Node Positioning

**Original Cocos**:
- Anchor: `(0.5, 0)` - center horizontally, bottom vertically
- Position: `(bgWidth / 2, 72)` - 72px from bottom (same as actionNode top)
- Size: `(bgWidth, bgHeight - 90 - 72)`
- Coordinate System: Bottom-left origin (Y: 0 = bottom, Y increases upward)

**Current CSS**:
- Position: `top: 90px, height: 338px`
- Coordinate System: Top-left origin (Y: 0 = top, Y increases downward)

**Issue**: ContentNode uses different coordinate systems!

**Conversion Needed**:
- Cocos Y: 0 = bottom of contentNode
- CSS Y: 0 = top of contentNode
- Cocos Y = contentHeight - CSS Y

**Check**:
- [ ] ContentNode position: Should be at `top: 90px` (after titleNode)
- [ ] ContentNode height: Should be `bgHeight - 90 - 72`
- [ ] ContentNode uses top-left origin (CSS) - need to convert child positions

### 5. Description Positioning

**Original Cocos**:
- Anchor: `(0, 1)` - left edge, top edge
- Position: `(leftEdge (20px), contentHeight - 20)` - 20px from top
- In Cocos: Y = contentHeight - 20 (20px from top)

**Current CSS**:
- Position: `left: 20px, top: contentHeight - 20, transform: translateY(-100%)`
- **Status**: ⚠️ May be incorrect - using `top: contentHeight - 20` with `translateY(-100%)`

**Correct CSS**:
- Should be: `top: 20px` (20px from top of contentNode)
- No transform needed if anchor is top-left

**Check**:
- [ ] Description at `top: 20px` from contentNode top
- [ ] Description width: `dialogWidth - leftEdge * 2`

### 6. Item List Positioning

**Original Cocos**:
- Position: `(20, 2)` - 20px from left, 2px from bottom of contentNode
- In Cocos: Y = 2 (2px from bottom)

**Current CSS**:
- Position: `left: 20px, bottom: 2px`
- **Status**: ✓ Appears correct (2px from bottom)

**Check**:
- [ ] Item list at `bottom: 2px` from contentNode bottom
- [ ] Item list width: `400px`
- [ ] Item list height: `100px`

### 7. Buff Display Positioning (Not Yet Implemented)

**Original Cocos**:
- buffEffect: `(leftEdge, des.y - des.height - 10)` - 10px below description
- buffLastTime: `(leftEdge, buffEffect.y - buffEffect.height - 6)` - 6px below buff effect

**Current CSS**:
- Not implemented (placeholder)

**Check**:
- [ ] When implemented, position relative to description
- [ ] Use top-based positioning (CSS coordinate system)

## Coordinate Conversion Reference

### ContentNode Coordinate System

**Cocos2d-JS (Original)**:
- Origin: Bottom-left (0, 0)
- Y-axis: Increases upward
- Y = 0: Bottom of contentNode
- Y = contentHeight: Top of contentNode

**CSS (Current)**:
- Origin: Top-left (0, 0)
- Y-axis: Increases downward
- Y = 0: Top of contentNode
- Y = contentHeight: Bottom of contentNode

**Conversion Formula**:
```
CSS_Y = contentHeight - Cocos_Y
```

**Examples**:
- Cocos Y = 2 (2px from bottom) → CSS `bottom: 2px` ✓
- Cocos Y = contentHeight - 20 (20px from top) → CSS `top: 20px` ✓
- Cocos Y = des.y - des.height - 10 (10px below description) → CSS `top: desBottom + 10px`

## Testing Checklist

### Visual Verification

- [ ] Dialog dimensions match original sprite
- [ ] Title section is 90px tall at top
- [ ] Action section is 72px tall at bottom
- [ ] Content section fills space between title and action
- [ ] Description is at top of content area (20px from top)
- [ ] Item list is at bottom of content area (2px from bottom)
- [ ] No overlap between description and item list
- [ ] Horizontal scrolling works for item list
- [ ] Items display correctly in 100x100 cells

### Position Verification

- [ ] Title icon: left: 20px, vertically centered
- [ ] Title text: left: 90px, vertically centered
- [ ] Title value: left: 90px, below title text
- [ ] Description: left: 20px, top: 20px (from contentNode top)
- [ ] Item list: left: 20px, bottom: 2px (from contentNode bottom)
- [ ] Close button: centered in action section

### Layout Issues to Fix

1. **Description Position**: 
   - Current: `top: contentHeight - 20, transform: translateY(-100%)`
   - Should be: `top: 20px` (simple top positioning)

2. **ContentNode Height Calculation**:
   - Verify: `contentHeight = dialogHeight - titleHeight - actionHeight`
   - Should match: `bgHeight - 90 - 72`

3. **Item List Position**:
   - Current: `bottom: 2px` ✓ (correct)
   - Verify: No overlap with description

4. **Dialog Sprite Dimensions**:
   - Check actual `dialog_big_bg.png` dimensions
   - Update hardcoded values if needed

## Implementation Steps

1. **Verify Dialog Dimensions**:
   - Check `dialog_big_bg.png` sprite dimensions
   - Update `dialogWidth` and `dialogHeight` if needed

2. **Fix Description Positioning**:
   - Change from `top: contentHeight - 20, transform: translateY(-100%)`
   - To: `top: 20px` (simple top positioning)

3. **Verify ContentNode Layout**:
   - Ensure contentNode starts at `top: 90px`
   - Ensure contentNode height is `dialogHeight - 90 - 72`

4. **Verify Item List Position**:
   - Ensure item list is at `bottom: 2px` from contentNode
   - Ensure no overlap with description

5. **Test Layout**:
   - Open attribute dialog
   - Verify all elements are positioned correctly
   - Verify no overlaps or gaps
   - Verify scrolling works

6. **Cross-check with Original**:
   - Compare visual appearance with original game
   - Verify spacing and alignment match

## Expected Results

After fixes:
- Description positioned at top of content area (20px from top)
- Item list positioned at bottom of content area (2px from bottom)
- No overlap between description and item list
- Proper spacing throughout dialog
- Layout matches original game appearance


