# Build Dialog Implementation Plan

## Overview

When a user clicks on the building icon in the UpgradeView component, a build dialog should appear showing detailed information about the building upgrade, including the building image, description, and required upgrade costs.

**Original Game Reference**: 
- `OriginalGame/src/ui/uiUtil.js` - `showBuildDialog()` function (lines 726-764)
- `OriginalGame/src/ui/dialog.js` - `DialogBig` class (lines 452-536)
- `OriginalGame/src/data/string/string_en.js` - "build" string config (line 1323)

---

## 1. Original Game Analysis

### 1.1 Build Dialog Flow

**From UpgradeView:**
```javascript
// buildNode.js line 22-24
uiUtil.showBuildDialog(self.build.id, self.build.isMax() ? self.build.level : (self.build.level + 1));
```

**showBuildDialog Function:**
```javascript
uiUtil.showBuildDialog = function (bid, level) {
    // 1. Clone base "build" string config
    // 2. Get building-specific string config (bid + "_" + level)
    // 3. Set title, icon, description, and large image
    // 4. Create DialogBig with config
    // 5. Get upgrade config and display upgrade costs if available
    // 6. Show dialog
}
```

### 1.2 Dialog Structure

**DialogBig Layout:**
- Background: `dialog_big_bg.png`
- Size: Based on background sprite (typically ~400x500px)
- Position: Centered on screen with semi-transparent overlay
- Three main sections:
  1. **Title Node** (top, 90px height)
     - Building icon (left side): `build_{bid}_{level}.png`
     - Building title (next to icon): From string config `{bid}_{level}.title`
  2. **Content Node** (middle, variable height)
     - Large building image: `dig_build_{bid}_{level}.png` (centered, top of content)
     - Description text: From string config `{bid}_{level}.des`
     - Log section (if upgrade available): Shows upgrade costs
       - Label: "To build you need:" (from config.content.log)
       - ItemRichText: Displays required items with icons and quantities
  3. **Action Node** (bottom, 72px height)
     - btn_1: OK button (centered)

### 1.3 String Config Structure

**Base "build" Config:**
```javascript
{
    title: {},
    content: {
        log: "To build you need:"
    },
    action: {
        btn_1: {
            txt: "OK"
        }
    }
}
```

**Building-Specific Config** (`{bid}_{level}`):
```javascript
{
    title: "Building Name",
    des: "Building description text"
}
```

### 1.4 Upgrade Cost Display

**When Upgrade Available:**
- Get upgrade config: `player.room.getBuild(bid).getUpgradeConfig()`
- If upgrade config exists:
  1. Create log node (height: 130px) at bottom of content
  2. Add label: "To build you need:" at top of log
  3. Get upgrade costs: `upgradeConfig.upgradeCost`
  4. Validate items: `player.validateItems(needItems)`
  5. Map items with colors:
     - Black if `haveNum >= num`
     - Red if `haveNum < num`
  6. Create ItemRichText with:
     - Items array (with colors)
     - Width: `dialog.rightEdge - dialog.leftEdge`
     - Columns: 3
     - Icon scale: 0.5
     - Text color: BLACK
  7. Position ItemRichText below label

**ItemRichText Parameters:**
```javascript
new ItemRichText(
    needItems,                    // Array of {itemId, num, color}
    dialog.rightEdge - dialog.leftEdge,  // Width (typically 556px)
    3,                            // Columns
    0.5,                          // Icon scale
    cc.color.BLACK                // Default text color
)
```

### 1.5 Dialog Positioning

**Original Cocos:**
- Dialog centered on screen
- Position: `((winSize.width - width) / 2, 29 + (839 - height) / 2)`
- Screen: 640x1136
- Dialog: ~400x500

**Content Node Layout:**
- Large image (dig_des): Centered horizontally, positioned at top (5px from top)
- Description (des): Below image, positioned at `leftEdge`, with width `rightEdge - leftEdge`
- Log section: At bottom of content, height 130px (when upgrade available)

---

## 2. Implementation Plan

### 2.1 Dialog Component Structure

**File**: `src/components/overlays/BuildDialog.tsx` (new)

**Props:**
```typescript
interface BuildDialogProps {
  buildingId: number
  level: number  // Level to show (current level + 1 for upgrade, or current level)
  onClose: () => void
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
    <Sprite atlas="ui" frame="dialog_big_bg.png" />
    
    {/* Title section */}
    <div className="absolute" style={{ top: 0, height: 90 }}>
      {/* Icon, title */}
    </div>
    
    {/* Content section */}
    <div className="absolute" style={{ /* middle area */ }}>
      {/* Large image, description, upgrade costs */}
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
  | 'death'
  | 'itemDialog'
  | 'attributeDialog'
  | 'statusDialog'
  | 'buildDialog'  // NEW
  | null
```

**Add show method:**
```typescript
showBuildDialog: (buildingId: number, level: number) => void
```

**Implementation:**
```typescript
showBuildDialog: (buildingId: number, level: number) => {
  set({ 
    activeOverlay: 'buildDialog', 
    overlayData: { buildingId, level } 
  })
}
```

### 2.3 String Data Requirements

**File**: `src/data/strings/` (to be created or extended)

**Required String IDs:**
- `build`: Base build dialog config
  - `content.log`: "To build you need:"
  - `action.btn_1.txt`: "OK"
- `{bid}_{level}`: Building-specific strings
  - `title`: Building name
  - `des`: Building description

**String Config Structure:**
```typescript
interface BuildDialogStringConfig {
  title: {}
  content: {
    log?: string  // "To build you need:"
  }
  action: {
    btn_1: { txt: string }  // "OK"
  }
}

interface BuildingStringConfig {
  title: string
  des: string
}
```

**Note**: String system may not be fully implemented yet. Can use placeholders or hardcoded strings for now.

### 2.4 Building Data Requirements

**Required Data:**
- Building instance: `buildingStore.getBuilding(buildingId)`
- Building upgrade config: `building.getUpgradeConfig()`
- Building string config: `getString({bid}_{level})`
- Building icon: `build_{bid}_{level}.png`
- Building large image: `dig_build_{bid}_{level}.png`

**Upgrade Cost Structure:**
```typescript
interface UpgradeConfig {
  upgradeCost: Array<{
    itemId: string | number
    num: number
    haveNum?: number  // Added by validation
  }>
  // ... other upgrade fields
}
```

### 2.5 Item Cost Display

**Reuse Existing Component:**
- `ItemCostDisplay` component already exists in `src/components/common/ItemCostDisplay.tsx`
- Supports:
  - Multiple columns (default: 3)
  - Icon scale (default: 0.5)
  - Color coding (red if not enough items)
  - Width customization

**Usage:**
```typescript
<ItemCostDisplay
  costs={upgradeCosts}
  columns={3}
  iconScale={0.5}
  textSize={20}  // COMMON_3 font size
  textColor="#000000"  // BLACK
  width={dialogWidth - leftEdge * 2}  // rightEdge - leftEdge
/>
```

### 2.6 Coordinate Conversion

**Dialog Positioning:**
- Original: Centered on screen
- CSS: Use fixed positioning, centered with `left: 50%, top: 50%, transform: translate(-50%, -50%)`

**Dialog Size:**
- Background sprite determines size
- Check actual sprite dimensions
- Typically ~400px width, ~500px height

**Section Positions:**
- Title: Top, 90px height
- Content: Middle, variable height
- Action: Bottom, 72px height
- Left/Right edges: 20px from dialog edges (leftEdge/rightEdge)

**Content Node Layout:**
- Large image: Centered horizontally, 5px from top
- Description: Below image, leftEdge to rightEdge, positioned dynamically
- Log section: At bottom of content, 130px height (when upgrade available)
  - Label: 10px from top of log
  - ItemRichText: Below label, 10px gap

---

## 3. Implementation Steps

### Step 1: Create Dialog Overlay Component
- Create `BuildDialog.tsx` component
- Implement basic structure (overlay, background, sections)
- Add close functionality (ESC key, overlay click)

### Step 2: Implement Title Section
- Building icon display (`build_{bid}_{level}.png`)
- Building title text
- Proper positioning (leftEdge, centered vertically)

### Step 3: Implement Content Section
- Large building image (`dig_build_{bid}_{level}.png`) - centered, top
- Description text - below image
- Calculate content height dynamically

### Step 4: Implement Upgrade Cost Display
- Check if upgrade config exists
- Create log section at bottom of content (130px height)
- Display "To build you need:" label
- Use ItemCostDisplay component for costs
- Validate items and color code (red if insufficient)

### Step 5: Implement Action Section
- OK button (centered)
- Button click handler (close dialog)

### Step 6: Integrate with UI Store
- Add `buildDialog` to overlay types
- Add `showBuildDialog` method
- Connect to UpgradeView component

### Step 7: Add String Data
- Create/update string data files
- Add build dialog configs
- Add building-specific strings (or use placeholders)

### Step 8: Connect to UpgradeView
- Update `handleIconClick` in UpgradeView
- Call `uiStore.showBuildDialog(building.id, targetLevel)`

### Step 9: Testing
- Test dialog display
- Test building information
- Test upgrade cost display
- Test item validation and color coding
- Test close functionality

---

## 4. Files to Create/Modify

### New Files:
1. `src/components/overlays/BuildDialog.tsx` - Main dialog component

### Modified Files:
1. `src/components/panels/UpgradeView.tsx` - Connect icon click to dialog
2. `src/store/uiStore.ts` - Add buildDialog overlay type and show method
3. `src/components/overlays/index.ts` - Export BuildDialog (if exists)
4. `src/App.tsx` - Add BuildDialog to overlay rendering (if needed)

---

## 5. Coordinate Mapping

### Dialog Positioning

**Original Cocos:**
- Position: `((winSize.width - width) / 2, 29 + (839 - height) / 2)`
- Screen: 640x1136
- Dialog: ~400x500

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
- Large image: Centered horizontally, 5px from top
- Description: Below image, leftEdge to rightEdge
- Log section: At bottom, 130px height (when upgrade available)
  - Label: leftEdge, 10px from top of log
  - ItemRichText: leftEdge, below label with 10px gap

**Action Node:**
- Bottom: 0px (from dialog bottom)
- Height: 72px
- OK button: Centered horizontally and vertically

### Content Node Internal Layout

**When Upgrade Available:**
- Content height = dialogHeight - 90 - 72
- Log section height = 130px
- Available space for image + description = contentHeight - 130px
- Large image: Top of content (5px from top)
- Description: Below image (dynamic positioning)
- Log section: Bottom of content (0px from bottom)

**When No Upgrade:**
- Content height = dialogHeight - 90 - 72
- Large image: Top of content (5px from top)
- Description: Below image (dynamic positioning)

---

## 6. Dependencies

### Required Systems:
- Building store (to get building instance and upgrade config)
- Player store (to validate items)
- String system (for building names, descriptions, dialog configs) - may use placeholders
- ItemCostDisplay component (already exists)

### Optional Systems (for full functionality):
- String system (fully implemented)
- Audio system (for dialog popup sound)

---

## 7. Special Considerations

### 7.1 Building Icon Atlas
- Building icons are in "build" atlas
- Format: `build_{bid}_{level}.png`
- Example: `build_1_0.png` for building 1, level 0

### 7.2 Building Large Image Atlas
- Large building images are in "dig_build" atlas
- Format: `dig_build_{bid}_{level}.png`
- Example: `dig_build_1_0.png` for building 1, level 0

### 7.3 Item Validation
- Check both bag and storage for item counts
- Use `playerStore.getBagItemCount()` and `playerStore.getStorageItemCount()`
- Sum both counts for total available
- Color code: Black if enough, Red if insufficient

### 7.4 Level Display
- Show target level (current level + 1 for upgrade)
- Or show current level if building is max level
- Logic: `building.isMax() ? building.level : (building.level + 1)`

### 7.5 Content Height Calculation
- When upgrade available: Reserve 130px at bottom for log section
- Adjust description position to fit above log section
- When no upgrade: Use full content height for image and description

---

## 8. Future Enhancements

1. **String System Integration**: Full string system implementation
2. **Building Effects Display**: Show building effects/benefits
3. **Upgrade Time Display**: Show upgrade time if available
4. **Building Requirements**: Show building requirements (if any)
5. **Animation**: Add dialog open/close animations

---

## 9. Notes

### 9.1 Dialog Types
- Uses `DialogBig` structure (same as ItemDialog)
- Can reuse similar layout patterns from ItemDialog

### 9.2 String System
- String system may not be fully implemented
- Can use placeholders or hardcoded strings for now
- Full string system implementation deferred to later phase

### 9.3 Item Validation
- ItemCostDisplay already handles validation and color coding
- Just need to pass correct costs array

### 9.4 Coordinate System
- Follow COCOS_TO_CSS_POSITION_MAPPING.md guidelines
- Use absolute positioning with proper transforms
- Account for anchor points in original Cocos code

---

## End of Plan

This plan provides a comprehensive guide for implementing the Build Dialog when clicking on the building icon in the UpgradeView. The dialog should match the original game's appearance and functionality as closely as possible, showing building information and upgrade costs when available.




