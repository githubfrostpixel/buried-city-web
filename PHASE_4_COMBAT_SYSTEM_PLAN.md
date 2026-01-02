# Phase 4: Combat System Implementation Plan

## Overview

This plan details the implementation of the combat system for the BuriedTown React port. The combat system is a turn-based system with real-time elements, featuring a 6-line distance system, monster movement, weapon mechanics, and escape mechanics.

**Original Files:**
- `OriginalGame/src/game/Battle.js` - Main battle engine
- `OriginalGame/src/ui/battleAndWorkNode.js` - Battle UI
- `OriginalGame/src/data/monsterConfig.js` - Monster configurations

**Target Implementation:**
- `src/game/combat/` - Combat logic classes
- `src/components/scenes/BattleScene.tsx` - Battle scene component
- `src/components/panels/BattlePanelContent.tsx` - Battle panel content
- `src/data/monsters.ts` - Monster data (to be created)

---

## 4.1 Data Migration

### 4.1.1 Monster Configuration Data

**File:** `src/data/monsters.ts`

**Tasks:**
- [ ] Port `monsterConfig` from `OriginalGame/src/data/monsterConfig.js`
- [ ] Port `monsterList` from `OriginalGame/src/data/monsterConfig.js`
- [ ] Convert to TypeScript with proper types
- [ ] Export `monsterConfig` and `monsterList` for use in battle system

**Structure:**
```typescript
export interface MonsterConfig {
  id: number
  hp: number
  speed: number
  attackSpeed: number
  attack: number
  range: number
  prefixType: number
}

export interface MonsterListEntry {
  id: number
  difficulty: number
  list: string[] // Monster IDs as strings
}

export const monsterConfig: Record<string, MonsterConfig> = { ... }
export const monsterList: Record<string, MonsterListEntry> = { ... }
```

**Notes:**
- Monster IDs are stored as strings in the original (e.g., "1", "2")
- `prefixType` determines monster name prefix (zombie vs bandit)
- `difficulty` ranges from 1-12
- `list` contains monster IDs that spawn in that encounter

---

## 4.2 Battle Engine Core

### 4.2.1 Battle Configuration

**File:** `src/game/combat/BattleConfig.ts`

**Tasks:**
- [ ] Create BattleConfig constants
- [ ] Define LINE_LENGTH (6)
- [ ] Define MAX_REAL_DISTANCE (1000m)
- [ ] Define REAL_DISTANCE_PER_LINE (100m)
- [ ] Define ESCAPE_TIME (1.5 seconds)
- [ ] Define BULLET_ID ("1305011")
- [ ] Define HOMEMADE_ID ("1305012")

**Structure:**
```typescript
export const BattleConfig = {
  LINE_LENGTH: 6,
  MAX_REAL_DISTANCE: 1000,
  REAL_DISTANCE_PER_LINE: 100,
  ESCAPE_TIME: 1.5,
  BULLET_ID: "1305011",
  HOMEMADE_ID: "1305012"
} as const
```

---

### 4.2.2 Battle Line System

**File:** `src/game/combat/BattleLine.ts`

**Tasks:**
- [ ] Create BattleLine class to represent distance lines
- [ ] Track which monster occupies each line
- [ ] Support 6 lines (index 0-5, where 0 is closest to player)

**Structure:**
```typescript
export class BattleLine {
  index: number // 0-5, 0 = closest to player
  monster: Monster | null
  
  constructor(index: number) {
    this.index = index
    this.monster = null
  }
  
  isEmpty(): boolean {
    return this.monster === null
  }
  
  setMonster(monster: Monster | null): void {
    this.monster = monster
  }
}
```

---

### 4.2.3 Monster Entity

**File:** `src/game/combat/Monster.ts`

**Port from:** `OriginalGame/src/game/Battle.js` (lines 268-442)

**Tasks:**
- [ ] Create Monster class
- [ ] Implement monster movement logic (move toward player)
- [ ] Implement attack logic (attack when in range)
- [ ] Implement damage calculation (receive damage from weapons)
- [ ] Implement death logic
- [ ] Support bandit vs zombie modes
- [ ] Emit events for UI updates (position changes, attacks, death)

**Key Methods:**
- `move()` - Move monster toward player based on speed
- `moveToLine(line: BattleLine)` - Move monster to specific line
- `atk()` - Attack player when in range
- `underAtk(obj, providedHarm?)` - Receive damage
- `die(obj)` - Handle monster death
- `isInRange()` - Check if monster can attack player
- `isDie()` - Check if monster is dead
- `playEffect(soundName)` - Play sound effect

**Movement Logic:**
- Monsters start at line 5 (furthest)
- Move toward line 0 (closest) at `speed` lines per second
- Speed affected by weather (`monster_speed` modifier)
- Can only move to empty lines
- When reaching line 0, can attack player

**Attack Logic:**
- Attack speed: `attackSpeed` seconds between attacks
- Zombies: Attack when at line 0
- Bandits: Random chance to attack (0-2 < 2, so 66% chance)

**Damage Logic:**
- Damage from weapons: `obj.getHarm(this)`
- Damage from bombs: `obj.attr.atk`
- Damage from flamethrower: `providedHarm`
- Damage from dog: Random 10-25
- Apply damage: `this.attr.hp -= harm`
- Die when HP reaches 0

**Events:**
- Emit position changes for UI updates
- Emit attack events for combat log
- Emit death events for UI updates

---

### 4.2.4 Battle Player Entity

**File:** `src/game/combat/BattlePlayer.ts`

**Port from:** `OriginalGame/src/game/Battle.js` (lines 444-594)

**Tasks:**
- [ ] Create BattlePlayer class
- [ ] Track player HP, virus, injury, defense
- [ ] Track ammunition (bullets, homemade bullets)
- [ ] Track tool count
- [ ] Manage weapon equipment (weapon1 = gun, weapon2 = melee, equip = tool)
- [ ] Implement action loop (auto-attack with weapons)
- [ ] Implement damage reception (from monsters)
- [ ] Implement escape/dodge mechanics
- [ ] Implement dog companion logic

**Key Methods:**
- `action(dt)` - Main action loop (called every 0.1s)
- `underAtk(monster)` - Receive damage from monster
- `die()` - Handle player death
- `isDie()` - Check if player is dead
- `useWeapon1()` - Use gun weapon
- `useWeapon2()` - Use melee weapon
- `useEquip()` - Use tool/equipment
- `useDog()` - Dog companion actions
- `escape()` - Start escape sequence
- `escapeAction()` - Complete escape
- `interruptEscape()` - Cancel escape

**Action Loop:**
- Called every 0.1 seconds
- Update dog state (0-50 counter)
- Use dog if available (every 10 ticks = 1 second)
- Use weapon1 (gun) if equipped and not flamethrower at site 502
- Use weapon2 (melee) always if equipped
- Use equip (tool) if equipped (except at site 502 for certain tools)

**Damage Reception:**
- Calculate: `harm = monster.attr.attack - this.def`
- Bandits: Add +10 harm (unless banditOverride or isDodge)
- Apply damage: `this.hp -= harm`
- Update player attributes: `player.changeAttr("hp", -harm)`
- Increase injury: `player.changeAttr("injury", 1)`
- Virus chance: Random chance based on difficulty and equipment
- Die when HP reaches 0

**Dog Logic:**
- Dog state counter: 0-50 (increments by 1 per action)
- At state 9: Resume monster movement if stopped
- At state 10+: Reset to 0 and trigger action
- 20% chance: Dog attacks enemy (10-25 damage)
- 10% chance: Dog kites enemy (stops monsters for duration)
- Dog actions reduce dog mood/injury

**Escape Logic:**
- Schedule escape action after ESCAPE_TIME (1.5s)
- Any weapon use interrupts escape
- On escape: End battle with loss

---

### 4.2.5 Weapon System Base

**File:** `src/game/combat/BattleEquipment.ts`

**Port from:** `OriginalGame/src/game/Battle.js` (lines 622-665)

**Tasks:**
- [ ] Create BattleEquipment base class
- [ ] Implement cooldown system
- [ ] Implement action method with cooldown
- [ ] Support before/after cooldown hooks
- [ ] Track tool/item consumption

**Key Methods:**
- `action()` - Main action with cooldown
- `_action()` - Override for specific weapon logic
- `beforeCd()` - Called before cooldown starts
- `afterCd()` - Called after cooldown ends
- `cost()` - Consume tool/item
- `isEnough()` - Check if enough resources

**Cooldown System:**
- `isInAtkCD` flag prevents multiple actions
- Cooldown duration: `attr.atkCD * player.vigourEffect()`
- Use scheduler/timer for cooldown callback

---

### 4.2.6 Melee Weapon

**File:** `src/game/combat/Weapon.ts`

**Port from:** `OriginalGame/src/game/Battle.js` (lines 813-859)

**Tasks:**
- [ ] Extend BattleEquipment
- [ ] Implement melee attack logic
- [ ] Check range (weapon range >= monster line index)
- [ ] Calculate damage (weapon ATK)
- [ ] Play sound effects
- [ ] Support hand-to-hand combat (Equipment.HAND)

**Key Methods:**
- `_action()` - Attack target monster
- `getTarget()` - Get current target monster
- `getHarm(monster)` - Calculate damage
- `isInRange(monster)` - Check if monster is in range

**Attack Logic:**
- Get target monster (battle.targetMon)
- Check if in range: `this.attr.range >= monster.line.index`
- Check if monster is alive
- Apply damage: `monster.underAtk(this)`
- Play sound effect based on weapon type
- Track weapon usage: `battle.sumRes.weapon2++`

**Hand-to-Hand:**
- Special case: Equipment.HAND (id = "1302011")
- Uses itemConfig[1302011] but with custom name and stats
- ATK: 20, ATKCD: 1

---

### 4.2.7 Gun Weapon

**File:** `src/game/combat/Gun.ts`

**Port from:** `OriginalGame/src/game/Battle.js` (lines 861-966)

**Tasks:**
- [ ] Extend Weapon class
- [ ] Implement ranged attack logic
- [ ] Calculate accuracy based on distance and mood
- [ ] Support standard bullets vs homemade bullets
- [ ] Handle multiple shots per attack (bulletMax)
- [ ] Calculate damage (bullet ATK)
- [ ] Support instant kill (deathHit)
- [ ] Track bullet consumption

**Key Methods:**
- `_action()` - Fire gun at target
- `getHarm(monster, goodBullet?)` - Calculate damage with accuracy
- `cost(isGoodBullet)` - Consume bullet
- `isGoodBulletEnough()` - Check if standard bullets available
- `isHomemadeBulletEnough()` - Check if homemade bullets available
- `getBulletHarm()` - Get bullet damage

**Accuracy Calculation:**
- Base precise: `attr.precise + attr.dtPrecise * dtLineIndex`
- Death hit: `attr.deathHit + attr.dtDeathHit * dtLineIndex`
- Distance line index: `LINE_LENGTH - 1 - monster.line.index`
- Mood penalty: `Math.max(0, 80 - player.spirit) * 0.006`
- Weather modifier: `player.weather.getValue("gun_precise")`
- Good bullet bonus: +0.15 if using standard bullets
- Alcohol penalty: -0.02 per hour since last alcohol (max 12 hours)

**Attack Logic:**
- Fire `bulletMax` shots per attack
- Each shot:
  - Check if bullets available (standard or homemade)
  - Calculate accuracy
  - Roll for instant kill (deathHit)
  - Roll for hit (precise)
  - Apply damage if hit
  - Consume bullet
- Track weapon usage: `battle.sumRes.weapon1++`
- Play sound effect based on gun type

**Bullet Priority:**
- If player.useGoodBullet: Use standard bullets first
- If no standard bullets: Use homemade bullets
- If no homemade bullets: Show "no bullets" message

---

### 4.2.8 Electric Gun

**File:** `src/game/combat/ElectricGun.ts`

**Port from:** `OriginalGame/src/game/Battle.js` (lines 968-1005)

**Tasks:**
- [ ] Extend Gun class
- [ ] Use electricity instead of bullets
- [ ] Check work site (site 502) is active
- [ ] Use weapon ATK instead of bullet ATK
- [ ] No bullet consumption

**Key Differences from Gun:**
- `isEnough()`: Check `player.map.getSite(WORK_SITE).isActive`
- `cost()`: No consumption (electricity is unlimited if work site active)
- `getBulletHarm()`: Return `this.attr.atk` instead of bullet ATK
- Sound effects: ATTACK_7 or ATTACK_8

---

### 4.2.9 Flamethrower

**File:** `src/game/combat/Flamethrower.ts`

**Port from:** `OriginalGame/src/game/Battle.js` (lines 715-784)

**Tasks:**
- [ ] Extend BattleEquipment class
- [ ] Use fuel instead of bullets
- [ ] Attack all monsters simultaneously
- [ ] Calculate damage based on mood and monster count
- [ ] Consume fuel per attack

**Key Methods:**
- `_action()` - Attack all monsters
- `cost()` - Consume fuel
- `isEnough()` - Check if flamethrower equipped and fuel available

**Damage Calculation:**
- Base damage: `this.attr.atk`
- Mood penalty: `20 + Math.max(0, 80 - player.spirit)` (20-100 range)
- Random roll: If `moodDec > rand`, reduce damage by 1-10
- Monster count multiplier:
  - If < 4 monsters: `harm *= 2`
  - If < 2 monsters: `harm *= 2` (total 4x for single monster)

**Attack Logic:**
- Attack all monsters in battle
- Apply calculated damage to each
- Consume 1 fuel per attack
- Track fuel usage: `battle.sumRes.fuel++`
- Play sound effects: ESTOVE and STOVE

---

### 4.2.10 Bomb (Explosives)

**File:** `src/game/combat/Bomb.ts`

**Port from:** `OriginalGame/src/game/Battle.js` (lines 667-713)

**Tasks:**
- [ ] Extend BattleEquipment class
- [ ] Attack all monsters simultaneously
- [ ] Use fixed damage (bomb ATK)
- [ ] Consume tool/item per use
- [ ] Track dead monsters for log

**Key Methods:**
- `_action()` - Explode, damage all monsters
- `cost()` - Consume tool
- `isEnough()` - Check if tool available

**Attack Logic:**
- Damage all monsters with `this.attr.atk`
- Track dead monsters: `this.deadMonsterNum`
- Consume tool: `this.cost()`
- Play sound: BOMB
- Track tool usage: `battle.sumRes.tools++`

---

### 4.2.11 Trap

**File:** `src/game/combat/Trap.ts`

**Port from:** `OriginalGame/src/game/Battle.js` (lines 786-811)

**Tasks:**
- [ ] Extend BattleEquipment class
- [ ] Stop all monsters from moving
- [ ] Consume tool per use
- [ ] Resume monster movement after cooldown

**Key Methods:**
- `_action()` - Deploy trap
- `afterCd()` - Remove trap effect

**Trap Logic:**
- Set `battle.isMonsterStop = true`
- Consume tool: `this.cost()`
- Play sound: TRAP
- After cooldown: Set `battle.isMonsterStop = false`
- Track tool usage: `battle.sumRes.tools++`

---

### 4.2.12 Equipment Factory

**File:** `src/game/combat/createEquipment.ts`

**Port from:** `OriginalGame/src/game/Battle.js` (lines 596-620)

**Tasks:**
- [ ] Create factory function to instantiate weapon classes
- [ ] Map item IDs to weapon classes
- [ ] Return appropriate weapon instance

**Mapping:**
- `1303012`, `1303033`, `1303044`: Bomb
- `1303022`: Trap
- `1302011`, `1302021`, `1302032`, `1302043`, `Equipment.HAND`: Weapon (melee)
- `1301071`, `1301082`: ElectricGun
- `1301091`: Flamethrower
- All other guns: Gun

---

### 4.2.13 Battle Controller

**File:** `src/game/combat/Battle.ts`

**Port from:** `OriginalGame/src/game/Battle.js` (lines 12-265)

**Tasks:**
- [ ] Create Battle class (main controller)
- [ ] Initialize battle with monster list
- [ ] Manage battle lines (6 lines)
- [ ] Manage monsters (spawn, move, attack, die)
- [ ] Manage battle player
- [ ] Implement update loops (monster update, player update)
- [ ] Implement escape/dodge mechanics
- [ ] Track battle statistics
- [ ] Handle battle end (win/loss)
- [ ] Emit events for UI updates

**Key Methods:**
- `constructor(battleInfo, isDodge, difficulty, banditOverride, endLogOverride)`
- `updateMonster(dt)` - Update all monsters (every 1s)
- `updatePlayer(dt)` - Update player actions (every 0.1s)
- `removeMonster(monster)` - Remove dead monster
- `checkGameEnd()` - Check if all monsters dead
- `gameEnd(isWin)` - End battle and calculate results
- `processLog(log, color?, bigger?)` - Emit log message
- `dodgeEnd(dt)` - Update escape progress
- `getLastLine()` - Get line 5 (furthest)
- `updateTargetMonster()` - Update current target (monsters[0])
- `setGameEndListener(listener)` - Set callback for battle end

**Initialization:**
- Create 6 battle lines (indicateLines)
- Spawn monsters from battleInfo.monsterList
- Place first monster at last line (line 5)
- Create BattlePlayer from player state
- Initialize battle statistics (sumRes)
- Start update loops:
  - Monster update: Every 1 second
  - Player update: Every 0.1 seconds
  - Dodge update: Every 0.1 seconds (if dodging)

**Update Loops:**
- Monster update: Call `monster.move()` for each monster
- Player update: Call `player.action()` (if not dodging)
- Dodge update: Increment `dodgePassTime`, emit progress, end when complete

**Battle End:**
- Save bullet/tool counts back to player bag
- Calculate weapon breaking (if win)
- Apply virus damage
- Call game end listener with results
- Resume game timer
- Resume music

**Weapon Breaking:**
- Guns: Break chance based on usage and bullet type multiplier
- Melee: Break chance based on usage
- Armor: Break chance based on damage taken
- Special guns (1301091, 1301071, 1301082): No breaking multiplier

**Events:**
- `battleProcessLog` - Combat log messages
- `battleMonsterLength` - Monster count updates
- `battleDodgePercentage` - Escape progress updates

---

## 4.3 Battle UI Components

### 4.3.1 Battle Scene

**File:** `src/components/scenes/BattleScene.tsx`

**Tasks:**
- [ ] Create BattleScene component
- [ ] Render battle UI (monsters, player, combat log)
- [ ] Handle battle state updates
- [ ] Integrate with battle engine
- [ ] Handle battle end transitions

**Structure:**
- Full-screen scene
- Battle panel content (monsters, log, controls)
- Overlay for battle end results

---

### 4.3.2 Battle Panel Content

**File:** `src/components/panels/BattlePanelContent.tsx`

**Port from:** `OriginalGame/src/ui/battleAndWorkNode.js` (battle-related sections)

**Tasks:**
- [ ] Create BattlePanelContent component
- [ ] Render battle begin view (pre-battle setup)
- [ ] Render battle process view (active combat)
- [ ] Render battle end view (results)
- [ ] Display equipped weapons
- [ ] Display difficulty and monster count
- [ ] Display bullet priority selector (if applicable)
- [ ] Display warnings (no weapon, low energy, alcohol effect)
- [ ] Display combat log (7 lines)
- [ ] Display monster progress bar
- [ ] Display escape progress (if dodging)

**Battle Begin View:**
- Site image (monster_dig or bandit_dig based on difficulty)
- Description text (difficulty description)
- Equipped weapon icons
- Difficulty label (with color coding: red if > 2)
- Bullet priority selector (if gun equipped and both bullet types available)
- Warnings:
  - No weapon warning (red)
  - Alcohol effect warning (red, shows hours)
  - Low energy warning (red)
- Start battle button

**Battle Process View:**
- Combat log (7 lines, scrolls up)
- Monster progress bar (shows remaining/total)
- Escape progress bar (if dodging)
- Left button disabled during battle

**Battle End View:**
- Result message (win/loss)
- Consumed items display (bullets, tools, fuel)
- Damage summary (HP lost, virus gained)
- Broken weapons display (if any)
- Continue button

**Combat Log:**
- 7 log lines
- Scrolls up when new message added
- Supports color coding (white, red, green, orange)
- Supports font size (normal, bigger)
- Messages split if too long (55 chars per line)

**Monster Progress:**
- Progress bar showing (total - remaining) / total
- Label showing "Monsters: remaining/total" or "Bandits: remaining/total"

---

### 4.3.3 Battle UI Hooks

**File:** `src/hooks/useBattle.ts`

**Tasks:**
- [ ] Create useBattle hook
- [ ] Initialize battle engine
- [ ] Subscribe to battle events
- [ ] Update battle store
- [ ] Handle battle lifecycle
- [ ] Cleanup on unmount

**Functionality:**
- Initialize Battle instance
- Subscribe to battle events (log, monster count, dodge progress)
- Update battleStore with state changes
- Handle battle end callback
- Cleanup subscriptions on unmount

---

### 4.3.4 Battle Result Overlay

**File:** `src/components/overlays/BattleResultOverlay.tsx`

**Tasks:**
- [ ] Create BattleResultOverlay component
- [ ] Display battle results
- [ ] Show consumed items
- [ ] Show damage taken
- [ ] Show broken weapons
- [ ] Handle continue action

**Note:** This may be integrated into BattlePanelContent instead of separate overlay.

---

## 4.4 Integration Points

### 4.4.1 Site Panel Integration

**File:** `src/components/panels/SitePanelContent.tsx`

**Tasks:**
- [ ] Add battle room handling
- [ ] Trigger battle when entering battle room
- [ ] Handle battle results
- [ ] Update site state after battle

**Integration:**
- Check if room type is "battle"
- Show battle begin view
- Start battle when button clicked
- Handle battle end (win/loss)
- Update site progress
- Check for secret rooms after battle

---

### 4.4.2 Player Store Integration

**File:** `src/store/playerStore.ts`

**Tasks:**
- [ ] Add battle-related state if needed
- [ ] Add methods to update player state after battle
- [ ] Handle weapon breaking
- [ ] Handle bullet/tool consumption

**Note:** Most battle state is in battleStore, but player attributes need updates.

---

### 4.4.3 UI Store Integration

**File:** `src/store/uiStore.ts`

**Tasks:**
- [ ] Add 'battle' scene type (if using separate scene)
- [ ] Add battle panel type (if using panel)
- [ ] Handle scene/panel transitions

**Note:** Battle may be integrated into SitePanelContent instead of separate scene/panel.

---

### 4.4.4 Audio Integration

**File:** `src/game/systems/AudioManager.ts`

**Tasks:**
- [ ] Add battle music tracks
- [ ] Add battle sound effects
- [ ] Play appropriate music (BATTLE for bandits, BATTLE_OLD for zombies)
- [ ] Play weapon sound effects
- [ ] Play monster sound effects

**Sound Effects Needed:**
- ATTACK_1 through ATTACK_8 (weapon sounds)
- MONSTER_ATTACK
- MONSTER_DIE
- BANDIT_DIE
- BOMB
- TRAP
- ESTOVE, STOVE (flamethrower)
- PUNCH (hand-to-hand)
- SHORT_BARK (dog)

---

## 4.5 Testing Checklist

### 4.5.1 Battle Engine Tests

- [ ] Monster spawns correctly
- [ ] Monster moves toward player
- [ ] Monster attacks when in range
- [ ] Player takes damage correctly
- [ ] Player dies when HP reaches 0
- [ ] Monster dies when HP reaches 0
- [ ] Battle ends when all monsters dead
- [ ] Battle ends when player dies
- [ ] Escape mechanic works
- [ ] Weapon cooldowns work correctly
- [ ] Bullet consumption works
- [ ] Tool consumption works
- [ ] Weapon breaking calculation works

### 4.5.2 Weapon Tests

- [ ] Melee weapons attack correctly
- [ ] Guns fire correctly
- [ ] Gun accuracy calculation works
- [ ] Bullet priority works (standard vs homemade)
- [ ] Electric guns use electricity
- [ ] Flamethrower attacks all monsters
- [ ] Bombs damage all monsters
- [ ] Traps stop monsters
- [ ] Hand-to-hand combat works

### 4.5.3 UI Tests

- [ ] Battle begin view displays correctly
- [ ] Combat log updates correctly
- [ ] Monster progress bar updates
- [ ] Escape progress bar works
- [ ] Battle end view displays correctly
- [ ] Consumed items display correctly
- [ ] Broken weapons display correctly
- [ ] Warnings display correctly
- [ ] Bullet priority selector works

### 4.5.4 Integration Tests

- [ ] Battle starts from site panel
- [ ] Battle results update site state
- [ ] Player attributes update after battle
- [ ] Weapon breaking updates inventory
- [ ] Bullet/tool consumption updates inventory
- [ ] Battle music plays correctly
- [ ] Sound effects play correctly
- [ ] Battle can be escaped
- [ ] Battle can be won
- [ ] Battle can be lost

---

## 4.6 Implementation Order

### Phase 4.1: Data & Types
1. Port monster configuration data
2. Update combat types if needed
3. Create BattleConfig

### Phase 4.2: Core Battle Engine
1. Create BattleLine class
2. Create Monster class
3. Create BattlePlayer class
4. Create BattleEquipment base class
5. Create Battle class (controller)

### Phase 4.3: Weapon System
1. Create Weapon (melee) class
2. Create Gun class
3. Create ElectricGun class
4. Create Flamethrower class
5. Create Bomb class
6. Create Trap class
7. Create equipment factory

### Phase 4.4: UI Components
1. Create BattlePanelContent component
2. Create battle begin view
3. Create battle process view
4. Create battle end view
5. Integrate with SitePanelContent

### Phase 4.5: Integration & Polish
1. Integrate with player store
2. Integrate with audio system
3. Add battle events/emitters
4. Test all battle scenarios
5. Fix bugs and edge cases

---

## 4.7 Notes & Considerations

### 4.7.1 Timing System
- Original uses Cocos2d scheduler (`cc.director.getScheduler()`)
- React port should use:
  - `setInterval` for update loops
  - `setTimeout` for cooldowns
  - Or integrate with game loop in MainScene

### 4.7.2 Event System
- Original uses `utils.emitter` for events
- React port should use:
  - Existing `emitter` utility from `src/utils/emitter.ts`
  - Or Zustand store updates
  - Or React state updates

### 4.7.3 Battle State Management
- Battle state is complex and changes frequently
- Consider using Zustand store (battleStore) for reactive updates
- Battle engine can update store, UI components subscribe to store

### 4.7.4 Coordinate System
- Battle UI uses same coordinate system as rest of game
- Follow COCOS_TO_CSS_POSITION_MAPPING.md for positioning

### 4.7.5 Bandit vs Zombie
- Site 500 = bandit encounters
- Other sites = zombie encounters
- Different strings, sounds, and some mechanics
- Use `useBandit()` method to determine mode

### 4.7.6 Work Site (Site 502)
- Special site where flamethrower is not used
- Some tools are not used
- Melee-only combat

### 4.7.7 Dog Companion
- Dog helps in battle if:
  - `player.dogState` exists
  - `player.isDogActive()` returns true
  - Building 12 (dog house) level >= 0
- Dog actions:
  - 20% chance: Attack enemy (10-25 damage)
  - 10% chance: Kite enemy (stop monsters)
- Dog actions reduce dog mood/injury

### 4.7.8 Weapon Breaking
- Weapons can break after battle
- Breaking chance based on:
  - Weapon usage count
  - Weapon type (gun vs melee vs armor)
  - Bullet type multiplier (for guns)
  - IAP package effects
- Broken weapons are removed from equipment
- Some weapons return items when broken

### 4.7.9 Secret Rooms
- Battle can occur in secret rooms
- Same battle mechanics apply
- Different UI/music for secret rooms

---

## 4.8 File Structure

```
src/
  game/
    combat/
      Battle.ts              # Main battle controller
      BattleConfig.ts        # Battle constants
      BattleLine.ts          # Distance line system
      Monster.ts             # Monster entity
      BattlePlayer.ts        # Player in combat
      BattleEquipment.ts     # Base weapon class
      Weapon.ts              # Melee weapons
      Gun.ts                 # Ranged weapons
      ElectricGun.ts         # Electric weapons
      Flamethrower.ts        # Flamethrower
      Bomb.ts                # Explosives
      Trap.ts                # Traps
      createEquipment.ts     # Weapon factory
      index.ts               # Exports
  components/
    scenes/
      BattleScene.tsx        # Battle scene (if separate scene)
    panels/
      BattlePanelContent.tsx # Battle panel content
    overlays/
      BattleResultOverlay.tsx # Battle results (if separate overlay)
  data/
    monsters.ts              # Monster configurations
  hooks/
    useBattle.ts             # Battle hook
  store/
    battleStore.ts           # Battle state (already exists)
```

---

## 4.9 Estimated Timeline

| Task | Duration | Priority |
|------|----------|----------|
| Data migration | 0.5 days | P0 |
| Core battle engine | 2 days | P0 |
| Weapon system | 2 days | P0 |
| UI components | 2 days | P0 |
| Integration | 1 day | P0 |
| Testing & bug fixes | 1.5 days | P0 |

**Total: ~9 days for full combat system implementation**

---

## 4.10 Dependencies

### Required Systems (Must be complete):
- Player store (attributes, inventory, equipment)
- Item system (weapons, bullets, tools)
- Site system (battle rooms)
- Audio system (music, sound effects)
- Time system (for cooldowns)
- Weather system (for modifiers)

### Optional Systems (Can be added later):
- Dog companion (can stub initially)
- Secret rooms (can stub initially)
- Weapon breaking (can stub initially)

---

## Next Steps

1. **Review this plan** and approve or request modifications
2. **Switch to ACT mode** to begin implementation
3. **Start with Phase 4.1**: Data migration and types
4. **Follow implementation order**: Core engine → Weapons → UI → Integration

---

## References

- Original Battle.js: `OriginalGame/src/game/Battle.js`
- Original Battle UI: `OriginalGame/src/ui/battleAndWorkNode.js`
- Original Monster Config: `OriginalGame/src/data/monsterConfig.js`
- Position Mapping: `COCOS_TO_CSS_POSITION_MAPPING.md`
- Porting Plan: `PORTING_PLAN.md`


