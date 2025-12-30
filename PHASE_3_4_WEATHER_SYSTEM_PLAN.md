# Phase 3.4: Weather System - Implementation Plan

## Overview

This document provides a detailed cross-check and implementation plan for the Weather System, ensuring 1:1 functionality with the original game.

**Original Game File**: `OriginalGame/src/game/weather.js`  
**Target File**: `src/game/systems/WeatherSystem.ts`

---

## Cross-Check: What Exists vs What's Missing

### ✅ What Already Exists

1. **Weather Data** (`src/data/weather.ts`)
   - ✅ `weatherConfig`: All 5 weather types with effects
   - ✅ `weatherSystemConfig`: Season-based weather selection weights
   - ✅ Type definitions in `src/types/weather.types.ts`

2. **Basic Weather State** (`src/store/gameStore.ts`)
   - ✅ `weather: WeatherType` - Simple number (0-4)
   - ✅ `setWeather(weather: WeatherType)` - Basic setter
   - ❌ **MISSING**: WeatherSystem instance
   - ❌ **MISSING**: Weather forecast string
   - ❌ **MISSING**: Full weather state (Tomorrow, lastDays, etc.)

3. **UI Display** (`src/components/layout/TopBar.tsx`)
   - ✅ Weather icon display: `icon_weather_${gameStore.weather}.png`
   - ✅ Weather button with click handler
   - ✅ Position matches original (Cocos: `btnSize.width * 2.9 - 3, y: 25`)
   - ❌ **MISSING**: Weather name from WeatherSystem (using hardcoded array)
   - ❌ **MISSING**: Weather change event listener
   - ❌ **MISSING**: Weather forecast display

4. **Weather Effects in SurvivalSystem** (`src/game/systems/SurvivalSystem.ts`)
   - ✅ Temperature effect: `weather.temperature` applied
   - ❌ **MISSING**: Other weather effects (vigour, spirit, speed, etc.)
   - ❌ **MISSING**: Item-specific weather effects
   - ❌ **MISSING**: Building-specific weather effects (build_2)

5. **Save/Load** (`src/game/systems/saveSchemas.ts`)
   - ✅ Basic weather ID in save schema
   - ❌ **MISSING**: Full weather state (Tomorrow, Random, lastDays, aa)

6. **Utilities**
   - ✅ Event emitter (`src/utils/emitter.ts`)
   - ✅ Random utilities (`src/utils/random.ts`)
   - ❌ **MISSING**: `getRoundRandom()` - weighted random selection

### ❌ What's Missing

1. **WeatherSystem Class** (`src/game/systems/WeatherSystem.ts`)
   - ❌ Complete WeatherSystem implementation
   - ❌ Weather state management (Tomorrow array, lastDays, aa)
   - ❌ `checkWeather()` - Daily weather update logic
   - ❌ `changeWeather()` - Weather change with event emission
   - ❌ `Notice()` - Forecast generation
   - ❌ `getValue()` - Weather effect value getter
   - ❌ `getWeatherName()` - Localized weather name
   - ❌ Save/restore functionality

2. **TimeManager Integration**
   - ❌ Daily weather check callback (called at day/night transition)
   - ❌ Integration with TimeManager for season/day info

3. **GameStore Integration**
   - ❌ WeatherSystem instance in GameStore
   - ❌ Weather forecast string
   - ❌ Weather change event handling

4. **SurvivalSystem Integration**
   - ❌ Full weather effect application
   - ❌ Item-specific weather effects
   - ❌ Building-specific weather effects

5. **UI Integration**
   - ❌ Weather change event listener in TopBar
   - ❌ Weather name from WeatherSystem (not hardcoded)
   - ❌ Weather forecast display (optional, for status dialog)

6. **Utilities**
   - ❌ `getRoundRandom()` function for weighted random selection

7. **Localization**
   - ❌ Weather name strings (string ID 3014)
   - ❌ Weather change log messages (string ID 3015)

---

## Original Game Functionality Analysis

### Weather Types (from `OriginalGame/src/game/weather.js`)

```javascript
var Weather = {
    CLOUDY: 0,    // Clear/Cloudy (default)
    SUNSHINY: 1, // Sunny
    RAIN: 2,     // Rain
    SNOW: 3,     // Snow
    FOG: 4       // Fog/Storm
};
```

**Note**: The original uses `CLOUDY = 0` but the UI shows "Clear". This is the default/clear weather.

### WeatherSystem State

```javascript
{
    weatherId: 0,           // Current weather type (0-4)
    Tomorrow: [0, 0],       // Array of next weather predictions
    Random: "Clear",        // Random forecast string for display
    lastDays: 0,           // Days current weather has lasted
    aa: true,              // Boolean flag (preserve for compatibility)
    weatherConfig: {...}   // Current weather's config object
}
```

### Key Methods

1. **`checkWeather()`** - Called daily at day/night transition
   - If `weatherId == 0` (Clear): Roll new weather based on season
   - If non-Clear: Increment `lastDays`, change when `lastDays >= weatherConfig.lastDays`
   - Special logic to prevent consecutive abnormal weather

2. **`changeWeather(weatherId, sendLog)`**
   - Updates weather state
   - Emits `weather_change` event
   - Updates forecast (`Notice()`)
   - Logs weather change if `sendLog = true`

3. **`Notice()`** - Generates random forecast
   - 80% chance: Show tomorrow's weather (`Tomorrow[1]`)
   - 20% chance: Random weather string

4. **`getValue(key)`** - Gets weather effect value
   - Returns `weatherConfig[key]` or `0`

5. **`getWeatherName()`** - Gets localized name
   - Returns `stringUtil.getString(3014)[weatherId]`

### Weather Check Logic (from `OriginalGame/src/game/player.js:1589`)

```javascript
cc.timer.addTimerCallbackDayAndNight(null, function (flag) {
    if (flag === 'day') {
        // ... other day logic ...
        self.weather.checkWeather();  // Called at day transition
        // ...
    }
});
```

**Important**: Weather is checked at **day transition** (6:00 AM), not midnight.

---

## Implementation Plan

### Step 1: Add Weighted Random Utility

**File**: `src/utils/random.ts`

Add `getRoundRandom()` function:

```typescript
/**
 * Get weighted random selection from list
 * Ported from OriginalGame/src/util/utils.js:getRoundRandom
 * 
 * @param list Array of objects with 'weight' property
 * @returns Selected object from list
 */
export function getRoundRandom<T extends { weight: number }>(list: T[]): T {
  if (list.length === 0) {
    throw new Error('getRoundRandom: list cannot be empty')
  }
  
  // Calculate total weight
  let total = 0
  list.forEach((obj) => {
    total += obj.weight
  })
  
  // Generate random number
  const rand = getRandomInt(0, total - 1)
  
  // Find selected object
  let w = 0
  for (let i = 0; i < list.length; ++i) {
    const obj = list[i]
    w += obj.weight
    if (rand < w) {
      return obj
    }
  }
  
  // Fallback (should never reach here)
  return list[list.length - 1]
}
```

### Step 2: Create WeatherSystem Class

**File**: `src/game/systems/WeatherSystem.ts`

**Complete Implementation**:

```typescript
/**
 * Weather System
 * Ported from OriginalGame/src/game/weather.js
 * 
 * Manages weather state, daily weather changes, and weather effects
 */

import type { WeatherType, Season } from '@/types/game.types'
import type { WeatherConfig, WeatherSystemEntry } from '@/types/weather.types'
import { weatherConfig, weatherSystemConfig } from '@/data/weather'
import { emitter } from '@/utils/emitter'
import { getRoundRandom } from '@/utils/random'
import { getRandomInt } from '@/utils/random'
import { useLogStore } from '@/store/logStore'

export interface WeatherSaveData {
  weatherId: WeatherType
  Tomorrow: [WeatherType, WeatherType]
  Random: string
  lastDays: number
  aa: boolean
}

export class WeatherSystem {
  private weatherId: WeatherType
  private Tomorrow: [WeatherType, WeatherType]
  private Random: string
  private lastDays: number
  private aa: boolean
  private weatherConfig: WeatherConfig

  constructor() {
    this.weatherId = 0 // CLOUDY/Clear
    this.Tomorrow = [0, 0]
    this.Random = this.getStr(0)
    this.lastDays = 0
    this.aa = true

    this.changeWeather(this.weatherId, false)
  }

  /**
   * Save weather state
   */
  save(): WeatherSaveData {
    return {
      weatherId: this.weatherId,
      Tomorrow: this.Tomorrow,
      Random: this.Random,
      lastDays: this.lastDays,
      aa: this.aa
    }
  }

  /**
   * Restore weather state
   */
  restore(saveObj: WeatherSaveData | null): void {
    if (saveObj) {
      this.weatherId = saveObj.weatherId
      this.Tomorrow = saveObj.Tomorrow
      this.Random = saveObj.Random
      this.aa = saveObj.aa
      this.lastDays = saveObj.lastDays

      this.changeWeather(this.weatherId, false)
    }
  }

  /**
   * Check and update weather (called daily at day transition)
   * Ported from OriginalGame/src/game/weather.js:checkWeather
   */
  checkWeather(season: Season, day: number): void {
    if (this.weatherId === 0) {
      // Current weather is Clear - roll for new weather
      const seasonKey = season.toString()
      const randomWeather = weatherSystemConfig[seasonKey]
      
      if (!randomWeather) {
        console.warn(`WeatherSystem: No weather config for season ${season}`)
        return
      }

      const weatherInfo = getRoundRandom(randomWeather)
      
      // Special check to reduce chance of consecutive abnormal weather
      // If tomorrow[1] is not Clear and we rolled non-Clear, 50% chance to force Clear
      if (weatherInfo.weatherId !== '0' && this.Tomorrow[1] !== 0 && Math.random() > 0.5) {
        weatherInfo.weatherId = '0'
      }

      // Update Tomorrow array (shift and push)
      this.Tomorrow.push(parseInt(weatherInfo.weatherId) as WeatherType)
      this.Tomorrow.shift()
      
      // Set new weather
      this.weatherId = this.Tomorrow[0]
      this.changeWeather(this.weatherId, true)
    } else {
      // Current weather is not Clear - increment lastDays
      this.lastDays++
      
      if (this.lastDays >= (this.weatherConfig.lastDays || 0)) {
        // Weather duration expired - change to Clear
        this.Tomorrow.push(0)
        this.Tomorrow.shift()
        this.weatherId = this.Tomorrow[0]
        this.changeWeather(this.weatherId, true)
      }
    }
  }

  /**
   * Change weather
   * Ported from OriginalGame/src/game/weather.js:changeWeather
   */
  changeWeather(weatherId: WeatherType, sendLog?: boolean): void {
    this.weatherId = weatherId
    this.weatherConfig = weatherConfig[weatherId.toString()]
    this.lastDays = 0
    this.Notice()

    // Emit weather change event
    emitter.emit('weather_change', weatherId)

    // Log weather change if requested
    if (sendLog) {
      // TODO: Get localized string (string ID 3015)
      const weatherName = this.getWeatherName()
      const logStore = useLogStore.getState()
      logStore.addLog(`Weather changed to ${weatherName}`)
      // Original: player.log.addMsg(stringUtil.getString(3015)[this.weatherId])
    }
  }

  /**
   * Generate random forecast
   * Ported from OriginalGame/src/game/weather.js:Notice
   */
  private Notice(): void {
    let str: string
    if (Math.random() >= 0.2) {
      // 80% chance: Show tomorrow's weather
      str = this.getStr(this.Tomorrow[1])
    } else {
      // 20% chance: Random weather string
      str = this.getStr(getRandomInt(0, 4) as WeatherType)
    }
    this.Random = str
  }

  /**
   * Get weather effect value
   * Ported from OriginalGame/src/game/weather.js:getValue
   */
  getValue(key: string): number {
    if (this.weatherConfig[key] !== undefined) {
      return this.weatherConfig[key] as number
    }
    return 0
  }

  /**
   * Get weather name (localized)
   * Ported from OriginalGame/src/game/weather.js:getWeatherName
   */
  getWeatherName(): string {
    // TODO: Get from localization (string ID 3014)
    // For now, use hardcoded names matching TopBar
    const names = ['Clear', 'Cloudy', 'Rain', 'Snow', 'Storm']
    return names[this.weatherId] || 'Unknown'
  }

  /**
   * Get weather string by ID
   * Ported from OriginalGame/src/game/weather.js:getStr
   */
  private getStr(weatherId: WeatherType): string {
    return this.getWeatherName()
  }

  /**
   * Get current weather ID
   */
  getCurrentWeather(): WeatherType {
    return this.weatherId
  }

  /**
   * Get current weather config
   */
  getWeatherConfig(): WeatherConfig {
    return this.weatherConfig
  }

  /**
   * Get forecast string
   */
  getForecast(): string {
    return this.Random
  }
}
```

### Step 3: Integrate with GameStore

**File**: `src/store/gameStore.ts`

Update GameStore to include WeatherSystem:

```typescript
import { WeatherSystem } from '@/game/systems/WeatherSystem'
import type { WeatherSaveData } from '@/game/systems/WeatherSystem'

interface GameStore extends GameState {
  // ... existing fields ...
  
  // Weather System
  weatherSystem: WeatherSystem
  weather: WeatherType
  weatherForecast: string
  
  // Actions
  // ... existing actions ...
  setWeather: (weather: WeatherType) => void
  updateWeather: () => void
  initializeWeatherSystem: () => void
}

export const useGameStore = create<GameStore>((set, get) => {
  // Initialize WeatherSystem
  const weatherSystem = new WeatherSystem()
  
  return {
    // ... existing state ...
    weatherSystem,
    weather: weatherSystem.getCurrentWeather(),
    weatherForecast: weatherSystem.getForecast(),
    
    // ... existing actions ...
    
    setWeather: (weather: WeatherType) => {
      const ws = get().weatherSystem
      ws.changeWeather(weather, false)
      set({
        weather: ws.getCurrentWeather(),
        weatherForecast: ws.getForecast()
      })
    },
    
    updateWeather: () => {
      const ws = get().weatherSystem
      set({
        weather: ws.getCurrentWeather(),
        weatherForecast: ws.getForecast()
      })
    },
    
    initializeWeatherSystem: () => {
      const ws = get().weatherSystem
      set({
        weather: ws.getCurrentWeather(),
        weatherForecast: ws.getForecast()
      })
    }
  }
})
```

### Step 4: Integrate with TimeManager

**File**: `src/game/Game.ts`

Add weather check callback at day transition:

```typescript
import { WeatherSystem } from './systems/WeatherSystem'

class Game {
  // ... existing fields ...
  private weatherSystem: WeatherSystem

  private constructor() {
    // ... existing initialization ...
    
    // Initialize WeatherSystem
    this.weatherSystem = new WeatherSystem()
    
    // Add weather check at day transition (6:00 AM)
    this.timeManager.addTimerCallbackDayAndNight(null, (stage: TimeOfDay) => {
      if (stage === 'day') {
        const gameStore = useGameStore.getState()
        const season = gameStore.season
        const day = gameStore.day
        
        // Check and update weather
        this.weatherSystem.checkWeather(season, day)
        
        // Update GameStore
        gameStore.updateWeather()
      }
    })
  }
  
  // ... rest of class ...
}
```

### Step 5: Update Save Schema

**File**: `src/game/systems/saveSchemas.ts`

Update `GameSaveDataSchema`:

```typescript
const WeatherSaveDataSchema = z.object({
  weatherId: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  Tomorrow: z.tuple([
    z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
  ]),
  Random: z.string(),
  lastDays: z.number().int(),
  aa: z.boolean()
})

const GameSaveDataSchema = z.object({
  // ... existing fields ...
  weather: WeatherSaveDataSchema  // Replace simple weather: z.number()
})
```

**File**: `src/game/systems/SaveSystem.ts`

Update save/load:

```typescript
// In save()
const gameState = {
  // ... existing fields ...
  weather: gameStore.weatherSystem.save()
}

// In load()
if (saveData.game.weather) {
  gameStore.weatherSystem.restore(saveData.game.weather)
  gameStore.updateWeather()
}
```

### Step 6: Update TopBar UI

**File**: `src/components/layout/TopBar.tsx`

Update to use WeatherSystem:

```typescript
import { useEffect } from 'react'
import { emitter } from '@/utils/emitter'

export function TopBar({ testLogs = [] }: TopBarProps = {}) {
  const gameStore = useGameStore()
  // ... existing code ...
  
  // Listen for weather change events
  useEffect(() => {
    const handleWeatherChange = (weatherId: WeatherType) => {
      // WeatherSystem already updated GameStore
      // This just triggers re-render
      gameStore.updateWeather()
    }
    
    emitter.on('weather_change', handleWeatherChange)
    
    return () => {
      emitter.off('weather_change', handleWeatherChange)
    }
  }, [])
  
  // Update weather button to use WeatherSystem name
  const weatherName = gameStore.weatherSystem?.getWeatherName() || getWeatherName(gameStore.weather)
  
  // ... in JSX ...
  <StatusButton
    icon={`icon_weather_${gameStore.weather}.png`}
    iconAtlas="icon"
    label=""
    position={{ x: btnSize.width * 2.7 - 3, y: 25 }}
    scale={0.4}
    noLabel={true}
    onClick={() => showStatusDialog(11, weatherName, 'icon_weather.png')}
  />
}
```

### Step 7: Update SurvivalSystem Weather Effects

**File**: `src/game/systems/SurvivalSystem.ts`

Add full weather effect application:

```typescript
/**
 * Apply weather effects to player attributes
 */
private applyWeatherEffects(): void {
  const gameStore = useGameStore.getState()
  const weatherSystem = gameStore.weatherSystem
  const weatherConfig = weatherSystem.getWeatherConfig()
  
  // Apply vigour effect
  if (weatherConfig.vigour !== undefined) {
    this.changeAttribute('vigour', weatherConfig.vigour)
  }
  
  // Apply spirit effect
  if (weatherConfig.spirit !== undefined) {
    this.changeAttribute('spirit', weatherConfig.spirit)
  }
  
  // Temperature effect already applied in updateTemperature()
  
  // Apply item-specific effects
  const playerStore = usePlayerStore.getState()
  Object.keys(weatherConfig).forEach((key) => {
    if (key.startsWith('item_')) {
      const itemId = key.replace('item_', '')
      const itemCount = playerStore.bag[itemId] || playerStore.storage[itemId] || 0
      if (itemCount > 0) {
        const effect = weatherConfig[key] as number
        // Apply effect based on item count
        // TODO: Implement item-specific weather effects
      }
    }
  })
  
  // Apply building-specific effects
  if (weatherConfig.build_2 !== undefined) {
    // Building ID 2 effect
    // TODO: Check if building 2 is active and apply effect
  }
}

// Call in processHourlyDecay() or appropriate place
```

---

## Testing Checklist

### Core Functionality
- [ ] WeatherSystem initializes with Clear weather (0)
- [ ] Weather changes daily at day transition
- [ ] Weather selection respects season weights
- [ ] Non-Clear weather lasts for `lastDays` duration
- [ ] Weather forecast updates correctly
- [ ] Weather change event emits correctly
- [ ] Weather change logged when `sendLog = true`

### Weather Selection Logic
- [ ] Clear weather rolls new weather based on season
- [ ] Non-Clear weather increments `lastDays` correctly
- [ ] Weather changes to Clear when `lastDays >= lastDays`
- [ ] Consecutive abnormal weather prevention works (50% chance)

### Save/Load
- [ ] Weather state saves correctly
- [ ] Weather state restores correctly
- [ ] Weather persists across game sessions

### UI Integration
- [ ] Weather icon updates on weather change
- [ ] Weather name displays correctly
- [ ] Weather button click shows correct dialog
- [ ] Weather change event updates TopBar

### Weather Effects
- [ ] Temperature effect applied (already working)
- [ ] Vigour effect applied
- [ ] Spirit effect applied
- [ ] Speed effect applied (for travel system)
- [ ] Gun accuracy effect (for combat system - Phase 4)
- [ ] Monster speed effect (for combat system - Phase 4)

### Edge Cases
- [ ] Weather system handles missing season config
- [ ] Weather system handles invalid weather IDs
- [ ] Weather forecast generates correctly
- [ ] Weather effects handle missing config values

---

## UI Position Verification (1:1 Original Game)

**Original Cocos Position** (`OriginalGame/src/ui/topFrame.js:70`):
```javascript
weather.setPosition(btnSize.width * 2.9 - 3, this.firstLine.getContentSize().height / 2);
```

**Current React Position** (`src/components/layout/TopBar.tsx:151`):
```typescript
position={{ x: btnSize.width * 2.7 - 3, y: 25 }}
```

**Issue**: Position calculation differs slightly. Original uses `2.9`, current uses `2.7`.

**Fix**: Update to match original:
```typescript
position={{ x: btnSize.width * 2.9 - 3, y: 25 }}
```

**Verification**:
- ✅ Scale: `0.4` (matches original)
- ✅ `noLabel={true}` (matches original)
- ✅ Icon: `icon_weather_${weatherId}.png` (matches original)
- ✅ Click handler: Status dialog with string ID 11 (matches original)

---

## Dependencies Summary

### Required Files
1. ✅ `src/data/weather.ts` - Weather configs (exists)
2. ✅ `src/types/weather.types.ts` - Type definitions (exists)
3. ✅ `src/utils/emitter.ts` - Event emitter (exists)
4. ✅ `src/utils/random.ts` - Random utilities (exists, needs `getRoundRandom`)
5. ❌ `src/game/systems/WeatherSystem.ts` - **NEW**
6. ❌ `src/utils/random.ts` - **UPDATE** (add `getRoundRandom`)

### Integration Points
1. `src/store/gameStore.ts` - **UPDATE** (add WeatherSystem)
2. `src/game/Game.ts` - **UPDATE** (add weather check callback)
3. `src/game/systems/saveSchemas.ts` - **UPDATE** (weather save schema)
4. `src/game/systems/SaveSystem.ts` - **UPDATE** (save/load weather)
5. `src/components/layout/TopBar.tsx` - **UPDATE** (weather event listener)
6. `src/game/systems/SurvivalSystem.ts` - **UPDATE** (full weather effects)

### Future Dependencies (Phase 4)
- CombatSystem: Gun accuracy and monster speed modifiers
- Localization: Weather name strings (ID 3014, 3015)

---

## Implementation Order

1. **Step 1**: Add `getRoundRandom()` utility
2. **Step 2**: Create `WeatherSystem.ts` class
3. **Step 3**: Integrate with GameStore
4. **Step 4**: Integrate with TimeManager (day transition callback)
5. **Step 5**: Update save schema and SaveSystem
6. **Step 6**: Update TopBar UI (event listener, weather name)
7. **Step 7**: Update SurvivalSystem (full weather effects)
8. **Step 8**: Fix TopBar weather button position (2.9 instead of 2.7)
9. **Step 9**: Testing

---

## Notes

1. **Weather Check Timing**: Weather is checked at **day transition** (6:00 AM), not midnight. This matches the original game.

2. **Weather Names**: Currently using hardcoded English names. Will need localization integration later (string ID 3014).

3. **Weather Log Messages**: Currently using placeholder. Will need localization (string ID 3015).

4. **Weather Effects**: Some effects (gun accuracy, monster speed) will be applied in Phase 4 (Combat System).

5. **Position Fix**: TopBar weather button position needs correction from `2.7` to `2.9` to match original.

6. **Event Emission**: Weather change event is emitted for UI updates. TopBar should listen to this event.

7. **Save Compatibility**: Weather save data includes all state (Tomorrow, Random, lastDays, aa) for full compatibility.

---

## Estimated Timeline

- Step 1: 30 minutes
- Step 2: 2 hours
- Step 3: 1 hour
- Step 4: 1 hour
- Step 5: 1 hour
- Step 6: 1 hour
- Step 7: 1 hour
- Step 8: 15 minutes
- Step 9: 2 hours

**Total: ~10 hours (1.5 days)**


