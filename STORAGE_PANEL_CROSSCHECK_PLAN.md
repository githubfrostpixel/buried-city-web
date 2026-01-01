# Storage Panel Implementation Plan
## Cross-check with Original Game

## Overview

This document outlines the implementation plan for the Storage Panel, which displays the player's storage items organized by category. The panel is accessed from the Home panel by clicking building 13 (Storage Shelf).

**Original Game Reference**: `OriginalGame/src/ui/storageNode.js`

---

## 1. Original Game Analysis

### 1.1 StorageNode Structure

**File**: `OriginalGame/src/ui/storageNode.js`

**Key Components:**
- Extends `BottomFrameNode` (base panel container)
- Uses `SectionTableView` for scrollable item display
- Has shop button (conditionally visible based on IAP unlock)
- Listens to item click and use events
- Groups items by type with section headers

### 1.2 UI Configuration

```javascript
this.uiConfig = {
    title: player.room.getBuildCurrentName(this.build.id),  // Building name
    leftBtn: true,   // Back button
    rightBtn: false  // No forward button
}
```

**Title**: Uses building name from `player.room.getBuildCurrentName(build.id)`
- Building 13 (Storage Shelf) name should be used
- Building names come from string data: `stringUtil.getString(bid + "_" + level).title`
- `getBuildCurrentName` uses current level (or level 0 if building not placed)
- Check string data for building 13 name (e.g., "13_0", "13_1", etc.)

### 1.3 Layout Structure

**SectionTableView:**
- Size: `cc.size(640, 750)` (width: 640px, height: 750px)
- Position: Centered horizontally, 10px from bottom of bg
  - X: `(this.bgRect.width - this.tableView.getViewSize().width) / 2`
  - Y: `10` (Cocos Y, measured from bottom)

**Shop Button:**
- Size: `cc.size(100, 70)`
- Position: `(this.bgRect.width - 60, this.actionBarBaseHeight)`
  - X: `bgWidth - 60` (60px from right edge)
  - Y: `actionBarBaseHeight` (803 * scale, from bottom)
- Visibility: Only if `IAPPackage.isAllIAPUnlocked()` is true
- Action: Navigate to `Navigation.nodeName.SHOP_NODE`

### 1.4 Item Grouping

**Type Categories** (from `stringUtil.getString(3006)`):
```javascript
var typeStrArray = stringUtil.getString(3006);
// English: ["Materials ", "Food ", "Medicines ", "Enhancement ", "Equipment ", "Miscellaneous "]
// Chinese: ["材料", "食品", "藥物", "強化", "裝備", "其他"]

var typeArray = [
    "1101",  // Materials (prefix match)
    "1103",  // Food (prefix match)
    "1104",  // Medicines (prefix match)
    "1107",  // Enhancement (prefix match)
    "13",    // Equipment (prefix match)
    "other"  // Miscellaneous (catch-all)
];
```

**Grouping Logic:**
- Uses `player.storage.getItemsByTypeGroup(typeArray)` to group items
- Items are matched by ID prefix (first 2-4 characters)
- Items not matching any prefix go to "other"
- Items in `blackList.storageDisplay` are excluded

### 1.5 SectionTableView Implementation

**File**: `OriginalGame/src/ui/SectionTableView.js`

**Structure:**
- ScrollView with vertical scrolling
- Each section is an `ItemSection` node
- Each item is an `ItemCell` node

**ItemSection Layout:**
- Cell size: 110px × 100px per item
- Columns: 5 items per row
- Title height: 50px (if title exists)
- Title position: Left-aligned, at top of section
- Items arranged in grid: 5 columns, variable rows

**ItemCell Layout:**
- Size: 84px × 84px
- Background varies by item type:
  - Equipment: `item_equip_bg.png`
  - Basic items (1102063, 1102073): `item_basic_bg.png`
  - Bullets (1305011, 1305012): `item_bullet_bg.png`
  - Default: `item_bg.png`
- Icon: `icon_item_{itemId}.png` (fallback to `icon_item_1101051.png`)
- Count label: Bottom-right corner, black stroke

### 1.6 Event Handling

**onEnter:**
- Pauses game timer: `cc.timer.pause()`
- Listens to `item_click` event → shows item dialog
- Listens to `btn_1_click` event → uses item from storage
- Sets storage change listener to update view

**onExit:**
- Resumes game timer: `cc.timer.resume()`
- Removes event listeners
- Sets `player.setSetting("inStorage", false)`
- Removes storage change listener

**Item Click Handler:**
```javascript
onItemClickFunc: function () {
    return function (storageCell) {
        uiUtil.showItemDialog(storageCell.item.id, false, 'storage');
    }
}
```

**Item Use Handler:**
```javascript
onItemUseFunc: function () {
    var self = this;
    return function (itemId, source) {
        if (source !== 'storage')
            return;
        var res = player.useItem(player.storage, itemId);
        if (res.result) {
            self.updateView();
        }
    }
}
```

### 1.7 Update View Logic

**updateView()**:
1. Gets type strings and type array
2. Groups items by type using `getItemsByTypeGroup()`
3. Maps to section data: `{title, itemList}`
4. Updates `tableView.updateView(data)`
5. Handles user guide warnings
6. Saves record: `Record.saveAll()`

---

## 2. Coordinate Conversion

### 2.1 SectionTableView Position

**Original Cocos:**
- Size: `640 × 750`
- Position: `((bgRect.width - 640) / 2, 10)`
  - X: Centered horizontally
  - Y: 10px from bottom (Cocos Y)

**CSS Conversion:**
- Container width: `640px` (matches content width)
- Container height: `750px`
- Position: Centered horizontally in content area
- Top: `10px` from top of content area (not bottom)
- Use `overflow: auto` for scrolling

**Calculation:**
```typescript
const tableViewStyle: React.CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '10px',
  transform: 'translateX(-50%)',
  width: '640px',
  height: '750px',
  overflow: 'auto',
  overflowX: 'hidden'
}
```

### 2.2 Shop Button Position

**Original Cocos:**
- Size: `100 × 70`
- Position: `(bgRect.width - 60, actionBarBaseHeight)`
  - X: `bgWidth - 60` (60px from right edge)
  - Y: `actionBarBaseHeight` (803 * scale from bottom)

**CSS Conversion:**
- Action bar base height: `803 * scale` from bottom (Cocos)
- CSS top: `bgHeight - (803 * scale)` from top
- But button is in action bar, so use action bar positioning

**Note**: Shop button should be in the action bar row, positioned at right side.
- Action bar top: `1px` from top of bg
- Button position: Right side of action bar, aligned with other buttons

**Calculation:**
```typescript
const shopButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: `${actionBar.rightButtonX}px`,  // 10px from right
  top: `${actionBar.paddingTop}px`,       // 5px from top of action bar
  width: '100px',
  height: '70px'
}
```

### 2.3 Item Grid Layout

**ItemSection:**
- Cell width: `110px`
- Cell height: `100px`
- Columns: `5`
- Title height: `50px` (if title exists)

**CSS Implementation:**
- Use CSS Grid or flexbox for item layout
- Grid: `grid-template-columns: repeat(5, 110px)`
- Gap: `0px` (items are positioned absolutely in original)
- Title: Absolute positioned at top-left of section

**ItemCell:**
- Size: `84px × 84px`
- Positioned within 110×100 cell, centered

---

## 3. Implementation Plan

### 3.1 Storage Panel Component

**File**: `src/components/panels/StoragePanelContent.tsx`

**Props:**
```typescript
interface StoragePanelContentProps {
  // No props needed - uses playerStore directly
}
```

**Structure:**
1. Use `BottomBar` component for frame
2. Create scrollable item list container
3. Group items by type
4. Render sections with titles
5. Render item cells in grid
6. Handle item clicks
7. Show shop button (if IAP unlocked - TODO: implement IAP check)

### 3.2 Item Section Component

**File**: `src/components/storage/ItemSection.tsx`

**Props:**
```typescript
interface ItemSectionProps {
  title: string
  items: Array<{ itemId: string; count: number }>
  onItemClick: (itemId: string) => void
}
```

**Layout:**
- Title: 50px height, left-aligned
- Grid: 5 columns, 110px width each
- Item cells: 84×84px, centered in 110×100px cells

### 3.3 Item Cell Component

**File**: `src/components/storage/ItemCell.tsx`

**Props:**
```typescript
interface ItemCellProps {
  itemId: string
  count: number
  onClick: () => void
}
```

**Features:**
- Background sprite (varies by item type)
- Item icon sprite
- Count label (bottom-right)
- Click handler

### 3.4 Storage Utility Functions

**File**: `src/game/inventory/Storage.ts` (extend existing)

**Add Method:**
```typescript
/**
 * Get items grouped by type prefixes
 * @param typeArray - Array of type prefixes to match (e.g., ["1101", "1103", "13", "other"])
 * @returns Object with type keys and arrays of {item: Item, num: number}
 */
getItemsByTypeGroup(typeArray: string[]): Record<string, Array<{item: Item, num: number}>>
```

**Implementation:**
- Match items by ID prefix
- Last element in typeArray should be "other" for catch-all
- Exclude items in blacklist (TODO: check blackList.storageDisplay)

### 3.5 Item Dialog Integration

**File**: `src/components/overlays/ItemDialog.tsx` (to be created in future)

**For now:**
- Item click shows placeholder or console log
- Full item dialog implementation deferred to later phase

### 3.6 Integration with MainScene

**File**: `src/components/scenes/MainScene.tsx`

**Update:**
```typescript
case 'storage':
  return <StoragePanelContent />
```

**Title:**
- Get building name from buildingStore
- Building 13 (Storage Shelf) name

**Back Button:**
- Navigate back to home panel

---

## 4. Data Dependencies

### 4.1 String Data

**File**: `src/data/strings/` (to be created or extended)

**String ID 3006** (Item Type Names):
- English: `["Materials ", "Food ", "Medicines ", "Enhancement ", "Equipment ", "Miscellaneous "]`
- Chinese: `["材料", "食品", "藥物", "強化", "裝備", "其他"]`

### 4.2 Building Names

**File**: `src/data/buildings.ts`

**Check:**
- Building 13 name for panel title
- Ensure building names are available

### 4.3 Item Config

**File**: `src/data/items.ts`

**Required:**
- Item type checking (prefix matching)
- Item icons: `icon_item_{itemId}.png`
- Item backgrounds (equip, basic, bullet, default)

### 4.4 Blacklist

**File**: `OriginalGame/src/data/blackList.js`

**Check:**
- `blackList.storageDisplay` - items to exclude from display
- May need to port this to TypeScript

---

## 5. Coordinate Mapping Reference

### 5.1 BottomBar Layout

**From**: `src/components/layout/layoutConstants.ts`

**Content Area:**
- Top: `76px` (below line separator)
- Height: `bgHeight - 76px` (dynamic)
- Width: `bgWidth` (596 * scale)

### 5.2 SectionTableView Position

**Original:**
- Position: `((bgWidth - 640) / 2, 10)` (Cocos Y from bottom)
- Size: `640 × 750`

**CSS:**
- Position: Centered horizontally, `10px` from top of content
- Size: `640px × 750px`
- Max height: Should not exceed content area height

**Calculation:**
```typescript
const contentTop = BOTTOM_BAR_LAYOUT.content.top  // 76px
const tableViewTop = contentTop + 10  // 86px from top of BottomBar
const tableViewHeight = Math.min(750, BOTTOM_BAR_LAYOUT.content.height - 10)
```

### 5.3 Shop Button Position

**Original:**
- Position: `(bgWidth - 60, actionBarBaseHeight)` (Cocos Y from bottom)
- Size: `100 × 70`

**CSS:**
- Position: In action bar row, right side
- Use `actionBar.rightButtonX` for right alignment
- Top: `actionBar.paddingTop` (5px)

**Note**: Shop button should replace or be alongside right button in action bar. Check if right button should be hidden when shop button is shown.

---

## 6. Event System

### 6.1 Item Click Event

**Original:**
- Event: `item_click`
- Payload: `storageCell` (contains item and count)
- Handler: Shows item dialog

**New Implementation:**
- Use `emitter` from `@/utils/emitter`
- Event: `item_click`
- Payload: `{ itemId: string, count: number, source: 'storage' }`

### 6.2 Item Use Event

**Original:**
- Event: `btn_1_click`
- Payload: `(itemId, source)`
- Handler: Uses item from storage

**New Implementation:**
- Event: `item_use` or `btn_1_click`
- Payload: `{ itemId: string, source: 'storage' }`
- Handler: Calls `playerStore.useItem(itemId, 'storage')`

### 6.3 Storage Change Listener

**Original:**
- `player.storage.setOnItemChangeListener(callback)`
- Callback receives `itemId`
- Updates view when storage changes

**New Implementation:**
- Use Zustand store subscription
- Or use event emitter for storage changes
- Update view when `playerStore.storage` changes

---

## 7. Implementation Steps

### Step 1: Extend Storage Class
- Add `getItemsByTypeGroup()` method
- Test with sample data

### Step 2: Create Item Cell Component
- Background sprite (type-based)
- Item icon sprite
- Count label
- Click handler

### Step 3: Create Item Section Component
- Title display
- Grid layout (5 columns)
- Item cells rendering

### Step 4: Create Storage Panel Content
- Use BottomBar component
- Scrollable container
- Item grouping logic
- Section rendering
- Event handlers

### Step 5: Integrate with MainScene
- Add to panel switch
- Set title from building name
- Handle back button

### Step 6: Add Shop Button (Optional)
- Check IAP unlock status (stub for now)
- Position in action bar
- Navigate to shop panel (if exists)

### Step 7: Testing
- Test item display
- Test item grouping
- Test scrolling
- Test item clicks
- Test coordinate positioning

---

## 8. Cross-Check Checklist

### 8.1 Layout
- [ ] SectionTableView size: 640×750
- [ ] SectionTableView position: Centered, 10px from top of content
- [ ] Shop button size: 100×70
- [ ] Shop button position: Right side of action bar
- [ ] Item grid: 5 columns, 110px width each
- [ ] Item cell: 84×84px, centered in cell
- [ ] Title height: 50px per section

### 8.2 Functionality
- [ ] Items grouped by type (1101, 1103, 1104, 1107, 13, other)
- [ ] Section titles from string 3006
- [ ] Item backgrounds vary by type (equip, basic, bullet, default)
- [ ] Item icons display correctly
- [ ] Count labels show in bottom-right
- [ ] Item click shows dialog (or placeholder)
- [ ] Item use works from storage
- [ ] Storage changes update view
- [ ] Shop button visibility based on IAP (stub)

### 8.3 Events
- [ ] Item click event fires
- [ ] Item use event fires
- [ ] Storage change listener works
- [ ] Back button navigates to home
- [ ] Shop button navigates to shop (if exists)

### 8.4 Data
- [ ] Building 13 name used for title
- [ ] String 3006 loaded for section titles
- [ ] Items filtered by blacklist (if implemented)
- [ ] Item types matched correctly by prefix

### 8.5 Coordinate Conversion
- [ ] SectionTableView positioned correctly
- [ ] Shop button positioned correctly
- [ ] Item grid aligned properly
- [ ] All positions match original game visually

---

## 9. Notes

### 9.1 IAP Check
- Original game checks `IAPPackage.isAllIAPUnlocked()`
- For now, stub this as `false` (shop button hidden)
- Implement IAP system in later phase

### 9.2 Item Dialog
- Original game uses `uiUtil.showItemDialog()`
- Defer full dialog implementation to later phase
- For now, show placeholder or console log

### 9.3 User Guide
- Original game has user guide warnings for items
- Defer user guide system to later phase
- Skip guide-related code for now

### 9.4 Timer Pause
- Original game pauses `cc.timer` when entering storage
- New game may not have equivalent timer system
- Check if time progression needs to pause

### 9.5 Blacklist
- Original game excludes items in `blackList.storageDisplay`
- May need to port blacklist data
- For now, show all items (or implement basic blacklist)

---

## 10. Files to Create/Modify

### New Files:
1. `src/components/panels/StoragePanelContent.tsx`
2. `src/components/storage/ItemSection.tsx`
3. `src/components/storage/ItemCell.tsx`

### Modified Files:
1. `src/components/scenes/MainScene.tsx` - Add storage panel case
2. `src/game/inventory/Storage.ts` - Add `getItemsByTypeGroup()` method
3. `src/data/strings/` - Add string 3006 (or check existing)

### Optional Files:
1. `src/data/blackList.ts` - Port blacklist data (if needed)

---

## 11. Testing Strategy

### 11.1 Visual Testing
- Compare with original game screenshots
- Check item grid alignment
- Verify section titles
- Check button positions

### 11.2 Functional Testing
- Test item grouping
- Test item clicks
- Test scrolling
- Test storage updates

### 11.3 Coordinate Testing
- Measure positions against original
- Verify centering
- Check spacing

---

## 12. Future Enhancements

1. **Item Dialog**: Full item dialog implementation
2. **IAP System**: Shop button visibility
3. **User Guide**: Guide warnings for items
4. **Blacklist**: Full blacklist implementation
5. **Item Sorting**: Additional sorting options
6. **Search**: Item search functionality
7. **Filters**: Filter by item type

---

## End of Plan

This plan provides a comprehensive guide for implementing the Storage Panel with 1:1 accuracy to the original game. All coordinate conversions follow the patterns established in `COCOS_TO_CSS_POSITION_MAPPING.md`.

