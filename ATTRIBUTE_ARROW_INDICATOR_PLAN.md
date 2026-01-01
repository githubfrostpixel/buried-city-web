# Attribute Arrow Indicator Plan

## Overview
This plan outlines the implementation of arrow indicators that appear when attributes increase or decrease, matching the original game behavior.

## Original Game Implementation Analysis

### Location
- **File**: `OriginalGame/src/ui/button.js`
- **Class**: `AttrButton` (lines 298-403)

### Key Features

1. **State Tracking**:
   - Stores `oldPercentage` to track previous attribute percentage value
   - Initialized as `null` in constructor

2. **Change Detection** (in `updateView` method, lines 357-381):
   ```javascript
   if (this.oldPercentage !== null) {
       var dtPercentage = percentage - this.oldPercentage;
       if (dtPercentage != 0) {
           this.warnChange(dtPercentage > 0);
       }
   }
   this.oldPercentage = percentage;
   ```

3. **Arrow Display** (`warnChange` method, lines 382-401):
   - **Up Arrow**: When `dtPercentage > 0` (increase)
     - Sprite: `#icon_status_up.png`
     - Position: `x = icon.width + 3`, `y = icon.height / 4 * 3` (75% from top)
   - **Down Arrow**: When `dtPercentage < 0` (decrease)
     - Sprite: `icon_status_down.png`
     - Position: `x = icon.width + 3`, `y = icon.height / 4` (25% from top)
   - **Anchor Point**: `(0, 0.5)` (left-center)
   - **Animation**: Fades out over 1 second, then removed
   - **Removal**: Removes existing arrow before showing new one

### Coordinate System Notes
- Arrows are positioned relative to the icon sprite
- Horizontal: `icon.width + 3` (3px to the right of icon)
- Vertical: 
  - Up arrow: `icon.height / 4 * 3` (75% down from top)
  - Down arrow: `icon.height / 4` (25% down from top)
- Anchor point `(0, 0.5)` means left-center alignment

## Current Implementation Status

### AttrButton Component
- **File**: `src/components/common/AttrButton.tsx`
- **Status**: Missing arrow indicator functionality
- **Current Features**:
  - Displays attribute icon with progress bar
  - Shows warning state when in warning range
  - Handles reverse percentage attributes
  - No change tracking or arrow display

### Available Assets
- Arrow sprites exist:
  - `icon_status_up.png` (in `icon` atlas)
  - `icon_status_down.png` (in `icon` atlas)
- Confirmed in: `public/assets/sprites/icon/` and `src/assets/sprites/icon/`

## Implementation Plan

### Step 1: Add State Management for Previous Percentage

**Location**: `src/components/common/AttrButton.tsx`

**Changes**:
1. Use `useRef` to store `oldPercentage` (persists across renders but doesn't trigger re-renders)
2. Initialize as `null`
3. Update in `useEffect` that watches attribute value changes

**Code Structure**:
```typescript
const oldPercentageRef = useRef<number | null>(null)
```

### Step 2: Calculate Percentage Change

**Location**: `src/components/common/AttrButton.tsx`

**Changes**:
1. Calculate current `percentageValue` (already done)
2. Compare with `oldPercentageRef.current`
3. If change detected and `oldPercentageRef.current !== null`, trigger arrow display
4. Update `oldPercentageRef.current` after comparison

**Logic**:
```typescript
useEffect(() => {
  const currentPercentage = percentageValue
  const oldPercentage = oldPercentageRef.current
  
  if (oldPercentage !== null) {
    const dtPercentage = currentPercentage - oldPercentage
    if (dtPercentage !== 0) {
      // Trigger arrow display
      setShowArrow(true)
      setArrowDirection(dtPercentage > 0 ? 'up' : 'down')
    }
  }
  
  oldPercentageRef.current = currentPercentage
}, [percentageValue])
```

### Step 3: Add Arrow Display Component

**Location**: `src/components/common/AttrButton.tsx`

**Changes**:
1. Add state for arrow visibility and direction
2. Create arrow sprite component positioned relative to icon
3. Apply fade-out animation (1 second duration)
4. Remove arrow after animation completes

**Positioning**:
- Need to get icon dimensions (may need to measure or use fixed values)
- Horizontal: `iconWidth + 3px` from left edge of icon container
- Vertical:
  - Up arrow: `iconHeight * 0.75` from top
  - Down arrow: `iconHeight * 0.25` from top
- Anchor: Left-center alignment

**CSS Animation**:
```css
@keyframes attributeArrowFade {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

### Step 4: Handle Icon Scaling

**Consideration**:
- HP attribute uses no scale (`transform: none`)
- Other attributes use `scale(0.5)`
- Arrow positioning needs to account for scale
- Arrow should be positioned in the scaled coordinate space

**Solution**:
- Position arrow relative to the icon container (which has the scale transform)
- Arrow will automatically scale with the icon
- Use actual icon dimensions (not scaled) for positioning calculations

### Step 5: Coordinate System Conversion

**Reference**: `COCOS_TO_CSS_POSITION_MAPPING.md`

**Original Cocos Positioning**:
- Arrow positioned at `icon.width + 3, icon.height / 4 * 3` (up) or `icon.height / 4` (down)
- Anchor point: `(0, 0.5)` (left-center)

**CSS Equivalent**:
- Use `absolute` positioning relative to icon container
- `left: ${iconWidth + 3}px`
- `top: ${isUp ? iconHeight * 0.75 : iconHeight * 0.25}px`
- `transform: translateY(-50%)` for vertical centering (matches anchor 0.5)

### Step 6: Icon Dimension Detection

**Challenge**: Need actual icon dimensions for positioning

**Options**:
1. **Hardcode**: Use known icon dimensions (may vary by attribute)
2. **Measure**: Use `useRef` and `useEffect` to measure icon after render
3. **Estimate**: Use approximate dimensions based on sprite size

**Recommendation**: Use measurement approach for accuracy:
```typescript
const iconRef = useRef<HTMLDivElement>(null)
const [iconSize, setIconSize] = useState({ width: 0, height: 0 })

useEffect(() => {
  if (iconRef.current) {
    const rect = iconRef.current.getBoundingClientRect()
    setIconSize({ width: rect.width, height: rect.height })
  }
}, [attr]) // Re-measure when attribute changes
```

### Step 7: Animation and Cleanup

**Implementation**:
1. Show arrow when change detected
2. Apply fade-out animation (1 second)
3. Remove arrow from DOM after animation completes
4. Use `setTimeout` or animation end event listener

**Code Structure**:
```typescript
const [arrowState, setArrowState] = useState<{
  visible: boolean
  direction: 'up' | 'down'
} | null>(null)

// Trigger arrow
setArrowState({ visible: true, direction: dtPercentage > 0 ? 'up' : 'down' })

// Cleanup after animation
useEffect(() => {
  if (arrowState?.visible) {
    const timer = setTimeout(() => {
      setArrowState(null)
    }, 1000) // 1 second fade
    return () => clearTimeout(timer)
  }
}, [arrowState])
```

## Implementation Details

### Component Structure

```typescript
export function AttrButton({ ... }) {
  const playerStore = usePlayerStore()
  const oldPercentageRef = useRef<number | null>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const [iconSize, setIconSize] = useState({ width: 0, height: 0 })
  const [arrowState, setArrowState] = useState<{
    visible: boolean
    direction: 'up' | 'down'
  } | null>(null)
  
  // Calculate percentage (existing code)
  const percentageValue = ...
  
  // Measure icon size
  useEffect(() => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect()
      setIconSize({ width: rect.width, height: rect.height })
    }
  }, [attr])
  
  // Detect changes and show arrow
  useEffect(() => {
    const oldPercentage = oldPercentageRef.current
    if (oldPercentage !== null) {
      const dtPercentage = percentageValue - oldPercentage
      if (Math.abs(dtPercentage) > 0.001) { // Small threshold to avoid floating point issues
        setArrowState({
          visible: true,
          direction: dtPercentage > 0 ? 'up' : 'down'
        })
      }
    }
    oldPercentageRef.current = percentageValue
  }, [percentageValue])
  
  // Cleanup arrow after animation
  useEffect(() => {
    if (arrowState?.visible) {
      const timer = setTimeout(() => {
        setArrowState(null)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [arrowState])
  
  return (
    <button ...>
      <div ref={iconRef} className="relative" style={{ ... }}>
        {/* Existing icon sprites */}
        
        {/* Arrow indicator */}
        {arrowState?.visible && iconSize.width > 0 && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${iconSize.width + 3}px`,
              top: `${arrowState.direction === 'up' ? iconSize.height * 0.75 : iconSize.height * 0.25}px`,
              transform: 'translateY(-50%)',
              animation: 'attributeArrowFade 1s ease-out forwards',
              zIndex: 10
            }}
          >
            <Sprite
              atlas="icon"
              frame={`icon_status_${arrowState.direction}.png`}
              className="block"
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
        )}
      </div>
    </button>
  )
}
```

### CSS Animation

Add to global CSS or component styles:
```css
@keyframes attributeArrowFade {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
```

## Testing Checklist

1. **Increase Test**: 
   - Trigger attribute increase (e.g., use item that increases HP)
   - Verify up arrow appears
   - Verify arrow fades out after 1 second
   - Verify arrow positioned correctly

2. **Decrease Test**:
   - Trigger attribute decrease (e.g., take damage)
   - Verify down arrow appears
   - Verify arrow fades out after 1 second
   - Verify arrow positioned correctly

3. **Multiple Changes Test**:
   - Trigger rapid attribute changes
   - Verify arrow updates correctly (old arrow removed, new one shown)

4. **All Attributes Test**:
   - Test with all attribute types (HP, injury, infect, starve, vigour, spirit, water, virus)
   - Verify arrows work with both normal and reversePercentage attributes

5. **Scaling Test**:
   - Verify arrows position correctly for HP (no scale) and other attributes (0.5 scale)

6. **Edge Cases**:
   - Test with attribute at 0%
   - Test with attribute at 100%
   - Test with very small changes (< 0.1%)
   - Test with attribute changes that don't affect percentage (e.g., max increases)

## Cross-Check with Original Game

### Visual Verification
1. Compare arrow position with original game
2. Compare arrow size and appearance
3. Compare fade-out animation timing
4. Verify arrow appears for all attribute changes

### Functional Verification
1. Arrow appears on increase (up)
2. Arrow appears on decrease (down)
3. Arrow fades out in 1 second
4. Arrow is removed after animation
5. Multiple rapid changes handled correctly

## Notes

1. **Percentage Calculation**: The arrow is based on the DISPLAY percentage (already reversed if `reversePercentage` is true), matching the original game logic.

2. **Change Threshold**: Consider adding a small threshold (e.g., 0.001) to avoid showing arrows for floating-point rounding errors.

3. **Performance**: Using `useRef` for `oldPercentage` avoids unnecessary re-renders. Arrow state changes will trigger re-renders only when arrows are shown/hidden.

4. **Icon Dimensions**: The measurement approach ensures accurate positioning regardless of actual sprite sizes or scaling.

5. **Animation**: CSS animation is preferred over JavaScript animation for better performance.

6. **Z-Index**: Arrow should have higher z-index than icon layers (currently: background=0, filled=1, warning=2, so arrow=10 is safe).

## Files to Modify

1. `src/components/common/AttrButton.tsx` - Add arrow indicator functionality
2. Global CSS file (or component styles) - Add `attributeArrowFade` animation

## Dependencies

- Existing `Sprite` component (already used)
- `icon_status_up.png` and `icon_status_down.png` sprites (already exist)
- React hooks: `useRef`, `useState`, `useEffect`

