# ItemTransferPanel Generic Re-implementation Plan

## Objective
Re-implement `ItemTransferPanel` as a generic component that treats all `Storage` instances the same, without special-case logic for specific storage types (Bag, Storage, Depository, Work Room, etc.).

## Current Problems
1. **Special-case logic**: Component has many conditionals checking `topStorageName === 'Bag'`, `bottomStorageName === 'Depository'`, `bottomStorageName.startsWith('Work Room Type')`, etc.
2. **Complex initialization**: Creates new Storage instances internally based on storage names instead of using provided props
3. **Inconsistent data flow**: Mixes prop storage instances with playerStore data, causing confusion
4. **Hard to maintain**: Adding new storage types requires modifying the component

## Solution Overview
Make `ItemTransferPanel` a pure, generic component that:
- Accepts two non-null `Storage` instances as props (already initialized with correct data)
- Uses Storage class methods directly for all operations
- Delegates storage persistence to parent components via callbacks
- Treats all storages uniformly

---

## 1. Interface Changes

### 1.1 Props Interface

**Current**:
```typescript
interface ItemTransferPanelProps {
  topStorage: Storage // Used for reference, but we get data from playerStore based on storageName
  topStorageName: string
  bottomStorage: Storage // Used for reference, but we get data from playerStore based on storageName
  bottomStorageName: string
  showWeight?: boolean
  withTakeAll?: boolean
  siteId?: number
  onStorageUpdate?: () => void
}
```

**New**:
```typescript
interface ItemTransferPanelProps {
  topStorage: Storage // Non-null, already initialized with correct data
  topStorageName: string // Display label only
  bottomStorage: Storage // Non-null, already initialized with correct data
  bottomStorageName: string // Display label only
  showWeight?: boolean // Show weight for top storage if it has maxWeight
  withTakeAll?: boolean // Show "Take All" button
  onTopStorageUpdate?: (storage: Storage) => void // Callback to persist top storage changes
  onBottomStorageUpdate?: (storage: Storage) => void // Callback to persist bottom storage changes
  onStorageUpdate?: () => void // Optional general callback
}
```

**Key Changes**:
- Remove `siteId` prop (not needed - parent handles persistence)
- Add `onTopStorageUpdate` and `onBottomStorageUpdate` callbacks for persistence
- `topStorage` and `bottomStorage` are required and must be non-null
- Storage names are only for display

---

## 2. Component Structure

### 2.1 Storage Instance Management

**Remove**:
- All `useMemo` hooks that create new Storage instances
- All logic that checks storage names to determine how to initialize
- All logic that restores from playerStore based on storage names

**Keep**:
- Direct use of `topStorage` and `bottomStorage` props
- Refresh mechanism (updateTrigger) to re-render when storages change

**Implementation**:
```typescript
// Validate storages are non-null
if (!topStorage || !bottomStorage) {
  throw new Error('ItemTransferPanel: topStorage and bottomStorage must be non-null')
}

// Simply use props directly - no special initialization
const topItems = useMemo(() => {
  return topStorage.getItemsByType('')
}, [topStorage, updateTrigger])

const bottomItems = useMemo(() => {
  return bottomStorage.getItemsByType('')
}, [bottomStorage, updateTrigger])
```

### 2.2 Weight Display

**Current**: Special logic for Bag only
```typescript
const topWeight = showWeight && topStorageName === 'Bag' ? topStorageInstance.getWeight() : 0
const topMaxWeight = showWeight && topStorageName === 'Bag' ? playerStore.getBagMaxWeight() : 0
```

**New**: Generic logic - show weight if storage has maxWeight
```typescript
const topWeight = showWeight && topStorage.maxWeight !== null 
  ? topStorage.getWeight() 
  : 0
const topMaxWeight = showWeight && topStorage.maxWeight !== null 
  ? topStorage.maxWeight 
  : 0

// For Bag (which has dynamic maxWeight), parent should set maxWeight before passing
// Or use instanceof Bag check if needed
```

**Note**: For `Bag` class with dynamic `getMaxWeight()`, parent component should:
- Either set `bag.maxWeight = bag.getMaxWeight()` before passing
- Or we check `instanceof Bag` and use `getMaxWeight()` method

**Final approach**: Check `instanceof Bag` and use `getMaxWeight()` method (keep it generic):
```typescript
import { Bag } from '@/game/inventory/Bag'

const topMaxWeight = showWeight && topStorage.maxWeight !== null
  ? (topStorage instanceof Bag ? (topStorage as Bag).getMaxWeight() : topStorage.maxWeight)
  : 0
```

### 2.3 Item Transfer Logic

**Current**: Manual remove/add with rollback
```typescript
const removed = sourceStorage.removeItem(itemId, 1)
if (!removed) return
const added = targetStorage.addItem(itemId, 1, false)
if (!added) {
  sourceStorage.addItem(itemId, 1, false) // Rollback
  return
}
```

**New**: Use Storage's `transferItem()` method
```typescript
const handleItemClick = (itemId: string, fromTop: boolean) => {
  const sourceStorage = fromTop ? topStorage : bottomStorage
  const targetStorage = fromTop ? bottomStorage : topStorage
  
  // Use Storage.transferItem() which handles rollback automatically
  const transferred = sourceStorage.transferItem(itemId, 1, targetStorage)
  
  if (transferred) {
    // Notify parent to persist changes
    if (fromTop && onTopStorageUpdate) {
      onTopStorageUpdate(sourceStorage)
    } else if (!fromTop && onBottomStorageUpdate) {
      onBottomStorageUpdate(sourceStorage)
    }
    
    if (!fromTop && onTopStorageUpdate) {
      onTopStorageUpdate(targetStorage)
    } else if (fromTop && onBottomStorageUpdate) {
      onBottomStorageUpdate(targetStorage)
    }
    
    // Trigger re-render
    setUpdateTrigger(prev => prev + 1)
    
    // Play sound
    audioManager.playEffect(SoundPaths.EXCHANGE)
  }
}
```

**Simplification**: Since both storages change, we can call both callbacks:
```typescript
if (transferred) {
  onTopStorageUpdate?.(topStorage)
  onBottomStorageUpdate?.(bottomStorage)
  onStorageUpdate?.()
  setUpdateTrigger(prev => prev + 1)
  audioManager.playEffect(SoundPaths.EXCHANGE)
}
```

### 2.4 Take All Logic

**Current**: Special logic checking `isWorkRoom`, manual weight calculations, special site storage updates

**New**: Generic logic using Storage methods
```typescript
const handleTakeAll = () => {
  if (!withTakeAll) return
  
  const sourceStorage = bottomStorage
  const targetStorage = topStorage
  
  const allItems = sourceStorage.getItemsByType('')
  let transferred = false
  
  for (const cell of allItems) {
    const itemId = cell.item.id
    const count = cell.num
    
    // Try to transfer as many as possible
    // Storage.transferItem handles weight checks automatically
    let remaining = count
    while (remaining > 0) {
      const canTransfer = Math.min(remaining, 100) // Transfer in batches
      if (sourceStorage.transferItem(itemId, canTransfer, targetStorage)) {
        transferred = true
        remaining -= canTransfer
      } else {
        break // Can't transfer more (weight limit or other issue)
      }
    }
  }
  
  if (transferred) {
    // Notify parent to persist both storages
    onTopStorageUpdate?.(topStorage)
    onBottomStorageUpdate?.(bottomStorage)
    onStorageUpdate?.()
    setUpdateTrigger(prev => prev + 1)
    audioManager.playEffect(SoundPaths.EXCHANGE)
  }
}
```

**Note**: `transferItem()` already handles weight checks via `canAddItem()`, so we don't need manual weight calculations.

---

## 3. Parent Component Updates

### 3.1 GatePanelContent

**Current**:
```typescript
const bagStorage = useMemo(() => {
  const storage = new Storage('player')
  storage.restore(playerStore.bag)
  return storage
}, [playerStore.bag, playerStore.storage])

const storageStorage = useMemo(() => {
  const storage = new Storage('player')
  storage.restore(playerStore.storage)
  return storage
}, [playerStore.bag, playerStore.storage])

<ItemTransferPanel
  topStorage={bagStorage}
  topStorageName="Bag"
  bottomStorage={storageStorage}
  bottomStorageName="Storage"
  showWeight={true}
/>
```

**New**:
```typescript
// Use Bag class for bag to get dynamic maxWeight
const bagStorage = useMemo(() => {
  const bag = new Bag()
  bag.restore(playerStore.bag)
  return bag
}, [playerStore.bag, playerStore.storage])

const storageStorage = useMemo(() => {
  const storage = new Storage('player')
  storage.restore(playerStore.storage)
  return storage
}, [playerStore.bag, playerStore.storage])

const handleTopStorageUpdate = (storage: Storage) => {
  // Save bag back to playerStore
  playerStore.setState({ bag: storage.save() })
}

const handleBottomStorageUpdate = (storage: Storage) => {
  // Save storage back to playerStore
  playerStore.setState({ storage: storage.save() })
}

<ItemTransferPanel
  topStorage={bagStorage}
  topStorageName="Bag"
  bottomStorage={storageStorage}
  bottomStorageName="Storage"
  showWeight={true}
  onTopStorageUpdate={handleTopStorageUpdate}
  onBottomStorageUpdate={handleBottomStorageUpdate}
/>
```

### 3.2 SiteStoragePanelContent

**Current**:
```typescript
const bagStorage = useMemo(() => {
  const storage = new Storage('player')
  storage.restore(playerStore.bag)
  return storage
}, [playerStore.bag])

const siteStorage = useMemo(() => {
  const storage = new Storage('site')
  storage.restore(site.storage.save())
  return storage
}, [site, playerStore.map])

<ItemTransferPanel
  topStorage={bagStorage}
  topStorageName="Bag"
  bottomStorage={siteStorage}
  bottomStorageName="Depository"
  showWeight={true}
  withTakeAll={true}
  siteId={siteId}
  onStorageUpdate={onStorageUpdate}
/>
```

**New**:
```typescript
const bagStorage = useMemo(() => {
  const bag = new Bag()
  bag.restore(playerStore.bag)
  return bag
}, [playerStore.bag])

const siteStorage = useMemo(() => {
  const storage = new Storage('site')
  storage.restore(site.storage.save())
  return storage
}, [site, playerStore.map])

const handleTopStorageUpdate = (storage: Storage) => {
  // Save bag back to playerStore
  playerStore.setState({ bag: storage.save() })
}

const handleBottomStorageUpdate = (storage: Storage) => {
  // Save site storage back to map
  const map = playerStore.map
  if (map) {
    const site = map.getSite(siteId)
    if (site) {
      site.storage.restore(storage.save())
      // Force map update
      const mapSave = map.save()
      map.restore(mapSave)
      playerStore.setState({ map })
    }
  }
  onStorageUpdate?.()
}

<ItemTransferPanel
  topStorage={bagStorage}
  topStorageName="Bag"
  bottomStorage={siteStorage}
  bottomStorageName="Depository"
  showWeight={true}
  withTakeAll={true}
  onTopStorageUpdate={handleTopStorageUpdate}
  onBottomStorageUpdate={handleBottomStorageUpdate}
  onStorageUpdate={onStorageUpdate}
/>
```

### 3.3 SiteExploreContent (Work Room)

**Current**:
```typescript
// tempStorage is already a Storage instance from work room
<ItemTransferPanel
  topStorage={bagStorage}
  topStorageName="Bag"
  bottomStorage={tempStorage}
  bottomStorageName={workRoomTypeName}
  showWeight={true}
  withTakeAll={true}
  siteId={site.id}
/>
```

**New**:
```typescript
const handleTopStorageUpdate = (storage: Storage) => {
  // Save bag back to playerStore
  playerStore.setState({ bag: storage.save() })
}

// For work room, tempStorage is a local copy that will be flushed to site.storage later
// No need to persist tempStorage - flushItems() handles that
// So bottomStorageUpdate callback can be empty/optional
const handleBottomStorageUpdate = (storage: Storage) => {
  // No-op: tempStorage is temporary UI state, will be flushed to site.storage on Next/Back
}

<ItemTransferPanel
  topStorage={bagStorage}
  topStorageName="Bag"
  bottomStorage={tempStorage}
  bottomStorageName={workRoomTypeName}
  showWeight={true}
  withTakeAll={true}
  onTopStorageUpdate={handleTopStorageUpdate}
  onBottomStorageUpdate={handleBottomStorageUpdate} // Optional - can be empty function
/>
```

**Note**: For work room, `tempStorage` is a local copy created from `room.list`. Items transferred modify this copy, and `flushItems()` later transfers everything from `tempStorage` to `site.storage`. So `onBottomStorageUpdate` can be empty or omitted.

---

## 4. Implementation Steps

### Step 1: Update Props Interface
- Remove `siteId` prop
- Add `onTopStorageUpdate` and `onBottomStorageUpdate` callbacks (optional)
- Update TypeScript types
- Add runtime validation for non-null storages

### Step 2: Remove Special-Case Initialization
- Remove all `useMemo` hooks that create Storage instances based on storage names
- Remove all conditionals checking storage names
- Use `topStorage` and `bottomStorage` props directly
- Add validation: throw error if storages are null/undefined

### Step 3: Simplify Item Retrieval
- Use `topStorage.getItemsByType('')` and `bottomStorage.getItemsByType('')` directly
- Remove all special-case logic for different storage types

### Step 4: Update Weight Display
- Use generic logic checking `maxWeight !== null`
- Check `instanceof Bag` and use `getMaxWeight()` method for Bag class
- Import Bag class for type checking

### Step 5: Simplify Transfer Logic
- Use `Storage.transferItem()` method
- Call callbacks to persist changes
- Remove manual rollback logic (handled by `transferItem`)

### Step 6: Simplify Take All Logic
- Use `Storage.transferItem()` in a loop
- Remove manual weight calculations
- Remove special-case logic for work room vs site storage

### Step 7: Update Parent Components
- Update `GatePanelContent` to use Bag class and add callbacks
- Update `SiteStoragePanelContent` to add callbacks
- Update `SiteExploreContent` work room usage to add callbacks

### Step 8: Testing
- Test Bag <-> Storage transfer (Gate panel)
- Test Bag <-> Site Storage transfer (Site Storage panel)
- Test Bag <-> Work Room transfer (Site Explore)
- Test weight limits
- Test Take All functionality

---

## 5. Benefits

1. **Simplicity**: Component is much simpler without special-case logic
2. **Maintainability**: Adding new storage types doesn't require component changes
3. **Consistency**: All storages treated the same way
4. **Clarity**: Clear separation of concerns - component handles UI, parent handles persistence
5. **Reusability**: Component can be used with any Storage instances

---

## 6. Potential Issues and Solutions

### Issue 1: Bag Dynamic Max Weight
**Problem**: Bag has dynamic `getMaxWeight()` that depends on playerStore state
**Solution**: Check `instanceof Bag` and use `getMaxWeight()` method in component (keep it generic, no parent intervention needed)

### Issue 2: Storage Refresh
**Problem**: Component needs to refresh when storages change externally
**Solution**: Keep `updateTrigger` mechanism, or use `useEffect` to watch storage changes

### Issue 3: Work Room Temp Storage
**Problem**: Work room temp storage is a direct reference, not a copy
**Solution**: Parent can pass empty callback or just trigger re-render

### Issue 4: Storage Validation
**Problem**: Need to ensure storages are non-null
**Solution**: Add runtime validation with clear error messages at component start

---

## 7. Code Structure Summary

**ItemTransferPanel.tsx** (simplified):
- Props: `topStorage`, `bottomStorage` (non-null), names (display only), callbacks
- State: `updateTrigger` for re-renders
- Logic: Use `Storage` methods directly, no special cases
- UI: Display items, handle clicks, show weight if applicable

**Parent Components**:
- Create/restore Storage instances
- Pass to ItemTransferPanel
- Handle persistence via callbacks
- Manage any special storage logic (e.g., Bag maxWeight)

---

## 8. Clarifications Received

1. **Bag Max Weight**: ✅ Check `instanceof Bag` in ItemTransferPanel (keep it generic, no parent intervention)

2. **Storage Refresh**: ✅ Keep `updateTrigger` mechanism

3. **Work Room**: ✅ Callback can be empty/optional since tempStorage is temporary UI state

4. **Error Handling**: ✅ Add runtime validation to ensure storages are non-null

5. **Take All Batch Size**: ✅ Batch size of 100 is acceptable

---

## Next Steps

After plan approval, proceed to ACT mode to implement:
1. Update ItemTransferPanel component
2. Update all parent components
3. Test all transfer scenarios
4. Verify weight limits work correctly
5. Verify Take All works correctly

