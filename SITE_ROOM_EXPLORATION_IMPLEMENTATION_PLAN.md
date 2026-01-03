# Site Room Exploration Implementation Plan

## Overview

This plan covers implementing the site room exploration system, which allows players to explore rooms within a site. Each room can be either a battle room (monster encounter) or a work room (resource gathering). Since battle mechanics are already working, this focuses on creating the UI flow and integrating with the existing battle system.

**Status**: PLAN Mode - No code changes will be made

**Component Naming**:
- Main component: `SiteExploreContent` (not `BattleAndWorkPanelContent`)
- Panel action: `siteExplore` (not `battleAndWork`)
- UI store state: `siteExplorePanelSiteId` (not `battleAndWorkPanelSiteId`)

**Layout References**:
- **Battle layout**: Follow `src/components/panels/BattlePanelContent.tsx` structure
  - Battle Begin View: Lines 189-321
  - Battle Process View: Lines 324-486
  - Battle End View: Lines 488-571
- **Work layout**: Use `COCOS_TO_CSS_POSITION_MAPPING.md` for Cocos to CSS position conversion
- **WorkRoomStorage layout**: Follow `src/components/panels/GatePanelContent.tsx` structure (lines 71-125)
  - **Note**: WorkRoomStorage is part of `SiteExploreContent` (not a separate panel) for consistency

**Original Game Reference**: 
- `OriginalGame/src/ui/battleAndWorkNode.js` - Main room exploration UI (665 lines)
- `OriginalGame/src/ui/workRoomStorageNode.js` - Work room item collection UI
- `OriginalGame/src/game/site.js` - Site room logic (roomBegin, roomEnd, etc.)

**Current Implementation**:
- ✅ `Site.ts` class with room generation and progression logic
- ✅ `SitePanelContent.tsx` with "Enter" button
- ✅ `Battle.ts` and `BattlePanelContent.tsx` for combat
- ❌ No `SiteExploreContent` component
- ❌ No work room UI
- ❌ No room exploration flow integration

**Target Implementation**: Complete room exploration flow matching original game 1:1

---

## Architecture Overview

### Flow Diagram

```
SitePanel (site overview)
  ↓ [Click "Enter"]
SiteExploreContent (room exploration)
  ↓
  ├─ Battle Room Flow:
  │   ├─ Battle Begin View (monster image, difficulty, equipment check)
  │   ├─ Battle Process (integrate with BattlePanelContent)
  │   └─ Battle End View (results, rewards, next room)
  │
  ├─ Work Room Flow:
  │   ├─ Work Begin View (work image, tool selection)
  │   ├─ Work Process (progress bar, time-based)
  │   └─ Work Room Storage (collect items from room.list)
  │
  └─ Secret Room Flow:
      ├─ Secret Room Entry View (discovery)
      └─ Same as normal rooms but tracks secretRoomsStep
```

### Component Structure

```
SiteExploreContent
├─ State Management:
│   ├─ Current room (from site.roomBegin() or site.secretRoomBegin())
│   ├─ View mode: 'begin' | 'battle' | 'work' | 'end' | 'secretEntry'
│   └─ Battle result (if battle completed)
│
├─ Views:
│   ├─ SecretRoomEntryView
│   ├─ BattleBeginView
│   ├─ BattleProcessView (uses BattlePanelContent)
│   ├─ BattleEndView
│   ├─ WorkBeginView
│   ├─ WorkProcessView
│   └─ WorkRoomStorageView (manual item transfer panel)
│
└─ Integration:
    ├─ Site.roomBegin() / site.secretRoomBegin()
    ├─ Site.roomEnd() / site.secretRoomEnd()
    ├─ Site.testSecretRoomsBegin()
    ├─ Battle system (existing)
    └─ Work room item collection
```

---

## 1. SiteExploreContent Component

### 1.1 Component Structure

**File**: `src/components/panels/SiteExploreContent.tsx`

**Props**:
```typescript
interface SiteExploreContentProps {
  site: Site
  onBack?: () => void  // Called when leaving room exploration
}
```

**State**:
```typescript
type ViewMode = 
  | 'secretEntry'      // Secret room discovery
  | 'battleBegin'       // Battle room preparation
  | 'battleProcess'     // Battle in progress
  | 'battleEnd'         // Battle results
  | 'workBegin'         // Work room tool selection
  | 'workProcess'       // Work in progress
  | 'workStorage'       // Work room item collection (manual transfer)
  | 'siteEnd'           // All rooms completed

interface ComponentState {
  viewMode: ViewMode
  currentRoom: Room | undefined
  battleResult?: BattleResult  // From battle completion
  selectedToolId?: string      // For work rooms
  workProgress?: number        // 0-100 for work progress bar
}
```

**Key Methods**:
- `updateView()`: Determines current view based on site state
- `handleBattleStart()`: Starts battle process
- `handleBattleEnd()`: Processes battle results, advances room
- `handleWorkStart()`: Starts work process with selected tool
- `handleWorkComplete()`: Advances room, shows storage
- `handleNextRoom()`: Moves to next room or completes site

---

## 2. Battle Room Flow

### 2.1 Battle Begin View

**Source**: `OriginalGame/src/ui/battleAndWorkNode.js:171-290`
**Reference Layout**: Follow `src/components/panels/BattlePanelContent.tsx` structure (lines 189-321)

**Layout** (matching BattlePanelContent):
- **Image Stack** (top, fixed position):
  - Bottom layer: `npc_dig_bg.png` (500px width)
  - Middle layer: `monster_dig_mid_bg.png` (centered on npc_dig_bg)
  - Top layer: `monster_dig_{difficulty}.png` or `bandit_dig_{difficulty}.png` (for site 500)
- **Content Area** (below image):
  - Equipment label: String 1041 ("Equipment")
  - Equipment icons: Gun, weapon, tool icons (40px each) with counts below
  - Difficulty label: String 1042 + difficulty (red if > 2, or difficulty + 5 for bandits)
  - Warnings (if applicable):
    - No weapon warning (String 1207) - red text
    - Alcohol effect warning (String 1325) - red text, if within 12 hours
    - Low vigour warning (String 1206) - red text
  - Bullet priority selector: If gun equipped and has both bullet types (exchange button)
- **Start Button**: String 1044 ("Start Battle") at bottom

**Implementation**:
```typescript
function BattleBeginView({ 
  room, 
  site, 
  onStartBattle 
}: {
  room: Room
  site: Site
  onStartBattle: () => void
}) {
  // Follow BattlePanelContent layout structure:
  // 1. Image stack (npc_dig_bg + monster_dig_mid_bg + monster_dig)
  // 2. Content area with equipment, difficulty, warnings
  // 3. Start battle button
}
```

**Critical Details**:
- Follow exact layout from `BattlePanelContent.tsx` (begin view, lines 189-321)
- Image stack structure: `npc_dig_bg.png` (bottom) → `monster_dig_mid_bg.png` (middle) → `monster_dig_{difficulty}.png` (top)
- Image position: `digDesY = content.top - 40`, centered horizontally
- Content area position: `contentAreaTop = imageBottom - 120` (below image)
- Site ID 500 = bandits (different sprites and strings, difficulty + 5)
- Site ID 502 = melee only (no gun selection)
- Difficulty > 2 shows in red
- Bullet priority only shows if gun + both bullet types available
- Equipment icons: 40px each, with counts below for gun/bombs

---

### 2.2 Battle Process View

**Source**: `OriginalGame/src/ui/battleAndWorkNode.js:291-407`
**Reference Layout**: Follow `src/components/panels/BattlePanelContent.tsx` structure (lines 324-486)

**Integration**: Use existing `BattlePanelContent` component or replicate its structure

**Layout** (matching BattlePanelContent):
- Image stack: Same as battle begin view (npc_dig_bg + monster_dig_mid_bg + monster_dig)
- Battle log area: 7 lines of log text (String 1041 label), 200px height
- Progress bar: Monster count progress (pb_bg.png + pb.png), centered horizontally
- Monster count label: String 1139 or 9139 (for site 500) + "X/Total", above progress bar
- Escape button: Centered below progress bar (only for room/site battles)

**Flow**:
1. Disable left button (back)
2. Create Battle instance: `new Battle({ id: 0, monsterList: room.list }, false, room.difficulty, false, false)`
3. Show BattlePanelContent overlay
4. Listen for battle end event
5. On battle end:
   - Call `site.roomEnd(sumRes.win)` or `site.secretRoomEnd()`
   - Call `site.testSecretRoomsBegin()` (for normal rooms)
   - Wait 2 seconds
   - Show battle end view
   - Re-enable left button

**Implementation**:
```typescript
function BattleProcessView({ 
  room, 
  site, 
  onBattleEnd 
}: {
  room: Room
  site: Site
  onBattleEnd: (result: BattleResult) => void
}) {
  // Show battle log area
  // Show progress bar
  // Integrate with BattlePanelContent
  // Handle battle completion
}
```

**Critical Details**:
- Battle log updates via event emitter: `battleProcessLog`
- Monster count updates via event emitter: `battleMonsterLength`
- Progress = (total - remaining) / total * 100

---

### 2.3 Battle End View

**Source**: `OriginalGame/src/ui/battleAndWorkNode.js:408-491`
**Reference Layout**: Follow `src/components/panels/BattlePanelContent.tsx` structure (lines 488-571)

**Layout** (matching BattlePanelContent):
- Description: String 1118 (normal) or 9118 (site 500)
- Consumed items label: String 1058
- Consumed items display: Rich text showing bullets, homemade bullets, tools, fuel
- Damage label: String 1059 + HP loss + virus gain
- Broken weapons: String 1208 + list of broken weapon icons
- Next button: String 1060 ("Next")

**Implementation**:
```typescript
function BattleEndView({ 
  result, 
  onNext 
}: {
  result: BattleResult
  onNext: () => void
}) {
  // Show consumed items
  // Show damage/virus
  // Show broken weapons
  // Next button advances to next room
}
```

**Critical Details**:
- Apply virus damage: `player.changeAttr("virus", sumRes.totalVirus)`
- Check weapon breaking: `player.bag.testWeaponBroken(itemId, 0, 1)`
- Auto-save after battle: `Record.saveAll()`
- Check breakdown after battle: `player.checkBreakdown(8112)`

---

## 3. Work Room Flow

### 3.1 Work Begin View

**Source**: `OriginalGame/src/ui/battleAndWorkNode.js:492-569`
**Position Mapping**: Use `COCOS_TO_CSS_POSITION_MAPPING.md` for Cocos to CSS conversion

**Layout** (following original game positioning):
- Work image: `work_dig_{workType}.png` (0-2) or `work_dig_3.png` (special case site 666, last room)
  - Position: Convert from original Cocos coordinates using position mapping
  - Size: Match original sprite dimensions
- Description: String 3008[workType] or String 8102 (site 666, last room)
  - Position: Below work image, centered
- Tool selection buttons: Horizontal row of tool icons
  - Hand (Equipment.HAND) - always first
  - Tools from bag (type 1302, with effect_tool)
  - Each button shows: icon + time label (String 1062 + time + "m")
  - Button size: `btn_tool.png` frame
  - Spacing: Evenly distributed across width
  - Position: Convert from original Cocos coordinates

**Tool Time Calculation**:
- Hand: 45 minutes
- Tool: `itemConfig[itemId].effect_tool.workingTime`
- Apply vigour effect: `time *= player.vigourEffect()`

**Implementation**:
```typescript
function WorkBeginView({ 
  room, 
  site, 
  onToolSelect 
}: {
  room: Room
  site: Site
  onToolSelect: (toolId: string, time: number) => void
}) {
  // Show work image
  // Show tool selection buttons
  // Calculate time for each tool
  // Handle tool selection
}
```

**Critical Details**:
- Special case: Site 666, last room → EndStoryScene (game ending)
- Tools filtered by type 1302 and must have `effect_tool`
- Time displayed in minutes

---

### 3.2 Work Process View

**Source**: `OriginalGame/src/ui/battleAndWorkNode.js:570-617`
**Position Mapping**: Use `COCOS_TO_CSS_POSITION_MAPPING.md` for Cocos to CSS conversion

**Layout** (following original game positioning):
- Progress bar: `pb_bg.png` + `pb.png` (horizontal bar)
  - Position: Convert from original Cocos coordinates
  - Size: Match original sprite dimensions
- Progress updates: 0-100% based on elapsed time
- Time-based: Uses `cc.timer.addTimerCallback()` with acceleration (use TimeManager)

**Flow**:
1. Disable left button
2. Start timer: `time * 60` seconds (convert minutes to seconds)
3. Update progress bar: `passTime / time * 100`
4. Accelerate time: `cc.timer.accelerateWorkTime(time)` (use TimeManager)
5. On completion:
   - Check weapon breaking: `player.bag.testWeaponBroken(itemId, 0, 1)`
   - Auto-save: `Record.saveAll()`
   - Navigate to WorkRoomStorageView (manual item transfer)
   - Re-enable left button

**Implementation**:
```typescript
function WorkProcessView({ 
  time, 
  toolId, 
  onComplete 
}: {
  time: number  // in minutes
  toolId: string
  onComplete: () => void
}) {
  // Show progress bar
  // Use TimeManager for time acceleration
  // Update progress
  // Handle completion
}
```

**Critical Details**:
- Time is in minutes, converted to seconds for timer
- Time acceleration should use TimeManager system
- Weapon breaking check uses tool itemId

---

### 3.3 Work Room Storage View

**Source**: `OriginalGame/src/ui/workRoomStorageNode.js`
**Reference Layout**: Follow `src/components/panels/GatePanelContent.tsx` structure (lines 71-125)

**Layout** (following GatePanelContent pattern exactly):
- **EquipPanel** (top section):
  - Position: Top of content area (same as GatePanelContent)
  - Size: `572 × 125` pixels
  - Shows equipment slots
- **ItemTransferPanel** (bottom section):
  - Position: Below EquipPanel
  - Size: `596 × 400` pixels
  - Top storage: `player.bag` (label: String 1034 - "Bag")
  - Bottom storage: Temporary storage containing items from `room.list` (label: String 3007[workType] - work room type name)
  - `showWeight: true` (for bag)
  - `withTakeAll: true`
  - `siteId: site.id` (for site storage integration)
- **Next Room Button** (bottom):
  - Position: Bottom of panel (String 1060 - "Next")
  - On click: Flush remaining items to site storage, then advance to next room

**Flow**:
1. After work process completes, set viewMode to `'workStorage'` (stays in SiteExploreContent)
2. Create temporary Storage object
3. Add all items from `room.list` to temporary storage
4. Show EquipPanel + ItemTransferPanel with:
   - Top: Player bag
   - Bottom: Temporary storage (work room items)
5. Player can transfer items:
   - From temp storage → bag
   - From temp storage → site storage (via ItemTransferPanel siteId prop)
6. When "Next Room" button clicked:
   - Call `flushItems()`: Transfer all remaining items in temp storage to `site.increaseItem()`
   - Auto-save: `Record.saveAll()`
   - Advance to next room (update viewMode to show next room)

**Implementation**:
```typescript
function WorkRoomStorageView({ 
  room, 
  site, 
  onNextRoom 
}: {
  room: Room
  site: Site
  onNextRoom: () => void
}) {
  // Create temporary storage with items from room.list
  const tempStorage = useMemo(() => {
    const storage = new Storage('temp')
    if (room.type === 'work' && Array.isArray(room.list)) {
      room.list.forEach((item: Item) => {
        storage.increaseItem(item.id, item.num || 1, false)
      })
    }
    return storage
  }, [room])
  
  // Flush items to site storage
  const flushItems = () => {
    tempStorage.forEach((item, num) => {
      site.increaseItem(item.id, num, false)
    })
    // Record.saveAll()
  }
  
  const handleNextRoom = () => {
    flushItems()
    onNextRoom()
  }
  
  // Use same layout structure as GatePanelContent
  const { content } = BOTTOM_BAR_LAYOUT
  const equipPanelTop = content.top
  const equipPanelHeight = 125
  const separatorHeight = 10
  const itemTransferPanelTop = equipPanelTop + equipPanelHeight + separatorHeight
  
  return (
    <div className="relative w-full h-full">
      {/* EquipPanel at top - same as GatePanelContent */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: `${equipPanelTop}px`,
          transform: 'translateX(-50%)',
          width: '572px',
          height: `${equipPanelHeight}px`,
          zIndex: 1,
          overflow: 'visible'
        }}
      >
        <EquipPanel />
      </div>
      
      {/* ItemTransferPanel below - same as GatePanelContent */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: `${itemTransferPanelTop}px`,
          transform: 'translateX(-50%)',
          width: '596px',
          height: '400px',
          zIndex: 0
        }}
      >
        <ItemTransferPanel
          topStorage={bagStorage}
          topStorageName="Bag"
          bottomStorage={tempStorage}
          bottomStorageName={getWorkRoomTypeName(room.workType)}
          showWeight={true}
          withTakeAll={true}
          siteId={site.id}
        />
      </div>
      
      {/* Next Room button - positioned at bottom */}
      <div
        className="absolute"
        style={{
          left: '50%',
          bottom: '20px',
          transform: 'translateX(-50%)',
        }}
      >
        <CommonListItemButton
          text="Next"
          onClick={handleNextRoom}
          enabled={true}
        />
      </div>
    </div>
  )
}
```

**Critical Details**:
- Follow exact layout structure from `GatePanelContent.tsx` (lines 71-125)
- EquipPanel: Top of content area, `572 × 125` pixels, centered horizontally
- Separator: Below EquipPanel (optional visual separator)
- ItemTransferPanel: Below separator, `596 × 400` pixels, centered horizontally
- Temporary storage is created from `room.list` items
- Items can be transferred to bag OR site storage (via ItemTransferPanel `siteId` prop)
- Remaining items in temp storage are flushed to `site.increaseItem()` when clicking "Next Room"
- Title: String 3007[workType] (work room type name) - shown in ItemTransferPanel bottomStorageName
- Auto-save after flushing items
- Use same positioning calculations as GatePanelContent (equipPanelTop, itemTransferPanelTop)
- **This view is part of SiteExploreContent** - no separate panel routing needed
- "Next Room" button advances to next room by updating viewMode (stays in same panel)

---

## 4. Secret Room Flow

### 4.1 Secret Room Entry View

**Source**: `OriginalGame/src/ui/battleAndWorkNode.js:123-169`

**Layout**:
- Background: `site_dig_secret.png` with `monster_dig_mid_bg.png` overlay
- Title: String 3012[secretRoomType] (0-2)
- Description: String 3013[secretRoomType]
- Progress: "???" (hidden)
- Two buttons:
  - btn1: String 1193 ("Leave") - exits secret room entry
  - btn2: String 1204 ("Enter") - enters secret rooms

**Flow**:
- If "Leave": Hide entry, return to normal room
- If "Enter": Call `site.enterSecretRooms()`, show first secret room

**Implementation**:
```typescript
function SecretRoomEntryView({ 
  site, 
  onLeave, 
  onEnter 
}: {
  site: Site
  onLeave: () => void
  onEnter: () => void
}) {
  // Show secret room entry UI
  // Handle leave/enter
}
```

**Critical Details**:
- Left button hidden when entry is shown
- Entry disappears after entering or leaving
- Secret room type is random 0-2

---

### 4.2 Secret Room Progression

**Same as normal rooms** but:
- Uses `site.secretRoomBegin()` instead of `site.roomBegin()`
- Uses `site.secretRoomEnd()` instead of `site.roomEnd()`
- Uses `site.isInSecretRooms` flag
- Shows secret room title: String 3012[secretRoomType]
- Progress shows "???"

**Secret Room End**:
- When all secret rooms cleared: `site.secretRoomsEnd()`
- Returns to normal rooms
- Shows warning dialog if leaving early

---

## 5. Integration Points

### 5.1 SitePanel Integration

**File**: `src/components/panels/SitePanelContent.tsx`

**Modify** `onExploreClick` handler:
```typescript
onExploreClick={() => {
  // Navigate to SiteExploreContent
  uiStore.openPanelAction('siteExplore', undefined, site.id)
}}
```

**Add to MainScene**:
```typescript
case 'siteExplore': {
  const siteId = uiStore.siteExplorePanelSiteId
  if (siteId) {
    const playerStore = usePlayerStore.getState()
    const map = playerStore.getMap()
    if (map) {
      const site = map.getSite(siteId)
      if (site) {
        return (
          <BottomBar
            title={site.getName()}
            leftSubtext={site.isInSecretRooms ? "???" : site.getCurrentProgressStr()}
            rightSubtext={String(site.storage.getAllItemNum())}
            leftBtn={true}
            onLeftClick={() => {
              // Handle back with secret room warning if needed
              uiStore.openPanelAction('site', undefined, siteId)
            }}
          >
            <SiteExploreContent site={site} />
          </BottomBar>
        )
      }
    }
  }
  return <div>Site not found</div>
}
```

**Note**: WorkRoomStorage view is part of `SiteExploreContent` (viewMode: 'workStorage'), so no separate panel routing is needed.
```

---

### 5.2 Battle System Integration

**File**: `src/components/panels/BattlePanelContent.tsx`

**Already exists** - just need to:
- Show as overlay during battle process
- Listen for battle end event
- Return result to SiteExploreContent

**Event Flow**:
```typescript
// In SiteExploreContent
const handleBattleStart = () => {
  const battle = new Battle({
    id: 0,
    monsterList: room.list as string[]
  }, false, room.difficulty!, false, false)
  
  battle.setGameEndListener((sumRes) => {
    handleBattleEnd(sumRes)
  })
  
  // Show BattlePanelContent overlay or replicate its structure
  setViewMode('battleProcess')
}

const handleBattleEnd = (result: BattleResult) => {
  // Process result
  // Advance room
  // Show end view
}
```

**Note**: Can either:
1. Use `BattlePanelContent` component directly as overlay
2. Replicate `BattlePanelContent` structure within `SiteExploreContent` for seamless flow

---

### 5.3 Site Room Progression

**Methods to use**:
- `site.roomBegin()`: Get current room
- `site.roomEnd(isWin)`: Complete current room, advance step
- `site.secretRoomBegin()`: Get current secret room
- `site.secretRoomEnd()`: Complete current secret room, advance
- `site.testSecretRoomsBegin()`: Check for secret room discovery
- `site.enterSecretRooms()`: Enter secret rooms
- `site.isSiteEnd()`: Check if all rooms cleared
- `site.siteEnd()`: Handle site completion (unlocks, etc.)

**Room Advancement Logic**:
```typescript
const handleWorkComplete = () => {
  // After work process completes, show WorkRoomStorageView (stays in SiteExploreContent)
  setViewMode('workStorage')
}

const handleWorkStorageNext = () => {
  // Called from WorkRoomStorageView "Next Room" button (within SiteExploreContent)
  // flushItems() already called in WorkRoomStorageView
  // Now advance room (stays in same panel, just updates viewMode)
  if (site.isInSecretRooms) {
    site.secretRoomEnd()
    if (site.isSecretRoomsEnd()) {
      // Secret rooms complete, return to normal
      site.secretRoomsEnd()
      updateView()
    } else {
      // Next secret room
      updateView()
    }
  } else {
    site.roomEnd(true)  // Work rooms always succeed
    site.testSecretRoomsBegin()  // Check for secret room
    if (site.isSiteEnd()) {
      // Site complete
      setViewMode('siteEnd')
    } else {
      // Next room
      updateView()
    }
  }
}

const handleRoomComplete = (isWin: boolean) => {
  // For battle rooms
  if (site.isInSecretRooms) {
    site.secretRoomEnd()
    if (site.isSecretRoomsEnd()) {
      site.secretRoomsEnd()
      updateView()
    } else {
      updateView()
    }
  } else {
    site.roomEnd(isWin)
    if (isWin) {
      site.testSecretRoomsBegin()  // Check for secret room
    }
    if (site.isSiteEnd()) {
      setViewMode('siteEnd')
    } else {
      updateView()
    }
  }
}
```

---

## 6. UI Components Needed

### 6.1 Progress Bar Component

**File**: `src/components/common/ProgressBar.tsx` (may already exist)

**Props**:
```typescript
interface ProgressBarProps {
  progress: number  // 0-100
  width?: number
  height?: number
  showLabel?: boolean
}
```

**Sprites**:
- Background: `pb_bg.png`
- Fill: `pb.png`

---

### 6.2 Tool Button Component

**File**: `src/components/common/ToolButton.tsx`

**Props**:
```typescript
interface ToolButtonProps {
  itemId: string
  time: number  // in minutes
  onClick: () => void
}
```

**Layout**:
- Background: `btn_tool.png`
- Icon: `icon_item_{itemId}.png` (scaled 0.5)
- Label below: Time in minutes

---

### 6.3 Rich Text Component (Item Display)

**File**: `src/components/common/ItemRichText.tsx` (may need to create)

**Purpose**: Display multiple items inline (for battle end view)

**Props**:
```typescript
interface ItemRichTextProps {
  items: Array<{ itemId: string; num: number }>
  maxWidth: number
  spacing?: number
  scale?: number
}
```

---

## 7. State Management

### 7.1 UI Store Updates

**File**: `src/store/uiStore.ts`

**Add**:
```typescript
siteExplorePanelSiteId: number | null
```

**Actions**:
```typescript
openSiteExplorePanel: (siteId: number) => void
closeSiteExplorePanel: () => void
```

**Note**: WorkRoomStorage is part of `SiteExploreContent` (viewMode: 'workStorage'), so no separate panel state is needed.

---

### 7.2 Player Store Integration

**Methods needed**:
- `player.bag.testWeaponBroken(itemId, 0, 1)`: Check weapon breaking
- `player.changeAttr("virus", amount)`: Apply virus damage
- `player.checkBreakdown(8112)`: Check for breakdown after battle
- `player.vigourEffect()`: Get vigour effect multiplier
- `player.equip.getEquip(EquipmentPos.GUN)`: Get equipped gun
- `player.equip.isEquiped(itemId)`: Check if item equipped
- `player.bag.getNumByItemId(itemId)`: Get item count
- `player.bag.getItemsByType(type)`: Get items by type

---

## 8. String IDs Needed

**From original game**:
- 1041: "Equipment" / "装备"
- 1042: "Difficulty" / "难度"
- 1044: "Start Battle" / "开始战斗"
- 1058: "Consumed" / "消耗"
- 1059: "Damage" / "伤害"
- 1060: "Next" / "下一步"
- 1062: "Time" / "时间"
- 1118: "Battle Complete" / "战斗结束"
- 1139: "Monster" / "怪物"
- 1193: "Leave" / "离开"
- 1204: "Enter" / "进入"
- 1206: "Low Vigour" / "精力不足"
- 1207: "No Weapon" / "没有武器"
- 1208: "Broken Weapon" / "武器损坏"
- 1228: "Confirm" / "确认"
- 1229: "Leave Secret Room?" / "离开密室？"
- 1325: "Alcohol Effect" / "酒精效果"
- 3007: Work room type names [0-2]
- 3008: Work room descriptions [0-2]
- 3009: Battle difficulty descriptions [0-11]
- 3012: Secret room titles [0-2]
- 3013: Secret room descriptions [0-2]
- 5000: Progress template (title.txt_1, title.txt_2)
- 8102: Special work description (site 666)
- 8112: Breakdown check ID
- 9059: Bandit difficulty descriptions [0-11]
- 9118: "Bandit Battle Complete" / "强盗战斗结束"
- 9139: "Bandit" / "强盗"

---

## 9. Implementation Checklist

### Phase 1: Core Component Structure
- [ ] Create `SiteExploreContent.tsx`
- [ ] Implement state management (viewMode, currentRoom, etc.)
- [ ] Implement `updateView()` method
- [ ] Add to MainScene routing
- [ ] Update UI store with `siteExplorePanelSiteId`

### Phase 2: Battle Room Flow
- [ ] Implement `BattleBeginView` (follow `BattlePanelContent.tsx` lines 189-321)
- [ ] Implement `BattleProcessView` (follow `BattlePanelContent.tsx` lines 324-486)
- [ ] Implement `BattleEndView` (follow `BattlePanelContent.tsx` lines 488-571)
- [ ] Handle battle result processing
- [ ] Test battle room progression

### Phase 3: Work Room Flow
- [ ] Implement `WorkBeginView` with tool selection (use `COCOS_TO_CSS_POSITION_MAPPING.md` for positioning)
- [ ] Implement `WorkProcessView` with progress bar (use `COCOS_TO_CSS_POSITION_MAPPING.md` for positioning)
- [ ] Implement `WorkRoomStorageView` within `SiteExploreContent` following `GatePanelContent.tsx` structure (lines 71-125)
- [ ] Create temporary storage from room.list items
- [ ] Implement flushItems() to transfer remaining items to site storage
- [ ] Add "Next Room" button (stays in SiteExploreContent, updates viewMode)
- [ ] Handle work room time calculation
- [ ] Test work room progression (all within same panel)

### Phase 4: Secret Room Flow
- [ ] Implement `SecretRoomEntryView`
- [ ] Integrate secret room progression
- [ ] Handle secret room end
- [ ] Test secret room flow

### Phase 5: Integration & Polish
- [ ] Connect SitePanel "Enter" button
- [ ] Handle site completion
- [ ] Add all string IDs
- [ ] Test full flow (battle → work → secret → completion)
- [ ] Cross-check with original game

---

## 10. Testing Scenarios

### Basic Flow
1. Click site on map → SitePanel opens
2. Click "Enter" → SiteExploreContent opens (same panel)
3. First room (battle) → Battle begin view
4. Start battle → Battle process → Battle end
5. Next room (work) → Work begin view
6. Select tool → Work process → WorkRoomStorageView (transfer items, stays in SiteExploreContent) → Click "Next Room" → Next room or site end

### Secret Room Flow
1. Complete room → Secret room entry appears
2. Click "Enter" → Secret room battle/work
3. Complete all secret rooms → Return to normal
4. Complete site → Site completion

### Edge Cases
- Site with no rooms (should not show "Enter")
- Site already completed (should show site end)
- Leaving secret room early (warning dialog)
- Battle loss (no room advancement)
- Weapon breaking during work
- Low vigour warnings
- Alcohol effect warnings

---

## 11. Files to Create/Modify

### New Files
- `src/components/panels/SiteExploreContent.tsx` - Main component (includes WorkRoomStorageView as part of viewMode: 'workStorage')
- `src/components/common/ToolButton.tsx` - Tool selection button
- `src/components/common/ItemRichText.tsx` - Inline item display (for battle end view)

### Modified Files
- `src/components/panels/SitePanelContent.tsx` - Add onExploreClick handler
- `src/components/scenes/MainScene.tsx` - Add `siteExplore` panel case
- `src/store/uiStore.ts` - Add `siteExplorePanelSiteId` state
- `src/data/strings/en.ts` - Add all string IDs
- `src/data/strings/zh.ts` - Add all string IDs

---

## 12. Dependencies

### Required Systems
- ✅ Site system (room generation, progression)
- ✅ Battle system (combat mechanics)
- ✅ Item system (tools, weapons, items)
- ✅ Player store (attributes, bag, equipment)
- ✅ TimeManager (for work time acceleration)
- ✅ Storage system (for item collection)

### Optional Systems (can stub)
- Log system (for work room completion messages)
- Achievement system (for secret room completion)
- IAP system (for drop effects)

---

## End of Plan

This plan provides complete implementation details for site room exploration, matching the original game's `battleAndWorkNode.js` functionality. All UI flows, integrations, and edge cases are documented for 1:1 porting accuracy.

**Key References**:
- Battle layout: `src/components/panels/BattlePanelContent.tsx`
- Work layout positioning: `COCOS_TO_CSS_POSITION_MAPPING.md`
- WorkRoomStorage layout: `src/components/panels/GatePanelContent.tsx`
- Component name: `SiteExploreContent` (not `BattleAndWorkPanelContent`)
- **Storage layout consistency**: WorkRoomStorageView is part of `SiteExploreContent` (viewMode: 'workStorage') for consistent exploration experience - no separate panel needed

