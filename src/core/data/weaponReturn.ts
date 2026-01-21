/**
 * Weapon Return Mapping
 * Ported from OriginalGame/src/data/formulaConfig.js (lines 1-17)
 * 
 * Maps weapon/armor item IDs to scrap items returned when the weapon breaks
 */

export const weaponReturn: Record<string, string[]> = {
  "item_weapon_gun_pistol": ["item_model_pistol_part"], // handgun
  "item_weapon_gun_shotgun": ["item_model_shotgun_part"], // Rifle
  "item_weapon_gun_ak47": ["item_model_ak47_part"], // automatic rifle
  "item_weapon_gun_magnum": ["item_mat_metal"], // Magnum
  "item_weapon_gun_m40": ["item_mat_metal", "item_mat_parts"], // M40
  "item_weapon_gun_famas": ["item_mat_metal", "item_mat_parts"], // FAMAS
  "item_weapon_gun_emp_handgun": ["item_mat_components", "item_model_pistol_part"], // Ehandgun
  "item_weapon_gun_emp_rifle": ["item_mat_metal", "item_mat_parts", "item_mat_components", "item_mat_components", "item_model_shotgun_part"], // Erifle
  "item_weapon_gun_flamethrower": ["item_mat_metal", "item_mat_parts"], // flame
  "item_weapon_melee_crowbar": [], // crowbar (no scrap)
  "item_weapon_melee_axe": [], // axe (no scrap)
  "item_weapon_melee_katana": ["item_model_katana_part"], // katana
  "item_weapon_melee_chainsaw": ["item_mat_metal", "item_mat_parts", "item_mat_components"], // chainsaw
  "item_armor_thick_coat": [], // shirt (no scrap)
  "item_armor_antiriot_suit": [] // armor (no scrap)
}



