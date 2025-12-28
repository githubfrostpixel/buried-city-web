# Phase 2D: UI Components - 1:1 Porting Plan

## Overview

This document provides a detailed implementation plan for Phase 2D: UI Components. This phase focuses on **1:1 porting** of UI components from the original Cocos2d-JS game to React/TypeScript, maintaining exact positioning, scaling, and visual appearance.

**Critical Requirements:**
- **DO NOT CREATE NEW UI** - Only port existing UI 1:1 from original game
- All assets are available in `src/assets`
- Cocos positioning (bottom-left origin) differs from CSS (top-left origin) - conversion required
- Some images need scaling (0.4, 0.5, 0.6, 0.7, 0.87 scales used in original)
- Screen resolution: 640x1136 (mobile-first)

**Prerequisites:**
- Phase 1 complete (TimeManager, SaveSystem, PlayerStore, AudioManager) ✓
- Phase 2A complete (Survival System) ✓
- Phase 2B complete (Item & Storage System) ✓
- Phase 2C complete (Building System) ✓ - **CONFIRMED: Building.ts, Room.ts, buildingStore.ts, buildings.ts all exist**
- All assets converted and available in `src/assets` ✓

---

## 1. Position Conversion System

### 1.1 Cocos to CSS Coordinate Conversion

**Original Game Coordinate System:**
- Origin: Bottom-left (0, 0)
- Screen size: 640x1136
- Y-axis: Increases upward

**CSS Coordinate System:**
- Origin: Top-left (0, 0)
- Screen size: 640x1136
- Y-axis: Increases downward

**Conversion Formula:**
```typescript
// Cocos Y to CSS Y
cssY = screenHeight - cocosY

// For anchor point conversions
// Cocos anchor (0.5, 0) = CSS: left: 50%, top: 0
// Cocos anchor (0.5, 1) = CSS: left: 50%, top: 100%
// Cocos anchor (0, 0) = CSS: left: 0, bottom: 0
```

### 1.2 Utility Functions

**File**: `src/utils/position.ts` (create new)

```typescript
/**
 * Convert Cocos Y coordinate to CSS Y coordinate
 * @param cocosY - Y coordinate from Cocos (bottom-left origin)
 * @param screenHeight - Screen height (default: 1136)
 * @returns CSS Y coordinate (top-left origin)
 */
export function cocosToCssY(cocosY: number, screenHeight: number = 1136): number {
  return screenHeight - cocosY
}

/**
 * Convert Cocos position to CSS position
 * @param cocosPos - Position from Cocos {x, y}
 * @param anchor - Anchor point {x: 0-1, y: 0-1}
 * @param size - Element size {width, height}
 * @param screenHeight - Screen height (default: 1136)
 * @returns CSS position style object
 */
export function cocosToCssPosition(
  cocosPos: { x: number; y: number },
  anchor: { x: number; y: number } = { x: 0.5, y: 0.5 },
  size?: { width: number; height: number },
  screenHeight: number = 1136
): React.CSSProperties {
  const cssY = cocosToCssY(cocosPos.y, screenHeight)
  
  // Calculate position based on anchor point
  let left = cocosPos.x
  let top = cssY
  
  if (size) {
    left -= size.width * anchor.x
    top -= size.height * anchor.y
  }
  
  return {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    transform: anchor.x === 0.5 ? 'translateX(-50%)' : undefined
  }
}

/**
 * Convert Cocos anchor point to CSS positioning
 * @param anchorX - Anchor X (0-1)
 * @param anchorY - Anchor Y (0-1)
 * @returns CSS positioning style
 */
export function cocosAnchorToCss(anchorX: number, anchorY: number): React.CSSProperties {
  const styles: React.CSSProperties = {}
  
  if (anchorX === 0) {
    styles.left = 0
  } else if (anchorX === 0.5) {
    styles.left = '50%'
    styles.transform = 'translateX(-50%)'
  } else if (anchorX === 1) {
    styles.right = 0
  }
  
  if (anchorY === 0) {
    styles.bottom = 0
  } else if (anchorY === 0.5) {
    styles.top = '50%'
    styles.transform = anchorX === 0.5 ? 'translate(-50%, -50%)' : 'translateY(-50%)'
  } else if (anchorY === 1) {
    styles.top = 0
  }
  
  return styles
}
```

**Implementation Steps:**
1. Create `src/utils/position.ts`
2. Implement `cocosToCssY()` function
3. Implement `cocosToCssPosition()` function
4. Implement `cocosAnchorToCss()` function
5. Test with known Cocos positions

---

## 2. TopBar Component (TopFrame)

### 2.1 Requirements Analysis

From `OriginalGame/src/ui/topFrame.js`:

**TopBar Structure:**
- Background sprite: `#frame_bg_top.png`
- Position: `cc.winSize.width / 2, cc.winSize.height - 18` (or `-90` with screenFix)
- Anchor: `(0.5, 1)` - centered horizontally, anchored to top
- Scale: `0.87` if `screenFix == 1`, else `1.0`

**First Line (Status Icons):**
- Position: `(6, 190)` relative to bg
- Size: `584x50`
- Contains: Day, Season, Time, Weather, Temperature, Electric, Currency, Fuel

**Second Line (Attribute Bars):**
- Position: `(6, 134)` relative to bg
- Size: `584x50`
- Contains: Injury, Infect, Starve, Vigour, Spirit, Water, Virus, HP

**Third Line (Log Bar):**
- Position: `(6, 6)` relative to bg
- Size: `584x122`
- Contains: Log messages, Talent button, Dog button

### 2.2 Implementation Plan

**File**: `src/components/layout/TopBar.tsx`

**Component Structure:**

```typescript
import { useGameStore } from '@/store/gameStore'
import { usePlayerStore } from '@/store/playerStore'
import { cocosToCssPosition, cocosAnchorToCss } from '@/utils/position'
import { Sprite } from '@/components/sprites/Sprite'
import { StatusButton } from '@/components/common/StatusButton'
import { AttrButton } from '@/components/common/AttrButton'

export function TopBar() {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  
  // Screen dimensions
  const screenWidth = 640
  const screenHeight = 1136
  const screenFix = 0 // TODO: Get from settings
  
  // Background position (Cocos: width/2, height-18, anchor: 0.5, 1)
  const bgScale = screenFix === 1 ? 0.87 : 1.0
  const bgCocosY = screenFix === 1 ? screenHeight - 90 : screenHeight - 18
  const bgStyle = {
    ...cocosToCssPosition(
      { x: screenWidth / 2, y: bgCocosY },
      { x: 0.5, y: 1 }
    ),
    transform: 'translateX(-50%)',
    width: `${596 * bgScale}px`, // frame_bg_top.png width
    height: `${244 * bgScale}px` // frame_bg_top.png height
  }
  
  return (
    <div className="absolute" style={bgStyle}>
      {/* Background sprite */}
      <Sprite 
        atlas="ui" 
        frame="frame_bg_top.png"
        className="absolute inset-0"
        style={{ transform: `scale(${bgScale})` }}
      />
      
      {/* First Line - Status Icons */}
      <div className="absolute" style={{ left: '6px', top: '190px', width: '584px', height: '50px' }}>
        {/* Day button */}
        <StatusButton
          icon="icon_day.png"
          label={gameStore.day + 1}
          position={{ x: btnSize.width * 0.4 + 7.3, y: 25 }}
          scale={0.4}
          onClick={() => showStatusDialog(1, gameStore.getTimeDayStr(), 'icon_day.png')}
        />
        
        {/* Season button */}
        <StatusButton
          icon={`icon_season_${gameStore.season}.png`}
          label=""
          position={{ x: btnSize.width * 1.2 + 4.8, y: 25 }}
          scale={0.4}
          noLabel={true}
          onClick={() => showStatusDialog(2, gameStore.getSeasonStr(), 'icon_season.png')}
        />
        
        {/* Time button */}
        <StatusButton
          icon="icon_time.png"
          label={gameStore.getTimeHourStr()}
          position={{ x: btnSize.width * 2 + 5.5, y: 25 }}
          scale={0.4}
          onClick={() => showStatusDialog(4, gameStore.getTimeHourStr(), 'icon_time.png')}
        />
        
        {/* Weather button */}
        <StatusButton
          icon={`icon_weather_${gameStore.weather.weatherId}.png`}
          label={gameStore.weather.getWeatherName()}
          position={{ x: btnSize.width * 2.9 - 3, y: 25 }}
          scale={0.4}
          noLabel={true}
          onClick={() => showStatusDialog(11, gameStore.weather.getWeatherName(), 'icon_weather.png')}
        />
        
        {/* Temperature button */}
        <StatusButton
          icon="icon_temperature_0.png"
          label={playerStore.temperature}
          position={{ x: btnSize.width * 3.5 - 4, y: 25 }}
          scale={0.4}
          onClick={() => showStatusDialog(3, playerStore.temperature, 'icon_temperature_0.png')}
        />
        
        {/* Electric button */}
        <StatusButton
          icon={`icon_electric_${gameStore.workSiteActive ? 'active' : 'inactive'}.png`}
          label={gameStore.workSiteActive ? 'Active' : 'Inactive'}
          position={{ x: btnSize.width * 4 + 4.5, y: 25 }}
          scale={0.6}
          noLabel={true}
          onClick={() => showStatusDialog(12, gameStore.workSiteActive ? 'Active' : 'Inactive', 'icon_electric.png')}
        />
        
        {/* Currency button */}
        <StatusButton
          icon="icon_item_money.png"
          label={Math.floor(playerStore.currency)}
          position={{ x: btnSize.width * 5 - 12.5, y: 25 }}
          scale={0.5}
          onClick={() => showStatusDialog(13, Math.floor(playerStore.currency), 'icon_item_money.png')}
        />
        
        {/* Fuel gauge button */}
        <StatusButton
          icon={`icon_oil_${gameStore.gasSiteActive ? 'active' : 'inactive'}.png`}
          label={Math.floor(playerStore.fuel)}
          position={{ x: btnSize.width * 5.7 - 0.4, y: 25 }}
          scale={0.6}
          onClick={() => showStatusDialog(16, `${Math.floor(playerStore.fuel)}/${playerStore.hasMotorcycle() ? 99 : 0}`, 'icon_oil.png')}
        />
      </div>
      
      {/* Second Line - Attribute Bars */}
      <div className="absolute" style={{ left: '6px', top: '134px', width: '584px', height: '50px' }}>
        <AttrButton
          attr="injury"
          position={{ x: 584 / 16 * 1, y: 25 }}
          warnRange={new Range("[0,0.5]")}
          reversePercentage={true}
          onClick={() => showAttrStatusDialog(10, 'injury')}
        />
        
        <AttrButton
          attr="infect"
          position={{ x: 584 / 16 * 3, y: 25 }}
          warnRange={new Range("[0,0.75]")}
          reversePercentage={true}
          onClick={() => showAttrStatusDialog(9, 'infect')}
        />
        
        <AttrButton
          attr="starve"
          position={{ x: 584 / 16 * 5, y: 25 }}
          warnRange={new Range("[0,0.5]")}
          reversePercentage={false}
          onClick={() => showAttrStatusDialog(6, 'starve')}
        />
        
        <AttrButton
          attr="vigour"
          position={{ x: 584 / 16 * 7, y: 25 }}
          warnRange={new Range("[0,0.5]")}
          reversePercentage={false}
          onClick={() => showAttrStatusDialog(7, 'vigour')}
        />
        
        <AttrButton
          attr="spirit"
          position={{ x: 584 / 16 * 9, y: 25 }}
          warnRange={new Range("[0,0.5]")}
          reversePercentage={false}
          onClick={() => showAttrStatusDialog(8, 'spirit')}
        />
        
        <AttrButton
          attr="water"
          position={{ x: 584 / 16 * 11, y: 25 }}
          warnRange={new Range("[0,0.5]")}
          reversePercentage={false}
          onClick={() => showAttrStatusDialog(14, 'water')}
        />
        
        <AttrButton
          attr="virus"
          position={{ x: 584 / 16 * 13, y: 25 }}
          warnRange={new Range("[0,0.25]")}
          reversePercentage={true}
          onClick={() => showAttrStatusDialog(15, 'virus')}
        />
        
        <AttrButton
          attr="hp"
          position={{ x: 584 / 16 * 15, y: 25 }}
          warnRange={new Range("[0,0.5]")}
          reversePercentage={false}
          onClick={() => showAttrStatusDialog(5, 'hp')}
        />
      </div>
      
      {/* Third Line - Log Bar */}
      <div className="absolute" style={{ left: '6px', top: '6px', width: '584px', height: '122px' }}>
        {/* Log messages */}
        <LogBar />
        
        {/* Talent button */}
        <TalentButton
          position={{ x: 564, y: 102 }}
          scale={0.7}
          onClick={() => {/* Navigate to talent selection */}}
        />
        
        {/* Dog button */}
        <DogButton
          position={{ x: 566, y: 22 }}
          scale={0.7}
          onClick={() => {/* Navigate to dog panel */}}
        />
      </div>
    </div>
  )
}
```

**Implementation Steps:**

1. Create `src/components/layout/TopBar.tsx`
2. Implement background positioning with scale support
3. Implement first line with all status buttons
4. Implement second line with all attribute buttons
5. Implement third line with log bar, talent button, dog button
6. Add event listeners for attribute changes
7. Add time update callback (every 60 seconds)
8. Test all button positions match original
9. Test scaling with screenFix
10. Test attribute updates in real-time

**Dependencies:**
- `store/gameStore.ts` - Time, weather, season
- `store/playerStore.ts` - Attributes, currency, fuel
- `components/common/StatusButton.tsx` - Status button component
- `components/common/AttrButton.tsx` - Attribute button component
- `components/common/LogBar.tsx` - Log bar component
- `utils/position.ts` - Position conversion utilities

---

## 3. BottomBar Component (BottomFrame)

### 3.1 Requirements Analysis

From `OriginalGame/src/ui/bottomFrame.js`:

**BottomBar Structure:**
- Background sprite: `#frame_bg_bottom.png`
- Position: `cc.winSize.width / 2, 18` (or `90` with screenFix)
- Anchor: `(0.5, 0)` - centered horizontally, anchored to bottom
- Scale: `0.87` if `screenFix == 1`, else `1.0`
- Content area: `bgRect` (0, 0, bg.width, bg.height)
- Top line: `contentTopLineHeight = 770`
- Action bar: `actionBarBaseHeight = 803`
- Title, left button, right button at action bar height

### 3.2 Implementation Plan

**File**: `src/components/layout/BottomBar.tsx`

**Base Component Structure:**

```typescript
import { cocosToCssPosition } from '@/utils/position'
import { Sprite } from '@/components/sprites/Sprite'
import { SpriteButton } from '@/components/common/SpriteButton'

interface BottomBarProps {
  title?: string
  leftBtn?: boolean
  rightBtn?: boolean
  onLeftClick?: () => void
  onRightClick?: () => void
  children?: React.ReactNode
}

export function BottomBar({ 
  title = "", 
  leftBtn = false, 
  rightBtn = true,
  onLeftClick,
  onRightClick,
  children 
}: BottomBarProps) {
  const screenWidth = 640
  const screenHeight = 1136
  const screenFix = 0 // TODO: Get from settings
  
  // Background position (Cocos: width/2, 18, anchor: 0.5, 0)
  const bgScale = screenFix === 1 ? 0.87 : 1.0
  const bgCocosY = screenFix === 1 ? 90 : 18
  const bgStyle = {
    ...cocosToCssPosition(
      { x: screenWidth / 2, y: bgCocosY },
      { x: 0.5, y: 0 }
    ),
    transform: 'translateX(-50%)',
    width: `${596 * bgScale}px`, // frame_bg_bottom.png width
    height: `${803 * bgScale}px` // frame_bg_bottom.png height
  }
  
  const contentTopLineHeight = 770
  const actionBarBaseHeight = 803
  
  return (
    <div className="absolute" style={bgStyle}>
      {/* Background sprite */}
      <Sprite 
        atlas="ui" 
        frame="frame_bg_bottom.png"
        className="absolute inset-0"
        style={{ transform: `scale(${bgScale})` }}
      />
      
      {/* Line separator */}
      <Sprite
        atlas="ui"
        frame="frame_line.png"
        className="absolute"
        style={{
          left: '50%',
          top: `${contentTopLineHeight}px`,
          transform: 'translateX(-50%)'
        }}
      />
      
      {/* Title */}
      {title && (
        <div
          className="absolute text-center"
          style={{
            left: '50%',
            top: `${actionBarBaseHeight}px`,
            transform: 'translateX(-50%)',
            fontSize: '18px', // uiUtil.fontSize.COMMON_1
            fontFamily: 'Arial' // uiUtil.fontFamily.normal
          }}
        >
          {title}
        </div>
      )}
      
      {/* Left button */}
      {leftBtn && (
        <SpriteButton
          normal="btn_back.png"
          disabled="btn_back_disabled.png"
          size={{ width: 100, height: 70 }}
          position={{ x: 60, y: actionBarBaseHeight }}
          onClick={onLeftClick}
        />
      )}
      
      {/* Right button */}
      {rightBtn && (
        <SpriteButton
          normal="btn_forward.png"
          disabled="btn_forward_disabled.png"
          size={{ width: 100, height: 70 }}
          position={{ x: 596 - 60, y: actionBarBaseHeight }}
          onClick={onRightClick}
        />
      )}
      
      {/* Content area */}
      <div className="absolute inset-0" style={{ paddingTop: '0px', paddingBottom: `${actionBarBaseHeight + 50}px` }}>
        {children}
      </div>
    </div>
  )
}
```

**Implementation Steps:**

1. Create `src/components/layout/BottomBar.tsx`
2. Implement background positioning with scale support
3. Implement line separator
4. Implement title display
5. Implement left/right buttons
6. Implement content area
7. Test positioning matches original
8. Test button visibility toggles

**Dependencies:**
- `components/common/SpriteButton.tsx` - Button component
- `utils/position.ts` - Position conversion utilities

---

## 4. HomePanel Component (HomeNode)

### 4.1 Requirements Analysis

From `OriginalGame/src/ui/home.js`:

**HomePanel Structure:**
- Background: `res/new/home_bg.png`
- Position: `bgRect.width / 2, 0` (centered horizontally, bottom-aligned)
- Anchor: `(0.5, 0)`
- Building positions (from original code):
  ```javascript
  {bid: 1, pos: {x: 65, y: 230}}
  {bid: 2, pos: {x: 425, y: 780}}
  {bid: 18, pos: {x: 205, y: 165}}
  {bid: 4, pos: {x: 477, y: 562}}
  {bid: 5, pos: {x: 310, y: 330}}
  {bid: 6, pos: {x: 75, y: 390}}
  {bid: 15, pos: {x: 408, y: 677}}
  {bid: 7, pos: {x: 250, y: 630}}
  {bid: 8, pos: {x: 84, y: 780}}
  {bid: 9, pos: {x: 75, y: 590}}
  {bid: 10, pos: {x: 480, y: 410}}
  {bid: 11, pos: {x: 436, y: 85}}
  {bid: 13, pos: {x: 124, y: 49}}
  {bid: 14, pos: {x: 425, y: 216}}
  {bid: 16, pos: {x: 203, y: 290}}
  {bid: 19, pos: {x: 436, y: 85}}
  {bid: 17, pos: {x: 416, y: 108}}
  {bid: 3, pos: {x: 545, y: 268}}
  {bid: 12, pos: {x: 335, y: 125}}
  {bid: 20, pos: {x: 196, y: 780}}
  {bid: 21, pos: {x: 525, y: 674}}
  ```
- Building sprite: `#icon_start_build_{bid}_{level}.png`
- Gate light effect: `gate_light.png` with fade animation

### 4.2 Implementation Plan

**File**: `src/components/panels/HomePanel.tsx`

**Component Structure:**

```typescript
import { useEffect } from 'react'
import { useBuildingStore } from '@/store/buildingStore'
import { usePlayerStore } from '@/store/playerStore'
import { cocosToCssY } from '@/utils/position'
import { Sprite } from '@/components/sprites/Sprite'
import { BuildingButton } from '@/components/common/BuildingButton'

const BUILDING_POSITIONS = [
  { bid: 1, pos: { x: 65, y: 230 } },
  { bid: 2, pos: { x: 425, y: 780 } },
  { bid: 18, pos: { x: 205, y: 165 } },
  { bid: 4, pos: { x: 477, y: 562 } },
  { bid: 5, pos: { x: 310, y: 330 } },
  { bid: 6, pos: { x: 75, y: 390 } },
  { bid: 15, pos: { x: 408, y: 677 } },
  { bid: 7, pos: { x: 250, y: 630 } },
  { bid: 8, pos: { x: 84, y: 780 } },
  { bid: 9, pos: { x: 75, y: 590 } },
  { bid: 10, pos: { x: 480, y: 410 } },
  { bid: 11, pos: { x: 436, y: 85 } },
  { bid: 13, pos: { x: 124, y: 49 } },
  { bid: 14, pos: { x: 425, y: 216 } },
  { bid: 16, pos: { x: 203, y: 290 } },
  { bid: 19, pos: { x: 436, y: 85 } },
  { bid: 17, pos: { x: 416, y: 108 } },
  { bid: 3, pos: { x: 545, y: 268 } },
  { bid: 12, pos: { x: 335, y: 125 } },
  { bid: 20, pos: { x: 196, y: 780 } },
  { bid: 21, pos: { x: 525, y: 674 } }
]

export function HomePanel() {
  const buildingStore = useBuildingStore()
  const playerStore = usePlayerStore()
  const screenHeight = 1136
  
  // Ensure building store is initialized
  useEffect(() => {
    if (!buildingStore.room) {
      buildingStore.initialize()
    }
  }, [buildingStore])
  
  // Background position (Cocos: bgRect.width/2, 0, anchor: 0.5, 0)
  const bgWidth = 596 // BottomBar bgRect.width
  const bgStyle = {
    position: 'absolute' as const,
    left: '50%',
    bottom: '0px',
    transform: 'translateX(-50%)',
    width: '596px',
    height: 'auto'
  }
  
  const handleBuildingClick = (bid: number) => {
    const building = buildingStore.getBuilding(bid)
    
    switch (bid) {
      case 13:
        // Navigate to storage (Storeroom)
        if (building && building.level >= 0) {
          // TODO: Navigate to storage panel
        }
        break
      case 14:
        // Navigate to gate (Toilet/Gate)
        if (building && building.level >= 0) {
          // TODO: Navigate to gate panel
        }
        break
      case 15:
        // Navigate to radio (Minefield/Radio)
        if (building && building.level >= 0) {
          // TODO: Navigate to radio panel
        }
        break
      default:
        // Navigate to build panel for all other buildings
        // TODO: Navigate to build panel with building info
        break
    }
  }
  
  return (
    <div className="absolute inset-0">
      {/* Home background */}
      <div style={bgStyle}>
        <Sprite
          atlas="new"
          frame="home_bg.png"
          className="w-full h-auto"
        />
        
        {/* Building buttons */}
        {BUILDING_POSITIONS.map(({ bid, pos }) => {
          const building = buildingStore.getBuilding(bid)
          const level = Math.max(0, building?.level ?? -1)
          const cssY = cocosToCssY(pos.y, screenHeight)
          const isActive = building ? building.level >= 0 : false
          
          return (
            <BuildingButton
              key={bid}
              bid={bid}
              level={level}
              isActive={isActive}
              position={{ x: pos.x, y: cssY }}
              onClick={() => handleBuildingClick(bid)}
            />
          )
        })}
        
        {/* Gate light effect (for building 14 - Toilet/Gate) */}
        {buildingStore.getBuilding(14)?.level >= 0 && (
          <GateLightEffect position={{ x: 425, y: cocosToCssY(216, screenHeight) }} />
        )}
      </div>
    </div>
  )
}

function GateLightEffect({ position }: { position: { x: number; y: number } }) {
  return (
    <div
      className="absolute animate-pulse"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        animation: 'fadeInOut 2s infinite'
      }}
    >
      <Sprite
        atlas="home"
        frame="gate_light.png"
        className="w-full h-full"
      />
    </div>
  )
}
```

**Implementation Steps:**

1. Create `src/components/panels/HomePanel.tsx`
2. Import and use `useBuildingStore()` hook (Phase 2C complete)
3. Initialize building store if needed
4. Implement home background positioning
5. Implement building button rendering with exact positions
6. Use `buildingStore.getBuilding(bid)` to get building data
7. Use `building.level` to determine active state and sprite level
8. Implement building click handlers with proper navigation
9. Implement gate light effect with fade animation
10. Add building state updates (white/black based on level)
11. Add warning icons for buildings that need attention (using `building.needWarn()`)
12. Test all building positions match original
13. Test building interactions
14. Test gate light animation

**Dependencies:**
- `store/buildingStore.ts` - **Phase 2C COMPLETE** ✓ - Full building store available
- `game/world/Building.ts` - **Phase 2C COMPLETE** ✓ - Building class with all methods
- `game/world/Room.ts` - **Phase 2C COMPLETE** ✓ - Room class with building management
- `data/buildings.ts` - **Phase 2C COMPLETE** ✓ - Building configurations
- `components/common/BuildingButton.tsx` - Building button component (to create)
- `utils/position.ts` - Position conversion utilities (to create)

---

## 5. Common UI Components

### 5.1 StatusButton Component

**File**: `src/components/common/StatusButton.tsx`

**Requirements:**
- Icon sprite with optional scale
- Label text
- Click handler
- Position support

**Implementation:**
```typescript
interface StatusButtonProps {
  icon: string
  label?: string
  position: { x: number; y: number }
  scale?: number
  noLabel?: boolean
  onClick?: () => void
}

export function StatusButton({ icon, label, position, scale = 1.0, noLabel = false, onClick }: StatusButtonProps) {
  return (
    <button
      className="absolute flex items-center gap-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      <Sprite
        atlas="ui"
        frame={icon}
        className="w-full h-full"
        style={{ transform: `scale(${scale})` }}
      />
      {!noLabel && label && (
        <span className="text-white text-sm">{label}</span>
      )}
    </button>
  )
}
```

### 5.2 AttrButton Component

**File**: `src/components/common/AttrButton.tsx`

**Requirements:**
- Attribute name
- Progress bar display
- Warning range support
- Reverse percentage option
- Click handler

**Implementation:**
```typescript
interface AttrButtonProps {
  attr: string
  position: { x: number; y: number }
  warnRange?: Range
  reversePercentage?: boolean
  onClick?: () => void
}

export function AttrButton({ attr, position, warnRange, reversePercentage = false, onClick }: AttrButtonProps) {
  const playerStore = usePlayerStore()
  const value = playerStore[attr]
  const max = playerStore[`${attr}Max`]
  const percentage = reversePercentage ? 1 - (value / max) : value / max
  const isWarning = warnRange && warnRange.contains(percentage)
  
  return (
    <button
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      <Sprite
        atlas="ui"
        frame={`icon_${attr}_0.png`}
        className="w-full h-full"
        style={{ transform: 'scale(0.5)' }}
      />
      <ProgressBar
        value={percentage}
        max={1}
        color={isWarning ? 'red' : 'green'}
        width={30}
        height={4}
      />
    </button>
  )
}
```

### 5.3 BuildingButton Component

**File**: `src/components/common/BuildingButton.tsx`

**Requirements:**
- Building ID and level
- Sprite: `icon_start_build_{bid}_{level}.png`
- White/black state based on building level
- Warning icon support
- Click handler

**Implementation:**
```typescript
interface BuildingButtonProps {
  bid: number
  level: number
  isActive: boolean
  position: { x: number; y: number }
  onClick?: () => void
}

export function BuildingButton({ bid, level, isActive, position, onClick }: BuildingButtonProps) {
  const buildingStore = useBuildingStore()
  const building = buildingStore.getBuilding(bid)
  
  // Get warning state from building (Phase 2C complete)
  const warnState = building?.needWarn() || { upgrade: false, make: false, take: false }
  const hasWarning = warnState.upgrade || warnState.make || warnState.take
  
  return (
    <button
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        cursor: onClick ? 'pointer' : 'default',
        filter: isActive ? 'none' : 'brightness(0.3)'
      }}
      onClick={onClick}
    >
      <Sprite
        atlas="home"
        frame={`icon_start_build_${bid}_${level}.png`}
        className="w-full h-full"
      />
      {/* Warning icon if needed */}
      {hasWarning && (
        <div className="absolute top-0 right-0">
          <Sprite
            atlas="ui"
            frame="icon_warn.png"
            className="w-4 h-4"
          />
        </div>
      )}
    </button>
  )
}
```

### 5.4 LogBar Component

**File**: `src/components/common/LogBar.tsx`

**Requirements:**
- Display last 4 log messages
- Scrollable log view
- Click to expand full log

**Implementation:**
```typescript
export function LogBar() {
  const [expanded, setExpanded] = useState(false)
  const logs = useLogStore(state => state.logs)
  
  return (
    <div className="absolute inset-0">
      {/* Log lines */}
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="absolute text-white text-xs"
          style={{
            left: '0px',
            top: `${i * 30 + 4}px`,
            width: '580px'
          }}
        >
          {logs[logs.length - 4 + i]?.txt || ''}
        </div>
      ))}
      
      {/* Expand button */}
      <button
        className="absolute inset-0"
        onClick={() => setExpanded(!expanded)}
      />
      
      {/* Expanded log view */}
      {expanded && <LogTableView />}
    </div>
  )
}
```

---

## 6. MainScene Component

### 6.1 Requirements Analysis

From `OriginalGame/src/ui/MainScene.js`:

**MainScene Structure:**
- Contains TopFrame (TopBar)
- Contains BottomFrame (BottomBar) via Navigation
- Loads all sprite atlases

### 6.2 Implementation Plan

**File**: `src/components/scenes/MainScene.tsx`

**Component Structure:**

```typescript
import { TopBar } from '@/components/layout/TopBar'
import { BottomBar } from '@/components/layout/BottomBar'
import { HomePanel } from '@/components/panels/HomePanel'
import { useUIStore } from '@/store/uiStore'

export function MainScene() {
  const uiStore = useUIStore()
  const currentPanel = uiStore.currentPanel // 'home', 'build', 'storage', etc.
  
  const screenWidth = 640
  const screenHeight = 1136
  
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        maxWidth: screenWidth,
        maxHeight: screenHeight,
        margin: '0 auto'
      }}
    >
      {/* Top bar */}
      <TopBar />
      
      {/* Bottom bar with current panel */}
      <BottomBar>
        {currentPanel === 'home' && <HomePanel />}
        {currentPanel === 'build' && <BuildPanel />}
        {currentPanel === 'storage' && <StoragePanel />}
        {/* ... other panels */}
      </BottomBar>
    </div>
  )
}
```

**Implementation Steps:**

1. Create `src/components/scenes/MainScene.tsx`
2. Implement container with screen dimensions
3. Add TopBar component
4. Add BottomBar with panel routing
5. Test scene switching
6. Test responsive layout

---

## 7. Image Scaling System

### 7.1 Scaling Requirements

From original code, images use various scales:
- `0.4` - Small icons (status buttons)
- `0.5` - Medium icons (attribute buttons, currency)
- `0.6` - Larger icons (electric, fuel)
- `0.7` - Talent button, dog button
- `0.87` - Screen fix scale for backgrounds

### 7.2 Implementation

**File**: `src/utils/scaling.ts` (create new)

```typescript
/**
 * Apply scale transform to element
 * @param scale - Scale factor (0-1)
 * @returns CSS transform string
 */
export function applyScale(scale: number): string {
  return `scale(${scale})`
}

/**
 * Scale sprite dimensions
 * @param width - Original width
 * @param height - Original height
 * @param scale - Scale factor
 * @returns Scaled dimensions
 */
export function scaleDimensions(width: number, height: number, scale: number): { width: number; height: number } {
  return {
    width: width * scale,
    height: height * scale
  }
}
```

**Usage in components:**
```typescript
<Sprite
  atlas="ui"
  frame="icon_day.png"
  style={{ transform: applyScale(0.4) }}
/>
```

---

## 8. Implementation Order

### Phase 2D.1: Position Utilities (Priority: High)
1. Create `src/utils/position.ts` with conversion functions
2. Create `src/utils/scaling.ts` with scaling utilities
3. Test position conversions with known values

### Phase 2D.2: Common Components (Priority: High)
4. Create `StatusButton.tsx`
5. Create `AttrButton.tsx`
6. Create `BuildingButton.tsx`
7. Create `LogBar.tsx`
8. Create `SpriteButton.tsx`
9. Test all common components

### Phase 2D.3: Layout Components (Priority: High)
10. Create `TopBar.tsx` with all three lines
11. Create `BottomBar.tsx` with base structure
12. Test layout components positioning

### Phase 2D.4: Panel Components (Priority: High)
13. Create `HomePanel.tsx` with all building positions
14. Test building rendering and interactions

### Phase 2D.5: Scene Integration (Priority: Medium)
15. Create/update `MainScene.tsx`
16. Integrate TopBar and BottomBar
17. Test scene routing

### Phase 2D.6: Polish & Testing (Priority: Medium)
18. Test all positions match original
19. Test scaling on different screen sizes
20. Test interactions and animations
21. Fix any positioning discrepancies

---

## 9. Dependencies & Blockers

### Blockers
- None - All prerequisites are complete ✓

### Dependencies
- `store/gameStore.ts` - Already exists ✓
- `store/playerStore.ts` - Already exists ✓
- `store/buildingStore.ts` - **Phase 2C COMPLETE** ✓ - Can use `useBuildingStore()` with full functionality
- `store/uiStore.ts` - Already exists ✓
- `game/world/Building.ts` - **Phase 2C COMPLETE** ✓
- `game/world/Room.ts` - **Phase 2C COMPLETE** ✓
- `data/buildings.ts` - **Phase 2C COMPLETE** ✓
- `components/sprites/Sprite.tsx` - Already exists ✓
- `components/sprites/ImageSprite.tsx` - Already exists ✓
- All sprite atlases in `src/assets` - Already available ✓

---

## 10. Testing Strategy

### Unit Tests
- Position conversion functions
- Scaling functions
- Component rendering

### Visual Tests
- Compare screenshots with original game
- Verify all positions match exactly
- Verify scaling matches original
- Verify animations match original

### Integration Tests
- TopBar updates with game state
- BottomBar navigation
- HomePanel building interactions
- Panel switching

### Manual Testing
- Test on 640x1136 viewport
- Test with screenFix = 0 and screenFix = 1
- Test all button clicks
- Test attribute updates
- Test building state changes

---

## 11. Position Reference Table

### TopBar Positions (relative to bg, Cocos coordinates)

| Element | Cocos X | Cocos Y | CSS X | CSS Y | Notes |
|---------|---------|---------|-------|-------|-------|
| Background | 320 | 1118 | 50% | 18px | anchor: 0.5, 1 |
| First Line | 6 | 190 | 6px | 946px | 584x50 |
| Second Line | 6 | 134 | 6px | 1002px | 584x50 |
| Third Line | 6 | 6 | 6px | 1130px | 584x122 |

### BottomBar Positions (relative to bg, Cocos coordinates)

| Element | Cocos X | Cocos Y | CSS X | CSS Y | Notes |
|---------|---------|---------|-------|-------|-------|
| Background | 320 | 18 | 50% | 1118px | anchor: 0.5, 0 |
| Line | 298 | 770 | 50% | 366px | centered |
| Action Bar | 298 | 803 | 50% | 333px | centered |
| Left Button | 60 | 803 | 60px | 333px | |
| Right Button | 536 | 803 | 536px | 333px | |

### HomePanel Building Positions (Cocos coordinates, relative to home_bg)

| Building ID | Cocos X | Cocos Y | CSS X | CSS Y |
|------------|---------|---------|-------|-------|
| 1 | 65 | 230 | 65px | 906px |
| 2 | 425 | 780 | 425px | 356px |
| 3 | 545 | 268 | 545px | 868px |
| 4 | 477 | 562 | 477px | 574px |
| 5 | 310 | 330 | 310px | 806px |
| 6 | 75 | 390 | 75px | 746px |
| 7 | 250 | 630 | 250px | 506px |
| 8 | 84 | 780 | 84px | 356px |
| 9 | 75 | 590 | 75px | 546px |
| 10 | 480 | 410 | 480px | 726px |
| 11 | 436 | 85 | 436px | 1051px |
| 12 | 335 | 125 | 335px | 1011px |
| 13 | 124 | 49 | 124px | 1087px |
| 14 | 425 | 216 | 425px | 920px |
| 15 | 408 | 677 | 408px | 459px |
| 16 | 203 | 290 | 203px | 846px |
| 17 | 416 | 108 | 416px | 1028px |
| 18 | 205 | 165 | 205px | 971px |
| 19 | 436 | 85 | 436px | 1051px |
| 20 | 196 | 780 | 196px | 356px |
| 21 | 525 | 674 | 525px | 462px |

---

## 12. Estimated Time

- Position utilities: 2-3 hours
- Common components: 6-8 hours
- TopBar component: 8-10 hours
- BottomBar component: 3-4 hours
- HomePanel component: 6-8 hours
- MainScene integration: 2-3 hours
- Testing & polish: 4-6 hours

**Total: ~31-42 hours**

---

## 13. Notes

1. **Position Accuracy**: All positions must match original game exactly. Use the position reference table for verification.

2. **Image Scaling**: Pay attention to scale factors used in original code. Some images are scaled to 0.4, 0.5, 0.6, 0.7, or 0.87.

3. **Screen Fix**: The original game has a `screenFix` variable that changes positioning and scaling. Support both `screenFix = 0` and `screenFix = 1`.

4. **Anchor Points**: Cocos anchor points need to be converted to CSS positioning. Common anchors:
   - `(0.5, 1)` = centered horizontally, top-aligned
   - `(0.5, 0)` = centered horizontally, bottom-aligned
   - `(0, 0)` = bottom-left
   - `(0.5, 0.5)` = centered

5. **Building Sprites**: Building sprites use format `icon_start_build_{bid}_{level}.png`. Level can be -1, 0, 1, or 2, but display uses `Math.max(0, level)`.

6. **Gate Light**: Building 14 (Gate/Toilet) has a special light effect (`gate_light.png`) that fades in/out continuously.

7. **No New UI**: This phase is strictly about porting existing UI. Do not add new features or change the design.

8. **Asset Paths**: All assets are in `src/assets/sprites/`. Use `getImagePath()` utility for correct paths.

9. **Building System Integration**: Phase 2C is complete, so you can use:
   - `buildingStore.getBuilding(bid)` to get building instances
   - `building.level` to check building state
   - `building.needWarn()` to check if building needs warning icon
   - `building.needBuild()` to check if building needs construction
   - `building.canUpgrade()` to check upgrade status
   - `buildingStore.initialize()` to initialize buildings for new game

---

## 14. Next Steps

1. Review and approve this plan
2. Switch to ACT mode
3. Implement in order: Phase 2D.1 → Phase 2D.2 → Phase 2D.3 → Phase 2D.4 → Phase 2D.5 → Phase 2D.6
4. Test each component as implemented
5. Verify positions match original game exactly
6. Update PHASE_2_IMPLEMENTATION_PLAN.md with completion status

