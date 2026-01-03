# Secret Room Back Button Investigation Plan

## Overview
Investigate why clicking back from secret rooms allows re-entering secret rooms, and compare with original game behavior.

## Problem Description

### Current Behavior
1. User enters secret rooms
2. User clicks back button
3. User navigates back to site panel
4. User re-enters site exploration
5. **ISSUE**: Secret room entry dialog appears again (can re-enter secret rooms)

### Expected Behavior (to be determined)
Need to check original game behavior:
- Does original game allow re-entering secret rooms after clicking back?
- Or should secret rooms be permanently closed after leaving?

## Root Cause Analysis

### Current Implementation

#### 1. Secret Room State Management
**File: `src/game/world/Site.ts`**
- `isInSecretRooms`: Boolean flag indicating if currently exploring secret rooms
- `isSecretRoomsEntryShowed`: Boolean flag indicating if secret room entry dialog should be shown
- `secretRoomsShowedCount`: Counter for how many times secret rooms have been shown

**`secretRoomsEnd()` method (line 445-449):**
```typescript
secretRoomsEnd(): void {
  this.isInSecretRooms = false
  // TODO: Integrate with achievement system
  // Medal.checkSecretRoomEnd(1)
}
```

**Issue**: `secretRoomsEnd()` only sets `isInSecretRooms = false` but does NOT clear `isSecretRoomsEntryShowed`

#### 2. Back Button Handling
**File: `src/components/scenes/MainScene.tsx`**
- `handleBackButton()` (line 99-168)
- When in `siteExplore` panel, it just navigates back to site panel
- **No special handling for secret rooms**

**File: `src/components/panels/SiteExploreContent.tsx`**
- No back button handler for secret rooms
- The back button is handled globally by `MainScene`

#### 3. View Update Logic
**File: `src/components/panels/SiteExploreContent.tsx`**
- `updateView()` (line 164-225)
- Line 199: `if (site.isSecretRoomsEntryShowed && !site.isInSecretRooms)` shows secret entry view
- **Issue**: When re-entering site, if `isSecretRoomsEntryShowed` is still true, secret entry view appears again

### Original Game Behavior

**File: `OriginalGame/src/ui/battleAndWorkNode.js`**
- `onClickLeftBtn()` (line 632-647):
  ```javascript
  onClickLeftBtn: function () {
      if (this.site.isInSecretRooms || this.site.isSecretRoomsEntryShowed) {
          var self = this;
          this.showSecretRoomLeaveWarning(function () {
              self.site.secretRoomsEnd();
              self.back();
              // ... audio handling
          });
      } else {
          this.back();
      }
  }
  ```

**File: `OriginalGame/src/game/site.js`**
- `secretRoomsEnd()` (line 79-82):
  ```javascript
  secretRoomsEnd: function () {
      this.isInSecretRooms = false;
      Medal.checkSecretRoomEnd(1);
  }
  ```

**Observation**: Original game also only sets `isInSecretRooms = false`, doesn't clear `isSecretRoomsEntryShowed`

## Investigation Tasks

### Task 1: Test Original Game Behavior
**Goal**: Understand what the original game actually does

1. Test in original game:
   - Enter a site with secret rooms
   - Discover secret rooms (entry dialog appears)
   - Enter secret rooms
   - Click back button (should show warning dialog)
   - Confirm leaving secret rooms
   - Navigate back to site panel
   - Re-enter site exploration
   - **Check**: Does secret room entry dialog appear again?

2. Test alternative scenario:
   - Enter a site with secret rooms
   - Discover secret rooms (entry dialog appears)
   - Click "Leave" on entry dialog (don't enter)
   - Navigate back to site panel
   - Re-enter site exploration
   - **Check**: Does secret room entry dialog appear again?

### Task 2: Check Secret Room Discovery Logic
**File: `src/game/world/Site.ts`**
- `testSecretRoomsBegin()` (line 387-420)
- Checks `secretRoomsShowedCount < maxCount` before showing entry
- **Question**: Once secret rooms are shown, should they be shown again?

**Investigation**:
- Check if `secretRoomsShowedCount` is incremented when entering secret rooms
- Check if `secretRoomsShowedCount` is incremented when leaving secret rooms
- Understand the intended behavior of `secretRoomsShowedCount`

### Task 3: Check Secret Room Entry Flow
**File: `src/components/panels/SiteExploreContent.tsx`**
- `handleSecretRoomLeave()` (line 442-445): Sets `isSecretRoomsEntryShowed = false`
- `handleSecretRoomEnter()` (line 447-450): Calls `site.enterSecretRooms()`

**File: `src/game/world/Site.ts`**
- `enterSecretRooms()` (line 420-423):
  ```typescript
  enterSecretRooms(): void {
    this.isInSecretRooms = true
    this.isSecretRoomsEntryShowed = false
  }
  ```

**Observation**: 
- When clicking "Leave" on entry dialog, `isSecretRoomsEntryShowed` is cleared
- When clicking "Enter", `isSecretRoomsEntryShowed` is cleared
- But when clicking back from inside secret rooms, `isSecretRoomsEntryShowed` is NOT cleared

### Task 4: Understand Intended Behavior
**Questions to answer**:
1. Should secret rooms be re-enterable after leaving?
2. Or should leaving secret rooms permanently close them?
3. What does `secretRoomsShowedCount` control?

**Possible behaviors**:
- **Option A**: Once you leave secret rooms, you can't re-enter (clear `isSecretRoomsEntryShowed` on back)
- **Option B**: You can re-enter secret rooms until `secretRoomsShowedCount >= maxCount` (current behavior)
- **Option C**: You can only enter secret rooms once per site visit (increment `secretRoomsShowedCount` on enter)

## Implementation Plan (After Investigation)

### If Original Game Allows Re-entry (Current Behavior is Correct)
**No changes needed** - current behavior matches original

### If Original Game Prevents Re-entry (Bug Fix Needed)

#### Option 1: Clear Entry Flag on Back
**File: `src/components/scenes/MainScene.tsx`**
- Add secret room detection in `handleBackButton()`
- When leaving secret rooms, call `site.secretRoomsEnd()` AND clear `isSecretRoomsEntryShowed`

**Change**:
```typescript
// In handleBackButton(), when in siteExplore panel
if (site.isInSecretRooms || site.isSecretRoomsEntryShowed) {
  // Show warning dialog (to be implemented)
  // On confirm:
  site.secretRoomsEnd()
  site.isSecretRoomsEntryShowed = false  // ADD THIS
  // Navigate back
}
```

#### Option 2: Increment Showed Count on Enter
**File: `src/game/world/Site.ts`**
- Modify `enterSecretRooms()` to increment `secretRoomsShowedCount`
- This would prevent re-entry if count exceeds max

**Change**:
```typescript
enterSecretRooms(): void {
  this.isInSecretRooms = true
  this.isSecretRoomsEntryShowed = false
  this.secretRoomsShowedCount++  // ADD THIS
}
```

#### Option 3: Add Warning Dialog (Match Original)
**File: `src/components/scenes/MainScene.tsx`**
- Implement `showSecretRoomLeaveWarning()` dialog
- Only clear flags after user confirms leaving

## Testing Plan

### Test Case 1: Back from Secret Room Entry Dialog
1. Enter site with secret rooms
2. Secret room entry dialog appears
3. Click back button (should show warning or just navigate)
4. Re-enter site exploration
5. **Expected**: Based on investigation results

### Test Case 2: Back from Inside Secret Rooms
1. Enter site with secret rooms
2. Enter secret rooms
3. Complete at least one secret room
4. Click back button (should show warning)
5. Confirm leaving
6. Re-enter site exploration
7. **Expected**: Based on investigation results

### Test Case 3: Leave Button on Entry Dialog
1. Enter site with secret rooms
2. Secret room entry dialog appears
3. Click "Leave" button
4. Re-enter site exploration
5. **Expected**: Secret room entry should NOT appear (already tested - works correctly)

## Files to Investigate

1. `OriginalGame/src/ui/battleAndWorkNode.js` - Back button handling
2. `OriginalGame/src/game/site.js` - Secret room state management
3. `src/components/scenes/MainScene.tsx` - Current back button implementation
4. `src/components/panels/SiteExploreContent.tsx` - View update logic
5. `src/game/world/Site.ts` - Secret room state and methods

## Next Steps

1. **Test original game** to understand intended behavior
2. **Document findings** - what does original game actually do?
3. **Decide on fix** - match original or improve behavior?
4. **Implement fix** if needed
5. **Test thoroughly** with all scenarios

## Notes

- The original game shows a warning dialog when leaving secret rooms
- Our implementation doesn't have this warning dialog yet
- Need to determine if warning dialog is required or if direct navigation is acceptable
- `secretRoomsShowedCount` might be the key to understanding the intended behavior

