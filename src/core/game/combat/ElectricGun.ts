/**
 * Electric Gun Class
 * Ported from OriginalGame/src/game/Battle.js (lines 968-1005)
 */

import { Gun } from './Gun'
import { WORK_SITE } from './BattleConfig'
import { audioManager, SoundPaths } from '@/core/game/core/AudioManager'
import { usePlayerStore } from '@/core/store/playerStore'
import type { Monster } from './Monster'

export class ElectricGun extends Gun {
  protected _action(): void {
    const monster = this.getTarget()
    if (monster && this.isInRange(monster)) {
      if (this.isEnough()) {
        this.bPlayer.battle.sumRes.weapon1++

        // Play sound effect
        let soundName: string
        if (this.id === "item_weapon_gun_emp_handgun") {
          soundName = SoundPaths.ATTACK_7
        } else if (this.id === "item_weapon_gun_emp_rifle") {
          soundName = SoundPaths.ATTACK_8
        } else {
          soundName = SoundPaths.ATTACK_7
        }
        audioManager.playEffect(soundName)
      }

      // Fire multiple shots
      const bulletMax = this.attr.bulletMax || 1
      for (let i = 0; i < bulletMax; i++) {
        if (this.isEnough() && !monster.isDie()) {
          monster.underAtk(this)
          this.cost()
        } else {
          break
        }
      }
    }
  }

  protected cost(): void {
    // Electric guns don't consume bullets
  }

  protected isEnough(): boolean {
    const playerStore = usePlayerStore.getState()
    const site = playerStore.map?.getSite(WORK_SITE)
    return site?.isActive || false
  }

  protected getBulletHarm(): number {
    return this.attr.atk || 0
  }
}




