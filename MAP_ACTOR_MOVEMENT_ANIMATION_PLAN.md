# Map Actor Movement Animation Plan

## Overview

This plan covers implementing smooth actor movement animation on the map when traveling to a site, matching the original game's behavior where the actor smoothly moves from current position to target site position over time.

**Status**: PLAN Mode - No code changes will be made

**Original Game Reference**: `OriginalGame/src/ui/MapNode.js`
- `Actor.move()`: Initiates movement to target position
- `Actor.updateActor(dt)`: Updates position frame-by-frame using velocity
- Movement is animated over calculated travel time
- Position updates continuously during movement
- Navigation callback only fires AFTER movement completes

**Current Implementation**: Actor moves instantly (100ms setTimeout) without animation

**Target Implementation**: Smooth animated movement matching original game

---

## Current State Analysis

### What Exists

1. **MapPanelContent Component** (`src/components/panels/MapPanelContent.tsx`):
   - ✅ Actor position rendering (map.pos)
   - ✅ Site click handler with travel calculation
   - ✅ Instant position update (setTimeout 100ms)
   - ❌ No animated movement
   - ❌ No frame-by-frame position updates
   - ❌ Navigation happens immediately instead of after movement

2. **PlayerStore**:
   - ✅ `isMoving: boolean` flag
   - ✅ `map.pos` for current position
   - ❌ No actor movement state (targetPos, velocity, etc.)

3. **Map Class**:
   - ✅ `updatePos(pos)` method exists
   - ✅ Position is stored in `map.pos`

---

## Original Game Architecture

### Actor Movement Flow

**File**: `OriginalGame/src/ui/MapNode.js`

```javascript
// 1. When "Go" is clicked, okFunc is called:
var okFunc = function () {
    entity.setHighlight(true);
    cc.timer.accelerate(time, factor);  // Accelerate time during travel
    player.log.addMsg(1112, entity.baseSite.getName());
    self.makeLine(startPos, endPos);  // Draw path line
    self.actor.move(endPos, canAfford, function () {
        // This callback runs AFTER movement completes
        player.totalDistance += Math.round(distance);
        if (player.dogState) {
            player.dogDistance += Math.round(distance);
        }
        self.enterEntity(entity);  // Navigate to site
    });
};

// 2. Actor.move() initiates movement:
move: function (pos, canAfford, cb) {
    if (this.isMoving) return;
    this.maxVelocityThisTrip = this.getMaxVelocity(canAfford);
    this.targetPos = pos;
    this.lastCheckPos = this.getPosition();
    this.cb = cb;  // Store callback for after movement
    this.beforeMove();  // Sets isMoving = true
}

// 3. Actor.updateActor(dt) runs every frame (via timer callback):
updateActor: function (dt) {
    if (this.isMoving && !this.paused) {
        // Calculate velocity vector
        var vector = cc.pSub(this.targetPos, this.getPosition());
        this.velocity = cc.pMult(cc.pNormalize(vector), this.maxVelocityThisTrip);
        
        // Update position incrementally
        var pos = this.getPosition();
        var dtPos = cc.pMult(this.velocity, dt);
        var newPos = cc.pAdd(pos, dtPos);
        
        // Update actor position
        this.setPosition(newPos);
        player.map.updatePos(this.getPosition());  // Update map position continuously
        
        // Check if reached destination (within 10 pixels)
        if (cc.pDistanceSQ(this.targetPos, this.getPosition()) <= 10) {
            // Arrived at destination
            this.setPosition(this.targetPos);  // Snap to exact position
            player.map.updatePos(this.getPosition());
            
            // Handle fuel consumption, random events, etc.
            // ...
            
            this.isMoving = false;
            this.afterMove();  // Calls callback (navigation)
        }
    }
}

// 4. Timer callback runs updateActor every frame:
this.tcb = cc.timer.addTimerCallback(new TimerCallback(24 * 60 * 60, this, {
    process: function (dt) {
        self.updateActor(dt);  // Called every frame
    },
    end: function () {}
}, TimerManager.REPEAT_FOREVER));
```

### Key Points

1. **Frame-by-Frame Updates**: Position updates every frame using `requestAnimationFrame` or timer callback
2. **Velocity-Based Movement**: Movement speed based on calculated velocity (pixels per second)
3. **Continuous Position Updates**: `map.updatePos()` is called every frame during movement
4. **Completion Check**: Movement completes when distance to target <= 10 pixels
5. **Callback Timing**: Navigation callback only fires AFTER movement completes
6. **Time Acceleration**: Game time accelerates during travel (2x or 3x speed)
7. **Path Line**: Visual line drawn from start to end position

---

## Implementation Requirements

### 1. Add Actor Movement State to PlayerStore

**File**: `src/store/playerStore.ts`

**Add**:
- `actorTargetPos: { x: number; y: number } | null` - Target position for movement
- `actorVelocity: number` - Current movement velocity (pixels per second)
- `actorMaxVelocity: number` - Maximum velocity for current trip

**Tasks**:
- [ ] Add `actorTargetPos` to PlayerStore interface (default: null)
- [ ] Add `actorVelocity` to PlayerStore interface (default: 0)
- [ ] Add `actorMaxVelocity` to PlayerStore interface (default: 0)
- [ ] Add `setActorTargetPos(pos: { x: number; y: number } | null)` action
- [ ] Add `setActorVelocity(velocity: number)` action
- [ ] Add `setActorMaxVelocity(maxVelocity: number)` action
- [ ] Add `clearActorMovement()` action (resets all movement state)

---

### 2. Create Actor Movement Hook

**File**: `src/hooks/useActorMovement.ts` (new file)

**Purpose**: Handle frame-by-frame actor movement updates

**Structure**:
```typescript
export function useActorMovement() {
  const playerStore = usePlayerStore()
  const map = playerStore.map
  
  useEffect(() => {
    if (!playerStore.isMoving || !playerStore.actorTargetPos || !map) {
      return
    }
    
    let animationFrameId: number
    let lastTime = performance.now()
    
    const updateMovement = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000 // Convert to seconds
      lastTime = currentTime
      
      if (!playerStore.isMoving || !playerStore.actorTargetPos || !map) {
        return
      }
      
      const currentPos = map.pos
      const targetPos = playerStore.actorTargetPos
      
      // Calculate distance to target
      const distance = calculateDistance(currentPos, targetPos)
      
      if (distance <= 10) {
        // Reached destination
        map.updatePos(targetPos)
        playerStore.setIsMoving(false)
        playerStore.clearActorMovement()
        return
      }
      
      // Calculate velocity vector
      const dx = targetPos.x - currentPos.x
      const dy = targetPos.y - currentPos.y
      const normalizedDx = dx / distance
      const normalizedDy = dy / distance
      
      // Calculate new position
      const velocity = playerStore.actorMaxVelocity
      const moveX = normalizedDx * velocity * deltaTime
      const moveY = normalizedDy * velocity * deltaTime
      
      const newPos = {
        x: currentPos.x + moveX,
        y: currentPos.y + moveY
      }
      
      // Update position
      map.updatePos(newPos)
      
      // Continue animation
      animationFrameId = requestAnimationFrame(updateMovement)
    }
    
    // Start animation
    animationFrameId = requestAnimationFrame(updateMovement)
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [playerStore.isMoving, playerStore.actorTargetPos, map])
}
```

**Tasks**:
- [ ] Create `src/hooks/useActorMovement.ts`
- [ ] Implement frame-by-frame movement updates
- [ ] Handle movement completion (distance <= 10)
- [ ] Update map position continuously
- [ ] Clean up animation frame on unmount

---

### 3. Update MapPanelContent to Use Movement Hook

**File**: `src/components/panels/MapPanelContent.tsx`

**Changes**:
- Import and use `useActorMovement()` hook
- Update `okFunc` to initiate movement instead of instant update
- Store movement callback for after movement completes

**Current** (lines 137-176):
```typescript
const okFunc = () => {
  playerStore.setIsMoving(true)
  setTimeout(() => {
    // Instant update
    map.updatePos(endPos)
    // ... rest of logic
    enterSite(site)
    playerStore.setIsMoving(false)
  }, 100)
}
```

**Update to**:
```typescript
const okFunc = () => {
  // Set moving state
  playerStore.setIsMoving(true)
  
  // Calculate max velocity for this trip
  const weatherSpeedMultiplier = 0  // TODO: Get from gameStore
  const maxVelocity = getMaxVelocity(playerStore, canAfford, weatherSpeedMultiplier)
  playerStore.setActorMaxVelocity(maxVelocity)
  
  // Set target position
  playerStore.setActorTargetPos(endPos)
  
  // Store callback for after movement completes
  // (Will be called by useActorMovement hook when movement finishes)
  // For now, we'll need to handle this differently - see below
}
```

**Note**: The callback mechanism needs to be handled. Options:
1. Store callback in PlayerStore
2. Use a ref to store callback
3. Use useEffect to watch for movement completion

**Tasks**:
- [ ] Import `useActorMovement` hook
- [ ] Call `useActorMovement()` in component
- [ ] Update `okFunc` to set movement state instead of instant update
- [ ] Handle movement completion callback

---

### 4. Handle Movement Completion Callback

**Option A: Store Callback in PlayerStore**

**File**: `src/store/playerStore.ts`

**Add**:
- `actorMovementCallback: (() => void) | null` - Callback to call when movement completes

**Update useActorMovement hook**:
- Call callback when movement completes

**Option B: Use Ref to Store Callback**

**File**: `src/components/panels/MapPanelContent.tsx`

**Use useRef** to store callback, pass to hook via context or prop

**Option C: Watch for Movement Completion**

**File**: `src/components/panels/MapPanelContent.tsx`

**Use useEffect** to watch `isMoving` state, call callback when it becomes false

**Recommended**: Option A (store in PlayerStore) for simplicity

**Tasks**:
- [ ] Choose callback mechanism
- [ ] Implement callback storage
- [ ] Call callback when movement completes
- [ ] Move enterSite logic to callback

---

### 5. Update Movement Completion Logic

**File**: `src/components/panels/MapPanelContent.tsx`

**Move logic from setTimeout to movement completion callback**:

```typescript
const handleMovementComplete = () => {
  // Consume fuel if needed
  if (fuelNeed > 0 && canAfford) {
    playerStore.fuel = Math.max(0, playerStore.fuel - fuelNeed)
  }
  
  // Update total distance
  playerStore.totalDistance += Math.round(distance)
  
  // TODO: Update dog distance if dog is active
  
  // Navigate to site
  enterSite(site)
  
  // Clear moving state (already cleared by hook, but ensure it's done)
  playerStore.setIsMoving(false)
  playerStore.clearActorMovement()
}
```

**Tasks**:
- [ ] Create `handleMovementComplete` function
- [ ] Move fuel consumption to completion callback
- [ ] Move distance update to completion callback
- [ ] Move navigation to completion callback
- [ ] Remove setTimeout logic

---

### 6. Update useActorMovement to Call Completion Callback

**File**: `src/hooks/useActorMovement.ts`

**When movement completes**:
```typescript
if (distance <= 10) {
  // Reached destination
  map.updatePos(targetPos)
  playerStore.setIsMoving(false)
  
  // Call completion callback if exists
  const callback = playerStore.actorMovementCallback
  if (callback) {
    callback()
    playerStore.setActorMovementCallback(null)
  }
  
  playerStore.clearActorMovement()
  return
}
```

**Tasks**:
- [ ] Add callback call when movement completes
- [ ] Clear callback after calling

---

### 7. Add Time Acceleration (Optional for Phase 1)

**File**: `src/components/panels/MapPanelContent.tsx`

**Original**: `cc.timer.accelerate(time, factor)`

**Implementation**: Use game time acceleration system (if exists) or skip for Phase 1

**Tasks**:
- [ ] Check if game has time acceleration system
- [ ] Implement time acceleration during movement (or defer to Phase 2)

---

### 8. Add Path Line Rendering (Optional for Phase 1)

**File**: `src/components/panels/MapPanelContent.tsx`

**Original**: `self.makeLine(startPos, endPos)`

**Implementation**: Render line sprite from start to end position

**Tasks**:
- [ ] Create path line component or rendering logic
- [ ] Draw line from startPos to endPos during movement
- [ ] Remove line when movement completes (or defer to Phase 2)

---

## Implementation Steps

### Phase 1: Basic Animated Movement (Required)

1. **Add actor movement state to PlayerStore**
   - Add `actorTargetPos`, `actorVelocity`, `actorMaxVelocity`
   - Add setter actions
   - Add `clearActorMovement()` action
   - Add `actorMovementCallback` for completion

2. **Create useActorMovement hook**
   - Implement frame-by-frame updates using `requestAnimationFrame`
   - Calculate velocity vector
   - Update position incrementally
   - Check for completion (distance <= 10)
   - Call completion callback

3. **Update MapPanelContent**
   - Import and use `useActorMovement()` hook
   - Update `okFunc` to set movement state instead of instant update
   - Store completion callback
   - Move completion logic to callback

4. **Test movement**
   - Click site → Click Go → Actor should smoothly move to site
   - Movement should take calculated time
   - Navigation should happen after movement completes

**Status**: ⚠️ Needs implementation

---

### Phase 2: Enhanced Features (Optional)

1. **Time acceleration during movement**
2. **Path line rendering**
3. **Site highlighting during movement**
4. **Fuel consumption during movement** (if needed incrementally)

**Status**: ⚠️ Future enhancement

---

## File Structure Changes

### New Files
```
src/
  hooks/
    useActorMovement.ts    # Actor movement animation hook
```

### Modified Files
```
src/
  store/
    playerStore.ts         # Add actor movement state
  components/
    panels/
      MapPanelContent.tsx  # Use movement hook, update okFunc
```

---

## Cross-Check with Original Game

After implementation, verify:

- [ ] Actor moves smoothly from current position to target
- [ ] Movement speed matches calculated velocity
- [ ] Movement takes calculated time (distance / velocity)
- [ ] Position updates continuously during movement
- [ ] Movement completes when distance <= 10 pixels
- [ ] Navigation only happens AFTER movement completes
- [ ] `isMoving` flag prevents clicks during movement
- [ ] Movement can be cancelled (if needed)

---

## Notes

1. **Frame Rate**: Use `requestAnimationFrame` for smooth 60fps animation
2. **Delta Time**: Calculate deltaTime from frame timestamps for consistent speed
3. **Completion Threshold**: Use 10 pixels (matching original) for arrival detection
4. **Velocity Calculation**: Use normalized direction vector * maxVelocity * deltaTime
5. **Position Updates**: Update `map.pos` every frame, not just at completion
6. **Callback Timing**: Ensure callback only fires once when movement completes
7. **Cleanup**: Cancel animation frame on component unmount or movement cancellation

---

## Next Steps

1. **Review this plan** and approve or request modifications
2. **Switch to ACT mode** to begin implementation
3. **Start with Phase 1**: Basic animated movement
4. **Test movement** before adding Phase 2 features
5. **Phase 2** (time acceleration, path line) can be implemented later

---

## Related Documents

- `MAP_SITE_CLICK_IMPLEMENTATION_PLAN.md` - Site click functionality
- `COCOS_TO_CSS_POSITION_MAPPING.md` - Position conversion reference


