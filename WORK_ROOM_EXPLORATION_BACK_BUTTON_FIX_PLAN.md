# Work Room Exploration Back Button Fix Plan

## Overview
Fix the issue where clicking back after completing work in a work room allows the user to work on the same room again. When back is clicked after work is done, it should:
1. Put all remaining items in the depository (site storage)
2. Mark the room as done
3. Navigate back to the site panel

## Problem Analysis

### Current Behavior
- User completes work in a work room
- User enters the transfer panel (`WorkRoomStorageView`) to transfer items
- User clicks back button
- User re-enters site exploration
- **BUG**: The same work room can be worked on again (room is not marked as done)

### Root Cause
The back button handling has two separate implementations:
1. `SiteExploreContent.handleWorkStorageBack` - flushes items, marks room as done, navigates back
2. `MainScene.handleBackButton` - also tries to handle work storage back, but may have timing issues

The issue is that `MainScene` is using `site.roomBegin()` to get the current room, but if the room hasn't been marked as done yet, it will still return the same room. The logic needs to ensure:
- Items are flushed to depository BEFORE marking room as done
- Room is marked as done BEFORE navigating back
- The flag `isInWorkStorageView` is cleared AFTER room is marked as done

### Intended Behavior (from Original Game)
When clicking back in work room storage view:
1. All remaining items in `room.list` are flushed to site storage (depository)
2. Room is marked as done (via `site.roomEnd(true)`)
3. Navigation returns to site panel
4. Room cannot be worked on again

## Solution

### Root Cause Identified
After reviewing the code, the issue is:
1. `MainScene.handleBackButton` handles the back button globally
2. When `isInWorkStorageView` is true, it executes the work storage back logic
3. **BUG**: The `isInWorkStorageView` flag is NOT being cleared after processing
4. The logic in `MainScene` correctly flushes items and marks room as done, but the flag remains set
5. `SiteExploreContent.handleWorkStorageBack` exists but is never called because `MainScene` intercepts the back button first

### Approach
Fix `MainScene.handleBackButton` to:
1. Get the current room using `site.roomBegin()` (before marking as done)
2. Flush all items from `room.list` to site storage (depository)
3. Mark room as done via `site.roomEnd(true)` (or `site.secretRoomEnd()` for secret rooms)
4. Auto-save
5. **CRITICAL**: Clear `isInWorkStorageView` flag BEFORE navigation
6. Navigate back to site panel

### Implementation Details

#### File: `src/components/scenes/MainScene.tsx`

**Current Issue:**
- The `handleBackButton` function handles work storage back correctly
- It flushes items, marks room as done, and auto-saves
- **BUT**: It does NOT clear the `isInWorkStorageView` flag
- This might cause issues, but more importantly, the room should be marked as done

**Fix:**
- Add `uiStore.setWorkStorageView(false)` after processing work storage back
- Ensure this happens BEFORE navigation

#### File: `src/components/panels/SiteExploreContent.tsx`

**Current Status:**
- `handleWorkStorageBack` exists but is never called (because `MainScene` intercepts first)
- The function is passed to `WorkRoomStorageView` as `onBack` prop, but the back button in `MainScene` is handled globally

**Note:** We can keep `handleWorkStorageBack` as a backup, but `MainScene` is the one that actually handles it.

### Implementation Plan

#### Step 1: Fix MainScene.handleBackButton
The main fix is to ensure the `isInWorkStorageView` flag is cleared after processing. This is the critical missing step.

**Change in `MainScene.tsx`:**
- After auto-save, add `uiStore.setWorkStorageView(false)` to clear the flag
- This ensures the flag doesn't persist and cause issues when re-entering

#### Step 2: Verify Room Completion Logic
The current logic in `MainScene.handleBackButton` should work:
- It gets the room using `site.roomBegin()` (before marking as done)
- It flushes items to site storage
- It calls `site.roomEnd(true)` which increments `site.step`
- It auto-saves

**However**, we need to ensure:
- The operations complete in the correct order
- The flag is cleared to prevent restoration of work storage view on re-entry

#### Step 3: Verify Auto-Save Timing
Ensure `saveAll()` is called AFTER `site.roomEnd(true)` so the incremented step is saved.

#### Step 4: Test the Fix
After the fix, test that:
- Items are flushed to depository
- Room is marked as done (step is incremented)
- When re-entering, the next room is shown (not the same work room)

## Code Changes

### File: `src/components/scenes/MainScene.tsx`

**Modify `handleBackButton` function:**

The current implementation is mostly correct, but we need to add the step to clear the `isInWorkStorageView` flag. The fix is to add `uiStore.setWorkStorageView(false)` after processing the work storage back.

**Location:** Around line 212, after auto-save and before navigation.

**Change:**
```typescript
// After auto-save (line 212)
saveAll().catch(err => console.error('[MainScene] Auto-save failed:', err))

// ADD THIS: Clear work storage view flag
uiStore.setWorkStorageView(false)
```

**Full context of the change:**
```typescript
// Around line 166-212 in MainScene.tsx
if (room && room.type === 'work') {
  console.log('[MainScene] Processing work room back - starting')
  console.log('[MainScene] Site state before processing:', {
    siteId: site.id,
    siteStep: site.step,
    roomsLength: site.rooms.length,
    currentRoomIndex: site.step,
    roomType: room.type,
    roomListLength: Array.isArray(room.list) ? room.list.length : 'not array'
  })
  
  // ... existing code to flush items and mark room as done ...
  
  // Log items before flush
  const itemsBeforeFlush = { ...site.storage.items }
  console.log('[MainScene] Items in depository BEFORE flush:', itemsBeforeFlush)
  console.log('[MainScene] Items in room.list to flush:', room.list)
  
  // ... flush items code ...
  
  // Log items after flush
  const itemsAfterFlush = { ...site.storage.items }
  console.log('[MainScene] Items in depository AFTER flush:', itemsAfterFlush)
  console.log('[MainScene] Items transferred:', Object.keys(tempStorage.items).length, 'item types')
  
  // Log step before marking room as done
  const stepBefore = site.step
  console.log('[MainScene] Site step BEFORE roomEnd:', stepBefore)
  console.log('[MainScene] Current room index:', stepBefore, 'of', site.rooms.length)
  
  // ... mark room as done code ...
  
  // Log step after marking room as done
  const stepAfter = site.step
  console.log('[MainScene] Site step AFTER roomEnd:', stepAfter)
  console.log('[MainScene] Step incremented:', stepAfter > stepBefore ? 'YES' : 'NO')
  console.log('[MainScene] Room marked as done:', stepAfter > stepBefore ? 'YES' : 'NO')
  
  // Auto-save
  console.log('[MainScene] Starting auto-save...')
  saveAll()
    .then(() => {
      console.log('[MainScene] Auto-save completed successfully')
      console.log('[MainScene] Site state after save:', {
        siteId: site.id,
        siteStep: site.step,
        roomsLength: site.rooms.length
      })
    })
    .catch(err => {
      console.error('[MainScene] Auto-save failed:', err)
    })
  
  // ADD: Clear work storage view flag
  console.log('[MainScene] Clearing isInWorkStorageView flag')
  uiStore.setWorkStorageView(false)
  console.log('[MainScene] Flag cleared. isInWorkStorageView:', uiStore.isInWorkStorageView)
  console.log('[MainScene] Work room back processing complete')
}
```

### File: `src/components/panels/SiteExploreContent.tsx`

**Note:** The `handleWorkStorageBack` function exists but is not called because `MainScene` handles the back button globally. However, we should verify it's correct in case the implementation changes in the future.

**Current Status:**
- The function is correct and has the right logic
- It's passed to `WorkRoomStorageView` as `onBack` prop
- But `MainScene.handleBackButton` intercepts the back button first, so this function is never called

**No changes needed** for this file, but we can keep it as a backup handler.

## Testing

### Test Case 1: Normal Work Room Back
1. Start site exploration
2. Complete a work room
3. In transfer panel, transfer some items to bag (leave some in temp storage)
4. Open browser console to view logs
5. Click back button
6. **Check console logs for:**
   - `[MainScene] Processing work room back - starting`
   - `[MainScene] Site state before processing:` (should show current step)
   - `[MainScene] Items in depository BEFORE flush:`
   - `[MainScene] Items in depository AFTER flush:` (should have more items)
   - `[MainScene] Site step BEFORE roomEnd:` (e.g., step 0)
   - `[MainScene] Site step AFTER roomEnd:` (e.g., step 1, should be incremented)
   - `[MainScene] Step incremented: YES`
   - `[MainScene] Room marked as done: YES`
   - `[MainScene] Auto-save completed successfully`
   - `[MainScene] Clearing isInWorkStorageView flag`
   - `[MainScene] Flag cleared. isInWorkStorageView: false`
   - `[MainScene] Work room back processing complete`
7. Re-enter site exploration
8. **Expected**: The work room should be marked as done (not available to work on again)
9. **Expected**: Remaining items in temp storage should be in depository
10. **Check console logs when re-entering:**
    - `[SiteExploreContent] updateView:` should show `step: 1` (or higher, not 0)
    - Should show next room, not the same work room

### Test Case 2: Secret Room Work Room Back
1. Start site exploration
2. Enter secret rooms
3. Complete a work room in secret rooms
4. In transfer panel, leave some items in temp storage
5. Open browser console to view logs
6. Click back button
7. **Check console logs for:**
   - `[MainScene] Processing work room back - starting`
   - `[MainScene] In secret rooms, calling secretRoomEnd`
   - `[MainScene] Site step AFTER roomEnd:` (should be incremented)
   - `[MainScene] Auto-save completed successfully`
   - `[MainScene] Flag cleared. isInWorkStorageView: false`
8. Re-enter site exploration
9. **Expected**: The secret work room should be marked as done
10. **Expected**: Remaining items should be in depository

### Test Case 3: All Items Transferred
1. Start site exploration
2. Complete a work room
3. In transfer panel, transfer ALL items to bag (temp storage is empty)
4. Open browser console to view logs
5. Click back button
6. **Check console logs for:**
   - `[MainScene] Items in room.list to flush:` (should show items)
   - `[MainScene] Items transferred: 0 item types` (or count of item types)
   - `[MainScene] Site step AFTER roomEnd:` (should be incremented)
   - `[MainScene] Room marked as done: YES`
7. Re-enter site exploration
8. **Expected**: The work room should be marked as done
9. **Expected**: No items should be in depository (all were transferred to bag)

### Test Case 4: Verify Room Cannot Be Worked Again
1. Complete a work room
2. Click back button
3. **Check console logs:**
   - `[MainScene] Site step AFTER roomEnd:` should be incremented
4. Re-enter site exploration
5. **Check console logs:**
   - `[SiteExploreContent] updateView:` should show incremented step
   - Should NOT show the same work room
   - Should show next room or site end
6. **Expected**: Cannot work on the same room again

## Files to Modify

1. `src/components/scenes/MainScene.tsx`
   - Modify `handleBackButton` to ensure correct order of operations
   - Ensure work storage back handling is correct
   - Clear `isInWorkStorageView` flag after processing
   - Add comprehensive logging for verification

2. `src/components/panels/SiteExploreContent.tsx`
   - Verify `handleWorkStorageBack` is correct (no changes needed, but keep for reference)
   - The existing logging in `updateView` will help verify the fix

## Logging Summary

### Logs to Look For When Clicking Back:

**Before Processing:**
- `[MainScene] Processing work room back - starting`
- `[MainScene] Site state before processing:` (shows current step, room info)

**During Item Flush:**
- `[MainScene] Items in depository BEFORE flush:` (current items)
- `[MainScene] Items in room.list to flush:` (items to transfer)
- `[MainScene] Items in depository AFTER flush:` (items after transfer)
- `[MainScene] Items transferred:` (count of item types)

**During Room Completion:**
- `[MainScene] Site step BEFORE roomEnd:` (e.g., 0)
- `[MainScene] Site step AFTER roomEnd:` (e.g., 1, should be incremented)
- `[MainScene] Step incremented: YES` (confirms increment)
- `[MainScene] Room marked as done: YES` (confirms completion)

**During Save:**
- `[MainScene] Starting auto-save...`
- `[MainScene] Auto-save completed successfully`
- `[MainScene] Site state after save:` (verifies step was saved)

**During Flag Clear:**
- `[MainScene] Clearing isInWorkStorageView flag`
- `[MainScene] Flag cleared. isInWorkStorageView: false`

**Completion:**
- `[MainScene] Work room back processing complete`

### Logs to Look For When Re-Entering:

**In SiteExploreContent:**
- `[SiteExploreContent] updateView:` should show incremented step
- Should show next room, not the same work room
- If step is correct, the work room should not appear again

## Summary

### The Fix
Add one line of code in `MainScene.tsx` after auto-save in the work storage back handler:
```typescript
uiStore.setWorkStorageView(false)
```

This ensures the flag is cleared after processing, preventing the work storage view from being restored when re-entering site exploration.

### Why This Fixes the Issue
1. When back is clicked, `MainScene.handleBackButton` correctly:
   - Flushes items to depository ✓
   - Marks room as done via `site.roomEnd(true)` ✓
   - Auto-saves ✓
2. **BUT** the `isInWorkStorageView` flag was not being cleared
3. When re-entering site exploration, the flag might cause the view to be restored incorrectly
4. By clearing the flag, we ensure a clean state when re-entering

### Expected Behavior After Fix
1. User completes work in work room
2. User enters transfer panel
3. User clicks back button
4. **Items are flushed to depository** ✓
5. **Room is marked as done (step incremented)** ✓
6. **Flag is cleared** ✓ (NEW)
7. User navigates back to site panel
8. User re-enters site exploration
9. **Next room is shown (work room is done)** ✓

## Notes

- The original game's `onClickLeftBtn` in `workRoomStorageNode.js` calls `flushItems()` and `back()`, but doesn't explicitly mark room as done. However, to prevent re-work, we need to mark it as done.
- The key is ensuring the room is marked as done BEFORE navigation, so when the user re-enters, the room is already completed.
- Auto-save is critical to persist the room state.
- The `isInWorkStorageView` flag should be cleared after processing to prevent issues on next entry.
- The flag might be causing the view to be restored incorrectly when re-entering, which could make it seem like the room wasn't marked as done.

