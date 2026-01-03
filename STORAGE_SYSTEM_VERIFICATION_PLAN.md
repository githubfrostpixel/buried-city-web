# Storage System Verification Plan

## Objective
Verify understanding of storage system structure and naming.

## User's Understanding

1. **Home Storage (Unlimited)**
2. **Player Storage (Limited)**
3. **Site have 2 type of storage**:
   - **SiteStorage** (main storage | depository)
   - **SiteTempStorage** (temp storage | will be flush all to site when user click back or next)

---

## Verification Against Codebase

### 1. Home Storage (Unlimited) ✅ CORRECT

**Location**: `playerStore.storage`

**Evidence**:
- `src/store/playerStore.ts` line 37: `storage: Record<string, number>`
- `PHASE_2B_IMPLEMENTATION_PLAN.md` line 221: "**Storage**: Home storage (unlimited weight)"
- `src/components/panels/StoragePanelContent.tsx` line 50: Creates Storage instance from `playerStore.storage`
- When Storage instance is created without `maxWeight`, it defaults to `null` = unlimited
- `src/game/inventory/Storage.ts` line 85-86: `if (this.maxWeight === null) { return true // Unlimited storage }`

**Conclusion**: ✅ **CORRECT** - Home Storage is unlimited

---

### 2. Player Storage (Limited) ⚠️ NAMING CLARIFICATION NEEDED

**Location**: `playerStore.bag`

**Evidence**:
- `src/store/playerStore.ts` line 36: `bag: Record<string, number>`
- `src/game/inventory/Bag.ts`: `Bag extends Storage` with weight limit
- `Bag.getMaxWeight()`: Base 40 + bonuses from items (1305023, 1305024, 1305034)
- `Bag.canAddItem()`: Checks weight limit before adding items

**Naming Note**: 
- The term "Player Storage" might be confusing
- More accurate names:
  - **Bag** (limited weight) - what player carries
  - **Home Storage** (unlimited) - storage at home

**Conclusion**: ✅ **CORRECT** - Player Bag is limited, but naming could be clearer

---

### 3. Site Storage (Main Storage / Depository) ✅ CORRECT

**Location**: `site.storage`

**Evidence**:
- `src/game/world/Site.ts` line 98: `this.storage = new Storage('site')`
- No `maxWeight` parameter = `null` = unlimited
- `Site.increaseItem()`: Adds items to `site.storage`
- `Site.save()`: Includes `storage: this.storage.save()`
- `Site.restore()`: Restores `this.storage.restore(saveObj.storage)`

**Usage**:
- Items from work rooms are flushed to `site.storage`
- Accessible via Site Storage Panel
- Persists across game sessions (saved/restored)

**Conclusion**: ✅ **CORRECT** - Site Storage is unlimited and acts as depository

---

### 4. Site Temp Storage (Temp Storage) ✅ CORRECT

**Location**: `tempStorage` in `WorkRoomStorageView`

**Evidence**:
- `src/components/panels/SiteExploreContent.tsx` line 1350: `const tempStorage = useMemo(() => { const storage = new Storage('temp') ... })`
- Created from `room.list` (work room items)
- Used in `ItemTransferPanel` for transfer between Bag and temp storage
- `flushItems()` function (line 1408):
  - Flushes all items from `tempStorage` to `site.storage`
  - Called when user clicks "Next" button (line 1460)
  - Called when component unmounts (line 1447)
  - Uses `site.increaseItem(itemId, count)` to add to site storage

**Flush Triggers**:
1. User clicks "Next" button → `handleNextRoom()` → `flushItems()`
2. Component unmounts → cleanup effect → `flushItems()`
3. User navigates back → MainScene calls flush function

**Conclusion**: ✅ **CORRECT** - Site Temp Storage is flushed to Site Storage on back/next

---

## Complete Storage System Structure

### Player Storages

1. **Bag** (`playerStore.bag`)
   - **Type**: Limited weight
   - **Max Weight**: 40 base + bonuses (items 1305023, 1305024, 1305034)
   - **Purpose**: Items player carries
   - **Class**: `Bag extends Storage`

2. **Home Storage** (`playerStore.storage`)
   - **Type**: Unlimited
   - **Max Weight**: None (unlimited)
   - **Purpose**: Storage at home (building 13 - Storage Shelf)
   - **Class**: `Storage` (wrapped when used)

3. **Safe** (`playerStore.safe`)
   - **Type**: Limited weight (50)
   - **Max Weight**: 50 (requires building 20 level >= 0)
   - **Purpose**: Protected storage
   - **Class**: `Safe extends Storage`

### Site Storages

4. **Site Storage** (`site.storage`)
   - **Type**: Unlimited
   - **Max Weight**: None (unlimited)
   - **Purpose**: Main storage/depository for site items
   - **Class**: `Storage('site')`
   - **Access**: Via Site Storage Panel
   - **Persistence**: Saved/restored with site

5. **Site Temp Storage** (`tempStorage` in WorkRoomStorageView)
   - **Type**: Temporary (unlimited during use)
   - **Max Weight**: None (unlimited)
   - **Purpose**: Temporary storage for work room items
   - **Class**: `Storage('temp')`
   - **Lifecycle**: Created from `room.list`, flushed to `site.storage`
   - **Flush Triggers**: Next button, back button, component unmount

---

## Verification Checklist

### ✅ Correct Understandings

- [x] Home Storage is unlimited
- [x] Player Bag is limited
- [x] Site Storage is unlimited (depository)
- [x] Site Temp Storage is flushed to Site Storage on back/next

### ⚠️ Naming Clarifications

- [ ] "Player Storage" should be called "Bag" or "Player Bag" to avoid confusion
- [ ] Home Storage = `playerStore.storage` (not "Player Storage")
- [ ] Site Storage = `site.storage` (main depository)
- [ ] Site Temp Storage = `tempStorage` (temporary, flushed to site storage)

### 📝 Additional Storages

- [ ] Safe storage exists (`playerStore.safe`) - limited to 50 weight
- [ ] Safe requires building 20 (level >= 0)

---

## Code References

### Home Storage (Unlimited)
```typescript
// playerStore.storage
storage: Record<string, number>

// When used as Storage instance
const storage = new Storage('storage')  // maxWeight = null = unlimited
storage.restore(playerStore.storage)
```

### Player Bag (Limited)
```typescript
// playerStore.bag
bag: Record<string, number>

// Bag class with weight limit
class Bag extends Storage {
  getMaxWeight(): number {
    return 40 + bonuses  // Base 40 + item bonuses
  }
}
```

### Site Storage (Unlimited)
```typescript
// site.storage
this.storage = new Storage('site')  // maxWeight = null = unlimited

// Adding items
site.increaseItem(itemId, count)  // Adds to site.storage
```

### Site Temp Storage (Temporary)
```typescript
// tempStorage in WorkRoomStorageView
const tempStorage = useMemo(() => {
  const storage = new Storage('temp')  // maxWeight = null = unlimited
  // ... populate from room.list
  return storage
}, [room])

// Flush to site storage
const flushItems = () => {
  Object.entries(tempStorage.items).forEach(([itemId, count]) => {
    site.increaseItem(itemId, count)  // Flush to site.storage
  })
}
```

---

## Summary

### ✅ Your Understanding is CORRECT with Minor Naming Clarification

1. **Home Storage (Unlimited)** ✅ CORRECT
   - `playerStore.storage` - unlimited weight

2. **Player Storage (Limited)** ✅ CORRECT (but better called "Bag")
   - `playerStore.bag` - limited weight (40 base + bonuses)

3. **Site Storage (Main Storage / Depository)** ✅ CORRECT
   - `site.storage` - unlimited weight
   - Items persist here after flush

4. **Site Temp Storage (Temp Storage)** ✅ CORRECT
   - `tempStorage` in WorkRoomStorageView
   - Flushed to `site.storage` on back/next button

### 📝 Recommended Naming

To avoid confusion, use these names:
- **Bag** (not "Player Storage") - limited weight, what player carries
- **Home Storage** - unlimited, storage at home
- **Site Storage** - unlimited, site depository
- **Site Temp Storage** - temporary, flushed to site storage

---

## End of Verification

Your understanding is correct! The only suggestion is to use "Bag" instead of "Player Storage" to match the codebase naming convention.

