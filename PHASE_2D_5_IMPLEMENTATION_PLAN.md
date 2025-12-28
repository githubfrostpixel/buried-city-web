# Phase 2D.5: Scene Integration - Implementation Plan

## Overview

This document provides a detailed implementation plan for Phase 2D.5: Scene Integration. This phase focuses on creating the MainScene component that integrates TopBar and BottomBar, and implements panel routing based on the UI store state.

**Critical Requirements:**
- **1:1 Porting** - Match original game's MainScene structure exactly
- Integrate TopBar and BottomBar components (already created in Phase 2D.3)
- Implement panel routing based on `uiStore.openPanel` state
- Handle panel navigation (back/forward buttons)
- Integrate with App.tsx scene routing
- Support all panel types defined in uiStore

**Prerequisites:**
- Phase 2D.1 complete (Position utilities) ✓
- Phase 2D.2 complete (Common components) ✓
- Phase 2D.3 complete (Layout components - TopBar, BottomBar) ✓
- Phase 2D.4 complete (HomePanel) ✓
- uiStore with panel management ✓

---

## 1. MainScene Component

### 1.1 Requirements Analysis

From `OriginalGame/src/ui/MainScene.js`:

**Original Structure:**
```javascript
var MainLayer = cc.Layer.extend({
    ctor: function () {
        this.topFrame = new TopFrameNode();
        this.addChild(this.topFrame, 1);
        
        this.bottomFrame = Navigation.current();
        this.addChild(this.bottomFrame, 0);
    }
});

var MainScene = BaseScene.extend({
    ctor: function () {
        // Load sprite atlases
        // Create MainLayer
    }
});
```

**Key Points:**
- TopFrame (TopBar) is always visible at z-index 1
- BottomFrame (BottomBar) contains the current panel from Navigation
- Navigation.current() returns the current panel node
- Navigation uses a stack-based system (forward/back navigation)
- MainScene loads all required sprite atlases

**Current React Implementation:**
- TestUIHome.tsx shows a working example but is test-only
- Need to create proper MainScene.tsx that:
  - Uses uiStore for scene/panel state
  - Routes panels based on `uiStore.openPanel`
  - Handles back button navigation
  - Integrates with App.tsx scene routing

### 1.2 Implementation Plan

**File**: `src/components/scenes/MainScene.tsx`

**Component Structure:**

```typescript
import { useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { BottomBar } from '@/components/layout/BottomBar'
import { HomePanel } from '@/components/panels/HomePanel'
import { useUIStore } from '@/store/uiStore'
import { audioManager, MusicPaths } from '@/game/systems/AudioManager'

// Panel components (to be created in future phases)
// import { BuildPanel } from '@/components/panels/BuildPanel'
// import { StoragePanel } from '@/components/panels/StoragePanel'
// import { CraftingPanel } from '@/components/panels/CraftingPanel'
// import { EquipmentPanel } from '@/components/panels/EquipmentPanel'
// import { NPCPanel } from '@/components/panels/NPCPanel'
// import { SitePanel } from '@/components/panels/SitePanel'
// import { BazaarPanel } from '@/components/panels/BazaarPanel'
// import { DogPanel } from '@/components/panels/DogPanel'
// import { RadioPanel } from '@/components/panels/RadioPanel'

export function MainScene() {
  const uiStore = useUIStore()
  const currentPanel = uiStore.openPanel
  
  // Screen dimensions (640x1136 from original game)
  const screenWidth = 640
  const screenHeight = 1136
  
  // Play home music when entering main scene
  useEffect(() => {
    audioManager.playMusic(MusicPaths.HOME, true)
    
    // Initialize to home panel if no panel is open
    if (!currentPanel) {
      uiStore.openPanelAction('home')
    }
    
    return () => {
      // Stop music when leaving main scene
      audioManager.stopMusic()
    }
  }, [])
  
  // Handle back button navigation
  const handleBackButton = () => {
    if (currentPanel === 'home') {
      // Show exit dialog (to be implemented)
      console.log('Exit to menu')
      // uiStore.showDialog({ ... })
    } else {
      // Navigate back to home
      uiStore.openPanelAction('home')
    }
  }
  
  // Handle forward button (if needed)
  const handleForwardButton = () => {
    // Forward navigation depends on context
    // For now, do nothing or close panel
    uiStore.closePanel()
  }
  
  // Get panel title based on current panel
  const getPanelTitle = (): string => {
    switch (currentPanel) {
      case 'home': return 'Home'
      case 'build': return 'Building'
      case 'storage': return 'Storage'
      case 'crafting': return 'Crafting'
      case 'equipment': return 'Equipment'
      case 'npc': return 'NPC'
      case 'site': return 'Site'
      case 'bazaar': return 'Bazaar'
      case 'dog': return 'Dog'
      case 'radio': return 'Radio'
      default: return ''
    }
  }
  
  // Determine if back button should be shown
  const shouldShowBackButton = (): boolean => {
    // Show back button if not on home panel
    return currentPanel !== 'home' && currentPanel !== null
  }
  
  // Determine if forward button should be shown
  const shouldShowForwardButton = (): boolean => {
    // Most panels don't need forward button
    // Some panels like map might need it
    return false
  }
  
  // Render current panel
  const renderPanel = () => {
    switch (currentPanel) {
      case 'home':
        return <HomePanel />
      
      // Future panels (to be implemented)
      case 'build':
        // return <BuildPanel />
        return <div>Build Panel - Coming soon</div>
      
      case 'storage':
        // return <StoragePanel />
        return <div>Storage Panel - Coming soon</div>
      
      case 'crafting':
        // return <CraftingPanel />
        return <div>Crafting Panel - Coming soon</div>
      
      case 'equipment':
        // return <EquipmentPanel />
        return <div>Equipment Panel - Coming soon</div>
      
      case 'npc':
        // return <NPCPanel />
        return <div>NPC Panel - Coming soon</div>
      
      case 'site':
        // return <SitePanel />
        return <div>Site Panel - Coming soon</div>
      
      case 'bazaar':
        // return <BazaarPanel />
        return <div>Bazaar Panel - Coming soon</div>
      
      case 'dog':
        // return <DogPanel />
        return <div>Dog Panel - Coming soon</div>
      
      case 'radio':
        // return <RadioPanel />
        return <div>Radio Panel - Coming soon</div>
      
      default:
        return <HomePanel />
    }
  }
  
  return (
    <div
      className="relative"
      style={{
        width: `${screenWidth}px`,
        height: `${screenHeight}px`,
        margin: '0 auto',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        backgroundColor: '#000000' // Black background like original game
      }}
    >
      {/* Top Bar - Always visible */}
      <TopBar />
      
      {/* Bottom Bar with current panel */}
      <BottomBar
        title={getPanelTitle()}
        leftBtn={shouldShowBackButton()}
        rightBtn={shouldShowForwardButton()}
        onLeftClick={handleBackButton}
        onRightClick={handleForwardButton}
        fullScreen={currentPanel === 'home'} // Home panel uses fullScreen mode
      >
        {renderPanel()}
      </BottomBar>
    </div>
  )
}
```

**Implementation Steps:**

1. Create `src/components/scenes/MainScene.tsx`
2. Import TopBar and BottomBar components
3. Import HomePanel component
4. Import useUIStore hook
5. Implement screen dimensions container
6. Implement panel routing logic based on `uiStore.openPanel`
7. Implement back/forward button handlers
8. Implement panel title logic
9. Add audio management (play home music on enter)
10. Add useEffect to initialize to home panel if none open
11. Test panel switching
12. Test back button navigation
13. Test responsive layout

**Dependencies:**
- `components/layout/TopBar.tsx` - Already exists ✓
- `components/layout/BottomBar.tsx` - Already exists ✓
- `components/panels/HomePanel.tsx` - Already exists ✓
- `store/uiStore.ts` - Already exists ✓
- `game/systems/AudioManager.ts` - Already exists ✓

---

## 2. App.tsx Integration

### 2.1 Requirements Analysis

**Current State:**
- App.tsx has hardcoded scene selection (TestUIHome)
- Need to route based on `uiStore.currentScene`

**Required Changes:**
- Use `uiStore.currentScene` to determine which scene to render
- Add MainScene to scene routing
- Remove test scene toggle

### 2.2 Implementation Plan

**File**: `src/App.tsx`

**Updated Structure:**

```typescript
import { useUIStore } from './store/uiStore'
import { MenuScene } from './components/scenes/MenuScene'
import { MainScene } from './components/scenes/MainScene'
// Future scenes:
// import { SaveFileScene } from './components/scenes/SaveFileScene'
// import { ChooseScene } from './components/scenes/ChooseScene'
// import { StoryScene } from './components/scenes/StoryScene'
// import { BattleScene } from './components/scenes/BattleScene'
// import { MapScene } from './components/scenes/MapScene'
// import { EndScene } from './components/scenes/EndScene'

function App() {
  const uiStore = useUIStore()
  const currentScene = uiStore.currentScene
  
  return (
    <div className="game-container w-full h-full text-white" style={{ backgroundColor: '#000000' }}>
      {currentScene === 'menu' && <MenuScene />}
      {currentScene === 'main' && <MainScene />}
      {/* Future scenes */}
      {/* {currentScene === 'saveFile' && <SaveFileScene />} */}
      {/* {currentScene === 'choose' && <ChooseScene />} */}
      {/* {currentScene === 'story' && <StoryScene />} */}
      {/* {currentScene === 'battle' && <BattleScene />} */}
      {/* {currentScene === 'map' && <MapScene />} */}
      {/* {currentScene === 'end' && <EndScene />} */}
    </div>
  )
}

export default App
```

**Implementation Steps:**

1. Update `src/App.tsx`
2. Import useUIStore hook
3. Import MainScene component
4. Remove test scene toggle code
5. Add scene routing based on `uiStore.currentScene`
6. Test scene switching from menu to main
7. Test scene switching from main to menu

---

## 3. Panel Navigation System

### 3.1 Requirements Analysis

**Original Game Navigation:**
- Uses Navigation.forward() to push new panels
- Uses Navigation.back() to pop panels
- Navigation.current() returns current panel
- Stack-based navigation system

**Current React Implementation:**
- uiStore has `openPanelAction()` and `closePanel()`
- Simple state-based navigation (not stack-based)
- For Phase 2D.5, simple navigation is sufficient
- Stack-based navigation can be added later if needed

### 3.2 Panel Navigation Flow

**Home Panel → Other Panels:**
1. User clicks building/button in HomePanel
2. HomePanel calls `uiStore.openPanelAction('build')` (or other panel)
3. MainScene detects `uiStore.openPanel` change
4. MainScene renders appropriate panel in BottomBar
5. BottomBar shows back button
6. User clicks back button
7. MainScene calls `uiStore.openPanelAction('home')`
8. HomePanel is rendered again

**Implementation:**
- Already implemented in HomePanel.tsx (lines 98-123)
- MainScene just needs to route based on state
- No additional navigation system needed for Phase 2D.5

---

## 4. Audio Integration

### 4.1 Requirements Analysis

From `OriginalGame/src/ui/MainScene.js`:
- MainScene stops music on exit: `Navigation.stopMusic()`
- Navigation.current() plays music based on panel type
- Home music plays for home, build, storage, gate, radio panels

### 4.2 Implementation Plan

**File**: `src/components/scenes/MainScene.tsx`

**Audio Management:**

```typescript
useEffect(() => {
  // Play home music when entering main scene
  audioManager.playMusic(MusicPaths.HOME, true)
  
  return () => {
    // Stop music when leaving main scene
    audioManager.stopMusic()
  }
}, [])

// Update music when panel changes (if needed)
useEffect(() => {
  // Most panels use home music
  // Some panels like death use different music
  if (currentPanel === 'home' || currentPanel === 'build' || currentPanel === 'storage') {
    audioManager.playMusic(MusicPaths.HOME, true)
  }
}, [currentPanel])
```

**Implementation Steps:**

1. Import AudioManager
2. Add useEffect to play home music on mount
3. Add cleanup to stop music on unmount
4. Test music plays when entering main scene
5. Test music stops when leaving main scene

---

## 5. Testing Checklist

### 5.1 Component Rendering
- [ ] MainScene renders TopBar correctly
- [ ] MainScene renders BottomBar correctly
- [ ] HomePanel renders in BottomBar when `openPanel === 'home'`
- [ ] Screen dimensions are correct (640x1136)
- [ ] Background color is black

### 5.2 Panel Navigation
- [ ] Clicking building in HomePanel opens build panel
- [ ] Clicking storage building (13) opens storage panel
- [ ] Clicking radio building (15) opens radio panel
- [ ] Back button appears when panel is not home
- [ ] Back button navigates back to home
- [ ] Panel title updates correctly

### 5.3 Scene Integration
- [ ] App.tsx routes to MainScene when `currentScene === 'main'`
- [ ] MenuScene can navigate to MainScene
- [ ] MainScene initializes to home panel if none open

### 5.4 Audio
- [ ] Home music plays when entering MainScene
- [ ] Music stops when leaving MainScene

### 5.5 Layout
- [ ] TopBar positioned correctly
- [ ] BottomBar positioned correctly
- [ ] HomePanel fills BottomBar content area
- [ ] No layout overflow issues
- [ ] Responsive on different screen sizes

---

## 6. Implementation Order

### Phase 2D.5.1: MainScene Component (Priority: High)
1. Create `src/components/scenes/MainScene.tsx`
2. Implement basic structure with TopBar and BottomBar
3. Implement panel routing for HomePanel
4. Implement back button navigation
5. Test basic rendering

### Phase 2D.5.2: App.tsx Integration (Priority: High)
6. Update `src/App.tsx` to use uiStore for scene routing
7. Add MainScene to scene routing
8. Remove test scene code
9. Test scene switching

### Phase 2D.5.3: Audio Integration (Priority: Medium)
10. Add audio management to MainScene
11. Test music plays/stops correctly

### Phase 2D.5.4: Polish & Testing (Priority: Medium)
12. Test all panel navigation flows
13. Test back button behavior
14. Test layout on different screen sizes
15. Fix any positioning issues
16. Verify 1:1 match with original game

---

## 7. Dependencies & Blockers

### Blockers
- None - All prerequisites are complete ✓

### Dependencies
- `components/layout/TopBar.tsx` - Already exists ✓
- `components/layout/BottomBar.tsx` - Already exists ✓
- `components/panels/HomePanel.tsx` - Already exists ✓
- `store/uiStore.ts` - Already exists ✓
- `game/systems/AudioManager.ts` - Already exists ✓

### Future Dependencies (Not Required for Phase 2D.5)
- Other panel components (BuildPanel, StoragePanel, etc.) - Can use placeholders
- Stack-based navigation system - Simple state-based navigation is sufficient

---

## 8. Estimated Time

- MainScene component: 3-4 hours
- App.tsx integration: 1 hour
- Audio integration: 1 hour
- Testing & polish: 2-3 hours

**Total: ~7-9 hours**

---

## 9. Notes

1. **Panel Placeholders**: For panels that don't exist yet (build, storage, etc.), use simple placeholder divs. These will be implemented in future phases.

2. **Navigation System**: The original game uses a stack-based navigation system. For Phase 2D.5, simple state-based navigation is sufficient. Stack-based navigation can be added later if needed for complex navigation flows.

3. **Back Button Logic**: The back button should:
   - Navigate to home if on a sub-panel
   - Show exit dialog if on home panel (to be implemented later)

4. **FullScreen Mode**: HomePanel uses `fullScreen={true}` to fill the entire BottomBar. Other panels may use different modes.

5. **Panel Titles**: Panel titles are displayed in BottomBar. Each panel type has a specific title.

6. **Audio Management**: MainScene manages audio for the main game scene. Individual panels may also manage their own audio if needed.

7. **Test Scene Cleanup**: Remove TestUIHome.tsx and TestUIScene.tsx after MainScene is complete, or keep them for reference.

---

## 10. Next Steps

1. Review and approve this plan
2. Switch to ACT mode
3. Implement in order: Phase 2D.5.1 → Phase 2D.5.2 → Phase 2D.5.3 → Phase 2D.5.4
4. Test each component as implemented
5. Verify integration with existing components
6. Update PHASE_2D_IMPLEMENTATION_PLAN.md with completion status

