/**
 * Melee Weapon Class
 * Ported from OriginalGame/src/game/Battle.js (lines 813-859)
 */

import { BattleEquipment } from './BattleEquipment'
import { audioManager, SoundPaths } from '@/game/systems/AudioManager'
import type { Monster } from './Monster'

export class Weapon extends BattleEquipment {
  protected _action(): void {
    const monster = this.getTarget()
    if (monster && this.isInRange(monster) && !monster.isDie()) {
      this.bPlayer.battle.sumRes.weapon2++
      monster.underAtk(this)

      // Play sound effect
      let soundName: string
      if (this.id === "1302043") {
        soundName = SoundPaths.ATTACK_1
      } else if (this.id === "1302011") {
        soundName = SoundPaths.ATTACK_2
      } else if (this.id === "1") {
        soundName = SoundPaths.PUNCH
      } else {
        soundName = SoundPaths.ATTACK_6
      }
      audioManager.playEffect(soundName)
    }
  }

  protected getTarget(): Monster | null {
    return this.bPlayer.battle.targetMon
  }

  getHarm(monster: Monster): number {
    return this.attr.atk || 0
  }

  isInRange(monster: Monster): boolean {
    if (monster.line) {
      return (this.attr.range || 0) >= monster.line.index
    }
    return false
  }
}




