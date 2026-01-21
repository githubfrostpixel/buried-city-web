/**
 * Building Configuration Data
 * Ported from OriginalGame/src/data/buildConfig.js
 * 
 * Contains configuration for all 21 building types with their upgrade levels
 */

import type { BuildingConfig } from '@/common/types/building.types'

export const buildingConfig: BuildingConfig = {
  "1": [
    {
      id: 1,
      cost: [],
      condition: {},
      produceList: [1402021, 1402011, 1401011, 1401071, 1405023]
    },
    {
      id: 1,
      cost: [
        { itemId: "item_mat_wood", num: 6 },
        { itemId: "item_mat_metal", num: 4 },
        { itemId: "item_mat_fabric", num: 1 },
        { itemId: "item_mat_parts", num: 4 }
      ],
      createTime: 60,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: [1402032, 1404024, 1401022, 1404012, "item_ammo_motorcycle", 1405053, "item_ammo_siphon_tool"]
    },
    {
      id: 1,
      cost: [
        { itemId: "item_mat_wood", num: 2 },
        { itemId: "item_mat_metal", num: 6 },
        { itemId: "item_mat_fabric", num: 1 },
        { itemId: "item_mat_parts", num: 8 },
        { itemId: "item_mat_components", num: 8 }
      ],
      createTime: 90,
      condition: {
        bid: 1,
        level: 1
      },
      produceList: [1401082, 1402043, 1404023, 1401033, 1401091, 1405024, "item_ammo_hyper_detector", "item_special_dog_bone"]
    }
  ],
  "2": [
    {
      id: 2,
      cost: [
        { itemId: "item_mat_wood", num: 3 },
        { itemId: "item_mat_metal", num: 3 },
        { itemId: "item_mat_fabric", num: 3 },
        { itemId: "item_mat_parts", num: 2 }
      ],
      createTime: 60,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: [1203011, 1205042]
    },
    {
      id: 2,
      cost: [
        { itemId: "item_mat_wood", num: 6 },
        { itemId: "item_mat_metal", num: 8 },
        { itemId: "item_mat_fabric", num: 8 },
        { itemId: "item_mat_parts", num: 6 },
        { itemId: "item_mat_components", num: 3 }
      ],
      createTime: 90,
      condition: {
        bid: 1,
        level: 1
      },
      produceList: [1205051]
    }
  ],
  "3": [
    {
      id: 3,
      cost: [
        { itemId: "item_mat_wood", num: 2 },
        { itemId: "item_mat_metal", num: 2 },
        { itemId: "item_mat_fabric", num: 1 },
        { itemId: "item_mat_parts", num: 1 }
      ],
      createTime: 60,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: [1204011, 1204021]
    },
    {
      id: 3,
      cost: [
        { itemId: "item_mat_wood", num: 2 },
        { itemId: "item_mat_metal", num: 4 },
        { itemId: "item_mat_fabric", num: 2 },
        { itemId: "item_mat_parts", num: 2 }
      ],
      createTime: 90,
      condition: {
        bid: 1,
        level: 1
      },
      produceList: [1204032]
    }
  ],
  "4": [
    {
      id: 4,
      cost: [
        { itemId: "item_mat_wood", num: 1 },
        { itemId: "item_mat_metal", num: 6 }
      ],
      createTime: 60,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: [1203063, 1203022]
    },
    {
      id: 4,
      cost: [
        { itemId: "item_mat_wood", num: 6 },
        { itemId: "item_mat_metal", num: 6 },
        { itemId: "item_mat_fabric", num: 1 },
        { itemId: "item_mat_parts", num: 2 }
      ],
      createTime: 90,
      condition: {
        bid: 1,
        level: 1
      },
      produceList: [1203052, 1203033]
    },
    {
      id: 4,
      cost: [
        { itemId: "item_mat_wood", num: 4 },
        { itemId: "item_mat_metal", num: 10 },
        { itemId: "item_mat_fabric", num: 2 },
        { itemId: "item_mat_parts", num: 4 },
        { itemId: "item_mat_components", num: 2 }
      ],
      createTime: 120,
      condition: {
        bid: 1,
        level: 2
      },
      produceList: [1203074]
    }
  ],
  "5": [
    {
      id: 5,
      cost: [
        { itemId: "item_mat_wood", num: 1 },
        { itemId: "item_mat_metal", num: 6 },
        { itemId: "item_mat_parts", num: 4 }
      ],
      createTime: 90,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: []
    }
  ],
  "6": [
    {
      id: 6,
      cost: [
        { itemId: "item_mat_wood", num: 1 },
        { itemId: "item_mat_metal", num: 4 },
        { itemId: "item_mat_fabric", num: 2 },
        { itemId: "item_mat_parts", num: 6 }
      ],
      createTime: 60,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: [1201061]
    },
    {
      id: 6,
      cost: [
        { itemId: "item_mat_metal", num: 8 },
        { itemId: "item_mat_fabric", num: 1 },
        { itemId: "item_mat_parts", num: 10 },
        { itemId: "item_mat_components", num: 6 }
      ],
      createTime: 90,
      condition: {
        bid: 1,
        level: 1
      },
      produceList: [1205033]
    }
  ],
  "7": [
    {
      id: 7,
      cost: [
        { itemId: "item_mat_wood", num: 10 },
        { itemId: "item_mat_metal", num: 6 },
        { itemId: "item_mat_fabric", num: 2 },
        { itemId: "item_mat_parts", num: 4 }
      ],
      createTime: 60,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: [1205022]
    }
  ],
  "8": [
    {
      id: 8,
      cost: [
        { itemId: "item_mat_wood", num: 1 },
        { itemId: "item_mat_metal", num: 4 },
        { itemId: "item_mat_fabric", num: 2 },
        { itemId: "item_mat_parts", num: 4 }
      ],
      createTime: 60,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: [1203041]
    }
  ],
  "9": [
    {
      id: 9,
      cost: [
        { itemId: "item_mat_fabric", num: 6 },
        { itemId: "item_mat_parts", num: 2 }
      ],
      createTime: 60,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: []
    },
    {
      id: 9,
      cost: [
        { itemId: "item_mat_wood", num: 2 },
        { itemId: "item_mat_fabric", num: 12 },
        { itemId: "item_mat_parts", num: 4 }
      ],
      createTime: 120,
      condition: {
        bid: 1,
        level: 1
      },
      produceList: []
    },
    {
      id: 9,
      cost: [
        { itemId: "item_mat_wood", num: 4 },
        { itemId: "item_mat_metal", num: 6 },
        { itemId: "item_mat_fabric", num: 18 },
        { itemId: "item_mat_parts", num: 8 }
      ],
      createTime: 180,
      condition: {
        bid: 1,
        level: 2
      },
      produceList: []
    }
  ],
  "10": [
    {
      id: 10,
      cost: [
        { itemId: "item_mat_wood", num: 2 },
        { itemId: "item_mat_metal", num: 1 },
        { itemId: "item_mat_parts", num: 1 }
      ],
      createTime: 60,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: []
    },
    {
      id: 10,
      cost: [
        { itemId: "item_mat_wood", num: 6 },
        { itemId: "item_mat_metal", num: 3 },
        { itemId: "item_mat_fabric", num: 6 },
        { itemId: "item_mat_parts", num: 2 }
      ],
      createTime: 90,
      condition: {
        bid: 1,
        level: 1
      },
      produceList: []
    },
    {
      id: 10,
      cost: [
        { itemId: "item_mat_wood", num: 6 },
        { itemId: "item_mat_metal", num: 2 },
        { itemId: "item_mat_parts", num: 2 },
        { itemId: "item_mat_components", num: 4 }
      ],
      createTime: 120,
      condition: {
        bid: 1,
        level: 2
      },
      produceList: []
    }
  ],
  "11": [
    {
      id: 11,
      cost: [
        { itemId: "item_mat_wood", num: 10 },
        { itemId: "item_mat_metal", num: 10 },
        { itemId: "item_mat_fabric", num: 4 },
        { itemId: "item_mat_parts", num: 4 }
      ],
      createTime: 60,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: []
    },
    {
      id: 11,
      cost: [
        { itemId: "item_mat_wood", num: 15 },
        { itemId: "item_mat_metal", num: 15 },
        { itemId: "item_mat_fabric", num: 6 },
        { itemId: "item_mat_parts", num: 4 }
      ],
      createTime: 90,
      condition: {
        bid: 1,
        level: 1
      },
      produceList: []
    },
    {
      id: 11,
      cost: [
        { itemId: "item_mat_wood", num: 20 },
        { itemId: "item_mat_metal", num: 20 },
        { itemId: "item_mat_fabric", num: 8 },
        { itemId: "item_mat_parts", num: 12 },
        { itemId: "item_mat_components", num: 10 }
      ],
      createTime: 120,
      condition: {
        bid: 1,
        level: 2
      },
      produceList: []
    }
  ],
  "12": [
    {
      id: 12,
      cost: [
        { itemId: "item_mat_wood", num: 4 },
        { itemId: "item_mat_metal", num: 2 },
        { itemId: "item_mat_fabric", num: 2 },
        { itemId: "item_mat_parts", num: 2 },
        { itemId: "item_special_dog", num: 1 }
      ],
      createTime: 60,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: []
    }
  ],
  "13": [
    {
      id: 13,
      cost: [],
      condition: {},
      produceList: []
    }
  ],
  "14": [
    {
      id: 14,
      cost: [],
      condition: {},
      produceList: []
    }
  ],
  "15": [
    {
      id: 15,
      cost: [
        { itemId: "item_mat_metal", num: 5 },
        { itemId: "item_mat_parts", num: 5 },
        { itemId: "item_mat_components", num: 5 }
      ],
      createTime: 30,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: []
    }
  ],
  "16": [
    {
      id: 16,
      cost: [
        { itemId: "item_mat_wood", num: 2 },
        { itemId: "item_mat_metal", num: 6 },
        { itemId: "item_mat_fabric", num: 1 },
        { itemId: "item_mat_parts", num: 4 },
        { itemId: "item_mat_components", num: 4 }
      ],
      createTime: 60,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: [1403012, 1403022, 1202063]
    },
    {
      id: 16,
      cost: [
        { itemId: "item_mat_wood", num: 2 },
        { itemId: "item_mat_metal", num: 8 },
        { itemId: "item_mat_fabric", num: 1 },
        { itemId: "item_mat_parts", num: 8 },
        { itemId: "item_mat_components", num: 12 }
      ],
      createTime: 90,
      condition: {
        bid: 1,
        level: 1
      },
      produceList: [1405012, 1202073]
    }
  ],
  "17": [
    {
      id: 17,
      cost: [],
      createTime: 60,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: []
    }
  ],
  "18": [
    {
      id: 18,
      cost: [
        { itemId: "item_mat_wood", num: 1 },
        { itemId: "item_mat_metal", num: 10 },
        { itemId: "item_mat_parts", num: 10 },
        { itemId: "item_mat_components", num: 10 }
      ],
      createTime: 90,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: []
    }
  ],
  "19": [
    {
      id: 19,
      cost: [
        { itemId: "item_mat_wood", num: 20 },
        { itemId: "item_mat_metal", num: 20 },
        { itemId: "item_mat_fabric", num: 8 },
        { itemId: "item_mat_parts", num: 12 },
        { itemId: "item_mat_components", num: 30 }
      ],
      createTime: 60,
      condition: {
        bid: 1,
        level: 0
      },
      produceList: []
    }
  ],
  "20": [
    {
      id: 20,
      cost: [
        { itemId: "item_mat_wood", num: 6 },
        { itemId: "item_mat_metal", num: 70 },
        { itemId: "item_mat_fabric", num: 8 },
        { itemId: "item_mat_parts", num: 16 },
        { itemId: "item_mat_chemical_materials", num: 2 },
        { itemId: "item_mat_data_module", num: 5 }
      ],
      createTime: 240,
      condition: {
        bid: 1,
        level: 2
      },
      produceList: []
    }
  ],
  "21": [
    {
      id: 21,
      cost: [
        { itemId: "item_mat_metal", num: 16 },
        { itemId: "item_mat_fabric", num: 4 },
        { itemId: "item_mat_parts", num: 16 },
        { itemId: "item_mat_components", num: 10 },
        { itemId: "item_mat_data_module", num: 3 },
        { itemId: "item_mat_chemical_materials", num: 2 }
      ],
      createTime: 240,
      condition: {
        bid: 1,
        level: 2
      },
      produceList: []
    }
  ]
}

