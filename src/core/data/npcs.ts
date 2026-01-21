/**
 * NPC Configuration Data
 * Ported from OriginalGame/src/data/npcConfig.js
 * 
 * This file contains static configuration for all NPCs including:
 * - Favorite items (price multipliers at different reputation levels)
 * - Trading items (items NPCs sell)
 * - Need items (items NPCs need from player)
 * - Gift items (items NPCs give to player)
 * - Map coordinates
 */

import type { NPCGiftConfig, NPCConfigMap } from '@/common/types/npc.types'

/**
 * NPC Gift Configuration
 * Used for random gifts when NPCs visit player
 */
export const npcGiftConfig: NPCGiftConfig = {
  produceValue: 4,
  produceList: [
    { itemId: "1101**", weight: 120 },
    { itemId: "1103*1", weight: 50 },
    { itemId: "1104*1", weight: 10 },
    { itemId: "item_econ_coffee", weight: 10 },
    { itemId: "item_econ_vodka", weight: 10 },
    { itemId: "1302*1", weight: 10 }
  ]
}

/**
 * NPC Configuration Map
 * Contains configuration for all 7 NPCs
 * 
 * Structure:
 * - favorite: Array of 11 arrays (reputation 0-10), each containing favorite items with price multipliers
 * - trading: Array of 11 arrays (reputation 0-10), each containing items NPC sells (can be null)
 * - needItem: Array of 11 items (reputation 0-10), items NPC needs from player (can be null)
 * - gift: Array of 11 gifts (reputation 0-10), gifts NPC gives (can be null)
 * - gift_extra: Array of 11 extra gifts (reputation 0-10), for Social talent (can be null)
 * - coordinate: Map position {x, y}
 */
export const npcConfig: NPCConfigMap = {
  "1": {
    id: 1,
    favorite: [
      [{ itemId: "item_econ_vodka", price: 1.2 }, { itemId: "item_econ_alcohol", price: 1.2 }, { itemId: "item_ammo_standard_bullet", price: 1.5 }, { itemId: "item_ammo_handmade_bullet", price: 1.5 }],
      [{ itemId: "item_econ_vodka", price: 1.2 }, { itemId: "item_econ_alcohol", price: 1.2 }, { itemId: "item_ammo_standard_bullet", price: 1.5 }, { itemId: "item_ammo_handmade_bullet", price: 1.5 }],
      [{ itemId: "item_econ_vodka", price: 1.2 }, { itemId: "item_econ_alcohol", price: 1.2 }, { itemId: "item_ammo_standard_bullet", price: 1.4 }, { itemId: "item_ammo_handmade_bullet", price: 1.4 }],
      [{ itemId: "item_econ_vodka", price: 1.2 }, { itemId: "item_econ_alcohol", price: 1.2 }, { itemId: "item_ammo_standard_bullet", price: 1.4 }, { itemId: "item_ammo_handmade_bullet", price: 1.4 }],
      [{ itemId: "item_econ_vodka", price: 1.2 }, { itemId: "item_econ_alcohol", price: 1.2 }, { itemId: "item_ammo_standard_bullet", price: 1.4 }, { itemId: "item_ammo_handmade_bullet", price: 1.4 }],
      [{ itemId: "item_econ_vodka", price: 1.2 }, { itemId: "item_econ_alcohol", price: 1.2 }, { itemId: "item_ammo_standard_bullet", price: 1.3 }, { itemId: "item_ammo_handmade_bullet", price: 1.3 }],
      [{ itemId: "item_econ_vodka", price: 1.2 }, { itemId: "item_econ_alcohol", price: 1.2 }, { itemId: "item_ammo_standard_bullet", price: 1.3 }, { itemId: "item_ammo_handmade_bullet", price: 1.3 }],
      [{ itemId: "item_econ_vodka", price: 1.2 }, { itemId: "item_econ_alcohol", price: 1.2 }, { itemId: "item_ammo_standard_bullet", price: 1.3 }, { itemId: "item_ammo_handmade_bullet", price: 1.3 }],
      [{ itemId: "item_econ_vodka", price: 1.2 }, { itemId: "item_econ_alcohol", price: 1.2 }, { itemId: "item_ammo_standard_bullet", price: 1.2 }, { itemId: "item_ammo_handmade_bullet", price: 1.2 }],
      [{ itemId: "item_econ_vodka", price: 1.2 }, { itemId: "item_econ_alcohol", price: 1.2 }, { itemId: "item_ammo_standard_bullet", price: 1.2 }, { itemId: "item_ammo_handmade_bullet", price: 1.2 }],
      [{ itemId: "item_econ_vodka", price: 1.2 }, { itemId: "item_econ_alcohol", price: 1.2 }, { itemId: "item_ammo_standard_bullet", price: 1.2 }, { itemId: "item_ammo_handmade_bullet", price: 1.2 }]
    ],
    trading: [
      [{ itemId: "item_ammo_standard_bullet", num: 3 }],
      [{ itemId: "item_ammo_standard_bullet", num: 2 }],
      [{ itemId: "item_weapon_explosive_rocket_launcher", num: 2 }],
      [{ itemId: "item_ammo_standard_bullet", num: 2 }],
      [{ itemId: "item_ammo_standard_bullet", num: 2 }],
      [{ itemId: "item_ammo_standard_bullet", num: 2 }],
      [{ itemId: "item_weapon_explosive_rocket_launcher", num: 2 }],
      [{ itemId: "item_ammo_standard_bullet", num: 2 }, { itemId: "item_ammo_standard_bullet", num: 1 }],
      [{ itemId: "item_ammo_standard_bullet", num: 2 }],
      [{ itemId: "item_ammo_standard_bullet", num: 2 }],
      [{ itemId: "item_ammo_standard_bullet", num: 2 }, { itemId: "item_weapon_explosive_rocket_launcher", num: 2 }]
    ],
    needItem: [
      { itemId: "item_econ_vodka", num: 1 },
      { itemId: "item_econ_vodka", num: 1 },
      { itemId: "item_econ_vodka", num: 1 },
      { itemId: "item_econ_vodka", num: 2 },
      { itemId: "item_econ_vodka", num: 2 },
      { itemId: "item_econ_vodka", num: 2 },
      { itemId: "item_econ_vodka", num: 3 },
      { itemId: "item_econ_vodka", num: 3 },
      { itemId: "item_econ_vodka", num: 3 },
      { itemId: "item_econ_vodka", num: 4 },
      null
    ],
    gift: [
      null,
      { itemId: "item_ammo_handmade_bullet", num: "30" },
      null,
      { siteId: "203" },
      null,
      { itemId: "item_weapon_explosive_smoke_bomb", num: "2" },
      null,
      { itemId: "item_weapon_explosive_explosive", num: "2" },
      null,
      { itemId: "item_ammo_handmade_bullet", num: "80" },
      { siteId: "20" }
    ],
    gift_extra: [
      null,
      null,
      { itemId: "item_ammo_handmade_bullet", num: "10" },
      null,
      null,
      null,
      { itemId: "item_weapon_explosive_smoke_bomb", num: "1" },
      null,
      { itemId: "item_weapon_explosive_explosive", num: "1" },
      null,
      { itemId: "item_ammo_handmade_bullet", num: "25" }
    ],
    coordinate: { x: 386, y: 211 }
  },
  "2": {
    id: 2,
    favorite: [
      [{ itemId: "item_food_potatoes", price: 1.2 }, { itemId: "item_food_roasted_potatoes", price: 1.2 }, { itemId: "item_food_mashed_potatoes", price: 1.2 }, { itemId: "item_food_meat", price: 1.2 }, { itemId: "item_food_broth", price: 1.2 }, { itemId: "item_food_barbecue", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.2 }, { itemId: "item_food_canned_food", price: 1.2 }, { itemId: "item_med_bandage", price: 1.5 }, { itemId: "item_med_ointment", price: 1.5 }, { itemId: "item_med_penicillin", price: 1.5 }],
      [{ itemId: "item_food_potatoes", price: 1.2 }, { itemId: "item_food_roasted_potatoes", price: 1.2 }, { itemId: "item_food_mashed_potatoes", price: 1.2 }, { itemId: "item_food_meat", price: 1.2 }, { itemId: "item_food_broth", price: 1.2 }, { itemId: "item_food_barbecue", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.2 }, { itemId: "item_food_canned_food", price: 1.2 }, { itemId: "item_med_bandage", price: 1.5 }, { itemId: "item_med_ointment", price: 1.5 }, { itemId: "item_med_penicillin", price: 1.5 }],
      [{ itemId: "item_food_potatoes", price: 1.2 }, { itemId: "item_food_roasted_potatoes", price: 1.2 }, { itemId: "item_food_mashed_potatoes", price: 1.2 }, { itemId: "item_food_meat", price: 1.2 }, { itemId: "item_food_broth", price: 1.2 }, { itemId: "item_food_barbecue", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.2 }, { itemId: "item_food_canned_food", price: 1.2 }, { itemId: "item_med_bandage", price: 1.4 }, { itemId: "item_med_ointment", price: 1.4 }, { itemId: "item_med_penicillin", price: 1.4 }],
      [{ itemId: "item_food_potatoes", price: 1.2 }, { itemId: "item_food_roasted_potatoes", price: 1.2 }, { itemId: "item_food_mashed_potatoes", price: 1.2 }, { itemId: "item_food_meat", price: 1.2 }, { itemId: "item_food_broth", price: 1.2 }, { itemId: "item_food_barbecue", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.2 }, { itemId: "item_food_canned_food", price: 1.2 }, { itemId: "item_med_bandage", price: 1.4 }, { itemId: "item_med_ointment", price: 1.4 }, { itemId: "item_med_penicillin", price: 1.4 }],
      [{ itemId: "item_food_potatoes", price: 1.2 }, { itemId: "item_food_roasted_potatoes", price: 1.2 }, { itemId: "item_food_mashed_potatoes", price: 1.2 }, { itemId: "item_food_meat", price: 1.2 }, { itemId: "item_food_broth", price: 1.2 }, { itemId: "item_food_barbecue", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.2 }, { itemId: "item_food_canned_food", price: 1.2 }, { itemId: "item_med_bandage", price: 1.4 }, { itemId: "item_med_ointment", price: 1.4 }, { itemId: "item_med_penicillin", price: 1.4 }],
      [{ itemId: "item_food_potatoes", price: 1.2 }, { itemId: "item_food_roasted_potatoes", price: 1.2 }, { itemId: "item_food_mashed_potatoes", price: 1.2 }, { itemId: "item_food_meat", price: 1.2 }, { itemId: "item_food_broth", price: 1.2 }, { itemId: "item_food_barbecue", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.2 }, { itemId: "item_food_canned_food", price: 1.2 }, { itemId: "item_med_bandage", price: 1.3 }, { itemId: "item_med_ointment", price: 1.3 }, { itemId: "item_med_penicillin", price: 1.3 }],
      [{ itemId: "item_food_potatoes", price: 1.2 }, { itemId: "item_food_roasted_potatoes", price: 1.2 }, { itemId: "item_food_mashed_potatoes", price: 1.2 }, { itemId: "item_food_meat", price: 1.2 }, { itemId: "item_food_broth", price: 1.2 }, { itemId: "item_food_barbecue", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.2 }, { itemId: "item_food_canned_food", price: 1.2 }, { itemId: "item_med_bandage", price: 1.3 }, { itemId: "item_med_ointment", price: 1.3 }, { itemId: "item_med_penicillin", price: 1.3 }],
      [{ itemId: "item_food_potatoes", price: 1.2 }, { itemId: "item_food_roasted_potatoes", price: 1.2 }, { itemId: "item_food_mashed_potatoes", price: 1.2 }, { itemId: "item_food_meat", price: 1.2 }, { itemId: "item_food_broth", price: 1.2 }, { itemId: "item_food_barbecue", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.2 }, { itemId: "item_food_canned_food", price: 1.2 }, { itemId: "item_med_bandage", price: 1.3 }, { itemId: "item_med_ointment", price: 1.3 }, { itemId: "item_med_penicillin", price: 1.3 }],
      [{ itemId: "item_food_potatoes", price: 1.2 }, { itemId: "item_food_roasted_potatoes", price: 1.2 }, { itemId: "item_food_mashed_potatoes", price: 1.2 }, { itemId: "item_food_meat", price: 1.2 }, { itemId: "item_food_broth", price: 1.2 }, { itemId: "item_food_barbecue", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.2 }, { itemId: "item_food_canned_food", price: 1.2 }, { itemId: "item_med_bandage", price: 1.2 }, { itemId: "item_med_ointment", price: 1.2 }, { itemId: "item_med_penicillin", price: 1.2 }],
      [{ itemId: "item_food_potatoes", price: 1.2 }, { itemId: "item_food_roasted_potatoes", price: 1.2 }, { itemId: "item_food_mashed_potatoes", price: 1.2 }, { itemId: "item_food_meat", price: 1.2 }, { itemId: "item_food_broth", price: 1.2 }, { itemId: "item_food_barbecue", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.2 }, { itemId: "item_food_canned_food", price: 1.2 }, { itemId: "item_med_bandage", price: 1.2 }, { itemId: "item_med_ointment", price: 1.2 }, { itemId: "item_med_penicillin", price: 1.2 }],
      [{ itemId: "item_food_potatoes", price: 1.2 }, { itemId: "item_food_roasted_potatoes", price: 1.2 }, { itemId: "item_food_mashed_potatoes", price: 1.2 }, { itemId: "item_food_meat", price: 1.2 }, { itemId: "item_food_broth", price: 1.2 }, { itemId: "item_food_barbecue", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.2 }, { itemId: "item_food_canned_food", price: 1.2 }, { itemId: "item_med_bandage", price: 1 }, { itemId: "item_med_ointment", price: 1 }, { itemId: "item_med_penicillin", price: 1 }]
    ],
    trading: [
      [{ itemId: "item_med_ointment", num: 1 }],
      null,
      [{ itemId: "item_med_bandage", num: 1 }],
      null,
      [{ itemId: "item_med_ointment", num: 1 }],
      [{ itemId: "item_med_penicillin", num: 1 }],
      [{ itemId: "item_med_bandage", num: 1 }],
      null,
      [{ itemId: "item_med_bandage", num: 1 }],
      [{ itemId: "item_buff_experimental_antidote", num: 1 }],
      null
    ],
    needItem: [
      { itemId: "item_food_potatoes", num: 2 },
      { itemId: "item_food_potatoes", num: 2 },
      { itemId: "item_food_potatoes", num: 1 },
      { itemId: "item_food_mashed_potatoes", num: 1 },
      { itemId: "item_food_mashed_potatoes", num: 1 },
      { itemId: "item_food_mashed_potatoes", num: 1 },
      { itemId: "item_food_broth", num: 1 },
      { itemId: "item_food_broth", num: 1 },
      { itemId: "item_food_broth", num: 1 },
      { itemId: "item_food_flavored_stew", num: 1 },
      null
    ],
    gift: [
      null,
      null,
      { itemId: "item_med_bandage", num: "3" },
      null,
      { siteId: "51" },
      null,
      { itemId: "item_med_penicillin", num: "2" },
      null,
      { siteId: "52" },
      null,
      { itemId: "item_special_first_aid_kit", num: "1" }
    ],
    gift_extra: [
      null,
      null,
      null,
      { itemId: "item_med_bandage", num: "1" },
      null,
      null,
      null,
      { itemId: "item_med_penicillin", num: "1" },
      null,
      { itemId: "item_special_first_aid_kit", num: "1" },
      null
    ],
    coordinate: { x: 380, y: 326 }
  },
  "3": {
    id: 3,
    favorite: [
      [{ itemId: "item_weapon_melee_crowbar", price: 1.2 }, { itemId: "item_weapon_melee_axe", price: 1.2 }, { itemId: "item_weapon_melee_chainsaw", price: 1.2 }, { itemId: "item_mat_wood", price: 1.5 }, { itemId: "item_mat_fabric", price: 1.5 }],
      [{ itemId: "item_weapon_melee_crowbar", price: 1.2 }, { itemId: "item_weapon_melee_axe", price: 1.2 }, { itemId: "item_weapon_melee_chainsaw", price: 1.2 }, { itemId: "item_mat_wood", price: 1.5 }, { itemId: "item_mat_fabric", price: 1.5 }],
      [{ itemId: "item_weapon_melee_crowbar", price: 1.2 }, { itemId: "item_weapon_melee_axe", price: 1.2 }, { itemId: "item_weapon_melee_chainsaw", price: 1.2 }, { itemId: "item_mat_wood", price: 1.4 }, { itemId: "item_mat_fabric", price: 1.4 }],
      [{ itemId: "item_weapon_melee_crowbar", price: 1.2 }, { itemId: "item_weapon_melee_axe", price: 1.2 }, { itemId: "item_weapon_melee_chainsaw", price: 1.2 }, { itemId: "item_mat_wood", price: 1.4 }, { itemId: "item_mat_fabric", price: 1.4 }],
      [{ itemId: "item_weapon_melee_crowbar", price: 1.2 }, { itemId: "item_weapon_melee_axe", price: 1.2 }, { itemId: "item_weapon_melee_chainsaw", price: 1.2 }, { itemId: "item_mat_wood", price: 1.4 }, { itemId: "item_mat_fabric", price: 1.4 }],
      [{ itemId: "item_weapon_melee_crowbar", price: 1.2 }, { itemId: "item_weapon_melee_axe", price: 1.2 }, { itemId: "item_weapon_melee_chainsaw", price: 1.2 }, { itemId: "item_mat_wood", price: 1.3 }, { itemId: "item_mat_fabric", price: 1.3 }],
      [{ itemId: "item_weapon_melee_crowbar", price: 1.2 }, { itemId: "item_weapon_melee_axe", price: 1.2 }, { itemId: "item_weapon_melee_chainsaw", price: 1.2 }, { itemId: "item_mat_wood", price: 1.3 }, { itemId: "item_mat_fabric", price: 1.3 }],
      [{ itemId: "item_weapon_melee_crowbar", price: 1.2 }, { itemId: "item_weapon_melee_axe", price: 1.2 }, { itemId: "item_weapon_melee_chainsaw", price: 1.2 }, { itemId: "item_mat_wood", price: 1.3 }, { itemId: "item_mat_fabric", price: 1.3 }],
      [{ itemId: "item_weapon_melee_crowbar", price: 1.2 }, { itemId: "item_weapon_melee_axe", price: 1.2 }, { itemId: "item_weapon_melee_chainsaw", price: 1.2 }, { itemId: "item_mat_wood", price: 1.2 }, { itemId: "item_mat_fabric", price: 1.2 }],
      [{ itemId: "item_weapon_melee_crowbar", price: 1.2 }, { itemId: "item_weapon_melee_axe", price: 1.2 }, { itemId: "item_weapon_melee_chainsaw", price: 1.2 }, { itemId: "item_mat_wood", price: 1.2 }, { itemId: "item_mat_fabric", price: 1.2 }],
      [{ itemId: "item_weapon_melee_crowbar", price: 1.2 }, { itemId: "item_weapon_melee_axe", price: 1.2 }, { itemId: "item_weapon_melee_chainsaw", price: 1.2 }, { itemId: "item_mat_wood", price: 1 }, { itemId: "item_mat_fabric", price: 1 }]
    ],
    trading: [
      [{ itemId: "item_mat_wood", num: 10 }, { itemId: "item_mat_fabric", num: 5 }],
      [{ itemId: "item_mat_wood", num: 2 }],
      [{ itemId: "item_mat_wood", num: 2 }, { itemId: "item_mat_fabric", num: 1 }],
      [{ itemId: "item_mat_wood", num: 2 }],
      [{ itemId: "item_mat_wood", num: 2 }, { itemId: "item_mat_fabric", num: 1 }],
      [{ itemId: "item_mat_wood", num: 2 }],
      [{ itemId: "item_mat_wood", num: 2 }, { itemId: "item_mat_fabric", num: 1 }],
      [{ itemId: "item_mat_wood", num: 2 }],
      [{ itemId: "item_mat_wood", num: 2 }, { itemId: "item_mat_fabric", num: 1 }],
      [{ itemId: "item_mat_wood", num: 2 }],
      [{ itemId: "item_mat_wood", num: 2 }, { itemId: "item_mat_fabric", num: 1 }]
    ],
    needItem: [
      { itemId: "item_weapon_melee_axe", num: 1 },
      { itemId: "item_weapon_melee_axe", num: 1 },
      { itemId: "item_weapon_melee_axe", num: 1 },
      { itemId: "item_weapon_melee_axe", num: 1 },
      { itemId: "item_weapon_melee_axe", num: 1 },
      { itemId: "item_weapon_melee_axe", num: 1 },
      { itemId: "item_weapon_melee_axe", num: 1 },
      { itemId: "item_weapon_melee_axe", num: 1 },
      { itemId: "item_weapon_melee_axe", num: 1 },
      { itemId: "item_weapon_melee_chainsaw", num: 1 },
      null
    ],
    gift: [
      null,
      null,
      { itemId: "item_mat_wood", num: "10" },
      null,
      { siteId: "30" },
      null,
      { itemId: "item_mat_fabric", num: "5" },
      null,
      { itemId: "item_mat_wood", num: "20" },
      null,
      { siteId: "32" }
    ],
    gift_extra: [
      null,
      { itemId: "item_mat_wood", num: "3" },
      null,
      null,
      null,
      null,
      null,
      { itemId: "item_mat_fabric", num: "2" },
      null,
      { itemId: "item_mat_wood", num: "6" },
      null
    ],
    coordinate: { x: 246, y: 474 }
  },
  "4": {
    id: 4,
    favorite: [
      [{ itemId: "item_econ_coffee", price: 1.2 }, { itemId: "item_mat_metal", price: 1.5 }, { itemId: "item_mat_parts", price: 1.5 }, { itemId: "item_mat_components", price: 1.5 }, { itemId: "item_weapon_melee_chainsaw", price: 1.5 }],
      [{ itemId: "item_econ_coffee", price: 1.2 }, { itemId: "item_mat_metal", price: 1.5 }, { itemId: "item_mat_parts", price: 1.5 }, { itemId: "item_mat_components", price: 1.5 }, { itemId: "item_weapon_melee_chainsaw", price: 1.5 }],
      [{ itemId: "item_econ_coffee", price: 1.2 }, { itemId: "item_mat_metal", price: 1.4 }, { itemId: "item_mat_parts", price: 1.4 }, { itemId: "item_mat_components", price: 1.4 }, { itemId: "item_weapon_melee_chainsaw", price: 1.4 }],
      [{ itemId: "item_econ_coffee", price: 1.2 }, { itemId: "item_mat_metal", price: 1.4 }, { itemId: "item_mat_parts", price: 1.4 }, { itemId: "item_mat_components", price: 1.4 }, { itemId: "item_weapon_melee_chainsaw", price: 1.4 }],
      [{ itemId: "item_econ_coffee", price: 1.2 }, { itemId: "item_mat_metal", price: 1.4 }, { itemId: "item_mat_parts", price: 1.4 }, { itemId: "item_mat_components", price: 1.4 }, { itemId: "item_weapon_melee_chainsaw", price: 1.4 }],
      [{ itemId: "item_econ_coffee", price: 1.2 }, { itemId: "item_mat_metal", price: 1.3 }, { itemId: "item_mat_parts", price: 1.3 }, { itemId: "item_mat_components", price: 1.3 }, { itemId: "item_weapon_melee_chainsaw", price: 1.3 }],
      [{ itemId: "item_econ_coffee", price: 1.2 }, { itemId: "item_mat_metal", price: 1.3 }, { itemId: "item_mat_parts", price: 1.3 }, { itemId: "item_mat_components", price: 1.3 }, { itemId: "item_weapon_melee_chainsaw", price: 1.3 }],
      [{ itemId: "item_econ_coffee", price: 1.2 }, { itemId: "item_mat_metal", price: 1.3 }, { itemId: "item_mat_parts", price: 1.3 }, { itemId: "item_mat_components", price: 1.3 }, { itemId: "item_weapon_melee_chainsaw", price: 1.3 }],
      [{ itemId: "item_econ_coffee", price: 1.2 }, { itemId: "item_mat_metal", price: 1.2 }, { itemId: "item_mat_parts", price: 1.2 }, { itemId: "item_mat_components", price: 1.2 }, { itemId: "item_weapon_melee_chainsaw", price: 1.2 }],
      [{ itemId: "item_econ_coffee", price: 1.2 }, { itemId: "item_mat_metal", price: 1.2 }, { itemId: "item_mat_parts", price: 1.2 }, { itemId: "item_mat_components", price: 1.2 }, { itemId: "item_weapon_melee_chainsaw", price: 1.2 }],
      [{ itemId: "item_econ_coffee", price: 1.2 }, { itemId: "item_mat_metal", price: 1 }, { itemId: "item_mat_parts", price: 1 }, { itemId: "item_mat_components", price: 1 }, { itemId: "item_weapon_melee_chainsaw", price: 1 }]
    ],
    trading: [
      [{ itemId: "item_mat_metal", num: 6 }],
      [{ itemId: "item_mat_metal", num: 1 }],
      [{ itemId: "item_mat_metal", num: 1 }],
      [{ itemId: "item_mat_metal", num: 1 }, { itemId: "item_mat_parts", num: 3 }],
      [{ itemId: "item_mat_metal", num: 1 }],
      [{ itemId: "item_mat_metal", num: 1 }],
      [{ itemId: "item_mat_metal", num: 1 }, { itemId: "item_mat_components", num: 3 }],
      [{ itemId: "item_mat_metal", num: 1 }],
      [{ itemId: "item_mat_metal", num: 1 }, { itemId: "item_weapon_melee_chainsaw", num: 1 }],
      [{ itemId: "item_mat_metal", num: 1 }],
      [{ itemId: "item_mat_metal", num: 1 }]
    ],
    needItem: [
      { itemId: "item_econ_coffee", num: 4 },
      { itemId: "item_econ_coffee", num: 4 },
      { itemId: "item_econ_coffee", num: 4 },
      { itemId: "item_econ_coffee", num: 4 },
      { itemId: "item_econ_coffee", num: 4 },
      { itemId: "item_econ_coffee", num: 4 },
      { itemId: "item_econ_coffee", num: 4 },
      { itemId: "item_econ_coffee", num: 4 },
      { itemId: "item_econ_coffee", num: 4 },
      { itemId: "item_econ_coffee", num: 4 },
      null
    ],
    gift: [
      null,
      { itemId: "item_mat_parts", num: "3" },
      { itemId: "item_model_katana_part", num: "2" },
      null,
      { siteId: "43" },
      null,
      { itemId: "item_mat_components", num: "3" },
      { siteId: "41" },
      null,
      { itemId: "item_weapon_melee_chainsaw", num: "1" }
    ],
    gift_extra: [
      null,
      null,
      { itemId: "item_mat_parts", num: "1" },
      { itemId: "item_model_katana_part", num: "1" },
      null,
      null,
      null,
      { itemId: "item_mat_components", num: "1" },
      null,
      { itemId: "item_weapon_melee_chainsaw", num: "1" },
      null
    ],
    coordinate: { x: 483, y: 371 }
  },
  "5": {
    id: 5,
    favorite: [
      [{ itemId: "item_mat_data_module", price: 1.2 }],
      [{ itemId: "item_mat_data_module", price: 1.2 }],
      [{ itemId: "item_mat_data_module", price: 1.2 }],
      [{ itemId: "item_mat_data_module", price: 1.2 }],
      [{ itemId: "item_mat_data_module", price: 1.2 }],
      [{ itemId: "item_mat_data_module", price: 1.2 }],
      [{ itemId: "item_mat_data_module", price: 1.2 }],
      [{ itemId: "item_mat_data_module", price: 1.2 }],
      [{ itemId: "item_mat_data_module", price: 1.2 }],
      [{ itemId: "item_mat_data_module", price: 1.2 }],
      [{ itemId: "item_mat_data_module", price: 1.2 }]
    ],
    trading: [
      [{ itemId: "item_buff_protoplasm_serum", num: 1 }],
      null,
      [{ itemId: "item_buff_transmission_blocker", num: 1 }],
      null,
      [{ itemId: "item_buff_stimpack", num: 1 }],
      null,
      [{ itemId: "item_buff_military_ration", num: 1 }],
      null,
      null,
      [{ itemId: "item_weapon_explosive_grenade", num: 1 }],
      [{ itemId: "item_weapon_explosive_grenade", num: 1 }]
    ],
    needItem: [
      { itemId: "item_mat_data_module", num: 4 },
      { itemId: "item_mat_data_module", num: 4 },
      { itemId: "item_mat_data_module", num: 6 },
      { itemId: "item_mat_data_module", num: 6 },
      { itemId: "item_mat_data_module", num: 8 },
      { itemId: "item_mat_data_module", num: 8 },
      { itemId: "item_mat_data_module", num: 8 },
      { itemId: "item_mat_data_module", num: 10 },
      { itemId: "item_mat_data_module", num: 10 },
      { itemId: "item_mat_data_module", num: 16 },
      { itemId: "item_mat_data_module", num: 22 }
    ],
    gift: [
      null,
      { itemId: "item_buff_protoplasm_serum", num: "1" },
      null,
      null,
      null,
      { itemId: "item_buff_transmission_blocker", num: "1" },
      null,
      null,
      { itemId: "item_buff_stimpack", num: "1" },
      null,
      { itemId: "item_model_motorcycle_engine", num: "1" }
    ],
    gift_extra: [
      null,
      null,
      null,
      { itemId: "item_weapon_explosive_grenade", num: "1" },
      null,
      null,
      null,
      { itemId: "item_weapon_explosive_grenade", num: "1" },
      null,
      null,
      null
    ],
    coordinate: { x: 246, y: 730 }
  },
  "6": {
    id: 6,
    favorite: [
      [{ itemId: "item_ammo_standard_bullet", price: 1.2 }, { itemId: "item_ammo_handmade_bullet", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.5 }, { itemId: "item_econ_vodka", price: 1.5 }],
      [{ itemId: "item_ammo_standard_bullet", price: 1.2 }, { itemId: "item_ammo_handmade_bullet", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.5 }, { itemId: "item_econ_vodka", price: 1.5 }],
      [{ itemId: "item_ammo_standard_bullet", price: 1.2 }, { itemId: "item_ammo_handmade_bullet", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.4 }, { itemId: "item_econ_vodka", price: 1.4 }],
      [{ itemId: "item_ammo_standard_bullet", price: 1.2 }, { itemId: "item_ammo_handmade_bullet", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.4 }, { itemId: "item_econ_vodka", price: 1.4 }],
      [{ itemId: "item_ammo_standard_bullet", price: 1.2 }, { itemId: "item_ammo_handmade_bullet", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.3 }, { itemId: "item_econ_vodka", price: 1.3 }],
      [{ itemId: "item_ammo_standard_bullet", price: 1.2 }, { itemId: "item_ammo_handmade_bullet", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.3 }, { itemId: "item_econ_vodka", price: 1.3 }],
      [{ itemId: "item_ammo_standard_bullet", price: 1.2 }, { itemId: "item_ammo_handmade_bullet", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.2 }, { itemId: "item_econ_vodka", price: 1.2 }],
      [{ itemId: "item_ammo_standard_bullet", price: 1.2 }, { itemId: "item_ammo_handmade_bullet", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.2 }, { itemId: "item_econ_vodka", price: 1.2 }],
      [{ itemId: "item_ammo_standard_bullet", price: 1.2 }, { itemId: "item_ammo_handmade_bullet", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.1 }, { itemId: "item_econ_vodka", price: 1.1 }],
      [{ itemId: "item_ammo_standard_bullet", price: 1.2 }, { itemId: "item_ammo_handmade_bullet", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.1 }, { itemId: "item_econ_vodka", price: 1.1 }],
      [{ itemId: "item_ammo_standard_bullet", price: 1.2 }, { itemId: "item_ammo_handmade_bullet", price: 1.2 }, { itemId: "item_food_flavored_stew", price: 1.1 }, { itemId: "item_econ_vodka", price: 1.1 }]
    ],
    trading: [
      [{ itemId: "item_econ_vodka", num: 1 }],
      [{ itemId: "item_econ_vodka", num: 1 }, { itemId: "item_food_flavored_stew", num: 1 }],
      [{ itemId: "item_econ_vodka", num: 1 }],
      [{ itemId: "item_econ_vodka", num: 1 }, { itemId: "item_food_flavored_stew", num: 1 }],
      [{ itemId: "item_econ_vodka", num: 1 }],
      [{ itemId: "item_econ_vodka", num: 1 }, { itemId: "item_food_flavored_stew", num: 1 }],
      [{ itemId: "item_econ_vodka", num: 1 }],
      [{ itemId: "item_econ_vodka", num: 1 }, { itemId: "item_food_flavored_stew", num: 1 }],
      [{ itemId: "item_econ_vodka", num: 1 }],
      [{ itemId: "item_econ_vodka", num: 1 }, { itemId: "item_food_flavored_stew", num: 1 }],
      [{ itemId: "item_econ_vodka", num: 1 }]
    ],
    needItem: [
      { itemId: "item_ammo_handmade_bullet", num: 10 },
      { itemId: "item_ammo_handmade_bullet", num: 10 },
      { itemId: "item_ammo_handmade_bullet", num: 10 },
      { itemId: "item_ammo_handmade_bullet", num: 20 },
      { itemId: "item_ammo_handmade_bullet", num: 40 },
      { itemId: "item_weapon_explosive_smoke_bomb", num: 1 },
      { itemId: "item_weapon_explosive_smoke_bomb", num: 2 },
      { itemId: "item_weapon_explosive_explosive", num: 2 },
      { itemId: "item_weapon_explosive_explosive", num: 3 },
      { itemId: "item_med_homemade_penicillin", num: 1 },
      null
    ],
    gift: [
      null,
      { itemId: "item_econ_vodka", num: "5" },
      { siteId: "21" },
      null,
      { itemId: "item_econ_vodka", num: "5" },
      null,
      { itemId: "item_econ_vodka", num: "5" },
      null,
      { itemId: "item_econ_vodka", num: "5" },
      { siteId: "502" },
      { itemId: "item_econ_vodka", num: "30" }
    ],
    gift_extra: [
      null,
      null,
      null,
      null,
      { itemId: "item_food_flavored_stew", num: "5" },
      null,
      null,
      { itemId: "item_econ_vodka", num: "15" },
      null,
      null,
      { itemId: "item_food_flavored_stew", num: "10" }
    ],
    coordinate: { x: 300, y: 50 }
  },
  "7": {
    id: 7,
    favorite: [
      [{ itemId: "item_weapon_gun_magnum", price: 1.2 }, { itemId: "item_weapon_gun_pistol", price: 1.5 }, { itemId: "item_weapon_gun_ak47", price: 1.5 }, { itemId: "item_weapon_gun_shotgun", price: 1.2 }, { itemId: "item_weapon_gun_m40", price: 1.5 }, { itemId: "item_weapon_gun_famas", price: 1.5 }],
      [{ itemId: "item_weapon_gun_magnum", price: 1.2 }, { itemId: "item_weapon_gun_pistol", price: 1.5 }, { itemId: "item_weapon_gun_ak47", price: 1.5 }, { itemId: "item_weapon_gun_shotgun", price: 1.2 }, { itemId: "item_weapon_gun_m40", price: 1.5 }, { itemId: "item_weapon_gun_famas", price: 1.5 }],
      [{ itemId: "item_weapon_gun_magnum", price: 1.2 }, { itemId: "item_weapon_gun_pistol", price: 1.5 }, { itemId: "item_weapon_gun_ak47", price: 1.4 }, { itemId: "item_weapon_gun_shotgun", price: 1.2 }, { itemId: "item_weapon_gun_m40", price: 1.5 }, { itemId: "item_weapon_gun_famas", price: 1.4 }],
      [{ itemId: "item_weapon_gun_magnum", price: 1.2 }, { itemId: "item_weapon_gun_pistol", price: 1.4 }, { itemId: "item_weapon_gun_ak47", price: 1.4 }, { itemId: "item_weapon_gun_shotgun", price: 1.2 }, { itemId: "item_weapon_gun_m40", price: 1.4 }, { itemId: "item_weapon_gun_famas", price: 1.4 }],
      [{ itemId: "item_weapon_gun_magnum", price: 1.2 }, { itemId: "item_weapon_gun_pistol", price: 1.4 }, { itemId: "item_weapon_gun_ak47", price: 1.4 }, { itemId: "item_weapon_gun_shotgun", price: 1.2 }, { itemId: "item_weapon_gun_m40", price: 1.4 }, { itemId: "item_weapon_gun_famas", price: 1.3 }],
      [{ itemId: "item_weapon_gun_magnum", price: 1.2 }, { itemId: "item_weapon_gun_pistol", price: 1.4 }, { itemId: "item_weapon_gun_ak47", price: 1.3 }, { itemId: "item_weapon_gun_shotgun", price: 1.2 }, { itemId: "item_weapon_gun_m40", price: 1.4 }, { itemId: "item_weapon_gun_famas", price: 1.3 }],
      [{ itemId: "item_weapon_gun_magnum", price: 1.2 }, { itemId: "item_weapon_gun_pistol", price: 1.3 }, { itemId: "item_weapon_gun_ak47", price: 1.3 }, { itemId: "item_weapon_gun_shotgun", price: 1.2 }, { itemId: "item_weapon_gun_m40", price: 1.3 }, { itemId: "item_weapon_gun_famas", price: 1.3 }],
      [{ itemId: "item_weapon_gun_magnum", price: 1.2 }, { itemId: "item_weapon_gun_pistol", price: 1.3 }, { itemId: "item_weapon_gun_ak47", price: 1.3 }, { itemId: "item_weapon_gun_shotgun", price: 1.2 }, { itemId: "item_weapon_gun_m40", price: 1.3 }, { itemId: "item_weapon_gun_famas", price: 1.2 }],
      [{ itemId: "item_weapon_gun_magnum", price: 1.2 }, { itemId: "item_weapon_gun_pistol", price: 1.3 }, { itemId: "item_weapon_gun_ak47", price: 1.2 }, { itemId: "item_weapon_gun_shotgun", price: 1.2 }, { itemId: "item_weapon_gun_m40", price: 1.3 }, { itemId: "item_weapon_gun_famas", price: 1.2 }],
      [{ itemId: "item_weapon_gun_magnum", price: 1.2 }, { itemId: "item_weapon_gun_pistol", price: 1.2 }, { itemId: "item_weapon_gun_ak47", price: 1.2 }, { itemId: "item_weapon_gun_shotgun", price: 1.2 }, { itemId: "item_weapon_gun_m40", price: 1.3 }, { itemId: "item_weapon_gun_famas", price: 1.2 }],
      [{ itemId: "item_weapon_gun_magnum", price: 1.2 }, { itemId: "item_weapon_gun_pistol", price: 1.2 }, { itemId: "item_weapon_gun_ak47", price: 1.2 }, { itemId: "item_weapon_gun_shotgun", price: 1.2 }, { itemId: "item_weapon_gun_m40", price: 1.2 }, { itemId: "item_weapon_gun_famas", price: 1.2 }]
    ],
    trading: [
      [{ itemId: "item_mat_chemical_materials", num: 1 }],
      [{ itemId: "item_mat_chemical_materials", num: 1 }, { itemId: "item_econ_alcohol", num: 1 }],
      [{ itemId: "item_mat_chemical_materials", num: 1 }],
      [{ itemId: "item_mat_chemical_materials", num: 1 }, { itemId: "item_econ_alcohol", num: 1 }],
      [{ itemId: "item_mat_chemical_materials", num: 1 }],
      [{ itemId: "item_mat_chemical_materials", num: 1 }, { itemId: "item_econ_alcohol", num: 1 }],
      [{ itemId: "item_mat_chemical_materials", num: 1 }],
      [{ itemId: "item_mat_chemical_materials", num: 1 }, { itemId: "item_econ_alcohol", num: 1 }],
      [{ itemId: "item_mat_chemical_materials", num: 2 }],
      [{ itemId: "item_mat_chemical_materials", num: 2 }, { itemId: "item_econ_alcohol", num: 1 }],
      [{ itemId: "item_mat_chemical_materials", num: 2 }]
    ],
    needItem: [
      { itemId: "item_weapon_gun_pistol", num: 1 },
      { itemId: "item_weapon_gun_shotgun", num: 1 },
      { itemId: "item_weapon_gun_ak47", num: 1 },
      { itemId: "item_weapon_gun_magnum", num: 1 },
      { itemId: "item_weapon_gun_m40", num: 1 },
      { itemId: "item_weapon_melee_chainsaw", num: 1 },
      { itemId: "item_weapon_explosive_explosive", num: 2 },
      { itemId: "item_weapon_explosive_grenade", num: 1 },
      { itemId: "item_ammo_handmade_bullet", num: 10 },
      { itemId: "item_ammo_handmade_bullet", num: 30 },
      null
    ],
    gift: [
      null,
      { itemId: "item_mat_chemical_materials", num: "5" },
      null,
      { siteId: "500" },
      { itemId: "item_mat_chemical_materials", num: "5" },
      null,
      { itemId: "item_mat_chemical_materials", num: "10" },
      { siteId: "501" },
      { itemId: "item_mat_chemical_materials", num: "10" },
      null,
      { itemId: "item_econ_alcohol", num: "10" }
    ],
    gift_extra: [
      null,
      null,
      null,
      null,
      { itemId: "item_mat_chemical_materials", num: "10" },
      null,
      null,
      { itemId: "item_mat_chemical_materials", num: "10" },
      null,
      null,
      { itemId: "item_econ_alcohol", num: "10" }
    ],
    coordinate: { x: 310, y: 250 }
  }
}

