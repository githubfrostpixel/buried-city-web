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
    case 1303012:
    case 1303033:
    case 1303044:
      return new Bomb(id, bPlayer)
    
    case 1303022:
      return new Trap(id, bPlayer)
    
    case 1302011:
    case 1302021:
    case 1302032:
    case 1302043:
      return new Weapon(id, bPlayer)
    
    case 1301071:
    case 1301082:
      return new ElectricGun(id, bPlayer)
    
    case 1301091:
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




