/**
 * Flamethrower Class
 * Ported from OriginalGame/src/game/Battle.js (lines 715-784)
 */

import { BattleEquipment } from './BattleEquipment'
import { audioManager, SoundPaths } from '@/game/systems/AudioManager'
import { usePlayerStore } from '@/store/playerStore'
import { getRandomInt } from '@/utils/random'
import type { Monster } from './Monster'

export class Flamethrower extends BattleEquipment {
  banditOverride: boolean
  deadMonsterNum: number = 0

  constructor(id: string, bPlayer: any) {
    super(id, bPlayer)
    this.banditOverride = bPlayer.banditOverride
  }

  protected _action(): void {
    if (!this.isEnough()) {
      return
    }

    audioManager.playEffect(SoundPaths.ESTOVE)
    audioManager.playEffect(SoundPaths.STOVE)
    this.bPlayer.battle.sumRes.fuel++
    this.bPlayer.battle.sumRes.weapon1++

    const playerStore = usePlayerStore.getState()
    if (playerStore.fuel <= 0) {
      this.bPlayer.battle.processLog("No fuel!", "#FF0000")
      return
    }

    // Calculate damage
    const monsters = [...this.bPlayer.battle.monsters]
    const numMonster = monsters.length
    let harm = this.attr.atk || 0

    // Mood penalty
    const moodDec = 20 + Math.max(0, 80 - playerStore.spirit)
    const rand = getRandomInt(0, 100)
    if (moodDec > rand) {
      harm -= getRandomInt(1, 10)
    }

    // Monster count multiplier
    if (numMonster < 4) {
      harm *= 2
    }
    if (numMonster < 2) {
      harm *= 2
    }

    // Apply damage to all monsters
    monsters.forEach((mon) => {
      mon.underAtk(this, harm)
    })

    this.cost()

    // Log
    const logMsg = this.bPlayer.useBandit()
      ? `Flamethrower attack! Dealt ${harm} damage`
      : `Flamethrower attack! Dealt ${harm} damage`
    this.bPlayer.battle.processLog(logMsg)

    if (this.deadMonsterNum > 0) {
      const logStr = this.bPlayer.useBandit()
        ? `Killed ${this.deadMonsterNum} bandits`
        : `Killed ${this.deadMonsterNum} zombies`
      this.bPlayer.battle.processLog(logStr)
      this.deadMonsterNum = 0
      this.bPlayer.battle.checkGameEnd()
    }
  }

  protected cost(): void {
    const playerStore = usePlayerStore.getState()
    playerStore.fuel = Math.max(0, playerStore.fuel - 1)
  }

  protected isEnough(): boolean {
    const playerStore = usePlayerStore.getState()
    return playerStore.equipment.gun === "1301091" && playerStore.fuel > 0
  }

  protected afterCd(): void {
    this._action()
  }
}


