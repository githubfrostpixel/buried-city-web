# Plan: Remove Top Border Only at Selected Slot Connection

## Mode: PLAN

## 1. UNDERSTANDING THE REQUIREMENTS

### Current State
- Dropdown is **centered horizontally** (`left: '50%'`, `transform: 'translateX(-50%)'`)
- Dropdown has a **6px solid border** on all sides (`border: '6px solid #666666'`)
- Dropdown appears below the panel at `top: ${PANEL_HEIGHT - 25}px`
- Each slot has a calculated X position: `slotX = PADDING * (index + 1) + SLOT_SIZE * (index + 0.5)`
- Slots are positioned at: `left: ${slotX - SLOT_SIZE / 2}px` (relative to panel)

### Desired State
- Dropdown **stays centered horizontally** (no change to positioning)
- The **top border should have a gap/cutout** where it aligns with the selected slot
- The rest of the top border should remain (left and right segments)
- Create a **"solid part"** - seamless background connection where the border is removed

### Visual Concept
```
[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
      |
      |  ┌─────────────────┐
      └──│  Dropdown        │  (top border has gap at slot 2)
         │  (no border)     │
         └─────────────────┘
```

The top border should look like:
```
┌─────┐     ┌─────────────┐
│     │     │             │  (border segments)
└─────┘     └─────────────┘
  gap (no border where slot connects)
```

## 2. SOLUTION FORMULATION

### Step-by-Step Changes

#### Step 1: Calculate Selected Slot Position Relative to Dropdown
**Dropdown positioning:**
- Dropdown is centered: `left: '50%'`, `transform: 'translateX(-50%)'`
- Dropdown width: `565px`
- Panel width: `572px`
- Dropdown left edge: `(572 - 565) / 2 = 3.5px` from panel left

**Slot positioning:**
- Slot X position (center): `slotX = PADDING * (selectedSlot + 1) + SLOT_SIZE * (selectedSlot + 0.5)`
- Slot left edge: `slotX - SLOT_SIZE / 2`
- Slot right edge: `slotX + SLOT_SIZE / 2`

**Relative to dropdown:**
- Selected slot left edge relative to dropdown: `(slotX - SLOT_SIZE / 2) - 3.5px`
- Selected slot right edge relative to dropdown: `(slotX + SLOT_SIZE / 2) - 3.5px`
- Gap width: `SLOT_SIZE = 100px`

#### Step 2: Create Top Border with Gap
**Current border:**
- Single `border: '6px solid #666666'` applies to all sides uniformly

**New border approach:**
- Remove the uniform top border
- Create top border in **three segments**:
  1. **Left segment**: From dropdown left edge to selected slot left edge
  2. **Gap**: No border where slot connects (selected slot width)
  3. **Right segment**: From selected slot right edge to dropdown right edge

**Implementation options:**

**Option A: Multiple div elements**
- Create three separate div elements for the top border segments
- Position them absolutely at the top of the dropdown
- Left segment: `left: 0`, `width: gapStart`, `height: 6px`
- Gap: No element (background shows through)
- Right segment: `left: gapEnd`, `width: dropdownWidth - gapEnd`, `height: 6px`

**Option B: CSS border with clip-path or mask**
- More complex, less compatible

**Option C: Single border with overlay**
- Draw full top border, then overlay a div to cover the gap section
- Simpler but requires z-index management

**Recommendation: Option A** - Most straightforward and maintainable

#### Step 3: Create Solid Connecting Part
**Concept:**
- The "solid part" is the seamless background connection
- Since we're removing the border at the gap, the background (`#222222`) will naturally show through
- We might want to extend this upward slightly to create a visual connection

**Implementation:**
- The gap in the border already creates the visual connection
- The background color extends through the gap
- Optionally, we could add a small connecting rectangle that extends upward from the dropdown top to the slot bottom, but this might not be necessary if the gap is sufficient

### Implementation Details

**File to modify:** `src/components/common/EquipPanel.tsx`

**Changes required:**

1. **Update dropdown border (lines 300-309):**
   - Remove top border from the main background div
   - Keep left, right, and bottom borders

2. **Add top border segments:**
   - Calculate selected slot position relative to dropdown
   - Create left border segment div
   - Create right border segment div
   - Gap section has no border (background shows through)

### Code Changes Preview

**Before (Background):**
```typescript
<div
  className="absolute inset-0"
  style={{
    width: '100%',
    height: '100%',
    backgroundColor: '#222222',
    border: '6px solid #666666'
  }}
/>
```

**After (Background + Top Border Segments):**
```typescript
{/* Background with no top border */}
<div
  className="absolute inset-0"
  style={{
    width: '100%',
    height: '100%',
    backgroundColor: '#222222',
    borderLeft: '6px solid #666666',
    borderRight: '6px solid #666666',
    borderBottom: '6px solid #666666',
    borderTop: 'none'
  }}
/>

{/* Top border segments with gap for selected slot */}
{(() => {
  const dropdownLeft = (PANEL_WIDTH - 565) / 2; // 3.5px
  const selectedSlotX = PADDING * (selectedSlot + 1) + SLOT_SIZE * (selectedSlot + 0.5);
  const slotLeftEdge = selectedSlotX - SLOT_SIZE / 2;
  const slotRightEdge = selectedSlotX + SLOT_SIZE / 2;
  
  // Positions relative to dropdown (dropdown starts at dropdownLeft)
  const gapStart = slotLeftEdge - dropdownLeft;
  const gapEnd = slotRightEdge - dropdownLeft;
  
  return (
    <>
      {/* Left border segment */}
      {gapStart > 0 && (
        <div
          className="absolute"
          style={{
            left: '0',
            top: '0',
            width: `${gapStart}px`,
            height: '6px',
            backgroundColor: '#666666'
          }}
        />
      )}
      
      {/* Right border segment */}
      {gapEnd < 565 && (
        <div
          className="absolute"
          style={{
            left: `${gapEnd}px`,
            top: '0',
            width: `${565 - gapEnd}px`,
            height: '6px',
            backgroundColor: '#666666'
          }}
        />
      )}
    </>
  );
})()}
```

**Note:** The gap section (between gapStart and gapEnd) has no border, so the background color shows through, creating the seamless connection.

## 3. SOLUTION VALIDATION

### Alignment with Requirements
- ✅ Dropdown stays centered horizontally
- ✅ Top border has gap only at selected slot position
- ✅ Rest of top border remains (left and right segments)
- ✅ Solid background connection through the gap

### Edge Cases Considered
1. **Slot 0 (first slot):** Gap might be at the very left edge - left segment might be 0 or very small
2. **Slot 4 (last slot):** Gap might be at the very right edge - right segment might be 0 or very small
3. **Gap extends beyond dropdown:** If slot position is outside dropdown bounds, handle gracefully
4. **Negative gap positions:** If slot is outside dropdown, segments should cover full width

**Edge case handling:**
- Check if `gapStart > 0` before rendering left segment
- Check if `gapEnd < 565` before rendering right segment
- If gap is outside dropdown bounds, render full border

### Trade-offs
- **Multiple divs:** Slightly more DOM elements but clearer and more maintainable
- **Visual connection:** Gap in border creates natural visual connection
- **Performance:** Minimal impact, only 2-3 additional divs

### Testing Considerations
- Verify top border has gap at selected slot for all 5 slots (0-4)
- Verify left and right border segments render correctly
- Verify gap aligns with selected slot position
- Verify background shows through gap (seamless connection)
- Test edge cases (slot 0 and slot 4)
- Verify visual appearance matches requirements

## 4. RESTATEMENT

**User Request:** Keep the dropdown centered horizontally, but remove the top border only where it connects to the selected slot. The rest of the top border should remain (left and right segments), creating a gap where the slot connects.

**Solution:**
1. Remove the uniform top border from the dropdown background
2. Calculate the selected slot's position relative to the dropdown
3. Create top border in three parts:
   - Left segment: from dropdown left to slot left edge
   - Gap: no border where slot connects (background shows through)
   - Right segment: from slot right edge to dropdown right
4. This creates a seamless visual connection where the background extends through the gap

This maintains the centered dropdown while creating a visual connection point only at the selected slot.

---

**Ready for ACT mode?** Please review this plan and type "ACT" if you'd like me to proceed with the implementation.
