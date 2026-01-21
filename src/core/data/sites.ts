/**
 * Site configuration data
 * Ported from OriginalGame/src/data/siteConfig.js
 * 
 * Total sites: 49
 */

import type { SiteConfigMap } from '@/common/types/site.types'

export const siteConfig: SiteConfigMap = {
  "1": {
    id: 1,
    coordinate: {
      x: 152,
      y: 60,
    },
    battleRoom: 2,
    difficulty: [
      1,
      2,
    ],
    workRoom: 2,
    produceValue: 50,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 4,
      },
      {
        itemId: "item_mat_parts",
        weight: 3,
      },
      {
        itemId: "item_mat_components",
        weight: 5,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 6,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 1,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 5,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 0,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_mat_water",
        num: 4,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 1,
      },
      {
        itemId: "item_med_ointment",
        num: 1,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 5,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_food_cheese",
        num: 1,
      },
    ],
    unlockValue: {
      site: [
        "2",
        "3",
      ],
    },
    def: 20,
  },
  "2": {
    id: 2,
    coordinate: {
      x: 144,
      y: 287,
    },
    battleRoom: 7,
    difficulty: [
      2,
      3,
    ],
    workRoom: 8,
    produceValue: 278,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 15,
      },
      {
        itemId: "item_mat_metal",
        weight: 15,
      },
      {
        itemId: "item_mat_fabric",
        weight: 6,
      },
      {
        itemId: "item_mat_parts",
        weight: 5,
      },
      {
        itemId: "item_mat_components",
        weight: 5,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 1,
      },
      {
        itemId: "item_food_*",
        weight: 10,
      },
      {
        itemId: "item_med_bandage",
        weight: 5,
      },
      {
        itemId: "item_med_ointment",
        weight: 5,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 2,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 30,
      },
      {
        itemId: "item_food_canned_food",
        weight: 3,
      },
      {
        itemId: "item_model_*",
        weight: 2,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 5,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 1,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 1,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
      {
        itemId: "item_mat_chemical_materials",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 3,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_food_cheese",
        num: 2,
      },
    ],
    unlockValue: {
      site: [
        "4",
        "5",
      ],
    },
    def: 20,
  },
  "3": {
    id: 3,
    coordinate: {
      x: 212,
      y: 127,
    },
    battleRoom: 4,
    difficulty: [
      2,
      3,
    ],
    workRoom: 4,
    produceValue: 138,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 15,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 4,
      },
      {
        itemId: "item_mat_parts",
        weight: 4,
      },
      {
        itemId: "item_mat_components",
        weight: 4,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 1,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 2,
      },
      {
        itemId: "item_med_ointment",
        weight: 2,
      },
      {
        itemId: "item_mat_water",
        weight: 4,
      },
      {
        itemId: "item_econ_coffee",
        weight: 5,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 20,
      },
      {
        itemId: "item_food_canned_food",
        weight: 2,
      },
      {
        itemId: "item_model_*",
        weight: 1,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 3,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 1,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
      {
        itemId: "item_mat_chemical_materials",
        weight: 2,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_mat_water",
        num: 4,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 1,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {
      site: [
        "10",
        "11",
      ],
    },
    secretRoomsId: 1,
    def: 20,
  },
  "4": {
    id: 4,
    coordinate: {
      x: 40,
      y: 222,
    },
    battleRoom: 6,
    difficulty: [
      3,
      4,
    ],
    workRoom: 4,
    produceValue: 102,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 5,
      },
      {
        itemId: "item_mat_metal",
        weight: 6,
      },
      {
        itemId: "item_mat_fabric",
        weight: 1,
      },
      {
        itemId: "item_mat_parts",
        weight: 4,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 0,
      },
      {
        itemId: "item_food_*",
        weight: 30,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 1,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 3,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 5,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 0,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_food_cheese",
        num: 2,
      },
    ],
    unlockValue: {},
    secretRoomsId: 1,
    def: 20,
  },
  "5": {
    id: 5,
    coordinate: {
      x: 410,
      y: 127,
    },
    battleRoom: 10,
    difficulty: [
      3,
      4,
    ],
    workRoom: 5,
    produceValue: 150,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 0,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 0,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 0,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {
      site: [
        "6",
        "7",
      ],
    },
    def: 20,
  },
  "6": {
    id: 6,
    coordinate: {
      x: 223,
      y: 217,
    },
    battleRoom: 4,
    difficulty: [
      4,
      6,
    ],
    workRoom: 2,
    produceValue: 54,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 5,
      },
      {
        itemId: "item_mat_fabric",
        weight: 0,
      },
      {
        itemId: "item_mat_parts",
        weight: 5,
      },
      {
        itemId: "item_mat_components",
        weight: 5,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 5,
      },
      {
        itemId: "item_food_*",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 0,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 2,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 0,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_water",
        num: 4,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_mat_water",
        num: 4,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 1,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_food_cheese",
        num: 2,
      },
    ],
    unlockValue: {
      site: [
        "8",
      ],
    },
    def: 30,
  },
  "7": {
    id: 7,
    coordinate: {
      x: 60,
      y: 394,
    },
    battleRoom: 6,
    difficulty: [
      4,
      6,
    ],
    workRoom: 2,
    produceValue: 160,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 1,
      },
      {
        itemId: "item_mat_metal",
        weight: 4,
      },
      {
        itemId: "item_mat_fabric",
        weight: 1,
      },
      {
        itemId: "item_mat_parts",
        weight: 4,
      },
      {
        itemId: "item_mat_components",
        weight: 1,
      },
      {
        itemId: "item_mat_*",
        weight: 1,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 0,
      },
      {
        itemId: "item_model_katana_part",
        weight: 10,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 0,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 4,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 1,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 0,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 1,
      },
    ],
    unlockValue: {
      site: [
        "9",
      ],
    },
    secretRoomsId: 1,
    def: 30,
  },
  "8": {
    id: 8,
    coordinate: {
      x: 100,
      y: 477,
    },
    battleRoom: 8,
    difficulty: [
      4,
      6,
    ],
    workRoom: 6,
    produceValue: 192,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 5,
      },
      {
        itemId: "item_mat_fabric",
        weight: 0,
      },
      {
        itemId: "item_mat_parts",
        weight: 5,
      },
      {
        itemId: "item_mat_components",
        weight: 5,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 0,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 1,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 100,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 0,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_food_cheese",
        num: 1,
      },
    ],
    unlockValue: {},
    def: 30,
  },
  "9": {
    id: 9,
    coordinate: {
      x: 490,
      y: 502,
    },
    battleRoom: 10,
    difficulty: [
      5,
      7,
    ],
    workRoom: 5,
    produceValue: 161,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 100,
      },
      {
        itemId: "item_mat_metal",
        weight: 50,
      },
      {
        itemId: "item_mat_fabric",
        weight: 20,
      },
      {
        itemId: "item_mat_parts",
        weight: 20,
      },
      {
        itemId: "item_mat_components",
        weight: 20,
      },
      {
        itemId: "item_mat_*",
        weight: 20,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 0,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 0,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 1,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 0,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {},
    secretRoomsId: 1,
    def: 40,
  },
  "10": {
    id: 10,
    coordinate: {
      x: 300,
      y: 127,
    },
    battleRoom: 7,
    difficulty: [
      2,
      3,
    ],
    workRoom: 4,
    produceValue: 113,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 20,
      },
      {
        itemId: "item_mat_metal",
        weight: 5,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 5,
      },
      {
        itemId: "item_mat_components",
        weight: 1,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 1,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 1,
      },
      {
        itemId: "item_med_ointment",
        weight: 1,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 5,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 2,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 25,
      },
      {
        itemId: "item_food_canned_food",
        weight: 1,
      },
      {
        itemId: "item_model_*",
        weight: 2,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 1,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 1,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_water",
        num: 4,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 1,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {
      site: [
        "12",
        "13",
      ],
    },
    secretRoomsId: 1,
    def: 20,
  },
  "11": {
    id: 11,
    coordinate: {
      x: 200,
      y: 367,
    },
    battleRoom: 9,
    difficulty: [
      3,
      4,
    ],
    workRoom: 9,
    produceValue: 300,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 15,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 5,
      },
      {
        itemId: "item_mat_parts",
        weight: 5,
      },
      {
        itemId: "item_mat_components",
        weight: 5,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 1,
      },
      {
        itemId: "item_food_*",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 2,
      },
      {
        itemId: "item_med_ointment",
        weight: 2,
      },
      {
        itemId: "item_med_penicillin",
        weight: 1,
      },
      {
        itemId: "item_econ_coffee",
        weight: 20,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 2,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 40,
      },
      {
        itemId: "item_food_canned_food",
        weight: 5,
      },
      {
        itemId: "item_model_*",
        weight: 2,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 5,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 3,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 1,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_food_cheese",
        num: 1,
      },
    ],
    unlockValue: {},
    secretRoomsId: 2,
    def: 20,
  },
  "12": {
    id: 12,
    coordinate: {
      x: 380,
      y: 573,
    },
    battleRoom: 11,
    difficulty: [
      4,
      6,
    ],
    workRoom: 6,
    produceValue: 202,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 1,
      },
      {
        itemId: "item_mat_parts",
        weight: 5,
      },
      {
        itemId: "item_mat_components",
        weight: 1,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 2,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 1,
      },
      {
        itemId: "item_med_ointment",
        weight: 1,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 60,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 3,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 2,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 2,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
      {
        itemId: "item_mat_chemical_materials",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 6,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {
      site: [
        "14",
      ],
    },
    secretRoomsId: 3,
    def: 30,
  },
  "13": {
    id: 13,
    coordinate: {
      x: 175,
      y: 567,
    },
    battleRoom: 8,
    difficulty: [
      4,
      6,
    ],
    workRoom: 3,
    produceValue: 99,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 20,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 5,
      },
      {
        itemId: "item_mat_components",
        weight: 1,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 1,
      },
      {
        itemId: "item_food_*",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 0,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 3,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 5,
      },
      {
        itemId: "item_food_canned_food",
        weight: 2,
      },
      {
        itemId: "item_model_*",
        weight: 3,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 1,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 1,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 6,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {},
    secretRoomsId: 2,
    def: 30,
  },
  "14": {
    id: 14,
    coordinate: {
      x: 500,
      y: 689,
    },
    battleRoom: 14,
    difficulty: [
      5,
      7,
    ],
    workRoom: 7,
    produceValue: 251,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 50,
      },
      {
        itemId: "item_mat_metal",
        weight: 20,
      },
      {
        itemId: "item_mat_fabric",
        weight: 5,
      },
      {
        itemId: "item_mat_parts",
        weight: 6,
      },
      {
        itemId: "item_mat_components",
        weight: 1,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 2,
      },
      {
        itemId: "item_food_*",
        weight: 30,
      },
      {
        itemId: "item_med_bandage",
        weight: 2,
      },
      {
        itemId: "item_med_ointment",
        weight: 2,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 5,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 60,
      },
      {
        itemId: "item_food_canned_food",
        weight: 3,
      },
      {
        itemId: "item_model_*",
        weight: 4,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 2,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 2,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 8,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {
      npc: [
        5,
      ],
    },
    secretRoomsId: 3,
    def: 40,
  },
  "20": {
    id: 20,
    coordinate: {
      x: 270,
      y: 377,
    },
    battleRoom: 4,
    difficulty: [
      3,
      4,
    ],
    workRoom: 4,
    produceValue: 136,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 20,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 5,
      },
      {
        itemId: "item_mat_parts",
        weight: 20,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 0,
      },
      {
        itemId: "item_food_*",
        weight: 15,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 0,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 5,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 2,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 30,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 0,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
      {
        itemId: "item_mat_chemical_materials",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 12,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {},
    def: 20,
  },
  "21": {
    id: 21,
    coordinate: {
      x: 235,
      y: 277,
    },
    battleRoom: 12,
    difficulty: [
      3,
      4,
    ],
    workRoom: 5,
    produceValue: 157,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 50,
      },
      {
        itemId: "item_mat_metal",
        weight: 15,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 15,
      },
      {
        itemId: "item_mat_*",
        weight: 30,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 1,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 0,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 1,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
      {
        itemId: "item_mat_chemical_materials",
        weight: 15,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 7,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {
      site: [
        "22",
      ],
    },
    secretRoomsId: 2,
    def: 20,
  },
  "22": {
    id: 22,
    coordinate: {
      x: 60,
      y: 560,
    },
    battleRoom: 10,
    difficulty: [
      4,
      6,
    ],
    workRoom: 5,
    produceValue: 147,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 75,
      },
      {
        itemId: "item_mat_metal",
        weight: 50,
      },
      {
        itemId: "item_mat_fabric",
        weight: 15,
      },
      {
        itemId: "item_mat_parts",
        weight: 20,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 0,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 0,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 5,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
      {
        itemId: "item_mat_chemical_materials",
        weight: 25,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 8,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {},
    secretRoomsId: 3,
    def: 30,
  },
  "30": {
    id: 30,
    coordinate: {
      x: 240,
      y: 617,
    },
    battleRoom: 7,
    difficulty: [
      3,
      4,
    ],
    workRoom: 5,
    produceValue: 170,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 60,
      },
      {
        itemId: "item_mat_metal",
        weight: 20,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 0,
      },
      {
        itemId: "item_mat_*",
        weight: 20,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 0,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 0,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 2,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 12,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {
      site: [
        "31",
      ],
    },
    def: 20,
  },
  "31": {
    id: 31,
    coordinate: {
      x: 490,
      y: 265,
    },
    battleRoom: 6,
    difficulty: [
      4,
      6,
    ],
    workRoom: 4,
    produceValue: 84,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 20,
      },
      {
        itemId: "item_mat_parts",
        weight: 3,
      },
      {
        itemId: "item_mat_components",
        weight: 0,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 0,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 0,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 0,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 18,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {},
    secretRoomsId: 1,
    def: 30,
  },
  "32": {
    id: 32,
    coordinate: {
      x: 80,
      y: 310,
    },
    battleRoom: 15,
    difficulty: [
      4,
      6,
    ],
    workRoom: 4,
    produceValue: 126,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 25,
      },
      {
        itemId: "item_mat_metal",
        weight: 20,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 20,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 1,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 0,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 50,
      },
      {
        itemId: "item_food_canned_food",
        weight: 2,
      },
      {
        itemId: "item_model_*",
        weight: 3,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 5,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
      {
        itemId: "item_mat_chemical_materials",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 14,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {
      site: [
        "33",
      ],
    },
    def: 30,
  },
  "33": {
    id: 33,
    coordinate: {
      x: 378,
      y: 767,
    },
    battleRoom: 45,
    difficulty: [
      6,
      7,
    ],
    workRoom: 20,
    produceValue: 814,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 150,
      },
      {
        itemId: "item_mat_metal",
        weight: 30,
      },
      {
        itemId: "item_mat_fabric",
        weight: 20,
      },
      {
        itemId: "item_mat_parts",
        weight: 40,
      },
      {
        itemId: "item_mat_components",
        weight: 50,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 2,
      },
      {
        itemId: "item_food_*",
        weight: 50,
      },
      {
        itemId: "item_med_bandage",
        weight: 10,
      },
      {
        itemId: "item_med_ointment",
        weight: 10,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 30,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 10,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 300,
      },
      {
        itemId: "item_food_canned_food",
        weight: 15,
      },
      {
        itemId: "item_model_*",
        weight: 6,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 10,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 5,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 5,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
      {
        itemId: "item_mat_chemical_materials",
        weight: 25,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 28,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {
      site: [
        "61",
        "301",
      ],
    },
    secretRoomsId: 4,
    def: 40,
  },
  "41": {
    id: 41,
    coordinate: {
      x: 320,
      y: 462,
    },
    battleRoom: 5,
    difficulty: [
      3,
      4,
    ],
    workRoom: 5,
    produceValue: 126,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 20,
      },
      {
        itemId: "item_mat_metal",
        weight: 15,
      },
      {
        itemId: "item_mat_fabric",
        weight: 0,
      },
      {
        itemId: "item_mat_parts",
        weight: 15,
      },
      {
        itemId: "item_mat_components",
        weight: 5,
      },
      {
        itemId: "item_mat_*",
        weight: 20,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 0,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 0,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 10,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 20,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {
      site: [
        "42",
      ],
    },
    def: 20,
  },
  "42": {
    id: 42,
    coordinate: {
      x: 120,
      y: 611,
    },
    battleRoom: 5,
    difficulty: [
      3,
      4,
    ],
    workRoom: 4,
    produceValue: 163,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 50,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_mat_data_module",
        weight: 30,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 0,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 0,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 16,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {},
    def: 20,
  },
  "43": {
    id: 43,
    coordinate: {
      x: 170,
      y: 497,
    },
    battleRoom: 12,
    difficulty: [
      4,
      6,
    ],
    workRoom: 2,
    produceValue: 72,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 30,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 5,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 0,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 0,
      },
      {
        itemId: "item_med_ointment",
        weight: 0,
      },
      {
        itemId: "item_med_penicillin",
        weight: 0,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 0,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 6,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {},
    secretRoomsId: 2,
    def: 30,
  },
  "51": {
    id: 51,
    coordinate: {
      x: 310,
      y: 649,
    },
    battleRoom: 14,
    difficulty: [
      4,
      6,
    ],
    workRoom: 10,
    produceValue: 546,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 20,
      },
      {
        itemId: "item_mat_metal",
        weight: 3,
      },
      {
        itemId: "item_mat_fabric",
        weight: 5,
      },
      {
        itemId: "item_mat_parts",
        weight: 5,
      },
      {
        itemId: "item_mat_components",
        weight: 5,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 1,
      },
      {
        itemId: "item_food_*",
        weight: 0,
      },
      {
        itemId: "item_med_bandage",
        weight: 10,
      },
      {
        itemId: "item_med_ointment",
        weight: 5,
      },
      {
        itemId: "item_med_penicillin",
        weight: 4,
      },
      {
        itemId: "item_econ_coffee",
        weight: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 0,
      },
      {
        itemId: "item_econ_*",
        weight: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 0,
      },
      {
        itemId: "item_food_canned_food",
        weight: 0,
      },
      {
        itemId: "item_model_*",
        weight: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 0,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 0,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 0,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 16,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {},
    def: 30,
  },
  "52": {
    id: 52,
    coordinate: {
      x: 130,
      y: 747,
    },
    battleRoom: 7,
    difficulty: [
      3,
      4,
    ],
    workRoom: 6,
    produceValue: 168,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 20,
      },
      {
        itemId: "item_mat_metal",
        weight: 5,
      },
      {
        itemId: "item_mat_fabric",
        weight: 5,
      },
      {
        itemId: "item_mat_parts",
        weight: 5,
      },
      {
        itemId: "item_mat_components",
        weight: 1,
      },
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 1,
      },
      {
        itemId: "item_food_*",
        weight: 5,
      },
      {
        itemId: "item_med_bandage",
        weight: 2,
      },
      {
        itemId: "item_med_ointment",
        weight: 2,
      },
      {
        itemId: "item_med_penicillin",
        weight: 2,
      },
      {
        itemId: "item_econ_coffee",
        weight: 5,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 2,
      },
      {
        itemId: "item_econ_*",
        weight: 5,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 30,
      },
      {
        itemId: "item_food_canned_food",
        weight: 5,
      },
      {
        itemId: "item_model_*",
        weight: 5,
      },
      {
        itemId: "item_weapon_gun_*",
        weight: 5,
      },
      {
        itemId: "item_econ_vodka",
        weight: 0,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 5,
      },
      {
        itemId: "item_special_dog",
        weight: 0,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 3,
      },
      {
        itemId: "item_mat_metal",
        num: 3,
      },
      {
        itemId: "item_mat_fabric",
        num: 3,
      },
      {
        itemId: "item_mat_parts",
        num: 3,
      },
      {
        itemId: "item_mat_components",
        num: 3,
      },
      {
        itemId: "item_mat_data_module",
        num: 12,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {},
    secretRoomsId: 1,
    def: 20,
  },
  "61": {
    id: 61,
    coordinate: {
      x: 458,
      y: 767,
    },
    difficulty: [],
    produceList: [],
    fixedProduceList: [],
    unlockValue: {},
    def: 20,
  },
  "100": {
    id: 100,
    coordinate: {
      x: 45,
      y: 50,
    },
    difficulty: [],
    produceList: [],
    fixedProduceList: [],
    unlockValue: {},
    def: 20,
  },
  "201": {
    id: 201,
    coordinate: {
      x: 108,
      y: 127,
    },
    battleRoom: 1,
    difficulty: [
      1,
      1,
    ],
    workRoom: 1,
    produceList: [],
    fixedProduceList: [
      {
        itemId: "item_mat_fabric",
        num: 7,
      },
      {
        itemId: "item_mat_parts",
        num: 2,
      },
      {
        itemId: "item_mat_metal",
        num: 2,
      },
      {
        itemId: "item_mat_water",
        num: 3,
      },
      {
        itemId: "item_food_canned_food",
        num: 1,
      },
    ],
    unlockValue: {
      site: [
        "1",
        "202",
      ],
    },
    def: 20,
  },
  "202": {
    id: 202,
    coordinate: {
      x: 130,
      y: 207,
    },
    difficulty: [],
    produceList: [],
    fixedProduceList: [],
    unlockValue: {},
    def: 20,
  },
  "203": {
    id: 203,
    coordinate: {
      x: 490,
      y: 107,
    },
    battleRoom: 9,
    difficulty: [
      1,
      3,
    ],
    workRoom: 4,
    produceValue: 240,
    produceList: [
      {
        itemId: "item_mat_*",
        weight: 10,
      },
      {
        itemId: "item_mat_chemical_materials",
        weight: 90,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_mat_chemical_materials",
        num: 0,
      },
    ],
    unlockValue: {},
    secretRoomsId: 2,
    def: 50,
  },
  "204": {
    id: 204,
    coordinate: {
      x: 410,
      y: 492,
    },
    battleRoom: 2,
    difficulty: [
      7,
      8,
    ],
    workRoom: 1,
    produceList: [],
    fixedProduceList: [
      {
        itemId: "item_mat_components",
        num: 4,
      },
      {
        itemId: "item_mat_parts",
        num: 6,
      },
      {
        itemId: "item_mat_metal",
        num: 4,
      },
      {
        itemId: "item_model_generator_component",
        num: 1,
      },
    ],
    unlockValue: {},
    secretRoomsId: 2,
    def: 40,
  },
  "301": {
    id: 301,
    coordinate: {
      x: 310,
      y: 51,
    },
    battleRoom: 2,
    difficulty: [
      8,
      9,
    ],
    workRoom: 1,
    produceValue: 68,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 5,
      },
      {
        itemId: "item_model_shotgun_part",
        weight: 5,
      },
      {
        itemId: "item_model_ak47_part",
        weight: 5,
      },
      {
        itemId: "item_model_katana_part",
        weight: 10,
      },
      {
        itemId: "item_food_potatoes",
        weight: 10,
      },
      {
        itemId: "item_food_meat",
        weight: 10,
      },
      {
        itemId: "item_food_canned_food",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 20,
      },
      {
        itemId: "item_med_ointment",
        weight: 20,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_vodka",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_crowbar",
        weight: 5,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 5,
      },
      {
        itemId: "item_mat_data_module",
        weight: 5,
      },
      {
        itemId: "item_mat_chemical_materials",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_metal",
        num: 3,
      },
      {
        itemId: "item_mat_wood",
        num: 4,
      },
      {
        itemId: "item_mat_data_module",
        num: 6,
      },
    ],
    unlockValue: {
      site: [
        "302",
      ],
    },
    secretRoomsId: 5,
    def: 60,
  },
  "302": {
    id: 302,
    coordinate: {
      x: 387,
      y: 174,
    },
    battleRoom: 3,
    difficulty: [
      8,
      10,
    ],
    workRoom: 2,
    produceValue: 98,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 5,
      },
      {
        itemId: "item_model_shotgun_part",
        weight: 5,
      },
      {
        itemId: "item_model_ak47_part",
        weight: 5,
      },
      {
        itemId: "item_model_katana_part",
        weight: 10,
      },
      {
        itemId: "item_food_potatoes",
        weight: 10,
      },
      {
        itemId: "item_food_meat",
        weight: 10,
      },
      {
        itemId: "item_food_canned_food",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 20,
      },
      {
        itemId: "item_med_ointment",
        weight: 20,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_vodka",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_crowbar",
        weight: 5,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 5,
      },
      {
        itemId: "item_mat_data_module",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_model_shotgun_part",
        num: 2,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 12,
      },
      {
        itemId: "item_mat_data_module",
        num: 4,
      },
    ],
    unlockValue: {
      site: [
        "303",
      ],
    },
    secretRoomsId: 5,
    def: 60,
  },
  "303": {
    id: 303,
    coordinate: {
      x: 208,
      y: 172,
    },
    battleRoom: 3,
    difficulty: [
      8,
      10,
    ],
    workRoom: 2,
    produceValue: 98,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 5,
      },
      {
        itemId: "item_model_shotgun_part",
        weight: 5,
      },
      {
        itemId: "item_model_ak47_part",
        weight: 5,
      },
      {
        itemId: "item_model_katana_part",
        weight: 10,
      },
      {
        itemId: "item_food_potatoes",
        weight: 10,
      },
      {
        itemId: "item_food_meat",
        weight: 10,
      },
      {
        itemId: "item_food_canned_food",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 20,
      },
      {
        itemId: "item_med_ointment",
        weight: 20,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_vodka",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_crowbar",
        weight: 5,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 5,
      },
      {
        itemId: "item_mat_data_module",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_food_potatoes",
        num: 4,
      },
      {
        itemId: "item_food_canned_food",
        num: 2,
      },
      {
        itemId: "item_mat_data_module",
        num: 2,
      },
      {
        itemId: "item_econ_vodka",
        num: 4,
      },
    ],
    unlockValue: {
      site: [
        "304",
      ],
    },
    secretRoomsId: 5,
    def: 60,
  },
  "304": {
    id: 304,
    coordinate: {
      x: 521,
      y: 201.5,
    },
    battleRoom: 3,
    difficulty: [
      9,
      10,
    ],
    workRoom: 2,
    produceValue: 98,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 5,
      },
      {
        itemId: "item_model_shotgun_part",
        weight: 5,
      },
      {
        itemId: "item_model_ak47_part",
        weight: 5,
      },
      {
        itemId: "item_model_katana_part",
        weight: 10,
      },
      {
        itemId: "item_food_potatoes",
        weight: 10,
      },
      {
        itemId: "item_food_meat",
        weight: 10,
      },
      {
        itemId: "item_food_canned_food",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 20,
      },
      {
        itemId: "item_med_ointment",
        weight: 20,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_vodka",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_crowbar",
        weight: 5,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 5,
      },
      {
        itemId: "item_mat_data_module",
        weight: 5,
      },
      {
        itemId: "item_mat_chemical_materials",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_food_potatoes",
        num: 4,
      },
      {
        itemId: "item_food_meat",
        num: 4,
      },
      {
        itemId: "item_mat_metal",
        num: 3,
      },
      {
        itemId: "item_mat_parts",
        num: 4,
      },
      {
        itemId: "item_mat_data_module",
        num: 3,
      },
    ],
    unlockValue: {
      site: [
        "305",
      ],
    },
    secretRoomsId: 5,
    def: 60,
  },
  "305": {
    id: 305,
    coordinate: {
      x: 494.5,
      y: 406,
    },
    battleRoom: 3,
    difficulty: [
      9,
      10,
    ],
    workRoom: 2,
    produceValue: 98,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 5,
      },
      {
        itemId: "item_model_shotgun_part",
        weight: 5,
      },
      {
        itemId: "item_model_ak47_part",
        weight: 5,
      },
      {
        itemId: "item_model_katana_part",
        weight: 10,
      },
      {
        itemId: "item_food_potatoes",
        weight: 10,
      },
      {
        itemId: "item_food_meat",
        weight: 10,
      },
      {
        itemId: "item_food_canned_food",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 20,
      },
      {
        itemId: "item_med_ointment",
        weight: 20,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_vodka",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_crowbar",
        weight: 5,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 5,
      },
      {
        itemId: "item_mat_data_module",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_metal",
        num: 2,
      },
      {
        itemId: "item_mat_fabric",
        num: 4,
      },
      {
        itemId: "item_mat_components",
        num: 2,
      },
      {
        itemId: "item_mat_data_module",
        num: 6,
      },
    ],
    unlockValue: {
      site: [
        "306",
      ],
    },
    secretRoomsId: 5,
    def: 60,
  },
  "306": {
    id: 306,
    coordinate: {
      x: 298,
      y: 312,
    },
    battleRoom: 4,
    difficulty: [
      9,
      11,
    ],
    workRoom: 2,
    produceValue: 98,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 5,
      },
      {
        itemId: "item_model_shotgun_part",
        weight: 5,
      },
      {
        itemId: "item_model_ak47_part",
        weight: 5,
      },
      {
        itemId: "item_model_katana_part",
        weight: 10,
      },
      {
        itemId: "item_food_potatoes",
        weight: 10,
      },
      {
        itemId: "item_food_meat",
        weight: 10,
      },
      {
        itemId: "item_food_canned_food",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 20,
      },
      {
        itemId: "item_med_ointment",
        weight: 20,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_vodka",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_crowbar",
        weight: 5,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 5,
      },
      {
        itemId: "item_mat_data_module",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_med_bandage",
        num: 4,
      },
      {
        itemId: "item_med_ointment",
        num: 4,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 16,
      },
      {
        itemId: "item_mat_data_module",
        num: 8,
      },
    ],
    unlockValue: {
      site: [
        "307",
      ],
    },
    secretRoomsId: 5,
    def: 60,
  },
  "307": {
    id: 307,
    coordinate: {
      x: 523,
      y: 668,
    },
    battleRoom: 4,
    difficulty: [
      9,
      11,
    ],
    workRoom: 2,
    produceValue: 98,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 5,
      },
      {
        itemId: "item_model_shotgun_part",
        weight: 5,
      },
      {
        itemId: "item_model_ak47_part",
        weight: 5,
      },
      {
        itemId: "item_model_katana_part",
        weight: 10,
      },
      {
        itemId: "item_food_potatoes",
        weight: 10,
      },
      {
        itemId: "item_food_meat",
        weight: 10,
      },
      {
        itemId: "item_food_canned_food",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 20,
      },
      {
        itemId: "item_med_ointment",
        weight: 20,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_vodka",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_crowbar",
        weight: 5,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 5,
      },
      {
        itemId: "item_mat_data_module",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_food_meat",
        num: 3,
      },
      {
        itemId: "item_food_potatoes",
        num: 4,
      },
      {
        itemId: "item_food_canned_food",
        num: 4,
      },
      {
        itemId: "item_econ_vodka",
        num: 2,
      },
      {
        itemId: "item_mat_data_module",
        num: 2,
      },
    ],
    unlockValue: {
      site: [
        "308",
      ],
    },
    secretRoomsId: 5,
    def: 60,
  },
  "308": {
    id: 308,
    coordinate: {
      x: 110,
      y: 720.5,
    },
    battleRoom: 4,
    difficulty: [
      10,
      11,
    ],
    workRoom: 2,
    produceValue: 98,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 5,
      },
      {
        itemId: "item_model_shotgun_part",
        weight: 5,
      },
      {
        itemId: "item_model_ak47_part",
        weight: 5,
      },
      {
        itemId: "item_model_katana_part",
        weight: 10,
      },
      {
        itemId: "item_food_potatoes",
        weight: 10,
      },
      {
        itemId: "item_food_meat",
        weight: 10,
      },
      {
        itemId: "item_food_canned_food",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 20,
      },
      {
        itemId: "item_med_ointment",
        weight: 20,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_vodka",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_crowbar",
        weight: 5,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 5,
      },
      {
        itemId: "item_mat_data_module",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_econ_coffee",
        num: 12,
      },
      {
        itemId: "item_econ_vodka",
        num: 4,
      },
      {
        itemId: "item_med_ointment",
        num: 4,
      },
      {
        itemId: "item_mat_data_module",
        num: 5,
      },
    ],
    unlockValue: {
      site: [
        "309",
      ],
    },
    secretRoomsId: 5,
    def: 60,
  },
  "309": {
    id: 309,
    coordinate: {
      x: 96,
      y: 439,
    },
    battleRoom: 4,
    difficulty: [
      10,
      11,
    ],
    workRoom: 2,
    produceValue: 98,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 5,
      },
      {
        itemId: "item_model_shotgun_part",
        weight: 5,
      },
      {
        itemId: "item_model_ak47_part",
        weight: 5,
      },
      {
        itemId: "item_model_katana_part",
        weight: 10,
      },
      {
        itemId: "item_food_potatoes",
        weight: 10,
      },
      {
        itemId: "item_food_meat",
        weight: 10,
      },
      {
        itemId: "item_food_canned_food",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 20,
      },
      {
        itemId: "item_med_ointment",
        weight: 20,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_vodka",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_crowbar",
        weight: 5,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 5,
      },
      {
        itemId: "item_mat_data_module",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_econ_vodka",
        num: 4,
      },
      {
        itemId: "item_med_ointment",
        num: 2,
      },
      {
        itemId: "item_mat_data_module",
        num: 5,
      },
    ],
    unlockValue: {
      site: [
        "310",
      ],
    },
    secretRoomsId: 5,
    def: 60,
  },
  "310": {
    id: 310,
    coordinate: {
      x: 92,
      y: 162,
    },
    battleRoom: 6,
    difficulty: [
      10,
      12,
    ],
    workRoom: 3,
    produceValue: 118,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 5,
      },
      {
        itemId: "item_model_shotgun_part",
        weight: 5,
      },
      {
        itemId: "item_model_ak47_part",
        weight: 5,
      },
      {
        itemId: "item_model_katana_part",
        weight: 10,
      },
      {
        itemId: "item_food_potatoes",
        weight: 10,
      },
      {
        itemId: "item_food_meat",
        weight: 10,
      },
      {
        itemId: "item_food_canned_food",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 20,
      },
      {
        itemId: "item_med_ointment",
        weight: 20,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_vodka",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_crowbar",
        weight: 5,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 5,
      },
      {
        itemId: "item_mat_data_module",
        weight: 5,
      },
      {
        itemId: "item_mat_chemical_materials",
        weight: 15,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_metal",
        num: 4,
      },
      {
        itemId: "item_mat_fabric",
        num: 3,
      },
      {
        itemId: "item_mat_parts",
        num: 5,
      },
      {
        itemId: "item_model_katana_part",
        num: 2,
      },
      {
        itemId: "item_mat_data_module",
        num: 4,
      },
    ],
    unlockValue: {
      site: [
        "311",
      ],
    },
    secretRoomsId: 5,
    def: 60,
  },
  "311": {
    id: 311,
    coordinate: {
      x: 298,
      y: 561,
    },
    battleRoom: 6,
    difficulty: [
      11,
      12,
    ],
    workRoom: 3,
    produceValue: 118,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 5,
      },
      {
        itemId: "item_model_shotgun_part",
        weight: 5,
      },
      {
        itemId: "item_model_ak47_part",
        weight: 5,
      },
      {
        itemId: "item_model_katana_part",
        weight: 10,
      },
      {
        itemId: "item_food_potatoes",
        weight: 10,
      },
      {
        itemId: "item_food_meat",
        weight: 10,
      },
      {
        itemId: "item_food_canned_food",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 20,
      },
      {
        itemId: "item_med_ointment",
        weight: 20,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_vodka",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_crowbar",
        weight: 5,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 5,
      },
      {
        itemId: "item_mat_data_module",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_ammo_standard_bullet",
        num: 12,
      },
      {
        itemId: "item_model_ak47_part",
        num: 2,
      },
      {
        itemId: "item_model_katana_part",
        num: 2,
      },
      {
        itemId: "item_mat_data_module",
        num: 4,
      },
      {
        itemId: "item_mat_data_module",
        num: 3,
      },
    ],
    unlockValue: {
      site: [
        "312",
      ],
    },
    secretRoomsId: 5,
    def: 60,
  },
  "312": {
    id: 312,
    coordinate: {
      x: 338.5,
      y: 775.5,
    },
    battleRoom: 12,
    difficulty: [
      11,
      12,
    ],
    workRoom: 5,
    produceValue: 150,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 10,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 5,
      },
      {
        itemId: "item_model_shotgun_part",
        weight: 5,
      },
      {
        itemId: "item_model_ak47_part",
        weight: 5,
      },
      {
        itemId: "item_model_katana_part",
        weight: 10,
      },
      {
        itemId: "item_food_potatoes",
        weight: 10,
      },
      {
        itemId: "item_food_meat",
        weight: 10,
      },
      {
        itemId: "item_food_canned_food",
        weight: 20,
      },
      {
        itemId: "item_med_bandage",
        weight: 20,
      },
      {
        itemId: "item_med_ointment",
        weight: 20,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_vodka",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_crowbar",
        weight: 5,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 5,
      },
      {
        itemId: "item_mat_data_module",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_ammo_standard_bullet",
        num: 12,
      },
      {
        itemId: "item_mat_data_module",
        num: 8,
      },
      {
        itemId: "item_food_canned_food",
        num: 4,
      },
      {
        itemId: "item_med_bandage",
        num: 2,
      },
      {
        itemId: "item_med_ointment",
        num: 2,
      },
    ],
    unlockValue: {
      site: [
        "666",
      ],
    },
    secretRoomsId: 5,
    def: 60,
  },
  "400": {
    id: 400,
    coordinate: {
      x: 140,
      y: 407,
    },
    difficulty: [],
    produceList: [],
    fixedProduceList: [],
    unlockValue: {},
    def: 50,
  },
  "500": {
    id: 500,
    coordinate: {
      x: 390,
      y: 420,
    },
    battleRoom: 13,
    difficulty: [
      1,
      3,
    ],
    workRoom: 10,
    produceValue: 320,
    produceList: [
      {
        itemId: "item_model_pistol_part",
        weight: 15,
      },
      {
        itemId: "item_model_shotgun_part",
        weight: 15,
      },
      {
        itemId: "item_model_ak47_part",
        weight: 15,
      },
      {
        itemId: "item_model_katana_part",
        weight: 10,
      },
      {
        itemId: "item_food_canned_food",
        weight: 10,
      },
      {
        itemId: "item_econ_vodka",
        weight: 10,
      },
      {
        itemId: "item_model_generator_component",
        weight: 5,
      },
      {
        itemId: "item_weapon_gun_shotgun",
        weight: 5,
      },
      {
        itemId: "item_weapon_gun_ak47",
        weight: 5,
      },
      {
        itemId: "item_weapon_gun_pistol",
        weight: 10,
      },
      {
        itemId: "item_weapon_gun_magnum",
        weight: 10,
      },
      {
        itemId: "item_weapon_gun_m40",
        weight: 5,
      },
      {
        itemId: "item_weapon_gun_famas",
        weight: 5,
      },
      {
        itemId: "item_weapon_gun_emp_handgun",
        weight: 10,
      },
      {
        itemId: "item_weapon_gun_emp_rifle",
        weight: 5,
      },
      {
        itemId: "item_weapon_melee_crowbar",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_axe",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_katana",
        weight: 5,
      },
      {
        itemId: "item_weapon_melee_chainsaw",
        weight: 5,
      },
      {
        itemId: "item_weapon_explosive_rocket_launcher",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 1,
      },
      {
        itemId: "item_mat_metal",
        num: 1,
      },
      {
        itemId: "item_mat_fabric",
        num: 1,
      },
      {
        itemId: "item_mat_parts",
        num: 1,
      },
      {
        itemId: "item_mat_components",
        num: 1,
      },
      {
        itemId: "item_mat_data_module",
        num: 1,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 4,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {},
    def: 40,
  },
  "501": {
    id: 501,
    coordinate: {
      x: 300,
      y: 560,
    },
    battleRoom: 8,
    difficulty: [
      4,
      7,
    ],
    workRoom: 7,
    produceValue: 179,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 30,
      },
      {
        itemId: "item_mat_metal",
        weight: 20,
      },
      {
        itemId: "item_mat_fabric",
        weight: 20,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_components",
        weight: 10,
      },
      {
        itemId: "item_med_bandage",
        weight: 5,
      },
      {
        itemId: "item_med_ointment",
        weight: 5,
      },
      {
        itemId: "item_econ_coffee",
        weight: 5,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 5,
      },
      {
        itemId: "item_food_canned_food",
        weight: 5,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 5,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 5,
      },
      {
        itemId: "item_mat_metal",
        num: 5,
      },
      {
        itemId: "item_mat_fabric",
        num: 5,
      },
      {
        itemId: "item_mat_parts",
        num: 5,
      },
      {
        itemId: "item_mat_components",
        num: 5,
      },
      {
        itemId: "item_mat_data_module",
        num: 6,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {},
    secretRoomsId: 3,
    def: 50,
  },
  "502": {
    id: 502,
    coordinate: {
      x: 400,
      y: 700,
    },
    battleRoom: 12,
    difficulty: [
      5,
      8,
    ],
    workRoom: 8,
    produceValue: 199,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 10,
      },
      {
        itemId: "item_mat_metal",
        weight: 10,
      },
      {
        itemId: "item_mat_fabric",
        weight: 20,
      },
      {
        itemId: "item_mat_parts",
        weight: 10,
      },
      {
        itemId: "item_mat_water",
        weight: 10,
      },
      {
        itemId: "item_mat_chemical_materials",
        weight: 20,
      },
      {
        itemId: "item_mat_data_module",
        weight: 10,
      },
      {
        itemId: "item_food_meat",
        weight: 20,
      },
      {
        itemId: "item_food_canned_food",
        weight: 10,
      },
      {
        itemId: "item_med_ointment",
        weight: 5,
      },
      {
        itemId: "item_econ_herbs",
        weight: 5,
      },
      {
        itemId: "item_weapon_melee_*",
        weight: 5,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_buff_experimental_antidote",
        num: 1,
      },
      {
        itemId: "item_buff_military_ration",
        num: 1,
      },
      {
        itemId: "item_buff_stimpack",
        num: 1,
      },
      {
        itemId: "item_buff_transmission_blocker",
        num: 1,
      },
      {
        itemId: "item_buff_protoplasm_serum",
        num: 1,
      },
      {
        itemId: "item_special_dog_bone",
        num: 2,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {},
    secretRoomsId: 3,
    def: 60,
  },
  "666": {
    id: 666,
    coordinate: {
      x: 185,
      y: 690,
    },
    battleRoom: 500,
    difficulty: [
      6,
      12,
    ],
    workRoom: 166,
    produceValue: 17123,
    produceList: [
      {
        itemId: "item_mat_wood",
        weight: 20,
      },
      {
        itemId: "item_mat_metal",
        weight: 20,
      },
      {
        itemId: "item_mat_fabric",
        weight: 20,
      },
      {
        itemId: "item_mat_parts",
        weight: 20,
      },
      {
        itemId: "item_mat_components",
        weight: 20,
      },
      {
        itemId: "item_mat_water",
        weight: 20,
      },
      {
        itemId: "item_mat_data_module",
        weight: 10,
      },
      {
        itemId: "item_model_pistol_part",
        weight: 5,
      },
      {
        itemId: "item_model_shotgun_part",
        weight: 5,
      },
      {
        itemId: "item_model_ak47_part",
        weight: 5,
      },
      {
        itemId: "item_model_katana_part",
        weight: 5,
      },
      {
        itemId: "item_model_motorcycle_engine",
        weight: 2,
      },
      {
        itemId: "item_model_generator_component",
        weight: 2,
      },
      {
        itemId: "item_food_potatoes",
        weight: 10,
      },
      {
        itemId: "item_food_roasted_potatoes",
        weight: 5,
      },
      {
        itemId: "item_food_mashed_potatoes",
        weight: 5,
      },
      {
        itemId: "item_food_meat",
        weight: 10,
      },
      {
        itemId: "item_food_broth",
        weight: 5,
      },
      {
        itemId: "item_food_barbecue",
        weight: 5,
      },
      {
        itemId: "item_food_flavored_stew",
        weight: 5,
      },
      {
        itemId: "item_food_canned_food",
        weight: 5,
      },
      {
        itemId: "item_food_cheese",
        weight: 5,
      },
      {
        itemId: "item_med_bandage",
        weight: 5,
      },
      {
        itemId: "item_med_ointment",
        weight: 5,
      },
      {
        itemId: "item_med_homemade_penicillin",
        weight: 2,
      },
      {
        itemId: "item_med_penicillin",
        weight: 2,
      },
      {
        itemId: "item_econ_coffee",
        weight: 10,
      },
      {
        itemId: "item_econ_vodka",
        weight: 5,
      },
      {
        itemId: "item_econ_alcohol",
        weight: 5,
      },
      {
        itemId: "item_econ_potato_buds",
        weight: 5,
      },
      {
        itemId: "item_econ_herbs",
        weight: 5,
      },
      {
        itemId: "item_special_first_aid_kit",
        weight: 1,
      },
      {
        itemId: "item_buff_protoplasm_serum",
        weight: 2,
      },
      {
        itemId: "item_buff_transmission_blocker",
        weight: 2,
      },
      {
        itemId: "item_buff_stimpack",
        weight: 2,
      },
      {
        itemId: "item_buff_military_ration",
        weight: 2,
      },
      {
        itemId: "item_buff_experimental_antidote",
        weight: 2,
      },
      {
        itemId: "item_weapon_gun_pistol",
        weight: 5,
      },
      {
        itemId: "item_weapon_gun_shotgun",
        weight: 5,
      },
      {
        itemId: "item_weapon_gun_ak47",
        weight: 5,
      },
      {
        itemId: "item_weapon_gun_magnum",
        weight: 5,
      },
      {
        itemId: "item_weapon_gun_m40",
        weight: 5,
      },
      {
        itemId: "item_weapon_gun_famas",
        weight: 5,
      },
      {
        itemId: "item_mat_chemical_materials",
        weight: 5,
      },
      {
        itemId: "item_weapon_gun_emp_rifle",
        weight: 5,
      },
      {
        itemId: "item_weapon_melee_crowbar",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_axe",
        weight: 10,
      },
      {
        itemId: "item_weapon_melee_katana",
        weight: 5,
      },
      {
        itemId: "item_weapon_melee_chainsaw",
        weight: 2,
      },
      {
        itemId: "item_weapon_explosive_explosive",
        weight: 5,
      },
      {
        itemId: "item_weapon_explosive_smoke_bomb",
        weight: 5,
      },
      {
        itemId: "item_weapon_explosive_rocket_launcher",
        weight: 5,
      },
      {
        itemId: "item_weapon_explosive_grenade",
        weight: 5,
      },
      {
        itemId: "item_armor_thick_coat",
        weight: 5,
      },
      {
        itemId: "item_armor_antiriot_suit",
        weight: 5,
      },
      {
        itemId: "item_ammo_standard_bullet",
        weight: 50,
      },
    ],
    fixedProduceList: [
      {
        itemId: "item_mat_wood",
        num: 1,
      },
      {
        itemId: "item_mat_metal",
        num: 0,
      },
      {
        itemId: "item_mat_fabric",
        num: 0,
      },
      {
        itemId: "item_mat_parts",
        num: 0,
      },
      {
        itemId: "item_mat_components",
        num: 0,
      },
      {
        itemId: "item_mat_data_module",
        num: 0,
      },
      {
        itemId: "item_mat_*",
        num: 0,
      },
      {
        itemId: "item_model_pistol_part",
        num: 0,
      },
      {
        itemId: "item_food_*",
        num: 0,
      },
      {
        itemId: "item_med_bandage",
        num: 0,
      },
      {
        itemId: "item_med_ointment",
        num: 0,
      },
      {
        itemId: "item_med_penicillin",
        num: 0,
      },
      {
        itemId: "item_econ_coffee",
        num: 0,
      },
      {
        itemId: "item_econ_potato_buds",
        num: 0,
      },
      {
        itemId: "item_econ_*",
        num: 0,
      },
      {
        itemId: "item_ammo_standard_bullet",
        num: 0,
      },
      {
        itemId: "item_food_canned_food",
        num: 0,
      },
      {
        itemId: "item_model_*",
        num: 0,
      },
      {
        itemId: "item_weapon_gun_*",
        num: 0,
      },
      {
        itemId: "item_econ_vodka",
        num: 0,
      },
      {
        itemId: "item_econ_alcohol",
        num: 0,
      },
      {
        itemId: "item_weapon_melee_*",
        num: 0,
      },
      {
        itemId: "item_special_dog",
        num: 0,
      },
    ],
    unlockValue: {},
    secretRoomsId: 6,
    def: 50,
  },
}
