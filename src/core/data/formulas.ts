/**
 * Formula Configuration Data
 * Ported from OriginalGame/src/data/formulaConfig.js
 * 
 * Contains all crafting recipe configurations
 */

import type { FormulaConfigMap } from '@/common/types/formula.types'

export const formulaConfig: FormulaConfigMap = {
  "1201061": {
    "id": "1201061",
    "produce": [{
      "itemId": "item_mat_water",
      "num": 24
    }],
    "cost": [{
      "itemId": "item_mat_wood",
      "num": 6
    }],
    "makeTime": 30,
    "placedTime": [540]
  },
  "1202063": {
    "id": "1202063",
    "produce": [{
      "itemId": "item_model_generator_component",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 16
    }, {
      "itemId": "item_mat_parts",
      "num": 20
    }, {
      "itemId": "item_mat_components",
      "num": 16
    }],
    "makeTime": 90
  },
  "1202073": {
    "id": "1202073",
    "produce": [{
      "itemId": "item_model_gasoline_pump_component",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 4
    }, {
      "itemId": "item_mat_fabric",
      "num": 8
    }, {
      "itemId": "item_mat_parts",
      "num": 6
    }, {
      "itemId": "item_mat_chemical_materials",
      "num": 2
    }],
    "makeTime": 90
  },
  "1203011": {
    "id": "1203011",
    "produce": [{
      "itemId": "item_food_potatoes",
      "num": 12
    }],
    "cost": [{
      "itemId": "item_econ_potato_buds",
      "num": 2
    }, {
      "itemId": "item_mat_water",
      "num": 16
    }],
    "makeTime": 60,
    "placedTime": [2880]
  },
  "1203022": {
    "id": "1203022",
    "produce": [{
      "itemId": "item_food_roasted_potatoes",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_food_potatoes",
      "num": 2
    }, {
      "itemId": "item_mat_wood",
      "num": 3
    }],
    "makeTime": 30
  },
  "1203033": {
    "id": "1203033",
    "produce": [{
      "itemId": "item_food_mashed_potatoes",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_food_potatoes",
      "num": 2
    }, {
      "itemId": "item_mat_water",
      "num": 2
    }, {
      "itemId": "item_mat_wood",
      "num": 1
    }],
    "makeTime": 30
  },
  "1203041": {
    "id": "1203041",
    "produce": [{
      "itemId": "item_food_meat",
      "num": 4
    }],
    "cost": [{
      "itemId": "item_food_potatoes",
      "num": 2
    }],
    "makeTime": 30
  },
  "1203052": {
    "id": "1203052",
    "produce": [{
      "itemId": "item_food_broth",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_food_meat",
      "num": 1
    }, {
      "itemId": "item_mat_water",
      "num": 2
    }, {
      "itemId": "item_mat_wood",
      "num": 2
    }],
    "makeTime": 30
  },
  "1203063": {
    "id": "1203063",
    "produce": [{
      "itemId": "item_food_barbecue",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_food_meat",
      "num": 1
    }, {
      "itemId": "item_mat_wood",
      "num": 4
    }],
    "makeTime": 30
  },
  "1203074": {
    "id": "1203074",
    "produce": [{
      "itemId": "item_food_flavored_stew",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_food_meat",
      "num": 1
    }, {
      "itemId": "item_food_potatoes",
      "num": 2
    }, {
      "itemId": "item_mat_water",
      "num": 2
    }, {
      "itemId": "item_mat_wood",
      "num": 1
    }, {
      "itemId": "item_econ_herbs",
      "num": 1
    }, {
      "itemId": "item_econ_vodka",
      "num": 1
    }],
    "makeTime": 45
  },
  "1204011": {
    "id": "1204011",
    "produce": [{
      "itemId": "item_med_bandage",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_econ_herbs",
      "num": 4
    }, {
      "itemId": "item_mat_fabric",
      "num": 5
    }, {
      "itemId": "item_econ_alcohol",
      "num": 1
    }],
    "makeTime": 30
  },
  "1204021": {
    "id": "1204021",
    "produce": [{
      "itemId": "item_med_ointment",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_econ_herbs",
      "num": 4
    }, {
      "itemId": "item_mat_water",
      "num": 2
    }, {
      "itemId": "item_econ_alcohol",
      "num": 1
    }],
    "makeTime": 30
  },
  "1204032": {
    "id": "1204032",
    "produce": [{
      "itemId": "item_med_homemade_penicillin",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_econ_herbs",
      "num": 2
    }, {
      "itemId": "item_mat_water",
      "num": 8
    }, {
      "itemId": "item_econ_alcohol",
      "num": 1
    }, {
      "itemId": "item_econ_potato_buds",
      "num": 1
    }, {
      "itemId": "item_food_broth",
      "num": 2
    }],
    "makeTime": 60
  },
  "1205022": {
    "id": "1205022",
    "produce": [{
      "itemId": "item_econ_vodka",
      "num": 4
    }],
    "cost": [{
      "itemId": "item_food_potatoes",
      "num": 8
    }, {
      "itemId": "item_mat_water",
      "num": 8
    }, {
      "itemId": "item_mat_wood",
      "num": 4
    }],
    "makeTime": 60,
    "placedTime": [1440]
  },
  "1205033": {
    "id": "1205033",
    "produce": [{
      "itemId": "item_econ_alcohol",
      "num": 4
    }],
    "cost": [{
      "itemId": "item_econ_vodka",
      "num": 8
    }, {
      "itemId": "item_mat_wood",
      "num": 8
    }],
    "makeTime": 30,
    "placedTime": [60]
  },
  "1205042": {
    "id": "1205042",
    "produce": [{
      "itemId": "item_econ_potato_buds",
      "num": 2
    }],
    "cost": [{
      "itemId": "item_food_potatoes",
      "num": 1
    }, {
      "itemId": "item_mat_water",
      "num": 1
    }],
    "makeTime": 30
  },
  "1205051": {
    "id": "1205051",
    "produce": [{
      "itemId": "item_econ_herbs",
      "num": 8
    }],
    "cost": [{
      "itemId": "item_mat_water",
      "num": 16
    }],
    "makeTime": 30,
    "placedTime": [1440]
  },
  "1401011": {
    "id": "1401011",
    "produce": [{
      "itemId": "item_weapon_gun_pistol",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 5
    }, {
      "itemId": "item_mat_parts",
      "num": 2
    }, {
      "itemId": "item_model_pistol_part",
      "num": 2
    }],
    "makeTime": 60
  },
  "1401022": {
    "id": "1401022",
    "produce": [{
      "itemId": "item_weapon_gun_shotgun",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 7
    }, {
      "itemId": "item_mat_wood",
      "num": 1
    }, {
      "itemId": "item_mat_parts",
      "num": 2
    }, {
      "itemId": "item_model_shotgun_part",
      "num": 2
    }],
    "makeTime": 60
  },
  "1401033": {
    "id": "1401033",
    "produce": [{
      "itemId": "item_weapon_gun_ak47",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 12
    }, {
      "itemId": "item_mat_wood",
      "num": 1
    }, {
      "itemId": "item_mat_parts",
      "num": 6
    }, {
      "itemId": "item_model_ak47_part",
      "num": 3
    }],
    "makeTime": 60
  },
  "1401071": {
    "id": "1401071",
    "produce": [{
      "itemId": "item_weapon_gun_emp_handgun",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 5
    }, {
      "itemId": "item_mat_parts",
      "num": 4
    }, {
      "itemId": "item_model_pistol_part",
      "num": 3
    }, {
      "itemId": "item_mat_components",
      "num": 10
    }],
    "makeTime": 90
  },
  "1401082": {
    "id": "1401082",
    "produce": [{
      "itemId": "item_weapon_gun_emp_rifle",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 10
    }, {
      "itemId": "item_mat_wood",
      "num": 1
    }, {
      "itemId": "item_mat_parts",
      "num": 8
    }, {
      "itemId": "item_model_shotgun_part",
      "num": 3
    }, {
      "itemId": "item_mat_components",
      "num": 20
    }],
    "makeTime": 90
  },
  "1401091": {
    "id": "1401091",
    "produce": [{
      "itemId": "item_weapon_gun_flamethrower",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 8
    }, {
      "itemId": "item_mat_fabric",
      "num": 2
    }, {
      "itemId": "item_mat_parts",
      "num": 5
    }, {
      "itemId": "item_mat_chemical_materials",
      "num": 1
    }, {
      "itemId": "item_mat_components",
      "num": 1
    }],
    "makeTime": 90
  },
  "1402011": {
    "id": "1402011",
    "produce": [{
      "itemId": "item_weapon_melee_crowbar",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 2
    }, {
      "itemId": "item_mat_fabric",
      "num": 1
    }],
    "makeTime": 30
  },
  "1402021": {
    "id": "1402021",
    "produce": [{
      "itemId": "item_weapon_melee_axe",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 1
    }, {
      "itemId": "item_mat_fabric",
      "num": 1
    }],
    "makeTime": 30
  },
  "1402032": {
    "id": "1402032",
    "produce": [{
      "itemId": "item_weapon_melee_katana",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 2
    }, {
      "itemId": "item_mat_wood",
      "num": 1
    }, {
      "itemId": "item_mat_fabric",
      "num": 1
    }, {
      "itemId": "item_mat_parts",
      "num": 1
    }, {
      "itemId": "item_model_katana_part",
      "num": 2
    }],
    "makeTime": 60
  },
  "1402043": {
    "id": "1402043",
    "produce": [{
      "itemId": "item_weapon_melee_chainsaw",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 14
    }, {
      "itemId": "item_mat_wood",
      "num": 1
    }, {
      "itemId": "item_mat_parts",
      "num": 12
    }, {
      "itemId": "item_mat_components",
      "num": 15
    }],
    "makeTime": 90
  },
  "1403012": {
    "id": 1403012,
    "produce": [{
      "itemId": "item_weapon_explosive_explosive",
      "num": 8
    }],
    "cost": [{
      "itemId": "item_mat_chemical_materials",
      "num": 4
    }, {
      "itemId": "item_mat_metal",
      "num": 4
    }, {
      "itemId": "item_mat_parts",
      "num": 4
    }, {
      "itemId": "item_mat_fabric",
      "num": 2
    }],
    "makeTime": 60
  },
  "1403022": {
    "id": 1403022,
    "produce": [{
      "itemId": "item_weapon_explosive_smoke_bomb",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_food_meat",
      "num": 1
    }, {
      "itemId": "item_mat_fabric",
      "num": 1
    }, {
      "itemId": "item_mat_components",
      "num": 1
    }, {
      "itemId": "item_mat_chemical_materials",
      "num": 1
    }],
    "makeTime": 30
  },
  "1404012": {
    "id": "1404012",
    "produce": [{
      "itemId": "item_armor_thick_coat",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 1
    }, {
      "itemId": "item_mat_fabric",
      "num": 4
    }, {
      "itemId": "item_mat_parts",
      "num": 2
    }],
    "makeTime": 30
  },
  "1404023": {
    "id": "1404023",
    "produce": [{
      "itemId": "item_armor_antiriot_suit",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_armor_thick_coat",
      "num": 1
    }, {
      "itemId": "item_mat_metal",
      "num": 2
    }, {
      "itemId": "item_mat_fabric",
      "num": 3
    }, {
      "itemId": "item_mat_parts",
      "num": 2
    }],
    "makeTime": 30
  },
  "1404024": {
    "id": "1404024",
    "produce": [{
      "itemId": "item_equip_other_boot",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 2
    }, {
      "itemId": "item_mat_fabric",
      "num": 4
    }, {
      "itemId": "item_mat_parts",
      "num": 4
    }],
    "makeTime": 30
  },
  "1405012": {
    "id": 1405012,
    "produce": [{
      "itemId": "item_ammo_handmade_bullet",
      "num": 24
    }],
    "cost": [{
      "itemId": "item_mat_chemical_materials",
      "num": 4
    }, {
      "itemId": "item_mat_metal",
      "num": 4
    }, {
      "itemId": "item_mat_parts",
      "num": 1
    }],
    "makeTime": 60
  },
  "1405023": {
    "id": "1405023",
    "produce": [{
      "itemId": "item_ammo_enhanced_backpack",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 2
    }, {
      "itemId": "item_mat_fabric",
      "num": 6
    }, {
      "itemId": "item_mat_parts",
      "num": 2
    }],
    "makeTime": 60
  },
  "1405024": {
    "id": "1405024",
    "produce": [{
      "itemId": "item_ammo_military_grade_backpack",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_ammo_enhanced_backpack",
      "num": 1
    }, {
      "itemId": "item_mat_metal",
      "num": 3
    }, {
      "itemId": "item_mat_fabric",
      "num": 2
    }, {
      "itemId": "item_mat_parts",
      "num": 3
    }],
    "makeTime": 30
  },
  "1405053": {
    "id": "1405053",
    "produce": [{
      "itemId": "item_ammo_strong_flashlight",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_data_module",
      "num": 10
    }, {
      "itemId": "item_mat_components",
      "num": 15
    }, {
      "itemId": "item_mat_fabric",
      "num": 6
    }, {
      "itemId": "item_mat_parts",
      "num": 8
    }],
    "makeTime": 60
  },
  "item_ammo_hyper_detector": {
    "id": "item_ammo_hyper_detector",
    "produce": [{
      "itemId": "item_ammo_hyper_detector",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 4
    }, {
      "itemId": "item_mat_data_module",
      "num": 16
    }, {
      "itemId": "item_mat_components",
      "num": 24
    }, {
      "itemId": "item_mat_fabric",
      "num": 10
    }, {
      "itemId": "item_mat_parts",
      "num": 16
    }],
    "makeTime": 120
  },
  "item_ammo_siphon_tool": {
    "id": "item_ammo_siphon_tool",
    "produce": [{
      "itemId": "item_ammo_siphon_tool",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_fabric",
      "num": 4
    }, {
      "itemId": "item_mat_metal",
      "num": 1
    }],
    "makeTime": 30
  },
  "item_ammo_motorcycle": {
    "id": "item_ammo_motorcycle",
    "produce": [{
      "itemId": "item_ammo_motorcycle",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_model_motorcycle_engine",
      "num": 1
    }, {
      "itemId": "item_mat_metal",
      "num": 12
    }, {
      "itemId": "item_mat_parts",
      "num": 16
    }, {
      "itemId": "item_mat_data_module",
      "num": 8
    }],
    "makeTime": 240
  },
  "item_model_motorcycle_engine": {
    "id": "item_model_motorcycle_engine",
    "produce": [{
      "itemId": "item_model_motorcycle_engine",
      "num": 1
    }],
    "cost": [{
      "itemId": "item_mat_metal",
      "num": 4
    }, {
      "itemId": "item_mat_parts",
      "num": 8
    }, {
      "itemId": "item_mat_components",
      "num": 4
    }, {
      "itemId": "item_mat_data_module",
      "num": 1
    }],
    "makeTime": 120
  },
  "item_special_dog_bone": {
    "id": "item_special_dog_bone",
    "produce": [{
      "itemId": "item_special_dog_bone",
      "num": 2
    }],
    "cost": [{
      "itemId": "item_food_roasted_potatoes",
      "num": 2
    }, {
      "itemId": "item_food_meat",
      "num": 1
    }, {
      "itemId": "item_mat_water",
      "num": 1
    }, {
      "itemId": "item_mat_fabric",
      "num": 1
    }],
    "makeTime": 30
  }
} as const

