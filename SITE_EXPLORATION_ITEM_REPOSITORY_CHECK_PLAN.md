# Site Exploration Item Repository Check Plan

## Objective
Check site/site exploration for potential issues where items don't get pushed to repository (site storage).

## Summary

### Key Findings
1. ✅ **Battle Rewards**: Battles don't give rewards in the original game - they only consume items. No issue here.
2. ✅ **Work Room Flush Logic**: Current implementation matches original game behavior - items are flushed on both back and next button.
3. ⚠️ **Potential Issues**:
   - Error handling in flush logic could be improved
   - Component unmount timing edge cases (rare but possible)
   - Items transferred to Bag are safe, but need to verify flush includes all remaining items in temp storage

### Main Areas to Verify
1. Work room items flush correctly in all scenarios
2. Error handling doesn't silently fail
3. Secret room items use same flush logic (they do)
4. ItemTransferPanel updates don't interfere with flush

## Background
During site exploration, items can be collected from:
1. **Work Rooms**: Items generated in `room.list` that need to be transferred to site storage
2. **Battle Rooms**: Potential monster drops/rewards (if any)
3. **Secret Rooms**: Work room items in secret rooms

Items should be added to `site.storage` (the repository/depository) so they can be accessed later via the Site Storage panel.

## Current Implementation Analysis

### 1. Work Room Items Flow

**Location**: `src/components/panels/SiteExploreContent.tsx` - `WorkRoomStorageView`

**Current Flow**:
1. Work room generates items in `room.list` (array of Item objects)
2. `WorkRoomStorageView` creates `tempStorage` from `room.list` (lines 1303-1333)
3. Items are displayed in `ItemTransferPanel` for transfer between Bag and temp storage
4. Items should be flushed to site storage via `flushItems()` (lines 1343-1358)
5. Flush happens:
   - On component unmount (lines 1362-1367)
   - On "Next" button click (lines 1369-1373)

**Potential Issues**:
- ✅ Flush is called on unmount (should catch most cases)
- ⚠️ If component unmounts before `useEffect` cleanup runs, items might be lost
- ⚠️ If `flushItems()` throws an error, items are lost
- ⚠️ If user navigates away via back button, unmount effect should fire, but timing could be an issue
- ⚠️ Items transferred to Bag are removed from temp storage, but if flush happens after transfer, those items won't be in temp storage to flush

### 2. Battle Room Rewards

**Location**: `src/components/panels/SiteExploreContent.tsx` - `handleBattleEnd`

**Current Flow**:
1. Battle completes and returns `BattleResult`
2. `handleBattleEnd` processes result (lines 350-371)
3. `handleBattleEndNext` completes room (lines 373-394)
4. **MISSING**: No code adds battle rewards/drops to site storage

**Potential Issues**:
- ❌ **CRITICAL**: Battle rewards/drops are not added to site storage
- Need to check original game to see if battles give rewards that go to site storage
- If battles give rewards, they are currently lost

### 3. Secret Room Items

**Location**: `src/components/panels/SiteExploreContent.tsx` - `WorkRoomStorageView`

**Current Flow**:
- Same as regular work rooms
- Uses same `WorkRoomStorageView` component
- Items generated in `site.secretRooms[step].list`

**Potential Issues**:
- Same as work room items
- Need to verify secret room items are properly flushed

### 4. ItemTransferPanel Updates

**Location**: `src/components/common/ItemTransferPanel.tsx`

**Current Flow**:
1. When items are transferred in work room storage view:
   - Items moved from temp storage to Bag: temp storage is updated (line 211-221)
   - Items moved from Bag to temp storage: temp storage is updated (line 211-221)
2. For work room storage, only Bag is updated in playerStore (lines 228-233)
3. Temp storage changes are NOT persisted until flush

**Potential Issues**:
- ⚠️ If user transfers items from temp storage to Bag, then navigates away, those items are in Bag (good)
- ⚠️ If user transfers items from Bag to temp storage, then navigates away, those items should be flushed to site storage
- ⚠️ Current flush logic only flushes `tempStorage.items` - if items were transferred to Bag, they're already gone from temp storage, so they won't be flushed
- ⚠️ This means items transferred to Bag are safe, but items remaining in temp storage should be flushed

## Investigation Checklist

### Phase 1: Code Review

- [ ] **Check WorkRoomStorageView flush logic**
  - Verify `flushItems()` correctly iterates all items in temp storage
  - Verify flush happens even if items were transferred to Bag
  - Verify error handling doesn't silently fail

- [ ] **Check Battle reward system**
  - Review original game code for battle rewards
  - Check if `BattleResult` contains reward items
  - Verify if rewards should go to site storage or directly to bag

- [ ] **Check ItemTransferPanel for work room storage**
  - Verify temp storage updates are tracked correctly
  - Verify flush includes all items remaining in temp storage

- [ ] **Check secret room item handling**
  - Verify secret room work items use same flush logic
  - Verify flush happens when leaving secret rooms

### Phase 2: Edge Case Testing

- [ ] **Test 1: Work room - transfer all to Bag, then back button**
  - Expected: Items in Bag, nothing to flush (correct)
  - Verify: No items lost

- [ ] **Test 2: Work room - transfer some to Bag, leave some in temp, then back button**
  - Expected: Items in Bag stay in Bag, items in temp storage flush to site storage
  - Verify: All items accounted for

- [ ] **Test 3: Work room - leave all in temp storage, then back button**
  - Expected: All items flush to site storage
  - Verify: Items appear in site storage

- [ ] **Test 4: Work room - leave all in temp storage, then Next button**
  - Expected: All items flush to site storage
  - Verify: Items appear in site storage

- [ ] **Test 5: Battle room - win battle, check for rewards**
  - Expected: If battles give rewards, they should be added to site storage
  - Verify: Check original game behavior

- [ ] **Test 6: Secret room - work room items**
  - Expected: Same behavior as regular work rooms
  - Verify: Items flush correctly

- [ ] **Test 7: Component unmount timing**
  - Expected: Unmount effect should always fire
  - Verify: Test rapid navigation to catch timing issues

### Phase 3: Original Game Cross-Check

- [x] **Check original game work room storage**
  - File: `OriginalGame/src/ui/workRoomStorageNode.js`
  - **Findings**: 
    - `flushItems()` iterates through `this.storage` (temp storage) and calls `site.increaseItem()` for each item (lines 53-59)
    - Called on both left button (back) and right button (next) (lines 61-72)
    - **Current implementation matches this behavior**
  - Compare: ✅ Matches current implementation

- [x] **Check original game battle rewards**
  - File: `OriginalGame/src/game/Battle.js`
  - **Findings**: 
    - Line 239 adds items to site storage, but only for **ad rewards** (rewarded ads)
    - No code found that adds items to site storage when monsters are killed
    - Battles don't give rewards - they only consume items
  - Verify: ✅ Battles don't give rewards

- [ ] **Check original game site storage**
  - File: `OriginalGame/src/ui/siteStorageNode.js`
  - Verify: How items are added to site storage
  - Compare: With current implementation

## Potential Issues Found

### Issue 1: Battle Rewards Missing (INVESTIGATED)
**Status**: Likely not an issue
**Description**: No code found that adds battle rewards to site storage
**Investigation Results**:
- Checked `OriginalGame/src/game/Battle.js`
- Found line 239 that adds items to site storage, but it's for **ad rewards** (rewarded ads), not regular battle rewards
- No code found that adds items to site storage when monsters are killed
- Battles appear to only consume items (bullets, tools) and don't give rewards
**Impact**: None - battles don't give rewards in original game
**Action**: No action needed - this is not an issue

### Issue 2: Flush Logic May Miss Items Transferred to Bag
**Status**: Needs verification
**Description**: If user transfers items from temp storage to Bag, then navigates away, flush only flushes remaining items in temp storage. Items in Bag are safe, but need to verify this is correct behavior.
**Impact**: Low - items in Bag are accessible, but might not match original game behavior
**Action**: Verify original game behavior

### Issue 3: Error Handling in Flush
**Status**: Needs improvement
**Description**: If `flushItems()` throws an error, items are lost
**Impact**: Medium - rare but catastrophic if it happens
**Action**: Add try-catch and logging

### Issue 4: Component Unmount Timing
**Status**: Needs verification
**Description**: React unmount effects should always fire, but rapid navigation might cause issues
**Impact**: Low - React guarantees cleanup, but worth testing
**Action**: Test rapid navigation scenarios

## Recommended Fixes

### Fix 1: Add Error Handling to Flush
```typescript
const flushItems = useCallback(() => {
  if (hasFlushedRef.current) {
    console.log('[WorkRoomStorageView] Items already flushed, skipping')
    return
  }
  
  try {
    hasFlushedRef.current = true
    console.log('[WorkRoomStorageView] Flushing items to depository:', tempStorage.items)
    Object.entries(tempStorage.items).forEach(([itemId, count]) => {
      if (count > 0) {
        site.increaseItem(itemId, count)
      }
    })
    console.log('[WorkRoomStorageView] Site storage after flush:', site.storage.items)
    saveAll().catch(err => console.error('Auto-save failed:', err))
  } catch (error) {
    console.error('[WorkRoomStorageView] Error flushing items:', error)
    // Reset flag so retry is possible
    hasFlushedRef.current = false
  }
}, [tempStorage, site])
```

### Fix 2: Battle Rewards (NOT NEEDED)
- ✅ Investigated: Battles don't give rewards in original game
- No action needed

### Fix 3: Add Logging for Debugging
- Add console logs to track item flow
- Log when items are created, transferred, and flushed
- Log site storage state before and after flush

## Testing Plan

1. **Manual Testing**:
   - Test each scenario in the edge case checklist
   - Verify items appear in site storage panel
   - Check console logs for errors

2. **Cross-Check with Original Game**:
   - Play original game and verify behavior
   - Compare item counts at each step
   - Verify battle rewards (if any)

3. **Automated Testing** (if possible):
   - Create test cases for each scenario
   - Verify item counts match expected values

## Next Steps

1. ✅ **Completed**: Reviewed original game code for battle rewards - battles don't give rewards
2. **High Priority**: Add error handling to flush logic
3. **Medium Priority**: Add comprehensive logging
4. **Low Priority**: Test all edge cases manually
5. **High Priority**: Verify work room flush logic matches original game behavior

## Files to Review

- `src/components/panels/SiteExploreContent.tsx` - Main exploration logic
- `src/game/world/Site.ts` - Site storage management
- `src/components/common/ItemTransferPanel.tsx` - Item transfer logic
- `src/game/combat/Battle.ts` - Battle system (check for rewards)
- `OriginalGame/src/ui/workRoomStorageNode.js` - Original work room storage
- `OriginalGame/src/game/Battle.js` - Original battle system
- `OriginalGame/src/ui/siteStorageNode.js` - Original site storage

