# Site Back Button Navigation Plan

## Goal
When the player is at a site (SitePanelContent), the back button should navigate back to the map panel instead of the home panel.

## Current Behavior
- In `MainScene.tsx`, `handleBackButton()` navigates most panels back to 'home'
- Site panel currently navigates back to home when back button is clicked

## Original Game Behavior
- When at a site, back button should return to map (not home)
- This makes sense because players navigate: Home → Map → Site
- So going back from Site should go: Site → Map → Home

## Implementation Plan

### 1. Update MainScene handleBackButton

**File**: `src/components/scenes/MainScene.tsx`

**Current Code** (lines 96-120):
```typescript
const handleBackButton = () => {
  if (currentPanel === 'home') {
    // On home panel, back button should show exit dialog
    console.log('Exit to menu - dialog to be implemented')
  } else if (currentPanel === 'gate') {
    // When leaving Gate panel, transfer all items from bag to storage
    const playerStore = usePlayerStore.getState()
    const bagItems = { ...playerStore.bag }
    
    // Transfer all items from bag to storage
    Object.entries(bagItems).forEach(([itemId, count]) => {
      if (count > 0) {
        playerStore.addItemToStorage(itemId, count)
        playerStore.removeItemFromBag(itemId, count)
      }
    })
    
    // Navigate back to home
    uiStore.openPanelAction('home')
  } else {
    // Navigate back to home (matches Navigation.back() behavior)
    uiStore.openPanelAction('home')
  }
}
```

**Change to**:
```typescript
const handleBackButton = () => {
  if (currentPanel === 'home') {
    // On home panel, back button should show exit dialog
    console.log('Exit to menu - dialog to be implemented')
  } else if (currentPanel === 'gate') {
    // When leaving Gate panel, transfer all items from bag to storage
    const playerStore = usePlayerStore.getState()
    const bagItems = { ...playerStore.bag }
    
    // Transfer all items from bag to storage
    Object.entries(bagItems).forEach(([itemId, count]) => {
      if (count > 0) {
        playerStore.addItemToStorage(itemId, count)
        playerStore.removeItemFromBag(itemId, count)
      }
    })
    
    // Navigate back to home
    uiStore.openPanelAction('home')
  } else if (currentPanel === 'site') {
    // When at a site, navigate back to map (not home)
    // This matches the navigation flow: Home → Map → Site → (back) → Map
    uiStore.openPanelAction('map')
  } else {
    // Navigate back to home (matches Navigation.back() behavior)
    uiStore.openPanelAction('home')
  }
}
```

### 2. Verify Navigation Flow

**Expected Navigation Flow**:
1. Home → Map (via Gate Out)
2. Map → Site (via clicking site)
3. Site → Map (via back button) ✅ NEW
4. Map → Home (via back button - if implemented, or via other means)

**Tasks**:
- [ ] Update `handleBackButton()` in MainScene.tsx to check for 'site' panel
- [ ] Navigate to 'map' when back button is clicked on site panel
- [ ] Test navigation flow: Home → Map → Site → (back) → Map
- [ ] Verify other panels still navigate correctly (back to home)

## Notes
- This change only affects the site panel's back button behavior
- Other panels (build, storage, radio, etc.) will continue to navigate back to home
- The map panel itself may or may not have a back button (check original game behavior)



