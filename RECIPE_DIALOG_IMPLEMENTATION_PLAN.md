# Recipe Dialog Implementation Plan

## Overview

When a user clicks on the recipe icon in the RecipeListItem component, a recipe dialog should appear showing detailed information about the recipe, including the recipe name, icon, and description.

**Original Game Reference**: 
- `OriginalGame/src/ui/uiUtil.js` - `showBuildActionDialog()` function (lines 766-778)
- `OriginalGame/src/ui/dialog.js` - `DialogSmall` class (lines 595-634)
- `OriginalGame/src/data/string/string_en.js` - Recipe string configs (e.g., "b_a_1", "b_a_5", etc.)

---

## 1. Original Game Analysis

### 1.1 Recipe Dialog Flow

**From RecipeListItem:**
```javascript
// buildNode.js - when clicking recipe icon
uiUtil.showBuildActionDialog(self.build.id, index);
```

**showBuildActionDialog Function:**
```javascript
uiUtil.showBuildActionDialog = function (bid, index) {
    // 1. Clone base "build" string config
    // 2. Get recipe-specific string config ("b_a_" + bid, or "b_a_" + bid + "_" + index for special cases)
    // 3. Set title, icon, and description
    // 4. Create DialogSmall with config
    // 5. Show dialog
}
```

### 1.2 Dialog Structure

**DialogSmall Layout:**
- Background: `dialog_small_2_bg.png`
- Size: Based on background sprite (typically ~400x300px)
- Position: Centered on screen with semi-transparent overlay
- Three main sections:
  1. **Title Node** (top, 90px height)
     - Recipe icon (left side): `build_action_{bid}_{index}.png`
     - Recipe title (next to icon): From string config `"b_a_" + bid` (or `"b_a_" + bid + "_" + index`)
  2. **Content Node** (middle, variable height)
     - Description text: From string config `"b_a_" + bid`.des
  3. **Action Node** (bottom, 72px height)
     - btn_1: OK button (centered)

### 1.3 String Config Structure

**Base "build" Config:**
```javascript
{
    title: {},
    content: {},
    action: {
        btn_1: {
            txt: "OK"
        }
    }
}
```

**Recipe-Specific Config** (`"b_a_" + bid` or `"b_a_" + bid + "_" + index`):
```javascript
{
    title: "Recipe Name",
    des: "Recipe description text"
}
```

**Special Cases:**
- Building 10 (Rest), index 1: Uses `"b_a_10_1"` instead of `"b_a_10"`

### 1.4 Recipe Icon

**Icon Format:**
- `build_action_{bid}_{index}.png`
- Example: `build_action_1_0.png` for building 1, recipe index 0
- Icon is in "build" atlas

### 1.5 Recipe Index Mapping

**Current Implementation:**
- Recipes are stored in `building.getBuildActions()` which returns an array of Formula objects
- RecipeListItem receives `index` prop which is the position in the array
- This index corresponds to the recipe's position in the building's recipe list

**Note:** The index in the original game corresponds to the recipe's position in the building's action list, not the formula ID.

---

## 2. Implementation Plan

### 2.1 Dialog Component Structure

**File**: `src/components/overlays/RecipeDialog.tsx` (new)

**Props:**
```typescript
interface RecipeDialogData {
  buildingId: number
  recipeIndex: number  // Index in building's recipe list
}
```

**Layout Structure:**
```typescript
<div className="fixed inset-0 z-50">
  {/* Semi-transparent overlay */}
  <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose} />
  
  {/* Dialog container - centered */}
  <div className="absolute" style={{ /* centered */ }}>
    {/* Background sprite */}
    <Sprite atlas="ui" frame="dialog_small_2_bg.png" />
    
    {/* Title section */}
    <div className="absolute" style={{ top: 0, height: 90 }}>
      {/* Icon, title */}
    </div>
    
    {/* Content section */}
    <div className="absolute" style={{ /* middle area */ }}>
      {/* Description text */}
    </div>
    
    {/* Action section */}
    <div className="absolute" style={{ bottom: 0, height: 72 }}>
      {/* OK button */}
    </div>
  </div>
</div>
```

### 2.2 Dialog Overlay System

**File**: `src/store/uiStore.ts` (modify)

**Add to Overlay type:**
```typescript
export type Overlay = 
  | 'day'
  | 'death'
  | 'battleResult'
  | 'itemChange'
  | 'dialog'
  | 'itemDialog'
  | 'attributeDialog'
  | 'statusDialog'
  | 'buildDialog'
  | 'recipeDialog'  // NEW
  | null
```

**Add show method:**
```typescript
showRecipeDialog: (buildingId: number, recipeIndex: number) => void
```

**Implementation:**
```typescript
showRecipeDialog: (buildingId: number, recipeIndex: number) => {
  set({ 
    activeOverlay: 'recipeDialog', 
    overlayData: { buildingId, recipeIndex } 
  })
}
```

### 2.3 String Data Requirements

**File**: `src/data/strings/` (to be created or extended)

**Required String IDs:**
- `build`: Base build dialog config
  - `action.btn_1.txt`: "OK"
- `"b_a_" + bid`: Recipe-specific strings (e.g., "b_a_1", "b_a_5")
  - `title`: Recipe name
  - `des`: Recipe description
- `"b_a_" + bid + "_" + index`: Special case strings (e.g., "b_a_10_1")

**String Config Structure:**
```typescript
interface RecipeDialogStringConfig {
  title: string
  des: string
}
```

**Note**: String system may not be fully implemented yet. Can use placeholders or hardcoded strings for now.

### 2.4 Recipe Data Requirements

**Required Data:**
- Building instance: `buildingStore.getBuilding(buildingId)`
- Recipe list: `building.getBuildActions()`
- Recipe at index: `recipes[recipeIndex]`
- Recipe string config: `getString("b_a_" + buildingId)` (or `"b_a_" + buildingId + "_" + recipeIndex` for special cases)
- Recipe icon: `build_action_{buildingId}_{recipeIndex}.png`

### 2.5 Coordinate Conversion

**Dialog Positioning:**
- Original: Centered on screen
- CSS: Use fixed positioning, centered with `left: 50%, top: 50%, transform: translate(-50%, -50%)`

**Dialog Size:**
- Background sprite determines size
- Check actual sprite dimensions
- Typically ~400px width, ~300px height

**Section Positions:**
- Title: Top, 90px height
- Content: Middle, variable height
- Action: Bottom, 72px height
- Left/Right edges: 20px from dialog edges (leftEdge/rightEdge)

**Content Node Layout:**
- Description: Positioned at top of content (5px from top), leftEdge to rightEdge

---

## 3. Implementation Steps

### Step 1: Create Dialog Overlay Component
- Create `RecipeDialog.tsx` component
- Implement basic structure (overlay, background, sections)
- Add close functionality (ESC key, overlay click)

### Step 2: Implement Title Section
- Recipe icon display (`build_action_{bid}_{index}.png`)
- Recipe title text
- Proper positioning (leftEdge, centered vertically)

### Step 3: Implement Content Section
- Description text
- Proper positioning and word wrapping

### Step 4: Implement Action Section
- OK button (centered)
- Button click handler (close dialog)

### Step 5: Integrate with UI Store
- Add `recipeDialog` to overlay types
- Add `showRecipeDialog` method
- Connect to RecipeListItem component

### Step 6: Add String Data
- Create/update string data files
- Add recipe dialog configs
- Add recipe-specific strings (or use placeholders)

### Step 7: Connect to RecipeListItem
- Update `handleIconClick` in RecipeListItem
- Call `uiStore.showRecipeDialog(buildingId, index)`

### Step 8: Add to App.tsx
- Add RecipeDialog import and rendering in overlay section

### Step 9: Testing
- Test dialog display
- Test recipe information
- Test close functionality
- Test with different buildings and recipe indices

---

## 4. Files to Create/Modify

### New Files:
1. `src/components/overlays/RecipeDialog.tsx` - Main dialog component

### Modified Files:
1. `src/components/panels/RecipeListItem.tsx` - Connect icon click to dialog
2. `src/store/uiStore.ts` - Add recipeDialog overlay type and show method
3. `src/App.tsx` - Add RecipeDialog to overlay rendering

---

## 5. Coordinate Mapping

### Dialog Positioning

**Original Cocos:**
- Position: Centered on screen
- Screen: 640x1136
- Dialog: ~400x300

**CSS:**
```typescript
const dialogStyle: React.CSSProperties = {
  position: 'fixed',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 50
}
```

### Section Layout

**Title Node:**
- Top: 0px (from dialog top)
- Height: 90px
- Icon: leftEdge (20px), centered vertically
- Title: Next to icon (leftEdge + 50px), centered vertically

**Content Node:**
- Top: 90px (below title)
- Bottom: 72px (above action)
- Height: dialogHeight - 90 - 72
- Description: leftEdge to rightEdge, 5px from top

**Action Node:**
- Bottom: 0px (from dialog bottom)
- Height: 72px
- OK button: Centered horizontally and vertically

---

## 6. Dependencies

### Required Systems:
- Building store (to get building instance and recipe list)
- String system (for recipe names, descriptions, dialog configs) - may use placeholders
- Recipe/Formula system (to get recipe data)

### Optional Systems (for full functionality):
- String system (fully implemented)
- Audio system (for dialog popup sound)

---

## 7. Special Considerations

### 7.1 Recipe Icon Atlas
- Recipe icons are in "build" atlas
- Format: `build_action_{bid}_{index}.png`
- Example: `build_action_1_0.png` for building 1, recipe index 0

### 7.2 String Config Lookup
- Default: `"b_a_" + buildingId`
- Special case: Building 10 (Rest), index 1: `"b_a_10_1"`
- Check if special case string exists, otherwise use default

### 7.3 Recipe Index Validation
- Ensure recipeIndex is within bounds of building's recipe list
- Handle edge cases (empty recipe list, invalid index)

### 7.4 Dialog Type
- Uses `DialogSmall` structure (same as StatusDialog)
- Can reuse similar layout patterns from StatusDialog for consistency

---

## 8. Future Enhancements

1. **String System Integration**: Full string system implementation
2. **Recipe Costs Display**: Show recipe costs in dialog (optional enhancement)
3. **Recipe Produces Display**: Show what recipe produces (optional enhancement)
4. **Recipe Time Display**: Show crafting time if available
5. **Animation**: Add dialog open/close animations

---

## 9. Notes

### 9.1 Dialog Types
- Uses `DialogSmall` structure (same as StatusDialog)
- Can reuse similar layout patterns from StatusDialog for consistency

### 9.2 String System
- String system may not be fully implemented
- Can use placeholders or hardcoded strings for now
- Full string system implementation deferred to later phase

### 9.3 Recipe Index
- Recipe index is the position in the building's recipe list (from `getBuildActions()`)
- This matches the original game's behavior where index corresponds to recipe position

### 9.4 Coordinate System
- Follow COCOS_TO_CSS_POSITION_MAPPING.md guidelines
- Use absolute positioning with proper transforms
- Account for anchor points in original Cocos code

---

## End of Plan

This plan provides a comprehensive guide for implementing the Recipe Dialog when clicking on the recipe icon in the RecipeListItem. The dialog should match the original game's appearance and functionality as closely as possible, showing recipe information using DialogSmall structure.




