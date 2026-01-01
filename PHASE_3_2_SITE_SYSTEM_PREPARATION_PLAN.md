# Phase 3.2: Site System - Preparation Plan (1:1 Cross-Check)

## Overview

This document provides a detailed preparation plan for implementing Phase 3.2: Site System with 1:1 accuracy against the original game. All findings are based on cross-checking `OriginalGame/src/game/site.js` and related files.

---

## 1. Core Constants

### Site Type Constants
```typescript
export const HOME_SITE = 100
export const AD_SITE = 202
export const BOSS_SITE = 61
export const WORK_SITE = 204
export const GAS_SITE = 201
export const BAZAAR_SITE = 400

export const WorkRoomTypeLen = 3
export const SecretWorkRoomTypeLen = 3
```

**Source**: `OriginalGame/src/game/site.js:7-14`

---

## 2. BaseSite Class

### Implementation Details

**Original Code**: `OriginalGame/src/game/site.js:1-5`

```typescript
export class BaseSite {
  public pos: { x: number; y: number }
  
  constructor() {
    // Random position: x: 5-25, y: 5-50
    this.pos = {
      x: getRandomInt(5, 25),
      y: getRandomInt(5, 50)
    }
  }
}
```

**Notes**:
- BaseSite is only used for random position generation
- Actual Site class overrides position with config.coordinate

---

## 3. Site Class - Core Properties

### Property List (Exact from Original)

**Source**: `OriginalGame/src/game/site.js:16-41`

```typescript
export class Site extends BaseSite {
  public id: number
  public config: SiteConfig
  public pos: { x: number; y: number }
  public storage: Storage
  public step: number
  public rooms: Room[]
  
  // Secret room properties
  public secretRoomsConfig?: SecretRoomConfig
  public secretRoomType?: number  // Random 0-2 if secretRoomsConfig exists
  public secretRoomsShowedCount: number
  public isSecretRoomsEntryShowed: boolean
  public isInSecretRooms: boolean
  public secretRooms: Room[]
  public secretRoomsStep: number
  
  // State properties
  public isUnderAttacked: boolean
  public haveNewItems: boolean
  public isActive: boolean
  public fixedTime: number
  public closed?: boolean  // Optional, set during save/restore
}
```

**Critical Details**:
1. `secretRoomType` is only set if `config.secretRoomsId` exists
2. `secretRoomsConfig` is cloned from `secretRooms[config.secretRoomsId]`
3. `fixedTime` is used for WorkSite breakdown checking
4. `closed` is optional and only appears in save data

---

## 4. Site Class - Constructor

### Implementation

**Source**: `OriginalGame/src/game/site.js:17-41`

```typescript
constructor(siteId: number) {
  super()  // BaseSite constructor (random pos)
  
  this.id = siteId
  this.config = clone(siteConfig[siteId])  // Deep clone required
  this.pos = this.config.coordinate  // Override BaseSite random pos
  this.storage = new Storage()
  this.step = 0
  this.rooms = []
  
  // Secret room initialization
  if (this.config.secretRoomsId) {
    this.secretRoomsConfig = clone(secretRooms[this.config.secretRoomsId])
    this.secretRoomType = getRandomInt(0, SecretWorkRoomTypeLen - 1)  // 0-2
  }
  this.secretRoomsShowedCount = 0
  this.isSecretRoomsEntryShowed = false
  this.isInSecretRooms = false
  this.secretRooms = []
  this.secretRoomsStep = 0
  
  // State initialization
  this.isUnderAttacked = false
  this.haveNewItems = false
  this.isActive = false
  this.fixedTime = 0
}
```

**Dependencies**:
- `siteConfig` from `data/sites.ts`
- `secretRooms` from `data/secretRooms.ts`
- `Storage` class from `game/inventory/Storage.ts`
- `clone` utility function (deep clone)

---

## 5. Room Generation - genRooms()

### Algorithm (Exact Implementation)

**Source**: `OriginalGame/src/game/site.js:184-218`

**Key Logic**:
1. Generate battle rooms and work rooms separately
2. If work rooms exist, place ONE work room at the END (last room)
3. Remaining rooms are shuffled randomly
4. Rooms are built in reverse order (unshift), so last room added is first

```typescript
genRooms(): void {
  const battleRooms = this.genBattleRoom()
  const workRooms = this.genWorkRoom()
  const roomLen = this.config.battleRoom + this.config.workRoom
  const rooms: Room[] = []
  
  // If work rooms exist, place one at the end (will be first after unshift)
  if (workRooms.length > 0) {
    const endWorkRoomIndex = getRandomInt(0, workRooms.length - 1)
    const workRoom = workRooms.splice(endWorkRoomIndex, 1)[0]
    const room: Room = {
      list: workRoom,
      type: "work",
      workType: getRandomInt(0, WorkRoomTypeLen - 1)  // 0-2
    }
    rooms.unshift(room)
    roomLen--
  }
  
  // Shuffle remaining rooms
  while (roomLen-- > 0) {
    const index = getRandomInt(0, roomLen)
    const room: Room = {}
    
    if (index > battleRooms.length - 1) {
      // Select from work rooms
      const workIndex = index - battleRooms.length
      const workRoom = workRooms.splice(workIndex, 1)[0]
      room.list = workRoom
      room.type = "work"
      room.workType = getRandomInt(0, WorkRoomTypeLen - 1)
    } else {
      // Select from battle rooms
      const battleRoom = battleRooms.splice(index, 1)[0]
      room.list = battleRoom.list
      room.type = "battle"
      room.difficulty = battleRoom.difficulty
    }
    
    rooms.unshift(room)  // Add to front (reverse order)
  }
  
  this.rooms = rooms
}
```

**Critical Details**:
- `unshift()` is used, so rooms are built in reverse order
- Last room added becomes first room
- Work room at end is guaranteed if work rooms exist
- `splice()` removes selected room from array

---

## 6. Battle Room Generation - genBattleRoom()

### Implementation

**Source**: `OriginalGame/src/game/site.js:220-227`

```typescript
genBattleRoom(): BattleRoomData[] {
  const res: BattleRoomData[] = []
  for (let i = 0; i < this.config.battleRoom; i++) {
    const diff = getRandomInt(
      this.config.difficulty[0],
      this.config.difficulty[1]
    )
    const list = getMonsterListByDifficulty(diff)
    res.push({ list, difficulty: diff })
  }
  return res
}
```

**Dependencies**:
- `getMonsterListByDifficulty(difficulty)` utility function
- Returns array of monster IDs (strings) or null
- Difficulty is clamped to site's difficulty range

**Return Type**:
```typescript
interface BattleRoomData {
  list: string[] | null  // Monster IDs
  difficulty: number
}
```

---

## 7. Work Room Generation - genWorkRoom()

### Implementation

**Source**: `OriginalGame/src/game/site.js:229-254`

```typescript
genWorkRoom(): Item[][] {
  const workRooms: Item[][] = []
  
  if (this.config.workRoom > 0) {
    // Apply IAP drop effect
    let produceValue = this.config.produceValue
    produceValue = IAPPackage.getDropEffect(produceValue)
    
    // Generate items based on produceValue and produceList
    let itemIds = getFixedValueItemIds(produceValue, this.config.produceList)
    
    // Add fixed produce items
    const fixedProduceList = this.config.fixedProduceList || []
    fixedProduceList.forEach((item) => {
      for (let i = 0; i < item.num; i++) {
        itemIds.push(item.itemId)
      }
    })
    
    // Create empty arrays for each work room
    for (let i = 0; i < this.config.workRoom; i++) {
      workRooms.push([])
    }
    
    // Distribute items randomly across work rooms
    itemIds.forEach((itemId) => {
      const index = getRandomInt(0, workRooms.length - 1)
      workRooms[index].push(itemId)
    })
    
    // Convert item IDs to Item objects
    workRooms = workRooms.map((workRoom) => {
      return convertItemIds2Item(workRoom)
    })
  }
  
  return workRooms
}
```

**Dependencies**:
- `IAPPackage.getDropEffect(produceValue)` - multiplies by 1.25 if talent 103 chosen
- `getFixedValueItemIds(produceValue, produceList)` - generates items until value is met
- `convertItemIds2Item(itemIds)` - converts string IDs to Item objects

**Critical Details**:
1. Items are distributed randomly across work rooms
2. Fixed produce items are added AFTER value-based generation
3. Each work room gets a random subset of items
4. Items are converted to Item objects at the end

---

## 8. Room Types

### Room Interface

**Based on usage in original code**:

```typescript
interface Room {
  list: string[] | Item[]  // Monster IDs for battle, Items for work
  type: "battle" | "work"
  difficulty?: number  // Only for battle rooms
  workType?: number    // Only for work rooms (0-2)
}
```

**Usage**:
- Battle rooms: `list` contains monster IDs (strings), `difficulty` is set
- Work rooms: `list` contains Item objects, `workType` is random 0-2

---

## 9. Room Progress Methods

### roomBegin()

**Source**: `OriginalGame/src/game/site.js:256-258`

```typescript
roomBegin(): Room | undefined {
  return this.rooms[this.step]
}
```

### roomEnd()

**Source**: `OriginalGame/src/game/site.js:259-271`

```typescript
roomEnd(isWin: boolean): void {
  if (isWin) {
    const doneRoom = this.roomBegin()
    if (doneRoom.type === "battle") {
      // No log message for battle rooms
    } else {
      // Log work room completion message
      player.log.addMsg(1117, stringUtil.getString(3007)[doneRoom.workType])
    }
    this.step++
    if (this.step >= this.rooms.length) {
      this.siteEnd()
    }
  }
}
```

**Critical Details**:
- Only advances if `isWin === true`
- Work rooms log message with workType (0-2)
- Battle rooms don't log completion message
- `siteEnd()` is called when all rooms cleared

---

## 10. Site Completion - siteEnd()

### Implementation

**Source**: `OriginalGame/src/game/site.js:272-285`

```typescript
siteEnd(): void {
  player.log.addMsg(1119, this.getName())
  const unlockValue = this.config.unlockValue
  
  if (unlockValue.site) {
    unlockValue.site.forEach((siteId) => {
      player.map.unlockSite(siteId)
    })
  }
  
  if (unlockValue.npc) {
    unlockValue.npc.forEach((npcId) => {
      player.npcManager.unlockNpc(npcId)
    })
  }
}
```

**Dependencies**:
- `player.map.unlockSite(siteId)` - Map system (Phase 3.1)
- `player.npcManager.unlockNpc(npcId)` - NPC system (Phase 5)
- `player.log.addMsg()` - Log system

---

## 11. Progress String Methods

### getProgressStr()

**Source**: `OriginalGame/src/game/site.js:290-296`

```typescript
getProgressStr(val: number, id: number): string {
  // Special reset logic for IAP unlocked
  if (val === 1 && this.step >= this.rooms.length && IAPPackage.isAllItemUnlocked()) {
    this.step = 0
  } else if (val === 0 && this.step >= this.rooms.length && IAPPackage.isAllItemUnlocked() && id > 300) {
    this.step = 0
  }
  return `${this.step}/${this.rooms.length}`
}
```

**Usage**:
- Called with `getProgressStr(0, this.id)` or `getProgressStr(1, this.id)`
- `val === 1`: Used in title display
- `val === 0`: Used in site node display
- Special reset logic for IAP unlocked players

### getCurrentProgressStr()

**Source**: `OriginalGame/src/game/site.js:299-301`

```typescript
getCurrentProgressStr(): string {
  return `${this.step + 1}/${this.rooms.length}`
}
```

**Usage**:
- Shows current room number (1-indexed)
- Used in battle/work node title

---

## 12. Secret Room System

### testSecretRoomsBegin()

**Source**: `OriginalGame/src/game/site.js:42-65`

```typescript
testSecretRoomsBegin(): void {
  if (!this.secretRoomsConfig) return
  
  // Check max count (can be increased by item 1305064)
  let maxCount = Number.parseInt(this.secretRoomsConfig.maxCount)
  if (player.equip.isEquiped(1305064)) {
    maxCount += 1
  }
  
  if (this.secretRoomsShowedCount < maxCount) {
    let probability = Number.parseFloat(this.secretRoomsConfig.probability)
    
    // Item 1305064 doubles probability
    if (player.equip.isEquiped(1305064)) {
      probability *= 2
    }
    
    const rand = Math.random()
    if (probability >= rand) {
      this.isSecretRoomsEntryShowed = true
      this.secretRoomsShowedCount++
      this.secretRooms = []
      this.secretRoomsStep = 0
      this.genSecretRooms()
    }
  }
}
```

**Critical Details**:
- Item 1305064 (probe) increases maxCount by 1 and doubles probability
- Probability is compared with `>=` (not `>`)
- Secret rooms are generated immediately when discovered

### genSecretRooms()

**Source**: `OriginalGame/src/game/site.js:86-129`

```typescript
genSecretRooms(): void {
  // Generate random number of rooms
  const secretRoomsLength = getRandomInt(
    this.secretRoomsConfig.minRooms,
    this.secretRoomsConfig.maxRooms
  )
  
  // Generate battle rooms (all except last)
  for (let i = 0; i < secretRoomsLength - 1; i++) {
    const diff = getRandomInt(
      this.config.difficulty[0] + this.secretRoomsConfig.minDifficultyOffset,
      this.config.difficulty[1] + this.secretRoomsConfig.maxDifficultyOffset
    )
    const clampedDiff = Math.max(1, Math.min(12, diff))  // cc.clampf(diff, 1, 12)
    const list = getMonsterListByDifficulty(clampedDiff)
    
    this.secretRooms.push({
      list: list,
      difficulty: clampedDiff,
      type: "battle"
    })
  }
  
  // Generate work room (last room)
  let produceValue = this.secretRoomsConfig.produceValue
  produceValue = IAPPackage.getDropEffect(produceValue)
  
  // Special logic for secretRoomsId === 5
  if (this.config.secretRoomsId === 5) {
    const randAdd = Math.random()
    const randItem: { itemId: string; weight: number } = { itemId: "0", weight: 0 }
    
    if (randAdd < 0.1) {
      randItem.itemId = "1107022"
    } else if (randAdd < 0.2) {
      randItem.itemId = "1107032"
    } else if (randAdd < 0.3) {
      randItem.itemId = "1107042"
    } else if (randAdd < 0.4) {
      randItem.itemId = "1107052"
    } else if (randAdd < 0.5) {
      randItem.itemId = "1107012"
    }
    
    if (randItem.itemId !== "0") {
      produceValue += 24
      this.secretRoomsConfig.produceList.push(randItem)
    }
  }
  
  const itemIds = getFixedValueItemIds(produceValue, this.secretRoomsConfig.produceList)
  const workRoom = convertItemIds2Item(itemIds)
  
  this.secretRooms.push({
    list: workRoom,
    workType: getRandomInt(0, SecretWorkRoomTypeLen - 1),  // 0-2
    type: "work"
  })
}
```

**Critical Details**:
1. Last room is always a work room
2. Difficulty is offset from site difficulty and clamped to 1-12
3. Special item logic for secretRoomsId === 5 (adds random rare item)
4. Work room uses same generation as normal work rooms

### Secret Room Methods

**Source**: `OriginalGame/src/game/site.js:66-85`

```typescript
enterSecretRooms(): void {
  this.isInSecretRooms = true
  this.isSecretRoomsEntryShowed = false
}

secretRoomBegin(): Room | undefined {
  return this.secretRooms[this.secretRoomsStep]
}

secretRoomEnd(): void {
  this.secretRoomsStep++
  if (this.isSecretRoomsEnd()) {
    this.secretRoomsEnd()
  }
}

secretRoomsEnd(): void {
  this.isInSecretRooms = false
  Medal.checkSecretRoomEnd(1)  // Achievement system
}

isSecretRoomsEnd(): boolean {
  return this.secretRoomsStep >= this.secretRooms.length
}
```

---

## 13. Special Site Types

### AdSite (ID 202)

**Source**: `OriginalGame/src/game/site.js:317-358`

```typescript
export class AdSite extends Site {
  constructor(siteId: number) {
    // Override Site constructor
    this.id = siteId
    this.config = clone(siteConfig[siteId])
    this.pos = this.config.coordinate
    this.storage = new Storage()
    this.isActive = false
    // Note: step is inherited but not initialized explicitly
  }
  
  init(): void {
    // Empty - no room generation
  }
  
  isSiteEnd(): boolean {
    return false  // Never ends
  }
  
  getProgressStr(): string {
    return "???"
  }
  
  getCurrentProgressStr(): string {
    return ""
  }
  
  save(): AdSiteSaveData {
    return {
      pos: this.pos,
      step: this.step,  // Inherited from Site
      storage: this.storage.save(),
      isActive: this.isActive,
      haveNewItems: this.haveNewItems
    }
  }
  
  restore(saveObj: AdSiteSaveData | null): void {
    if (saveObj) {
      this.pos = saveObj.pos
      this.step = saveObj.step
      this.storage.restore(saveObj.storage)
      this.isActive = saveObj.isActive
      this.haveNewItems = saveObj.haveNewItems
    } else {
      this.init()
    }
  }
}
```

**Critical Details**:
- Does NOT call `super()` in constructor
- Overrides Site properties directly
- No room generation
- Progress always shows "???"

### BazaarSite (ID 400)

**Source**: `OriginalGame/src/game/site.js:360-401`

**Implementation**: Identical to AdSite, same overrides

### WorkSite (ID 201, 204)

**Source**: `OriginalGame/src/game/site.js:403-446`

```typescript
export class WorkSite extends Site {
  canClose(): boolean {
    return false  // Can never be closed
  }
  
  fix(): void {
    this.isActive = true
    this.fixedTime = TimeManager.getTime()  // cc.timer.time
    
    if (this.id === 204) {
      // Power plant
      emitter.emit('onWorkSiteChange', this.isActive)
      player.log.addMsg(6677)
    } else {
      // Gas station (201)
      emitter.emit('onGasSiteChange', this.isActive)
      player.log.addMsg(6678)
    }
  }
  
  checkActive(): void {
    if (!this.isActive) return
    
    const intervalTime = parseInt(TimeManager.getTime() - this.fixedTime)
    let criteria: number
    let probability: number
    
    if (this.id === 204) {
      criteria = workSiteConfig.lastTime  // 96 * 60
      probability = workSiteConfig.brokenProbability  // 0.03
    } else {
      criteria = gasSiteConfig.lastTime  // 72 * 60
      probability = gasSiteConfig.brokenProbability  // 0.03
    }
    
    if (intervalTime > criteria) {
      const rand = Math.random()
      if (rand < probability) {
        this.isActive = false
        Record.saveAll()  // Auto-save
        
        if (this.id === 204) {
          emitter.emit('onWorkSiteChange', this.isActive)
          player.log.addMsg(6679)
        } else {
          emitter.emit('onGasSiteChange', this.isActive)
          player.log.addMsg(6680)
        }
      }
    }
  }
}
```

**WorkSite Config**:
```typescript
export const workSiteConfig = {
  costTime: 120,  // minutes
  needItems: [{ itemId: 1102063, num: 1 }],
  lastTime: 96 * 60,  // seconds (96 hours)
  brokenProbability: 0.03
}

export const gasSiteConfig = {
  costTime: 90,  // minutes
  needItems: [{ itemId: 1102073, num: 1 }],
  lastTime: 72 * 60,  // seconds (72 hours)
  brokenProbability: 0.03
}
```

### BossSite (ID 61)

**Source**: `OriginalGame/src/game/site.js:448-502`

```typescript
export class BossSite extends Site {
  public bossSubSiteIds: number[] = [301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312]
  
  constructor(siteId: number) {
    // Override Site constructor
    this.id = siteId
    this.config = clone(siteConfig[siteId])
    this.pos = this.config.coordinate
    this.storage = new Storage()
  }
  
  init(): void {
    // Empty - no room generation
  }
  
  isSiteEnd(): boolean {
    return false  // Never ends
  }
  
  getProgressStr(): string {
    let doneNum = 0
    this.bossSubSiteIds.forEach((siteId) => {
      const site = player.map.getSite(siteId)
      if (site) {
        doneNum++
      }
    })
    return `${doneNum}/${this.bossSubSiteIds.length}`
  }
  
  getCurrentProgressStr(): string {
    return ""
  }
  
  getAllItemNum(): number {
    let num = 0
    this.bossSubSiteIds.forEach((siteId) => {
      const site = player.map.getSite(siteId)
      if (site) {
        num += site.getAllItemNum()
      }
    })
    return num
  }
  
  save(): BossSiteSaveData {
    return {
      pos: this.pos,
      step: this.step,
      storage: this.storage.save()
    }
  }
  
  restore(saveObj: BossSiteSaveData | null): void {
    if (saveObj) {
      this.pos = saveObj.pos
      this.step = saveObj.step
      this.storage.restore(saveObj.storage)
    } else {
      this.init()
    }
  }
}
```

**Critical Details**:
- Progress tracks unlocked sub-sites (not rooms)
- `getAllItemNum()` sums items from all sub-sites
- No room generation

---

## 14. Utility Methods

### increaseItem()

**Source**: `OriginalGame/src/game/site.js:308-311`

```typescript
increaseItem(itemId: string, num: number): void {
  this.storage.increaseItem(itemId, num, false)
  this.haveNewItems = true
}
```

### getAllItemNum()

**Source**: `OriginalGame/src/game/site.js:312-314`

```typescript
getAllItemNum(): number {
  return this.storage.getAllItemNum()
}
```

### canClose()

**Source**: `OriginalGame/src/game/site.js:302-307`

```typescript
canClose(): boolean {
  if (IAPPackage.isAllItemUnlocked()) {
    return false
  }
  return this.isSiteEnd() && this.storage.isEmpty()
}
```

### getName() / getDes()

**Source**: `OriginalGame/src/game/site.js:178-183`

```typescript
getName(): string {
  return stringUtil.getString(`site_${this.id}`).name
}

getDes(): string {
  return stringUtil.getString(`site_${this.id}`).des
}
```

---

## 15. Save/Restore System

### Site.save()

**Source**: `OriginalGame/src/game/site.js:130-149`

```typescript
save(): SiteSaveData {
  return {
    pos: this.pos,
    step: this.step,
    rooms: this.rooms,
    storage: this.storage.save(),
    secretRoomsShowedCount: this.secretRoomsShowedCount,
    isSecretRoomsEntryShowed: this.isSecretRoomsEntryShowed,
    isInSecretRooms: this.isInSecretRooms,
    secretRooms: this.secretRooms,
    secretRoomsStep: this.secretRoomsStep,
    secretRoomType: this.secretRoomType,
    closed: this.closed,
    isUnderAttacked: this.isUnderAttacked,
    haveNewItems: this.haveNewItems,
    isActive: this.isActive,
    fixedTime: this.fixedTime
  }
}
```

### Site.restore()

**Source**: `OriginalGame/src/game/site.js:150-170`

```typescript
restore(saveObj: SiteSaveData | null): void {
  if (saveObj) {
    this.pos = saveObj.pos
    this.step = saveObj.step
    this.rooms = saveObj.rooms
    this.storage.restore(saveObj.storage)
    this.secretRoomsShowedCount = saveObj.secretRoomsShowedCount
    this.isSecretRoomsEntryShowed = saveObj.isSecretRoomsEntryShowed
    this.isInSecretRooms = saveObj.isInSecretRooms
    this.secretRooms = saveObj.secretRooms
    this.secretRoomsStep = saveObj.secretRoomsStep
    this.secretRoomType = saveObj.secretRoomType
    this.closed = saveObj.closed
    this.isUnderAttacked = saveObj.isUnderAttacked
    this.haveNewItems = saveObj.haveNewItems
    this.isActive = saveObj.isActive
    this.fixedTime = saveObj.fixedTime
  } else {
    this.init()  // Initialize new site
  }
}
```

**Critical Details**:
- If `saveObj` is null, calls `init()` to generate rooms
- All properties must be restored exactly

---

## 16. Required Utility Functions

### getMonsterListByDifficulty()

**Source**: `OriginalGame/src/util/utils.js:187-199`

```typescript
function getMonsterListByDifficulty(difficulty: number): string[] | null {
  const monsterListIds = Object.keys(monsterList)
  const filtered = monsterListIds.filter((mid) => {
    return monsterList[mid].difficulty === difficulty
  })
  
  if (filtered.length !== 0) {
    const monsterListId = filtered[getRandomInt(0, filtered.length - 1)]
    return monsterList[monsterListId].list  // Array of monster IDs (strings)
  } else {
    return null
  }
}
```

**Dependencies**:
- `monsterList` from `data/monsters.ts` (Phase 4)

### getFixedValueItemIds()

**Source**: `OriginalGame/src/util/utils.js:201-216`

```typescript
function getFixedValueItemIds(produceValue: number, produceList: SiteProduceItem[]): string[] {
  const itemIds: string[] = []
  
  while (produceValue > 0) {
    const itemInfo = getRoundRandom(produceList)
    const itemId = getRandomItemId(itemInfo.itemId)  // Handles wildcards
    const itemc = itemConfig[itemId]
    
    if (itemc) {
      const value = itemc.value
      produceValue -= value
      itemIds.push(itemId)
    } else {
      throw new Error(`Item not found: ${itemId}`)
    }
  }
  
  return itemIds
}
```

**Dependencies**:
- `getRoundRandom()` - weighted random selection (already exists in `utils/random.ts`)
- `getRandomItemId()` - handles wildcard item IDs (e.g., "1101**")
- `itemConfig` from `data/items.ts`

### getRandomItemId()

**Source**: `OriginalGame/src/util/utils.js:157-185`

```typescript
function getRandomItemId(itemId: string): string | null {
  if (itemId.indexOf('*') === -1) {
    return itemId  // No wildcard
  }
  
  const itemIds = Object.keys(itemConfig)
  const itemIdStr = String(itemId)
  let index = 0
  
  for (let i = 0; i < itemIdStr.length; i++) {
    if (itemIdStr[i] === '*') {
      // Skip wildcard
    } else {
      const len = index === 6 ? 1 : 2
      const flag = itemIdStr.substr(i, len)
      itemIds = itemIds.filter((iid) => {
        if (blackList.randomLoop.indexOf(Number(iid)) !== -1) {
          return false
        }
        const iidStr = String(iid)
        return flag === iidStr.substr(index, len)
      })
      i++
    }
    index += 2
  }
  
  if (itemIds.length === 0) {
    return null
  } else {
    return itemIds[getRandomInt(0, itemIds.length - 1)]
  }
}
```

**Dependencies**:
- `blackList.randomLoop` - list of item IDs to exclude (need to find/port)

### convertItemIds2Item()

**Source**: `OriginalGame/src/util/utils.js:218+`

```typescript
function convertItemIds2Item(itemIds: string[]): Item[] {
  return itemIds.map((itemId) => {
    return new Item(itemId)
  })
}
```

**Dependencies**:
- `Item` class from `game/inventory/Item.ts`

---

## 17. Required Data Files

### sites.ts

**Source**: `OriginalGame/src/data/siteConfig.js`

- Convert entire `siteConfig` object (5807 lines)
- Preserve all properties: `id`, `coordinate`, `battleRoom`, `difficulty`, `workRoom`, `produceValue`, `produceList`, `fixedProduceList`, `unlockValue`, `secretRoomsId`, `def`
- Type as `SiteConfigMap`

### secretRooms.ts

**Source**: `OriginalGame/src/data/secretRooms.js`

- Convert `secretRooms` object (6 entries)
- Properties: `id`, `maxCount`, `probability`, `minRooms`, `maxRooms`, `minDifficultyOffset`, `maxDifficultyOffset`, `produceValue`, `produceList`
- Type as `SecretRoomConfigMap`

### workSiteConfig / gasSiteConfig

**Source**: `OriginalGame/src/ui/workSiteNode.js:1-16`

```typescript
export const workSiteConfig = {
  costTime: 120,
  needItems: [{ itemId: 1102063, num: 1 }],
  lastTime: 96 * 60,
  brokenProbability: 0.03
}

export const gasSiteConfig = {
  costTime: 90,
  needItems: [{ itemId: 1102073, num: 1 }],
  lastTime: 72 * 60,
  brokenProbability: 0.03
}
```

---

## 18. Type Definitions

### Required Types

```typescript
// src/types/site.types.ts

export interface SiteCoordinate {
  x: number
  y: number
}

export interface SiteProduceItem {
  itemId: string
  weight: number
}

export interface SiteFixedProduceItem {
  itemId: string
  num: number
}

export interface SiteUnlockValue {
  site?: string[]
  npc?: number[]
}

export interface SiteConfig {
  id: number
  coordinate: SiteCoordinate
  battleRoom?: number
  difficulty?: number[]
  workRoom?: number
  produceValue?: number
  produceList?: SiteProduceItem[]
  fixedProduceList?: SiteFixedProduceItem[]
  unlockValue?: SiteUnlockValue
  secretRoomsId?: number
  def?: number
}

export type SiteConfigMap = Record<string, SiteConfig>

export interface SecretRoomConfig {
  id: number
  maxCount: string  // Stored as string, parsed to int
  probability: string  // Stored as string, parsed to float
  minRooms: number
  maxRooms: number
  minDifficultyOffset: number
  maxDifficultyOffset: number
  produceValue: number
  produceList: SiteProduceItem[]
}

export type SecretRoomConfigMap = Record<string, SecretRoomConfig>

export interface Room {
  list: string[] | Item[]  // Monster IDs or Items
  type: "battle" | "work"
  difficulty?: number
  workType?: number
}

export interface SiteSaveData {
  pos: SiteCoordinate
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

export interface AdSiteSaveData {
  pos: SiteCoordinate
  step: number
  storage: any
  isActive: boolean
  haveNewItems: boolean
}

export interface BossSiteSaveData {
  pos: SiteCoordinate
  step: number
  storage: any
}
```

---

## 19. Dependencies Checklist

### Phase 2 (Required)
- [x] `Storage` class
- [x] `Item` class
- [x] `getRoundRandom()` utility

### Phase 3.1 (Required)
- [ ] `Map` class with `unlockSite()` method
- [ ] `player.map` reference

### Phase 4 (Required for Battle Rooms)
- [ ] `getMonsterListByDifficulty()` utility
- [ ] `monsterList` data
- [ ] Monster generation system

### Phase 5 (Required for NPC Unlocking)
- [ ] `player.npcManager.unlockNpc()` method

### Other Dependencies
- [ ] `IAPPackage.getDropEffect()` - IAP system (can stub initially)
- [ ] `IAPPackage.isAllItemUnlocked()` - IAP system (can stub initially)
- [ ] `TimeManager.getTime()` - Time system
- [ ] `player.log.addMsg()` - Log system
- [ ] `stringUtil.getString()` - Localization system
- [ ] `clone()` utility - Deep clone function
- [ ] `getRandomItemId()` - Wildcard item ID resolver
- [ ] `blackList.randomLoop` - Item exclusion list
- [ ] Event emitter for `onWorkSiteChange` / `onGasSiteChange`

---

## 20. Implementation Order

### Step 1: Data Conversion
1. Convert `siteConfig.js` to `data/sites.ts`
2. Convert `secretRooms.js` to `data/secretRooms.ts`
3. Create `data/workSiteConfig.ts` with work/gas site configs

### Step 2: Utility Functions
1. Implement `getRandomItemId()` in `utils/item.ts`
2. Implement `getFixedValueItemIds()` in `utils/item.ts`
3. Implement `convertItemIds2Item()` in `utils/item.ts`
4. Implement `getMonsterListByDifficulty()` (stub for Phase 4)

### Step 3: Core Site Class
1. Create `BaseSite` class
2. Create `Site` class with all properties
3. Implement constructor
4. Implement `init()` and `genRooms()`
5. Implement `genBattleRoom()` and `genWorkRoom()`
6. Implement room progress methods
7. Implement site completion logic

### Step 4: Secret Room System
1. Implement `testSecretRoomsBegin()`
2. Implement `genSecretRooms()`
3. Implement secret room progress methods

### Step 5: Special Site Types
1. Implement `AdSite`
2. Implement `BazaarSite`
3. Implement `WorkSite` with `fix()` and `checkActive()`
4. Implement `BossSite`

### Step 6: Save/Restore
1. Implement `save()` for all site types
2. Implement `restore()` for all site types
3. Update save schema

### Step 7: Integration
1. Integrate with Map system (unlock sites)
2. Integrate with NPC system (unlock NPCs)
3. Integrate with log system
4. Integrate with event emitter

---

## 21. Critical Implementation Notes

### 1. Room Generation Order
- Rooms are built in REVERSE order using `unshift()`
- Last room added is first room
- Work room at end is guaranteed if work rooms exist

### 2. Secret Room Probability
- Probability comparison uses `>=` not `>`
- Item 1305064 doubles probability and increases maxCount

### 3. Work Room Item Distribution
- Items are distributed randomly across work rooms
- Fixed produce items are added AFTER value-based generation
- Each work room gets random subset

### 4. IAP Integration
- `getDropEffect()` multiplies produceValue by 1.25 if talent 103 chosen
- `isAllItemUnlocked()` affects progress reset and canClose logic

### 5. WorkSite Breakdown
- Checked via `checkActive()` method
- Breakdown probability is 3% after time threshold
- Auto-saves when breakdown occurs

### 6. BossSite Progress
- Tracks unlocked sub-sites, not rooms
- `getAllItemNum()` sums from all sub-sites

### 7. Save Data
- All optional properties must be included in save
- `closed` property only appears in save data
- Secret room properties are optional

---

## 22. Testing Checklist

### Basic Site Functionality
- [ ] Site initializes with correct config
- [ ] Room generation creates correct number of rooms
- [ ] Work room is always last if work rooms exist
- [ ] Room progress advances correctly
- [ ] Site completion unlocks sites/NPCs

### Secret Rooms
- [ ] Secret room discovery probability works
- [ ] Item 1305064 affects discovery
- [ ] Secret room generation creates correct rooms
- [ ] Secret room progress works
- [ ] Special logic for secretRoomsId === 5

### Special Site Types
- [ ] AdSite shows "???" progress
- [ ] BazaarSite shows "???" progress
- [ ] WorkSite can be fixed and breaks down
- [ ] BossSite tracks sub-sites correctly

### Save/Restore
- [ ] Site saves all properties
- [ ] Site restores correctly
- [ ] New site initializes if saveObj is null
- [ ] Secret rooms persist across saves

### Integration
- [ ] Site completion unlocks sites in Map
- [ ] Site completion unlocks NPCs
- [ ] Log messages appear correctly
- [ ] Event emitters fire correctly

---

## 23. Files to Create/Modify

### New Files
- `src/game/world/Site.ts` - Main Site class implementation
- `src/data/sites.ts` - Site configuration data
- `src/data/secretRooms.ts` - Secret room configuration
- `src/data/workSiteConfig.ts` - Work site configuration
- `src/utils/item.ts` - Item utility functions

### Modified Files
- `src/types/site.types.ts` - Add missing types
- `src/game/systems/saveSchemas.ts` - Add site save schemas
- `src/game/world/index.ts` - Export Site classes

---

## End of Preparation Plan

This document provides complete 1:1 cross-check details for implementing the Site System. All code snippets and logic are directly from the original game source code.

