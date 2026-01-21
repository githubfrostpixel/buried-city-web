import type { ItemConfig, ExpireRate, FertilizerRate } from '@/common/types/item.types'

export const expireRate: ExpireRate = {"item_food_potatoes": 0.003, "item_food_roasted_potatoes": 0.005, "item_food_mashed_potatoes": 0.01, "item_food_meat": 0.03,"item_food_broth": 0.015, "item_food_barbecue": 0.015, "item_food_flavored_stew": 0.015, "item_food_canned_food": 0.001, "item_food_cheese": 0.02} as const

export const fertilizerRate: FertilizerRate = {"item_food_potatoes": 1, "item_food_roasted_potatoes": 3, "item_food_mashed_potatoes": 2, "item_food_meat": 1,"item_food_broth": 2, "item_food_barbecue": 3, "item_food_flavored_stew": 5, "item_food_canned_food": 3, "item_food_cheese": 5} as const

export const itemConfig: Record<string, ItemConfig> = {
    "item_mat_wood": {
        "id": "item_mat_wood",
        "weight": 2,
        "price": 1,
        "value": 1
    },
    "item_mat_metal": {
        "id": "item_mat_metal",
        "weight": 2,
        "price": 1,
        "value": 1
    },
    "item_mat_fabric": {
        "id": "item_mat_fabric",
        "weight": 1,
        "price": 1,
        "value": 1
    },
    "item_mat_parts": {
        "id": "item_mat_parts",
        "weight": 1,
        "price": 1,
        "value": 1
    },
    "item_mat_components": {
        "id": "item_mat_components",
        "weight": 1,
        "price": 1,
        "value": 1
    },
    "item_mat_water": {
        "id": "item_mat_water",
        "weight": 1,
        "price": 0.25,
        "value": 0.28279166666666666
    },
    "item_mat_chemical_materials": {
        "id": "item_mat_chemical_materials",
        "weight": 4,
        "price": 1.5,
        "value": 1.5
    },
    "item_mat_data_module": {
        "id": "item_mat_data_module",
        "weight": 2,
        "price": 6,
        "value": 6
    },
    "item_mat_fertilizer": {
        "id": "item_mat_fertilizer",
        "weight": 1,
        "price": 0.2,
        "value": 0.2
    },
    "item_model_pistol_part": {
        "id": "item_model_pistol_part",
        "weight": 1,
        "price": 1,
        "value": 1
    },
    "item_model_shotgun_part": {
        "id": "item_model_shotgun_part",
        "weight": 2,
        "price": 2,
        "value": 2
    },
    "item_model_ak47_part": {
        "id": "item_model_ak47_part",
        "weight": 3,
        "price": 3,
        "value": 3
    },
    "item_model_katana_part": {
        "id": "item_model_katana_part",
        "weight": 2,
        "price": 2,
        "value": 2
    },
    "item_model_motorcycle_engine": {
        "id": "item_model_motorcycle_engine",
        "weight": 6,
        "price": 50,
        "value": 50
    },
    "item_model_generator_component": {
        "id": "item_model_generator_component",
        "weight": 10,
        "price": 60,
        "value": 60
    },
    "item_model_gasoline_pump_component": {
        "id": "item_model_gasoline_pump_component",
        "weight": 8,
        "price": 0,
        "value": 0
    },
    "item_food_potatoes": {
        "id": "item_food_potatoes",
        "weight": 1,
        "price": 0.75,
        "value": 0.7870296328125,
        "effect_food": {
            "id": "item_food_potatoes",
            "starve": 10,
            "starve_chance": 1,
            "infect": 10,
            "infect_chance": 0.6
        }
    },
    "item_food_roasted_potatoes": {
        "id": "item_food_roasted_potatoes",
        "weight": 2,
        "price": 5.25,
        "value": 5.056622518148437,
        "effect_food": {
            "id": "item_food_roasted_potatoes",
            "starve": 35,
            "starve_chance": 1
        }
    },
    "item_food_mashed_potatoes": {
        "id": "item_food_mashed_potatoes",
        "weight": 2,
        "price": 4,
        "value": 3.7864089743437495,
        "effect_food": {
            "id": "item_food_mashed_potatoes",
            "starve": 35,
            "starve_chance": 1
        }
    },
    "item_food_meat": {
        "id": "item_food_meat",
        "weight": 1,
        "price": 1,
        "value": 1.1254523749218752,
        "effect_food": {
            "id": "item_food_meat",
            "starve": 14,
            "starve_chance": 1,
            "infect": 20,
            "infect_chance": 0.9
        }
    },
    "item_food_broth": {
        "id": "item_food_broth",
        "weight": 2,
        "price": 4.5,
        "value": 4.45138906415578,
        "effect_food": {
            "id": "item_food_broth",
            "starve": 40,
            "starve_chance": 1
        }
    },
    "item_food_barbecue": {
        "id": "item_food_barbecue",
        "weight": 2,
        "price": 5.75,
        "value": 5.666187600476133,
        "effect_food": {
            "id": "item_food_barbecue",
            "starve": 40,
            "starve_chance": 1
        }
    },
    "item_food_flavored_stew": {
        "id": "item_food_flavored_stew",
        "weight": 3,
        "price": 12,
        "value": 11.30843054871349,
        "effect_food": {
            "id": "item_food_flavored_stew",
            "spirit": 30,
            "spirit_chance": 1,
            "starve": 80,
            "starve_chance": 1
        }
    },
    "item_food_canned_food": {
        "id": "item_food_canned_food",
        "weight": 2,
        "price": 5,
        "value": 5,
        "effect_food": {
            "id": "item_food_canned_food",
            "starve": 40,
            "starve_chance": 1
        }
    },
    "item_food_cheese": {
        "id": "item_food_cheese",
        "weight": 1,
        "price": 14,
        "value": 13.20843054871349,
        "effect_food": {
            "id": "item_food_flavored_stew",
            "spirit": 80,
            "spirit_chance": 1,
            "starve": 30,
            "starve_chance": 1
        }
    },
    "item_med_bandage": {
        "id": "item_med_bandage",
        "weight": 1,
        "price": 21.5,
        "value": 21.05608633968867,
        "effect_medicine": {
            "id": "item_med_bandage",
            "injury": -30,
            "injury_chance": 1
        }
    },
    "item_med_ointment": {
        "id": "item_med_ointment",
        "weight": 1,
        "price": 16.5,
        "value": 16.15383871468867,
        "effect_medicine": {
            "id": "item_med_ointment",
            "infect": -20,
            "infect_chance": 1
        }
    },
    "item_med_homemade_penicillin": {
        "id": "item_med_homemade_penicillin",
        "weight": 1,
        "price": 31,
        "value": 30.0731189840807,
        "effect_medicine": {
            "id": "item_med_homemade_penicillin",
            "infect": -100,
            "infect_chance": 1,
            "hp": -150,
            "hp_chance": 0.5
        }
    },
    "item_med_penicillin": {
        "id": "item_med_penicillin",
        "weight": 1,
        "price": 60,
        "value": 60,
        "effect_medicine": {
            "id": "item_med_penicillin",
            "infect": -100,
            "infect_chance": 1
        }
    },
    "item_econ_coffee": {
        "id": "item_econ_coffee",
        "weight": 0,
        "price": 2,
        "value": 2
    },
    "item_econ_vodka": {
        "id": "item_econ_vodka",
        "weight": 1,
        "price": 3.75,
        "value": 3.6694572875325524
    },
    "item_econ_alcohol": {
        "id": "item_econ_alcohol",
        "weight": 1,
        "price": 11.5,
        "value": 11.248722605665916
    },
    "item_econ_potato_buds": {
        "id": "item_econ_potato_buds",
        "weight": 1,
        "price": 1,
        "value": 1
    },
    "item_econ_herbs": {
        "id": "item_econ_herbs",
        "weight": 1,
        "price": 0.75,
        "value": 0.6994851874999999
    },
    "item_special_dog": {
        "id": "item_special_dog",
        "weight": 12,
        "price": 60,
        "value": 60
    },
    "item_special_dog_bone": {
        "id": "item_special_dog_bone",
        "weight": 1,
        "price": 2,
        "value": 2
    },
    "item_special_first_aid_kit": {
        "id": "item_special_first_aid_kit",
        "weight": 4,
        "price": 100,
        "value": 100
    },
    "item_buff_protoplasm_serum": {
        "id": "item_buff_protoplasm_serum",
        "weight": 1,
        "price": 22,
        "value": 22,
        "effect_buff": {
            "id": "item_buff_protoplasm_serum",
            "effect": 1,
            "effectType": 1,
            "value": 60,
            "lastTime": 72
        }
    },
    "item_buff_transmission_blocker": {
        "id": "item_buff_transmission_blocker",
        "weight": 1,
        "price": 45,
        "value": 45,
        "effect_buff": {
            "id": "item_buff_transmission_blocker",
            "effect": 2,
            "effectType": 2,
            "value": 0,
            "lastTime": 72
        }
    },
    "item_buff_stimpack": {
        "id": "item_buff_stimpack",
        "weight": 1,
        "price": 22,
        "value": 22,
        "effect_buff": {
            "id": "item_buff_stimpack",
            "effect": 3,
            "effectType": 2,
            "value": 0,
            "lastTime": 72
        }
    },
    "item_buff_military_ration": {
        "id": "item_buff_military_ration",
        "weight": 1,
        "price": 28,
        "value": 28,
        "effect_buff": {
            "id": "item_buff_military_ration",
            "effect": 4,
            "effectType": 2,
            "value": 0,
            "lastTime": 72
        }
    },
    "item_buff_experimental_antidote": {
        "id": "item_buff_experimental_antidote",
        "weight": 1,
        "price": 24,
        "value": 24,
        "effect_buff": {
            "id": "item_buff_experimental_antidote",
            "effect": 5,
            "effectType": 2,
            "value": 0,
            "lastTime": 72
        }
    },
    "item_weapon_gun_pistol": {
        "id": "item_weapon_gun_pistol",
        "weight": 1,
        "price": 15,
        "value": 9.999,
        "effect_weapon": {
            "id": "item_weapon_gun_pistol",
            "atk": 0,
            "atkCD": 1,
            "range": 4,
            "bulletMin": 1,
            "bulletMax": 1,
            "bulletNum": 10,
            "reloadCD": 1,
            "precise": 0.55,
            "dtPrecise": 0.05,
            "deathHit": 0.05,
            "dtDeathHit": 0.01,
            "brokenProbability": 0.065
        }
    },
    "item_weapon_gun_shotgun": {
        "id": "item_weapon_gun_shotgun",
        "weight": 4,
        "price": 25.5,
        "value": 16.968,
        "effect_weapon": {
            "id": "item_weapon_gun_shotgun",
            "atk": 0,
            "atkCD": 2,
            "range": 5,
            "bulletMin": 1,
            "bulletMax": 2,
            "bulletNum": 6,
            "reloadCD": 0.5,
            "precise": 0.65,
            "dtPrecise": 0,
            "deathHit": 0.1,
            "dtDeathHit": 0.05,
            "brokenProbability": 0.065
        }
    },
    "item_weapon_gun_ak47": {
        "id": "item_weapon_gun_ak47",
        "weight": 6,
        "price": 50,
        "value": 32.825,
        "effect_weapon": {
            "id": "item_weapon_gun_ak47",
            "atk": 0,
            "atkCD": 1,
            "range": 5,
            "bulletMin": 3,
            "bulletMax": 3,
            "bulletNum": 30,
            "reloadCD": 1,
            "precise": 0.6,
            "dtPrecise": 0.01,
            "deathHit": 0.1,
            "dtDeathHit": 0.05,
            "brokenProbability": 0.065
        }
    },
    "item_weapon_gun_magnum": {
        "id": "item_weapon_gun_magnum",
        "weight": 2,
        "price": 17,
        "value": 12,
        "effect_weapon": {
            "id": "item_weapon_gun_magnum",
            "atk": 0,
            "atkCD": 1,
            "range": 5,
            "bulletMin": 1,
            "bulletMax": 1,
            "bulletNum": 6,
            "reloadCD": 1,
            "precise": 0.55,
            "dtPrecise": 0.05,
            "deathHit": 0.1,
            "dtDeathHit": 0.03,
            "brokenProbability": 0.07
        }
    },
    "item_weapon_gun_m40": {
        "id": "item_weapon_gun_m40",
        "weight": 5,
        "price": 28,
        "value": 18,
        "effect_weapon": {
            "id": "item_weapon_gun_m40",
            "atk": 0,
            "atkCD": 2,
            "range": 5,
            "bulletMin": 1,
            "bulletMax": 2,
            "bulletNum": 5,
            "reloadCD": 0.5,
            "precise": 0.65,
            "dtPrecise": 0,
            "deathHit": 0.2,
            "dtDeathHit": 0.05,
            "brokenProbability": 0.07
        }
    },
    "item_weapon_gun_famas": {
        "id": "item_weapon_gun_famas",
        "weight": 6,
        "price": 55,
        "value": 35,
        "effect_weapon": {
            "id": "item_weapon_gun_famas",
            "atk": 0,
            "atkCD": 1,
            "range": 5,
            "bulletMin": 3,
            "bulletMax": 3,
            "bulletNum": 30,
            "reloadCD": 1,
            "precise": 0.6,
            "dtPrecise": 0.01,
            "deathHit": 0.1,
            "dtDeathHit": 0.05,
            "brokenProbability": 0.07
        }
    },
    "item_weapon_gun_emp_handgun": {
        "id": "item_weapon_gun_emp_handgun",
        "weight": 3,
        "price": 30,
        "value": 30,
        "effect_weapon": {
            "id": "item_weapon_gun_emp_handgun",
            "atk": 60,
            "atkCD": 1,
            "range": 3,
            "bulletMin": 1,
            "bulletMax": 1,
            "bulletNum": 30,
            "reloadCD": 1,
            "precise": 0.8,
            "dtPrecise": 0,
            "deathHit": 0.1,
            "dtDeathHit": 0.05,
            "brokenProbability": 0.04
        }
    },
    "item_weapon_gun_emp_rifle": {
        "id": "item_weapon_gun_emp_rifle",
        "weight": 10,
        "price": 60,
        "value": 60,
        "effect_weapon": {
            "id": "item_weapon_gun_emp_rifle",
            "atk": 110,
            "atkCD": 2,
            "range": 4,
            "bulletMin": 1,
            "bulletMax": 1,
            "bulletNum": 30,
            "reloadCD": 1,
            "precise": 0.8,
            "dtPrecise": 0,
            "deathHit": 0.1,
            "dtDeathHit": 0.05,
            "brokenProbability": 0.04
        }
    },
    "item_weapon_gun_flamethrower": {
        "id": "item_weapon_gun_flamethrower",
        "weight": 6,
        "price": 40,
        "value": 40,
        "effect_weapon": {
            "id": "item_weapon_gun_flamethrower",
            "atk": 25,
            "atkCD": 1,
            "range": 19,
            "bulletMin": 0,
            "bulletMax": 0,
            "bulletNum": 0,
            "reloadCD": 0.2,
            "precise": 0,
            "dtPrecise": 0,
            "deathHit": 0,
            "dtDeathHit": 0,
            "brokenProbability": 0.08
        }
    },
    "item_weapon_melee_crowbar": {
        "id": "item_weapon_melee_crowbar",
        "weight": 2,
        "price": 3.5,
        "value": 3.3165,
        "effect_tool": {
            "id": "item_weapon_melee_crowbar",
            "workingTime": 10
        },
        "effect_weapon": {
            "id": "item_weapon_melee_crowbar",
            "atk": 40,
            "atkCD": 1,
            "range": 0,
            "bulletMin": 0,
            "bulletMax": 0,
            "bulletNum": 0,
            "reloadCD": 1,
            "precise": 1,
            "dtPrecise": 0,
            "deathHit": 0,
            "dtDeathHit": 0,
            "brokenProbability": 0.05
        }
    },
    "item_weapon_melee_axe": {
        "id": "item_weapon_melee_axe",
        "weight": 2,
        "price": 2.25,
        "value": 2.211,
        "effect_tool": {
            "id": "item_weapon_melee_axe",
            "workingTime": 20
        },
        "effect_weapon": {
            "id": "item_weapon_melee_axe",
            "atk": 40,
            "atkCD": 1,
            "range": 0,
            "bulletMin": 0,
            "bulletMax": 0,
            "bulletNum": 0,
            "reloadCD": 1,
            "precise": 1,
            "dtPrecise": 0,
            "deathHit": 0,
            "dtDeathHit": 0,
            "brokenProbability": 0.05
        }
    },
    "item_weapon_melee_katana": {
        "id": "item_weapon_melee_katana",
        "weight": 3,
        "price": 11,
        "value": 10.908,
        "effect_weapon": {
            "id": "item_weapon_melee_katana",
            "atk": 50,
            "atkCD": 1,
            "range": 0,
            "bulletMin": 0,
            "bulletMax": 0,
            "bulletNum": 0,
            "reloadCD": 1,
            "precise": 1,
            "dtPrecise": 0,
            "deathHit": 0,
            "dtDeathHit": 0,
            "brokenProbability": 0.05
        }
    },
    "item_weapon_melee_chainsaw": {
        "id": "item_weapon_melee_chainsaw",
        "weight": 6,
        "price": 50,
        "value": 50,
        "effect_tool": {
            "id": "item_weapon_melee_axe",
            "workingTime": 5
        },
        "effect_weapon": {
            "id": "item_weapon_melee_chainsaw",
            "atk": 100,
            "atkCD": 1.5,
            "range": 0,
            "bulletMin": 0,
            "bulletMax": 0,
            "bulletNum": 0,
            "reloadCD": 0.6,
            "precise": 1,
            "dtPrecise": 0,
            "deathHit": 0,
            "dtDeathHit": 0,
            "brokenProbability": 0.04
        }
    },
    "item_weapon_explosive_explosive": {
        "id": "item_weapon_explosive_explosive",
        "weight": 1,
        "price": 4,
        "value": 4,
        "effect_weapon": {
            "id": "item_weapon_explosive_explosive",
            "atk": 50,
            "atkCD": 5,
            "range": 5,
            "bulletMin": 0,
            "bulletMax": 0,
            "bulletNum": 0,
            "reloadCD": 0.2,
            "precise": 0,
            "dtPrecise": 0,
            "deathHit": 0,
            "dtDeathHit": 0,
            "brokenProbability": 0
        }
    },
    "item_weapon_explosive_smoke_bomb": {
        "id": "item_weapon_explosive_smoke_bomb",
        "weight": 1,
        "price": 8,
        "value": 8,
        "effect_weapon": {
            "id": "item_weapon_explosive_smoke_bomb",
            "atk": 3,
            "atkCD": 5,
            "range": 5,
            "bulletMin": 0,
            "bulletMax": 0,
            "bulletNum": 0,
            "reloadCD": 0.2,
            "precise": 0,
            "dtPrecise": 0,
            "deathHit": 0,
            "dtDeathHit": 0,
            "brokenProbability": 0
        }
    },
    "item_weapon_explosive_rocket_launcher": {
        "id": "item_weapon_explosive_rocket_launcher",
        "weight": 1,
        "price": 18,
        "value": 18,
        "effect_weapon": {
            "id": "item_weapon_explosive_rocket_launcher",
            "atk": 100,
            "atkCD": 5,
            "range": 5,
            "bulletMin": 0,
            "bulletMax": 0,
            "bulletNum": 0,
            "reloadCD": 0.2,
            "precise": 0,
            "dtPrecise": 0,
            "deathHit": 0,
            "dtDeathHit": 0,
            "brokenProbability": 0
        }
    },
    "item_weapon_explosive_grenade": {
        "id": "item_weapon_explosive_grenade",
        "weight": 1,
        "price": 28,
        "value": 28,
        "effect_weapon": {
            "id": "item_weapon_explosive_grenade",
            "atk": 160,
            "atkCD": 5,
            "range": 5,
            "bulletMin": 0,
            "bulletMax": 0,
            "bulletNum": 0,
            "reloadCD": 0.2,
            "precise": 0,
            "dtPrecise": 0,
            "deathHit": 0,
            "dtDeathHit": 0,
            "brokenProbability": 0
        }
    },
    "item_armor_thick_coat": {
        "id": "item_armor_thick_coat",
        "weight": 2,
        "price": 8.5,
        "value": 8.442,
        "effect_arm": {
            "id": "item_armor_thick_coat",
            "def": 3,
            "brokenProbability": 0.08
        }
    },
    "item_armor_antiriot_suit": {
        "id": "item_armor_antiriot_suit",
        "weight": 3,
        "price": 18.5,
        "value": 18.290999999999997,
        "effect_arm": {
            "id": "item_armor_antiriot_suit",
            "def": 5,
            "brokenProbability": 0.06
        }
    },
    "item_equip_other_boot": {
        "id": "item_equip_other_boot",
        "weight": 1,
        "price": 8,
        "value": 7.878000000000001
    },
    "item_ammo_standard_bullet": {
        "id": "item_ammo_standard_bullet",
        "weight": 0,
        "price": 0.9,
        "value": 0.8888,
        "effect_weapon": {
            "id": "item_ammo_standard_bullet",
            "atk": 50,
            "atkCD": 0,
            "range": 0,
            "bulletMin": 0,
            "bulletMax": 0,
            "bulletNum": 0,
            "reloadCD": 0,
            "precise": 0,
            "dtPrecise": 0,
            "deathHit": 0,
            "dtDeathHit": 0,
            "brokenProbability": 0
        }
    },
    "item_ammo_handmade_bullet": {
        "id": "item_ammo_handmade_bullet",
        "weight": 0,
        "price": 0.7,
        "value": 0.688888,
        "effect_weapon": {
            "id": "item_ammo_standard_bullet",
            "atk": 50,
            "atkCD": 0,
            "range": 0,
            "bulletMin": 0,
            "bulletMax": 0,
            "bulletNum": 0,
            "reloadCD": 0,
            "precise": 0,
            "dtPrecise": 0,
            "deathHit": 0,
            "dtDeathHit": 0,
            "brokenProbability": 0
        }
    },
    "item_ammo_enhanced_backpack": {
        "id": "item_ammo_enhanced_backpack",
        "weight": 1,
        "price": 13,
        "value": 13.13
    },
    "item_ammo_military_grade_backpack": {
        "id": "item_ammo_military_grade_backpack",
        "weight": 2,
        "price": 38,
        "value": 36.763999999999996
    },
    "item_ammo_motorcycle": {
        "id": "item_ammo_motorcycle",
        "weight": 16,
        "price": 64,
        "value": 62.374777777777774
    },
    "item_ammo_strong_flashlight": {
        "id": "item_ammo_strong_flashlight",
        "weight": 2,
        "price": 24,
        "value": 23.216666666666664
    },
    "item_ammo_hyper_detector": {
        "id": "item_ammo_hyper_detector",
        "weight": 4,
        "price": 48,
        "value": 46.383444444444443
    },
    "item_ammo_siphon_tool": {
        "id": "item_ammo_siphon_tool",
        "weight": 4,
        "price": 4,
        "value": 3.333333
    }
} as const
