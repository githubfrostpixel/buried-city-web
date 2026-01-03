# ItemTransferPanel Simplify Weight Check Plan

## Objective
Simplify the weight check logic in `ItemTransferPanel.handleItemClick()` by using the Storage instances' built-in methods instead of manually calculating weight limits.

## Current Implementation

**File**: `src/components/common/ItemTransferPanel.tsx` lines 186-220

**Current Logic**:
- Manually calculates `itemWeight` and `currentWeight`
- Determines `maxWeight` based on storage type and direction:
  - Work room storage: Different logic for Bag → temp vs temp → Bag
  - Regular storage: Different logic for Storage → Bag vs Bag → Storage
- Compares `currentWeight + itemWeight > maxWeight`

**Problems**:
1. Duplicates logic that already exists in `Storage.canAddItem()`
2. Requires special handling for different storage types
3. Error-prone (as we saw with the temp storage bug)
4. Hard to maintain

---

## Proposed Solution

### Use Storage.canAddItem() Instead

The `Storage` class already has a `canAddItem()` method that:
- Checks if `maxWeight === null` (unlimited) → returns `true`
- Calculates current weight using `getWeight()`
- Calculates item weight
- Compares against `maxWeight`

**For Bag**: `Bag` class overrides `canAddItem()` to use dynamic `getMaxWeight()`

**For other storages**: Uses `maxWeight` property (null = unlimited)

### Simplified Logic

Replace the manual weight check with:

```typescript
// Check if target storage can accept the item
if (!targetStorage.canAddItem(itemId, 1)) {
  // Weight limit exceeded or invalid item
  return
}
```

This automatically handles:
- Unlimited storages (maxWeight === null)
- Limited storages (Bag with dynamic max weight)
- Weight calculations
- All storage types uniformly

---

## Implementation Plan

### Step 1: Remove Manual Weight Check

**Location**: `src/components/common/ItemTransferPanel.tsx` lines 186-220

**Remove**:
- Manual `itemWeight` calculation
- Manual `currentWeight` calculation
- Manual `maxWeight` determination based on storage type
- Manual weight comparison

**Replace with**:
- Single call to `targetStorage.canAddItem(itemId, 1)`

### Step 2: Verify Storage Instances Are Correct

Ensure that:
- `topStorageInstance` and `bottomStorageInstance` are correctly created
- For Bag: Should use `Bag` class or ensure `canAddItem()` works correctly
- For temp storage: Created as `new Storage('temp')` with `maxWeight = null` (unlimited)
- For site storage: Created as `new Storage('site')` with `maxWeight = null` (unlimited)
- For home storage: Created as `new Storage('player')` with `maxWeight = null` (unlimited)

**Note**: Currently, storage instances are created as `new Storage('player')` and restored from data. This means:
- Bag storage instance doesn't use `Bag` class
- Need to verify if `canAddItem()` will work correctly for Bag

### Step 3: Handle Bag Weight Check

**Issue**: Bag has dynamic max weight based on items in home storage.

**Current Bag Implementation**:
- `Bag` class overrides `canAddItem()` to use `getMaxWeight()`
- But `topStorageInstance` is created as `new Storage('player')`, not `new Bag()`

**Options**:
1. **Use Bag class for bag storage instance** (if topStorageName === 'Bag')
2. **Keep current approach but ensure canAddItem works** (may need to check Bag weight manually)
3. **Use playerStore.getBagMaxWeight() in canAddItem check** (hybrid approach)

**Recommended**: Option 1 - Use `Bag` class when creating bag storage instance

### Step 4: Update Code

**Before** (lines 186-220):
```typescript
// Check weight limit for target (if applicable)
const item = new Item(itemId)
const itemConfig = item.config
if (itemConfig) {
  const itemWeight = itemConfig.weight === 0 ? Math.ceil(1 / 50) : itemConfig.weight
  const currentWeight = targetStorage.getWeight()
  let maxWeight: number
  
  // Get max weight based on storage type
  if (bottomStorageName.startsWith('Work Room Type')) {
    // Work room storage: temp storage is unlimited
    if (fromTop) {
      // Transferring from Bag (top) to temp storage (bottom) - temp storage is unlimited
      maxWeight = Infinity
    } else {
      // Transferring from temp storage (bottom) to Bag (top) - use bag max weight
      maxWeight = playerStore.getBagMaxWeight()
    }
  } else {
    // Regular storage (Gate panel or Site Storage panel)
    // Top section shows Storage items, bottom section shows Bag items
    if (fromTop) {
      // Transferring from Storage (top section) to Bag (bottom section) - use bag max weight
      maxWeight = playerStore.getBagMaxWeight()
    } else {
      // Transferring from Bag (bottom section) to Storage (top section) - storage has unlimited weight
      maxWeight = Infinity
    }
  }
  
  if (currentWeight + itemWeight > maxWeight) {
    // Weight limit exceeded
    return
  }
}
```

**After**:
```typescript
// Check if target storage can accept the item (handles weight limits automatically)
if (!targetStorage.canAddItem(itemId, 1)) {
  // Weight limit exceeded or invalid item
  return
}
```

---

## Code Changes

### Change 1: Update topStorageInstance to Use Bag Class

**Location**: `src/components/common/ItemTransferPanel.tsx` lines 54-63

**Current**:
```typescript
const topStorageInstance = useMemo(() => {
  const storage = new Storage('player')
  if (topStorageName === 'Bag') {
    storage.restore(playerStore.bag)
  } else if (topStorageName === 'Storage') {
    storage.restore(playerStore.storage)
  }
  return storage
}, [topStorageName, playerStore.bag, playerStore.storage, updateTrigger])
```

**Updated**:
```typescript
const topStorageInstance = useMemo(() => {
  if (topStorageName === 'Bag') {
    const bag = new Bag()
    bag.restore(playerStore.bag)
    return bag
  } else if (topStorageName === 'Storage') {
    const storage = new Storage('player')
    storage.restore(playerStore.storage)
    return storage
  }
  return new Storage('player')
}, [topStorageName, playerStore.bag, playerStore.storage, updateTrigger])
```

**Note**: Need to import `Bag` class

### Change 2: Simplify Weight Check

**Location**: `src/components/common/ItemTransferPanel.tsx` lines 186-220

**Replace entire weight check block with**:
```typescript
// Check if target storage can accept the item (handles weight limits automatically)
if (!targetStorage.canAddItem(itemId, 1)) {
  // Weight limit exceeded or invalid item
  return
}
```

---

## Verification

### Test Cases

1. **Transfer from Bag to Temp Storage**:
   - Should work (temp storage is unlimited)
   - `targetStorage.canAddItem()` should return `true`

2. **Transfer from Temp Storage to Bag**:
   - Should work if bag has space
   - `targetStorage.canAddItem()` should check bag weight limit

3. **Transfer from Bag to Home Storage**:
   - Should work (home storage is unlimited)
   - `targetStorage.canAddItem()` should return `true`

4. **Transfer from Home Storage to Bag**:
   - Should work if bag has space
   - `targetStorage.canAddItem()` should check bag weight limit

5. **Transfer from Bag to Site Storage**:
   - Should work (site storage is unlimited)
   - `targetStorage.canAddItem()` should return `true`

6. **Transfer from Site Storage to Bag**:
   - Should work if bag has space
   - `targetStorage.canAddItem()` should check bag weight limit

7. **Transfer to Full Bag**:
   - Should fail
   - `targetStorage.canAddItem()` should return `false`

---

## Benefits

1. **Simpler Code**: Removes ~35 lines of complex weight checking logic
2. **Less Error-Prone**: Uses Storage class's built-in logic
3. **Consistent**: All storages handled the same way
4. **Maintainable**: Changes to weight logic only need to be made in Storage class
5. **Correct**: Automatically handles all storage types correctly

---

## Potential Issues

### Issue 1: Bag Class Usage

**Problem**: Need to ensure Bag class is used for bag storage instances

**Solution**: Update `topStorageInstance` creation to use `Bag` class when `topStorageName === 'Bag'`

### Issue 2: Storage Instance Updates

**Problem**: Storage instances are created from `playerStore` data, but may not reflect real-time changes

**Solution**: Current approach already handles this with `useMemo` dependencies and `updateTrigger`

### Issue 3: Dynamic Bag Weight

**Problem**: Bag max weight depends on items in home storage, which may change

**Solution**: `Bag.canAddItem()` already handles this by calling `getMaxWeight()` which checks current home storage items

---

## Files to Modify

1. `src/components/common/ItemTransferPanel.tsx`
   - Import `Bag` class
   - Update `topStorageInstance` to use `Bag` class for bag storage
   - Simplify weight check to use `targetStorage.canAddItem()`

---

## Implementation Checklist

- [ ] Import `Bag` class in ItemTransferPanel
- [ ] Update `topStorageInstance` to use `Bag` class when `topStorageName === 'Bag'`
- [ ] Replace manual weight check with `targetStorage.canAddItem(itemId, 1)`
- [ ] Remove unused `Item` and `itemConfig` variables if not needed elsewhere
- [ ] Test all transfer scenarios
- [ ] Verify weight limits work correctly for all storage types

---

## Summary

**Current Approach**: Manual weight calculation with special cases for each storage type

**Proposed Approach**: Use `Storage.canAddItem()` which handles all weight checking internally

**Benefits**: Simpler, more maintainable, less error-prone code

**Key Change**: Replace ~35 lines of weight checking logic with a single `canAddItem()` call

---

## End of Plan

This plan simplifies the weight check logic by leveraging the Storage class's built-in `canAddItem()` method, making the code cleaner and more maintainable.

