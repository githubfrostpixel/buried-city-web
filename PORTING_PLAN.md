# BuriedTown React TypeScript Porting Plan

## Project Overview

**Goal**: Port BuriedTown (Cocos2d-JS) to React TypeScript as a 1:1 faithful recreation.

**Target Platform**: Mobile-first web application (desktop displays mobile view)

**Original Game**: BuriedTown 1.4.3 (Buried City mod by ArithSeq)

---

## Technology Stack

### Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "pixi.js": "^8.0.0",
    "@pixi/react": "^7.1.0",
    "zustand": "^4.5.0",
    "howler": "^2.2.4",
    "i18next": "^23.0.0",
    "react-i18next": "^14.0.0",
    "localforage": "^1.10.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "@types/react": "^18.3.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### Library Purposes

| Library | Purpose |
|---------|---------|
| **React 18** | UI framework with component architecture |
| **PixiJS 8** | High-performance 2D WebGL rendering for sprites |
| **@pixi/react** | Declarative PixiJS components in React |
| **Zustand** | Lightweight state management for game state |
| **Howler.js** | Cross-browser audio (music & SFX) |
| **i18next** | Internationalization (English & Chinese) |
| **localforage** | IndexedDB wrapper for save data persistence |
| **Zod** | Runtime type validation for save data |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first CSS for UI panels |

---

## Project Structure

```
BuriedTown/
  tools/                          # Python tools for asset conversion
    convert_pvr_ccz.py            # Convert .pvr.ccz to .png
    parse_plist.py                # Parse .plist to JSON atlas
    extract_sprites.py            # Extract individual sprites from atlas
    
  src/
    main.tsx                      # App entry point
    App.tsx                       # Root component
    index.css                     # Global styles + Tailwind
    
    assets/                       # Converted game assets
      sprites/                    # Sprite atlases as JSON + PNG
        build.json
        build.png
        dig_build.json
        dig_build.png
        ... (all converted atlases)
      audio/
        music/                    # Background music files
        sfx/                      # Sound effect files
        
    types/                        # TypeScript type definitions
      index.ts                    # Re-exports all types
      game.types.ts               # Core game types
      player.types.ts             # Player-related types
      item.types.ts               # Item system types
      combat.types.ts             # Battle system types
      site.types.ts               # Location/site types
      npc.types.ts                # NPC types
      building.types.ts           # Building types
      save.types.ts               # Save data schema
      
    data/                         # Game configuration data
      index.ts                    # Re-exports all data
      items.ts                    # Item definitions (from itemConfig.js)
      buildings.ts                # Building definitions (from buildConfig.js)
      buildActions.ts             # Building actions (from buildActionConfig.js)
      formulas.ts                 # Crafting recipes (from formulaConfig.js)
      npcs.ts                     # NPC definitions (from npcConfig.js)
      monsters.ts                 # Monster definitions (from monsterConfig.js)
      sites.ts                    # Location definitions (from siteConfig.js)
      weather.ts                  # Weather config (from weatherConfig.js)
      player.ts                   # Player config (from playerConfig.js)
      moonlighting.ts             # Night raid config
      randomReward.ts             # Random rewards
      secretRooms.ts              # Secret rooms
      strings/                    # Localization
        en.ts                     # English strings
        zh.ts                     # Chinese strings
        
    store/                        # Zustand state stores
      index.ts                    # Combined store exports
      gameStore.ts                # Global game state (time, weather, etc.)
      playerStore.ts              # Player state (attributes, inventory)
      uiStore.ts                  # UI state (dialogs, current scene)
      battleStore.ts              # Combat state
      
    game/                         # Core game logic
      systems/
        TimeManager.ts            # Day/night, seasons, game clock
        WeatherSystem.ts          # Weather effects
        SurvivalSystem.ts         # Attribute decay and effects
        CombatSystem.ts           # Battle logic
        CraftingSystem.ts         # Item crafting
        SaveSystem.ts             # Save/load functionality
        AudioManager.ts           # Music and SFX management
        
      entities/
        Player.ts                 # Player entity logic
        NPC.ts                    # NPC behavior
        Monster.ts                # Monster/bandit logic
        Dog.ts                    # Dog companion
        
      inventory/
        Item.ts                   # Item class
        Storage.ts                # Generic storage container
        Bag.ts                    # Player backpack
        Safe.ts                   # Protected storage
        Equipment.ts              # Equipped items
        
      world/
        Map.ts                    # World map management
        Site.ts                   # Explorable location
        Building.ts               # Home building
        Room.ts                   # Building collection
        
      combat/
        Battle.ts                 # Battle controller
        BattlePlayer.ts           # Player in combat
        Weapon.ts                 # Weapon base class
        Gun.ts                    # Ranged weapons
        MeleeWeapon.ts            # Melee weapons
        Bomb.ts                   # Explosive items
        
    hooks/                        # Custom React hooks
      useGameLoop.ts              # Main game update loop
      useAudio.ts                 # Audio playback
      useSpritesheet.ts           # Sprite loading
      useKeyboard.ts              # Keyboard input
      useTouch.ts                 # Touch input for mobile
      
    utils/                        # Utility functions
      random.ts                   # Random number generation
      range.ts                    # Range parsing (from range.js)
      format.ts                   # Number/string formatting
      clone.ts                    # Deep clone objects
      emitter.ts                  # Event emitter
      
    components/                   # React components
      common/                     # Reusable UI components
        Button.tsx
        Dialog.tsx
        ProgressBar.tsx
        IconButton.tsx
        ItemSlot.tsx
        ItemList.tsx
        RichText.tsx
        SliderBar.tsx
        
      layout/                     # Layout components
        GameContainer.tsx         # Main game container (mobile aspect)
        TopBar.tsx                # Status bar (time, weather, stats)
        BottomBar.tsx             # Action buttons
        
      scenes/                     # Main game scenes
        MenuScene.tsx             # Main menu
        SaveFileScene.tsx         # Save file selection
        ChooseScene.tsx           # Talent selection
        StoryScene.tsx            # Story/tutorial
        MainScene.tsx             # Main game scene
        BattleScene.tsx           # Combat scene
        MapScene.tsx              # World map
        EndScene.tsx              # Game over / victory
        
      panels/                     # In-game panels
        HomePanel.tsx             # Home view with buildings
        BuildPanel.tsx            # Building interaction
        StoragePanel.tsx          # Inventory management
        CraftingPanel.tsx         # Crafting interface
        EquipmentPanel.tsx        # Equipment management
        NPCPanel.tsx              # NPC interaction
        SitePanel.tsx             # Location exploration
        BazaarPanel.tsx           # Shop/bazaar
        DogPanel.tsx              # Dog companion
        RadioPanel.tsx            # Radio communication
        
      overlays/                   # Modal overlays
        DayOverlay.tsx            # New day summary
        DeathOverlay.tsx          # Death screen
        BattleResultOverlay.tsx   # Combat results
        ItemChangeOverlay.tsx     # Item gained/lost
        DialogOverlay.tsx         # Text dialogs
        
      sprites/                    # PixiJS sprite components
        SpriteAtlas.tsx           # Sprite from atlas
        AnimatedSprite.tsx        # Animated sprite
        BuildingSprite.tsx        # Building renderer
        MonsterSprite.tsx         # Monster renderer
        ItemIcon.tsx              # Item icon renderer
        
  public/
    index.html
    manifest.json                 # PWA manifest
    service-worker.js             # Offline support
```

---

## Phase 0: Setup & Asset Pipeline

### 0.1 Project Initialization

**Tasks:**
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Setup ESLint and Prettier
- [ ] Configure path aliases (@/ for src/)
- [ ] Setup mobile-first viewport and PWA manifest

**Files to create:**
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tailwind.config.js`
- `postcss.config.js`
- `public/manifest.json`
- `src/index.css`

### 0.2 Asset Conversion Tools

**Python Tools Required:**

#### Tool 1: `tools/convert_pvr_ccz.py`
Convert compressed PVR textures to PNG format.

#### Tool 2: `tools/parse_plist.py`  
Parse Apple plist XML files to JSON sprite atlas format.

#### Tool 3: `tools/extract_sprites.py`
Extract individual sprites from texture atlas using plist data.

#### Tool 4: `tools/convert_all.py`
Master script to process all assets.

**Input files to process:**
- `build.plist` + `build.png`
- `dig_build.plist` + `dig_build.pvr.ccz`
- `dig_item.plist` + `dig_item.pvr.ccz`
- `dig_monster.plist` + `dig_monster.pvr.ccz`
- `gate.plist` + `gate.pvr.ccz`
- `home.plist` + `home.png`
- `icon.plist` + `icon.pvr.ccz`
- `new.plist` + `new.pvr.ccz`
- `new_site.plist` + `new_site.pvr.ccz`
- `new_temp.plist` + `new_temp.png`
- `npc.plist` + `npc.pvr.ccz`
- `site.plist` + `site.pvr.ccz`
- `ui.plist` + `ui.pvr.ccz`

### 0.3 Data Migration

**Convert JavaScript configs to TypeScript:**

| Original File | Target File | Content |
|---------------|-------------|---------|
| `itemConfig.js` | `data/items.ts` | Item definitions with types |
| `buildConfig.js` | `data/buildings.ts` | Building configs |
| `buildActionConfig.js` | `data/buildActions.ts` | Building interactions |
| `formulaConfig.js` | `data/formulas.ts` | Crafting recipes |
| `npcConfig.js` | `data/npcs.ts` | NPC definitions |
| `monsterConfig.js` | `data/monsters.ts` | Monster stats |
| `siteConfig.js` | `data/sites.ts` | Location definitions |
| `weatherConfig.js` | `data/weather.ts` | Weather effects |
| `playerConfig.js` | `data/player.ts` | Player attribute effects |
| `MoonlightingConfig.js` | `data/moonlighting.ts` | Night raid config |
| `string_en.js` | `data/strings/en.ts` | English text |
| `string_zh.js` | `data/strings/zh.ts` | Chinese text |

---

## Phase 1: Core Systems

### 1.1 Type Definitions

**Create comprehensive TypeScript types for:**

```typescript
// types/game.types.ts
interface GameState {
  time: number;
  season: Season;
  stage: 'day' | 'night';
  isPaused: boolean;
}

// types/player.types.ts
interface PlayerAttributes {
  hp: number;
  hpMax: number;
  spirit: number;      // Mood
  spiritMax: number;
  starve: number;      // Hunger
  starveMax: number;
  vigour: number;      // Energy
  vigourMax: number;
  injury: number;
  injuryMax: number;
  infect: number;      // Infection
  infectMax: number;
  water: number;       // Thirst
  waterMax: number;
  virus: number;
  virusMax: number;
  temperature: number;
  temperatureMax: number;
}

// types/item.types.ts
interface Item {
  id: string;
  weight: number;
  price: number;
  value: number;
  effect_food?: FoodEffect;
  effect_medicine?: MedicineEffect;
  effect_weapon?: WeaponEffect;
  effect_arm?: ArmorEffect;
  effect_tool?: ToolEffect;
  effect_buff?: BuffEffect;
}
```

### 1.2 Zustand Stores

**Game Store** (`store/gameStore.ts`):
- Time management state
- Weather state
- Global game flags

**Player Store** (`store/playerStore.ts`):
- Player attributes
- Inventory (bag, storage, safe)
- Equipment
- Settings
- Dog state

**UI Store** (`store/uiStore.ts`):
- Current scene
- Open dialogs/panels
- Notifications

### 1.3 Time Manager

**Port from**: `src/game/TimeManager.js`

**Features:**
- Game time simulation (1 real second = 100 game seconds)
- Day/night cycle (6:00 - 20:00 = day)
- Season system (30 days per season, 4 seasons)
- Callback system for hourly/daily events
- Time acceleration for crafting/sleeping

### 1.4 Save System

**Implement:**
- Auto-save on important actions
- Multiple save slots
- Save data validation with Zod
- Export/import save as JSON

**Save Data Schema:**
```typescript
interface SaveData {
  version: string;
  timestamp: number;
  player: PlayerSaveData;
  game: GameSaveData;
  buildings: BuildingSaveData[];
  npcs: NPCSaveData[];
  sites: SiteSaveData[];
}
```

### 1.5 Audio Manager

**Port from**: `src/util/audioManager.js`

**Features:**
- Background music with crossfade
- Sound effects
- Volume controls
- Music/SFX toggles in settings

---

## Phase 2: Home & Survival

### 2.1 Survival System

**Port attribute effects from**: `playerConfig.js`

**Implement:**
- Hourly attribute decay (hunger, energy, etc.)
- Attribute range effects (low hunger = mood decrease)
- Death conditions (HP = 0, virus overload)
- Sleep mechanics (energy recovery)
- Temperature effects

### 2.2 Item System

**Port from**: `src/game/Item.js`

**Item Categories:**
- Materials (wood, metal, cloth, etc.)
- Food (with expiration)
- Medicine
- Weapons (guns, melee)
- Tools
- Buff items

### 2.3 Storage System

**Port from**: `src/game/Storage.js`

**Types:**
- `Bag` - Carried items with weight limit
- `Storage` - Home storage
- `Safe` - Protected from theft/raids

**Features:**
- Weight calculation
- Item stacking
- Transfer between containers

### 2.4 Building System

**Port from**: `src/game/Build.js`, `buildConfig.js`

**Buildings (21 types):**
1. Workbench (crafting)
2. Chemical bench
3. Medical bench
4. Stove (cooking)
5. Fireplace (heating)
6. Water purifier
7. Hare trap
8. Garden
9. Bed (sleeping)
10. Storage shelf
11. Fence (defense)
12. Dog house
13. Gate
14. Toilet
15. Minefield
16. Radio
17. Storeroom
18. Electric stove
19. Electric fence
20. Safe
21. Fridge

**Features:**
- Upgrade levels (0, 1, 2)
- Construction costs and time
- Active/inactive states
- Crafting recipes per building

### 2.5 Home Scene UI

**Components:**
- Building grid layout
- Building interaction dialogs
- Status bars (HP, hunger, etc.)
- Top bar (time, weather, currency)
- Bottom bar (map, inventory, sleep)

---

## Phase 3: World & Exploration

### 3.1 Map System

**Port from**: `src/game/map.js`

**Features:**
- Location discovery
- Travel time calculation
- Distance-based encounters
- Location states (locked, explored, cleared)

### 3.2 Site System

**Port from**: `src/game/site.js`, `siteConfig.js`

**Site Types:**
- Normal locations (explore for resources)
- Boss locations (special encounters)
- NPC homes
- Work site (power plant)
- Gas station
- Bazaar (shop)
- Junkyard (ad location)
- Special locations (Portal, Aquarium, etc.)

**Features:**
- Exploration progress
- Site-specific storage
- Random item rewards
- Site-specific encounters

### 3.3 Travel System

**Features:**
- Travel time based on distance
- Random zombie encounters
- Random bandit encounters
- Fuel consumption (motorcycle)
- Shoe durability
- Dog accompaniment bonuses

### 3.4 Weather System

**Port from**: `src/game/weather.js`, `weatherConfig.js`

**Weather Types:**
- Clear
- Cloudy
- Rain
- Snow
- Storm

**Effects:**
- Player attribute modifiers
- Monster speed changes
- Gun accuracy changes

---

## Phase 4: Combat System

### 4.1 Battle Engine

**Port from**: `src/game/Battle.js`

**Components:**
- `Battle` - Main battle controller
- `Monster` - Enemy entity
- `BattlePlayer` - Player in combat

**Features:**
- Turn-based combat with real-time elements
- 6-line distance system
- Monster movement toward player
- Escape mechanic

### 4.2 Weapon System

**Weapon Types:**
- **Guns**: Pistol, Revolver, Rifle, Shotgun, Electric guns, Flamethrower
- **Melee**: Axe, Knife, Crowbar, Chainsaw
- **Explosives**: Grenades, C4, Molotov
- **Traps**: Bear trap

**Features:**
- Accuracy calculation (mood affects aim)
- Bullet consumption (standard vs homemade)
- Weapon durability and breaking
- Range limitations

### 4.3 Combat UI

**Components:**
- Monster display with HP bars
- Distance indicator
- Combat log
- Weapon selection
- Escape progress bar
- Dodge mode

---

## Phase 5: NPCs & Advanced Features

### 5.1 NPC System

**Port from**: `src/game/npc.js`, `npcConfig.js`

**NPCs:**
- Dr. Jane (medicine)
- The Stranger (special items)
- W. White (chemicals, guns)
- Others...

**Features:**
- Friendship levels
- Trading (item exchange)
- Gift giving
- Stealing mechanic
- Alert system
- NPC visits to player home
- Location unlocks via friendship

### 5.2 Dog Companion

**Port from**: Player.js dog-related code

**Features:**
- Dog attributes (hunger, mood, injury)
- Feeding and care
- Combat assistance
- Resource finding bonus
- Home defense
- Outdoor accompaniment

### 5.3 Bazaar System

**Port from**: `src/ui/bazaarNode.js`

**Features:**
- Item buying/selling
- Daily rotating stock
- Discounts
- Sweepstakes
- Hostel (sleep away from home)

### 5.4 Special Events

**Night Raids (Moonlighting):**
- Probability based on day and home value
- Defense calculation
- Item loss mechanics

**Bandit Raids:**
- Triggered by leaving home too long
- Home defense effects
- Item demands

**Food Expiration:**
- Daily expiration chance
- Fridge prevents expiration
- Fertilizer conversion

### 5.5 Achievement System

**Port from**: `src/game/achievement.js`, `src/game/medal.js`

**Features:**
- In-game achievements
- Medal wall
- Progression tracking

---

## Phase 6: Polish & Testing

### 6.1 Audio Integration

**Music Tracks:**
- Menu music
- Day music (multiple)
- Night music (multiple)
- Battle music (zombie vs bandit)
- Special event music

**Sound Effects:**
- UI sounds (buttons, dialogs)
- Combat sounds (weapons, monsters)
- Ambient sounds
- Notification sounds

### 6.2 Localization

**Languages:**
- English (en)
- Simplified Chinese (zh)
- Traditional Chinese (zh-Hant)

**Implementation:**
- i18next integration
- Dynamic language switching
- Number formatting per locale

### 6.3 PWA Features

**Implement:**
- Service worker for offline support
- App manifest for installation
- Cache strategies for assets
- Background sync for saves

### 6.4 Testing

**Test Areas:**
- Save/load integrity
- Combat balance
- Survival mechanics timing
- UI responsiveness on mobile
- Cross-browser compatibility

---

## File-by-File Porting Guide

### Original Game Logic Files

| Original | Port To | Priority |
|----------|---------|----------|
| `TimeManager.js` | `game/systems/TimeManager.ts` | P0 |
| `player.js` | `game/entities/Player.ts` + `store/playerStore.ts` | P0 |
| `Item.js` | `game/inventory/Item.ts` | P0 |
| `Storage.js` | `game/inventory/Storage.ts` | P0 |
| `Build.js` | `game/world/Building.ts` | P1 |
| `Battle.js` | `game/combat/Battle.ts` | P2 |
| `site.js` | `game/world/Site.ts` | P2 |
| `map.js` | `game/world/Map.ts` | P2 |
| `npc.js` | `game/entities/NPC.ts` | P3 |
| `weather.js` | `game/systems/WeatherSystem.ts` | P1 |
| `buff.js` | `game/systems/BuffSystem.ts` | P2 |
| `equipment.js` | `game/inventory/Equipment.ts` | P1 |

### Original UI Files

| Original | Port To | Priority |
|----------|---------|----------|
| `MenuScene.js` | `components/scenes/MenuScene.tsx` | P0 |
| `MainScene.js` | `components/scenes/MainScene.tsx` | P0 |
| `home.js` | `components/panels/HomePanel.tsx` | P1 |
| `topFrame.js` | `components/layout/TopBar.tsx` | P0 |
| `bottomFrame.js` | `components/layout/BottomBar.tsx` | P0 |
| `dialog.js` | `components/common/Dialog.tsx` | P0 |
| `buildNode.js` | `components/panels/BuildPanel.tsx` | P1 |
| `storageNode.js` | `components/panels/StoragePanel.tsx` | P1 |
| `battleAndWorkNode.js` | `components/scenes/BattleScene.tsx` | P2 |
| `MapNode.js` | `components/scenes/MapScene.tsx` | P2 |
| `siteNode.js` | `components/panels/SitePanel.tsx` | P2 |
| `npcNode.js` | `components/panels/NPCPanel.tsx` | P3 |
| `bazaarNode.js` | `components/panels/BazaarPanel.tsx` | P3 |
| `DayScene.js` | `components/overlays/DayOverlay.tsx` | P1 |
| `deathNode.js` | `components/overlays/DeathOverlay.tsx` | P2 |

---

## Estimated Timeline

| Phase | Duration | Milestone |
|-------|----------|-----------|
| Phase 0 | 1 week | Assets converted, project setup |
| Phase 1 | 2 weeks | Core systems working, basic UI |
| Phase 2 | 2 weeks | Home scene playable, survival working |
| Phase 3 | 2 weeks | Map exploration, sites working |
| Phase 4 | 1.5 weeks | Combat fully functional |
| Phase 5 | 2 weeks | NPCs, dog, special events |
| Phase 6 | 1.5 weeks | Polish, audio, testing |

**Total: ~12 weeks for full 1:1 port**

---

## Next Steps

1. **Approve this plan** or request modifications
2. **Switch to ACT mode** to begin implementation
3. **Start with Phase 0**: Asset conversion tools

---

## Notes

- All game logic will be faithfully ported from the original JavaScript
- UI will look identical but use modern React components
- Mobile-first design with 640x1136 base resolution (same as original)
- Desktop will display centered mobile view with optional scaling

