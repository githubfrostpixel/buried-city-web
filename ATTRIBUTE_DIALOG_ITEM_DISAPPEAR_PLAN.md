# Attribute Dialog Item Disappear Bug - Investigation Plan

## Problem Description

When using an item from the attribute panel (AttributeStatusDialog), all items disappear from the inventory.

## Root Cause Analysis

### Issue Location
`src/components/overlays/AttributeStatusDialog.tsx` - `handleItemUse` function (lines 215-253)

### The Bug

In `handleItemUse`, a new Storage instance is created with **maxWeight of 0**:

```215:228:src/components/overlays/AttributeStatusDialog.tsx
  const handleItemUse = (itemId: string) => {
    // Create storage instance from appropriate source
    const storage = new Storage('temp', 0)
    if (playerStore.isAtHome) {
      // Use storage items
      Object.entries(playerStore.storage).forEach(([id, count]) => {
        storage.addItem(id, count)
      })
    } else {
      // Use bag items
      Object.entries(playerStore.bag).forEach(([id, count]) => {
        storage.addItem(id, count)
      })
    }
```

**Problem**: `new Storage('temp', 0)` creates a storage with `maxWeight = 0`, which means:
1. `canAddItem()` will always return `false` for any item with weight > 0
2. All `addItem()` calls fail silently
3. The storage remains empty
4. When `useItem()` is called, it removes the item from the empty storage (which succeeds because the item was never added)
5. When `storage.save()` is called, it returns an empty object `{}`
6. The store state is updated with an empty object, causing all items to disappear

### Comparison with Working Code

In `StoragePanelContent.tsx`, the working implementation uses:

```87:92:src/components/panels/StoragePanelContent.tsx
      // Create storage instance from playerStore.storage
      const storage = new Storage('player')
      storage.restore(playerStore.storage)
      
      // Use item
      const res = playerStore.useItem(storage, data.itemId)
```

**Key differences**:
1. Uses `new Storage('player')` - no maxWeight specified, defaults to `null` (unlimited)
2. Uses `storage.restore()` instead of manually adding items with `addItem()`
3. Storage name is `'player'` which triggers automatic store updates in `useItem()`

### Storage Class Behavior

From `src/game/inventory/Storage.ts`:

```9:13:src/game/inventory/Storage.ts
  constructor(name: string, maxWeight?: number) {
    this.name = name
    this.items = {}
    this.maxWeight = maxWeight ?? null
  }
```

- If `maxWeight` is not provided, it defaults to `null` (unlimited)
- If `maxWeight` is `0`, it means 0 weight limit (can't add any items)

```84:98:src/game/inventory/Storage.ts
  canAddItem(itemId: string, count: number): boolean {
    if (this.maxWeight === null) {
      return true // Unlimited storage
    }
    
    const config = itemConfig[itemId]
    if (!config) return false
    
    const currentWeight = this.getWeight()
    const itemWeight = config.weight === 0 
      ? Math.ceil(count / 50) 
      : config.weight * count
    
    return currentWeight + itemWeight <= this.maxWeight
  }
```

When `maxWeight = 0`, `canAddItem()` will return `false` for any item with weight > 0.

### useItem Behavior

From `src/store/playerStore.ts`:

```722:750:src/store/playerStore.ts
  useItem: (storage: Storage, itemId: string) => {
    const state = get()
    
    // Validate item exists and count >= 1
    if (!storage.validateItem(itemId, 1)) {
      return { result: false, type: 1, msg: 'not enough' }
    }
    
    const item = new Item(itemId)
    const itemName = `Item ${itemId}` // TODO: Get from string system
    
    // Get time manager
    const timeManager = game.getTimeManager()
    
    // Handle by item type
    if (item.isType('11', '03')) {
      // Food items
      // Check starve max (handled by checkStarve utility before calling useItem)
      // Update time: 600 seconds = 10 minutes
      timeManager.updateTime(600)
      
      // Decrease item
      storage.removeItem(itemId, 1)
      
      // Update storage in playerStore if it's player storage
      if (storage.name === 'player') {
        const storageState = storage.save()
        set({ storage: storageState })
      }
```

**Key point**: `useItem` only automatically updates the store if `storage.name === 'player'`. For other storage names (like `'temp'`), the caller must manually update the store.

## Solution

### Fix Option 1: Use restore() instead of addItem() (Recommended)

Change `handleItemUse` to use `restore()` instead of manually adding items, and remove the maxWeight parameter:

```typescript
const handleItemUse = (itemId: string) => {
  // Create storage instance from appropriate source
  const storage = new Storage('temp')  // No maxWeight = unlimited
  if (playerStore.isAtHome) {
    // Use storage items - restore directly to avoid weight checks
    storage.restore(playerStore.storage)
  } else {
    // Use bag items
    storage.restore(playerStore.bag)
  }
  
  // Use item directly (same as original game)
  const res = playerStore.useItem(storage, itemId)
  
  // Update storage in playerStore
  // useItem already updates storage if name === 'player', but we're using 'temp'
  // So we need to manually update the store
  if (playerStore.isAtHome) {
    const storageState = storage.save()
    usePlayerStore.setState({ storage: storageState })
  } else {
    const bagState = storage.save()
    usePlayerStore.setState({ bag: bagState })
  }
  
  if (!res.result) {
    // Show error message if needed
    if (res.type === 1) {
      uiStore.addNotification('Not enough items', 'warning')
    } else if (res.type === 2) {
      uiStore.addNotification("This item can't be used", 'warning')
    }
  }
  // Dialog stays open to show updated values (user can close manually)
}
```

**Changes**:
1. Remove `0` from `new Storage('temp', 0)` → `new Storage('temp')` (unlimited weight)
2. Replace `forEach` + `addItem` with `storage.restore()` (more efficient and avoids weight checks)

### Fix Option 2: Use 'player' storage name (Alternative)

Use `'player'` as the storage name so `useItem` automatically updates the store:

```typescript
const handleItemUse = (itemId: string) => {
  // Create storage instance from appropriate source
  const storage = new Storage('player')  // Use 'player' name for auto-update
  if (playerStore.isAtHome) {
    storage.restore(playerStore.storage)
  } else {
    storage.restore(playerStore.bag)
  }
  
  // Use item - will automatically update store since name === 'player'
  const res = playerStore.useItem(storage, itemId)
  
  // No need to manually update store - useItem handles it
  
  if (!res.result) {
    // Show error message if needed
    if (res.type === 1) {
      uiStore.addNotification('Not enough items', 'warning')
    } else if (res.type === 2) {
      uiStore.addNotification("This item can't be used", 'warning')
    }
  }
}
```

**Note**: This approach has a potential issue - `useItem` always updates `storage` (not `bag`), so we'd need to modify `useItem` to handle both, or manually update the correct store after.

### Recommended Solution

**Use Fix Option 1** because:
1. It matches the pattern already used in the dialog's `useMemo` for creating storage (line 115)
2. It's explicit about which store to update (storage vs bag)
3. It doesn't require changes to `useItem` logic
4. It's consistent with the current approach of manual store updates

## Implementation Steps

1. **Fix `handleItemUse` in AttributeStatusDialog.tsx**:
   - Change `new Storage('temp', 0)` to `new Storage('temp')`
   - Replace `forEach` + `addItem` loop with `storage.restore()`
   - Keep the manual store update logic (it's correct)

2. **Test the fix**:
   - Open attribute dialog
   - Use an item from the attribute dialog
   - Verify the item count decreases by 1
   - Verify other items remain in inventory
   - Verify the dialog shows updated item counts
   - Test with both storage (at home) and bag (away from home)

3. **Verify against original game**:
   - Check that item usage from attribute dialog works correctly
   - Check that items don't disappear
   - Check that item counts update correctly

## Additional Notes

The `storage` variable created in `useMemo` (line 114) already uses the correct approach:
- `new Storage('temp')` (no maxWeight)
- `storage.restore()` to populate items

The bug is only in `handleItemUse` which creates a separate storage instance with the wrong parameters.




