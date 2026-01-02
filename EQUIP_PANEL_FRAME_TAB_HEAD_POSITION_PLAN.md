# Plan: Move frame_tab_head Down and Behind Icon in EquipPanel

## Mode: PLAN

## 1. UNDERSTANDING THE REQUIREMENTS

### Current State
- The `frame_tab_head.png` indicator is currently positioned **above** the equipment slot
- It's positioned at: `top: ${PANEL_HEIGHT / 2 - SLOT_SIZE / 2 - 20}px` with `transform: 'translateY(-100%)'`
- This places it 20px above the top of the slot
- The z-index is not explicitly set, so it defaults to the stacking context

### Desired State
- Move `frame_tab_head.png` **down** to be positioned at the **bottom** of the equipment slot
- Position it **behind** the icon (lower z-index) so the icon appears on top

### Original Game Reference
From `OriginalGame/src/ui/equipNode.js`:
- Line 36: `this.selectedCap.setAnchorPoint(0.5, 1)` - anchor point at bottom center
- Line 37: `this.selectedCap.setPositionY(this.getContentSize().height / 2 + tabBgFrame.getRect().height / 2)` - positioned at center + half slot height (bottom of slot)
- Line 38: `this.addChild(this.selectedCap, 9)` - z-index 9
- Line 24: Icon is added with z-index 10, so frame_tab_head (9) is behind the icon (10)

## 2. SOLUTION FORMULATION

### Step-by-Step Changes

#### Step 1: Reposition frame_tab_head to Bottom of Slot
**Current positioning:**
```typescript
top: `${PANEL_HEIGHT / 2 - SLOT_SIZE / 2 - 20}px`, // Above slot
transform: 'translateY(-100%)' // Anchor at bottom
```

**New positioning:**
- Position should be at: `PANEL_HEIGHT / 2 + SLOT_SIZE / 2` (center + half slot height = bottom of slot)
- Remove the `transform: 'translateY(-100%)'` since we want it anchored at the bottom
- The element should be positioned so its bottom edge aligns with the bottom of the slot

**Calculation:**
- Slot center Y: `PANEL_HEIGHT / 2`
- Slot bottom: `PANEL_HEIGHT / 2 + SLOT_SIZE / 2`
- Since the element has `height: '20px'`, we need to position it so its bottom aligns with the slot bottom
- New top position: `PANEL_HEIGHT / 2 + SLOT_SIZE / 2 - 20px` (slot bottom minus element height)

#### Step 2: Set Z-Index to Place Behind Icon
**Current state:**
- No explicit z-index set
- Icon is rendered inside the button element, which comes after frame_tab_head in DOM order

**New z-index:**
- Set `zIndex: 1` or lower for frame_tab_head
- Ensure icon remains on top (icon is in a div with no z-index, so it will naturally be above if frame_tab_head has lower z-index)
- Alternatively, we can set the icon container to have a higher z-index explicitly

**Z-index strategy:**
- frame_tab_head: `zIndex: 1` (behind)
- Icon container: `zIndex: 2` (in front) - or leave it unset if natural stacking works

#### Step 3: Verify Visual Alignment
- The frame_tab_head should appear at the bottom edge of the slot
- The icon should render on top of it
- The frame should be centered horizontally on the slot (already correct with `left: ${slotX - SLOT_SIZE / 2}px`)

### Implementation Details

**File to modify:** `src/components/common/EquipPanel.tsx`

**Lines to change:** Lines 269-287 (the selected indicator section)

**Specific changes:**

1. **Update top position:**
   - Change from: `top: ${PANEL_HEIGHT / 2 - SLOT_SIZE / 2 - 20}px`
   - Change to: `top: ${PANEL_HEIGHT / 2 + SLOT_SIZE / 2 - 20}px`

2. **Remove transform:**
   - Remove: `transform: 'translateY(-100%)'`
   - The element will now be positioned from its top edge

3. **Add z-index:**
   - Add: `zIndex: 1` to the frame_tab_head container div

4. **Optional: Ensure icon is on top:**
   - Add `zIndex: 2` to the icon container divs (lines 233-248 and 250-265) to ensure they render above frame_tab_head

### Code Changes Preview

**Before:**
```typescript
{selectedSlot === index && (
  <div
    className="absolute pointer-events-none"
    style={{
      left: `${slotX - SLOT_SIZE / 2}px`,
      top: `${PANEL_HEIGHT / 2 - SLOT_SIZE / 2 - 20}px`, // Above slot
      width: `${SLOT_SIZE}px`,
      height: '20px',
      transform: 'translateY(-100%)' // Anchor at bottom
    }}
  >
    <Sprite
      atlas="gate"
      frame="frame_tab_head.png"
      className="w-full h-full"
    />
  </div>
)}
```

**After:**
```typescript
{selectedSlot === index && (
  <div
    className="absolute pointer-events-none"
    style={{
      left: `${slotX - SLOT_SIZE / 2}px`,
      top: `${PANEL_HEIGHT / 2 + SLOT_SIZE / 2 - 20}px`, // Bottom of slot
      width: `${SLOT_SIZE}px`,
      height: '20px',
      zIndex: 1 // Behind icon
    }}
  >
    <Sprite
      atlas="gate"
      frame="frame_tab_head.png"
      className="w-full h-full"
    />
  </div>
)}
```

**Icon containers (optional z-index addition):**
- Add `zIndex: 2` to the icon container divs at lines 233 and 250 to ensure they render above frame_tab_head

## 3. SOLUTION VALIDATION

### Alignment with Original Game
- ✅ Matches original positioning: bottom of slot (center + half height)
- ✅ Matches original z-index: behind icon (9 vs 10 in original, 1 vs 2 in our implementation)
- ✅ Matches original anchor point concept: bottom-aligned

### Edge Cases Considered
1. **Multiple slots:** Each slot has its own frame_tab_head, so positioning is independent - ✅ Safe
2. **Icon visibility:** Icon will render on top due to z-index - ✅ Safe
3. **Dropdown overlap:** Dropdown is positioned below the panel, so frame_tab_head won't interfere - ✅ Safe
4. **Empty vs equipped slots:** Frame position is independent of slot content - ✅ Safe

### Trade-offs
- **Z-index approach:** Using explicit z-index values (1 for frame, 2 for icon) is more reliable than relying on DOM order
- **Positioning:** Using top-based positioning with calculated bottom edge is clearer than transform-based positioning

### Testing Considerations
- Verify frame_tab_head appears at bottom of slot when slot is selected
- Verify icon renders on top of frame_tab_head
- Verify frame is centered horizontally
- Verify behavior is consistent across all 5 equipment slots

## 4. RESTATEMENT

**User Request:** Move the `frame_tab_head.png` indicator down from its current position (above the slot) to the bottom of the slot, and ensure it renders behind the icon so the icon appears on top.

**Solution:** 
1. Reposition the frame_tab_head element from `top: center - slot_height/2 - 20px` to `top: center + slot_height/2 - 20px` (bottom of slot)
2. Remove the `transform: translateY(-100%)` since we're positioning from top edge
3. Add `zIndex: 1` to frame_tab_head and optionally `zIndex: 2` to icon containers to ensure proper layering

This matches the original game's implementation where frame_tab_head is positioned at the bottom of the slot with a lower z-index than the icon.

---

**Ready for ACT mode?** Please review this plan and type "ACT" if you'd like me to proceed with the implementation.

