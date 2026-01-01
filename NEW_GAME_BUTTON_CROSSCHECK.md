# New Game Button Cross-Check

## Overview
This document compares the "New Game" button functionality between the original game and the current React port implementation.

## Original Game Flow

### Step 1: Button Click Handler
**File**: `OriginalGame/src/ui/MenuScene.js` (line 197-199)

```javascript
var btn1 = uiUtil.createBigBtnWhite(stringUtil.getString(1142), this, function () {
    cc.director.runScene(new saveFileScene());
});
```

**Action**: Navigates to `saveFileScene()` (no parameters)

### Step 2: SaveFileScene Display
**File**: `OriginalGame/src/ui/SaveFileScene.js`

**What it does**:
- Displays a scene titled "Select Save File" (string ID 6000)
- Shows 3 save slots (slot 1, 2, 3)
- Each slot displays:
  - Save slot title/name
  - Save slot description (day, season, etc.)
  - Rename button (icon_iap_info.png)
  - Clone button (icon_save_copy.png)
  - Delete button (icon_save_delete.png)
- Has a "Cancel" button that returns to MenuScene

**Music**: Plays `audioManager.music.ABYSS` (if mode is not set)

### Step 3: Save Slot Click Handler
**File**: `OriginalGame/src/ui/SaveFileScene.js` (line 345-358)

**When clicking a save slot**:

**Case A: Empty Save Slot** (`metaStr[1] == ""`):
```javascript
if (metaStr[1] == "") {
    game.newGame(num);  // num is the save slot number (1, 2, or 3)
}
```

**Case B: Save Slot with Data**:
```javascript
else {
    utils.SAVE_SLOT = num;
    game.init();
    game.start();
    cc.director.runScene(new MainScene());
}
```

### Step 4: New Game Flow (Empty Slot)
**File**: `OriginalGame/src/game/game.js` (line 40-44)

```javascript
newGame: function (num) {
    utils.SAVE_SLOT = num;
    Medal.initCompletedForOneGame(true);
    cc.director.runScene(new ChooseScene(0));
}
```

**Action**: 
- Sets the save slot number
- Initializes medals for new game
- Navigates to `ChooseScene(0)` - Talent Selection Scene

### Step 5: ChooseScene (Talent Selection)
**File**: `OriginalGame/src/ui/ChooseScene.js`

**What it does**:
- Displays talent selection screen
- Player selects starting talents
- After selection, navigates to `StoryScene` or directly starts the game

## Current React Port Implementation

### Step 1: Button Click Handler
**File**: `src/components/scenes/MenuScene.tsx` (line 32-35)

```typescript
const handleNewGame = () => {
  audioManager.playEffect(SoundPaths.CLICK)
  uiStore.setScene('saveFile')
}
```

**Action**: Sets scene to `'saveFile'` ✅ **Matches original intent**

### Step 2: SaveFileScene Status
**File**: `src/App.tsx` (line 34)

```typescript
{/* {currentScene === 'saveFile' && <SaveFileScene />} */}
```

**Status**: ❌ **SaveFileScene component is commented out - NOT IMPLEMENTED**

### Step 3: Scene Type Definition
**File**: `src/store/uiStore.ts` (line 6)

```typescript
export type Scene = 
  | 'menu'
  | 'saveFile'  // ✅ Defined
  | 'choose'
  | 'story'
  | 'main'
  | ...
```

**Status**: ✅ Scene type is defined

## Comparison Summary

| Aspect | Original Game | Current Port | Status |
|--------|--------------|--------------|---------|
| Button Click Action | Navigate to `saveFileScene()` | Set scene to `'saveFile'` | ✅ Matches |
| SaveFileScene Component | Fully implemented | Commented out (not implemented) | ❌ Missing |
| Save Slot Display | 3 slots with metadata | N/A | ❌ Missing |
| Empty Slot Click | Navigate to `ChooseScene(0)` | N/A | ❌ Missing |
| Loaded Slot Click | Load save → `MainScene()` | N/A | ❌ Missing |
| Cancel Button | Returns to MenuScene | N/A | ❌ Missing |
| Music | Plays ABYSS music | N/A | ❌ Missing |

## Expected Behavior

### When SaveFileScene is Implemented:

1. **User clicks "New Game"**:
   - ✅ Plays CLICK sound effect (already implemented)
   - ✅ Navigates to SaveFileScene (navigation works, scene missing)

2. **SaveFileScene should display**:
   - Title: "Select Save File"
   - 3 save slots (1, 2, 3)
   - Each slot shows:
     - Save name/title
     - Save description (day, season, etc.) or "Empty"
     - Rename button (if slot has data)
     - Clone button (if slot has data)
     - Delete button (if slot has data)
   - Cancel button (returns to MenuScene)

3. **User clicks empty save slot**:
   - Should navigate to ChooseScene (talent selection)
   - Set save slot number
   - Initialize new game state

4. **User clicks save slot with data**:
   - Load save data
   - Initialize game with loaded data
   - Navigate to MainScene

5. **User clicks Cancel**:
   - Return to MenuScene

## Missing Implementation

### Required Components:
1. ❌ `SaveFileScene` component (commented out in App.tsx)
2. ❌ `ChooseScene` component (talent selection)
3. ❌ Save slot UI components
4. ❌ Save slot metadata display
5. ❌ Rename/Clone/Delete functionality

### Required Functions:
1. ❌ `game.newGame(num)` equivalent
2. ❌ Save slot selection logic
3. ❌ Save slot metadata retrieval
4. ❌ Save slot operations (rename, clone, delete)

## Current Status

✅ **Navigation Logic**: Correct - button navigates to 'saveFile' scene
❌ **SaveFileScene**: Not implemented - scene is commented out
❌ **User Experience**: Clicking "New Game" currently does nothing visible (scene doesn't exist)

## Recommendations

1. **Immediate**: Uncomment and implement `SaveFileScene` component
2. **Priority**: Implement basic save slot display (3 slots, show empty/loaded status)
3. **Next**: Implement empty slot click → navigate to ChooseScene
4. **Later**: Implement loaded slot click → load and start game
5. **Future**: Add rename/clone/delete functionality

## Notes

- The button click handler is correctly implemented
- The navigation system is set up correctly
- The missing piece is the SaveFileScene component itself
- Once SaveFileScene is implemented, the flow should match the original game

