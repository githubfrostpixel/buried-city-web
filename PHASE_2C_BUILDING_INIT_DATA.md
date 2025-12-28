# Phase 2C: Building Initialization Data

This document contains the initial building states for the Room system, based on `OriginalGame/src/game/Build.js` lines 323-366.

## Initial Building States

When a new game starts, buildings are initialized with the following levels:

### Buildings at Level -1 (Need to be Built)

These buildings exist but need to be constructed:

- **ID 2** - Chemical bench (温棚)
- **ID 3** - Medical bench (药盒)
- **ID 4** - Stove (灶台)
- **ID 6** - Water purifier (蒸馏器)
- **ID 7** - Hare trap (野兔陷阱) - Note: Listed as ID 8 in original, but config shows ID 7
- **ID 8** - Garden (温棚) - Note: Listed as ID 8 in original, but config shows ID 8
- **ID 9** - Bed (睡袋)
- **ID 10** - Storage shelf (椅子)
- **ID 11** - Fence (栅栏)
- **ID 12** - Dog house (狗舍)
- **ID 15** - Radio (机床) - Note: Listed as ID 16 in original, but config shows ID 15
- **ID 16** - Radio (老式电台) - Note: Listed as ID 15 in original, but config shows ID 16
- **ID 18** - Electric stove (电炉)
- **ID 19** - Electric fence (电网)
- **ID 20** - Safe
- **ID 21** - Fridge

### Buildings at Level 0 (Already Built)

These buildings are already constructed at game start:

- **ID 1** - Workbench (工具箱) - Level 0
- **ID 13** - Gate (大门) - Level 0
- **ID 14** - Toilet (大门) - Level 0 - Note: Listed as Gate in original, but ID 14 is Toilet
- **ID 17** - Storeroom (仓库) - Level 0
- **ID 15** - Minefield (雷区) - Level 0 - Note: Listed as ID 17 in original, but config shows ID 15

### Building ID Mapping Notes

There are some discrepancies in the original code comments vs actual building IDs:

- Original comment says "野兔陷阱" (Hare trap) is ID 8, but config shows ID 7
- Original comment says "机床" (Machine tool) is ID 16, but config shows ID 15
- Original comment says "老式电台" (Old radio) is ID 15, but config shows ID 16
- Original comment says "雷区" (Minefield) is ID 17, but config shows ID 15
- Original comment says "仓库" (Storeroom) is ID 13, but config shows ID 17

**Resolution**: Use the building IDs from `buildConfig.js` as the source of truth, as those match the actual building configurations.

## Initialization Code Reference

From `OriginalGame/src/game/Build.js`:

```javascript
initData: function () {
    //温棚
    this.createBuild(2, -1);
    //药盒
    this.createBuild(3, -1);
    //灶台
    this.createBuild(4, -1);
    //蒸馏器
    this.createBuild(6, -1);
    //野兔陷阱
    this.createBuild(8, -1);  // Note: Should be 7 based on config
    //椅子
    this.createBuild(10, -1);
    //狗舍
    this.createBuild(12, -1);
    //机床
    this.createBuild(16, -1);  // Note: Should be 15 based on config
    //雷区
    this.createBuild(17, 0);
    //电网
    this.createBuild(19, -1);
    //电炉
    this.createBuild(18, -1);
    //酒窖
    this.createBuild(7, -1);
    //栅栏
    this.createBuild(11, -1);
    //火炉
    this.createBuild(5, -1);
    //仓库
    this.createBuild(13, 0);
    //老式电台
    this.createBuild(15, -1);  // Note: Should be 16 based on config
    //Safe
    this.createBuild(20, -1);
    //Fridge
    this.createBuild(21, -1);
    //新手引导解锁
    //工具箱
    this.createBuild(1, 0);
    //大门
    this.createBuild(14, 0);
    //睡袋
    this.createBuild(9, -1);
}
```

## Corrected Initialization Data

Based on building config IDs:

```typescript
const initialBuildings = [
  { id: 1, level: 0 },   // Workbench
  { id: 2, level: -1 },   // Chemical bench
  { id: 3, level: -1 },   // Medical bench
  { id: 4, level: -1 },   // Stove
  { id: 5, level: -1 },   // Fireplace
  { id: 6, level: -1 },   // Water purifier
  { id: 7, level: -1 },   // Hare trap
  { id: 8, level: -1 },   // Garden
  { id: 9, level: -1 },   // Bed
  { id: 10, level: -1 },  // Storage shelf
  { id: 11, level: -1 },  // Fence
  { id: 12, level: -1 },  // Dog house
  { id: 13, level: 0 },   // Gate
  { id: 14, level: 0 },   // Toilet
  { id: 15, level: 0 },   // Minefield
  { id: 16, level: -1 },  // Radio
  { id: 17, level: 0 },   // Storeroom
  { id: 18, level: -1 },  // Electric stove
  { id: 19, level: -1 },  // Electric fence
  { id: 20, level: -1 },  // Safe
  { id: 21, level: -1 }   // Fridge
]
```

## Usage

This data will be used in `Room.initData()` method to initialize all buildings when creating a new game.

