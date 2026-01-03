# Temp Storage Transfer Issue Investigation Plan

## Objective
1. Verify if temp storage has unlimited weight
2. Investigate why items can't be transferred from Bag to temp storage

---

## Question 1: Does Temp Storage Have Unlimited Weight?

### Current Implementation

**File**: `src/components/panels/SiteExploreContent.tsx` line 1351

```typescript
const tempStorage = useMemo(() => {
  const storage = new Storage('temp')
  // ... populate from room.list
  return storage
}, [room])
```

**Storage Constructor**:
```typescript
// src/game/inventory/Storage.ts
constructor(name: string, maxWeight?: number) {
  this.name = name
  this.items = {}
  this.maxWeight = maxWeight ?? null  // null = unlimited
}
```

**Analysis**:
- `tempStorage` is created as `new Storage('temp')` with **no `maxWeight` parameter**
- When `maxWeight` is not provided, it defaults to `null`
- `null` means **unlimited storage** (see `canAddItem()` line 85-86)

**Conclusion**: ✅ **YES, temp storage has unlimited weight**

---

## Question 2: Why Can't Transfer Items from Bag to Temp Storage?

### Problem Analysis

**File**: `src/components/common/ItemTransferPanel.tsx` - `handleItemClick()` function

**Current Weight Check Logic** (lines 186-208):

```typescript
// Check weight limit for target (if applicable)
const item = new Item(itemId)
const itemConfig = item.config
if (itemConfig) {
  const itemWeight = itemConfig.weight === 0 ? Math.ceil(1 / 50) : itemConfig.weight
  const currentWeight = targetStorage.getWeight()
  let maxWeight: number
  
  // Get max weight based on storage type
  // Top section shows Storage items, bottom section shows Bag items
  if (fromTop) {
    // Transferring from Storage (top section) to Bag (bottom section) - use bag max weight
    maxWeight = playerStore.getBagMaxWeight()
  } else {
    // Transferring from Bag (bottom section) to Storage (top section) - storage has unlimited weight
    maxWeight = Infinity
  }
  
  if (currentWeight + itemWeight > maxWeight) {
    // Weight limit exceeded
    return
  }
}
```

### The Bug

**Issue**: The weight check logic doesn't account for work room temp storage!

**Current Logic**:
- `if (fromTop)` → assumes transferring to Bag → uses bag max weight
- `else` → assumes transferring to Storage → unlimited

**For Work Room Storage**:
- `fromTop = true` → transferring from Bag (top) to temp storage (bottom)
- Current code sets `maxWeight = playerStore.getBagMaxWeight()` ❌ **WRONG**
- Should be `maxWeight = Infinity` because temp storage is unlimited!

**Root Cause**: The weight check happens **before** the work room storage check, and doesn't handle the work room case.

**Code Flow**:
1. Lines 163-179: Determine source/target storages (correctly handles work room)
2. Lines 186-208: Check weight limit (❌ **BUG**: doesn't handle work room)
3. Lines 210-221: Transfer items

---

## The Fix

### Solution

Update the weight check logic to account for work room temp storage:

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
      // Transferring from Bag to temp storage - temp storage is unlimited
      maxWeight = Infinity
    } else {
      // Transferring from temp storage to Bag - use bag max weight
      maxWeight = playerStore.getBagMaxWeight()
    }
  } else {
    // Regular storage (Gate panel or Site Storage panel)
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

---

## Verification

### Test Cases

1. **Transfer from Bag to Temp Storage**:
   - Should work (temp storage is unlimited)
   - Weight check should use `maxWeight = Infinity`

2. **Transfer from Temp Storage to Bag**:
   - Should work if bag has space
   - Weight check should use `maxWeight = playerStore.getBagMaxWeight()`

3. **Transfer from Bag to Home Storage**:
   - Should work (home storage is unlimited)
   - Weight check should use `maxWeight = Infinity`

4. **Transfer from Home Storage to Bag**:
   - Should work if bag has space
   - Weight check should use `maxWeight = playerStore.getBagMaxWeight()`

---

## Code References

### Temp Storage Creation
```typescript
// src/components/panels/SiteExploreContent.tsx:1351
const tempStorage = useMemo(() => {
  const storage = new Storage('temp')  // No maxWeight = unlimited
  // ...
  return storage
}, [room])
```

### Storage Constructor
```typescript
// src/game/inventory/Storage.ts:9-13
constructor(name: string, maxWeight?: number) {
  this.name = name
  this.items = {}
  this.maxWeight = maxWeight ?? null  // null = unlimited
}
```

### Weight Check in canAddItem
```typescript
// src/game/inventory/Storage.ts:84-98
canAddItem(itemId: string, count: number): boolean {
  if (this.maxWeight === null) {
    return true // Unlimited storage
  }
  // ... weight check
}
```

### Current Bug Location
```typescript
// src/components/common/ItemTransferPanel.tsx:186-208
// Weight check doesn't handle work room temp storage
if (fromTop) {
  maxWeight = playerStore.getBagMaxWeight()  // ❌ Wrong for temp storage
} else {
  maxWeight = Infinity
}
```

---

## Implementation Steps

### Step 1: Update Weight Check Logic

**File**: `src/components/common/ItemTransferPanel.tsx`

**Location**: Lines 186-208 in `handleItemClick()` function

**Change**: Add work room storage check before the existing weight logic

### Step 2: Test Transfer from Bag to Temp Storage

1. Enter work room
2. Try to transfer item from Bag (top) to temp storage (bottom)
3. Should succeed (temp storage is unlimited)

### Step 3: Test Transfer from Temp Storage to Bag

1. Enter work room
2. Transfer item from temp storage (bottom) to Bag (top)
3. Should succeed if bag has space
4. Should fail if bag is full (weight limit)

### Step 4: Verify Other Transfers Still Work

1. Gate Panel: Bag ↔ Home Storage
2. Site Storage Panel: Bag ↔ Site Storage
3. All should work as before

---

## Summary

### Question 1: Does Temp Storage Have Unlimited Weight?
✅ **YES** - Temp storage is created as `new Storage('temp')` with no `maxWeight`, which defaults to `null` (unlimited).

### Question 2: Why Can't Transfer Items from Bag to Temp Storage?
❌ **BUG** - The weight check logic in `ItemTransferPanel.handleItemClick()` doesn't account for work room temp storage. When transferring from Bag to temp storage, it incorrectly uses bag max weight instead of unlimited weight.

### Fix
Update the weight check logic to check for work room storage first, and set `maxWeight = Infinity` when transferring to temp storage.

---

## Files to Modify

1. `src/components/common/ItemTransferPanel.tsx`
   - Update `handleItemClick()` function
   - Add work room storage check in weight limit logic (lines 186-208)

---

## Testing Checklist

- [ ] Transfer from Bag to Temp Storage works
- [ ] Transfer from Temp Storage to Bag works (respects bag weight limit)
- [ ] Transfer from Bag to Home Storage still works
- [ ] Transfer from Home Storage to Bag still works
- [ ] Transfer from Bag to Site Storage still works
- [ ] Transfer from Site Storage to Bag still works
- [ ] Weight display shows correctly for Bag
- [ ] No weight display for temp storage (unlimited)

---

## End of Plan

This plan identifies the bug and provides a fix for the temp storage transfer issue.

