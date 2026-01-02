# Gate Panel "Go to Map" Implementation Plan

## Overview

This plan covers implementing the "Go to Map" functionality from the Gate Panel, which allows players to leave home and navigate to the world map scene. This includes the transition flow, player state management, and map system integration.

**Status**: PLAN Mode - No code changes will be made

**Related Files**:
- `src/components/panels/GatePanelContent.tsx` - Gate panel UI
- `src/components/scenes/MainScene.tsx` - Scene navigation handling
- `src/store/playerStore.ts` - Player state management
- `src/game/world/Map.ts` - Map system (Phase 3.1)
- `OriginalGame/src/ui/gateNode.js` - Original gate panel
- `OriginalGame/src/ui/gateOutNode.js` - Original gate out transition

---

## Current State Analysis

### What's Already Implemented

1. **Gate Panel UI** (`GatePanelContent.tsx`):
   - ✅ EquipPanel at top
   - ✅ ItemTransferPanel at bottom
   - ✅ Sets `inGate` setting on mount/unmount
   - ✅ Plays CLOSE_DOOR sound

2. **MainScene Navigation** (`MainScene.tsx`):
   - ✅ Handles forward button click for gate panel
   - ✅ Calls `playerStore.out()`
   - ✅ Plays FOOT_STEP sound
   - ✅ Navigates to map scene (`uiStore.setScene('map')`)
   - ⚠️ TODO comment indicates GateOutNode transition is skipped

3. **Player Store** (`playerStore.ts`):
   - ✅ `out()` method exists and sets `isAtHome = false`, `leftHomeTime`
   - ✅ `map` property exists (Map | null)
   - ✅ `setSetting()` method exists

4. **Map System** (`Map.ts`):
   - ✅ Map class exists with `deleteUnusableSite()` method
   - ⚠️ Map may not be initialized in playerStore yet

### What's Missing

1. **GateOutPanelContent Component**:
   - ❌ Transition panel showing tip text
   - ❌ Auto-navigation after 3 seconds
   - ❌ Background image (`gate_out_bg.png`)

2. **Map Scene**:
   - ❌ MapScene component doesn't exist (commented out in App.tsx)
   - ❌ MapScene is part of Phase 3 implementation

3. **Map System Integration**:
   - ✅ Map IS initialized in new game (via `playerStore.initializeMap()` in MenuScene)
   - ✅ Map initialization creates default sites: [100, 201, 202, 204, 400]
   - ✅ Map.init() sets home position to {x: 45, y: 50}
   - ⚠️ `player.map.deleteUnusableSite()` may fail if map is null (edge case: loading old save without map)
   - ⚠️ Map restoration from save is not yet implemented (SaveSystem.ts line 258: TODO)

4. **Log Messages**:
   - ⚠️ Log message 1110 (leaving home) not implemented
   - ⚠️ String resources 1167, 3011 may not exist

---

## Map Initialization Verification

### ✅ Map IS Initialized in New Game

**Finding**: The map system is properly initialized when starting a new game.

**Evidence**:
1. **New Game Flow** (`MenuScene.tsx` line 95):
   ```typescript
   const initializeNewGame = () => {
     // ... other initialization ...
     // Initialize map
     playerStore.initializeMap()
     // ...
   }
   ```

2. **initializeMap() Implementation** (`playerStore.ts` lines 578-582):
   ```typescript
   initializeMap: () => {
     const map = new Map()
     map.init()
     set({ map })
   }
   ```

3. **Map.init() Behavior** (`Map.ts` lines 104-142):
   - Creates default sites: `[100, 201, 202, 204, 400]` (HOME_SITE, GAS_SITE, AD_SITE, WORK_SITE, BAZAAR_SITE)
   - Or full unlock if IAP is enabled: `[1,2,3,4,5,6,7,8,9,10,11,12,13,14,20,21,22,30,31,32,33,41,42,43,51,52,61,100,201,202,203,204,301,302,303,304,305,306,307,308,309,310,311,312,400,500,501,502,666]`
   - Sets home position: `{x: 45, y: 50}`
   - Sets player position to home: `this.pos = homeSite.pos`

**Conclusion**: 
- ✅ Map is initialized in new game
- ✅ Map will contain default sites when player tries to go to map
- ✅ `deleteUnusableSite()` can be called safely in new game context
- ⚠️ Edge case: Map may be null if loading old save data (SaveSystem.ts line 258: TODO - map restoration not implemented)

**Recommendation**: Add defensive null check in `goOut()` function, but for new games, map will always be initialized.

---

## Original Game Flow

### Gate Panel → Gate Out → Map

**Step 1: Gate Panel Right Button Click**
```javascript
// OriginalGame/src/ui/gateNode.js (line 68)
player.out();  // Sets isAtHome = false, leftHomeTime = current time
player.log.addMsg(1110);  // Log message
audioManager.sound.FOOT_STEP.play();  // Play sound
this.forward(Navigation.nodeName.GATE_OUT_NODE);  // Navigate to gate out
```

**Step 2: Gate Out Panel**
```javascript
// OriginalGame/src/ui/gateOutNode.js
_init: function() {
  // Show background, tip text, random tip
  // Auto-navigate after 3 seconds
  this.scheduleOnce(function() {
    self.goOut();
  }, 3);
}

goOut: function() {
  player.map.deleteUnusableSite();  // Clean up closed sites
  this.forward(Navigation.nodeName.MAP_NODE);  // Navigate to map
}
```

**Key Behaviors**:
1. Player state: `isAtHome = false`, `leftHomeTime` recorded
2. Log message: String ID 1110 ("Leaving home" or similar)
3. Sound: FOOT_STEP played
4. Transition: GateOutNode shows for 3 seconds (or until clicked)
5. Map cleanup: `deleteUnusableSite()` called before map navigation
6. Navigation: Goes to MAP_NODE (MapScene)

---

## Implementation Requirements

### 1. Ensure Map System is Initialized

**File**: `src/store/playerStore.ts`

**Current State**: 
- ✅ Map IS initialized in new game via `playerStore.initializeMap()` (called in MenuScene.initializeNewGame())
- ✅ Map initialization creates default sites: [100, 201, 202, 204, 400] (HOME_SITE, GAS_SITE, AD_SITE, WORK_SITE, BAZAAR_SITE)
- ✅ Map.init() sets home position to {x: 45, y: 50} and player position to home
- ⚠️ Map may be null in edge cases:
  - Loading old save data without map (SaveSystem.ts line 258: TODO - map restoration not implemented)
  - Direct access to playerStore.map before new game initialization

**Required Check**:
- Add null check before calling `deleteUnusableSite()`
- If map is null, either:
  - Initialize map on first use (recommended), OR
  - Skip `deleteUnusableSite()` call (with warning), OR
  - Show error and prevent navigation

**Recommendation**: Add null check and initialize map if needed, or gracefully handle null case. For new games, map will always be initialized.

---

### 2. Implement GateOutPanelContent Component (Optional but Recommended)

**File**: `src/components/panels/GateOutPanelContent.tsx`

**Purpose**: Show transition screen matching original game behavior

**Structure**:
```typescript
export function GateOutPanelContent() {
  // Component implementation
}
```

**Layout Requirements**:

1. **Background Image**: `gate_out_bg.png`
   - Position: Centered in content area
   - CSS: `left: 50%, top: 50%, transform: translate(-50%, -50%)`
   - Z-index: -1 (behind content)

2. **Clickable Area**: Full content area
   - Click handler: `goOut()`
   - Position: `absolute inset-0`

3. **Tip Label**: String ID 1167
   - Position: `left: 30px, top: 400px` (from content area top)
   - Width: `bgWidth - 60px` (30px padding on each side)
   - Font: Normal, COMMON_2 size
   - Anchor: `(0, 0)` (top-left)

4. **Random Tip**: Random from string array 3011
   - Position: `left: 30px, top: ${labelTip.y - 20}px` (20px above tip label)
   - Width: `bgWidth - 60px`
   - Font: Normal, COMMON_2 size
   - Anchor: `(0, 1)` (bottom-left)

**Behavior Requirements**:

1. **Auto-navigation**: Navigate to map after 3 seconds
   ```typescript
   useEffect(() => {
     const timer = setTimeout(() => {
       goOut()
     }, 3000)
     return () => clearTimeout(timer)
   }, [])
   ```

2. **Manual Navigation**: Click anywhere to navigate immediately
   ```typescript
   const handleClick = () => {
     goOut()
   }
   ```

3. **goOut() Function**:
   ```typescript
   const goOut = () => {
     // Call deleteUnusableSite if map exists
     const playerStore = usePlayerStore.getState()
     if (playerStore.map) {
       playerStore.map.deleteUnusableSite()
     }
     
     // Navigate to map scene
     uiStore.setScene('map')
   }
   ```

**Positioning Notes**:
- Uses BottomBar content area layout
- Background centered in content area
- Text positioned relative to content area (not screen)
- Content area dimensions: `596 × 803` pixels (scaled)

**Tasks**:
- [ ] Create GateOutPanelContent component
- [ ] Add gate_out_bg.png sprite (check if exists in sprite atlas)
- [ ] Add tip label (string 1167)
- [ ] Add random tip (string 3011 array)
- [ ] Implement auto-navigation (3 seconds)
- [ ] Implement click handler
- [ ] Implement goOut() function
- [ ] Add null check for map
- [ ] Test layout and positioning

---

### 3. Update MainScene Navigation

**File**: `src/components/scenes/MainScene.tsx`

**Current Implementation** (lines 203-217):
```typescript
const handleForwardButton = () => {
  if (currentPanel === 'gate') {
    // Gate panel: Go Out
    const playerStore = usePlayerStore.getState()
    playerStore.out()
    
    // Play FOOT_STEP sound
    audioManager.playEffect(SoundPaths.FOOT_STEP)
    
    // Navigate to map scene
    // TODO: For now, navigate to map scene directly
    // In original game, it goes to GATE_OUT_NODE first, then to MAP_NODE
    // We'll skip the gate out transition for now
    uiStore.setScene('map')
  }
}
```

**Options**:

**Option A: Direct Navigation (Current)**
- Skip GateOutPanelContent
- Navigate directly to map scene
- Call `deleteUnusableSite()` before navigation
- Pros: Simpler, faster
- Cons: Doesn't match original game flow

**Option B: Gate Out Panel Transition (Recommended)**
- Navigate to gate out panel first
- Gate out panel auto-navigates to map after 3 seconds
- Matches original game behavior
- Pros: Matches original, better UX
- Cons: Requires GateOutPanelContent component

**Recommended Implementation (Option B)**:
```typescript
const handleForwardButton = () => {
  if (currentPanel === 'gate') {
    // Gate panel: Go Out
    const playerStore = usePlayerStore.getState()
    playerStore.out()
    
    // Play FOOT_STEP sound
    audioManager.playEffect(SoundPaths.FOOT_STEP)
    
    // TODO: Add log message 1110 when log system is ready
    // logStore.addLog(getString(1110))
    
    // Navigate to gate out panel (transition)
    uiStore.openPanelAction('gateOut')
  }
}
```

**Tasks**:
- [ ] Decide on Option A or B
- [ ] If Option B: Add 'gateOut' panel type to UIStore
- [ ] Update handleForwardButton to navigate to gate out panel
- [ ] Add null check for map before deleteUnusableSite()
- [ ] Add log message 1110 (when log system ready)

---

### 4. Add Gate Out Panel to UIStore

**File**: `src/store/uiStore.ts`

**Required Changes**:
1. Add `'gateOut'` to `Panel` type union
2. Gate out panel has no buttons (leftBtn: false, rightBtn: false)
3. Gate out panel has empty title ("")

**Implementation**:
```typescript
export type Panel = 
  | 'home'
  | 'build'
  | 'storage'
  | 'crafting'
  | 'equipment'
  | 'npc'
  | 'gate'
  | 'gateOut'  // NEW
  | 'radio'
  // ... other panels
```

**Tasks**:
- [ ] Add 'gateOut' to Panel type
- [ ] Update MainScene to handle 'gateOut' panel
- [ ] Update BottomBar to handle gate out panel (no buttons, empty title)

---

### 5. Update MainScene Panel Rendering

**File**: `src/components/scenes/MainScene.tsx`

**Required Changes**:
1. Add case for 'gateOut' panel in `renderPanel()`
2. Render `GateOutPanelContent` when `currentPanel === 'gateOut'`

**Implementation**:
```typescript
const renderPanel = () => {
  switch (currentPanel) {
    case 'home':
      return <HomePanelContent />
    case 'gate':
      return <GatePanelContent />
    case 'gateOut':  // NEW
      return <GateOutPanelContent />
    // ... other cases
  }
}
```

**Tasks**:
- [ ] Add 'gateOut' case to renderPanel()
- [ ] Import GateOutPanelContent
- [ ] Test panel navigation

---

### 6. Update BottomBar for Gate Out Panel

**File**: `src/components/layout/BottomBar.tsx`

**Required Changes**:
1. Gate out panel: No buttons (leftBtn: false, rightBtn: false)
2. Gate out panel: Empty title ("")

**Implementation**:
```typescript
const getPanelTitle = () => {
  if (currentPanel === 'gateOut') {
    return ''  // Empty title
  }
  // ... other panels
}

const shouldShowBackButton = () => {
  if (currentPanel === 'gateOut') {
    return false  // No back button
  }
  // ... other panels
}

const shouldShowForwardButton = () => {
  if (currentPanel === 'gateOut') {
    return false  // No forward button
  }
  // ... other panels
}
```

**Tasks**:
- [ ] Update getPanelTitle() for gate out
- [ ] Update shouldShowBackButton() for gate out
- [ ] Update shouldShowForwardButton() for gate out
- [ ] Test button visibility

---

### 7. Ensure Map System Integration

**File**: `src/store/playerStore.ts`

**Current State**: Map property exists but may be null

**Required Checks**:

1. **Map Initialization**:
   - Verify map is initialized when needed
   - If map is null, either initialize or handle gracefully

2. **deleteUnusableSite() Call**:
   - Add null check before calling
   - Log warning if map is null (development only)

**Implementation in GateOutPanelContent**:
```typescript
const goOut = () => {
  const playerStore = usePlayerStore.getState()
  
  // Call deleteUnusableSite if map exists
  // Note: Map should always be initialized in new game, but check for safety
  if (playerStore.map) {
    playerStore.map.deleteUnusableSite()
  } else {
    // Edge case: Map not initialized (shouldn't happen in new game)
    // Initialize map if missing (defensive programming)
    console.warn('Map is null, initializing map...')
    playerStore.initializeMap()
    // Now deleteUnusableSite (will be empty on fresh init, but safe to call)
    playerStore.map?.deleteUnusableSite()
  }
  
  // Navigate to map scene
  uiStore.setScene('map')
}
```

**Alternative: Initialize Map on First Use**:
```typescript
// In playerStore
getMap: () => {
  const { map } = get()
  if (!map) {
    // Initialize map if not exists
    const newMap = new Map()
    newMap.init()
    set({ map: newMap })
    return newMap
  }
  return map
}
```

**Tasks**:
- [ ] Verify map initialization
- [ ] Add null check in goOut()
- [ ] Decide on map initialization strategy
- [ ] Test with null map and initialized map

---

### 8. Add Log Message Support

**File**: `src/store/logStore.ts` (if exists)

**Required**:
- String ID 1110: "Leaving home" or similar message
- Add log message when player.out() is called

**Implementation**:
```typescript
// In MainScene handleForwardButton or playerStore.out()
const logStore = useLogStore.getState()
logStore.addLog(getString(1110))  // When log system is ready
```

**Tasks**:
- [ ] Verify log system exists
- [ ] Add string ID 1110 to localization
- [ ] Add log message call in out() or handleForwardButton()
- [ ] Test log message appears

---

### 9. Handle MapScene Not Existing (Phase 3 Dependency)

**Current State**: MapScene is commented out in App.tsx (Phase 3)

**Options**:

**Option A: Stub MapScene**
- Create minimal MapScene component that shows "Map Scene (Coming Soon)"
- Allows navigation to work without errors
- Can be replaced with full implementation later

**Option B: Prevent Navigation**
- Check if MapScene exists before navigating
- Show error message or prevent navigation
- Pros: Prevents broken state
- Cons: Blocks testing

**Option C: Conditional Navigation**
- If MapScene exists, navigate to it
- If not, show error or fallback
- Pros: Flexible
- Cons: Requires conditional logic

**Recommended**: Option A - Create stub MapScene

**Stub Implementation**:
```typescript
// src/components/scenes/MapScene.tsx
export function MapScene() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="text-center">
        <h1>Map Scene</h1>
        <p>Map system implementation (Phase 3)</p>
        <button onClick={() => useUIStore.getState().setScene('main')}>
          Back to Home
        </button>
      </div>
    </div>
  )
}
```

**Tasks**:
- [ ] Create stub MapScene component
- [ ] Uncomment MapScene in App.tsx
- [ ] Test navigation to map scene
- [ ] Replace with full implementation in Phase 3

---

## Implementation Steps

### Phase 1: Basic Navigation (Direct to Map)

1. **Ensure Map Null Safety**:
   - Add null check in MainScene handleForwardButton
   - Call `deleteUnusableSite()` only if map exists
   - Test with null map

2. **Create Stub MapScene**:
   - Create minimal MapScene component
   - Uncomment in App.tsx
   - Test navigation works

3. **Test Current Flow**:
   - Gate panel → Right button → Map scene
   - Verify player.out() is called
   - Verify isAtHome is set to false
   - Verify leftHomeTime is recorded

**Status**: ✅ Can be done immediately (minimal changes)

---

### Phase 2: Gate Out Transition Panel (Optional)

4. **Create GateOutPanelContent**:
   - Create component file
   - Add background image
   - Add tip text (string 1167)
   - Add random tip (string 3011)
   - Implement auto-navigation (3 seconds)
   - Implement click handler
   - Implement goOut() function

5. **Add Gate Out Panel to UIStore**:
   - Add 'gateOut' to Panel type
   - Update MainScene renderPanel()
   - Update BottomBar button visibility

6. **Update MainScene Navigation**:
   - Change handleForwardButton to navigate to 'gateOut'
   - Gate out panel navigates to 'map'

7. **Test Full Flow**:
   - Gate panel → Right button → Gate out panel → Map scene
   - Verify 3-second auto-navigation
   - Verify click navigation
   - Verify deleteUnusableSite() is called

**Status**: ⚠️ Requires GateOutPanelContent component and string resources

---

### Phase 3: Polish and Integration

8. **Add Log Messages**:
   - Add string ID 1110 to localization
   - Add log message in out() or handleForwardButton()
   - Test log message appears

9. **Verify Map Initialization**:
   - Ensure map is initialized when needed
   - Test deleteUnusableSite() works correctly
   - Handle edge cases (null map, empty deletion queue)

10. **Cross-Check with Original**:
    - Verify flow matches original game
    - Verify timing matches (3 seconds)
    - Verify sounds play correctly
    - Verify player state is updated correctly

**Status**: ⚠️ Requires log system and map system to be fully implemented

---

## Dependencies Checklist

### ✅ Already Implemented
- [x] GatePanelContent component
- [x] MainScene navigation handling
- [x] playerStore.out() method
- [x] playerStore.setSetting() method
- [x] Map class with deleteUnusableSite() method
- [x] Map initialization in new game (playerStore.initializeMap() in MenuScene)
- [x] Map.init() creates default sites [100, 201, 202, 204, 400]
- [x] Map.init() sets home position {x: 45, y: 50}
- [x] Audio system (FOOT_STEP sound)
- [x] UIStore scene navigation

### ⚠️ Needs Implementation/Verification
- [ ] GateOutPanelContent component
- [ ] MapScene component (stub or full)
- [ ] Map restoration from save (SaveSystem.ts TODO)
- [ ] String resources (1167, 3011, 1110)
- [ ] Log system integration (string 1110)
- [ ] gate_out_bg.png sprite
- [ ] 'gateOut' panel type in UIStore

### 🔮 Future Dependencies (Phase 3)
- [ ] Full MapScene implementation
- [ ] Map system full integration
- [ ] Site system integration
- [ ] Travel system integration

---

## Testing Checklist

### Basic Navigation (Phase 1)
- [ ] Gate panel right button navigates to map scene
- [ ] player.out() is called correctly
- [ ] isAtHome is set to false
- [ ] leftHomeTime is recorded
- [ ] FOOT_STEP sound plays
- [ ] Map is initialized in new game (verify via playerStore.map)
- [ ] No errors when map is null (edge case handling)
- [ ] deleteUnusableSite() is called if map exists
- [ ] Map contains default sites: [100, 201, 202, 204, 400]

### Gate Out Transition (Phase 2)
- [ ] Gate panel right button navigates to gate out panel
- [ ] Gate out panel shows background image
- [ ] Gate out panel shows tip text (string 1167)
- [ ] Gate out panel shows random tip (string 3011)
- [ ] Auto-navigates to map after 3 seconds
- [ ] Clicking anywhere navigates immediately
- [ ] deleteUnusableSite() is called before navigation
- [ ] No buttons shown on gate out panel
- [ ] Empty title on gate out panel

### Integration (Phase 3)
- [ ] Log message 1110 appears when leaving home
- [ ] Map is initialized correctly
- [ ] deleteUnusableSite() works correctly
- [ ] Full flow works: Gate → Gate Out → Map
- [ ] Player state persists correctly
- [ ] No console errors or warnings

---

## Coordinate Conversion Notes

### Gate Out Panel Layout

**Background Image**:
- Original Cocos: `(bgRect.width / 2, bgRect.height / 2)` with anchor `(0.5, 0.5)`
- CSS: `left: 50%, top: 50%, transform: translate(-50%, -50%)`
- Z-index: -1

**Tip Label**:
- Original Cocos: `(leftPadding, 400)` with anchor `(0, 0)`
- CSS: `left: 30px, top: 400px`
- Width: `bgWidth - 60px` (596 - 60 = 536px, scaled)

**Random Tip**:
- Original Cocos: `(leftPadding, labelTip.y - 20)` with anchor `(0, 1)`
- CSS: `left: 30px, top: ${400 - 20}px = 380px`
- Width: `bgWidth - 60px`

**Content Area**:
- Uses BottomBar content area
- Dimensions: `596 × 803` pixels (scaled by bgScale)
- Position: Relative to BottomBar content area

---

## String Resources Needed

### String ID 1110
- **Usage**: Log message when leaving home
- **Location**: Called in `player.out()` or `handleForwardButton()`
- **Status**: ⚠️ Needs to be added to localization

### String ID 1167
- **Usage**: Gate out panel tip label
- **Location**: GateOutPanelContent component
- **Status**: ⚠️ Needs to be added to localization

### String ID 3011
- **Usage**: Array of random tips for gate out panel
- **Location**: GateOutPanelContent component (random selection)
- **Status**: ⚠️ Needs to be added to localization

---

## Sprite Resources Needed

### gate_out_bg.png
- **Usage**: Background image for gate out panel
- **Location**: GateOutPanelContent component
- **Status**: ⚠️ Needs to be verified in sprite atlas

**Check**: Look for `gate_out_bg.png` in sprite atlases or `public/assets/sprites/`

---

## Notes

1. **Map System Initialization**: 
   - ✅ Map IS initialized in new game via `playerStore.initializeMap()` in `MenuScene.initializeNewGame()` (line 95)
   - ✅ Map.init() creates default sites: [100, 201, 202, 204, 400] (HOME_SITE, GAS_SITE, AD_SITE, WORK_SITE, BAZAAR_SITE)
   - ✅ Map.init() sets home position to {x: 45, y: 50} and player position to home
   - ⚠️ Map restoration from save is not yet implemented (SaveSystem.ts line 258: TODO)
   - ⚠️ Edge case: Map may be null if loading old save data without map - should handle gracefully

2. **Gate Out Panel Optional**: The gate out transition panel is optional - we can navigate directly to map scene if preferred. However, implementing it matches the original game behavior.

3. **MapScene Stub**: Since MapScene is part of Phase 3, we should create a stub component to allow navigation to work without errors. This can be replaced with the full implementation later.

4. **Timing**: The original game shows the gate out panel for 3 seconds before auto-navigating. We should match this timing.

5. **Player State**: The `out()` method sets `isAtHome = false` and records `leftHomeTime`. This is critical for game logic (raids, time away from home, etc.).

6. **Log Messages**: Log message 1110 should be added when the log system is ready. For now, we can stub it or skip it.

7. **Error Handling**: We should handle cases where:
   - Map is null (skip deleteUnusableSite)
   - MapScene doesn't exist (show error or stub)
   - String resources are missing (use fallback text)

---

## Cross-Check with Original Game

After implementation, verify:

- [ ] Flow matches original: Gate → Gate Out → Map
- [ ] Timing matches: 3 seconds auto-navigation
- [ ] Player state updated: isAtHome = false, leftHomeTime recorded
- [ ] Sounds play: FOOT_STEP on gate panel, CLOSE_DOOR on gate panel open
- [ ] Map cleanup: deleteUnusableSite() called before map navigation
- [ ] UI matches: Background, tip text, random tip displayed correctly
- [ ] Navigation works: Click anywhere or wait 3 seconds to go to map

---

## Next Steps

1. **Review this plan** and approve or request modifications
2. **Switch to ACT mode** to begin implementation
3. **Start with Phase 1**: Basic navigation (direct to map)
4. **Proceed to Phase 2**: Gate out transition panel (optional)
5. **Complete Phase 3**: Polish and integration

---

## Related Documents

- `GATE_IMPLEMENTATION_PLAN.md` - Full gate system implementation
- `PHASE_3_1_MAP_SYSTEM_PREPARATION_PLAN.md` - Map system details
- `COCOS_TO_CSS_POSITION_MAPPING.md` - Position conversion reference
- `PORTING_PLAN.md` - Overall project plan

