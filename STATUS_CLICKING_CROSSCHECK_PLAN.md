# Status Clicking Cross-Check Plan

## Overview
This document plans the cross-check of status button clicking behavior between the original game and the React port implementation.

## Original Game Status Clicking Behavior

### Status Buttons in TopBar (First Line)

From `OriginalGame/src/ui/topFrame.js`:

#### 1. Day Button
- **Position**: `btnSize.width * 0.4 + 7.3` (line 32)
- **Click Handler** (lines 27-30):
```javascript
day.setClickListener(this, function (sender) {
    var label = sender.getChildByName("label");
    showStatusDialog(1, cc.timer.getTimeDayStr(), sender.spriteFrameName);
});
```
- **String ID**: `1`
- **Value**: `cc.timer.getTimeDayStr()` (e.g., "Day 1")
- **Icon**: `icon_day.png`

#### 2. Season Button
- **Position**: `btnSize.width * 1.2 + 4.8` (line 45)
- **Click Handler** (lines 40-43):
```javascript
season.setClickListener(this, function (sender) {
    var label = sender.getChildByName("label");
    showStatusDialog(2, label.getString(), sender.spriteFrameName);
});
```
- **String ID**: `2`
- **Value**: Season name from label (e.g., "Spring", "Summer", "Autumn", "Winter")
- **Icon**: `icon_season_{season}.png`

#### 3. Time Button
- **Position**: `btnSize.width * 2 + 5.5` (line 55)
- **Click Handler** (lines 50-53):
```javascript
time.setClickListener(this, function (sender) {
    var label = sender.getChildByName("label");
    showStatusDialog(4, label.getString(), sender.spriteFrameName);
});
```
- **String ID**: `4`
- **Value**: Time string from label (e.g., "12:00")
- **Icon**: `icon_time.png`

#### 4. Weather Button
- **Position**: `btnSize.width * 2.9 - 3` (line 70)
- **Click Handler** (lines 65-68):
```javascript
weather.setClickListener(this, function (sender) {
    var label = sender.getChildByName("label");
    showStatusDialog(11, label.getString(), sender.spriteFrameName);
});
```
- **String ID**: `11`
- **Value**: Weather name from label (e.g., "Sunny", "Rainy")
- **Icon**: `icon_weather_{weatherId}.png`
- **Special**: If Radio building (15) level > -1, shows additional txt_2 with weather random value

#### 5. Temperature Button
- **Position**: `btnSize.width * 3.5 - 4` (line 84)
- **Click Handler** (lines 79-82):
```javascript
temperature.setClickListener(this, function (sender) {
    var label = sender.getChildByName("label");
    showStatusDialog(3, label.getString(), sender.spriteFrameName);
});
```
- **String ID**: `3`
- **Value**: Temperature value (e.g., "20")
- **Icon**: `icon_temperature_0.png`

#### 6. Electric Button
- **Position**: `btnSize.width * 4 + 4.5` (line 108)
- **Click Handler** (lines 103-106):
```javascript
electric.setClickListener(this, function (sender) {
    var label = sender.getChildByName("label");
    showStatusDialog(12, label.getString(), sender.spriteFrameName);
});
```
- **String ID**: `12`
- **Value**: "Active" or "Inactive" (from string ID 1126 or 1127)
- **Icon**: `icon_electric_{active|inactive}.png`

#### 7. Currency Button
- **Position**: `btnSize.width * 5 - 12.5` (line 124)
- **Click Handler** (lines 126-128):
```javascript
currency.setClickListener(this, function(sender) {
    showStatusDialog(13, Math.floor(player.currency), "#icon_item_money.png");
});
```
- **String ID**: `13`
- **Value**: `Math.floor(player.currency)` (floored currency value)
- **Icon**: `icon_item_money.png`

#### 8. Fuel Gauge Button
- **Position**: `btnSize.width * 5.7 - 0.4` (line 142)
- **Click Handler** (lines 144-150):
```javascript
fuelGauge.setClickListener(this, function(sender) {
    var upperbound = 0;
    if (player.hasMotocycle()) {
        upperbound = 99;
    }
    showStatusDialog(16, Math.floor(player.fuel) + "/" + upperbound, sender.spriteFrameName);
});
```
- **String ID**: `16`
- **Value**: `Math.floor(player.fuel) + "/" + upperbound` (e.g., "50/99" or "50/0")
- **Icon**: `icon_oil_{active|inactive}.png`

### showStatusDialog Function

**Location**: `OriginalGame/src/ui/topFrame.js` (lines 395-407)

```javascript
var showStatusDialog = function (stringId, value, iconName) {
    var config = utils.clone(stringUtil.getString("statusDialog"));
    var strConfig = stringUtil.getString(stringId);
    config.title.icon = iconName;
    config.title.title = strConfig.title;
    config.title.txt_1 = cc.formatStr(config.title.txt_1, value);
    if (player.room.getBuildLevel(15) > -1) {
        config.title.txt_2 = stringId == 11 ? stringUtil.getString(9003) + player.weather.Random: ""
    }
    config.content.des = strConfig.des;
    var dialog = new DialogSmall(config);
    dialog.show();
};
```

**Function Behavior**:
1. Clones the base `statusDialog` config from strings
2. Gets the specific string config for the `stringId`
3. Sets the dialog icon to `iconName`
4. Sets the dialog title to `strConfig.title`
5. Formats `txt_1` with the `value` (e.g., "Current: %s" becomes "Current: Day 1")
6. Special case: If Radio building (15) exists and stringId is 11 (weather), adds txt_2 with weather random value
7. Sets the description from `strConfig.des`
8. Creates and shows a `DialogSmall` dialog

### DialogSmall Structure

**Location**: `OriginalGame/src/ui/dialog.js` (lines 595-634)

**Dialog Structure**:
- **Background**: `dialog_small_2_bg.png`
- **Title Node**: 
  - Position: Top of dialog, 90px height
  - Contains: Icon, title text, txt_1 (formatted value), txt_2 (optional, for weather)
- **Content Node**:
  - Position: Middle section
  - Contains: Description text (`des`) - black color, positioned at top of content area
- **Action Node**:
  - Position: Bottom, 72px height
  - Contains: OK button (btn_1)

**Dialog Positioning**:
- Centered on screen
- Uses DialogCommon base class for positioning logic

### String IDs for Status Dialogs

From string configs, each status has a string ID that provides:
- `title`: Dialog title text
- `des`: Description text shown in content area

**String ID Mapping**:
- `1`: Day status
- `2`: Season status
- `3`: Temperature status
- `4`: Time status
- `11`: Weather status
- `12`: Electric/Work Site status
- `13`: Currency status
- `16`: Fuel status

### statusDialog Base Config

**Location**: `OriginalGame/src/data/string/string_en.js` (lines 1273-1283)

```javascript
"statusDialog": {
    "title": {
        "txt_1": "Current: %s"
    },
    "content": {},
    "action": {
        "btn_1": {
            "txt": "OK"
        }
    }
}
```

## Current React Implementation

### TopBar.tsx Status Buttons

**Location**: `src/components/layout/TopBar.tsx`

#### Current Implementation Status:

1. **Day Button** (line 133):
   - ✅ Correct string ID: `1`
   - ✅ Correct value: `getTimeDayStr(gameStore.day)`
   - ✅ Correct icon: `icon_day.png`
   - ❌ Placeholder function: `showStatusDialog` only logs to console

2. **Season Button** (line 144):
   - ✅ Correct string ID: `2`
   - ✅ Correct value: `getSeasonStr(gameStore.season)`
   - ✅ Correct icon: `icon_season.png`
   - ❌ Placeholder function: `showStatusDialog` only logs to console

3. **Time Button** (line 154):
   - ✅ Correct string ID: `4`
   - ✅ Correct value: `getTimeHourStr(gameStore.hour, gameStore.minute)`
   - ✅ Correct icon: `icon_time.png`
   - ❌ Placeholder function: `showStatusDialog` only logs to console

4. **Weather Button** (line 165):
   - ✅ Correct string ID: `11`
   - ✅ Correct value: `gameStore.weatherSystem?.getWeatherName() || 'Unknown'`
   - ✅ Correct icon: `icon_weather.png`
   - ❌ Placeholder function: `showStatusDialog` only logs to console
   - ❌ Missing: Special txt_2 handling for Radio building

5. **Temperature Button** (line 175):
   - ✅ Correct string ID: `3`
   - ✅ Correct value: `playerStore.temperature`
   - ✅ Correct icon: `icon_temperature_0.png`
   - ❌ Placeholder function: `showStatusDialog` only logs to console

6. **Electric Button** (line 186):
   - ✅ Correct string ID: `12`
   - ✅ Correct value: `workSiteActive ? 'Active' : 'Inactive'`
   - ✅ Correct icon: `icon_electric.png`
   - ❌ Placeholder function: `showStatusDialog` only logs to console

7. **Currency Button** (line 196):
   - ✅ Correct string ID: `13`
   - ✅ Correct value: `Math.floor(playerStore.currency)`
   - ✅ Correct icon: `icon_item_money.png`
   - ❌ Placeholder function: `showStatusDialog` only logs to console

8. **Fuel Gauge Button** (line 206):
   - ✅ Correct string ID: `16`
   - ✅ Correct value: `0/${hasMotorcycle ? 99 : 0}`
   - ⚠️ Value format matches but uses hardcoded `0` instead of `Math.floor(playerStore.fuel)`
   - ✅ Correct icon: `icon_oil.png`
   - ❌ Placeholder function: `showStatusDialog` only logs to console

### showStatusDialog Function (Current)

**Location**: `src/components/layout/TopBar.tsx` (lines 39-42)

```typescript
function showStatusDialog(stringId: number, value: string | number, iconName: string) {
  console.log('Status dialog:', { stringId, value, iconName })
  // TODO: Implement status dialog
}
```

**Status**: ❌ Not implemented - only logs to console

## Cross-Check Tasks

### Task 1: Verify Status Button Click Handlers
**Objective**: Ensure all status buttons call `showStatusDialog` with correct parameters

**Steps**:
1. ✅ Verify Day button: stringId=1, value=getTimeDayStr(), icon=icon_day.png
2. ✅ Verify Season button: stringId=2, value=getSeasonStr(), icon=icon_season.png
3. ✅ Verify Time button: stringId=4, value=getTimeHourStr(), icon=icon_time.png
4. ✅ Verify Weather button: stringId=11, value=weatherName, icon=icon_weather.png
5. ✅ Verify Temperature button: stringId=3, value=temperature, icon=icon_temperature_0.png
6. ✅ Verify Electric button: stringId=12, value=Active/Inactive, icon=icon_electric.png
7. ✅ Verify Currency button: stringId=13, value=Math.floor(currency), icon=icon_item_money.png
8. ⚠️ Verify Fuel button: stringId=16, value=fuel/upperbound, icon=icon_oil.png (needs fuel value fix)

**Expected Result**: All buttons match original game parameters

### Task 2: Verify showStatusDialog Implementation
**Objective**: Ensure `showStatusDialog` matches original game behavior

**Steps**:
1. Check if function exists and is implemented
2. Verify it creates a DialogSmall component
3. Verify it uses statusDialog base config
4. Verify it formats txt_1 with value
5. Verify it handles special case for weather (stringId=11) with Radio building
6. Verify it gets string config for the stringId
7. Verify it sets icon, title, and description correctly

**Expected Result**: Function matches original game implementation

### Task 3: Verify DialogSmall Component
**Objective**: Ensure DialogSmall component matches original game structure

**Steps**:
1. Check if DialogSmall component exists
2. Verify background sprite: `dialog_small_2_bg.png`
3. Verify title node structure (90px height):
   - Icon display
   - Title text
   - txt_1 (formatted value)
   - txt_2 (optional, for weather)
4. Verify content node structure:
   - Description text (black color)
   - Positioned at top of content area
5. Verify action node structure (72px height):
   - OK button (btn_1)
6. Verify dialog positioning (centered on screen)
7. Verify overlay (semi-transparent black background)

**Expected Result**: DialogSmall matches original game DialogSmall structure

### Task 4: Verify String System Integration
**Objective**: Ensure string IDs are correctly mapped to dialog content

**Steps**:
1. Check if string system exists for status dialogs
2. Verify string IDs 1, 2, 3, 4, 11, 12, 13, 16 have title and des
3. Verify statusDialog base config exists with txt_1 format
4. Verify string formatting works (cc.formatStr equivalent)

**Expected Result**: String system provides correct content for each status dialog

### Task 5: Verify Special Cases
**Objective**: Ensure special cases are handled correctly

**Steps**:
1. Verify weather dialog (stringId=11) shows txt_2 when Radio building (15) level > -1
2. Verify txt_2 format: `stringUtil.getString(9003) + player.weather.Random`
3. Verify fuel dialog shows correct upperbound (99 if hasMotorcycle, 0 otherwise)
4. Verify fuel value uses `Math.floor(player.fuel)` not hardcoded `0`

**Expected Result**: Special cases match original game behavior

## Implementation Gaps

### Missing Components:
1. ❌ **DialogSmall Component**: Not implemented
2. ❌ **Status Dialog Overlay System**: Not implemented in UIStore
3. ❌ **String System**: Status dialog strings not integrated
4. ❌ **DialogCommon Base**: DialogSmall needs base dialog component

### Missing Features:
1. ❌ **showStatusDialog Implementation**: Only placeholder exists
2. ❌ **Weather txt_2 Special Case**: Not implemented
3. ⚠️ **Fuel Value**: Uses hardcoded `0` instead of actual fuel value
4. ❌ **Dialog Positioning**: DialogSmall positioning not implemented
5. ❌ **Dialog Overlay**: Semi-transparent overlay not implemented

## Testing Checklist

### Status Button Clicking:
- [ ] Day button opens dialog with correct content
- [ ] Season button opens dialog with correct content
- [ ] Time button opens dialog with correct content
- [ ] Weather button opens dialog with correct content
- [ ] Weather button shows txt_2 when Radio building exists
- [ ] Temperature button opens dialog with correct content
- [ ] Electric button opens dialog with correct content
- [ ] Currency button opens dialog with correct content
- [ ] Fuel button opens dialog with correct content and fuel value

### Dialog Display:
- [ ] Dialog appears centered on screen
- [ ] Dialog has semi-transparent overlay
- [ ] Dialog shows correct icon
- [ ] Dialog shows correct title
- [ ] Dialog shows correct current value (txt_1)
- [ ] Dialog shows correct description (des)
- [ ] Dialog shows OK button
- [ ] OK button dismisses dialog

### Special Cases:
- [ ] Weather dialog shows txt_2 when Radio building level > -1
- [ ] Fuel dialog shows correct upperbound based on motorcycle ownership
- [ ] Fuel dialog shows actual fuel value (not hardcoded 0)

## Cross-Check Status

✅ **Cross-Check Completed**

See `STATUS_CLICKING_CROSSCHECK_FINDINGS.md` for detailed verification results.

### Summary:
- ✅ Status button click handlers: All correct
- ❌ showStatusDialog: Not implemented (placeholder only)
- ❌ DialogSmall component: Does not exist
- ⚠️ Fuel value: Uses hardcoded `0` instead of actual fuel
- ❌ Weather special case: Not implemented
- ❌ String system: Not integrated

## Notes

1. **DialogSmall vs DialogBig**: Status dialogs use `DialogSmall` (simpler, smaller), while attribute dialogs use `DialogBig` (larger, with item lists)

2. **String Formatting**: Original uses `cc.formatStr(config.title.txt_1, value)` which formats "Current: %s" with the value

3. **Icon Names**: Some icons use `#` prefix in original (e.g., `#icon_day.png`), but React port should use without prefix

4. **Weather Special Case**: Only weather dialog (stringId=11) has the special txt_2 when Radio building exists

5. **Fuel Upperbound**: Original checks `player.hasMotocycle()` (note: typo in original code) to determine if upperbound is 99 or 0

6. **Dialog Positioning**: DialogSmall uses DialogCommon base which handles centering and overlay

7. **Season Button Position**: Current uses `1.1` but original uses `1.2` (minor discrepancy)

