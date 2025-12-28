# Phase 2D.4: HomePanel Implementation Plan

## Overview

This document provides a detailed step-by-step implementation plan for the HomePanel component, which displays the home background with all building buttons positioned exactly as in the original game.

## Prerequisites Status

✅ **All dependencies are available:**
- `BuildingButton.tsx` - Already exists and ready to use
- `position.ts` utilities - Already exist with `cocosToCssY()` function
- `buildingStore.ts` - Phase 2C complete, has `getBuilding()`, `initialize()` methods
- `uiStore.ts` - Has `openPanelAction()` for navigation
- `Sprite.tsx` - Ready to use for background and gate light
- All building sprites available in `src/assets/sprites/home/`

## Original Game Analysis

### From `OriginalGame/src/ui/home.js`:

1. **Background:**
   - Sprite: `res/new/home_bg.png`
   - Position: `(bgRect.width / 2, 0)` - centered horizontally, bottom-aligned
   - Anchor: `(0.5, 0)` - center horizontally, bottom edge

2. **Building Positions (Cocos coordinates, relative to home_bg):**
   ```javascript
   {bid: 1, pos: {x: 65, y: 230}}
   {bid: 2, pos: {x: 425, y: 780}}
   {bid: 18, pos: {x: 205, y: 165}}
   {bid: 4, pos: {x: 477, y: 562}}
   {bid: 5, pos: {x: 310, y: 330}}
   {bid: 6, pos: {x: 75, y: 390}}
   {bid: 15, pos: {x: 408, y: 677}}
   {bid: 7, pos: {x: 250, y: 630}}
   {bid: 8, pos: {x: 84, y: 780}}
   {bid: 9, pos: {x: 75, y: 590}}
   {bid: 10, pos: {x: 480, y: 410}}
   {bid: 11, pos: {x: 436, y: 85}}
   {bid: 13, pos: {x: 124, y: 49}}
   {bid: 14, pos: {x: 425, y: 216}}
   {bid: 16, pos: {x: 203, y: 290}}
   {bid: 19, pos: {x: 436, y: 85}}
   {bid: 17, pos: {x: 416, y: 108}}
   {bid: 3, pos: {x: 545, y: 268}}
   {bid: 12, pos: {x: 335, y: 125}}
   {bid: 20, pos: {x: 196, y: 780}}
   {bid: 21, pos: {x: 525, y: 674}}
   ```

3. **Building Level Logic:**
   - Get level: `player.room.getBuildLevel(bid)`
   - Display level: `Math.max(0, buildLevel)` - never show negative levels
   - Sprite format: `icon_start_build_{bid}_{level}.png`

4. **Active/Inactive State:**
   - Most buildings: `build.level >= 0` → WHITE, else → BLACK
   - Building 17 (Bomb): `player.isBombActive` → WHITE, else → BLACK
   - Building 12 (Dog): `player.isDogActive() && build.level >= 0` → WHITE, else → BLACK

5. **Gate Light Effect (Building 14):**
   - Sprite: `gate_light.png`
   - Position: Centered on gate button (at button center)
   - Animation: `cc.repeatForever(cc.sequence(cc.fadeOut(2), cc.fadeIn(2)))`
   - Only shown when `build.level >= 0`

6. **Click Handlers:**
   - Building 13 → Navigate to Storage panel
   - Building 14 → Navigate to Gate panel (if `level >= 0`)
   - Building 15 → Navigate to Radio panel
   - All others → Navigate to Build panel

7. **Event Listeners:**
   - `placed_success` → Update button for that building
   - `dogStateChange` → Update button 12 (dog house)
   - `bombUsed` → Update button 17 (bomb/minefield)

## Implementation Steps

### Step 1: Create HomePanel Component Structure

**File:** `src/components/panels/HomePanel.tsx`

**Initial Structure:**
```typescript
import { useEffect } from 'react'
import { useBuildingStore } from '@/store/buildingStore'
import { useUIStore } from '@/store/uiStore'
import { cocosToCssY } from '@/utils/position'
import { Sprite } from '@/components/sprites/Sprite'
import { BuildingButton } from '@/components/common/BuildingButton'
import { useEmitter } from '@/utils/emitter'

const BUILDING_POSITIONS = [
  { bid: 1, pos: { x: 65, y: 230 } },
  { bid: 2, pos: { x: 425, y: 780 } },
  // ... all 21 buildings
]

export function HomePanel() {
  // Component implementation
}
```

**Tasks:**
1. Create file `src/components/panels/HomePanel.tsx`
2. Import all required dependencies
3. Define `BUILDING_POSITIONS` constant with all 21 building positions
4. Set up basic component structure with hooks

### Step 2: Initialize Building Store

**Implementation:**
```typescript
const buildingStore = useBuildingStore()
const uiStore = useUIStore()
const screenHeight = 1136

// Ensure building store is initialized
useEffect(() => {
  if (!buildingStore.room) {
    buildingStore.initialize()
  }
}, [buildingStore])
```

**Tasks:**
1. Get building store and UI store hooks
2. Add useEffect to initialize building store if needed
3. Define screen height constant

### Step 3: Implement Background Positioning

**Background Requirements:**
- Sprite: `home_bg.png` from `new` atlas
- Position: Centered horizontally, bottom-aligned
- In BottomBar content area, positioned at bottom

**Implementation:**
```typescript
// Background is positioned at bottom of content area
// Cocos: (bgRect.width / 2, 0) with anchor (0.5, 0)
// CSS: left: 50%, bottom: 0, transform: translateX(-50%)
const bgStyle: React.CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: '0px',
  transform: 'translateX(-50%)',
  width: 'auto',
  height: 'auto'
}
```

**Tasks:**
1. Create background container div with proper positioning
2. Add Sprite component for `home_bg.png`
3. Test background appears at bottom of content area

### Step 4: Implement Building Button Rendering

**Implementation:**
```typescript
{BUILDING_POSITIONS.map(({ bid, pos }) => {
  const building = buildingStore.getBuilding(bid)
  const buildLevel = building?.level ?? -1
  const displayLevel = Math.max(0, buildLevel)
  
  // Determine active state
  let isActive = false
  if (bid === 17) {
    // Bomb/Minefield - check player.isBombActive
    // TODO: Get from playerStore when available
    isActive = false // Placeholder
  } else if (bid === 12) {
    // Dog house - check player.isDogActive() && build.level >= 0
    // TODO: Get from playerStore when available
    isActive = building ? building.level >= 0 : false // Placeholder
  } else {
    // All other buildings
    isActive = building ? building.level >= 0 : false
  }
  
  // Convert Cocos Y to CSS Y
  // Note: Positions are relative to home_bg, which is bottom-aligned
  // home_bg height needs to be known to convert properly
  // For now, assume positions are from bottom of bg
  const cssY = cocosToCssY(pos.y, homeBgHeight) // Need to get bg height
  
  return (
    <BuildingButton
      key={bid}
      bid={bid}
      level={displayLevel}
      isActive={isActive}
      position={{ x: pos.x, y: cssY }}
      onClick={() => handleBuildingClick(bid)}
    />
  )
})}
```

**Challenges:**
- Building positions are relative to `home_bg`, which is bottom-aligned
- Need to know `home_bg` height to convert Y coordinates properly
- May need to measure or hardcode background height

**Tasks:**
1. Map over BUILDING_POSITIONS array
2. Get building from store for each bid
3. Calculate display level (Math.max(0, level))
4. Determine active state based on building type
5. Convert Cocos Y to CSS Y (need bg height)
6. Render BuildingButton for each building
7. Test all buildings appear in correct positions

### Step 5: Implement Building Click Handlers

**Implementation:**
```typescript
const handleBuildingClick = (bid: number) => {
  const building = buildingStore.getBuilding(bid)
  
  switch (bid) {
    case 13:
      // Navigate to Storage panel
      uiStore.openPanelAction('storage')
      break
    case 14:
      // Navigate to Gate panel (only if level >= 0)
      if (building && building.level >= 0) {
        uiStore.openPanelAction('gate') // TODO: Add 'gate' to Panel type if needed
      }
      break
    case 15:
      // Navigate to Radio panel
      uiStore.openPanelAction('radio')
      break
    default:
      // Navigate to Build panel with building info
      uiStore.openPanelAction('build')
      // TODO: Pass building info to build panel
      break
  }
}
```

**Tasks:**
1. Create `handleBuildingClick` function
2. Implement switch statement for special buildings (13, 14, 15)
3. Use `uiStore.openPanelAction()` for navigation
4. Test click handlers navigate correctly

### Step 6: Implement Gate Light Effect

**Requirements:**
- Only for building 14 (Gate/Toilet)
- Only when `building.level >= 0`
- Positioned at center of gate button
- Fade in/out animation (2s fade out, 2s fade in, repeat)

**Implementation:**
```typescript
// Gate light component
function GateLightEffect({ position }: { position: { x: number; y: number } }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        animation: 'gateLightFade 4s infinite',
        opacity: 1
      }}
    >
      <Sprite
        atlas="home"
        frame="gate_light.png"
        className="block"
      />
    </div>
  )
}

// Add CSS animation in index.css or component styles
// @keyframes gateLightFade {
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0; }
// }
```

**Tasks:**
1. Create `GateLightEffect` component
2. Add fade animation CSS
3. Position gate light at building 14 position
4. Only render when building 14 exists and level >= 0
5. Test animation works correctly

### Step 7: Handle Special Building States

**Building 17 (Bomb/Minefield):**
- Active state based on `player.isBombActive` (boolean property)
- **NOTE:** This property may not exist in playerStore yet - may need to add it

**Building 12 (Dog House):**
- Active state based on `player.isDogActive() && build.level >= 0`
- `isDogActive()` checks: `dog.active && dog.hunger > 0 && dog.mood > 0 && dog.injury < dog.injuryMax`
- **NOTE:** This method may not exist in playerStore yet - may need to add it

**Implementation:**
```typescript
import { usePlayerStore } from '@/store/playerStore'

const playerStore = usePlayerStore()

// Helper function for dog active state
const isDogActive = () => {
  const dog = playerStore.dog
  return dog.active && dog.hunger > 0 && dog.mood > 0 && dog.injury < dog.injuryMax
}

// In building rendering:
let isActive = false
if (bid === 17) {
  // TODO: Add isBombActive to playerStore if not present
  isActive = (playerStore as any).isBombActive ?? false
} else if (bid === 12) {
  isActive = isDogActive() && (building?.level >= 0 ?? false)
} else {
  isActive = building ? building.level >= 0 : false
}
```

**Tasks:**
1. Import `usePlayerStore`
2. Get player store instance
3. Update active state logic for buildings 12 and 17
4. Test special states work correctly

### Step 8: Add Event Listeners for Updates

**Events to Listen:**
- `placed_success` → Update specific building button
- `dogStateChange` → Update building 12
- `bombUsed` → Update building 17

**Implementation:**
```typescript
import { emitter } from '@/utils/emitter'
import { useState } from 'react'

// Use state to force re-renders on events
const [updateTrigger, setUpdateTrigger] = useState(0)

useEffect(() => {
  const handlePlacedSuccess = (bid: number) => {
    // Force re-render
    setUpdateTrigger(prev => prev + 1)
  }
  
  const handleDogStateChange = () => {
    // Force re-render building 12
    setUpdateTrigger(prev => prev + 1)
  }
  
  const handleBombUsed = () => {
    // Force re-render building 17
    setUpdateTrigger(prev => prev + 1)
  }
  
  emitter.on('placed_success', handlePlacedSuccess)
  emitter.on('dogStateChange', handleDogStateChange)
  emitter.on('bombUsed', handleBombUsed)
  
  return () => {
    emitter.off('placed_success', handlePlacedSuccess)
    emitter.off('dogStateChange', handleDogStateChange)
    emitter.off('bombUsed', handleBombUsed)
  }
}, [])
```

**Note:** React will automatically re-render when building store changes, but we may need to force updates for specific events.

**Tasks:**
1. Import emitter utility
2. Add useEffect with event listeners
3. Clean up listeners on unmount
4. Test events trigger updates correctly

### Step 9: Handle Position Conversion for Relative Coordinates

**Challenge:**
Building positions are relative to `home_bg`, which is bottom-aligned. The Y coordinates in the original are measured from the bottom of the background image.

**Key Understanding:**
- In Cocos: `homeBg.setAnchorPoint(0.5, 0)` means center horizontally, bottom edge
- Building positions: `{x: 65, y: 230}` means 65px from left, 230px from **bottom** of bg
- In CSS: We need to position relative to the background container

**Solution: Use Relative Positioning with Bottom Property**

Since the background is bottom-aligned and buildings are positioned relative to it, we should:
1. Create a relative-positioned container for the background
2. Position buildings absolutely within that container
3. Use `bottom` property for Y coordinates (since they're from bottom in Cocos)

**Implementation:**
```typescript
// Background container - positioned at bottom of content area
const bgContainerStyle: React.CSSProperties = {
  position: 'relative', // Relative container for absolute children
  width: '100%',
  height: 'auto',
  // Position at bottom of parent (content area)
  marginTop: 'auto' // Push to bottom
}

// Inside BottomBar content area:
<div className="absolute inset-0 flex flex-col">
  <div style={bgContainerStyle}>
    {/* Background image */}
    <Sprite 
      atlas="new" 
      frame="home_bg.png" 
      className="w-full h-auto block" 
    />
    
    {/* Building buttons - positioned relative to bg container */}
    {BUILDING_POSITIONS.map(({ bid, pos }) => {
      const building = buildingStore.getBuilding(bid)
      const buildLevel = building?.level ?? -1
      const displayLevel = Math.max(0, buildLevel)
      
      // Determine active state
      let isActive = false
      if (bid === 17) {
        isActive = (playerStore as any).isBombActive ?? false
      } else if (bid === 12) {
        isActive = isDogActive() && (building?.level >= 0 ?? false)
      } else {
        isActive = building ? building.level >= 0 : false
      }
      
      // Position: x from left, y from bottom (Cocos coordinates)
      // Use bottom property for Y since positions are from bottom
      return (
        <BuildingButton
          key={bid}
          bid={bid}
          level={displayLevel}
          isActive={isActive}
          position={{ x: pos.x, y: pos.y }}
          onClick={() => handleBuildingClick(bid)}
          style={{
            position: 'absolute',
            left: `${pos.x}px`,
            bottom: `${pos.y}px`, // Use bottom since Cocos Y is from bottom
            transform: 'translate(-50%, 50%)' // Center horizontally, adjust for bottom anchor
          }}
        />
      )
    })}
  </div>
</div>
```

**Alternative: Modify BuildingButton to Accept Style Override**

If BuildingButton doesn't support custom positioning, we can wrap it or modify it:

```typescript
// Option: Wrap BuildingButton
<div
  style={{
    position: 'absolute',
    left: `${pos.x}px`,
    bottom: `${pos.y}px`,
    transform: 'translate(-50%, 50%)'
  }}
>
  <BuildingButton
    bid={bid}
    level={displayLevel}
    isActive={isActive}
    position={{ x: 0, y: 0 }} // Relative to wrapper
    onClick={() => handleBuildingClick(bid)}
  />
</div>
```

**Tasks:**
1. Create relative container for background
2. Position background at bottom of content area
3. Position buildings using `bottom` property for Y coordinates
4. Adjust transform for proper centering
5. Test all buildings appear in correct positions
6. Verify against original game screenshots
7. Fine-tune positions if needed

### Step 10: Add Warning Icons Support

**BuildingButton already handles warnings:**
- Uses `building.needWarn()` method
- Shows warning icon if needed
- No additional work needed in HomePanel

**Tasks:**
1. Verify BuildingButton warning logic works
2. Test warnings appear for buildings that need attention

### Step 11: Testing & Verification

**Visual Tests:**
1. Compare with original game screenshots
2. Verify all 21 buildings appear in correct positions
3. Verify building states (white/black) match original
4. Verify gate light animation works
5. Verify warning icons appear when needed

**Functional Tests:**
1. Test building click handlers navigate correctly
2. Test building store initialization
3. Test event listeners update buildings correctly
4. Test special building states (12, 17)

**Position Verification:**
- Use position reference table from PHASE_2D_IMPLEMENTATION_PLAN.md
- Verify CSS positions match calculated values

## Implementation Checklist

- [ ] Step 1: Create HomePanel component structure
- [ ] Step 2: Initialize building store
- [ ] Step 3: Implement background positioning
- [ ] Step 4: Implement building button rendering
- [ ] Step 5: Implement building click handlers
- [ ] Step 6: Implement gate light effect
- [ ] Step 7: Handle special building states (12, 17)
- [ ] Step 8: Add event listeners for updates
- [ ] Step 9: Handle position conversion for relative coordinates
- [ ] Step 10: Add warning icons support (verify BuildingButton)
- [ ] Step 11: Testing & verification

## Known Issues & Considerations

1. **Background Height:** Need to determine `home_bg.png` actual height for position conversion
2. **Player Store Methods:** May need to add `isBombActive` and `isDogActive()` to playerStore
3. **Panel Navigation:** May need to add 'gate' to Panel type in uiStore
4. **Building Info Passing:** Build panel may need building ID/info passed via props or store
5. **Event System:** Verify emitter utility exists and works correctly
6. **Position Accuracy:** Building positions must match original exactly - may need fine-tuning

## Dependencies to Verify

- [ ] `usePlayerStore()` has `isBombActive` property (may need to add)
- [ ] `usePlayerStore()` has `isDogActive()` method (may need to add - can implement locally for now)
- [ ] `emitter` utility exists and works (✅ verified - exports singleton)
- [ ] `uiStore.openPanelAction()` accepts 'gate' panel type (may need to add to Panel type)
- [ ] `home_bg.png` exists in `src/assets/sprites/new/`
- [ ] All building sprites exist: `icon_start_build_{bid}_{level}.png`
- [ ] `gate_light.png` exists in `src/assets/sprites/home/` or `new/`

## Estimated Time

- Step 1-3: 1-2 hours (Basic structure and background)
- Step 4: 2-3 hours (Building rendering with position conversion)
- Step 5: 1 hour (Click handlers)
- Step 6: 1-2 hours (Gate light animation)
- Step 7: 1 hour (Special states)
- Step 8: 1 hour (Event listeners)
- Step 9: 2-3 hours (Position conversion refinement)
- Step 10: 0.5 hours (Verification)
- Step 11: 2-3 hours (Testing and fixes)

**Total: ~12-17 hours**

## Next Steps After Completion

1. Integrate HomePanel into MainScene/BottomBar
2. Test full navigation flow
3. Update PHASE_2D_IMPLEMENTATION_PLAN.md with completion status
4. Move to Phase 2D.5: Scene Integration

## Summary

This plan provides a complete roadmap for implementing the HomePanel component, which is the main home screen showing all buildings. The component will:

1. Display the home background image at the bottom of the content area
2. Render 21 building buttons at exact positions from the original game
3. Handle building clicks with proper navigation (Storage, Gate, Radio, or Build panels)
4. Show gate light animation for building 14 when active
5. Update building states (white/black) based on level and special conditions
6. Listen to game events for real-time updates

The implementation follows the 1:1 porting principle, maintaining exact positioning and behavior from the original Cocos2d-JS game.

