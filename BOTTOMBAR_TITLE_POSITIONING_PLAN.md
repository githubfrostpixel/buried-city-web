# BottomBar Title Positioning Plan

## Overview
Modify the `BottomBar` component to position the title differently based on whether subtext exists:
- **With subtext**: Title positioned close to the left button
- **Without subtext**: Title centered (matching original game behavior)

## Current Behavior
- Title is always positioned after the left button area at `titleX + 30px`
- `titleX` is calculated as: `actionBar.leftButtonX + leftBtnWidth / 2 + 10`
- This places the title to the right of the left button, regardless of subtext presence

## Original Game Behavior
- Title is always centered at `bgRect.width / 2` (line 392 in `bottomFrame.js`)
- However, the user wants conditional positioning based on subtext

## Proposed Changes

### 1. Conditional Title Positioning Logic
- Check if subtext exists: `const hasSubtext = !!(leftSubtext || rightSubtext)`
- If `hasSubtext` is true:
  - Position title close to left button (similar to current behavior)
  - Calculate position: `actionBar.leftButtonX + actionBar.buttonWidth + [small gap, e.g., 10-15px]`
- If `hasSubtext` is false:
  - Center the title horizontally
  - Use: `left: '50%'` with `transform: 'translateX(-50%)'` (or `left: ${bgWidth / 2}px` with transform)

### 2. Implementation Details

**File to modify**: `src/components/layout/BottomBar.tsx`

**Changes needed**:
1. Replace the current `titleX` calculation (line 59) with conditional logic
2. Update the title div styling (lines 119-135) to use conditional positioning
3. When centered, ensure the title doesn't overlap with buttons (may need to adjust if buttons are visible)

**Positioning calculations**:
- **With subtext**: 
  - `left: ${actionBar.leftButtonX + actionBar.buttonWidth + 15}px` (or adjust gap as needed)
  - Remove any centering transform
- **Without subtext**:
  - `left: '50%'`
  - `transform: 'translateX(-50%)'` (or combine with existing transform if any)
  - Ensure it doesn't overlap with left/right buttons when they're visible

### 3. Edge Cases to Consider
- When `leftBtn` is false but subtext exists: Title should still be positioned on the left side
- When `rightBtn` is false but subtext exists: Title positioning should not change
- When both buttons are visible and no subtext: Title should be centered between them
- When no buttons and no subtext: Title should be centered

### 4. Testing Considerations
- Test with panels that have subtext (e.g., SitePanelContent)
- Test with panels that don't have subtext (e.g., other panels)
- Test with different button combinations (left only, right only, both, neither)
- Verify title doesn't overlap with buttons or subtext

## Implementation Steps

1. Add conditional logic to determine if subtext exists
2. Calculate title position based on subtext presence
3. Update title div styling to use conditional positioning
4. Test with various panel configurations
5. Adjust spacing/gaps as needed for visual consistency

## Notes
- The original game always centers the title, but this change provides better UX when subtext is present
- The gap between left button and title when subtext exists should be visually consistent (suggest 10-15px)
- When centered, the title should respect button boundaries

