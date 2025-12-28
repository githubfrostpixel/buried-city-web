# Phase 2D.6: Polish & Testing - Implementation Plan

## Overview

This document provides a detailed implementation plan for Phase 2D.6: Polish & Testing. This phase focuses on creating **test screens with test buttons** that allow manual verification of positions, scaling, interactions, and animations. The user will perform the testing and judge the results.

**Critical Requirements:**
- Create test screens for each component (TopBar, BottomBar, HomePanel)
- Add test buttons to trigger different test scenarios
- Display expected vs actual values for easy verification
- Document what to expect for each test case
- Fix any discrepancies found during testing

**Prerequisites:**
- Phase 2D.1 complete: Position utilities ✓
- Phase 2D.2 complete: Common components ✓
- Phase 2D.3 complete: Layout components (TopBar, BottomBar) ✓
- Phase 2D.4 complete: Panel components (HomePanel) ✓
- Phase 2D.5 complete: Scene integration (MainScene) ✓

---

## 1. Test Screen Infrastructure

### 1.1 Test Screen Component

**Purpose**: Create a reusable test screen wrapper with controls

**File**: `src/components/test/TestScreen.tsx`

**Features:**
- Test mode toggle (show/hide test overlays)
- Position overlay toggle (show element positions)
- Scale factor selector (test different scales)
- ScreenFix toggle (test screenFix = 0 and 1)
- Reset button (reset to default state)
- Test results display area

**Implementation:**
```typescript
interface TestScreenProps {
  title: string
  children: React.ReactNode
  onTestComplete?: (results: TestResults) => void
}

export function TestScreen({ title, children, onTestComplete }: TestScreenProps) {
  // Test controls UI
  // Position overlay
  // Scale controls
  // Results display
}
```

### 1.2 Position Overlay Component

**Purpose**: Show element positions and measurements

**File**: `src/components/test/PositionOverlay.tsx`

**Features:**
- Display element bounding boxes
- Show position coordinates (x, y)
- Show size (width, height)
- Show expected vs actual positions
- Highlight discrepancies

### 1.3 Test Data Helpers

**Purpose**: Provide test data for consistent testing

**File**: `src/test-utils/test-data.ts`

**Features:**
- Test game state (time, weather, attributes)
- Test building states (different levels)
- Test player states (different attribute values)
- Test scenarios (low HP, high hunger, etc.)

---

## 2. TopBar Test Screen

### 2.1 Test Screen Component

**File**: `src/components/test/TopBarTestScreen.tsx`

**Purpose**: Test TopBar component with all test scenarios

**Test Controls:**
- [ ] Toggle position overlay (show/hide element positions)
- [ ] Toggle scale factor (0.87 / 1.0 for screenFix)
- [ ] Change time (hour/minute)
- [ ] Change day
- [ ] Change season
- [ ] Change weather
- [ ] Change temperature
- [ ] Change currency
- [ ] Change fuel
- [ ] Change attributes (HP, hunger, etc.)
- [ ] Toggle work site active
- [ ] Toggle gas site active
- [ ] Add test log messages
- [ ] Toggle dog active

**Expected Results Display:**
- Show expected positions for each element
- Show actual positions (from DOM)
- Highlight discrepancies (>1px difference)
- Show scale factors applied

### 2.2 Test Cases

**Test Case 1: TopBar Background Position**
- **Test Button**: "Test Background Position"
- **Expected**: 
  - Position: `top: 18px, left: 50%, transform: translateX(-50%)`
  - Size: `width: 596px, height: 244px` (or scaled)
- **What to Check**: Background is positioned at top, centered horizontally

**Test Case 2: First Line Status Buttons**
- **Test Button**: "Test Status Buttons"
- **Expected Positions** (relative to first line container, y=25):
  - Day: `x: ~106px`
  - Season: `x: ~121px`
  - Time: `x: ~200px`
  - Weather: `x: ~288px`
  - Temperature: `x: ~345px`
  - Electric: `x: ~394px`
  - Currency: `x: ~474px`
  - Fuel: `x: ~555px`
- **What to Check**: All buttons aligned horizontally, evenly spaced

**Test Case 3: Second Line Attribute Buttons**
- **Test Button**: "Test Attribute Buttons"
- **Expected Positions** (relative to second line container, y=25):
  - Injury: `x: 36.5px`
  - Infect: `x: 109.5px`
  - Starve: `x: 182.5px`
  - Vigour: `x: 255.5px`
  - Spirit: `x: 328.5px`
  - Water: `x: 401.5px`
  - Virus: `x: 474.5px`
  - HP: `x: 547.5px`
- **What to Check**: All buttons evenly spaced (584/16 intervals)

**Test Case 4: Third Line (Log Bar)**
- **Test Button**: "Test Log Bar"
- **Expected**: 
  - Position: `left: 6px, top: 116px` (relative to bg)
  - Size: `width: 584px, height: 122px`
  - Talent button: `right: 20px, top: 20px`
  - Dog button: `right: 18px, bottom: 22px`
- **What to Check**: Log area displays messages, buttons positioned correctly

**Test Case 5: Scale Factor (screenFix)**
- **Test Button**: "Toggle screenFix (0.87 scale)"
- **Expected**:
  - screenFix = 0: `scale(1.0)`, `top: 18px`
  - screenFix = 1: `scale(0.87)`, `top: 90px`
- **What to Check**: Background scales correctly, position adjusts

**Test Case 6: Attribute Updates**
- **Test Button**: "Test Attribute Updates"
- **Expected**: Attribute bars update when values change
- **What to Check**: Progress bars reflect current values, warning states show correctly

**Test Case 7: Button Clicks**
- **Test Button**: "Test All Button Clicks"
- **Expected**: All buttons are clickable, show console logs or dialogs
- **What to Check**: No buttons are blocked, all respond to clicks

---

## 3. BottomBar Test Screen

### 3.1 Test Screen Component

**File**: `src/components/test/BottomBarTestScreen.tsx`

**Purpose**: Test BottomBar component with all test scenarios

**Test Controls:**
- [ ] Toggle position overlay
- [ ] Toggle screenFix (0.87 / 1.0)
- [ ] Toggle left button visibility
- [ ] Toggle right button visibility
- [ ] Change panel title
- [ ] Switch panels (home, build, storage, radio)
- [ ] Toggle fullScreen mode

**Expected Results Display:**
- Show expected positions for each element
- Show actual positions (from DOM)
- Highlight discrepancies

### 3.2 Test Cases

**Test Case 1: BottomBar Background Position**
- **Test Button**: "Test Background Position"
- **Expected**: 
  - Position: `top: ${topBarBottom + 10}px` (below TopBar + 10px gap)
  - Size: `width: 596px, height: 834px` (or scaled)
  - Centered horizontally
- **What to Check**: Background positioned correctly below TopBar

**Test Case 2: Action Bar Row**
- **Test Button**: "Test Action Bar Row"
- **Expected**: 
  - Position: `top: 1px`
  - Left button: `left: 15px, top: 5px`
  - Right button: `right: 10px, top: 5px`
  - Title: `left: 50%, top: 5px` (centered)
- **What to Check**: All elements in action bar row positioned correctly

**Test Case 3: Line Separator**
- **Test Button**: "Test Line Separator"
- **Expected**: 
  - Position: `top: 76px` (below action bar)
  - Centered horizontally
- **What to Check**: Line separator positioned correctly

**Test Case 4: Content Area**
- **Test Button**: "Test Content Area"
- **Expected**: 
  - Position: `top: 76px` (below line)
  - Size: fills remaining space
- **What to Check**: Content area positioned correctly, no overflow

**Test Case 5: Panel Switching**
- **Test Button**: "Test Panel Switching"
- **Expected**: 
  - Home panel: `fullScreen: true` (hides action bar and line)
  - Other panels: `fullScreen: false` (shows action bar and line)
  - Title updates correctly
  - Back button shows/hides correctly
- **What to Check**: Panel switching works, UI updates correctly

**Test Case 6: Button Visibility**
- **Test Button**: "Test Button Visibility"
- **Expected**: 
  - Left button shows when `leftBtn: true`
  - Right button shows when `rightBtn: true`
  - Buttons hide when `false`
- **What to Check**: Button visibility toggles work

---

## 4. HomePanel Test Screen

### 4.1 Test Screen Component

**File**: `src/components/test/HomePanelTestScreen.tsx`

**Purpose**: Test HomePanel component with all test scenarios

**Test Controls:**
- [ ] Toggle position overlay (show building positions)
- [ ] Set building level (0, 1, 2, or -1 for inactive)
- [ ] Set all buildings to level 0
- [ ] Set all buildings to level 1
- [ ] Set all buildings to level 2
- [ ] Set random building levels
- [ ] Toggle gate light effect
- [ ] Toggle dog active state
- [ ] Toggle bomb active state
- [ ] Show warning states
- [ ] Reset to default state

**Expected Results Display:**
- Show expected positions for all 21 buildings
- Show actual positions (from DOM)
- Highlight discrepancies
- Show building states (active/inactive)
- Show gate light position and transform

### 4.2 Test Cases

**Test Case 1: All Building Positions**
- **Test Button**: "Test All Building Positions"
- **Expected**: All 21 buildings at correct positions (see reference table)
- **What to Check**: Each building is at its correct position relative to home_bg

**Test Case 2: Building States (Active/Inactive)**
- **Test Button**: "Test Building States"
- **Expected**: 
  - Level >= 0: Bright (no filter)
  - Level < 0: Dimmed (brightness(0.3))
- **What to Check**: Visual state matches building level

**Test Case 3: Building Levels**
- **Test Button**: "Test Building Levels"
- **Expected**: 
  - Level 0: `icon_start_build_{bid}_0.png`
  - Level 1: `icon_start_build_{bid}_1.png`
  - Level 2: `icon_start_build_{bid}_2.png`
- **What to Check**: Correct sprite frame for each level

**Test Case 4: Gate Light Effect**
- **Test Button**: "Test Gate Light Effect"
- **Expected**: 
  - Position: `left: 50%, top: 50%` (centered on gate button)
  - Transform: `translate(-47%, -55%) scale(2.35)`
  - Animation: `gateLightFade 4s infinite`
  - Only visible when building 14 level >= 0
- **What to Check**: Light effect positioned correctly, animates smoothly

**Test Case 5: Warning Icons**
- **Test Button**: "Test Warning Icons"
- **Expected**: Warning icons appear when `building.needWarn()` returns true
- **What to Check**: Warning icons show/hide correctly based on building state

**Test Case 6: Building Clicks**
- **Test Button**: "Test Building Clicks"
- **Expected**: 
  - Building 13: Opens storage panel
  - Building 14: Opens gate panel (if level >= 0)
  - Building 15: Opens radio panel
  - All others: Open build panel
- **What to Check**: All buildings are clickable, navigation works

**Test Case 7: Special Building States**
- **Test Button**: "Test Special Building States"
- **Expected**: 
  - Building 12 (Dog house): Active only if dog is active AND level >= 0
  - Building 17 (Safe/Bomb): Active based on `player.isBombActive`
- **What to Check**: Special building states work correctly

---

## 5. MainScene Test Screen

### 5.1 Test Screen Component

**File**: `src/components/test/MainSceneTestScreen.tsx`

**Purpose**: Test MainScene integration with all components

**Test Controls:**
- [ ] Toggle position overlay
- [ ] Switch panels (home, build, storage, radio)
- [ ] Toggle screenFix
- [ ] Test back button navigation
- [ ] Test panel titles
- [ ] Test button visibility

### 5.2 Test Cases

**Test Case 1: Scene Layout**
- **Test Button**: "Test Scene Layout"
- **Expected**: 
  - TopBar at top
  - BottomBar below TopBar
  - No overlap
  - Screen size: 640x1136
- **What to Check**: Layout is correct, no overflow

**Test Case 2: Panel Integration**
- **Test Button**: "Test Panel Integration"
- **Expected**: 
  - HomePanel displays in BottomBar
  - Panel switching works
  - Panel titles update
- **What to Check**: All panels integrate correctly

**Test Case 3: Navigation**
- **Test Button**: "Test Navigation"
- **Expected**: 
  - Back button works
  - Panel switching works
  - Navigation state persists
- **What to Check**: Navigation flows correctly

---

## 6. Comprehensive Test Screen

### 6.1 Master Test Screen

**File**: `src/components/test/ComprehensiveTestScreen.tsx`

**Purpose**: Single screen with all test scenarios and controls

**Features:**
- Tabbed interface for different test categories
- Position overlay toggle
- Scale factor controls
- Test data controls
- Expected vs actual display
- Test results logging
- Screenshot capture helper

**Test Categories:**
1. **Position Tests**: All position verification tests
2. **Scaling Tests**: All scaling verification tests
3. **Interaction Tests**: All interaction tests
4. **Animation Tests**: All animation tests
5. **Visual Tests**: Visual comparison helpers

### 6.2 Test Results Display

**Component**: `src/components/test/TestResults.tsx`

**Features:**
- Display test results in table format
- Show expected vs actual values
- Highlight discrepancies
- Export results to JSON
- Mark tests as passed/failed

---

## 7. Test Cases Summary

### 7.1 Position Test Cases

| Test Case | Component | Element | Expected Position | Tolerance |
|-----------|-----------|---------|-------------------|-----------|
| TopBar Background | TopBar | Background | `top: 18px, left: 50%` | ±1px |
| TopBar First Line | TopBar | First Line | `top: 4px, left: 6px` | ±1px |
| TopBar Second Line | TopBar | Second Line | `top: 60px, left: 6px` | ±1px |
| TopBar Third Line | TopBar | Third Line | `top: 116px, left: 6px` | ±1px |
| Status Buttons | TopBar | 8 buttons | Various X positions, y: 25 | ±1px |
| Attribute Buttons | TopBar | 8 buttons | 584/16 intervals, y: 25 | ±1px |
| BottomBar Background | BottomBar | Background | `top: ${calculated}px` | ±1px |
| BottomBar Action Bar | BottomBar | Action Bar | `top: 1px` | ±1px |
| BottomBar Line | BottomBar | Line | `top: 76px` | ±1px |
| BottomBar Content | BottomBar | Content | `top: 76px` | ±1px |
| Building Positions | HomePanel | 21 buildings | See reference table | ±1px |
| Gate Light | HomePanel | Gate Light | `left: 50%, top: 50%` | ±2px |

### 7.2 Scaling Test Cases

| Test Case | Component | Scale Factor | Expected |
|-----------|-----------|--------------|----------|
| screenFix = 0 | TopBar/BottomBar | 1.0 | Normal size |
| screenFix = 1 | TopBar/BottomBar | 0.87 | Scaled down |
| Status Buttons | TopBar | 0.4 | Small icons |
| Currency Button | TopBar | 0.5 | Medium icon |
| Electric Button | TopBar | 0.6 | Larger icon |
| Fuel Button | TopBar | 1.0 | Full size |
| Attribute Buttons | TopBar | 0.5 | Medium icons |
| HP Button | TopBar | 1.0 | Full size |
| Talent Button | TopBar | 0.7 | Medium icon |
| Dog Button | TopBar | 0.7 | Medium icon |
| Building Buttons | HomePanel | 1.0 | Full size |
| Gate Light | HomePanel | 2.35 | Scaled up |

### 7.3 Interaction Test Cases

| Test Case | Component | Action | Expected Result |
|-----------|-----------|--------|-----------------|
| Status Button Clicks | TopBar | Click any status button | Console log or dialog |
| Attribute Button Clicks | TopBar | Click any attribute button | Console log or dialog |
| Talent Button Click | TopBar | Click talent button | Console log |
| Dog Button Click | TopBar | Click dog button | Console log or navigate |
| Back Button Click | BottomBar | Click back button | Navigate to previous panel |
| Forward Button Click | BottomBar | Click forward button | Navigate to next panel |
| Building Clicks | HomePanel | Click any building | Navigate to appropriate panel |
| Panel Switching | MainScene | Switch panels | Panel updates, title updates |

### 7.4 Animation Test Cases

| Test Case | Component | Animation | Expected |
|-----------|-----------|-----------|----------|
| Gate Light Fade | HomePanel | `gateLightFade 4s infinite` | Smooth fade in/out |
| Attribute Updates | TopBar | Value changes | Smooth progress bar updates |

---

## 8. Implementation Order

### Phase 2D.6.1: Test Infrastructure (Priority: High)
1. Create `TestScreen.tsx` wrapper component
2. Create `PositionOverlay.tsx` component
3. Create test data helpers (`test-data.ts`)
4. Create test utilities

### Phase 2D.6.2: TopBar Test Screen (Priority: High)
5. Create `TopBarTestScreen.tsx`
6. Add test controls
7. Add position overlay
8. Add expected results display
9. Add test buttons for each test case

### Phase 2D.6.3: BottomBar Test Screen (Priority: High)
10. Create `BottomBarTestScreen.tsx`
11. Add test controls
12. Add position overlay
13. Add test buttons for each test case

### Phase 2D.6.4: HomePanel Test Screen (Priority: High)
14. Create `HomePanelTestScreen.tsx`
15. Add test controls
16. Add position overlay
17. Add building state controls
18. Add test buttons for each test case

### Phase 2D.6.5: MainScene Test Screen (Priority: Medium)
19. Create `MainSceneTestScreen.tsx`
20. Add integration test controls
21. Add test buttons for each test case

### Phase 2D.6.6: Comprehensive Test Screen (Priority: Medium)
22. Create `ComprehensiveTestScreen.tsx`
23. Add tabbed interface
24. Integrate all test screens
25. Add test results display

### Phase 2D.6.7: Test Results Component (Priority: Medium)
26. Create `TestResults.tsx`
27. Add results table
28. Add discrepancy highlighting
29. Add export functionality

### Phase 2D.6.8: Integration with App (Priority: High)
30. Add test screen route to App.tsx
31. Add navigation to test screens
32. Test all test screens work
33. Document how to use test screens

---

## 9. Expected Results Documentation

### 9.1 What to Expect for Each Test

For each test case, the test screen will display:
- **Expected Value**: The reference value from the plan
- **Actual Value**: The measured value from the DOM
- **Difference**: The difference between expected and actual
- **Status**: Pass (within tolerance) or Fail (outside tolerance)

### 9.2 Visual Verification

For visual tests, the test screen will:
- Show the component with position overlay
- Highlight elements being tested
- Show expected positions as guidelines
- Allow screenshot capture for comparison

### 9.3 Interaction Verification

For interaction tests, the test screen will:
- Log all interactions to console
- Show interaction results in test results panel
- Allow replay of interactions
- Verify expected behaviors

---

## 10. User Testing Guide

### 10.1 How to Use Test Screens

1. Navigate to test screen (route to be added)
2. Select test category (Position, Scaling, Interaction, Animation)
3. Click test buttons to run tests
4. Review expected vs actual results
5. Check visual appearance
6. Document any discrepancies
7. Report findings

### 10.2 What to Look For

**Position Tests:**
- Elements are at correct positions
- No overlap or gaps
- Alignment is correct
- Parent-child relationships are correct

**Scaling Tests:**
- Scale factors are correct
- Visual appearance matches expected
- No distortion
- Responsive scaling works

**Interaction Tests:**
- All buttons are clickable
- Navigation works correctly
- State updates reflect in UI
- No blocking or interference

**Animation Tests:**
- Animations play correctly
- Timing matches specification
- Smooth performance (60fps)
- No jank or stuttering

---

## 11. Success Criteria

### 11.1 Test Screen Completeness
- [ ] All test screens created
- [ ] All test buttons implemented
- [ ] All expected results documented
- [ ] Position overlay works
- [ ] Test results display works

### 11.2 Test Coverage
- [ ] All TopBar positions tested
- [ ] All BottomBar positions tested
- [ ] All HomePanel positions tested
- [ ] All scaling factors tested
- [ ] All interactions tested
- [ ] All animations tested

---

## 12. Estimated Time

- Test Infrastructure: 4-6 hours
- TopBar Test Screen: 3-4 hours
- BottomBar Test Screen: 2-3 hours
- HomePanel Test Screen: 4-5 hours
- MainScene Test Screen: 2-3 hours
- Comprehensive Test Screen: 3-4 hours
- Test Results Component: 2-3 hours
- Integration: 2-3 hours

**Total: ~22-31 hours**

---

## 13. Notes

1. **Test Screens**: Test screens are for development/testing only, not for production
2. **Position Overlay**: Position overlay can be toggled on/off for visual verification
3. **Expected Results**: All expected results are documented in the test cases
4. **User Testing**: User will perform manual testing and judge results
5. **Discrepancies**: Any discrepancies found should be documented and fixed

---

## 14. Next Steps

1. Review and approve this plan
2. Switch to ACT mode
3. Implement test screens in order
4. User performs testing
5. Fix discrepancies found
6. Mark Phase 2D.6 as complete

---

**End of Phase 2D.6 Implementation Plan**

**Reference Positions** (from PHASE_2D_IMPLEMENTATION_PLAN.md):

| Element | Cocos X | Cocos Y | CSS X | CSS Y | Notes |
|---------|---------|---------|-------|-------|-------|
| Background | 320 | 1118 | 50% | 18px | anchor: 0.5, 1 |
| First Line | 6 | 190 | 6px | 4px | 584x50, relative to bg |
| Second Line | 6 | 134 | 6px | 60px | 584x50, relative to bg |
| Third Line | 6 | 6 | 6px | 116px | 584x122, relative to bg |

**Status Button Positions** (First Line, relative to first line container):
- Day: `x: btnSize.width * 0.4 + 7.3, y: 25`
- Season: `x: btnSize.width * 1.2 + 4.8, y: 25`
- Time: `x: btnSize.width * 2 + 5.5, y: 25`
- Weather: `x: btnSize.width * 2.9 - 3, y: 25`
- Temperature: `x: btnSize.width * 3.5 - 4, y: 25`
- Electric: `x: btnSize.width * 4 + 4.5, y: 25`
- Currency: `x: btnSize.width * 5 - 12.5, y: 25`
- Fuel: `x: btnSize.width * 5.7 - 0.4, y: 25`

**Attribute Button Positions** (Second Line, relative to second line container):
- Injury: `x: 584 / 16 * 1, y: 25`
- Infect: `x: 584 / 16 * 3, y: 25`
- Starve: `x: 584 / 16 * 5, y: 25`
- Vigour: `x: 584 / 16 * 7, y: 25`
- Spirit: `x: 584 / 16 * 9, y: 25`
- Water: `x: 584 / 16 * 11, y: 25`
- Virus: `x: 584 / 16 * 13, y: 25`
- HP: `x: 584 / 16 * 15, y: 25`

**Talent & Dog Button Positions** (Third Line, relative to third line container):
- Talent: `right: 20px, top: 20px`
- Dog: `right: 18px, bottom: 22px`

**Verification Steps:**
1. Create test page with TopBar component
2. Use browser DevTools to inspect element positions
3. Compare with reference positions
4. Document any discrepancies
5. Fix discrepancies if found

**Tolerance**: ±1px for pixel-perfect positioning

### 2.2 BottomBar Position Verification

**Reference Positions** (from COCOS_TO_CSS_POSITION_MAPPING.md):

| Element | Position | Notes |
|---------|----------|-------|
| Background | `top: ${bottomBarTop}px` | Below TopBar + 10px gap |
| Action Bar Row | `top: 1px` | At top of bottom bar |
| Line Separator | `top: 76px` | Below action bar |
| Content Area | `top: 76px` | Below line separator |
| Left Button | `left: 15px, top: 5px` | In action bar row |
| Right Button | `right: 10px, top: 5px` | In action bar row |
| Title | `left: 50%, top: 5px` | Centered in action bar row |

**Verification Steps:**
1. Create test page with BottomBar component
2. Verify background positioning relative to TopBar
3. Verify action bar row positioning
4. Verify line separator positioning
5. Verify content area positioning
6. Verify button positions
7. Document any discrepancies

### 2.3 HomePanel Position Verification

**Reference Positions** (from PHASE_2D_IMPLEMENTATION_PLAN.md):

| Building ID | Cocos X | Cocos Y | CSS X | CSS Y |
|------------|---------|---------|-------|-------|
| 1 | 65 | 230 | 65px | bottom: 230px |
| 2 | 425 | 780 | 425px | bottom: 780px |
| 3 | 545 | 268 | 545px | bottom: 268px |
| 4 | 477 | 562 | 477px | bottom: 562px |
| 5 | 310 | 330 | 310px | bottom: 330px |
| 6 | 75 | 390 | 75px | bottom: 390px |
| 7 | 250 | 630 | 250px | bottom: 630px |
| 8 | 84 | 780 | 84px | bottom: 780px |
| 9 | 75 | 590 | 75px | bottom: 590px |
| 10 | 480 | 410 | 480px | bottom: 410px |
| 11 | 436 | 85 | 436px | bottom: 85px |
| 12 | 335 | 125 | 335px | bottom: 125px |
| 13 | 124 | 49 | 124px | bottom: 49px |
| 14 | 425 | 216 | 425px | bottom: 216px |
| 15 | 408 | 677 | 408px | bottom: 677px |
| 16 | 203 | 290 | 203px | bottom: 290px |
| 17 | 416 | 108 | 416px | bottom: 108px |
| 18 | 205 | 165 | 205px | bottom: 165px |
| 19 | 436 | 85 | 436px | bottom: 85px |
| 20 | 196 | 780 | 196px | bottom: 780px |
| 21 | 525 | 674 | 525px | bottom: 674px |

**Gate Light Position** (Building 14):
- Position: `left: 50%, top: 50%` (centered on gate button)
- Transform: `translate(-47%, -55%) scale(2.35)`

**Verification Steps:**
1. Create test page with HomePanel component
2. Verify all building positions match reference
3. Verify gate light effect position and transform
4. Test with different building levels (0, 1, 2)
5. Test with inactive buildings (level < 0)
6. Document any discrepancies

### 2.4 Position Verification Checklist

**TopBar:**
- [ ] Background positioned correctly (top: 18px, centered)
- [ ] First line positioned correctly (top: 4px relative to bg)
- [ ] Second line positioned correctly (top: 60px relative to bg)
- [ ] Third line positioned correctly (top: 116px relative to bg)
- [ ] All status buttons positioned correctly
- [ ] All attribute buttons positioned correctly
- [ ] Talent button positioned correctly
- [ ] Dog button positioned correctly

**BottomBar:**
- [ ] Background positioned correctly (below TopBar)
- [ ] Action bar row positioned correctly
- [ ] Line separator positioned correctly
- [ ] Content area positioned correctly
- [ ] Left button positioned correctly
- [ ] Right button positioned correctly
- [ ] Title centered correctly

**HomePanel:**
- [ ] All 21 buildings positioned correctly
- [ ] Gate light effect positioned correctly
- [ ] Building sprites display correctly
- [ ] Warning icons positioned correctly (if applicable)

---

## 3. Scaling Verification

### 3.1 ScreenFix Scaling

**Test Cases:**
1. `screenFix = 0` (normal scale)
   - TopBar background: `scale(1.0)`
   - BottomBar background: `scale(1.0)`
   - TopBar position: `top: 18px`
   - BottomBar position: `top: ${topBarBottom + 10}px`

2. `screenFix = 1` (scaled down)
   - TopBar background: `scale(0.87)`
   - BottomBar background: `scale(0.87)`
   - TopBar position: `top: 90px` (adjusted)
   - BottomBar position: `top: ${adjusted}`

**Verification Steps:**
1. Create test page with `screenFix = 0`
2. Capture screenshot
3. Create test page with `screenFix = 1`
4. Capture screenshot
5. Compare scaling factors
6. Verify positions adjust correctly
7. Document any discrepancies

### 3.2 Component Scale Factors

**Reference Scale Factors:**
- Status buttons (day, season, time, weather, temperature): `0.4`
- Currency button: `0.5`
- Electric button: `0.6`
- Fuel button: `1.0` (full size)
- Attribute buttons: `0.5` (except HP which is `1.0`)
- Talent button: `0.7`
- Dog button: `0.7`
- Building buttons: `1.0` (full size)

**Verification Steps:**
1. Inspect each component's scale transform
2. Compare with reference scale factors
3. Verify visual appearance matches original
4. Document any discrepancies

### 3.3 Responsive Scaling

**Test Viewports:**
- 640x1136 (base resolution)
- 320x568 (half size)
- 1280x2272 (double size)
- Various mobile viewports

**Verification Steps:**
1. Test on different viewport sizes
2. Verify components scale appropriately
3. Verify positions remain correct
4. Verify no overflow issues
5. Document any issues

---

## 4. Interaction Testing

### 4.1 TopBar Interactions

**Status Button Clicks:**
- [ ] Day button opens status dialog (placeholder for now)
- [ ] Season button opens status dialog
- [ ] Time button opens status dialog
- [ ] Weather button opens status dialog
- [ ] Temperature button opens status dialog
- [ ] Electric button opens status dialog
- [ ] Currency button opens status dialog
- [ ] Fuel button opens status dialog

**Attribute Button Clicks:**
- [ ] Injury button opens attribute dialog
- [ ] Infect button opens attribute dialog
- [ ] Starve button opens attribute dialog
- [ ] Vigour button opens attribute dialog
- [ ] Spirit button opens attribute dialog
- [ ] Water button opens attribute dialog
- [ ] Virus button opens attribute dialog
- [ ] HP button opens attribute dialog

**Other Interactions:**
- [ ] Talent button navigates to talent selection (placeholder)
- [ ] Dog button navigates to dog panel (placeholder)
- [ ] Log bar expands on click (if implemented)

### 4.2 BottomBar Interactions

**Button Clicks:**
- [ ] Left button (back) navigates correctly
- [ ] Right button (forward) navigates correctly (if shown)
- [ ] Buttons show/hide based on panel state

**Panel Navigation:**
- [ ] Home panel displays correctly
- [ ] Build panel displays correctly (when implemented)
- [ ] Storage panel displays correctly (when implemented)
- [ ] Radio panel displays correctly (when implemented)
- [ ] Panel titles update correctly
- [ ] Back button appears/disappears correctly

### 4.3 HomePanel Interactions

**Building Clicks:**
- [ ] Building 1 (Workbench) opens build panel
- [ ] Building 2 (Chemical bench) opens build panel
- [ ] Building 3 (Medical bench) opens build panel
- [ ] Building 4 (Stove) opens build panel
- [ ] Building 5 (Fireplace) opens build panel
- [ ] Building 6 (Water purifier) opens build panel
- [ ] Building 7 (Hare trap) opens build panel
- [ ] Building 8 (Garden) opens build panel
- [ ] Building 9 (Bed) opens build panel
- [ ] Building 10 (Storage shelf) opens build panel
- [ ] Building 11 (Fence) opens build panel
- [ ] Building 12 (Dog house) opens build panel
- [ ] Building 13 (Storeroom) opens storage panel
- [ ] Building 14 (Gate) opens gate panel (if implemented)
- [ ] Building 15 (Radio) opens radio panel
- [ ] Building 16 (Minefield) opens build panel
- [ ] Building 17 (Safe) opens build panel
- [ ] Building 18 (Electric stove) opens build panel
- [ ] Building 19 (Electric fence) opens build panel
- [ ] Building 20 (Fridge) opens build panel
- [ ] Building 21 (Toilet) opens build panel

**Building States:**
- [ ] Inactive buildings (level < 0) are dimmed
- [ ] Active buildings (level >= 0) are bright
- [ ] Warning icons appear when needed
- [ ] Building sprites update with level changes

### 4.4 Interaction Testing Checklist

**General:**
- [ ] All buttons are clickable
- [ ] All buttons have correct cursor (pointer/default)
- [ ] No buttons block other interactions
- [ ] Panel navigation works correctly
- [ ] State updates reflect in UI immediately

---

## 5. Animation Testing

### 5.1 Gate Light Animation

**Animation Specification:**
- Animation name: `gateLightFade`
- Duration: `4s`
- Iteration: `infinite`
- Keyframes:
  - `0%, 100%`: `opacity: 1`
  - `50%`: `opacity: 0`

**Verification Steps:**
1. Verify animation is defined in `src/index.css`
2. Verify animation is applied to gate light element
3. Verify animation plays continuously
4. Verify animation timing matches specification
5. Verify animation is smooth (no jank)
6. Document any discrepancies

### 5.2 Attribute Bar Animations

**Animation Requirements:**
- Attribute bars should update smoothly when values change
- No flickering or jumping
- Progress bar clipping should be smooth

**Verification Steps:**
1. Change attribute values programmatically
2. Observe attribute bar updates
3. Verify smooth transitions
4. Verify no visual glitches
5. Document any issues

### 5.3 Panel Transition Animations

**Animation Requirements:**
- Panel transitions should be smooth (if implemented)
- No layout shifts during transitions

**Verification Steps:**
1. Switch between panels
2. Observe transitions
3. Verify smooth animations
4. Document any issues

---

## 6. Visual Comparison

### 6.1 Screenshot Comparison

**Reference Screenshots Needed:**
- TopBar full view
- BottomBar full view
- HomePanel full view
- MainScene full view
- Individual component screenshots

**Comparison Process:**
1. Capture screenshots of current implementation
2. Compare with original game screenshots
3. Identify visual differences
4. Document discrepancies
5. Fix discrepancies

**Tools:**
- Browser DevTools screenshot
- Image comparison tool (pixel diff)
- Manual visual inspection

### 6.2 Visual Checklist

**TopBar:**
- [ ] Background sprite displays correctly
- [ ] All icons display correctly
- [ ] All labels display correctly
- [ ] Text is readable
- [ ] Colors match original
- [ ] Spacing matches original

**BottomBar:**
- [ ] Background sprite displays correctly
- [ ] Line separator displays correctly
- [ ] Buttons display correctly
- [ ] Title displays correctly
- [ ] Content area displays correctly

**HomePanel:**
- [ ] Background sprite displays correctly
- [ ] All building sprites display correctly
- [ ] Building states (active/inactive) are clear
- [ ] Warning icons display correctly
- [ ] Gate light effect displays correctly

---

## 7. Performance Testing

### 7.1 Rendering Performance

**Metrics to Measure:**
- Initial render time
- Re-render time on state changes
- Frame rate during interactions
- Memory usage

**Verification Steps:**
1. Use React DevTools Profiler
2. Measure component render times
3. Identify performance bottlenecks
4. Optimize if needed
5. Document findings

### 7.2 Interaction Performance

**Metrics to Measure:**
- Button click response time
- Panel switch time
- Animation frame rate

**Verification Steps:**
1. Test button clicks
2. Test panel navigation
3. Measure response times
4. Verify smooth interactions
5. Document any issues

---

## 8. Cross-Browser Testing

### 8.1 Browser Compatibility

**Browsers to Test:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

**Test Areas:**
- Position accuracy
- Scaling accuracy
- Animation performance
- Interaction responsiveness
- Visual appearance

**Verification Steps:**
1. Test on each browser
2. Document browser-specific issues
3. Fix compatibility issues
4. Document fixes

---

## 9. Fixing Discrepancies

### 9.1 Position Discrepancies

**Process:**
1. Identify position discrepancy
2. Measure actual position
3. Compare with reference position
4. Calculate correction needed
5. Apply fix
6. Verify fix
7. Document fix

**Common Issues:**
- Transform origin misalignment
- Anchor point conversion errors
- Parent container positioning
- Scale factor affecting position

### 9.2 Scaling Discrepancies

**Process:**
1. Identify scaling discrepancy
2. Measure actual scale
3. Compare with reference scale
4. Calculate correction needed
5. Apply fix
6. Verify fix
7. Document fix

**Common Issues:**
- Transform scale not applied correctly
- Scale affecting positioning
- Nested scale transforms

### 9.3 Visual Discrepancies

**Process:**
1. Identify visual discrepancy
2. Compare with original screenshot
3. Identify root cause
4. Apply fix
5. Verify fix
6. Document fix

**Common Issues:**
- Sprite atlas path incorrect
- Sprite frame name incorrect
- Color differences
- Font differences
- Spacing differences

---

## 10. Documentation Updates

### 10.1 Position Reference Updates

**Update Files:**
- `COCOS_TO_CSS_POSITION_MAPPING.md` - Add any new findings
- `PHASE_2D_IMPLEMENTATION_PLAN.md` - Update with actual positions

**Content:**
- Actual measured positions
- Any corrections made
- Notes on positioning decisions

### 10.2 Testing Documentation

**Create Files:**
- `TESTING_GUIDE.md` - Testing procedures
- `KNOWN_ISSUES.md` - Known issues and workarounds
- `VISUAL_COMPARISON_RESULTS.md` - Visual comparison results

**Content:**
- Testing procedures
- Test results
- Known issues
- Fixes applied

### 10.3 Component Documentation

**Update Files:**
- Component README files
- Inline code comments
- Type definitions

**Content:**
- Component usage
- Position specifications
- Scale factors
- Known limitations

---

## 11. Implementation Order

### Phase 2D.6.1: Testing Infrastructure (Priority: High)
1. Create visual testing tools
2. Create position verification utilities
3. Create test data fixtures
4. Set up test scenarios

### Phase 2D.6.2: Position Verification (Priority: High)
5. Verify TopBar positions
6. Verify BottomBar positions
7. Verify HomePanel positions
8. Document discrepancies

### Phase 2D.6.3: Scaling Verification (Priority: High)
9. Test screenFix scaling
10. Test component scale factors
11. Test responsive scaling
12. Document discrepancies

### Phase 2D.6.4: Interaction Testing (Priority: Medium)
13. Test TopBar interactions
14. Test BottomBar interactions
15. Test HomePanel interactions
16. Document issues

### Phase 2D.6.5: Animation Testing (Priority: Medium)
17. Test gate light animation
18. Test attribute bar animations
19. Test panel transitions
20. Document issues

### Phase 2D.6.6: Visual Comparison (Priority: Medium)
21. Capture screenshots
22. Compare with original
23. Document visual differences
24. Fix visual issues

### Phase 2D.6.7: Performance Testing (Priority: Low)
25. Measure rendering performance
26. Measure interaction performance
27. Optimize if needed
28. Document findings

### Phase 2D.6.8: Cross-Browser Testing (Priority: Medium)
29. Test on Chrome
30. Test on Firefox
31. Test on Safari
32. Test on mobile browsers
33. Fix compatibility issues

### Phase 2D.6.9: Fix Discrepancies (Priority: High)
34. Fix position discrepancies
35. Fix scaling discrepancies
36. Fix visual discrepancies
37. Verify all fixes

### Phase 2D.6.10: Documentation (Priority: Medium)
38. Update position references
39. Create testing documentation
40. Update component documentation
41. Final review

---

## 12. Success Criteria

### 12.1 Position Accuracy
- All positions match reference within ±1px tolerance
- All anchor points convert correctly
- All parent-child positioning is correct

### 12.2 Scaling Accuracy
- All scale factors match reference
- ScreenFix scaling works correctly
- Responsive scaling works correctly

### 12.3 Interaction Completeness
- All buttons are clickable
- All navigation works correctly
- All state updates reflect in UI

### 12.4 Animation Quality
- All animations play correctly
- Animation timing matches specification
- Animations are smooth (60fps)

### 12.5 Visual Fidelity
- Visual appearance matches original game
- All sprites display correctly
- All text is readable

### 12.6 Performance
- Initial render < 100ms
- Re-render < 16ms (60fps)
- Smooth interactions

### 12.7 Browser Compatibility
- Works on all target browsers
- No browser-specific issues
- Mobile browsers supported

---

## 13. Estimated Time

- Testing Infrastructure: 4-6 hours
- Position Verification: 6-8 hours
- Scaling Verification: 3-4 hours
- Interaction Testing: 4-5 hours
- Animation Testing: 2-3 hours
- Visual Comparison: 4-6 hours
- Performance Testing: 2-3 hours
- Cross-Browser Testing: 4-6 hours
- Fixing Discrepancies: 8-12 hours (variable)
- Documentation: 3-4 hours

**Total: ~40-57 hours** (highly variable based on number of discrepancies found)

---

## 14. Notes

1. **Position Tolerance**: ±1px tolerance is acceptable for pixel-perfect positioning. Any larger discrepancies should be fixed.

2. **Visual Comparison**: Manual visual comparison is acceptable if automated tools are not available. Focus on key visual elements.

3. **Performance**: Performance testing is lower priority but should be done to ensure smooth gameplay.

4. **Browser Compatibility**: Focus on modern browsers first, then test older versions if needed.

5. **Documentation**: Good documentation is essential for future maintenance and fixes.

6. **Iterative Process**: Testing and fixing is an iterative process. Multiple rounds may be needed.

7. **Original Game Reference**: Always refer to original game for reference. Screenshots or running original game can help verify correctness.

---

## 15. Next Steps

1. Review and approve this plan
2. Switch to ACT mode
3. Implement in order: Phase 2D.6.1 → Phase 2D.6.2 → ... → Phase 2D.6.10
4. Test each phase as implemented
5. Fix discrepancies as found
6. Update documentation
7. Mark Phase 2D.6 as complete

---

## 16. Dependencies

### Blockers
- None - All prerequisites are complete ✓

### Dependencies
- All Phase 2D components implemented ✓
- Position utilities implemented ✓
- Scaling utilities implemented ✓
- Test scenes available ✓
- Original game for reference (external)

---

## 17. Risk Assessment

### High Risk
- **Position discrepancies**: May require significant debugging and fixes
- **Visual differences**: May require asset or styling adjustments

### Medium Risk
- **Performance issues**: May require optimization
- **Browser compatibility**: May require browser-specific fixes

### Low Risk
- **Animation issues**: Usually easy to fix
- **Interaction issues**: Usually easy to fix

---

## 18. Testing Tools & Resources

### Recommended Tools
- Browser DevTools (Chrome/Firefox)
- React DevTools
- Screenshot tools (browser built-in or extensions)
- Image comparison tools (online or local)
- Performance profilers (React DevTools Profiler)

### Reference Resources
- Original game screenshots
- Original game code (for reference)
- PHASE_2D_IMPLEMENTATION_PLAN.md (position references)
- COCOS_TO_CSS_POSITION_MAPPING.md (coordinate conversion guide)

---

## 19. Completion Checklist

- [ ] Testing infrastructure set up
- [ ] All positions verified
- [ ] All scaling verified
- [ ] All interactions tested
- [ ] All animations tested
- [ ] Visual comparison completed
- [ ] Performance tested
- [ ] Cross-browser tested
- [ ] All discrepancies fixed
- [ ] Documentation updated
- [ ] Final review completed
- [ ] Phase 2D.6 marked as complete

---

**End of Phase 2D.6 Implementation Plan**

