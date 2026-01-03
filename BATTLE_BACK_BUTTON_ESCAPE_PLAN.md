# Battle Back Button Disable Plan

## Goal
When the player is in battle (battle process view), the back button should be disabled, matching the original game behavior.

## Current Behavior
- During battle in site exploration, the back button in `MainScene.handleBackButton()` handles `'siteExplore'` panel
- It navigates back to site panel or map, regardless of whether battle is in progress
- There's already an escape button in the battle UI that calls `battle.player.escape()`
- The back button is currently always enabled during battle

## Original Game Behavior
- **Original Game**: Back button is disabled during battle (line 294 in `battleAndWorkNode.js`: `utils.emitter.emit("left_btn_enabled", false)`)
- **User Request**: Disable back button during battle to match original game behavior

## Implementation Plan

### 1. Add Battle State Tracking

**File**: `src/components/panels/SiteExploreContent.tsx`

**Current State**:
- `viewMode` tracks current view: `'battleBegin' | 'battleProcess' | 'battleEnd' | ...`
- `battle` state holds the battle instance
- Battle is only accessible within `SiteExploreContent` component

**Change Needed**:
- Expose battle state to parent (`MainScene`) so it can check if battle is in progress
- Options:
  1. Use `uiStore` to track battle state
  2. Pass battle state via props/callback
  3. Use emitter to communicate battle state

**Recommended**: Use `uiStore` to track if battle is in progress (similar to `isInWorkStorageView`)

### 2. Update SiteExploreContent to Track Battle State

**File**: `src/components/panels/SiteExploreContent.tsx`

**Add to UIStore**:
```typescript
// In uiStore.ts interface (line 46-106)
isInBattle: boolean

// In actions (line 96)
setInBattle: (isInBattle: boolean) => void

// In store implementation (line 115)
isInBattle: false,

// In store implementation (line 134)
setInBattle: (isInBattle: boolean) => set({ isInBattle }),
```

**Update SiteExploreContent**:
- When `viewMode === 'battleProcess'` and `battle` exists, set `isInBattle = true`
- When battle ends or viewMode changes away from `'battleProcess'`, set `isInBattle = false`
- Use `useEffect` to sync battle state with `uiStore`

### 3. Update MainScene shouldShowBackButton

**File**: `src/components/scenes/MainScene.tsx`

**Current Code** (lines 585-592):
```typescript
const shouldShowBackButton = (): boolean => {
  // Gate out panel has no buttons
  if (currentPanel === 'gateOut') return false
  // Map panel has no buttons (matches original uiConfig.leftBtn: false)
  if (currentPanel === 'map') return false
  // Show back button if not on home panel
  return currentPanel !== 'home' && currentPanel !== null
}
```

**Change to**:
```typescript
const shouldShowBackButton = (): boolean => {
  // Gate out panel has no buttons
  if (currentPanel === 'gateOut') return false
  // Map panel has no buttons (matches original uiConfig.leftBtn: false)
  if (currentPanel === 'map') return false
  
  // Disable back button during battle (matches original game behavior)
  if (currentPanel === 'siteExplore') {
    const isInBattle = uiStore.isInBattle
    if (isInBattle) {
      return false // Disable back button during battle
    }
  }
  
  // Show back button if not on home panel
  return currentPanel !== 'home' && currentPanel !== null
}
```

### 4. Alternative: Check in handleBackButton (if button can't be hidden)

**If storing battle instance is preferred**:

**If we need to keep button visible but disabled** (not recommended, but possible):
- Add `disabled` prop to `BottomBar` component
- Style disabled button with reduced opacity
- Prevent `onLeftClick` from firing when disabled

**Recommended**: Simply hide the button by returning `false` from `shouldShowBackButton()` when in battle.

## Implementation Steps

1. **Add battle state tracking to UIStore**
   - Add `isInBattle: boolean` state
   - Add `setInBattle: (isInBattle: boolean) => void` action

2. **Update SiteExploreContent to sync battle state**
   - Add `useEffect` to set `isInBattle = true` when `viewMode === 'battleProcess'` and `battle` exists
   - Add `useEffect` to set `isInBattle = false` when battle ends or viewMode changes away from `'battleProcess'`

3. **Update MainScene shouldShowBackButton**
   - Check `uiStore.isInBattle` when `currentPanel === 'siteExplore'`
   - Return `false` if in battle, otherwise return `true`

4. **Test**
   - Start a battle in site exploration
   - Verify back button is hidden/disabled during battle process
   - Verify back button appears again after battle ends
   - Verify back button works normally when not in battle

## Edge Cases

1. **Battle state sync timing**: If battle ends while state is being updated, button should re-enable
   - Handled by checking `viewMode === 'battleProcess'` and `battle` exists in `useEffect`

2. **Battle state not cleared**: If component unmounts during battle, state should be cleared
   - Add cleanup in `useEffect` return function to set `isInBattle = false`

3. **Battle in other contexts**: This plan only handles battles in site exploration. If battles are shown in other panels, they need separate handling.

4. **Button visibility during battle begin/end**: Back button should be enabled during `battleBegin` and `battleEnd` views, only disabled during `battleProcess`

## Files to Modify

1. `src/store/uiStore.ts` - Add battle state tracking
2. `src/components/panels/SiteExploreContent.tsx` - Sync battle state and handle escape request
3. `src/components/scenes/MainScene.tsx` - Check battle state in back button handler

## Testing Checklist

- [ ] Start battle in site exploration
- [ ] Verify back button is hidden/disabled during battle process view
- [ ] Verify back button is visible during battle begin view
- [ ] Verify back button is visible during battle end view
- [ ] Verify back button appears again after battle ends
- [ ] Verify back button works normally when not in battle
- [ ] Test component unmount during battle (state should be cleared)
- [ ] Test rapid view mode changes (state should sync correctly)

## Notes

- The original game disables the back button during battle (matches this implementation)
- The escape button in the battle UI will still work as before
- This prevents accidental navigation away during active combat
- Battle state is tracked in `uiStore` similar to `isInWorkStorageView`

