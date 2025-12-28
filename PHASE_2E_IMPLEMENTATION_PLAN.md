# Phase 2E: Integration & Polish - Implementation Plan

## Overview

This document outlines the detailed implementation plan for Phase 2E: Integration & Polish. This phase focuses on integrating all Phase 2 systems together, completing sleep mechanics with UI integration, implementing death overlay, and comprehensive testing.

**Prerequisites**: 
- Phase 2A: Survival System (complete)
- Phase 2B: Item & Storage System (complete)
- Phase 2C: Building System (complete)
- Phase 2D: UI Components (complete)

**Goal**: Make Phase 2 fully playable with all systems working together seamlessly.

---

## Current State Analysis

### Systems Already Implemented

1. **SurvivalSystem** (`src/game/systems/SurvivalSystem.ts`)
   - ✅ Hourly attribute decay
   - ✅ Attribute range effects
   - ✅ Death condition checking
   - ✅ Sleep mechanics (partial - logic exists but needs UI integration)
   - ✅ Temperature system
   - ⚠️ Death handling only logs (needs overlay)

2. **TimeManager** (`src/game/systems/TimeManager.ts`)
   - ✅ Time simulation
   - ✅ Day/night cycle
   - ✅ Season system
   - ✅ Callback system (hourly, daily)
   - ✅ Time acceleration

3. **Building System** (`src/game/world/Building.ts`, `src/store/buildingStore.ts`)
   - ✅ Building class
   - ✅ Building store
   - ✅ Room system
   - ✅ Building config data

4. **Player Store** (`src/store/playerStore.ts`)
   - ✅ Player attributes
   - ✅ Inventory (bag, storage, safe)
   - ✅ Equipment
   - ✅ Dog state

5. **UI Components**
   - ✅ TopBar (status display)
   - ✅ BottomBar (action buttons)
   - ✅ HomePanel (building grid)
   - ⚠️ BuildPanel (stub only)
   - ⚠️ Overlays directory exists but empty

6. **Game Integration** (`src/game/Game.ts`)
   - ✅ TimeManager integration
   - ✅ SurvivalSystem integration
   - ✅ FoodExpirationSystem integration
   - ⚠️ Missing overlay integration
   - ⚠️ Missing sleep UI integration

### Missing/Incomplete Components

1. **Death Overlay** - Not implemented
2. **Sleep UI Integration** - Sleep button/action not connected
3. **Overlay System** - UIStore has overlay support but no components
4. **System Integration** - Some systems not fully connected to UI
5. **Testing** - No comprehensive test suite

---

## 2E.1 System Integration

### Requirements Analysis

All Phase 2 systems need to be connected together:

1. **SurvivalSystem ↔ TimeManager**: ✅ Already connected (hourly callbacks)
2. **SurvivalSystem ↔ PlayerStore**: ✅ Already connected (attribute updates)
3. **SurvivalSystem ↔ BuildingStore**: ✅ Already connected (bed check, fireplace)
4. **SurvivalSystem ↔ UIStore**: ❌ Missing (death overlay trigger)
5. **Sleep System ↔ UI**: ❌ Missing (sleep button/action)
6. **Game Loop Integration**: ⚠️ Partial (needs overlay rendering)

### Implementation Plan

#### Task 2E.1.1: Death Overlay Integration

**File**: `src/components/overlays/DeathOverlay.tsx` (create)

**Component Structure**:
```typescript
interface DeathOverlayProps {
  reason: DeathReason
  onRestart?: () => void
  onQuit?: () => void
}

export function DeathOverlay({ reason, onRestart, onQuit }: DeathOverlayProps)
```

**Features**:
- Display death reason message
- Show restart button
- Show quit to menu button
- Match original game's death screen style
- Full-screen overlay with dark background

**Death Reasons to Handle**:
- `hp_zero` - HP reached 0
- `virus_overload` - Virus >= virusMax
- `infection` - Death from infection
- `starvation` - Starvation (if implemented)
- `thirst` - Thirst (if implemented)

**Integration Points**:
1. Modify `SurvivalSystem.handleDeath()` to trigger UIStore overlay
2. Add overlay rendering to `MainScene.tsx` or `App.tsx`
3. Connect restart/quit actions

**Implementation Steps**:
1. Create `DeathOverlay.tsx` component
2. Add death reason strings to localization (if needed)
3. Modify `SurvivalSystem.handleDeath()` to call `useUIStore.getState().showOverlay('death')`
4. Add overlay rendering to main scene
5. Implement restart logic (reset player state)
6. Implement quit logic (navigate to menu)
7. Test death scenarios

**Dependencies**:
- `store/uiStore.ts` - Overlay state management
- `types/game.types.ts` - DeathReason type
- `data/strings/` - Localization strings

#### Task 2E.1.2: Overlay Rendering System

**File**: `src/components/scenes/MainScene.tsx` (modify)

**Changes**:
- Add overlay rendering based on `uiStore.activeOverlay`
- Render overlays above all other content (z-index)
- Handle overlay dismissal

**Implementation**:
```typescript
// In MainScene.tsx
const activeOverlay = uiStore.activeOverlay

return (
  <div>
    {/* Existing content */}
    
    {/* Overlays */}
    {activeOverlay === 'death' && (
      <DeathOverlay 
        reason={deathReason} // Get from store or state
        onRestart={handleRestart}
        onQuit={handleQuit}
      />
    )}
  </div>
)
```

**Implementation Steps**:
1. Add overlay rendering to `MainScene.tsx`
2. Create overlay container with proper z-index
3. Handle overlay state management
4. Test overlay display/hide

**Dependencies**:
- `store/uiStore.ts` - Overlay state
- `components/overlays/DeathOverlay.tsx` - Death overlay component

#### Task 2E.1.3: Game Loop Integration

**File**: `src/App.tsx` or `src/components/scenes/MainScene.tsx` (modify)

**Requirements**:
- Ensure game loop calls `game.update(dt)` every frame
- Ensure survival system processes death checks
- Ensure time manager updates

**Current State**: Game loop may already exist. Verify integration.

**Implementation Steps**:
1. Verify game loop exists and calls `game.update(dt)`
2. Ensure survival system death checks are called
3. Test that systems update correctly

**Dependencies**:
- `game/Game.ts` - Game instance
- `hooks/useGameLoop.ts` - Game loop hook (if exists)

---

## 2E.2 Sleep Mechanics Completion

### Requirements Analysis

From `OriginalGame/src/game/buildAction.js` and `OriginalGame/src/game/player.js`:

**Sleep Mechanics**:
- Sleep is triggered from Bed building (ID 9) via BuildPanel
- Three sleep options:
  1. Sleep 1 hour
  2. Sleep 4 hours
  3. Sleep all night (until 6:00 AM)
- Sleep requires bed building (level >= 0)
- Sleep recovers vigour (energy) over time
- Sleep recovers HP over time (from original game)
- Time accelerates during sleep
- Cannot sleep if certain conditions (to be verified)

**Current Implementation**:
- `SurvivalSystem.startSleep()` exists but only handles "sleep until morning"
- Sleep button/action not connected to UI
- BuildPanel is stub only

### Implementation Plan

#### Task 2E.2.1: Sleep Action System

**File**: `src/game/systems/SurvivalSystem.ts` (modify)

**Changes Needed**:
1. Add sleep duration parameter to `startSleep()`
2. Support three sleep modes:
   - 1 hour
   - 4 hours
   - Until morning (6:00 AM)
3. Calculate vigour recovery based on sleep duration
4. Calculate HP recovery (from original game logic)
5. Handle coffee effect (reduces sleep recovery if coffee consumed recently)

**New Method Signature**:
```typescript
startSleep(duration?: '1hour' | '4hours' | 'untilMorning'): boolean
```

**Sleep Recovery Logic** (from original):
- Vigour recovery: `bedRate * 12` per hour
- HP recovery: `bedRate * 20` per hour
- Coffee effect: If coffee consumed within 6 hours, recovery reduced to 20%

**Implementation Steps**:
1. Modify `startSleep()` to accept duration parameter
2. Calculate sleep time based on duration
3. Calculate vigour/HP recovery rates
4. Apply coffee effect if applicable
5. Set up hourly recovery callbacks
6. Test all three sleep modes

**Dependencies**:
- `store/playerStore.ts` - Player attributes, coffee time tracking
- `store/buildingStore.ts` - Bed building check
- `game/systems/TimeManager.ts` - Time acceleration

#### Task 2E.2.2: Sleep UI Integration

**File**: `src/components/panels/BuildPanel.tsx` (create/implement)

**Requirements**:
- Display sleep actions when building ID is 9 (Bed)
- Show three sleep buttons:
  1. "Sleep 1 Hour"
  2. "Sleep 4 Hours"
  3. "Sleep Until Morning"
- Show sleep recovery preview (vigour/HP recovery rates)
- Disable buttons if bed not available or already sleeping
- Show sleep progress/status if sleeping

**Implementation**:
```typescript
// In BuildPanel.tsx
const handleSleep = (duration: '1hour' | '4hours' | 'untilMorning') => {
  const survivalSystem = game.getSurvivalSystem()
  const success = survivalSystem.startSleep(duration)
  
  if (success) {
    // Show sleep progress or close panel
    // Time will accelerate automatically
  } else {
    // Show error message (no bed, already sleeping, etc.)
  }
}
```

**Implementation Steps**:
1. Create/implement `BuildPanel.tsx` component
2. Add sleep action buttons for bed building
3. Connect buttons to `SurvivalSystem.startSleep()`
4. Add sleep status display
5. Add error handling for sleep failures
6. Test sleep UI integration

**Dependencies**:
- `game/systems/SurvivalSystem.ts` - Sleep system
- `store/buildingStore.ts` - Building data
- `store/uiStore.ts` - Panel state

#### Task 2E.2.3: Sleep Progress Display

**File**: `src/components/panels/BuildPanel.tsx` or new component

**Requirements**:
- Show sleep progress when sleeping
- Display time remaining
- Display vigour/HP recovery progress
- Allow cancel sleep (if supported)

**Implementation Steps**:
1. Add sleep state display to BuildPanel
2. Show time remaining until wake up
3. Show vigour/HP recovery progress
4. Test sleep progress display

**Dependencies**:
- `game/systems/SurvivalSystem.ts` - Sleep state
- `store/gameStore.ts` - Time state

---

## 2E.3 Death Overlay Implementation

### Requirements Analysis

From `OriginalGame/src/ui/deathNode.js` (if exists) or similar:

**Death Overlay Features**:
- Full-screen dark overlay
- Death reason message
- Restart button (restart game)
- Quit button (return to menu)
- Match original game's visual style

### Implementation Plan

#### Task 2E.3.1: Death Overlay Component

**File**: `src/components/overlays/DeathOverlay.tsx` (create)

**Component Structure**:
```typescript
interface DeathOverlayProps {
  reason: DeathReason
  onRestart: () => void
  onQuit: () => void
}

export function DeathOverlay({ reason, onRestart, onQuit }: DeathOverlayProps)
```

**Visual Design**:
- Full-screen overlay with dark background (rgba(0, 0, 0, 0.8))
- Centered death message
- Two buttons: Restart and Quit
- Match original game style

**Death Messages** (to be localized):
- `hp_zero`: "You have died from your injuries."
- `virus_overload`: "You have been overwhelmed by the virus."
- `infection`: "You have succumbed to infection."
- `starvation`: "You have starved to death."
- `thirst`: "You have died of thirst."

**Implementation Steps**:
1. Create `DeathOverlay.tsx` component
2. Add death message display
3. Add restart button
4. Add quit button
5. Style to match original game
6. Add animations (fade in)
7. Test overlay display

**Dependencies**:
- `types/game.types.ts` - DeathReason type
- `data/strings/` - Localization (optional for Phase 2E)
- `store/uiStore.ts` - Overlay state

#### Task 2E.3.2: Death Overlay Integration

**File**: `src/game/systems/SurvivalSystem.ts` (modify)

**Changes**:
- Modify `handleDeath()` to trigger UI overlay
- Store death reason in UIStore or separate state
- Ensure death overlay is shown when death occurs

**Implementation**:
```typescript
private handleDeath(reason: DeathReason): void {
  // Pause game
  game.pause()
  
  // Show death overlay
  const uiStore = useUIStore.getState()
  uiStore.showOverlay('death')
  
  // Store death reason (add to UIStore or use state)
  // For now, can use a simple state or store in UIStore
}
```

**Implementation Steps**:
1. Modify `SurvivalSystem.handleDeath()` to trigger overlay
2. Add death reason storage to UIStore or component state
3. Pause game on death
4. Test death trigger

**Dependencies**:
- `store/uiStore.ts` - Overlay state
- `game/Game.ts` - Game pause

#### Task 2E.3.3: Restart/Quit Actions

**File**: `src/components/overlays/DeathOverlay.tsx` (modify)

**Restart Logic**:
- Reset player state to initial values
- Reset game time (optional - may want to keep time)
- Reset buildings (optional)
- Close death overlay
- Resume game

**Quit Logic**:
- Navigate to menu scene
- Close death overlay
- Reset game state (optional)

**Implementation Steps**:
1. Implement restart handler
2. Implement quit handler
3. Test restart functionality
4. Test quit functionality

**Dependencies**:
- `store/playerStore.ts` - Player state reset
- `store/gameStore.ts` - Game state reset
- `store/uiStore.ts` - Scene navigation

---

## 2E.4 Testing & Validation

### Testing Strategy

#### Unit Tests
- Survival system death conditions
- Sleep mechanics (all three modes)
- Death overlay display
- System integration points

#### Integration Tests
- Survival system with TimeManager
- Sleep system with UI
- Death system with overlay
- Game loop with all systems

#### Manual Testing Checklist

**Survival System**:
- [ ] Hourly decay applies correctly
- [ ] Attribute range effects trigger
- [ ] Death conditions trigger correctly
- [ ] Temperature updates correctly
- [ ] Fireplace affects temperature

**Sleep System**:
- [ ] Sleep 1 hour works
- [ ] Sleep 4 hours works
- [ ] Sleep until morning works
- [ ] Sleep requires bed building
- [ ] Sleep recovers vigour correctly
- [ ] Sleep recovers HP correctly (if implemented)
- [ ] Time accelerates during sleep
- [ ] Cannot sleep if already sleeping
- [ ] Sleep UI displays correctly

**Death System**:
- [ ] Death overlay displays on HP = 0
- [ ] Death overlay displays on virus overload
- [ ] Death overlay displays on infection death
- [ ] Restart button works
- [ ] Quit button works
- [ ] Game pauses on death

**System Integration**:
- [ ] All systems update in game loop
- [ ] UI updates reflect game state changes
- [ ] Overlays display correctly
- [ ] No console errors
- [ ] Performance is acceptable

**UI/UX**:
- [ ] All buttons are clickable
- [ ] Overlays are properly layered
- [ ] Text is readable
- [ ] Animations are smooth
- [ ] Mobile responsiveness works

### Test Scenarios

#### Scenario 1: Full Survival Day
1. Start game
2. Wait for hourly decay
3. Check attribute changes
4. Build bed
5. Sleep until morning
6. Verify vigour recovery
7. Continue until death (low HP)
8. Verify death overlay

#### Scenario 2: Sleep Mechanics
1. Build bed (level 0)
2. Try to sleep 1 hour
3. Verify vigour recovery
4. Try to sleep 4 hours
5. Verify vigour recovery
6. Try to sleep until morning
7. Verify wake up at 6:00 AM

#### Scenario 3: Death Conditions
1. Reduce HP to 0 (via injury/infection)
2. Verify death overlay appears
3. Test restart button
4. Test quit button
5. Repeat for virus overload
6. Repeat for infection death

---

## Implementation Order

### Phase 2E.1: Core Integration (Priority: High)
1. **Death Overlay Component** - Create basic overlay
2. **Death Overlay Integration** - Connect to SurvivalSystem
3. **Overlay Rendering System** - Add to MainScene
4. **Restart/Quit Actions** - Implement handlers

### Phase 2E.2: Sleep Completion (Priority: High)
5. **Sleep Action System** - Extend SurvivalSystem
6. **Sleep UI Integration** - Add to BuildPanel
7. **Sleep Progress Display** - Add status display

### Phase 2E.3: Testing & Polish (Priority: Medium)
8. **Unit Tests** - Test individual systems
9. **Integration Tests** - Test system interactions
10. **Manual Testing** - Full gameplay scenarios
11. **Bug Fixes** - Fix any issues found
12. **Performance Optimization** - If needed

---

## Dependencies & Blockers

### Blockers
- **BuildPanel Implementation**: Sleep UI depends on BuildPanel
  - **Solution**: Implement basic BuildPanel for bed building only, or add sleep button to HomePanel temporarily

### Dependencies
- `store/uiStore.ts` - Already exists
- `types/game.types.ts` - DeathReason type exists
- `game/systems/SurvivalSystem.ts` - Already exists
- `game/Game.ts` - Already exists
- `components/scenes/MainScene.tsx` - Already exists

---

## Estimated Time

- Death Overlay Component: 2-3 hours
- Death Overlay Integration: 1-2 hours
- Sleep Action System Extension: 2-3 hours
- Sleep UI Integration: 2-3 hours
- Overlay Rendering System: 1-2 hours
- Testing & Bug Fixes: 3-4 hours

**Total: ~11-17 hours**

---

## Success Criteria

Phase 2E is complete when:

1. ✅ Death overlay displays correctly on all death conditions
2. ✅ Restart and quit buttons work correctly
3. ✅ Sleep mechanics work for all three modes
4. ✅ Sleep UI is integrated and functional
5. ✅ All systems update correctly in game loop
6. ✅ No critical bugs or console errors
7. ✅ Manual testing passes all scenarios
8. ✅ Code is clean and well-documented

---

## Next Steps

1. Review and approve this plan
2. Switch to ACT mode
3. Implement in order: Phase 2E.1 → Phase 2E.2 → Phase 2E.3
4. Test each component as implemented
5. Update PHASE_2_IMPLEMENTATION_PLAN.md with completion status
6. Document any issues or deviations from plan

---

## Notes

1. **BuildPanel Priority**: If BuildPanel is not ready, consider adding a temporary sleep button to HomePanel or BottomBar for Phase 2E.

2. **Death State Management**: Consider adding death reason to UIStore or creating a separate death state store.

3. **Sleep Progress**: Sleep progress display may be optional for Phase 2E if time is limited. Focus on core functionality first.

4. **Localization**: Death messages can use hardcoded English for Phase 2E, add localization in later phase.

5. **HP Recovery**: HP recovery during sleep may be optional for Phase 2E. Focus on vigour recovery first.

6. **Coffee Effect**: Coffee effect on sleep may be optional for Phase 2E if not yet implemented.

