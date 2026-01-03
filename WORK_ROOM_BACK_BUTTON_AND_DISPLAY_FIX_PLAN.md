# Work Room Back Button and Display Format Fix Plan

## Overview
This plan addresses two bugs:
1. **Bug 1**: Work room transfer panel back button doesn't mark room as done, allowing re-work
2. **Bug 2**: Site exploration display shows "2/2 and 0" instead of "Progress 2/2 and Items 0"

---

## Bug 1: Work Room Transfer Panel Back Button

### Problem
When work is completed and the user is in the transfer panel (`WorkRoomStorageView`), clicking the back button and then re-entering allows the user to work on the same room again. The room should be marked as done when back is clicked.

### Root Cause
- `WorkRoomStorageView` doesn't handle the back button click
- When back is clicked, items are not flushed to depository and the room is not marked as done
- The original game's `onClickLeftBtn` in `workRoomStorageNode.js` calls `flushItems()` and `back()`, but doesn't mark room as done
- However, to prevent re-work, we need to mark the room as done when back is clicked

### Solution
1. Add `onBack` prop to `WorkRoomStorageView` component
2. Create `handleBack` function that:
   - Calls `flushItems()` to transfer remaining items to site storage (depository)
   - Calls `site.roomEnd(true)` to mark the room as done
   - Calls `onBack()` to navigate back
3. Pass `handleBack` to the back button handler in `SiteExploreContent`

### Implementation Details

#### File: `src/components/panels/SiteExploreContent.tsx`

**Changes to `WorkRoomStorageView` component:**
- Add `onBack` prop to component signature
- Create `handleBack` function that flushes items, marks room as done, then calls `onBack`
- The back button is handled by the parent `SiteExploreContent` component via `onBack` prop

**Changes to `SiteExploreContent` component:**
- Pass `onBack` handler to `WorkRoomStorageView` that:
  1. Flushes items to depository
  2. Marks room as done
  3. Navigates back

**Code Changes:**

```typescript
// In SiteExploreContent component, modify handleWorkStorageNext and add handleWorkStorageBack
const handleWorkStorageNext = () => {
  // Complete room
  if (site.isInSecretRooms) {
    site.secretRoomEnd()
    if (site.isSecretRoomsEnd()) {
      site.secretRoomsEnd()
    }
  } else {
    site.roomEnd(true) // Work rooms always succeed
    site.testSecretRoomsBegin()
  }

  // Auto-save
  saveAll().catch(err => console.error('Auto-save failed:', err))

  // Update view
  updateView()
}

// NEW: Handle back button from work room storage
const handleWorkStorageBack = () => {
  // Get current room (should be work room)
  if (currentRoom && currentRoom.type === 'work') {
    // Flush items to site storage (depository)
    const tempStorage = new Storage('temp')
    if (Array.isArray(currentRoom.list)) {
      const itemCounts: Record<string, number> = {}
      currentRoom.list.forEach((item: Item) => {
        if (item && item.id) {
          itemCounts[item.id] = (itemCounts[item.id] || 0) + 1
        }
      })
      Object.entries(itemCounts).forEach(([itemId, count]) => {
        tempStorage.increaseItem(itemId, count, false)
      })
    }
    
    // Transfer remaining items to site storage
    Object.entries(tempStorage.items).forEach(([itemId, count]) => {
      if (count > 0) {
        site.increaseItem(itemId, count)
      }
    })
    
    // Mark room as done
    if (site.isInSecretRooms) {
      site.secretRoomEnd()
      if (site.isSecretRoomsEnd()) {
        site.secretRoomsEnd()
      }
    } else {
      site.roomEnd(true) // Work rooms always succeed
      site.testSecretRoomsBegin()
    }
    
    // Auto-save
    saveAll().catch(err => console.error('Auto-save failed:', err))
  }
  
  // Navigate back
  onBack()
}

// Update WorkRoomStorageView call to pass onBack
if (viewMode === 'workStorage' && currentRoom) {
  return <WorkRoomStorageView room={currentRoom} site={site} onNextRoom={handleWorkStorageNext} onBack={handleWorkStorageBack} />
}
```

**Update `WorkRoomStorageView` component signature:**
```typescript
function WorkRoomStorageView({ 
  room, 
  site, 
  onNextRoom,
  onBack  // NEW prop
}: { 
  room: Room
  site: Site
  onNextRoom: () => void
  onBack: () => void  // NEW
}) {
  // ... existing code ...
  
  // The back button is handled by parent component via onBack prop
  // No changes needed to WorkRoomStorageView itself, just accept the prop
}
```

**Note**: The back button click is handled by `MainScene.tsx`'s `handleBackButton` which calls `onBack()` from `SiteExploreContent`. We need to intercept this in `SiteExploreContent` when `viewMode === 'workStorage'`.

**Alternative Approach**: Modify `MainScene.tsx` to check if we're in work storage view and handle it specially, OR modify `SiteExploreContent` to handle back button internally when in work storage view.

**Better Approach**: Since `SiteExploreContent` already has an `onBack` prop, we can modify it to check the current view mode and handle work storage back specially:

```typescript
// In SiteExploreContent component
const handleBack = () => {
  if (viewMode === 'workStorage' && currentRoom && currentRoom.type === 'work') {
    // Handle work storage back
    handleWorkStorageBack()
  } else {
    // Normal back
    onBack()
  }
}

// But wait, the back button is handled by MainScene, not SiteExploreContent
// So we need to modify MainScene to call a special handler
```

**Best Approach**: Since `MainScene` handles the back button globally, we need to:
1. Add a way for `SiteExploreContent` to register a custom back handler
2. OR modify `MainScene` to check if current panel is `siteExplore` and if so, check if we're in work storage view

**Simplest Approach**: Modify `SiteExploreContent` to expose a way to handle back, and modify `MainScene` to check for this. But this is complex.

**Easiest Approach**: Add `onBack` prop to `WorkRoomStorageView` and modify `SiteExploreContent` to pass a handler that does the flush + mark done + navigate back. Then modify `MainScene` to check if we're in work storage view.

Actually, looking at the code flow:
- `MainScene` renders `SiteExploreContent` with `onBack` prop
- `MainScene.handleBackButton` checks `currentPanel === 'siteExplore'` and calls `uiStore.openPanelAction('site', undefined, siteId)`
- This doesn't go through `SiteExploreContent.onBack`

So we need to:
1. Modify `MainScene.handleBackButton` to check if we're in work storage view
2. If so, call a handler that flushes items and marks room as done
3. Then navigate back

But `MainScene` doesn't know about `viewMode` in `SiteExploreContent`.

**Solution**: Add a prop to `SiteExploreContent` that allows it to register a custom back handler, or use the emitter pattern, or add state to `uiStore`.

**Simplest Solution**: Modify `SiteExploreContent` to handle back internally when in work storage view, and expose this via a callback or by modifying the `onBack` behavior.

Actually, the cleanest solution is:
1. `WorkRoomStorageView` accepts `onBack` prop
2. `SiteExploreContent` creates `handleWorkStorageBack` that flushes items, marks room as done, then calls the original `onBack`
3. `SiteExploreContent` passes `handleWorkStorageBack` to `WorkRoomStorageView`
4. `MainScene` needs to be modified to call `SiteExploreContent`'s back handler when in work storage view

But `MainScene` doesn't have direct access to `SiteExploreContent`'s internal state.

**Final Solution**: 
- Add a ref or callback mechanism, OR
- Modify `SiteExploreContent` to check `viewMode` in a `useEffect` that listens to back button events, OR
- Add `onBack` override mechanism

**Simplest Final Solution**:
1. Modify `SiteExploreContent` to accept an optional `onBackOverride` prop or handle back internally
2. When `viewMode === 'workStorage'`, intercept back button clicks
3. Use `emitter` to listen for back button events, OR
4. Modify `MainScene` to pass a callback that `SiteExploreContent` can call

Actually, the simplest is to modify `MainScene.handleBackButton` to:
1. Check if `currentPanel === 'siteExplore'`
2. Get the site from `uiStore.siteExplorePanelSiteId`
3. Check if site is in work storage view (we need to track this in uiStore or site)
4. If so, flush items and mark room as done
5. Then navigate back

But we don't track view mode in uiStore.

**Best Solution**: 
1. Add `onBack` prop to `WorkRoomStorageView`
2. `SiteExploreContent` creates `handleWorkStorageBack` that does flush + mark done + call original `onBack`
3. `SiteExploreContent` passes this to `WorkRoomStorageView`
4. `WorkRoomStorageView` doesn't need to do anything with it, but we modify `SiteExploreContent` to intercept back button when `viewMode === 'workStorage'`
5. Use `useEffect` to listen for a custom event or modify `MainScene` to check a flag

**Simplest Working Solution**:
1. Modify `SiteExploreContent` to export a function or use a ref to handle back
2. OR modify `MainScene` to call `SiteExploreContent`'s handler if it exists
3. OR add state to `uiStore` to track if we're in work storage view

**Practical Solution**:
Since `MainScene` handles back button globally, we'll:
1. Add a way for `SiteExploreContent` to register a custom back handler with `uiStore`
2. `MainScene` checks for this handler before doing default back behavior
3. OR, simpler: modify `SiteExploreContent` to handle back button clicks via `emitter` or a custom event

**Final Practical Solution**:
1. In `SiteExploreContent`, when `viewMode === 'workStorage'`, set up a handler
2. Modify `MainScene.handleBackButton` to check `uiStore` for a custom back handler for `siteExplore` panel
3. If exists, call it; otherwise, do default behavior

Actually, let's keep it simple:
1. Add `handleWorkStorageBack` in `SiteExploreContent` that flushes items, marks room as done, then calls `onBack()`
2. Modify `MainScene.handleBackButton` to check if we need special handling for work storage
3. We can add a flag to `uiStore` or check site state

**Simplest**: Modify `SiteExploreContent` to override `onBack` behavior when in work storage view:

```typescript
// In SiteExploreContent
const actualOnBack = useRef(onBack)

useEffect(() => {
  if (viewMode === 'workStorage' && currentRoom && currentRoom.type === 'work') {
    // Override onBack to handle work storage back
    actualOnBack.current = () => {
      handleWorkStorageBack()
    }
  } else {
    actualOnBack.current = onBack
  }
}, [viewMode, currentRoom])

// But this doesn't help because MainScene doesn't call SiteExploreContent.onBack
```

**Best Solution**: Modify `MainScene.handleBackButton` to:
1. Check if `currentPanel === 'siteExplore'`
2. Get site from map
3. Check if site has a work room in progress (we can add a flag to Site or check room state)
4. If so, flush items and mark room as done
5. Then navigate back

But we don't have a way to check if we're in work storage view from `MainScene`.

**Final Solution**: 
1. Add `onBack` prop to `WorkRoomStorageView` (even though it won't be used directly)
2. In `SiteExploreContent`, create `handleWorkStorageBack` that flushes items, marks room as done, then calls `onBack()`
3. Modify `MainScene.handleBackButton` to check if we're in work storage by checking site state or adding a flag
4. OR, use `emitter` to emit a custom event that `SiteExploreContent` listens to

**Simplest Working Solution**:
1. In `SiteExploreContent`, add a `useEffect` that listens for a custom back event
2. When back button is clicked in `MainScene`, emit this event
3. `SiteExploreContent` intercepts it if in work storage view
4. Otherwise, let it proceed normally

**Even Simpler**: Modify `SiteExploreContent` to handle back button clicks by checking `viewMode`:

```typescript
// In SiteExploreContent, add useEffect to handle back
useEffect(() => {
  const handleBackClick = () => {
    if (viewMode === 'workStorage' && currentRoom && currentRoom.type === 'work') {
      handleWorkStorageBack()
      return true // Indicate we handled it
    }
    return false
  }
  
  // Register handler with emitter or uiStore
  emitter.on('back_button_click', handleBackClick)
  
  return () => {
    emitter.off('back_button_click', handleBackClick)
  }
}, [viewMode, currentRoom])
```

But `MainScene` doesn't emit this event.

**Final Simple Solution**:
1. Add `handleWorkStorageBack` function in `SiteExploreContent`
2. Modify `MainScene.handleBackButton` to check if we're in work storage view
3. To check this, we can add a method to `Site` class or check room state
4. OR, add a flag to `uiStore` that `SiteExploreContent` sets when entering work storage view

**Simplest Implementation**:
1. Add `isInWorkStorageView` state to `uiStore`
2. `SiteExploreContent` sets this to `true` when `viewMode === 'workStorage'`, `false` otherwise
3. `MainScene.handleBackButton` checks this flag
4. If true, calls a handler that flushes items and marks room as done
5. Then navigates back

Let's go with this approach.

---

## Bug 2: Site Exploration Display Format

### Problem
Site exploration bottom bar shows "2/2 and 0" instead of "Progress 2/2 and Items 0" (or "Progress: 2/2 and Items: 0" based on original game format).

### Root Cause
In `MainScene.tsx`, the `getSiteBottomBarSubtexts()` function returns:
- `leftSubtext: site.getCurrentProgressStr()` → "2/2"
- `rightSubtext: String(site.storage.getAllItemNum())` → "0"

But the original game uses string template 5000:
- `txt_1: "Progress %s"` (English) or `"进度:%s"` (Chinese)
- `txt_2: "Items %s"` (English) or `"存放物品:%s"` (Chinese)

### Solution
Modify `getSiteBottomBarSubtexts()` in `MainScene.tsx` to format the strings with labels:
- `leftSubtext: "Progress " + site.getCurrentProgressStr()` → "Progress 2/2"
- `rightSubtext: "Items " + String(site.storage.getAllItemNum())` → "Items 0"

**Note**: The original game uses `cc.formatStr(template.title.txt_1, value)` which formats the string. For now, we'll use simple string concatenation. Later, we can use string IDs.

### Implementation Details

#### File: `src/components/scenes/MainScene.tsx`

**Changes to `getSiteBottomBarSubtexts()` function:**

```typescript
if (currentPanel === 'siteExplore') {
  // For site explore, show progress and item count with labels
  return {
    leftSubtext: site.isInSecretRooms ? "???" : `Progress ${site.getCurrentProgressStr()}`,
    rightSubtext: `Items ${site.storage.getAllItemNum()}`
  }
}
```

**Note**: The original game format is "Progress %s" with a space, and "Items %s" with a space. We'll match this format.

---

## Implementation Checklist

### Bug 1: Work Room Back Button
- [ ] Add `isInWorkStorageView` state to `uiStore` (or use existing mechanism)
- [ ] Modify `SiteExploreContent` to set `isInWorkStorageView` flag when entering/exiting work storage view
- [ ] Create `handleWorkStorageBack` function in `SiteExploreContent` that:
  - Flushes remaining items from temp storage to site storage
  - Marks room as done via `site.roomEnd(true)`
  - Auto-saves
  - Navigates back
- [ ] Modify `MainScene.handleBackButton` to check `isInWorkStorageView` flag
- [ ] If flag is true, call the work storage back handler before navigating
- [ ] Test: Complete work, enter transfer panel, click back, re-enter site - room should be marked as done

### Bug 2: Display Format
- [ ] Modify `getSiteBottomBarSubtexts()` in `MainScene.tsx` to add "Progress " prefix to left subtext
- [ ] Modify `getSiteBottomBarSubtexts()` in `MainScene.tsx` to add "Items " prefix to right subtext
- [ ] Test: Enter site exploration - bottom bar should show "Progress 2/2" and "Items 0"

---

## Testing

### Bug 1 Test Case
1. Start site exploration
2. Complete a work room
3. In transfer panel, transfer some items to bag
4. Click back button
5. Re-enter site exploration
6. **Expected**: The work room should be marked as done (not available to work on again)
7. **Expected**: Remaining items in temp storage should be in depository

### Bug 2 Test Case
1. Enter site exploration
2. Check bottom bar
3. **Expected**: Left subtext shows "Progress 2/2" (not just "2/2")
4. **Expected**: Right subtext shows "Items 0" (not just "0")

---

## Files to Modify

1. `src/components/panels/SiteExploreContent.tsx`
   - Add `handleWorkStorageBack` function
   - Set/unset work storage view flag in `uiStore`
   - Handle back button when in work storage view

2. `src/components/scenes/MainScene.tsx`
   - Modify `handleBackButton` to check for work storage view
   - Modify `getSiteBottomBarSubtexts` to add "Progress " and "Items " prefixes

3. `src/stores/uiStore.ts` (if needed)
   - Add `isInWorkStorageView` state if using flag approach

---

## Notes

- The original game's `onClickLeftBtn` in `workRoomStorageNode.js` only flushes items and goes back, but doesn't explicitly mark room as done. However, to prevent re-work, we need to mark it as done.
- The string format "Progress %s" and "Items %s" comes from string template 5000 in the original game. We're using hardcoded English strings for now; later we can use string IDs.
- The space in "Progress %s" and "Items %s" should be preserved to match original game format.

