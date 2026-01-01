# Menu Scene UI Cross-Check Plan

## Overview
This plan outlines the systematic cross-checking of the MenuScene UI implementation against the original game's MenuScene.js to ensure 1:1 pixel-perfect positioning and functionality.

## Mode: PLAN

## Analysis of Original Game MenuScene

### Screen Dimensions
- **Width**: 640px (`cc.winSize.width`)
- **Height**: 1136px (`cc.winSize.height`)
- **Background**: Full screen sprite centered at (320, 568) with anchor (0.5, 0.5)

### Element Positioning (Cocos Coordinates - Bottom-Left Origin)

#### 1. Background
- **Original**: `bg.x = cc.winSize.width / 2; bg.y = cc.winSize.height / 2`
- **Position**: (320, 568) - center of screen
- **Anchor**: Default (0.5, 0.5) - center anchor
- **Current Status**: ✅ Appears correct (centered)

#### 2. Logo
- **Original**: `logo.x = bg.width / 2; logo.y = 938`
- **Position**: (320, 938) - relative to bg, 938px from bottom
- **Anchor**: Default (0.5, 0.5) - center anchor
- **CSS Conversion**: 
  - Cocos Y = 938 (from bottom)
  - CSS Y = 1136 - 938 = 198px (from top)
- **Current Status**: ⚠️ Needs verification - currently using `top: '938px'` which is incorrect

#### 3. Main Buttons (All centered horizontally, positioned relative to bg center)

**Button 1 - New Game:**
- **Original**: `btn1.setPosition(bg.width / 2, bg.height / 2 - 126)`
- **Position**: (320, 442) - 320px from left, 442px from bottom (568 - 126)
- **Anchor**: Default (0.5, 0.5) - center anchor
- **CSS Conversion**:
  - Cocos Y = 442
  - CSS Y = 1136 - 442 = 694px (from top)
  - Horizontal: `left: 320px; transform: translateX(-50%)`
- **Current Status**: ⚠️ Needs verification - currently using flexbox centering which may not match exactly

**Button 2 - Hall of Fame:**
- **Original**: `btn2.setPosition(bg.width / 2, bg.height / 2 - 236)`
- **Position**: (320, 332) - 320px from left, 332px from bottom (568 - 236)
- **Anchor**: Default (0.5, 0.5) - center anchor
- **CSS Conversion**:
  - Cocos Y = 332
  - CSS Y = 1136 - 332 = 804px (from top)
- **Current Status**: ⚠️ Needs verification

**Button 3 - About:**
- **Original**: `btn3.setPosition(bg.width / 2, bg.height / 2 - 346)`
- **Position**: (320, 222) - 320px from left, 222px from bottom (568 - 346)
- **Anchor**: Default (0.5, 0.5) - center anchor
- **CSS Conversion**:
  - Cocos Y = 222
  - CSS Y = 1136 - 222 = 914px (from top)
- **Current Status**: ⚠️ Needs verification

#### 4. Bottom Icon Buttons

**Medal Button:**
- **Original**: `btn7.setPosition(bg.width / 2 - 72, 106)`
- **Position**: (248, 106) - 248px from left (320 - 72), 106px from bottom
- **Anchor**: Default (0.5, 0.5) - center anchor
- **CSS Conversion**:
  - Cocos Y = 106
  - CSS Y = 1136 - 106 = 1030px (from top)
  - Horizontal: `left: 248px; transform: translateX(-50%)`
- **Current Status**: ⚠️ Needs verification - currently using flexbox with gap

**Achievement Button:**
- **Original**: `btn4.setPosition(bg.width / 2 + 72, 106)`
- **Position**: (392, 106) - 392px from left (320 + 72), 106px from bottom
- **Anchor**: Default (0.5, 0.5) - center anchor
- **CSS Conversion**:
  - Cocos Y = 106
  - CSS Y = 1136 - 106 = 1030px (from top)
  - Horizontal: `left: 392px; transform: translateX(-50%)`
- **Current Status**: ⚠️ Needs verification - currently using flexbox with gap

#### 5. Settings Button (Top Right)
- **Original**: `btn_setting.setPosition(bg.width - 91, bg.height - 91)`
- **Position**: (549, 1045) - 549px from left (640 - 91), 1045px from bottom (1136 - 91)
- **Anchor**: Default (0.5, 0.5) - center anchor
- **CSS Conversion**:
  - Cocos Y = 1045
  - CSS Y = 1136 - 1045 = 91px (from top)
  - Horizontal: `left: 549px; transform: translateX(-50%)` OR `right: 91px; transform: translateX(50%)`
- **Current Status**: ⚠️ Needs verification - currently using `top: '91px', right: '91px'` which may not account for anchor

#### 6. Version Text (Bottom Center)
- **Original**: `btn6.setPosition(bg.width / 2, 20)`
- **Position**: (320, 20) - 320px from left, 20px from bottom
- **Anchor**: Default (0.5, 0.5) - center anchor
- **CSS Conversion**:
  - Cocos Y = 20
  - CSS Y = 1136 - 20 = 1116px (from top)
  - Horizontal: `left: 320px; transform: translateX(-50%)`
- **Current Status**: ⚠️ Needs verification - currently using `bottom: '20px'` which may not account for anchor

#### 7. Additional Buttons (MOD_VARIANT == 1 only - may not be in current port)
- **Contact Button**: `btn8.setPosition(106, 106)` - (106, 106) from bottom-left
- **Rate Button**: `btn_rate.setPosition(bg.width - 106, 106)` - (534, 106) from bottom-left
- **Status**: Not implemented in current port (expected)

## Cross-Check Tasks

### Task 1: Verify Background Positioning
- [ ] Confirm background is centered at (320, 568) with anchor (0.5, 0.5)
- [ ] Verify background covers full screen (640x1136)
- [ ] Check Christmas background logic (December > 18)

### Task 2: Verify Logo Positioning
- [ ] Convert Cocos position (320, 938) to CSS
- [ ] Verify logo is centered horizontally
- [ ] Verify logo Y position: CSS top should be 198px (1136 - 938)
- [ ] Check anchor point handling (center anchor)

### Task 3: Verify Main Buttons Positioning
- [ ] Button 1 (New Game): Verify position (320, 442) → CSS (320px, 694px from top)
- [ ] Button 2 (Hall of Fame): Verify position (320, 332) → CSS (320px, 804px from top)
- [ ] Button 3 (About): Verify position (320, 222) → CSS (320px, 914px from top)
- [ ] Verify all buttons are centered horizontally with transform
- [ ] Verify button spacing matches original (110px between buttons: 126, 236, 346 offsets)
- [ ] Check button size: 242px × 74px (from current implementation)

### Task 4: Verify Bottom Icon Buttons
- [ ] Medal button: Verify position (248, 106) → CSS (248px, 1030px from top)
- [ ] Achievement button: Verify position (392, 106) → CSS (392px, 1030px from top)
- [ ] Verify horizontal spacing: 72px offset from center (144px between buttons)
- [ ] Verify vertical alignment: Both at 106px from bottom (1030px from top)
- [ ] Check button sizes match original

### Task 5: Verify Settings Button
- [ ] Verify position (549, 1045) → CSS (549px, 91px from top)
- [ ] Verify anchor point handling (center anchor)
- [ ] Alternative: Use `right: 91px` with proper transform

### Task 6: Verify Version Text
- [ ] Verify position (320, 20) → CSS (320px, 1116px from top)
- [ ] Verify horizontal centering
- [ ] Check text content matches original format

### Task 7: Verify Button Functionality
- [ ] New Game button navigates to saveFile scene
- [ ] Hall of Fame button shows notification (TODO)
- [ ] About button shows notification (TODO)
- [ ] Medal button shows notification (TODO)
- [ ] Achievement button shows notification (TODO)
- [ ] Settings button shows notification (TODO)
- [ ] All buttons play CLICK sound effect

### Task 8: Verify Audio
- [ ] Main menu music plays on mount (MAIN_PAGE, loop: true)
- [ ] Music stops on unmount
- [ ] Click sound plays on all button clicks

### Task 9: Verify Screen Scaling
- [ ] Check if screenFix scaling (0.83) needs to be applied
- [ ] Verify current implementation handles different screen sizes

### Task 10: Verify Sprite Assets
- [ ] Background: `sprites/new/menu_bg.png` and `menu_bg_christmas.png`
- [ ] Logo: `sprites/new/top_logo_en.png`
- [ ] Button sprite: `ui/btn_big_white_normal.png`
- [ ] Medal icon: `ui/icon_medal.png`
- [ ] Achievement icon: `ui/btn_achievement.png`
- [ ] Settings icon: `ui/btn_game_setting.png`

## Implementation Strategy

### Step 1: Create Position Conversion Helper
- Use existing `cocosToCssPosition` utility from `src/utils/position.ts`
- Convert all Cocos coordinates to CSS coordinates
- Account for anchor points (default 0.5, 0.5 for centered elements)

### Step 2: Update Logo Positioning
- Convert from hardcoded `top: '938px'` to proper conversion
- Use: `cocosPosition(320, 938, 0.5, 0.5)`

### Step 3: Update Main Buttons Positioning
- Replace flexbox centering with absolute positioning
- Use position utility for each button:
  - Button 1: `cocosPosition(320, 442, 0.5, 0.5)`
  - Button 2: `cocosPosition(320, 332, 0.5, 0.5)`
  - Button 3: `cocosPosition(320, 222, 0.5, 0.5)`

### Step 4: Update Bottom Icon Buttons
- Replace flexbox layout with absolute positioning
- Use position utility:
  - Medal: `cocosPosition(248, 106, 0.5, 0.5)`
  - Achievement: `cocosPosition(392, 106, 0.5, 0.5)`

### Step 5: Update Settings Button
- Verify current positioning matches converted coordinates
- Use: `cocosPosition(549, 1045, 0.5, 0.5)` or `right: 91px` with transform

### Step 6: Update Version Text
- Convert from `bottom: '20px'` to proper conversion
- Use: `cocosPosition(320, 20, 0.5, 0.5)`

### Step 7: Visual Comparison
- Open original game in browser
- Open React port in browser
- Side-by-side comparison of all elements
- Measure pixel differences if any

## Expected Issues and Solutions

### Issue 1: Logo Position Incorrect
- **Problem**: Currently using `top: '938px'` which is Cocos coordinate, not CSS
- **Solution**: Convert to CSS: `top: '198px'` (1136 - 938)

### Issue 2: Main Buttons Using Flexbox
- **Problem**: Flexbox centering may not match exact pixel positions
- **Solution**: Use absolute positioning with converted coordinates

### Issue 3: Bottom Icons Using Flexbox
- **Problem**: Gap-based spacing may not match exact pixel positions
- **Solution**: Use absolute positioning with converted coordinates

### Issue 4: Anchor Point Handling
- **Problem**: CSS transforms may not account for anchor points correctly
- **Solution**: Use `cocosToCssPosition` utility which handles anchors

### Issue 5: Button Sizes
- **Problem**: Button sizes may not match original
- **Solution**: Verify button sprite dimensions match original (242×74px)

## Testing Checklist

- [ ] Visual comparison with original game (screenshot overlay)
- [ ] Measure pixel positions of all elements
- [ ] Verify button click areas match original
- [ ] Test on different screen sizes (if responsive)
- [ ] Verify Christmas background appears in December
- [ ] Test all button click handlers
- [ ] Verify audio plays correctly
- [ ] Check z-index/layering matches original

## Notes

1. **Coordinate System**: Original uses Cocos2d-JS (bottom-left origin), React uses CSS (top-left origin)
2. **Anchor Points**: Default anchor in Cocos is (0.5, 0.5) for centered elements
3. **Button Spacing**: Original uses exact pixel offsets, not flexbox gaps
4. **Screen Fix**: Original applies 0.83 scale when `Record.getScreenFix() == 1`, may need to handle this
5. **Missing Features**: Contact and Rate buttons (MOD_VARIANT == 1) are not in current port

## Success Criteria

- All elements positioned within 1-2 pixels of original
- Button click areas match original
- Visual appearance matches original game
- All functionality works as expected
- Code uses proper position conversion utilities

