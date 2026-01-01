# Attribute Dialog Item UI/Layout Crosscheck Plan

## Overview

This plan verifies that the item UI/layout in AttributeStatusDialog matches the original game's visual presentation and layout structure.

## Original Game Implementation

### Source
`OriginalGame/src/ui/uiUtil.js` - `createItemListSliders()` function (lines 1706-1794)
`OriginalGame/src/ui/topFrame.js` - `showAttrStatusDialog()` function (lines 517-521)

### Item List Component

**Type**: `cc.TableView` (horizontal scrolling table view)

**View Size**: `cc.size(400, 100)` - 400px wide, 100px tall

**Scroll Direction**: Horizontal (`cc.SCROLLVIEW_DIRECTION_HORIZONTAL`)

**Position in Dialog**: 
- `x: 20` (leftEdge)
- `y: 2` (from top of contentNode)

### Cell Structure

**Cell Size**: `cc.size(100, 100)` - Each cell is 100x100 pixels

**Cell Components**:

1. **Background Sprite**:
   - Image: `item_bg.png`
   - Position: Centered in cell (`x: size.width / 2, y: size.height / 2`)
   - Size: 100x100 pixels (matches cell size)

2. **Item Icon**:
   - Image: `icon_item_{itemId}.png`
   - Position: Centered in background (`x: bg.width / 2, y: bg.height / 2`)
   - Fallback: If icon not found, uses default icon

3. **Count Label**:
   - Type: `cc.LabelTTF`
   - Font: `uiUtil.fontFamily.normal`, `uiUtil.fontSize.COMMON_2`
   - Position: Bottom-right corner
     - `anchorX: 1` (right-aligned)
     - `anchorY: 0` (bottom-aligned)
     - `x: bg.width - 4` (4px from right edge)
     - `y: 4` (4px from bottom)
   - Style: Black stroke with 2px width (`enableStroke(cc.color.BLACK, 2)`)
   - Content: Item count number (`info.num`)

### Layout Behavior

- **Horizontal Scrolling**: Items scroll horizontally, showing multiple items in a row
- **Visible Items**: With 400px width and 100px cells, approximately 4 items visible at once
- **Touch Interaction**: 
  - Clicking a cell opens `showItemDialog(itemId, false, 'top')`
  - Cell highlights on touch (scales to 1.2x)
  - Cell unhighlights when released (scales back to 1.0x)

### Data Structure

Items are filtered and mapped:
```javascript
data = itemList.filter(function(storageCell) {
    return storageCell.num !== 0;  // Only show items with count > 0
}).map(function(storageCell) {
    return {
      itemId: storageCell.item.id,
      num: storageCell.num
    };
});
```

## Current Implementation Analysis

### File
`src/components/overlays/AttributeStatusDialog.tsx` (lines 400-452)

### Current Item List UI

```400:452:src/components/overlays/AttributeStatusDialog.tsx
            >
              <div
                className="text-black mb-2"
                style={{
                  fontSize: '18px',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold'
                }}
              >
                Usable Items:
              </div>
              <div className="space-y-2">
                {itemList.map(({ item, num }: { item: Item; num: number }) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer rounded"
                    onClick={() => handleItemUse(item.id)}
                    data-test-id={`attribute-dialog-item-${item.id}`}
                  >
                    <Sprite
                      atlas="icon"
                      frame={`icon_item_${item.id}.png`}
                      className="w-12 h-12"
                    />
                    <div className="flex-1">
                      <div
                        className="text-black"
                        style={{
                          fontSize: '18px',
                          fontFamily: 'Arial, sans-serif'
                        }}
                      >
                        Item {item.id}
                      </div>
                      <div
                        className="text-gray-600"
                        style={{
                          fontSize: '14px',
                          fontFamily: 'Arial, sans-serif'
                        }}
                      >
                        Count: {num}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
```

### Current Layout Structure

**Layout Type**: Vertical list with flexbox (`space-y-2`)

**Item Row Structure**:
- Horizontal flex container (`flex items-center`)
- Icon: 48x48 pixels (`w-12 h-12`)
- Text section: Item name and count
- Padding: 8px (`p-2`)
- Gap: 12px (`gap-3`)

**Visual Elements**:
- Icon: `icon_item_{itemId}.png` (48x48)
- Item name: "Item {itemId}" (18px font)
- Count: "Count: {num}" (14px font, gray)
- Hover effect: Gray background (`hover:bg-gray-100`)
- Rounded corners (`rounded`)

## Comparison: Original vs Current

### Layout Type

| Aspect | Original Game | Current Implementation | Match? |
|--------|--------------|----------------------|--------|
| Layout | Horizontal scrollable grid | Vertical list | ❌ NO |
| Cell Size | 100x100 pixels | Variable (flex) | ❌ NO |
| Visible Items | ~4 items horizontally | All items vertically | ❌ NO |
| Scrolling | Horizontal scroll | Vertical scroll (if needed) | ❌ NO |

### Cell/Item Structure

| Element | Original Game | Current Implementation | Match? |
|---------|--------------|----------------------|--------|
| Background | `item_bg.png` (100x100) | None | ❌ NO |
| Icon Size | Full cell (centered) | 48x48 pixels | ❌ NO |
| Icon Position | Centered in cell | Left side of row | ❌ NO |
| Count Position | Bottom-right corner | Below item name | ❌ NO |
| Count Style | Black stroke, 2px | Gray text, 14px | ❌ NO |
| Item Name | Not shown | "Item {itemId}" | ⚠️ Different |

### Interaction

| Aspect | Original Game | Current Implementation | Match? |
|--------|--------------|----------------------|--------|
| Click Action | Opens item dialog | Uses item directly | ⚠️ Different |
| Highlight | Scales to 1.2x | Gray background hover | ❌ NO |
| Touch Feedback | Scale animation | CSS hover | ❌ NO |

### Position in Dialog

| Aspect | Original Game | Current Implementation | Match? |
|--------|--------------|----------------------|--------|
| X Position | 20px (leftEdge) | 20px (leftEdge) | ✓ YES |
| Y Position | 2px from top | Below description | ⚠️ Similar |
| Container | Direct child of contentNode | Inside padding div | ⚠️ Similar |

## Issues Found

### Critical Issues

1. **❌ Layout Type Mismatch**
   - **Original**: Horizontal scrollable grid (TableView)
   - **Current**: Vertical list (flex column)
   - **Impact**: Completely different visual presentation

2. **❌ Cell Structure Mismatch**
   - **Original**: 100x100 cell with background sprite
   - **Current**: Variable-height row with no background
   - **Impact**: Items don't look like the original game

3. **❌ Icon Size and Position**
   - **Original**: Icon fills cell, centered
   - **Current**: Small 48x48 icon on left
   - **Impact**: Visual appearance is very different

4. **❌ Count Display**
   - **Original**: Bottom-right corner with black stroke
   - **Current**: Below item name as gray text
   - **Impact**: Count display doesn't match original

5. **❌ Missing Background**
   - **Original**: Each item has `item_bg.png` background
   - **Current**: No background, just hover effect
   - **Impact**: Items don't have the same visual style

### Functional Differences

6. **⚠️ Click Behavior**
   - **Original**: Opens item dialog (`showItemDialog`)
   - **Current**: Uses item directly (`handleItemUse`)
   - **Impact**: Different user flow (but may be intentional)

7. **❌ No Title Label**
   - **Original**: No "Usable Items:" title
   - **Current**: Has "Usable Items:" title
   - **Impact**: Extra UI element not in original

## Recommendations

### Required Changes

1. **Implement Horizontal Scrollable Grid**
   - Create a horizontal scrollable container
   - Display items in a grid (100x100 cells)
   - Show ~4 items per row, scroll horizontally

2. **Add Item Background**
   - Use `item_bg.png` sprite for each item cell
   - Size: 100x100 pixels

3. **Fix Icon Display**
   - Icon should fill/center in the 100x100 cell
   - Remove item name text (not in original)

4. **Fix Count Display**
   - Position: Bottom-right corner of cell
   - Style: Black stroke, 2px width
   - Font: `COMMON_2` size

5. **Remove "Usable Items:" Title**
   - Original game doesn't have this title

6. **Fix Click Behavior** (if needed)
   - Consider opening item dialog first, then using item
   - Or keep direct use if that's the intended behavior

### Implementation Approach

**Option 1: Create ItemGrid Component**
- Create a reusable `ItemGrid` component
- Horizontal scrollable container
- 100x100 item cells with background
- Icon centered, count bottom-right

**Option 2: Use CSS Grid/Flexbox**
- Use CSS grid with horizontal scrolling
- Each item: 100x100 cell
- Background sprite, icon, count label

**Option 3: Match StoragePanel ItemCell**
- Reuse the item cell component from StoragePanel
- Adapt for horizontal scrolling
- Ensure 100x100 size

## Testing Checklist

- [ ] Items display in horizontal scrollable grid
- [ ] Each item is 100x100 pixels
- [ ] Items have `item_bg.png` background
- [ ] Icons are centered in cells
- [ ] Count displays in bottom-right corner
- [ ] Count has black stroke (2px)
- [ ] ~4 items visible at once
- [ ] Horizontal scrolling works
- [ ] Click behavior matches original (or intended behavior)
- [ ] No "Usable Items:" title
- [ ] Position matches original (x: 20, y: 2)

## Priority

**High Priority**: The item UI/layout is completely different from the original game. This affects the visual consistency and user experience. Should be fixed to match the original game's horizontal scrollable grid layout.

