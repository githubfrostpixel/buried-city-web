# Attribute System Crosscheck Plan

## Overview
This document crosschecks the original game's attribute system with the current React port implementation to identify discrepancies and ensure accurate attribute interactions.

## Attribute Change Flow

### Original Game: `changeAttr(key, value)`

**Location**: `OriginalGame/src/game/player.js:608-687`

**Process**:
1. **Buff Protection Check**: Check if buff prevents negative changes
   - `infect` + ITEM_1107022 buff → skip if negative
   - `starve` + ITEM_1107042 buff → skip if negative
   - `vigour` + ITEM_1107032 buff → skip if negative
   - `virus` + ITEM_1107052 buff → skip if negative

2. **Special Sleep Logic**: If vigour is max during sleep and HP is max, decrease spirit by 1
   ```javascript
   if (key == "vigour" && this.isInSleep && this[key] >= this[key + "Max"]) {
       if (this.hp >= this.hpMax) {
           this.changeSpirit(-1);
       }
   }
   ```

3. **Get Range Info**: Get attribute range info BEFORE change
   ```javascript
   var beforeRangeInfo = this.getAttrRangeInfo(key, this[key]);
   ```

4. **Apply Change**: Add value and round
   ```javascript
   this[key] += value;
   this[key] = Math.round(this[key]);
   ```

5. **Clamp Values**:
   - `temperature`: clamp to `[-2, temperatureMax]`
   - All others: clamp to `[0, attrMax]`

6. **Get Range Info After**: Get attribute range info AFTER change
   ```javascript
   var afterRangeInfo = this.getAttrRangeInfo(key, this[key]);
   ```

7. **Emit Event**: Emit change event
   ```javascript
   utils.emitter.emit(key + "_change", value);
   ```

8. **Range Change Messages**: Log messages when range changes (up/down)

9. **Special Attribute Handlers**:
   - **injury**: Call `updateHpMax()` (injury affects HP max)
   - **hp**: If HP reaches 0, call `die()`
   - **virus**: If virus >= virusMax, set HP to 0

### Current Implementation: `changeAttribute(attr, value)`

**Location**: `src/game/systems/SurvivalSystem.ts:288-324`

**Current Process**:
1. ✅ Special sleep logic (vigour max + HP max → decrease spirit)
2. ✅ Apply change and round
3. ✅ Clamp values (temperature: [-2, max], others: [0, max])
4. ✅ Update via playerStore
5. ❌ **MISSING**: Buff protection checks
6. ❌ **MISSING**: Before/after range info tracking
7. ❌ **MISSING**: Event emission
8. ❌ **MISSING**: Range change messages/logging
9. ❌ **MISSING**: Special handlers (injury → updateHpMax, hp → die, virus → set HP to 0)

## Attribute Update Functions

### Original Game: Hourly Updates

**Location**: `OriginalGame/src/game/player.js:769-880` (`updateByTime`)

**Hourly Decay Process**:
1. **Starve Decay**: Apply `changeByTime[0][0]` (typically -4)
2. **Auto Water Fix**: If water < waterMax, auto-consume water items
3. **Water Deduction**: 
   - Every 6 hours (21600s) normally, or 4 hours (14400s) in winter
   - Auto-consume water item if available, else reduce water by -3 (or -6 in winter)
4. **Water < 25**: Reduce HP by -20
5. **Vigour Decay** (based on location and time):
   - Day + Home/Bazaar: `changeByTime[2][0]` (-1)
   - Day + Field: `changeByTime[3][0]` (-2)
   - Night + Home/Bazaar: `changeByTime[4][0]` (-3)
   - Night + Field: `changeByTime[5][0]` (-4)
6. **Starve < 10**: Reduce HP by -8 (if no buff protection)
7. **Sleep Recovery**: If sleeping, recover vigour and HP hourly
8. **Weather Effects**: Apply weather vigour and spirit changes

**Then calls**:
- `updateTemperature()` - Calculate temperature based on season, buildings, weather
- `updateTemperatureEffect()` - Apply temperature range effects
- `updateStarve()` - Apply starve range effects
- `updateInjure()` - Apply injury range effects
- `updateInfect()` - Apply infection range effects
- `updateVigour()` - Apply vigour range effects

### Current Implementation: `processHourlyDecay()`

**Location**: `src/game/systems/SurvivalSystem.ts:81-108`

**Current Process**:
1. ✅ Starve decay (changeByTime[cycleIndex][0])
2. ❌ **MISSING**: Auto water fix (auto-consume water items)
3. ❌ **MISSING**: Water deduction logic (6h/4h intervals)
4. ❌ **MISSING**: Water < 25 → HP -20
5. ❌ **MISSING**: Vigour decay based on location/time
6. ❌ **MISSING**: Starve < 10 → HP -8
7. ❌ **MISSING**: Sleep recovery (now handled by timer, but hourly was removed)
8. ❌ **MISSING**: Weather effects
9. ✅ Calls updateStarve, updateInfect, updateVigour, updateInjury
10. ✅ Calls updateTemperature

## Attribute Range Effects

### Original Game: Range-Based Effects

Each attribute has range-based effects defined in `playerAttrEffect`:

#### Starve (Hunger)
- **Range 1** `[-,25]`: `spirit: -5`, `infect: 1.5`
- **Range 2** `(25,50]`: `spirit: -2`
- **Range 3** `(50,75]`: No effect
- **Range 4** `(75,-]`: No effect

**Update Function**: `updateStarve()` - Checks buff ITEM_1107042, applies effects

#### Infect (Infection)
- **Range 1** `[-,0]`: No effect
- **Range 2** `(0,25]`: No effect
- **Range 3** `(25,50]`: `hp: -6` (formula: `value * infect / 100`)
- **Range 4** `(50,75]`: `spirit: -1`, `infect: 1`, `hp: -12` (formula for HP)
- **Range 5** `(75,-]`: `spirit: -1`, `infect: 1`, `hp: -16` (formula for HP)

**Special Rules**:
- HP damage: `value * (infect / 100)` (formula-based)
- `infect` and `spirit` effects only apply if NOT in cure state (`!isInCure()`)
- Sets `deathCausedInfect = true` when applying HP damage

**Update Function**: `updateInfect()` - Checks buff ITEM_1107022, applies effects with special HP formula

#### Vigour (Energy)
- **Range 1** `[-,25]`: `spirit: -2`
- **Range 2** `(25,50]`: `spirit: -1`
- **Range 3** `(50,75]`: No effect
- **Range 4** `(75,-]`: No effect

**Update Function**: `updateVigour()` - Checks buff ITEM_1107032, applies effects

#### Injury (Wound)
- **Range 1** `[-,0]`: No effect
- **Range 2** `(0,25]`: No effect
- **Range 3** `(25,50]`: No effect
- **Range 4** `(50,75]`: `spirit: -1`, `infect: 1`
- **Range 5** `(75,-]`: `spirit: -1`, `infect: 2`

**Special Rules**:
- `infect` and `spirit` effects only apply if NOT in bind state (`!isInBind()`)
- When injury changes, calls `updateHpMax()` (injury reduces HP max)

**Update Function**: `updateInjure()` - Applies effects, checks bind state

#### Water (Thirst)
- **Range 1** `[-,25]`: `hp: -10`
- **Range 2** `(25,50]`: No effect
- **Range 3** `(50,75]`: No effect
- **Range 4** `(75,-]`: No effect

**Update Function**: `updateWater()` - Applies effects

#### Spirit (Mood)
- **Range 1** `[-,25]`: No effect
- **Range 2** `(25,50]`: No effect
- **Range 3** `(50,75]`: No effect
- **Range 4** `(75,-]`: No effect

**Update Function**: `updateSpirit()` - Currently no effects defined

#### Virus
- **Range 1** `[-,25]`: No effect
- **Range 2** `(25,50]`: No effect
- **Range 3** `(50,75]`: No effect
- **Range 4** `(75,-]`: No effect

**Special Rules**:
- When virus >= virusMax, sets HP to 0 (instant death)

**Update Function**: `updateVirus()` - Currently no range effects, but has special handler in `changeAttr`

#### Temperature
- **Range 1** `[-,-10)`: No effect
- **Range 2** `[-10,10]`: `infect: 1`
- **Range 3** `(10,-]`: No effect

**Update Function**: `updateTemperatureEffect()` - Applies temperature range effects

### Current Implementation: Range Effects

**Location**: `src/game/systems/SurvivalSystem.ts:139-272`

**Status**:
- ✅ `updateStarve()` - Implemented, but missing buff check
- ✅ `updateInfect()` - Implemented with HP formula, missing buff check, missing cure state check
- ✅ `updateVigour()` - Implemented, but missing buff check
- ✅ `updateInjury()` - Implemented with bind state check
- ✅ `updateWater()` - Implemented
- ✅ `updateSpirit()` - Implemented (no effects)
- ✅ `updateVirus()` - Implemented (no effects)
- ✅ `updateTemperature()` - Implemented
- ✅ `updateTemperatureEffect()` - Implemented

## Key Discrepancies

### 1. Missing Buff Protection Checks

**Original**: `changeAttr` checks buffs before applying negative changes
- ITEM_1107022 prevents negative infect changes
- ITEM_1107042 prevents negative starve changes
- ITEM_1107032 prevents negative vigour changes
- ITEM_1107052 prevents negative virus changes

**Current**: Buff checks are TODO comments, not implemented

**Impact**: Players with buff items won't be protected from negative attribute changes

### 2. Missing Before/After Range Tracking

**Original**: Tracks range info before and after change to log range transitions

**Current**: No range tracking for logging

**Impact**: No log messages when attributes cross range boundaries

### 3. Missing Event Emission

**Original**: Emits `{attr}_change` events

**Current**: TODO comment, not implemented

**Impact**: UI components can't react to attribute changes in real-time

### 4. Missing Special Attribute Handlers

**Original**: Special logic in `changeAttr`:
- `injury` → calls `updateHpMax()` (injury reduces HP max)
- `hp` → if HP = 0, calls `die()`
- `virus` → if virus >= virusMax, sets HP to 0

**Current**: 
- ❌ No `updateHpMax()` call when injury changes
- ❌ No death check when HP reaches 0
- ❌ No virus max check

**Impact**: 
- Injury doesn't reduce HP max
- Death from HP = 0 not triggered
- Death from virus overload not triggered

### 5. Missing Hourly Decay Features

**Original**: `updateByTime()` includes:
- Auto water fix (auto-consume water items)
- Water deduction every 6h/4h
- Water < 25 → HP -20
- Location/time-based vigour decay
- Starve < 10 → HP -8
- Weather effects

**Current**: Only implements starve decay from `changeByTime`

**Impact**: Many survival mechanics not working correctly

### 6. Missing Sleep Recovery in Hourly

**Original**: Sleep recovery happens hourly in `updateByTime()`:
```javascript
if (this.isInSleep) {
    // Calculate bed rate
    // Recover vigour and HP hourly
    this.changeVigour(vigour);
    this.changeHp(hp);
}
```

**Current**: Sleep recovery removed from hourly, now only via timer callback

**Impact**: Sleep recovery only happens at end of sleep, not during (but this matches new timer-based approach)

### 7. Missing Cure/Bind State Checks

**Original**: 
- `updateInfect()` checks `!isInCure()` before applying infect/spirit effects
- `updateInjure()` checks `!isInBind()` before applying infect/spirit effects

**Current**: 
- ✅ `updateInfect()` checks `!isInCure` (but `isInCure` is always false, TODO)
- ✅ `updateInjury()` checks `!isInBind` (but `isInBind` is always false, TODO)

**Impact**: Cure/bind states not implemented, so effects always apply

### 8. Missing HP Max Update

**Original**: `updateHpMax()` is called when injury changes:
```javascript
this.hpMax = this.hpMaxOrigin + hpBuffEffect - this.injury;
this.hp = Math.min(this.hp, this.hpMax);
```

**Current**: No HP max update logic

**Impact**: Injury doesn't reduce maximum HP

## Implementation Priority

### High Priority (Core Functionality)
1. **Special Attribute Handlers**:
   - HP = 0 → trigger death
   - Virus >= max → set HP to 0
   - Injury change → update HP max

2. **Hourly Decay Features**:
   - Water deduction logic
   - Location/time-based vigour decay
   - Water < 25 → HP -20
   - Starve < 10 → HP -8

3. **HP Max Update**: Implement `updateHpMax()` and call on injury change

### Medium Priority (Quality of Life)
4. **Event Emission**: Emit attribute change events for UI reactivity
5. **Range Change Logging**: Track and log range transitions
6. **Buff Protection**: Implement buff checks (requires buff system)

### Low Priority (Future Features)
7. **Cure/Bind States**: Implement medicine/bandage systems
8. **Weather Effects**: Integrate weather system
9. **Auto Water Fix**: Auto-consume water items when available

## Testing Checklist

### Attribute Change Tests
- [ ] Buff protection prevents negative changes
- [ ] Sleep vigour max + HP max → decreases spirit
- [ ] Values are rounded and clamped correctly
- [ ] Temperature clamped to [-2, max], others to [0, max]
- [ ] Events emitted on change
- [ ] Range transitions logged

### Special Handler Tests
- [ ] HP = 0 triggers death
- [ ] Virus >= max sets HP to 0
- [ ] Injury change updates HP max
- [ ] HP clamped to new max after injury

### Hourly Decay Tests
- [ ] Starve decays by changeByTime value
- [ ] Water deducted every 6h (or 4h in winter)
- [ ] Water < 25 reduces HP by 20
- [ ] Vigour decays based on location/time
- [ ] Starve < 10 reduces HP by 8
- [ ] Weather effects applied

### Range Effect Tests
- [ ] Starve range 1 → spirit -5, infect +1.5
- [ ] Infect range 3+ → HP damage formula applied
- [ ] Infect effects blocked by cure state
- [ ] Injury range 4+ → effects blocked by bind state
- [ ] Temperature range 2 → infect +1
- [ ] All range effects applied hourly

## Notes

- The original game's sleep recovery was hourly, but we've changed it to timer-based (all at once). This is a design decision that matches the user's request.
- Buff system needs to be implemented before buff protection can work.
- Medicine/bandage systems need to be implemented before cure/bind states can work.
- Weather system needs to be integrated before weather effects can work.

