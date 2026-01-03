# Work Room UI Fix Plan

## Overview
Cross-check and fix the work room UI positioning to match the original game's Cocos2d-JS layout.

## Issues Identified

### 1. Work Image (digDes) Positioning

**Original Game (Cocos2d-JS):**
```javascript
digDes.setAnchorPoint(0.5, 1);  // Top-center anchor
digDes.setPosition(this.bgRect.width / 2, this.contentTopLineHeight - 20);
```
- Anchor: `(0.5, 1)` = top-center (top edge is anchor point)
- Position: `(bgWidth/2, contentTopLineHeight - 20)`
- In Cocos: Y coordinate is from bottom, so `contentTopLineHeight - 20` means 20px below the content top line
- The image's top edge is positioned at this Y coordinate

**Current Implementation:**
```typescript
<div style={{ left: '50%', top: `${content.top}px`, transform: 'translate(-50%, -50%)' }}>
```
- Uses center anchor (`translate(-50%, -50%)`)
- Positioned at `content.top` which is the CSS top of content area

**Fix Required:**
- Change anchor to top-center: `transform: 'translate(-50%, 0)'`
- Position top edge at: `contentTopLineHeight - 20` converted to CSS
- CSS Y = `bgHeight - (contentTopLineHeight - 20)` = `bgHeight - contentTopLineHeight + 20`

### 2. Description (des) Positioning

**Original Game:**
```javascript
this.bg.getChildByName("des").setPosition(this.bgRect.width / 2, digDes.y - digDes.height - 20);
```
- Positioned at center horizontally
- Y position: `digDes.y - digDes.height - 20` (20px below the bottom of work image)
- Anchor: `(0.5, 1)` (top-center, from original setup)

**Current Implementation:**
```typescript
top: `${content.top + 250}px`
```
- Uses fixed offset from content.top

**Fix Required:**
- Calculate position relative to work image bottom
- Work image bottom = work image top - image height
- Description top = work image bottom - 20px

### 3. Tool Selection Container

**Original Game:**
```javascript
var node = new cc.Node();
node.setContentSize(this.rightEdge - this.leftEdge, 600);
node.setAnchorPoint(0.5, 0);  // Bottom-center anchor
node.setPosition(this.bgRect.width / 2, 0);  // At bottom of bg (Y=0 in Cocos)
this.bg.addChild(node);
```
- Container: `(rightEdge - leftEdge) × 600` pixels
- Anchor: `(0.5, 0)` = bottom-center
- Position: `(bgWidth/2, 0)` = centered horizontally, at bottom of bg
- In Cocos, Y=0 is the bottom of the bg

**Current Implementation:**
```typescript
<div style={{
  left: '50%',
  top: `${content.top + 350}px`,
  transform: 'translateX(-50%)',
  width: `${rightEdge - leftEdge}px`,
}}>
```
- Uses fixed top position
- Uses flexbox for button layout

**Fix Required:**
- Container should be positioned at bottom of bg (Y=0 in Cocos = bottom in CSS)
- CSS top = `bgHeight - 600` (if container height is 600)
- Or use `bottom: 0` positioning
- Width: `rightEdge - leftEdge`
- Height: 600px

### 4. Tool Button Positioning

**Original Game:**
```javascript
var btnToolFrame = autoSpriteFrameController.getSpriteFrameFromSpriteName("btn_tool.png");
var iconWidth = btnToolFrame.getRect().width;
var padding = (node.getContentSize().width - itemList.length * iconWidth) / (itemList.length * 2);
// ...
btn.setPosition((padding * 2 + iconWidth) * i + (padding + iconWidth / 2), 120);
btn.setAnchorPoint(0.5, 0.5);
```
- Button width = `iconWidth` (from btn_tool.png frame)
- Padding calculated: `(containerWidth - totalButtonWidth) / (buttonCount * 2)`
- Button X: `(padding * 2 + iconWidth) * i + (padding + iconWidth / 2)`
- Button Y: `120` (from bottom of container)
- Anchor: `(0.5, 0.5)` = center

**Current Implementation:**
```typescript
<div className="flex gap-4 justify-center flex-wrap">
```
- Uses flexbox with gap-4 (16px)
- Buttons have fixed width 80px

**Fix Required:**
- Calculate actual button width from btn_tool.png sprite
- Calculate padding based on container width and button count
- Position buttons at Y=120 from bottom of container
- Use absolute positioning instead of flexbox

### 5. Tool Button Icon

**Original Game:**
```javascript
var icon = autoSpriteFrameController.getSpriteFromSpriteName("#icon_item_" + itemId + ".png");
icon.setPosition(btn.getContentSize().width / 2, btn.getContentSize().height / 2);
icon.setScale(0.5);
```
- Icon centered in button
- Scale: 0.5 (half size)

**Current Implementation:**
```typescript
<Sprite atlas="icon" frame={`icon_item_${tool.itemId}.png`} style={{ width: '40px', height: '40px' }} />
```
- Fixed size 40px

**Fix Required:**
- Icon should be 50% scale of original size
- Centered in button
- For hand icon: use `icon_tab_content_hand.png` from `gate` atlas (already correct)

### 6. Tool Button Label

**Original Game:**
```javascript
var label = new cc.LabelTTF(stringUtil.getString(1062) + time + "m", ...);
label.setAnchorPoint(0.5, 1);  // Top-center anchor
label.setPosition(btn.getPositionX(), btn.getPositionY() - iconWidth / 2 - 10);
```
- Label positioned below button
- Y position: `btn.y - iconWidth/2 - 10` (10px below button center)
- Anchor: `(0.5, 1)` = top-center

**Current Implementation:**
```typescript
<div className="text-white text-xs mt-1">{Math.round(tool.time)}m</div>
```
- Label inside button with margin-top

**Fix Required:**
- Label should be positioned below button, not inside
- Y position: button center Y - (button height / 2) - 10px
- Use absolute positioning
- Anchor: top-center

### 7. Work Process View Progress Bar

**Original Game:**
```javascript
var pbBg = autoSpriteFrameController.getSpriteFromSpriteName("#pb_bg.png");
pbBg.setAnchorPoint(0.5, 0);
pbBg.setPosition(node.getContentSize().width / 2, 60);
```
- Progress bar background at Y=60 from bottom of container
- Anchor: `(0.5, 0)` = bottom-center
- Width: centered horizontally

**Current Implementation:**
```typescript
top: `${content.top + 300}px`
```
- Uses fixed top position

**Fix Required:**
- Progress bar should be at Y=60 from bottom of container
- Container same as tool selection (600px height, at bottom of bg)
- CSS top = container bottom + 60 = `bgHeight - 600 + 60` = `bgHeight - 540`

## Implementation Steps

### Step 1: Fix Work Image Position
1. Change anchor from center to top-center
2. Calculate position: `bgHeight - (contentTopLineHeight - 20)`
3. Use `transform: 'translate(-50%, 0)'` for top-center anchor

### Step 2: Fix Description Position
1. Calculate work image height (estimate or measure)
2. Position description: work image bottom - 20px
3. Use center horizontal alignment

### Step 3: Fix Tool Selection Container
1. Create container with width `rightEdge - leftEdge`, height 600px
2. Position at bottom of bg: `bottom: 0` or `top: bgHeight - 600`
3. Center horizontally: `left: 50%, transform: translateX(-50%)`

### Step 4: Fix Tool Button Layout
1. Get actual button width from btn_tool.png (need to check sprite dimensions)
2. Calculate padding: `(containerWidth - buttonCount * buttonWidth) / (buttonCount * 2)`
3. Position buttons at Y=120 from container bottom
4. Use absolute positioning for each button
5. Calculate X position: `(padding * 2 + buttonWidth) * i + (padding + buttonWidth / 2)`

### Step 5: Fix Tool Button Icon
1. Use scale 0.5 (50% of original size)
2. Center icon in button
3. Keep hand icon using gate atlas

### Step 6: Fix Tool Button Label
1. Position label below button (not inside)
2. Y position: button center Y - (button height / 2) - 10px
3. Use absolute positioning with top-center anchor

### Step 7: Fix Work Process View
1. Use same container structure as tool selection
2. Position progress bar at Y=60 from container bottom
3. Center horizontally

## Coordinate Conversion Reference

From `COCOS_TO_CSS_POSITION_MAPPING.md`:
- Cocos Y=0 = CSS bottom=0
- Cocos Y=height = CSS top=0
- CSS Y = screenHeight - Cocos Y

For BottomBar:
- `bgHeight` = 834px (scaled)
- `contentTopLineHeight` = 770px (scaled, Cocos Y from bottom)
- CSS top for contentTopLineHeight = `bgHeight - 770` = `64px`

## Constants Needed

```typescript
const bgHeight = BOTTOM_BAR_LAYOUT.bgHeight  // 834
const contentTopLineHeight = BOTTOM_BAR_LAYOUT.cocosRef.contentTopLineHeight  // 770
const leftEdge = BOTTOM_BAR_LAYOUT.leftEdge  // 40
const rightEdge = BOTTOM_BAR_LAYOUT.rightEdge  // bgWidth - 40
const containerWidth = rightEdge - leftEdge
const containerHeight = 600
const toolButtonY = 120  // From bottom of container
const progressBarY = 60  // From bottom of container
```

## Testing Checklist

- [ ] Work image top edge is at correct position (contentTopLineHeight - 20)
- [ ] Description is 20px below work image bottom
- [ ] Tool selection container is at bottom of bg
- [ ] Tool buttons are evenly spaced with correct padding
- [ ] Tool buttons are at Y=120 from container bottom
- [ ] Tool button icons are scaled to 0.5
- [ ] Tool button labels are below buttons, not inside
- [ ] Progress bar is at Y=60 from container bottom
- [ ] All elements are horizontally centered
- [ ] Layout matches original game visually


