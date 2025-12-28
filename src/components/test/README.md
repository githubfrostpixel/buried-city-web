# Test Screens Documentation

## Overview

Test screens for Phase 2D.6: Polish & Testing. These screens allow manual verification of component positions, scaling, interactions, and animations.

## Accessing Test Screens

### Method 1: URL Parameter
Add `?test=true` to the URL:
```
http://localhost:5173/?test=true
```

### Method 2: LocalStorage
Open browser console and run:
```javascript
localStorage.setItem('testMode', 'true')
location.reload()
```

To exit test mode:
```javascript
localStorage.removeItem('testMode')
location.reload()
```

## Available Test Screens

### 1. TopBar Test Screen
Tests the TopBar component with:
- Position verification (background, three lines, all buttons)
- Scaling tests (screenFix toggle)
- Interaction tests (button clicks, attribute updates)
- Test data controls (game state, attributes)

**Test Cases:**
- Background Position
- Status Buttons (8 buttons)
- Attribute Buttons (8 buttons)
- Scale Factor
- Attribute Updates
- Button Clicks

### 2. BottomBar Test Screen
Tests the BottomBar component with:
- Position verification (background, action bar, line, content area)
- Panel switching
- Button visibility
- Full screen mode

**Test Cases:**
- Background Position
- Action Bar Row
- Line Separator
- Content Area
- Panel Switching
- Button Visibility

## Using Test Screens

### Position Overlay
1. Toggle "Show Position Overlay" in the test controls panel (top-right)
2. Blue boxes show actual element positions
3. Toggle "Show Expected Positions" to see green/red boxes for expected positions
4. Green = match (within 1px tolerance)
5. Red = mismatch

### Running Tests
1. Click test buttons in the test controls panel (top-left)
2. Review results in the "Test Results" section
3. Check visual appearance matches original game
4. Document any discrepancies

### Test Controls
- **Position Overlay**: Toggle visual position indicators
- **Expected Positions**: Show expected vs actual comparison
- **screenFix**: Toggle between 0 (1.0 scale) and 1 (0.87 scale)
- **Test Data**: Set different game states and attributes

## Expected Results

Each test case shows:
- **Expected**: What should happen/be displayed
- **Actual**: What actually happens/is displayed
- **Status**: Pass (✓), Fail (✗), or Pending (⏳)

## Position Reference

### TopBar Positions
- Background: `top: 18px, left: 22px` (centered)
- First Line: `top: 4px` relative to bg
- Second Line: `top: 60px` relative to bg
- Third Line: `top: 116px` relative to bg

### BottomBar Positions
- Background: `top: ${topBarBottom + 10}px` (below TopBar)
- Action Bar: `top: 1px` relative to bg
- Line: `top: 76px` relative to bg
- Content: `top: 76px` relative to bg

## Tolerance

Position accuracy tolerance: **±1px**

## Notes

- Test screens are for development/testing only
- Position overlay updates every 100ms
- Test results persist until page reload
- Use browser DevTools for detailed inspection

