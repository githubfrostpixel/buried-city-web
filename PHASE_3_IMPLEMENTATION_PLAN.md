# Phase 3: World & Exploration - Implementation Plan

## Overview

This document outlines the detailed implementation plan for Phase 3: World & Exploration. This phase focuses on implementing the map system, site exploration system, travel mechanics, and weather system integration.

**Prerequisites**: Phase 2 must be complete (Survival System, Item System, Storage System, Building System, Home Scene UI)

---

## 3.1 Map System

### Requirements Analysis

From `OriginalGame/src/game/map.js`:

**Core Functionality:**
- Manages all sites (locations) on the world map
- Tracks NPC locations
- Handles site discovery/unlocking
- Manages player position on map
- Site closing/deletion mechanics
- Save/restore map state

**Key Features:**
- `npcMap`: Tracks which NPCs are unlocked (object with NPC IDs as keys)
- `siteMap`: Stores all Site instances (object with site IDs as keys)
- `pos`: Current player position on map (x, y coordinates)
- `needDeleteSiteList`: Sites queued for deletion
- `forEach()`: Iterates over all NPCs and sites
- `unlockSite()`: Creates and unlocks a new site
- `unlockNpc()`: Unlocks an NPC location
- `closeSite()`: Queues a site for deletion
- `deleteUnusableSite()`: Removes sites that can be closed
- `getSite()`: Retrieves a site by ID
- `resetPos()`: Resets player position to home

**Site Types:**
- `HOME_SITE = 100`: Player's home
- `AD_SITE = 202`: Junkyard (ad location)
- `BOSS_SITE = 61`: Boss location
- `WORK_SITE = 204`: Power plant (work site)
- `GAS_SITE = 201`: Gas station
- `BAZAAR_SITE = 400`: Shop/bazaar

**Initialization:**
- Default sites: `[100, 201, 202, 204, 400]` (home, gas, ad, work, bazaar)
- Full unlock (IAP): `[1,2,3,4,5,6,7,8,9,10,11,12,13,14,20,21,22,30,31,32,33,41,42,43,51,52,61,100,201,202,203,204,301,302,303,304,305,306,307,308,309,310,311,312,400,500,501,502,666]`
- Home position: `{x: 45, y: 50}`

### Implementation Plan

**File**: `src/game/world/Map.ts`

**Core Class Structure:**
```typescript
export class Map {
  private npcMap: Record<number, boolean>
  private siteMap: Record<number, Site>
  private needDeleteSiteList: number[]
  public pos: { x: number; y: number }
  
  constructor()
  save(): MapSaveData
  restore(saveObj: MapSaveData | null): void
  init(): void
  forEach(callback: (entity: Site | NPC) => void): void
  unlockNpc(npcId: number): void
  unlockSite(siteId: number): void
  closeSite(siteId: number): void
  deleteUnusableSite(): void
  updatePos(pos: { x: number; y: number }): void
  getSite(siteId: number): Site | undefined
  resetPos(): void
}
```

**Dependencies:**
- `Site` class (from 3.2)
- `NPC` class (Phase 5, but need interface)
- Site config data (from `data/sites.ts`)
- Event emitter for `unlock_site` and `close_site` events

**Integration Points:**
- PlayerStore: `map` property to store Map instance
- SaveSystem: Include map data in save schema
- UI: MapScene will use Map instance to render locations

### Save Schema Updates

**File**: `src/game/systems/saveSchemas.ts`

Add to `GameSaveDataSchema`:
```typescript
map: z.object({
  npcMap: z.array(z.number().int()),
  siteMap: z.record(z.string(), z.any()), // Site save data
  pos: z.object({
    x: z.number(),
    y: z.number()
  }),
  needDeleteSiteList: z.array(z.number().int())
})
```

---

## 3.2 Site System

### Requirements Analysis

From `OriginalGame/src/game/site.js`:

**BaseSite:**
- Base class with random position generation
- `pos`: Position on map

**Site (Normal Site):**
- `id`: Site ID
- `config`: Site configuration from `siteConfig`
- `pos`: Position (from config.coordinate)
- `storage`: Site-specific storage container
- `step`: Current exploration progress (room index)
- `rooms`: Array of rooms (battle/work rooms)
- `secretRoomsConfig`: Secret room configuration
- `secretRoomsShowedCount`: Number of secret rooms found
- `isSecretRoomsEntryShowed`: Whether secret room entry is visible
- `isInSecretRooms`: Whether player is in secret rooms
- `secretRooms`: Array of secret room data
- `secretRoomsStep`: Current secret room progress
- `isUnderAttacked`: Whether site is under attack
- `haveNewItems`: Whether site has new items
- `isActive`: Whether site is active
- `fixedTime`: Time when site was fixed (for work sites)
- `closed`: Whether site is closed

**Site Methods:**
- `init()`: Generates rooms for exploration
- `genRooms()`: Creates battle and work rooms
- `genBattleRoom()`: Generates battle rooms with difficulty
- `genWorkRoom()`: Generates work rooms with item rewards
- `roomBegin()`: Gets current room
- `roomEnd(isWin)`: Advances to next room
- `siteEnd()`: Handles site completion (unlocks new sites/NPCs)
- `isSiteEnd()`: Checks if all rooms cleared
- `getProgressStr()`: Returns progress string (e.g., "2/5")
- `getCurrentProgressStr()`: Returns current room indicator
- `canClose()`: Checks if site can be closed
- `testSecretRoomsBegin()`: Tests for secret room discovery
- `enterSecretRooms()`: Enters secret rooms
- `secretRoomBegin()`: Gets current secret room
- `secretRoomEnd()`: Advances secret room progress
- `genSecretRooms()`: Generates secret room sequence
- `increaseItem()`: Adds item to site storage
- `getAllItemNum()`: Gets total item count in storage

**Special Site Types:**

**AdSite (ID 202):**
- Extends Site
- No room generation
- Always returns `false` for `isSiteEnd()`
- Progress shows "???"

**BazaarSite (ID 400):**
- Extends Site
- No room generation
- Always returns `false` for `isSiteEnd()`
- Progress shows "???"

**WorkSite (ID 201, 204):**
- Extends Site
- `fix()`: Activates site (power plant/gas station)
- `checkActive()`: Checks if site broke down
- `canClose()`: Always returns `false`

**BossSite (ID 61):**
- Extends Site
- `bossSubSiteIds`: Array of sub-site IDs `[301-312]`
- Progress tracks completed sub-sites
- `getAllItemNum()`: Sums items from all sub-sites

**Room Types:**
- Battle rooms: Monster encounters with difficulty
- Work rooms: Resource gathering with item rewards
- Secret rooms: Special hidden rooms with better rewards

**Room Generation Logic:**
- Battle rooms: Random difficulty within site's difficulty range
- Work rooms: Items distributed randomly across work rooms
- Last room is always a work room (if work rooms exist)
- Rooms shuffled randomly

### Implementation Plan

**File**: `src/game/world/Site.ts`

**Base Classes:**
```typescript
export class BaseSite {
  public pos: { x: number; y: number }
  constructor()
}

export class Site extends BaseSite {
  public id: number
  public config: SiteConfig
  public storage: Storage
  public step: number
  public rooms: Room[]
  public secretRoomsConfig?: SecretRoomConfig
  public secretRoomsShowedCount: number
  public isSecretRoomsEntryShowed: boolean
  public isInSecretRooms: boolean
  public secretRooms: Room[]
  public secretRoomsStep: number
  public isUnderAttacked: boolean
  public haveNewItems: boolean
  public isActive: boolean
  public fixedTime: number
  public closed: boolean
  
  constructor(siteId: number)
  init(): void
  genRooms(): void
  genBattleRoom(): Room[]
  genWorkRoom(): Item[][]
  roomBegin(): Room | undefined
  roomEnd(isWin: boolean): void
  siteEnd(): void
  isSiteEnd(): boolean
  getProgressStr(): string
  getCurrentProgressStr(): string
  canClose(): boolean
  testSecretRoomsBegin(): void
  enterSecretRooms(): void
  secretRoomBegin(): Room | undefined
  secretRoomEnd(): void
  genSecretRooms(): void
  increaseItem(itemId: string, num: number): void
  getAllItemNum(): number
  getName(): string
  getDes(): string
  save(): SiteSaveData
  restore(saveObj: SiteSaveData | null): void
}

export class AdSite extends Site {
  // Override methods
}

export class BazaarSite extends Site {
  // Override methods
}

export class WorkSite extends Site {
  fix(): void
  checkActive(): void
  // Override canClose()
}

export class BossSite extends Site {
  public bossSubSiteIds: number[]
  // Override methods
}
```

**Dependencies:**
- `Storage` class (from Phase 2)
- `Room` class (from Phase 2, `src/game/world/Room.ts`)
- `Item` class (from Phase 2)
- Site config data (from `data/sites.ts`)
- Secret rooms config (from `data/secretRooms.ts`)
- Monster generation utilities (Phase 4)
- Item generation utilities (Phase 2)

**Site Constants:**
```typescript
export const HOME_SITE = 100
export const AD_SITE = 202
export const BOSS_SITE = 61
export const WORK_SITE = 204
export const GAS_SITE = 201
export const BAZAAR_SITE = 400
```

**File**: `src/data/sites.ts`

Convert `OriginalGame/src/data/siteConfig.js` to TypeScript:
- Export `siteConfig` as `SiteConfigMap`
- Type all site configurations
- Preserve all coordinate, room, and item data

### Save Schema Updates

**File**: `src/game/systems/saveSchemas.ts`

Update `SiteSaveDataSchema`:
```typescript
const SiteSaveDataSchema = z.object({
  id: z.number().int(),
  pos: z.object({
    x: z.number(),
    y: z.number()
  }),
  step: z.number().int(),
  rooms: z.array(z.any()), // Room save data
  storage: z.any(), // Storage save data
  secretRoomsShowedCount: z.number().int().optional(),
  isSecretRoomsEntryShowed: z.boolean().optional(),
  isInSecretRooms: z.boolean().optional(),
  secretRooms: z.array(z.any()).optional(),
  secretRoomsStep: z.number().int().optional(),
  secretRoomType: z.number().int().optional(),
  closed: z.boolean().optional(),
  isUnderAttacked: z.boolean().optional(),
  haveNewItems: z.boolean().optional(),
  isActive: z.boolean().optional(),
  fixedTime: z.number().optional()
})
```

---

## 3.3 Travel System

### Requirements Analysis

From `OriginalGame/src/ui/MapNode.js` and travel mechanics:

**Travel Mechanics:**
- Distance calculation: `cc.pDistance(startPos, endPos)`
- Fuel consumption: `Math.ceil(distance / 80)` per trip
- Travel time: `distance / maxVelocity`
- Max velocity depends on:
  - Motorcycle usage (if has motorcycle item 1305034)
  - Fuel availability
  - Base walking speed vs motorcycle speed

**Travel Features:**
- Motorcycle: Requires item `1305034` and fuel
- Fuel consumption: 1 fuel per 795 distance units during travel
- Time acceleration: Uses `cc.timer.accelerate(time, multiplier)`
- Multiplier: 2x if has item `1306001`, else 3x
- Distance tracking: `player.totalDistance` and `player.dogDistance`
- Random encounters: Distance-based zombie/bandit encounters
- Shoe durability: Decreases during travel (if walking)
- Dog bonuses: Dog accompaniment affects travel

**Random Encounters:**
- Based on distance traveled since last check
- Probability based on day range (from `RandomBattleConfig.strength`)
- Triggers `player.randomAttack()` callback
- Pauses travel during encounter

**Travel States:**
- `MAP_IS_MOVING`: Global flag for travel in progress
- `actor.isMoving`: Per-actor movement state
- `actor.paused`: Paused for encounters

### Implementation Plan

**File**: `src/game/world/TravelSystem.ts`

**Core Class:**
```typescript
export class TravelSystem {
  calculateDistance(start: { x: number; y: number }, end: { x: number; y: number }): number
  calculateFuelNeeded(distance: number): number
  calculateTravelTime(distance: number, hasMotorcycle: boolean, hasFuel: boolean): number
  getMaxVelocity(hasMotorcycle: boolean, hasFuel: boolean): number
  canUseMotorcycle(player: PlayerState): boolean
  startTravel(
    startPos: { x: number; y: number },
    endPos: { x: number; y: number },
    onComplete: () => void,
    onEncounter?: () => void
  ): TravelState
  updateTravel(deltaTime: number, travelState: TravelState): void
  checkRandomEncounter(
    distanceTraveled: number,
    currentDay: number
  ): boolean
  consumeFuel(distance: number, hasMotorcycle: boolean): number
  consumeShoeDurability(distance: number, hasMotorcycle: boolean): void
}
```

**Travel State:**
```typescript
export interface TravelState {
  isTraveling: boolean
  startPos: { x: number; y: number }
  endPos: { x: number; y: number }
  currentPos: { x: number; y: number }
  distance: number
  distanceTraveled: number
  lastCheckPos: { x: number; y: number }
  travelTime: number
  elapsedTime: number
  hasMotorcycle: boolean
  hasFuel: boolean
  fuelConsumed: number
  onComplete: () => void
  onEncounter?: () => void
  paused: boolean
}
```

**Dependencies:**
- PlayerStore: Access player state, fuel, items
- TimeManager: Time acceleration during travel
- Random encounter system (Phase 4)
- Event emitter for travel events

**Integration Points:**
- MapScene: Uses TravelSystem for travel between sites
- PlayerStore: Updates `totalDistance`, `dogDistance`
- TimeManager: Accelerates time during travel
- SurvivalSystem: May consume shoe durability

**File**: `src/data/travel.ts` (if needed)

Travel configuration constants:
```typescript
export const TRAVEL_CONFIG = {
  FUEL_DISTANCE_RATIO: 80, // Distance per fuel unit
  FUEL_CONSUMPTION_INTERVAL: 795, // Distance units per fuel consumption
  WALKING_SPEED: 1.0,
  MOTORCYCLE_SPEED: 3.0,
  TIME_ACCELERATION_MULTIPLIER_WITH_ITEM: 2,
  TIME_ACCELERATION_MULTIPLIER_DEFAULT: 3
} as const
```

**Random Encounter Config:**
- Need to port `RandomBattleConfig.strength` from original game
- Defines encounter probability by day range and distance

---

## 3.4 Weather System

### Requirements Analysis

From `OriginalGame/src/game/weather.js`:

**Weather Types:**
- `CLOUDY = 0`: Clear/Cloudy (default)
- `SUNSHINY = 1`: Sunny
- `RAIN = 2`: Rain
- `SNOW = 3`: Snow
- `FOG = 4`: Fog/Storm

**Weather System State:**
- `weatherId`: Current weather type
- `Tomorrow`: Array `[0, 0]` for next day weather prediction
- `Random`: Random weather string for display
- `lastDays`: Days current weather has lasted
- `aa`: Boolean flag (purpose unclear, preserve for compatibility)
- `weatherConfig`: Current weather's config object

**Weather System Methods:**
- `checkWeather()`: Called daily to update weather
  - If current weather is CLOUDY (0), roll for new weather based on season
  - If non-CLOUDY, increment `lastDays` until `lastDays >= weatherConfig.lastDays`
  - Special check to reduce consecutive abnormal weather
- `changeWeather(weatherId, sendLog)`: Changes weather and emits event
- `Notice()`: Generates random weather forecast string
- `getValue(key)`: Gets weather effect value (e.g., `vigour`, `spirit`, `temperature`)
- `getWeatherName()`: Gets localized weather name
- `getStr(c)`: Gets weather string by ID

**Weather Effects:**
From `weatherConfig`:
- `lastDays`: How many days weather lasts
- `vigour`: Energy modifier
- `spirit`: Mood modifier
- `speed`: Movement speed modifier
- `temperature`: Temperature modifier
- `gun_precise`: Gun accuracy modifier
- `monster_speed`: Monster speed modifier
- `build_2`: Building ID 2 effect
- Item effects: `item_1101061`, `item_1103041`, etc.

**Weather Selection:**
- Based on season from `weatherSystemConfig`
- Weighted random selection
- Special logic to prevent consecutive abnormal weather

### Implementation Plan

**File**: `src/game/systems/WeatherSystem.ts`

**Core Class:**
```typescript
export class WeatherSystem {
  private weatherId: WeatherType
  private Tomorrow: [WeatherType, WeatherType]
  private Random: string
  private lastDays: number
  private aa: boolean
  private weatherConfig: WeatherConfig
  
  constructor()
  save(): WeatherSaveData
  restore(saveObj: WeatherSaveData | null): void
  checkWeather(season: Season, day: number): void
  changeWeather(weatherId: WeatherType, sendLog?: boolean): void
  private Notice(): void
  getValue(key: string): number
  getWeatherName(): string
  private getStr(weatherId: WeatherType): string
  getCurrentWeather(): WeatherType
  getWeatherConfig(): WeatherConfig
  getForecast(): string
}
```

**Dependencies:**
- `weatherConfig` and `weatherSystemConfig` from `data/weather.ts`
- TimeManager: For season and day information
- Event emitter: For `weather_change` event
- LogStore: For weather change messages
- String localization: For weather names

**Integration Points:**
- GameStore: Stores current weather state
- SurvivalSystem: Applies weather effects to attributes
- CombatSystem: Applies weather effects to combat (gun accuracy, monster speed)
- TimeManager: Calls `checkWeather()` daily
- UI: Displays weather icon and forecast

**File**: `src/store/gameStore.ts`

Update to include weather system:
```typescript
interface GameStore {
  // ... existing
  weatherSystem: WeatherSystem
  weather: WeatherType
  weatherForecast: string
  setWeather: (weather: WeatherType) => void
  updateWeather: () => void
}
```

**Save Schema Updates:**

**File**: `src/game/systems/saveSchemas.ts`

Add to `GameSaveDataSchema`:
```typescript
weather: z.object({
  weatherId: z.number().int(),
  Tomorrow: z.tuple([z.number().int(), z.number().int()]),
  Random: z.string(),
  lastDays: z.number().int(),
  aa: z.boolean()
})
```

**Weather Effect Application:**

**File**: `src/game/systems/SurvivalSystem.ts`

Add weather effect application:
```typescript
applyWeatherEffects(weatherConfig: WeatherConfig): void {
  // Apply vigour, spirit, temperature modifiers
  // Apply item-specific effects
  // Apply building effects (build_2)
}
```

**File**: `src/game/systems/CombatSystem.ts` (Phase 4)

Add weather effects:
```typescript
getGunAccuracyModifier(weatherConfig: WeatherConfig): number {
  return weatherConfig.gun_precise || 0
}

getMonsterSpeedModifier(weatherConfig: WeatherConfig): number {
  return weatherConfig.monster_speed || 0
}
```

---

## Implementation Order

### Step 1: Weather System (3.4)
**Priority**: High (needed by other systems)
**Dependencies**: `data/weather.ts` (already exists), TimeManager, GameStore

**Tasks:**
1. Create `src/game/systems/WeatherSystem.ts`
2. Integrate with GameStore
3. Add daily weather check to TimeManager
4. Update save schema
5. Test weather transitions and effects

### Step 2: Site System (3.2)
**Priority**: High (needed by Map System)
**Dependencies**: Storage, Room, Item systems (Phase 2), Site config data

**Tasks:**
1. Create `src/data/sites.ts` (convert siteConfig.js)
2. Create `src/game/world/Site.ts` with all site types
3. Implement room generation logic
4. Implement secret room mechanics
5. Update save schema
6. Test site initialization and room generation

### Step 3: Map System (3.1)
**Priority**: High (core world management)
**Dependencies**: Site System (Step 2), NPC interface (Phase 5, but can stub)

**Tasks:**
1. Create `src/game/world/Map.ts`
2. Integrate with PlayerStore
3. Add map to save schema
4. Implement site unlocking logic
5. Test map initialization and site management

### Step 4: Travel System (3.3)
**Priority**: Medium (needed for map navigation)
**Dependencies**: Map System (Step 3), PlayerStore, TimeManager

**Tasks:**
1. Create `src/game/world/TravelSystem.ts`
2. Implement distance and fuel calculations
3. Implement travel state management
4. Integrate with TimeManager for time acceleration
5. Add random encounter hooks (stub for Phase 4)
6. Test travel mechanics

### Step 5: MapScene UI (3.5)
**Priority**: Medium (user-facing)
**Dependencies**: All previous steps

**Tasks:**
1. Create `src/components/scenes/MapScene.tsx`
2. Create map rendering with sites
3. Implement site selection and travel
4. Add travel confirmation dialog
5. Integrate with TravelSystem
6. Test map navigation

---

## File Structure

```
src/
  game/
    systems/
      WeatherSystem.ts          # NEW: Weather management
    world/
      Map.ts                    # NEW: World map management
      Site.ts                   # NEW: Site exploration system
      TravelSystem.ts           # NEW: Travel mechanics
      index.ts                  # UPDATE: Export new classes
  data/
    sites.ts                    # NEW: Site configuration data
    travel.ts                   # NEW: Travel configuration (optional)
    index.ts                    # UPDATE: Export sites
  store/
    gameStore.ts                # UPDATE: Add weather system
    playerStore.ts              # UPDATE: Add map reference
  types/
    site.types.ts               # UPDATE: Expand site types
    travel.types.ts             # NEW: Travel-related types
    weather.types.ts            # UPDATE: Add weather system types
  components/
    scenes/
      MapScene.tsx              # NEW: Map view component
  game/systems/
    saveSchemas.ts              # UPDATE: Add map, site, weather save data
```

---

## Testing Checklist

### Weather System
- [ ] Weather changes daily based on season
- [ ] Weather effects apply to player attributes
- [ ] Weather persists across saves
- [ ] Weather forecast displays correctly
- [ ] Weather effects apply in combat (Phase 4)

### Site System
- [ ] Sites initialize with correct rooms
- [ ] Room generation creates battle and work rooms
- [ ] Site progress tracks correctly
- [ ] Site completion unlocks new sites/NPCs
- [ ] Secret rooms can be discovered
- [ ] Special site types (Bazaar, WorkSite, BossSite) work correctly
- [ ] Site storage persists items
- [ ] Sites save/restore correctly

### Map System
- [ ] Map initializes with default sites
- [ ] Sites can be unlocked
- [ ] Player position updates correctly
- [ ] Map state saves/restores correctly
- [ ] Site closing works correctly

### Travel System
- [ ] Distance calculation is accurate
- [ ] Fuel consumption works correctly
- [ ] Travel time calculation is accurate
- [ ] Motorcycle usage works correctly
- [ ] Time acceleration during travel works
- [ ] Random encounters trigger (stub for Phase 4)
- [ ] Travel state updates correctly

### MapScene UI
- [ ] Map displays all unlocked sites
- [ ] Site selection works
- [ ] Travel confirmation dialog shows correct info
- [ ] Travel animation/feedback works
- [ ] Player position updates on map

---

## Dependencies on Future Phases

**Phase 4 (Combat):**
- Random encounter system for travel
- Monster generation for site battle rooms
- Combat integration with site exploration

**Phase 5 (NPCs):**
- NPC location management in Map
- NPC unlocking via site completion
- NPC interaction at sites

---

## Notes

- Weather system should be implemented first as it's needed by other systems
- Site config data conversion may be large (5800+ lines), consider automated conversion
- Travel system random encounters can be stubbed until Phase 4
- MapScene UI can be basic initially, polish in later phases
- All systems must integrate with save/load functionality
- Weather effects on combat will be implemented in Phase 4

---

## Estimated Timeline

| Step | Duration | Dependencies |
|------|----------|--------------|
| Weather System | 2 days | TimeManager, weather data |
| Site System | 3 days | Storage, Room, Item systems |
| Map System | 2 days | Site System |
| Travel System | 2 days | Map System, PlayerStore |
| MapScene UI | 2 days | All previous steps |
| Testing & Integration | 2 days | All systems |

**Total: ~13 days for Phase 3**


