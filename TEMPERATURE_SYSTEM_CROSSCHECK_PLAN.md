# Temperature System Crosscheck Plan

## Overview
This document crosschecks the original game's temperature system with the current React port implementation to identify discrepancies and ensure accurate temperature mechanics.

## Original Game Temperature System

### Location
- **Main Logic**: `OriginalGame/src/game/player.js:980-1020`
- **Called From**: `updateByTime()` (hourly callback) - line 1627

### Temperature Calculation Flow

#### 1. `initTemperature()` - Base Temperature Calculation
**Location**: `OriginalGame/src/game/player.js:1008-1020`

```javascript
initTemperature: function () {
    var c = this.config["temperature"];
    //季节因素 (Season factor)
    var configBySeason = c[cc.timer.getSeason()];
    var temperature = configBySeason[0];
    //日夜因素 (Day/night factor)
    if (cc.timer.getStage() === "day") {
        temperature += configBySeason[1];
    } else {
        temperature += configBySeason[2];
    }
    return temperature;
}
```

**Config Structure** (`playerConfig.temperature`):
- Index 0: Spring `[15, 2, -2]` → base=15, day=+2, night=-2
- Index 1: Summer `[0, 2, -2]` → base=0, day=+2, night=-2
- Index 2: Autumn `[10, 2, -2]` → base=10, day=+2, night=-2
- Index 3: Winter `[18, 5, 0]` → base=18, day=+5, night=0
- Index 4: Default `[13]` → used for building bonuses

**Calculation**:
- Base temperature = `configBySeason[0]` (season base)
- If day: add `configBySeason[1]` (day modifier)
- If night: add `configBySeason[2]` (night modifier)

**Example**:
- Spring, Day: 15 + 2 = 17°C
- Spring, Night: 15 + (-2) = 13°C
- Winter, Day: 18 + 5 = 23°C
- Winter, Night: 18 + 0 = 18°C

#### 2. `updateTemperature()` - Apply Building and Weather Effects
**Location**: `OriginalGame/src/game/player.js:980-994`

```javascript
updateTemperature: function () {
    var c = this.config["temperature"];
    var temperature = this.initTemperature();
    
    // Building effects
    if (this.room.getBuild(18).isActive()) {
        // Electric Stove (ID 18) is active
        temperature += c[4][0];  // Add 13 (default config value)
        if (this.room.getBuild(5).isActive()) {
            // Fireplace (ID 5) is also active
            temperature += Math.floor(c[4][0] / 2);  // Add 6 (half of 13)
        }
    } else if (this.room.getBuild(5).isActive()) {
        // Only Fireplace (ID 5) is active
        temperature += c[4][0];  // Add 13
    }
    
    // Weather effect
    temperature += this.weather.getValue("temperature");
    
    // Apply the difference (target - current)
    this.changeTemperature(temperature - this.temperature);
}
```

**Building IDs**:
- **Building 18**: Electric Stove (电炉)
- **Building 5**: Fireplace/Stove (火炉)

**Building Logic**:
1. If Electric Stove (18) is active:
   - Add `c[4][0]` (13) to temperature
   - If Fireplace (5) is also active: add `floor(c[4][0] / 2)` (6) more
   - Total bonus: 13 + 6 = 19°C
2. Else if only Fireplace (5) is active:
   - Add `c[4][0]` (13) to temperature
3. Else:
   - No building bonus

**Weather Effects**:
- Weather ID 3 (Snow): `temperature: -2` (reduces temperature by 2°C)
- Other weathers: no temperature effect (or 0)

**Final Calculation**:
- Target temperature = `initTemperature() + buildingBonus + weatherEffect`
- Applied change = `targetTemperature - currentTemperature`
- This means temperature gradually moves toward the target, not instant

#### 3. `updateTemperatureEffect()` - Apply Temperature Range Effects
**Location**: `OriginalGame/src/game/player.js:996-1006`

```javascript
updateTemperatureEffect: function () {
    var attrRangeInfo = this.getAttrRangeInfo("temperature", this.temperature);
    if (attrRangeInfo) {
        var effect = attrRangeInfo.effect;
        for (var attr in effect) {
            if (this.hasOwnProperty(attr)) {
                this.changeAttr(attr, effect[attr]);
            }
        }
    }
}
```

**Temperature Range Effects** (from `playerAttrEffect.temperature`):
- Range 1 `[-,-10)`: No effect
- Range 2 `[-10,10]`: `infect: 1` (increases infection by 1)
- Range 3 `(10,-]`: No effect

**Note**: Temperature range is checked against actual temperature value (not percentage), unlike other attributes.

### When Temperature Updates

**Original Game**:
- Called in `updateByTime()` (hourly callback) - line 1627
- **NO check for `isInSleep`** - temperature updates even during sleep
- Called every hour regardless of sleep state

**Current Implementation**:
- Called in `processHourlyDecay()` (hourly callback)
- **HAS check**: `if (!this.sleepState.isSleeping)` - temperature does NOT update during sleep
- This is a **discrepancy** from original game

## Current Implementation Analysis

### Location
- **Main Logic**: `src/game/systems/SurvivalSystem.ts:352-396`

### Current Implementation Issues

#### Issue 1: Wrong Temperature Calculation Logic

**Current Code**:
```typescript
const changeRate = tempConfig[1] || 0  // This is day/night modifier, NOT a change rate!
let tempChange = changeRate !== 0 ? changeRate : 0
this.changeAttribute('temperature', tempChange)
```

**Problem**:
- Uses `tempConfig[1]` (day modifier) as a "change rate"
- Should calculate target temperature and apply difference
- Doesn't match original game logic

**Original Game Logic**:
```javascript
var temperature = this.initTemperature();  // Calculate target
// Add building bonuses
// Add weather effect
this.changeTemperature(temperature - this.temperature);  // Apply difference
```

#### Issue 2: Missing Building 18 (Electric Stove)

**Current Code**:
- Only checks Building 5 (Fireplace)
- Doesn't check Building 18 (Electric Stove)
- Missing the combined bonus logic

**Original Game Logic**:
- Check Building 18 first (Electric Stove)
- If Building 18 active: add 13, then check Building 5
- If Building 5 also active: add 6 more (total 19)
- If only Building 5 active: add 13
- If neither active: no bonus

#### Issue 3: Missing Weather Integration

**Current Code**:
- No weather effect applied
- Weather system may not be integrated yet

**Original Game Logic**:
- `temperature += this.weather.getValue("temperature")`
- Weather ID 3 (Snow) reduces temperature by 2°C

#### Issue 4: Sleep Check (User Request)

**Current Code**:
```typescript
if (!this.sleepState.isSleeping) {
    this.updateTemperature()
}
```

**Original Game**:
- No sleep check - temperature updates during sleep
- But user wants temperature to NOT change during sleep

**Decision**: User's request takes precedence - keep sleep check

#### Issue 5: Missing `updateTemperatureEffect()`

**Current Code**:
- Calls `updateTemperatureEffect()` at the end of `updateTemperature()`
- This is correct

**Original Game**:
- `updateTemperatureEffect()` is called separately in `updateByTime()` (line 1628)
- But it's also fine to call it at the end of `updateTemperature()`

## Temperature Config Structure

### Original Game Config
```javascript
"temperature": [
    [15, 2, -2],  // Spring: base=15, day=+2, night=-2
    [0, 2, -2],   // Summer: base=0, day=+2, night=-2
    [10, 2, -2],  // Autumn: base=10, day=+2, night=-2
    [18, 5, 0],   // Winter: base=18, day=+5, night=0
    [13]          // Default: used for building bonus (c[4][0] = 13)
]
```

### Current Config
```typescript
temperature: [
    [15, 2, -2],
    [0, 2, -2],
    [10, 2, -2],
    [18, 5, 0],
    [13],
]
```
✅ **Config matches original** - this is correct

## Key Discrepancies

### 1. Temperature Calculation Method

**Original**: Calculates target temperature, then applies difference
```javascript
var temperature = this.initTemperature();  // Target
temperature += buildingBonus;
temperature += weatherEffect;
this.changeTemperature(temperature - this.temperature);  // Difference
```

**Current**: Uses day modifier as change rate (WRONG)
```typescript
const changeRate = tempConfig[1] || 0  // Wrong: this is day modifier
this.changeAttribute('temperature', tempChange)  // Wrong: should be difference
```

**Impact**: Temperature changes incorrectly, doesn't account for buildings/weather properly

### 2. Missing Building 18 (Electric Stove)

**Original**: Checks Building 18 first, then Building 5
**Current**: Only checks Building 5

**Impact**: Electric Stove heating bonus not applied

### 3. Missing Weather Effect

**Original**: Adds weather temperature effect
**Current**: No weather integration

**Impact**: Weather doesn't affect temperature (e.g., snow doesn't make it colder)

### 4. Sleep Check (User Preference)

**Original**: No sleep check - temperature updates during sleep
**Current**: Has sleep check - temperature doesn't update during sleep

**Impact**: Matches user's expectation (temperature shouldn't change during sleep)

## Implementation Plan

### High Priority Fixes

1. **Fix Temperature Calculation**:
   - Implement `initTemperature()` method
   - Calculate target temperature (base + season + day/night)
   - Add building bonuses (Building 18 and 5)
   - Add weather effect
   - Apply difference: `target - current`

2. **Add Building 18 (Electric Stove) Check**:
   - Check if Building 18 is active
   - Apply combined bonus logic (18 + 5 = 19, or just 18 = 13, or just 5 = 13)

3. **Integrate Weather Effect**:
   - Get weather temperature value
   - Add to target temperature calculation

### Medium Priority

4. **Verify Sleep Check**:
   - Keep sleep check (user preference)
   - Document that this differs from original game

5. **Test Temperature Range Effects**:
   - Verify `updateTemperatureEffect()` works correctly
   - Test infection increase when temperature is in range [-10, 10]

## Testing Checklist

### Temperature Calculation Tests
- [ ] Spring day: base 15 + day 2 = 17°C
- [ ] Spring night: base 15 + night -2 = 13°C
- [ ] Winter day: base 18 + day 5 = 23°C
- [ ] Winter night: base 18 + night 0 = 18°C

### Building Effect Tests
- [ ] Electric Stove (18) only: +13°C
- [ ] Fireplace (5) only: +13°C
- [ ] Both Electric Stove (18) and Fireplace (5): +19°C (13 + 6)
- [ ] No buildings: no bonus

### Weather Effect Tests
- [ ] Snow weather (ID 3): -2°C
- [ ] Other weathers: no change (or 0)

### Sleep Tests
- [ ] Temperature doesn't change during sleep
- [ ] Temperature updates normally when not sleeping

### Temperature Range Effect Tests
- [ ] Temperature < -10°C: no infection effect
- [ ] Temperature -10°C to 10°C: infection +1 per hour
- [ ] Temperature > 10°C: no infection effect

## Notes

- The original game updates temperature during sleep, but user wants it to NOT change during sleep. This is a design decision that differs from the original.
- Building 18 is "Electric Stove" (电炉), Building 5 is "Fireplace/Stove" (火炉)
- Temperature config index 4 `[13]` is used for building bonuses, not as a season config
- Temperature is calculated as a target value, then the difference is applied gradually (not instant change)
- Weather system needs to be integrated for full temperature functionality

