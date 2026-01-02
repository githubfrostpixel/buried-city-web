# Battle UI Positioning and Sizing Review Plan

## Overview

Review and fix the Battle UI component positioning and sizing to match the original game exactly according to COCOS_TO_CSS_POSITION_MAPPING.md guidelines.

## Original Game Positioning (from battleAndWorkNode.js)

### Battle Begin View

**Background Image (dig_des):**
- Sprite: `npc_dig_bg.png` (from npc atlas)
- Position: `(bgRect.width / 2, contentTopLineHeight - 20)` 
- Anchor: `(0.5, 1)` - Top-center anchor
- Cocos Y: `contentTopLineHeight - 20` means 20px from top of content area (measured from bottom in Cocos)

**Mid Background:**
- Sprite: `monster_dig_mid_bg.png` (from dig_monster atlas)
- Position: `(digDesBg.width / 2, digDesBg.height / 2)` - Centered on parent
- Anchor: Default (0.5, 0.5)

**Monster Image:**
- Sprite: `monster_dig_${difficulty}.png` or `bandit_dig_${difficulty}.png` (from dig_monster atlas)
- Position: `(digDesBg.width / 2, digDesBg.height / 2)` - Centered on parent
- Anchor: Default (0.5, 0.5)

**Node Container:**
- Size: `(rightEdge - leftEdge, 600)`
- Position: `(bgRect.width / 2, 0)` - Centered horizontally, at bottom
- Anchor: `(0.5, 0)` - Bottom-center

**Equipment Label (label1):**
- Text: String ID 1041 ("Equipment" or similar)
- Position: `(0, 400)` - Relative to node
- Anchor: `(0, 1)` - Top-left (Cocos: bottom-left of text)
- Font: COMMON_3

**Equipment Icons (iconList):**
- Position: `(0, label1.y - label1.height - 20)` - Below label1
- Uses `uiUtil.createEquipedItemIconList(false, isMelee)`

**Difficulty Label (label2):**
- Text: String ID 1042 + difficulty value
- Position: `(0, iconList.getPositionY() - iconList.getContentSize().height - 25)` - Below iconList
- Anchor: `(0, 1)`
- Color: RED if difficulty > 2
- Font: COMMON_3

**Bullet Priority Selector (if applicable):**
- Position: `(0, label2.getPositionY() - label2.getContentSize().height - 130)`
- Exchange button: `(180, bulletRichText.getPositionY() + 20)`

**Warnings (label3, label4):**
- label3 (no weapon/alcohol): `(0, label2.getPositionY() - label2.getContentSize().height - 10)`
- label4 (low vigour): Below label3 or label2
- Anchor: `(0, 1)`
- Color: RED
- Font: COMMON_3

**Start Battle Button:**
- Position: `(node.getContentSize().width / 2, 60)` - Centered horizontally, 60px from bottom
- Anchor: Default (0.5, 0.5)

### Battle Process View

**Node Container:**
- Size: `(rightEdge - leftEdge, 100)` - Note: Height is 100, not full content height
- Position: `(bgRect.width / 2, 0)` - At bottom
- Anchor: `(0.5, 0)`

**Combat Log Labels (7 lines):**
- Position: `(0, i * 50 + 120)` for each line (i = 0 to 6)
- Anchor: `(0, 0)` - Bottom-left
- Font: COMMON_3 (or COMMON_2 if bigger)
- Width: `node.width`
- Logs scroll up (newest at bottom, oldest at top)

**Progress Bar Background (pbBg):**
- Sprite: `pb_bg.png`
- Position: `(node.getContentSize().width / 2, 60)` - Centered, 60px from bottom
- Anchor: `(0.5, 0)` - Bottom-center

**Progress Bar (pb):**
- Sprite: `pb.png`
- Position: `(pbBg.getPositionX(), pbBg.getPositionY() + pbBg.getContentSize().height / 2)`
- Type: Horizontal bar (barChangeRate: (1, 0))
- Percentage: `(monsterLenTotal - monsterLen) / monsterLenTotal * 100`

**Monster Count Label (labelNum):**
- Position: `(pbBg.x + pbBg.width / 2, pbBg.y + pbBg.height + 5)` - Above progress bar
- Anchor: `(1, 0)` - Top-right
- Text: String ID 1139 (monsters) or 9139 (bandits) + "X/Y"

**Note:** The dig_des background is NOT removed in process view - it stays visible (just description text is cleared)

### Battle End View

**Node Container:**
- Size: `(rightEdge - leftEdge, 600)`
- Position: `(bgRect.width / 2, 0)`
- Anchor: `(0.5, 0)`

**Consumed Items Label (label1):**
- Position: `(0, 400)` - Relative to node
- Anchor: `(0, 1)`
- Font: COMMON_3

**Consumed Items RichText:**
- Position: `(label1.x + label1.width, label1.y - label1.height / 2)` - Next to label1
- Anchor: `(0, 0.5)` - Left-center

**Damage Summary (label2):**
- Position: `(0, label1.getPositionY() - label1.getContentSize().height - 10)`
- Anchor: `(0, 1)`
- Font: COMMON_3

**Broken Weapons (label3 + richText2):**
- Position: `(0, label2.getPositionY() - label2.getContentSize().height - 10)`
- Anchor: `(0, 1)`

**Continue Button:**
- Position: `(node.getContentSize().width / 2, 60)` - Centered, 60px from bottom
- Anchor: Default (0.5, 0.5)

## Current Implementation Issues

### 1. Image Positioning and Sizing

**Issue:** 
- `digDesY` calculation may not match original
- Original uses anchor `(0.5, 1)` which means top-center
- Current uses `translate(-50%, -50%)` which centers the element

**Fix:**
- Use anchor `(0.5, 1)` equivalent: `left: 50%, top: Y, transform: translateX(-50%)` (no translateY)
- Position: `top: ${cocosToCssY(contentTopLineHeight - 20 - content.top, contentHeight)}px`

**Issue:**
- Image sizes are hardcoded (500px, 450px, 400px)
- Should use actual sprite dimensions or scale factors

**Fix:**
- Use `height: 'auto'` to maintain aspect ratio (already done by user)
- Set appropriate width based on content area or use scale factors

### 2. Equipment Icons Positioning

**Issue:**
- Current: `top: ${desY - 200}px` (estimated)
- Original: `(0, 400)` relative to node, which is `(0, nodeHeight - 400)` from top in CSS

**Fix:**
- Node height is 600px in original
- Position: `top: ${600 - 400}px = 200px` from top of node
- But node is at bottom of content, so need to account for that

### 3. Combat Log Positioning

**Issue:**
- Current: Uses `content.top` as top
- Original: Logs start at `(0, 120)` relative to node, which is 100px high
- Logs are at: `(0, i * 50 + 120)` for i = 0-6

**Fix:**
- Node is 100px high, positioned at bottom (y=0 in Cocos = bottom)
- In CSS: `top: ${contentHeight - 100 + 120}px` would be wrong
- Actually: `(0, 120)` in Cocos with anchor `(0, 0)` means 120px from bottom
- In CSS: `top: ${contentHeight - 120}px` for first log line

### 4. Progress Bar Positioning

**Issue:**
- Current: `top: ${contentHeight - 150}px`
- Original: `(node.getContentSize().width / 2, 60)` - 60px from bottom of node
- Node is 100px high, so 60px from bottom = 40px from top of node
- But node is at y=0 (bottom), so in CSS: `top: ${contentHeight - 100 + 40}px = contentHeight - 60px`

**Fix:**
- Position relative to node bottom: `top: ${contentHeight - 60}px`

### 5. Button Positioning

**Issue:**
- Current: `top: ${contentHeight - 100}px`
- Original: `(node.getContentSize().width / 2, 60)` - 60px from bottom of node
- Node is 600px high in begin/end views
- In CSS: `top: ${contentHeight - 600 + 60}px = contentHeight - 540px`

**Fix:**
- For 600px node: `top: ${contentHeight - 600 + 60}px`
- Or use relative positioning within node container

## Coordinate Conversion Details

### Content Area Reference
- `contentTopLineHeight`: 770 * scale (Cocos Y from bottom of bg)
- `content.top`: 76px (CSS Y from top of bg)
- `content.height`: `bgHeight - content.top` = `(834 * scale) - 76`

### Cocos to CSS Y Conversion
- Formula: `cssY = contentHeight - (cocosY - content.top)`
- For elements in node (relative to node bottom):
  - Node at y=0 (Cocos) = `contentHeight` (CSS)
  - Element at y=60 (Cocos, from node bottom) = `contentHeight - 60` (CSS)

### Anchor Point Conversion
- Cocos anchor `(0.5, 1)`: Top-center
  - CSS: `left: 50%, top: Y, transform: translateX(-50%)`
- Cocos anchor `(0, 1)`: Top-left
  - CSS: `left: X, top: Y`
- Cocos anchor `(0, 0)`: Bottom-left
  - CSS: `left: X, bottom: Y` or `left: X, top: contentHeight - Y`

## Implementation Tasks

### Task 1: Fix Background Image Positioning
- [ ] Change anchor from center to top-center `(0.5, 1)`
- [ ] Fix Y position calculation: `contentTopLineHeight - 20` from top of content
- [ ] Use `cocosToCssY` correctly for top-anchored element

### Task 2: Fix Equipment Icons Layout
- [ ] Create proper node container (600px height)
- [ ] Position equipment label at `(0, 400)` relative to node
- [ ] Position icon list below label
- [ ] Use actual icon list component or match original layout

### Task 3: Fix Combat Log Positioning
- [ ] Create node container (100px height) at bottom
- [ ] Position log lines at `(0, i * 50 + 120)` relative to node
- [ ] Convert to CSS: `top: ${contentHeight - 100 - (i * 50 + 120)}px`
- [ ] Actually: logs are at y=120, 170, 220, 270, 320, 370, 420 from node bottom
- [ ] CSS: `top: ${contentHeight - 100 - (120 + i * 50)}px`

### Task 4: Fix Progress Bar Positioning
- [ ] Position at `(center, 60)` relative to node
- [ ] Node is 100px high, so 60px from bottom = 40px from top
- [ ] CSS: `top: ${contentHeight - 100 + 40}px = contentHeight - 60px`

### Task 5: Fix Button Positioning
- [ ] For 600px node: `(center, 60)` = 60px from bottom = 540px from top
- [ ] CSS: `top: ${contentHeight - 600 + 60}px = contentHeight - 540px`

### Task 6: Fix Image Sizing
- [ ] Use `height: 'auto'` to maintain aspect ratio (already done)
- [ ] Set appropriate width (500px seems reasonable, but check actual sprite dimensions)
- [ ] Consider using scale factors if sprites are too large/small

### Task 7: Add Missing UI Elements
- [ ] Bullet priority selector (if gun equipped and both bullet types available)
- [ ] Alcohol effect warning
- [ ] Proper equipment icon list (not just individual sprites)
- [ ] Progress bar sprites (pb_bg.png, pb.png)

### Task 8: Fix Text Positioning
- [ ] All labels use anchor `(0, 1)` which means top-left in CSS
- [ ] Position from top, not bottom
- [ ] Use proper font sizes (COMMON_3 = ~12px, COMMON_2 = ~14px)

## Testing Checklist

- [ ] Background image appears at correct position (top-center, 20px from content top)
- [ ] Monster images are centered on background
- [ ] Equipment icons appear in correct position
- [ ] Difficulty label appears below equipment icons
- [ ] Warnings appear in correct order and position
- [ ] Start battle button is 60px from bottom of node
- [ ] Combat log lines appear in correct positions (7 lines, scrolling)
- [ ] Progress bar appears at correct position (60px from node bottom)
- [ ] Monster count label appears above progress bar
- [ ] Battle end view items are positioned correctly
- [ ] All text uses correct font sizes
- [ ] All elements respect content area boundaries

## Notes

1. **Node Container**: The original uses a node container for each view (begin, process, end). This node is positioned relative to the bg, and child elements are positioned relative to the node.

2. **Coordinate System**: 
   - Cocos: Y=0 at bottom, Y increases upward
   - CSS: Y=0 at top, Y increases downward
   - Node at y=0 (Cocos) means at bottom of content area

3. **Anchor Points**: 
   - `(0.5, 1)` = top-center (for backgrounds)
   - `(0, 1)` = top-left (for labels)
   - `(0, 0)` = bottom-left (for logs, buttons)

4. **Content Area**: 
   - Starts at `content.top` (76px from top of bg)
   - Height: `content.height` (bgHeight - 76)
   - All positioning should be relative to content area, not full bg

5. **Sprite Sizes**: 
   - Original sprites may have specific dimensions
   - Use `height: 'auto'` to maintain aspect ratio
   - Set width appropriately (500px seems reasonable based on content width ~516px)

## Next Steps

1. Review current implementation against this plan
2. Fix positioning calculations
3. Add missing UI elements
4. Test with actual sprites
5. Cross-check with original game screenshots if available


