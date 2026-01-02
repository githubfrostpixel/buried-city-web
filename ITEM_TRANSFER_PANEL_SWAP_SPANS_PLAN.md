# ItemTransferPanel Swap Spans Plan

## Problem
The storage name spans are swapped in the ItemTransferPanel:
- **Top section** (visually at top, shows Storage items): Currently shows `topStorageName` (Bag) - should show `bottomStorageName` (Storage)
- **Bottom section** (visually at bottom, shows Bag items): Currently shows `bottomStorageName` (Storage) - should show `topStorageName` (Bag)

## Current State

### Top Section (lines 240-320):
- Position: Top of panel (`top: ${PANEL_HEIGHT}px`)
- Displays: `bottomItems` (Storage items) - line 318
- Label: `topStorageName` (Bag) - line 286 ❌ WRONG
- Weight: Shows if `topStorageName === 'Bag'` - line 288 ❌ WRONG

### Bottom Section (lines 322-396):
- Position: Bottom of panel (`bottom: 100px`)
- Displays: `topItems` (Bag items)
- Label: `bottomStorageName` (Storage) - line 370 ❌ WRONG

## Solution

Swap the storage name spans:
1. **Top section**: Change `topStorageName` to `bottomStorageName`
2. **Top section weight**: Change condition from `topStorageName === 'Bag'` to `bottomStorageName === 'Bag'` (but wait, bottomStorageName is 'Storage', so weight should check if it's Bag... Actually, since top section shows Storage items, it shouldn't show weight. But the user wants to swap the spans, so let me check the weight logic)

Actually, looking at the weight logic:
- Weight should only show for Bag
- Top section shows Storage items, so it shouldn't show weight
- Bottom section shows Bag items, so it should show weight

But the current code shows weight in top section when `topStorageName === 'Bag'`. Since we're swapping the labels:
- Top section will show `bottomStorageName` (Storage) - no weight needed
- Bottom section will show `topStorageName` (Bag) - should show weight

Wait, let me re-check the weight calculation:
- `topWeight` is calculated when `topStorageName === 'Bag'` (line 106)
- `topMaxWeight` is calculated when `topStorageName === 'Bag'` (line 107)

If we swap the labels:
- Top section shows `bottomStorageName` (Storage) - no weight
- Bottom section shows `topStorageName` (Bag) - should show weight, but weight is calculated for `topStorageName`

So we need to:
1. Swap the labels
2. Move weight display to bottom section
3. Update weight calculation/display logic

## Implementation Steps

### Step 1: Swap Labels in Top Section
- Change `{topStorageName}` to `{bottomStorageName}` (line 286)
- Remove weight display from top section (lines 288-299) since it shows Storage

### Step 2: Swap Labels in Bottom Section  
- Change `{bottomStorageName}` to `{topStorageName}` (line 370)
- Add weight display to bottom section when `topStorageName === 'Bag'`

### Step 3: Update Weight Display Logic
- Top section: Remove weight (shows Storage, no weight limit)
- Bottom section: Add weight display (shows Bag, has weight limit)

## Files to Modify
- `src/components/common/ItemTransferPanel.tsx`

## Expected Result
- Top section: Shows "Storage" label, displays Storage items, no weight
- Bottom section: Shows "Bag" label, displays Bag items, shows weight (current/max)

