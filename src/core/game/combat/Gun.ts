/**
 * Gun Weapon Class
 * Ported from OriginalGame/src/game/Battle.js (lines 861-966)
 */

import { Weapon } from './Weapon'
import { BattleConfig } from './BattleConfig'
import { itemConfig } from '@/core/data/items'
import { clone } from '@/shared/utils/data/clone'
import { audioManager, SoundPaths } from '@/core/game/systems/AudioManager'
import { usePlayerStore } from '@/core/store/playerStore'
import { useGameStore } from '@/core/store/gameStore'
import type { Monster } from './Monster'

export class Gun extends Weapon {
  bulletConfig: any // WeaponEffect from bullet item

  constructor(id: string, bPlayer: any) {
    super(id, bPlayer)
    // Initialize bullet config
    const bulletItem = itemConfig[BattleConfig.BULLET_ID]
    if (bulletItem?.effect_weapon) {
      this.bulletConfig = clone(bulletItem.effect_weapon)
    }
  }

  protected _action(): void {
    const monster = this.getTarget()
    if (monster && this.isInRange(monster)) {
      if (this.isGoodBulletEnough() || this.isHomemadeBulletEnough()) {
        this.bPlayer.battle.sumRes.weapon1++

        // Play sound effect
        let soundName: string
        if (this.id === "1301022" || this.id === "1301052") {
          soundName = SoundPaths.ATTACK_3
        } else if (this.id === "1301011" || this.id === "1301041") {
          soundName = SoundPaths.ATTACK_4
        } else if (this.id === "1301033" || this.id === "1301063") {
          soundName = SoundPaths.ATTACK_5
        } else {
          soundName = SoundPaths.ATTACK_4
        }
        audioManager.playEffect(soundName)
      }

      // Fire multiple shots
      const bulletMax = this.attr.bulletMax || 1
      for (let i = 0; i < bulletMax; i++) {
        const hasAnyBullet = this.isGoodBulletEnough() || this.isHomemadeBulletEnough()
        if (hasAnyBullet && !monster.isDie()) {
          if (this.isGoodBulletEnough()) {
            const playerStore = usePlayerStore.getState()
            if (playerStore.useGoodBullet || !this.isHomemadeBulletEnough()) {
              // Use good bullet
              this.cost(true)
              monster.underAtk(this, true)
            } else {
              // Prioritize homemade bullet
              this.cost(false)
              monster.underAtk(this, false)
            }
          } else {
            // Use homemade bullet
            this.cost(false)
            monster.underAtk(this, false)
          }
        } else {
          break
        }
      }
    }
  }

  getHarm(monster: Monster, goodBullet?: boolean): number {
    if (!monster.line) {
      return 0
    }

    const dtLineIndex = BattleConfig.LINE_LENGTH - 1 - monster.line.index
    let precise = (this.attr.precise || 0) + (this.attr.dtPrecise || 0) * dtLineIndex
    let deathHit = (this.attr.deathHit || 0) + (this.attr.dtDeathHit || 0) * dtLineIndex

    // Weather modifier
    const gameStore = useGameStore.getState()
    const weatherSystem = gameStore.weatherSystem
    precise += weatherSystem.getValue("gun_precise") || 0

    // Mood penalty
    const playerStore = usePlayerStore.getState()
    const decPrecise = Math.max(0, 80 - playerStore.spirit) * 0.006
    precise -= decPrecise

    // Good bullet bonus
    if (goodBullet) {
      precise += 0.15
    }

    // Alcohol penalty
    const currentTime = Date.now() / 1000 // TODO: Use game time
    const lastAlcoholTime = (playerStore as any).lastAlcoholTime || 0
    let timeSinceAlcohol = currentTime - lastAlcoholTime
    if (timeSinceAlcohol <= 43200) { // 12 hours
      timeSinceAlcohol = 43200 - timeSinceAlcohol
      const hoursSinceAlcohol = Math.ceil(timeSinceAlcohol / 3600)
      precise -= 0.02 * hoursSinceAlcohol
    }

    // Check for instant kill
    const rand = Math.random()
    if (rand <= deathHit) {
      return Number.MAX_VALUE
    }

    // Check for hit
    const hitRand = Math.random()
    if (hitRand <= precise) {
      return this.getBulletHarm()
    }

    return 0
  }

  protected cost(isGoodBullet: boolean): void {
    if (isGoodBullet) {
      this.bPlayer.bulletNum--
      this.bPlayer.battle.sumRes.bulletNum++
    } else {
      this.bPlayer.homemadeNum--
      this.bPlayer.battle.sumRes.homemadeNum++
    }

    if (this.bPlayer.bulletNum === 0 && this.bPlayer.homemadeNum === 0) {
      this.bPlayer.battle.processLog("No bullets left!")
    }
  }

  protected isGoodBulletEnough(): boolean {
    return this.bPlayer.bulletNum > 0
  }

  protected isHomemadeBulletEnough(): boolean {
    return this.bPlayer.homemadeNum > 0
  }

  protected getBulletHarm(): number {
    return this.bulletConfig?.atk || 0
  }
}




