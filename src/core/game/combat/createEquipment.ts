/**
 * Equipment Factory
 * Ported from OriginalGame/src/game/Battle.js (lines 596-620)
 * 
 * Creates appropriate weapon/equipment instances based on item ID
 */

import { BattleConfig, Equipment } from './BattleConfig'
import { Bomb } from './Bomb'
import { Trap } from './Trap'
import { Weapon } from './Weapon'
import { ElectricGun } from './ElectricGun'
import { Flamethrower } from './Flamethrower'
import { Gun } from './Gun'
import type { BattlePlayer } from './BattlePlayer'
import type { BattleEquipment } from './BattleEquipment'

export function createEquipment(id: string | null, bPlayer: BattlePlayer): BattleEquipment | null {
  if (!id) {
    return null
  }

  const itemId = Number(id)

  switch (itemId) {
    case item_weapon_explosive_explosive:
    case item_weapon_explosive_rocket_launcher:
    case item_weapon_explosive_grenade:
      return new Bomb(id, bPlayer)
    
    case item_weapon_explosive_smoke_bomb:
      return new Trap(id, bPlayer)
    
    case item_weapon_melee_crowbar:
    case item_weapon_melee_axe:
    case item_weapon_melee_katana:
    case item_weapon_melee_chainsaw:
      return new Weapon(id, bPlayer)
    
    case item_weapon_gun_emp_handgun:
    case item_weapon_gun_emp_rifle:
      return new ElectricGun(id, bPlayer)
    
    case item_weapon_gun_flamethrower:
      return new Flamethrower(id, bPlayer)
    
    default:
      // Check if it's hand
      if (id === Equipment.HAND) {
        return new Weapon(Equipment.HAND, bPlayer)
      }
      // Default to gun for other IDs
      return new Gun(id, bPlayer)
  }
}




