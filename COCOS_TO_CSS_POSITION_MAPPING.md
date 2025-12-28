# Cocos2d-JS to CSS Position Mapping Documentation

## Overview

This document describes how Cocos2d-JS coordinates (from the original game) are converted to CSS coordinates in the React port.

## Coordinate System Differences

### Cocos2d-JS Coordinate System
- **Origin**: Bottom-left corner (0, 0)
- **X-axis**: Increases from left to right (same as CSS)
- **Y-axis**: Increases from bottom to top (opposite of CSS)
- **Screen size**: 640x1136 pixels
- **Anchor points**: 
  - (0, 0) = bottom-left corner of element
  - (0.5, 0.5) = center of element
  - (1, 1) = top-right corner of element

### CSS Coordinate System
- **Origin**: Top-left corner (0, 0)
- **X-axis**: Increases from left to right (same as Cocos)
- **Y-axis**: Increases from top to bottom (opposite of Cocos)
- **Screen size**: 640x1136 pixels
- **Positioning**: Uses `left`, `top`, `right`, `bottom` properties

## Conversion Formulas

### Basic Y-Coordinate Conversion

```typescript
// Cocos Y to CSS Y
cssY = screenHeight - cocosY

// Example:
// Cocos Y = 100 (100px from bottom)
// CSS Y = 1136 - 100 = 1036px (1036px from top)
```

### Position Conversion with Anchors

When converting positions, we need to account for anchor points:

**Cocos Anchor System:**
- `anchor.x = 0`: Left edge
- `anchor.x = 0.5`: Center horizontally
- `anchor.x = 1`: Right edge
- `anchor.y = 0`: Bottom edge
- `anchor.y = 0.5`: Center vertically
- `anchor.y = 1`: Top edge

**CSS Equivalent:**
- `anchor.x = 0`: `left: xpx`
- `anchor.x = 0.5`: `left: xpx; transform: translateX(-50%)`
- `anchor.x = 1`: `right: (screenWidth - x)px` or `left: (x - width)px`
- `anchor.y = 0`: `bottom: (screenHeight - cssY)px`
- `anchor.y = 0.5`: `top: cssYpx; transform: translateY(-50%)`
- `anchor.y = 1`: `top: cssYpx`

## Implementation Details

### Utility Functions

Located in: `src/utils/position.ts`

#### `cocosToCssY(cocosY, screenHeight = 1136)`
Converts Cocos Y coordinate to CSS Y coordinate.

```typescript
// Example:
cocosToCssY(100) // Returns: 1036
```

#### `cocosToCssPosition(cocosPos, anchor, size?, screenHeight)`
Converts full Cocos position with anchor to CSS position styles.

```typescript
// Example: Center at (320, 568) with center anchor
cocosToCssPosition(
  { x: 320, y: 568 },
  { x: 0.5, y: 0.5 }
)
// Returns: { position: 'absolute', left: '320px', top: '568px', transform: 'translate(-50%, -50%)' }
```

#### `cocosPosition(x, y, anchorX, anchorY, screenHeight)`
Simplified version for common anchor cases.

```typescript
// Example: Center at (320, 568)
cocosPosition(320, 568, 0.5, 0.5)
```

## Common Patterns in TopBar

### Background Positioning

**Original Cocos:**
```javascript
bg.setPosition(width/2, height-18)
bg.setAnchorPoint(0.5, 1) // Top-center anchor
```

**CSS Equivalent:**
```typescript
const bgStyle = {
  ...cocosToCssPosition(
    { x: screenWidth / 2, y: screenHeight - 18 },
    { x: 0.5, y: 1 }
  )
}
// Result: left: 50%, top: 18px, transform: translateX(-50%)
```

### Child Element Positioning (Relative to Parent)

**Important**: When positioning children relative to a parent container:

**Original Cocos:**
```javascript
// Child positioned relative to parent bg
child.setPosition(6, 190) // 6px from left, 190px from bottom of parent
child.setAnchorPoint(0, 0) // Bottom-left anchor
```

**CSS Equivalent:**
```typescript
// Parent bg height = 244px
// Cocos Y = 190 means 190px from bottom of parent
// CSS top = parentHeight - cocosY - childHeight
const cssTop = bgHeight - 190 - childHeight // e.g., 244 - 190 - 50 = 4px

<div style={{ left: '6px', top: `${cssTop}px` }}>
```

### TopBar Specific Conversions

#### First Line (Status Icons)
- **Cocos**: `setPosition(6, 190)` with `anchor(0, 0)`
- **Parent bg height**: 244px
- **Line height**: 50px
- **CSS**: `top: ${244 - 190 - 50}px = 4px`

#### Second Line (Attribute Bars)
- **Cocos**: `setPosition(6, 134)` with `anchor(0, 0)`
- **Parent bg height**: 244px
- **Line height**: 50px
- **CSS**: `top: ${244 - 134 - 50}px = 60px`

#### Third Line (Log Bar)
- **Cocos**: `setPosition(6, 6)` with `anchor(0, 0)`
- **Parent bg height**: 244px
- **Line height**: 122px
- **CSS**: `top: ${244 - 6 - 122}px = 116px` or `bottom: 6px`

## Scale Factors

Common scale factors used in the original game:
- `0.4`: Small status icons (day, season, time, weather, temperature)
- `0.5`: Attribute icons, currency icon
- `0.6`: Electric icon, fuel icon
- `0.7`: Talent button, dog button
- `0.87`: Background frames (when screenFix = 1)
- `1.0`: Default/normal size

## Examples

### Example 1: Centered Element
```typescript
// Cocos: setPosition(320, 568), setAnchorPoint(0.5, 0.5)
const styles = cocosPosition(320, 568, 0.5, 0.5)
// Result: { position: 'absolute', left: '320px', top: '568px', transform: 'translate(-50%, -50%)' }
```

### Example 2: Top-Left Element
```typescript
// Cocos: setPosition(0, 1136), setAnchorPoint(0, 1)
const styles = cocosPosition(0, 1136, 0, 1)
// Result: { position: 'absolute', left: '0px', top: '0px' }
```

### Example 3: Bottom-Right Element
```typescript
// Cocos: setPosition(640, 0), setAnchorPoint(1, 0)
const styles = cocosPosition(640, 0, 1, 0)
// Result: { position: 'absolute', right: '0px', bottom: '0px' }
```

## BottomBar (BottomFrame) Layout Structure

### Current Implementation (Modified from Original)

The BottomBar has been restructured from the original Cocos2d-JS layout to use a flexbox-based row layout for buttons and title.

#### Original Cocos Layout:
- Background: `frame_bg_bottom.png` at (width/2, 18) with anchor (0.5, 0)
- Line separator: at (width/2, 770) from bottom of bg
- Title: at (width/2, 803) from bottom of bg
- Left button: at (60, 803) from bottom of bg
- Right button: at (width - 60, 803) from bottom of bg
- Content area: from top (0) to line separator (770px from bottom)

#### Current CSS Layout:

**Background Container:**
- Position: `top: ${bottomBarTop}px` (calculated from TopBar bottom + 10px gap)
- Size: `width: ${bgWidth}px`, `height: ${bgHeight}px` (596 * scale, 803 * scale)
- Transform: `translateX(-50%)` for horizontal centering

**Action Bar Row (Buttons + Title):**
- Position: `top: ${bgHeight - contentTopLineHeight - 32}px`
- Size: `width: ${bgWidth}px`, `height: 70px`
- Padding: `5px` top, `5px` left, `5px` right
- Layout: Flexbox with `justify-between` for button placement
- Structure:
  - Left button: 100px × 70px, positioned at start
  - Title: Centered with `flex: 1` and `text-align: center`
  - Right button: 100px × 70px, positioned at end

**Line Separator:**
- Position: `top: ${bgHeight - contentTopLineHeight + 40}px`
- Transform: `translateX(-50%)` for horizontal centering
- Located directly below the action bar row

**Content Area:**
- Position: `top: ${bgHeight - contentTopLineHeight + 40}px` (same as line, content starts below line)
- Size: `width: ${bgWidth}px`, `height: ${contentTopLineHeight - 10}px`
- Overflow: `auto` for vertical scrolling, `hidden` for horizontal

### Key Differences from Original:

1. **Row Layout**: Buttons and title are now in a single flexbox row div instead of individually positioned
2. **Padding**: Added 5px top/left/right padding to the action bar row
3. **Line Position**: Line is positioned at `+40px` from `bgHeight - contentTopLineHeight` (closer to buttons)
4. **Content Position**: Content area starts at the same position as the line (40px offset)

### Coordinate Conversion for BottomBar:

```typescript
// Background
const bgHeight = 803 * bgScale
const bgWidth = 596 * bgScale
const contentTopLineHeight = 770 * bgScale

// Action bar row
const rowTop = bgHeight - contentTopLineHeight - 32  // -32px offset from original

// Line separator
const lineTop = bgHeight - contentTopLineHeight + 40  // +40px offset

// Content area
const contentTop = bgHeight - contentTopLineHeight + 40  // Same as line
const contentHeight = contentTopLineHeight - 10  // Reduced height
```

## Notes

1. **Relative Positioning**: When positioning children relative to a parent, remember to account for the parent's coordinate system. If the parent is positioned using Cocos coordinates, children positioned relative to it also use Cocos coordinates from the parent's bottom-left.

2. **Transform Origin**: CSS transforms use `transform-origin` which defaults to center. For pixel-perfect positioning, ensure transforms align with anchor points.

3. **Screen Height**: Default screen height is 1136px. If using a different resolution, pass it as a parameter to conversion functions.

4. **Z-Index**: Cocos uses `zOrder` or `addChild` order. In CSS, use `z-index` property.

5. **Scaling**: Cocos scaling is applied via `setScale()`. In CSS, use `transform: scale()` with appropriate `transform-origin`.

6. **BottomBar Layout Changes**: The BottomBar has been restructured to use flexbox for the action bar row, with modified positioning offsets (-32px for row, +40px for line/content) compared to the original Cocos layout.

