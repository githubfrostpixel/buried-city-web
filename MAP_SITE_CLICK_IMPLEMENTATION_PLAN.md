# Map Site Click Implementation Plan

## Overview

This plan covers implementing the site click functionality in MapPanelContent, matching the original game's behavior where clicking a site shows a dialog with travel information (time, fuel cost) and allows the player to confirm travel to that site.

**Status**: PLAN Mode - No code changes will be made

**Original Game Reference**: `OriginalGame/src/ui/MapNode.js`
- `onEntityClick()`: Handles site click, calculates distance/fuel/time, shows dialog
- `uiUtil.showSiteDialog()` / `uiUtil.showHomeDialog()`: Shows travel confirmation dialog
- `enterEntity()`: Navigates to site panel after travel completes
- `Actor.move()`: Animates player movement on map

**Current Implementation**: MapPanelContent has stub `handleSiteClick()` that only handles HOME_SITE navigation

**Target Implementation**: Full site click flow with dialog, travel calculation, and navigation

---

## Current State Analysis

### What Exists

1. **MapPanelContent Component** (`src/components/panels/MapPanelContent.tsx`):
   - ✅ Map rendering with sites and player actor
   - ✅ Site click handler (stub)
   - ❌ No travel calculation (distance, fuel, time)
   - ❌ No site/home dialog
   - ❌ No actor movement animation
   - ❌ No path line rendering

2. **SitePanelContent Component** (`src/components/panels/SitePanelContent.tsx`):
   - ✅ Exists and ready to use
   - ✅ Takes `site` prop
   - ✅ Handles site exploration UI

3. **PlayerStore**:
   - ✅ Has `map` with `pos` (current position)
   - ✅ Has `fuel` property
   - ✅ Has `totalDistance` property
   - ✅ Has `bag` and `storage` for item checking
   - ❌ No `useMoto` flag
   - ❌ No actor movement state

4. **Dialog System**:
   - ✅ Overlay system exists (`uiStore.showOverlay()`)
   - ✅ ItemDialog, BuildDialog, RecipeDialog examples
   - ❌ No SiteDialog or HomeDialog component

---

## Original Game Architecture

### Site Click Flow

**File**: `OriginalGame/src/ui/MapNode.js`

```javascript
onEntityClick: function (entity) {
    // 1. Check if actor is moving (prevent clicks during movement)
    if (this.actor.isMoving) return;
    
    // 2. Calculate distance from actor to site
    var startPos = this.actor.getPosition();
    var endPos = entity.baseSite.pos;
    var distance = cc.pDistance(startPos, endPos);
    
    // 3. Calculate fuel needed
    var fuelNeed = Math.ceil(distance / 80);
    var canAfford = false;
    if (player.fuel >= fuelNeed) {
        canAfford = true;
    }
    
    // 4. Calculate travel time
    var time = distance / this.actor.getMaxVelocity(canAfford);
    
    // 5. Check motorcycle availability
    if ((!player.storage.validateItem(1305034, 1) && !player.bag.validateItem(1305034, 1)) || !player.useMoto) {
        fuelNeed = -1;  // No fuel needed if no motorcycle
    }
    
    // 6. Create OK callback (starts travel)
    var okFunc = function () {
        entity.setHighlight(true);
        cc.timer.accelerate(time, player.storage.validateItem(1306001, 1) ? 2 : 3);
        player.log.addMsg(1112, entity.baseSite.getName());
        self.makeLine(startPos, endPos);
        self.actor.move(endPos, canAfford, function () {
            player.totalDistance += Math.round(distance);
            if (player.dogState) {
                player.dogDistance += Math.round(distance);
            }
            self.enterEntity(entity);
        });
    };
    
    // 7. Create cancel callback
    var cancelFunc = function () {
        entity.setHighlight(false);
    };
    
    // 8. Show appropriate dialog
    if (entity.baseSite instanceof Site) {
        if (entity.baseSite.id == HOME_SITE) {
            uiUtil.showHomeDialog(entity, time, fuelNeed, canAfford, okFunc, cancelFunc);
        } else {
            uiUtil.showSiteDialog(entity, time, fuelNeed, canAfford, okFunc, cancelFunc);
        }
    } else {
        uiUtil.showNpcInMapDialog(entity, time, fuelNeed, canAfford, okFunc, cancelFunc);
    }
}
```

### Dialog Structure

**File**: `OriginalGame/src/ui/uiUtil.js`

**showSiteDialog**:
- Shows site icon, name, progress, item count
- Shows site description image (`site_dig_{id}.png`)
- Shows site description text
- Shows travel time (formatted: "X hours Y minutes")
- Shows fuel cost (if fuelNeed > 0, red if can't afford)
- Has transport toggle (motorcycle on/off)
- Has Cancel and Go buttons

**showHomeDialog**:
- Similar to showSiteDialog but:
  - No progress text (txt_1 is null)
  - No item count text (txt_2 is null)

### Actor Movement

**File**: `OriginalGame/src/ui/MapNode.js`

```javascript
var Actor = cc.Node.extend({
    getMaxVelocity: function (canAfford) {
        var v = this.MAX_VELOCITY;  // Base: 97 / (60 * 60) * 0.88
        // Motorcycle boost (if has item 1305034 and fuel and useMoto)
        if ((player.storage.validateItem(1305034, 1) || player.bag.validateItem(1305034, 1)) && canAfford && player.useMoto) {
            v += this.MAX_VELOCITY_ENHANCE_MOTO;  // * 2
            this.isUsingMoto = true;
        }
        // Boots boost (item 1306001)
        if (player.storage.validateItem(1306001, 1) || player.bag.validateItem(1306001, 1)) {
            v += this.MAX_VELOCITY_ENHANCE;  // * 0.5
        }
        // Weather effect
        v += this.MAX_VELOCITY * player.weather.getValue("speed");
        return v;
    },
    move: function (pos, canAfford, cb) {
        // Sets isMoving = true, animates to position, calls cb on arrival
    }
});
```

### Navigation After Travel

**File**: `OriginalGame/src/ui/MapNode.js`

```javascript
enterEntity: function (entity) {
    // Remove path line
    if (this.pathLine) {
        this.pathLine.removeFromParent();
    }
    
    // Determine panel to navigate to
    var nodeName;
    if (baseSite instanceof Site) {
        if (baseSite.id == HOME_SITE) {
            nodeName = Navigation.nodeName.HOME_NODE;
            player.log.addMsg(1111);
            player.trySteal();
        } else {
            if (baseSite.id == AD_SITE) {
                nodeName = Navigation.nodeName.AD_SITE_NODE;
            } else if (baseSite.id == BOSS_SITE) {
                nodeName = Navigation.nodeName.BOSS_SITE_NODE;
            } else if (baseSite.id == WORK_SITE || baseSite.id == GAS_SITE) {
                nodeName = Navigation.nodeName.WORK_SITE_NODE;
            } else if (baseSite.id == BAZAAR_SITE) {
                nodeName = Navigation.nodeName.BAZAAR_SITE_NODE;
            } else {
                nodeName = Navigation.nodeName.SITE_NODE;
            }
            player.log.addMsg(1116, entity.baseSite.getName());
        }
    } else {
        nodeName = Navigation.nodeName.NPC_NODE;
        player.log.addMsg(1116, entity.baseSite.getName());
    }
    
    mapNode.forward(nodeName, baseSite.id);
    Record.saveAll();
}
```

---

## Implementation Requirements

### 1. Add PlayerStore Properties

**File**: `src/store/playerStore.ts`

**Add**:
- `useMoto: boolean` - Whether player wants to use motorcycle
- `isMoving: boolean` - Whether actor is currently moving (prevents clicks)

**Tasks**:
- [ ] Add `useMoto` to PlayerStore interface (default: false)
- [ ] Add `isMoving` to PlayerStore interface (default: false)
- [ ] Add `setUseMoto(use: boolean)` action
- [ ] Add `setIsMoving(moving: boolean)` action

---

### 2. Create Distance Calculation Utility

**File**: `src/utils/distance.ts` (new file)

**Function**: Calculate Euclidean distance between two points

```typescript
export function calculateDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
  const dx = pos2.x - pos1.x
  const dy = pos2.y - pos1.y
  return Math.sqrt(dx * dx + dy * dy)
}
```

**Tasks**:
- [ ] Create `src/utils/distance.ts`
- [ ] Implement `calculateDistance()` function
- [ ] Export function

---

### 3. Create Actor Velocity Calculation

**File**: `src/utils/actor.ts` (new file)

**Constants** (from original):
- `MAX_VELOCITY = 97 / (60 * 60) * 0.88` (base speed)
- `MAX_VELOCITY_ENHANCE = MAX_VELOCITY * 0.5` (boots boost)
- `MAX_VELOCITY_ENHANCE_MOTO = MAX_VELOCITY * 2` (motorcycle boost)

**Function**:
```typescript
export function getMaxVelocity(
  playerStore: PlayerStore,
  canAfford: boolean,
  weatherSpeedMultiplier: number = 0
): number {
  let v = MAX_VELOCITY
  
  // Check motorcycle (item 1305034)
  const hasMotorcycle = playerStore.getStorageItemCount('1305034') > 0 || 
                        playerStore.getBagItemCount('1305034') > 0
  
  if (hasMotorcycle && canAfford && playerStore.useMoto) {
    v += MAX_VELOCITY_ENHANCE_MOTO
  }
  
  // Check boots (item 1306001)
  const hasBoots = playerStore.getStorageItemCount('1306001') > 0 || 
                   playerStore.getBagItemCount('1306001') > 0
  if (hasBoots) {
    v += MAX_VELOCITY_ENHANCE
  }
  
  // Weather effect
  v += MAX_VELOCITY * weatherSpeedMultiplier
  
  return v
}
```

**Tasks**:
- [ ] Create `src/utils/actor.ts`
- [ ] Define velocity constants
- [ ] Implement `getMaxVelocity()` function
- [ ] Export function

---

### 4. Create Time Formatting Utility

**File**: `src/utils/time.ts` (or add to existing)

**Function** (from `OriginalGame/src/util/utils.js`):
```typescript
export function getTimeDistanceStr(time: number): string {
  // time is in seconds
  let timeStr = ""
  const hour = Math.floor(time / 60 / 60)
  if (hour) {
    timeStr += hour + " hour" + (hour > 1 ? "s" : "")  // TODO: Use string ID 1151
  }
  const minute = hour ? Math.floor(time / 60 % 60) : Math.floor(time / 60)
  timeStr += minute + " minute" + (minute > 1 ? "s" : "")  // TODO: Use string ID 1152
  return timeStr
}
```

**Tasks**:
- [ ] Create or update `src/utils/time.ts`
- [ ] Implement `getTimeDistanceStr()` function
- [ ] Export function

---

### 5. Create SiteDialog Component

**File**: `src/components/overlays/SiteDialog.tsx` (new file)

**Structure**:
- Dialog overlay (similar to BuildDialog, ItemDialog)
- Title section: Site icon, name, progress (txt_1), item count (txt_2)
- Content section: Site description image, description text, travel info
- Action section: Cancel button, Go button
- Transport toggle: Motorcycle on/off (if player has motorcycle)

**Props**:
```typescript
interface SiteDialogData {
  site: Site
  time: number  // Travel time in seconds
  fuelNeed: number  // Fuel needed (-1 if no motorcycle)
  canAfford: boolean  // Whether player can afford fuel
  onConfirm: () => void
  onCancel: () => void
  isHome: boolean  // Whether this is home site
}
```

**Tasks**:
- [ ] Create `src/components/overlays/SiteDialog.tsx`
- [ ] Implement dialog structure matching original
- [ ] Add site icon, name, progress, item count
- [ ] Add site description image (`site_dig_{id}.png`)
- [ ] Add site description text
- [ ] Add travel time display (formatted)
- [ ] Add fuel cost display (red if can't afford)
- [ ] Add transport toggle (motorcycle on/off)
- [ ] Add Cancel and Go buttons
- [ ] Handle ESC key to close

---

### 6. Update UIStore for SiteDialog

**File**: `src/store/uiStore.ts`

**Add**:
- `'siteDialog'` to `Overlay` type
- Update `showOverlay()` to handle siteDialog

**Tasks**:
- [ ] Add `'siteDialog'` to Overlay type union
- [ ] Verify overlay system handles siteDialog

---

### 7. Update App.tsx to Render SiteDialog

**File**: `src/App.tsx`

**Add**:
- Import SiteDialog
- Render SiteDialog when `activeOverlay === 'siteDialog'`

**Tasks**:
- [ ] Import SiteDialog component
- [ ] Add SiteDialog rendering in overlay section

---

### 8. Implement Site Click Handler

**File**: `src/components/panels/MapPanelContent.tsx`

**Update `handleSiteClick()`**:

```typescript
const handleSiteClick = (site: Site) => {
  // 1. Check if moving (prevent clicks during movement)
  if (playerStore.isMoving) return
  
  // 2. Get current position
  if (!map || !map.pos) return
  const startPos = map.pos
  const endPos = site.pos
  
  // 3. Calculate distance
  const distance = calculateDistance(startPos, endPos)
  
  // 4. Calculate fuel needed
  let fuelNeed = Math.ceil(distance / 80)
  let canAfford = false
  if (playerStore.fuel >= fuelNeed) {
    canAfford = true
  }
  
  // 5. Check motorcycle availability
  const hasMotorcycle = playerStore.getStorageItemCount('1305034') > 0 || 
                        playerStore.getBagItemCount('1305034') > 0
  if (!hasMotorcycle || !playerStore.useMoto) {
    fuelNeed = -1  // No fuel needed
  }
  
  // 6. Calculate travel time
  // TODO: Get weather speed multiplier from gameStore
  const weatherSpeedMultiplier = 0  // Stub for now
  const maxVelocity = getMaxVelocity(playerStore, canAfford, weatherSpeedMultiplier)
  const time = distance / maxVelocity
  
  // 7. Create OK callback
  const okFunc = () => {
    // Set moving state
    playerStore.setIsMoving(true)
    
    // Highlight site (TODO: Implement site highlighting)
    
    // Accelerate time (TODO: Implement time acceleration)
    // const hasBoots = playerStore.getStorageItemCount('1306001') > 0 || 
    //                  playerStore.getBagItemCount('1306001') > 0
    // const accelerationFactor = hasBoots ? 2 : 3
    // game.accelerateTime(time, accelerationFactor)
    
    // Draw path line (TODO: Implement path line)
    // makeLine(startPos, endPos)
    
    // Move actor (simplified: immediate for now, animation later)
    // TODO: Implement actor movement animation
    setTimeout(() => {
      // Update map position
      if (map) {
        map.updatePos(endPos)
      }
      
      // Update total distance
      playerStore.totalDistance += Math.round(distance)
      
      // TODO: Update dog distance if dog is active
      
      // Navigate to site
      enterSite(site)
      
      // Clear moving state
      playerStore.setIsMoving(false)
    }, 100)  // Small delay for now (will be replaced with animation)
  }
  
  // 8. Create cancel callback
  const cancelFunc = () => {
    // Unhighlight site (TODO: Implement site highlighting)
  }
  
  // 9. Show dialog
  const isHome = site.id === HOME_SITE
  uiStore.showOverlay('siteDialog', {
    site,
    time,
    fuelNeed,
    canAfford,
    onConfirm: okFunc,
    onCancel: cancelFunc,
    isHome
  })
}
```

**Add `enterSite()` function**:

```typescript
const enterSite = (site: Site) => {
  // Remove path line (TODO: Implement path line removal)
  
  // Determine panel to navigate to
  let panel: Panel | null = null
  let siteId: number | null = null
  
  if (site.id === HOME_SITE) {
    panel = 'home'
    // TODO: Add log message 1111
    // TODO: Call player.trySteal()
  } else if (site.id === AD_SITE) {
    panel = 'site'  // TODO: Create AD_SITE panel
    siteId = site.id
  } else if (site.id === BOSS_SITE) {
    panel = 'site'  // TODO: Create BOSS_SITE panel
    siteId = site.id
  } else if (site.id === WORK_SITE || site.id === GAS_SITE) {
    panel = 'site'  // TODO: Create WORK_SITE panel
    siteId = site.id
  } else if (site.id === BAZAAR_SITE) {
    panel = 'bazaar'
    siteId = site.id
  } else {
    panel = 'site'
    siteId = site.id
  }
  
  // TODO: Add log message 1116 with site name
  
  // Set location
  playerStore.setLocation({
    isAtHome: site.id === HOME_SITE,
    isAtBazaar: site.id === BAZAAR_SITE,
    isAtSite: panel === 'site',
    siteId: site.id
  })
  
  // Navigate to panel
  uiStore.setScene('main')
  if (panel === 'site' && siteId) {
    // TODO: Pass siteId to site panel
    uiStore.openPanelAction('site')
  } else {
    uiStore.openPanelAction(panel)
  }
  
  // TODO: Save game (Record.saveAll())
}
```

**Tasks**:
- [ ] Import distance calculation utility
- [ ] Import actor velocity utility
- [ ] Import time formatting utility
- [ ] Update `handleSiteClick()` with full logic
- [ ] Add `enterSite()` function
- [ ] Add site highlighting state (optional for Phase 1)
- [ ] Add path line rendering (optional for Phase 1)
- [ ] Add actor movement animation (optional for Phase 1)

---

### 9. Update SitePanelContent to Accept Site

**File**: `src/components/panels/SitePanelContent.tsx`

**Current**: Takes `site` prop (already correct)

**Verify**:
- [ ] SitePanelContent correctly uses `site` prop
- [ ] SitePanelContent can be opened from MainScene with site data

**Update MainScene**:
- [ ] Add case for `'site'` panel in `renderPanel()`
- [ ] Pass site data to SitePanelContent (may need to store in uiStore)

---

### 10. Fuel Consumption

**File**: `src/components/panels/MapPanelContent.tsx`

**In `okFunc()` callback**:
- Consume fuel if `fuelNeed > 0` and `canAfford`
- Update `playerStore.fuel`

**Tasks**:
- [ ] Add fuel consumption in travel callback
- [ ] Update playerStore.fuel when travel completes

---

## Implementation Steps

### Phase 1: Basic Site Click with Dialog (Minimal)

1. **Add PlayerStore properties** (useMoto, isMoving)
2. **Create distance calculation utility**
3. **Create actor velocity calculation utility**
4. **Create time formatting utility**
5. **Create SiteDialog component** (basic structure)
6. **Update UIStore** (add siteDialog overlay)
7. **Update App.tsx** (render SiteDialog)
8. **Update MapPanelContent** (implement handleSiteClick with dialog)
9. **Update MainScene** (handle site panel navigation)
10. **Test**: Click site → Dialog appears → Click Go → Navigate to site

**Status**: ⚠️ Needs implementation

---

### Phase 2: Travel Animation (Optional)

1. **Implement actor movement animation**
2. **Implement path line rendering**
3. **Implement site highlighting**
4. **Implement time acceleration**

**Status**: ⚠️ Future enhancement

---

## File Structure Changes

### New Files
```
src/
  utils/
    distance.ts          # Distance calculation
    actor.ts             # Actor velocity calculation
  components/
    overlays/
      SiteDialog.tsx     # Site travel dialog
```

### Modified Files
```
src/
  store/
    playerStore.ts       # Add useMoto, isMoving
    uiStore.ts           # Add siteDialog overlay
  components/
    panels/
      MapPanelContent.tsx  # Implement site click handler
    scenes/
      MainScene.tsx      # Handle site panel navigation
  App.tsx                # Render SiteDialog
```

---

## Cross-Check with Original Game

After implementation, verify:

- [ ] Site click shows dialog with correct information
- [ ] Dialog shows site icon, name, progress, item count
- [ ] Dialog shows travel time (formatted correctly)
- [ ] Dialog shows fuel cost (red if can't afford)
- [ ] Dialog has transport toggle (if motorcycle available)
- [ ] Dialog Cancel button closes dialog
- [ ] Dialog Go button starts travel
- [ ] Travel updates map position
- [ ] Travel updates total distance
- [ ] Travel navigates to correct panel
- [ ] Fuel is consumed during travel
- [ ] Player cannot click sites while moving

---

## Notes

1. **Actor Movement**: For Phase 1, we can simplify actor movement to be immediate (no animation). Full animation can be added in Phase 2.

2. **Path Line**: Path line rendering can be deferred to Phase 2. It's visual polish, not critical for functionality.

3. **Time Acceleration**: Time acceleration during travel can be deferred. The game loop will handle time progression.

4. **Site Highlighting**: Site highlighting on click can be deferred to Phase 2.

5. **Weather Speed**: Weather speed multiplier needs to be retrieved from gameStore. For Phase 1, can use 0 as stub.

6. **Log Messages**: Log messages (1111, 1112, 1116) can be added later when log system is fully integrated.

7. **NPC Sites**: NPC dialog (`showNpcInMapDialog`) is out of scope for this plan. Focus on Site and Home sites only.

8. **Motorcycle Toggle**: The transport toggle in dialog allows player to enable/disable motorcycle use. This updates `playerStore.useMoto`.

9. **Site Panel Data**: SitePanelContent needs to receive site data. May need to store current site in uiStore or pass via overlayData.

---

## Next Steps

1. **Review this plan** and approve or request modifications
2. **Switch to ACT mode** to begin implementation
3. **Start with Phase 1**: Basic site click with dialog
4. **Test each step** before moving to the next
5. **Phase 2** (animation) can be implemented later

---

## Related Documents

- `MAP_SCENE_TO_PANEL_PLAN.md` - Map panel conversion
- `PHASE_3_2_SITE_SYSTEM_PREPARATION_PLAN.md` - Site system details
- `COCOS_TO_CSS_POSITION_MAPPING.md` - Position conversion reference

