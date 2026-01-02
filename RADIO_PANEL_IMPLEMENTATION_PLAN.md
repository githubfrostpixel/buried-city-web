# Radio Panel Implementation Plan

## Overview

This plan covers implementing the Radio Panel component, ported from `OriginalGame/src/ui/radioNode.js`. The Radio panel allows players to send and receive messages, with support for cheat commands when IAP is unlocked.

## Original Game Analysis

### File Structure
- **Original**: `OriginalGame/src/ui/radioNode.js` (extends `BuildNode`)
- **Building ID**: 15 (Radio building)
- **Storage Key**: `"radio" + SAVE_SLOT` (localStorage array)

### Key Components

1. **MessageView** (`OriginalGame/src/ui/LogView.js` lines 126-161)
   - Scrollable message list
   - Displays time and message content
   - Player messages shown in red
   - Auto-updates time display

2. **EditBox** (Text input)
   - Position: `(bg.width / 2, 35)` from bottom, anchor `(0.5, 0.5)`
   - Size: `(bg.width - 30, 45)`
   - Placeholder: String ID 1148 ("Call out")
   - Return type: SEND (submits on Enter)

3. **Section View** (Frame separator)
   - Position: `(bg.width / 2, contentTopLineHeight - upgradeView.height)`
   - Anchor: `(0.5, 1)` (top-center)

4. **Upgrade View** (Inherited from BuildNode)
   - Position: `(bg.width / 2, contentTopLineHeight)`
   - Anchor: `(0.5, 1)` (top-center)

### Layout Structure

```
BottomBar (bg)
├── Upgrade View (top, centered)
├── Section View (below upgrade view)
├── MessageView (scrollable, below section)
│   └── Messages (stacked from bottom to top)
└── EditBox (bottom, centered)
```

### Positioning Details

**From `radioNode.js`:**

```javascript
// MessageView
this.msgView = new MessageView(cc.size(this.bg.width - 14, this.sectionView.y - this.sectionView.height - 60));
this.msgView.setPosition(7, 60);
// Size: (bg.width - 14, sectionView.y - sectionView.height - 60)
// Position: (7, 60) from bottom-left of bg

// EditBox
this.editText.x = this.bg.width / 2;
this.editText.y = 35;
// Position: (bg.width / 2, 35) from bottom, anchor (0.5, 0.5)
// Size: (bg.width - 30, 45)
```

**Coordinate Conversion:**
- Cocos Y = 60 means 60px from bottom of bg
- CSS Y = bgHeight - 60 = 834 - 60 = 774px from top
- EditBox at Y = 35 means 35px from bottom
- CSS Y = bgHeight - 35 = 834 - 35 = 799px from top

### Message Data Structure

```typescript
interface RadioMessage {
  uid: string | number  // UUID for player messages, random int for others
  msg: string          // Message content
  time: number         // Game time in seconds (cc.timer.time)
}
```

### Message Storage

- **Key**: `"radio" + SAVE_SLOT`
- **Format**: JSON array of `RadioMessage[]`
- **Max Length**: 30 messages
- **Truncation**: Messages > 40 chars are truncated with "..."
- **Order**: Newest first (unshift)

### Visibility Logic

```javascript
checkVisible: function () {
    var visible = this.build.level >= 0;
    this.bg.getChildByName("msgView").setVisible(visible);
    this.bg.getChildByName("editText").setVisible(visible);
    if (visible) {
        this.updateData();
    }
}
```

Only shows message view and input when building level >= 0 (built).

### Command Processing

Commands are processed in `sendMsg()` function:

1. **help** - Show command list
2. **obtain 'name' int** - Obtain items (requires IAP unlock)
3. **obtain everything int** - Obtain all items (requires IAP unlock)
4. **heal** - Heal player completely
5. **kill** - Kill player
6. **fix** - Fix generator (site 204) and gas pump (site 201 if has motorcycle)
7. **backup** - Generate backup string (achievement/medal/dataLog)
8. **restore {data}** - Restore from backup string
9. **{uuid_last_5} {code}** - Eval code (requires IAP unlock)

**IAP Check**: Commands other than `backup` and `restore` require `IAPPackage.isAllIAPUnlocked()`.

### Time Formatting

**From `MessageView.createOneItem()`:**
- Uses `cc.timer.getTimeStr(Number(log.time))` to format time
- String IDs:
  - 1149: "%s, listening content:" (other players)
  - 1150: "%s, calling content:" (player's own messages)

**Time Format** (from `TimerManager.getTimeStr()`):
- Format: String ID 1203 with params `(day, hourStr, minuteStr)`
- Example: "Day 1, 12:34"

### Audio

- **On Enter**: Plays `audioManager.sound.RADIO` (from `buildNode.js` line 128)

## Implementation Plan

### Phase 1: Component Structure

#### 1.1 Create RadioPanelContent Component

**File**: `src/components/panels/RadioPanelContent.tsx`

**Structure**:
```typescript
export function RadioPanelContent() {
  // State management
  // Building reference (ID 15)
  // Message list state
  // Input state
  
  // Effects:
  // - Load messages from localStorage on mount
  // - Update messages when building upgrades
  // - Handle visibility based on building level
  
  // Handlers:
  // - sendMessage (process commands)
  // - loadMessages (from localStorage)
  // - saveMessage (to localStorage)
  
  return (
    <BottomBar>
      {/* Upgrade View */}
      {/* Section View */}
      {/* MessageView (scrollable) */}
      {/* EditBox (input) */}
    </BottomBar>
  )
}
```

#### 1.2 Create MessageView Component

**File**: `src/components/panels/RadioMessageView.tsx`

**Features**:
- Scrollable container (vertical)
- Message items stacked from top to bottom
- Auto-scroll to bottom on new message
- Time display updates

**Message Item Structure**:
```typescript
interface MessageItemProps {
  message: RadioMessage
  isPlayer: boolean  // true if uid matches player UUID
}
```

**Layout**:
- Time label (top, left-aligned)
- Message text (below time, left-aligned)
- Player messages: red text
- Other messages: black text

#### 1.3 Create RadioEditBox Component

**File**: `src/components/panels/RadioEditBox.tsx`

**Features**:
- Text input with placeholder
- Submit on Enter key
- Clear on submit
- Styled to match original (edit_text_bg.png scale9 sprite)

### Phase 2: Positioning and Layout

#### 2.1 Upgrade View Integration

**Reference**: `StoragePanelContent.tsx` pattern (no upgrade view in storage, but BuildNode pattern applies)

**Positioning**:
- Use `BOTTOM_BAR_LAYOUT.cocosRef.contentTopLineHeight` for top position
- Center horizontally: `left: 50%, transform: translateX(-50%)`
- Anchor at top: positioned from top of content area

**Note**: Radio panel extends BuildNode, so upgrade view should be implemented. Check if upgrade view component exists or needs to be created.

#### 2.2 Section View

**Positioning**:
- Below upgrade view
- Position: `(bgWidth / 2, contentTopLineHeight - upgradeViewHeight)`
- CSS: `top: ${contentTopLineHeight - upgradeViewHeight}px, left: 50%, transform: translateX(-50%)`
- Sprite: `frame_section_bg.png`

#### 2.3 MessageView Positioning

**From Original**:
```javascript
size: (bg.width - 14, sectionView.y - sectionView.height - 60)
position: (7, 60) from bottom
```

**CSS Conversion**:
- Width: `bgWidth - 14px` (centered with 7px margin on each side)
- Height: `sectionView.top - sectionView.height - 60px`
- Top: `bgHeight - 60 - msgViewHeight` (or use bottom: 60px)
- Left: `7px`

**Better Approach**:
- Position relative to content area
- Top: `60px` from bottom of content area
- Height: Calculate from section view position

#### 2.4 EditBox Positioning

**From Original**:
```javascript
x: bg.width / 2
y: 35 from bottom
size: (bg.width - 30, 45)
anchor: (0.5, 0.5)
```

**CSS Conversion**:
- Position: `left: 50%, bottom: 35px, transform: translateX(-50%)`
- Size: `width: ${bgWidth - 30}px, height: 45px`

### Phase 3: Message Storage

#### 3.1 localStorage Integration

**Key Format**: `radio${saveSlot}`

**Functions**:
```typescript
function loadRadioMessages(saveSlot: number): RadioMessage[]
function saveRadioMessage(saveSlot: number, message: RadioMessage): void
function getRadioMessagesKey(saveSlot: number): string
```

**Storage Format**:
- Array of `RadioMessage[]`
- Max 30 messages
- Newest first (unshift, pop if > 30)

#### 3.2 Message Truncation

**Rule**: Messages > 40 chars are truncated:
```typescript
if (msg.msg.length > 40) {
  msg.msg = msg.msg.substring(0, 40) + "..."
}
```

### Phase 4: Command Processing

#### 4.1 Command Parser

**File**: `src/game/systems/RadioCommandProcessor.ts`

**Functions**:
```typescript
export function processRadioCommand(
  command: string,
  time: number
): { message: RadioMessage; effects?: CommandEffects }
```

**Command Types**:
- `help` - Return help text
- `obtain <itemName> <amount>` - Obtain items
- `obtain everything <amount>` - Obtain all items
- `heal` - Heal player
- `kill` - Kill player
- `fix` - Fix sites
- `backup` - Generate backup
- `restore <data>` - Restore from backup
- `{uuid_last_5} <code>` - Eval code

#### 4.2 IAP Check

**Function**: Check if IAP is unlocked (stub for now)
```typescript
function isIAPUnlocked(): boolean {
  // TODO: Implement IAP check
  return false  // Default to false
}
```

**Commands Requiring IAP**:
- `obtain` (all variants)
- `{uuid} {code}` (eval)

**Commands Not Requiring IAP**:
- `help`
- `heal`
- `kill`
- `fix`
- `backup`
- `restore`

#### 4.3 Command Effects

**Heal Command**:
```typescript
// Set all attributes to max
player.changeSpirit(player.spiritMax)
player.changeVigour(player.vigourMax)
player.changeStarve(player.starveMax)
player.changeInfect(-player.infectMax)
player.changeInjury(-player.injuryMax)
player.changeHp(player.hpMax)
player.changeWater(player.waterMax)
player.changeVirus(-player.virusMax)
player.changeAttr("dogFood", player.dogFoodMax)
player.changeAttr("dogInjury", -player.dogInjuryMax)
player.changeAttr("dogMood", player.dogMoodMax)
```

**Kill Command**:
```typescript
player.die()
```

**Fix Command**:
```typescript
player.map.getSite(204).fix()  // Generator
if (player.hasMotocycle()) {
  player.map.getSite(201).fix()  // Gas pump
}
```

**Obtain Command**:
- Parse item name and amount
- Check if item exists
- Add to storage
- Special cases: "everything", currency (string 13), fuel (string 16)

**Backup Command**:
- Generate JSON with achievement, medal, dataLog
- Add MD5 hash
- Set as input text (for copy)

**Restore Command**:
- Parse JSON
- Verify MD5 hash
- Restore achievement, medal, dataLog
- Validate structure

### Phase 5: Time Formatting

#### 5.1 Time Utility Functions

**File**: `src/utils/timeFormat.ts`

**Functions**:
```typescript
export function formatRadioTime(timeSeconds: number): string
export function formatRadioTimeLabel(timeSeconds: number, isPlayer: boolean): string
```

**Implementation**:
- Use `TimeManager.getTimeStr()` equivalent
- Format: "Day X, HH:MM"
- Labels: Use string IDs 1149 (listening) or 1150 (calling)

#### 5.2 Time Updates

**MessageView** should update time labels periodically (every minute or on visibility change).

### Phase 6: UUID Handling

#### 6.1 Player UUID

**Function**: `getUUID()` from `SaveSystem.ts`

**Usage**:
- Compare message `uid` with player UUID
- If match: show as player message (red text, "calling content")
- If not: show as other message (black text, "listening content")

#### 6.2 UUID for Commands

**Eval Command**: Last 5 chars of UUID used as command prefix
```typescript
const uuid = await getUUID()
const prefix = uuid.substring(uuid.length - 5)
// Command format: "{prefix} {code}"
```

### Phase 7: Integration

#### 7.1 MainScene Integration

**File**: `src/components/scenes/MainScene.tsx`

**Update**:
```typescript
case 'radio':
  return <RadioPanelContent />
```

#### 7.2 Building Click Handler

**File**: `src/components/panels/HomePanelContent.tsx`

**Already Implemented** (line 135-137):
```typescript
case 15:
  // Navigate to Radio panel
  uiStore.openPanelAction('radio')
  break
```

#### 7.3 Audio Integration

**On Panel Open**:
- Play `audioManager.sound.RADIO` effect
- Check building ID 15 (Radio) in `MainScene` or `RadioPanelContent`

### Phase 8: Cross-Check Items

#### 8.1 Layout Verification

**Check Against Original**:
- [ ] Upgrade view position matches
- [ ] Section view position matches
- [ ] MessageView size and position matches
- [ ] EditBox size and position matches
- [ ] Spacing between elements matches

#### 8.2 Functionality Verification

**Check Against Original**:
- [ ] Messages load from localStorage on mount
- [ ] Messages save to localStorage on send
- [ ] Message truncation works (> 40 chars)
- [ ] Max 30 messages enforced
- [ ] Player messages shown in red
- [ ] Time formatting matches
- [ ] Commands process correctly
- [ ] IAP check works
- [ ] Visibility based on building level

#### 8.3 Visual Verification

**Check Against Original**:
- [ ] MessageView scrolls correctly
- [ ] EditBox placeholder text matches
- [ ] Section frame sprite displays
- [ ] Upgrade view displays (if building not max)
- [ ] Messages stack correctly (newest at bottom)

## File Structure

```
src/
├── components/
│   └── panels/
│       ├── RadioPanelContent.tsx      (Main component)
│       ├── RadioMessageView.tsx       (Scrollable message list)
│       └── RadioEditBox.tsx           (Text input)
├── game/
│   └── systems/
│       └── RadioCommandProcessor.ts   (Command processing)
└── utils/
    └── timeFormat.ts                  (Time formatting utilities)
```

## Dependencies

### Existing Systems
- `@/store/buildingStore` - Building state
- `@/store/playerStore` - Player state
- `@/store/uiStore` - UI state
- `@/game/systems/TimeManager` - Time formatting
- `@/game/systems/SaveSystem` - UUID and save slot
- `@/components/layout/BottomBar` - Panel container
- `@/components/sprites/Sprite` - Sprite rendering
- `@/utils/emitter` - Event system

### New Dependencies
- None (all dependencies exist)

## Testing Checklist

### Basic Functionality
- [ ] Panel opens when clicking Radio building (ID 15)
- [ ] Panel shows upgrade view (if building not max)
- [ ] Panel shows section frame
- [ ] Panel shows message view (if building level >= 0)
- [ ] Panel shows edit box (if building level >= 0)
- [ ] Panel hides message view and edit box (if building level < 0)

### Message Display
- [ ] Messages load from localStorage on mount
- [ ] Messages display in correct order (newest at bottom)
- [ ] Player messages show in red
- [ ] Other messages show in black
- [ ] Time labels format correctly
- [ ] Time labels update on visibility change
- [ ] MessageView scrolls correctly
- [ ] Long messages wrap correctly

### Message Sending
- [ ] Can type in edit box
- [ ] Enter key submits message
- [ ] Message appears in message view
- [ ] Message saves to localStorage
- [ ] Message truncates if > 40 chars
- [ ] Max 30 messages enforced
- [ ] Edit box clears after submit

### Commands
- [ ] `help` command shows help text
- [ ] `heal` command heals player
- [ ] `kill` command kills player
- [ ] `fix` command fixes sites
- [ ] `obtain` command requires IAP (stub)
- [ ] `backup` command generates backup string
- [ ] `restore` command restores data
- [ ] Invalid commands show error message

### Building Integration
- [ ] Panel title updates on building upgrade
- [ ] Panel visibility updates on building upgrade
- [ ] Upgrade view updates on building upgrade
- [ ] Audio plays on panel open

## Notes

1. **Building ID**: Radio is building ID 15 (confirmed from `HomePanelContent.tsx` line 135)

2. **Save Slot**: Use `SaveSystem.getSaveSlot()` or equivalent to get current save slot

3. **UUID**: Use `SaveSystem.getUUID()` for player identification

4. **Time Manager**: Use `game.getTimeManager()` to get time manager instance

5. **IAP Check**: Stub implementation for now, will be implemented later

6. **Eval Command**: Security risk - only works if IAP unlocked, matches original behavior

7. **Message Storage**: Uses localStorage, not indexedDB (matches original)

8. **Coordinate System**: All positions use Cocos-to-CSS conversion (see `COCOS_TO_CSS_POSITION_MAPPING.md`)



