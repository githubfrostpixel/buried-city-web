# Escape Progress Bar Sprite Plan

## Overview

Check if the escape progress bar (and dodge progress bar) should use sprite-based progress bars (`pb_bg.png` and `pb.png`) instead of CSS-styled divs, matching the original game's implementation.

## Current Implementation

### Main Battle Progress Bar (Monster Count)
- **Status:** ✅ Uses sprites
- **Background:** `pb_bg.png` sprite
- **Fill:** `pb.png` sprite
- **Implementation:** Sprite components with absolute positioning

### Dodge Progress Bar (Road Encounters)
- **Status:** ❌ Uses CSS divs
- **Background:** `bg-gray-700` CSS class
- **Fill:** `bg-blue-500` CSS class
- **Implementation:** HTML divs with CSS styling

### Escape Progress Bar (Room/Site Battles)
- **Status:** ❌ Uses CSS divs
- **Background:** `bg-gray-700` CSS class
- **Fill:** `bg-red-500` CSS class
- **Implementation:** HTML divs with CSS styling

## Original Game Implementation

From `OriginalGame/src/ui/dialog.js` and `OriginalGame/src/ui/battleAndWorkNode.js`:

```javascript
// Progress bar background
var pbBg = autoSpriteFrameController.getSpriteFromSpriteName("#pb_bg.png");
pbBg.setAnchorPoint(0.5, 0);
pbBg.setPosition(this.actionNode.getContentSize().width / 2, this.actionNode.getContentSize().height / 2 - 10);
this.actionNode.addChild(pbBg);

// Progress bar fill
var pb = new cc.ProgressTimer(autoSpriteFrameController.getSpriteFromSpriteName("#pb.png"));
pb.type = cc.ProgressTimer.TYPE_BAR;
pb.midPoint = cc.p(0, 0);
pb.barChangeRate = cc.p(1, 0);
pb.setPercentage(percentage);
pb.setPosition(pbBg.getPositionX(), pbBg.getPositionY() + pbBg.getContentSize().height / 2);
this.actionNode.addChild(pb);
```

**Key Points:**
- Uses `cc.ProgressTimer` with `pb.png` sprite
- Background uses `pb_bg.png` sprite
- Both are sprite-based, not CSS
- Progress timer handles the percentage animation

## Analysis

### Should Escape/Dodge Progress Bars Use Sprites?

**Arguments FOR using sprites:**
1. ✅ Consistency with main battle progress bar
2. ✅ Matches original game implementation
3. ✅ Visual consistency across all progress bars
4. ✅ Better visual quality (sprites vs CSS)

**Arguments AGAINST:**
1. ❓ Escape/dodge progress bars might be simpler/transient
2. ❓ Different color (red/blue) might need different sprites
3. ❓ CSS is easier to style with different colors

### Original Game Check

Looking at the original game code:
- Main progress bar: Uses `pb.png` and `pb_bg.png` sprites
- Dodge progress: Need to check if it uses the same sprites or different

**Note:** The original game uses `cc.ProgressTimer` which is a Cocos2d-JS feature that animates sprite-based progress. In our React implementation, we're using CSS width percentage to simulate this.

## Recommendation

### Option 1: Use Same Sprites (Recommended)
- Use `pb_bg.png` and `pb.png` for all progress bars
- Keep the same visual style as main progress bar
- Use CSS overlay/filter for color tinting if needed (blue for dodge, red for escape)

### Option 2: Keep CSS Styled
- Keep current CSS implementation
- Faster to implement
- Easier to customize colors
- But inconsistent with main progress bar

### Option 3: Create Separate Sprites
- Create `pb_dodge.png` and `pb_escape.png` sprites
- More work, but allows different visual styles
- Not matching original game

## Implementation Plan (Option 1 - Recommended)

### Step 1: Update Dodge Progress Bar
- Replace CSS divs with `pb_bg.png` background sprite
- Replace CSS fill with `pb.png` fill sprite
- Use same positioning/width logic as main progress bar
- Apply blue color filter/tint if needed

### Step 2: Update Escape Progress Bar
- Replace CSS divs with `pb_bg.png` background sprite
- Replace CSS fill with `pb.png` fill sprite
- Use same positioning/width logic as main progress bar
- Apply red color filter/tint if needed

### Step 3: Verify Visual Consistency
- All three progress bars should look similar
- Only difference should be color (if tinting is applied)
- Positioning and sizing should match

## Code Changes Required

### Current CSS Implementation (to be replaced):
```tsx
<div className="w-full bg-gray-700 h-4 rounded">
  <div
    className="bg-blue-500 h-full rounded transition-all"
    style={{ width: `${dodgeProgress}%` }}
  />
</div>
```

### New Sprite Implementation:
```tsx
<div style={{ position: 'relative' }}>
  <Sprite
    atlas="ui"
    frame="pb_bg.png"
    style={{ 
      width: 'auto',
      height: 'auto',
      display: 'block'
    }}
  />
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: `${dodgeProgress}%`,
      height: '100%',
      overflow: 'hidden',
      zIndex: 1,
    }}
  >
    <Sprite
      atlas="ui"
      frame="pb.png"
      style={{ 
        width: '100%',
        height: '100%',
        display: 'block',
        objectFit: 'cover',
        filter: 'hue-rotate(200deg) saturate(1.5)' // Blue tint for dodge
      }}
    />
  </div>
</div>
```

## Files to Modify

1. `src/components/panels/BattlePanelContent.tsx`
   - Update dodge progress bar (lines ~450-465)
   - Update escape progress bar (lines ~468-483)

## Testing Checklist

- [ ] Dodge progress bar uses `pb_bg.png` and `pb.png` sprites
- [ ] Escape progress bar uses `pb_bg.png` and `pb.png` sprites
- [ ] Progress bars match main battle progress bar style
- [ ] Color differentiation (blue/red) is visible
- [ ] Progress animation works smoothly
- [ ] Positioning matches original game

## Decision

**Recommendation:** Use Option 1 - Replace CSS progress bars with sprite-based ones using `pb_bg.png` and `pb.png`, matching the main battle progress bar and original game implementation.

**Rationale:**
- Consistency across all progress bars
- Matches original game visual style
- Better visual quality
- Can use CSS filters for color tinting if needed

