# Plan: Change All Text to Noto Sans

## Overview
This plan outlines the steps to change all text in the application from the current fonts (Arial, system fonts) to Noto Sans font family.

## Current Font Usage Analysis

### 1. Global CSS Font (`src/index.css`)
- **Location**: Lines 14-16
- **Current**: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`)
- **Impact**: Affects all text that doesn't have explicit font-family set

### 2. Inline Font Styles (Arial, sans-serif)
Found in the following components:
- `src/components/overlays/AttributeStatusDialog.tsx` - 5 instances
- `src/components/overlays/ItemDialog.tsx` - 4 instances
- `src/components/overlays/DeathOverlay.tsx` - 5 instances
- `src/components/storage/ItemCell.tsx` - 1 instance
- `src/components/common/DialogButton.tsx` - 1 instance
- `src/components/layout/BottomBar.tsx` - 3 instances
- `src/components/storage/ItemSection.tsx` - 1 instance
- `src/components/panels/SitePanelContent.tsx` - 1 instance

**Total**: 21 instances of `fontFamily: 'Arial, sans-serif'` to replace

### 3. Tailwind Config
- **Location**: `tailwind.config.js`
- **Current**: Empty fontFamily extension (line 12-14)
- **Action**: Add Noto Sans to Tailwind config for consistency

## Implementation Steps

### Step 1: Add Noto Sans Font Import
**File**: `index.html`
- Add Google Fonts link tag in the `<head>` section
- Import Noto Sans with appropriate weights (400 normal, 700 bold)
- Example:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap" rel="stylesheet">
```

### Step 2: Update Global CSS Font
**File**: `src/index.css`
- **Location**: Lines 14-16
- **Change**: Replace the system font stack with `'Noto Sans', sans-serif`
- **New value**:
```css
font-family: 'Noto Sans', sans-serif;
```

### Step 3: Update All Inline FontFamily Styles
Replace all instances of `fontFamily: 'Arial, sans-serif'` with `fontFamily: "'Noto Sans', sans-serif"` in the following files:

1. **src/components/overlays/AttributeStatusDialog.tsx**
   - Line 343
   - Line 359
   - Line 387
   - Line 501
   - Line 531

2. **src/components/overlays/ItemDialog.tsx**
   - Line 248
   - Line 264
   - Line 303
   - Line 329

3. **src/components/overlays/DeathOverlay.tsx**
   - Line 228
   - Line 273
   - Line 321
   - Line 338
   - Line 368

4. **src/components/storage/ItemCell.tsx**
   - Line 98

5. **src/components/common/DialogButton.tsx**
   - Line 66

6. **src/components/layout/BottomBar.tsx**
   - Line 142
   - Line 201
   - Line 215

7. **src/components/storage/ItemSection.tsx**
   - Line 46

8. **src/components/panels/SitePanelContent.tsx**
   - Line 83

**Note**: When replacing, ensure proper quote escaping for JSX:
- Change: `fontFamily: 'Arial, sans-serif'`
- To: `fontFamily: "'Noto Sans', sans-serif"`

### Step 4: Update Tailwind Config (Optional but Recommended)
**File**: `tailwind.config.js`
- **Location**: Lines 12-14
- **Action**: Add Noto Sans as the default sans font family
- **Change**:
```javascript
fontFamily: {
  sans: ["'Noto Sans'", 'sans-serif'],
},
```

This allows using Tailwind's `font-sans` utility class with Noto Sans.

### Step 5: Verification Checklist
After implementation, verify:
- [ ] Font loads correctly (check Network tab for Google Fonts request)
- [ ] All text displays with Noto Sans font
- [ ] No console errors related to font loading
- [ ] Text rendering looks correct in all components:
  - [ ] AttributeStatusDialog
  - [ ] ItemDialog
  - [ ] DeathOverlay
  - [ ] ItemCell
  - [ ] DialogButton
  - [ ] BottomBar
  - [ ] ItemSection
  - [ ] SitePanelContent
- [ ] Font weights (normal/bold) display correctly
- [ ] Cross-browser testing (Chrome, Firefox, Safari if possible)

## Files to Modify

1. `index.html` - Add Google Fonts link
2. `src/index.css` - Update global font-family
3. `src/components/overlays/AttributeStatusDialog.tsx` - 5 replacements
4. `src/components/overlays/ItemDialog.tsx` - 4 replacements
5. `src/components/overlays/DeathOverlay.tsx` - 5 replacements
6. `src/components/storage/ItemCell.tsx` - 1 replacement
7. `src/components/common/DialogButton.tsx` - 1 replacement
8. `src/components/layout/BottomBar.tsx` - 3 replacements
9. `src/components/storage/ItemSection.tsx` - 1 replacement
10. `src/components/panels/SitePanelContent.tsx` - 1 replacement
11. `tailwind.config.js` - Add fontFamily configuration (optional)

## Summary
- **Total files to modify**: 11 files
- **Total inline style replacements**: 21 instances
- **Font import**: 1 Google Fonts link in index.html
- **Global CSS change**: 1 font-family update

## Notes
- Noto Sans is a web-safe font with good Unicode coverage, making it suitable for multilingual content
- The font weights 400 (normal) and 700 (bold) should cover all current usage in the application
- If the application needs additional font weights in the future, they can be added to the Google Fonts link
- Consider font-display: swap for better performance (Google Fonts includes this by default)

