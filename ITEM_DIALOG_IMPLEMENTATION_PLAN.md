# Item Dialog Implementation Plan
## What to implement when clicking on item in Storage Panel

## Overview

When a user clicks on an item in the Storage Panel, an item dialog should appear showing detailed information about the item and allowing the user to use it.

**Original Game Reference**: 
- `OriginalGame/src/ui/uiUtil.js` - `showItemDialog()` function (lines 591-667)
- `OriginalGame/src/ui/dialog.js` - `DialogBig` class (lines 452-536)

---

## 1. Original Game Analysis

### 1.1 Item Click Flow

**From Storage Panel:**
```javascript
// storageNode.js line 60-62
onItemClickFunc: function () {
    return function (storageCell) {
        uiUtil.showItemDialog(storageCell.item.id, false, 'storage');
    }
}
```

**showItemDialog Function:**
```javascript
uiUtil.showItemDialog = function (itemId, showOnly, source) {
    // 1. Determine dialog type based on item type
    // 2. Load string config (item_1, item_2, or item_3)
    // 3. Create DialogBig with config
    // 4. Set up action buttons
    // 5. Display item info (title, icon, description, count)
    // 6. Show special messages if needed
}
```

### 1.2 Dialog Structure

**DialogBig Layout:**
- Background: `dialog_big_bg.png`
- Size: Based on background sprite (typically ~400x500px)
- Position: Centered on screen with semi-transparent overlay
- Three main sections:
  1. **Title Node** (top, 90px height)
     - Item icon (left side)
     - Item title (next to icon)
     - txt_1: Item count (e.g., "Count: 5")
     - txt_2: Additional info (if needed)
  2. **Content Node** (middle, variable height)
     - dig_des: Large item image (`dig_item_{itemId}.png`)
     - des: Item description text
     - Special messages (equip needed, buff warning, etc.)
  3. **Action Node** (bottom, 72px height)
     - btn_1: Close/Cancel button (left)
     - btn_2: Use button (right) - only if not showOnly

### 1.3 Dialog Type Selection

**Based on Item Type:**
```javascript
var stringId = "item_1";  // Default
if (item.isType(ItemType.TOOL, ItemType.FOOD)) {
    stringId = "item_2";  // Food items
} else if (item.isType(ItemType.TOOL, ItemType.MEDICINE)) {
    stringId = "item_3";  // Medicine items
} else if (item.isType(ItemType.TOOL, ItemType.BUFF) || itemId == 1106014) {
    stringId = "item_3";  // Buff items
}
```

**String Config Structure** (from `stringUtil.getString(stringId)`):
```javascript
{
    title: {
        txt_1: "Count: %d",  // Format string for count
        // Other title fields
    },
    content: {
        des: "",  // Description (from item string)
        dig_des: "",  // Large image path
    },
    action: {
        btn_1: { txt: "Close" },  // Close button
        btn_2: { txt: "Use" }     // Use button (if applicable)
    }
}
```

### 1.4 Item Information Display

**Title Section:**
- Icon: `icon_item_{itemId}.png` (left side, 20px from left edge)
- Title: Item name from `stringUtil.getString(itemId).title`
- Count: "Count: {storage.getNumByItemId(itemId)}" (txt_1)
- Position: Icon at leftEdge, title next to icon, count below title

**Content Section:**
- Large Image: `dig_item_{itemId}.png` (centered, top of content)
- Description: Item description from `stringUtil.getString(itemId).des`
- Special Messages:
  - Equip needed: For items [1305053, 1305075, 1305064]
  - No equip needed: For items [1305034, 1305024, 1305023, 1306001]
  - Buff warning: For buff items (red text warning)

### 1.5 Action Buttons

**Button Layout:**
- btn_1 (Close): Left side, dismisses dialog
- btn_2 (Use): Right side, emits `btn_1_click` event with itemId and source

**Use Button Handler:**
```javascript
config.action.btn_2.cb = function () {
    if (player.getSetting("inStorage", false) && userGuide.isStep(userGuide.stepName.STORAGE_EAT) && userGuide.isItemEat(itemId)) {
        userGuide.step();
    }
    utils.emitter.emit("btn_1_click", itemId, source);
};
```

### 1.6 Item Count Source

**Determines which storage to check:**
```javascript
var storage;
if (player.isAtHome) {
    storage = player.storage;  // Use home storage
} else if (player.isAtBazaar && source == "bazaar") {
    // Use shop list
} else {
    if (player.tmpBag) {
        storage = player.tmpBag;
    } else {
        storage = player.bag;  // Use bag
    }
}
txt1.setString(cc.formatStr(txt1.getString(), storage.getNumByItemId(itemId)));
```

---

## 2. Implementation Plan

### 2.1 Dialog Component Structure

**File**: `src/components/overlays/ItemDialog.tsx`

**Props:**
```typescript
interface ItemDialogProps {
  itemId: string
  source: 'storage' | 'bag' | 'bazaar'  // Where item is from
  showOnly?: boolean  // If true, hide use button
  onClose: () => void
  onUse?: (itemId: string, source: string) => void
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
      {/* Icon, title, count */}
    </div>
    
    {/* Content section */}
    <div className="absolute" style={{ /* middle area */ }}>
      {/* Large image, description, special messages */}
    </div>
    
    {/* Action section */}
    <div className="absolute" style={{ bottom: 0, height: 72 }}>
      {/* Close and Use buttons */}
    </div>
  </div>
</div>
```

### 2.2 Dialog Overlay System

**File**: `src/components/overlays/ItemDialog.tsx` (new)

**Features:**
- Modal overlay (blocks interaction with background)
- Centered dialog
- Close on overlay click or ESC key
- Z-index: 50 (above panels, below other overlays if needed)

**Integration with UI Store:**
- Add `itemDialog` to overlay types in `uiStore.ts`
- Show/hide via `uiStore.setOverlay('itemDialog', { itemId, source })`

### 2.3 String Data Requirements

**File**: `src/data/strings/` (to be created or extended)

**Required String IDs:**
- `item_1`: Default item dialog config
- `item_2`: Food item dialog config
- `item_3`: Medicine/Buff item dialog config
- `{itemId}`: Individual item strings (title, des)
- `1028`: Weight string format
- `1029`: Count string format
- `1030`: "Use" button text
- `1031`: "Close" button text
- `equip_needed`: "Equipment needed" message
- `no_need_equip`: "No equipment needed" message
- `1299`: Buff warning message

**String Config Structure:**
```typescript
interface ItemDialogStringConfig {
  title: {
    txt_1?: string  // Count format: "Count: %d"
  }
  content: {
    des?: string
    dig_des?: string
  }
  action: {
    btn_1: { txt: string }  // Close
    btn_2?: { txt: string } // Use (optional)
  }
}
```

### 2.4 Item Use Integration

**Current Implementation:**
- StoragePanelContent already listens to `btn_1_click` event
- Need to implement actual item use logic

**Item Use Flow:**
1. User clicks "Use" button in dialog
2. Dialog emits `btn_1_click` event with `{ itemId, source }`
3. StoragePanelContent receives event
4. Call `player.useItem(itemId, source)` (to be implemented)
5. Update storage view if item was used

**File**: `src/game/systems/ItemUseSystem.ts` (to be created)

**Item Use Logic:**
- Check if item can be used
- Apply item effects (food, medicine, buff, etc.)
- Remove item from storage
- Update player attributes
- Show feedback message

### 2.5 Coordinate Conversion

**Dialog Positioning:**
- Original: Centered on screen, positioned at `(winSize.width - width) / 2, 29 + (839 - height) / 2`
- CSS: Use fixed positioning, centered with `left: 50%, top: 50%, transform: translate(-50%, -50%)`

**Dialog Size:**
- Background sprite determines size
- Check actual sprite dimensions
- Typically ~400px width, ~500px height

**Section Positions:**
- Title: Top, 90px height
- Content: Middle, variable height
- Action: Bottom, 72px height
- Left/Right edges: 20px from dialog edges

### 2.6 Special Item Handling

**Equip Needed Items:**
- Items: [1305053, 1305075, 1305064]
- Show message: "Equipment needed" appended to description

**No Equip Needed Items:**
- Items: [1305034, 1305024, 1305023, 1306001]
- Show message: "No equipment needed" appended to description

**Buff Items:**
- Items with type TOOL + BUFF
- Show red warning message below description
- Message: String 1299

---

## 3. Implementation Steps

### Step 1: Create Dialog Overlay Component
- Create `ItemDialog.tsx` component
- Implement basic structure (overlay, background, sections)
- Add close functionality

### Step 2: Implement Title Section
- Item icon display
- Item title text
- Item count display
- Proper positioning

### Step 3: Implement Content Section
- Large item image (dig_des)
- Description text
- Special messages (equip needed, buff warning)

### Step 4: Implement Action Section
- Close button
- Use button (conditional)
- Button click handlers

### Step 5: Integrate with UI Store
- Add itemDialog to overlay types
- Add show/hide methods
- Connect to StoragePanelContent

### Step 6: Add String Data
- Create string data files
- Add item dialog configs
- Add item-specific strings

### Step 7: Item Use System
- Create ItemUseSystem
- Implement item use logic
- Connect to dialog

### Step 8: Testing
- Test dialog display
- Test item information
- Test use button
- Test special messages

---

## 4. Files to Create/Modify

### New Files:
1. `src/components/overlays/ItemDialog.tsx` - Main dialog component
2. `src/game/systems/ItemUseSystem.ts` - Item use logic
3. `src/data/strings/itemDialog.ts` - Dialog string configs
4. `src/data/strings/items.ts` - Item-specific strings

### Modified Files:
1. `src/components/panels/StoragePanelContent.tsx` - Connect to dialog
2. `src/store/uiStore.ts` - Add itemDialog overlay type
3. `src/components/overlays/index.ts` - Export ItemDialog

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
- Title: Next to icon
- Count: Below title

**Content Node:**
- Top: 90px (below title)
- Bottom: 72px (above action)
- Height: dialogHeight - 90 - 72
- Large image: Centered, top of content
- Description: Below image, leftEdge to rightEdge

**Action Node:**
- Bottom: 0px (from dialog bottom)
- Height: 72px
- Buttons: Left (btn_1) and Right (btn_2)

---

## 6. Dependencies

### Required Systems:
- String system (for item names, descriptions, dialog configs)
- Item system (Item class, itemConfig)
- Storage system (to get item count)
- Player store (to check location, get storage)

### Optional Systems (for full functionality):
- Item use system (to actually use items)
- User guide system (for tutorial hints)
- Audio system (for dialog popup sound)

---

## 7. Future Enhancements

1. **Item Use System**: Full implementation of item effects
2. **Item Slider Dialog**: For transferring items between storages
3. **Item Comparison**: Show item stats when equipping
4. **Item Tooltips**: Quick info on hover (if needed)
5. **Item Filters**: Filter items in dialog by type
6. **Item Search**: Search items by name

---

## 8. Notes

### 8.1 Dialog Types
- `DialogBig`: Used for item dialogs (larger, with image)
- `DialogSmall`: Used for simpler dialogs (no large image)
- For now, implement DialogBig only

### 8.2 String System
- String system is not yet implemented
- For now, can hardcode strings or use placeholder
- Full string system implementation deferred to later phase

### 8.3 Item Use
- Item use logic is complex (food effects, medicine effects, buffs, etc.)
- Can start with placeholder that removes item from storage
- Full effects implementation deferred to later phase

### 8.4 User Guide
- User guide warnings (icon_warn) are optional
- Can skip for now, implement later

---

## End of Plan

This plan provides a comprehensive guide for implementing the Item Dialog when clicking on items in the Storage Panel. The dialog should match the original game's appearance and functionality as closely as possible.

