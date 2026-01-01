# Item Dialog Button UI Sprite Cross-Check Plan

## Overview
Cross-check and fix the ItemDialog button implementation to match the original game's button sprites, positioning, and appearance.

## Original Game Analysis

### Button Creation (`OriginalGame/src/ui/uiUtil.js`)
- **Function**: `uiUtil.createCommonBtnBlack(txt, target, cb)`
- **Sprite**: `btn_common_black_normal.png` (from `ui` atlas)
- **Font**: `uiUtil.fontSize.COMMON_2` (with -4px adjustment: `fontSize -= 4`)
- **Text Color**: White (`cc.color.WHITE`) for normal state, Gray for disabled
- **Button Type**: Uses `cc.ControlButton` with scale9 sprite support

### Button Positioning (`OriginalGame/src/ui/dialog.js`)
Dialog action node dimensions and button positions:

```javascript
// Action node setup
this.actionNode.setAnchorPoint(0.5, 1);  // Center-bottom anchor
this.actionNode.setPosition(this.bgNode.getContentSize().width / 2, 72);
this.actionNode.setContentSize(this.bgNode.getContentSize().width, 72);

// Single button (btn_1 only)
btn1.setPosition(
  this.actionNode.getContentSize().width / 2,  // Center X
  this.actionNode.getContentSize().height / 2  // Center Y
);

// Two buttons (btn_1 and btn_2)
btn1.setPosition(
  this.actionNode.getContentSize().width / 4,      // Left quarter
  this.actionNode.getContentSize().height / 2      // Center Y
);
btn2.setPosition(
  this.actionNode.getContentSize().width / 4 * 3,   // Right quarter
  this.actionNode.getContentSize().height / 2      // Center Y
);
```

### Button Dimensions
- **Action Node Height**: 72px
- **Button Width**: Determined by sprite size (scale9 sprite, stretches to fit text)
- **Button Height**: Determined by sprite size
- **Button Anchor**: Center (0.5, 0.5) - buttons are centered at their positions

### Button Text
- **Font Size**: `COMMON_2 - 4` = `24 - 4` = **20px**
- **Font Family**: `uiUtil.fontFamily.normal` (Arial)
- **Text Alignment**: Center
- **Text Color**: White for normal, Gray for disabled

## Current Implementation Issues

### 1. Button Sprites
- **Current**: Plain HTML `<button>` with CSS styling (`bg-gray-600`, `bg-blue-600`)
- **Should Be**: Sprite-based buttons using `btn_common_black_normal.png`
- **Atlas**: `ui`
- **Frame**: `btn_common_black_normal.png`

### 2. Button Positioning
- **Current**: Using flexbox with `justify-center` and `gap-4`
- **Should Be**: Absolute positioning matching original:
  - Single button: `left: 50%, top: 50%, transform: translate(-50%, -50%)` (centered)
  - Two buttons: 
    - btn1: `left: 25%, top: 50%, transform: translate(-50%, -50%)`
    - btn2: `left: 75%, top: 50%, transform: translate(-50%, -50%)`

### 3. Button Text
- **Current**: Hardcoded text ("Close", "Eat (10 m)", "Use (10 m)")
- **Should Be**: 
  - Get from string system (when implemented)
  - For now: Use placeholder matching original strings
  - Font size: Match `COMMON_2 - 4` (need to determine actual value)

### 4. Button Appearance
- **Current**: CSS rounded buttons with solid colors
- **Should Be**: 
  - Use `btn_common_black_normal.png` sprite
  - White text on black button
  - Scale9 sprite support (stretches to fit text width)

## Implementation Plan

### Step 1: Create DialogButton Component
**File**: `src/components/common/DialogButton.tsx`

**Features**:
- Uses `Sprite` component with `btn_common_black_normal.png`
- Supports text overlay
- Matches original button appearance
- Supports enabled/disabled states
- Positioned absolutely with center anchor

**Props**:
```typescript
interface DialogButtonProps {
  text: string
  position: { x: number; y: number }  // Position within action node (0-100% or pixels)
  onClick?: () => void
  enabled?: boolean
  className?: string
}
```

**Implementation Notes**:
- Button sprite: `atlas="ui"`, `frame="btn_common_black_normal.png"`
- Text: White color, centered, font size matching `COMMON_2 - 4`
- Position: Absolute with `left: ${x}%, top: ${y}%, transform: translate(-50%, -50%)`
- Width: Auto (sprite stretches to fit text, or fixed width if sprite is fixed-size)

### Step 2: Update ItemDialog Button Section
**File**: `src/components/overlays/ItemDialog.tsx`

**Changes**:
1. Replace HTML buttons with `DialogButton` components
2. Update positioning to match original:
   - Single button: `{ x: 50, y: 50 }` (center)
   - Two buttons: `{ x: 25, y: 50 }` and `{ x: 75, y: 50 }`
3. Update button text to match original strings:
   - btn_1: "OK" (item_1), "Back" (item_2, item_3)
   - btn_2: "Eat (10 m)" (item_2), "Use (10 m)" (item_3)
4. Remove CSS button styling

**Action Section Structure**:
```typescript
{/* Action section - 72px height */}
<div
  className="absolute"
  style={{
    left: '0',
    bottom: '0',
    width: `${dialogWidth}px`,
    height: '72px'
  }}
>
  {/* Close button (btn_1) */}
  <DialogButton
    text={dialogType === 'item_1' ? 'OK' : 'Back'}
    position={{ x: shouldShowUseButton ? 25 : 50, y: 50 }}
    onClick={handleClose}
  />
  
  {/* Use button (btn_2) - only for item_2 and item_3 */}
  {shouldShowUseButton && (
    <DialogButton
      text={dialogType === 'item_2' ? 'Eat (10 m)' : 'Use (10 m)'}
      position={{ x: 75, y: 50 }}
      onClick={handleUse}
    />
  )}
</div>
```

### Step 3: Determine Font Size
**Task**: ✅ Font size determined from original game

**Found in**: `OriginalGame/src/ui/uiUtil.js`
- `uiUtil.fontSize.COMMON_2 = 24`
- Actual font size used: `COMMON_2 - 4 = 20px`

**Implementation**: Use `fontSize: '20px'` for button text

### Step 4: Button Sprite Verification
**Task**: Verify sprite exists and check dimensions

**Check**:
- File exists: `public/assets/sprites/ui/btn_common_black_normal.png`
- Sprite dimensions (width, height)
- Whether it's a scale9 sprite (stretches) or fixed-size

**If scale9 sprite**:
- Button width should auto-size to fit text
- Use CSS to stretch sprite horizontally

**If fixed-size sprite**:
- Use fixed button width matching sprite
- Center text within button

### Step 5: Coordinate Conversion
**Task**: Ensure positioning matches original

**Original Cocos**:
- Action node: `width = dialogWidth`, `height = 72`
- Button positions: `width/4` (25%), `width/2` (50%), `width/4*3` (75%)
- Button anchor: Center (0.5, 0.5)

**CSS Equivalent**:
- Action container: `width: ${dialogWidth}px`, `height: 72px`
- Button positions: `left: 25%`, `left: 50%`, `left: 75%`
- Button transform: `translate(-50%, -50%)` (center anchor)

### Step 6: Visual Cross-Check
**Task**: Compare with original game

**Checklist**:
- [ ] Button sprite matches original appearance
- [ ] Button text color is white
- [ ] Button text size matches original
- [ ] Button positioning matches (centered for single, quarter positions for two)
- [ ] Button spacing matches original
- [ ] Button text matches original strings
- [ ] Disabled state (if needed) shows gray text

## Files to Create/Modify

### New Files
1. `src/components/common/DialogButton.tsx` - Reusable dialog button component

### Modified Files
1. `src/components/overlays/ItemDialog.tsx` - Replace HTML buttons with DialogButton

## Dependencies

### Required Sprites
- `ui/btn_common_black_normal.png` - Main button sprite (already exists)

### Required Components
- `Sprite` component (already exists)
- Text rendering (can use HTML/CSS or create text overlay component)

## Testing Checklist

1. **Single Button (item_1)**:
   - [ ] Button appears centered in action section
   - [ ] Button shows "OK" text
   - [ ] Button uses correct sprite
   - [ ] Button text is white
   - [ ] Button click closes dialog

2. **Two Buttons (item_2, item_3)**:
   - [ ] Close button at left quarter (25%)
   - [ ] Use button at right quarter (75%)
   - [ ] Close button shows "Back" text
   - [ ] Use button shows "Eat (10 m)" or "Use (10 m)"
   - [ ] Both buttons use correct sprite
   - [ ] Both buttons have white text
   - [ ] Button clicks work correctly

3. **Visual Comparison**:
   - [ ] Button appearance matches original game
   - [ ] Button positioning matches original game
   - [ ] Button text size matches original game
   - [ ] Button spacing matches original game

## Notes

1. **Scale9 Sprites**: If `btn_common_black_normal.png` is a scale9 sprite, it can stretch horizontally to fit text. In CSS, this can be achieved using `background-size` or by using a 9-slice sprite technique.

2. **Font Size**: Need to determine actual `COMMON_2` font size from original game. Common values in Cocos2d are 24px, 28px, 32px. With -4px adjustment, likely 20px or 24px.

3. **Text Overlay**: Text should be overlaid on the button sprite, centered both horizontally and vertically.

4. **Button States**: Original buttons may have pressed/disabled states. For now, focus on normal state. Can add pressed state later if needed.

5. **String System**: Button text should eventually come from string system. For now, use hardcoded strings matching original.

## Coordinate Reference

### Original Game (Cocos2d-JS)
- Action node: `width = dialogWidth`, `height = 72`
- Button positions (relative to action node):
  - Single: `(width/2, height/2)` = `(50%, 50%)`
  - Two buttons: `(width/4, height/2)` and `(width/4*3, height/2)` = `(25%, 50%)` and `(75%, 50%)`
- Button anchor: `(0.5, 0.5)` = center

### CSS Equivalent
- Action container: `width: ${dialogWidth}px`, `height: 72px`
- Button positions (using percentage):
  - Single: `left: 50%, top: 50%, transform: translate(-50%, -50%)`
  - Two buttons: 
    - btn1: `left: 25%, top: 50%, transform: translate(-50%, -50%)`
    - btn2: `left: 75%, top: 50%, transform: translate(-50%, -50%)`

