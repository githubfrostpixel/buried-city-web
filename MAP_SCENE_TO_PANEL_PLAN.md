# Map Scene to Panel Conversion Plan

## Overview

This plan covers converting MapScene from a separate scene to a panel component, matching the original game architecture where MapNode extends BottomFrameNode (a panel, not a scene).

**Status**: PLAN Mode - No code changes will be made

**Original Game Reference**: `OriginalGame/src/ui/MapNode.js`
- `MapNode` extends `BottomFrameNode` (panel, not scene)
- `uiConfig`: `{ title: "", leftBtn: false, rightBtn: false }`
- MapView is added as a child of the BottomFrame

**Current Implementation**: MapScene is a separate scene with TopBar and BottomBar

**Target Implementation**: MapPanelContent as a panel component (like HomePanelContent, GatePanelContent, etc.)

---

## Current State Analysis

### What Exists

1. **MapScene Component** (`src/components/scenes/MapScene.tsx`):
   - ✅ Full implementation with map background, sites, player actor
   - ✅ Uses TopBar and BottomBar
   - ✅ Renders map content inside BottomBar
   - ❌ Currently a separate scene

2. **Navigation to Map**:
   - `GateOutPanelContent.tsx`: Uses `uiStore.setScene('map')` (line 47)
   - `App.tsx`: Renders `<MapScene />` when `currentScene === 'map'` (line 39)

3. **UIStore**:
   - ✅ Has `'map'` in Scene type
   - ❌ Does NOT have `'map'` in Panel type

4. **MainScene**:
   - ✅ Renders panels via `renderPanel()` switch statement
   - ❌ Does NOT have case for `'map'` panel

---

## Original Game Architecture

### MapNode Structure

**File**: `OriginalGame/src/ui/MapNode.js`

```javascript
var MapNode = BottomFrameNode.extend({
    _init: function () {
        this.setName(Navigation.nodeName.MAP_NODE);
        this.uiConfig = {
            title: "",
            leftBtn: false,
            rightBtn: false
        };

        var mapView = new MapView(cc.size(this.bgRect.width - 12, this.bgRect.height - 12));
        mapView.setPosition((this.bgRect.width - mapView.getViewSize().width) / 2 + 1, 6);
        this.bg.addChild(mapView, 2);
    },
});
```

**Key Points**:
- Extends `BottomFrameNode` (panel, not scene)
- No buttons (leftBtn: false, rightBtn: false)
- Empty title ("")
- MapView is a child of the BottomFrame (not a separate scene)

**Navigation**:
- From `GateOutNode.goOut()`: `this.forward(Navigation.nodeName.MAP_NODE)`
- This navigates to a panel, not a scene

---

## Implementation Requirements

### 1. Create MapPanelContent Component

**File**: `src/components/panels/MapPanelContent.tsx`

**Action**: Move content from `MapScene.tsx` to `MapPanelContent.tsx`

**Structure**:
```typescript
export function MapPanelContent() {
  // Same content as current MapScene.renderMapContent()
  // But without TopBar and BottomBar wrappers
  // (BottomBar is provided by MainScene)
}
```

**Content to Move**:
- Map background rendering
- Sites rendering
- Player actor rendering
- Site click handlers
- Coordinate conversion logic

**Remove**:
- TopBar component (handled by MainScene)
- BottomBar component (handled by MainScene)
- Screen container div (handled by MainScene)
- Screen width/height constants (use BottomBar content area)

**Keep**:
- All map rendering logic
- Site click handlers
- Player position display
- Coordinate conversion

---

### 2. Add 'map' to Panel Type

**File**: `src/store/uiStore.ts`

**Changes**:
```typescript
export type Panel = 
  | 'home'
  | 'build'
  | 'storage'
  | 'crafting'
  | 'equipment'
  | 'npc'
  | 'site'
  | 'bazaar'
  | 'dog'
  | 'radio'
  | 'gate'
  | 'gateOut'
  | 'map'  // NEW
  | null
```

**Tasks**:
- [ ] Add `'map'` to Panel type union
- [ ] Verify no conflicts with existing panels

---

### 3. Update MainScene to Handle Map Panel

**File**: `src/components/scenes/MainScene.tsx`

**Changes**:

1. **Import MapPanelContent**:
   ```typescript
   import { MapPanelContent } from '@/components/panels/MapPanelContent'
   ```

2. **Add case to renderPanel()**:
   ```typescript
   case 'map':
     return <MapPanelContent />
   ```

3. **Update getPanelTitle()**:
   ```typescript
   case 'map':
     return '' // Empty title (matches original)
   ```

4. **Update shouldShowBackButton()**:
   ```typescript
   // Map panel has no back button (matches original)
   if (currentPanel === 'map') return false
   ```

5. **Update shouldShowForwardButton()**:
   ```typescript
   // Map panel has no forward button (matches original)
   if (currentPanel === 'map') return false
   ```

6. **Update fullScreen check**:
   ```typescript
   fullScreen={currentPanel === 'home' || currentPanel === 'gateOut' || currentPanel === 'map'}
   ```

**Tasks**:
- [ ] Import MapPanelContent
- [ ] Add 'map' case to renderPanel()
- [ ] Add 'map' case to getPanelTitle()
- [ ] Update shouldShowBackButton()
- [ ] Update shouldShowForwardButton()
- [ ] Update fullScreen prop

---

### 4. Update GateOutPanelContent Navigation

**File**: `src/components/panels/GateOutPanelContent.tsx`

**Current** (line 47):
```typescript
// Navigate to map scene
uiStore.setScene('map')
```

**Change to**:
```typescript
// Navigate to map panel (in main scene)
uiStore.setScene('main')
uiStore.openPanelAction('map')
```

**Tasks**:
- [ ] Change navigation from `setScene('map')` to `setScene('main')` + `openPanelAction('map')`
- [ ] Test navigation works correctly

---

### 5. Remove MapScene from App.tsx

**File**: `src/App.tsx`

**Current**:
```typescript
import { MapScene } from './components/scenes/MapScene'
// ...
{currentScene === 'map' && <MapScene />}
```

**Changes**:
- Remove import of MapScene
- Remove map scene rendering
- Optionally: Remove 'map' from Scene type (or keep for future use)

**Tasks**:
- [ ] Remove MapScene import
- [ ] Remove map scene rendering
- [ ] Decide whether to keep 'map' in Scene type (for future use or remove)

---

### 6. Delete MapScene Component

**File**: `src/components/scenes/MapScene.tsx`

**Action**: Delete file after content is moved to MapPanelContent

**Tasks**:
- [ ] Verify MapPanelContent has all functionality
- [ ] Delete MapScene.tsx file

---

### 7. Update MapPanelContent Coordinate System

**Current Issue**: MapScene uses screen height (1136px) for coordinate conversion, but it should use BottomBar content area height.

**File**: `src/components/panels/MapPanelContent.tsx`

**Current**:
```typescript
const cocosToCssY = (cocosY: number): number => {
  return screenHeight - cocosY  // Uses screen height
}
```

**Update to**:
```typescript
// Map coordinates are relative to map background, not screen
// Map background is larger than screen (scrollable)
// For now, use content area height or map background dimensions
const cocosToCssY = (cocosY: number): number => {
  // TODO: Get actual map background height
  // For now, use content area height as approximation
  const contentHeight = BOTTOM_BAR_LAYOUT.content.height
  return contentHeight - cocosY
}
```

**Note**: The original map is scrollable and larger than the screen. We may need to handle scrolling later, but for now, use content area dimensions.

**Tasks**:
- [ ] Update coordinate conversion to use content area dimensions
- [ ] Test site positioning is correct
- [ ] Test player actor positioning is correct

---

## Implementation Steps

### Step 1: Create MapPanelContent Component

1. Create `src/components/panels/MapPanelContent.tsx`
2. Copy content from `MapScene.renderMapContent()` 
3. Remove TopBar and BottomBar wrappers
4. Remove screen container div
5. Update coordinate conversion to use content area
6. Keep all map rendering logic

**Status**: ⚠️ Needs implementation

---

### Step 2: Update UIStore

1. Add `'map'` to Panel type union
2. Verify no type conflicts

**Status**: ⚠️ Needs implementation

---

### Step 3: Update MainScene

1. Import MapPanelContent
2. Add 'map' case to renderPanel()
3. Add 'map' case to getPanelTitle() (returns "")
4. Update shouldShowBackButton() (returns false for map)
5. Update shouldShowForwardButton() (returns false for map)
6. Update fullScreen prop (include 'map')

**Status**: ⚠️ Needs implementation

---

### Step 4: Update GateOutPanelContent

1. Change navigation from `setScene('map')` to:
   ```typescript
   uiStore.setScene('main')
   uiStore.openPanelAction('map')
   ```
2. Test navigation works

**Status**: ⚠️ Needs implementation

---

### Step 5: Clean Up App.tsx

1. Remove MapScene import
2. Remove map scene rendering
3. Optionally remove 'map' from Scene type (or keep for future)

**Status**: ⚠️ Needs implementation

---

### Step 6: Delete MapScene

1. Verify MapPanelContent works correctly
2. Delete `src/components/scenes/MapScene.tsx`

**Status**: ⚠️ Needs implementation

---

## File Structure Changes

### Before
```
src/
  components/
    scenes/
      MapScene.tsx          # Map as separate scene
    panels/
      (no map panel)
```

### After
```
src/
  components/
    scenes/
      (MapScene.tsx deleted)
    panels/
      MapPanelContent.tsx   # Map as panel
```

---

## Coordinate System Considerations

### Map Background Dimensions

**Original Game**:
- Map background (`map_bg_new.png`) is larger than screen
- MapView is scrollable (ScrollView)
- Sites positioned on map background (not screen)

**Current Implementation**:
- Map background spans BottomBar content area
- Content area: `596 × 758` pixels (scaled)
- Map coordinates need conversion relative to content area

**Coordinate Conversion**:
- Cocos Y: Measured from bottom of map background
- CSS Y: Measured from top of content area
- Conversion: `cssY = contentHeight - cocosY`

**Note**: If map background is larger than content area, we may need scrolling later. For now, assume content area contains the visible map portion.

---

## Testing Checklist

### Panel Navigation
- [ ] Gate out panel navigates to map panel (not map scene)
- [ ] Map panel opens in MainScene
- [ ] TopBar is visible on map panel
- [ ] BottomBar is visible on map panel
- [ ] Map panel has no buttons (leftBtn: false, rightBtn: false)
- [ ] Map panel has empty title ("")

### Map Display
- [ ] Map background displays correctly
- [ ] Map background spans bottom bar content area
- [ ] Sites are positioned correctly
- [ ] Player actor is positioned correctly
- [ ] Site icons display correctly
- [ ] Home site uses `site_big_bg.png`
- [ ] Other sites use `site_bg.png`

### Site Interaction
- [ ] Sites are clickable
- [ ] Home site click navigates to home panel
- [ ] Other site clicks show placeholder (ready for site dialogs)

### Navigation Flow
- [ ] Gate panel → Gate out panel → Map panel
- [ ] Map panel → Home site → Home panel
- [ ] Navigation preserves MainScene structure

---

## Dependencies Checklist

### ✅ Already Implemented
- [x] Map class with sites and positions
- [x] Site classes with getName() method
- [x] BottomBar component with fullScreen mode
- [x] TopBar component
- [x] MainScene panel rendering system
- [x] UIStore panel management

### ⚠️ Needs Implementation
- [ ] MapPanelContent component
- [ ] 'map' panel type in UIStore
- [ ] MainScene map panel handling
- [ ] GateOutPanelContent navigation update
- [ ] App.tsx cleanup

---

## Benefits of Panel Approach

1. **Matches Original**: MapNode extends BottomFrameNode (panel, not scene)
2. **Consistent Architecture**: All game content is in MainScene with panels
3. **Simpler Navigation**: No scene switching, just panel switching
4. **Better State Management**: All panels share MainScene state
5. **Easier Integration**: Map panel can be accessed from anywhere in MainScene

---

## Notes

1. **Scene Type**: We can keep 'map' in Scene type for future use (e.g., if we need a separate map scene for special cases), but it won't be used for normal map navigation.

2. **Coordinate System**: The map coordinate conversion may need adjustment once we know the actual map background dimensions. For now, using content area height should work for the visible portion.

3. **Scrolling**: The original map is scrollable. We may need to implement scrolling later, but for now, the basic panel structure is the priority.

4. **Site Dialogs**: Site click handlers are stubbed. Full implementation will be in Phase 3.2 (Site System).

5. **Player Movement**: Player actor movement on map is not yet implemented. This will be part of Phase 3.1 (Map System) full implementation.

---

## Cross-Check with Original Game

After implementation, verify:

- [ ] Map panel structure matches original (BottomFrameNode with MapView)
- [ ] Navigation matches original (panel navigation, not scene)
- [ ] UI config matches original (no buttons, empty title)
- [ ] Map background displays correctly
- [ ] Sites and player position correctly
- [ ] Panel can be accessed from MainScene

---

## Next Steps

1. **Review this plan** and approve or request modifications
2. **Switch to ACT mode** to begin implementation
3. **Start with Step 1**: Create MapPanelContent component
4. **Proceed through steps** in order
5. **Test each step** before moving to the next

---

## Related Documents

- `GATE_PANEL_GO_TO_MAP_PLAN.md` - Gate to map navigation plan
- `PHASE_3_1_MAP_SYSTEM_PREPARATION_PLAN.md` - Map system details
- `COCOS_TO_CSS_POSITION_MAPPING.md` - Position conversion reference


