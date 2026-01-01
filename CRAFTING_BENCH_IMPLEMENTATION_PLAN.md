# Crafting Bench Implementation Plan

## Overview

This plan details the implementation of the crafting bench (Workbench, Building ID 1) feature. When a player clicks on the workbench building in the home panel, it should open a build panel showing:
- Building upgrade section (if upgradeable)
- List of crafting recipes (formulas) that can be made at the workbench
- Each recipe shows icon, name, cost, and action button

**Original Game Reference**: 
- `OriginalGame/src/ui/buildNode.js` - BuildNode class (lines 1-531)
- `OriginalGame/src/ui/uiUtil.js` - `showBuildDialog()` function (lines 726-764)
- `OriginalGame/src/ui/uiUtil.js` - `createCommonListItem()` function (for recipe items)

---

## 1. Original Game Analysis

### 1.1 BuildNode Structure

**From `buildNode.js`:**

**Layout Structure:**
1. **Upgrade View** (top section)
   - Position: `(bgRect.width / 2, contentTopLineHeight)` with anchor `(0.5, 1)`
   - Shows building icon, upgrade cost, upgrade button
   - Uses `createCommonListItem()` component

2. **Section Separator** (below upgrade)
   - Sprite: `frame_section_bg.png`
   - Position: `(bgRect.width / 2, contentTopLineHeight - upgradeView.height)` with anchor `(0.5, 1)`
   - Height: Variable (based on sprite)

3. **Operator Text** (inside section separator)
   - Text: String 1004 ("Operator" / "操作")
   - Position: `(20, sectionView.height / 2)` with anchor `(0, 0.5)`
   - Color: Black

4. **Recipe Table View** (scrollable list)
   - Size: `596 × 610` pixels
   - Position: `((bgRect.width - tableView.width) / 2, 10)`
   - Direction: Vertical scroll
   - Cell height: `120` pixels per recipe
   - Each cell contains a `createCommonListItem()` showing recipe info

**Content Flow:**
- Building click → Navigate to Build panel → Show BuildPanelContent with building ID
- BuildPanelContent displays upgrade view + recipe list
- Recipe items show: icon, name, cost items, action button

### 1.2 CommonListItem Structure

**From `uiUtil.createCommonListItem()`:**

Each recipe item shows:
- **Icon** (left): Recipe icon sprite (`#build_action_{bid}_{index}.png`)
- **Name/Description**: Recipe name text
- **Cost Items**: Rich text showing required items with icons
- **Action Button 1**: "Make" button (craft the item)
- **Action Button 2**: "Take" button (collect completed item) - only when step === 2

**Item States:**
- `step === 0`: Can make (show "Make" button)
- `step === 1`: Crafting in progress (show progress)
- `step === 2`: Completed (show "Take" button)

### 1.3 Building Click Handler

**From `HomePanelContent.tsx`:**

Currently, clicking building ID 1 (workbench) navigates to 'build' panel:
```typescript
default:
  // Navigate to Build panel with building info
  uiStore.openPanelAction('build')
  break
```

**Required Changes:**
- Pass building ID to build panel
- Build panel should display building-specific content

---

## 2. Current Codebase State

### 2.1 Existing Components

**Available:**
- ✅ `Building.ts` - Building class with `getBuildActions()` method
- ✅ `Formula.ts` - Formula stub class (needs full implementation later)
- ✅ `buildingStore.ts` - Building store with `getBuilding()` method
- ✅ `uiStore.ts` - UI store with panel management
- ✅ `MainScene.tsx` - Scene router with build panel placeholder
- ✅ `HomePanelContent.tsx` - Home panel with building click handlers
- ✅ `BottomBar.tsx` - Bottom frame with content area

**Missing:**
- ❌ `BuildPanelContent.tsx` - Build panel component
- ❌ `UpgradeView.tsx` - Upgrade section component
- ❌ `RecipeListItem.tsx` - Recipe item component
- ❌ Recipe list scrollable container
- ❌ Building ID passing mechanism to build panel

### 2.2 Building Data

**Workbench (ID 1) Recipes:**
- Level 0: [1402021, 1402011, 1401011, 1401071, 1405023]
- Level 1: [1402032, 1404024, 1401022, 1404012, 1305034, 1405053, 1305075]
- Level 2: [1401082, 1402043, 1404023, 1401033, 1401091, 1405024, 1305064, 1106014]

**Upgrade Costs:**
- Level 0 → 1: 6×1101011, 4×1101021, 1×1101031, 4×1101041 (60 minutes)
- Level 1 → 2: 2×1101011, 6×1101021, 1×1101031, 8×1101041, 8×1101051 (90 minutes)

---

## 3. Implementation Steps

### Step 1: Extend UI Store to Pass Building ID

**File**: `src/store/uiStore.ts`

**Tasks:**
1. Add `buildPanelBuildingId: number | null` to UIStore interface
2. Modify `openPanelAction()` to accept optional building ID parameter
3. Set `buildPanelBuildingId` when opening build panel with building ID
4. Clear `buildPanelBuildingId` when closing build panel

**Implementation:**
```typescript
interface UIStore {
  // ... existing properties
  buildPanelBuildingId: number | null
  
  // ... existing actions
  openPanelAction: (panel: Panel, buildingId?: number) => void
}

// In implementation:
openPanelAction: (panel: Panel, buildingId?: number) => {
  set({ 
    openPanel: panel,
    buildPanelBuildingId: panel === 'build' ? (buildingId ?? null) : null
  })
}
```

### Step 2: Update HomePanelContent to Pass Building ID

**File**: `src/components/panels/HomePanelContent.tsx`

**Tasks:**
1. Modify `handleBuildingClick()` to pass building ID when opening build panel
2. Update default case to pass `bid` to `openPanelAction('build', bid)`

**Implementation:**
```typescript
default:
  // Navigate to Build panel with building info
  uiStore.openPanelAction('build', bid)
  break
```

### Step 3: Create UpgradeView Component

**File**: `src/components/panels/UpgradeView.tsx`

**Requirements:**
- Display building icon for next level (or current if max)
- Show upgrade cost items (with icons and quantities)
- Show upgrade time
- Show "Build" or "Upgrade" button
- Show progress bar when upgrading
- Disable button when:
  - Cannot afford cost
  - Prerequisites not met
  - Another action is active
  - Currently upgrading

**Layout:**
- Similar to `CommonListItem` from original
- Icon on left
- Cost items in middle
- Action button on right
- Progress bar overlay when upgrading

**Positioning:**
- Position: Top of content area
- Anchor: Center-top (0.5, 1)
- Width: Full content width (596px)
- Height: ~120px (similar to recipe items)

**Reference**: `buildNode.js` lines 409-522 (`updateUpgradeView()`)

### Step 4: Create RecipeListItem Component

**File**: `src/components/panels/RecipeListItem.tsx`

**Requirements:**
- Display recipe icon
- Display recipe name/description
- Display cost items (with icons and quantities)
- Show "Make" button when `step === 0` and `canMake()`
- Show progress when `step === 1` (crafting)
- Show "Take" button when `step === 2` (completed)
- Handle click on icon (show recipe info dialog)
- Handle click on action button (start crafting or take item)

**Layout:**
- Similar to `CommonListItem` from original
- Icon on left (clickable)
- Recipe name and cost in middle
- Action button on right
- Progress bar overlay when crafting

**Positioning:**
- Height: 120px per item
- Width: Full content width (596px)
- Padding: 10px left/right

**Reference**: `buildNode.js` lines 339-403 (`tableCellAtIndex()`)

### Step 5: Create BuildPanelContent Component

**File**: `src/components/panels/BuildPanelContent.tsx`

**Requirements:**
- Get building ID from `uiStore.buildPanelBuildingId`
- Get building instance from `buildingStore`
- Display building name in title (via BottomBar)
- Show upgrade view at top
- Show section separator below upgrade
- Show "Operator" text in section
- Show scrollable recipe list below section
- Handle building updates (listen to `build_node_update` event)
- Update view when building state changes

**Layout Structure:**
```
┌─────────────────────────────────┐
│  Upgrade View (120px)          │
├─────────────────────────────────┤
│  Section Separator              │
│  "Operator" text                │
├─────────────────────────────────┤
│  Recipe List (scrollable)       │
│  - Recipe 1 (120px)             │
│  - Recipe 2 (120px)             │
│  - Recipe 3 (120px)             │
│  ...                            │
└─────────────────────────────────┘
```

**Positioning:**
- Content area: Uses BottomBar content area
- Upgrade view: `top: 0`, centered horizontally
- Section separator: Below upgrade view
- Recipe list: Below section separator, scrollable

**Reference**: `buildNode.js` lines 1-143 (`_init()`), 300-331 (`createTableView()`)

### Step 6: Integrate BuildPanelContent into MainScene

**File**: `src/components/scenes/MainScene.tsx`

**Tasks:**
1. Import `BuildPanelContent` component
2. Replace build panel placeholder with `<BuildPanelContent />`
3. Update `getPanelTitle()` to get building name from building store

**Implementation:**
```typescript
case 'build': {
  const buildingId = uiStore.buildPanelBuildingId
  if (buildingId) {
    return <BuildPanelContent buildingId={buildingId} />
  }
  return <div className="text-white p-4">No building selected</div>
}
```

### Step 7: Add Section Separator Sprite

**File**: `src/components/panels/BuildPanelContent.tsx`

**Requirements:**
- Use sprite: `frame_section_bg.png`
- Position below upgrade view
- Center horizontally
- Anchor: Center-top (0.5, 1)

**Positioning:**
- Top: `upgradeViewHeight` (e.g., 120px)
- Left: 50% with `translateX(-50%)`

### Step 8: Implement Recipe List Scrolling

**File**: `src/components/panels/BuildPanelContent.tsx`

**Requirements:**
- Scrollable container for recipe list
- Height: Content area height minus upgrade and section heights
- Vertical scroll only
- Each recipe item: 120px height
- Smooth scrolling

**Implementation:**
```typescript
<div 
  className="overflow-y-auto overflow-x-hidden"
  style={{
    width: '596px',
    height: `${contentHeight}px`,
    margin: '0 auto'
  }}
>
  {recipes.map((recipe, index) => (
    <RecipeListItem 
      key={recipe.id} 
      recipe={recipe} 
      index={index}
      buildingId={buildingId}
    />
  ))}
</div>
```

### Step 9: Add Event Listeners for Building Updates

**File**: `src/components/panels/BuildPanelContent.tsx`

**Requirements:**
- Listen to `build_node_update` event
- Update view when building state changes
- Re-render upgrade view and recipe list

**Implementation:**
```typescript
useEffect(() => {
  const handleBuildUpdate = () => {
    setUpdateTrigger(prev => prev + 1)
  }
  
  emitter.on('build_node_update', handleBuildUpdate)
  
  return () => {
    emitter.off('build_node_update', handleBuildUpdate)
  }
}, [])
```

### Step 10: Implement Recipe Actions (Stub)

**File**: `src/components/panels/RecipeListItem.tsx`

**Requirements:**
- Handle "Make" button click → Start crafting
- Handle "Take" button click → Collect item
- Show progress when crafting
- Disable buttons when appropriate

**Note**: Full crafting implementation will be in Formula system (Phase 2.5+). For now, create stubs that:
- Show button states correctly
- Emit events for crafting actions
- Display recipe information

**Implementation:**
```typescript
const handleMake = () => {
  // TODO: Implement full crafting in Formula system
  console.log('Start crafting:', recipe.id)
  // For now, just emit event
  emitter.emit('recipe_make', { recipeId: recipe.id, buildingId })
}

const handleTake = () => {
  // TODO: Implement item collection in Formula system
  console.log('Take item:', recipe.id)
  emitter.emit('recipe_take', { recipeId: recipe.id, buildingId })
}
```

---

## 4. Positioning Details

### 4.1 BottomBar Content Area

**From `COCOS_TO_CSS_POSITION_MAPPING.md`:**

- Content area top: `bgHeight - contentTopLineHeight + 40`
- Content area height: `contentTopLineHeight - 10`
- Content area width: `596px` (bgWidth)
- Content area is scrollable vertically

### 4.2 Upgrade View Positioning

**Original Cocos:**
- Position: `(bgRect.width / 2, contentTopLineHeight)` 
- Anchor: `(0.5, 1)` (center-top)

**CSS Equivalent:**
```typescript
const upgradeViewStyle = {
  position: 'absolute',
  left: '50%',
  top: '0px',
  transform: 'translateX(-50%)',
  width: '596px',
  height: '120px'
}
```

### 4.3 Section Separator Positioning

**Original Cocos:**
- Position: `(bgRect.width / 2, contentTopLineHeight - upgradeView.height)`
- Anchor: `(0.5, 1)` (center-top)

**CSS Equivalent:**
```typescript
const sectionStyle = {
  position: 'absolute',
  left: '50%',
  top: '120px', // upgradeView height
  transform: 'translateX(-50%)',
  width: 'auto',
  height: 'auto'
}
```

### 4.4 Recipe List Positioning

**Original Cocos:**
- Position: `((bgRect.width - tableView.width) / 2, 10)`
- Size: `596 × 610`

**CSS Equivalent:**
```typescript
const recipeListStyle = {
  position: 'absolute',
  left: '50%',
  top: `${120 + sectionHeight + 10}px`, // Below section + 10px gap
  transform: 'translateX(-50%)',
  width: '596px',
  height: `${contentHeight - 120 - sectionHeight - 10}px`, // Remaining height
  overflowY: 'auto',
  overflowX: 'hidden'
}
```

---

## 5. Files to Create/Modify

### New Files:
1. `src/components/panels/BuildPanelContent.tsx` - Main build panel component
2. `src/components/panels/UpgradeView.tsx` - Upgrade section component
3. `src/components/panels/RecipeListItem.tsx` - Recipe item component

### Modified Files:
1. `src/store/uiStore.ts` - Add `buildPanelBuildingId` and update `openPanelAction()`
2. `src/components/panels/HomePanelContent.tsx` - Pass building ID to build panel
3. `src/components/scenes/MainScene.tsx` - Use BuildPanelContent component
4. `src/components/layout/BottomBar.tsx` - May need to adjust content area if needed

---

## 6. Dependencies

### Required (Available):
- ✅ `Building.ts` - Building class
- ✅ `Formula.ts` - Formula stub class
- ✅ `buildingStore.ts` - Building store
- ✅ `uiStore.ts` - UI store
- ✅ `playerStore.ts` - Player store (for cost validation)
- ✅ `emitter.ts` - Event emitter
- ✅ `Sprite.tsx` - Sprite component
- ✅ `BottomBar.tsx` - Bottom frame

### Missing (Can Stub):
- ⚠️ **Full Formula System** - Recipe crafting logic (stub for now)
- ⚠️ **String Data** - Building names, recipe names (use IDs for now)
- ⚠️ **Item Rich Text Component** - Cost item display (create simple version)

---

## 7. Testing Checklist

- [ ] Clicking workbench (ID 1) opens build panel
- [ ] Build panel shows correct building name in title
- [ ] Upgrade view displays correctly
- [ ] Upgrade view shows correct cost items
- [ ] Upgrade button works (starts upgrade process)
- [ ] Upgrade progress bar displays during upgrade
- [ ] Section separator displays correctly
- [ ] Recipe list displays all recipes for building level
- [ ] Recipe items show correct icons
- [ ] Recipe items show correct cost items
- [ ] Recipe "Make" button appears when `step === 0`
- [ ] Recipe "Take" button appears when `step === 2`
- [ ] Recipe list scrolls correctly
- [ ] Building updates trigger panel refresh
- [ ] Back button returns to home panel
- [ ] Panel title updates when building upgrades

---

## 8. Implementation Notes

### 8.1 Formula System Stub

Since the full Formula system is not yet implemented, the recipe items will:
- Display recipe information (icon, name, cost)
- Show button states based on Formula stub properties
- Emit events for crafting actions (to be handled later)
- Not actually craft items yet (deferred to Formula system implementation)

### 8.2 String Data

Building names and recipe names will need string data. For now:
- Use building ID + level for building names (e.g., "Building 1 Level 0")
- Use formula ID for recipe names (e.g., "Recipe 1402021")
- Full string system implementation can be added later

### 8.3 Item Rich Text

Cost items need to be displayed with icons and quantities. Create a simple component:
- Display item icon
- Display item quantity
- Color items red if not enough in inventory
- Color items black/white if enough

### 8.4 Positioning Accuracy

Follow `COCOS_TO_CSS_POSITION_MAPPING.md` guidelines:
- Use Cocos-to-CSS conversion utilities where applicable
- Account for anchor points in positioning
- Test positioning matches original game appearance

---

## 9. Future Enhancements (Deferred)

1. **Full Formula System**: Complete crafting logic implementation
2. **String Data System**: Proper building and recipe names
3. **Recipe Info Dialog**: Show detailed recipe information when clicking icon
4. **Crafting Progress**: Real-time progress updates during crafting
5. **Recipe Filtering**: Filter recipes by availability, locked status, etc.
6. **Recipe Search**: Search functionality for recipes
7. **IAP Integration**: Handyworker bonus (30% time reduction) for upgrades

---

## 10. Cross-Check with Original Game

Before marking as complete, verify:
- [ ] Layout matches original BuildNode structure
- [ ] Positioning matches original game positioning
- [ ] Upgrade view matches original appearance
- [ ] Recipe list matches original appearance
- [ ] Button states match original behavior
- [ ] Scrolling behavior matches original
- [ ] Event handling matches original

