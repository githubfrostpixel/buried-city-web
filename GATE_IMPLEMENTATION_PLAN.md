# Gate Implementation Plan

## Overview

This plan covers implementing the Gate system, which allows players to:
1. Access the Gate panel (Building 14) to manage equipment and transfer items between bag and storage
2. Leave home through the Gate Out panel, which navigates to the map scene

## Original Game Reference

**Files:**
- `OriginalGame/src/ui/gateNode.js` - Main gate panel
- `OriginalGame/src/ui/gateOutNode.js` - Gate out transition panel
- `OriginalGame/src/ui/equipNode.js` - Equipment panel component
- `OriginalGame/src/ui/ItemChangeNode.js` - Item transfer component

## Components Analysis

### 1. GateNode (Gate Panel)

**Structure:**
- Extends `BottomFrameNode`
- Title: Building 14 current name (`player.room.getBuildCurrentName(14)`)
- Left button: Back (navigate to home)
- Right button: Go Out (navigate to gate out panel)

**Content:**
1. **EquipNode** (top section):
   - Position: `(bgRect.width / 2, contentTopLineHeight)` with anchor `(0.5, 1)`
   - Size: `572 × 100` pixels
   - Shows 5 equipment slots: Gun, Weapon, Equip, Tool, Special
   - Allows equipping/unequipping items from bag/storage

2. **ItemChangeNode** (bottom section):
   - Position: `(bgRect.width / 2, 0)` with anchor `(0.5, 0)`
   - Size: `596 × 670` pixels (full size, not small)
   - Top storage: `player.bag` (label: string 1034 - "Bag")
   - Bottom storage: `player.storage` (label: string 1035 - "Storage")
   - Allows transferring items between bag and storage
   - Shows weight for bag (top storage)

**Behavior:**
- Sets `player.setSetting("inGate", true)` on init
- Sets `player.setSetting("inGate", false)` on exit
- Plays `audioManager.sound.CLOSE_DOOR` on init
- Listens to `item_click` events for tutorial integration
- Right button click:
  - Calls `player.out()` (sets `isAtHome = false`, records `leftHomeTime`)
  - Adds log message 1110
  - Plays `audioManager.sound.FOOT_STEP`
  - Navigates to `GATE_OUT_NODE`

### 2. GateOutNode (Gate Out Panel)

**Structure:**
- Extends `BottomFrameNode`
- Title: Empty string
- No buttons (leftBtn: false, rightBtn: false)
- Line separator: Hidden

**Content:**
1. **Background**: `gate_out_bg.png`
   - Position: `(bgRect.width / 2, bgRect.height / 2)` with anchor `(0.5, 0.5)`
   - Z-order: -1 (behind everything)

2. **Clickable Area**: Full background button
   - Position: `(bgRect.width / 2, bgRect.height / 2)`
   - Clicking anywhere calls `goOut()`

3. **Tip Label**: String 1167
   - Position: `(leftPadding, 400)` with anchor `(0, 0)`
   - Width: `bgRect.width - 2 * leftPadding` (leftPadding = 30)
   - Font: `uiUtil.fontFamily.normal`, `uiUtil.fontSize.COMMON_2`

4. **Random Tip**: Random from string array 3011
   - Position: `(leftPadding, labelTip.y - 20)` with anchor `(0, 1)`
   - Width: `bgRect.width - 2 * leftPadding`
   - Font: `uiUtil.fontFamily.normal`, `uiUtil.fontSize.COMMON_2`

**Behavior:**
- Auto-navigates to map after 3 seconds (`scheduleOnce`)
- `goOut()` function:
  - Calls `player.map.deleteUnusableSite()`
  - Navigates to `MAP_NODE`

### 3. EquipNode Component

**Structure:**
- Size: `572 × 100` pixels
- 5 equipment slots (tabs) arranged horizontally
- Each slot shows:
  - Background: `build_icon_bg.png`
  - Icon: Current equipped item (if any)
  - Selected indicator: `frame_tab_head.png` (shown when slot is selected)

**Equipment Slots:**
- Slot 0: Gun (itemType: 1301)
- Slot 1: Weapon (itemType: 1302, includes "HAND" option)
- Slot 2: Equip (itemType: 1304)
- Slot 3: Tool (itemType: 1303)
- Slot 4: Special (itemType: 1305053, 1305064, 1305075)

**Behavior:**
- Clicking a slot opens dropdown showing available items of that type
- Dropdown shows items from `player.bag` or `player.tmpBag` (if exists)
- Selecting an item equips it
- Clicking selected slot again closes dropdown
- Selected slot shows `frame_tab_head.png` cap above it

### 4. ItemChangeNode Component

**Structure:**
- Size: `596 × 670` pixels (full size)
- Two sections (top and bottom), each `596 × 335` pixels
- Each section has:
  - Header with storage name
  - Weight display (for bag/storage)
  - Scrollable item list (table view)

**Top Section:**
- Storage: `player.bag`
- Label: String 1034 ("Bag")
- Shows weight: `currentWeight / totalWeight`
- Weight label turns red when full

**Bottom Section:**
- Storage: `player.storage`
- Label: String 1035 ("Storage")
- No "Take All" button (withTakeAll: false)

**Behavior:**
- Clicking an item transfers it between top and bottom storage
- Updates weight display when items change
- Filters out non-movable items from player bag (blackList.storageMove)
- Listens to `item_click` events

## Implementation Steps

### Step 1: Add 'gate' Panel Type to UIStore

**File:** `src/store/uiStore.ts`

**Changes:**
1. Add `'gate'` to `Panel` type union
2. No additional state needed (gate panel doesn't need building ID)

**Tasks:**
- [ ] Add `'gate'` to Panel type
- [ ] Verify `openPanelAction('gate')` works

### Step 2: Create Equipment Component (EquipNode)

**File:** `src/components/panels/EquipPanel.tsx` (or `src/components/common/EquipPanel.tsx`)

**Structure:**
```typescript
interface EquipPanelProps {
  // No props needed - uses playerStore directly
}

export function EquipPanel() {
  // Component implementation
}
```

**Features:**
1. **5 Equipment Slots:**
   - Render 5 `build_icon_bg.png` buttons horizontally
   - Spacing: `(572 - 5 * iconWidth) / 6` padding between icons
   - Each button shows current equipped item icon (if any)

2. **Selected Indicator:**
   - Show `frame_tab_head.png` above selected slot
   - Position: `(slotX, slotY + iconHeight/2 + capHeight/2)`

3. **Dropdown View:**
   - Shows when slot is clicked
   - Background: `frame_tab_content.png` (scale9 sprite)
   - Lists available items for that slot type
   - Clicking item equips it and closes dropdown

4. **Equipment Logic:**
   - Read from `playerStore.equipment`
   - Use `playerStore.equipItem()` and `playerStore.unequipItem()`
   - Filter items by type from `playerStore.bag`

**Positioning (Cocos to CSS):**
- Original: `(bgRect.width / 2, contentTopLineHeight)` with anchor `(0.5, 1)`
- CSS: `left: 50%, top: ${contentTopLineHeight}px, transform: translateX(-50%)`
- Size: `572 × 100` pixels

**Tasks:**
- [ ] Create EquipPanel component
- [ ] Implement 5 equipment slots
- [ ] Implement dropdown view for each slot
- [ ] Connect to playerStore equipment methods
- [ ] Handle item filtering by type
- [ ] Add selected indicator (frame_tab_head.png)
- [ ] Test equipment/unequipment

### Step 3: Create Item Transfer Component (ItemChangeNode)

**File:** `src/components/panels/ItemTransferPanel.tsx` (or `src/components/common/ItemTransferPanel.tsx`)

**Structure:**
```typescript
interface ItemTransferPanelProps {
  topStorage: Storage
  topStorageName: string
  bottomStorage: Storage
  bottomStorageName: string
  withTakeAll?: boolean
  smallSize?: boolean
}

export function ItemTransferPanel({
  topStorage,
  topStorageName,
  bottomStorage,
  bottomStorageName,
  withTakeAll = false,
  smallSize = false
}: ItemTransferPanelProps) {
  // Component implementation
}
```

**Features:**
1. **Two Storage Sections:**
   - Top section: `596 × 335` pixels (half height)
   - Bottom section: `596 × 335` pixels (half height)
   - Each section shows:
     - Header with storage name
     - Weight display (if applicable)
     - Scrollable item grid

2. **Item Grid:**
   - Similar to StoragePanelContent item grid
   - 5 columns, item cells with icons and counts
   - Clicking item transfers to opposite storage

3. **Weight Display:**
   - Show for bag/storage (top section)
   - Format: `currentWeight / totalWeight`
   - Red color when full

4. **Transfer Logic:**
   - Click item → move to opposite storage
   - Check weight limits
   - Update both storages in playerStore

**Positioning (Cocos to CSS):**
- Original: `(bgRect.width / 2, 0)` with anchor `(0.5, 0)`
- CSS: `left: 50%, top: 0, transform: translateX(-50%)`
- Size: `596 × 670` pixels (full size)

**Tasks:**
- [ ] Create ItemTransferPanel component
- [ ] Implement two-section layout
- [ ] Implement item grid for each section
- [ ] Add weight display
- [ ] Implement item transfer logic
- [ ] Handle weight limits
- [ ] Filter non-movable items (blackList.storageMove)
- [ ] Test item transfer

### Step 4: Create Gate Panel Content

**File:** `src/components/panels/GatePanelContent.tsx`

**Structure:**
```typescript
export function GatePanelContent() {
  // Component implementation
}
```

**Layout:**
1. **EquipPanel** (top):
   - Positioned at top of content area
   - Uses `contentTopLineHeight` for positioning

2. **ItemTransferPanel** (bottom):
   - Positioned at bottom of content area
   - Top storage: `player.bag` (string 1034)
   - Bottom storage: `player.storage` (string 1035)
   - `withTakeAll: false`, `smallSize: false`

**Behavior:**
- On mount: Set `player.setSetting("inGate", true)`
- On unmount: Set `player.setSetting("inGate", false)`
- Play `CLOSE_DOOR` sound on mount
- Listen to `item_click` events (for tutorial - stub for now)

**Positioning:**
- Content area uses standard BottomBar layout
- EquipPanel: Top of content area
- ItemTransferPanel: Below EquipPanel or at bottom

**Tasks:**
- [ ] Create GatePanelContent component
- [ ] Add EquipPanel at top
- [ ] Add ItemTransferPanel at bottom
- [ ] Handle `inGate` setting
- [ ] Play CLOSE_DOOR sound
- [ ] Listen to item_click events
- [ ] Test layout and positioning

### Step 5: Create Gate Out Panel Content

**File:** `src/components/panels/GateOutPanelContent.tsx`

**Structure:**
```typescript
export function GateOutPanelContent() {
  // Component implementation
}
```

**Layout:**
1. **Background**: `gate_out_bg.png`
   - Centered: `left: 50%, top: 50%, transform: translate(-50%, -50%)`
   - Z-index: -1 (behind content)

2. **Clickable Area**: Full screen button
   - Position: `absolute inset-0`
   - Click handler: `goOut()`

3. **Tip Label**: String 1167
   - Position: `left: 30px, top: 400px`
   - Width: `bgWidth - 60px`
   - Font: Normal, COMMON_2 size

4. **Random Tip**: Random from string array 3011
   - Position: `left: 30px, top: ${labelTip.y - 20}px`
   - Width: `bgWidth - 60px`
   - Font: Normal, COMMON_2 size

**Behavior:**
- Auto-navigate to map after 3 seconds
- `goOut()` function:
  - Call `player.map.deleteUnusableSite()` (if map exists)
  - Navigate to map scene: `uiStore.setScene('map')`

**Positioning:**
- Uses standard BottomBar layout
- Background centered in content area
- Text positioned relative to content area

**Tasks:**
- [ ] Create GateOutPanelContent component
- [ ] Add gate_out_bg.png background
- [ ] Add clickable area
- [ ] Add tip label (string 1167)
- [ ] Add random tip (string 3011)
- [ ] Implement auto-navigate after 3 seconds
- [ ] Implement goOut() function
- [ ] Navigate to map scene
- [ ] Test layout and navigation

### Step 6: Update MainScene to Handle Gate Panel

**File:** `src/components/scenes/MainScene.tsx`

**Changes:**
1. Add case for `'gate'` panel in panel rendering
2. Render `GatePanelContent` when `openPanel === 'gate'`

**Tasks:**
- [ ] Add 'gate' case to panel rendering
- [ ] Import GatePanelContent
- [ ] Test panel navigation

### Step 7: Update HomePanelContent to Navigate to Gate

**File:** `src/components/panels/HomePanelContent.tsx`

**Changes:**
1. Update building 14 click handler:
   ```typescript
   case 14:
     // Navigate to Gate panel (only if level >= 0)
     if (building?.level !== undefined && building.level >= 0) {
       uiStore.openPanelAction('gate')
     }
     break
   ```

**Tasks:**
- [ ] Update building 14 click handler
- [ ] Test navigation to gate panel

### Step 8: Update BottomBar for Gate Panel

**File:** `src/components/layout/BottomBar.tsx`

**Changes:**
1. Add 'gate' panel title handling
2. Gate panel buttons:
   - Left button: Back (navigate to home)
   - Right button: Go Out (navigate to gate out panel)

**Gate Out Panel:**
- No buttons (leftBtn: false, rightBtn: false)
- Title: Empty string

**Tasks:**
- [ ] Add 'gate' panel title
- [ ] Handle gate panel buttons (left: back, right: go out)
- [ ] Handle gate out panel (no buttons)
- [ ] Test button functionality

### Step 9: Implement Player.out() Function

**File:** `src/store/playerStore.ts`

**Changes:**
1. Add `out()` method:
   ```typescript
   out: () => void
   ```

2. Implementation:
   ```typescript
   out: () => {
     set((state) => ({
       isAtHome: false,
       leftHomeTime: game.timeManager.getCurrentTime() // or Date.now() / 1000
     }))
     // TODO: Add log message 1110 when log system is ready
   }
   ```

**Tasks:**
- [ ] Add `out()` method to PlayerStore
- [ ] Set `isAtHome = false`
- [ ] Record `leftHomeTime`
- [ ] Test function

### Step 10: Add Setting Management

**File:** `src/store/playerStore.ts`

**Changes:**
1. Add `setSetting()` method:
   ```typescript
   setSetting: (key: string, value: any) => void
   ```

2. Implementation:
   ```typescript
   setSetting: (key: string, value: any) => {
     set((state) => ({
       setting: {
         ...state.setting,
         [key]: value
       }
     }))
   }
   ```

**Tasks:**
- [ ] Add `setSetting()` method
- [ ] Test setting management

### Step 11: Add Gate Out Panel to Scene System

**Note:** Gate Out panel is a special panel that should navigate to map scene. We need to decide:
- Option A: Gate Out is a panel type (add 'gateOut' to Panel type)
- Option B: Gate Out is a scene transition (navigate directly to map scene)

**Recommendation:** Option B - Gate Out should navigate directly to map scene, not be a separate panel.

**Implementation:**
- Gate panel right button → Call `player.out()` → Navigate to map scene
- Skip Gate Out panel for now (can add later if needed for visual transition)

**Tasks:**
- [ ] Decide on Gate Out implementation approach
- [ ] Implement navigation to map scene
- [ ] Test navigation

## Coordinate Conversion

### EquipPanel Positioning

**Original Cocos:**
- Position: `(bgRect.width / 2, contentTopLineHeight)` with anchor `(0.5, 1)`
- Size: `572 × 100` pixels

**CSS Equivalent:**
```typescript
const equipPanelStyle = {
  position: 'absolute',
  left: '50%',
  top: `${contentTopLineHeight}px`,
  transform: 'translateX(-50%)',
  width: '572px',
  height: '100px'
}
```

### ItemTransferPanel Positioning

**Original Cocos:**
- Position: `(bgRect.width / 2, 0)` with anchor `(0.5, 0)`
- Size: `596 × 670` pixels

**CSS Equivalent:**
```typescript
const itemTransferPanelStyle = {
  position: 'absolute',
  left: '50%',
  top: '0',
  transform: 'translateX(-50%)',
  width: '596px',
  height: '670px'
}
```

### Gate Out Background Positioning

**Original Cocos:**
- Position: `(bgRect.width / 2, bgRect.height / 2)` with anchor `(0.5, 0.5)`
- Z-order: -1

**CSS Equivalent:**
```typescript
const bgStyle = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: -1
}
```

## String Resources Needed

- String 1034: "Bag" (top storage name)
- String 1035: "Storage" (bottom storage name)
- String 1167: Gate out tip label
- String 3011: Array of random tips for gate out

**Note:** String resources are handled in the original game via `stringUtil.getString()`. We'll need to check if these strings are available in our string data or add them.

## Audio Resources Needed

- `CLOSE_DOOR` sound: Played when gate panel opens
- `FOOT_STEP` sound: Played when leaving through gate

**Note:** Check if these audio files exist in `src/assets/audio/` or `public/assets/audio/`.

## Sprite Resources Needed

- `build_icon_bg.png`: Equipment slot background
- `frame_tab_head.png`: Selected equipment slot indicator
- `frame_tab_content.png`: Dropdown background (scale9 sprite)
- `gate_out_bg.png`: Gate out panel background

**Note:** Check if these sprites exist in sprite atlases.

## Testing Checklist

### Gate Panel
- [ ] Building 14 click opens gate panel (if level >= 0)
- [ ] Gate panel shows EquipPanel at top
- [ ] Gate panel shows ItemTransferPanel at bottom
- [ ] Equipment slots display correctly
- [ ] Equipment dropdown works
- [ ] Item transfer between bag and storage works
- [ ] Weight display shows correctly
- [ ] Left button navigates back to home
- [ ] Right button calls `player.out()` and navigates to map
- [ ] `inGate` setting is set/unset correctly
- [ ] CLOSE_DOOR sound plays on open

### Gate Out Panel (if implemented)
- [ ] Gate out panel shows background
- [ ] Gate out panel shows tip text
- [ ] Gate out panel shows random tip
- [ ] Clicking anywhere navigates to map
- [ ] Auto-navigates to map after 3 seconds
- [ ] `player.map.deleteUnusableSite()` is called

### Player.out()
- [ ] `isAtHome` is set to false
- [ ] `leftHomeTime` is recorded
- [ ] Log message 1110 is added (when log system ready)

## Dependencies

1. **PlayerStore:**
   - Equipment management (`equipItem`, `unequipItem`, `getEquippedItem`)
   - Storage management (`bag`, `storage`)
   - Setting management (`setSetting`)
   - Location state (`isAtHome`, `leftHomeTime`)

2. **UIStore:**
   - Panel navigation (`openPanelAction`)
   - Scene navigation (`setScene`)

3. **Map System:**
   - `player.map.deleteUnusableSite()` (if map exists)

4. **Audio System:**
   - `CLOSE_DOOR` sound
   - `FOOT_STEP` sound

5. **String System:**
   - String 1034, 1035, 1167, 3011

## Implementation Order

1. **Phase 1: Basic Structure**
   - Step 1: Add 'gate' panel type
   - Step 2: Create GatePanelContent (stub)
   - Step 6: Update MainScene
   - Step 7: Update HomePanelContent navigation

2. **Phase 2: Equipment System**
   - Step 2: Create EquipPanel component
   - Connect to playerStore equipment

3. **Phase 3: Item Transfer**
   - Step 3: Create ItemTransferPanel component
   - Connect to playerStore bag/storage

4. **Phase 4: Integration**
   - Step 4: Complete GatePanelContent
   - Step 8: Update BottomBar
   - Step 9: Implement player.out()
   - Step 10: Add setting management

5. **Phase 5: Gate Out (Optional)**
   - Step 5: Create GateOutPanelContent
   - Step 11: Add to scene system

## Notes

1. **Gate Out Panel**: The original game shows a transition screen before going to map. We can either:
   - Implement it as a separate panel (add 'gateOut' to Panel type)
   - Skip it and navigate directly to map (simpler)
   - Implement it as an overlay (shows briefly then navigates)

2. **Equipment System**: The EquipPanel needs to handle:
   - Reading from `playerStore.equipment`
   - Filtering items by type from `playerStore.bag`
   - Equipping/unequipping items
   - Special handling for weapon slot (includes "HAND" option)

3. **Item Transfer**: The ItemTransferPanel needs to:
   - Handle weight limits
   - Filter non-movable items (blackList.storageMove)
   - Update both storages atomically

4. **Tutorial Integration**: The original game has tutorial steps for gate (GATE_EQUIP_1, GATE_OUT). These can be stubbed for now and implemented later.

5. **Map System**: The gate out calls `player.map.deleteUnusableSite()`. This requires the map system to be implemented. For now, we can stub this call.

## Cross-Check with Original Game

After implementation, verify:
- [ ] Gate panel layout matches original (EquipPanel top, ItemTransferPanel bottom)
- [ ] Equipment slots match original (5 slots, correct types)
- [ ] Item transfer works correctly (bag ↔ storage)
- [ ] Weight display shows correctly
- [ ] Navigation works (back button, go out button)
- [ ] `inGate` setting is managed correctly
- [ ] Audio plays correctly
- [ ] Player.out() sets location correctly



