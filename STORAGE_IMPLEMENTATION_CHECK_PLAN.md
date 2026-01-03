# Storage Implementation Check Plan

## Objective
Check storage implementation and how items are stored in sites (site storage/repository).

## Summary

### Key Areas to Check
1. **Storage Class Implementation**: Verify Storage class matches original game functionality
2. **Site Storage System**: Check how `site.storage` works and how items are added
3. **Item Flush Mechanism**: Verify work room items are correctly flushed to site storage
4. **Save/Restore System**: Check if site storage is properly saved and restored
5. **Storage Access**: Verify site storage can be accessed from Site Storage Panel

---

## 1. Storage Class Implementation

### 1.1 Current Implementation

**File**: `src/game/inventory/Storage.ts`

**Key Features**:
- `items: Record<string, number>` - itemId -> count mapping
- `maxWeight: number | null` - weight limit (null = unlimited)
- `addItem(itemId, count, includeWater?)` - Add items with weight check
- `removeItem(itemId, count)` - Remove items
- `getWeight()` - Calculate total weight
- `canAddItem(itemId, count)` - Check if item can be added (weight check)
- `transferItem(itemId, count, target)` - Transfer between storages
- `getRandomItem()` - For raids
- `getRobItem()` - For theft
- `save()` / `restore()` - Save/load state
- `getItemsByTypeGroup()` - Group items by type prefix

### 1.2 Original Game Implementation

**File**: `OriginalGame/src/game/Storage.js`

**Key Differences**:
- Original uses `StorageCell` objects: `{item: Item, num: number}`
- New implementation uses simple `Record<string, number>` (itemId -> count)
- Original has `increaseItem()` and `decreaseItem()` methods
- Original has `forEach()` method for iteration
- Original has `getNumByItemId()` method
- Original has `validateItem()` method
- Original has `setItem()` method

**Comparison Checklist**:
- [ ] Verify weight calculation matches original (weight=0 items: `Math.ceil(count / 50)`)
- [ ] Check if `increaseItem()` is equivalent to `addItem()`
- [ ] Verify `getRandomItem()` logic matches original
- [ ] Verify `getRobItem()` logic matches original
- [ ] Check if `getItemsByTypeGroup()` matches original behavior
- [ ] Verify save/restore format matches original

### 1.3 Potential Issues

1. **Storage Structure**:
   - Original uses `StorageCell` objects with Item instances
   - New uses simple count mapping
   - This should be fine as long as Item instances are created when needed

2. **Weight Calculation**:
   - Original: `Math.ceil(num / 50)` for weight=0 items
   - New: Same logic in `getWeight()` and `canAddItem()`
   - ✅ Should match

3. **Water Auto-Consumption**:
   - Original: `increaseItem()` with `includeWater` flag auto-consumes water items
   - New: `addItem()` has `includeWater` parameter but TODO comment indicates not fully implemented
   - ⚠️ May need to check if water auto-consumption works

---

## 2. Site Storage System

### 2.1 Site Storage Structure

**File**: `src/game/world/Site.ts`

**Key Properties**:
```typescript
export class Site extends BaseSite {
  public storage: Storage  // Site storage (repository/depository)
  
  constructor(siteId: number) {
    // ...
    this.storage = new Storage('site')  // Unlimited weight (maxWeight = null)
    // ...
  }
}
```

**Storage Initialization**:
- Created in Site constructor: `new Storage('site')`
- No `maxWeight` specified = unlimited storage
- Used to store items collected during site exploration

### 2.2 Adding Items to Site Storage

**Method**: `Site.increaseItem()`
```typescript
increaseItem(itemId: string, num: number): void {
  this.storage.addItem(itemId, num, false)
  this.haveNewItems = true
}
```

**Usage**:
- Called from `WorkRoomStorageView.flushItems()` to add items from work rooms
- Sets `haveNewItems = true` flag to indicate new items in storage

### 2.3 Site Storage Save/Restore

**Save**:
```typescript
save(): SiteSaveData {
  return {
    // ...
    storage: this.storage.save(),  // Returns Record<string, number>
    // ...
  }
}
```

**Restore**:
```typescript
restore(saveObj: SiteSaveData | null): void {
  if (saveObj) {
    // ...
    this.storage.restore(saveObj.storage)  // Restores from Record<string, number>
    // ...
  }
}
```

**Save Schema**:
```typescript
// From saveSchemas.ts
storage: z.record(z.string(), z.number().int().min(0))
```

**Checklist**:
- [ ] Verify site storage is saved in Map.save()
- [ ] Verify site storage is restored in Map.restore()
- [ ] Check if site storage persists across game sessions
- [ ] Verify storage format matches save schema

---

## 3. Item Flush Mechanism (Work Room to Site Storage)

### 3.1 Current Implementation

**File**: `src/components/panels/SiteExploreContent.tsx` - `WorkRoomStorageView`

**Flow**:
1. Work room generates items in `room.list` (array of Item objects)
2. `WorkRoomStorageView` creates `tempStorage` from `room.list`
3. Items displayed in `ItemTransferPanel` for transfer between Bag and temp storage
4. Items flushed to site storage via `flushItems()` when:
   - User clicks "Next" button
   - Component unmounts (via cleanup effect)

**Flush Function**:
```typescript
const flushItems = useCallback(() => {
  // Check if already flushed
  if (hasFlushedRef.current || room.itemsFlushed) {
    return
  }
  
  hasFlushedRef.current = true
  
  // Flush all items in tempStorage to site storage
  Object.entries(tempStorage.items).forEach(([itemId, count]) => {
    if (count > 0) {
      site.increaseItem(itemId, count)  // Adds to site.storage
    }
  })
  
  // Mark room as flushed and clear room.list
  if (room.type === 'work' && Array.isArray(room.list)) {
    room.itemsFlushed = true
    room.list = []
    initialItemsRef.current = null
  }
  
  saveAll().catch(err => console.error('Auto-save failed:', err))
}, [tempStorage, site, room])
```

### 3.2 Potential Issues

1. **Items Transferred to Bag**:
   - If user transfers items from temp storage to Bag, they're removed from tempStorage
   - When flush happens, only remaining items in tempStorage are flushed
   - ✅ This is correct behavior - items in Bag stay in Bag

2. **Items Transferred from Bag to Temp Storage**:
   - If user transfers items from Bag to temp storage, they're added to tempStorage
   - When flush happens, these items are flushed to site storage
   - ✅ This is correct behavior - items moved to temp storage should go to site storage

3. **Flush Timing**:
   - Flush happens on "Next" button click ✅
   - Flush happens on component unmount (cleanup effect) ✅
   - ⚠️ Need to verify flush happens when navigating back from work room

4. **Duplicate Prevention**:
   - Uses `hasFlushedRef.current` flag to prevent double-flush
   - Uses `room.itemsFlushed` flag (saved/restored) to prevent duplication on restore
   - ✅ Should prevent duplicates

5. **Error Handling**:
   - Flush doesn't have try-catch around `site.increaseItem()`
   - ⚠️ If `site.increaseItem()` fails, items may be lost
   - ⚠️ Should add error handling

### 3.3 Cross-Check with Original Game

**File**: `OriginalGame/src/ui/workRoomStorageNode.js`

**Original Flow**:
- Work room items are in `room.list` (array of Item objects)
- Items displayed in transfer panel
- Items flushed when navigating away
- Uses `site.increaseItem()` to add to site storage

**Comparison**:
- ✅ New implementation matches original flow
- ✅ Uses same `site.increaseItem()` method
- ✅ Flushes on navigation

---

## 4. Site Storage Panel Access

### 4.1 Site Storage Panel

**File**: `src/components/panels/SiteStoragePanelContent.tsx`

**Functionality**:
- Shows `EquipPanel` at top
- Shows `ItemTransferPanel` below for Bag <-> Site Storage transfer
- Gets site from `playerStore.map.getSite(siteId)`
- Creates storage instances from site.storage

**Storage Creation**:
```typescript
const siteStorage = useMemo(() => {
  const storage = new Storage('site')
  storage.restore(site.storage.save())  // Restore from site.storage
  return storage
}, [site, playerStore.map, siteId])
```

**Potential Issues**:
1. **Storage Sync**:
   - Creates new Storage instance from `site.storage.save()`
   - If `site.storage` is updated, this memo may not refresh
   - ⚠️ Need to verify storage updates are reflected in panel

2. **Item Transfer**:
   - `ItemTransferPanel` transfers between Bag and siteStorage
   - Need to verify transfers update `site.storage` correctly
   - Need to verify transfers are saved

### 4.2 ItemTransferPanel Integration

**File**: `src/components/common/ItemTransferPanel.tsx`

**Props**:
- `topStorage`: Bag storage
- `bottomStorage`: Site storage
- `siteId`: Site ID for updates
- `onStorageUpdate`: Callback when storage changes

**Checklist**:
- [ ] Verify ItemTransferPanel updates site.storage when items transferred
- [ ] Verify transfers are saved
- [ ] Check if site.storage changes trigger panel refresh

---

## 5. Save/Restore System

### 5.1 Map Save/Restore

**File**: `src/game/world/Map.ts`

**Save**:
- Should save all sites with their storage
- Each site's `save()` method includes `storage: this.storage.save()`

**Restore**:
- Should restore all sites with their storage
- Each site's `restore()` method restores `this.storage.restore(saveObj.storage)`

**Checklist**:
- [ ] Verify Map.save() includes site storage
- [ ] Verify Map.restore() restores site storage
- [ ] Check if site storage persists across game sessions
- [ ] Verify storage format in save file

### 5.2 Save System Integration

**File**: `src/game/systems/SaveSystem.ts`

**Current Status**:
- `restoreFromSave()` doesn't restore Map/sites (TODO comment)
- Site storage restoration may not be working

**Checklist**:
- [ ] Check if Map.save() is called in saveAll()
- [ ] Check if Map.restore() is called in restoreFromSave()
- [ ] Verify site storage is included in save data
- [ ] Test save/load with site storage items

---

## 6. Investigation Checklist

### Phase 1: Code Review

- [ ] **Storage Class**
  - [ ] Compare Storage.ts with OriginalGame/src/game/Storage.js
  - [ ] Verify all methods match original functionality
  - [ ] Check weight calculation logic
  - [ ] Verify save/restore format

- [ ] **Site Storage**
  - [ ] Verify site.storage is initialized correctly
  - [ ] Check site.increaseItem() implementation
  - [ ] Verify storage is unlimited (maxWeight = null)
  - [ ] Check storage save/restore in Site.save()/restore()

- [ ] **Item Flush**
  - [ ] Review flushItems() implementation
  - [ ] Check duplicate prevention logic
  - [ ] Verify flush happens in all navigation scenarios
  - [ ] Check error handling

- [ ] **Site Storage Panel**
  - [ ] Verify panel accesses site.storage correctly
  - [ ] Check if storage updates trigger panel refresh
  - [ ] Verify ItemTransferPanel updates site.storage
  - [ ] Check if transfers are saved

- [ ] **Save/Restore**
  - [ ] Check if Map.save() includes site storage
  - [ ] Check if Map.restore() restores site storage
  - [ ] Verify save system integration
  - [ ] Test save/load with site storage

### Phase 2: Testing

- [ ] **Test 1: Work Room Item Flush**
  - [ ] Enter work room
  - [ ] Verify items appear in temp storage
  - [ ] Click "Next" button
  - [ ] Verify items appear in site storage
  - [ ] Check site storage panel

- [ ] **Test 2: Item Transfer During Work Room**
  - [ ] Enter work room
  - [ ] Transfer some items to Bag
  - [ ] Transfer some items from Bag to temp storage
  - [ ] Click "Next" button
  - [ ] Verify items in Bag stay in Bag
  - [ ] Verify items in temp storage go to site storage

- [ ] **Test 3: Site Storage Panel**
  - [ ] Open site storage panel
  - [ ] Verify items from work room appear
  - [ ] Transfer items between Bag and site storage
  - [ ] Verify transfers work correctly
  - [ ] Check if changes are saved

- [ ] **Test 4: Save/Load**
  - [ ] Add items to site storage
  - [ ] Save game
  - [ ] Load game
  - [ ] Verify site storage items persist
  - [ ] Check site storage panel

- [ ] **Test 5: Multiple Work Rooms**
  - [ ] Complete multiple work rooms in same site
  - [ ] Verify items from all rooms accumulate in site storage
  - [ ] Check site storage panel shows all items

### Phase 3: Cross-Check with Original Game

- [ ] **Compare Storage Behavior**
  - [ ] Test weight calculation
  - [ ] Test item add/remove
  - [ ] Test transfer operations
  - [ ] Compare results with original game

- [ ] **Compare Site Storage Behavior**
  - [ ] Test work room item flush
  - [ ] Test site storage panel access
  - [ ] Test item transfers
  - [ ] Compare results with original game

---

## 7. Potential Issues to Investigate

### Issue 1: Storage Sync in Site Storage Panel
**Problem**: SiteStoragePanelContent creates new Storage instance from `site.storage.save()`. If site.storage is updated elsewhere, panel may not refresh.

**Investigation**:
- Check if `useMemo` dependencies trigger refresh when site.storage changes
- Check if ItemTransferPanel updates site.storage directly
- Verify storage updates are reflected in panel

### Issue 2: Save/Restore Integration
**Problem**: SaveSystem.restoreFromSave() has TODO comment about not restoring Map/sites.

**Investigation**:
- Check if Map.save() is called in saveAll()
- Check if Map.restore() is called in restoreFromSave()
- Verify site storage is included in save data
- Test save/load functionality

### Issue 3: Error Handling in Flush
**Problem**: flushItems() doesn't have error handling around site.increaseItem().

**Investigation**:
- Check if site.increaseItem() can fail
- Add error handling if needed
- Verify items aren't lost on error

### Issue 4: Water Auto-Consumption
**Problem**: Storage.addItem() has includeWater parameter but TODO comment indicates not fully implemented.

**Investigation**:
- Check if water auto-consumption is needed for site storage
- Verify if it's only needed for player bag
- Check original game behavior

---

## 8. Files to Review

### Core Storage Files
1. `src/game/inventory/Storage.ts` - Storage class implementation
2. `OriginalGame/src/game/Storage.js` - Original storage implementation

### Site Storage Files
3. `src/game/world/Site.ts` - Site class with storage
4. `src/components/panels/SiteExploreContent.tsx` - Work room flush logic
5. `src/components/panels/SiteStoragePanelContent.tsx` - Site storage panel

### Save/Restore Files
6. `src/game/world/Map.ts` - Map save/restore
7. `src/game/systems/SaveSystem.ts` - Save system integration
8. `src/game/systems/saveSchemas.ts` - Save data schemas

### Related Files
9. `src/components/common/ItemTransferPanel.tsx` - Item transfer component
10. `SITE_EXPLORATION_ITEM_REPOSITORY_CHECK_PLAN.md` - Previous investigation

---

## 9. Testing Plan

### Manual Testing Steps

1. **Work Room Item Flush Test**:
   - Start new game or load existing save
   - Go to a site with work rooms
   - Enter work room
   - Verify items appear in temp storage
   - Click "Next" button
   - Open site storage panel
   - Verify items appear in site storage

2. **Item Transfer Test**:
   - Enter work room
   - Transfer some items to Bag
   - Transfer some items from Bag to temp storage
   - Click "Next" button
   - Verify items in Bag stay in Bag
   - Verify items in temp storage go to site storage

3. **Site Storage Panel Test**:
   - Open site storage panel
   - Verify items from work room appear
   - Transfer items between Bag and site storage
   - Verify transfers work correctly
   - Save game and reload
   - Verify items persist

4. **Save/Load Test**:
   - Add items to site storage
   - Save game
   - Load game
   - Verify site storage items persist
   - Check site storage panel

### Automated Testing (if possible)

- Create unit tests for Storage class methods
- Create integration tests for site storage flush
- Create tests for save/restore functionality

---

## 10. Next Steps

1. **High Priority**:
   - Review Storage class implementation vs original
   - Verify site storage save/restore works
   - Test work room item flush functionality
   - Check Site Storage Panel storage sync

2. **Medium Priority**:
   - Add error handling to flush logic
   - Verify ItemTransferPanel updates site.storage
   - Test save/load with site storage

3. **Low Priority**:
   - Check water auto-consumption implementation
   - Review storage sync timing issues
   - Add comprehensive logging

---

## End of Plan

This plan provides a comprehensive checklist for investigating storage implementation and site item storage. All findings should be documented and compared with the original game behavior.

