# Phase 3.1: Map System - Preparation Plan

## Overview

This document provides a detailed preparation plan for implementing Phase 3.1: Map System, cross-checked with the original game implementation.

**Source File**: `OriginalGame/src/game/map.js` (141 lines)

**Target File**: `src/game/world/Map.ts`

**Status**: PLAN Mode - No code changes will be made

---

## Cross-Check with Original Game

### Original Implementation Analysis

**File**: `OriginalGame/src/game/map.js`

**Class Structure**:
```javascript
var Map = cc.Class.extend({
  ctor: function () {
    this.npcMap = {};
    this.siteMap = {};
    this.needDeleteSiteList = [];
  },
  // ... methods
})
```

**Key Properties**:
- `npcMap`: Object with NPC IDs as keys, values are `true` (unlocked status)
- `siteMap`: Object with site IDs as keys, values are Site instances
- `needDeleteSiteList`: Array of site IDs queued for deletion
- `pos`: Current player position `{x: number, y: number}` (NOT initialized in ctor, set in init())

**Key Methods**:
1. `save()`: Serializes map state
2. `restore(saveObj)`: Restores map state from save data
3. `init()`: Initializes default sites and player position
4. `forEach(func)`: Iterates over NPCs and non-closed sites
5. `unlockNpc(npcId)`: Unlocks an NPC location
6. `unlockSite(siteId)`: Creates and unlocks a new site
7. `closeSite(siteId)`: Queues a site for deletion
8. `deleteUnusableSite()`: Processes deletion queue
9. `updatePos(pos)`: Updates player position
10. `getSite(siteId)`: Retrieves site by ID
11. `resetPos()`: Resets player position to home

---

## Detailed Implementation Requirements

### 1. Class Structure

**File**: `src/game/world/Map.ts`

```typescript
export class Map {
  private npcMap: Record<number, boolean>
  private siteMap: Record<number, Site>
  private needDeleteSiteList: number[]
  public pos: { x: number; y: number }
  
  constructor() {
    this.npcMap = {}
    this.siteMap = {}
    this.needDeleteSiteList = []
    // Note: pos is NOT initialized here, set in init()
  }
}
```

**Key Differences from Original**:
- TypeScript types for all properties
- `npcMap` uses `Record<number, boolean>` instead of object with string keys
- `siteMap` uses `Record<number, Site>` for type safety
- `pos` is public (used by MapScene UI)

---

### 2. Site Type Constants

**Location**: `src/game/world/Site.ts` (already defined)

```typescript
export const HOME_SITE = 100
export const AD_SITE = 202
export const BOSS_SITE = 61
export const WORK_SITE = 204
export const GAS_SITE = 201
export const BAZAAR_SITE = 400
```

**Status**: ✅ Already implemented in `Site.ts`

---

### 3. Site Factory Pattern

**Original Logic** (lines 33-44, 99-109):
```javascript
if (siteId == AD_SITE) {
  site = new AdSite(siteId);
} else if (siteId == BOSS_SITE) {
  site = new BossSite(siteId);
} else if (siteId == WORK_SITE || siteId == GAS_SITE) {
  site = new WorkSite(siteId);
} else if (siteId == BAZAAR_SITE) {
  site = new BazaarSite(siteId);
} else {
  site = new Site(siteId);
}
```

**TypeScript Implementation**:
```typescript
private createSite(siteId: number): Site {
  if (siteId === AD_SITE) {
    return new AdSite(siteId)
  } else if (siteId === BOSS_SITE) {
    return new BossSite(siteId)
  } else if (siteId === WORK_SITE || siteId === GAS_SITE) {
    return new WorkSite(siteId)
  } else if (siteId === BAZAAR_SITE) {
    return new BazaarSite(siteId)
  } else {
    return new Site(siteId)
  }
}
```

**Status**: ✅ Site classes already exist in `Site.ts`

---

### 4. Initialization Logic

**Original** (lines 56-75):
```javascript
init: function () {
  var all;
  if (IAPPackage.isAllItemUnlocked()) {
    all = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,20,21,22,30,31,32,33,41,42,43,51,52,61,100,201,202,203,204,301,302,303,304,305,306,307,308,309,310,311,312,400,500,501,502,666];
  } else {
    all = [100, 201, 202, 204, 400];
  }
  for (var i = 0; i < all.length; i++){
    this.unlockSite(all[i]);
  }

  //根据角色决定家的位置
  var homePos = {
    "x": 45,
    "y": 50
  };
  this.getSite(100).pos = homePos;
  // 家的初始化位置
  this.pos = this.getSite(100).pos;
}
```

**TypeScript Implementation**:
```typescript
init(): void {
  const allSites: number[]
  
  if (isAllItemUnlocked()) {
    // Full unlock (IAP)
    allSites = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,20,21,22,30,31,32,33,41,42,43,51,52,61,100,201,202,203,204,301,302,303,304,305,306,307,308,309,310,311,312,400,500,501,502,666]
  } else {
    // Default sites
    allSites = [100, 201, 202, 204, 400]
  }
  
  // Unlock all sites
  for (const siteId of allSites) {
    this.unlockSite(siteId)
  }
  
  // Set home position (site 100)
  const homePos = { x: 45, y: 50 }
  const homeSite = this.getSite(HOME_SITE)
  if (homeSite) {
    homeSite.pos = homePos
    // Set player position to home
    this.pos = homeSite.pos
  } else {
    throw new Error('Home site (100) not found after initialization')
  }
}
```

**Dependencies**:
- ✅ `isAllItemUnlocked()` exists in `src/utils/iap.ts` (returns false for now)
- ✅ Site classes exist
- ⚠️ Need to ensure HOME_SITE (100) is in siteConfig

---

### 5. Save/Restore Logic

**Original Save** (lines 7-22):
```javascript
save: function () {
  var npcSaveObj = [];
  for (var npcId in this.npcMap) {
    npcSaveObj.push(npcId);
  }
  var siteSaveObj = {};
  for (var siteId in this.siteMap) {
    siteSaveObj[siteId] = this.siteMap[siteId].save();
  }
  return {
    npcMap: npcSaveObj,
    siteMap: siteSaveObj,
    pos: this.pos,
    needDeleteSiteList: this.needDeleteSiteList
  };
}
```

**Original Restore** (lines 23-54):
```javascript
restore: function (saveObj) {
  if (saveObj) {
    var self = this;
    var npcSaveObj = saveObj.npcMap;
    npcSaveObj.forEach(function (npcId) {
      self.npcMap[npcId] = true;
    });

    var siteSaveObj = saveObj.siteMap;
    for (var siteId in siteSaveObj) {
      var site;
      if (siteId == AD_SITE) {
        site = new AdSite(siteId);
      } else if (siteId == BOSS_SITE) {
        site = new BossSite(siteId);
      } else if (siteId == WORK_SITE || siteId == GAS_SITE) {
        site = new WorkSite(siteId);
      } else if (siteId == BAZAAR_SITE) {
        site = new BazaarSite(siteId);
      } else {
        site = new Site(siteId);
      }
      site.restore(siteSaveObj[siteId]);
      this.siteMap[siteId] = site;
    }

    this.pos = saveObj.pos;
    this.needDeleteSiteList = saveObj.needDeleteSiteList;

  } else {
    this.init();
  }
}
```

**TypeScript Implementation**:
```typescript
save(): MapSaveData {
  // Convert npcMap object to array of IDs
  const npcSaveObj = Object.keys(this.npcMap).map(Number)
  
  // Save all sites
  const siteSaveObj: Record<string, SiteSaveData> = {}
  for (const siteId in this.siteMap) {
    const site = this.siteMap[siteId]
    siteSaveObj[String(siteId)] = site.save()
  }
  
  return {
    npcMap: npcSaveObj,
    siteMap: siteSaveObj,
    pos: this.pos,
    needDeleteSiteList: this.needDeleteSiteList
  }
}

restore(saveObj: MapSaveData | null): void {
  if (saveObj) {
    // Restore NPCs
    this.npcMap = {}
    for (const npcId of saveObj.npcMap) {
      this.npcMap[npcId] = true
    }
    
    // Restore sites
    this.siteMap = {}
    for (const siteIdStr in saveObj.siteMap) {
      const siteId = Number(siteIdStr)
      const site = this.createSite(siteId)
      site.restore(saveObj.siteMap[siteIdStr])
      this.siteMap[siteId] = site
    }
    
    // Restore position and deletion queue
    this.pos = saveObj.pos
    this.needDeleteSiteList = saveObj.needDeleteSiteList
  } else {
    // No save data, initialize fresh
    this.init()
  }
}
```

**Save Data Types**:
```typescript
export interface MapSaveData {
  npcMap: number[]  // Array of unlocked NPC IDs
  siteMap: Record<string, SiteSaveData>  // Site ID -> Site save data
  pos: { x: number; y: number }
  needDeleteSiteList: number[]
}
```

---

### 6. forEach Method

**Original** (lines 77-86):
```javascript
forEach: function (func) {
  for (var npcId in this.npcMap) {
    func(player.npcManager.getNPC(npcId));
  }
  for (var siteId in this.siteMap) {
    if (!this.siteMap[siteId].closed && (siteId < 300 || siteId > 399)) {
      func(this.siteMap[siteId]);
    }
  }
}
```

**Key Logic**:
- Iterates over all unlocked NPCs (calls `player.npcManager.getNPC(npcId)`)
- Iterates over sites that are:
  - NOT closed
  - NOT in range 300-399 (boss sub-sites are excluded)

**TypeScript Implementation**:
```typescript
forEach(callback: (entity: Site | NPC) => void): void {
  // Iterate NPCs
  // TODO: Integrate with NPC system (Phase 5)
  // For now, skip NPC iteration or use stub
  // for (const npcId in this.npcMap) {
  //   const npc = npcManager.getNPC(npcId)
  //   callback(npc)
  // }
  
  // Iterate sites
  for (const siteId in this.siteMap) {
    const site = this.siteMap[siteId]
    const siteIdNum = Number(siteId)
    
    // Skip closed sites
    if (site.closed) continue
    
    // Skip boss sub-sites (300-399)
    if (siteIdNum >= 300 && siteIdNum <= 399) continue
    
    callback(site)
  }
}
```

**Dependencies**:
- ⚠️ NPC system (Phase 5) - can stub for now
- ✅ Site classes have `closed` property

---

### 7. unlockNpc Method

**Original** (lines 87-95):
```javascript
unlockNpc: function (npcId) {
  this.npcMap[npcId] = true;
  
  var npc = player.npcManager.getNPC(npcId);
  utils.emitter.emit("unlock_site", npc);
  player.log.addMsg(1125, npc.getName());
}
```

**TypeScript Implementation**:
```typescript
unlockNpc(npcId: number): void {
  // Mark NPC as unlocked
  this.npcMap[npcId] = true
  
  // TODO: Integrate with NPC system (Phase 5)
  // const npc = npcManager.getNPC(npcId)
  // emitter.emit("unlock_site", npc)
  // logStore.addLog(getString(1125, npc.getName()))
  
  // Stub for now:
  emitter.emit("unlock_site", { id: npcId, type: 'npc' })
  // logStore.addLog(`NPC ${npcId} unlocked`) // TODO: Use proper string ID
}
```

**Dependencies**:
- ⚠️ NPC system (Phase 5) - stub for now
- ✅ Event emitter exists in `src/utils/emitter.ts`
- ⚠️ Log system - use `useLogStore` from `src/store/logStore.ts`
- ⚠️ String localization - need string ID 1125

---

### 8. unlockSite Method

**Original** (lines 96-115):
```javascript
unlockSite: function (siteId) {
  if (!this.siteMap.hasOwnProperty(siteId)) {
    var site;
    if (siteId == AD_SITE) {
      site = new AdSite(siteId);
    } else if (siteId == BOSS_SITE) {
      site = new BossSite(siteId);
    } else if (siteId == WORK_SITE || siteId == GAS_SITE) {
      site = new WorkSite(siteId);
    } else if (siteId == BAZAAR_SITE) {
      site = new BazaarSite(siteId);
    } else {
      site = new Site(siteId);
    }
    site.init();
    this.siteMap[siteId] = site;
    utils.emitter.emit("unlock_site", site);
    player.log.addMsg(1104, site.getName());
  }
}
```

**TypeScript Implementation**:
```typescript
unlockSite(siteId: number): void {
  // Check if site already exists
  if (this.siteMap.hasOwnProperty(siteId)) {
    return  // Site already unlocked
  }
  
  // Create site using factory
  const site = this.createSite(siteId)
  
  // Initialize site (generates rooms, etc.)
  site.init()
  
  // Add to map
  this.siteMap[siteId] = site
  
  // Emit event for UI updates (MapScene listens to this)
  emitter.emit("unlock_site", site)
  
  // Add log message
  // TODO: Use proper string ID 1104
  const logStore = useLogStore.getState()
  logStore.addLog(`Site unlocked: ${site.getName()}`)
}
```

**Dependencies**:
- ✅ Site factory method
- ✅ Site classes and `init()` method
- ✅ Event emitter
- ✅ Log store
- ⚠️ String localization - need string ID 1104

---

### 9. closeSite Method

**Original** (lines 116-122):
```javascript
closeSite: function (siteId) {
  if (this.siteMap.hasOwnProperty(siteId)) {
    this.needDeleteSiteList.push(siteId);
    // 不需要处理on,暂时没有在大地图关闭site的需求
    utils.emitter.emit("close_site", siteId);
  }
}
```

**TypeScript Implementation**:
```typescript
closeSite(siteId: number): void {
  if (!this.siteMap.hasOwnProperty(siteId)) {
    return  // Site doesn't exist
  }
  
  // Queue for deletion
  this.needDeleteSiteList.push(siteId)
  
  // Emit event (MapScene may listen to this)
  emitter.emit("close_site", siteId)
}
```

**Dependencies**:
- ✅ Event emitter

---

### 10. deleteUnusableSite Method

**Original** (lines 123-131):
```javascript
deleteUnusableSite: function () {
  while (this.needDeleteSiteList.length !== 0) {
    var siteId = this.needDeleteSiteList.pop();
    var site = this.getSite(siteId);
    if (site.canClose()) {
      site.closed = true;
    }
  }
}
```

**TypeScript Implementation**:
```typescript
deleteUnusableSite(): void {
  while (this.needDeleteSiteList.length > 0) {
    const siteId = this.needDeleteSiteList.pop()!
    const site = this.getSite(siteId)
    
    if (site && site.canClose()) {
      site.closed = true
    }
    // Note: If site.canClose() returns false, site remains in queue
    // This matches original behavior
  }
}
```

**Dependencies**:
- ✅ Site `canClose()` method exists

**Note**: Sites that can't be closed remain in the queue. This matches original behavior.

---

### 11. Helper Methods

**updatePos** (line 132-134):
```typescript
updatePos(pos: { x: number; y: number }): void {
  this.pos = pos
}
```

**getSite** (line 135-137):
```typescript
getSite(siteId: number): Site | undefined {
  return this.siteMap[siteId]
}
```

**resetPos** (line 138-140):
```typescript
resetPos(): void {
  const homeSite = this.getSite(HOME_SITE)
  if (homeSite) {
    this.pos = homeSite.pos
  }
}
```

---

## Usage Patterns in Original Game

The Map is accessed via `player.map` throughout the codebase. Key usage patterns:

### Site Access
- `player.map.getSite(siteId)`: Get site by ID
- Used in: Battle.js, Build.js, npc.js, various UI nodes
- Common sites accessed:
  - `WORK_SITE` (204): Power plant status checks
  - `GAS_SITE` (201): Gas station status checks
  - `BAZAAR_SITE` (400): Shop storage access
  - `HOME_SITE` (100): Home position

### Site Operations
- `player.map.unlockSite(siteId)`: Unlock new sites (from site.js, uiUtil.js)
- `player.map.closeSite(siteId)`: Close sites (from adSiteNode.js, bossSiteNode.js, siteNode.js, workSiteNode.js)
- `player.map.deleteUnusableSite()`: Process deletion queue (from gateOutNode.js, home.js)

### Position Management
- `player.map.pos`: Current player position on map
- `player.map.updatePos(pos)`: Update position during travel (from MapNode.js)
- `player.map.resetPos()`: Reset to home (not directly called, but available)

### Iteration
- `player.map.forEach(func)`: Iterate NPCs and sites (from MapNode.js for rendering)

### Work Site Operations
- `player.map.getSite(204).fix()`: Fix power plant (from radioNode.js)
- `player.map.getSite(201).fix()`: Fix gas station (from radioNode.js)
- `player.map.getSite(204).isActive`: Check power plant status (from Build.js, Battle.js, topFrame.js)
- `player.map.getSite(201).isActive`: Check gas station status (from player.js, topFrame.js)

**Integration Points**:

### 1. PlayerStore Integration

**File**: `src/store/playerStore.ts`

**Required Changes**:
```typescript
interface PlayerStore {
  // ... existing properties
  map: Map | null  // Map instance
  
  // Actions
  initializeMap: () => void
  getMap: () => Map
}
```

**Implementation**:
```typescript
const usePlayerStore = create<PlayerStore>((set, get) => ({
  // ... existing state
  map: null,
  
  initializeMap: () => {
    const map = new Map()
    map.init()
    set({ map })
  },
  
  getMap: () => {
    const { map } = get()
    if (!map) {
      throw new Error('Map not initialized. Call initializeMap() first.')
    }
    return map
  }
}))
```

**Status**: ⚠️ Needs to be added

---

### 2. Save System Integration

**File**: `src/game/systems/saveSchemas.ts`

**Required Changes**:
```typescript
// Add MapSaveDataSchema
const MapSaveDataSchema = z.object({
  npcMap: z.array(z.number().int()),
  siteMap: z.record(z.string(), SiteSaveDataSchema),  // Note: SiteSaveDataSchema needs to be updated
  pos: z.object({
    x: z.number(),
    y: z.number()
  }),
  needDeleteSiteList: z.array(z.number().int())
})

// Update GameSaveDataSchema
const GameSaveDataSchema = z.object({
  // ... existing
  map: MapSaveDataSchema.optional()  // Optional for backward compatibility
})
```

**Status**: ⚠️ Needs to be added

**Note**: `SiteSaveDataSchema` in `saveSchemas.ts` is currently a stub. It needs to match the actual `Site.save()` return type.

**Actual Site Save Data Structure** (from `src/types/site.types.ts`):
```typescript
export interface SiteSaveData {
  pos: SiteCoordinate  // { x: number, y: number }
  step: number
  rooms: Room[]
  storage: any  // Storage save data
  secretRoomsShowedCount?: number
  isSecretRoomsEntryShowed?: boolean
  isInSecretRooms?: boolean
  secretRooms?: Room[]
  secretRoomsStep?: number
  secretRoomType?: number
  closed?: boolean
  isUnderAttacked?: boolean
  haveNewItems?: boolean
  isActive?: boolean
  fixedTime?: number
}
```

**Special Site Types**:
- `AdSiteSaveData`: Simpler structure (pos, step, storage, isActive, haveNewItems)
- `BossSiteSaveData`: Even simpler (pos, step, storage)

The Map system should handle all these types when saving/restoring.

---

### 3. Event System Integration

**File**: `src/utils/emitter.ts`

**Events Emitted**:
- `"unlock_site"`: Emitted when site or NPC is unlocked (arg: Site | NPC)
- `"close_site"`: Emitted when site is queued for deletion (arg: siteId)

**Event Listeners** (Future):
- `MapScene`: Listens to `unlock_site` to add new site markers
- `MapScene`: Listens to `close_site` to remove site markers
- `MapScene`: Listens to `weather_change` (already exists)

**Status**: ✅ Event emitter exists, events need to be documented

---

### 4. Log System Integration

**File**: `src/store/logStore.ts`

**Usage**:
```typescript
import { useLogStore } from '@/store/logStore'

const logStore = useLogStore.getState()
logStore.addLog(message)
```

**String IDs Needed**:
- `1104`: Site unlocked message (format: "Site unlocked: {siteName}")
- `1125`: NPC unlocked message (format: "NPC unlocked: {npcName}")

**Status**: ✅ Log store exists, string localization needed

---

### 5. IAP System Integration

**File**: `src/utils/iap.ts`

**Function Used**:
- `isAllItemUnlocked()`: Returns `true` if all IAP items are unlocked

**Status**: ✅ Function exists (returns `false` for now, stub)

---

## Dependencies Checklist

### ✅ Already Implemented
- [x] Site classes (`Site`, `AdSite`, `BossSite`, `WorkSite`, `BazaarSite`)
- [x] Site constants (`HOME_SITE`, `AD_SITE`, etc.)
- [x] Event emitter (`src/utils/emitter.ts`)
- [x] Log store (`src/store/logStore.ts`)
- [x] IAP stub (`isAllItemUnlocked()`)
- [x] Site `save()` and `restore()` methods
- [x] Site `canClose()` method

### ⚠️ Needs Implementation/Integration
- [ ] Map class (`src/game/world/Map.ts`)
- [ ] PlayerStore map property and methods
- [ ] Save schema for Map (`MapSaveDataSchema`)
- [ ] Site save schema update (to match actual Site.save() return)
- [ ] String localization for log messages (IDs 1104, 1125)
- [ ] NPC system stub (for `forEach` and `unlockNpc`)

### 🔮 Future Dependencies (Phase 5)
- [ ] NPC Manager (`player.npcManager.getNPC()`)
- [ ] Full NPC system integration

---

## Implementation Steps

### Step 1: Create Map Class
1. Create `src/game/world/Map.ts`
2. Implement all methods matching original logic
3. Add proper TypeScript types
4. Add error handling

### Step 2: Update Site Save Schema
1. Review `Site.save()` return type
2. Update `SiteSaveDataSchema` in `saveSchemas.ts` to match
3. Ensure all site types (AdSite, BossSite, etc.) have compatible save data

### Step 3: Add Map Save Schema
1. Add `MapSaveDataSchema` to `saveSchemas.ts`
2. Update `GameSaveDataSchema` to include map
3. Update save/load system to handle map data

### Step 4: Integrate with PlayerStore
1. Add `map` property to PlayerStore
2. Add `initializeMap()` method
3. Add `getMap()` helper method
4. Ensure map is initialized on game start

### Step 5: Add Log Integration
1. Add string IDs 1104 and 1125 to localization
2. Update `unlockSite()` and `unlockNpc()` to use proper strings
3. Test log messages appear correctly

### Step 6: Add NPC Stub
1. Create minimal NPC interface/type
2. Stub `npcManager.getNPC()` for Phase 5
3. Update `forEach()` and `unlockNpc()` to work with stub

### Step 7: Testing
1. Test map initialization (default sites)
2. Test site unlocking
3. Test site closing and deletion
4. Test save/restore
5. Test position updates
6. Test event emissions

---

## Testing Checklist

### Initialization
- [ ] Map initializes with default sites (100, 201, 202, 204, 400)
- [ ] Map initializes with all sites if IAP unlocked
- [ ] Home position is set correctly (45, 50)
- [ ] Player position is set to home

### Site Management
- [ ] `unlockSite()` creates correct site type
- [ ] `unlockSite()` emits `unlock_site` event
- [ ] `unlockSite()` adds log message
- [ ] `unlockSite()` doesn't duplicate existing sites
- [ ] `getSite()` returns correct site
- [ ] `getSite()` returns undefined for non-existent site

### Site Closing
- [ ] `closeSite()` queues site for deletion
- [ ] `closeSite()` emits `close_site` event
- [ ] `deleteUnusableSite()` closes sites that can be closed
- [ ] `deleteUnusableSite()` doesn't close sites that can't be closed
- [ ] Closed sites are excluded from `forEach()`

### Position Management
- [ ] `updatePos()` updates player position
- [ ] `resetPos()` resets to home position
- [ ] Position persists across saves

### Save/Restore
- [ ] `save()` serializes all map state
- [ ] `restore()` restores map state correctly
- [ ] `restore(null)` initializes fresh map
- [ ] NPC map saves/restores correctly
- [ ] Site map saves/restores correctly
- [ ] Position saves/restores correctly
- [ ] Deletion queue saves/restores correctly

### Iteration
- [ ] `forEach()` iterates over all unlocked NPCs (stub)
- [ ] `forEach()` iterates over non-closed sites
- [ ] `forEach()` excludes boss sub-sites (300-399)
- [ ] `forEach()` excludes closed sites

### NPC Unlocking
- [ ] `unlockNpc()` marks NPC as unlocked
- [ ] `unlockNpc()` emits `unlock_site` event
- [ ] `unlockNpc()` adds log message (stub)

---

## Notes

1. **NPC System**: NPC integration is deferred to Phase 5. For now, we'll stub the NPC manager and related functionality.

2. **String Localization**: Log messages use string IDs (1104, 1125). These need to be added to the localization system. For now, we can use placeholder strings.

3. **Site Save Schema**: The current `SiteSaveDataSchema` in `saveSchemas.ts` is a stub. It needs to be updated to match the actual return type of `Site.save()`.

4. **IAP Check**: `isAllItemUnlocked()` currently returns `false`. This is correct for the default game state. When IAP is implemented, this will return `true` for players who purchased the unlock.

5. **Position Initialization**: The original game doesn't initialize `pos` in the constructor, only in `init()`. We should match this behavior.

6. **Site Factory**: The site creation logic is duplicated in `restore()` and `unlockSite()`. We should extract it to a `createSite()` helper method.

7. **Event Emission**: The original game emits `"unlock_site"` for both sites and NPCs. The MapScene UI listens to this event to add new markers. We should maintain this behavior.

8. **Deletion Queue**: Sites that can't be closed (like WorkSite) remain in the deletion queue. This is intentional - they'll be checked again on the next `deleteUnusableSite()` call.

---

## File Structure

```
src/
  game/
    world/
      Map.ts                    # NEW: Map class
      Site.ts                   # EXISTS: Site classes
      index.ts                  # UPDATE: Export Map
  store/
    playerStore.ts              # UPDATE: Add map property
  game/systems/
    saveSchemas.ts              # UPDATE: Add MapSaveDataSchema
  utils/
    iap.ts                      # EXISTS: isAllItemUnlocked()
    emitter.ts                  # EXISTS: Event emitter
  store/
    logStore.ts                 # EXISTS: Log store
  data/
    strings/                    # UPDATE: Add string IDs 1104, 1125
```

---

## Next Steps

1. **Review this plan** and approve or request modifications
2. **Switch to ACT mode** to begin implementation
3. **Start with Step 1**: Create Map class
4. **Proceed through steps** in order
5. **Test each step** before moving to the next

---

## Cross-Reference

- **Original File**: `OriginalGame/src/game/map.js`
- **Related Plans**: 
  - `PHASE_3_IMPLEMENTATION_PLAN.md` (overview)
  - `PHASE_3_2_SITE_SYSTEM_PREPARATION_PLAN.md` (Site system)
- **Dependencies**:
  - Site System (Phase 3.2) - ✅ Complete
  - NPC System (Phase 5) - ⚠️ Stub needed

