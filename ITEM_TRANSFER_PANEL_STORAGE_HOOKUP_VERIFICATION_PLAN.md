# ItemTransferPanel Storage Hookup Verification Plan

## Objective
Verify understanding of how ItemTransferPanel hooks up storages:
- Usually Bag for top
- home, site, tmpsite for bottom

---

## User's Understanding

1. **Top Storage**: Usually Bag
2. **Bottom Storage**: Can be:
   - **home** (Home Storage)
   - **site** (Site Storage / Depository)
   - **tmpsite** (Site Temp Storage / Work Room Type)

---

## Verification Against Codebase

### ItemTransferPanel Props

**File**: `src/components/common/ItemTransferPanel.tsx`

**Props Interface**:
```typescript
interface ItemTransferPanelProps {
  topStorage: Storage // Used for reference type
  topStorageName: string
  bottomStorage: Storage // Used for reference type
  bottomStorageName: string
  showWeight?: boolean
  withTakeAll?: boolean
  siteId?: number // Site ID if bottom storage is site storage
  onStorageUpdate?: () => void
}
```

**Key Points**:
- `topStorage` and `bottomStorage` are used for **reference type only**
- Actual data comes from `playerStore` based on `topStorageName` and `bottomStorageName`
- Storage instances are created internally based on storage names

---

## Storage Hookup Patterns

### Pattern 1: Gate Panel (Home Storage)

**File**: `src/components/panels/GatePanelContent.tsx`

**Usage**:
```typescript
<ItemTransferPanel
  topStorage={bagStorage}
  topStorageName="Bag"
  bottomStorage={storageStorage}
  bottomStorageName="Storage"
  showWeight={true}
/>
```

**Storage Mapping**:
- **Top**: `Bag` → `playerStore.bag`
- **Bottom**: `Storage` → `playerStore.storage` (Home Storage)

**Verification**: ✅ **CORRECT** - Top is Bag, Bottom is Home Storage

---

### Pattern 2: Site Storage Panel (Site Depository)

**File**: `src/components/panels/SiteStoragePanelContent.tsx`

**Usage**:
```typescript
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

**Storage Mapping**:
- **Top**: `Bag` → `playerStore.bag`
- **Bottom**: `Depository` → `site.storage` (Site Storage)

**Verification**: ✅ **CORRECT** - Top is Bag, Bottom is Site Storage

---

### Pattern 3: Work Room (Site Temp Storage)

**File**: `src/components/panels/SiteExploreContent.tsx` - `WorkRoomStorageView`

**Usage**:
```typescript
<ItemTransferPanel
  topStorage={bagStorage}
  topStorageName="Bag"
  bottomStorage={tempStorage}
  bottomStorageName={workRoomTypeName}  // "Work Room Type 0/1/2"
  showWeight={true}
  withTakeAll={true}
  siteId={site.id}
/>
```

**Storage Mapping**:
- **Top**: `Bag` → `playerStore.bag`
- **Bottom**: `Work Room Type X` → `tempStorage` (Site Temp Storage)

**Verification**: ✅ **CORRECT** - Top is Bag, Bottom is Site Temp Storage

---

## ItemTransferPanel Internal Logic

### Top Storage Instance Creation

**File**: `src/components/common/ItemTransferPanel.tsx` lines 54-63

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

**Supported Top Storage Names**:
- `"Bag"` → `playerStore.bag`
- `"Storage"` → `playerStore.storage` (Home Storage)

**Current Usage**: Only `"Bag"` is used in all panels ✅

---

### Bottom Storage Instance Creation

**File**: `src/components/common/ItemTransferPanel.tsx` lines 65-94

```typescript
const bottomStorageInstance = useMemo(() => {
  // Handle site storage (Depository)
  if (bottomStorageName === 'Depository' && siteId) {
    const map = playerStore.map
    if (map) {
      const site = map.getSite(siteId)
      if (site) {
        const storage = new Storage('site')
        storage.restore(site.storage.save())
        return storage
      }
    }
    return new Storage('site')
  }
  
  // Handle work room storage (use the prop directly)
  if (bottomStorageName.startsWith('Work Room Type')) {
    return _bottomStorage  // Use prop directly for temp storage
  }
  
  // Handle regular player storage
  const storage = new Storage('player')
  if (bottomStorageName === 'Bag') {
    storage.restore(playerStore.bag)
  } else if (bottomStorageName === 'Storage') {
    storage.restore(playerStore.storage)
  }
  return storage
}, [bottomStorageName, playerStore.bag, playerStore.storage, playerStore.map, siteId, updateTrigger, _bottomStorage])
```

**Supported Bottom Storage Names**:
1. `"Depository"` → `site.storage` (Site Storage) - requires `siteId`
2. `"Work Room Type X"` → `tempStorage` (Site Temp Storage) - uses prop directly
3. `"Storage"` → `playerStore.storage` (Home Storage)
4. `"Bag"` → `playerStore.bag` (not typically used for bottom)

**Current Usage**:
- `"Storage"` - Gate Panel (Home Storage) ✅
- `"Depository"` - Site Storage Panel (Site Storage) ✅
- `"Work Room Type X"` - Work Room (Site Temp Storage) ✅

---

## Summary of Storage Hookup Patterns

### ✅ Verified Patterns

| Panel | Top Storage | Bottom Storage | Storage Name |
|-------|------------|---------------|--------------|
| **Gate Panel** | Bag | Home Storage | `"Storage"` |
| **Site Storage Panel** | Bag | Site Storage | `"Depository"` |
| **Work Room** | Bag | Site Temp Storage | `"Work Room Type X"` |

### Pattern Consistency

**Top Storage**: 
- ✅ Always `"Bag"` in all current implementations
- ✅ Maps to `playerStore.bag`

**Bottom Storage**:
- ✅ `"Storage"` → Home Storage (`playerStore.storage`)
- ✅ `"Depository"` → Site Storage (`site.storage`)
- ✅ `"Work Room Type X"` → Site Temp Storage (`tempStorage`)

---

## Verification Checklist

### ✅ Correct Understandings

- [x] Top storage is usually Bag
- [x] Bottom storage can be Home Storage (`"Storage"`)
- [x] Bottom storage can be Site Storage (`"Depository"`)
- [x] Bottom storage can be Site Temp Storage (`"Work Room Type X"`)

### 📝 Additional Notes

- [ ] Top storage is **always** Bag in current implementations
- [ ] Bottom storage name determines which storage is used:
  - `"Storage"` → Home Storage
  - `"Depository"` → Site Storage (requires `siteId`)
  - `"Work Room Type X"` → Site Temp Storage (uses prop directly)
- [ ] Storage props (`topStorage`, `bottomStorage`) are used for reference type only
- [ ] Actual data comes from `playerStore` or `site.storage` based on storage names

---

## Code References

### Gate Panel (Home Storage)
```typescript
// src/components/panels/GatePanelContent.tsx
<ItemTransferPanel
  topStorage={bagStorage}
  topStorageName="Bag"
  bottomStorage={storageStorage}
  bottomStorageName="Storage"  // Home Storage
  showWeight={true}
/>
```

### Site Storage Panel (Site Depository)
```typescript
// src/components/panels/SiteStoragePanelContent.tsx
<ItemTransferPanel
  topStorage={bagStorage}
  topStorageName="Bag"
  bottomStorage={siteStorage}
  bottomStorageName="Depository"  // Site Storage
  showWeight={true}
  withTakeAll={true}
  siteId={siteId}
/>
```

### Work Room (Site Temp Storage)
```typescript
// src/components/panels/SiteExploreContent.tsx
<ItemTransferPanel
  topStorage={bagStorage}
  topStorageName="Bag"
  bottomStorage={tempStorage}
  bottomStorageName={workRoomTypeName}  // "Work Room Type X"
  showWeight={true}
  withTakeAll={true}
  siteId={site.id}
/>
```

---

## Internal Storage Resolution Logic

### Top Storage Resolution
```typescript
// ItemTransferPanel.tsx lines 54-63
if (topStorageName === 'Bag') {
  storage.restore(playerStore.bag)
} else if (topStorageName === 'Storage') {
  storage.restore(playerStore.storage)
}
```

### Bottom Storage Resolution
```typescript
// ItemTransferPanel.tsx lines 65-94
if (bottomStorageName === 'Depository' && siteId) {
  // Site Storage
  const site = map.getSite(siteId)
  storage.restore(site.storage.save())
} else if (bottomStorageName.startsWith('Work Room Type')) {
  // Site Temp Storage - use prop directly
  return _bottomStorage
} else if (bottomStorageName === 'Storage') {
  // Home Storage
  storage.restore(playerStore.storage)
} else if (bottomStorageName === 'Bag') {
  // Bag (not typically used for bottom)
  storage.restore(playerStore.bag)
}
```

---

## Summary

### ✅ Your Understanding is CORRECT

1. **Top Storage**: Usually Bag ✅
   - Always `"Bag"` in current implementations
   - Maps to `playerStore.bag`

2. **Bottom Storage**: Can be:
   - **Home Storage** (`"Storage"`) ✅
     - Used in Gate Panel
     - Maps to `playerStore.storage`
   - **Site Storage** (`"Depository"`) ✅
     - Used in Site Storage Panel
     - Maps to `site.storage`
     - Requires `siteId` prop
   - **Site Temp Storage** (`"Work Room Type X"`) ✅
     - Used in Work Room
     - Uses `tempStorage` prop directly
     - Flushed to site storage on back/next

### 📝 Naming Conventions

- `"Bag"` → Player Bag (`playerStore.bag`)
- `"Storage"` → Home Storage (`playerStore.storage`)
- `"Depository"` → Site Storage (`site.storage`)
- `"Work Room Type X"` → Site Temp Storage (`tempStorage`)

---

## End of Verification

Your understanding is **100% CORRECT**! The ItemTransferPanel consistently uses:
- **Top**: Bag
- **Bottom**: Home Storage, Site Storage, or Site Temp Storage (depending on context)

