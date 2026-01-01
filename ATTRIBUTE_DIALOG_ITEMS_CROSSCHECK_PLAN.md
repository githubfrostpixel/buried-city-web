# Attribute Dialog Items Crosscheck Plan

## Overview

This plan outlines how to verify that items shown in the AttributeStatusDialog match the original game behavior, including item filtering, storage selection, and display conditions.

## Original Game Implementation

### Source File
`OriginalGame/src/ui/topFrame.js` - `showAttrStatusDialog()` function (lines 409-701)

### Item Filtering Logic

From `getItemList()` function (lines 460-501):

```javascript
var getItemList = function () {
    itemList = [];
    tempTest = false;
    if (attr === 'starve') {
        itemList = storage.getItemsByType("1103");
    } else if (attr === 'infect') {
        itemList = storage.getItemsByType("1104");
        itemList = itemList.filter(function (storageCell) {
            return storageCell.item.id != '1104011';
        });
    } else if (attr === 'injury') {
        itemList = storage.getItemsByType("1104");
        itemList = itemList.filter(function (storageCell) {
            return storageCell.item.id == '1104011';
        });
    } else if (attr == 'hp') {
        itemList = storage.getItemsByType("1107");
    } else if (attr == "dogFood") {
        tempTest = true;
        itemList = storage.getItemsByType("1103");
        itemList = itemList.filter(function (storageCell) {
            return storageCell.item.id == '1103041';
        });
    } else if (attr == "dogInjury") {
        tempTest = true;
        itemList = storage.getItemsByType("1104");
        itemList = itemList.filter(function (storageCell) {
            return storageCell.item.id == '1104011';
        });
    } else if (attr == "dogMood") {
        tempTest = true;
        itemList = storage.getItemsByType("1106");
        itemList = itemList.filter(function (storageCell) {
            return storageCell.item.id == '1106014';
        });
        if (player.hasDogPlay) {
            itemList.push({item:{id:1, config: {id:1, weight: 1, price: 1, value: 2}}, num: 1});
        }
    }
    
    return tempTest, itemList;
};
```

### Storage Selection

From lines 503-513:

```javascript
var storage;
if (player.isAtHome) {
    storage = player.storage;
} else {
    if (player.tmpBag) {
        storage = player.tmpBag;
    } else {
        storage = player.bag;
    }
}
```

### Item Display Condition

From line 514:

```javascript
if (!player.tmpBag) {
    var itemList = [];
    tempTest, itemList = getItemList();
    var itemTableView = uiUtil.createItemListSliders(itemList);
    // ... add item list to dialog
}
```

**Key Point**: Items are only shown if `!player.tmpBag` (tmpBag doesn't exist).

### Item Use Handler

From lines 523-544:

```javascript
var onItemUse = function (itemId, source) {
    if (source !== 'top')
        return;
    var res;
    if (tempTest) {
        res = player.useItemForDog(storage, itemId);
    } else {
        res = player.useItem(storage, itemId);
    }
    if (res.result) {
        itemTableView.updateData();
        itemTableView.reloadData();
        Record.saveAll();
        // Update title with new attribute values
        config = utils.clone(stringUtil.getString("statusDialog"));
        if (attr === 'hp' || attr === 'virus') {
            config.title.txt_1 = cc.formatStr(config.title.txt_1, player[attr] + "/" + player[attr + "Max"]);
        } else {
            config.title.txt_1 = cc.formatStr(player.getAttrStr(attr), config.title.txt_1, player[attr] + "/" + player[attr + "Max"]);
        }
        dialog.titleNode.getChildByName("txt_1").setString(config.title.txt_1);
    }
};
```

**Key Points**:
- Only processes if `source === 'top'`
- Uses `player.useItemForDog()` if `tempTest === true` (dog attributes)
- Uses `player.useItem()` for player attributes
- Updates item list view after successful use
- Updates attribute value display in title

## Current Implementation Analysis

### File
`src/components/overlays/AttributeStatusDialog.tsx`

### Item Filtering Function

```38:59:src/components/overlays/AttributeStatusDialog.tsx
function getItemsForAttribute(attr: string, storage: Storage): Array<{ item: Item; num: number }> {
  let itemList: Array<{ item: Item; num: number }> = []
  
  if (attr === 'starve') {
    // Food items (type 1103)
    itemList = storage.getItemsByType('1103')
  } else if (attr === 'infect') {
    // Medicine items except bandage (type 1104, exclude 1104011)
    itemList = storage.getItemsByType('1104')
    itemList = itemList.filter(({ item }) => item.id !== '1104011')
  } else if (attr === 'injury') {
    // Bandage only (type 1104, id 1104011)
    itemList = storage.getItemsByType('1104')
    itemList = itemList.filter(({ item }) => item.id === '1104011')
  } else if (attr === 'hp') {
    // HP items (type 1107)
    itemList = storage.getItemsByType('1107')
  }
  // Other attributes (vigour, spirit, water) don't have specific items in original
  
  return itemList
}
```

### Storage Selection

```114:138:src/components/overlays/AttributeStatusDialog.tsx
  const storage = useMemo(() => {
    const storage = new Storage('temp')
    if (playerStore.isAtHome) {
      // Use storage items - restore directly to avoid weight checks
      storage.restore(playerStore.storage)
    } else {
      // Use bag items (tmpBag not implemented yet)
      storage.restore(playerStore.bag)
    }
    
    // Log once when dialog opens (only if dialogData exists)
    if (dialogData) {
      console.log('[AttributeDialog] Dialog opened:', {
        attr: dialogData.attr,
        isAtHome: playerStore.isAtHome,
        isAtSite: playerStore.isAtSite,
        hasTmpBag,
        sourceItems: playerStore.isAtHome ? playerStore.storage : playerStore.bag,
        storageItems: storage.save(),
        storageItemCount: Object.keys(storage.save()).length
      })
    }
    
    return storage
  }, [dialogData, playerStore.isAtHome, playerStore.isAtSite, playerStore.storage, playerStore.bag, hasTmpBag])
```

### Item Display Condition

```142:147:src/components/overlays/AttributeStatusDialog.tsx
  const itemList = useMemo(() => {
    if (!dialogData || hasTmpBag) return []
    const items = getItemsForAttribute(attr, storage)
    console.log('[AttributeDialog] Item list for', attr, ':', items.length, 'items', items.map(({ item, num }: { item: Item; num: number }) => ({ itemId: item.id, num })))
    return items
  }, [dialogData, attr, storage, hasTmpBag])
```

Where `hasTmpBag` is defined as:

```109:109:src/components/overlays/AttributeStatusDialog.tsx
  const hasTmpBag = playerStore.isAtSite // TODO: Replace with actual tmpBag check when implemented
```

## Crosscheck Checklist

### 1. Item Type Filtering

- [ ] **starve attribute**: Shows items with prefix "1103" (food items)
  - Original: `storage.getItemsByType("1103")`
  - Current: `storage.getItemsByType('1103')` ✓

- [ ] **infect attribute**: Shows items with prefix "1104" EXCEPT "1104011" (medicine except bandage)
  - Original: `storage.getItemsByType("1104")` then filter `item.id != '1104011'`
  - Current: `storage.getItemsByType('1104')` then filter `item.id !== '1104011'` ✓

- [ ] **injury attribute**: Shows ONLY item "1104011" (bandage only)
  - Original: `storage.getItemsByType("1104")` then filter `item.id == '1104011'`
  - Current: `storage.getItemsByType('1104')` then filter `item.id === '1104011'` ✓

- [ ] **hp attribute**: Shows items with prefix "1107" (HP/enhancement items)
  - Original: `storage.getItemsByType("1107")`
  - Current: `storage.getItemsByType('1107')` ✓

- [ ] **Other attributes** (vigour, spirit, water, virus): Show no items
  - Original: No items shown for these attributes
  - Current: Returns empty array ✓

### 2. Storage Selection

- [ ] **At home**: Uses `player.storage`
  - Original: `if (player.isAtHome) { storage = player.storage }`
  - Current: `if (playerStore.isAtHome) { storage.restore(playerStore.storage) }` ✓

- [ ] **Away from home (no tmpBag)**: Uses `player.bag`
  - Original: `else { if (player.tmpBag) { storage = player.tmpBag } else { storage = player.bag } }`
  - Current: `else { storage.restore(playerStore.bag) }` ✓
  - **Note**: tmpBag not implemented yet, so this is correct for current state

- [ ] **Away from home (with tmpBag)**: Should use `player.tmpBag` (when implemented)
  - Original: `if (player.tmpBag) { storage = player.tmpBag }`
  - Current: TODO - not implemented yet ⚠️

### 3. Item Display Condition

- [ ] **Items shown only when tmpBag doesn't exist**
  - Original: `if (!player.tmpBag) { ... show items ... }`
  - Current: `if (!dialogData || hasTmpBag) return []` where `hasTmpBag = playerStore.isAtSite`
  - **Issue**: Currently using `isAtSite` as proxy for tmpBag, which may not be accurate
  - **Status**: ⚠️ Needs verification - should check actual tmpBag when implemented

### 4. Item Use Handler

- [ ] **Source check**: Only processes if `source === 'top'`
  - Original: `if (source !== 'top') return;`
  - Current: No source check in `handleItemUse` ⚠️
  - **Note**: May not be needed if only called from attribute dialog

- [ ] **Item use function**: Uses `player.useItem()` for player attributes
  - Original: `res = player.useItem(storage, itemId)`
  - Current: `res = playerStore.useItem(storage, itemId)` ✓

- [ ] **Dog attributes**: Should use `player.useItemForDog()` (not implemented)
  - Original: `if (tempTest) { res = player.useItemForDog(storage, itemId) }`
  - Current: Not implemented (dog attributes not supported yet) ⚠️

- [ ] **Update after use**: Updates item list and attribute display
  - Original: Updates `itemTableView` and title `txt_1`
  - Current: Dialog stays open, but item list may not update automatically ⚠️
  - **Note**: React should re-render when storage changes, but need to verify

### 5. Item Type Prefixes

Verify that item type prefixes are correct:

- [x] **"1103"** = Food items (ItemType.TOOL "11" + ItemType.FOOD "03")
  - Verified: Items exist (1103011, 1103022, 1103033, 1103041, etc.) ✓
- [x] **"1104"** = Medicine items (ItemType.TOOL "11" + ItemType.MEDICINE "04")
  - Verified: Items exist (1104011, 1104021, 1104032, 1104043, etc.) ✓
- [ ] **"1106"** = Buff items (ItemType.TOOL "11" + ItemType.BUFF "07") - Note: prefix is "1106", not "1107"
  - Verified: Item 1106014 exists ✓
- [x] **"1107"** = HP/Enhancement items (ItemType.TOOL "11" + ItemType.BUFF "07" with different prefix)
  - Verified: Items exist (1107012, 1107022, 1107032, 1107042, etc.) ✓

**Verification**: Item IDs in `src/data/items.ts` confirm all prefixes are correct.

### 6. Missing Features (Not Yet Implemented)

- [ ] **Dog attributes**: `dogFood`, `dogInjury`, `dogMood` - not implemented
- [ ] **tmpBag**: Temporary bag at sites - not implemented
- [ ] **Buff display**: Buff effect and time display - placeholder only
- [ ] **Virus exchange**: Exchange buttons for virus attribute - placeholder only

## Testing Plan

### Test Cases

1. **Test starve attribute**:
   - Add food items (1103xxxx) to storage
   - Open starve attribute dialog
   - Verify only food items are shown
   - Verify item counts are correct

2. **Test infect attribute**:
   - Add medicine items (1104xxxx) including bandage (1104011) to storage
   - Open infect attribute dialog
   - Verify medicine items are shown
   - Verify bandage (1104011) is NOT shown

3. **Test injury attribute**:
   - Add medicine items (1104xxxx) including bandage (1104011) to storage
   - Open injury attribute dialog
   - Verify ONLY bandage (1104011) is shown
   - Verify other medicine items are NOT shown

4. **Test hp attribute**:
   - Add HP items (1107xxxx) to storage
   - Open hp attribute dialog
   - Verify only HP items are shown

5. **Test other attributes** (vigour, spirit, water, virus):
   - Open each attribute dialog
   - Verify no items are shown

6. **Test storage selection**:
   - At home: Verify items from storage are shown
   - Away from home: Verify items from bag are shown

7. **Test item use**:
   - Use an item from attribute dialog
   - Verify item count decreases by 1
   - Verify other items remain visible
   - Verify attribute value updates (if applicable)
   - Verify dialog stays open

8. **Test tmpBag condition** (when implemented):
   - At site with tmpBag: Verify items are NOT shown
   - At site without tmpBag: Verify items from bag are shown

## Issues Found

### Issue 1: tmpBag Proxy
**Location**: Line 109
**Problem**: Using `playerStore.isAtSite` as proxy for tmpBag may not be accurate
**Status**: ⚠️ Needs actual tmpBag implementation

### Issue 2: Item List Update
**Location**: After item use
**Problem**: Need to verify item list updates automatically when storage changes
**Status**: ⚠️ Need to test React re-rendering

### Issue 3: Source Check Missing
**Location**: `handleItemUse` function
**Problem**: Original game checks `source !== 'top'` before processing
**Status**: ⚠️ May not be needed if only called from attribute dialog

### Issue 4: Dog Attributes Not Implemented
**Location**: `getItemsForAttribute` function
**Problem**: Dog attributes (dogFood, dogInjury, dogMood) not supported
**Status**: ⚠️ Feature not yet implemented

## Recommendations

1. **Verify item type prefixes**: Check actual item IDs in `src/data/items.ts` to confirm "1103", "1104", "1107" prefixes are correct

2. **Test item filtering**: Create test cases with various item types to verify filtering works correctly

3. **Implement tmpBag check**: Replace `isAtSite` proxy with actual tmpBag check when tmpBag is implemented

4. **Add item list update verification**: Test that item list updates when items are used

5. **Consider source check**: Add source check to `handleItemUse` if items can be used from multiple sources

6. **Document missing features**: Clearly document that dog attributes and tmpBag are not yet implemented

